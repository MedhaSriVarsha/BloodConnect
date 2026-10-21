import React, { useState, useEffect } from 'react';
import { Share2, Copy, Check, Gift, Users, Award, Heart } from 'lucide-react';
import { api } from '../services/api.js';

interface ReferralHubProps {
  user: any;
  onOpenAuth: () => void;
}

export const ReferralHub: React.FC<ReferralHubProps> = ({ user, onOpenAuth }) => {
  const [referral, setReferral] = useState<any>(null);
  const [copied, setCopied] = useState(false);

  useEffect(() => {
    if (user) {
      api.getMyReferral().then(res => {
        if (res.status === 'success' && res.data) {
          setReferral(res.data);
        }
      });
    }
  }, [user]);

  const handleCopy = () => {
    if (referral?.shareUrl) {
      navigator.clipboard.writeText(referral.shareUrl);
      setCopied(true);
      setTimeout(() => setCopied(false), 3000);
    }
  };

  if (!user) {
    return (
      <div style={{ maxWidth: '800px', margin: '48px auto', padding: '0 24px', textAlign: 'center' }}>
        <div className="glass-panel" style={{ padding: '60px 32px' }}>
          <Share2 size={56} color="var(--crimson-primary)" style={{ margin: '0 auto 16px' }} />
          <h2 style={{ fontSize: '1.8rem', fontWeight: 800, marginBottom: '8px' }}>
            BloodConnect Ambassador Program
          </h2>
          <p style={{ color: 'var(--text-muted)', marginBottom: '24px', maxWidth: '500px', margin: '0 auto 24px' }}>
            Inspire your friends, colleagues, and family to join the lifesaving blood network. Sign in to get your personalized invite link.
          </p>
          <button className="btn btn-primary" onClick={onOpenAuth}>
            Sign In to Access Referral Hub
          </button>
        </div>
      </div>
    );
  }

  return (
    <div style={{ maxWidth: '1000px', margin: '32px auto', padding: '0 24px' }}>
      <div style={{ textAlign: 'center', marginBottom: '32px' }}>
        <div style={{
          display: 'inline-flex',
          alignItems: 'center',
          gap: '8px',
          background: 'rgba(225, 29, 72, 0.1)',
          color: '#fda4af',
          padding: '6px 14px',
          borderRadius: 'var(--radius-full)',
          fontSize: '0.85rem',
          fontWeight: 700,
          marginBottom: '12px',
        }}>
          <Gift size={16} />
          Community Lifeline Multiplier
        </div>
        <h1 style={{ fontSize: '2.2rem', fontWeight: 800, marginBottom: '8px' }}>
          BloodConnect Ambassador Hub
        </h1>
        <p style={{ color: 'var(--text-muted)', maxWidth: '650px', margin: '0 auto', fontSize: '0.95rem' }}>
          Every new donor you bring to BloodConnect potentially saves 3 additional patients in critical emergencies.
        </p>
      </div>

      <div style={{
        display: 'grid',
        gridTemplateColumns: 'repeat(auto-fit, minmax(260px, 1fr))',
        gap: '20px',
        marginBottom: '32px',
      }}>
        <div className="glass-panel" style={{ padding: '24px', textAlign: 'center' }}>
          <Award size={32} color="#fbbf24" style={{ margin: '0 auto 12px' }} />
          <div style={{ fontSize: '0.85rem', color: 'var(--text-muted)' }}>Ambassador Tier</div>
          <div style={{ fontSize: '1.4rem', fontWeight: 800, color: '#fbbf24', marginTop: '4px' }}>
            {referral?.rewardsTier || 'BLOOD_AMBASSADOR'}
          </div>
        </div>

        <div className="glass-panel" style={{ padding: '24px', textAlign: 'center' }}>
          <Gift size={32} color="#34d399" style={{ margin: '0 auto 12px' }} />
          <div style={{ fontSize: '0.85rem', color: 'var(--text-muted)' }}>Reward Points</div>
          <div style={{ fontSize: '2rem', fontWeight: 800, color: '#34d399', marginTop: '4px' }}>
            {referral?.rewardPoints || 50} pts
          </div>
        </div>

        <div className="glass-panel" style={{ padding: '24px', textAlign: 'center' }}>
          <Users size={32} color="#60a5fa" style={{ margin: '0 auto 12px' }} />
          <div style={{ fontSize: '0.85rem', color: 'var(--text-muted)' }}>Referred Donors</div>
          <div style={{ fontSize: '2rem', fontWeight: 800, color: '#60a5fa', marginTop: '4px' }}>
            {referral?.referredCount || 0}
          </div>
        </div>
      </div>

      {/* Share Link Box */}
      <div className="glass-panel" style={{
        padding: '32px',
        textAlign: 'center',
        background: 'linear-gradient(135deg, rgba(225, 29, 72, 0.12) 0%, rgba(13, 21, 39, 0.9) 100%)',
        border: '1px solid rgba(225, 29, 72, 0.3)',
      }}>
        <h2 style={{ fontSize: '1.3rem', fontWeight: 800, marginBottom: '8px' }}>
          Your Unique Referral Link
        </h2>
        <p style={{ fontSize: '0.88rem', color: 'var(--text-muted)', marginBottom: '20px' }}>
          Share this link. When your referral signs up and completes donor verification, you both receive bonus lifesaver credits.
        </p>

        <div style={{
          display: 'flex',
          maxWidth: '560px',
          margin: '0 auto',
          gap: '10px',
        }}>
          <input 
            type="text" 
            readOnly 
            value={referral?.shareUrl || `https://bloodconnect.org/join?ref=${referral?.referralCode || 'BC-HERO'}`}
            style={{
              background: 'rgba(0, 0, 0, 0.4)',
              color: '#fda4af',
              fontWeight: 600,
              fontFamily: 'monospace',
              fontSize: '0.95rem',
            }}
          />
          <button 
            className="btn btn-primary"
            onClick={handleCopy}
            style={{ padding: '0 24px', flexShrink: 0 }}
          >
            {copied ? <Check size={18} /> : <Copy size={18} />}
            {copied ? 'Copied!' : 'Copy'}
          </button>
        </div>

        <div style={{ marginTop: '16px', fontSize: '0.82rem', color: 'var(--text-muted)' }}>
          Referral Code: <strong style={{ color: 'var(--text-main)', letterSpacing: '0.1em' }}>{referral?.referralCode}</strong>
        </div>
      </div>
    </div>
  );
};
