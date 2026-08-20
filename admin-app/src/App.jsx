import React, { useState } from 'react';
import { Lock } from 'lucide-react';

import AdminSidebar from './components/AdminSidebar';
import AdminNavbar from './components/AdminNavbar';
import AdminLogin from './components/AdminLogin';

import BankingAdminDashboard from './components/panels/BankingAdminDashboard';
import ValidatorNodesPanel from './components/panels/ValidatorNodesPanel';
import SmartContractRegistry from './components/panels/SmartContractRegistry';
import AMLCompliancePanel from './components/panels/AMLCompliancePanel';
import LiveSessions from './components/panels/LiveSessions';
import CredentialManagement from './components/panels/CredentialManagement';
import AuditCompliance from './components/panels/AuditCompliance';
import AdminVerificationReview from './components/panels/AdminVerificationReview';

import { setToken, useRiskSummary } from './api';
import { usePanelMotion } from './motion';

export default function App() {
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
    <div style={{ display: 'flex', minHeight: '100vh', position: 'relative', background: '#f0f2f5' }}>
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
          background: '#fff',
          border: '1px solid #e8ecf0',
          borderRadius: '10px',
          padding: '0.65rem 1rem',
          marginBottom: '1.5rem',
          display: 'flex',
          alignItems: 'center',
          gap: '0.5rem',
          fontSize: '0.78rem',
          color: '#4b5563',
          boxShadow: '0 1px 4px rgba(0,0,0,0.05)',
        }}>
          <Lock size={14} color="#6d28d9" />
          <span>
            <strong style={{ color: '#1a2332' }}>Central Bank Governance Portal:</strong>{' '}
            Signed in as <strong style={{ color: '#6d28d9' }}>{admin.credential.full_name}</strong>{' '}
            ({admin.credential.user_role}). Regulatory authority to govern Hyperledger Besu nodes & smart contracts.
          </span>
        </div>

        {renderPanel()}
      </div>
    </div>
  );
}
