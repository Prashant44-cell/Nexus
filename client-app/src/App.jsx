import React, { useState, useEffect, useRef, useCallback } from 'react';
import { ShieldCheck, Lock, AlertOctagon, Landmark, Database, Sun, Moon, Monitor } from 'lucide-react';

import Sidebar from './components/Sidebar';
import AuthModal from './components/AuthModal';
import TermsModal from './components/TermsModal';
import BackgroundVideo from './components/BackgroundVideo';
import WalletCard from './components/WalletCard';
import TrustScoreBadge from './components/TrustScoreBadge';
import ProfilePanel from './components/panels/ProfilePanel';
import StepUpChallenge from './components/StepUpChallenge';

import BankingDashboard from './components/panels/BankingDashboard';
import AccountsPanel from './components/panels/AccountsPanel';
import PaymentsUPIPanel from './components/panels/PaymentsUPIPanel';
import CardsPanel from './components/panels/CardsPanel';
import LoansDepositsPanel from './components/panels/LoansDepositsPanel';
import KYCIdentityPanel from './components/panels/KYCIdentityPanel';
import RewardsSupportPanel from './components/panels/RewardsSupportPanel';
import MetadataExplorer from './components/panels/MetadataExplorer';
import AuditLogs from './components/panels/AuditLogs';

import { api, getWebSocketUrl, setToken } from './api';
import { usePanelMotion } from './motion';

const SIGNAL_SEND_INTERVAL_MS = 1000;

