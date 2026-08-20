import time
import jwt
from typing import Dict, Any
from fastapi import HTTPException, Security, Depends
from fastapi.security import HTTPBearer, HTTPAuthorizationCredentials
from app.config import JWT_SECRET, TOKEN_TTL_MINUTES
from app.database import db
from app.models import UserRole
from app.passwords import hash_password, verify_password

ALGORITHM = "HS256"

security_bearer = HTTPBearer()

def create_access_token(user_id: str, role: UserRole, credential_id: str, consent_hash: str) -> str:
    payload = {
        "sub": user_id,
        "role": role.value,
        "credential_id": credential_id,
        "consent_hash": consent_hash,
        "iat": time.time(),
        "exp": time.time() + (TOKEN_TTL_MINUTES * 60)
    }
    return jwt.encode(payload, JWT_SECRET, algorithm=ALGORITHM)

def decode_access_token(token: str) -> Dict[str, Any]:
    try:
        return jwt.decode(token, JWT_SECRET, algorithms=[ALGORITHM])
    except jwt.PyJWTError:
        raise HTTPException(status_code=401, detail="Invalid or expired authentication token")

def get_user_from_token(token: str) -> Dict[str, Any]:
    current_user = decode_access_token(token)
    credential_id = current_user.get("credential_id")
    credential = db.credentials.get(credential_id)
    if not credential or credential_id in db.revoked_credentials:
        raise HTTPException(status_code=401, detail="Authentication credential is no longer active")
    if credential.get("status") != "active":
        raise HTTPException(status_code=403, detail="Account is not active")
    return current_user


def get_current_user(credentials: HTTPAuthorizationCredentials = Security(security_bearer)) -> Dict[str, Any]:
    return get_user_from_token(credentials.credentials)

# Roles that may enter the Super Admin portal (3001).
ADMIN_PORTAL_ROLES = [UserRole.ADMIN.value, UserRole.REGULATOR.value, UserRole.AUDITOR.value, UserRole.BRANCH_MANAGER.value]

def require_admin_role(current_user: Dict[str, Any] = Depends(get_current_user)) -> Dict[str, Any]:
    if current_user.get("role") not in ADMIN_PORTAL_ROLES:
        raise HTTPException(
            status_code=403,
            detail="Forbidden: Client portal users cannot access Server/Admin portal resources."
        )
    return current_user


def require_customer_role(current_user: Dict[str, Any] = Depends(get_current_user)) -> Dict[str, Any]:
    if current_user.get("role") != UserRole.CUSTOMER.value:
        raise HTTPException(status_code=403, detail="This resource is restricted to customer accounts.")
    return current_user
