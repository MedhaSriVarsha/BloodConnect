import React, { useState, useEffect } from 'react';
import { 
  Award, 
  Calendar, 
  CheckCircle2, 
  Plus, 
  ShieldCheck, 
  FileText, 
  Heart, 
  Sparkles, 
  X, 
  Download,
  Building
} from 'lucide-react';
import { api } from '../services/api.js';

interface DonationHistoryProps {
  user: any;
  onOpenAuth: () => void;
}

export const DonationHistory: React.FC<DonationHistoryProps> = ({ user, onOpenAuth }) => {
  const [data, setData] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [isLogOpen, setIsLogOpen] = useState(false);
  const [selectedCert, setSelectedCert] = useState<any>(null);

  // New Donation form state
  const [formData, setFormData] = useState({
    hospitalName: 'Manipal Hospital Blood Center',
    donationDate: new Date().toISOString().split('T')[0],
    unitsDonated: 1,
    bloodGroup: 'O_POSITIVE',
    notes: 'Voluntary whole blood donation',
  });
  const [submitting, setSubmitting] = useState(false);

  const fetchHistory = async () => {
    if (!user) {
      setLoading(false);
      return;
    }
    setLoading(true);
    const res = await api.getMyDonations();
    setLoading(false);
    if (res.status === 'success' && res.data) {
      setData(res.data);
    }
  };

  useEffect(() => {
    fetchHistory();
  }, [user]);

  const handleLogSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setSubmitting(true);
    const res = await api.logDonation(formData);
    setSubmitting(false);

    if (res.status === 'success') {
      setIsLogOpen(false);
      fetchHistory();
      if (res.data?.donation) {
        setSelectedCert(res.data.donation);
      }
    } else {
      alert(res.message || 'Failed to log donation');
    }
  };

  if (!user) {
    return (
      <div style={{ maxWidth: '800px', margin: '48px auto', padding: '0 24px', textAlign: 'center' }}>
        <div className="glass-panel" style={{ padding: '60px 32px' }}>
          <Award size={56} color="var(--crimson-primary)" style={{ margin: '0 auto 16px' }} />
          <h2 style={{ fontSize: '1.8rem', fontWeight: 800, marginBottom: '8px' }}>
            Track Your Lifesaving Blood Donations
          </h2>
          <p style={{ color: 'var(--text-muted)', marginBottom: '24px', maxWidth: '500px', margin: '0 auto 24px' }}>
            Sign in to view your complete donation timeline, digital certificates of recognition, and donor hero badge status.
          </p>
          <button className="btn btn-primary" onClick={onOpenAuth}>
            Sign In to View Donation History
          </button>
        </div>
      </div>
    );
  }

  return (
    <div style={{ maxWidth: '1200px', margin: '32px auto', padding: '0 24px' }}>
      {/* Header */}
      <div style={{
        display: 'flex',
        flexWrap: 'wrap',
        alignItems: 'center',
        justifyContent: 'space-between',
        gap: '20px',
        marginBottom: '28px',
      }}>
        <div>
          <h1 style={{ fontSize: '1.8rem', fontWeight: 800 }}>
            🏅 Your Blood Donation Journey
          </h1>
          <p style={{ color: 'var(--text-muted)', fontSize: '0.9rem' }}>
            Verified medical records, next donation countdown, and official certificates.
          </p>
        </div>

        <button 
          className="btn btn-primary" 
          onClick={() => setIsLogOpen(true)}
        >
          <Plus size={18} />
          Log Completed Donation
        </button>
      </div>

      {/* Metrics Ribbon */}
      <div style={{
        display: 'grid',
        gridTemplateColumns: 'repeat(auto-fit, minmax(240px, 1fr))',
        gap: '16px',
        marginBottom: '32px',
      }}>
        <div className="glass-panel" style={{ padding: '20px' }}>
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
            <span style={{ fontSize: '0.82rem', color: 'var(--text-muted)' }}>Total Donations</span>
            <Award size={18} color="var(--crimson-primary)" />
          </div>
          <div style={{ fontSize: '2rem', fontWeight: 800, marginTop: '8px' }}>
            {data?.totalDonations || 0}
          </div>
          <span style={{ fontSize: '0.75rem', color: 'var(--text-subtle)' }}>Voluntary lifetime contributions</span>
        </div>

        <div className="glass-panel" style={{ padding: '20px' }}>
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
            <span style={{ fontSize: '0.82rem', color: 'var(--text-muted)' }}>Donor Honor Badge</span>
            <Sparkles size={18} color="#fbbf24" />
          </div>
          <div style={{ fontSize: '1.6rem', fontWeight: 800, color: '#fbbf24', marginTop: '8px' }}>
            {data?.badgeLevel || 'BRONZE HERO'}
          </div>
          <span style={{ fontSize: '0.75rem', color: 'var(--text-subtle)' }}>Community Impact Tier</span>
        </div>

        <div className="glass-panel" style={{ padding: '20px' }}>
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
            <span style={{ fontSize: '0.82rem', color: 'var(--text-muted)' }}>Estimated Lives Impacted</span>
            <Heart size={18} color="#f43f5e" fill="#f43f5e" />
          </div>
          <div style={{ fontSize: '2rem', fontWeight: 800, color: '#fda4af', marginTop: '8px' }}>
            {data?.livesImpacted || 0} Lives
          </div>
          <span style={{ fontSize: '0.75rem', color: 'var(--text-subtle)' }}>1 unit can save up to 3 patients</span>
        </div>

        <div className="glass-panel" style={{ padding: '20px' }}>
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
            <span style={{ fontSize: '0.82rem', color: 'var(--text-muted)' }}>Next Eligible Date</span>
            <Calendar size={18} color="#34d399" />
          </div>
          <div style={{ fontSize: '1.2rem', fontWeight: 800, color: '#34d399', marginTop: '12px' }}>
            {data?.nextEligibleDate 
              ? new Date(data.nextEligibleDate).toLocaleDateString(undefined, { day: 'numeric', month: 'short', year: 'numeric' })
              : 'Ready Today'}
          </div>
          <span style={{ fontSize: '0.75rem', color: 'var(--text-subtle)' }}>
            {data?.daysUntilEligible ? `${data.daysUntilEligible} days remaining` : 'Full recovery achieved'}
          </span>
        </div>
      </div>

      {/* Donation Timeline */}
      <div className="glass-panel" style={{ padding: '28px' }}>
        <h2 style={{ fontSize: '1.25rem', fontWeight: 700, marginBottom: '20px' }}>
          Verified Donation Records
        </h2>

        {(!data?.donations || data.donations.length === 0) ? (
          <div style={{ textAlign: 'center', padding: '40px 0', color: 'var(--text-muted)' }}>
            <p>No donations recorded yet. Log your first donation to receive your official certificate!</p>
          </div>
        ) : (
          <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
            {data.donations.map((don: any) => (
              <div 
                key={don.id}
                style={{
                  display: 'flex',
                  flexWrap: 'wrap',
                  alignItems: 'center',
                  justifyContent: 'space-between',
                  padding: '16px 20px',
                  borderRadius: 'var(--radius-sm)',
                  background: 'rgba(255, 255, 255, 0.03)',
                  border: '1px solid var(--border-glass)',
                  gap: '16px',
                }}
              >
                <div style={{ display: 'flex', alignItems: 'center', gap: '16px' }}>
                  <div style={{
                    width: '44px',
                    height: '44px',
                    borderRadius: '12px',
                    background: 'rgba(225, 29, 72, 0.15)',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    color: 'var(--crimson-primary)',
                  }}>
                    <Building size={22} />
                  </div>
                  <div>
                    <h3 style={{ fontSize: '1.05rem', fontWeight: 700 }}>{don.hospitalName}</h3>
                    <div style={{ fontSize: '0.82rem', color: 'var(--text-muted)', display: 'flex', alignItems: 'center', gap: '12px', marginTop: '2px' }}>
                      <span>📅 {new Date(don.donationDate).toLocaleDateString([], { day: 'numeric', month: 'short', year: 'numeric' })}</span>
                      <span>🩸 {don.unitsDonated} Unit ({don.bloodGroup.replace('_', ' ')})</span>
                      <span className="badge badge-available" style={{ fontSize: '0.68rem' }}>{don.status}</span>
                    </div>
                  </div>
                </div>

                <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
                  <span style={{ fontSize: '0.82rem', fontFamily: 'monospace', color: '#fda4af' }}>
                    {don.certificateNumber}
                  </span>
                  <button 
                    className="btn btn-secondary"
                    onClick={() => setSelectedCert(don)}
                    style={{ padding: '6px 12px', fontSize: '0.82rem' }}
                  >
                    <FileText size={14} />
                    View Certificate
                  </button>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Log Donation Modal */}
      {isLogOpen && (
        <div className="modal-overlay">
          <div className="modal-content">
            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '20px' }}>
              <div>
                <h2 style={{ fontSize: '1.4rem', fontWeight: 800 }}>Log Completed Donation</h2>
                <p style={{ fontSize: '0.85rem', color: 'var(--text-muted)' }}>Generate your verified certificate & update badge level</p>
              </div>
              <button 
                onClick={() => setIsLogOpen(false)}
                style={{ background: 'none', border: 'none', color: 'var(--text-muted)', cursor: 'pointer' }}
              >
                <X size={24} />
              </button>
            </div>

            <form onSubmit={handleLogSubmit} style={{ display: 'flex', flexDirection: 'column', gap: '14px' }}>
              <div>
                <label style={{ fontSize: '0.85rem', fontWeight: 600, display: 'block', marginBottom: '4px' }}>
                  Hospital / Blood Bank Center *
                </label>
                <input 
                  type="text" 
                  required
                  value={formData.hospitalName}
                  onChange={(e) => setFormData({ ...formData, hospitalName: e.target.value })}
                />
              </div>

              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '12px' }}>
                <div>
                  <label style={{ fontSize: '0.85rem', fontWeight: 600, display: 'block', marginBottom: '4px' }}>
                    Donation Date *
                  </label>
                  <input 
                    type="date" 
                    required
                    value={formData.donationDate}
                    onChange={(e) => setFormData({ ...formData, donationDate: e.target.value })}
                  />
                </div>

                <div>
                  <label style={{ fontSize: '0.85rem', fontWeight: 600, display: 'block', marginBottom: '4px' }}>
                    Blood Group Donated *
                  </label>
                  <select 
                    value={formData.bloodGroup}
                    onChange={(e) => setFormData({ ...formData, bloodGroup: e.target.value })}
                  >
                    <option value="O_POSITIVE">O Positive</option>
                    <option value="O_NEGATIVE">O Negative</option>
                    <option value="A_POSITIVE">A Positive</option>
                    <option value="A_NEGATIVE">A Negative</option>
                    <option value="B_POSITIVE">B Positive</option>
                    <option value="B_NEGATIVE">B Negative</option>
                    <option value="AB_POSITIVE">AB Positive</option>
                    <option value="AB_NEGATIVE">AB Negative</option>
                    <option value="OH_BOMBAY">Bombay Blood (Oh)</option>
                  </select>
                </div>
              </div>

              <div>
                <label style={{ fontSize: '0.85rem', fontWeight: 600, display: 'block', marginBottom: '4px' }}>
                  Medical Staff Notes / Observation
                </label>
                <textarea 
                  rows={2}
                  value={formData.notes}
                  onChange={(e) => setFormData({ ...formData, notes: e.target.value })}
                />
              </div>

              <div style={{ display: 'flex', gap: '10px', marginTop: '12px' }}>
                <button 
                  type="button" 
                  onClick={() => setIsLogOpen(false)}
                  className="btn btn-secondary"
                  style={{ flex: 1 }}
                >
                  Cancel
                </button>
                <button 
                  type="submit" 
                  disabled={submitting}
                  className="btn btn-primary"
                  style={{ flex: 2 }}
                >
                  <CheckCircle2 size={16} />
                  {submitting ? 'Verifying & Saving...' : 'Record & Issue Certificate'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Official Verifiable Certificate Modal */}
      {selectedCert && (
        <div className="modal-overlay">
          <div className="modal-content" style={{ maxWidth: '680px', padding: '36px' }}>
            <div style={{ display: 'flex', justifyContent: 'flex-end', marginBottom: '10px' }}>
              <button 
                onClick={() => setSelectedCert(null)}
                style={{ background: 'none', border: 'none', color: 'var(--text-muted)', cursor: 'pointer' }}
              >
                <X size={24} />
              </button>
            </div>

            {/* Certificate Canvas Frame */}
            <div style={{
              background: 'radial-gradient(circle at center, #131c33 0%, #0a0f1d 100%)',
              border: '2px solid rgba(245, 158, 11, 0.4)',
              borderRadius: 'var(--radius-md)',
              padding: '36px 32px',
              textAlign: 'center',
              boxShadow: '0 0 35px rgba(245, 158, 11, 0.15)',
              position: 'relative',
            }}>
              <div style={{
                width: '64px',
                height: '64px',
                borderRadius: '50%',
                background: 'linear-gradient(135deg, #fbbf24 0%, #d97706 100%)',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                margin: '0 auto 16px',
                color: '#000',
                boxShadow: '0 4px 20px rgba(245, 158, 11, 0.4)',
              }}>
                <Award size={36} />
              </div>

              <div style={{ textTransform: 'uppercase', letterSpacing: '0.15em', fontSize: '0.78rem', color: '#fbbf24', fontWeight: 800 }}>
                BloodConnect National Lifesaver Honor
              </div>

              <h2 style={{ fontSize: '1.8rem', fontWeight: 800, margin: '8px 0', fontFamily: 'var(--font-display)' }}>
                Certificate of Lifesaving Blood Donation
              </h2>

              <p style={{ fontSize: '0.88rem', color: 'var(--text-muted)', marginBottom: '20px' }}>
                This is officially conferred upon
              </p>

              <h3 style={{ fontSize: '1.6rem', color: '#f8fafc', fontWeight: 800, borderBottom: '1px solid rgba(255, 255, 255, 0.1)', paddingBottom: '12px', marginBottom: '16px' }}>
                {user?.fullName || 'Distinguished Blood Donor'}
              </h3>

              <p style={{ fontSize: '0.9rem', color: 'var(--text-main)', lineHeight: 1.6, maxWidth: '500px', margin: '0 auto 24px' }}>
                In grateful recognition of voluntarily contributing blood units at <strong>{selectedCert.hospitalName}</strong>, directly sustaining critical emergency transfusions and saving lives.
              </p>

              <div style={{
                display: 'grid',
                gridTemplateColumns: 'repeat(3, 1fr)',
                gap: '12px',
                background: 'rgba(0, 0, 0, 0.3)',
                padding: '12px',
                borderRadius: 'var(--radius-sm)',
                fontSize: '0.8rem',
                border: '1px solid var(--border-glass)',
                marginBottom: '20px',
              }}>
                <div>
                  <div style={{ color: 'var(--text-muted)' }}>Date</div>
                  <div style={{ fontWeight: 700 }}>
                    {new Date(selectedCert.donationDate).toLocaleDateString([], { day: 'numeric', month: 'short', year: 'numeric' })}
                  </div>
                </div>
                <div>
                  <div style={{ color: 'var(--text-muted)' }}>Blood Group</div>
                  <div style={{ fontWeight: 700, color: 'var(--crimson-primary)' }}>
                    {selectedCert.bloodGroup.replace('_', ' ')}
                  </div>
                </div>
                <div>
                  <div style={{ color: 'var(--text-muted)' }}>Verification Seal</div>
                  <div style={{ fontWeight: 700, color: '#34d399' }}>VERIFIED ✓</div>
                </div>
              </div>

              <div style={{ fontSize: '0.78rem', color: 'var(--text-subtle)' }}>
                Verification ID: <span style={{ color: '#fda4af', fontWeight: 700 }}>{selectedCert.certificateNumber}</span>
              </div>
            </div>

            <div style={{ display: 'flex', justifyContent: 'center', marginTop: '20px' }}>
              <button 
                className="btn btn-secondary"
                onClick={() => alert(`Certificate #${selectedCert.certificateNumber} downloaded as digital credential.`)}
              >
                <Download size={16} />
                Download Official Certificate
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
