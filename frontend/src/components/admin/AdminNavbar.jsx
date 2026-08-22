import React from 'react';
import { ShieldAlert, Lock, Activity, Landmark } from 'lucide-react';

export default function AdminNavbar({ lastUpdated }) {
  return (
    <header style={{
      display: 'flex',
      justifyContent: 'space-between',
      alignItems: 'center',
      background: '#ffffff',
      border: '1px solid #e8ecf0',
      borderRadius: '14px',
      padding: '0.85rem 1.5rem',
      marginBottom: '1.5rem',
      boxShadow: '0 2px 8px rgba(0,0,0,0.05)',
    }}>
      <div style={{ display: 'flex', alignItems: 'center', gap: '0.85rem' }}>
        <div style={{
          width: 40, height: 40, borderRadius: 10,
          background: 'linear-gradient(135deg, #6d28d9, #1a9975)',
          display: 'flex', alignItems: 'center', justifyContent: 'center',
          boxShadow: '0 2px 8px rgba(109,40,217,0.3)', flexShrink: 0,
        }}>
          <ShieldAlert size={20} color="#fff" />
        </div>
        <div>
          <h1 style={{ fontSize: '1.05rem', fontWeight: 800, color: '#1a2332', margin: 0 }}>
            Nexus Regulatory & Compliance Console
          </h1>
          <p style={{ color: '#9ca3af', fontSize: '0.75rem', margin: 0 }}>
            Reserve Bank Governor Node · Hyperledger Besu PBFT · Port 3001
          </p>
        </div>
      </div>

      <div style={{ display: 'flex', alignItems: 'center', gap: '0.65rem' }}>
        <span style={{
          fontSize: '0.7rem', padding: '0.3rem 0.65rem', borderRadius: 9999,
          background: 'rgba(109,40,217,0.08)', color: '#6d28d9',
          border: '1px solid rgba(109,40,217,0.2)', fontWeight: 600,
          display: 'flex', alignItems: 'center', gap: '0.35rem',
        }}>
          <Lock size={11} /> ADMIN PORTAL ONLY
        </span>
        <div style={{
          display: 'flex', alignItems: 'center', gap: '0.4rem',
          fontSize: '0.72rem', color: '#059669',
          background: 'rgba(16,185,129,0.08)',
          padding: '0.3rem 0.75rem', borderRadius: 9999,
          border: '1px solid rgba(16,185,129,0.2)',
        }}>
          <Activity size={12} />
          Live Sync: {lastUpdated ? new Date(lastUpdated * 1000).toLocaleTimeString() : 'Active'}
        </div>
      </div>
    </header>
  );
}
