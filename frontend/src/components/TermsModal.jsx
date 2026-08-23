import React, { useState } from 'react';
import {
  ShieldCheck, Lock, Eye, AlertTriangle, CheckCircle2,
  FileText, Database, Scale, Cpu, Globe, Key, AlertOctagon,
  RefreshCw, CheckSquare, Square
} from 'lucide-react';
import { api } from '../api';

const TERMS_CLAUSES = [
  {
    icon: Lock,
    title: "1. Zero-Knowledge Cryptographic Proofs & Biometric Privacy",
    content: "All identity assertions, including retina hash vectors and biometric keystroke patterns, are computed on-device and verified using Zero-Knowledge Proofs (ZKP). Raw biometric data is never stored on unencrypted centralized servers or transmitted across public networks."
  },
  {
    icon: Eye,
    title: "2. Continuous Behavioral & Session Trust Scoring",
    content: "The system runs passive, low-latency telemetry (keystroke rhythm, mouse kinematics, latency variance, and device state) during active sessions. Dynamic trust scores are continuously updated on a 0-100 scale to guarantee legitimate human interaction."
  },
  {
    icon: Database,
    title: "3. Immutable On-Chain Ledger & Rollup Verification",
    content: "Every authentication milestone, cryptographic credential issuance, and interbank transaction is irreversibly stamped onto the Ethereum Sepolia Testnet via Layer-2 zk-Rollup state transitions with verifiable Merkle tree roots."
  },
  {
    icon: Scale,
    title: "4. Multi-Jurisdictional Regulatory & AML/CFT Compliance",
    content: "Account activity strictly adheres to Reserve Bank of India (RBI) Digital Payment Security Controls, Basel III Capital & Liquidity Accords, GDPR Article 25 (Privacy by Design), and FinCEN anti-structuring regulations."
  },
  {
    icon: Cpu,
    title: "5. Automated Step-Up Multi-Factor Challenge Protocol",
    content: "If session trust falls below institutional thresholds (Score < 85), the platform automatically issues deterministic challenge vectors (biometric retinal rescan, time-based OTP, or hardware token challenge) before sensitive operations are authorized."
  },
  {
    icon: ShieldCheck,
    title: "6. Non-Custodial Vault & Smart Contract Asset Custody",
    content: "Client assets, fiat reserves, and tokenized deposits are held under dual-key cryptographic escrow. Fund transfers and automated stakings execute deterministically via audited ERC-20 and ERC-4337 smart contracts."
  },
  {
    icon: Globe,
    title: "7. Real-Time Gross Settlement & UPI 2.0 Safeguards",
    content: "Instantaneous payments via UPI 2.0 VPAs, NEFT/RTGS, and digital wallet tokenizations incorporate automated velocity limits and real-time fraud mitigation algorithms to prevent unauthorized drain attacks."
  },
  {
    icon: Key,
    title: "8. Hardware Token Binding & Unique Device Fingerprinting",
    content: "Your account is cryptographically bound to your unique device hardware signature and user key (`USR-KEY`). Any attempt to access credentials from anomalous IP addresses or untrusted hardware triggers instant session sandboxing."
  },
  {
    icon: AlertOctagon,
    title: "9. Institutional Emergency Freeze & Stolen Credential Protocol",
    content: "Nexus Global Reserve Bank and its regulatory nodes retain the cryptographic authority to pause, freeze, or roll back compromised deposit envelopes upon verified proof of key compromise or fraudulent exfiltration."
  },
  {
    icon: FileText,
    title: "10. Immutable Audit Trail & Forensics Log Retention",
    content: "Complete audit logs (encompassing timestamps, cryptographic hashes, action codes, and validation signatures) are immutably archived for a mandatory compliance duration of 7 years with tamper-evident SHA-256 chain linkage."
  },
  {
    icon: RefreshCw,
    title: "11. Smart Contract Upgrades & Oracle Price Governance",
    content: "Decentralized lending, collateral valuations, and staking yields rely on multi-oracle aggregate feeds (Chainlink/Pyth Network). System parameter updates require minimum 4-of-7 multi-signature validator approval."
  },
  {
    icon: AlertTriangle,
    title: "12. Client Custodial Responsibility & Private Key Safeguarding",
    content: "The account holder assumes absolute legal responsibility for the confidentiality of personal credentials, device passcodes, and master seed phrases. Nexus Bank will never request private cryptographic keys via email or phone."
  },
  {
    icon: ShieldCheck,
    title: "13. Right to Cryptographic Erasure & Privacy Enclave Isolation",
    content: "Subject to statutory KYC recordkeeping mandates, users may request the decommissioning of non-essential operational metadata. Off-chain telemetry caches are wiped automatically upon session termination."
  },
  {
    icon: Scale,
    title: "14. Binding Arbitration & Cross-Border Dispute Jurisdiction",
    content: "Any claims or disputes arising under this agreement shall be submitted to binding international financial arbitration under UNCITRAL Model Law with on-chain cryptographic proof admissibility."
  }
];

