import os
import time
import uuid
import hashlib
import secrets
import asyncio
from pathlib import Path
from typing import Dict, Any, List
from fastapi import FastAPI, WebSocket, WebSocketDisconnect, HTTPException, Depends
from fastapi.middleware.cors import CORSMiddleware
from fastapi.staticfiles import StaticFiles
from app.config import CORS_ORIGINS, PUBLIC_SIGNUP_ENABLED, WEB3_DEMO_AUTH_ENABLED
from app.models import (
    UserRole, RiskLevel, AuthAction,
    UserSignupRequest, UserLoginRequest, UserUpdateRequest, UserSuspendRequest,
    Web3SignupRequest, Web3LoginRequest,
    TermsConsentRequest, CredentialIssueRequest, AuthStartRequest,
    StepUpVerificationRequest, TrustSignalPayload, RevokeCredentialRequest,
    TrustEvaluationResult, TransferRequest, UPIPaymentRequest, LoanApplicationRequest,
    DepositCreationRequest, CardFreezeRequest,
    ProfileCreateRequest, VerificationSubmitRequest, AdminReviewRequest
)
from app.database import db, generate_blockchain_metadata
from app.security import (
    create_access_token, require_admin_role, require_customer_role, get_current_user,
    hash_password, verify_password, ADMIN_PORTAL_ROLES
)
from app.trust_engine import trust_engine
from app.blockchain_proof import blockchain_ledger

# Secrets that must never leave the server, even to an authenticated caller.
_PRIVATE_CREDENTIAL_FIELDS = {"password_hash", "retina_vector_hash"}
_PRIVATE_SESSION_FIELDS = {"websocket_ticket_hash"}

def public_credential(cred: dict) -> dict:
    """Credential safe to serialise to any client."""
    return {k: v for k, v in cred.items() if k not in _PRIVATE_CREDENTIAL_FIELDS}


def public_session(session: dict) -> dict:
    """Session fields safe to serialise to dashboards."""
    return {k: v for k, v in session.items() if k not in _PRIVATE_SESSION_FIELDS}

app = FastAPI(
    title="AI-Resistant Continuous Identity Verification API",
    version="1.1.0",
    description="Low-latency continuous human identity verification backend with Web3 Sepolia blockchain verification."
)

app.add_middleware(
    CORSMiddleware,
    allow_origins=CORS_ORIGINS,
    allow_credentials=True,
    allow_methods=["GET", "POST", "PUT", "DELETE", "OPTIONS"],
    allow_headers=["Authorization", "Content-Type"],
)

active_websockets: Dict[str, WebSocket] = {}

@app.get("/health")
def health_check():
    return {
        "status": "online",
        "timestamp": time.time(),
        "active_sessions": len(db.sessions),
        "total_audits": len(db.audit_logs),
        "blockchain_proofs": len(db.blockchain_proofs),
        "blockchain_network": "Sepolia Testnet / Identity ZK Rollup"
    }

# User Registration (Username + Password + Retina Data + Unique User Key)
@app.post("/auth/user-signup")
def user_signup(payload: UserSignupRequest):
    if not PUBLIC_SIGNUP_ENABLED:
        raise HTTPException(status_code=403, detail="Public signup is disabled.")

    # Check if username or email already exists
    for cred in db.credentials.values():
        if cred.get("username") == payload.username:
            raise HTTPException(status_code=400, detail="Username is already taken.")
        if cred.get("email") == payload.email and payload.email:
            raise HTTPException(status_code=400, detail="Email is already registered.")

    # Role is forced server-side, never taken from the request. Staff and platform-admin
    # credentials are provisioned; otherwise the admin portal is one POST body away from anyone.
    role = UserRole.CUSTOMER

    user_id = f"usr_{uuid.uuid4().hex[:8]}"
    cred_id = f"CRED-{role.value.upper()[:3]}-{uuid.uuid4().hex[:6].upper()}"
    unique_user_key = f"USR-KEY-{hashlib.sha256(f'{user_id}_{payload.username}_{time.time()}'.encode()).hexdigest()[:16].upper()}"
    consent_hash = hashlib.sha256(f"CONSENT_SIGNUP_{user_id}_{time.time()}".encode()).hexdigest()
    
    password_hash = hash_password(payload.password)

    # Automatically record terms consent
    db.terms_consents[user_id] = {
        "user_id": user_id,
        "accepted_at": time.time(),
        "version": "v1.0",
        "consent_hash": consent_hash
    }

    credential_data = {
        "credential_id": cred_id,
        "user_id": user_id,
        "username": payload.username,
        "user_key": unique_user_key,
        "full_name": payload.full_name,
        "email": payload.email,
        "user_role": role.value,
        "institution": payload.institution,
        "department": payload.department,
        "issued_at": time.time(),
        "status": "active",
        "consent_hash": consent_hash,
        "password_hash": password_hash,
        "wallet_address": payload.wallet_address or f"0x{uuid.uuid4().hex[:40]}"
    }
    db.credentials[cred_id] = credential_data

    token = create_access_token(
        user_id=user_id,
        role=role,
        credential_id=cred_id,
        consent_hash=consent_hash
    )

    tx_hash = blockchain_ledger.record_proof_hash(cred_id, 100.0, "LOW")

    db.add_audit_log(
        user_id=user_id,
        event_type="USER_REGISTERED",
        result="SUCCESS",
        reason_code="UNIQUE_KEY_ENFORCED_SEPOLIA_ZK",
        device_id="REGISTER_CLIENT",
        ip_address="127.0.0.1",
        tx_hash=tx_hash
    )

    return {
        "status": "success",
        "user_id": user_id,
        "user_key": unique_user_key,
        "credential": public_credential(credential_data),
        "id_token": token,
        "blockchain_tx_hash": tx_hash
    }

