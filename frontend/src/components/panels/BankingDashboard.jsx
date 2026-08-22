import React, { useState, useEffect } from 'react';
import {
  Landmark, Wallet, ShieldCheck, ArrowUpRight, ArrowDownLeft,
  Send, CreditCard, Cpu, Database, Award, Activity, TrendingUp, TrendingDown
} from 'lucide-react';
import { api } from '../../api';

export default function BankingDashboard({ onInspectMetadata }) {
  const [overview, setOverview] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => { fetchOverview(); }, []);

  const fetchOverview = async () => {
    try {
      setLoading(true);
      const res = await api('/api/banking/overview');
      setOverview(res);
    } catch (err) {
      setError(err.message || 'Failed to load banking overview.');
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return (
      <div style={{ display: 'flex', flexDirection: 'column', gap: '1.5rem' }}>
        {[...Array(3)].map((_, i) => (
          <div key={i} className="skeleton" style={{ height: i === 0 ? 80 : 120, borderRadius: 16 }} />
        ))}
      </div>
    );
  }

  if (error) {
    return (
      <div style={{
        background: '#fff', border: '1px solid #fee2e2', borderRadius: 16,
        padding: '1.5rem', color: '#dc2626', textAlign: 'center'
      }}>
        ⚠ {error}
      </div>
    );
  }

  const { customer, metrics, recent_transactions } = overview;

  const kpiCards = [
    {
      label: 'Fiat Balance (INR)',
      value: `₹${metrics?.total_fiat_inr?.toLocaleString('en-IN', { minimumFractionDigits: 2 })}`,
      sub: 'Smart Escrow Savings Active',
      icon: Wallet,
      color: '#1a9975',
      bg: 'rgba(26,153,117,0.09)',
      isMain: true,
    },
    {
      label: 'CBDC Vault (e-Rupee)',
      value: `₹${metrics?.total_cbdc_erupee?.toLocaleString('en-IN', { minimumFractionDigits: 2 })}`,
      sub: 'RBI Digital Token Finality',
      icon: Landmark,
      color: '#8b5cf6',
      bg: 'rgba(139,92,246,0.09)',
    },
    {
      label: 'Crypto Vault (ETH)',
      value: `${metrics?.total_crypto_eth} ETH`,
      sub: 'Sepolia ZK Rollup Synced',
      icon: Cpu,
      color: '#f0a500',
      bg: 'rgba(240,165,0,0.09)',
    },
    {
      label: 'Block Consensus',
      value: `#${metrics?.blockchain_height}`,
      sub: 'PBFT 12-Node Verified',
      icon: Activity,
      color: '#10b981',
      bg: 'rgba(16,185,129,0.09)',
    },
  ];

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '1.25rem' }}>

      {/* ── Welcome Banner (Neatclever card style) ── */}
      <div style={{
        background: 'linear-gradient(135deg, #1a9975 0%, #0d7a5f 100%)',
        borderRadius: 16, padding: '1.5rem',
        display: 'flex', justifyContent: 'space-between', alignItems: 'center',
        boxShadow: '0 6px 24px rgba(26,153,117,0.25)',
        position: 'relative', overflow: 'hidden',
      }}>
        {/* Decorative circles */}
        <div style={{
          position: 'absolute', top: -30, right: 80, width: 120, height: 120,
          borderRadius: '50%', background: 'rgba(255,255,255,0.08)', pointerEvents: 'none'
        }} />
        <div style={{
          position: 'absolute', bottom: -20, right: -20, width: 90, height: 90,
          borderRadius: '50%', background: 'rgba(255,255,255,0.06)', pointerEvents: 'none'
        }} />

        <div style={{ position: 'relative', zIndex: 1 }}>
          <div style={{
            fontSize: '0.7rem', color: 'rgba(255,255,255,0.7)',
            textTransform: 'uppercase', letterSpacing: '0.08em', fontWeight: 700, marginBottom: '0.35rem'
          }}>
            Blockchain-Native Account Asset · Hyperledger Besu
          </div>
          <h2 style={{ fontSize: '1.6rem', fontWeight: 800, color: '#fff', margin: '0 0 0.3rem 0' }}>
            Welcome back, {customer?.full_name || 'Aarav Sharma'}
          </h2>
          <div style={{ fontSize: '0.8rem', color: 'rgba(255,255,255,0.75)', display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
            <span>Wallet: <strong style={{ color: '#a7f3d0' }}>{customer?.metadata?.wallet_address?.slice(0, 22)}…</strong></span>
            <span style={{ display: 'flex', alignItems: 'center', gap: '0.3rem' }}>
              <ShieldCheck size={13} /> {customer?.kyc_tier}
            </span>
          </div>
        </div>

        <button
          onClick={() => onInspectMetadata && onInspectMetadata(customer?.metadata)}
          style={{
            background: 'rgba(255,255,255,0.18)', border: '1px solid rgba(255,255,255,0.3)',
            borderRadius: 10, color: '#fff', padding: '0.6rem 1.1rem',
            fontWeight: 600, fontSize: '0.82rem', cursor: 'pointer',
            display: 'flex', alignItems: 'center', gap: '0.45rem',
            backdropFilter: 'blur(10px)',
            transition: 'background 0.18s ease',
            position: 'relative', zIndex: 1,
          }}
          onMouseEnter={e => e.currentTarget.style.background = 'rgba(255,255,255,0.28)'}
          onMouseLeave={e => e.currentTarget.style.background = 'rgba(255,255,255,0.18)'}
        >
          <Database size={15} /> Inspect 60+ Metadata
        </button>
      </div>

      {/* ── KPI Cards (Neatclever grid) ── */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(210px, 1fr))', gap: '1rem' }}>
        {kpiCards.map(({ label, value, sub, icon: Icon, color, bg, isMain }) => (
          <div
            key={label}
            style={{
              background: '#fff', border: '1px solid #e8ecf0',
              borderRadius: 14, padding: '1.2rem',
              boxShadow: '0 2px 10px rgba(0,0,0,0.06)',
              transition: 'box-shadow 0.2s ease, transform 0.2s ease',
              cursor: 'default',
            }}
            onMouseEnter={e => { e.currentTarget.style.boxShadow = '0 6px 20px rgba(0,0,0,0.1)'; e.currentTarget.style.transform = 'translateY(-2px)'; }}
            onMouseLeave={e => { e.currentTarget.style.boxShadow = '0 2px 10px rgba(0,0,0,0.06)'; e.currentTarget.style.transform = 'none'; }}
          >
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '0.6rem' }}>
              <span style={{
                fontSize: '0.7rem', fontWeight: 700, textTransform: 'uppercase',
                letterSpacing: '0.05em', color: '#9ca3af'
              }}>{label}</span>
              <div style={{ width: 34, height: 34, borderRadius: 9, background: bg, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                <Icon size={17} color={color} />
              </div>
            </div>
            <div style={{ fontSize: '1.55rem', fontWeight: 800, color: '#1a2332', lineHeight: 1.1 }}>{value}</div>
            <div style={{ fontSize: '0.7rem', color: color, marginTop: '0.35rem', fontWeight: 500 }}>{sub}</div>
          </div>
        ))}
      </div>

      {/* ── Recent Transactions (Neatclever-style list) ── */}
      <div style={{
        background: '#fff', border: '1px solid #e8ecf0',
        borderRadius: 16, padding: '1.25rem',
        boxShadow: '0 2px 10px rgba(0,0,0,0.06)',
      }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1rem' }}>
          <h3 style={{ fontSize: '0.95rem', fontWeight: 700, color: '#1a2332', margin: 0 }}>
            Recent Transactions
          </h3>
          <span style={{
            fontSize: '0.72rem', color: '#1a9975', background: 'rgba(26,153,117,0.1)',
            padding: '0.22rem 0.65rem', borderRadius: 9999, fontWeight: 600
          }}>
            EIP-712 Verified
          </span>
        </div>

        <div style={{ display: 'flex', flexDirection: 'column' }}>
          {recent_transactions?.map((tx, i) => {
            const isOut = tx.amount < 0;
            return (
              <div
                key={tx.tx_id}
                style={{
                  display: 'flex', justifyContent: 'space-between', alignItems: 'center',
                  padding: '0.85rem 0',
                  borderBottom: i < recent_transactions.length - 1 ? '1px solid #f0f2f5' : 'none',
                }}
              >
                <div style={{ display: 'flex', alignItems: 'center', gap: '0.85rem' }}>
                  <div style={{
                    width: 40, height: 40, borderRadius: 12, flexShrink: 0,
                    background: isOut ? 'rgba(239,68,68,0.08)' : 'rgba(16,185,129,0.08)',
                    display: 'flex', alignItems: 'center', justifyContent: 'center'
                  }}>
                    {isOut
                      ? <ArrowUpRight size={18} color="#ef4444" />
                      : <ArrowDownLeft size={18} color="#10b981" />}
                  </div>
                  <div>
                    <div style={{ fontSize: '0.875rem', fontWeight: 600, color: '#1a2332' }}>
                      {tx.description}
                    </div>
                    <div style={{ fontSize: '0.72rem', color: '#9ca3af', marginTop: '0.1rem' }}>
                      TX: <span style={{ color: '#1a9975' }}>{tx.metadata?.transaction_hash?.substring(0, 16)}…</span>
                    </div>
                  </div>
                </div>

                <div style={{ textAlign: 'right' }}>
                  <div style={{
                    fontSize: '0.9rem', fontWeight: 700,
                    color: isOut ? '#ef4444' : '#10b981'
                  }}>
                    {isOut ? '-' : '+'}{tx.currency === 'INR' ? '₹' : ''}{Math.abs(tx.amount).toLocaleString()} {tx.currency !== 'INR' ? tx.currency : ''}
                  </div>
                  <button
                    onClick={() => onInspectMetadata && onInspectMetadata(tx.metadata)}
                    style={{
                      background: 'none', border: 'none', color: '#1a9975',
                      fontSize: '0.7rem', cursor: 'pointer', fontWeight: 500,
                      padding: 0, marginTop: '0.1rem'
                    }}
                  >
                    Inspect Metadata →
                  </button>
                </div>
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
}
