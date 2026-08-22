import { useState, useEffect, useCallback } from 'react';

// Auth tokens — kept in memory only, never localStorage.
// Separate variables so a client token cannot accidentally be used for admin requests.
let authToken = null;
let adminToken = null;

export const setToken = (t) => { authToken = t; adminToken = t; };
export const setClientToken = (t) => { authToken = t; };
export const setAdminToken = (t) => { adminToken = t; };

const configuredApiBase = (import.meta.env.VITE_API_BASE_URL || '').trim().replace(/\/$/, '');
const apiBase = configuredApiBase;

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

export function getWebSocketUrl(path, ticket) {
  const configuredWsBase = (import.meta.env.VITE_WS_BASE_URL || '').trim().replace(/\/$/, '');
  const derivedApiWsBase = configuredApiBase.replace(/^http/, 'ws');
  const sameOriginWsBase = `${window.location.protocol === 'https:' ? 'wss:' : 'ws:'}//${window.location.host}`;
  const base = configuredWsBase || derivedApiWsBase || sameOriginWsBase;
  const separator = path.includes('?') ? '&' : '?';
  return `${base}${path}${separator}ticket=${encodeURIComponent(ticket)}`;
}

// ─── Client portal hook ───────────────────────────────────────────────────────
// Every client panel reads from this one endpoint.
// Polling, not a socket — the trust stream already has its own WS.
export function useOverview(intervalMs = 4000) {
  const [data, setData] = useState(null);
  const [error, setError] = useState(null);

  useEffect(() => {
    let alive = true;
    const load = async () => {
      try {
        const d = await api('/institution/overview');
        if (alive) { setData(d); setError(null); }
      } catch (e) {
        if (alive) setError(e.message);
      }
    };
    load();
    const id = setInterval(load, intervalMs);
    return () => { alive = false; clearInterval(id); };
  }, [intervalMs]);

  return { data, error };
}

// ─── Admin portal hook ────────────────────────────────────────────────────────
// `enabled` gates polling on having a token: polling while logged out would spray
// 403s into the audit trail, and flipping it true fires an immediate first load.
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

// ─── Shared utilities ─────────────────────────────────────────────────────────
export const fmtTime = (ts) =>
  ts ? new Date(ts * 1000).toLocaleString('en-IN', { hour12: false }) : '—';

export const riskClass = (r) =>
  r === 'low' ? 'badge-low' : r === 'medium' ? 'badge-medium' : 'badge-high';

export const scoreColor = (s) => (s >= 80 ? '#10b981' : s >= 50 ? '#f59e0b' : '#ef4444');

export function downloadCSV(filename, rows) {
  if (!rows.length) return;
  const cols = Object.keys(rows[0]);
  const esc = (v) => `"${String(v ?? '').replace(/"/g, '""')}"`;
  const csv = [cols.join(','), ...rows.map((r) => cols.map((c) => esc(r[c])).join(','))].join('\n');
  const url = URL.createObjectURL(new Blob([csv], { type: 'text/csv' }));
  const a = document.createElement('a');
  a.href = url;
  a.download = filename;
  a.click();
  URL.revokeObjectURL(url);
}
