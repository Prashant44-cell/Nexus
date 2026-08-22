import React, { useState } from 'react';
import { GraduationCap, Monitor } from 'lucide-react';
import { useOverview, fmtTime, riskClass, scoreColor, api } from '../../api';
import { PanelHeader, StatGrid, ErrorNote, Table, Empty, td } from '../Shared';

export default function ExamSecurity() {
  const { data, error } = useOverview(3000);
  const [selected, setSelected] = useState(null);
  const [busy, setBusy] = useState(false);
  const [note, setNote] = useState('');

  const sessions = data?.sessions ?? [];
  const active = sessions.find((s) => s.session_id === selected) || sessions[0];
  const timeline = (data?.audit_logs ?? []).filter((l) => l.session_id === active?.session_id);

  const terminate = async () => {
    if (!active) return;
    setBusy(true);
    setNote('');
    try {
      await api('/auth/step-up', {
        method: 'POST',
        body: JSON.stringify({
          session_id: active.session_id,
          challenge_type: 'proctor_forced',
          challenge_response: 'FAILED',
          device_sig: 'PROCTOR_CONSOLE',
        }),
      });
      setNote(`Step-up failed for ${active.full_name} — session restricted.`);
    } catch (e) {
      setNote(e.message);
    } finally {
      setBusy(false);
    }
  };

  return (
    <div>
      <ErrorNote error={error} />

      <StatGrid stats={[
        { label: 'Monitored Sessions', value: sessions.length, color: '#06b6d4' },
        { label: 'Clear', value: sessions.filter((s) => s.risk_level === 'low').length, color: '#10b981' },
        { label: 'Step-Up Pending', value: sessions.filter((s) => s.risk_level === 'medium').length, color: '#f59e0b' },
        { label: 'Flagged', value: sessions.filter((s) => s.risk_level === 'high').length, color: '#ef4444' },
      ]} />

      <div className="dashboard-grid">
        <div className="glass-panel">
          <PanelHeader icon={Monitor} title="Live Exam Sessions" subtitle="Select a candidate to inspect" />
          <Table
            columns={['Candidate', 'Trust', 'Risk', 'Started']}
            rows={sessions}
            empty="No candidates are currently in session."
            renderRow={(s) => (
              <tr
                key={s.session_id}
                onClick={() => setSelected(s.session_id)}
                style={{ cursor: 'pointer', background: s.session_id === active?.session_id ? 'rgba(6,182,212,0.1)' : undefined }}
              >
                <td style={td}>{s.full_name}</td>
                <td style={{ ...td, color: scoreColor(s.last_trust_score) }} className="mono-font">{s.last_trust_score}%</td>
                <td style={td}><span className={`badge ${riskClass(s.risk_level)}`}>{s.risk_level}</span></td>
                <td style={{ ...td, color: 'var(--text-muted)', fontSize: '0.74rem', whiteSpace: 'nowrap' }}>{fmtTime(s.start_time)}</td>
              </tr>
            )}
          />
        </div>

        <div className="glass-panel">
          <PanelHeader
            icon={GraduationCap}
            title={active ? active.full_name : 'No candidate selected'}
            subtitle={active ? `Session ${active.session_id} · ${active.device_id}` : undefined}
            right={active && (
              <button className="btn btn-danger" disabled={busy} onClick={terminate} style={{ padding: '0.45rem 0.85rem', fontSize: '0.78rem' }}>
                {busy ? 'Working…' : 'Force step-up failure'}
              </button>
            )}
          />
          {note && <p style={{ fontSize: '0.8rem', color: '#fbbf24', marginBottom: '0.75rem' }}>{note}</p>}
          {active ? (
            <Table
              columns={['Time', 'Event', 'Result', 'Reason']}
              rows={timeline}
              empty="No scored events for this session yet."
              renderRow={(l) => (
                <tr key={l.id}>
                  <td style={{ ...td, whiteSpace: 'nowrap' }} className="mono-font">{fmtTime(l.timestamp)}</td>
                  <td style={td}>{l.event_type}</td>
                  <td style={{ ...td, color: ['SUCCESS', 'ALLOW', 'PASSED'].includes(l.result) ? '#34d399' : '#f87171' }}>{l.result}</td>
                  <td style={{ ...td, color: 'var(--text-muted)', fontSize: '0.74rem' }}>{l.reason_code}</td>
                </tr>
              )}
            />
          ) : (
            <Empty message="Start a session to monitor it here." />
          )}
        </div>
      </div>
    </div>
  );
}