export default function TermsModal({ credential, onAccept }) {
  const [monitoringConsent, setMonitoringConsent] = useState(false);
  const [revocationConsent, setRevocationConsent] = useState(false);
  const [amlConsent, setAmlConsent] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [errorMsg, setErrorMsg] = useState('');

  const allChecked = monitoringConsent && revocationConsent && amlConsent;

  const handleSelectAll = () => {
    if (allChecked) {
      setMonitoringConsent(false);
      setRevocationConsent(false);
      setAmlConsent(false);
    } else {
      setMonitoringConsent(true);
      setRevocationConsent(true);
      setAmlConsent(true);
    }
  };

  const handleSubmit = async () => {
    if (!allChecked) {
      setErrorMsg('Please review and check all 3 regulatory consent checkboxes to proceed.');
      return;
    }
    setIsSubmitting(true);
    setErrorMsg('');

    try {
      const data = await api('/terms/accept', {
        method: 'POST',
        body: JSON.stringify({
          user_id: credential.user_id,
          user_role: credential.user_role,
          accepted_version: 'v2.4-Enterprise',
          continuous_monitoring_consent: monitoringConsent,
          revocation_terms_consent: revocationConsent
        })
      });
      onAccept(data);
    } catch (err) {
      setErrorMsg(err.message);
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div style={{
      position: 'fixed', inset: 0, zIndex: 9999,
      background: 'rgba(10, 18, 30, 0.75)',
      backdropFilter: 'blur(12px)',
      display: 'flex', alignItems: 'center', justifyContent: 'center', padding: '1rem',
      animation: 'fadeIn 0.25s ease-out'
    }}>
      <div style={{
        background: 'var(--bg-card)',
        border: '1px solid var(--border)',
        borderRadius: 24,
        padding: '2.25rem',
        width: '100%', maxWidth: 680,
        boxShadow: '0 25px 70px rgba(0,0,0,0.35), 0 0 30px rgba(26, 153, 117, 0.15)',
        animation: 'modalSlideUp 0.3s cubic-bezier(0.16,1,0.3,1)',
        maxHeight: '90vh',
        display: 'flex',
        flexDirection: 'column',
        color: 'var(--text-main)',
        transition: 'background-color 0.3s ease, border-color 0.3s ease, color 0.3s ease'
      }}>
        {/* Header */}
        <div style={{ textAlign: 'center', marginBottom: '1.25rem', flexShrink: 0 }}>
          <div style={{
            display: 'inline-flex', padding: '0.85rem',
            background: 'linear-gradient(135deg, rgba(26,153,117,0.18), rgba(26,153,117,0.05))',
            borderRadius: '50%',
            marginBottom: '0.75rem',
            border: '1px solid rgba(26,153,117,0.3)',
            boxShadow: '0 0 20px rgba(26,153,117,0.25)'
          }}>
            <ShieldCheck size={38} color="#1a9975" />
          </div>
          <h2 style={{ fontSize: '1.45rem', color: 'var(--text-main)', fontWeight: 800, letterSpacing: '-0.02em' }}>
            Institutional Banking &amp; Web3 Master Agreement
          </h2>
          <div style={{
            display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '0.75rem',
            marginTop: '0.4rem', fontSize: '0.82rem', color: 'var(--text-secondary)'
          }}>
            <span style={{
              background: 'rgba(26,153,117,0.12)', color: '#1a9975',
              padding: '0.2rem 0.55rem', borderRadius: '6px', fontWeight: 700, fontSize: '0.75rem'
            }}>
              ISO/IEC 27001 &amp; RBI Compliant
            </span>
            <span>•</span>
            <span>Version 2.4 Enterprise</span>
            <span>•</span>
            <span>14 Regulatory Clauses</span>
          </div>
        </div>

        {/* Scrollable Clauses Container */}
        <div style={{
          background: 'var(--bg-page)',
          borderRadius: 14,
          padding: '1.25rem',
          border: '1px solid var(--border)',
          overflowY: 'auto',
          flex: '1 1 auto',
          maxHeight: '340px',
          marginBottom: '1.25rem',
          fontSize: '0.85rem',
          lineHeight: '1.6',
          boxShadow: 'inset 0 2px 6px rgba(0,0,0,0.04)'
        }}>
          <div style={{
            display: 'flex', justifyContent: 'space-between', alignItems: 'center',
            marginBottom: '1rem', paddingBottom: '0.5rem', borderBottom: '1px solid var(--border)'
          }}>
            <span style={{ fontSize: '0.78rem', fontWeight: 700, color: 'var(--text-muted)', textTransform: 'uppercase', letterSpacing: '0.05em' }}>
              Statutory Terms &amp; Conditions Framework
            </span>
            <button
              onClick={handleSelectAll}
              type="button"
              style={{
                background: 'none', border: 'none', color: '#1a9975',
                fontSize: '0.78rem', fontWeight: 700, cursor: 'pointer',
                display: 'flex', alignItems: 'center', gap: '0.35rem'
              }}
            >
              {allChecked ? <CheckSquare size={14} /> : <Square size={14} />}
              {allChecked ? 'Uncheck All' : 'Quick Accept All'}
            </button>
          </div>

          <div style={{ display: 'flex', flexDirection: 'column', gap: '1.1rem' }}>
            {TERMS_CLAUSES.map((clause, idx) => {
              const IconComponent = clause.icon;
              return (
                <div
                  key={idx}
                  style={{
                    background: 'var(--bg-card)',
                    borderRadius: 10,
                    padding: '0.9rem 1rem',
                    border: '1px solid var(--border)',
                    transition: 'transform 0.18s ease, border-color 0.18s ease, box-shadow 0.18s ease',
                  }}
                  className="clause-card"
                >
                  <h4 style={{
                    color: '#1a9975',
                    fontSize: '0.88rem',
                    fontWeight: 700,
                    display: 'flex',
                    alignItems: 'center',
                    gap: '0.5rem',
                    marginBottom: '0.4rem'
                  }}>
                    <IconComponent size={16} style={{ flexShrink: 0 }} />
                    {clause.title}
                  </h4>
                  <p style={{ color: 'var(--text-secondary)', fontSize: '0.81rem', margin: 0, lineHeight: 1.55 }}>
                    {clause.content}
                  </p>
                </div>
              );
            })}
          </div>
        </div>

        {/* Error message */}
        {errorMsg && (
          <div style={{
            background: 'rgba(239, 68, 68, 0.12)', border: '1px solid rgba(239, 68, 68, 0.3)',
            color: '#ef4444', padding: '0.75rem', borderRadius: '10px',
            marginBottom: '1rem', fontSize: '0.84rem', display: 'flex', alignItems: 'center', gap: '0.5rem'
          }}>
            <AlertTriangle size={16} />
            {errorMsg}
          </div>
        )}

        {/* Checkbox Consents */}
        <div style={{
          display: 'flex', flexDirection: 'column', gap: '0.75rem',
          marginBottom: '1.25rem', flexShrink: 0
        }}>
          <label style={{
            display: 'flex', alignItems: 'flex-start', gap: '0.75rem',
            cursor: 'pointer', fontSize: '0.84rem', color: 'var(--text-main)'
          }}>
            <input
              type="checkbox"
              checked={monitoringConsent}
              onChange={(e) => setMonitoringConsent(e.target.checked)}
              style={{ marginTop: '0.2rem', width: '17px', height: '17px', accentColor: '#1a9975', cursor: 'pointer' }}
            />
            <span>
              I authorize <strong style={{ color: '#1a9975' }}>Continuous Zero-Knowledge Trust Scoring</strong> and passive behavioral telemetry during all authenticated sessions.
            </span>
          </label>

          <label style={{
            display: 'flex', alignItems: 'flex-start', gap: '0.75rem',
            cursor: 'pointer', fontSize: '0.84rem', color: 'var(--text-main)'
          }}>
            <input
              type="checkbox"
              checked={revocationConsent}
              onChange={(e) => setRevocationConsent(e.target.checked)}
              style={{ marginTop: '0.2rem', width: '17px', height: '17px', accentColor: '#1a9975', cursor: 'pointer' }}
            />
            <span>
              I acknowledge the <strong style={{ color: '#1a9975' }}>Institutional Revocation &amp; Immutable Audit Trail</strong> protocols under Sepolia Smart Contract governance.
            </span>
          </label>

          <label style={{
            display: 'flex', alignItems: 'flex-start', gap: '0.75rem',
            cursor: 'pointer', fontSize: '0.84rem', color: 'var(--text-main)'
          }}>
            <input
              type="checkbox"
              checked={amlConsent}
              onChange={(e) => setAmlConsent(e.target.checked)}
              style={{ marginTop: '0.2rem', width: '17px', height: '17px', accentColor: '#1a9975', cursor: 'pointer' }}
            />
            <span>
              I declare compliance with <strong style={{ color: '#1a9975' }}>RBI &amp; International AML/CFT Banking Regulations</strong> and accept cross-border settlement safeguards.
            </span>
          </label>
        </div>

        {/* Submit button with neon glow */}
        <button
          onClick={handleSubmit}
          disabled={!allChecked || isSubmitting}
          className={allChecked ? "neon-glow-hover" : ""}
          style={{
            width: '100%', padding: '0.85rem',
            background: allChecked ? 'linear-gradient(135deg, #1a9975, #127c5e)' : 'var(--border)',
            color: allChecked ? '#ffffff' : 'var(--text-muted)',
            border: 'none', borderRadius: 12,
            fontWeight: 700, fontSize: '0.92rem',
            cursor: allChecked ? 'pointer' : 'not-allowed',
            display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '0.6rem',
            boxShadow: allChecked ? '0 4px 20px rgba(26,153,117,0.4), 0 0 15px rgba(26,153,117,0.2)' : 'none',
            transition: 'all 0.25s cubic-bezier(0.16,1,0.3,1)',
            flexShrink: 0
          }}
        >
          <CheckCircle2 size={18} />
          {isSubmitting ? 'Recording Cryptographic Consent on-Chain...' : 'Accept All 14 Clauses & Activate Digital Vault'}
        </button>
      </div>
    </div>
  );
}

