import React from 'react';
import { ShieldCheck, Activity, Zap, AlertTriangle, AlertOctagon } from 'lucide-react';
import { Empty } from './Shared';

export default function TrustScoreBadge({ trustResult, isConnected }) {
  // No evaluation yet means exactly that. Defaulting to a high score would show an
  // unverified session as trusted, which is the failure this whole system exists to prevent.
  const score = trustResult?.trust_score;
  const riskLevel = trustResult?.risk_level;
  const latency = trustResult?.latency_ms;
  const reasons = trustResult?.reasons ?? [];

  const getScoreColor = () => {
    if (score >= 80) return '#10b981';
    if (score >= 50) return '#f59e0b';
    return '#ef4444';
  };

  const getBadgeClass = () => {
    if (riskLevel === 'low') return 'badge-low';
    if (riskLevel === 'medium') return 'badge-medium';
    return 'badge-high';
  };

  return (
    <div className="glass-panel" style={{ textAlign: 'center' }}>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1rem' }}>
        <h3 style={{ fontSize: '1.1rem', display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
          <Activity size={18} color="#06b6d4" /> Live Session Trust Engine
        </h3>
        <span style={{ fontSize: '0.75rem', color: isConnected ? '#10b981' : '#f59e0b', display: 'flex', alignItems: 'center', gap: '0.35rem' }}>
          <span style={{
            width: '8px',
            height: '8px',
            borderRadius: '50%',
            background: isConnected ? '#10b981' : '#f59e0b',
            display: 'inline-block'
          }}></span>
          {isConnected ? 'WebSocket Active' : 'Polling Sync'}
        </span>
      </div>

      {trustResult ? (
        <>
      <div className="score-circle" style={{ borderColor: getScoreColor() }}>
        <span className="mono-font" style={{ fontSize: '2.2rem', fontWeight: '800', color: '#ffffff' }}>
          {score}%
        </span>
        <span style={{ fontSize: '0.7rem', color: 'var(--text-muted)', marginTop: '-4px' }}>TRUST SCORE</span>
      </div>

      <div style={{ marginTop: '1rem' }}>
        <span className={`badge ${getBadgeClass()}`} style={{ fontSize: '0.85rem' }}>
          {riskLevel === 'low' && <ShieldCheck size={14} />}
          {riskLevel === 'medium' && <AlertTriangle size={14} />}
          {riskLevel === 'high' && <AlertOctagon size={14} />}
          {riskLevel.toUpperCase()} RISK STATE
        </span>
      </div>

      <div style={{
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        gap: '0.4rem',
        marginTop: '0.75rem',
        fontSize: '0.775rem',
        color: '#06b6d4',
        background: 'rgba(6, 182, 212, 0.08)',
        padding: '0.4rem 0.75rem',
        borderRadius: '20px',
        width: 'fit-content',
        margin: '0.75rem auto 0 auto'
      }}>
        <Zap size={13} />
        <span>Execution Latency: <strong>{latency} ms</strong> (Target: &lt;50ms)</span>
      </div>

      <div style={{ marginTop: '1rem', textAlign: 'left', background: 'rgba(0,0,0,0.3)', padding: '0.75rem', borderRadius: '10px' }}>
        <span style={{ fontSize: '0.75rem', color: 'var(--text-muted)', display: 'block', marginBottom: '0.35rem' }}>TRUST REASON CODES</span>
        <div style={{ display: 'flex', flexWrap: 'wrap', gap: '0.35rem' }}>
          {reasons.map((r, i) => (
            <span key={i} className="mono-font" style={{
              fontSize: '0.7rem',
              background: 'rgba(255,255,255,0.06)',
              padding: '0.2rem 0.5rem',
              borderRadius: '6px',
              color: '#d1d5db'
            }}>
              {r}
            </span>
          ))}
        </div>
      </div>
        </>
      ) : (
        <Empty message="No trust evaluation yet — signals stream once the camera is running and the session websocket is connected." />
      )}
    </div>
  );
}