# Username + Password Login Endpoint
@app.post("/auth/user-login")
def user_login(payload: UserLoginRequest):
    matched = None
    for cred in db.credentials.values():
        if cred.get("username") == payload.username or cred.get("email") == payload.username:
            if verify_password(payload.password, cred.get("password_hash", "")):
                matched = cred
                break

    if not matched:
        raise HTTPException(status_code=401, detail="Invalid username or password.")

    if matched.get("status") in ["revoked", "suspended"]:
        raise HTTPException(status_code=403, detail=f"Access Denied: Account status is {matched['status'].upper()}.")

    token = create_access_token(
        user_id=matched["user_id"],
        role=UserRole(matched["user_role"]),
        credential_id=matched["credential_id"],
        consent_hash=matched.get("consent_hash", "0xDEFAULT_HASH")
    )

    db.add_audit_log(
        user_id=matched["user_id"],
        event_type="USER_LOGIN",
        result="SUCCESS",
        reason_code="CREDENTIALS_VERIFIED",
        device_id="LOGIN_CLIENT",
        ip_address="127.0.0.1"
    )

    return {
        "status": "success",
        "user_id": matched["user_id"],
        "user_key": matched.get("user_key", "USR-KEY-DEFAULT"),
        "credential": public_credential(matched),
        "id_token": token
    }

# Super Admin Portal Login (port 3001)
# Separate door from the client portal: a non-admin is refused a token here rather than
# handed one that quietly fails on every admin route afterwards.
@app.post("/auth/admin-login")
def admin_login(payload: UserLoginRequest):
    matched = None
    for cred in db.credentials.values():
        if cred.get("username") == payload.username or cred.get("email") == payload.username:
            if verify_password(payload.password, cred.get("password_hash", "")):
                matched = cred
                break

    if not matched:
        raise HTTPException(status_code=401, detail="Invalid administrator credentials.")

    if matched.get("user_role") not in ADMIN_PORTAL_ROLES:
        # A client-portal account probing the admin console is exactly what the audit trail is for.
        db.add_audit_log(
            user_id=matched["user_id"],
            event_type="ADMIN_PORTAL_ACCESS_DENIED",
            result="DENIED",
            reason_code=f"NON_ADMIN_ROLE_{matched.get('user_role', 'unknown').upper()}",
            device_id="ADMIN_CONSOLE",
            ip_address="127.0.0.1"
        )
        raise HTTPException(
            status_code=403,
            detail="This portal is restricted to platform administrators. Use the client portal on port 3000."
        )

    if matched.get("status") in ["revoked", "suspended"]:
        raise HTTPException(status_code=403, detail=f"Access Denied: Account status is {matched['status'].upper()}.")

    token = create_access_token(
        user_id=matched["user_id"],
        role=UserRole(matched["user_role"]),
        credential_id=matched["credential_id"],
        consent_hash=matched.get("consent_hash", "0xDEFAULT_HASH")
    )

    db.add_audit_log(
        user_id=matched["user_id"],
        event_type="ADMIN_PORTAL_LOGIN",
        result="SUCCESS",
        reason_code="ADMIN_CREDENTIALS_VERIFIED",
        device_id="ADMIN_CONSOLE",
        ip_address="127.0.0.1"
    )

    return {
        "status": "success",
        "user_id": matched["user_id"],
        "credential": public_credential(matched),
        "id_token": token
    }

# Web3 Signup Endpoint
@app.post("/auth/signup")
def web3_signup(payload: Web3SignupRequest):
    if not WEB3_DEMO_AUTH_ENABLED:
        raise HTTPException(status_code=403, detail="Demo Web3 authentication is disabled.")

    user_id = f"user_{payload.wallet_address.lower()[:8]}"
    role = UserRole.CUSTOMER
    cred_id = f"CRED-{role.value.upper()[:3]}-{uuid.uuid4().hex[:6].upper()}"
    unique_user_key = f"USR-KEY-{hashlib.sha256(f'{user_id}_{time.time()}'.encode()).hexdigest()[:16].upper()}"
    consent_hash = hashlib.sha256(f"CONSENT_SIGNUP_{user_id}_{time.time()}".encode()).hexdigest()

    # Record terms consent automatically for new signup
    db.terms_consents[user_id] = {
        "user_id": user_id,
        "accepted_at": time.time(),
        "version": "v1.0",
        "consent_hash": consent_hash
    }

    credential_data = {
        "credential_id": cred_id,
        "user_id": user_id,
        "username": user_id,
        "user_key": unique_user_key,
        "full_name": payload.full_name,
        "email": payload.email,
        "user_role": role.value,
        "institution": payload.institution,
        "department": payload.department,
        "issued_at": time.time(),
        "status": "active",
        "consent_hash": consent_hash,
        "wallet_address": payload.wallet_address
    }
    db.credentials[cred_id] = credential_data

    token = create_access_token(
        user_id=user_id,
        role=role,
        credential_id=cred_id,
        consent_hash=consent_hash
    )

    tx_hash = blockchain_ledger.record_proof_hash(cred_id, 100.0, "LOW")

    db.add_audit_log(
        user_id=user_id,
        event_type="WEB3_SIGNUP",
        result="SUCCESS",
        reason_code="SEPOLIA_ZK_IDENTITY_CREATED",
        device_id="WEB3_WALLET_CLIENT",
        ip_address="127.0.0.1",
        tx_hash=tx_hash
    )

    return {
        "status": "success",
        "user_id": user_id,
        "credential": public_credential(credential_data),
        "id_token": token,
        "blockchain_tx_hash": tx_hash,
        "sepolia_block_number": len(db.blockchain_proofs) + 1045210
    }

