import React, { useState } from 'react';
import { AlertTriangle, CheckCircle2, XCircle } from 'lucide-react';
import { api } from '../api';

export default function StepUpChallenge({ sessionId, onChallengeResolved }) {
  const [challengeType] = useState('liveness_blink');
  const [isVerifying, setIsVerifying] = useState(false);
  const [resultMsg, setResultMsg] = useState(null);
  const [failed, setFailed] = useState(false);

  const handlePerformChallenge = async (pass) => {
    if (!sessionId) {
      setFailed(true);
      setResultMsg('No active session to verify against.');
      return;
    }
    setIsVerifying(true);
    setResultMsg(null);

    try {
      // The outcome comes from the backend, never from the caller's intent. A challenge that
      // resolves itself when the network drops is not a challenge.
      const data = await api('/auth/step-up', {
        method: 'POST',
        body: JSON.stringify({
          session_id: sessionId,
          challenge_type: challengeType,
          challenge_response: pass ? 'SUCCESS' : 'FAILED',
          device_sig: 'DEV-ATTESTED-01'
        })
      });
      setFailed(data.status !== 'success');
      setResultMsg(data.message);
      onChallengeResolved({
        trust_score: data.trust_score,
        risk_level: data.status === 'success' ? 'low' : 'high',
        recommended_action: data.recommended_action,
        reasons: [data.status === 'success' ? 'STEP_UP_CHALLENGE_PASSED' : 'STEP_UP_CHALLENGE_FAILED'],
        latency_ms: 0
      });
    } catch (err) {
      setFailed(true);
      setResultMsg(`Verification could not be completed — ${err.message}`);
    } finally {
      setIsVerifying(false);
    }
  };

  return (
    <div className="glass-panel" style={{ border: '1px solid rgba(245, 158, 11, 0.4)', background: 'rgba(245, 158, 11, 0.05)' }}>
      <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem', marginBottom: '1rem' }}>
        <AlertTriangle size={24} color="#f59e0b" />
        <div>
          <h3 style={{ fontSize: '1.1rem', color: '#fbbf24' }}>Step-Up Verification Required</h3>
          <p style={{ fontSize: '0.825rem', color: 'var(--text-muted)' }}>
            Trust score decayed below high confidence threshold. Complete challenge to continue session.
          </p>
        </div>
      </div>

      <div style={{ background: 'rgba(0,0,0,0.4)', padding: '1rem', borderRadius: '10px', marginBottom: '1.25rem' }}>
        <div style={{ fontSize: '0.85rem', fontWeight: '600', color: '#ffffff', marginBottom: '0.35rem' }}>
          CHALLENGE INSTRUCTION: Authenticate with Safe OTP/SMS Code
        </div>
        <span style={{ fontSize: '0.775rem', color: 'var(--text-muted)' }}>
          This active challenge verifies user session ownership via SMS security verification.
        </span>
      </div>

      {resultMsg && (
        <div style={{
          padding: '0.75rem',
          borderRadius: '8px',
          marginBottom: '1rem',
          fontSize: '0.85rem',
          background: failed ? 'rgba(239, 68, 68, 0.15)' : 'rgba(16, 185, 129, 0.15)',
          color: failed ? '#f87171' : '#34d399'
        }}>
          {resultMsg}
        </div>
      )}

      <div style={{ display: 'flex', gap: '0.75rem' }}>
        <button
          onClick={() => handlePerformChallenge(true)}
          disabled={isVerifying}
          className="btn btn-success"
          style={{ flex: 1, justifyContent: 'center' }}
        >
          <CheckCircle2 size={16} /> Complete Challenge (Pass)
        </button>
        <button
          onClick={() => handlePerformChallenge(false)}
          disabled={isVerifying}
          className="btn btn-secondary"
          style={{ flex: 1, justifyContent: 'center' }}
        >
          <XCircle size={16} /> Fail Challenge (Simulate Proxy)
        </button>
      </div>
    </div>
  );
}
