import React, { useState } from 'react';
import { CreditCard, Ban, UserMinus } from 'lucide-react';
import { api, fmtTime } from '../../../api';
import { PanelHeader, ErrorNote, Table } from '../Shared';

const STATUS_CLASS = { active: 'badge-low', suspended: 'badge-medium', revoked: 'badge-high' };

export default function CredentialManagement({ data, error, reload, adminId }) {
  const [busyId, setBusyId] = useState(null);
  const [note, setNote] = useState(null);

  const credentials = data?.credentials ?? [];

  // Revocation is irreversible and cuts the holder's live session within one poll, so it is
  // confirmed before it is sent. Native confirm — no reason to build a dialog for this.
  const act = async (cred, kind) => {
    const label = kind === 'revoke' ? 'REVOKE' : 'suspend';
    const reason = window.prompt(
      `${label === 'REVOKE' ? 'Revoke' : 'Suspend'} ${cred.full_name} (${cred.credential_id}).\n\nThis takes effect immediately. Enter a reason for the audit record:`
    );
    if (!reason) return;

    setBusyId(cred.credential_id);
    setNote(null);
    try {
      if (kind === 'revoke') {
        const res = await api('/credential/revoke', {
          method: 'POST',
          body: JSON.stringify({ credential_id: cred.credential_id, reason, admin_id: adminId }),
        });
        setNote({ ok: true, text: `${cred.full_name} revoked · proof anchored ${res.blockchain_tx_hash}` });
      } else {
        await api('/admin/users/suspend', {
          method: 'POST',
          body: JSON.stringify({ user_id: cred.user_id, reason }),
        });
        setNote({ ok: true, text: `${cred.full_name} suspended.` });
      }
      await reload();
    } catch (e) {
      setNote({ ok: false, text: e.message });
    } finally {
      setBusyId(null);
    }
  };

  return (
    <div>
      <ErrorNote error={error} />
      <div className="glass-panel">
        <PanelHeader
          icon={CreditCard}
          title="Credential Management"
          subtitle="Revocation is anchored on-chain as proof; identity proofs are secured on the ledger"
        />

        {note && (
          <div style={{
            padding: '0.7rem 0.9rem', borderRadius: 8, marginBottom: '1rem', fontSize: '0.82rem',
            background: note.ok ? 'rgba(16,185,129,0.12)' : 'rgba(239,68,68,0.12)',
            border: `1px solid ${note.ok ? 'rgba(16,185,129,0.3)' : 'rgba(239,68,68,0.3)'}`,
            color: note.ok ? '#34d399' : '#f87171',
          }}>
            {note.text}
          </div>
        )}

        <Table
          columns={['Credential', 'Holder', 'Role', 'Institution', 'Issued', 'Status', 'Actions']}
          rows={credentials}
          empty="No credentials issued yet."
          renderRow={(c) => {
            const busy = busyId === c.credential_id;
            const done = c.status === 'revoked';
            return (
              <tr key={c.credential_id}>
                <td className="mono-font" style={{ fontSize: '0.74rem' }}>{c.credential_id}</td>
                <td>{c.full_name}</td>
                <td style={{ textTransform: 'capitalize', color: 'var(--text-muted)' }}>{c.user_role}</td>
                <td style={{ fontSize: '0.78rem' }}>{c.institution}</td>
                <td style={{ color: 'var(--text-muted)', fontSize: '0.75rem', whiteSpace: 'nowrap' }}>{fmtTime(c.issued_at)}</td>
                <td><span className={`badge ${STATUS_CLASS[c.status] || 'badge-medium'}`}>{c.status}</span></td>
                <td>
                  <div style={{ display: 'flex', gap: '0.4rem', flexWrap: 'wrap' }}>
                    <button
                      className="btn btn-secondary"
                      disabled={busy || done || c.status === 'suspended'}
                      onClick={() => act(c, 'suspend')}
                      style={{ padding: '0.3rem 0.6rem', fontSize: '0.72rem' }}
                    >
                      <UserMinus size={12} /> Suspend
                    </button>
                    <button
                      className="btn btn-danger"
                      disabled={busy || done}
                      onClick={() => act(c, 'revoke')}
                      style={{ padding: '0.3rem 0.6rem', fontSize: '0.72rem' }}
                    >
                      <Ban size={12} /> {busy ? 'Working…' : 'Revoke'}
                    </button>
                  </div>
                </td>
              </tr>
            );
          }}
        />
      </div>
    </div>
  );
}

