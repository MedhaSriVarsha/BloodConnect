import React, { useState } from 'react';
import { 
  X, 
  CheckCircle2, 
  Mail, 
  Phone, 
  Lock, 
  ShieldCheck, 
  Droplet, 
  ArrowRight, 
  Sparkles,
  RefreshCw
} from 'lucide-react';
import { api, setAuthToken } from '../services/api.js';

interface TwoStepAuthModalProps {
  isOpen: boolean;
  onClose: () => void;
  onAuthSuccess: (user: any) => void;
}

export const TwoStepAuthModal: React.FC<TwoStepAuthModalProps> = ({
  isOpen,
  onClose,
  onAuthSuccess,
}) => {
  const [mode, setMode] = useState<'REGISTER' | 'LOGIN'>('REGISTER');
  const [step, setStep] = useState<number>(1); // 1: Info, 2: Email OTP, 3: Phone OTP, 4: Activated, 5: Donor Profile

  // Step 1 Registration fields
  const [regData, setRegData] = useState({
    fullName: '',
    email: '',
    phone: '+91',
    password: '',
    consent: true,
    referralCode: '',
  });

  // Login fields
  const [loginIdentifier, setLoginIdentifier] = useState('');
  const [loginPassword, setLoginPassword] = useState('');

  // OTP Challenges State
  const [emailOtp, setEmailOtp] = useState('');
  const [phoneOtp, setPhoneOtp] = useState('');
  const [devEmailHint, setDevEmailHint] = useState<string | null>(null);
  const [devPhoneHint, setDevPhoneHint] = useState<string | null>(null);

  // Step 5 Donor Profile fields
  const [donorData, setDonorData] = useState({
    bloodGroup: 'O_POSITIVE',
    address: '',
    city: 'Bengaluru',
    state: 'Karnataka',
    postalCode: '560038',
    isAvailable: true,
    consentToContact: true,
  });

  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  if (!isOpen) return null;

  // Step 1: Submit Registration
  const handleRegisterSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    setLoading(true);

    const res = await api.register(regData);
    setLoading(false);

    if (res.status === 'success' && res.data) {
      setDevEmailHint(res.data.devEmailOtp || null);
      setDevPhoneHint(res.data.devPhoneOtp || null);
      // Auto-fill dev OTP for convenient seamless testing if present
      if (res.data.devEmailOtp) setEmailOtp(res.data.devEmailOtp);
      if (res.data.devPhoneOtp) setPhoneOtp(res.data.devPhoneOtp);
      setStep(2); // Proceed to Step 2: Email Verification
    } else {
      setError(res.message || 'Registration failed');
    }
  };

  // Step 2: Verify Email OTP
  const handleVerifyEmail = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    setLoading(true);

    const res = await api.verifyEmail(regData.email, emailOtp);
    setLoading(false);

    if (res.status === 'success') {
      setStep(3); // Proceed to Step 3: Phone Verification
    } else {
      setError(res.message || 'Email verification failed');
    }
  };

  // Step 3: Verify Phone SMS OTP
  const handleVerifyPhone = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    setLoading(true);

    const res = await api.verifyPhone(regData.phone, phoneOtp);
    setLoading(false);

    if (res.status === 'success') {
      // Step 4: Both challenges succeeded! Automatically sign in and show activated
      const loginRes = await api.login({ identifier: regData.email, password: regData.password });
      if (loginRes.status === 'success' && loginRes.data) {
        setAuthToken(loginRes.data.tokens.accessToken);
        setStep(4);
      } else {
        setStep(4);
      }
    } else {
      setError(res.message || 'Phone verification failed');
    }
  };

  // Step 5: Save Donor Profile
  const handleSaveDonorProfile = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    setLoading(true);

    const res = await api.completeDonorProfile(donorData);
    setLoading(false);

    if (res.status === 'success') {
      const meRes = await api.getMe();
      if (meRes.status === 'success' && meRes.data) {
        onAuthSuccess(meRes.data.user);
      }
      onClose();
    } else {
      setError(res.message || 'Failed to complete profile');
    }
  };

  // Direct Login Submit
  const handleLoginSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    setLoading(true);

    const res = await api.login({ identifier: loginIdentifier, password: loginPassword });
    setLoading(false);

    if (res.status === 'success' && res.data) {
      setAuthToken(res.data.tokens.accessToken);
      onAuthSuccess(res.data.user);
      onClose();
    } else {
      setError(res.message || 'Login failed. Please check credentials.');
    }
  };

  return (
    <div className="modal-overlay">
      <div className="modal-content" style={{ maxWidth: '520px' }}>
        {/* Modal Header */}
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '20px' }}>
          <div>
            <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
              <span className="dot-pulse" style={{ background: 'var(--crimson-primary)' }} />
              <h2 style={{ fontSize: '1.35rem', fontWeight: 800 }}>
                {mode === 'LOGIN' ? 'Sign In to BloodConnect' : `Two-Step Verification (Step ${step} of 5)`}
              </h2>
            </div>
            <p style={{ fontSize: '0.82rem', color: 'var(--text-muted)' }}>
              {mode === 'LOGIN' 
                ? 'Access your donor dashboard, emergency response, and certificates'
                : 'OWASP-compliant dual-factor email + mobile activation protocol'}
            </p>
          </div>

          <button 
            onClick={onClose}
            style={{ background: 'none', border: 'none', color: 'var(--text-muted)', cursor: 'pointer' }}
          >
            <X size={22} />
          </button>
        </div>

        {/* Switcher Tab */}
        <div style={{ display: 'flex', background: 'rgba(0, 0, 0, 0.3)', borderRadius: 'var(--radius-sm)', padding: '4px', marginBottom: '20px' }}>
          <button
            onClick={() => { setMode('REGISTER'); setStep(1); setError(null); }}
            style={{
              flex: 1,
              padding: '8px',
              borderRadius: '6px',
              border: 'none',
              background: mode === 'REGISTER' ? 'var(--crimson-primary)' : 'transparent',
              color: '#fff',
              fontWeight: 700,
              fontSize: '0.85rem',
              cursor: 'pointer',
            }}
          >
            Two-Step Registration
          </button>
          <button
            onClick={() => { setMode('LOGIN'); setError(null); }}
            style={{
              flex: 1,
              padding: '8px',
              borderRadius: '6px',
              border: 'none',
              background: mode === 'LOGIN' ? 'var(--crimson-primary)' : 'transparent',
              color: '#fff',
              fontWeight: 700,
              fontSize: '0.85rem',
              cursor: 'pointer',
            }}
          >
            Existing User Login
          </button>
        </div>

        {error && (
          <div style={{
            background: 'rgba(239, 68, 68, 0.15)',
            border: '1px solid rgba(239, 68, 68, 0.4)',
            color: '#fca5a5',
            padding: '10px 14px',
            borderRadius: 'var(--radius-sm)',
            fontSize: '0.85rem',
            marginBottom: '16px',
          }}>
            {error}
          </div>
        )}

        {/* MODE: LOGIN */}
        {mode === 'LOGIN' && (
          <form onSubmit={handleLoginSubmit} style={{ display: 'flex', flexDirection: 'column', gap: '14px' }}>
            <div>
              <label style={{ fontSize: '0.85rem', fontWeight: 600, display: 'block', marginBottom: '4px' }}>
                Email Address or Verified Mobile *
              </label>
              <input 
                type="text" 
                required
                placeholder="e.g. rahul.sharma@example.com or admin@bloodconnect.org"
                value={loginIdentifier}
                onChange={(e) => setLoginIdentifier(e.target.value)}
              />
            </div>

            <div>
              <label style={{ fontSize: '0.85rem', fontWeight: 600, display: 'block', marginBottom: '4px' }}>
                Password *
              </label>
              <input 
                type="password" 
                required
                placeholder="••••••••"
                value={loginPassword}
                onChange={(e) => setLoginPassword(e.target.value)}
              />
            </div>

            <div style={{
              background: 'rgba(59, 130, 246, 0.08)',
              border: '1px solid rgba(59, 130, 246, 0.25)',
              padding: '10px 14px',
              borderRadius: 'var(--radius-sm)',
              fontSize: '0.78rem',
              color: '#93c5fd',
            }}>
              💡 <strong>Quick Demo Credentials:</strong>
              <div>• Admin: <code>admin@bloodconnect.org</code> / <code>AdminPass2026!</code></div>
              <div>• Donor: <code>rahul.sharma@example.com</code> / <code>password123</code></div>
            </div>

            <button 
              type="submit" 
              className="btn btn-primary"
              disabled={loading}
              style={{ padding: '12px', marginTop: '6px' }}
            >
              {loading ? 'Authenticating Session...' : 'Sign In Now'}
            </button>
          </form>
        )}

        {/* MODE: REGISTER — STEP 1 (Registration) */}
        {mode === 'REGISTER' && step === 1 && (
          <form onSubmit={handleRegisterSubmit} style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
            <div>
              <label style={{ fontSize: '0.85rem', fontWeight: 600, display: 'block', marginBottom: '4px' }}>
                Full Name *
              </label>
              <input 
                type="text" 
                required
                placeholder="e.g. Ananya Sen"
                value={regData.fullName}
                onChange={(e) => setRegData({ ...regData, fullName: e.target.value })}
              />
            </div>

            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '10px' }}>
              <div>
                <label style={{ fontSize: '0.85rem', fontWeight: 600, display: 'block', marginBottom: '4px' }}>
                  Email Address *
                </label>
                <input 
                  type="email" 
                  required
                  placeholder="ananya@example.com"
                  value={regData.email}
                  onChange={(e) => setRegData({ ...regData, email: e.target.value })}
                />
              </div>

              <div>
                <label style={{ fontSize: '0.85rem', fontWeight: 600, display: 'block', marginBottom: '4px' }}>
                  Mobile Number (+91) *
                </label>
                <input 
                  type="text" 
                  required
                  placeholder="+919876543210"
                  value={regData.phone}
                  onChange={(e) => setRegData({ ...regData, phone: e.target.value })}
                />
              </div>
            </div>

            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '10px' }}>
              <div>
                <label style={{ fontSize: '0.85rem', fontWeight: 600, display: 'block', marginBottom: '4px' }}>
                  Password *
                </label>
                <input 
                  type="password" 
                  required
                  placeholder="Min 8 chars"
                  value={regData.password}
                  onChange={(e) => setRegData({ ...regData, password: e.target.value })}
                />
              </div>

              <div>
                <label style={{ fontSize: '0.85rem', fontWeight: 600, display: 'block', marginBottom: '4px' }}>
                  Referral Code (Optional)
                </label>
                <input 
                  type="text" 
                  placeholder="e.g. BC-HERO99"
                  value={regData.referralCode}
                  onChange={(e) => setRegData({ ...regData, referralCode: e.target.value })}
                />
              </div>
            </div>

            <label style={{ display: 'flex', alignItems: 'center', gap: '10px', fontSize: '0.82rem', marginTop: '4px', cursor: 'pointer' }}>
              <input 
                type="checkbox" 
                checked={regData.consent} 
                onChange={(e) => setRegData({ ...regData, consent: e.target.checked })} 
                style={{ width: '16px', height: '16px', accentColor: 'var(--crimson-primary)' }}
              />
              <span>I consent to BloodConnect terms and medical emergency notifications.</span>
            </label>

            <button 
              type="submit" 
              className="btn btn-primary"
              disabled={loading}
              style={{ padding: '12px', marginTop: '6px' }}
            >
              {loading ? 'Dispatched Keyed Challenges...' : 'Continue to Email Verification →'}
            </button>
          </form>
        )}

        {/* MODE: REGISTER — STEP 2 (Verify Email OTP) */}
        {mode === 'REGISTER' && step === 2 && (
          <form onSubmit={handleVerifyEmail} style={{ display: 'flex', flexDirection: 'column', gap: '16px', textAlign: 'center' }}>
            <div style={{
              width: '56px',
              height: '56px',
              borderRadius: '50%',
              background: 'rgba(59, 130, 246, 0.15)',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              margin: '0 auto',
              color: '#60a5fa',
            }}>
              <Mail size={28} />
            </div>

            <div>
              <h3 style={{ fontSize: '1.25rem', fontWeight: 800 }}>Step 2 — Verify Email</h3>
              <p style={{ fontSize: '0.85rem', color: 'var(--text-muted)', marginTop: '4px' }}>
                We sent a 6-digit one-time code to <strong>{regData.email}</strong>.
              </p>
            </div>

            {devEmailHint && (
              <div style={{
                background: 'rgba(16, 185, 129, 0.15)',
                border: '1px solid rgba(16, 185, 129, 0.35)',
                padding: '8px 12px',
                borderRadius: 'var(--radius-sm)',
                fontSize: '0.82rem',
                color: '#34d399',
              }}>
                🔑 Dev Simulator Code: <strong>{devEmailHint}</strong>
              </div>
            )}

            <input 
              type="text"
              maxLength={6}
              required
              placeholder="Enter 6-digit OTP"
              value={emailOtp}
              onChange={(e) => setEmailOtp(e.target.value.trim())}
              style={{
                textAlign: 'center',
                letterSpacing: '0.4em',
                fontSize: '1.4rem',
                fontWeight: 800,
                padding: '12px',
              }}
            />

            <button 
              type="submit" 
              className="btn btn-primary"
              disabled={loading || emailOtp.length !== 6}
              style={{ padding: '12px' }}
            >
              {loading ? 'Validating HMAC Challenge...' : 'Verify Email Code →'}
            </button>
          </form>
        )}

        {/* MODE: REGISTER — STEP 3 (Verify Mobile SMS OTP) */}
        {mode === 'REGISTER' && step === 3 && (
          <form onSubmit={handleVerifyPhone} style={{ display: 'flex', flexDirection: 'column', gap: '16px', textAlign: 'center' }}>
            <div style={{
              width: '56px',
              height: '56px',
              borderRadius: '50%',
              background: 'rgba(16, 185, 129, 0.15)',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              margin: '0 auto',
              color: '#34d399',
            }}>
              <Phone size={28} />
            </div>

            <div>
              <h3 style={{ fontSize: '1.25rem', fontWeight: 800 }}>Step 3 — Verify Mobile SMS</h3>
              <p style={{ fontSize: '0.85rem', color: 'var(--text-muted)', marginTop: '4px' }}>
                We dispatched an SMS OTP to <strong>{regData.phone}</strong>.
              </p>
            </div>

            {devPhoneHint && (
              <div style={{
                background: 'rgba(16, 185, 129, 0.15)',
                border: '1px solid rgba(16, 185, 129, 0.35)',
                padding: '8px 12px',
                borderRadius: 'var(--radius-sm)',
                fontSize: '0.82rem',
                color: '#34d399',
              }}>
                📱 SMS Simulator Code: <strong>{devPhoneHint}</strong>
              </div>
            )}

            <input 
              type="text"
              maxLength={6}
              required
              placeholder="Enter 6-digit SMS OTP"
              value={phoneOtp}
              onChange={(e) => setPhoneOtp(e.target.value.trim())}
              style={{
                textAlign: 'center',
                letterSpacing: '0.4em',
                fontSize: '1.4rem',
                fontWeight: 800,
                padding: '12px',
              }}
            />

            <button 
              type="submit" 
              className="btn btn-primary"
              disabled={loading || phoneOtp.length !== 6}
              style={{ padding: '12px' }}
            >
              {loading ? 'Verifying Phone Challenge...' : 'Verify Mobile Code →'}
            </button>
          </form>
        )}

        {/* MODE: REGISTER — STEP 4 (Account Activated Celebration) */}
        {mode === 'REGISTER' && step === 4 && (
          <div style={{ textAlign: 'center', padding: '12px 0' }}>
            <div style={{
              width: '64px',
              height: '64px',
              borderRadius: '50%',
              background: 'rgba(16, 185, 129, 0.2)',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              margin: '0 auto 16px',
              color: '#34d399',
            }}>
              <CheckCircle2 size={36} />
            </div>

            <h3 style={{ fontSize: '1.4rem', fontWeight: 800 }}>Step 4 — Account Activated!</h3>
            <p style={{ fontSize: '0.9rem', color: 'var(--text-muted)', margin: '8px 0 24px' }}>
              Both email and mobile ownership challenges have succeeded. Your BloodConnect account is now verified.
            </p>

            <button 
              className="btn btn-primary"
              onClick={() => setStep(5)}
              style={{ width: '100%', padding: '12px' }}
            >
              Step 5 — Complete Donor Profile →
            </button>
          </div>
        )}

        {/* MODE: REGISTER — STEP 5 (Donor Profile Setup) */}
        {mode === 'REGISTER' && step === 5 && (
          <form onSubmit={handleSaveDonorProfile} style={{ display: 'flex', flexDirection: 'column', gap: '14px' }}>
            <div>
              <h3 style={{ fontSize: '1.15rem', fontWeight: 800 }}>Step 5 — Donor Profile Setup</h3>
              <p style={{ fontSize: '0.82rem', color: 'var(--text-muted)' }}>
                Select your blood group and city to join nearby hospital dispatch matching.
              </p>
            </div>

            <div>
              <label style={{ fontSize: '0.85rem', fontWeight: 600, display: 'block', marginBottom: '4px' }}>
                Your Blood Group *
              </label>
              <select 
                value={donorData.bloodGroup}
                onChange={(e) => setDonorData({ ...donorData, bloodGroup: e.target.value })}
              >
                <option value="O_POSITIVE">O Positive (Universal Red Cell Donor)</option>
                <option value="O_NEGATIVE">O Negative (Universal Emergency Donor)</option>
                <option value="A_POSITIVE">A Positive</option>
                <option value="A_NEGATIVE">A Negative</option>
                <option value="B_POSITIVE">B Positive</option>
                <option value="B_NEGATIVE">B Negative</option>
                <option value="AB_POSITIVE">AB Positive</option>
                <option value="AB_NEGATIVE">AB Negative (Universal Plasma Donor)</option>
                <option value="OH_BOMBAY">Bombay Phenotype (Oh)</option>
              </select>
            </div>

            <div>
              <label style={{ fontSize: '0.85rem', fontWeight: 600, display: 'block', marginBottom: '4px' }}>
                Street Address *
              </label>
              <input 
                type="text" 
                required
                placeholder="e.g. 52 Indiranagar 100ft Rd"
                value={donorData.address}
                onChange={(e) => setDonorData({ ...donorData, address: e.target.value })}
              />
            </div>

            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '10px' }}>
              <div>
                <label style={{ fontSize: '0.85rem', fontWeight: 600, display: 'block', marginBottom: '4px' }}>
                  City *
                </label>
                <input 
                  type="text" 
                  required
                  value={donorData.city}
                  onChange={(e) => setDonorData({ ...donorData, city: e.target.value })}
                />
              </div>

              <div>
                <label style={{ fontSize: '0.85rem', fontWeight: 600, display: 'block', marginBottom: '4px' }}>
                  Postal Code *
                </label>
                <input 
                  type="text" 
                  required
                  value={donorData.postalCode}
                  onChange={(e) => setDonorData({ ...donorData, postalCode: e.target.value })}
                />
              </div>
            </div>

            <label style={{ display: 'flex', alignItems: 'center', gap: '10px', fontSize: '0.82rem', cursor: 'pointer' }}>
              <input 
                type="checkbox" 
                checked={donorData.isAvailable} 
                onChange={(e) => setDonorData({ ...donorData, isAvailable: e.target.checked })} 
                style={{ width: '16px', height: '16px', accentColor: 'var(--crimson-primary)' }}
              />
              <span>I am actively available for emergency transfusion alerts.</span>
            </label>

            <button 
              type="submit" 
              className="btn btn-primary"
              disabled={loading}
              style={{ padding: '12px', marginTop: '6px' }}
            >
              {loading ? 'Saving Profile...' : 'Complete Registration & Enter Platform'}
            </button>
          </form>
        )}
      </div>
    </div>
  );
};
