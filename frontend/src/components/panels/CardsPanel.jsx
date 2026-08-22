import React, { useState, useEffect } from 'react';
import { CreditCard, Lock, Unlock, Database, ShieldCheck, Zap } from 'lucide-react';
import { api } from '../../api';

export default function CardsPanel({ onInspectMetadata }) {
  const [cards, setCards] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchCards();
  }, []);

  const fetchCards = async () => {
    try {
      setLoading(true);
      const res = await api('/api/banking/cards');
      setCards(res.cards || []);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  const toggleFreeze = async (cardNumber, currentStatus) => {
    try {
      const res = await api('/api/banking/cards/freeze', {
        method: 'POST',
        body: JSON.stringify({ card_number: cardNumber, is_frozen: !currentStatus })
      });
      fetchCards();
    } catch (err) {
      alert('Freeze Action Failed: ' + err.message);
    }
  };

  if (loading) return <div style={{ color: '#06b6d4', padding: '2rem' }}>Loading Tokenized Card Assets...</div>;

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '1.5rem' }}>
      <div>
        <h2 style={{ fontSize: '1.4rem', fontWeight: 800, color: '#f8fafc', margin: 0 }}>
          Tokenized Cards & Virtual Security Escrow
        </h2>
        <div style={{ fontSize: '0.8rem', color: '#94a3b8' }}>
          Physical & Virtual cards protected by Zero-Knowledge CVV verification and instant smart contract lock.
        </div>
      </div>

      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(340px, 1fr))', gap: '1.5rem' }}>
        {cards.map(card => (
          <div key={card.card_number_masked} style={{
            background: card.is_frozen
              ? 'linear-gradient(135deg, rgba(30, 41, 59, 0.9), rgba(239, 68, 68, 0.15))'
              : 'linear-gradient(135deg, rgba(15, 23, 42, 0.95), rgba(6, 182, 212, 0.2))',
            border: card.is_frozen ? '1px solid rgba(239, 68, 68, 0.4)' : '1px solid rgba(6, 182, 212, 0.35)',
            borderRadius: '20px',
            padding: '1.5rem',
            boxShadow: '0 12px 36px rgba(0,0,0,0.4)',
            backdropFilter: 'blur(20px)',
            display: 'flex',
            flexDirection: 'column',
            justify: 'space-between',
            height: '220px'
          }}>
            <div>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                <span style={{ fontSize: '0.72rem', fontWeight: 700, color: '#38bdf8', letterSpacing: '0.08em', textTransform: 'uppercase' }}>
                  {card.card_type}
                </span>
                <CreditCard size={24} color={card.is_frozen ? '#ef4444' : '#06b6d4'} />
              </div>

              <div style={{ fontSize: '1.5rem', fontWeight: 800, color: '#f8fafc', letterSpacing: '0.15em', margin: '1.2rem 0 0.5rem 0' }}>
                {card.card_number_masked}
              </div>

              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', fontSize: '0.75rem', color: '#94a3b8' }}>
                <span>EXP: <strong style={{ color: '#f8fafc' }}>{card.expiry}</strong></span>
                <span>NETWORK: <strong style={{ color: '#f8fafc' }}>{card.network}</strong></span>
              </div>
            </div>

            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', paddingTop: '1rem', borderTop: '1px solid rgba(255,255,255,0.08)' }}>
              <button
                onClick={() => toggleFreeze(card.card_number_masked, card.is_frozen)}
                style={{
                  background: card.is_frozen ? 'rgba(239, 68, 68, 0.2)' : 'rgba(16, 185, 129, 0.2)',
                  border: card.is_frozen ? '1px solid #ef4444' : '1px solid #10b981',
                  color: card.is_frozen ? '#ef4444' : '#10b981',
                  borderRadius: '8px',
                  padding: '0.45rem 0.85rem',
                  fontSize: '0.78rem',
                  fontWeight: 600,
                  cursor: 'pointer',
                  display: 'flex',
                  alignItems: 'center',
                  gap: '0.35rem'
                }}
              >
                {card.is_frozen ? <Lock size={14} /> : <Unlock size={14} />}
                {card.is_frozen ? 'Card Frozen (Click to Unlock)' : 'Active (Click to Freeze)'}
              </button>

              <button
                onClick={() => onInspectMetadata && onInspectMetadata(card.metadata)}
                style={{ background: 'none', border: 'none', color: '#38bdf8', fontSize: '0.75rem', cursor: 'pointer', display: 'flex', alignItems: 'center', gap: '0.3rem' }}
              >
                <Database size={14} /> 60+ Metadata
              </button>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
