import React from 'react';
import { Activity, Users, ShieldAlert } from 'lucide-react';
import { useOverview, fmtTime, riskClass, scoreColor } from '../../api';
import { PanelHeader, StatGrid, ErrorNote, Table, Empty, td } from '../Shared';

export default function ClientDashboard({ trustResult, sessionId, isConnected }) {
  const { data, error } = useOverview();
  const k = data?.kpis;

  return (
    <div>
      <ErrorNote error={error} />

      <StatGrid stats={[
        { label: 'Members', value: k?.total_members ?? '—' },
        { label: 'Active Sessions', value: k?.active_sessions ?? '—', color: '#06b6d4' },
        { label: 'Avg Trust', value: k ? `${k.avg_trust}%` : '—', color: scoreColor(k?.avg_trust ?? 0) },
        { label: 'Low Risk', value: k?.low_risk ?? '—', color: '#10b981' },
        { label: 'Step-Up Needed', value: k?.medium_risk ?? '—', color: '#f59e0b' },
        { label: 'High Risk', value: k?.high_risk ?? '—', color: '#ef4444' },
        { label: 'Revoked', value: k?.revoked ?? '—', color: '#f87171' },
      ]} />

      <div className="dashboard-grid">
        <div className="glass-panel">
          <PanelHeader
            icon={Activity}
            title="My Live Session"
            subtitle={sessionId ? `Session ${sessionId}` : 'No active session'}
            right={
              <span style={{ fontSize: '0.72rem', color: isConnected ? '#10b981' : '#f59e0b', display: 'flex', alignItems: 'center', gap: '0.35rem' }}>
                <span style={{ width: 8, height: 8, borderRadius: '50%', background: isConnected ? '#10b981' : '#f59e0b' }} />
                {isConnected ? 'WebSocket live' : 'Disconnected'}
              </span>
            }
          />
          {trustResult ? (
            <>
              <div className="score-circle" style={{ borderColor: scoreColor(trustResult.trust_score) }}>
                <span className="mono-font" style={{ fontSize: '2.1rem', fontWeight: 800 }}>{trustResult.trust_score}%</span>
                <span style={{ fontSize: '0.65rem', color: 'var(--text-muted)' }}>TRUST</span>
              </div>
              <div style={{ textAlign: 'center', marginTop: '0.9rem' }}>
                <span className={`badge ${riskClass(trustResult.risk_level)}`}>{trustResult.risk_level} risk</span>
                <p className="mono-font" style={{ fontSize: '0.72rem', color: '#06b6d4', marginTop: '0.5rem' }}>
                  evaluated in {trustResult.latency_ms} ms
                </p>
                <div style={{ display: 'flex', flexWrap: 'wrap', gap: '0.3rem', justifyContent: 'center', marginTop: '0.7rem' }}>
                  {trustResult.reasons.map((r) => (
                    <span key={r} className="mono-font" style={{ fontSize: '0.65rem', background: 'rgba(255,255,255,0.06)', padding: '0.15rem 0.45rem', borderRadius: 5, color: '#cbd5e1' }}>{r}</span>
                  ))}
                </div>
              </div>
            </>
          ) : (
            <Empty message="No trust evaluation yet. Open Live Trust to start streaming signals." />
          )}
        </div>

        <div className="glass-panel">
          <PanelHeader icon={Users} title="Institution Sessions" subtitle={data?.institution || '—'} />
          <Table
            columns={['User', 'Trust', 'Risk']}
            rows={data?.sessions ?? []}
            empty="No active sessions across the institution."
            renderRow={(s) => (
              <tr key={s.session_id}>
                <td style={td}>{s.full_name}</td>
                <td style={{ ...td, color: scoreColor(s.last_trust_score) }} className="mono-font">{s.last_trust_score}%</td>
                <td style={td}><span className={`badge ${riskClass(s.risk_level)}`}>{s.risk_level}</span></td>
              </tr>
            )}
          />
        </div>
      </div>

      <div className="glass-panel" style={{ marginTop: '1.5rem' }}>
        <PanelHeader icon={ShieldAlert} title="Security Event Feed" subtitle="Live from the audit trail" />
        <Table
          columns={['Time', 'User', 'Event', 'Result', 'Reason']}
          rows={(data?.audit_logs ?? []).slice(0, 12)}
          empty="No events recorded yet."
          renderRow={(l) => (
            <tr key={l.id}>
              <td style={{ ...td, whiteSpace: 'nowrap' }} className="mono-font">{fmtTime(l.timestamp)}</td>
              <td style={td}>{l.user_id}</td>
              <td style={td}>{l.event_type}</td>
              <td style={{ ...td, color: ['SUCCESS', 'ALLOW', 'PASSED'].includes(l.result) ? '#34d399' : '#fbbf24' }}>{l.result}</td>
              <td style={{ ...td, color: 'var(--text-muted)', fontSize: '0.75rem' }}>{l.reason_code}</td>
            </tr>
          )}
        />
      </div>
    </div>
  );
}
