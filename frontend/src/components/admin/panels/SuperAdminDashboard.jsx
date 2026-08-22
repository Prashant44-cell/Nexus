import React from 'react';
import { ShieldAlert, Activity } from 'lucide-react';
import { fmtTime, riskClass, scoreColor } from '../../../api';
import { PanelHeader, StatGrid, ErrorNote, Table } from '../Shared';

export default function SuperAdminDashboard({ data, error }) {
  const alerts = data?.recent_alerts ?? [];
  const logs = (data?.audit_logs ?? []).slice(0, 12);

  return (
    <div>
      <ErrorNote error={error} />

      <StatGrid stats={[
        { label: 'Active Sessions', value: data?.total_active_sessions ?? '—', color: '#8b5cf6' },
        { label: 'Avg Trust', value: data ? `${data.avg_trust}%` : '—', color: scoreColor(data?.avg_trust ?? 0) },
        { label: 'Low Risk', value: data?.low_risk_count ?? '—', color: '#10b981' },
        { label: 'Step-Up Needed', value: data?.medium_risk_count ?? '—', color: '#f59e0b' },
        { label: 'High Risk', value: data?.high_risk_count ?? '—', color: '#ef4444' },
        { label: 'Revoked Credentials', value: data?.revoked_credentials_count ?? '—', color: '#f87171' },
      ]} />

      <div className="glass-panel" style={{ marginBottom: '1.5rem' }}>
        <PanelHeader
          icon={ShieldAlert}
          title="Active Risk Alerts"
          subtitle="Sessions whose continuous trust score has decayed out of the allow band"
        />
        <Table
          columns={['Session', 'User', 'Trust', 'Risk', 'Reason']}
          rows={alerts}
          empty="No sessions are currently above the risk threshold."
          renderRow={(a) => (
            <tr key={a.session_id}>
              <td className="mono-font" style={{ fontSize: '0.74rem' }}>{a.session_id}</td>
              <td>{a.user_id}</td>
              <td className="mono-font" style={{ color: scoreColor(a.trust_score) }}>{a.trust_score}%</td>
              <td><span className={`badge ${riskClass(a.risk_level)}`}>{a.risk_level}</span></td>
              <td style={{ color: 'var(--text-muted)', fontSize: '0.78rem' }}>{a.reason}</td>
            </tr>
          )}
        />
      </div>

      <div className="glass-panel">
        <PanelHeader icon={Activity} title="Platform Event Feed" subtitle="Most recent entries across all institutions" />
        <Table
          columns={['Time', 'User', 'Event', 'Result', 'Reason']}
          rows={logs}
          empty="No platform events recorded yet."
          renderRow={(l) => (
            <tr key={l.id}>
              <td className="mono-font" style={{ whiteSpace: 'nowrap', fontSize: '0.75rem' }}>{fmtTime(l.timestamp)}</td>
              <td>{l.user_id}</td>
              <td>{l.event_type}</td>
              <td style={{ color: ['SUCCESS', 'ALLOW', 'PASSED'].includes(l.result) ? '#34d399' : '#fbbf24' }}>{l.result}</td>
              <td style={{ color: 'var(--text-muted)', fontSize: '0.76rem' }}>{l.reason_code}</td>
            </tr>
          )}
        />
      </div>
    </div>
  );
}