# Web3 Login Endpoint
@app.post("/auth/login")
def web3_login(payload: Web3LoginRequest):
    if not WEB3_DEMO_AUTH_ENABLED:
        raise HTTPException(status_code=403, detail="Demo Web3 authentication is disabled.")

    # Find matching credential by wallet address or user ID
    matched = None
    for cred in db.credentials.values():
        if cred.get("wallet_address", "").lower() == payload.wallet_address.lower() or cred.get("user_id") == payload.wallet_address:
            matched = cred
            break

    if not matched:
        # Default fallback for demo login if user isn't registered yet
        matched = db.credentials.get("CRED-STU-88492")

    if not matched:
        # The seeded demo credential can be revoked and deleted, so the fallback is not guaranteed.
        raise HTTPException(status_code=401, detail="No credential registered for this wallet address.")

    if matched["status"] == "revoked":
        raise HTTPException(
            status_code=401,
            detail="Access Denied: Your identity credential has been revoked on Sepolia Blockchain."
        )

    user_role = UserRole(matched["user_role"])
    token = create_access_token(
        user_id=matched["user_id"],
        role=user_role,
        credential_id=matched["credential_id"],
        consent_hash=matched.get("consent_hash", "0xDEFAULT_HASH")
    )

    db.add_audit_log(
        user_id=matched["user_id"],
        event_type="WEB3_LOGIN",
        result="SUCCESS",
        reason_code="EIP712_SIGNATURE_VERIFIED",
        device_id="WEB3_CLIENT",
        ip_address="127.0.0.1"
    )

    return {
        "status": "success",
        "user_id": matched["user_id"],
        "credential": public_credential(matched),
        "id_token": token,
        "sepolia_chain_id": 11155111  # Sepolia Testnet Chain ID
    }

# Accept Terms
@app.post("/terms/accept")
def accept_terms(payload: TermsConsentRequest, current_user: dict = Depends(get_current_user)):
    if payload.user_id != current_user.get("sub"):
        raise HTTPException(status_code=403, detail="Terms can only be accepted for the signed-in user.")
    if not (payload.continuous_monitoring_consent and payload.revocation_terms_consent):
        raise HTTPException(
            status_code=400,
            detail="You must accept all terms to use this identity system."
        )

    consent_str = f"CONSENT_{payload.accepted_version}_{payload.user_id}_{time.time()}"
    consent_hash = hashlib.sha256(consent_str.encode()).hexdigest()

    db.terms_consents[payload.user_id] = {
        "user_id": payload.user_id,
        "accepted_at": time.time(),
        "version": payload.accepted_version,
        "consent_hash": consent_hash
    }

    db.add_audit_log(
        user_id=payload.user_id,
        event_type="TERMS_ACCEPTED",
        result="SUCCESS",
        reason_code="CONSENT_RECORDED",
        device_id="ONBOARDING_DEVICE",
        ip_address="127.0.0.1"
    )

    return {
        "status": "success",
        "user_id": payload.user_id,
        "consent_hash": consent_hash,
        "accepted_at": time.time()
    }

# Issue Credential
@app.post("/credential/issue")
def issue_credential(payload: CredentialIssueRequest, admin_user: dict = Depends(require_admin_role)):
    user_consent = db.terms_consents.get(payload.user_id)
    if not user_consent:
        raise HTTPException(
            status_code=403,
            detail="Terms and guidelines must be accepted before an identity credential can be issued."
        )

    cred_id = f"CRED-{payload.user_role.value.upper()[:3]}-{uuid.uuid4().hex[:6].upper()}"
    credential_data = {
        "credential_id": cred_id,
        "user_id": payload.user_id,
        "full_name": payload.full_name,
        "user_role": payload.user_role.value,
        "institution": payload.institution,
        "department": payload.department,
        "issued_at": time.time(),
        "status": "active",
        "consent_hash": payload.consent_hash
    }
    db.credentials[cred_id] = credential_data

    token = create_access_token(
        user_id=payload.user_id,
        role=payload.user_role,
        credential_id=cred_id,
        consent_hash=payload.consent_hash
    )

    tx_hash = blockchain_ledger.record_proof_hash(cred_id, 100.0, "LOW")

    db.add_audit_log(
        user_id=payload.user_id,
        event_type="CREDENTIAL_ISSUED",
        result="SUCCESS",
        reason_code="ID_TOKEN_SIGNED",
        device_id="ISSUER_TERMINAL",
        ip_address="127.0.0.1",
        tx_hash=tx_hash
    )

    return {
        "status": "success",
        "credential": credential_data,
        "id_token": token,
        "blockchain_tx_hash": tx_hash
    }

# Start Session
@app.post("/auth/start")
def auth_start(payload: AuthStartRequest, current_user: dict = Depends(require_customer_role)):
    user_id = current_user["sub"]
    if payload.user_id != user_id:
        raise HTTPException(status_code=403, detail="A session can only be started for the signed-in user.")
    role = UserRole(current_user["role"])
    cred_id = current_user["credential_id"]
    consent_hash = current_user["consent_hash"]

    if cred_id in db.revoked_credentials:
        raise HTTPException(
            status_code=401,
            detail="Access Denied: This identity credential has been revoked by administration."
        )

    session_id = f"SES-{uuid.uuid4().hex[:8].upper()}"
    websocket_ticket = secrets.token_urlsafe(32)
    session_data = {
        "session_id": session_id,
        "user_id": user_id,
        "user_role": role.value,
        "credential_id": cred_id,
        "device_id": payload.device_id,
        "ip_address": payload.ip_address,
        "start_time": time.time(),
        "last_trust_score": 95.0,
        "risk_level": RiskLevel.LOW.value,
        "status": "active",
        "websocket_ticket_hash": hashlib.sha256(websocket_ticket.encode()).hexdigest()
    }
    db.sessions[session_id] = session_data

    db.add_audit_log(
        user_id=user_id,
        session_id=session_id,
        event_type="SESSION_START",
        result="SUCCESS",
        reason_code="FAST_RISK_CHECK_PASSED",
        device_id=payload.device_id,
        ip_address=payload.ip_address
    )

    return {
        "status": "success",
        "session_id": session_id,
        "initial_trust_score": 95.0,
        "risk_level": RiskLevel.LOW.value,
        "recommended_action": AuthAction.ALLOW.value,
        "websocket_ticket": websocket_ticket,
        "timestamp": time.time()
    }