export default function App() {
  const [credential, setCredential] = useState(null);
  const [termsAccepted, setTermsAccepted] = useState(false);
  const [sessionId, setSessionId] = useState(null);
  const [trustResult, setTrustResult] = useState(null);
  const [isConnected, setIsConnected] = useState(false);
  const [isRevoked, setIsRevoked] = useState(false);
  const [sessionError, setSessionError] = useState('');
  const [theme, setTheme] = useState(() => localStorage.getItem('theme') || 'system');

  useEffect(() => {
    const handleThemeChange = () => {
      const currentTheme = localStorage.getItem('theme') || 'system';
      if (currentTheme === 'dark') {
        document.body.classList.add('dark-mode');
      } else if (currentTheme === 'light') {
        document.body.classList.remove('dark-mode');
      } else {
        const prefersDark = window.matchMedia('(prefers-color-scheme: dark)').matches;
        if (prefersDark) {
          document.body.classList.add('dark-mode');
        } else {
          document.body.classList.remove('dark-mode');
        }
      }
    };

    handleThemeChange();
    localStorage.setItem('theme', theme);

    const mediaQuery = window.matchMedia('(prefers-color-scheme: dark)');
    if (mediaQuery.addEventListener) {
      mediaQuery.addEventListener('change', handleThemeChange);
    } else {
      mediaQuery.addListener(handleThemeChange);
    }

    return () => {
      if (mediaQuery.removeEventListener) {
        mediaQuery.removeEventListener('change', handleThemeChange);
      } else {
        mediaQuery.removeListener(handleThemeChange);
      }
    };
  }, [theme]);

  const [isCollapsed, setIsCollapsed] = useState(false);
  const [activeTab, setActiveTab] = useState('dashboard');
  const [inspectModalMetadata, setInspectModalMetadata] = useState(null);

  const wsRef = useRef(null);
  const lastSentRef = useRef(0);

  useEffect(() => () => wsRef.current?.close(), []);

  usePanelMotion([activeTab, credential, termsAccepted]);

  const connectWebSocket = (sesId, ticket) => {
    const ws = new WebSocket(getWebSocketUrl(`/ws/trust/${sesId}`, ticket));
    ws.onopen = () => setIsConnected(true);
    ws.onclose = () => setIsConnected(false);
    ws.onmessage = (event) => {
      const result = JSON.parse(event.data);
      setTrustResult(result);
      if (result.recommended_action === 'revoke') setIsRevoked(true);
    };
    wsRef.current = ws;
  };

  const startSession = async (cred) => {
    try {
      const data = await api('/auth/start', {
        method: 'POST',
        body: JSON.stringify({
          user_id: cred.user_id,
          device_id: 'WEB-CLIENT-BANKING',
          ip_address: '127.0.0.1',
          user_agent: navigator.userAgent,
        }),
      });
      setSessionId(data.session_id);
      connectWebSocket(data.session_id, data.websocket_ticket);
    } catch (err) {
      setSessionError(err.message);
    }
  };

  const handleAuthSuccess = (data) => {
    setCredential(data.credential);
    setIsRevoked(false);
  };

  const handleTermsAccepted = () => {
    setTermsAccepted(true);
    startSession(credential);
  };

  const handleSignalUpdate = useCallback((signals) => {
    const now = Date.now();
    if (now - lastSentRef.current < SIGNAL_SEND_INTERVAL_MS) return;
    if (wsRef.current?.readyState !== WebSocket.OPEN) return;
    lastSentRef.current = now;
    wsRef.current.send(JSON.stringify(signals));
  }, []);

  useEffect(() => {
    if (!sessionId || !isConnected) return;
    const interval = setInterval(() => {
      handleSignalUpdate({
        session_id: sessionId,
        behavior_sig: 0.95,
        device_sig: 0.98,
        context_sig: 0.94
      });
    }, SIGNAL_SEND_INTERVAL_MS);
    return () => clearInterval(interval);
  }, [sessionId, isConnected, handleSignalUpdate]);

  const handleLogout = () => {
    wsRef.current?.close();
    setToken(null);
    setCredential(null);
    setTermsAccepted(false);
    setSessionId(null);
    setTrustResult(null);
    setIsConnected(false);
    setIsRevoked(false);
    setSessionError('');
  };

  const openMetadataInspector = (meta) => {
    setInspectModalMetadata(meta);
  };

  const renderPanel = () => {
    switch (activeTab) {
      case 'accounts':
        return <AccountsPanel onInspectMetadata={openMetadataInspector} />;
      case 'payments':
        return <PaymentsUPIPanel onInspectMetadata={openMetadataInspector} />;
      case 'cards':
        return <CardsPanel onInspectMetadata={openMetadataInspector} />;
      case 'loans':
        return <LoansDepositsPanel onInspectMetadata={openMetadataInspector} />;
      case 'kyc':
        return <KYCIdentityPanel onInspectMetadata={openMetadataInspector} />;
      case 'rewards':
        return <RewardsSupportPanel onInspectMetadata={openMetadataInspector} />;
      case 'explorer':
        return <MetadataExplorer initialMetadata={inspectModalMetadata} />;
      case 'profile':
        return <ProfilePanel onInspectMetadata={openMetadataInspector} />;
      case 'audit':
        return <AuditLogs sessionId={sessionId} isRevoked={isRevoked} />;
      default:
        return <BankingDashboard onInspectMetadata={openMetadataInspector} />;
    }
  };

  return (
    <div style={{ display: 'flex', minHeight: '100vh', position: 'relative', background: 'var(--bg-page)' }}>

      {!credential && <AuthModal onAuthSuccess={handleAuthSuccess} />}

      {credential && !termsAccepted && (
        <TermsModal credential={credential} onAccept={handleTermsAccepted} />
      )}

      {credential && termsAccepted && (
        <Sidebar
          activeTab={activeTab}
          setActiveTab={setActiveTab}
          isCollapsed={isCollapsed}
          setIsCollapsed={setIsCollapsed}
          onLogout={handleLogout}
          userProfile={credential}
        />
      )}

      {credential && termsAccepted && (
        <div style={{
          flex: 1,
          marginLeft: isCollapsed ? '72px' : '240px',
          padding: '1.5rem 1.75rem',
          transition: 'margin-left 0.28s cubic-bezier(0.16, 1, 0.3, 1)',
          minWidth: 0,
        }}>
          <header style={{
            display: 'flex', justifyContent: 'space-between', alignItems: 'center',
            marginBottom: '1.5rem', background: 'var(--bg-card)',
            border: '1px solid var(--border)',
            borderRadius: '14px', padding: '0.85rem 1.5rem',
            boxShadow: 'var(--shadow-sm)',
          }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '0.85rem' }}>
              <div style={{
                width: 38, height: 38, borderRadius: 10,
                background: 'linear-gradient(135deg, #1a9975, #0d7a5f)',
                display: 'flex', alignItems: 'center', justifyContent: 'center',
                boxShadow: '0 2px 8px rgba(26,153,117,0.3)', flexShrink: 0
              }}>
                <Landmark size={20} color="#fff" />
              </div>
              <div>
                <h1 style={{ fontSize: '1.05rem', fontWeight: 800, color: '#1a2332', margin: 0 }}>
                  Nexus Global Reserve Bank
                </h1>
                <p style={{ color: '#9ca3af', fontSize: '0.75rem', margin: 0 }}>
                  Blockchain-Native Core Banking · Hyperledger Besu PBFT
                </p>
              </div>
            </div>

            <div style={{ display: 'flex', alignItems: 'center', gap: '0.65rem' }}>
              <button
                onClick={() => setActiveTab('explorer')}
                style={{
                  background: 'rgba(26,153,117,0.1)', border: '1px solid rgba(26,153,117,0.25)',
                  color: '#1a9975', borderRadius: '8px', padding: '0.4rem 0.85rem',
                  fontSize: '0.78rem', fontWeight: 600, cursor: 'pointer',
                  display: 'flex', alignItems: 'center', gap: '0.35rem'
                }}
              >
                <Database size={13} /> 60+ Field Inspector
              </button>

              {/* Theme Selector Switcher */}
              <div style={{ display: 'flex', alignItems: 'center', gap: '0.25rem', background: 'var(--bg-page)', border: '1px solid var(--border)', borderRadius: '8px', padding: '0.2rem 0.35rem' }}>
                <button
                  onClick={() => setTheme('light')}
                  title="Light Theme"
                  style={{
                    background: theme === 'light' ? 'var(--bg-card)' : 'transparent',
                    border: 'none', borderRadius: '5px', color: theme === 'light' ? '#1a9975' : '#9ca3af',
                    padding: '0.25rem', cursor: 'pointer', display: 'flex', alignItems: 'center', transition: 'all 0.15s'
                  }}
                >
                  <Sun size={14} />
                </button>
                <button
                  onClick={() => setTheme('dark')}
                  title="Dark Theme"
                  style={{
                    background: theme === 'dark' ? 'var(--bg-card)' : 'transparent',
                    border: 'none', borderRadius: '5px', color: theme === 'dark' ? '#1a9975' : '#9ca3af',
                    padding: '0.25rem', cursor: 'pointer', display: 'flex', alignItems: 'center', transition: 'all 0.15s'
                  }}
                >
                  <Moon size={14} />
                </button>
                <button
                  onClick={() => setTheme('system')}
                  title="System Theme"
                  style={{
                    background: theme === 'system' ? 'var(--bg-card)' : 'transparent',
                    border: 'none', borderRadius: '5px', color: theme === 'system' ? '#1a9975' : '#9ca3af',
                    padding: '0.25rem', cursor: 'pointer', display: 'flex', alignItems: 'center', transition: 'all 0.15s'
                  }}
                >
                  <Monitor size={14} />
                </button>
              </div>

              <span style={{
                fontSize: '0.7rem', padding: '0.3rem 0.65rem', borderRadius: 9999,
                background: 'rgba(16,185,129,0.1)', color: '#059669',
                border: '1px solid rgba(16,185,129,0.25)', fontWeight: 600,
                display: 'flex', alignItems: 'center', gap: '0.35rem',
              }}>
                <Lock size={11} /> EIP-712 AUTHENTICATED
              </span>
            </div>
          </header>

          {sessionError && (
            <div style={{
              background: '#fffbeb', border: '1px solid #fde68a',
              borderRadius: '12px', marginBottom: '1.5rem', padding: '0.8rem 1rem',
              fontSize: '0.85rem', color: '#92400e',
            }}>
              ⚠ Banking Session Notice: {sessionError}
            </div>
          )}

          {isRevoked && (
            <div style={{
              background: '#fef2f2', border: '1px solid #fecaca',
              borderRadius: '12px', marginBottom: '1.5rem', padding: '1rem',
              display: 'flex', alignItems: 'center', gap: '1rem',
            }}>
              <AlertOctagon size={28} color="#dc2626" />
              <div>
                <h3 style={{ color: '#b91c1c', fontSize: '0.95rem', margin: 0 }}>Account Asset Frozen by Regulatory Node</h3>
                <p style={{ fontSize: '0.82rem', color: '#ef4444', margin: '0.2rem 0 0 0' }}>
                  Suspicious activity flag recorded. Contact Reserve Bank Regulator Node to verify identity.
                </p>
              </div>
            </div>
          )}

          {renderPanel()}
        </div>
      )}

      {/* Floating 60+ Field Metadata Modal */}
      {inspectModalMetadata && (
        <div style={{ position: 'fixed', top: 0, left: 0, right: 0, bottom: 0, background: 'rgba(20,30,48,0.55)', backdropFilter: 'blur(10px)', zIndex: 1100, display: 'flex', alignItems: 'center', justifyContent: 'center', padding: '2rem' }}>
          <div style={{ background: '#fff', border: '1px solid #e8ecf0', borderRadius: '20px', padding: '1.5rem', width: '900px', maxWidth: '95%', maxHeight: '90vh', overflowY: 'auto', boxShadow: '0 20px 60px rgba(0,0,0,0.18)' }}>
            <MetadataExplorer initialMetadata={inspectModalMetadata} onClose={() => setInspectModalMetadata(null)} />
          </div>
        </div>
      )}
    </div>
  );
}
