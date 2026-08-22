import React from 'react';
import { Monitor } from 'lucide-react';
import { fmtTime, riskClass, scoreColor } from '../../../api';
import { PanelHeader, ErrorNote, Table } from '../Shared';

export default function LiveSessions({ data, error }) {
  const sessions = data?.sessions ?? [];

  return (
    <div>
      <ErrorNote error={error} />
      <div className="glass-panel">
        <PanelHeader
          icon={Monitor}
          title="Live Sessions"
          subtitle="Every session under continuous verification, across all institutions"
          right={
            <span className="mono-font" style={{ fontSize: '0.78rem', color: 'var(--text-muted)' }}>
              {sessions.length} active
            </span>
          }
        />
        <Table
          columns={['Session', 'User', 'Role', 'Device', 'IP', 'Trust', 'Risk', 'Started', 'Status']}
          rows={sessions}
          empty="No active sessions. Start one from the client portal on port 3000."
          renderRow={(s) => (
            <tr key={s.session_id}>
              <td className="mono-font" style={{ fontSize: '0.74rem' }}>{s.session_id}</td>
              <td>{s.user_id}</td>
              <td style={{ textTransform: 'capitalize', color: 'var(--text-muted)' }}>{s.user_role}</td>
              <td style={{ fontSize: '0.76rem' }}>{s.device_id}</td>
              <td className="mono-font" style={{ fontSize: '0.76rem' }}>{s.ip_address}</td>
              <td className="mono-font" style={{ color: scoreColor(s.last_trust_score) }}>{s.last_trust_score}%</td>
              <td><span className={`badge ${riskClass(s.risk_level)}`}>{s.risk_level}</span></td>
              <td style={{ color: 'var(--text-muted)', fontSize: '0.75rem', whiteSpace: 'nowrap' }}>{fmtTime(s.start_time)}</td>
              <td style={{ color: s.status === 'active' ? '#34d399' : '#f87171', textTransform: 'capitalize' }}>{s.status}</td>
            </tr>
          )}
        />
      </div>
    </div>
  );
}

