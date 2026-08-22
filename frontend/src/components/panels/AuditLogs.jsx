import React, { useState } from 'react';
import { FileText, Download } from 'lucide-react';
import { useOverview, fmtTime, downloadCSV } from '../../api';
import { PanelHeader, ErrorNote, Table, td } from '../Shared';

export default function AuditLogs() {
  const { data, error } = useOverview();
  const [q, setQ] = useState('');

  const logs = (data?.audit_logs ?? []).filter((l) =>
    !q || `${l.user_id} ${l.event_type} ${l.reason_code} ${l.result}`.toLowerCase().includes(q.toLowerCase())
  );

  return (
    <div>
      <ErrorNote error={error} />
      <div className="glass-panel">
        <PanelHeader
          icon={FileText}
          title="Audit Logs"
          subtitle="Every credential, session and trust event, in order"
          right={
            <div style={{ display: 'flex', gap: '0.5rem', flexWrap: 'wrap' }}>
              <input
                value={q}
                onChange={(e) => setQ(e.target.value)}
                placeholder="Filter…"
                style={{ background: 'rgba(0,0,0,0.4)', border: '1px solid rgba(255,255,255,0.12)', borderRadius: 8, padding: '0.4rem 0.6rem', color: '#fff', fontSize: '0.8rem' }}
              />
              <button className="btn btn-secondary" style={{ padding: '0.4rem 0.8rem', fontSize: '0.78rem' }}
                onClick={() => downloadCSV('audit-logs.csv', logs)}>
                <Download size={14} /> CSV
              </button>
            </div>
          }
        />
        <Table
          columns={['Time', 'User', 'Session', 'Event', 'Result', 'Reason', 'Device', 'IP']}
          rows={logs}
          empty={q ? 'Nothing matches that filter.' : 'No audit events recorded yet.'}
          renderRow={(l) => (
            <tr key={l.id}>
              <td style={{ ...td, whiteSpace: 'nowrap' }} className="mono-font">{fmtTime(l.timestamp)}</td>
              <td style={td}>{l.user_id}</td>
              <td style={{ ...td, color: 'var(--text-muted)', fontSize: '0.72rem' }}>{l.session_id || '—'}</td>
              <td style={td}>{l.event_type}</td>
              <td style={{ ...td, color: ['SUCCESS', 'ALLOW', 'PASSED'].includes(l.result) ? '#34d399' : '#fbbf24' }}>{l.result}</td>
              <td style={{ ...td, color: 'var(--text-muted)', fontSize: '0.73rem' }}>{l.reason_code}</td>
              <td style={{ ...td, fontSize: '0.73rem' }}>{l.device_id}</td>
              <td style={{ ...td, fontSize: '0.73rem' }} className="mono-font">{l.ip_address}</td>
            </tr>
          )}
        />
      </div>
    </div>
  );
}
