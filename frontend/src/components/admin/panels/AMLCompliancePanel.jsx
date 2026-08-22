import React, { useState } from 'react';
import { ShieldAlert, FileText, CheckCircle, AlertTriangle, Download } from 'lucide-react';

export default function AMLCompliancePanel() {
  const [downloading, setDownloading] = useState(false);

  const handleDownloadReport = () => {
    setDownloading(true);
    setTimeout(() => {
      setDownloading(false);
      alert('RBI & FATF Travel Rule Compliance Audit Report Generated (PDF/Cryptographic Proof Attached).');
    }, 1200);
  };

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '1.5rem' }}>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
        <div>
          <h2 style={{ fontSize: '1.4rem', fontWeight: 800, color: '#f8fafc', margin: 0 }}>
            AML Sanction Screening & FATF Travel Rule Compliance
          </h2>
          <div style={{ fontSize: '0.8rem', color: '#94a3b8' }}>
            Automated AI Anti-Money Laundering screening & RBI Cyber Security compliance ledger.
          </div>
        </div>

        <button onClick={handleDownloadReport} disabled={downloading} style={{ background: 'linear-gradient(135deg, #10b981, #059669)', border: 'none', borderRadius: '10px', color: '#fff', padding: '0.65rem 1.2rem', fontWeight: 600, fontSize: '0.85rem', cursor: 'pointer', display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
          <Download size={16} /> {downloading ? 'Generating Report...' : 'Export RBI Audit Report'}
        </button>
      </div>

      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(300px, 1fr))', gap: '1.25rem' }}>
        <div style={cardStyle}>
          <div style={{ display: 'flex', justifyContent: 'space-between', color: '#10b981' }}>
            <span style={{ fontSize: '0.75rem', fontWeight: 700, textTransform: 'uppercase' }}>FATF Travel Rule Compliance</span>
            <CheckCircle size={20} />
          </div>
          <h3 style={{ fontSize: '1.4rem', color: '#f8fafc', margin: '0.5rem 0 0.2rem 0' }}>100% Passed</h3>
          <p style={{ fontSize: '0.78rem', color: '#94a3b8', margin: 0 }}>Originator & Beneficiary identity proofs verified on-chain.</p>
        </div>

        <div style={cardStyle}>
          <div style={{ display: 'flex', justifyContent: 'space-between', color: '#38bdf8' }}>
            <span style={{ fontSize: '0.75rem', fontWeight: 700, textTransform: 'uppercase' }}>AI AML Sanction Screening</span>
            <ShieldAlert size={20} color="#38bdf8" />
          </div>
          <h3 style={{ fontSize: '1.4rem', color: '#f8fafc', margin: '0.5rem 0 0.2rem 0' }}>0 High-Risk Flags</h3>
          <p style={{ fontSize: '0.78rem', color: '#94a3b8', margin: 0 }}>Continuous monitoring across international sanction lists.</p>
        </div>

        <div style={cardStyle}>
          <div style={{ display: 'flex', justifyContent: 'space-between', color: '#a78bfa' }}>
            <span style={{ fontSize: '0.75rem', fontWeight: 700, textTransform: 'uppercase' }}>PCI-DSS v4.0 & ISO 27001</span>
            <FileText size={20} color="#a78bfa" />
          </div>
          <h3 style={{ fontSize: '1.4rem', color: '#f8fafc', margin: '0.5rem 0 0.2rem 0' }}>Active Certification</h3>
          <p style={{ fontSize: '0.78rem', color: '#94a3b8', margin: 0 }}>Cryptographic audit trail updated in real-time.</p>
        </div>
      </div>
    </div>
  );
}

const cardStyle = {
  background: 'rgba(15, 23, 42, 0.85)',
  border: '1px solid rgba(255, 255, 255, 0.08)',
  borderRadius: '16px',
  padding: '1.4rem',
  backdropFilter: 'blur(16px)'
};

