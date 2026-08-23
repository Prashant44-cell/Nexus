import React, { useState } from 'react';
import { ShieldCheck, ArrowRight, UserPlus, LogIn, Landmark, Eye, EyeOff } from 'lucide-react';
import { api, setToken } from '../api';

const fieldStyle = {
  width: '100%',
  background: 'var(--bg-page)',
  border: '1.5px solid var(--border)',
  padding: '0.65rem 0.85rem',
  borderRadius: 8,
  color: 'var(--text-main)',
  fontSize: '0.875rem',
  outline: 'none',
  transition: 'border-color 0.18s ease, box-shadow 0.18s ease',
  fontFamily: 'Inter, sans-serif',
};

export default function AuthModal({ onAuthSuccess }) {
  const [mode, setMode] = useState('login');
  const [showPassword, setShowPassword] = useState(false);
  const [form, setForm] = useState({
    username: '', password: '',
    full_name: '', email: '', institution: 'Nexus Global Reserve Bank', department: 'Private Wealth & Digital Vault',
  });
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState('');

  const set = (k) => (e) => setForm({ ...form, [k]: e.target.value });

  const submit = async (e) => {
    e.preventDefault();
    setBusy(true);
    setError('');
    try {
      const path = mode === 'login' ? '/auth/user-login' : '/auth/user-signup';
      const body = mode === 'login'
        ? { username: form.username, password: form.password }
        : { ...form, user_role: 'customer' };
      const data = await api(path, { method: 'POST', body: JSON.stringify(body) });
      setToken(data.id_token);
      onAuthSuccess(data);
    } catch (err) {
      setError(err.message);
    } finally {
      setBusy(false);
    }
  };

  return (
    <div style={{
      position: 'fixed', inset: 0, zIndex: 9999,
      background: 'rgba(10, 18, 30, 0.75)',
      backdropFilter: 'blur(12px)',
      display: 'flex', alignItems: 'center', justifyContent: 'center',
      padding: '1rem',
      animation: 'fadeIn 0.25s ease-out'
    }}>
      <div style={{
        background: 'var(--bg-card)',
        borderRadius: 24,
        padding: '2.25rem',
        width: '100%', maxWidth: 460,
        boxShadow: '0 25px 70px rgba(0,0,0,0.35), 0 0 30px rgba(26, 153, 117, 0.15)',
        border: '1px solid var(--border)',
        animation: 'modalSlideUp 0.3s cubic-bezier(0.16,1,0.3,1)',
        color: 'var(--text-main)',
        transition: 'background-color 0.3s ease, border-color 0.3s ease, color 0.3s ease'
      }}>
        {/* Logo + title */}
        <div style={{ textAlign: 'center', marginBottom: '1.4rem' }}>
          <div style={{
            display: 'inline-flex', padding: '0.9rem',
            background: 'linear-gradient(135deg, rgba(26,153,117,0.18), rgba(26,153,117,0.06))',
            borderRadius: 20, marginBottom: '0.85rem',
            border: '1px solid rgba(26,153,117,0.3)',
            boxShadow: '0 0 20px rgba(26,153,117,0.25)'
          }}>
            <Landmark size={32} color="#1a9975" />
          </div>
          <h2 style={{ fontSize: '1.4rem', fontWeight: 800, color: 'var(--text-main)', margin: 0, letterSpacing: '-0.02em' }}>
            {mode === 'login' ? 'Nexus BlockBank Portal' : 'Open Institutional Account'}
          </h2>
          <p style={{ color: 'var(--text-secondary)', fontSize: '0.82rem', marginTop: '0.35rem' }}>
            Sepolia zk-Rollup · ZK-KYC Protocol · EIP-712 Secured
          </p>
        </div>

        {/* Mode toggle */}
        <div style={{
          display: 'grid', gridTemplateColumns: '1fr 1fr',
          background: 'var(--bg-page)', borderRadius: 12,
          padding: '0.25rem', marginBottom: '1.25rem',
          border: '1px solid var(--border)'
        }}>
          {[['login', 'Sign In', LogIn], ['signup', 'Register', UserPlus]].map(([m, label, Icon]) => (
            <button
              key={m}
              type="button"
              onClick={() => { setMode(m); setError(''); }}
              style={{
                padding: '0.6rem', border: 'none', borderRadius: 10,
                cursor: 'pointer', fontSize: '0.86rem',
                display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '0.4rem',
                background: mode === m ? 'var(--bg-card)' : 'transparent',
                color: mode === m ? '#1a9975' : 'var(--text-secondary)',
                fontWeight: mode === m ? 700 : 500,
                boxShadow: mode === m ? '0 2px 8px rgba(0,0,0,0.1), 0 0 10px rgba(26,153,117,0.15)' : 'none',
                transition: 'all 0.2s ease',
              }}
            >
              <Icon size={15} /> {label}
            </button>
          ))}
        </div>

        {/* Error */}
        {error && (
          <div style={{
            background: 'rgba(239,68,68,0.1)', border: '1px solid rgba(239,68,68,0.3)',
            color: '#ef4444', padding: '0.7rem 0.9rem', borderRadius: 10,
            marginBottom: '1rem', fontSize: '0.82rem', display: 'flex', alignItems: 'center', gap: '0.4rem'
          }}>
            <span>⚠️</span> {error}
          </div>
        )}

        {/* Form */}
        <form onSubmit={submit} style={{ display: 'flex', flexDirection: 'column', gap: '0.9rem' }}>
          <Labelled label="Username">
            <input
              style={fieldStyle}
              value={form.username}
              onChange={set('username')}
              placeholder="e.g. aarav_sharma"
              required
              autoComplete="username"
              onFocus={e => { e.target.style.borderColor = '#1a9975'; e.target.style.boxShadow = '0 0 15px rgba(26,153,117,0.25)'; }}
              onBlur={e => { e.target.style.borderColor = 'var(--border)'; e.target.style.boxShadow = 'none'; }}
            />
          </Labelled>

          <Labelled label="Password">
            <div style={{ position: 'relative' }}>
              <input
                style={{ ...fieldStyle, paddingRight: '2.5rem' }}
                type={showPassword ? 'text' : 'password'}
                value={form.password}
                onChange={set('password')}
                placeholder="••••••••••••"
                required
                autoComplete={mode === 'login' ? 'current-password' : 'new-password'}
                minLength={8}
                onFocus={e => { e.target.style.borderColor = '#1a9975'; e.target.style.boxShadow = '0 0 15px rgba(26,153,117,0.25)'; }}
                onBlur={e => { e.target.style.borderColor = 'var(--border)'; e.target.style.boxShadow = 'none'; }}
              />
              <button
                type="button"
                onClick={() => setShowPassword(!showPassword)}
                style={{
                  position: 'absolute', right: '0.75rem', top: '50%', transform: 'translateY(-50%)',
                  background: 'none', border: 'none', color: 'var(--text-muted)', cursor: 'pointer',
                  display: 'flex', alignItems: 'center', justifyContent: 'center', padding: 0
                }}
              >
                {showPassword ? <EyeOff size={16} /> : <Eye size={16} />}
              </button>
            </div>
          </Labelled>

          {mode === 'signup' && (
            <>
              <Labelled label="Full Legal Name">
                <input style={fieldStyle} value={form.full_name} onChange={set('full_name')} placeholder="Aarav Sharma" required
                  onFocus={e => { e.target.style.borderColor = '#1a9975'; e.target.style.boxShadow = '0 0 15px rgba(26,153,117,0.25)'; }}
                  onBlur={e => { e.target.style.borderColor = 'var(--border)'; e.target.style.boxShadow = 'none'; }} />
              </Labelled>
              <Labelled label="Institutional Email">
                <input style={fieldStyle} type="email" value={form.email} onChange={set('email')} placeholder="name@nexusbank.example" required
                  onFocus={e => { e.target.style.borderColor = '#1a9975'; e.target.style.boxShadow = '0 0 15px rgba(26,153,117,0.25)'; }}
                  onBlur={e => { e.target.style.borderColor = 'var(--border)'; e.target.style.boxShadow = 'none'; }} />
              </Labelled>
              <Labelled label="Department / Division">
                <input style={fieldStyle} value={form.department} onChange={set('department')} placeholder="Private Wealth & Digital Vault" required
                  onFocus={e => { e.target.style.borderColor = '#1a9975'; e.target.style.boxShadow = '0 0 15px rgba(26,153,117,0.25)'; }}
                  onBlur={e => { e.target.style.borderColor = 'var(--border)'; e.target.style.boxShadow = 'none'; }} />
              </Labelled>
            </>
          )}

          <button
            type="submit"
            disabled={busy}
            className="neon-glow-hover"
            style={{
              width: '100%', padding: '0.85rem',
              background: busy ? 'var(--border)' : 'linear-gradient(135deg, #1a9975, #127c5e)',
              color: '#fff', border: 'none', borderRadius: 12,
              fontWeight: 700, fontSize: '0.92rem', cursor: busy ? 'not-allowed' : 'pointer',
              display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '0.5rem',
              boxShadow: busy ? 'none' : '0 4px 18px rgba(26,153,117,0.4), 0 0 15px rgba(26,153,117,0.2)',
              transition: 'all 0.25s cubic-bezier(0.16,1,0.3,1)',
              marginTop: '0.35rem',
            }}
          >
            {busy ? 'Verifying Credentials…' : <>{mode === 'login' ? 'Authenticate & Sign In' : 'Create Customer Vault'} <ArrowRight size={17} /></>}
          </button>
        </form>

        <p style={{ textAlign: 'center', fontSize: '0.72rem', color: 'var(--text-muted)', marginTop: '1.1rem', marginBottom: '0.85rem' }}>
          Protected by ZK-Proof Biometric Telemetry · EIP-712 Signed Sessions
        </p>

        <div style={{ paddingTop: '0.85rem', borderTop: '1px solid var(--border)', textAlign: 'center' }}>
          <a
            href={window.location.port === '3000' ? 'http://localhost:3001' : '/admin'}
            style={{
              background: 'rgba(109, 40, 217, 0.08)',
              border: '1px solid rgba(109, 40, 217, 0.3)',
              color: '#8b5cf6',
              padding: '0.45rem 0.95rem',
              borderRadius: '10px',
              fontSize: '0.76rem',
              fontWeight: 700,
              textDecoration: 'none',
              display: 'inline-flex',
              alignItems: 'center',
              gap: '0.4rem',
              transition: 'all 0.2s ease'
            }}
            className="neon-purple-hover"
          >
            🛡️ Central Bank Regulatory Governance Portal (Port 3001)
          </a>
        </div>
      </div>
    </div>
  );
}

function Labelled({ label, children }) {
  return (
    <label style={{ display: 'block' }}>
      <span style={{
        display: 'block', fontSize: '0.72rem', color: 'var(--text-secondary)',
        marginBottom: '0.3rem', fontWeight: 600,
        textTransform: 'uppercase', letterSpacing: '0.05em'
      }}>
        {label}
      </span>
      {children}
    </label>
  );
}
