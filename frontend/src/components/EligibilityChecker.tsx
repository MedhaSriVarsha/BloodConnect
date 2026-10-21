import React, { useState } from 'react';
import { 
  ClipboardCheck, 
  CheckCircle, 
  AlertCircle, 
  Calendar, 
  Heart, 
  Scale, 
  Activity, 
  Sparkles,
  Info
} from 'lucide-react';
import { api } from '../services/api.js';

export const EligibilityChecker: React.FC = () => {
  const [formData, setFormData] = useState({
    age: 28,
    weightKg: 68,
    hemoglobin: 14.2,
    lastDonationDate: '',
    hasTattooLast6Months: false,
    hasRecentSurgeryOrPiercing: false,
    isPregnantOrLactating: false,
    hasChronicCondition: false,
    isFeelingHealthyToday: true,
  });

  const [loading, setLoading] = useState(false);
  const [result, setResult] = useState<any>(null);

  const handleEvaluate = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    const res = await api.evaluateEligibility(formData);
    setLoading(false);
    if (res.status === 'success' && res.data) {
      setResult(res.data);
    } else {
      alert(res.message || 'Failed to evaluate eligibility');
    }
  };

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
          <Sparkles size={16} />
          Clinical Pre-Screening Protocol
        </div>
        <h1 style={{ fontSize: '2.2rem', fontWeight: 800, marginBottom: '8px' }}>
          Blood Donation Eligibility Calculator
        </h1>
        <p style={{ color: 'var(--text-muted)', maxWidth: '650px', margin: '0 auto', fontSize: '0.95rem' }}>
          Verify your physical eligibility in 60 seconds according to WHO & National Blood Transfusion Council guidelines.
        </p>
      </div>

      <div style={{ display: 'grid', gridTemplateColumns: result ? '1fr 1.2fr' : '1fr', gap: '28px' }}>
        {/* Form Card */}
        <div className="glass-panel" style={{ padding: '28px' }}>
          <h2 style={{ fontSize: '1.25rem', fontWeight: 700, marginBottom: '20px', display: 'flex', alignItems: 'center', gap: '8px' }}>
            <ClipboardCheck size={20} color="var(--crimson-primary)" />
            Health Metrics Questionnaire
          </h2>

          <form onSubmit={handleEvaluate} style={{ display: 'flex', flexDirection: 'column', gap: '18px' }}>
            {/* Age & Weight */}
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '14px' }}>
              <div>
                <label style={{ fontSize: '0.85rem', fontWeight: 600, display: 'flex', alignItems: 'center', gap: '6px', marginBottom: '6px' }}>
                  <Heart size={14} color="var(--crimson-primary)" />
                  Age (Years)
                </label>
                <input 
                  type="number" 
                  min={14} 
                  max={85}
                  value={formData.age}
                  onChange={(e) => setFormData({ ...formData, age: parseInt(e.target.value, 10) || 18 })}
                />
                <span style={{ fontSize: '0.72rem', color: 'var(--text-subtle)' }}>Standard: 18 - 65 yrs</span>
              </div>

              <div>
                <label style={{ fontSize: '0.85rem', fontWeight: 600, display: 'flex', alignItems: 'center', gap: '6px', marginBottom: '6px' }}>
                  <Scale size={14} color="#34d399" />
                  Body Weight (kg)
                </label>
                <input 
                  type="number" 
                  min={30} 
                  max={200}
                  value={formData.weightKg}
                  onChange={(e) => setFormData({ ...formData, weightKg: parseFloat(e.target.value) || 50 })}
                />
                <span style={{ fontSize: '0.72rem', color: 'var(--text-subtle)' }}>Minimum 45 kg</span>
              </div>
            </div>

            {/* Hemoglobin & Last Donation */}
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '14px' }}>
              <div>
                <label style={{ fontSize: '0.85rem', fontWeight: 600, display: 'flex', alignItems: 'center', gap: '6px', marginBottom: '6px' }}>
                  <Activity size={14} color="#60a5fa" />
                  Hemoglobin (g/dL)
                </label>
                <input 
                  type="number" 
                  step="0.1"
                  min={8} 
                  max={20}
                  value={formData.hemoglobin}
                  onChange={(e) => setFormData({ ...formData, hemoglobin: parseFloat(e.target.value) || 12.5 })}
                />
                <span style={{ fontSize: '0.72rem', color: 'var(--text-subtle)' }}>Target: &ge; 12.5 g/dL</span>
              </div>

              <div>
                <label style={{ fontSize: '0.85rem', fontWeight: 600, display: 'flex', alignItems: 'center', gap: '6px', marginBottom: '6px' }}>
                  <Calendar size={14} color="#fbbf24" />
                  Last Donation Date
                </label>
                <input 
                  type="date" 
                  value={formData.lastDonationDate}
                  onChange={(e) => setFormData({ ...formData, lastDonationDate: e.target.value })}
                />
                <span style={{ fontSize: '0.72rem', color: 'var(--text-subtle)' }}>Leave blank if first time</span>
              </div>
            </div>

            {/* Health Toggles */}
            <div style={{ display: 'flex', flexDirection: 'column', gap: '12px', marginTop: '6px', borderTop: '1px solid var(--border-glass)', paddingTop: '16px' }}>
              <label style={{ display: 'flex', alignItems: 'center', gap: '10px', fontSize: '0.88rem', cursor: 'pointer' }}>
                <input 
                  type="checkbox"
                  style={{ width: '18px', height: '18px', accentColor: 'var(--crimson-primary)' }}
                  checked={formData.isFeelingHealthyToday}
                  onChange={(e) => setFormData({ ...formData, isFeelingHealthyToday: e.target.checked })}
                />
                <span>I feel completely well today with no active cold, fever, or illness.</span>
              </label>

              <label style={{ display: 'flex', alignItems: 'center', gap: '10px', fontSize: '0.88rem', cursor: 'pointer' }}>
                <input 
                  type="checkbox"
                  style={{ width: '18px', height: '18px', accentColor: 'var(--crimson-primary)' }}
                  checked={formData.hasTattooLast6Months}
                  onChange={(e) => setFormData({ ...formData, hasTattooLast6Months: e.target.checked })}
                />
                <span>Got a new tattoo, permanent piercing, or acupuncture in the last 6 months.</span>
              </label>

              <label style={{ display: 'flex', alignItems: 'center', gap: '10px', fontSize: '0.88rem', cursor: 'pointer' }}>
                <input 
                  type="checkbox"
                  style={{ width: '18px', height: '18px', accentColor: 'var(--crimson-primary)' }}
                  checked={formData.hasRecentSurgeryOrPiercing}
                  onChange={(e) => setFormData({ ...formData, hasRecentSurgeryOrPiercing: e.target.checked })}
                />
                <span>Underwent major surgery or dental extraction recently.</span>
              </label>

              <label style={{ display: 'flex', alignItems: 'center', gap: '10px', fontSize: '0.88rem', cursor: 'pointer' }}>
                <input 
                  type="checkbox"
                  style={{ width: '18px', height: '18px', accentColor: 'var(--crimson-primary)' }}
                  checked={formData.isPregnantOrLactating}
                  onChange={(e) => setFormData({ ...formData, isPregnantOrLactating: e.target.checked })}
                />
                <span>Currently pregnant or lactating.</span>
              </label>
            </div>

            <button 
              type="submit" 
              className="btn btn-primary"
              disabled={loading}
              style={{ marginTop: '12px', padding: '14px' }}
            >
              <ClipboardCheck size={18} />
              {loading ? 'Evaluating Clinical Parameters...' : 'Check My Eligibility Now'}
            </button>
          </form>
        </div>

        {/* Results Card */}
        {result && (
          <div className="glass-panel" style={{
            padding: '28px',
            border: result.isEligible ? '1px solid rgba(16, 185, 129, 0.4)' : '1px solid rgba(245, 158, 11, 0.4)',
            background: result.isEligible 
              ? 'linear-gradient(180deg, rgba(16, 185, 129, 0.08) 0%, rgba(13, 21, 39, 0.95) 100%)'
              : 'linear-gradient(180deg, rgba(245, 158, 11, 0.08) 0%, rgba(13, 21, 39, 0.95) 100%)',
            display: 'flex',
            flexDirection: 'column',
            justifyContent: 'space-between',
          }}>
            <div>
              {/* Verdict Header */}
              <div style={{ display: 'flex', alignItems: 'center', gap: '14px', marginBottom: '20px' }}>
                <div style={{
                  width: '56px',
                  height: '56px',
                  borderRadius: '16px',
                  background: result.isEligible ? 'rgba(16, 185, 129, 0.2)' : 'rgba(245, 158, 11, 0.2)',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  color: result.isEligible ? '#34d399' : '#fbbf24',
                }}>
                  {result.isEligible ? <CheckCircle size={32} /> : <AlertCircle size={32} />}
                </div>

                <div>
                  <span className={`badge ${result.isEligible ? 'badge-available' : 'badge-urgent'}`}>
                    {result.isEligible ? 'READY TO DONATE' : 'TEMPORARY DEFERRAL'}
                  </span>
                  <h3 style={{ fontSize: '1.4rem', fontWeight: 800, marginTop: '4px' }}>
                    {result.isEligible ? 'You Are Medically Eligible!' : 'Deferral Period Active'}
                  </h3>
                </div>
              </div>

              {/* Reasons if deferred */}
              {!result.isEligible && result.reasons?.length > 0 && (
                <div style={{
                  background: 'rgba(245, 158, 11, 0.1)',
                  border: '1px solid rgba(245, 158, 11, 0.25)',
                  padding: '16px',
                  borderRadius: 'var(--radius-sm)',
                  marginBottom: '20px',
                }}>
                  <div style={{ fontWeight: 700, fontSize: '0.88rem', color: '#fbbf24', marginBottom: '8px' }}>
                    Deferral Reasons:
                  </div>
                  <ul style={{ paddingLeft: '20px', fontSize: '0.85rem', color: 'var(--text-main)', display: 'flex', flexDirection: 'column', gap: '6px' }}>
                    {result.reasons.map((r: string, idx: number) => (
                      <li key={idx}>{r}</li>
                    ))}
                  </ul>
                </div>
              )}

              {/* Metrics Checklist */}
              <div style={{
                display: 'grid',
                gridTemplateColumns: '1fr 1fr',
                gap: '12px',
                marginBottom: '20px',
              }}>
                <div style={{
                  padding: '12px',
                  borderRadius: 'var(--radius-sm)',
                  background: 'rgba(255, 255, 255, 0.03)',
                  border: '1px solid var(--border-glass)',
                }}>
                  <div style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>Age Parameter</div>
                  <div style={{ fontWeight: 700, color: result.metrics.ageOk ? '#34d399' : '#f87171' }}>
                    {result.metrics.ageOk ? '✓ In Range (18-65)' : '✗ Out of Range'}
                  </div>
                </div>

                <div style={{
                  padding: '12px',
                  borderRadius: 'var(--radius-sm)',
                  background: 'rgba(255, 255, 255, 0.03)',
                  border: '1px solid var(--border-glass)',
                }}>
                  <div style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>Body Weight</div>
                  <div style={{ fontWeight: 700, color: result.metrics.weightOk ? '#34d399' : '#f87171' }}>
                    {result.metrics.weightOk ? '✓ Above 45 kg' : '✗ Below 45 kg'}
                  </div>
                </div>

                <div style={{
                  padding: '12px',
                  borderRadius: 'var(--radius-sm)',
                  background: 'rgba(255, 255, 255, 0.03)',
                  border: '1px solid var(--border-glass)',
                }}>
                  <div style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>Recovery Interval</div>
                  <div style={{ fontWeight: 700, color: result.metrics.intervalOk ? '#34d399' : '#fbbf24' }}>
                    {result.metrics.intervalOk ? '✓ &ge; 90 Days Rest' : '⏳ Recovery Needed'}
                  </div>
                </div>

                <div style={{
                  padding: '12px',
                  borderRadius: 'var(--radius-sm)',
                  background: 'rgba(255, 255, 255, 0.03)',
                  border: '1px solid var(--border-glass)',
                }}>
                  <div style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>Infection / Health</div>
                  <div style={{ fontWeight: 700, color: result.metrics.medicalOk ? '#34d399' : '#f87171' }}>
                    {result.metrics.medicalOk ? '✓ Cleared' : '✗ Deferral Required'}
                  </div>
                </div>
              </div>

              {/* Advice Box */}
              {result.advice && (
                <div style={{ display: 'flex', alignItems: 'flex-start', gap: '8px', fontSize: '0.85rem', color: 'var(--text-muted)' }}>
                  <Info size={16} color="var(--blue-accent)" style={{ flexShrink: 0, marginTop: '2px' }} />
                  <div>
                    {result.advice.map((adv: string, idx: number) => (
                      <div key={idx}>{adv}</div>
                    ))}
                  </div>
                </div>
              )}
            </div>

            {/* Next Date Banner */}
            <div style={{
              marginTop: '24px',
              padding: '16px',
              borderRadius: 'var(--radius-md)',
              background: 'rgba(0, 0, 0, 0.4)',
              border: '1px solid var(--border-glass)',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'space-between',
            }}>
              <div>
                <div style={{ fontSize: '0.75rem', color: 'var(--text-subtle)' }}>Next Eligible Donation Date</div>
                <div style={{ fontSize: '1.1rem', fontWeight: 800, color: 'var(--text-main)' }}>
                  {new Date(result.nextEligibleDate).toLocaleDateString(undefined, {
                    day: 'numeric',
                    month: 'long',
                    year: 'numeric'
                  })}
                </div>
              </div>
              <span className="badge badge-blood">
                {result.isEligible ? 'Today Available' : 'Upcoming'}
              </span>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};
