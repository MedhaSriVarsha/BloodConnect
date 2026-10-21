import React, { useState } from 'react';
import { 
  AlertTriangle, 
  MapPin, 
  Clock, 
  Droplet, 
  PhoneCall, 
  CheckCircle2, 
  X, 
  Send
} from 'lucide-react';
import { api } from '../services/api.js';

interface BloodRequestsBoardProps {
  requests: any[];
  onRefresh: () => void;
  isCreateOpen: boolean;
  onCloseCreate: () => void;
  user: any;
  onOpenAuth: () => void;
}

const BLOOD_GROUPS = [
  'ALL',
  'O_POSITIVE', 'O_NEGATIVE',
  'A_POSITIVE', 'A_NEGATIVE',
  'B_POSITIVE', 'B_NEGATIVE',
  'AB_POSITIVE', 'AB_NEGATIVE',
  'OH_BOMBAY'
];

export const BloodRequestsBoard: React.FC<BloodRequestsBoardProps> = ({
  requests,
  onRefresh,
  isCreateOpen,
  onCloseCreate,
  user,
  onOpenAuth,
}) => {
  const [selectedGroup, setSelectedGroup] = useState('ALL');
  const [selectedUrgency, setSelectedUrgency] = useState('ALL');
  const [searchCity, setSearchCity] = useState('');
  const [volunteeringId, setVolunteeringId] = useState<string | null>(null);
  const [message, setMessage] = useState<string | null>(null);

  // New Request Form State
  const [formData, setFormData] = useState({
    patientName: '',
    bloodGroup: 'O_POSITIVE',
    unitsNeeded: 2,
    urgency: 'CRITICAL',
    hospitalName: '',
    hospitalAddress: '',
    city: 'Bengaluru',
    contactNumber: '+91',
    notes: '',
  });
  const [isSubmitting, setIsSubmitting] = useState(false);

  const filteredRequests = requests.filter(r => {
    if (selectedGroup !== 'ALL' && r.bloodGroup !== selectedGroup) return false;
    if (selectedUrgency !== 'ALL' && r.urgency !== selectedUrgency) return false;
    if (searchCity && !r.city.toLowerCase().includes(searchCity.toLowerCase())) return false;
    return true;
  });

  const handleVolunteer = async (requestId: string) => {
    if (!user) {
      onOpenAuth();
      return;
    }
    setVolunteeringId(requestId);
    const res = await api.volunteerToDonate(requestId);
    setVolunteeringId(null);
    if (res.status === 'success') {
      setMessage('Hero response registered! Hospital contacts & coordinates delivered to your profile.');
      onRefresh();
      setTimeout(() => setMessage(null), 5000);
    } else {
      setMessage(res.message || 'Could not volunteer.');
      setTimeout(() => setMessage(null), 5000);
    }
  };

  const handleCreateSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!user) {
      onOpenAuth();
      return;
    }
    setIsSubmitting(true);
    const res = await api.createRequest(formData);
    setIsSubmitting(false);

    if (res.status === 'success') {
      onCloseCreate();
      onRefresh();
      setMessage(`Urgent request broadcasted! ${res.matchingDonorsAlerted || 0} donors notified.`);
      setTimeout(() => setMessage(null), 6000);
    } else {
      alert(res.message || 'Failed to broadcast request.');
    }
  };

  return (
    <div style={{ maxWidth: '1400px', margin: '32px auto', padding: '0 24px' }}>
      {/* Toast Notification */}
      {message && (
        <div style={{
          background: 'rgba(16, 185, 129, 0.2)',
          border: '1px solid #10b981',
          color: '#34d399',
          padding: '12px 20px',
          borderRadius: 'var(--radius-md)',
          marginBottom: '24px',
          display: 'flex',
          alignItems: 'center',
          gap: '10px',
        }}>
          <CheckCircle2 size={20} />
          <span>{message}</span>
        </div>
      )}

      {/* Header & Controls */}
      <div style={{
        display: 'flex',
        flexWrap: 'wrap',
        alignItems: 'center',
        justifyContent: 'space-between',
        gap: '20px',
        marginBottom: '24px',
      }}>
        <div>
          <h1 style={{ fontSize: '1.8rem', fontWeight: 800 }}>
            🚨 Live Emergency Blood Requests
          </h1>
          <p style={{ color: 'var(--text-muted)', fontSize: '0.9rem' }}>
            Immediate patient transfusion demands verified by attending healthcare teams.
          </p>
        </div>

        {/* Filters */}
        <div style={{ display: 'flex', flexWrap: 'wrap', gap: '10px', alignItems: 'center' }}>
          <input 
            type="text" 
            placeholder="Search by city (e.g. Bengaluru)..." 
            value={searchCity}
            onChange={(e) => setSearchCity(e.target.value)}
            style={{ width: '220px', padding: '8px 14px', fontSize: '0.85rem' }}
          />

          <select 
            value={selectedUrgency} 
            onChange={(e) => setSelectedUrgency(e.target.value)}
            style={{ width: '160px', padding: '8px 14px', fontSize: '0.85rem' }}
          >
            <option value="ALL">All Urgencies</option>
            <option value="CRITICAL">🔴 Critical Only</option>
            <option value="URGENT">🟠 Urgent</option>
            <option value="NORMAL">🔵 Normal</option>
          </select>
        </div>
      </div>

      {/* Blood Group Quick Pills */}
      <div style={{ display: 'flex', gap: '8px', overflowX: 'auto', paddingBottom: '12px', marginBottom: '24px' }}>
        {BLOOD_GROUPS.map(bg => (
          <button
            key={bg}
            onClick={() => setSelectedGroup(bg)}
            style={{
              padding: '6px 14px',
              borderRadius: 'var(--radius-full)',
              fontSize: '0.82rem',
              fontWeight: 700,
              cursor: 'pointer',
              border: selectedGroup === bg ? '1px solid var(--crimson-primary)' : '1px solid var(--border-glass)',
              background: selectedGroup === bg ? 'var(--crimson-primary)' : 'rgba(255, 255, 255, 0.04)',
              color: selectedGroup === bg ? '#ffffff' : 'var(--text-muted)',
              transition: 'all 0.2s',
              whiteSpace: 'nowrap',
            }}
          >
            {bg === 'ALL' ? '🩸 All Blood Groups' : bg.replace('_', ' ')}
          </button>
        ))}
      </div>

      {/* Request Cards Grid */}
      {filteredRequests.length === 0 ? (
        <div className="glass-panel" style={{ padding: '60px', textAlign: 'center' }}>
          <CheckCircle2 size={48} color="#10b981" style={{ margin: '0 auto 16px' }} />
          <h3>No Active Requests Matching Filters</h3>
          <p style={{ color: 'var(--text-muted)', marginTop: '8px' }}>
            All patient transfusion requirements in this category are currently covered.
          </p>
        </div>
      ) : (
        <div style={{
          display: 'grid',
          gridTemplateColumns: 'repeat(auto-fill, minmax(380px, 1fr))',
          gap: '20px',
        }}>
          {filteredRequests.map(req => {
            const isCritical = req.urgency === 'CRITICAL';
            const isFulfilled = req.status === 'FULFILLED';

            return (
              <div 
                key={req.id} 
                className="glass-panel"
                style={{
                  padding: '24px',
                  display: 'flex',
                  flexDirection: 'column',
                  justifyContent: 'space-between',
                  position: 'relative',
                  overflow: 'hidden',
                  borderColor: isCritical ? 'rgba(239, 68, 68, 0.35)' : 'var(--border-glass)',
                }}
              >
                {/* Top Header */}
                <div>
                  <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '14px' }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                      <span className={`badge ${
                        req.urgency === 'CRITICAL' ? 'badge-critical' :
                        req.urgency === 'URGENT' ? 'badge-urgent' : 'badge-normal'
                      }`}>
                        {req.urgency === 'CRITICAL' && <AlertTriangle size={12} />}
                        {req.urgency}
                      </span>
                      <span className="badge badge-blood">
                        <Droplet size={12} fill="#fb7185" />
                        {req.bloodGroup.replace('_', ' ')}
                      </span>
                    </div>

                    <div style={{
                      fontSize: '0.8rem',
                      fontWeight: 700,
                      color: isFulfilled ? '#34d399' : '#fda4af',
                      background: isFulfilled ? 'rgba(16, 185, 129, 0.1)' : 'rgba(225, 29, 72, 0.1)',
                      padding: '3px 8px',
                      borderRadius: 'var(--radius-sm)',
                    }}>
                      {req.fulfilledUnits} / {req.unitsNeeded} Units
                    </div>
                  </div>

                  <h3 style={{ fontSize: '1.25rem', fontWeight: 700, marginBottom: '6px' }}>
                    {req.patientName}
                  </h3>

                  <div style={{ display: 'flex', alignItems: 'flex-start', gap: '8px', color: 'var(--text-muted)', fontSize: '0.88rem', marginBottom: '6px' }}>
                    <MapPin size={16} color="var(--crimson-primary)" style={{ flexShrink: 0, marginTop: '2px' }} />
                    <div>
                      <strong style={{ color: 'var(--text-main)' }}>{req.hospitalName}</strong>
                      <div>{req.hospitalAddress}, {req.city}</div>
                    </div>
                  </div>

                  {req.notes && (
                    <p style={{
                      fontSize: '0.82rem',
                      color: 'var(--text-muted)',
                      background: 'rgba(0, 0, 0, 0.25)',
                      padding: '8px 12px',
                      borderRadius: 'var(--radius-sm)',
                      margin: '12px 0',
                    }}>
                      {req.notes}
                    </p>
                  )}
                </div>

                {/* Footer and Actions */}
                <div style={{ marginTop: '16px', paddingTop: '16px', borderTop: '1px solid var(--border-glass)' }}>
                  <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '14px', fontSize: '0.78rem', color: 'var(--text-subtle)' }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '4px' }}>
                      <Clock size={14} />
                      Required by: {new Date(req.requiredBefore).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit', day: 'numeric', month: 'short' })}
                    </div>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '4px' }}>
                      <PhoneCall size={14} />
                      {req.contactNumber}
                    </div>
                  </div>

                  <button
                    className={`btn ${isFulfilled ? 'btn-secondary' : isCritical ? 'btn-urgent' : 'btn-primary'}`}
                    disabled={isFulfilled || volunteeringId === req.id}
                    onClick={() => handleVolunteer(req.id)}
                    style={{ width: '100%' }}
                  >
                    {isFulfilled ? (
                      <>
                        <CheckCircle2 size={16} color="#34d399" />
                        Transfusion Fulfilled
                      </>
                    ) : (
                      <>
                        <Droplet size={16} />
                        {volunteeringId === req.id ? 'Registering Response...' : 'Volunteer to Donate Now'}
                      </>
                    )}
                  </button>
                </div>
              </div>
            );
          })}
        </div>
      )}

      {/* Create Urgent Blood Request Modal */}
      {isCreateOpen && (
        <div className="modal-overlay">
          <div className="modal-content">
            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '20px' }}>
              <div>
                <h2 style={{ fontSize: '1.4rem', fontWeight: 800 }}>Broadcast Blood Request</h2>
                <p style={{ fontSize: '0.85rem', color: 'var(--text-muted)' }}>Emergency dispatch to registered donors & hospitals</p>
              </div>
              <button 
                onClick={onCloseCreate}
                style={{ background: 'none', border: 'none', color: 'var(--text-muted)', cursor: 'pointer' }}
              >
                <X size={24} />
              </button>
            </div>

            <form onSubmit={handleCreateSubmit} style={{ display: 'flex', flexDirection: 'column', gap: '14px' }}>
              <div>
                <label style={{ fontSize: '0.85rem', fontWeight: 600, display: 'block', marginBottom: '4px' }}>
                  Patient Full Name *
                </label>
                <input 
                  type="text" 
                  required
                  placeholder="e.g. Ramesh Kulkarni"
                  value={formData.patientName}
                  onChange={(e) => setFormData({ ...formData, patientName: e.target.value })}
                />
              </div>

              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '12px' }}>
                <div>
                  <label style={{ fontSize: '0.85rem', fontWeight: 600, display: 'block', marginBottom: '4px' }}>
                    Blood Group Needed *
                  </label>
                  <select 
                    value={formData.bloodGroup}
                    onChange={(e) => setFormData({ ...formData, bloodGroup: e.target.value })}
                  >
                    {BLOOD_GROUPS.filter(bg => bg !== 'ALL').map(bg => (
                      <option key={bg} value={bg}>{bg.replace('_', ' ')}</option>
                    ))}
                  </select>
                </div>

                <div>
                  <label style={{ fontSize: '0.85rem', fontWeight: 600, display: 'block', marginBottom: '4px' }}>
                    Units Required *
                  </label>
                  <input 
                    type="number" 
                    min={1} 
                    max={15}
                    value={formData.unitsNeeded}
                    onChange={(e) => setFormData({ ...formData, unitsNeeded: parseInt(e.target.value, 10) || 1 })}
                  />
                </div>
              </div>

              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '12px' }}>
                <div>
                  <label style={{ fontSize: '0.85rem', fontWeight: 600, display: 'block', marginBottom: '4px' }}>
                    Urgency Level *
                  </label>
                  <select 
                    value={formData.urgency}
                    onChange={(e) => setFormData({ ...formData, urgency: e.target.value })}
                  >
                    <option value="CRITICAL">🔴 Critical (Immediate Surgery/ICU)</option>
                    <option value="URGENT">🟠 Urgent (Within 12 hours)</option>
                    <option value="NORMAL">🔵 Normal (Within 24-48 hours)</option>
                  </select>
                </div>

                <div>
                  <label style={{ fontSize: '0.85rem', fontWeight: 600, display: 'block', marginBottom: '4px' }}>
                    Contact Phone Number *
                  </label>
                  <input 
                    type="text" 
                    required
                    placeholder="+919876543210"
                    value={formData.contactNumber}
                    onChange={(e) => setFormData({ ...formData, contactNumber: e.target.value })}
                  />
                </div>
              </div>

              <div>
                <label style={{ fontSize: '0.85rem', fontWeight: 600, display: 'block', marginBottom: '4px' }}>
                  Hospital / Medical Center Name *
                </label>
                <input 
                  type="text" 
                  required
                  placeholder="e.g. Manipal Hospital, HAL Old Airport Rd"
                  value={formData.hospitalName}
                  onChange={(e) => setFormData({ ...formData, hospitalName: e.target.value })}
                />
              </div>

              <div style={{ display: 'grid', gridTemplateColumns: '2fr 1fr', gap: '12px' }}>
                <div>
                  <label style={{ fontSize: '0.85rem', fontWeight: 600, display: 'block', marginBottom: '4px' }}>
                    Hospital Address *
                  </label>
                  <input 
                    type="text" 
                    required
                    placeholder="e.g. 98 HAL Old Airport Rd, Kodihalli"
                    value={formData.hospitalAddress}
                    onChange={(e) => setFormData({ ...formData, hospitalAddress: e.target.value })}
                  />
                </div>

                <div>
                  <label style={{ fontSize: '0.85rem', fontWeight: 600, display: 'block', marginBottom: '4px' }}>
                    City *
                  </label>
                  <input 
                    type="text" 
                    required
                    placeholder="e.g. Bengaluru"
                    value={formData.city}
                    onChange={(e) => setFormData({ ...formData, city: e.target.value })}
                  />
                </div>
              </div>

              <div>
                <label style={{ fontSize: '0.85rem', fontWeight: 600, display: 'block', marginBottom: '4px' }}>
                  Medical Case Notes / Details
                </label>
                <textarea 
                  rows={2}
                  placeholder="Emergency bypass surgery, platelets for dengue, etc."
                  value={formData.notes}
                  onChange={(e) => setFormData({ ...formData, notes: e.target.value })}
                />
              </div>

              <div style={{ display: 'flex', gap: '10px', marginTop: '10px' }}>
                <button 
                  type="button" 
                  onClick={onCloseCreate}
                  className="btn btn-secondary"
                  style={{ flex: 1 }}
                >
                  Cancel
                </button>
                <button 
                  type="submit" 
                  disabled={isSubmitting}
                  className="btn btn-urgent"
                  style={{ flex: 2 }}
                >
                  <Send size={16} />
                  {isSubmitting ? 'Broadcasting Alert...' : 'Broadcast Emergency Call'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};
