import React, { useState, useEffect } from 'react';
import { Landmark, ShieldCheck, Database, PlusCircle, ArrowUpRight, TrendingUp } from 'lucide-react';
import { api } from '../../api';

export default function LoansDepositsPanel({ onInspectMetadata }) {
  const [loans, setLoans] = useState([]);
  const [deposits, setDeposits] = useState([]);
  const [loading, setLoading] = useState(true);
  const [applyLoanModal, setApplyLoanModal] = useState(false);
  const [loanType, setLoanType] = useState('Personal Micro-Loan');
  const [loanAmount, setLoanAmount] = useState('250000');
  const [loanTenure, setLoanTenure] = useState('24');
  const [createDepositModal, setCreateDepositModal] = useState(false);
  const [depositType, setDepositType] = useState('On-Chain Fixed Staking Deposit');
  const [depositAmount, setDepositAmount] = useState('50000');
  const [depositTenure, setDepositTenure] = useState('12');

  useEffect(() => {
    fetchData();
  }, []);

  const fetchData = async () => {
    try {
      setLoading(true);
      const [lRes, dRes] = await Promise.all([
        api('/api/banking/loans'),
        api('/api/banking/deposits')
      ]);
      setLoans(lRes.loans || []);
      setDeposits(dRes.deposits || []);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  const handleApplyLoan = async (e) => {
    e.preventDefault();
    try {
      await api('/api/banking/loans/apply', {
        method: 'POST',
        body: JSON.stringify({ loan_type: loanType, amount: parseFloat(loanAmount), tenure_months: parseInt(loanTenure) })
      });
      setApplyLoanModal(false);
      fetchData();
    } catch (err) {
      alert('Loan Application Failed: ' + err.message);
    }
  };

  const handleCreateDeposit = async (e) => {
    e.preventDefault();
    try {
      await api('/api/banking/deposits/create', {
        method: 'POST',
        body: JSON.stringify({ deposit_type: depositType, amount: parseFloat(depositAmount), tenure_months: parseInt(depositTenure) })
      });
      setCreateDepositModal(false);
      fetchData();
    } catch (err) {
      alert('Deposit Creation Failed: ' + err.message);
    }
  };

  if (loading) return <div style={{ color: '#06b6d4', padding: '2rem' }}>Loading Smart Loans & Deposits...</div>;

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '2rem' }}>
      {/* Smart Loans Section */}
      <div>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1rem' }}>
          <div>
            <h2 style={{ fontSize: '1.3rem', fontWeight: 800, color: '#f8fafc', margin: 0 }}>
              Smart Credit & Automated Loan Smart Contracts
            </h2>
            <div style={{ fontSize: '0.78rem', color: '#94a3b8' }}>
              Instant disbursement with automated EMI smart contract execution.
            </div>
          </div>

          <button onClick={() => setApplyLoanModal(true)} style={{ background: 'linear-gradient(135deg, #06b6d4, #3b82f6)', border: 'none', borderRadius: '8px', color: '#fff', padding: '0.55rem 1rem', fontWeight: 600, fontSize: '0.8rem', cursor: 'pointer', display: 'flex', alignItems: 'center', gap: '0.4rem' }}>
            <PlusCircle size={14} /> Apply Smart Loan
          </button>
        </div>

        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(300px, 1fr))', gap: '1rem' }}>
          {loans.map(loan => (
            <div key={loan.loan_id} style={cardStyle}>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
                <div>
                  <span style={{ fontSize: '0.7rem', color: '#06b6d4', fontWeight: 700, textTransform: 'uppercase' }}>{loan.loan_type}</span>
                  <h3 style={{ fontSize: '1.1rem', color: '#f8fafc', margin: '0.2rem 0' }}>{loan.loan_id}</h3>
                </div>
                <span style={{ fontSize: '0.7rem', color: '#10b981', background: 'rgba(16, 185, 129, 0.1)', padding: '0.2rem 0.5rem', borderRadius: '4px' }}>
                  {loan.status}
                </span>
              </div>

              <div style={{ margin: '1rem 0', display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '0.5rem', fontSize: '0.8rem' }}>
                <div>
                  <span style={{ color: '#64748b', display: 'block', fontSize: '0.7rem' }}>Principal</span>
                  <strong style={{ color: '#f8fafc' }}>₹{loan.principal_amount?.toLocaleString()}</strong>
                </div>
                <div>
                  <span style={{ color: '#64748b', display: 'block', fontSize: '0.7rem' }}>EMI Amount</span>
                  <strong style={{ color: '#38bdf8' }}>₹{loan.emi_amount?.toLocaleString()}/mo</strong>
                </div>
              </div>

              <button onClick={() => onInspectMetadata && onInspectMetadata(loan.metadata)} style={metaBtn}>
                <Database size={14} /> Inspect Loan Metadata
              </button>
            </div>
          ))}
        </div>
      </div>

      {/* Fixed Staking Deposits Section */}
      <div>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1rem' }}>
          <div>
            <h2 style={{ fontSize: '1.3rem', fontWeight: 800, color: '#f8fafc', margin: 0 }}>
              Fixed Staking Deposits & Yield Vaults
            </h2>
            <div style={{ fontSize: '0.78rem', color: '#94a3b8' }}>
              On-chain guaranteed interest maturity triggered by smart contract timestamps.
            </div>
          </div>

          <button onClick={() => setCreateDepositModal(true)} style={{ background: 'linear-gradient(135deg, #8b5cf6, #3b82f6)', border: 'none', borderRadius: '8px', color: '#fff', padding: '0.55rem 1rem', fontWeight: 600, fontSize: '0.8rem', cursor: 'pointer', display: 'flex', alignItems: 'center', gap: '0.4rem' }}>
            <TrendingUp size={14} /> Open Fixed Deposit
          </button>
        </div>

        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(300px, 1fr))', gap: '1rem' }}>
          {deposits.map(dep => (
            <div key={dep.deposit_id} style={cardStyle}>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
                <div>
                  <span style={{ fontSize: '0.7rem', color: '#a78bfa', fontWeight: 700, textTransform: 'uppercase' }}>{dep.deposit_type}</span>
                  <h3 style={{ fontSize: '1.1rem', color: '#f8fafc', margin: '0.2rem 0' }}>{dep.deposit_id}</h3>
                </div>
                <span style={{ fontSize: '0.75rem', color: '#f59e0b', fontWeight: 700 }}>
                  {dep.interest_rate}% p.a.
                </span>
              </div>

              <div style={{ margin: '1rem 0', display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '0.5rem', fontSize: '0.8rem' }}>
                <div>
                  <span style={{ color: '#64748b', display: 'block', fontSize: '0.7rem' }}>Principal Deposit</span>
                  <strong style={{ color: '#f8fafc' }}>₹{dep.principal_amount?.toLocaleString()}</strong>
                </div>
                <div>
                  <span style={{ color: '#64748b', display: 'block', fontSize: '0.7rem' }}>Maturity Value</span>
                  <strong style={{ color: '#10b981' }}>₹{dep.maturity_amount?.toLocaleString()}</strong>
                </div>
              </div>

              <button onClick={() => onInspectMetadata && onInspectMetadata(dep.metadata)} style={metaBtn}>
                <Database size={14} /> Inspect Deposit Metadata
              </button>
            </div>
          ))}
        </div>
      </div>

      {/* Apply Loan Modal */}
      {applyLoanModal && (
        <div style={modalOverlay}>
          <div style={modalBox}>
            <h3 style={{ color: '#f8fafc', marginTop: 0 }}>Apply for Smart Contract Loan</h3>
            <form onSubmit={handleApplyLoan} style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
              <div>
                <label style={labelStyle}>Loan Category</label>
                <select value={loanType} onChange={e => setLoanType(e.target.value)} style={inputStyle}>
                  <option value="Personal Micro-Loan">Personal Micro-Loan</option>
                  <option value="Home & Property Smart Loan">Home & Property Smart Loan</option>
                  <option value="Crypto Collateralized Credit Line">Crypto Collateralized Credit Line</option>
                  <option value="Solar & Green Tech Loan">Solar & Green Tech Loan</option>
                </select>
              </div>
              <div>
                <label style={labelStyle}>Amount (₹ INR)</label>
                <input type="number" value={loanAmount} onChange={e => setLoanAmount(e.target.value)} required style={inputStyle} />
              </div>
              <div>
                <label style={labelStyle}>Tenure (Months)</label>
                <input type="number" value={loanTenure} onChange={e => setLoanTenure(e.target.value)} required style={inputStyle} />
              </div>
              <div style={{ display: 'flex', gap: '0.5rem', marginTop: '0.5rem' }}>
                <button type="button" onClick={() => setApplyLoanModal(false)} style={cancelBtn}>Cancel</button>
                <button type="submit" style={submitBtn}>Submit Loan Application</button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Create Deposit Modal */}
      {createDepositModal && (
        <div style={modalOverlay}>
          <div style={modalBox}>
            <h3 style={{ color: '#f8fafc', marginTop: 0 }}>Open Fixed Staking Deposit</h3>
            <form onSubmit={handleCreateDeposit} style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
              <div>
                <label style={labelStyle}>Deposit Type</label>
                <select value={depositType} onChange={e => setDepositType(e.target.value)} style={inputStyle}>
                  <option value="On-Chain Fixed Staking Deposit">On-Chain Fixed Staking Deposit (7.5%)</option>
                  <option value="Recurring Yield Vault">Recurring Yield Vault (8.1%)</option>
                  <option value="CBDC e-Rupee Staking">CBDC e-Rupee Staking (6.8%)</option>
                </select>
              </div>
              <div>
                <label style={labelStyle}>Amount (₹ INR)</label>
                <input type="number" value={depositAmount} onChange={e => setDepositAmount(e.target.value)} required style={inputStyle} />
              </div>
              <div>
                <label style={labelStyle}>Tenure (Months)</label>
                <input type="number" value={depositTenure} onChange={e => setDepositTenure(e.target.value)} required style={inputStyle} />
              </div>
              <div style={{ display: 'flex', gap: '0.5rem', marginTop: '0.5rem' }}>
                <button type="button" onClick={() => setCreateDepositModal(false)} style={cancelBtn}>Cancel</button>
                <button type="submit" style={submitBtn}>Create Staking Deposit</button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}

const cardStyle = {
  background: 'rgba(15, 23, 42, 0.85)',
  border: '1px solid rgba(255, 255, 255, 0.08)',
  borderRadius: '14px',
  padding: '1.2rem',
  backdropFilter: 'blur(16px)',
  display: 'flex',
  flexDirection: 'column',
  justify: 'space-between'
};

const metaBtn = {
  background: 'rgba(255, 255, 255, 0.05)',
  border: '1px solid rgba(255, 255, 255, 0.1)',
  borderRadius: '8px',
  color: '#38bdf8',
  padding: '0.45rem',
  fontSize: '0.75rem',
  fontWeight: 600,
  cursor: 'pointer',
  display: 'flex',
  alignItems: 'center',
  justifyContent: 'center',
  gap: '0.35rem'
};

const modalOverlay = { position: 'fixed', top: 0, left: 0, right: 0, bottom: 0, background: 'rgba(0,0,0,0.75)', backdropFilter: 'blur(10px)', zIndex: 1000, display: 'flex', alignItems: 'center', justifyContent: 'center' };
const modalBox = { background: '#0f172a', border: '1px solid rgba(6, 182, 212, 0.4)', borderRadius: '16px', padding: '1.5rem', width: '400px', maxWidth: '90%' };
const labelStyle = { fontSize: '0.75rem', color: '#94a3b8', display: 'block', marginBottom: '0.3rem' };
const inputStyle = { width: '100%', background: 'rgba(255, 255, 255, 0.05)', border: '1px solid rgba(255, 255, 255, 0.1)', borderRadius: '8px', color: '#f8fafc', padding: '0.6rem 0.8rem', fontSize: '0.85rem' };
const cancelBtn = { flex: 1, background: 'rgba(255,255,255,0.08)', border: 'none', borderRadius: '8px', color: '#94a3b8', padding: '0.65rem', cursor: 'pointer' };
const submitBtn = { flex: 1, background: 'linear-gradient(135deg, #06b6d4, #3b82f6)', border: 'none', borderRadius: '8px', color: '#fff', fontWeight: 600, padding: '0.65rem', cursor: 'pointer' };
