import React, { useState } from 'react';
import { ShieldCheck, Lock, Eye, AlertTriangle, CheckCircle2 } from 'lucide-react';
import { api } from '../api';

export default function TermsModal({ credential, onAccept }) {
  const [monitoringConsent, setMonitoringConsent] = useState(false);
  const [revocationConsent, setRevocationConsent] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [errorMsg, setErrorMsg] = useState('');

  const allChecked = monitoringConsent && revocationConsent;

  const handleSubmit = async () => {
    if (!allChecked) {
      setErrorMsg('You must check all terms and consent boxes to proceed.');
      return;
    }
    setIsSubmitting(true);
    setErrorMsg('');

    try {
      const data = await api('/terms/accept', {
        method: 'POST',
        body: JSON.stringify({
          user_id: credential.user_id,
          user_role: credential.user_role,
          accepted_version: 'v1.0',
          continuous_monitoring_consent: monitoringConsent,
          revocation_terms_consent: revocationConsent
        })
      });
      onAccept(data);
    } catch (err) {
      setErrorMsg(err.message);
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div style={{
      position: 'fixed', inset: 0, zIndex: 9999,
      background: 'rgba(20,30,48,0.55)', backdropFilter: 'blur(8px)',
      display: 'flex', alignItems: 'center', justifyContent: 'center', padding: '1rem'
    }}>
      <div style={{
        background: '#fff', border: '1px solid #e8ecf0',
        borderRadius: 20, padding: '2.25rem',
        width: '100%', maxWidth: 600,
        boxShadow: '0 20px 60px rgba(0,0,0,0.16)',
        animation: 'modalSlideUp 0.28s cubic-bezier(0.16,1,0.3,1)',
        maxHeight: '90vh', overflowY: 'auto'
      }}>
        <div style={{ textAlign: 'center', marginBottom: '1.5rem' }}>
          <div style={{
            display: 'inline-flex', padding: '1rem',
            background: 'rgba(26,153,117,0.1)', borderRadius: '50%',
            marginBottom: '1rem', border: '1px solid rgba(26,153,117,0.2)'
          }}>
            <ShieldCheck size={36} color="#1a9975" />
          </div>
          <h2 style={{ fontSize: '1.45rem', color: '#1a2332', fontWeight: 800 }}>Terms of Service & Identity Consent</h2>
          <p style={{ color: '#9ca3af', fontSize: '0.88rem', marginTop: '0.35rem' }}>
            Continuous Human Identity Verification System Protocol (v1.0)
          </p>
        </div>

        <div style={{
          background: '#f8f9fb', borderRadius: 12,
          padding: '1.25rem', border: '1px solid #e8ecf0',
          maxHeight: '220px', overflowY: 'auto',
          marginBottom: '1.5rem', fontSize: '0.875rem', lineHeight: '1.6'
        }}>
          <h4 style={{ color: '#1a9975', display: 'flex', alignItems: 'center', gap: '0.5rem', marginBottom: '0.5rem' }}>
            <Lock size={15} /> 1. Data Privacy & Zero-Knowledge Verification
          </h4>
          <p style={{ color: '#4b5563', marginBottom: '1rem' }}>
            Verification documents and identity credentials are encrypted securely.
            <strong style={{ color: '#1a2332' }}> Personal information is protected at rest and in transit.</strong> Access is strictly restricted based on roles.
          </p>

          <h4 style={{ color: '#1a9975', display: 'flex', alignItems: 'center', gap: '0.5rem', marginBottom: '0.5rem' }}>
            <Eye size={15} /> 2. Continuous Session Verification & Trust Scoring
          </h4>
          <p style={{ color: '#4b5563', marginBottom: '1rem' }}>
            During active banking sessions, lightweight signals (interaction rhythm, device signature) are periodically verified to compute a real-time trust score.
          </p>

          <h4 style={{ color: '#1a9975', display: 'flex', alignItems: 'center', gap: '0.5rem', marginBottom: '0.5rem' }}>
            <AlertTriangle size={15} /> 3. Institutional Revocation & Device Loss Policy
          </h4>
          <p style={{ color: '#4b5563' }}>
            Nexus Global Reserve Bank reserves the right to revoke identity credentials if fraud or stolen devices are detected.
          </p>
        </div>

        {errorMsg && (
          <div style={{
            background: '#fef2f2', border: '1px solid #fecaca',
            color: '#b91c1c', padding: '0.75rem',
            borderRadius: '8px', marginBottom: '1.25rem', fontSize: '0.85rem'
          }}>
            {errorMsg}
          </div>
        )}

        <div style={{ display: 'flex', flexDirection: 'column', gap: '0.85rem', marginBottom: '1.75rem' }}>
          <label style={{ display: 'flex', alignItems: 'flex-start', gap: '0.75rem', cursor: 'pointer', fontSize: '0.875rem', color: '#374151' }}>
            <input
              type="checkbox"
              checked={monitoringConsent}
              onChange={(e) => setMonitoringConsent(e.target.checked)}
              style={{ marginTop: '0.2rem', width: '17px', height: '17px', accentColor: '#1a9975' }}
            />
            <span>
              I authorize <strong style={{ color: '#1a2332' }}>Continuous Human Trust Scoring</strong> & step-up verification during active sessions.
            </span>
          </label>

          <label style={{ display: 'flex', alignItems: 'flex-start', gap: '0.75rem', cursor: 'pointer', fontSize: '0.875rem', color: '#374151' }}>
            <input
              type="checkbox"
              checked={revocationConsent}
              onChange={(e) => setRevocationConsent(e.target.checked)}
              style={{ marginTop: '0.2rem', width: '17px', height: '17px', accentColor: '#1a9975' }}
            />
            <span>
              I acknowledge the <strong style={{ color: '#1a2332' }}>Institutional Revocation & Audit Log</strong> guidelines.
            </span>
          </label>
        </div>

        <button
          onClick={handleSubmit}
          disabled={!allChecked || isSubmitting}
          style={{
            width: '100%', padding: '0.75rem',
            background: allChecked ? '#1a9975' : '#d1d5db',
            color: '#fff', border: 'none', borderRadius: 10,
            fontWeight: 700, fontSize: '0.9rem',
            cursor: allChecked ? 'pointer' : 'not-allowed',
            display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '0.5rem',
            boxShadow: allChecked ? '0 4px 14px rgba(26,153,117,0.3)' : 'none',
            transition: 'all 0.18s ease',
          }}
        >
          <CheckCircle2 size={17} />
          {isSubmitting ? 'Recording Consent...' : 'Accept Terms & Activate Banking Wallet'}
        </button>
      </div>
    </div>
  );
}
