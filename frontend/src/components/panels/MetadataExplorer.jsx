import React, { useState, useEffect } from 'react';
import { Database, ShieldCheck, Lock, Cpu, Search, CheckCircle2, Copy } from 'lucide-react';
import { api } from '../../api';

export default function MetadataExplorer({ initialMetadata, onClose }) {
  const [objectIdInput, setObjectIdInput] = useState('');
  const [metadata, setMetadata] = useState(initialMetadata || null);
  const [loading, setLoading] = useState(false);
  const [copied, setCopied] = useState(false);

  useEffect(() => {
    if (initialMetadata) {
      setMetadata(initialMetadata);
    } else {
      fetchDefaultMetadata();
    }
  }, [initialMetadata]);

  const fetchDefaultMetadata = async () => {
    try {
      setLoading(true);
      const res = await api('/api/banking/overview');
      if (res.customer?.metadata) {
        setMetadata(res.customer.metadata);
      }
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  const handleSearch = async (e) => {
    e.preventDefault();
    if (!objectIdInput.trim()) return;
    try {
      setLoading(true);
      const res = await api(`/api/banking/metadata/${objectIdInput.trim()}`);
      setMetadata(res.metadata);
    } catch (err) {
      alert('Failed to fetch object metadata: ' + err.message);
    } finally {
      setLoading(false);
    }
  };

  const copyJSON = () => {
    navigator.clipboard.writeText(JSON.stringify(metadata, null, 2));
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '1.5rem' }}>
      {/* Header & Search Bar */}
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
        <div>
          <h2 style={{ fontSize: '1.25rem', fontWeight: 800, color: '#1a2332', margin: 0, display: 'flex', alignItems: 'center', gap: '0.6rem' }}>
            <Database color="#1a9975" size={22} /> 60+ Field Blockchain Asset Inspector
          </h2>
          <div style={{ fontSize: '0.78rem', color: '#9ca3af', marginTop: '0.2rem' }}>
            Complete cryptographic, consensus, governance, security & compliance fields.
          </div>
        </div>

        {onClose && (
          <button onClick={onClose} style={{ background: '#f3f4f6', border: '1px solid #e8ecf0', borderRadius: '8px', color: '#6b7280', padding: '0.45rem 1rem', cursor: 'pointer', fontWeight: 600, fontSize: '0.85rem' }}>
            Close
          </button>
        )}
      </div>

      {/* Search Input */}
      <form onSubmit={handleSearch} style={{ display: 'flex', gap: '0.75rem' }}>
        <input
          type="text"
          placeholder="Enter Object ID (UUID) or Asset ID to inspect metadata..."
          value={objectIdInput}
          onChange={e => setObjectIdInput(e.target.value)}
          style={{ flex: 1, background: '#f8f9fb', border: '1.5px solid #e8ecf0', borderRadius: '10px', color: '#1a2332', padding: '0.7rem 1rem', fontSize: '0.85rem', outline: 'none' }}
          onFocus={e => { e.target.style.borderColor = '#1a9975'; }}
          onBlur={e => { e.target.style.borderColor = '#e8ecf0'; }}
        />
        <button type="submit" style={{ background: '#1a9975', border: 'none', borderRadius: '10px', color: '#fff', padding: '0.7rem 1.25rem', fontWeight: 600, cursor: 'pointer', display: 'flex', alignItems: 'center', gap: '0.4rem', boxShadow: '0 2px 10px rgba(26,153,117,0.25)' }}>
          <Search size={15} /> Fetch Asset
        </button>
      </form>

      {loading && <div style={{ color: '#1a9975', fontWeight: 500 }}>Inspecting Blockchain Ledger…</div>}

      {metadata && (
        <div style={{
          background: '#f8f9fb',
          border: '1px solid #e8ecf0',
          borderRadius: '14px',
          padding: '1.25rem',
        }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1rem', paddingBottom: '0.85rem', borderBottom: '1px solid #e8ecf0' }}>
            <div>
              <span style={{ fontSize: '0.7rem', color: '#1a9975', fontWeight: 700, textTransform: 'uppercase', letterSpacing: '0.05em' }}>
                Asset: {metadata.object_name} ({metadata.asset_id})
              </span>
              <h3 style={{ fontSize: '1rem', color: '#1a2332', margin: '0.2rem 0', fontWeight: 700 }}>
                Object ID: {metadata.object_id}
              </h3>
            </div>

            <button onClick={copyJSON} style={{ background: copied ? 'rgba(16,185,129,0.1)' : '#f3f4f6', border: `1px solid ${copied ? 'rgba(16,185,129,0.3)' : '#e8ecf0'}`, borderRadius: '8px', color: copied ? '#059669' : '#6b7280', padding: '0.4rem 0.85rem', fontSize: '0.75rem', cursor: 'pointer', display: 'flex', alignItems: 'center', gap: '0.35rem', fontWeight: 600 }}>
              <Copy size={13} /> {copied ? 'Copied!' : 'Copy JSON'}
            </button>
          </div>

          {/* Grid of all 60+ metadata attributes */}
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(260px, 1fr))', gap: '0.75rem', maxHeight: '520px', overflowY: 'auto', paddingRight: '0.25rem' }}>
            {Object.entries(metadata).map(([key, val]) => (
              <div key={key} style={{
                background: '#fff',
                border: '1px solid #e8ecf0',
                borderRadius: '10px',
                padding: '0.75rem',
                fontSize: '0.78rem'
              }}>
                <div style={{ color: '#9ca3af', fontSize: '0.65rem', textTransform: 'uppercase', fontWeight: 700, letterSpacing: '0.05em', marginBottom: '0.25rem' }}>
                  {key.replace(/_/g, ' ')}
                </div>
                <div style={{ color: '#1a2332', fontWeight: 600, wordBreak: 'break-all', fontFamily: typeof val === 'string' && val.startsWith('0x') ? 'monospace' : 'inherit', fontSize: '0.8rem' }}>
                  {typeof val === 'object' ? JSON.stringify(val) : String(val)}
                </div>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}
