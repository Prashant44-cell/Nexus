import React, { useState } from 'react';
import { ClipboardList, CheckCircle2, XCircle } from 'lucide-react';
import { useOverview, scoreColor, fmtTime, downloadCSV } from '../../api';
import { PanelHeader, StatGrid, ErrorNote, Table, td } from '../Shared';

// Attendance is not a separate source of truth — a member is "present" when they hold a
// live session, and "verified" when that session's trust score cleared the ALLOW threshold.
function deriveAttendance(data) {
  if (!data) return [];
  const sessionByUser = {};
  for (const s of data.sessions) sessionByUser[s.user_id] = s;

  return data.members.map((m) => {
    const s = sessionByUser[m.user_id];
    const trust = s?.last_trust_score ?? null;
    let status = 'absent';
    if (m.status === 'revoked') status = 'revoked';
    else if (!s) status = 'absent';
    else if (trust >= 80) status = 'verified';
    else if (trust >= 50) status = 'verification_required';
    else status = 'proxy_suspected';

    return {
      user_id: m.user_id,
      name: m.full_name,
      department: m.department,
      credential: m.status === 'active',
      device: !!s,
      human: trust !== null && trust >= 80,
      trust,
      since: s?.start_time,
      status,
    };
  });
}

const CFG = {
  verified: { cls: 'badge-low', label: 'Verified Present' },
  verification_required: { cls: 'badge-medium', label: 'Verification Required' },
  proxy_suspected: { cls: 'badge-high', label: 'Proxy Suspected' },
  absent: { cls: 'badge-medium', label: 'Absent' },
  revoked: { cls: 'badge-high', label: 'Revoked' },
};

export default function AttendancePanel() {
  const { data, error } = useOverview();
  const [filter, setFilter] = useState('all');

  const records = deriveAttendance(data);
  const rows = filter === 'all' ? records : records.filter((r) => r.status === filter);
  const count = (s) => records.filter((r) => r.status === s).length;

  return (
    <div>
      <ErrorNote error={error} />

      <StatGrid stats={[
        { label: 'Expected', value: records.length },
        { label: 'Verified Present', value: count('verified'), color: '#10b981' },
        { label: 'Needs Verification', value: count('verification_required'), color: '#f59e0b' },
        { label: 'Proxy Suspected', value: count('proxy_suspected'), color: '#ef4444' },
        { label: 'Absent', value: count('absent'), color: '#94a3b8' },
      ]} />

      <div className="glass-panel">
        <PanelHeader
          icon={ClipboardList}
          title="Attendance Security"
          subtitle="Derived from live sessions and their trust scores — no separate roll call"
          right={
            <div style={{ display: 'flex', gap: '0.5rem', alignItems: 'center', flexWrap: 'wrap' }}>
              <select
                value={filter}
                onChange={(e) => setFilter(e.target.value)}
                style={{ background: 'rgba(0,0,0,0.4)', color: '#fff', border: '1px solid rgba(255,255,255,0.12)', borderRadius: 8, padding: '0.4rem 0.6rem', fontSize: '0.8rem' }}
              >
                <option value="all">All statuses</option>
                {Object.entries(CFG).map(([k, v]) => <option key={k} value={k}>{v.label}</option>)}
              </select>
              <button className="btn btn-secondary" style={{ padding: '0.4rem 0.8rem', fontSize: '0.78rem' }}
                onClick={() => downloadCSV('attendance.csv', rows)}>
                Export CSV
              </button>
            </div>
          }
        />

        <Table
          columns={['Member', 'Department', 'Credential', 'Device', 'Human', 'Trust', 'Since', 'Status']}
          rows={rows}
          empty="No members match this filter."
          renderRow={(r) => (
            <tr key={r.user_id}>
              <td style={td}>{r.name}</td>
              <td style={{ ...td, color: 'var(--text-muted)' }}>{r.department}</td>
              <td style={td}><Tick ok={r.credential} /></td>
              <td style={td}><Tick ok={r.device} /></td>
              <td style={td}><Tick ok={r.human} /></td>
              <td style={{ ...td, color: r.trust === null ? '#475569' : scoreColor(r.trust) }} className="mono-font">
                {r.trust === null ? '—' : `${r.trust}%`}
              </td>
              <td style={{ ...td, color: 'var(--text-muted)', fontSize: '0.75rem', whiteSpace: 'nowrap' }}>{r.since ? fmtTime(r.since) : '—'}</td>
              <td style={td}><span className={`badge ${CFG[r.status].cls}`}>{CFG[r.status].label}</span></td>
            </tr>
          )}
        />
      </div>
    </div>
  );
}

function Tick({ ok }) {
  return ok ? <CheckCircle2 size={15} color="#10b981" /> : <XCircle size={15} color="#ef4444" />;
}
