import React, { useState, useEffect } from 'react';
import { 
  ShieldCheck, 
  Users, 
  Activity, 
  FileText, 
  AlertTriangle, 
  CheckCircle, 
  Ban, 
  Clock, 
  Search,
  Lock,
  Mail,
  Server,
  Send,
  Sparkles,
  RefreshCw,
  Key
} from 'lucide-react';
import { api } from '../services/api.js';

export const AdminDashboard: React.FC = () => {
  const [summary, setSummary] = useState<any>(null);
  const [donors, setDonors] = useState<any[]>([]);
  const [auditLogs, setAuditLogs] = useState<any[]>([]);
  const [devDispatches, setDevDispatches] = useState<any[]>([]);
  const [smtpConfig, setSmtpConfig] = useState<any>(null);
  const [activeAdminTab, setActiveAdminTab] = useState<'OVERVIEW' | 'DONORS' | 'AUDIT' | 'DISPATCHES' | 'SMTP_USERS'>('OVERVIEW');
  const [loading, setLoading] = useState(true);

  // 3 Target Mails state
  const [targetEmailsList, setTargetEmailsList] = useState<string[]>([
    'varshavegi009@gmail.com',
    '',
    ''
  ]);
  const [savingEmails, setSavingEmails] = useState(false);
  const [testResult, setTestResult] = useState<any>(null);
  const [testingOtp, setTestingOtp] = useState(false);

  // SMTP User Slot editing state
  const [editingSlot, setEditingSlot] = useState<number | null>(null);
  const [slotFormData, setSlotFormData] = useState({
    user: '',
    pass: '',
    host: 'smtp.gmail.com',
    port: 587,
    fromName: '',
  });
  const [savingSlot, setSavingSlot] = useState(false);

  const fetchAdminData = async () => {
    setLoading(true);
    const [dashRes, donorsRes, auditRes, dispRes, smtpRes] = await Promise.all([
      api.getAdminDashboard(),
      api.getAdminDonors(),
      api.getAuditLogs(),
      api.getDevDispatches(),
      api.getSmtpConfig(),
    ]);
    setLoading(false);

    if (dashRes.status === 'success' && dashRes.data) setSummary(dashRes.data);
    if (donorsRes.status === 'success' && donorsRes.data) setDonors(donorsRes.data);
    if (auditRes.status === 'success' && auditRes.data) setAuditLogs(auditRes.data);
    if (dispRes.status === 'success' && dispRes.data) setDevDispatches(dispRes.data);
    if (smtpRes.status === 'success' && smtpRes.data) {
      setSmtpConfig(smtpRes.data);
      if (smtpRes.data.targetEmails?.length > 0) {
        setTargetEmailsList([
          smtpRes.data.targetEmails[0] || '',
          smtpRes.data.targetEmails[1] || '',
          smtpRes.data.targetEmails[2] || '',
        ]);
      }
    }
  };

  useEffect(() => {
    fetchAdminData();
  }, []);

  const handleUpdateStatus = async (userId: string, newStatus: string) => {
    const reason = prompt(`Enter administrative rationale for changing status to ${newStatus}:`);
    if (reason === null) return;

    const res = await api.updateUserStatus(userId, newStatus, reason);
    if (res.status === 'success') {
      fetchAdminData();
    } else {
      alert(res.message || 'Status update failed.');
    }
  };

  const handleSaveTargetEmails = async (e: React.FormEvent) => {
    e.preventDefault();
    setSavingEmails(true);
    const res = await api.updateTargetEmails(targetEmailsList);
    setSavingEmails(false);

    if (res.status === 'success') {
      alert('Target 3 emails updated successfully.');
      fetchAdminData();
    } else {
      alert(res.message || 'Failed to update target emails.');
    }
  };

  const handleTest3MailsOtp = async () => {
    setTestingOtp(true);
    setTestResult(null);
    const res = await api.test3MailsOtp(targetEmailsList[0]);
    setTestingOtp(false);

    if (res.status === 'success') {
      setTestResult(res.data);
    } else {
      alert(res.message || 'Failed to dispatch test OTP.');
    }
  };

  const handleOpenEditSlot = (index: number) => {
    const userConfig = smtpConfig?.smtpUsers?.[index];
    setEditingSlot(index);
    setSlotFormData({
      user: userConfig?.user || '',
      pass: '',
      host: userConfig?.host || 'smtp.gmail.com',
      port: userConfig?.port || 587,
      fromName: userConfig?.fromName || '',
    });
  };

  const handleSaveSlot = async (e: React.FormEvent) => {
    e.preventDefault();
    if (editingSlot === null) return;

    setSavingSlot(true);
    const res = await api.updateSmtpUser({
      slotIndex: editingSlot,
      ...slotFormData,
    });
    setSavingSlot(false);

    if (res.status === 'success') {
      setEditingSlot(null);
      fetchAdminData();
      alert(`SMTP User ${editingSlot + 1} updated and active in pool.`);
    } else {
      alert(res.message || 'Failed to update SMTP user.');
    }
  };

  return (
    <div style={{ maxWidth: '1400px', margin: '32px auto', padding: '0 24px' }}>
      {/* Admin Header */}
      <div style={{
        display: 'flex',
        flexWrap: 'wrap',
        alignItems: 'center',
        justifyContent: 'space-between',
        gap: '20px',
        marginBottom: '28px',
      }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '14px' }}>
          <div style={{
            width: '48px',
            height: '48px',
            borderRadius: '14px',
            background: 'linear-gradient(135deg, #e11d48 0%, #be123c 100%)',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            color: '#fff',
            boxShadow: '0 4px 15px var(--crimson-glow)',
          }}>
            <ShieldCheck size={26} />
          </div>
          <div>
            <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
              <h1 style={{ fontSize: '1.8rem', fontWeight: 800 }}>Admin Mission Control</h1>
              <span className="badge badge-critical" style={{ fontSize: '0.7rem' }}>
                PRIVILEGED RBAC
              </span>
            </div>
            <p style={{ color: 'var(--text-muted)', fontSize: '0.85rem' }}>
              Central oversight of healthcare requests, verified donor registries, and security audit trails.
            </p>
          </div>
        </div>

        {/* Sub-tabs */}
        <div style={{ display: 'flex', flexWrap: 'wrap', gap: '8px' }}>
          <button 
            className={`btn ${activeAdminTab === 'OVERVIEW' ? 'btn-primary' : 'btn-secondary'}`}
            onClick={() => setActiveAdminTab('OVERVIEW')}
            style={{ padding: '8px 14px', fontSize: '0.85rem' }}
          >
            Overview
          </button>
          <button 
            className={`btn ${activeAdminTab === 'DONORS' ? 'btn-primary' : 'btn-secondary'}`}
            onClick={() => setActiveAdminTab('DONORS')}
            style={{ padding: '8px 14px', fontSize: '0.85rem' }}
          >
            Donor Management
          </button>
          <button 
            className={`btn ${activeAdminTab === 'SMTP_USERS' ? 'btn-primary' : 'btn-secondary'}`}
            onClick={() => setActiveAdminTab('SMTP_USERS')}
            style={{ padding: '8px 14px', fontSize: '0.85rem', borderColor: 'var(--crimson-primary)' }}
          >
            <Mail size={15} color="#fda4af" />
            3 Mails & Multi-SMTP Pool
          </button>
          <button 
            className={`btn ${activeAdminTab === 'AUDIT' ? 'btn-primary' : 'btn-secondary'}`}
            onClick={() => setActiveAdminTab('AUDIT')}
            style={{ padding: '8px 14px', fontSize: '0.85rem' }}
          >
            Audit Log Trail
          </button>
          <button 
            className={`btn ${activeAdminTab === 'DISPATCHES' ? 'btn-primary' : 'btn-secondary'}`}
            onClick={() => setActiveAdminTab('DISPATCHES')}
            style={{ padding: '8px 14px', fontSize: '0.85rem' }}
          >
            OTP Dispatches Feed
          </button>
        </div>
      </div>

      {/* TAB: 3 MAILS & MULTI-SMTP USERS POOL */}
      {activeAdminTab === 'SMTP_USERS' && (
        <div style={{ display: 'flex', flexDirection: 'column', gap: '28px' }}>
          {/* Section 1: Target 3 Emails for Simultaneous OTP Dispatch */}
          <div className="glass-panel" style={{
            padding: '28px',
            background: 'linear-gradient(135deg, rgba(225, 29, 72, 0.12) 0%, rgba(13, 21, 39, 0.9) 100%)',
            border: '1px solid rgba(225, 29, 72, 0.35)',
          }}>
            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', flexWrap: 'wrap', gap: '16px', marginBottom: '20px' }}>
              <div>
                <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                  <Mail size={22} color="var(--crimson-primary)" />
                  <h2 style={{ fontSize: '1.35rem', fontWeight: 800 }}>Simultaneous 3-Email OTP Dispatch</h2>
                </div>
                <p style={{ color: 'var(--text-muted)', fontSize: '0.85rem', marginTop: '4px' }}>
                  Configure up to 3 email inboxes to receive every verification OTP and emergency alert simultaneously.
                </p>
              </div>

              <button 
                type="button"
                className="btn btn-urgent"
                disabled={testingOtp}
                onClick={handleTest3MailsOtp}
              >
                <Send size={16} />
                {testingOtp ? 'Dispatching to 3 Mails...' : 'Test Send OTP to 3 Mails Now'}
              </button>
            </div>

            <form onSubmit={handleSaveTargetEmails} style={{ display: 'flex', flexDirection: 'column', gap: '14px' }}>
              <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(280px, 1fr))', gap: '14px' }}>
                <div>
                  <label style={{ fontSize: '0.85rem', fontWeight: 700, display: 'block', marginBottom: '4px', color: '#fda4af' }}>
                    Target Email 1 (Primary) *
                  </label>
                  <input 
                    type="email" 
                    required
                    placeholder="e.g. varshavegi009@gmail.com"
                    value={targetEmailsList[0]}
                    onChange={(e) => {
                      const updated = [...targetEmailsList];
                      updated[0] = e.target.value;
                      setTargetEmailsList(updated);
                    }}
                  />
                </div>

                <div>
                  <label style={{ fontSize: '0.85rem', fontWeight: 700, display: 'block', marginBottom: '4px', color: '#fda4af' }}>
                    Target Email 2 (Secondary Team / Mirror)
                  </label>
                  <input 
                    type="email" 
                    placeholder="e.g. backup.donor@example.com"
                    value={targetEmailsList[1]}
                    onChange={(e) => {
                      const updated = [...targetEmailsList];
                      updated[1] = e.target.value;
                      setTargetEmailsList(updated);
                    }}
                  />
                </div>

                <div>
                  <label style={{ fontSize: '0.85rem', fontWeight: 700, display: 'block', marginBottom: '4px', color: '#fda4af' }}>
                    Target Email 3 (Emergency Monitor)
                  </label>
                  <input 
                    type="email" 
                    placeholder="e.g. admin.bloodconnect@gmail.com"
                    value={targetEmailsList[2]}
                    onChange={(e) => {
                      const updated = [...targetEmailsList];
                      updated[2] = e.target.value;
                      setTargetEmailsList(updated);
                    }}
                  />
                </div>
              </div>

              <div style={{ display: 'flex', justifyContent: 'flex-start', marginTop: '6px' }}>
                <button 
                  type="submit" 
                  disabled={savingEmails}
                  className="btn btn-primary"
                  style={{ padding: '8px 20px', fontSize: '0.88rem' }}
                >
                  {savingEmails ? 'Saving...' : 'Save 3 Target Emails'}
                </button>
              </div>
            </form>

            {/* Test Result Live Feed */}
            {testResult && (
              <div style={{
                marginTop: '20px',
                padding: '16px 20px',
                borderRadius: 'var(--radius-sm)',
                background: 'rgba(0, 0, 0, 0.45)',
                border: '1px solid var(--border-glass)',
              }}>
                <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '10px' }}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '8px', color: '#34d399', fontWeight: 700 }}>
                    <CheckCircle size={18} />
                    <span>OTP Broadcasted to {testResult.recipients?.length || 1} Email(s)</span>
                  </div>
                  <div style={{
                    background: 'var(--crimson-primary)',
                    color: '#fff',
                    padding: '3px 10px',
                    borderRadius: '6px',
                    fontFamily: 'monospace',
                    fontWeight: 800,
                  }}>
                    OTP: {testResult.otpGenerated || testResult.devOtpHint}
                  </div>
                </div>

                <div style={{ fontSize: '0.82rem', color: 'var(--text-muted)' }}>
                  <div><strong>Delivered To:</strong> {testResult.recipients?.join(', ')}</div>
                  <div><strong>Provider / SMTP Used:</strong> {testResult.providerUsed} {testResult.smtpUserUsed ? `(${testResult.smtpUserUsed})` : ''}</div>
                  {testResult.error && (
                    <div style={{ color: '#fca5a5', marginTop: '4px' }}>
                      ⚠️ Notice: {testResult.error}
                    </div>
                  )}
                </div>
              </div>
            )}
          </div>

          {/* Section 2: Three (3) SMTP Users Pool */}
          <div className="glass-panel" style={{ padding: '28px' }}>
            <div style={{ marginBottom: '20px' }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                <Server size={22} color="var(--crimson-primary)" />
                <h2 style={{ fontSize: '1.35rem', fontWeight: 800 }}>Three (3) SMTP Users Pool & Failover</h2>
              </div>
              <p style={{ color: 'var(--text-muted)', fontSize: '0.85rem', marginTop: '4px' }}>
                Create and manage 3 distinct SMTP user accounts for authentication, emergency circle alerts, and administrative records. If one reaches rate limits or fails, BloodConnect automatically rotates to the next available SMTP user.
              </p>
            </div>

            {/* 3 SMTP Cards Grid */}
            <div style={{
              display: 'grid',
              gridTemplateColumns: 'repeat(auto-fit, minmax(360px, 1fr))',
              gap: '20px',
            }}>
              {smtpConfig?.smtpUsers?.map((smtp: any, index: number) => {
                const isConfigured = smtp.isConfigured;

                return (
                  <div 
                    key={smtp.id}
                    className="glass-panel"
                    style={{
                      padding: '24px',
                      background: 'rgba(255, 255, 255, 0.03)',
                      border: isConfigured ? '1px solid rgba(16, 185, 129, 0.4)' : '1px solid var(--border-glass)',
                      display: 'flex',
                      flexDirection: 'column',
                      justifyContent: 'space-between',
                    }}
                  >
                    <div>
                      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '14px' }}>
                        <span style={{ fontSize: '0.8rem', fontWeight: 800, color: 'var(--text-muted)' }}>
                          SLOT {index + 1}
                        </span>
                        <span className={`badge ${isConfigured ? 'badge-available' : 'badge-urgent'}`}>
                          {isConfigured ? 'CONFIGURED' : 'PENDING CREDENTIALS'}
                        </span>
                      </div>

                      <h3 style={{ fontSize: '1.15rem', fontWeight: 700, marginBottom: '8px' }}>
                        {smtp.label}
                      </h3>

                      <div style={{
                        background: 'rgba(0, 0, 0, 0.3)',
                        padding: '12px',
                        borderRadius: 'var(--radius-sm)',
                        fontSize: '0.82rem',
                        display: 'flex',
                        flexDirection: 'column',
                        gap: '6px',
                        marginBottom: '18px',
                      }}>
                        <div>
                          <span style={{ color: 'var(--text-subtle)' }}>User / Email: </span>
                          <strong style={{ color: smtp.user ? 'var(--text-main)' : 'var(--text-subtle)' }}>
                            {smtp.user || 'Not set yet'}
                          </strong>
                        </div>
                        <div>
                          <span style={{ color: 'var(--text-subtle)' }}>Host & Port: </span>
                          <span>{smtp.host}:{smtp.port}</span>
                        </div>
                        <div>
                          <span style={{ color: 'var(--text-subtle)' }}>Sender Name: </span>
                          <span>{smtp.fromName}</span>
                        </div>
                      </div>
                    </div>

                    <button 
                      className="btn btn-secondary"
                      onClick={() => handleOpenEditSlot(index)}
                      style={{ width: '100%' }}
                    >
                      <Key size={15} />
                      {isConfigured ? `Update SMTP User ${index + 1}` : `Configure SMTP User ${index + 1}`}
                    </button>
                  </div>
                );
              })}
            </div>
          </div>
        </div>
      )}

      {/* EDIT SMTP USER MODAL */}
      {editingSlot !== null && (
        <div className="modal-overlay">
          <div className="modal-content" style={{ maxWidth: '520px' }}>
            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '20px' }}>
              <div>
                <h3 style={{ fontSize: '1.3rem', fontWeight: 800 }}>Configure SMTP User {editingSlot + 1}</h3>
                <p style={{ fontSize: '0.82rem', color: 'var(--text-muted)' }}>
                  Enter Gmail / Outlook / Custom SMTP credentials for slot {editingSlot + 1}
                </p>
              </div>
              <button 
                onClick={() => setEditingSlot(null)}
                style={{ background: 'none', border: 'none', color: 'var(--text-muted)', cursor: 'pointer' }}
              >
                ✕
              </button>
            </div>

            <form onSubmit={handleSaveSlot} style={{ display: 'flex', flexDirection: 'column', gap: '14px' }}>
              <div>
                <label style={{ fontSize: '0.85rem', fontWeight: 600, display: 'block', marginBottom: '4px' }}>
                  SMTP User (Email Address) *
                </label>
                <input 
                  type="email" 
                  required
                  placeholder="e.g. bloodconnect.sender@gmail.com"
                  value={slotFormData.user}
                  onChange={(e) => setSlotFormData({ ...slotFormData, user: e.target.value })}
                />
              </div>

              <div>
                <label style={{ fontSize: '0.85rem', fontWeight: 600, display: 'block', marginBottom: '4px' }}>
                  SMTP Password (Google App Password) *
                </label>
                <input 
                  type="password" 
                  required
                  placeholder="16-character Google App Password"
                  value={slotFormData.pass}
                  onChange={(e) => setSlotFormData({ ...slotFormData, pass: e.target.value })}
                />
                <span style={{ fontSize: '0.75rem', color: 'var(--text-subtle)', marginTop: '2px', display: 'block' }}>
                  Generate from myaccount.google.com/apppasswords
                </span>
              </div>

              <div style={{ display: 'grid', gridTemplateColumns: '2fr 1fr', gap: '10px' }}>
                <div>
                  <label style={{ fontSize: '0.85rem', fontWeight: 600, display: 'block', marginBottom: '4px' }}>
                    SMTP Host *
                  </label>
                  <input 
                    type="text" 
                    required
                    value={slotFormData.host}
                    onChange={(e) => setSlotFormData({ ...slotFormData, host: e.target.value })}
                  />
                </div>

                <div>
                  <label style={{ fontSize: '0.85rem', fontWeight: 600, display: 'block', marginBottom: '4px' }}>
                    Port *
                  </label>
                  <input 
                    type="number" 
                    required
                    value={slotFormData.port}
                    onChange={(e) => setSlotFormData({ ...slotFormData, port: parseInt(e.target.value, 10) || 587 })}
                  />
                </div>
              </div>

              <div>
                <label style={{ fontSize: '0.85rem', fontWeight: 600, display: 'block', marginBottom: '4px' }}>
                  Sender Display Name
                </label>
                <input 
                  type="text" 
                  placeholder="e.g. BloodConnect Security <auth@bloodconnect.org>"
                  value={slotFormData.fromName}
                  onChange={(e) => setSlotFormData({ ...slotFormData, fromName: e.target.value })}
                />
              </div>

              <div style={{ display: 'flex', gap: '10px', marginTop: '10px' }}>
                <button 
                  type="button" 
                  onClick={() => setEditingSlot(null)}
                  className="btn btn-secondary"
                  style={{ flex: 1 }}
                >
                  Cancel
                </button>
                <button 
                  type="submit" 
                  disabled={savingSlot}
                  className="btn btn-primary"
                  style={{ flex: 2 }}
                >
                  {savingSlot ? 'Validating & Saving...' : `Save SMTP User ${editingSlot + 1}`}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* TAB 1: OVERVIEW */}
      {activeAdminTab === 'OVERVIEW' && summary && (
        <div>
          {/* KPI Cards */}
          <div style={{
            display: 'grid',
            gridTemplateColumns: 'repeat(auto-fit, minmax(220px, 1fr))',
            gap: '16px',
            marginBottom: '28px',
          }}>
            <div className="glass-panel" style={{ padding: '20px' }}>
              <span style={{ fontSize: '0.82rem', color: 'var(--text-muted)' }}>Total Registered Donors</span>
              <div style={{ fontSize: '1.8rem', fontWeight: 800, marginTop: '6px' }}>
                {summary.metrics.totalDonors}
              </div>
              <span style={{ fontSize: '0.75rem', color: '#34d399' }}>{summary.metrics.availableDonors} Available Now</span>
            </div>

            <div className="glass-panel" style={{ padding: '20px' }}>
              <span style={{ fontSize: '0.82rem', color: 'var(--text-muted)' }}>Emergency Blood Calls</span>
              <div style={{ fontSize: '1.8rem', fontWeight: 800, color: '#f87171', marginTop: '6px' }}>
                {summary.metrics.openRequests}
              </div>
              <span style={{ fontSize: '0.75rem', color: '#fda4af' }}>{summary.metrics.criticalRequests} Critical Priority</span>
            </div>

            <div className="glass-panel" style={{ padding: '20px' }}>
              <span style={{ fontSize: '0.82rem', color: 'var(--text-muted)' }}>Completed Transfusions</span>
              <div style={{ fontSize: '1.8rem', fontWeight: 800, color: '#34d399', marginTop: '6px' }}>
                {summary.metrics.totalDonations}
              </div>
              <span style={{ fontSize: '0.75rem', color: 'var(--text-subtle)' }}>Certified Donations</span>
            </div>

            <div className="glass-panel" style={{ padding: '20px' }}>
              <span style={{ fontSize: '0.82rem', color: 'var(--text-muted)' }}>Estimated Lives Saved</span>
              <div style={{ fontSize: '1.8rem', fontWeight: 800, color: '#fbbf24', marginTop: '6px' }}>
                {summary.metrics.livesSavedEstimate}
              </div>
              <span style={{ fontSize: '0.75rem', color: 'var(--text-subtle)' }}>Across Partner Hospitals</span>
            </div>
          </div>

          {/* Blood Group Distribution & Recent Audit */}
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '24px' }}>
            {/* Distribution */}
            <div className="glass-panel" style={{ padding: '24px' }}>
              <h3 style={{ fontSize: '1.15rem', fontWeight: 700, marginBottom: '16px' }}>
                Blood Group Inventory Distribution
              </h3>
              <div style={{ display: 'flex', flexDirection: 'column', gap: '10px' }}>
                {summary.bloodGroupDistribution && Object.entries(summary.bloodGroupDistribution).map(([bg, count]: any) => (
                  <div key={bg} style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                    <span style={{ fontSize: '0.88rem', fontWeight: 600 }}>{bg.replace('_', ' ')}</span>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '10px', flex: 1, maxWidth: '240px', marginLeft: '16px' }}>
                      <div style={{ flex: 1, height: '8px', background: 'rgba(255, 255, 255, 0.08)', borderRadius: '4px', overflow: 'hidden' }}>
                        <div style={{ width: `${Math.min(100, count * 35)}%`, height: '100%', background: 'var(--crimson-primary)' }} />
                      </div>
                      <span style={{ fontSize: '0.82rem', fontWeight: 700, minWidth: '24px' }}>{count}</span>
                    </div>
                  </div>
                ))}
              </div>
            </div>

            {/* Recent Audit Snip */}
            <div className="glass-panel" style={{ padding: '24px' }}>
              <h3 style={{ fontSize: '1.15rem', fontWeight: 700, marginBottom: '16px' }}>
                Security Audit Log Stream
              </h3>
              <div style={{ display: 'flex', flexDirection: 'column', gap: '10px' }}>
                {summary.recentAuditLogs?.map((log: any) => (
                  <div 
                    key={log.id} 
                    style={{
                      padding: '10px 14px',
                      borderRadius: 'var(--radius-sm)',
                      background: 'rgba(0, 0, 0, 0.25)',
                      border: '1px solid var(--border-glass)',
                      fontSize: '0.82rem',
                    }}
                  >
                    <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '2px' }}>
                      <strong style={{ color: 'var(--crimson-light)' }}>{log.action}</strong>
                      <span style={{ color: 'var(--text-subtle)', fontSize: '0.72rem' }}>
                        {new Date(log.createdAt).toLocaleTimeString()}
                      </span>
                    </div>
                    <div style={{ color: 'var(--text-muted)' }}>
                      Resource: {log.resourceType} {log.resourceId ? `(#${log.resourceId})` : ''}
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>
      )}

      {/* TAB 2: DONORS MANAGEMENT */}
      {activeAdminTab === 'DONORS' && (
        <div className="glass-panel" style={{ padding: '24px' }}>
          <h2 style={{ fontSize: '1.25rem', fontWeight: 800, marginBottom: '18px' }}>
            Registered Donors & Account Status
          </h2>
          <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
            {donors.map(d => (
              <div 
                key={d.id}
                style={{
                  display: 'flex',
                  flexWrap: 'wrap',
                  alignItems: 'center',
                  justifyContent: 'space-between',
                  padding: '16px',
                  borderRadius: 'var(--radius-sm)',
                  background: 'rgba(255, 255, 255, 0.03)',
                  border: '1px solid var(--border-glass)',
                  gap: '12px',
                }}
              >
                <div>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                    <h3 style={{ fontSize: '1.05rem', fontWeight: 700 }}>{d.user?.fullName}</h3>
                    <span className="badge badge-blood">{d.bloodGroup.replace('_', ' ')}</span>
                    <span className={`badge ${d.user?.status === 'ACTIVE' ? 'badge-available' : 'badge-critical'}`}>
                      {d.user?.status}
                    </span>
                  </div>
                  <div style={{ fontSize: '0.82rem', color: 'var(--text-muted)', marginTop: '4px' }}>
                    Email: {d.user?.email} | Phone: {d.user?.phone} | City: {d.city}
                  </div>
                </div>

                <div style={{ display: 'flex', gap: '8px' }}>
                  {d.user?.status === 'ACTIVE' ? (
                    <button 
                      className="btn btn-secondary"
                      onClick={() => handleUpdateStatus(d.user.id, 'SUSPENDED')}
                      style={{ padding: '6px 12px', fontSize: '0.82rem', color: '#f87171' }}
                    >
                      <Ban size={14} />
                      Suspend Account
                    </button>
                  ) : (
                    <button 
                      className="btn btn-secondary"
                      onClick={() => handleUpdateStatus(d.user.id, 'ACTIVE')}
                      style={{ padding: '6px 12px', fontSize: '0.82rem', color: '#34d399' }}
                    >
                      <CheckCircle size={14} />
                      Reactivate
                    </button>
                  )}
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* TAB 3: AUDIT TRAIL */}
      {activeAdminTab === 'AUDIT' && (
        <div className="glass-panel" style={{ padding: '24px' }}>
          <h2 style={{ fontSize: '1.25rem', fontWeight: 800, marginBottom: '18px' }}>
            Complete System Audit Log Trail
          </h2>
          <div style={{ display: 'flex', flexDirection: 'column', gap: '10px' }}>
            {auditLogs.map(log => (
              <div 
                key={log.id}
                style={{
                  padding: '12px 16px',
                  borderRadius: 'var(--radius-sm)',
                  background: 'rgba(0, 0, 0, 0.25)',
                  border: '1px solid var(--border-glass)',
                  display: 'flex',
                  justifyContent: 'space-between',
                  alignItems: 'center',
                }}
              >
                <div>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                    <strong style={{ color: '#fda4af' }}>{log.action}</strong>
                    <span style={{ fontSize: '0.78rem', color: 'var(--text-subtle)' }}>
                      by Actor: {log.actorId || 'SYSTEM'}
                    </span>
                  </div>
                  <div style={{ fontSize: '0.8rem', color: 'var(--text-muted)', marginTop: '2px' }}>
                    Target: {log.resourceType} {log.resourceId ? `(${log.resourceId})` : ''} | IP: {log.ipAddress || '127.0.0.1'}
                  </div>
                </div>
                <div style={{ fontSize: '0.75rem', color: 'var(--text-subtle)' }}>
                  {new Date(log.createdAt).toLocaleString()}
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* TAB 4: DISPATCHES FEED */}
      {activeAdminTab === 'DISPATCHES' && (
        <div className="glass-panel" style={{ padding: '24px' }}>
          <h2 style={{ fontSize: '1.25rem', fontWeight: 800, marginBottom: '8px' }}>
            Real-Time SMS & Email Dispatches
          </h2>
          <p style={{ fontSize: '0.85rem', color: 'var(--text-muted)', marginBottom: '18px' }}>
            Live event bus monitoring outbound OTP verification challenges and emergency alerts.
          </p>
          <div style={{ display: 'flex', flexDirection: 'column', gap: '10px' }}>
            {devDispatches.map((disp, i) => (
              <div 
                key={i}
                style={{
                  padding: '12px 16px',
                  borderRadius: 'var(--radius-sm)',
                  background: 'rgba(255, 255, 255, 0.03)',
                  border: '1px solid var(--border-glass)',
                  display: 'flex',
                  justifyContent: 'space-between',
                  alignItems: 'center',
                }}
              >
                <div>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                    <span className={`badge ${disp.channel === 'SMS' ? 'badge-available' : 'badge-normal'}`}>
                      {disp.channel}
                    </span>
                    <strong>{disp.destination}</strong>
                  </div>
                  <div style={{ fontSize: '0.78rem', color: 'var(--text-muted)', marginTop: '2px' }}>
                    Message ID: {disp.messageId} | Provider: {disp.providerUsed || 'SMTP/Fast2SMS'}
                  </div>
                </div>

                {disp.devOtpHint && (
                  <div style={{
                    background: 'rgba(225, 29, 72, 0.2)',
                    border: '1px solid var(--crimson-primary)',
                    padding: '4px 10px',
                    borderRadius: '6px',
                    fontFamily: 'monospace',
                    fontWeight: 800,
                    color: '#fda4af',
                  }}>
                    OTP: {disp.devOtpHint}
                  </div>
                )}
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
};