# Evaluate Trust Signals
@app.post("/trust/evaluate", response_model=TrustEvaluationResult)
def evaluate_trust(payload: TrustSignalPayload, current_user: dict = Depends(require_customer_role)):
    session = db.sessions.get(payload.session_id)
    if not session:
        raise HTTPException(status_code=404, detail="Session not found or expired")
    if session.get("user_id") != current_user.get("sub"):
        raise HTTPException(status_code=403, detail="The session belongs to another user.")
    if session.get("status") != "active":
        raise HTTPException(status_code=403, detail="The session is not active.")

    cred_id = session.get("credential_id")
    is_revoked = (cred_id in db.revoked_credentials)

    result = trust_engine.evaluate_signals(payload, is_revoked=is_revoked)

    session["last_trust_score"] = result.trust_score
    session["risk_level"] = result.risk_level.value

    tx_hash = blockchain_ledger.record_proof_hash(
        session_id=payload.session_id,
        trust_score=result.trust_score,
        risk_level=result.risk_level.value
    )

    db.add_audit_log(
        user_id=session["user_id"],
        session_id=payload.session_id,
        event_type="TRUST_SCORE_EVALUATED",
        result=result.recommended_action.value.upper(),
        reason_code=", ".join(result.reasons),
        device_id=session["device_id"],
        ip_address=session["ip_address"],
        tx_hash=tx_hash
    )

    return result

# Step-Up Verification
@app.post("/auth/step-up")
def step_up_verification(payload: StepUpVerificationRequest, current_user: dict = Depends(require_customer_role)):
    session = db.sessions.get(payload.session_id)
    if not session:
        raise HTTPException(status_code=404, detail="Session not found")
    if session.get("user_id") != current_user.get("sub"):
        raise HTTPException(status_code=403, detail="The session belongs to another user.")
    if session.get("status") != "active":
        raise HTTPException(status_code=403, detail="The session is not active.")

    if payload.challenge_response == "SUCCESS":
        session["last_trust_score"] = 92.0
        session["risk_level"] = RiskLevel.LOW.value

        db.add_audit_log(
            user_id=session["user_id"],
            session_id=payload.session_id,
            event_type="STEP_UP_VERIFICATION",
            result="PASSED",
            reason_code=f"CHALLENGE_{payload.challenge_type.upper()}_PASSED",
            device_id=payload.device_sig,
            ip_address=session["ip_address"]
        )

        return {
            "status": "success",
            "message": "Step-up verification passed. Trust score restored.",
            "trust_score": 92.0,
            "recommended_action": AuthAction.ALLOW.value
        }
    else:
        session["last_trust_score"] = 30.0
        session["risk_level"] = RiskLevel.HIGH.value

        db.add_audit_log(
            user_id=session["user_id"],
            session_id=payload.session_id,
            event_type="STEP_UP_VERIFICATION",
            result="FAILED",
            reason_code="CHALLENGE_FAILED_PROXY_SUSPECTED",
            device_id=payload.device_sig,
            ip_address=session["ip_address"]
        )

        return {
            "status": "failed",
            "message": "Step-up challenge failed. High risk session restriction enforced.",
            "trust_score": 30.0,
            "recommended_action": AuthAction.RESTRICT.value
        }

# Real-Time WebSocket Streaming
@app.websocket("/ws/trust/{session_id}")
async def websocket_trust_stream(websocket: WebSocket, session_id: str):
    session = db.sessions.get(session_id)
    ticket = websocket.query_params.get("ticket", "")
    ticket_hash = hashlib.sha256(ticket.encode()).hexdigest()
    if (
        not session
        or session.get("status") != "active"
        or not secrets.compare_digest(ticket_hash, session.get("websocket_ticket_hash", ""))
    ):
        await websocket.close(code=4403)
        return

    await websocket.accept()
    active_websockets[session_id] = websocket
    try:
        while True:
            data = await websocket.receive_json()
            payload = TrustSignalPayload(
                session_id=session_id,
                behavior_sig=float(data.get("behavior_sig", 0.9)),
                device_sig=float(data.get("device_sig", 1.0)),
                context_sig=float(data.get("context_sig", 0.95))
            )

            is_revoked = False
            if session and session.get("credential_id") in db.revoked_credentials:
                is_revoked = True

            result = trust_engine.evaluate_signals(payload, is_revoked=is_revoked)

            if session:
                session["last_trust_score"] = result.trust_score
                session["risk_level"] = result.risk_level.value

            await websocket.send_json(result.model_dump())

    except WebSocketDisconnect:
        if session_id in active_websockets:
            del active_websockets[session_id]

# Institution Overview — single read that backs every client-portal panel.
# ponytail: one endpoint instead of eight; split per-panel only if payload size becomes a problem.
@app.get("/institution/overview")
def institution_overview(current_user: dict = Depends(get_current_user)):
    caller = db.credentials.get(current_user.get("credential_id"), {})
    institution = caller.get("institution")

    members = [c for c in db.credentials.values() if c.get("institution") == institution]
    member_ids = {c["user_id"] for c in members}
    names = {c["user_id"]: c.get("full_name", c["user_id"]) for c in members}

    sessions = [
        public_session({**s, "full_name": names.get(s["user_id"], s["user_id"])})
        for s in db.sessions.values() if s["user_id"] in member_ids
    ]
    logs = [l for l in reversed(db.audit_logs) if l["user_id"] in member_ids]

    # Attendance / analytics are derived from the trust evaluations already in the audit trail,
    # so no extra time-series storage is needed.
    # ponytail: bounded by audit-log retention; add a real time-series store if history must outlive it.
    trust_events = [l for l in logs if l["event_type"] == "TRUST_SCORE_EVALUATED"]

    by_risk = {"low": 0, "medium": 0, "high": 0}
    for s in sessions:
        by_risk[s.get("risk_level", "low")] = by_risk.get(s.get("risk_level", "low"), 0) + 1

    return {
        "institution": institution,
        "caller": public_credential(caller),
        "members": [public_credential(c) for c in members],
        "sessions": [public_session(session) for session in sessions],
        "audit_logs": logs[:100],
        "trust_events": trust_events[:100],
        "kpis": {
            "total_members": len(members),
            "active_sessions": len(sessions),
            "low_risk": by_risk["low"],
            "medium_risk": by_risk["medium"],
            "high_risk": by_risk["high"],
            "revoked": sum(1 for c in members if c.get("status") == "revoked"),
            "avg_trust": round(
                sum(s.get("last_trust_score", 0) for s in sessions) / len(sessions), 1
            ) if sessions else 0.0,
        },
    }

