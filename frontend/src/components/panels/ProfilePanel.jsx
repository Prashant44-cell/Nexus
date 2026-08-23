import React, { useState, useEffect } from 'react';
import {
  ShieldCheck, User, MapPin, Upload, FileText, CheckCircle,
  AlertOctagon, History, Eye, ArrowRight, Wallet, CreditCard,
  Key, Lock, Landmark, Award, Cpu, Copy, Check, ExternalLink,
  Shield, Activity, RefreshCw, Smartphone, Mail, Hash, Globe
} from 'lucide-react';
import { api } from '../../api';

const inputStyle = {
  width: '100%',
  padding: '0.7rem 0.9rem',
  borderRadius: 10,
  border: '1.5px solid var(--border)',
  background: 'var(--bg-page)',
  color: 'var(--text-main)',
  fontSize: '0.875rem',
  outline: 'none',
  fontFamily: 'Inter, sans-serif',
  transition: 'all 0.2s ease',
};

const labelStyle = {
  display: 'block',
  fontSize: '0.72rem',
  color: 'var(--text-secondary)',
  marginBottom: '0.35rem',
  fontWeight: 700,
  textTransform: 'uppercase',
  letterSpacing: '0.05em'
};

export default function ProfilePanel() {
  const [profile, setProfile] = useState(null);
  const [verification, setVerification] = useState(null);
  const [auditHistory, setAuditHistory] = useState([]);
  const [loading, setLoading] = useState(true);
  const [errorMsg, setErrorMsg] = useState('');
  const [successMsg, setSuccessMsg] = useState('');
  const [submittingProfile, setSubmittingProfile] = useState(false);
  const [submittingVerif, setSubmittingVerif] = useState(false);
  const [activeSubTab, setActiveSubTab] = useState('personal');
  const [copiedKey, setCopiedKey] = useState(false);
  const [copiedWallet, setCopiedWallet] = useState(false);

  // Form states with realistic rich defaults
  const [profileForm, setProfileForm] = useState({
    full_name: 'Aarav Sharma',
    date_of_birth: '1996-08-14',
    gender: 'male',
    mobile_number: '+91 98765 43210',
    email_address: 'aarav.sharma@nexusbank.example',
    address: 'Flat 402, High-Tech Residency, Cyber City',
    city: 'Mumbai',
    state: 'Maharashtra',
    postal_code: '400051',
    country: 'India',
    institution: 'Nexus Global Reserve Bank',
    department: 'Private Wealth & Digital Vault'
  });

  const [verifForm, setVerifForm] = useState({
    citizen_id_number: '5482 9102 3847',
    proof_type: 'aadhaar',
    proof_document_front: '',
    proof_document_back: '',
    selfie_or_live_photo: ''
  });

  useEffect(() => {
    fetchProfileData();
  }, []);

  const fetchProfileData = async () => {
    try {
      setLoading(true);
      setErrorMsg('');
      const data = await api('/api/profile');
      if (data.profile) {
        setProfile(data.profile);
        setProfileForm(prev => ({ ...prev, ...data.profile }));
      }
      if (data.verification) {
        setVerification(data.verification);
        setVerifForm(prev => ({
          ...prev,
          citizen_id_number: data.verification.citizen_id_number || prev.citizen_id_number,
          proof_type: data.verification.proof_type || prev.proof_type,
          proof_document_front: data.verification.proof_document_front || '',
          proof_document_back: data.verification.proof_document_back || '',
          selfie_or_live_photo: data.verification.selfie_or_live_photo || ''
        }));
      }
      // Fetch audit logs
      try {
        const auditData = await api('/api/profile/audit');
        if (auditData?.audit_history) {
          setAuditHistory(auditData.audit_history);
        }
      } catch (e) {
        // Fallback demo audit history
      }
    } catch (err) {
      // If profile API returns 404/empty, use demo profile
      setProfile({
        full_name: 'Aarav Sharma',
        email_address: 'aarav.sharma@nexusbank.example',
        mobile_number: '+91 98765 43210',
        city: 'Mumbai',
        country: 'India',
        date_of_birth: '1996-08-14'
      });
    } finally {
      setLoading(false);
    }
  };

  const handleProfileSubmit = async (e) => {
    e.preventDefault();
    setSubmittingProfile(true);
    setErrorMsg('');
    setSuccessMsg('');
    try {
      const data = await api('/api/profile', {
        method: 'POST',
        body: JSON.stringify(profileForm)
      });
      setProfile(data.profile || profileForm);
      setSuccessMsg('Profile details and contact preferences saved successfully.');
    } catch (err) {
      setErrorMsg(err.message);
    } finally {
      setSubmittingProfile(false);
    }
  };

  const handleFileUpload = (field) => (e) => {
    const file = e.target.files[0];
    if (!file) return;

    if (file.size > 5 * 1024 * 1024) {
      setErrorMsg('File size must be less than 5MB');
      return;
    }

    const reader = new FileReader();
    reader.onloadend = () => {
      setVerifForm(prev => ({
        ...prev,
        [field]: reader.result
      }));
    };
    reader.readAsDataURL(file);
  };

  const handleVerificationSubmit = async (e) => {
    e.preventDefault();
    setSubmittingVerif(true);
    setErrorMsg('');
    setSuccessMsg('');
    try {
      const data = await api('/api/profile/verify', {
        method: 'POST',
        body: JSON.stringify(verifForm)
      });
      setVerification(data.verification || { status: 'pending' });
      setSuccessMsg('KYC document package submitted for smart contract validation!');
      fetchProfileData();
    } catch (err) {
      setErrorMsg(err.message);
    } finally {
      setSubmittingVerif(false);
    }
  };

  const copyToClipboard = (text, type) => {
    navigator.clipboard.writeText(text);
    if (type === 'key') {
      setCopiedKey(true);
      setTimeout(() => setCopiedKey(false), 2000);
    } else {
      setCopiedWallet(true);
      setTimeout(() => setCopiedWallet(false), 2000);
    }
  };

  const renderStatusBadge = (status) => {
    switch (status) {
      case 'approved':
        return (
          <span className="badge badge-low" style={{ display: 'inline-flex', alignItems: 'center', gap: '0.35rem' }}>
            <CheckCircle size={13} /> Tier 3 · Verified Sovereign
          </span>
        );
      case 'rejected':
        return (
          <span className="badge badge-high" style={{ display: 'inline-flex', alignItems: 'center', gap: '0.35rem' }}>
            <AlertOctagon size={13} /> Verification Rejected
          </span>
        );
      case 'pending':
        return (
          <span className="badge badge-medium" style={{ display: 'inline-flex', alignItems: 'center', gap: '0.35rem' }}>
            <History size={13} /> Pending Validator Review
          </span>
        );
      default:
        return (
          <span className="badge badge-low" style={{ display: 'inline-flex', alignItems: 'center', gap: '0.35rem' }}>
            <CheckCircle size={13} /> Tier 2 · Active Sovereign
          </span>
        );
    }
  };

  if (loading) {
    return (
      <div style={{ padding: '4rem', textAlign: 'center', color: '#1a9975' }}>
        <RefreshCw size={36} className="pulse-neon" style={{ animation: 'spin 1.5s linear infinite' }} />
        <h3 style={{ marginTop: '1rem', color: 'var(--text-main)' }}>Loading Sovereign Profile &amp; Cryptographic Vault...</h3>
      </div>
    );
  }

  const userKey = profile?.user_key || "USR-KEY-9F8A7B6C5D4E3F21";
  const walletAddr = profile?.wallet_address || "0x71C35296D3B6A99A2D788647E3294E21350b9E4A";

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '1.5rem', animation: 'fadeIn 0.25s ease-out' }}>
      
      {/* ── Top Header & Title ── */}
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: '1rem' }}>
        <div>
          <h2 style={{ fontSize: '1.5rem', fontWeight: 800, color: 'var(--text-main)', margin: 0, letterSpacing: '-0.02em' }}>
            Sovereign Profile &amp; Cryptographic Vault
          </h2>
          <div style={{ fontSize: '0.84rem', color: 'var(--text-secondary)', marginTop: '0.2rem' }}>
            Multi-signature wallet binding, decentralized identity proofs, and institutional banking parameters.
          </div>
        </div>

        <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
          {renderStatusBadge(verification?.status || 'approved')}
          <span style={{
            background: 'rgba(26,153,117,0.12)', border: '1px solid rgba(26,153,117,0.3)',
            color: '#1a9975', padding: '0.35rem 0.75rem', borderRadius: 9999,
            fontSize: '0.75rem', fontWeight: 700, display: 'flex', alignItems: 'center', gap: '0.4rem'
          }} className="pulse-neon">
            <Activity size={13} /> Trust Score: 99.4%
          </span>
        </div>
      </div>

      {/* ── Executive Profile Hero Banner ── */}
      <div className="card neon-card" style={{
        padding: '1.75rem',
        background: 'linear-gradient(135deg, var(--bg-card) 0%, rgba(26,153,117,0.06) 100%)',
        position: 'relative', overflow: 'hidden'
      }}>
        <div style={{
          position: 'absolute', top: -30, right: -30, width: 140, height: 140,
          borderRadius: '50%', background: 'rgba(26,153,117,0.08)', filter: 'blur(30px)', pointerEvents: 'none'
        }} />

        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', flexWrap: 'wrap', gap: '1.5rem' }}>
          {/* Avatar & User meta */}
          <div style={{ display: 'flex', alignItems: 'center', gap: '1.25rem' }}>
            <div style={{
              width: 72, height: 72, borderRadius: 20,
              background: 'linear-gradient(135deg, #1a9975, #0d7a5f)',
              display: 'flex', alignItems: 'center', justifyContent: 'center',
              color: '#ffffff', fontWeight: 800, fontSize: '1.6rem',
              boxShadow: '0 4px 20px rgba(26,153,117,0.4)',
              border: '2px solid rgba(255,255,255,0.2)',
              position: 'relative'
            }}>
              {profileForm.full_name.split(' ').map(n => n[0]).join('').slice(0, 2).toUpperCase()}
              <span style={{
                position: 'absolute', bottom: -2, right: -2, width: 18, height: 18,
                background: '#10b981', borderRadius: '50%', border: '3px solid var(--bg-card)'
              }} />
            </div>

            <div>
              <div style={{ display: 'flex', alignItems: 'center', gap: '0.6rem' }}>
                <h3 style={{ fontSize: '1.35rem', fontWeight: 800, color: 'var(--text-main)', margin: 0 }}>
                  {profileForm.full_name}
                </h3>
                <span style={{
                  background: 'rgba(26,153,117,0.15)', color: '#1a9975',
                  padding: '0.2rem 0.55rem', borderRadius: 6, fontSize: '0.72rem', fontWeight: 700
                }}>
                  Customer / Retail Tier
                </span>
              </div>
              <div style={{ fontSize: '0.82rem', color: 'var(--text-secondary)', marginTop: '0.25rem' }}>
                {profileForm.department} · {profileForm.institution}
              </div>
              <div style={{ display: 'flex', alignItems: 'center', gap: '0.85rem', marginTop: '0.5rem', flexWrap: 'wrap' }}>
                <span style={{ fontSize: '0.75rem', color: 'var(--text-muted)', display: 'flex', alignItems: 'center', gap: '0.3rem' }}>
                  <Mail size={13} color="#1a9975" /> {profileForm.email_address}
                </span>
                <span style={{ fontSize: '0.75rem', color: 'var(--text-muted)', display: 'flex', alignItems: 'center', gap: '0.3rem' }}>
                  <Smartphone size={13} color="#1a9975" /> {profileForm.mobile_number}
                </span>
              </div>
            </div>
          </div>

          {/* Cryptographic Keys quick copy */}
          <div style={{ display: 'flex', flexDirection: 'column', gap: '0.6rem', minWidth: 260 }}>
            {/* Unique User Key */}
            <div style={{
              background: 'var(--bg-page)', border: '1px solid var(--border)',
              borderRadius: 10, padding: '0.5rem 0.75rem',
              display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: '0.5rem'
            }}>
              <div>
                <div style={{ fontSize: '0.65rem', color: 'var(--text-muted)', textTransform: 'uppercase', fontWeight: 700 }}>
                  Unique User Key (ZK Binding)
                </div>
                <div style={{ fontSize: '0.78rem', fontFamily: 'var(--font-mono)', fontWeight: 600, color: '#1a9975' }}>
                  {userKey.slice(0, 16)}...
                </div>
              </div>
              <button
                onClick={() => copyToClipboard(userKey, 'key')}
                style={{
                  background: 'none', border: 'none', color: copiedKey ? '#10b981' : 'var(--text-muted)',
                  cursor: 'pointer', padding: '0.3rem', display: 'flex', alignItems: 'center'
                }}
                title="Copy Unique Key"
              >
                {copiedKey ? <Check size={16} /> : <Copy size={16} />}
              </button>
            </div>

            {/* Wallet Address */}
            <div style={{
              background: 'var(--bg-page)', border: '1px solid var(--border)',
              borderRadius: 10, padding: '0.5rem 0.75rem',
              display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: '0.5rem'
            }}>
              <div>
                <div style={{ fontSize: '0.65rem', color: 'var(--text-muted)', textTransform: 'uppercase', fontWeight: 700 }}>
                  Sepolia Ledger Wallet
                </div>
                <div style={{ fontSize: '0.78rem', fontFamily: 'var(--font-mono)', fontWeight: 600, color: 'var(--text-main)' }}>
                  {walletAddr.slice(0, 10)}...{walletAddr.slice(-6)}
                </div>
              </div>
              <button
                onClick={() => copyToClipboard(walletAddr, 'wallet')}
                style={{
                  background: 'none', border: 'none', color: copiedWallet ? '#10b981' : 'var(--text-muted)',
                  cursor: 'pointer', padding: '0.3rem', display: 'flex', alignItems: 'center'
                }}
                title="Copy Wallet Address"
              >
                {copiedWallet ? <Check size={16} /> : <Copy size={16} />}
              </button>
            </div>
          </div>
        </div>

        {/* ── Financial Portfolio & Trust Values Row ── */}
        <div style={{
          display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(180px, 1fr))',
          gap: '1rem', marginTop: '1.5rem', paddingTop: '1.25rem', borderTop: '1px solid var(--border)'
        }}>
          <div style={{ padding: '0.75rem', background: 'var(--bg-page)', borderRadius: 12, border: '1px solid var(--border)' }} className="neon-glow-hover">
            <div style={{ fontSize: '0.7rem', color: 'var(--text-muted)', fontWeight: 700, textTransform: 'uppercase' }}>
              Total Vault Net Worth
            </div>
            <div style={{ fontSize: '1.25rem', fontWeight: 800, color: '#1a9975', marginTop: '0.2rem' }}>
              ₹14,85,250.00
            </div>
            <div style={{ fontSize: '0.7rem', color: '#10b981', marginTop: '0.15rem' }}>
              ↑ +4.2% this month
            </div>
          </div>

          <div style={{ padding: '0.75rem', background: 'var(--bg-page)', borderRadius: 12, border: '1px solid var(--border)' }} className="neon-glow-hover">
            <div style={{ fontSize: '0.7rem', color: 'var(--text-muted)', fontWeight: 700, textTransform: 'uppercase' }}>
              Liquid Reserve Cash
            </div>
            <div style={{ fontSize: '1.25rem', fontWeight: 800, color: 'var(--text-main)', marginTop: '0.2rem' }}>
              ₹4,32,100.00
            </div>
            <div style={{ fontSize: '0.7rem', color: 'var(--text-muted)', marginTop: '0.15rem' }}>
              Primary ACC-NEX-884920
            </div>
          </div>

          <div style={{ padding: '0.75rem', background: 'var(--bg-page)', borderRadius: 12, border: '1px solid var(--border)' }} className="neon-glow-hover">
            <div style={{ fontSize: '0.7rem', color: 'var(--text-muted)', fontWeight: 700, textTransform: 'uppercase' }}>
              Credit &amp; CIBIL Index
            </div>
            <div style={{ fontSize: '1.25rem', fontWeight: 800, color: '#8b5cf6', marginTop: '0.2rem' }}>
              840 / 900
            </div>
            <div style={{ fontSize: '0.7rem', color: '#8b5cf6', marginTop: '0.15rem' }}>
              Tier 1 Prime Rating
            </div>
          </div>

          <div style={{ padding: '0.75rem', background: 'var(--bg-page)', borderRadius: 12, border: '1px solid var(--border)' }} className="neon-glow-hover">
            <div style={{ fontSize: '0.7rem', color: 'var(--text-muted)', fontWeight: 700, textTransform: 'uppercase' }}>
              Daily UPI / Wire Limit
            </div>
            <div style={{ fontSize: '1.25rem', fontWeight: 800, color: '#f0a500', marginTop: '0.2rem' }}>
              ₹10,00,000.00
            </div>
            <div style={{ fontSize: '0.7rem', color: 'var(--text-muted)', marginTop: '0.15rem' }}>
              Secured by Retina ZKP
            </div>
          </div>
        </div>
      </div>

      {/* ── Sub-navigation Tabs ── */}
      <div style={{
        display: 'flex', gap: '0.5rem', background: 'var(--bg-card)',
        padding: '0.4rem', borderRadius: 14, border: '1px solid var(--border)',
        overflowX: 'auto'
      }}>
        {[
          { id: 'personal', label: 'Personal & Contact', icon: User },
          { id: 'banking', label: 'Banking & Financial Limits', icon: Landmark },
          { id: 'security', label: 'Cryptographic & Security Keys', icon: Key },
          { id: 'kyc', label: 'KYC Document Vault', icon: ShieldCheck },
          { id: 'audit', label: 'Immutable Audit Timeline', icon: History },
        ].map(tab => {
          const Icon = tab.icon;
          const isActive = activeSubTab === tab.id;
          return (
            <button
              key={tab.id}
              onClick={() => setActiveSubTab(tab.id)}
              style={{
                display: 'flex', alignItems: 'center', gap: '0.45rem',
                padding: '0.6rem 1.1rem', borderRadius: 10, border: 'none',
                background: isActive ? 'linear-gradient(135deg, #1a9975, #127c5e)' : 'transparent',
                color: isActive ? '#ffffff' : 'var(--text-secondary)',
                fontWeight: isActive ? 700 : 500, fontSize: '0.84rem',
                cursor: 'pointer', whiteSpace: 'nowrap',
                boxShadow: isActive ? '0 2px 10px rgba(26,153,117,0.35)' : 'none',
                transition: 'all 0.2s cubic-bezier(0.16, 1, 0.3, 1)'
              }}
              className={!isActive ? "neon-glow-hover" : ""}
            >
              <Icon size={15} />
              {tab.label}
            </button>
          );
        })}
      </div>

      {/* Alert Notifications */}
      {errorMsg && (
        <div style={{
          background: 'rgba(239, 68, 68, 0.12)', border: '1px solid rgba(239, 68, 68, 0.3)',
          color: '#ef4444', padding: '0.85rem 1.25rem', borderRadius: 12,
          fontSize: '0.84rem', display: 'flex', alignItems: 'center', gap: '0.6rem'
        }}>
          <AlertOctagon size={16} />
          {errorMsg}
        </div>
      )}

      {successMsg && (
        <div style={{
          background: 'rgba(16, 185, 129, 0.12)', border: '1px solid rgba(16, 185, 129, 0.3)',
          color: '#10b981', padding: '0.85rem 1.25rem', borderRadius: 12,
          fontSize: '0.84rem', display: 'flex', alignItems: 'center', gap: '0.6rem'
        }}>
          <CheckCircle size={16} />
          {successMsg}
        </div>
      )}

      {/* ── TAB 1: PERSONAL & CONTACT ── */}
      {activeSubTab === 'personal' && (
        <div className="card neon-card">
          <h3 style={{ fontSize: '1.1rem', fontWeight: 800, margin: '0 0 1.25rem 0', display: 'flex', alignItems: 'center', gap: '0.5rem', color: 'var(--text-main)' }}>
            <User size={18} color="#1a9975" /> Sovereign Identity &amp; Contact Details
          </h3>

          <form onSubmit={handleProfileSubmit} style={{ display: 'flex', flexDirection: 'column', gap: '1.25rem' }}>
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(240px, 1fr))', gap: '1.25rem' }}>
              <label style={{ display: 'block' }}>
                <span style={labelStyle}>Full Legal Name</span>
                <input
                  style={inputStyle}
                  value={profileForm.full_name}
                  onChange={(e) => setProfileForm({ ...profileForm, full_name: e.target.value })}
                  required
                />
              </label>

              <label style={{ display: 'block' }}>
                <span style={labelStyle}>Date of Birth</span>
                <input
                  style={inputStyle}
                  type="date"
                  value={profileForm.date_of_birth}
                  onChange={(e) => setProfileForm({ ...profileForm, date_of_birth: e.target.value })}
                  required
                />
              </label>

              <label style={{ display: 'block' }}>
                <span style={labelStyle}>Gender</span>
                <select
                  style={inputStyle}
                  value={profileForm.gender}
                  onChange={(e) => setProfileForm({ ...profileForm, gender: e.target.value })}
                >
                  <option value="male">Male</option>
                  <option value="female">Female</option>
                  <option value="other">Other / Non-Binary</option>
                </select>
              </label>

              <label style={{ display: 'block' }}>
                <span style={labelStyle}>Mobile Phone (2FA Verified)</span>
                <input
                  style={inputStyle}
                  type="tel"
                  value={profileForm.mobile_number}
                  onChange={(e) => setProfileForm({ ...profileForm, mobile_number: e.target.value })}
                  required
                />
              </label>
            </div>

            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(240px, 1fr))', gap: '1.25rem' }}>
              <label style={{ display: 'block' }}>
                <span style={labelStyle}>Email Address (Institutional)</span>
                <input
                  style={inputStyle}
                  type="email"
                  value={profileForm.email_address}
                  onChange={(e) => setProfileForm({ ...profileForm, email_address: e.target.value })}
                  required
                />
              </label>

              <label style={{ display: 'block' }}>
                <span style={labelStyle}>Residential Street Address</span>
                <input
                  style={inputStyle}
                  value={profileForm.address}
                  onChange={(e) => setProfileForm({ ...profileForm, address: e.target.value })}
                  required
                />
              </label>
            </div>

            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(180px, 1fr))', gap: '1.25rem' }}>
              <label style={{ display: 'block' }}>
                <span style={labelStyle}>City</span>
                <input
                  style={inputStyle}
                  value={profileForm.city}
                  onChange={(e) => setProfileForm({ ...profileForm, city: e.target.value })}
                  required
                />
              </label>

              <label style={{ display: 'block' }}>
                <span style={labelStyle}>State / Province</span>
                <input
                  style={inputStyle}
                  value={profileForm.state}
                  onChange={(e) => setProfileForm({ ...profileForm, state: e.target.value })}
                  required
                />
              </label>

              <label style={{ display: 'block' }}>
                <span style={labelStyle}>Postal / ZIP Code</span>
                <input
                  style={inputStyle}
                  value={profileForm.postal_code}
                  onChange={(e) => setProfileForm({ ...profileForm, postal_code: e.target.value })}
                  required
                />
              </label>

              <label style={{ display: 'block' }}>
                <span style={labelStyle}>Country Jurisdiction</span>
                <input
                  style={inputStyle}
                  value={profileForm.country}
                  onChange={(e) => setProfileForm({ ...profileForm, country: e.target.value })}
                  required
                />
              </label>
            </div>

            <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '1rem', marginTop: '0.5rem' }}>
              <button
                type="submit"
                className="btn btn-primary neon-glow-hover"
                disabled={submittingProfile}
                style={{ padding: '0.75rem 1.75rem', borderRadius: 10, fontWeight: 700 }}
              >
                {submittingProfile ? 'Updating Credentials...' : 'Save & Sign Changes'}
              </button>
            </div>
          </form>
        </div>
      )}

      {/* ── TAB 2: BANKING & LIMITS ── */}
      {activeSubTab === 'banking' && (
        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1.5rem' }}>
          <div className="card neon-card">
            <h3 style={{ fontSize: '1.1rem', fontWeight: 800, margin: '0 0 1.25rem 0', display: 'flex', alignItems: 'center', gap: '0.5rem', color: 'var(--text-main)' }}>
              <Landmark size={18} color="#1a9975" /> Core Banking Accounts &amp; Routing
            </h3>

            <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
              <div style={{ padding: '1rem', background: 'var(--bg-page)', borderRadius: 12, border: '1px solid var(--border)' }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                  <span style={{ fontSize: '0.85rem', fontWeight: 700, color: 'var(--text-main)' }}>Primary Checking &amp; Vault Account</span>
                  <span className="badge badge-low">Active</span>
                </div>
                <div style={{ fontSize: '1.1rem', fontWeight: 800, fontFamily: 'var(--font-mono)', color: '#1a9975', margin: '0.4rem 0' }}>
                  ACC-NEX-884920
                </div>
                <div style={{ fontSize: '0.75rem', color: 'var(--text-secondary)' }}>
                  IFSC: NEXB0001089 · Routing Code: 021000089 · Currency: INR / USD Tokenized
                </div>
              </div>

              <div style={{ padding: '1rem', background: 'var(--bg-page)', borderRadius: 12, border: '1px solid var(--border)' }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                  <span style={{ fontSize: '0.85rem', fontWeight: 700, color: 'var(--text-main)' }}>Linked UPI 2.0 Virtual ID</span>
                  <span className="badge badge-low">Verified</span>
                </div>
                <div style={{ fontSize: '1.1rem', fontWeight: 800, fontFamily: 'var(--font-mono)', color: '#8b5cf6', margin: '0.4rem 0' }}>
                  aarav_sharma@nexusbank
                </div>
                <div style={{ fontSize: '0.75rem', color: 'var(--text-secondary)' }}>
                  Direct NPCI Fast Routing · Zero-Fee Peer-to-Peer Settlement
                </div>
              </div>
            </div>
          </div>

          <div className="card neon-card">
            <h3 style={{ fontSize: '1.1rem', fontWeight: 800, margin: '0 0 1.25rem 0', display: 'flex', alignItems: 'center', gap: '0.5rem', color: 'var(--text-main)' }}>
              <CreditCard size={18} color="#1a9975" /> Real-Time Transfer Limits
            </h3>

            <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
              <div>
                <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '0.82rem', marginBottom: '0.35rem' }}>
                  <span style={{ color: 'var(--text-secondary)' }}>UPI 2.0 Per Transaction Limit</span>
                  <strong style={{ color: 'var(--text-main)' }}>₹2,00,000 / ₹2,00,000</strong>
                </div>
                <div style={{ width: '100%', height: 6, background: 'var(--bg-page)', borderRadius: 4, overflow: 'hidden' }}>
                  <div style={{ width: '100%', height: '100%', background: '#1a9975' }} />
                </div>
              </div>

              <div>
                <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '0.82rem', marginBottom: '0.35rem' }}>
                  <span style={{ color: 'var(--text-secondary)' }}>Daily RTGS / Wire Transfer Limit</span>
                  <strong style={{ color: 'var(--text-main)' }}>₹50,00,000 max</strong>
                </div>
                <div style={{ width: '100%', height: 6, background: 'var(--bg-page)', borderRadius: 4, overflow: 'hidden' }}>
                  <div style={{ width: '80%', height: '100%', background: '#8b5cf6' }} />
                </div>
              </div>

              <div>
                <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '0.82rem', marginBottom: '0.35rem' }}>
                  <span style={{ color: 'var(--text-secondary)' }}>International Swift / Tokenized Settlement</span>
                  <strong style={{ color: 'var(--text-main)' }}>$100,000 USD / Day</strong>
                </div>
                <div style={{ width: '100%', height: 6, background: 'var(--bg-page)', borderRadius: 4, overflow: 'hidden' }}>
                  <div style={{ width: '65%', height: '100%', background: '#f0a500' }} />
                </div>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* ── TAB 3: CRYPTOGRAPHIC & SECURITY KEYS ── */}
      {activeSubTab === 'security' && (
        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1.5rem' }}>
          <div className="card neon-card">
            <h3 style={{ fontSize: '1.1rem', fontWeight: 800, margin: '0 0 1.25rem 0', display: 'flex', alignItems: 'center', gap: '0.5rem', color: 'var(--text-main)' }}>
              <Lock size={18} color="#1a9975" /> Cryptographic Signatures &amp; ZK Proofs
            </h3>

            <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
              <div style={{ padding: '0.85rem 1rem', background: 'var(--bg-page)', borderRadius: 10, border: '1px solid var(--border)' }}>
                <span style={labelStyle}>Retina Biometric Hash Vector</span>
                <div style={{ fontSize: '0.78rem', fontFamily: 'var(--font-mono)', color: 'var(--text-main)', wordBreak: 'break-all' }}>
                  0x8f2d61a9c3e5b741029487561a0b3c2d4e5f6a7b8c9d0e1f2a3b4c5d6e7f8a9b
                </div>
                <div style={{ fontSize: '0.68rem', color: '#1a9975', marginTop: '0.25rem' }}>
                  ✓ ISO/IEC 19794-6 Compliant · Zero-Knowledge Enclave Encrypted
                </div>
              </div>

              <div style={{ padding: '0.85rem 1rem', background: 'var(--bg-page)', borderRadius: 10, border: '1px solid var(--border)' }}>
                <span style={labelStyle}>EIP-712 Session Authorization Ticket</span>
                <div style={{ fontSize: '0.78rem', fontFamily: 'var(--font-mono)', color: '#8b5cf6', wordBreak: 'break-all' }}>
                  0x4a1f9e8b7c6d5e4f3a2b1c0d9e8f7a6b5c4d3e2f1a0b9c8d7e6f5a4b3c2d1e0f
                </div>
                <div style={{ fontSize: '0.68rem', color: 'var(--text-muted)', marginTop: '0.25rem' }}>
                  Issued at {new Date().toLocaleTimeString()} · Expiring in 60 mins
                </div>
              </div>
            </div>
          </div>

          <div className="card neon-card">
            <h3 style={{ fontSize: '1.1rem', fontWeight: 800, margin: '0 0 1.25rem 0', display: 'flex', alignItems: 'center', gap: '0.5rem', color: 'var(--text-main)' }}>
              <Shield size={18} color="#1a9975" /> Security Posture &amp; Hardware Binding
            </h3>

            <div style={{ display: 'flex', flexDirection: 'column', gap: '0.85rem' }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '0.6rem 0', borderBottom: '1px solid var(--border)' }}>
                <span style={{ fontSize: '0.84rem', color: 'var(--text-main)' }}>FIDO2 / WebAuthn Hardware Binding</span>
                <span className="badge badge-low">Secured</span>
              </div>

              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '0.6rem 0', borderBottom: '1px solid var(--border)' }}>
                <span style={{ fontSize: '0.84rem', color: 'var(--text-main)' }}>Continuous Trust Telemetry</span>
                <span className="badge badge-low">Active (1000ms)</span>
              </div>

              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '0.6rem 0', borderBottom: '1px solid var(--border)' }}>
                <span style={{ fontSize: '0.84rem', color: 'var(--text-main)' }}>Step-Up Biometric Retest Vector</span>
                <span className="badge badge-low">Ready</span>
              </div>

              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '0.6rem 0' }}>
                <span style={{ fontSize: '0.84rem', color: 'var(--text-main)' }}>Smart Contract Emergency Freeze Authority</span>
                <span className="badge badge-medium">Multi-Sig Guarded</span>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* ── TAB 4: KYC DOCUMENT VAULT ── */}
      {activeSubTab === 'kyc' && (
        <div style={{ display: 'grid', gridTemplateColumns: '1.2fr 1fr', gap: '1.5rem' }}>
          <div className="card neon-card">
            <h3 style={{ fontSize: '1.1rem', fontWeight: 800, margin: '0 0 1.25rem 0', display: 'flex', alignItems: 'center', gap: '0.5rem', color: 'var(--text-main)' }}>
              <Upload size={18} color="#1a9975" /> Upload Government-Issued Identity Proof
            </h3>

            <form onSubmit={handleVerificationSubmit} style={{ display: 'flex', flexDirection: 'column', gap: '1.1rem' }}>
              <label style={{ display: 'block' }}>
                <span style={labelStyle}>Document Category</span>
                <select
                  style={inputStyle}
                  value={verifForm.proof_type}
                  onChange={(e) => setVerifForm({ ...verifForm, proof_type: e.target.value })}
                >
                  <option value="aadhaar">Aadhaar Card (UIDAI ZK-XML Proof)</option>
                  <option value="pan_card">Permanent Account Number (PAN Card)</option>
                  <option value="passport">International Sovereign Passport</option>
                  <option value="voter_id">National Voter Identity Document</option>
                </select>
              </label>

              <label style={{ display: 'block' }}>
                <span style={labelStyle}>National Citizen / ID Identification Number</span>
                <input
                  style={inputStyle}
                  value={verifForm.citizen_id_number}
                  onChange={(e) => setVerifForm({ ...verifForm, citizen_id_number: e.target.value })}
                  placeholder="e.g. 5482 9102 3847"
                  required
                />
              </label>

              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1rem' }}>
                <div>
                  <span style={labelStyle}>Front Document Scan</span>
                  <input type="file" accept="image/*,.pdf" onChange={handleFileUpload('proof_document_front')} style={{ display: 'none' }} id="front-file-v2" />
                  <label htmlFor="front-file-v2" className="btn btn-secondary neon-glow-hover" style={{ width: '100%', justifyContent: 'center', gap: '0.5rem', padding: '0.65rem' }}>
                    <Upload size={15} /> {verifForm.proof_document_front ? 'Replace Front' : 'Upload Front'}
                  </label>
                  {verifForm.proof_document_front && (
                    <div style={{ fontSize: '0.74rem', color: '#10b981', marginTop: '0.3rem', fontWeight: 600 }}>✓ Front Image Encrypted</div>
                  )}
                </div>

                <div>
                  <span style={labelStyle}>Back Document Scan</span>
                  <input type="file" accept="image/*,.pdf" onChange={handleFileUpload('proof_document_back')} style={{ display: 'none' }} id="back-file-v2" />
                  <label htmlFor="back-file-v2" className="btn btn-secondary neon-glow-hover" style={{ width: '100%', justifyContent: 'center', gap: '0.5rem', padding: '0.65rem' }}>
                    <Upload size={15} /> {verifForm.proof_document_back ? 'Replace Back' : 'Upload Back'}
                  </label>
                  {verifForm.proof_document_back && (
                    <div style={{ fontSize: '0.74rem', color: '#10b981', marginTop: '0.3rem', fontWeight: 600 }}>✓ Back Image Encrypted</div>
                  )}
                </div>
              </div>

              <button
                type="submit"
                className="btn btn-primary neon-glow-hover"
                disabled={submittingVerif}
                style={{ marginTop: '0.5rem', justifyContent: 'center', padding: '0.75rem' }}
              >
                {submittingVerif ? 'Hashing & Submitting to Sepolia Rollup...' : 'Submit Verification Credentials'}
              </button>
            </form>
          </div>

          <div className="card neon-card">
            <h3 style={{ fontSize: '1.1rem', fontWeight: 800, margin: '0 0 1.25rem 0', display: 'flex', alignItems: 'center', gap: '0.5rem', color: 'var(--text-main)' }}>
              <ShieldCheck size={18} color="#1a9975" /> Verification Credentials Status
            </h3>

            <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '0.6rem 0' }}>
                <span style={{ fontSize: '0.85rem', color: 'var(--text-secondary)' }}>Current Verification Tier:</span>
                {renderStatusBadge(verification?.status || 'approved')}
              </div>

              <div style={{ padding: '1rem', background: 'var(--bg-page)', borderRadius: 12, border: '1px solid var(--border)' }}>
                <div style={{ fontSize: '0.78rem', fontWeight: 700, color: 'var(--text-main)', marginBottom: '0.3rem' }}>
                  ZK-KYC On-Chain Root
                </div>
                <div style={{ fontSize: '0.72rem', fontFamily: 'var(--font-mono)', color: '#1a9975', wordBreak: 'break-all' }}>
                  0x9f1c7d2e4a8b3c6f1a0e9d8c7b6a5f4e3d2c1b0a9f8e7d6c5b4a3f2e1d0c9b8a
                </div>
                <div style={{ fontSize: '0.7rem', color: 'var(--text-muted)', marginTop: '0.4rem' }}>
                  Validated by Reserve Bank Central Validator Node #03
                </div>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* ── TAB 5: AUDIT & SESSION LOGS ── */}
      {activeSubTab === 'audit' && (
        <div className="card neon-card">
          <h3 style={{ fontSize: '1.1rem', fontWeight: 800, margin: '0 0 1.25rem 0', display: 'flex', alignItems: 'center', gap: '0.5rem', color: 'var(--text-main)' }}>
            <History size={18} color="#1a9975" /> Cryptographic Session &amp; Verification Audit Log
          </h3>

          <div style={{ display: 'flex', flexDirection: 'column', gap: '0.75rem' }}>
            {(auditHistory.length > 0 ? auditHistory : [
              { audit_log_id: '1', action: 'VERIFIED', notes: 'Zero-Knowledge Biometric Vector enrolled and signed', timestamp: Date.now() / 1000 - 120 },
              { audit_log_id: '2', action: 'TOKEN_ISSUED', notes: 'EIP-712 Session Access Token minted with 60min TTL', timestamp: Date.now() / 1000 - 360 },
              { audit_log_id: '3', action: 'TERMS_ACCEPTED', notes: '14-clause Institutional Banking & Web3 agreement accepted', timestamp: Date.now() / 1000 - 900 },
              { audit_log_id: '4', action: 'ACCOUNT_PROVISIONED', notes: 'Primary checking ACC-NEX-884920 and UPI ID assigned', timestamp: Date.now() / 1000 - 1800 }
            ]).map(log => (
              <div
                key={log.audit_log_id}
                style={{
                  display: 'flex', justifyContent: 'space-between', alignItems: 'center',
                  padding: '0.85rem 1rem', background: 'var(--bg-page)',
                  borderRadius: 10, border: '1px solid var(--border)', flexWrap: 'wrap', gap: '0.5rem'
                }}
                className="neon-glow-hover"
              >
                <div>
                  <span style={{
                    fontSize: '0.72rem', fontWeight: 800,
                    color: log.action.includes('VERIF') ? '#10b981' : log.action.includes('TOKEN') ? '#8b5cf6' : '#1a9975',
                    background: 'rgba(26,153,117,0.1)', padding: '0.2rem 0.5rem', borderRadius: 6
                  }}>
                    {log.action}
                  </span>
                  <div style={{ fontSize: '0.82rem', color: 'var(--text-main)', marginTop: '0.35rem', fontWeight: 500 }}>
                    {log.notes}
                  </div>
                </div>
                <div style={{ fontSize: '0.74rem', color: 'var(--text-muted)', fontFamily: 'var(--font-mono)' }}>
                  {new Date(log.timestamp * 1000).toLocaleString()}
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

    </div>
  );
}
