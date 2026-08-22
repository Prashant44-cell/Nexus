import React, { useState, useEffect } from 'react';
import { Send, QrCode, ShieldCheck, Database, CheckCircle, Smartphone } from 'lucide-react';
import { api } from '../../api';

export default function PaymentsUPIPanel({ onInspectMetadata }) {
  const [upis, setUpis] = useState([]);
  const [loading, setLoading] = useState(true);
  const [vpaTarget, setVpaTarget] = useState('merchant@nexusbank');
  const [amount, setAmount] = useState('1500');
  const [note, setNote] = useState('UPI 2.0 Instant Payment');
  const [paying, setPaying] = useState(false);
  const [paymentResult, setPaymentResult] = useState(null);

  useEffect(() => {
    fetchUPIs();
  }, []);

  const fetchUPIs = async () => {
    try {
      setLoading(true);
      const res = await api('/api/banking/upi');
      setUpis(res.upis || []);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  const handlePay = async (e) => {
    e.preventDefault();
    try {
      setPaying(true);
      const res = await api('/api/banking/upi/pay', {
        method: 'POST',
        body: JSON.stringify({ vpa: vpaTarget, amount: parseFloat(amount), note })
      });
      setPaymentResult(res);
      fetchUPIs();
    } catch (err) {
      alert('UPI Transfer Failed: ' + err.message);
    } finally {
      setPaying(false);
    }
  };

  if (loading) return <div style={{ color: '#06b6d4', padding: '2rem' }}>Loading UPI 2.0 Blockchain Network...</div>;

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '1.5rem' }}>
      <div>
        <h2 style={{ fontSize: '1.4rem', fontWeight: 800, color: '#f8fafc', margin: 0 }}>
          UPI 2.0 Blockchain Payment Network
        </h2>
        <div style={{ fontSize: '0.8rem', color: '#94a3b8' }}>
          Instant P2P & Merchant payments anchored directly to Hyperledger Besu PBFT finality smart contracts.
        </div>
      </div>

      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(320px, 1fr))', gap: '1.5rem' }}>
        {/* Active UPI VPA Card */}
        {upis.map(u => (
          <div key={u.vpa} style={{
            background: 'linear-gradient(135deg, rgba(15, 23, 42, 0.9), rgba(59, 130, 246, 0.15))',
            border: '1px solid rgba(59, 130, 246, 0.3)',
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
                <span style={{ fontSize: '0.7rem', fontWeight: 700, color: '#38bdf8', textTransform: 'uppercase' }}>
                  Verified UPI VPA Asset
                </span>
                <Smartphone size={20} color="#38bdf8" />
              </div>

              <h3 style={{ fontSize: '1.4rem', fontWeight: 800, color: '#f8fafc', margin: '0.5rem 0 0.2rem 0' }}>
                {u.vpa}
              </h3>
              <div style={{ fontSize: '0.78rem', color: '#94a3b8' }}>Linked to Account: {u.linked_account}</div>

              <div style={{ margin: '1.2rem 0', background: '#fff', padding: '1rem', borderRadius: '12px', width: 'fit-content', boxShadow: '0 4px 12px rgba(0,0,0,0.5)' }}>
                <QrCode size={120} color="#0f172a" />
              </div>
            </div>

            <button
              onClick={() => onInspectMetadata && onInspectMetadata(u.metadata)}
              style={{ background: 'rgba(255,255,255,0.06)', border: '1px solid rgba(255,255,255,0.1)', borderRadius: '8px', color: '#38bdf8', padding: '0.55rem', fontWeight: 600, fontSize: '0.8rem', cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '0.4rem' }}
            >
              <Database size={14} /> Inspect UPI Metadata
            </button>
          </div>
        ))}

        {/* UPI Transfer Form */}
        <div style={{
          background: 'rgba(15, 23, 42, 0.85)',
          border: '1px solid rgba(6, 182, 212, 0.25)',
          borderRadius: '16px',
          padding: '1.4rem',
          backdropFilter: 'blur(16px)',
          boxShadow: '0 8px 32px rgba(0,0,0,0.3)'
        }}>
          <h3 style={{ fontSize: '1.1rem', fontWeight: 700, color: '#f8fafc', margin: '0 0 1rem 0' }}>
            Instant UPI 2.0 Transfer
          </h3>

          {!paymentResult ? (
            <form onSubmit={handlePay} style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
              <div>
                <label style={{ fontSize: '0.75rem', color: '#94a3b8', display: 'block', marginBottom: '0.3rem' }}>Recipient VPA / Virtual Handle</label>
                <input type="text" value={vpaTarget} onChange={e => setVpaTarget(e.target.value)} required style={inputStyle} />
              </div>

              <div>
                <label style={{ fontSize: '0.75rem', color: '#94a3b8', display: 'block', marginBottom: '0.3rem' }}>Amount (₹ INR)</label>
                <input type="number" value={amount} onChange={e => setAmount(e.target.value)} required style={inputStyle} />
              </div>

              <div>
                <label style={{ fontSize: '0.75rem', color: '#94a3b8', display: 'block', marginBottom: '0.3rem' }}>Payment Note</label>
                <input type="text" value={note} onChange={e => setNote(e.target.value)} style={inputStyle} />
              </div>

              <button
                type="submit"
                disabled={paying}
                style={{
                  background: 'linear-gradient(135deg, #06b6d4, #3b82f6)',
                  border: 'none',
                  borderRadius: '10px',
                  color: '#fff',
                  padding: '0.75rem',
                  fontWeight: 700,
                  fontSize: '0.9rem',
                  cursor: 'pointer',
                  marginTop: '0.5rem',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  gap: '0.5rem'
                }}
              >
                <Send size={16} /> {paying ? 'Executing Smart Contract...' : 'Pay Instant UPI'}
              </button>
            </form>
          ) : (
            <div style={{ textAlign: 'center', padding: '1rem 0' }}>
              <CheckCircle size={44} color="#10b981" style={{ margin: '0 auto 0.75rem auto', display: 'block' }} />
              <h4 style={{ color: '#10b981', margin: 0 }}>UPI Payment Settled in PBFT Block</h4>
              <div style={{ fontSize: '0.78rem', color: '#94a3b8', margin: '0.5rem 0 1rem 0', wordBreak: 'break-all' }}>
                TX Hash: <span style={{ color: '#06b6d4' }}>{paymentResult.blockchain_tx_hash}</span>
              </div>
              <button onClick={() => setPaymentResult(null)} style={{ background: 'rgba(255,255,255,0.1)', border: 'none', borderRadius: '8px', color: '#fff', padding: '0.55rem 1rem', cursor: 'pointer' }}>
                Make Another Payment
              </button>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

const inputStyle = {
  width: '100%',
  background: 'rgba(255, 255, 255, 0.05)',
  border: '1px solid rgba(255, 255, 255, 0.1)',
  borderRadius: '8px',
  color: '#f8fafc',
  padding: '0.6rem 0.8rem',
  fontSize: '0.85rem'
};