# Admin Update User Profile & Role
@app.put("/admin/users/update")
def update_user(payload: UserUpdateRequest, admin_user: dict = Depends(require_admin_role)):
    matched = None
    for cred in db.credentials.values():
        if cred.get("user_id") == payload.user_id or cred.get("credential_id") == payload.user_id:
            matched = cred
            break

    if not matched:
        raise HTTPException(status_code=404, detail="User credential not found.")

    if payload.full_name:
        matched["full_name"] = payload.full_name
    if payload.email:
        matched["email"] = payload.email
    if payload.user_role:
        matched["user_role"] = payload.user_role.value
    if payload.institution:
        matched["institution"] = payload.institution
    if payload.department:
        matched["department"] = payload.department
    if payload.status:
        matched["status"] = payload.status

    db.add_audit_log(
        user_id=matched["user_id"],
        event_type="USER_UPDATED_BY_ADMIN",
        result="SUCCESS",
        reason_code="ADMIN_PROFILE_MODIFIED",
        device_id="ADMIN_CONSOLE",
        ip_address="127.0.0.1"
    )

    return {
        "status": "success",
        "message": "User profile successfully updated.",
        "user": public_credential(matched)
    }

# Admin Suspend User Session
@app.post("/admin/users/suspend")
def suspend_user(payload: UserSuspendRequest, admin_user: dict = Depends(require_admin_role)):
    matched = None
    for cred in db.credentials.values():
        if cred.get("user_id") == payload.user_id or cred.get("credential_id") == payload.user_id:
            matched = cred
            break

    if not matched:
        raise HTTPException(status_code=404, detail="User credential not found.")

    matched["status"] = "suspended"

    # Suspend any active sessions for this user
    for session in db.sessions.values():
        if session.get("user_id") == matched["user_id"]:
            session["status"] = "suspended"
            session["risk_level"] = RiskLevel.HIGH.value

    db.add_audit_log(
        user_id=matched["user_id"],
        event_type="USER_SUSPENDED",
        result="SUSPENDED",
        reason_code=payload.reason,
        device_id="ADMIN_CONSOLE",
        ip_address="127.0.0.1"
    )

    return {
        "status": "success",
        "message": f"User {matched['user_id']} has been suspended.",
        "user": public_credential(matched)
    }

# Admin Delete / Revoke User
@app.delete("/admin/users/{user_id}")
def delete_user(user_id: str, admin_user: dict = Depends(require_admin_role)):
    target_cred_id = None
    for cred_id, cred in list(db.credentials.items()):
        if cred.get("user_id") == user_id or cred_id == user_id:
            target_cred_id = cred_id
            db.revoked_credentials.add(cred_id)
            cred["status"] = "revoked"
            del db.credentials[cred_id]
            break

    if not target_cred_id:
        raise HTTPException(status_code=404, detail="User credential not found.")

    db.add_audit_log(
        user_id=user_id,
        event_type="USER_DELETED",
        result="REVOKED",
        reason_code="ADMIN_USER_PURGED",
        device_id="ADMIN_CONSOLE",
        ip_address="127.0.0.1"
    )

    return {
        "status": "success",
        "message": f"User {user_id} removed and identity credential revoked."
    }

# Revoke Credential
@app.post("/credential/revoke")
def revoke_credential(payload: RevokeCredentialRequest, admin_user: dict = Depends(require_admin_role)):
    db.revoked_credentials.add(payload.credential_id)

    if payload.credential_id in db.credentials:
        db.credentials[payload.credential_id]["status"] = "revoked"

    tx_hash = blockchain_ledger.record_revocation_proof(payload.credential_id, payload.reason)

    db.add_audit_log(
        user_id=admin_user.get("sub", "ADMIN"),
        event_type="CREDENTIAL_REVOKED",
        result="REVOKED",
        reason_code=payload.reason,
        device_id="ADMIN_CONSOLE",
        ip_address="127.0.0.1",
        tx_hash=tx_hash
    )

    return {
        "status": "success",
        "message": f"Credential {payload.credential_id} has been revoked.",
        "blockchain_tx_hash": tx_hash
    }

# Session Audit Logs
@app.get("/audit/session/{session_id}")
def get_session_audits(session_id: str, admin_user: dict = Depends(require_admin_role)):
    audits = [log for log in db.audit_logs if log.get("session_id") == session_id]
    return {
        "session_id": session_id,
        "audits": audits
    }

# Admin Risk Summary
@app.get("/admin/risk-summary")
def get_admin_risk_summary(admin_user: dict = Depends(require_admin_role)):
    sessions = list(db.sessions.values())
    active_count = len(sessions)
    low_risk = sum(1 for s in sessions if s.get("risk_level") == "low")
    med_risk = sum(1 for s in sessions if s.get("risk_level") == "medium")
    high_risk = sum(1 for s in sessions if s.get("risk_level") == "high")

    alerts = []
    for s in sessions:
        if s.get("risk_level") in ["medium", "high"]:
            alerts.append({
                "session_id": s["session_id"],
                "user_id": s["user_id"],
                "trust_score": s["last_trust_score"],
                "risk_level": s["risk_level"],
                "reason": "Anomalous trust score decay or step-up pending" if s["risk_level"] == "medium" else "Proxy / deepfake risk threshold exceeded"
            })

    return {
        "total_active_sessions": active_count,
        "low_risk_count": low_risk,
        "medium_risk_count": med_risk,
        "high_risk_count": high_risk,
        "revoked_credentials_count": len(db.revoked_credentials),
        "recent_alerts": alerts,
        "sessions": [public_session(session) for session in sessions],
        "audit_logs": list(reversed(db.audit_logs))[:100],
        "credentials": [public_credential(c) for c in db.credentials.values()],
        "avg_trust": round(
            sum(s.get("last_trust_score", 0) for s in sessions) / len(sessions), 1
        ) if sessions else 0.0,
    }

# ==================== NEXUS BLOCKBANK CORE BANKING API ====================

