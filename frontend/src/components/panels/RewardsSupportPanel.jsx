import React, { useState, useEffect } from 'react';
import { Award, HelpCircle, Database, Plus, CheckCircle, ShieldAlert } from 'lucide-react';
import { api } from '../../api';

export default function RewardsSupportPanel({ onInspectMetadata }) {
  const [rewards, setRewards] = useState(null);
  const [tickets, setTickets] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchData();
  }, []);

  const fetchData = async () => {
    try {
      setLoading(true);
      const [rRes, tRes] = await Promise.all([
        api('/api/banking/rewards'),
        api('/api/banking/support')
      ]);
      setRewards(rRes.rewards || null);
      setTickets(tRes.tickets || []);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  if (loading) return <div style={{ color: '#06b6d4', padding: '2rem' }}>Loading Rewards & Disputes...</div>;

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '2rem' }}>
      {/* Rewards Card */}
      {rewards && (
        <div style={{
          background: 'linear-gradient(135deg, rgba(15, 23, 42, 0.9), rgba(245, 158, 11, 0.15))',
          border: '1px solid rgba(245, 158, 11, 0.3)',
          borderRadius: '16px',
          padding: '1.5rem',
          backdropFilter: 'blur(16px)',
          display: 'flex',
          justify: 'space-between',
          alignItems: 'center'
        }}>
          <div>
            <span style={{ fontSize: '0.75rem', color: '#f59e0b', fontWeight: 700, textTransform: 'uppercase' }}>
              On-Chain ERC-20 Loyalty Vault ({rewards.tier})
            </span>
            <h3 style={{ fontSize: '1.8rem', fontWeight: 800, color: '#f8fafc', margin: '0.3rem 0' }}>
              {rewards.token_balance} NEXUS Tokens
            </h3>
            <div style={{ fontSize: '0.82rem', color: '#94a3b8' }}>
              Cashback Earned: <strong style={{ color: '#10b981' }}>₹{rewards.cashback_inr?.toLocaleString()}</strong>
            </div>
          </div>

          <button onClick={() => onInspectMetadata && onInspectMetadata(rewards.metadata)} style={{ background: 'rgba(245, 158, 11, 0.2)', border: '1px solid #f59e0b', color: '#f59e0b', borderRadius: '8px', padding: '0.6rem 1rem', fontWeight: 600, fontSize: '0.8rem', cursor: 'pointer', display: 'flex', alignItems: 'center', gap: '0.4rem' }}>
            <Database size={14} /> Rewards Metadata
          </button>
        </div>
      )}

      {/* Support & Dispute Tickets */}
      <div>
        <h2 style={{ fontSize: '1.3rem', fontWeight: 800, color: '#f8fafc', margin: '0 0 1rem 0' }}>
          On-Chain Immutable Support Tickets & Disputes
        </h2>

        <div style={{ display: 'flex', flexDirection: 'column', gap: '0.85rem' }}>
          {tickets.map(t => (
            <div key={t.ticket_id} style={{
              background: 'rgba(15, 23, 42, 0.8)',
              border: '1px solid rgba(255, 255, 255, 0.08)',
              borderRadius: '12px',
              padding: '1.1rem',
              display: 'flex',
              justify: 'space-between',
              alignItems: 'center'
            }}>
              <div>
                <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                  <span style={{ fontSize: '0.7rem', color: '#06b6d4', fontWeight: 700 }}>{t.category}</span>
                  <span style={{ fontSize: '0.7rem', color: '#ef4444', background: 'rgba(239, 68, 68, 0.15)', padding: '0.1rem 0.4rem', borderRadius: '4px' }}>
                    {t.priority} PRIORITY
                  </span>
                </div>
                <h4 style={{ fontSize: '1rem', color: '#f8fafc', margin: '0.3rem 0 0.1rem 0' }}>{t.subject}</h4>
                <div style={{ fontSize: '0.72rem', color: '#64748b' }}>ID: {t.ticket_id}</div>
              </div>

              <div style={{ textAlign: 'right' }}>
                <div style={{ fontSize: '0.78rem', color: '#a78bfa', marginBottom: '0.3rem' }}>{t.status}</div>
                <button onClick={() => onInspectMetadata && onInspectMetadata(t.metadata)} style={{ background: 'none', border: 'none', color: '#38bdf8', fontSize: '0.72rem', cursor: 'pointer', textDecoration: 'underline' }}>
                  Inspect Ticket Metadata
                </button>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
