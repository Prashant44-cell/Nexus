import React, { useState } from 'react';
import { FileText } from 'lucide-react';
import { fmtTime } from '../../../api';
import { PanelHeader, ErrorNote, Table } from '../Shared';

export default function AuditCompliance({ data, error }) {
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
          title="Audit & Compliance"
          subtitle="Every identity event, with its on-chain proof anchor"
          right={
            <input
              value={q}
              onChange={(e) => setQ(e.target.value)}
              placeholder="Filter events…"
              style={{ background: 'rgba(0,0,0,0.4)', border: '1px solid var(--border-color)', borderRadius: 8, padding: '0.4rem 0.6rem', color: '#fff', fontSize: '0.8rem' }}
            />
          }
        />
        <Table
          columns={['Time', 'User', 'Session', 'Event', 'Result', 'Reason', 'Proof Anchor']}
          rows={logs}
          empty={q ? 'Nothing matches that filter.' : 'No audit events recorded yet.'}
          renderRow={(l) => (
            <tr key={l.id}>
              <td className="mono-font" style={{ whiteSpace: 'nowrap', fontSize: '0.75rem' }}>{fmtTime(l.timestamp)}</td>
              <td>{l.user_id}</td>
              <td style={{ color: 'var(--text-muted)', fontSize: '0.72rem' }}>{l.session_id || '—'}</td>
              <td>{l.event_type}</td>
              <td style={{ color: ['SUCCESS', 'ALLOW', 'PASSED'].includes(l.result) ? '#34d399' : '#fbbf24' }}>{l.result}</td>
              <td style={{ color: 'var(--text-muted)', fontSize: '0.75rem' }}>{l.reason_code}</td>
              <td className="mono-font" style={{ fontSize: '0.7rem', color: '#a78bfa', maxWidth: 160, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
                {l.blockchain_tx_hash}
              </td>
            </tr>
          )}
        />
      </div>
    </div>
  );
}

