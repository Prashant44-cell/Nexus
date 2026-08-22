import React, { useState, useEffect } from 'react';
import { Code, ShieldCheck, Database, Play } from 'lucide-react';
import { api } from '../../../api';

export default function SmartContractRegistry() {
  const [contracts, setContracts] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchContracts();
  }, []);

  const fetchContracts = async () => {
    try {
      setLoading(true);
      const data = await api('/api/blockchain/contracts');
      setContracts(data.contracts || []);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  if (loading) return <div style={{ color: '#a78bfa', padding: '2rem' }}>Loading Deployed Smart Contracts...</div>;

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '1.5rem' }}>
      <div>
        <h2 style={{ fontSize: '1.4rem', fontWeight: 800, color: '#f8fafc', margin: 0 }}>
          Deployed Banking Smart Contracts & ABI Registry
        </h2>
        <div style={{ fontSize: '0.8rem', color: '#94a3b8' }}>
          On-chain bytecode contracts executing Escrows, Instant UPI Finality, ZK-KYC Proofs, and Auto-EMI Loans.
        </div>
      </div>

      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(340px, 1fr))', gap: '1.25rem' }}>
        {contracts.map(c => (
          <div key={c.address} style={{
            background: 'rgba(15, 23, 42, 0.85)',
            border: '1px solid rgba(6, 182, 212, 0.3)',
            borderRadius: '16px',
            padding: '1.4rem',
            backdropFilter: 'blur(16px)',
            display: 'flex',
            flexDirection: 'column',
            justify: 'space-between'
          }}>
            <div>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                <span style={{ fontSize: '0.7rem', color: '#10b981', fontWeight: 700, textTransform: 'uppercase' }}>
                  {c.status}
                </span>
                <Code size={20} color="#06b6d4" />
              </div>

              <h3 style={{ fontSize: '1.2rem', color: '#f8fafc', margin: '0.5rem 0 0.2rem 0' }}>{c.name}</h3>
              <div style={{ fontSize: '0.72rem', color: '#06b6d4', fontFamily: 'monospace', wordBreak: 'break-all' }}>{c.address}</div>

              <div style={{ margin: '1rem 0' }}>
                <div style={{ fontSize: '0.72rem', color: '#64748b', marginBottom: '0.4rem' }}>Exported Methods (ABI):</div>
                <div style={{ display: 'flex', flexWrap: 'wrap', gap: '0.35rem' }}>
                  {c.methods.map(m => (
                    <span key={m} style={{ fontSize: '0.68rem', background: 'rgba(255,255,255,0.06)', color: '#38bdf8', padding: '0.2rem 0.5rem', borderRadius: '4px', fontFamily: 'monospace' }}>
                      {m}()
                    </span>
                  ))}
                </div>
              </div>
            </div>

            <button style={{ background: 'linear-gradient(135deg, #06b6d4, #3b82f6)', border: 'none', borderRadius: '8px', color: '#fff', padding: '0.55rem', fontWeight: 600, fontSize: '0.8rem', cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '0.35rem' }}>
              <Play size={14} /> Execute Contract Method
            </button>
          </div>
        ))}
      </div>
    </div>
  );
}

