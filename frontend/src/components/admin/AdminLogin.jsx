import React, { useState } from 'react';
import { ShieldAlert, ArrowRight, Lock, Landmark, Eye, EyeOff } from 'lucide-react';
import { api, setToken } from '../../api';

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

// There is deliberately no signup path here. Administrator credentials are provisioned in the
// backend seed; /auth/user-signup can only ever mint customers, so this portal has no
// self-service door. A client-portal account that tries to sign in is refused with 403 and
// the attempt is written to the audit trail.
export default function AdminLogin({ onAuthSuccess }) {
  const [form, setForm] = useState({ username: '', password: '' });
  const [showPassword, setShowPassword] = useState(false);
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState('');

  const set = (k) => (e) => setForm({ ...form, [k]: e.target.value });

  const submit = async (e) => {
    e.preventDefault();
    setBusy(true);
    setError('');
    try {
      const data = await api('/auth/admin-login', { method: 'POST', body: JSON.stringify(form) });
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
      position: 'fixed', inset: 0, zIndex: 2000,
      background: 'rgba(20,30,48,0.6)',
      backdropFilter: 'blur(8px)',
      display: 'flex', alignItems: 'center', justifyContent: 'center', padding: '1.5rem',
    }}>
      <div style={{
        background: 'var(--bg-card)',
        borderRadius: 20,
        padding: '2.25rem',
        width: '100%', maxWidth: 420,
        boxShadow: 'var(--shadow-lg)',
        border: '1px solid var(--border)',
        animation: 'modalSlideUp 0.28s cubic-bezier(0.16,1,0.3,1)',
      }}>
        {/* Logo + title */}
        <div style={{ textAlign: 'center', marginBottom: '1.75rem' }}>
          <div style={{
            display: 'inline-flex', padding: '0.9rem',
            background: 'rgba(109,40,217,0.09)', borderRadius: 18, marginBottom: '0.9rem',
            border: '1px solid rgba(109,40,217,0.2)',
          }}>
            <ShieldAlert size={30} color="#6d28d9" />
          </div>
          <h2 style={{ fontSize: '1.35rem', fontWeight: 800, color: 'var(--text-main)', margin: 0 }}>
            Regulatory Admin Console
          </h2>
          <p style={{ color: 'var(--text-muted)', fontSize: '0.82rem', marginTop: '0.3rem' }}>
            Reserve Bank Governor Node · Port 3001
          </p>
        </div>

        {/* Error */}
        {error && (
          <div style={{
            background: '#fef2f2', border: '1px solid #fecaca',
            color: '#b91c1c', padding: '0.65rem 0.85rem', borderRadius: 8,
            marginBottom: '1rem', fontSize: '0.82rem',
          }}>
            {error}
          </div>
        )}

        {/* Form */}
        <form onSubmit={submit} style={{ display: 'flex', flexDirection: 'column', gap: '0.85rem' }}>
          <label style={{ display: 'block' }}>
            <span style={{ display: 'block', fontSize: '0.72rem', color: 'var(--text-secondary)', marginBottom: '0.3rem', fontWeight: 600, textTransform: 'uppercase', letterSpacing: '0.05em' }}>
              Administrator ID
            </span>
            <input
              style={fieldStyle}
              value={form.username}
              onChange={set('username')}
              required
              autoComplete="username"
              onFocus={e => { e.target.style.borderColor = '#6d28d9'; e.target.style.boxShadow = '0 0 0 3px rgba(109,40,217,0.1)'; }}
              onBlur={e => { e.target.style.borderColor = 'var(--border)'; e.target.style.boxShadow = 'none'; }}
            />
          </label>

          <label style={{ display: 'block' }}>
            <span style={{ display: 'block', fontSize: '0.72rem', color: 'var(--text-secondary)', marginBottom: '0.3rem', fontWeight: 600, textTransform: 'uppercase', letterSpacing: '0.05em' }}>
              Secure Password
            </span>
            <div style={{ position: 'relative' }}>
              <input
                style={{ ...fieldStyle, paddingRight: '2.5rem' }}
                type={showPassword ? 'text' : 'password'}
                value={form.password}
                onChange={set('password')}
                required
                autoComplete="current-password"
                onFocus={e => { e.target.style.borderColor = '#6d28d9'; e.target.style.boxShadow = '0 0 0 3px rgba(109,40,217,0.1)'; }}
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
          </label>

          <button
            type="submit"
            disabled={busy}
            style={{
              width: '100%', padding: '0.75rem',
              background: busy ? '#9ca3af' : '#6d28d9',
              color: '#fff', border: 'none', borderRadius: 10,
              fontWeight: 700, fontSize: '0.9rem',
              cursor: busy ? 'not-allowed' : 'pointer',
              display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '0.5rem',
              boxShadow: busy ? 'none' : '0 4px 14px rgba(109,40,217,0.3)',
              transition: 'all 0.18s ease',
              marginTop: '0.2rem',
            }}
          >
            {busy ? 'Verifying Authority…' : <>Enter Console <ArrowRight size={16} /></>}
          </button>
        </form>

        <p style={{
          fontSize: '0.72rem', color: '#9ca3af', marginTop: '1.1rem', marginBottom: '0.75rem',
          textAlign: 'center', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '0.35rem',
        }}>
          <Lock size={11} /> Client portal accounts cannot access this console.
        </p>

        <div style={{ paddingTop: '0.75rem', borderTop: '1px solid var(--border)', textAlign: 'center' }}>
          <a
            href={window.location.port === '3001' ? 'http://localhost:3000' : '/'}
            style={{
              background: 'rgba(26, 153, 117, 0.08)',
              border: '1px solid rgba(26, 153, 117, 0.25)',
              color: '#1a9975',
              padding: '0.4rem 0.85rem',
              borderRadius: '8px',
              fontSize: '0.75rem',
              fontWeight: 600,
              textDecoration: 'none',
              display: 'inline-flex',
              alignItems: 'center',
              gap: '0.35rem',
              transition: 'all 0.15s ease'
            }}
          >
            🏦 Go to Customer Banking Portal (Port 3000)
          </a>
        </div>
      </div>
    </div>
  );
}
