import React, { useState, useEffect } from 'react';
import { Wallet, Send, ArrowRight, ShieldCheck, Database, Lock, RefreshCw } from 'lucide-react';
import { api } from '../../api';

export default function AccountsPanel({ onInspectMetadata }) {
  const [accounts, setAccounts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [transferModal, setTransferModal] = useState(false);
  const [selectedAcc, setSelectedAcc] = useState(null);
  const [targetAccount, setTargetAccount] = useState('ACC-HDFC-302910');
  const [amount, setAmount] = useState('5000');
  const [description, setDescription] = useState('Blockchain Instant Settlement');
  const [transferring, setTransferring] = useState(false);
  const [transferResult, setTransferResult] = useState(null);

  useEffect(() => {
    fetchAccounts();
  }, []);

  const fetchAccounts = async () => {
    try {
      setLoading(true);
      const res = await api('/api/banking/accounts');
      setAccounts(res.accounts || []);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  const handleTransfer = async (e) => {
    e.preventDefault();
    try {
      setTransferring(true);
      const payload = {
        sender_account: selectedAcc.account_number,
        receiver_account: targetAccount,
        amount: parseFloat(amount),
        currency: selectedAcc.currency,
        description: description
      };
      const res = await api('/api/banking/transfer', {
        method: 'POST',
        body: JSON.stringify(payload)
      });
      setTransferResult(res);
      fetchAccounts();
    } catch (err) {
      alert('Transfer Failed: ' + err.message);
    } finally {
      setTransferring(false);
    }
  };

  if (loading) return <div style={{ color: '#06b6d4', padding: '2rem' }}>Loading Blockchain Accounts...</div>;

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '1.5rem' }}>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
        <div>
          <h2 style={{ fontSize: '1.4rem', fontWeight: 800, color: '#f8fafc', margin: 0 }}>
            Blockchain Accounts & Digital Asset Vaults
          </h2>
          <div style={{ fontSize: '0.8rem', color: '#94a3b8' }}>
            Every account is an immutable smart contract asset on Hyperledger Besu with EIP-712 cryptographic proofs.
          </div>
        </div>

        <button onClick={fetchAccounts} style={{ background: 'rgba(255,255,255,0.05)', border: '1px solid rgba(255,255,255,0.1)', color: '#94a3b8', borderRadius: '8px', padding: '0.5rem 0.8rem', cursor: 'pointer', display: 'flex', alignItems: 'center', gap: '0.4rem' }}>
          <RefreshCw size={14} /> Refresh Ledger
        </button>
      </div>

      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(320px, 1fr))', gap: '1.25rem' }}>
        {accounts.map(acc => (
          <div key={acc.account_number} style={{
            background: 'rgba(15, 23, 42, 0.85)',
            border: '1px solid rgba(6, 182, 212, 0.25)',
            borderRadius: '16px',
            padding: '1.4rem',
            backdropFilter: 'blur(16px)',
            boxShadow: '0 8px 32px rgba(0,0,0,0.3)',
            display: 'flex',
            flexDirection: 'column',
            justify: 'space-between'
          }}>
            <div>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
                <div>
                  <span style={{ fontSize: '0.7rem', fontWeight: 700, color: '#06b6d4', textTransform: 'uppercase', letterSpacing: '0.06em' }}>
                    {acc.account_type}
                  </span>
                  <h3 style={{ fontSize: '1.2rem', fontWeight: 700, color: '#f8fafc', margin: '0.2rem 0' }}>
                    {acc.account_number}
                  </h3>
                </div>
                <div style={{ width: 36, height: 36, borderRadius: '10px', background: 'rgba(6, 182, 212, 0.15)', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                  <Wallet size={20} color="#06b6d4" />
                </div>
              </div>

              <div style={{ margin: '1.2rem 0 0.8rem 0' }}>
                <div style={{ fontSize: '0.72rem', color: '#64748b' }}>Available Balance</div>
                <div style={{ fontSize: '1.8rem', fontWeight: 800, color: '#f8fafc' }}>
                  {acc.currency === 'INR' ? '₹' : ''}{acc.balance.toLocaleString()} {acc.currency !== 'INR' ? acc.currency : ''}
                </div>
              </div>

              <div style={{ fontSize: '0.72rem', color: '#94a3b8', background: 'rgba(0,0,0,0.2)', padding: '0.5rem 0.75rem', borderRadius: '8px', marginBottom: '1rem' }}>
                <div>Smart Contract: <span style={{ color: '#06b6d4' }}>{acc.metadata?.smart_contract_name}</span></div>
                <div>Block Height: <span style={{ color: '#38bdf8' }}>#{acc.metadata?.block_number}</span></div>
              </div>
            </div>

            <div style={{ display: 'flex', gap: '0.5rem' }}>
              <button
                onClick={() => { setSelectedAcc(acc); setTransferModal(true); setTransferResult(null); }}
                style={{ flex: 1, background: 'linear-gradient(135deg, #06b6d4, #3b82f6)', border: 'none', borderRadius: '8px', color: '#fff', padding: '0.55rem', fontWeight: 600, fontSize: '0.8rem', cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '0.4rem' }}
              >
                <Send size={14} /> Send Money
              </button>

              <button
                onClick={() => onInspectMetadata && onInspectMetadata(acc.metadata)}
                style={{ background: 'rgba(255,255,255,0.06)', border: '1px solid rgba(255,255,255,0.1)', borderRadius: '8px', color: '#38bdf8', padding: '0.55rem 0.75rem', fontWeight: 600, fontSize: '0.8rem', cursor: 'pointer', display: 'flex', alignItems: 'center', gap: '0.3rem' }}
              >
                <Database size={14} /> Inspect Metadata
              </button>
            </div>
          </div>
        ))}
      </div>

      {/* Send Money Modal */}
      {transferModal && selectedAcc && (
        <div style={{ position: 'fixed', top: 0, left: 0, right: 0, bottom: 0, background: 'rgba(0,0,0,0.75)', backdropFilter: 'blur(10px)', zIndex: 1000, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
          <div style={{ background: '#0f172a', border: '1px solid rgba(6, 182, 212, 0.4)', borderRadius: '16px', padding: '1.5rem', width: '440px', maxWidth: '90%', boxShadow: '0 20px 50px rgba(0,0,0,0.8)' }}>
            <h3 style={{ color: '#f8fafc', margin: '0 0 1rem 0' }}>Execute Blockchain Instant Settlement</h3>
            
            {!transferResult ? (
              <form onSubmit={handleTransfer} style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
                <div>
                  <label style={{ fontSize: '0.75rem', color: '#94a3b8', display: 'block', marginBottom: '0.3rem' }}>From Account</label>
                  <input type="text" readOnly value={`${selectedAcc.account_number} (${selectedAcc.account_type})`} style={inputStyle} />
                </div>
                <div>
                  <label style={{ fontSize: '0.75rem', color: '#94a3b8', display: 'block', marginBottom: '0.3rem' }}>Target Account / VPA</label>
                  <input type="text" value={targetAccount} onChange={e => setTargetAccount(e.target.value)} required style={inputStyle} />
                </div>
                <div>
                  <label style={{ fontSize: '0.75rem', color: '#94a3b8', display: 'block', marginBottom: '0.3rem' }}>Amount ({selectedAcc.currency})</label>
                  <input type="number" value={amount} onChange={e => setAmount(e.target.value)} required style={inputStyle} />
                </div>
                <div>
                  <label style={{ fontSize: '0.75rem', color: '#94a3b8', display: 'block', marginBottom: '0.3rem' }}>Description / Note</label>
                  <input type="text" value={description} onChange={e => setDescription(e.target.value)} style={inputStyle} />
                </div>

                <div style={{ display: 'flex', gap: '0.75rem', marginTop: '0.5rem' }}>
                  <button type="button" onClick={() => setTransferModal(false)} style={{ flex: 1, background: 'rgba(255,255,255,0.08)', border: 'none', borderRadius: '8px', color: '#94a3b8', padding: '0.65rem', cursor: 'pointer' }}>
                    Cancel
                  </button>
                  <button type="submit" disabled={transferring} style={{ flex: 1, background: 'linear-gradient(135deg, #06b6d4, #3b82f6)', border: 'none', borderRadius: '8px', color: '#fff', fontWeight: 600, padding: '0.65rem', cursor: 'pointer' }}>
                    {transferring ? 'Signing Block...' : 'Sign & Submit Transfer'}
                  </button>
                </div>
              </form>
            ) : (
              <div style={{ textAlign: 'center', padding: '1rem 0' }}>
                <div style={{ width: 48, height: 48, borderRadius: '50%', background: 'rgba(16, 185, 129, 0.2)', color: '#10b981', display: 'flex', alignItems: 'center', justifyContent: 'center', margin: '0 auto 1rem auto' }}>
                  <ShieldCheck size={28} />
                </div>
                <h4 style={{ color: '#10b981', margin: 0 }}>Block Committed Successfully</h4>
                <div style={{ fontSize: '0.78rem', color: '#94a3b8', margin: '0.5rem 0 1rem 0', wordBreak: 'break-all' }}>
                  TX Hash: <span style={{ color: '#06b6d4' }}>{transferResult.blockchain_tx_hash}</span>
                </div>
                <button onClick={() => setTransferModal(false)} style={{ background: '#06b6d4', border: 'none', borderRadius: '8px', color: '#fff', padding: '0.6rem 1.2rem', cursor: 'pointer' }}>
                  Done
                </button>
              </div>
            )}
          </div>
        </div>
      )}
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
