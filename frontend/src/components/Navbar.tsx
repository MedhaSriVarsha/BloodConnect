import React from 'react';
import { 
  Heart, 
  AlertCircle, 
  Users, 
  ClipboardCheck, 
  Award, 
  Building2, 
  Share2, 
  ShieldCheck, 
  User, 
  LogOut,
  PlusCircle
} from 'lucide-react';

interface NavbarProps {
  activeTab: string;
  setActiveTab: (tab: string) => void;
  user: any;
  onOpenAuth: () => void;
  onOpenCreateRequest: () => void;
  onLogout: () => void;
  openRequestsCount: number;
}

export const Navbar: React.FC<NavbarProps> = ({
  activeTab,
  setActiveTab,
  user,
  onOpenAuth,
  onOpenCreateRequest,
  onLogout,
  openRequestsCount,
}) => {
  const isAdmin = user?.roles?.includes('ADMIN');

  return (
    <header style={{
      position: 'sticky',
      top: 0,
      zIndex: 100,
      background: 'rgba(7, 11, 20, 0.85)',
      backdropFilter: 'blur(20px)',
      borderBottom: '1px solid var(--border-glass)',
      padding: '0 24px',
    }}>
      <div style={{
        maxWidth: '1400px',
        margin: '0 auto',
        height: '74px',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'space-between',
        gap: '20px',
      }}>
        {/* Brand Logo */}
        <div 
          onClick={() => setActiveTab('requests')}
          style={{ display: 'flex', alignItems: 'center', gap: '12px', cursor: 'pointer' }}
        >
          <div style={{
            width: '42px',
            height: '42px',
            borderRadius: '12px',
            background: 'linear-gradient(135deg, #e11d48 0%, #9f1239 100%)',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            boxShadow: '0 4px 20px var(--crimson-glow)',
          }}>
            <Heart size={24} color="#ffffff" fill="#ffffff" />
          </div>
          <div>
            <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
              <span style={{ fontSize: '1.3rem', fontWeight: 800, fontFamily: 'var(--font-display)', letterSpacing: '-0.03em' }}>
                Blood<span style={{ color: 'var(--crimson-primary)' }}>Connect</span>
              </span>
              <span className="badge badge-critical" style={{ fontSize: '0.65rem', padding: '2px 6px' }}>
                LIVE 24x7
              </span>
            </div>
            <p style={{ fontSize: '0.75rem', color: 'var(--text-muted)', lineHeight: 1 }}>Mission-Critical Lifeline</p>
          </div>
        </div>

        {/* Navigation Tabs */}
        <nav style={{ display: 'flex', alignItems: 'center', gap: '4px' }}>
          <button 
            className={`btn ${activeTab === 'requests' ? 'btn-primary' : 'btn-secondary'}`}
            onClick={() => setActiveTab('requests')}
            style={{ padding: '8px 14px', fontSize: '0.85rem' }}
          >
            <AlertCircle size={16} />
            Emergency Requests
            {openRequestsCount > 0 && (
              <span style={{
                background: '#fff',
                color: '#e11d48',
                borderRadius: '10px',
                padding: '1px 6px',
                fontSize: '0.7rem',
                fontWeight: 800,
              }}>
                {openRequestsCount}
              </span>
            )}
          </button>

          <button 
            className={`btn ${activeTab === 'donors' ? 'btn-primary' : 'btn-secondary'}`}
            onClick={() => setActiveTab('donors')}
            style={{ padding: '8px 14px', fontSize: '0.85rem' }}
          >
            <Users size={16} />
            Find Donors
          </button>

          <button 
            className={`btn ${activeTab === 'eligibility' ? 'btn-primary' : 'btn-secondary'}`}
            onClick={() => setActiveTab('eligibility')}
            style={{ padding: '8px 14px', fontSize: '0.85rem' }}
          >
            <ClipboardCheck size={16} />
            Eligibility Check
          </button>

          <button 
            className={`btn ${activeTab === 'history' ? 'btn-primary' : 'btn-secondary'}`}
            onClick={() => setActiveTab('history')}
            style={{ padding: '8px 14px', fontSize: '0.85rem' }}
          >
            <Award size={16} />
            Donation History
          </button>

          <button 
            className={`btn ${activeTab === 'institutions' ? 'btn-primary' : 'btn-secondary'}`}
            onClick={() => setActiveTab('institutions')}
            style={{ padding: '8px 14px', fontSize: '0.85rem' }}
          >
            <Building2 size={16} />
            Blood Banks
          </button>

          <button 
            className={`btn ${activeTab === 'circle' ? 'btn-primary' : 'btn-secondary'}`}
            onClick={() => setActiveTab('circle')}
            style={{ padding: '8px 14px', fontSize: '0.85rem' }}
          >
            <ShieldCheck size={16} color="var(--crimson-primary)" />
            Trusted Circle
          </button>

          {isAdmin && (
            <button 
              className={`btn ${activeTab === 'admin' ? 'btn-primary' : 'btn-secondary'}`}
              onClick={() => setActiveTab('admin')}
              style={{ padding: '8px 14px', fontSize: '0.85rem', borderColor: '#e11d48' }}
            >
              <ShieldCheck size={16} color="#fda4af" />
              Admin Portal
            </button>
          )}
        </nav>

        {/* Right CTA Actions */}
        <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
          <button 
            className="btn btn-urgent" 
            onClick={onOpenCreateRequest}
            style={{ padding: '8px 16px', fontSize: '0.88rem' }}
          >
            <PlusCircle size={16} />
            Request Blood
          </button>

          {user ? (
            <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
              <div style={{
                display: 'flex',
                alignItems: 'center',
                gap: '8px',
                padding: '6px 12px',
                borderRadius: 'var(--radius-sm)',
                background: 'rgba(255, 255, 255, 0.05)',
                border: '1px solid var(--border-glass)',
              }}>
                <div style={{
                  width: '28px',
                  height: '28px',
                  borderRadius: '50%',
                  background: 'var(--crimson-primary)',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  fontWeight: 700,
                  fontSize: '0.8rem',
                }}>
                  {user.fullName ? user.fullName[0].toUpperCase() : 'U'}
                </div>
                <div style={{ textAlign: 'left', lineHeight: 1.2 }}>
                  <div style={{ fontSize: '0.82rem', fontWeight: 600 }}>{user.fullName.split(' ')[0]}</div>
                  <div style={{ fontSize: '0.68rem', color: 'var(--text-muted)' }}>{user.roles?.[0] || 'DONOR'}</div>
                </div>
              </div>
              <button 
                onClick={onLogout} 
                className="btn btn-secondary" 
                title="Log out"
                style={{ padding: '8px', borderRadius: 'var(--radius-sm)' }}
              >
                <LogOut size={16} />
              </button>
            </div>
          ) : (
            <button 
              className="btn btn-secondary"
              onClick={onOpenAuth}
              style={{ padding: '8px 16px', fontSize: '0.88rem' }}
            >
              <User size={16} />
              Sign In / Verify
            </button>
          )}
        </div>
      </div>
    </header>
  );
};