@app.get("/api/banking/overview")
def get_banking_overview(current_user: dict = Depends(require_customer_role)):
    total_inr = sum(acc["balance"] for acc in db.accounts if acc["currency"] == "INR")
    total_cbdc = sum(acc["balance"] for acc in db.accounts if acc["currency"] == "e-Rupee")
    total_crypto = sum(acc["balance"] for acc in db.accounts if acc["currency"] == "ETH")

    return {
        "status": "success",
        "customer": db.customers.get(current_user["sub"], db.customers.get("stu001")),
        "metrics": {
            "total_fiat_inr": total_inr,
            "total_cbdc_erupee": total_cbdc,
            "total_crypto_eth": total_crypto,
            "active_accounts": len(db.accounts),
            "active_cards": len(db.cards),
            "total_loans": len(db.loans),
            "total_deposits": len(db.deposits),
            "unread_notifications": len(db.notifications),
            "blockchain_height": 1489205 + len(db.blockchain_proofs),
            "consensus": "PBFT Finality Active (12 Validator Nodes Synced)"
        },
        "recent_transactions": db.transactions[:5],
        "reward_summary": db.rewards.get("stu001")
    }

@app.get("/api/banking/accounts")
def get_accounts(current_user: dict = Depends(require_customer_role)):
    return {"status": "success", "accounts": db.accounts}

@app.get("/api/banking/transactions")
def get_transactions(current_user: dict = Depends(require_customer_role)):
    return {"status": "success", "transactions": db.transactions}

@app.post("/api/banking/transfer")
def execute_transfer(payload: TransferRequest, current_user: dict = Depends(require_customer_role)):
    sender = next((a for a in db.accounts if a["account_number"] == payload.sender_account), None)
    if not sender or sender["balance"] < payload.amount:
        raise HTTPException(status_code=400, detail="Insufficient account balance or account not found.")

    sender["balance"] -= payload.amount

    receiver = next((a for a in db.accounts if a["account_number"] == payload.receiver_account), None)
    if receiver:
        receiver["balance"] += payload.amount

    proof = blockchain_ledger.record_banking_transaction(
        tx_type="IMMEDIATE_SETTLEMENT_TRANSFER",
        sender=payload.sender_account,
        receiver=payload.receiver_account,
        amount=payload.amount,
        currency=payload.currency
    )

    tx_entry = {
        "tx_id": proof["tx_id"],
        "sender_account": payload.sender_account,
        "receiver_account": payload.receiver_account,
        "amount": payload.amount,
        "currency": payload.currency,
        "tx_type": "Smart Contract Transfer",
        "description": payload.description,
        "metadata": proof["metadata"]
    }
    db.transactions.insert(0, tx_entry)

    db.add_audit_log(
        user_id=current_user["sub"],
        event_type="BLOCKCHAIN_TRANSFER_EXECUTED",
        result="SUCCESS",
        reason_code="EIP712_SIGNATURE_VALIDATED",
        device_id="DEV-SEC-DESKTOP-892",
        ip_address="127.0.0.1",
        tx_hash=proof["tx_hash"]
    )

    return {"status": "success", "transaction": tx_entry, "blockchain_tx_hash": proof["tx_hash"]}

@app.get("/api/banking/upi")
def get_upi_details(current_user: dict = Depends(require_customer_role)):
    return {"status": "success", "upis": db.upis}

@app.post("/api/banking/upi/pay")
def pay_upi(payload: UPIPaymentRequest, current_user: dict = Depends(require_customer_role)):
    sender_acc = db.accounts[0]
    if sender_acc["balance"] < payload.amount:
        raise HTTPException(status_code=400, detail="Insufficient balance for UPI payment.")

    sender_acc["balance"] -= payload.amount

    proof = blockchain_ledger.record_banking_transaction(
        tx_type="UPI_2.0_SMART_SETTLEMENT",
        sender=sender_acc["account_number"],
        receiver=payload.vpa,
        amount=payload.amount,
        currency="INR"
    )

    tx_entry = {
        "tx_id": proof["tx_id"],
        "sender_account": sender_acc["account_number"],
        "receiver_account": payload.vpa,
        "amount": payload.amount,
        "currency": "INR",
        "tx_type": "UPI 2.0 Instant Transfer",
        "description": f"UPI Payment to {payload.vpa} ({payload.note})",
        "metadata": proof["metadata"]
    }
    db.transactions.insert(0, tx_entry)

    return {"status": "success", "transaction": tx_entry, "blockchain_tx_hash": proof["tx_hash"]}

@app.get("/api/banking/cards")
def get_cards(current_user: dict = Depends(require_customer_role)):
    return {"status": "success", "cards": db.cards}

@app.post("/api/banking/cards/freeze")
def freeze_card(payload: CardFreezeRequest, current_user: dict = Depends(require_customer_role)):
    card = next((c for c in db.cards if c["card_number_masked"] == payload.card_number), None)
    if not card:
        raise HTTPException(status_code=404, detail="Card not found.")

    card["is_frozen"] = payload.is_frozen
    card["metadata"]["status"] = "FROZEN_BY_CUSTOMER" if payload.is_frozen else "ACTIVE_SETTLED"
    card["metadata"]["lifecycle_state"] = card["metadata"]["status"]

    return {"status": "success", "card": card}

@app.get("/api/banking/loans")
def get_loans(current_user: dict = Depends(require_customer_role)):
    return {"status": "success", "loans": db.loans}

@app.post("/api/banking/loans/apply")
def apply_loan(payload: LoanApplicationRequest, current_user: dict = Depends(require_customer_role)):
    meta = generate_blockchain_metadata("LoanAsset", "stu001", "ACC-NEX-884920", payload.amount, "INR", f"Smart Loan ({payload.loan_type})")
    emi = round((payload.amount * 1.085) / payload.tenure_months, 2)

    new_loan = {
        "loan_id": f"LOAN-{uuid.uuid4().hex[:6].upper()}",
        "loan_type": payload.loan_type,
        "principal_amount": payload.amount,
        "outstanding_balance": payload.amount,
        "interest_rate": 8.5,
        "emi_amount": emi,
        "status": "APPROVED_DISBURSED_ON_CHAIN",
        "metadata": meta
    }
    db.loans.append(new_loan)

    # Disburse loan into customer savings account
    db.accounts[0]["balance"] += payload.amount

    return {"status": "success", "loan": new_loan}

