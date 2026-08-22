import React, { useState } from 'react';
import {
  LayoutDashboard, ShieldCheck, Wallet, CreditCard,
  Send, Landmark, Award, Database, FileText,
  ChevronLeft, ChevronRight, ChevronDown, ChevronUp,
  LogOut, Cpu, TrendingUp, User
} from 'lucide-react';

const SECTIONS = [
  {
    id: 'overview', label: 'Overview',
    items: [{ id: 'dashboard', label: 'Banking Dashboard', icon: LayoutDashboard }]
  },
  {
    id: 'banking', label: 'Banking & Money',
    items: [
      { id: 'accounts', label: 'Accounts & Wallets', icon: Wallet },
      { id: 'payments', label: 'Payments & UPI 2.0', icon: Send }
    ]
  },
  {
    id: 'credit', label: 'Credit & Wealth',
    items: [
      { id: 'cards', label: 'Cards & Tokenization', icon: CreditCard },
      { id: 'loans', label: 'Loans & Staking', icon: Landmark }
    ]
  },
  {
    id: 'security', label: 'Security & Compliance',
    items: [
      { id: 'kyc', label: 'ZK-KYC Vault', icon: ShieldCheck },
      { id: 'profile', label: 'Profile & Verification', icon: User },
      { id: 'audit', label: 'Immutable Audit Logs', icon: FileText }
    ]
  },
  {
    id: 'governance', label: 'Governance & Tools',
    items: [
      { id: 'rewards', label: 'Rewards & Disputes', icon: Award },
      { id: 'explorer', label: '60+ Field Inspector', icon: Database }
    ]
  }
];

