import React from 'react';
import { ShieldAlert, Lock, Activity, Landmark } from 'lucide-react';

export default function AdminNavbar({ lastUpdated }) {
  return (
    <header style={{
      display: 'flex',
      justifyContent: 'space-between',
      alignItems: 'center',
      background: 'var(--bg-card)',
      border: '1px solid var(--border)',
      borderRadius: '16px',
      padding: '0.85rem 1.5rem',
      marginBottom: '1.5rem',
      boxShadow: 'var(--shadow-sm)',
      transition: 'all 0.28s ease',
      color: 'var(--text-main)',
    }}>
      <div style={{ display: 'flex', alignItems: 'center', gap: '0.85rem' }}>
        <div style={{
          width: 42, height: 42, borderRadius: 12,
          background: 'linear-gradient(135deg, #6d28d9, #1a9975)',
          display: 'flex', alignItems: 'center', justifyContent: 'center',
          boxShadow: '0 2px 10px rgba(109,40,217,0.35)', flexShrink: 0,
        }} className="pulse-neon">
          <ShieldAlert size={22} color="#fff" />
        </div>
        <div>
          <h1 style={{ fontSize: '1.08rem', fontWeight: 800, color: 'var(--text-main)', margin: 0, letterSpacing: '-0.02em' }}>
            Nexus Regulatory &amp; Compliance Console
          </h1>
          <p style={{ color: 'var(--text-muted)', fontSize: '0.75rem', margin: 0 }}>
            Reserve Bank Governor Node · Hyperledger Besu PBFT · Port 3001
          </p>
        </div>
      </div>

      <div style={{ display: 'flex', alignItems: 'center', gap: '0.65rem' }}>
        <span style={{
          fontSize: '0.72rem', padding: '0.35rem 0.75rem', borderRadius: 9999,
          background: 'rgba(109,40,217,0.12)', color: '#8b5cf6',
          border: '1px solid rgba(109,40,217,0.3)', fontWeight: 700,
          display: 'flex', alignItems: 'center', gap: '0.4rem',
        }}>
          <Lock size={12} /> ADMIN PORTAL ONLY
        </span>
        <div style={{
          display: 'flex', alignItems: 'center', gap: '0.45rem',
          fontSize: '0.74rem', color: '#10b981',
          background: 'rgba(16,185,129,0.1)',
          padding: '0.35rem 0.85rem', borderRadius: 9999,
          border: '1px solid rgba(16,185,129,0.25)',
          fontWeight: 600,
        }}>
          <Activity size={13} />
          Live Sync: {lastUpdated ? new Date(lastUpdated * 1000).toLocaleTimeString() : 'Active'}
        </div>
      </div>
    </header>
  );
}
