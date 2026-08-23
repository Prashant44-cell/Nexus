import React, { useState } from 'react';
import { Lock } from 'lucide-react';
import './admin.css';

import AdminSidebar from './components/admin/AdminSidebar';
import AdminNavbar from './components/admin/AdminNavbar';
import AdminLogin from './components/admin/AdminLogin';

import BankingAdminDashboard from './components/admin/panels/BankingAdminDashboard';
import ValidatorNodesPanel from './components/admin/panels/ValidatorNodesPanel';
import SmartContractRegistry from './components/admin/panels/SmartContractRegistry';
import AMLCompliancePanel from './components/admin/panels/AMLCompliancePanel';
import LiveSessions from './components/admin/panels/LiveSessions';
import CredentialManagement from './components/admin/panels/CredentialManagement';
import AuditCompliance from './components/admin/panels/AuditCompliance';
import AdminVerificationReview from './components/admin/panels/AdminVerificationReview';

import { setToken, useRiskSummary } from './api';
import { usePanelMotion } from './motion';

export default function AdminApp() {
  const [admin, setAdmin] = useState(null);
  const [isCollapsed, setIsCollapsed] = useState(false);
  const [activeTab, setActiveTab] = useState('dashboard');

  const { data, error, reload } = useRiskSummary(!!admin);

  usePanelMotion([activeTab, admin]);

  const handleLogout = () => {
    setToken(null);
    setAdmin(null);
  };

  if (!admin) {
    return <AdminLogin onAuthSuccess={setAdmin} />;
  }

  const renderPanel = () => {
    switch (activeTab) {
      case 'validators':
        return <ValidatorNodesPanel />;
      case 'contracts':
        return <SmartContractRegistry />;
      case 'aml':
        return <AMLCompliancePanel />;
      case 'sessions':
        return <LiveSessions data={data} error={error} />;
      case 'credentials':
        return (
          <CredentialManagement
            data={data}
            error={error}
            reload={reload}
            adminId={admin.user_id}
          />
        );
      case 'verifications':
        return <AdminVerificationReview />;
      case 'audit':
        return <AuditCompliance data={data} error={error} />;
      default:
        return <BankingAdminDashboard />;
    }
  };

  return (
    <div style={{ display: 'flex', minHeight: '100vh', position: 'relative', background: 'var(--bg-page)', color: 'var(--text-main)', transition: 'background-color 0.28s ease' }}>
      <AdminSidebar
        activeTab={activeTab}
        setActiveTab={setActiveTab}
        isCollapsed={isCollapsed}
        setIsCollapsed={setIsCollapsed}
        admin={admin}
        onLogout={handleLogout}
      />
      <div style={{
        flex: 1,
        marginLeft: isCollapsed ? '72px' : '248px',
        padding: '1.5rem 1.75rem',
        transition: 'margin-left 0.28s cubic-bezier(0.16, 1, 0.3, 1)',
        minWidth: 0,
      }}>
        <AdminNavbar lastUpdated={data ? Date.now() / 1000 : null} />

        {/* Admin info bar */}
        <div style={{
          background: 'var(--bg-card)',
          border: '1px solid var(--border)',
          borderRadius: '12px',
          padding: '0.75rem 1.1rem',
          marginBottom: '1.5rem',
          display: 'flex',
          alignItems: 'center',
          gap: '0.6rem',
          fontSize: '0.8rem',
          color: 'var(--text-secondary)',
          boxShadow: 'var(--shadow-sm)',
          transition: 'all 0.28s ease',
        }} className="neon-purple-hover">
          <Lock size={15} color="#8b5cf6" />
          <span>
            <strong style={{ color: 'var(--text-main)' }}>Central Bank Governance Portal:</strong>{' '}
            Signed in as <strong style={{ color: '#8b5cf6' }}>{admin.credential.full_name}</strong>{' '}
            ({admin.credential.user_role}). Regulatory authority to govern Hyperledger Besu nodes &amp; smart contracts.
          </span>
        </div>

        {renderPanel()}
      </div>
    </div>
  );
}
