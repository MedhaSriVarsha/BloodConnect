import React, { useState, useEffect } from 'react';
import { 
  Users, 
  MapPin, 
  Droplet, 
  Phone, 
  ShieldCheck, 
  ToggleLeft, 
  ToggleRight, 
  Award,
  Lock
} from 'lucide-react';
import { api } from '../services/api.js';

interface DonorDiscoveryProps {
  user: any;
  onOpenAuth: () => void;
}

export const DonorDiscovery: React.FC<DonorDiscoveryProps> = ({ user, onOpenAuth }) => {
  const [donors, setDonors] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedBloodGroup, setSelectedBloodGroup] = useState('');
  const [city, setCity] = useState('');
  const [isAvailableSelf, setIsAvailableSelf] = useState(true);
  const [contactModalDonor, setContactModalDonor] = useState<any>(null);

  const fetchDonors = async () => {
    setLoading(true);
    const params: Record<string, string> = {};
    if (selectedBloodGroup) params.bloodGroup = selectedBloodGroup;
    if (city) params.city = city;
    const res = await api.searchDonors(params);
    setLoading(false);
    if (res.status === 'success' && res.data) {
      setDonors(res.data);
    }
  };

  useEffect(() => {
    fetchDonors();
  }, [selectedBloodGroup, city]);

  const handleToggleAvailability = async () => {
    if (!user) {
      onOpenAuth();
      return;
    }
    const nextVal = !isAvailableSelf;
    setIsAvailableSelf(nextVal);
    await api.toggleAvailability(nextVal);
    fetchDonors();
  };

  return (
    <div style={{ maxWidth: '1400px', margin: '32px auto', padding: '0 24px' }}>
      {/* Top Banner with Availability Toggle */}
      <div className="glass-panel" style={{
        padding: '24px',
        marginBottom: '28px',
        display: 'flex',
        flexWrap: 'wrap',
        alignItems: 'center',
        justifyContent: 'space-between',
        gap: '20px',
        background: 'linear-gradient(135deg, rgba(16, 185, 129, 0.08) 0%, rgba(13, 21, 39, 0.8) 100%)',
      }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '16px' }}>
          <div style={{
            width: '48px',
            height: '48px',
            borderRadius: '14px',
            background: 'rgba(16, 185, 129, 0.2)',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            color: '#34d399',
          }}>
            <Users size={24} />
          </div>
          <div>
            <h2 style={{ fontSize: '1.3rem', fontWeight: 800 }}>Ready Volunteer Blood Donors</h2>
            <p style={{ color: 'var(--text-muted)', fontSize: '0.85rem' }}>
              Connect with verified donors ready for emergency response in your city.
            </p>
          </div>
        </div>

        {user && (
          <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
            <span style={{ fontSize: '0.85rem', color: isAvailableSelf ? '#34d399' : 'var(--text-muted)', fontWeight: 600 }}>
              {isAvailableSelf ? '🟢 You are AVAILABLE for Emergency Transfusions' : '⚪ You are currently OFFLINE'}
            </span>
            <button 
              onClick={handleToggleAvailability}
              style={{ background: 'none', border: 'none', cursor: 'pointer', color: isAvailableSelf ? '#10b981' : '#64748b' }}
            >
              {isAvailableSelf ? <ToggleRight size={38} /> : <ToggleLeft size={38} />}
            </button>
          </div>
        )}
      </div>

      {/* Filter Toolbar */}
      <div style={{ display: 'flex', flexWrap: 'wrap', gap: '12px', marginBottom: '24px', alignItems: 'center' }}>
        <input 
          type="text" 
          placeholder="Filter by city (e.g. Bengaluru)..." 
          value={city}
          onChange={(e) => setCity(e.target.value)}
          style={{ width: '240px', padding: '10px 14px' }}
        />

        <select 
          value={selectedBloodGroup}
          onChange={(e) => setSelectedBloodGroup(e.target.value)}
          style={{ width: '200px', padding: '10px 14px' }}
        >
          <option value="">All Blood Groups</option>
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

      {/* Donors Grid */}
      {donors.length === 0 ? (
        <div className="glass-panel" style={{ padding: '48px', textAlign: 'center' }}>
          <p style={{ color: 'var(--text-muted)' }}>No donors found matching criteria.</p>
        </div>
      ) : (
        <div style={{
          display: 'grid',
          gridTemplateColumns: 'repeat(auto-fill, minmax(320px, 1fr))',
          gap: '20px',
        }}>
          {donors.map(donor => (
            <div 
              key={donor.id}
              className="glass-panel"
              style={{
                padding: '24px',
                display: 'flex',
                flexDirection: 'column',
                justifyContent: 'space-between',
              }}
            >
              <div>
                <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '16px' }}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                    <div style={{
                      width: '42px',
                      height: '42px',
                      borderRadius: '50%',
                      background: 'var(--crimson-primary)',
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center',
                      fontWeight: 800,
                      fontSize: '1rem',
                    }}>
                      {donor.fullName[0]}
                    </div>
                    <div>
                      <h3 style={{ fontSize: '1.1rem', fontWeight: 700 }}>{donor.fullName}</h3>
                      <div style={{ display: 'flex', alignItems: 'center', gap: '4px', fontSize: '0.78rem', color: 'var(--text-muted)' }}>
                        <MapPin size={12} color="var(--crimson-primary)" />
                        {donor.city}, {donor.state}
                      </div>
                    </div>
                  </div>

                  <span className="badge badge-blood">
                    <Droplet size={12} fill="#fb7185" />
                    {donor.bloodGroup.replace('_', ' ')}
                  </span>
                </div>

                <div style={{
                  display: 'grid',
                  gridTemplateColumns: '1fr 1fr',
                  gap: '8px',
                  background: 'rgba(0, 0, 0, 0.25)',
                  padding: '10px',
                  borderRadius: 'var(--radius-sm)',
                  fontSize: '0.8rem',
                  marginBottom: '16px',
                }}>
                  <div>
                    <span style={{ color: 'var(--text-muted)' }}>Total Donations:</span>
                    <strong style={{ display: 'block', color: 'var(--text-main)' }}>{donor.totalDonationsCount} times</strong>
                  </div>
                  <div>
                    <span style={{ color: 'var(--text-muted)' }}>Badge Honor:</span>
                    <strong style={{ display: 'block', color: '#fbbf24' }}>{donor.badgeLevel}</strong>
                  </div>
                </div>
              </div>

              <button 
                className="btn btn-secondary"
                onClick={() => setContactModalDonor(donor)}
                style={{ width: '100%', padding: '10px' }}
              >
                <Phone size={16} />
                Request Emergency Contact
              </button>
            </div>
          ))}
        </div>
      )}

      {/* Contact Privacy Modal */}
      {contactModalDonor && (
        <div className="modal-overlay">
          <div className="modal-content" style={{ maxWidth: '480px' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '10px', marginBottom: '16px' }}>
              <ShieldCheck size={28} color="#34d399" />
              <div>
                <h3 style={{ fontSize: '1.2rem', fontWeight: 800 }}>Privacy Protected Contact</h3>
                <span style={{ fontSize: '0.78rem', color: 'var(--text-muted)' }}>Regulated Healthcare Privacy Standards</span>
              </div>
            </div>

            <p style={{ fontSize: '0.88rem', color: 'var(--text-muted)', marginBottom: '20px', lineHeight: 1.5 }}>
              BloodConnect protects donor privacy. Direct telephone communication is authorized strictly for emergency patient blood donation needs.
            </p>

            <div style={{
              background: 'rgba(0, 0, 0, 0.4)',
              border: '1px solid var(--border-glass)',
              borderRadius: 'var(--radius-sm)',
              padding: '16px',
              textAlign: 'center',
              marginBottom: '20px',
            }}>
              <div style={{ fontSize: '0.8rem', color: 'var(--text-subtle)' }}>Authorized Contact Number:</div>
              <div style={{ fontSize: '1.3rem', fontWeight: 800, color: '#fda4af', letterSpacing: '0.05em', margin: '6px 0' }}>
                {contactModalDonor.contactPhone}
              </div>
              <div style={{ fontSize: '0.75rem', color: '#34d399' }}>Donor consent verified</div>
            </div>

            <button 
              className="btn btn-primary"
              onClick={() => setContactModalDonor(null)}
              style={{ width: '100%' }}
            >
              Close Window
            </button>
          </div>
        </div>
      )}
    </div>
  );
};
