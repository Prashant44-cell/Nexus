import React, { useState, useEffect } from 'react';
import { Server, ShieldCheck, Cpu, RefreshCw, Layers } from 'lucide-react';
import { api } from '../../api';

export default function ValidatorNodesPanel() {
  const [nodes, setNodes] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchNodes();
  }, []);

  const fetchNodes = async () => {
    try {
      setLoading(true);
      const data = await api('/api/blockchain/nodes');
      setNodes(data.active_validators || []);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  if (loading) return <div style={{ color: '#a78bfa', padding: '2rem' }}>Loading Consortium Nodes...</div>;

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '1.5rem' }}>
      <div>
        <h2 style={{ fontSize: '1.4rem', fontWeight: 800, color: '#f8fafc', margin: 0 }}>
          Consortium Validator Nodes & Channel Governance
        </h2>
        <div style={{ fontSize: '0.8rem', color: '#94a3b8' }}>
          Manage permissioned bank validator nodes and IBFT 2.0 consensus parameters.
        </div>
      </div>

      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(320px, 1fr))', gap: '1.25rem' }}>
        {nodes.map(n => (
          <div key={n.id} style={{
            background: 'rgba(15, 23, 42, 0.85)',
            border: '1px solid rgba(139, 92, 246, 0.3)',
            borderRadius: '16px',
            padding: '1.4rem',
            backdropFilter: 'blur(16px)'
          }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
              <span style={{ fontSize: '0.72rem', fontWeight: 700, color: '#a78bfa' }}>{n.id}</span>
              <Server size={20} color="#a78bfa" />
            </div>

            <h3 style={{ fontSize: '1.2rem', color: '#f8fafc', margin: '0.5rem 0 0.2rem 0' }}>{n.name}</h3>
            <div style={{ fontSize: '0.75rem', color: '#64748b' }}>Channel: org1.nexusbank.rbi</div>

            <div style={{ margin: '1rem 0', background: 'rgba(0,0,0,0.2)', padding: '0.75rem', borderRadius: '10px', fontSize: '0.75rem', color: '#94a3b8' }}>
              <div>Consensus: <span style={{ color: '#10b981' }}>IBFT 2.0 PBFT</span></div>
              <div>Block Finality: <span style={{ color: '#38bdf8' }}>Immediate (0.4s)</span></div>
              <div>Network Latency: <span style={{ color: '#f8fafc' }}>{n.latency_ms}ms</span></div>
            </div>

            <button style={{ width: '100%', background: 'rgba(139, 92, 246, 0.15)', border: '1px solid #8b5cf6', color: '#c084fc', borderRadius: '8px', padding: '0.5rem', fontWeight: 600, fontSize: '0.8rem', cursor: 'pointer' }}>
              Inspect Node Credentials & Keys
            </button>
          </div>
        ))}
      </div>
    </div>
  );
}