@app.get("/api/banking/deposits")
def get_deposits(current_user: dict = Depends(require_customer_role)):
    return {"status": "success", "deposits": db.deposits}

@app.post("/api/banking/deposits/create")
def create_deposit(payload: DepositCreationRequest, current_user: dict = Depends(require_customer_role)):
    if db.accounts[0]["balance"] < payload.amount:
        raise HTTPException(status_code=400, detail="Insufficient account balance to open deposit.")

    db.accounts[0]["balance"] -= payload.amount

    maturity = round(payload.amount * (1 + (0.075 * (payload.tenure_months / 12))), 2)
    meta = generate_blockchain_metadata("DepositAsset", "stu001", "ACC-NEX-884920", payload.amount, "INR", f"Fixed Deposit ({payload.deposit_type})")

    new_dep = {
        "deposit_id": f"DEP-{uuid.uuid4().hex[:6].upper()}",
        "deposit_type": payload.deposit_type,
        "principal_amount": payload.amount,
        "maturity_amount": maturity,
        "interest_rate": 7.5,
        "maturity_date": "2027-08-02",
        "metadata": meta
    }
    db.deposits.append(new_dep)

    return {"status": "success", "deposit": new_dep}

@app.get("/api/banking/beneficiaries")
def get_beneficiaries(current_user: dict = Depends(require_customer_role)):
    return {"status": "success", "beneficiaries": db.beneficiaries}

@app.get("/api/banking/bills")
def get_bills(current_user: dict = Depends(require_customer_role)):
    return {"status": "success", "bills": db.bill_payments}

@app.get("/api/banking/kyc")
def get_kyc_vault(current_user: dict = Depends(require_customer_role)):
    return {"status": "success", "kyc": db.kyc_vault}

@app.get("/api/banking/rewards")
def get_rewards(current_user: dict = Depends(require_customer_role)):
    return {"status": "success", "rewards": db.rewards.get("stu001")}

@app.get("/api/banking/notifications")
def get_notifications(current_user: dict = Depends(require_customer_role)):
    return {"status": "success", "notifications": db.notifications}

@app.get("/api/banking/support")
def get_support_tickets(current_user: dict = Depends(require_customer_role)):
    return {"status": "success", "tickets": db.support_tickets}

@app.get("/api/banking/metadata/{object_id}")
def get_object_metadata(object_id: str, current_user: dict = Depends(require_customer_role)):
    # Search all collections for an object matching object_id
    collections = [
        [db.customers.get("stu001")],
        db.accounts, db.transactions, db.upis, db.cards,
        db.loans, db.deposits, db.beneficiaries, db.bill_payments,
        db.kyc_vault, list(db.rewards.values()), db.notifications, db.support_tickets
    ]

    for col in collections:
        for item in col:
            if item and item.get("metadata", {}).get("object_id") == object_id:
                return {"status": "success", "metadata": item["metadata"], "parent_entity": item}

    # Return default dynamic metadata if not found
    default_meta = generate_blockchain_metadata("BankingAsset", "stu001")
    default_meta["object_id"] = object_id
    return {"status": "success", "metadata": default_meta}

@app.get("/api/blockchain/nodes")
def get_blockchain_nodes(current_user: dict = Depends(require_admin_role)):
    return {
        "status": "success",
        "network": "Hyperledger Besu / Sepolia ZK Rollup Hybrid",
        "consensus": "IBFT 2.0 PBFT (Instant Finality)",
        "tps": 3450,
        "block_height": 1489205 + len(db.blockchain_proofs),
        "active_validators": [
            {"id": "VAL-RBI-NODE-01", "name": "Reserve Bank of India Node", "status": "ONLINE_VALIDATING", "latency_ms": 4},
            {"id": "VAL-HDFC-NODE-02", "name": "HDFC Enterprise Node", "status": "ONLINE_VALIDATING", "latency_ms": 7},
            {"id": "VAL-SBI-NODE-03", "name": "State Bank of India Validator", "status": "ONLINE_VALIDATING", "latency_ms": 6},
            {"id": "VAL-ICICI-NODE-04", "name": "ICICI Blockchain Gateway", "status": "ONLINE_VALIDATING", "latency_ms": 8},
        ],
        "gas_price_gwei": 0.0001,
        "zero_knowledge_verifier": "EIP-712 Plonk ZK-SNARK"
    }

@app.get("/api/blockchain/contracts")
def get_smart_contracts(current_user: dict = Depends(require_admin_role)):
    return {
        "status": "success",
        "contracts": [
            {
                "name": "NexusBankCoreEscrow.sol",
                "address": "0x71C839210B3920F928104820491A204",
                "version": "v3.2.0",
                "status": "ACTIVE_VERIFIED",
                "methods": ["transferEscrow", "releaseCollateral", "executeInstantSettlement"]
            },
            {
                "name": "UPIInstantSettlement.sol",
                "address": "0x98A1029310293847AEF88410293A",
                "version": "v2.1.0",
                "status": "ACTIVE_VERIFIED",
                "methods": ["verifyVPASignature", "settlePBFTBlock"]
            },
            {
                "name": "KYCVerificationZK.sol",
                "address": "0x44F0091293847AEF88410293B",
                "version": "v1.9.0",
                "status": "ACTIVE_VERIFIED",
                "methods": ["verifyZkAadhaarProof", "attestBiometricLiveness"]
            },
            {
                "name": "LoanAutomatedDisbursement.sol",
                "address": "0x11B3029310293847AEF88410293C",
                "version": "v2.0.4",
                "status": "ACTIVE_VERIFIED",
                "methods": ["autoDisburseLoan", "deductEMISmartContract"]
            }
        ]
    }

# ============================================================
# Citizen Profile & Verification Endpoints
# ============================================================

