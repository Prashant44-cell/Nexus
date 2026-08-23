import React, { useState } from 'react';
import {
  LayoutDashboard, Server, Code, ShieldAlert, FileText,
  CreditCard, Monitor, ChevronLeft, ChevronRight, ChevronDown, ChevronUp,
  Landmark, LogOut, TrendingUp
} from 'lucide-react';

const SECTIONS = [
  {
    id: 'overview', label: 'Command Center',
    items: [{ id: 'dashboard', label: 'Regulatory Dashboard', icon: LayoutDashboard }]
  },
  {
    id: 'network', label: 'Blockchain Infrastructure',
    items: [
      { id: 'validators', label: 'Validator Nodes', icon: Server },
      { id: 'contracts', label: 'Smart Contracts IDE', icon: Code }
    ]
  },
  {
    id: 'compliance', label: 'Security & AML',
    items: [
      { id: 'aml', label: 'AML & Sanction Screening', icon: ShieldAlert }
    ]
  },
  {
    id: 'platform', label: 'Platform Management',
    items: [
      { id: 'credentials', label: 'Customer Assets Directory', icon: CreditCard },
      { id: 'verifications', label: 'Identity Review Queue', icon: ShieldAlert },
      { id: 'sessions', label: 'Live Banking Sessions', icon: Monitor },
      { id: 'audit', label: 'Regulatory Audit Ledger', icon: FileText }
    ]
  }
];

