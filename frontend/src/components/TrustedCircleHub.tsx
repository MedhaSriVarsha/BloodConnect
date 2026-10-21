import React, { useState, useEffect } from 'react';
import { 
  Users, 
  Copy, 
  Check, 
  ShieldCheck, 
  PhoneCall, 
  AlertTriangle, 
  PlusCircle, 
  MapPin, 
  Clock, 
  Heart, 
  UserPlus, 
  Sparkles, 
  X, 
  Send,
  ToggleLeft,
  ToggleRight,
  ExternalLink,
  ChevronRight,
  Share2
} from 'lucide-react';
import { api } from '../services/api.js';

interface TrustedCircleHubProps {
  user: any;
  onOpenAuth: () => void;
}

export const TrustedCircleHub: React.FC<TrustedCircleHubProps> = ({ user, onOpenAuth }) => {
  const [circlesData, setCirclesData] = useState<any>(null);
  const [circleMembers, setCircleMembers] = useState<any[]>([]);
  const [selectedCircleId, setSelectedCircleId] = useState<string>('');
  const [loading, setLoading] = useState(true);
  const [copied, setCopied] = useState(false);
  const [message, setMessage] = useState<string | null>(null);

  // Modals
  const [isJoinOpen, setIsJoinOpen] = useState(false);
  const [isNotifyOpen, setIsNotifyOpen] = useState(false);
  const [isAddOpen, setIsAddOpen] = useState(false);

  // Join form state
  const [joinCode, setJoinCode] = useState('');
  const [joinPreview, setJoinPreview] = useState<any>(null);
  const [relationship, setRelationship] = useState('Family Member');
  const [consentToContact, setConsentToContact] = useState(true);
  const [joining, setJoining] = useState(false);

  // Emergency Notify Form State
  const [emergencyData, setEmergencyData] = useState({
    patientName: '',
    bloodGroup: 'O_POSITIVE',
    unitsNeeded: 1,
    hospitalName: 'Manipal Hospital, HAL Airport Rd',
    notes: 'Immediate transfusion needed. Please respond if reachable.',
  });
  const [notifying, setNotifying] = useState(false);

  // Lookup Code State
  const [lookupInput, setLookupInput] = useState('');

  const fetchCircleData = async () => {
    if (!user) {
      setLoading(false);
      return;
    }
    setLoading(true);
    const res = await api.getMyCircles();
    setLoading(false);

    if (res.status === 'success' && res.data) {
      setCirclesData(res.data);
      const activeCircleId = res.data.ownedCircle?.id || res.data.joinedCircles?.[0]?.circleId;
      if (activeCircleId) {
        setSelectedCircleId(activeCircleId);
        loadMembers(activeCircleId);
      }
    }
  };

  const loadMembers = async (circleIdOrCode: string) => {
    const res = await api.getCircleMembers(circleIdOrCode);
    if (res.status === 'success' && res.data) {
      setCircleMembers(res.data.members || []);
    }
  };

  useEffect(() => {
    fetchCircleData();
  }, [user]);

  const handleCopyCode = (code: string) => {
    navigator.clipboard.writeText(code);
    setCopied(true);
    setTimeout(() => setCopied(false), 3000);
  };

  const handleLookupCode = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!lookupInput.trim()) return;
    const res = await api.lookupCircle(lookupInput.trim());
    if (res.status === 'success' && res.data) {
      setJoinCode(res.data.circleCode);
      setJoinPreview(res.data);
      setIsJoinOpen(true);
    } else {
      alert(res.message || 'Emergency Access Code not found.');
    }
  };

  const handleJoinCircle = async (e: React.FormEvent) => {
    e.preventDefault();
    setJoining(true);
    const res = await api.joinCircle({
      circleCode: joinCode,
      relationship,
      consentToContact,
    });
    setJoining(false);

    if (res.status === 'success') {
      setIsJoinOpen(false);
      setMessage(res.message || 'Successfully joined circle!');
      setTimeout(() => setMessage(null), 5000);
      fetchCircleData();
    } else {
      alert(res.message || 'Failed to join circle.');
    }
  };

  const handleNotifyCircle = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedCircleId) return;
    setNotifying(true);

    const res = await api.notifyCircle(selectedCircleId, {
      circleId: selectedCircleId,
      ...emergencyData,
    });
    setNotifying(false);

    if (res.status === 'success') {
      setIsNotifyOpen(false);
      setMessage(`🚨 EMERGENCY DISPATCHED: Alert sent to ${res.data?.notifiedMembersCount || 0} consenting circle members!`);
      setTimeout(() => setMessage(null), 8000);
    } else {
      alert(res.message || 'Failed to notify circle.');
    }
  };

  const handleRemoveMember = async (memberId: string) => {
    if (!confirm('Are you sure you want to remove this member from your trusted circle?')) return;
    const res = await api.removeCircleMember(selectedCircleId, memberId);
    if (res.status === 'success') {
      loadMembers(selectedCircleId);
    } else {
      alert(res.message || 'Failed to remove member.');
    }
  };

  const handleToggleMyAvailability = async () => {
    const currentVal = circlesData?.myAvailability?.isOptedIn ?? true;
    const nextVal = !currentVal;
    const res = await api.updateCircleAvailability({
      isOptedIn: nextVal,
      availabilityNote: nextVal ? 'Ready for emergency assistance' : 'Temporarily unavailable',
    });
    if (res.status === 'success') {
      fetchCircleData();
    }
  };

  if (!user) {
    return (
      <div style={{ maxWidth: '900px', margin: '48px auto', padding: '0 24px', textAlign: 'center' }}>
        <div className="glass-panel" style={{ padding: '64px 32px' }}>
          <div style={{
            width: '64px',
            height: '64px',
            borderRadius: '20px',
            background: 'linear-gradient(135deg, #e11d48 0%, #be123c 100%)',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            margin: '0 auto 20px',
            color: '#fff',
            boxShadow: '0 6px 25px var(--crimson-glow)',
          }}>
            <Users size={32} />
          </div>
          <h1 style={{ fontSize: '2rem', fontWeight: 800, marginBottom: '10px' }}>
            My Trusted Blood Circle
          </h1>
          <p style={{ color: 'var(--text-muted)', fontSize: '1rem', maxWidth: '580px', margin: '0 auto 28px', lineHeight: 1.6 }}>
            Your people. Ready when you need help. Create a private, consented circle of family, close friends, and colleagues ready to respond instantly during a blood crisis.
          </p>
          <div style={{ display: 'flex', justifyContent: 'center', gap: '14px' }}>
            <button className="btn btn-primary" onClick={onOpenAuth} style={{ padding: '12px 28px' }}>
              Sign In to Access Your Circle
            </button>
          </div>
        </div>
      </div>
    );
  }

  const ownedCircle = circlesData?.ownedCircle;
  const currentAccessCode = ownedCircle?.circleCode || 'BC-TC-7K9P2';

  return (
    <div style={{ maxWidth: '1300px', margin: '32px auto', padding: '0 24px' }}>
      {/* Toast Alert */}
      {message && (
        <div style={{
          background: 'rgba(16, 185, 129, 0.2)',
          border: '1px solid #10b981',
          color: '#34d399',
          padding: '14px 20px',
          borderRadius: 'var(--radius-md)',
          marginBottom: '24px',
          display: 'flex',
          alignItems: 'center',
          gap: '12px',
          fontSize: '0.95rem',
          fontWeight: 600,
        }}>
          <Check size={20} />
          <span>{message}</span>
        </div>
      )}

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
          <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
            <h1 style={{ fontSize: '2.2rem', fontWeight: 800, letterSpacing: '-0.02em' }}>
              My Trusted Blood Circle
            </h1>
            <span className="badge badge-blood">Emergency Protected</span>
          </div>
          <p style={{ color: 'var(--text-muted)', fontSize: '0.95rem', marginTop: '4px' }}>
            Your people. Ready when you need help. Consented emergency response network.
          </p>
        </div>

        {/* Quick Actions */}
        <div style={{ display: 'flex', gap: '12px', alignItems: 'center' }}>
          <button 
            className="btn btn-secondary"
            onClick={() => setIsJoinOpen(true)}
          >
            <UserPlus size={16} />
            Join with Code
          </button>

          <button 
            className="btn btn-urgent"
            onClick={() => setIsNotifyOpen(true)}
            style={{ padding: '10px 22px' }}
          >
            <AlertTriangle size={18} />
            Request Help from Circle
          </button>
        </div>
      </div>

      {/* Hero Access Code & Live Availability Card (Exact design from spec) */}
      <div style={{
        display: 'grid',
        gridTemplateColumns: 'repeat(auto-fit, minmax(340px, 1fr))',
        gap: '20px',
        marginBottom: '32px',
      }}>
        {/* The Official Emergency Access Code Box */}
        <div className="glass-panel" style={{
          padding: '28px',
          background: 'linear-gradient(135deg, rgba(225, 29, 72, 0.15) 0%, rgba(13, 21, 39, 0.85) 100%)',
          border: '1px solid rgba(225, 29, 72, 0.35)',
          display: 'flex',
          flexDirection: 'column',
          justifyContent: 'space-between',
        }}>
          <div>
            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '12px' }}>
              <span style={{
                fontSize: '0.78rem',
                fontWeight: 800,
                textTransform: 'uppercase',
                letterSpacing: '0.12em',
                color: '#fda4af',
              }}>
                YOUR EMERGENCY ACCESS CODE
              </span>
              <span className="badge badge-available" style={{ fontSize: '0.7rem' }}>
                ACTIVE CIRCLE
              </span>
            </div>

            {/* Huge Code Display */}
            <div style={{
              fontSize: '2.4rem',
              fontWeight: 800,
              fontFamily: 'monospace',
              letterSpacing: '0.1em',
              color: '#ffffff',
              margin: '6px 0 16px',
              textShadow: '0 0 20px rgba(225, 29, 72, 0.5)',
            }}>
              {currentAccessCode}
            </div>

            <p style={{ fontSize: '0.85rem', color: 'var(--text-muted)', lineHeight: 1.5, marginBottom: '20px' }}>
              Share this code with friends, family, and colleagues who agree to stand by as emergency donors. The code identifies your circle without exposing member private data publicly.
            </p>
          </div>

          <div style={{ display: 'flex', gap: '10px' }}>
            <button 
              className="btn btn-primary"
              onClick={() => handleCopyCode(currentAccessCode)}
              style={{ flex: 1 }}
            >
              {copied ? <Check size={16} /> : <Copy size={16} />}
              {copied ? 'Code Copied!' : 'Copy Code'}
            </button>

            <button 
              className="btn btn-secondary"
              onClick={() => loadMembers(currentAccessCode)}
              style={{ flex: 1 }}
            >
              <Users size={16} />
              View Trusted Donors
            </button>
          </div>
        </div>

        {/* My Circle Status & Quick Lookup Card */}
        <div className="glass-panel" style={{
          padding: '28px',
          display: 'flex',
          flexDirection: 'column',
          justifyContent: 'space-between',
        }}>
          <div>
            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '16px' }}>
              <span style={{ fontSize: '0.82rem', fontWeight: 700, color: 'var(--text-muted)' }}>
                YOUR READINESS IN CIRCLES
              </span>
              <button 
                onClick={handleToggleMyAvailability}
                style={{ background: 'none', border: 'none', cursor: 'pointer', color: circlesData?.myAvailability?.isOptedIn ? '#10b981' : '#64748b' }}
              >
                {circlesData?.myAvailability?.isOptedIn ? <ToggleRight size={34} /> : <ToggleLeft size={34} />}
              </button>
            </div>

            <div style={{
              background: 'rgba(0, 0, 0, 0.3)',
              padding: '14px 18px',
              borderRadius: 'var(--radius-sm)',
              border: '1px solid var(--border-glass)',
              marginBottom: '20px',
            }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                <span className="dot-pulse" style={{ background: circlesData?.myAvailability?.isOptedIn ? '#10b981' : '#f59e0b' }} />
                <div>
                  <div style={{ fontWeight: 700, fontSize: '0.95rem' }}>
                    {circlesData?.myAvailability?.isOptedIn ? 'Opted-In & Ready for Emergency Calls' : 'Currently On Standby'}
                  </div>
                  <div style={{ fontSize: '0.78rem', color: 'var(--text-subtle)', marginTop: '2px' }}>
                    Last confirmed: {new Date(circlesData?.myAvailability?.lastConfirmedAt || Date.now()).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit', day: 'numeric', month: 'short' })}
                  </div>
                </div>
              </div>
            </div>

            {/* Quick Access Lookup input for hospitals/friends */}
            <form onSubmit={handleLookupCode} style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
              <label style={{ fontSize: '0.8rem', fontWeight: 600, color: 'var(--text-muted)' }}>
                Have an Emergency Access Code? Look up Circle:
              </label>
              <div style={{ display: 'flex', gap: '8px' }}>
                <input 
                  type="text" 
                  placeholder="e.g. BC-TC-7K9P2"
                  value={lookupInput}
                  onChange={(e) => setLookupInput(e.target.value.toUpperCase())}
                  style={{ textTransform: 'uppercase', fontFamily: 'monospace', fontWeight: 700 }}
                />
                <button type="submit" className="btn btn-secondary" style={{ flexShrink: 0 }}>
                  Lookup Circle
                </button>
              </div>
            </form>
          </div>

          <div style={{ marginTop: '16px', fontSize: '0.78rem', color: 'var(--text-subtle)', display: 'flex', alignItems: 'center', gap: '6px' }}>
            <ShieldCheck size={14} color="#34d399" />
            Confidentiality compliant with Ministry of Health blood donation principles.
          </div>
        </div>
      </div>

      {/* Circle Donors Member List Section */}
      <div className="glass-panel" style={{ padding: '28px', marginBottom: '32px' }}>
        <div style={{
          display: 'flex',
          flexWrap: 'wrap',
          alignItems: 'center',
          justifyContent: 'space-between',
          gap: '16px',
          marginBottom: '20px',
        }}>
          <div>
            <h2 style={{ fontSize: '1.35rem', fontWeight: 800 }}>
              Authorized Circle Members ({circleMembers.length})
            </h2>
            <p style={{ fontSize: '0.85rem', color: 'var(--text-muted)' }}>
              Consented emergency donors with latest availability, location area, and direct contact line.
            </p>
          </div>

          <button 
            className="btn btn-secondary"
            onClick={() => handleCopyCode(`https://bloodconnect.org/join-circle?code=${currentAccessCode}`)}
            style={{ fontSize: '0.85rem', padding: '8px 14px' }}
          >
            <Share2 size={16} />
            Invite Friends & Family
          </button>
        </div>

        {circleMembers.length === 0 ? (
          <div style={{ textAlign: 'center', padding: '48px 20px', color: 'var(--text-muted)' }}>
            <Users size={48} color="#64748b" style={{ margin: '0 auto 12px' }} />
            <p style={{ fontWeight: 600 }}>No members have joined this circle yet.</p>
            <p style={{ fontSize: '0.85rem', marginTop: '6px' }}>
              Share your Emergency Access Code <strong>{currentAccessCode}</strong> with your family, friends, or coworkers.
            </p>
          </div>
        ) : (
          <div style={{
            display: 'grid',
            gridTemplateColumns: 'repeat(auto-fill, minmax(360px, 1fr))',
            gap: '20px',
          }}>
            {circleMembers.map((member) => (
              <div 
                key={member.memberId}
                className="glass-panel"
                style={{
                  padding: '22px',
                  background: 'rgba(255, 255, 255, 0.03)',
                  border: '1px solid var(--border-glass)',
                  display: 'flex',
                  flexDirection: 'column',
                  justifyContent: 'space-between',
                }}
              >
                <div>
                  {/* Top card header */}
                  <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '14px' }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                      <div style={{
                        width: '42px',
                        height: '42px',
                        borderRadius: '12px',
                        background: 'var(--crimson-primary)',
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center',
                        fontWeight: 800,
                        fontSize: '1.1rem',
                        color: '#fff',
                      }}>
                        {member.fullName[0]}
                      </div>
                      <div>
                        <h3 style={{ fontSize: '1.1rem', fontWeight: 700 }}>{member.fullName}</h3>
                        <span style={{
                          fontSize: '0.75rem',
                          background: 'rgba(59, 130, 246, 0.15)',
                          color: '#60a5fa',
                          padding: '2px 8px',
                          borderRadius: 'var(--radius-full)',
                          fontWeight: 700,
                        }}>
                          {member.relationship}
                        </span>
                      </div>
                    </div>

                    <span className="badge badge-blood">
                      {member.bloodGroup.replace('_', ' ')}
                    </span>
                  </div>

                  {/* Details */}
                  <div style={{ display: 'flex', flexDirection: 'column', gap: '8px', fontSize: '0.85rem', color: 'var(--text-muted)', marginBottom: '16px' }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
                      <MapPin size={14} color="var(--crimson-primary)" />
                      <span>{member.area}, {member.city}</span>
                    </div>

                    <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
                      <Clock size={14} color="#34d399" />
                      <span>
                        Availability: <strong style={{ color: member.isAvailable ? '#34d399' : '#f87171' }}>
                          {member.isAvailable ? 'AVAILABLE NOW' : 'STANDBY'}
                        </strong> ({member.availabilityNote})
                      </span>
                    </div>

                    <div style={{ fontSize: '0.75rem', color: 'var(--text-subtle)' }}>
                      Consent recorded: {new Date(member.consentTimestamp).toLocaleDateString([], { day: 'numeric', month: 'short', year: 'numeric' })}
                    </div>
                  </div>
                </div>

                {/* Direct Action */}
                <div style={{ display: 'flex', gap: '8px', borderTop: '1px solid var(--border-glass)', paddingTop: '14px' }}>
                  <a 
                    href={`tel:${member.contactPhone}`}
                    className="btn btn-primary"
                    style={{ flex: 2, textDecoration: 'none', padding: '10px' }}
                  >
                    <PhoneCall size={16} />
                    Call {member.contactPhone}
                  </a>

                  <button 
                    className="btn btn-secondary"
                    onClick={() => handleRemoveMember(member.memberId)}
                    title="Remove from circle"
                    style={{ flex: 1, padding: '10px', color: '#f87171', fontSize: '0.8rem' }}
                  >
                    Remove
                  </button>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* MODAL 1: JOIN CIRCLE WITH EMERGENCY CODE */}
      {isJoinOpen && (
        <div className="modal-overlay">
          <div className="modal-content" style={{ maxWidth: '480px' }}>
            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '20px' }}>
              <div>
                <h3 style={{ fontSize: '1.3rem', fontWeight: 800 }}>Join a Trusted Blood Circle</h3>
                <p style={{ fontSize: '0.82rem', color: 'var(--text-muted)' }}>Stand by to protect someone you care about</p>
              </div>
              <button 
                onClick={() => setIsJoinOpen(false)}
                style={{ background: 'none', border: 'none', color: 'var(--text-muted)', cursor: 'pointer' }}
              >
                <X size={22} />
              </button>
            </div>

            <form onSubmit={handleJoinCircle} style={{ display: 'flex', flexDirection: 'column', gap: '14px' }}>
              <div>
                <label style={{ fontSize: '0.85rem', fontWeight: 600, display: 'block', marginBottom: '4px' }}>
                  Emergency Access Code *
                </label>
                <input 
                  type="text" 
                  required
                  placeholder="e.g. BC-TC-7K9P2"
                  value={joinCode}
                  onChange={(e) => setJoinCode(e.target.value.toUpperCase())}
                  style={{ textTransform: 'uppercase', fontFamily: 'monospace', fontWeight: 700 }}
                />
              </div>

              <div>
                <label style={{ fontSize: '0.85rem', fontWeight: 600, display: 'block', marginBottom: '4px' }}>
                  Your Relationship to the Circle Anchor *
                </label>
                <select 
                  value={relationship}
                  onChange={(e) => setRelationship(e.target.value)}
                >
                  <option value="Family Member">Family Member</option>
                  <option value="Brother / Sister">Brother / Sister</option>
                  <option value="Close Friend">Close Friend</option>
                  <option value="Work Colleague">Work Colleague</option>
                  <option value="Neighbor">Neighbor</option>
                  <option value="Personal Physician">Personal Physician</option>
                </select>
              </div>

              <div style={{
                background: 'rgba(0, 0, 0, 0.3)',
                padding: '12px',
                borderRadius: 'var(--radius-sm)',
                border: '1px solid var(--border-glass)',
              }}>
                <label style={{ display: 'flex', alignItems: 'flex-start', gap: '10px', fontSize: '0.82rem', cursor: 'pointer' }}>
                  <input 
                    type="checkbox"
                    required
                    checked={consentToContact}
                    onChange={(e) => setConsentToContact(e.target.checked)}
                    style={{ width: '16px', height: '16px', marginTop: '3px', accentColor: 'var(--crimson-primary)' }}
                  />
                  <span>
                    I voluntarily consent to joining this circle and confirm that my verified phone number may be contacted in the event of a blood emergency.
                  </span>
                </label>
              </div>

              <div style={{ display: 'flex', gap: '10px', marginTop: '10px' }}>
                <button 
                  type="button" 
                  onClick={() => setIsJoinOpen(false)}
                  className="btn btn-secondary"
                  style={{ flex: 1 }}
                >
                  Cancel
                </button>
                <button 
                  type="submit" 
                  disabled={joining || !joinCode}
                  className="btn btn-primary"
                  style={{ flex: 2 }}
                >
                  {joining ? 'Recording Consent...' : 'Confirm & Join Circle'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* MODAL 2: NOTIFY CIRCLE IN EMERGENCY */}
      {isNotifyOpen && (
        <div className="modal-overlay">
          <div className="modal-content" style={{ maxWidth: '520px' }}>
            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '20px' }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                <div style={{
                  width: '42px',
                  height: '42px',
                  borderRadius: '12px',
                  background: 'rgba(239, 68, 68, 0.2)',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  color: '#ef4444',
                }}>
                  <AlertTriangle size={24} />
                </div>
                <div>
                  <h3 style={{ fontSize: '1.3rem', fontWeight: 800 }}>Notify Trusted Circle</h3>
                  <p style={{ fontSize: '0.82rem', color: 'var(--text-muted)' }}>Direct emergency broadcast to consenting members</p>
                </div>
              </div>

              <button 
                onClick={() => setIsNotifyOpen(false)}
                style={{ background: 'none', border: 'none', color: 'var(--text-muted)', cursor: 'pointer' }}
              >
                <X size={22} />
              </button>
            </div>

            <form onSubmit={handleNotifyCircle} style={{ display: 'flex', flexDirection: 'column', gap: '14px' }}>
              <div>
                <label style={{ fontSize: '0.85rem', fontWeight: 600, display: 'block', marginBottom: '4px' }}>
                  Patient Full Name *
                </label>
                <input 
                  type="text" 
                  required
                  placeholder="e.g. Varsha or Family Member"
                  value={emergencyData.patientName}
                  onChange={(e) => setEmergencyData({ ...emergencyData, patientName: e.target.value })}
                />
              </div>

              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '12px' }}>
                <div>
                  <label style={{ fontSize: '0.85rem', fontWeight: 600, display: 'block', marginBottom: '4px' }}>
                    Blood Group Needed *
                  </label>
                  <select 
                    value={emergencyData.bloodGroup}
                    onChange={(e) => setEmergencyData({ ...emergencyData, bloodGroup: e.target.value })}
                  >
                    <option value="O_POSITIVE">O Positive</option>
                    <option value="O_NEGATIVE">O Negative</option>
                    <option value="A_POSITIVE">A Positive</option>
                    <option value="A_NEGATIVE">A Negative</option>
                    <option value="B_POSITIVE">B Positive</option>
                    <option value="B_NEGATIVE">B Negative</option>
                    <option value="AB_POSITIVE">AB Positive</option>
                    <option value="AB_NEGATIVE">AB Negative</option>
                  </select>
                </div>

                <div>
                  <label style={{ fontSize: '0.85rem', fontWeight: 600, display: 'block', marginBottom: '4px' }}>
                    Units Needed *
                  </label>
                  <input 
                    type="number" 
                    min={1} 
                    max={6}
                    value={emergencyData.unitsNeeded}
                    onChange={(e) => setEmergencyData({ ...emergencyData, unitsNeeded: parseInt(e.target.value, 10) || 1 })}
                  />
                </div>
              </div>

              <div>
                <label style={{ fontSize: '0.85rem', fontWeight: 600, display: 'block', marginBottom: '4px' }}>
                  Hospital / Emergency Center Name *
                </label>
                <input 
                  type="text" 
                  required
                  value={emergencyData.hospitalName}
                  onChange={(e) => setEmergencyData({ ...emergencyData, hospitalName: e.target.value })}
                />
              </div>

              <div>
                <label style={{ fontSize: '0.85rem', fontWeight: 600, display: 'block', marginBottom: '4px' }}>
                  Emergency Notes / Room / Contact
                </label>
                <textarea 
                  rows={2}
                  value={emergencyData.notes}
                  onChange={(e) => setEmergencyData({ ...emergencyData, notes: e.target.value })}
                />
              </div>

              <div style={{ display: 'flex', gap: '10px', marginTop: '10px' }}>
                <button 
                  type="button" 
                  onClick={() => setIsNotifyOpen(false)}
                  className="btn btn-secondary"
                  style={{ flex: 1 }}
                >
                  Cancel
                </button>
                <button 
                  type="submit" 
                  disabled={notifying}
                  className="btn btn-urgent"
                  style={{ flex: 2 }}
                >
                  <Send size={16} />
                  {notifying ? 'Dispatching Alerts...' : 'Broadcast Immediate Call'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};
