import React, { useState, useEffect } from 'react';
import { ShieldAlert, Check, X, Eye, FileText, Calendar, Mail, Phone, Landmark, MapPin } from 'lucide-react';
import { api } from '../../../api';

const detailRowStyle = {
  display: 'flex',
  justifyContent: 'space-between',
  padding: '0.65rem 0',
  borderBottom: '1px solid var(--border)',
  fontSize: '0.85rem'
};

const labelStyle = {
  color: 'var(--text-muted)',
  fontWeight: 500
};

const valueStyle = {
  color: 'var(--text-main)',
  fontWeight: 600
};

export default function AdminVerificationReview() {
  const [requests, setRequests] = useState([]);
  const [selectedReq, setSelectedReq] = useState(null);
  const [loading, setLoading] = useState(true);
  const [errorMsg, setErrorMsg] = useState('');
  const [successMsg, setSuccessMsg] = useState('');
  const [notes, setNotes] = useState('');
  const [rejectionReason, setRejectionReason] = useState('');
  const [showRejectForm, setShowRejectForm] = useState(false);
  const [busy, setBusy] = useState(false);

  useEffect(() => {
    fetchRequests();
  }, []);

  const fetchRequests = async () => {
    try {
      setLoading(true);
      setErrorMsg('');
      const data = await api('/api/admin/verifications');
      setRequests(data.requests || []);
      if (data.requests && data.requests.length > 0) {
        setSelectedReq(data.requests[0]);
      } else {
        setSelectedReq(null);
      }
    } catch (err) {
      setErrorMsg('Failed to load verification queue: ' + err.message);
    } finally {
      setLoading(false);
    }
  };

  const handleDecision = async (action, rejectMsg = '') => {
    if (!selectedReq) return;
    setBusy(true);
    setErrorMsg('');
    setSuccessMsg('');
    try {
      const payload = {
        action: action, // approved or rejected
        notes: notes || `Auditor review: ${action}`,
        rejection_reason: rejectMsg
      };
      await api(`/api/admin/verifications/${selectedReq.request_id}/review`, {
        method: 'POST',
        body: JSON.stringify(payload)
      });
      setSuccessMsg(`Identity request successfully ${action}.`);
      setNotes('');
      setRejectionReason('');
      setShowRejectForm(false);
      await fetchRequests();
    } catch (err) {
      setErrorMsg(err.message);
    } finally {
      setBusy(false);
    }
  };

  if (loading) {
    return (
      <div style={{ padding: '3rem', textAlign: 'center', color: '#6d28d9' }}>
        <h3>Loading Citizen Verification Review Queue...</h3>
      </div>
    );
  }

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '1.5rem' }}>
      <div>
        <h2 style={{ fontSize: '1.4rem', fontWeight: 800, color: 'var(--text-main)', margin: 0 }}>
          Citizen Verification Review Center
        </h2>
        <div style={{ fontSize: '0.8rem', color: 'var(--text-secondary)' }}>
          Review citizen proof documents, perform sanctions auditing, and sign off verification proofs on Sepolia ZK Rollup ledger.
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

      <div style={{ display: 'grid', gridTemplateColumns: '1fr 2fr', gap: '1.5rem', alignItems: 'start' }}>
        {/* Left Side: Requests List */}
        <div className="card" style={{ display: 'flex', flexDirection: 'column', gap: '1rem', maxHeight: '70vh', overflowY: 'auto' }}>
          <h3 style={{ fontSize: '1rem', fontWeight: 700, margin: 0, color: 'var(--text-main)' }}>
            Verification Queue ({requests.length})
          </h3>

          <div style={{ display: 'flex', flexDirection: 'column', gap: '0.5rem' }}>
            {requests.length === 0 ? (
              <div style={{ padding: '2rem', textAlign: 'center', color: 'var(--text-muted)', fontSize: '0.85rem' }}>
                Queue is empty. No pending verifications.
              </div>
            ) : (
              requests.map(req => {
                const isSelected = selectedReq?.request_id === req.request_id;
                return (
                  <button
                    key={req.request_id}
                    onClick={() => { setSelectedReq(req); setShowRejectForm(false); }}
                    style={{
                      display: 'flex',
                      flexDirection: 'column',
                      gap: '0.25rem',
                      padding: '0.75rem',
                      border: isSelected ? '1.5px solid var(--primary)' : '1px solid var(--border)',
                      borderRadius: 10,
                      background: isSelected ? 'rgba(109,40,217,0.05)' : 'var(--bg-card)',
                      cursor: 'pointer',
                      textAlign: 'left',
                      transition: 'all 0.15s ease'
                    }}
                  >
                    <div style={{ display: 'flex', justifyContent: 'space-between', width: '100%', alignItems: 'center' }}>
                      <span style={{ fontSize: '0.82rem', fontWeight: 700, color: 'var(--text-main)' }}>
                        {req.user_id}
                      </span>
                      <span
                        className="badge"
                        style={{
                          fontSize: '0.62rem',
                          background: req.status === 'approved' ? 'var(--success-light)' : req.status === 'rejected' ? 'var(--danger-light)' : 'var(--accent-light)',
                          color: req.status === 'approved' ? '#059669' : req.status === 'rejected' ? '#dc2626' : '#d97706'
                        }}
                      >
                        {req.status}
                      </span>
                    </div>
                    <div style={{ fontSize: '0.72rem', color: 'var(--text-muted)' }}>
                      ID Doc: {req.proof_type.toUpperCase()}
                    </div>
                  </button>
                );
              })
            )}
          </div>
        </div>

        {/* Right Side: Selected Request Details */}
        {selectedReq ? (
          <div className="card" style={{ display: 'flex', flexDirection: 'column', gap: '1.25rem' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
              <h3 style={{ fontSize: '1.1rem', fontWeight: 700, margin: 0, color: 'var(--text-main)' }}>
                Citizen Profile Information
              </h3>
              <span style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>
                Request ID: {selectedReq.request_id}
              </span>
            </div>

            {/* Fields Grid */}
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1.5rem', background: 'var(--bg-page)', padding: '1rem', borderRadius: 12 }}>
              <div style={{ display: 'flex', flexDirection: 'column', gap: '0.5rem' }}>
                <div style={detailRowStyle}>
                  <span style={labelStyle}>User Reference:</span>
                  <span style={valueStyle}>{selectedReq.user_id}</span>
                </div>
                <div style={detailRowStyle}>
                  <span style={labelStyle}>Proof Document:</span>
                  <span style={valueStyle}>{selectedReq.proof_type.toUpperCase()}</span>
                </div>
                <div style={detailRowStyle}>
                  <span style={labelStyle}>Identity Number:</span>
                  <span style={valueStyle}>{selectedReq.citizen_id_number}</span>
                </div>
                <div style={detailRowStyle}>
                  <span style={labelStyle}>Submitted At:</span>
                  <span style={valueStyle}>{new Date(selectedReq.submitted_at * 1000).toLocaleString()}</span>
                </div>
              </div>

              <div style={{ display: 'flex', flexDirection: 'column', gap: '0.5rem' }}>
                <div style={detailRowStyle}>
                  <span style={labelStyle}>State Ledger Status:</span>
                  <span style={valueStyle}>{selectedReq.status.toUpperCase()}</span>
                </div>
                <div style={detailRowStyle}>
                  <span style={labelStyle}>Review Auditor:</span>
                  <span style={valueStyle}>{selectedReq.reviewed_by || 'Unassigned'}</span>
                </div>
                <div style={detailRowStyle}>
                  <span style={labelStyle}>Audited At:</span>
                  <span style={valueStyle}>{selectedReq.reviewed_at ? new Date(selectedReq.reviewed_at * 1000).toLocaleString() : 'N/A'}</span>
                </div>
              </div>
            </div>

            {/* Document Scans */}
            <div>
              <h4 style={{ fontSize: '0.9rem', fontWeight: 700, marginBottom: '0.75rem', color: 'var(--text-main)' }}>
                Uploaded Identity Proof Scans
              </h4>
              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1rem' }}>
                <div style={{ border: '1px solid var(--border)', borderRadius: 10, padding: '0.5rem', textAlign: 'center', background: 'var(--bg-page)' }}>
                  <div style={{ fontSize: '0.72rem', fontWeight: 600, color: 'var(--text-secondary)', marginBottom: '0.4rem' }}>FRONT DOCUMENT</div>
                  {selectedReq.proof_document_front ? (
                    <img src={selectedReq.proof_document_front} alt="Front Document" style={{ width: '100%', maxHeight: '180px', objectFit: 'contain', borderRadius: 6 }} />
                  ) : (
                    <div style={{ height: '120px', display: 'flex', alignItems: 'center', justifyContent: 'center', color: 'var(--text-muted)', fontSize: '0.8rem' }}>No Image</div>
                  )}
                </div>

                <div style={{ border: '1px solid var(--border)', borderRadius: 10, padding: '0.5rem', textAlign: 'center', background: 'var(--bg-page)' }}>
                  <div style={{ fontSize: '0.72rem', fontWeight: 600, color: 'var(--text-secondary)', marginBottom: '0.4rem' }}>BACK DOCUMENT</div>
                  {selectedReq.proof_document_back ? (
                    <img src={selectedReq.proof_document_back} alt="Back Document" style={{ width: '100%', maxHeight: '180px', objectFit: 'contain', borderRadius: 6 }} />
                  ) : (
                    <div style={{ height: '120px', display: 'flex', alignItems: 'center', justifyContent: 'center', color: 'var(--text-muted)', fontSize: '0.8rem' }}>No Image</div>
                  )}
                </div>
              </div>
            </div>

            {/* Review Decision Actions */}
            {selectedReq.status === 'pending' && (
              <div style={{ borderTop: '1px solid var(--border)', paddingTop: '1.25rem', display: 'flex', flexDirection: 'column', gap: '1rem' }}>
                <div>
                  <span style={labelStyle}>Auditor Review Decision Notes</span>
                  <textarea
                    style={{ ...inputStyle, width: '100%', height: '60px', marginTop: '0.35rem', resize: 'vertical' }}
                    value={notes}
                    onChange={(e) => setNotes(e.target.value)}
                    placeholder="Enter compliance validation notes..."
                  />
                </div>

                {showRejectForm ? (
                  <div style={{ display: 'flex', flexDirection: 'column', gap: '0.75rem', background: '#fff5f5', border: '1px solid #fed7d7', padding: '1rem', borderRadius: 10 }}>
                    <span style={{ ...labelStyle, color: '#c53030' }}>Reason for Rejection</span>
                    <input
                      style={inputStyle}
                      value={rejectionReason}
                      onChange={(e) => setRejectionReason(e.target.value)}
                      placeholder="e.g. Uploaded scans are blurry or invalid documents"
                      required
                    />
                    <div style={{ display: 'flex', gap: '0.5rem' }}>
                      <button onClick={() => handleDecision('rejected', rejectionReason)} className="btn btn-danger" disabled={busy || !rejectionReason}>
                        Confirm Rejection
                      </button>
                      <button onClick={() => setShowRejectForm(false)} className="btn btn-secondary">
                        Cancel
                      </button>
                    </div>
                  </div>
                ) : (
                  <div style={{ display: 'flex', gap: '0.75rem' }}>
                    <button onClick={() => handleDecision('approved')} className="btn" style={{ background: '#10b981', color: '#fff', fontWeight: 700, gap: '0.4rem' }} disabled={busy}>
                      <Check size={16} /> Approve & Verify Identity
                    </button>
                    <button onClick={() => setShowRejectForm(true)} className="btn btn-danger" style={{ gap: '0.4rem' }} disabled={busy}>
                      <X size={16} /> Reject Request
                    </button>
                  </div>
                )}
              </div>
            )}
          </div>
        ) : (
          <div className="card" style={{ padding: '3rem', textAlign: 'center', color: 'var(--text-muted)' }}>
            Select a request from the queue to view details.
          </div>
        )}
      </div>
    </div>
  );
}