export default function AdminSidebar({ activeTab, setActiveTab, isCollapsed, setIsCollapsed, admin, onLogout }) {
  const [collapsedSections, setCollapsedSections] = useState({});

  const toggleSection = (id) => {
    setCollapsedSections(prev => ({ ...prev, [id]: !prev[id] }));
  };

  const name = admin?.credential?.full_name || 'Regulatory Governor';
  const initials = name.split(' ').map(n => n[0]).join('').slice(0, 2).toUpperCase();

  return (
    <aside style={{
      width: isCollapsed ? '72px' : '248px',
      height: '100vh',
      position: 'fixed',
      top: 0, left: 0,
      background: 'var(--bg-sidebar)',
      borderRight: '1px solid var(--border)',
      zIndex: 900,
      display: 'flex',
      flexDirection: 'column',
      transition: 'width 0.28s cubic-bezier(0.16, 1, 0.3, 1), background-color 0.28s ease',
      boxShadow: 'var(--shadow-card)',
      overflowX: 'hidden',
      overflowY: 'auto',
    }}>

      {/* ── Logo Header ── */}
      <div style={{
        padding: isCollapsed ? '1.1rem 0' : '1.1rem 1.1rem',
        display: 'flex', alignItems: 'center',
        justifyContent: isCollapsed ? 'center' : 'space-between',
        borderBottom: '1px solid var(--border)',
        flexShrink: 0, minHeight: 68,
      }}>
        {!isCollapsed && (
          <div style={{ display: 'flex', alignItems: 'center', gap: '0.6rem' }}>
            <div style={{
              width: 36, height: 36, borderRadius: 10,
              background: 'linear-gradient(135deg, #6d28d9, #1a9975)',
              display: 'flex', alignItems: 'center', justifyContent: 'center',
              boxShadow: '0 2px 8px rgba(109,40,217,0.3)', flexShrink: 0
            }} className="pulse-neon">
              <Landmark size={18} color="#fff" />
            </div>
            <div>
              <span style={{
                fontWeight: 800, fontSize: '0.88rem', color: 'var(--text-main)',
                letterSpacing: '-0.02em', display: 'block', lineHeight: 1.2
              }}>
                Regulatory <span style={{ color: '#8b5cf6' }}>Node</span>
              </span>
              <span style={{ fontSize: '0.56rem', color: 'var(--text-muted)', textTransform: 'uppercase', letterSpacing: '0.06em' }}>
                Reserve Bank Governor · Port 3001
              </span>
            </div>
          </div>
        )}
        <button
          onClick={() => setIsCollapsed(!isCollapsed)}
          style={{
            background: 'var(--bg-page)', border: '1px solid var(--border)',
            borderRadius: 8, color: 'var(--text-secondary)',
            padding: '0.4rem', cursor: 'pointer',
            display: 'flex', alignItems: 'center', flexShrink: 0,
            transition: 'all 0.18s ease'
          }}
          className="neon-glow-hover"
        >
          {isCollapsed ? <ChevronRight size={15} /> : <ChevronLeft size={15} />}
        </button>
      </div>

      {/* ── Navigation ── */}
      <nav style={{
        flex: 1, overflowY: 'auto', overflowX: 'hidden',
        padding: isCollapsed ? '0.5rem 0.4rem' : '0.5rem 0.65rem',
        display: 'flex', flexDirection: 'column',
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
                    background: 'none', border: 'none', cursor: 'pointer', marginTop: '0.6rem',
                  }}
                >
                  <span style={{ fontSize: '0.59rem', fontWeight: 700, color: 'var(--text-muted)', textTransform: 'uppercase', letterSpacing: '0.1em' }}>
                    {section.label}
                  </span>
                  {isSectionCollapsed
                    ? <ChevronDown size={11} color="var(--text-muted)" />
                    : <ChevronUp size={11} color="var(--text-muted)" />}
                </button>
              )}
              {isCollapsed && <div style={{ height: '0.3rem' }} />}

              {!isSectionCollapsed && (
                <div style={{ display: 'flex', flexDirection: 'column', gap: '2px' }}>
                  {section.items.map(item => {
                    const Icon = item.icon;
                    const isActive = activeTab === item.id;
                    return (
                      <button
                        key={item.id}
                        onClick={() => setActiveTab(item.id)}
                        title={isCollapsed ? item.label : undefined}
                        style={{
                          display: 'flex', alignItems: 'center',
                          gap: isCollapsed ? 0 : '0.6rem',
                          justifyContent: isCollapsed ? 'center' : 'flex-start',
                          padding: isCollapsed ? '0.65rem 0' : '0.55rem 0.75rem',
                          borderRadius: 10, border: 'none',
                          background: isActive ? 'rgba(109,40,217,0.14)' : 'transparent',
                          color: isActive ? '#8b5cf6' : 'var(--text-secondary)',
                          cursor: 'pointer', fontWeight: isActive ? 700 : 500,
                          fontSize: '0.82rem', width: '100%', textAlign: 'left',
                          position: 'relative',
                          transition: 'all 0.18s ease',
                          boxShadow: isActive ? '0 0 15px rgba(109,40,217,0.2)' : 'none'
                        }}
                        className={!isActive ? "neon-purple-hover" : ""}
                      >
                        {isActive && !isCollapsed && (
                          <span style={{
                            position: 'absolute', left: 0, top: '20%', bottom: '20%',
                            width: 3, background: '#8b5cf6', borderRadius: '0 3px 3px 0',
                            boxShadow: '0 0 8px #8b5cf6'
                          }} />
                        )}
                        <Icon size={17} color={isActive ? '#8b5cf6' : 'var(--text-muted)'} style={{ flexShrink: 0 }} />
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

      {/* ── Promo Banner ── */}
      {!isCollapsed && (
        <div style={{
          margin: '0.75rem',
          background: 'linear-gradient(135deg, #6d28d9 0%, #4c1d95 100%)',
          borderRadius: 14, padding: '1rem',
          color: '#fff', position: 'relative', overflow: 'hidden', flexShrink: 0,
          boxShadow: '0 4px 15px rgba(109,40,217,0.35)'
        }}>
          <div style={{ position: 'absolute', bottom: -16, right: -16, width: 64, height: 64, borderRadius: '50%', background: 'rgba(255,255,255,0.1)' }} />
          <div style={{ fontSize: '0.7rem', fontWeight: 700, marginBottom: '0.25rem', opacity: 0.85 }}>
            Regulatory Console
          </div>
          <div style={{ fontSize: '0.8rem', fontWeight: 700, lineHeight: 1.3, marginBottom: '0.5rem' }}>
            PBFT Consensus → Live Governance
          </div>
          <div style={{ fontSize: '0.7rem', opacity: 0.75, display: 'flex', alignItems: 'center', gap: '0.3rem' }}>
            <TrendingUp size={12} /> 12 validator nodes →
          </div>
        </div>
      )}

      {/* ── Customer Banking Switcher Shortcut ── */}
      {!isCollapsed && (
        <div style={{ padding: '0 0.85rem 0.6rem 0.85rem' }}>
          <a
            href={window.location.port === '3001' ? 'http://localhost:3000' : '/'}
            style={{
              display: 'flex', alignItems: 'center', gap: '0.45rem',
              padding: '0.5rem 0.75rem', borderRadius: 10,
              background: 'rgba(26,153,117,0.08)', border: '1px solid rgba(26,153,117,0.25)',
              color: '#1a9975', fontSize: '0.74rem', fontWeight: 700,
              textDecoration: 'none', transition: 'all 0.2s ease'
            }}
            className="neon-glow-hover"
          >
            <Landmark size={14} /> Customer Banking Portal
          </a>
        </div>
      )}

      {/* ── Admin User Footer ── */}
      <div style={{
        padding: '0.85rem 1rem',
        borderTop: '1px solid var(--border)',
        background: 'var(--bg-card)',
        display: 'flex', alignItems: 'center',
        justifyContent: isCollapsed ? 'center' : 'space-between',
        gap: '0.6rem', flexShrink: 0,
      }}>
        {!isCollapsed && (
          <div style={{ display: 'flex', alignItems: 'center', gap: '0.6rem', overflow: 'hidden' }}>
            <div style={{
              width: 34, height: 34, borderRadius: '50%',
              background: 'rgba(109,40,217,0.15)',
              border: '2px solid rgba(109,40,217,0.3)',
              display: 'flex', alignItems: 'center', justifyContent: 'center',
              color: '#8b5cf6', fontWeight: 800, fontSize: '0.74rem', flexShrink: 0,
            }}>
              {initials}
            </div>
            <div style={{ overflow: 'hidden' }}>
              <div style={{ fontSize: '0.78rem', fontWeight: 700, color: 'var(--text-main)', whiteSpace: 'nowrap', textOverflow: 'ellipsis', overflow: 'hidden' }}>
                {name}
              </div>
              <div style={{ fontSize: '0.62rem', color: '#8b5cf6', fontWeight: 600 }}>
                Reserve Bank Governor
              </div>
            </div>
          </div>
        )}
        {onLogout && (
          <button
            onClick={onLogout}
            title="Sign Out"
            style={{
              background: 'rgba(239,68,68,0.1)', border: '1px solid rgba(239,68,68,0.25)',
              color: '#ef4444', borderRadius: 8, padding: '0.45rem',
              cursor: 'pointer', flexShrink: 0, display: 'flex', alignItems: 'center',
              transition: 'all 0.18s ease'
            }}
          >
            <LogOut size={15} />
          </button>
        )}
      </div>
    </aside>
  );
}
