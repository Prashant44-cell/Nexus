import { useState, useEffect, useCallback } from 'react';

// Admin session token, set once at login. In memory only — never localStorage, so an XSS
// payload can't read a high-privilege token back out of storage.
let authToken = null;
export const setToken = (t) => { authToken = t; };

const configuredApiBase = (import.meta.env.VITE_API_BASE_URL || '').replace(/\/$/, '');
const apiBase = configuredApiBase || '/api';

export async function api(path, options = {}) {
  const res = await fetch(`${apiBase}${path}`, {
    ...options,
    headers: {
      'Content-Type': 'application/json',
      ...(authToken ? { Authorization: `Bearer ${authToken}` } : {}),
      ...options.headers,
    },
  });
  const body = await res.json().catch(() => ({}));
  if (!res.ok) throw new Error(body.detail || `${res.status} ${res.statusText}`);
  return body;
}

// Every admin panel reads from this one endpoint.
// ponytail: polling, not a socket — nothing here needs sub-second freshness.
// `enabled` gates it on having a token: polling while logged out would just spray
// 403s into the audit trail, and flipping it true fires an immediate first load
// rather than leaving the console blank until the next tick.
export function useRiskSummary(enabled, intervalMs = 5000) {
  const [data, setData] = useState(null);
  const [error, setError] = useState(null);

  const load = useCallback(async () => {
    try {
      const d = await api('/admin/risk-summary');
      setData(d);
      setError(null);
    } catch (e) {
      // No mock fallback. An admin acting on invented figures is worse than one seeing an error.
      setError(e.message);
    }
  }, []);

  useEffect(() => {
    if (!enabled) return;
    load();
    const id = setInterval(load, intervalMs);
    return () => clearInterval(id);
  }, [enabled, load, intervalMs]);

  return { data, error, reload: load };
}

export const fmtTime = (ts) =>
  ts ? new Date(ts * 1000).toLocaleString('en-IN', { hour12: false }) : '—';

export const riskClass = (r) =>
  r === 'low' ? 'badge-low' : r === 'medium' ? 'badge-medium' : 'badge-high';

export const scoreColor = (s) => (s >= 80 ? '#10b981' : s >= 50 ? '#f59e0b' : '#ef4444');
