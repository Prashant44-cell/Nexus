import React, { useState, useEffect } from 'react';
import { Landmark, Server, Activity, ShieldCheck, Cpu, Database, ArrowUpRight, TrendingUp } from 'lucide-react';
import { api } from '../../../api';

export default function BankingAdminDashboard() {
  const [nodeData, setNodeData] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => { fetchNodeData(); }, []);

  const fetchNodeData = async () => {
    try {
      setLoading(true);
      const data = await api('/api/blockchain/nodes');
      setNodeData(data);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return (
      <div style={{ display: 'flex', flexDirection: 'column', gap: '1.25rem' }}>
        {[...Array(3)].map((_, i) => (
          <div key={i} className="skeleton" style={{ height: i === 0 ? 80 : 120, borderRadius: 16 }} />
        ))}
      </div>
    );
  }

  const kpiCards = [
    {
      label: 'Network Throughput',
      value: `${nodeData?.tps} TPS`,
      sub: 'Sub-second PBFT Block Latency',
      icon: Activity,
      color: '#6d28d9',
      bg: 'rgba(109,40,217,0.09)',
    },
    {
      label: 'Active Validator Nodes',
      value: `${nodeData?.active_validators?.length} Nodes`,
      sub: 'RBI, HDFC, SBI, ICICI Synced',
      icon: Server,
      color: '#1a9975',
      bg: 'rgba(26,153,117,0.09)',
    },
    {
      label: 'ZK Prover Engine',
      value: nodeData?.zero_knowledge_verifier,
      sub: 'EIP-712 Signature Enforcement',
      icon: Cpu,
      color: '#f0a500',
      bg: 'rgba(240,165,0,0.09)',
    },
  ];

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '1.25rem' }}>

      {/* ── Command Header Banner ── */}
      <div style={{
        background: 'linear-gradient(135deg, #6d28d9 0%, #1a9975 100%)',
        borderRadius: 16, padding: '1.5rem',
        display: 'flex', justifyContent: 'space-between', alignItems: 'center',
        boxShadow: '0 6px 24px rgba(109,40,217,0.22)',
        position: 'relative', overflow: 'hidden',
      }}>
        {/* Decorative circles */}
        <div style={{ position: 'absolute', top: -30, right: 80, width: 120, height: 120, borderRadius: '50%', background: 'rgba(255,255,255,0.08)', pointerEvents: 'none' }} />
        <div style={{ position: 'absolute', bottom: -20, right: -20, width: 90, height: 90, borderRadius: '50%', background: 'rgba(255,255,255,0.06)', pointerEvents: 'none' }} />

        <div style={{ position: 'relative', zIndex: 1 }}>
          <div style={{ fontSize: '0.7rem', color: 'rgba(255,255,255,0.75)', textTransform: 'uppercase', letterSpacing: '0.08em', fontWeight: 700, marginBottom: '0.35rem' }}>
            Reserve Bank Regulatory Node Command Center
          </div>
          <h2 style={{ fontSize: '1.55rem', fontWeight: 800, color: '#fff', margin: '0 0 0.3rem 0' }}>
            Hyperledger Besu Enterprise Consortium
          </h2>
          <div style={{ fontSize: '0.8rem', color: 'rgba(255,255,255,0.78)', display: 'flex', alignItems: 'center', gap: '1rem' }}>
            <span>Consensus: <strong style={{ color: '#a7f3d0' }}>{nodeData?.consensus}</strong></span>
            <span>Block Height: <strong style={{ color: '#ddd6fe' }}>#{nodeData?.block_height}</strong></span>
          </div>
        </div>

        <div style={{
          background: 'rgba(16,185,129,0.2)', border: '1px solid rgba(16,185,129,0.5)',
          borderRadius: 10, padding: '0.65rem 1rem',
          color: '#fff', fontWeight: 700, fontSize: '0.82rem',
          backdropFilter: 'blur(10px)', position: 'relative', zIndex: 1,
        }}>
          ● NETWORK: 100% OPERATIONAL
        </div>
      </div>

      {/* ── KPI Cards ── */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(210px, 1fr))', gap: '1rem' }}>
        {kpiCards.map(({ label, value, sub, icon: Icon, color, bg }) => (
          <div
            key={label}
            style={{
              background: '#fff', border: '1px solid #e8ecf0',
              borderRadius: 14, padding: '1.2rem',
              boxShadow: '0 2px 10px rgba(0,0,0,0.06)',
              transition: 'box-shadow 0.2s ease, transform 0.2s ease',
            }}
            onMouseEnter={e => { e.currentTarget.style.boxShadow = '0 6px 20px rgba(0,0,0,0.1)'; e.currentTarget.style.transform = 'translateY(-2px)'; }}
            onMouseLeave={e => { e.currentTarget.style.boxShadow = '0 2px 10px rgba(0,0,0,0.06)'; e.currentTarget.style.transform = 'none'; }}
          >
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '0.6rem' }}>
              <span style={{ fontSize: '0.7rem', fontWeight: 700, textTransform: 'uppercase', letterSpacing: '0.05em', color: '#9ca3af' }}>
                {label}
              </span>
              <div style={{ width: 34, height: 34, borderRadius: 9, background: bg, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                <Icon size={17} color={color} />
              </div>
            </div>
            <div style={{ fontSize: '1.55rem', fontWeight: 800, color: '#1a2332', lineHeight: 1.1 }}>{value}</div>
            <div style={{ fontSize: '0.7rem', color, marginTop: '0.35rem', fontWeight: 500 }}>{sub}</div>
          </div>
        ))}
      </div>

      {/* ── Validator Nodes Grid ── */}
      <div style={{
        background: '#fff', border: '1px solid #e8ecf0',
        borderRadius: 16, padding: '1.25rem',
        boxShadow: '0 2px 10px rgba(0,0,0,0.06)',
      }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1rem' }}>
          <h3 style={{ fontSize: '0.95rem', fontWeight: 700, color: '#1a2332', margin: 0 }}>
            Enterprise Validator Node Topology
          </h3>
          <span style={{
            fontSize: '0.72rem', color: '#1a9975', background: 'rgba(26,153,117,0.1)',
            padding: '0.22rem 0.65rem', borderRadius: 9999, fontWeight: 600,
            border: '1px solid rgba(26,153,117,0.2)',
          }}>
            PBFT Consensus
          </span>
        </div>

        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(260px, 1fr))', gap: '0.85rem' }}>
          {nodeData?.active_validators?.map(v => (
            <div key={v.id} style={{
              background: '#f8f9fb', border: '1px solid #e8ecf0',
              borderRadius: 12, padding: '1rem',
              display: 'flex', justifyContent: 'space-between', alignItems: 'center',
              transition: 'box-shadow 0.2s ease',
            }}
              onMouseEnter={e => e.currentTarget.style.boxShadow = '0 4px 12px rgba(0,0,0,0.08)'}
              onMouseLeave={e => e.currentTarget.style.boxShadow = 'none'}
            >
              <div>
                <span style={{ fontSize: '0.68rem', color: '#6d28d9', fontWeight: 700, textTransform: 'uppercase' }}>{v.id}</span>
                <h4 style={{ fontSize: '0.9rem', color: '#1a2332', margin: '0.2rem 0', fontWeight: 600 }}>{v.name}</h4>
                <span style={{ fontSize: '0.7rem', color: '#1a9975', fontWeight: 500 }}>Latency: {v.latency_ms}ms</span>
              </div>
              <span style={{
                fontSize: '0.7rem', background: 'rgba(16,185,129,0.1)',
                color: '#059669', padding: '0.22rem 0.65rem', borderRadius: 9999,
                fontWeight: 700, border: '1px solid rgba(16,185,129,0.2)',
              }}>
                ONLINE
              </span>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}

