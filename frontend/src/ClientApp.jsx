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

export default function ClientApp({ onReturnToWelcome }) {
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
        if (window.matchMedia && window.matchMedia('(prefers-color-scheme: dark)').matches) {
          document.body.classList.add('dark-mode');
        } else {
          document.body.classList.remove('dark-mode');
        }
      }
    };

    handleThemeChange();
    const mediaQuery = window.matchMedia('(prefers-color-scheme: dark)');
    mediaQuery.addEventListener('change', handleThemeChange);
    return () => mediaQuery.removeEventListener('change', handleThemeChange);
  }, [theme]);

  const [isCollapsed, setIsCollapsed] = useState(false);
  const [activeTab, setActiveTab] = useState('dashboard');
  const [inspectModalMetadata, setInspectModalMetadata] = useState(null);

  const wsRef = useRef(null);
  const lastSentRef = useRef(0);

  const startSession = async (userCred) => {
    try {
      const response = await api('/auth/session/start', {
        method: 'POST',
        body: JSON.stringify({
          user_id: userCred.credential_id || 'USR-NEXUS-01',
          initial_behavior_sig: 0.95,
          initial_device_sig: 0.98,
          initial_context_sig: 0.94,
          consent_hash: userCred.consent_hash || '0xdefault'
        })
      });

      setSessionId(response.session_id);
      setTrustResult({
        trust_score: response.trust_score,
        risk_level: response.risk_level,
        latency_ms: 0,
        reasons: ['SESSION_INITIALIZED']
      });

      connectWebSocket(response.session_id);
    } catch (err) {
      setSessionError(err.message);
    }
  };

  const connectWebSocket = (sId) => {
    try {
      const ws = new WebSocket(getWebSocketUrl(sId));
      wsRef.current = ws;

      ws.onopen = () => {
        setIsConnected(true);
        setSessionError('');
      };

      ws.onmessage = (event) => {
        try {
          const data = JSON.parse(event.data);
          if (data.type === 'TRUST_EVALUATION') {
            setTrustResult(data.evaluation);
          } else if (data.type === 'STEP_UP_CHALLENGE') {
            // High risk prompt
          } else if (data.type === 'CREDENTIAL_REVOKED') {
            setIsRevoked(true);
          }
        } catch (e) {
          // ignore malformed
        }
      };

      ws.onclose = () => {
        setIsConnected(false);
      };

      ws.onerror = () => {
        setIsConnected(false);
      };
    } catch (e) {
      setSessionError('WebSocket stream unavailable');
    }
  };

  const handleAuthSuccess = (data) => {
    setToken(data.token);
    setCredential(data.user);
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
                <h1 style={{ fontSize: '1.08rem', fontWeight: 800, color: 'var(--text-main)', margin: 0, letterSpacing: '-0.02em' }}>
                  Nexus Global Reserve Bank
                </h1>
                <p style={{ color: 'var(--text-muted)', fontSize: '0.75rem', margin: 0 }}>
                  Blockchain-Native Core Banking · Sepolia zk-Rollup PBFT
                </p>
              </div>
            </div>

            <div style={{ display: 'flex', alignItems: 'center', gap: '0.65rem' }}>
              {onReturnToWelcome && (
                <button
                  onClick={onReturnToWelcome}
                  style={{
                    background: 'rgba(175, 221, 255, 0.12)', border: '1px solid rgba(175, 221, 255, 0.35)',
                    color: '#38bdf8', borderRadius: '10px', padding: '0.45rem 0.95rem',
                    fontSize: '0.78rem', fontWeight: 700, cursor: 'pointer',
                    display: 'flex', alignItems: 'center', gap: '0.4rem',
                    transition: 'all 0.2s ease'
                  }}
                  className="neon-glow-hover font-graphik"
                  title="Return to LŪMEN // ÍNDEX Landing"
                >
                  ✦ LŪMEN // ÍNDEX
                </button>
              )}

              <button
                onClick={() => setActiveTab('explorer')}
                style={{
                  background: 'rgba(26,153,117,0.1)', border: '1px solid rgba(26,153,117,0.25)',
                  color: '#1a9975', borderRadius: '10px', padding: '0.45rem 0.95rem',
                  fontSize: '0.78rem', fontWeight: 700, cursor: 'pointer',
                  display: 'flex', alignItems: 'center', gap: '0.4rem',
                  transition: 'all 0.2s ease'
                }}
                className="neon-glow-hover"
              >
                <Database size={14} /> 60+ Field Inspector
              </button>

              {/* Theme Selector Switcher */}
              <div style={{
                display: 'flex', alignItems: 'center', gap: '0.25rem',
                background: 'var(--bg-page)', border: '1px solid var(--border)',
                borderRadius: '10px', padding: '0.25rem 0.4rem',
                boxShadow: 'var(--shadow-sm)'
              }}>
                <button
                  onClick={() => setTheme('light')}
                  title="Light Theme"
                  style={{
                    background: theme === 'light' ? 'var(--bg-card)' : 'transparent',
                    border: 'none', borderRadius: '6px', color: theme === 'light' ? '#1a9975' : 'var(--text-muted)',
                    padding: '0.3rem', cursor: 'pointer', display: 'flex', alignItems: 'center',
                    boxShadow: theme === 'light' ? '0 1px 4px rgba(0,0,0,0.1)' : 'none',
                    transition: 'all 0.2s ease'
                  }}
                  className={theme === 'light' ? 'neon-glow-hover' : ''}
                >
                  <Sun size={15} />
                </button>
                <button
                  onClick={() => setTheme('dark')}
                  title="Dark Theme"
                  style={{
                    background: theme === 'dark' ? 'var(--bg-card)' : 'transparent',
                    border: 'none', borderRadius: '6px', color: theme === 'dark' ? '#1a9975' : 'var(--text-muted)',
                    padding: '0.3rem', cursor: 'pointer', display: 'flex', alignItems: 'center',
                    boxShadow: theme === 'dark' ? '0 1px 4px rgba(0,0,0,0.2)' : 'none',
                    transition: 'all 0.2s ease'
                  }}
                  className={theme === 'dark' ? 'neon-glow-hover' : ''}
                >
                  <Moon size={15} />
                </button>
                <button
                  onClick={() => setTheme('system')}
                  title="System Theme"
                  style={{
                    background: theme === 'system' ? 'var(--bg-card)' : 'transparent',
                    border: 'none', borderRadius: '6px', color: theme === 'system' ? '#1a9975' : 'var(--text-muted)',
                    padding: '0.3rem', cursor: 'pointer', display: 'flex', alignItems: 'center',
                    boxShadow: theme === 'system' ? '0 1px 4px rgba(0,0,0,0.1)' : 'none',
                    transition: 'all 0.2s ease'
                  }}
                  className={theme === 'system' ? 'neon-glow-hover' : ''}
                >
                  <Monitor size={15} />
                </button>
              </div>

              <span style={{
                fontSize: '0.72rem', padding: '0.35rem 0.75rem', borderRadius: 9999,
                background: 'rgba(16,185,129,0.12)', color: '#10b981',
                border: '1px solid rgba(16,185,129,0.3)', fontWeight: 700,
                display: 'flex', alignItems: 'center', gap: '0.4rem',
              }}>
                <Lock size={12} /> EIP-712 AUTHENTICATED
              </span>
            </div>
          </header>

          {sessionError && (
            <div style={{
              background: 'rgba(245, 158, 11, 0.1)', border: '1px solid rgba(245, 158, 11, 0.3)',
              borderRadius: '12px', marginBottom: '1.5rem', padding: '0.85rem 1.1rem',
              fontSize: '0.85rem', color: '#f59e0b',
            }}>
              ⚠ Banking Session Notice: {sessionError}
            </div>
          )}

          {isRevoked && (
            <div style={{
              background: 'rgba(239, 68, 68, 0.1)', border: '1px solid rgba(239, 68, 68, 0.3)',
              borderRadius: '14px', marginBottom: '1.5rem', padding: '1.1rem',
              display: 'flex', alignItems: 'center', gap: '1rem',
            }}>
              <AlertOctagon size={30} color="#ef4444" />
              <div>
                <h3 style={{ color: '#ef4444', fontSize: '1rem', margin: 0, fontWeight: 800 }}>Account Asset Frozen by Regulatory Node</h3>
                <p style={{ fontSize: '0.82rem', color: 'var(--text-secondary)', margin: '0.25rem 0 0 0' }}>
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
        <div style={{
          position: 'fixed', inset: 0,
          background: 'rgba(10,18,30,0.75)', backdropFilter: 'blur(12px)',
          zIndex: 1100, display: 'flex', alignItems: 'center', justifyContent: 'center', padding: '2rem',
          animation: 'fadeIn 0.25s ease-out'
        }}>
          <div style={{
            background: 'var(--bg-card)', border: '1px solid var(--border)',
            borderRadius: '24px', padding: '1.75rem', width: '920px', maxWidth: '95%',
            maxHeight: '90vh', overflowY: 'auto',
            boxShadow: '0 25px 70px rgba(0,0,0,0.35), 0 0 30px rgba(26,153,117,0.2)',
            color: 'var(--text-main)',
            animation: 'modalSlideUp 0.3s cubic-bezier(0.16,1,0.3,1)'
          }}>
            <MetadataExplorer initialMetadata={inspectModalMetadata} onClose={() => setInspectModalMetadata(null)} />
          </div>
        </div>
      )}
    </div>
  );
}