export default function Sidebar({ activeTab, setActiveTab, isCollapsed, setIsCollapsed, onLogout, userProfile }) {
  const [collapsedSections, setCollapsedSections] = useState({});

  const toggleSection = (id) => {
    setCollapsedSections(prev => ({ ...prev, [id]: !prev[id] }));
  };

  const initials = userProfile?.full_name
    ? userProfile.full_name.split(' ').map(n => n[0]).join('').slice(0, 2).toUpperCase()
    : 'AS';

  return (
    <aside style={{
      width: isCollapsed ? '72px' : '240px',
      height: '100vh',
      position: 'fixed',
      top: 0, left: 0,
      background: 'var(--bg-sidebar)',
      borderRight: '1px solid var(--border)',
      zIndex: 900,
      display: 'flex',
      flexDirection: 'column',
      transition: 'width 0.28s cubic-bezier(0.16, 1, 0.3, 1)',
      boxShadow: '2px 0 12px rgba(0,0,0,0.06)',
      overflowX: 'hidden',
      overflowY: 'auto'
    }}>

      {/* ── Logo header ── */}
      <div style={{
        padding: isCollapsed ? '1.1rem 0' : '1.1rem 1.1rem',
        display: 'flex',
        alignItems: 'center',
        justifyContent: isCollapsed ? 'center' : 'space-between',
        borderBottom: '1px solid var(--border)',
        flexShrink: 0,
        minHeight: 68,
      }}>
        {!isCollapsed && (
          <div style={{ display: 'flex', alignItems: 'center', gap: '0.6rem' }}>
            <div style={{
              width: 36, height: 36, borderRadius: 10,
              background: 'linear-gradient(135deg, #1a9975, #0d7a5f)',
              display: 'flex', alignItems: 'center', justifyContent: 'center',
              boxShadow: '0 2px 8px rgba(26,153,117,0.35)', flexShrink: 0
            }}>
              <Landmark size={18} color="#fff" />
            </div>
            <div>
              <span style={{
                fontWeight: 800, fontSize: '0.9rem', color: 'var(--text-main)',
                letterSpacing: '-0.02em', display: 'block', lineHeight: 1.2
              }}>
                Nexus <span style={{ color: '#1a9975' }}>BlockBank</span>
              </span>
              <span style={{ fontSize: '0.56rem', color: 'var(--text-muted)', textTransform: 'uppercase', letterSpacing: '0.06em' }}>
                Hyperledger Besu · Port 3000
              </span>
            </div>
          </div>
        )}
        <button
          onClick={() => setIsCollapsed(!isCollapsed)}
          style={{
            background: 'var(--bg-page)', border: '1px solid var(--border)',
            borderRadius: 7, color: 'var(--text-muted)',
            padding: '0.35rem', cursor: 'pointer',
            display: 'flex', alignItems: 'center', flexShrink: 0
          }}
        >
          {isCollapsed ? <ChevronRight size={15} /> : <ChevronLeft size={15} />}
        </button>
      </div>

      {/* ── Navigation ── */}
      <nav style={{
        flex: 1, overflowY: 'auto', overflowX: 'hidden',
        padding: isCollapsed ? '0.5rem 0.4rem' : '0.5rem 0.65rem',
        display: 'flex', flexDirection: 'column'
      }}>
        {SECTIONS.map(section => {
          const isSectionCollapsed = collapsedSections[section.id];
          return (
            <div key={section.id} style={{ marginBottom: '0.2rem' }}>
              {!isCollapsed && (
                <button
                  onClick={() => toggleSection(section.id)}
                  style={{
                    width: '100%', display: 'flex', alignItems: 'center',
                    justifyContent: 'space-between', padding: '0.45rem 0.55rem',
                    background: 'none', border: 'none', cursor: 'pointer',
                    marginTop: '0.6rem'
                  }}
                >
                  <span style={{
                    fontSize: '0.59rem', fontWeight: 700, color: 'var(--text-muted)',
                    textTransform: 'uppercase', letterSpacing: '0.1em'
                  }}>
                    {section.label}
                  </span>
                  {isSectionCollapsed
                    ? <ChevronDown size={11} color="var(--text-muted)" />
                    : <ChevronUp size={11} color="var(--text-muted)" />
                  }
                </button>
              )}
              {isCollapsed && <div style={{ height: '0.3rem' }} />}

              {!isSectionCollapsed && (
                <div style={{ display: 'flex', flexDirection: 'column', gap: '1px' }}>
                  {section.items.map(item => {
                    const Icon = item.icon;
                    const isActive = activeTab === item.id;
                    return (
                      <button
                        key={item.id}
                        onClick={() => setActiveTab(item.id)}
                        title={isCollapsed ? item.label : undefined}
                        style={{
                          display: 'flex',
                          alignItems: 'center',
                          gap: isCollapsed ? 0 : '0.6rem',
                          justifyContent: isCollapsed ? 'center' : 'flex-start',
                          padding: isCollapsed ? '0.65rem 0' : '0.5rem 0.75rem',
                          borderRadius: 8,
                          border: 'none',
                          background: isActive ? 'rgba(26,153,117,0.1)' : 'transparent',
                          color: isActive ? '#1a9975' : 'var(--text-secondary)',
                          cursor: 'pointer',
                          fontWeight: isActive ? 600 : 400,
                          fontSize: '0.82rem',
                          transition: 'all 0.14s ease',
                          width: '100%',
                          textAlign: 'left',
                          position: 'relative',
                        }}
                      >
                        {isActive && !isCollapsed && (
                          <span style={{
                            position: 'absolute', left: 0, top: '20%', bottom: '20%',
                            width: 3, background: '#1a9975', borderRadius: '0 3px 3px 0'
                          }} />
                        )}
                        <Icon
                          size={17}
                          color={isActive ? '#1a9975' : 'var(--text-muted)'}
                          style={{ flexShrink: 0 }}
                        />
                        {!isCollapsed && <span>{item.label}</span>}
                      </button>
                    );
                  })}
                </div>
              )}
            </div>
          );
        })}
      </nav>

      {/* ── Promo Banner (Neatclever-style green card) ── */}
      {!isCollapsed && (
        <div style={{
          margin: '0.75rem',
          background: 'linear-gradient(135deg, #1a9975 0%, #0d6b52 100%)',
          borderRadius: 12, padding: '1rem',
          color: '#fff', position: 'relative', overflow: 'hidden',
          flexShrink: 0
        }}>
          <div style={{
            position: 'absolute', bottom: -16, right: -16,
            width: 64, height: 64, borderRadius: '50%',
            background: 'rgba(255,255,255,0.1)'
          }} />
          <div style={{ fontSize: '0.7rem', fontWeight: 700, marginBottom: '0.25rem', opacity: 0.85 }}>
            Blockchain Banking
          </div>
          <div style={{ fontSize: '0.82rem', fontWeight: 700, lineHeight: 1.3, marginBottom: '0.5rem' }}>
            Nexus Vault → CBDC Ready
          </div>
          <div style={{ fontSize: '0.7rem', opacity: 0.75, cursor: 'pointer', display: 'flex', alignItems: 'center', gap: '0.3rem' }}>
            <TrendingUp size={12} /> Explore features →
          </div>
        </div>
      )}

      {/* ── User Footer ── */}
      <div style={{
        padding: '0.85rem 0.85rem',
        borderTop: '1px solid var(--border)',
        background: 'var(--bg-page)',
        display: 'flex', alignItems: 'center',
        justifyContent: isCollapsed ? 'center' : 'space-between',
        gap: '0.6rem',
        flexShrink: 0,
      }}>
        {!isCollapsed && (
          <div style={{ display: 'flex', alignItems: 'center', gap: '0.6rem', overflow: 'hidden' }}>
            <div style={{
              width: 32, height: 32, borderRadius: '50%',
              background: 'rgba(26,153,117,0.12)',
              border: '2px solid rgba(26,153,117,0.25)',
              display: 'flex', alignItems: 'center', justifyContent: 'center',
              color: '#1a9975', fontWeight: 700, fontSize: '0.72rem', flexShrink: 0
            }}>
              {initials}
            </div>
            <div style={{ overflow: 'hidden' }}>
              <div style={{
                fontSize: '0.78rem', fontWeight: 600, color: 'var(--text-main)',
                whiteSpace: 'nowrap', textOverflow: 'ellipsis', overflow: 'hidden'
              }}>
                {userProfile?.full_name || 'Aarav Sharma'}
              </div>
              <div style={{ fontSize: '0.62rem', color: '#1a9975', fontWeight: 500 }}>
                ZK Tier 3 Verified
              </div>
            </div>
          </div>
        )}
        <button
          onClick={onLogout}
          title="Sign Out"
          style={{
            background: 'rgba(239,68,68,0.08)', border: '1px solid rgba(239,68,68,0.2)',
            color: '#ef4444', borderRadius: 8, padding: '0.45rem',
            cursor: 'pointer', flexShrink: 0, display: 'flex', alignItems: 'center'
          }}
        >
          <LogOut size={15} />
        </button>
      </div>
    </aside>
  );
}
