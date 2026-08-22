import React from 'react';
import { UserCheck, Key, Hash, Building2, UserX } from 'lucide-react';

// Placeholders are em-dashes, never sample identities — a wallet showing a name that isn't
// the holder's is worse than a wallet showing nothing.
export default function WalletCard({ credential, isRevoked }) {
  return (
    <div className={`glass-panel ${isRevoked ? '' : 'glow-border'}`} style={{
      borderColor: isRevoked ? 'rgba(239,68,68,0.5)' : undefined
    }}>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1.25rem' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
          <div style={{
            padding: '0.6rem',
            background: isRevoked ? 'rgba(239,68,68,0.15)' : 'rgba(6, 182, 212, 0.15)',
            borderRadius: '12px',
            border: `1px solid ${isRevoked ? 'rgba(239,68,68,0.3)' : 'rgba(6, 182, 212, 0.3)'}`
          }}>
            {isRevoked ? <UserX size={24} color="#ef4444" /> : <UserCheck size={24} color="#06b6d4" />}
          </div>
          <div>
            <h3 style={{ fontSize: '1.15rem' }}>Digital Identity Wallet</h3>
            <p style={{ color: 'var(--text-muted)', fontSize: '0.8rem' }}>Verifiable Human Credential</p>
          </div>
        </div>
        <span className={`badge ${isRevoked ? 'badge-high' : 'badge-low'}`}>
          {isRevoked ? 'REVOKED' : 'ACTIVE CREDENTIAL'}
        </span>
      </div>

      <div style={{ display: 'flex', flexDirection: 'column', gap: '0.85rem' }}>
        <div style={{ background: 'rgba(0,0,0,0.3)', padding: '0.85rem', borderRadius: '10px' }}>
          <span style={{ color: 'var(--text-muted)', fontSize: '0.75rem', display: 'block' }}>FULL NAME</span>
          <strong style={{ fontSize: '1.05rem', color: '#ffffff' }}>{credential?.full_name || '—'}</strong>
        </div>

        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '0.75rem' }}>
          <div style={{ background: 'rgba(0,0,0,0.3)', padding: '0.75rem', borderRadius: '10px' }}>
            <span style={{ color: 'var(--text-muted)', fontSize: '0.75rem', display: 'flex', alignItems: 'center', gap: '0.35rem' }}>
              <Building2 size={13} /> INSTITUTION
            </span>
            <span style={{ fontSize: '0.85rem', fontWeight: '600' }}>{credential?.institution || '—'}</span>
          </div>

          <div style={{ background: 'rgba(0,0,0,0.3)', padding: '0.75rem', borderRadius: '10px' }}>
            <span style={{ color: 'var(--text-muted)', fontSize: '0.75rem', display: 'flex', alignItems: 'center', gap: '0.35rem' }}>
              <Key size={13} /> ROLE
            </span>
            <span style={{ fontSize: '0.85rem', fontWeight: '600', textTransform: 'capitalize' }}>
              {credential?.user_role || '—'}
            </span>
          </div>
        </div>

        <div style={{ background: 'rgba(0,0,0,0.3)', padding: '0.75rem', borderRadius: '10px' }}>
          <span style={{ color: 'var(--text-muted)', fontSize: '0.75rem', display: 'flex', alignItems: 'center', gap: '0.35rem', marginBottom: '0.2rem' }}>
            <Hash size={13} /> CRYPTOGRAPHIC CONSENT HASH (TERMS AGREEMENT)
          </span>
          <code className="mono-font" style={{ fontSize: '0.75rem', color: '#06b6d4', wordBreak: 'break-all' }}>
            {credential?.consent_hash || '—'}
          </code>
        </div>
      </div>
    </div>
  );
}
