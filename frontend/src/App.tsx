import React, { useState, useEffect } from 'react';
import { Navbar } from './components/Navbar.js';
import { HeroBanner } from './components/HeroBanner.js';
import { BloodRequestsBoard } from './components/BloodRequestsBoard.js';
import { EligibilityChecker } from './components/EligibilityChecker.js';
import { DonationHistory } from './components/DonationHistory.js';
import { DonorDiscovery } from './components/DonorDiscovery.js';
import { InstitutionsDirectory } from './components/InstitutionsDirectory.js';
import { ReferralHub } from './components/ReferralHub.js';
import { TrustedCircleHub } from './components/TrustedCircleHub.js';
import { AdminDashboard } from './components/AdminDashboard.js';
import { TwoStepAuthModal } from './components/TwoStepAuthModal.js';
import { api, setAuthToken, getAuthToken } from './services/api.js';
import { Shield, Heart, ExternalLink } from 'lucide-react';

export const App: React.FC = () => {
  const [activeTab, setActiveTab] = useState<string>('requests');
  const [user, setUser] = useState<any>(null);
  const [requests, setRequests] = useState<any[]>([]);
  const [stats, setStats] = useState({
    totalDonors: 142,
    openRequests: 3,
    totalDonations: 384,
    livesSavedEstimate: 1152,
  });

  const [isAuthOpen, setIsAuthOpen] = useState(false);
  const [isCreateOpen, setIsCreateOpen] = useState(false);

  // Load user session on mount
  useEffect(() => {
    if (getAuthToken()) {
      api.getMe().then(res => {
        if (res.status === 'success' && res.data) {
          setUser(res.data.user);
        } else {
          setAuthToken(null);
        }
      });
    }
    fetchRequests();
    fetchStats();
  }, []);

  const fetchRequests = async () => {
    const res = await api.getRequests();
    if (res.status === 'success' && res.data) {
      setRequests(res.data);
    }
  };

  const fetchStats = async () => {
    const res = await api.getAdminDashboard();
    if (res.status === 'success' && res.data?.metrics) {
      setStats({
        totalDonors: res.data.metrics.totalDonors,
        openRequests: res.data.metrics.openRequests,
        totalDonations: res.data.metrics.totalDonations,
        livesSavedEstimate: res.data.metrics.livesSavedEstimate,
      });
    }
  };

  const handleLogout = async () => {
    await api.logout();
    setAuthToken(null);
    setUser(null);
    setActiveTab('requests');
  };

  const openRequestsCount = requests.filter(r => r.status === 'OPEN').length;

  return (
    <div style={{ minHeight: '100vh', display: 'flex', flexDirection: 'column' }}>
      {/* Top Navbar */}
      <Navbar 
        activeTab={activeTab}
        setActiveTab={setActiveTab}
        user={user}
        onOpenAuth={() => setIsAuthOpen(true)}
        onOpenCreateRequest={() => setIsCreateOpen(true)}
        onLogout={handleLogout}
        openRequestsCount={openRequestsCount}
      />

      {/* Hero Stats Ribbon */}
      <HeroBanner stats={stats} />

      {/* Main Dynamic View */}
      <main style={{ flex: 1 }}>
        {activeTab === 'requests' && (
          <BloodRequestsBoard 
            requests={requests}
            onRefresh={() => { fetchRequests(); fetchStats(); }}
            isCreateOpen={isCreateOpen}
            onCloseCreate={() => setIsCreateOpen(false)}
            user={user}
            onOpenAuth={() => setIsAuthOpen(true)}
          />
        )}

        {activeTab === 'donors' && (
          <DonorDiscovery 
            user={user} 
            onOpenAuth={() => setIsAuthOpen(true)} 
          />
        )}

        {activeTab === 'eligibility' && (
          <EligibilityChecker />
        )}

        {activeTab === 'history' && (
          <DonationHistory 
            user={user} 
            onOpenAuth={() => setIsAuthOpen(true)} 
          />
        )}

        {activeTab === 'institutions' && (
          <InstitutionsDirectory />
        )}

        {(activeTab === 'circle' || activeTab === 'referrals') && (
          <TrustedCircleHub 
            user={user} 
            onOpenAuth={() => setIsAuthOpen(true)} 
          />
        )}

        {activeTab === 'admin' && (
          <AdminDashboard />
        )}
      </main>

      {/* Two-Step Verification & Auth Modal */}
      <TwoStepAuthModal 
        isOpen={isAuthOpen}
        onClose={() => setIsAuthOpen(false)}
        onAuthSuccess={(authenticatedUser) => {
          setUser(authenticatedUser);
          fetchRequests();
          fetchStats();
        }}
      />

      {/* Footer */}
      <footer style={{
        marginTop: '60px',
        borderTop: '1px solid var(--border-glass)',
        background: 'rgba(5, 8, 16, 0.95)',
        padding: '36px 24px',
        fontSize: '0.85rem',
        color: 'var(--text-muted)',
      }}>
        <div style={{
          maxWidth: '1400px',
          margin: '0 auto',
          display: 'flex',
          flexWrap: 'wrap',
          alignItems: 'center',
          justifyContent: 'space-between',
          gap: '20px',
        }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
            <div style={{
              width: '32px',
              height: '32px',
              borderRadius: '8px',
              background: 'var(--crimson-primary)',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              color: '#fff',
            }}>
              <Heart size={18} fill="#fff" />
            </div>
            <div>
              <div style={{ fontWeight: 700, color: '#f8fafc' }}>BloodConnect Emergency Transfusion Network</div>
              <div style={{ fontSize: '0.75rem' }}>OWASP-Compliant Dual-Factor Healthcare Identity Protocol</div>
            </div>
          </div>

          <div style={{ display: 'flex', alignItems: 'center', gap: '16px' }}>
            <span style={{ display: 'flex', alignItems: 'center', gap: '6px', color: '#34d399' }}>
              <Shield size={16} /> Keyed HMAC OTP & Argon2id Security
            </span>
            <span>•</span>
            <span>PostgreSQL & PostGIS Relational Layer</span>
            <span>•</span>
            <span style={{ color: '#fda4af' }}>24x7 Lifeline</span>
          </div>
        </div>
      </footer>
    </div>
  );
};
