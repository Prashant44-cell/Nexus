import React from 'react';
import { Inbox, AlertTriangle } from 'lucide-react';

export function PanelHeader({ icon: Icon, title, subtitle, right }) {
  return (
    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1.25rem', gap: '1rem', flexWrap: 'wrap' }}>
      <div style={{ display: 'flex', alignItems: 'center', gap: '0.7rem' }}>
        {Icon && <Icon size={20} color="#06b6d4" />}
        <div>
          <h3 style={{ fontSize: '1.1rem', color: '#fff' }}>{title}</h3>
          {subtitle && <p style={{ color: 'var(--text-muted)', fontSize: '0.8rem' }}>{subtitle}</p>}
        </div>
      </div>
      {right}
    </div>
  );
}

export function StatGrid({ stats }) {
  return (
    <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(150px, 1fr))', gap: '0.85rem', marginBottom: '1.5rem' }}>
      {stats.map(({ label, value, color }) => (
        <div key={label} className="glass-panel" style={{ padding: '1rem' }}>
          <span style={{ color: 'var(--text-muted)', fontSize: '0.7rem', textTransform: 'uppercase', letterSpacing: '0.05em', display: 'block' }}>
            {label}
          </span>
          <strong className="mono-font" style={{ fontSize: '1.6rem', color: color || '#fff', lineHeight: 1.3 }}>
            {value}
          </strong>
        </div>
      ))}
    </div>
  );
}

export function Empty({ message }) {
  return (
    <div style={{ textAlign: 'center', padding: '2.5rem 1rem', color: 'var(--text-muted)' }}>
      <Inbox size={30} style={{ opacity: 0.4 }} />
      <p style={{ fontSize: '0.85rem', marginTop: '0.6rem' }}>{message}</p>
    </div>
  );
}

export function ErrorNote({ error }) {
  if (!error) return null;
  return (
    <div className="glass-panel" style={{ background: 'rgba(239,68,68,0.1)', borderColor: 'rgba(239,68,68,0.35)', marginBottom: '1rem', display: 'flex', gap: '0.6rem', alignItems: 'center', padding: '0.8rem 1rem' }}>
      <AlertTriangle size={16} color="#f87171" />
      <span style={{ fontSize: '0.82rem', color: '#fca5a5' }}>Backend unreachable — {error}</span>
    </div>
  );
}

export function Table({ columns, rows, renderRow, empty }) {
  if (!rows.length) return <Empty message={empty} />;
  return (
    <div style={{ overflowX: 'auto' }}>
      <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: '0.82rem' }}>
        <thead>
          <tr style={{ borderBottom: '1px solid rgba(255,255,255,0.1)' }}>
            {columns.map((c) => (
              <th key={c} style={{ textAlign: 'left', padding: '0.6rem 0.7rem', color: '#475569', fontSize: '0.68rem', textTransform: 'uppercase', letterSpacing: '0.06em', whiteSpace: 'nowrap' }}>
                {c}
              </th>
            ))}
          </tr>
        </thead>
        <tbody>{rows.map(renderRow)}</tbody>
      </table>
    </div>
  );
}

export const td = { padding: '0.6rem 0.7rem', borderBottom: '1px solid rgba(255,255,255,0.05)' };
