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
      background: 'rgba(20,30,48,0.55)',
      backdropFilter: 'blur(8px)',
      display: 'flex', alignItems: 'center', justifyContent: 'center',
      padding: '1rem',
    }}>
      <div style={{
        background: 'var(--bg-card)',
        borderRadius: 20,
        padding: '2.25rem',
        width: '100%', maxWidth: 440,
        boxShadow: 'var(--shadow-lg)',
        border: '1px solid var(--border)',
        animation: 'modalSlideUp 0.28s cubic-bezier(0.16,1,0.3,1)',
      }}>
        {/* Logo + title */}
        <div style={{ textAlign: 'center', marginBottom: '1.5rem' }}>
          <div style={{
            display: 'inline-flex', padding: '0.85rem',
            background: 'rgba(26,153,117,0.1)',
            borderRadius: 16, marginBottom: '0.85rem',
            border: '1px solid rgba(26,153,117,0.2)'
          }}>
            <Landmark size={30} color="#1a9975" />
          </div>
          <h2 style={{ fontSize: '1.35rem', fontWeight: 800, color: 'var(--text-main)', margin: 0 }}>
            {mode === 'login' ? 'Welcome to Nexus BlockBank' : 'Create Your Account'}
          </h2>
          <p style={{ color: 'var(--text-muted)', fontSize: '0.82rem', marginTop: '0.3rem' }}>
            Hyperledger Besu · ZK-KYC · EIP-712 Secured
          </p>
        </div>

        {/* Mode toggle */}
        <div style={{
          display: 'grid', gridTemplateColumns: '1fr 1fr',
          background: 'var(--bg-page)', borderRadius: 10,
          padding: '0.2rem', marginBottom: '1.25rem',
        }}>
          {[['login', 'Sign In', LogIn], ['signup', 'Register', UserPlus]].map(([m, label, Icon]) => (
            <button
              key={m}
              type="button"
              onClick={() => { setMode(m); setError(''); }}
              style={{
                padding: '0.55rem', border: 'none', borderRadius: 8,
                cursor: 'pointer', fontSize: '0.85rem',
                display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '0.35rem',
                background: mode === m ? 'var(--bg-card)' : 'transparent',
                color: mode === m ? '#1a9975' : 'var(--text-muted)',
                fontWeight: mode === m ? 700 : 500,
                boxShadow: mode === m ? '0 1px 4px rgba(0,0,0,0.08)' : 'none',
                transition: 'all 0.18s ease',
              }}
            >
              <Icon size={14} /> {label}
            </button>
          ))}
        </div>

        {/* Error */}
        {error && (
          <div style={{
            background: 'rgba(239,68,68,0.08)', border: '1px solid rgba(239,68,68,0.2)',
            color: '#dc2626', padding: '0.65rem 0.85rem', borderRadius: 8,
            marginBottom: '1rem', fontSize: '0.82rem'
          }}>
            {error}
          </div>
        )}

        {/* Form */}
        <form onSubmit={submit} style={{ display: 'flex', flexDirection: 'column', gap: '0.85rem' }}>
          <Labelled label="Username">
            <input
              style={fieldStyle}
              value={form.username}
              onChange={set('username')}
              required
              autoComplete="username"
              onFocus={e => { e.target.style.borderColor = '#1a9975'; e.target.style.boxShadow = '0 0 0 3px rgba(26,153,117,0.12)'; }}
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
                required
                autoComplete={mode === 'login' ? 'current-password' : 'new-password'}
                minLength={8}
                onFocus={e => { e.target.style.borderColor = '#1a9975'; e.target.style.boxShadow = '0 0 0 3px rgba(26,153,117,0.12)'; }}
                onBlur={e => { e.target.style.borderColor = 'var(--border)'; e.target.style.boxShadow = 'none'; }}
              />
              <button
                type="button"
                onClick={() => setShowPassword(!showPassword)}
                style={{
                  position: 'absolute', right: '0.75rem', top: '50%', transform: 'translateY(-50%)',
                  background: 'none', border: 'none', color: '#9ca3af', cursor: 'pointer',
                  display: 'flex', alignItems: 'center', justifyContent: 'center', padding: 0
                }}
              >
                {showPassword ? <EyeOff size={16} /> : <Eye size={16} />}
              </button>
            </div>
          </Labelled>

          {mode === 'signup' && (
            <>
              <Labelled label="Full Name">
                <input style={fieldStyle} value={form.full_name} onChange={set('full_name')} required
                  onFocus={e => { e.target.style.borderColor = '#1a9975'; e.target.style.boxShadow = '0 0 0 3px rgba(26,153,117,0.12)'; }}
                  onBlur={e => { e.target.style.borderColor = 'var(--border)'; e.target.style.boxShadow = 'none'; }} />
              </Labelled>
              <Labelled label="Institutional Email">
                <input style={fieldStyle} type="email" value={form.email} onChange={set('email')} required
                  onFocus={e => { e.target.style.borderColor = '#1a9975'; e.target.style.boxShadow = '0 0 0 3px rgba(26,153,117,0.12)'; }}
                  onBlur={e => { e.target.style.borderColor = 'var(--border)'; e.target.style.boxShadow = 'none'; }} />
              </Labelled>
              <Labelled label="Department">
                <input style={fieldStyle} value={form.department} onChange={set('department')} required
                  onFocus={e => { e.target.style.borderColor = '#1a9975'; e.target.style.boxShadow = '0 0 0 3px rgba(26,153,117,0.12)'; }}
                  onBlur={e => { e.target.style.borderColor = 'var(--border)'; e.target.style.boxShadow = 'none'; }} />
              </Labelled>
            </>
          )}

          <button
            type="submit"
            disabled={busy}
            style={{
              width: '100%', padding: '0.75rem',
              background: busy ? '#9ca3af' : '#1a9975',
              color: '#fff', border: 'none', borderRadius: 10,
              fontWeight: 700, fontSize: '0.9rem', cursor: busy ? 'not-allowed' : 'pointer',
              display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '0.5rem',
              boxShadow: busy ? 'none' : '0 4px 14px rgba(26,153,117,0.3)',
              transition: 'all 0.18s ease',
              marginTop: '0.2rem',
            }}
          >
            {busy ? 'Verifying…' : <>{mode === 'login' ? 'Sign In' : 'Create Account'} <ArrowRight size={16} /></>}
          </button>
        </form>

        <p style={{ textAlign: 'center', fontSize: '0.72rem', color: 'var(--text-muted)', marginTop: '1rem' }}>
          Protected by ZK-Proof Biometric Authentication · EIP-712 Signed Sessions
        </p>
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
