import React, { useState, useEffect } from 'react';
import { Building2, MapPin, Phone, Clock, Droplet, Search } from 'lucide-react';
import { api } from '../services/api.js';

export const InstitutionsDirectory: React.FC = () => {
  const [institutions, setInstitutions] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [city, setCity] = useState('');
  const [type, setType] = useState('');

  const fetchInstitutions = async () => {
    setLoading(true);
    const params: Record<string, string> = {};
    if (city) params.city = city;
    if (type) params.type = type;
    const res = await api.getInstitutions(params);
    setLoading(false);
    if (res.status === 'success' && res.data) {
      setInstitutions(res.data);
    }
  };

  useEffect(() => {
    fetchInstitutions();
  }, [city, type]);

  return (
    <div style={{ maxWidth: '1400px', margin: '32px auto', padding: '0 24px' }}>
      <div style={{ marginBottom: '24px' }}>
        <h1 style={{ fontSize: '1.8rem', fontWeight: 800 }}>
          🏥 Blood Banks & Hospital Centers
        </h1>
        <p style={{ color: 'var(--text-muted)', fontSize: '0.9rem' }}>
          Real-time blood stock availability across accredited medical facilities.
        </p>
      </div>

      {/* Filter bar */}
      <div style={{ display: 'flex', flexWrap: 'wrap', gap: '12px', marginBottom: '28px' }}>
        <input 
          type="text" 
          placeholder="Filter by city (e.g. Bengaluru)..." 
          value={city}
          onChange={(e) => setCity(e.target.value)}
          style={{ width: '250px', padding: '10px 14px' }}
        />

        <select 
          value={type}
          onChange={(e) => setType(e.target.value)}
          style={{ width: '200px', padding: '10px 14px' }}
        >
          <option value="">All Center Types</option>
          <option value="BLOOD_BANK">Blood Banks</option>
          <option value="HOSPITAL">Hospitals</option>
        </select>
      </div>

      {/* Institutions Grid */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(420px, 1fr))', gap: '24px' }}>
        {institutions.map(inst => (
          <div key={inst.id} className="glass-panel" style={{ padding: '24px', display: 'flex', flexDirection: 'column', justifyContent: 'space-between' }}>
            <div>
              <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '12px' }}>
                <span className={`badge ${inst.type === 'BLOOD_BANK' ? 'badge-blood' : 'badge-normal'}`}>
                  {inst.type.replace('_', ' ')}
                </span>
                <span className="badge badge-available" style={{ fontSize: '0.7rem' }}>
                  {inst.verificationStatus}
                </span>
              </div>

              <h2 style={{ fontSize: '1.25rem', fontWeight: 800, marginBottom: '6px' }}>
                {inst.name}
              </h2>

              <div style={{ display: 'flex', alignItems: 'flex-start', gap: '8px', color: 'var(--text-muted)', fontSize: '0.88rem', marginBottom: '8px' }}>
                <MapPin size={16} color="var(--crimson-primary)" style={{ flexShrink: 0, marginTop: '2px' }} />
                <span>{inst.address}, {inst.city} - {inst.postalCode}</span>
              </div>

              <div style={{ display: 'flex', alignItems: 'center', gap: '16px', color: 'var(--text-muted)', fontSize: '0.85rem', marginBottom: '18px' }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: '4px' }}>
                  <Phone size={14} />
                  {inst.phone}
                </div>
                <div style={{ display: 'flex', alignItems: 'center', gap: '4px' }}>
                  <Clock size={14} />
                  {inst.operatingHours}
                </div>
              </div>

              {/* Real-time Inventory Meter */}
              <div style={{
                background: 'rgba(0, 0, 0, 0.3)',
                padding: '14px',
                borderRadius: 'var(--radius-sm)',
                border: '1px solid var(--border-glass)',
              }}>
                <div style={{ fontSize: '0.8rem', fontWeight: 700, color: 'var(--text-muted)', marginBottom: '10px' }}>
                  🩸 Live Blood Unit Stock:
                </div>
                <div style={{
                  display: 'grid',
                  gridTemplateColumns: 'repeat(4, 1fr)',
                  gap: '8px',
                }}>
                  {inst.availableInventory && Object.entries(inst.availableInventory).map(([grp, units]: any) => (
                    <div 
                      key={grp}
                      style={{
                        background: units > 5 ? 'rgba(16, 185, 129, 0.1)' : 'rgba(239, 68, 68, 0.1)',
                        border: units > 5 ? '1px solid rgba(16, 185, 129, 0.3)' : '1px solid rgba(239, 68, 68, 0.3)',
                        padding: '6px',
                        borderRadius: '6px',
                        textAlign: 'center',
                      }}
                    >
                      <div style={{ fontSize: '0.72rem', fontWeight: 700, color: 'var(--text-subtle)' }}>
                        {grp.replace('_', ' ')}
                      </div>
                      <div style={{ fontSize: '1rem', fontWeight: 800, color: units > 5 ? '#34d399' : '#f87171' }}>
                        {units}u
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            </div>

            <div style={{ marginTop: '20px', display: 'flex', gap: '10px' }}>
              <a 
                href={`tel:${inst.phone}`}
                className="btn btn-primary"
                style={{ flex: 1, textDecoration: 'none' }}
              >
                <Phone size={16} />
                Call Blood Bank
              </a>
              <button 
                className="btn btn-secondary"
                onClick={() => alert(`Directions mapped to ${inst.name}.`)}
                style={{ flex: 1 }}
              >
                Directions
              </button>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};