@app.get("/api/profile")
def get_profile(current_user: dict = Depends(require_customer_role)):
    user_id = current_user.get("sub")
    profile = db.profiles.get(user_id)
    if not profile:
        return {
            "status": "success",
            "profile": None,
            "verification": None
        }
    
    verification = None
    for req in db.verification_requests.values():
        if req.get("user_id") == user_id:
            verification = req
            break
            
    return {
        "status": "success",
        "profile": profile,
        "verification": verification
    }

@app.post("/api/profile")
def create_or_update_profile(payload: ProfileCreateRequest, current_user: dict = Depends(require_customer_role)):
    user_id = current_user.get("sub")
    db.profiles[user_id] = {
        "user_id": user_id,
        "full_name": payload.full_name,
        "date_of_birth": payload.date_of_birth,
        "gender": payload.gender,
        "mobile_number": payload.mobile_number,
        "email_address": payload.email_address,
        "address": payload.address,
        "city": payload.city,
        "state": payload.state,
        "postal_code": payload.postal_code,
        "country": payload.country,
        "updated_at": time.time()
    }
    
    db.add_audit_log(
        user_id=user_id,
        event_type="PROFILE_UPDATED",
        result="SUCCESS",
        reason_code="USER_PROFILE_CHANGES_SAVED",
        device_id="WEB_CLIENT_PORTAL",
        ip_address="127.0.0.1"
    )
    
    return {
        "status": "success",
        "message": "Profile updated successfully.",
        "profile": db.profiles[user_id]
    }

@app.post("/api/profile/verify")
def submit_verification(payload: VerificationSubmitRequest, current_user: dict = Depends(require_customer_role)):
    user_id = current_user.get("sub")
    profile = db.profiles.get(user_id)
    if not profile:
        raise HTTPException(status_code=400, detail="You must create a profile before submitting verification.")
        
    request_id = f"req_{uuid.uuid4().hex[:8]}"
    audit_log_id = f"aud_{uuid.uuid4().hex[:8]}"
    
    verification_req = {
        "request_id": request_id,
        "user_id": user_id,
        "citizen_id_number": payload.citizen_id_number,
        "proof_type": payload.proof_type,
        "proof_document_front": payload.proof_document_front,
        "proof_document_back": payload.proof_document_back,
        "selfie_or_live_photo": payload.selfie_or_live_photo,
        "status": "pending",
        "submitted_at": time.time(),
        "reviewed_at": None,
        "reviewed_by": None,
        "rejection_reason": "",
        "notes": "",
        "audit_log_id": audit_log_id
    }
    db.verification_requests[request_id] = verification_req
    
    db.verification_audit_logs.append({
        "audit_log_id": audit_log_id,
        "request_id": request_id,
        "user_id": user_id,
        "action": "SUBMIT",
        "notes": "Citizen verification documents submitted.",
        "timestamp": time.time()
    })
    
    db.add_audit_log(
        user_id=user_id,
        event_type="IDENTITY_VERIFICATION_SUBMITTED",
        result="SUCCESS",
        reason_code="DOCUMENTS_UPLOADED",
        device_id="WEB_CLIENT_PORTAL",
        ip_address="127.0.0.1"
    )
    
    return {
        "status": "success",
        "message": "Verification request submitted successfully.",
        "request_id": request_id,
        "status_current": "pending"
    }

@app.get("/api/admin/verifications")
def admin_get_verifications(current_user: dict = Depends(require_admin_role)):
    return {
        "status": "success",
        "requests": list(db.verification_requests.values())
    }

@app.post("/api/admin/verifications/{request_id}/review")
def admin_review_verification(request_id: str, payload: AdminReviewRequest, current_user: dict = Depends(require_admin_role)):
    req = db.verification_requests.get(request_id)
    if not req:
        raise HTTPException(status_code=404, detail="Verification request not found.")
        
    action_upper = payload.action.upper()
    if action_upper not in ["APPROVED", "REJECTED"]:
        raise HTTPException(status_code=400, detail="Invalid review action. Must be APPROVED or REJECTED.")
        
    new_status = "approved" if action_upper == "APPROVED" else "rejected"
    
    req["status"] = new_status
    req["reviewed_at"] = time.time()
    req["reviewed_by"] = current_user.get("sub")
    req["rejection_reason"] = payload.rejection_reason if new_status == "rejected" else ""
    req["notes"] = payload.notes
    
    audit_log_id = f"aud_{uuid.uuid4().hex[:8]}"
    db.verification_audit_logs.append({
        "audit_log_id": audit_log_id,
        "request_id": request_id,
        "user_id": req["user_id"],
        "action": action_upper,
        "notes": payload.notes or f"Verification status updated to {new_status}.",
        "timestamp": time.time()
    })
    
    db.add_audit_log(
        user_id=current_user.get("sub"),
        event_type=f"IDENTITY_VERIFICATION_{action_upper}",
        result="SUCCESS",
        reason_code=f"REQUEST_{action_upper}",
        device_id="ADMIN_CONSOLE",
        ip_address="127.0.0.1"
    )
    
    return {
        "status": "success",
        "message": f"Verification status updated to {new_status}.",
        "request_id": request_id,
        "new_status": new_status
    }

@app.get("/api/profile/audit")
def get_verification_audit(current_user: dict = Depends(require_customer_role)):
    user_id = current_user.get("sub")
    user_logs = [log for log in db.verification_audit_logs if log.get("user_id") == user_id]
    return {
        "status": "success",
        "audit_history": user_logs
    }


# The production container builds both React portals into this directory. Mounting
# them after every API and WebSocket route keeps the existing UI while making all
# browser requests same-origin.
def mount_portals(target_app: FastAPI, web_root: Path) -> None:
    client_portal = web_root / "client"
    admin_portal = web_root / "admin"
    if client_portal.is_dir() and admin_portal.is_dir():
        target_app.mount("/admin", StaticFiles(directory=admin_portal, html=True), name="admin-portal")
        target_app.mount("/", StaticFiles(directory=client_portal, html=True), name="client-portal")


mount_portals(app, Path(os.getenv("WEB_ROOT", Path(__file__).resolve().parents[1] / "web")))
