import React, { useState, useEffect } from 'react';
import { ShieldCheck, User, MapPin, Upload, FileText, CheckCircle, AlertOctagon, History, Eye, ArrowRight } from 'lucide-react';
import { api } from '../../api';

const inputStyle = {
  width: '100%',
  padding: '0.65rem 0.85rem',
  borderRadius: 8,
  border: '1.5px solid var(--border)',
  background: 'var(--bg-page)',
  color: 'var(--text-main)',
  fontSize: '0.875rem',
  outline: 'none',
  fontFamily: 'Inter, sans-serif',
};

const labelStyle = {
  display: 'block',
  fontSize: '0.72rem',
  color: 'var(--text-secondary)',
  marginBottom: '0.35rem',
  fontWeight: 600,
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

  // Form states
  const [profileForm, setProfileForm] = useState({
    full_name: '',
    date_of_birth: '',
    gender: 'male',
    mobile_number: '',
    email_address: '',
    address: '',
    city: '',
    state: '',
    postal_code: '',
    country: 'IN'
  });

  const [verifForm, setVerifForm] = useState({
    citizen_id_number: '',
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
        setProfileForm(data.profile);
      }
      if (data.verification) {
        setVerification(data.verification);
        setVerifForm(prev => ({
          ...prev,
          citizen_id_number: data.verification.citizen_id_number,
          proof_type: data.verification.proof_type,
          proof_document_front: data.verification.proof_document_front,
          proof_document_back: data.verification.proof_document_back,
          selfie_or_live_photo: data.verification.selfie_or_live_photo || ''
        }));
        // Fetch audit logs
        const auditData = await api('/api/profile/audit');
        setAuditHistory(auditData.audit_history || []);
      }
    } catch (err) {
      setErrorMsg('Failed to load profile data: ' + err.message);
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
      setProfile(data.profile);
      setSuccessMsg('Profile details saved successfully.');
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
        [field]: reader.result // Base64 representation
      }));
    };
    reader.readAsDataURL(file);
  };

  const handleVerificationSubmit = async (e) => {
    e.preventDefault();
    if (!profile) {
      setErrorMsg('Please save your profile information first.');
      return;
    }
    if (!verifForm.proof_document_front || !verifForm.proof_document_back) {
      setErrorMsg('Please upload both front and back document proofs.');
      return;
    }

    setSubmittingVerif(true);
    setErrorMsg('');
    setSuccessMsg('');
    try {
      const data = await api('/api/profile/verify', {
        method: 'POST',
        body: JSON.stringify(verifForm)
      });
      setSuccessMsg('Verification request submitted successfully!');
      fetchProfileData();
    } catch (err) {
      setErrorMsg(err.message);
    } finally {
      setSubmittingVerif(false);
    }
  };

  if (loading) {
    return (
      <div style={{ padding: '3rem', textAlign: 'center', color: '#1a9975' }}>
        <h3>Loading Citizen Profile & Verification System...</h3>
      </div>
    );
  }

  const renderStatusBadge = (status) => {
    switch (status) {
      case 'approved':
        return (
          <span className="badge badge-low" style={{ display: 'inline-flex', alignItems: 'center', gap: '0.35rem' }}>
            <CheckCircle size={12} /> Approved / Verified
          </span>
        );
      case 'rejected':
        return (
          <span className="badge badge-high" style={{ display: 'inline-flex', alignItems: 'center', gap: '0.35rem' }}>
            <AlertOctagon size={12} /> Rejected
          </span>
        );
      case 'pending':
        return (
          <span className="badge badge-medium" style={{ display: 'inline-flex', alignItems: 'center', gap: '0.35rem' }}>
            <History size={12} /> Pending Review
          </span>
        );
      default:
        return (
          <span className="badge badge-secondary" style={{ display: 'inline-flex', alignItems: 'center', gap: '0.35rem' }}>
            Draft
          </span>
        );
    }
  };

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '1.5rem' }}>
      <div>
        <h2 style={{ fontSize: '1.4rem', fontWeight: 800, color: 'var(--text-main)', margin: 0 }}>
          Citizen Verification & Profile Vault
        </h2>
        <div style={{ fontSize: '0.8rem', color: 'var(--text-secondary)' }}>
          Securely submit official documents for compliance and verify your identity on Sepolia Blockchain.
        </div>
      </div>

      {errorMsg && (
        <div style={{ background: '#fef2f2', border: '1px solid #fecaca', color: '#b91c1c', padding: '0.85rem', borderRadius: 8, fontSize: '0.82rem' }}>
          {errorMsg}
        </div>
      )}

      {successMsg && (
        <div style={{ background: '#ecfdf5', border: '1px solid #a7f3d0', color: '#065f46', padding: '0.85rem', borderRadius: 8, fontSize: '0.82rem' }}>
          {successMsg}
        </div>
      )}

      <div style={{ display: 'grid', gridTemplateColumns: '1.2fr 1fr', gap: '1.5rem' }}>
        {/* Left Hand side: Profile fields */}
        <div className="card" style={{ display: 'flex', flexDirection: 'column', gap: '1.25rem' }}>
          <h3 style={{ fontSize: '1.05rem', fontWeight: 700, margin: 0, display: 'flex', alignItems: 'center', gap: '0.5rem', color: 'var(--text-main)' }}>
            <User size={18} color="#1a9975" /> Profile Information
          </h3>

          <form onSubmit={handleProfileSubmit} style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1rem' }}>
              <label style={{ display: 'block' }}>
                <span style={labelStyle}>Full Legal Name</span>
                <input style={inputStyle} value={profileForm.full_name} onChange={(e) => setProfileForm({ ...profileForm, full_name: e.target.value })} required />
              </label>

              <label style={{ display: 'block' }}>
                <span style={labelStyle}>Date of Birth</span>
                <input style={inputStyle} type="date" value={profileForm.date_of_birth} onChange={(e) => setProfileForm({ ...profileForm, date_of_birth: e.target.value })} required />
              </label>
            </div>

            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1rem' }}>
              <label style={{ display: 'block' }}>
                <span style={labelStyle}>Gender</span>
                <select style={inputStyle} value={profileForm.gender} onChange={(e) => setProfileForm({ ...profileForm, gender: e.target.value })}>
                  <option value="male">Male</option>
                  <option value="female">Female</option>
                  <option value="other">Other</option>
                </select>
              </label>

              <label style={{ display: 'block' }}>
                <span style={labelStyle}>Mobile Number</span>
                <input style={inputStyle} type="tel" placeholder="+91" value={profileForm.mobile_number} onChange={(e) => setProfileForm({ ...profileForm, mobile_number: e.target.value })} required />
              </label>
            </div>

            <label style={{ display: 'block' }}>
              <span style={labelStyle}>Email Address</span>
              <input style={inputStyle} type="email" value={profileForm.email_address} onChange={(e) => setProfileForm({ ...profileForm, email_address: e.target.value })} required />
            </label>

            <h4 style={{ fontSize: '0.85rem', fontWeight: 700, margin: '0.5rem 0 0 0', display: 'flex', alignItems: 'center', gap: '0.4rem', color: 'var(--text-main)' }}>
              <MapPin size={15} color="#1a9975" /> Address Details
            </h4>

            <label style={{ display: 'block' }}>
              <span style={labelStyle}>Street Address</span>
              <input style={inputStyle} value={profileForm.address} onChange={(e) => setProfileForm({ ...profileForm, address: e.target.value })} required />
            </label>

            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1rem' }}>
              <label style={{ display: 'block' }}>
                <span style={labelStyle}>City</span>
                <input style={inputStyle} value={profileForm.city} onChange={(e) => setProfileForm({ ...profileForm, city: e.target.value })} required />
              </label>
              <label style={{ display: 'block' }}>
                <span style={labelStyle}>State</span>
                <input style={inputStyle} value={profileForm.state} onChange={(e) => setProfileForm({ ...profileForm, state: e.target.value })} required />
              </label>
            </div>

            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1rem' }}>
              <label style={{ display: 'block' }}>
                <span style={labelStyle}>Postal Code</span>
                <input style={inputStyle} value={profileForm.postal_code} onChange={(e) => setProfileForm({ ...profileForm, postal_code: e.target.value })} required />
              </label>
              <label style={{ display: 'block' }}>
                <span style={labelStyle}>Country</span>
                <input style={inputStyle} value={profileForm.country} onChange={(e) => setProfileForm({ ...profileForm, country: e.target.value })} required />
              </label>
            </div>

            <button type="submit" className="btn btn-primary" disabled={submittingProfile} style={{ alignSelf: 'flex-start', marginTop: '0.5rem' }}>
              {submittingProfile ? 'Saving Details...' : 'Save Profile Details'}
            </button>
          </form>
        </div>

        {/* Right Hand side: Document Upload & Verification Status */}
        <div style={{ display: 'flex', flexDirection: 'column', gap: '1.5rem' }}>
          {/* Status Panel */}
          <div className="card" style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
            <h3 style={{ fontSize: '1.05rem', fontWeight: 700, margin: 0, display: 'flex', alignItems: 'center', gap: '0.5rem', color: 'var(--text-main)' }}>
              <ShieldCheck size={18} color="#1a9975" /> Verification Status
            </h3>

            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', padding: '0.5rem 0' }}>
              <span style={{ fontSize: '0.85rem', color: 'var(--text-secondary)' }}>Status:</span>
              {renderStatusBadge(verification?.status || 'draft')}
            </div>

            {verification?.status === 'rejected' && (
              <div style={{ background: '#fef2f2', border: '1px solid #fecaca', padding: '0.75rem', borderRadius: 8, fontSize: '0.8rem', color: '#b91c1c' }}>
                <strong>Rejection Reason: </strong> {verification?.rejection_reason || 'No reason provided.'}
              </div>
            )}

            {verification?.status === 'approved' && (
              <div style={{ background: '#f0fdf4', border: '1px solid #bbf7d0', padding: '0.75rem', borderRadius: 8, fontSize: '0.8rem', color: '#166534' }}>
                <strong>Verification Note: </strong> Your profile is successfully verified. Identity proof linked to Sepolia Testnet.
              </div>
            )}
          </div>

          {/* Upload Documents Form */}
          {(!verification || verification.status === 'rejected' || verification.status === 'draft') && (
            <div className="card" style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
              <h3 style={{ fontSize: '1.05rem', fontWeight: 700, margin: 0, display: 'flex', alignItems: 'center', gap: '0.5rem', color: 'var(--text-main)' }}>
                <Upload size={18} color="#1a9975" /> Submit Identity Proof
              </h3>

              <form onSubmit={handleVerificationSubmit} style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
                <label style={{ display: 'block' }}>
                  <span style={labelStyle}>Document Type</span>
                  <select style={inputStyle} value={verifForm.proof_type} onChange={(e) => setVerifForm({ ...verifForm, proof_type: e.target.value })}>
                    <option value="aadhaar">Aadhaar Card</option>
                    <option value="pan_card">PAN Card</option>
                    <option value="passport">Passport</option>
                  </select>
                </label>

                <label style={{ display: 'block' }}>
                  <span style={labelStyle}>Citizen / National ID Number</span>
                  <input style={inputStyle} value={verifForm.citizen_id_number} onChange={(e) => setVerifForm({ ...verifForm, citizen_id_number: e.target.value })} placeholder="Enter ID digits" required />
                </label>

                {/* Upload Buttons */}
                <div style={{ display: 'flex', flexDirection: 'column', gap: '0.75rem' }}>
                  <div>
                    <span style={labelStyle}>Document Front Scan</span>
                    <input type="file" accept="image/*,.pdf" onChange={handleFileUpload('proof_document_front')} style={{ display: 'none' }} id="front-file" />
                    <label htmlFor="front-file" className="btn btn-secondary" style={{ width: '100%', justifyContent: 'center', gap: '0.5rem', padding: '0.5rem' }}>
                      <Upload size={14} /> {verifForm.proof_document_front ? 'Change Front Scan' : 'Upload Front Scan'}
                    </label>
                    {verifForm.proof_document_front && (
                      <div style={{ fontSize: '0.72rem', color: '#1a9975', marginTop: '0.2rem' }}>✓ Scan loaded.</div>
                    )}
                  </div>

                  <div>
                    <span style={labelStyle}>Document Back Scan</span>
                    <input type="file" accept="image/*,.pdf" onChange={handleFileUpload('proof_document_back')} style={{ display: 'none' }} id="back-file" />
                    <label htmlFor="back-file" className="btn btn-secondary" style={{ width: '100%', justifyContent: 'center', gap: '0.5rem', padding: '0.5rem' }}>
                      <Upload size={14} /> {verifForm.proof_document_back ? 'Change Back Scan' : 'Upload Back Scan'}
                    </label>
                    {verifForm.proof_document_back && (
                      <div style={{ fontSize: '0.72rem', color: '#1a9975', marginTop: '0.2rem' }}>✓ Scan loaded.</div>
                    )}
                  </div>
                </div>

                <button type="submit" className="btn btn-primary" disabled={submittingVerif || !profile} style={{ marginTop: '0.5rem', justifyContent: 'center' }}>
                  {submittingVerif ? 'Submitting Request...' : 'Submit Verification Request'}
                </button>
              </form>
            </div>
          )}

          {/* Audit trail / logs */}
          {auditHistory.length > 0 && (
            <div className="card" style={{ display: 'flex', flexDirection: 'column', gap: '0.75rem' }}>
              <h3 style={{ fontSize: '1rem', fontWeight: 700, margin: 0, display: 'flex', alignItems: 'center', gap: '0.4rem', color: 'var(--text-main)' }}>
                <History size={16} color="#1a9975" /> Verification History
              </h3>
              <div style={{ display: 'flex', flexDirection: 'column', gap: '0.5rem', maxHeight: '180px', overflowY: 'auto' }}>
                {auditHistory.map(log => (
                  <div key={log.audit_log_id} style={{ fontSize: '0.75rem', padding: '0.55rem', borderBottom: '1px solid var(--border)' }}>
                    <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                      <strong style={{ textTransform: 'uppercase', color: log.action === 'APPROVED' ? '#10b981' : log.action === 'REJECTED' ? '#ef4444' : '#6b7280' }}>
                        {log.action}
                      </strong>
                      <span style={{ color: 'var(--text-muted)' }}>{new Date(log.timestamp * 1000).toLocaleTimeString()}</span>
                    </div>
                    <div style={{ color: 'var(--text-secondary)', marginTop: '0.2rem' }}>{log.notes}</div>
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
