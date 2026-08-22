import React, { useState, useEffect } from 'react';
import { ShieldCheck, Lock, Database, CheckCircle2, Cpu, Eye } from 'lucide-react';
import { api } from '../../api';

export default function KYCIdentityPanel({ onInspectMetadata }) {
  const [kycList, setKycList] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchKYC();
  }, []);

  const fetchKYC = async () => {
    try {
      setLoading(true);
      const res = await api('/api/banking/kyc');
      setKycList(res.kyc || []);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  if (loading) return <div style={{ color: '#06b6d4', padding: '2rem' }}>Loading ZK-KYC Vault...</div>;

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '1.5rem' }}>
      <div>
        <h2 style={{ fontSize: '1.4rem', fontWeight: 800, color: '#f8fafc', margin: 0 }}>
          Zero-Knowledge RBI KYC & Biometric Identity Vault
        </h2>
        <div style={{ fontSize: '0.8rem', color: '#94a3b8' }}>
          Identity assertions (Aadhaar ZK, PAN ZK) stored on-chain without exposing plain biometrics or private credentials.
        </div>
      </div>

      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(320px, 1fr))', gap: '1.25rem' }}>
        {kycList.map(item => (
          <div key={item.kyc_id} style={{
            background: 'rgba(15, 23, 42, 0.85)',
            border: '1px solid rgba(16, 185, 129, 0.3)',
            borderRadius: '16px',
            padding: '1.4rem',
            backdropFilter: 'blur(16px)',
            boxShadow: '0 8px 32px rgba(0,0,0,0.3)',
            display: 'flex',
            flexDirection: 'column',
            justify: 'space-between'
          }}>
            <div>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                <span style={{ fontSize: '0.72rem', fontWeight: 700, color: '#10b981', textTransform: 'uppercase' }}>
                  {item.status}
                </span>
                <ShieldCheck size={24} color="#10b981" />
              </div>

              <h3 style={{ fontSize: '1.2rem', fontWeight: 700, color: '#f8fafc', margin: '0.6rem 0 0.2rem 0' }}>
                {item.document_type}
              </h3>
              <div style={{ fontSize: '0.75rem', color: '#64748b' }}>KYC Asset ID: {item.kyc_id}</div>

              <div style={{ margin: '1rem 0', background: 'rgba(0,0,0,0.25)', border: '1px solid rgba(255,255,255,0.06)', borderRadius: '10px', padding: '0.75rem', fontSize: '0.75rem', color: '#94a3b8' }}>
                <div style={{ marginBottom: '0.3rem' }}>Zero-Knowledge Proof Hash:</div>
                <div style={{ color: '#06b6d4', wordBreak: 'break-all', fontFamily: 'monospace' }}>{item.verification_hash}</div>
              </div>
            </div>

            <button
              onClick={() => onInspectMetadata && onInspectMetadata(item.metadata)}
              style={{ background: 'rgba(255,255,255,0.05)', border: '1px solid rgba(255,255,255,0.1)', borderRadius: '8px', color: '#38bdf8', padding: '0.55rem', fontWeight: 600, fontSize: '0.8rem', cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '0.4rem' }}
            >
              <Database size={14} /> Inspect ZK Proof Metadata
            </button>
          </div>
        ))}
      </div>
    </div>
  );
}
