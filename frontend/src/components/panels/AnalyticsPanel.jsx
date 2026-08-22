import React from 'react';
import { BarChart2 } from 'lucide-react';
import { useOverview, scoreColor } from '../../api';
import { PanelHeader, StatGrid, ErrorNote, Empty } from '../Shared';

// Everything here is computed from trust evaluations already in the audit trail.
// ponytail: history is bounded by audit-log retention; add a time-series store when
// you need trends older than the log keeps.
function analyse(data) {
  const events = data?.trust_events ?? [];
  const outcomes = {};
  for (const e of events) outcomes[e.result] = (outcomes[e.result] || 0) + 1;

  const reasons = {};
  for (const e of events) {
    for (const r of e.reason_code.split(',').map((s) => s.trim()).filter(Boolean)) {
      reasons[r] = (reasons[r] || 0) + 1;
    }
  }

  const buckets = [
    { label: '0–24', min: 0, max: 25, n: 0 },
    { label: '25–49', min: 25, max: 50, n: 0 },
    { label: '50–79', min: 50, max: 80, n: 0 },
    { label: '80–100', min: 80, max: 101, n: 0 },
  ];
  for (const s of data?.sessions ?? []) {
    const b = buckets.find((b) => s.last_trust_score >= b.min && s.last_trust_score < b.max);
    if (b) b.n++;
  }

  return {
    events,
    outcomes,
    buckets,
    topReasons: Object.entries(reasons).sort((a, b) => b[1] - a[1]).slice(0, 8),
  };
}

export default function AnalyticsPanel() {
  const { data, error } = useOverview();
  const { events, outcomes, buckets, topReasons } = analyse(data);
  const maxBucket = Math.max(1, ...buckets.map((b) => b.n));

  return (
    <div>
      <ErrorNote error={error} />

      <StatGrid stats={[
        { label: 'Evaluations', value: events.length, color: '#06b6d4' },
        { label: 'Allowed', value: outcomes.ALLOW ?? 0, color: '#10b981' },
        { label: 'Step-Up', value: outcomes.STEP_UP ?? 0, color: '#f59e0b' },
        { label: 'Restricted', value: outcomes.RESTRICT ?? 0, color: '#ef4444' },
        { label: 'Revoked', value: outcomes.REVOKE ?? 0, color: '#f87171' },
      ]} />

      <div className="dashboard-grid">
        <div className="glass-panel">
          <PanelHeader icon={BarChart2} title="Trust Distribution" subtitle="Active sessions by score band" />
          {data?.sessions?.length ? (
            <div style={{ display: 'flex', flexDirection: 'column', gap: '0.7rem' }}>
              {buckets.map((b) => (
                <div key={b.label}>
                  <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '0.78rem', marginBottom: '0.25rem' }}>
                    <span style={{ color: 'var(--text-muted)' }}>{b.label}</span>
                    <span className="mono-font">{b.n}</span>
                  </div>
                  <div style={{ height: 8, background: 'rgba(255,255,255,0.06)', borderRadius: 4, overflow: 'hidden' }}>
                    <div style={{ width: `${(b.n / maxBucket) * 100}%`, height: '100%', background: scoreColor(b.min), transition: 'width 0.3s' }} />
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <Empty message="No active sessions to chart." />
          )}
        </div>

        <div className="glass-panel">
          <PanelHeader icon={BarChart2} title="Top Reason Codes" subtitle="Why trust changed, ranked" />
          {topReasons.length ? (
            <div style={{ display: 'flex', flexDirection: 'column', gap: '0.5rem' }}>
              {topReasons.map(([code, n]) => (
                <div key={code} style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', gap: '0.75rem', background: 'rgba(0,0,0,0.28)', padding: '0.5rem 0.7rem', borderRadius: 8 }}>
                  <span className="mono-font" style={{ fontSize: '0.72rem', color: '#cbd5e1' }}>{code}</span>
                  <strong className="mono-font" style={{ color: '#06b6d4' }}>{n}</strong>
                </div>
              ))}
            </div>
          ) : (
            <Empty message="No trust evaluations recorded yet." />
          )}
        </div>
      </div>
    </div>
  );
}
