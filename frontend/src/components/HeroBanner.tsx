import React from 'react';
import { Activity, ShieldCheck, HeartHandshake, Zap } from 'lucide-react';

interface HeroBannerProps {
  stats: {
    totalDonors: number;
    openRequests: number;
    totalDonations: number;
    livesSavedEstimate: number;
  };
}

export const HeroBanner: React.FC<HeroBannerProps> = ({ stats }) => {
  return (
    <div style={{
      maxWidth: '1400px',
      margin: '24px auto 0',
      padding: '0 24px',
    }}>
      {/* Emergency ticker */}
      <div style={{
        background: 'linear-gradient(90deg, rgba(239, 68, 68, 0.15) 0%, rgba(225, 29, 72, 0.15) 100%)',
        border: '1px solid rgba(239, 68, 68, 0.3)',
        borderRadius: 'var(--radius-sm)',
        padding: '10px 16px',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'space-between',
        marginBottom: '24px',
      }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
          <span className="dot-pulse" style={{ background: '#ef4444' }} />
          <span style={{ fontSize: '0.85rem', fontWeight: 700, color: '#fca5a5' }}>EMERGENCY BROADCAST:</span>
          <span style={{ fontSize: '0.85rem', color: '#f8fafc' }}>
            Critical O- and B- blood units required for pediatric surgeries across Bengaluru & NCR hospitals.
          </span>
        </div>
        <span style={{ fontSize: '0.75rem', color: '#fda4af', fontWeight: 600 }}>Active Dispatch Feed</span>
      </div>

      {/* Hero Stats Ribbon */}
      <div style={{
        display: 'grid',
        gridTemplateColumns: 'repeat(auto-fit, minmax(240px, 1fr))',
        gap: '16px',
      }}>
        <div className="glass-panel" style={{ padding: '20px', display: 'flex', alignItems: 'center', gap: '16px' }}>
          <div style={{
            width: '48px',
            height: '48px',
            borderRadius: '12px',
            background: 'rgba(239, 68, 68, 0.12)',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            color: '#f87171',
          }}>
            <Activity size={24} />
          </div>
          <div>
            <div style={{ fontSize: '1.8rem', fontWeight: 800, fontFamily: 'var(--font-display)', lineHeight: 1.1 }}>
              {stats.openRequests}
            </div>
            <div style={{ fontSize: '0.82rem', color: 'var(--text-muted)' }}>Urgent Active Requests</div>
          </div>
        </div>

        <div className="glass-panel" style={{ padding: '20px', display: 'flex', alignItems: 'center', gap: '16px' }}>
          <div style={{
            width: '48px',
            height: '48px',
            borderRadius: '12px',
            background: 'rgba(16, 185, 129, 0.12)',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            color: '#34d399',
          }}>
            <ShieldCheck size={24} />
          </div>
          <div>
            <div style={{ fontSize: '1.8rem', fontWeight: 800, fontFamily: 'var(--font-display)', lineHeight: 1.1 }}>
              {stats.totalDonors}
            </div>
            <div style={{ fontSize: '0.82rem', color: 'var(--text-muted)' }}>Verified Ready Donors</div>
          </div>
        </div>

        <div className="glass-panel" style={{ padding: '20px', display: 'flex', alignItems: 'center', gap: '16px' }}>
          <div style={{
            width: '48px',
            height: '48px',
            borderRadius: '12px',
            background: 'rgba(59, 130, 246, 0.12)',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            color: '#60a5fa',
          }}>
            <HeartHandshake size={24} />
          </div>
          <div>
            <div style={{ fontSize: '1.8rem', fontWeight: 800, fontFamily: 'var(--font-display)', lineHeight: 1.1 }}>
              {stats.totalDonations}
            </div>
            <div style={{ fontSize: '0.82rem', color: 'var(--text-muted)' }}>Verified Transfusions</div>
          </div>
        </div>

        <div className="glass-panel" style={{
          padding: '20px',
          display: 'flex',
          alignItems: 'center',
          gap: '16px',
          background: 'linear-gradient(135deg, rgba(225, 29, 72, 0.18) 0%, rgba(190, 18, 60, 0.08) 100%)',
          border: '1px solid rgba(225, 29, 72, 0.3)',
        }}>
          <div style={{
            width: '48px',
            height: '48px',
            borderRadius: '12px',
            background: 'var(--crimson-primary)',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            color: '#fff',
            boxShadow: '0 4px 15px var(--crimson-glow)',
          }}>
            <Zap size={24} />
          </div>
          <div>
            <div style={{ fontSize: '1.8rem', fontWeight: 800, fontFamily: 'var(--font-display)', color: '#fda4af', lineHeight: 1.1 }}>
              {stats.livesSavedEstimate}
            </div>
            <div style={{ fontSize: '0.82rem', color: '#fecdd3' }}>Lives Saved & Protected</div>
          </div>
        </div>
      </div>
    </div>
  );
};
