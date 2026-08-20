from pydantic import BaseModel, Field
from typing import Optional, List, Dict, Any
from enum import Enum

class UserRole(str, Enum):
    CUSTOMER = "customer"
    BRANCH_MANAGER = "branch_manager"
    ADMIN = "admin"
    REGULATOR = "regulator"
    AUDITOR = "auditor"

class RiskLevel(str, Enum):
    LOW = "low"
    MEDIUM = "medium"
    HIGH = "high"

class AuthAction(str, Enum):
    ALLOW = "allow"
    STEP_UP = "step_up"
    RESTRICT = "restrict"
    REVOKE = "revoke"
    BLOCK = "block"

class BlockchainBankingAssetMetadata(BaseModel):
    object_name: str
    object_id: str
    customer_id: str
    account_number: str
    wallet_address: str
    public_key: str
    private_key_ref: str
    account_type: str
    currency: str
    balance: float
    status: str
    blockchain_network_type: str = "Permissioned Enterprise Hybrid"
    ledger_type: str = "Hyperledger Besu / Sepolia ZK Rollup"
    consensus_algorithm: str = "IBFT 2.0 / PBFT Finality"
    smart_contract_name: str = "NexusBankCoreEscrow.sol"
    smart_contract_address_id: str = "0x71C839210B3920F928104820491A204"
    asset_id: str
    node_id: str = "NODE-VAL-IND-01"
    validator_id: str = "VAL-RBI-NODE-04"
    channel_organization: str = "org1.nexusbank.rbi"
    block_number: int
    block_hash: str
    previous_block_hash: str
    merkle_root: str
    transaction_hash: str
    digital_signature: str
    nonce: int
    timestamp: str
    version: str = "v2.4-blockchain"
    encryption_algorithm: str = "AES-256-GCM"
    hash_algorithm: str = "SHA-256 / Keccak-256"
    access_control: str = "RBAC / ABAC Zero-Trust"
    read_write_permissions: str = "READ_ONLY_AUDITOR, EXECUTE_SMART_CONTRACT"
    authentication_method: str = "Biometric MFA + EIP-712 Signature"
    kyc_status: str = "Verified ZK-Proof"
    aml_status: str = "Clean / Passed AI Sanction Screening"
    compliance_standards: str = "RBI Cyber Security, PCI-DSS v4.0, ISO 27001, GDPR"
    audit_trail: List[str] = Field(default_factory=list)
    data_integrity_status: str = "Verified Immutable"
    replication_status: str = "Synced across 12 Enterprise Nodes"
    backup_status: str = "Encrypted Zero-Knowledge Snapshot Stored"
    created_by: str = "SYSTEM_SMART_CONTRACT"
    updated_by: str = "ORACLE_NODE_SYNC"
    verified_by: str = "VALIDATOR_RBI_NODE_04"
    created_timestamp: str
    updated_timestamp: str
    last_access_timestamp: str
    source_channel: str = "Web Banking Portal"
    device_id: str = "DEV-SEC-DESKTOP-892"
    ip_address: str = "127.0.0.1"
    session_id: str
    api_version: str = "v1.0.0-core"
    event_log_id: str
    error_log_id: str = "NONE"
    risk_score: float = 0.02
    fraud_score: float = 0.01
    transaction_limits: Dict[str, float] = Field(default_factory=lambda: {"daily": 1000000.0, "per_tx": 250000.0})
    approval_workflow: str = "Automated Multi-Sig PBFT Finality"
    notification_status: str = "DELIVERED_ON_CHAIN"
    remarks: str = "Blockchain-native banking asset validated."
    tags: List[str] = Field(default_factory=lambda: ["core-banking", "blockchain-asset", "immutable"])
    lifecycle_state: str = "ACTIVE_SETTLED"

# Banking Entity Models wrapping metadata
class CustomerAsset(BaseModel):
    customer_id: str
    full_name: str
    email: str
    username: str
    user_role: UserRole = UserRole.CUSTOMER
    kyc_tier: str = "Tier 3 Full RBI ZK-Verified"
    metadata: BlockchainBankingAssetMetadata

class AccountAsset(BaseModel):
    account_number: str
    account_type: str
    currency: str
    balance: float
    interest_rate: float = 4.5
    metadata: BlockchainBankingAssetMetadata

class TransactionAsset(BaseModel):
    tx_id: str
    sender_account: str
    receiver_account: str
    amount: float
    currency: str
    tx_type: str
    description: str
    metadata: BlockchainBankingAssetMetadata

class UPIAsset(BaseModel):
    vpa: str
    linked_account: str
    qr_payload: str
    is_active: bool = True
    metadata: BlockchainBankingAssetMetadata

class CardAsset(BaseModel):
    card_number_masked: str
    card_type: str  # Debit, Credit, CBDC Virtual
    expiry: str
    network: str  # RuPay, Visa, Blockchain Escrow
    is_frozen: bool = False
    metadata: BlockchainBankingAssetMetadata

class LoanAsset(BaseModel):
    loan_id: str
    loan_type: str  # Personal, Home, Auto, Crypto Collateralized
    principal_amount: float
    outstanding_balance: float
    interest_rate: float
    emi_amount: float
    status: str
    metadata: BlockchainBankingAssetMetadata

class DepositAsset(BaseModel):
    deposit_id: str
    deposit_type: str  # Fixed Deposit, Recurring Deposit, CBDC Staking
    principal_amount: float
    maturity_amount: float
    interest_rate: float
    maturity_date: str
    metadata: BlockchainBankingAssetMetadata

class BeneficiaryAsset(BaseModel):
    beneficiary_id: str
    name: str
    account_number: str
    ifsc_code: str
    vpa: Optional[str] = None
    max_limit: float
    metadata: BlockchainBankingAssetMetadata

class BillPaymentAsset(BaseModel):
    bill_id: str
    biller_name: str
    category: str
    amount: float
    due_date: str
    status: str
    metadata: BlockchainBankingAssetMetadata

class KYCAsset(BaseModel):
    kyc_id: str
    document_type: str  # Aadhaar ZK, PAN ZK, Passport ZK
    verification_hash: str
    status: str
    verified_at: str
    metadata: BlockchainBankingAssetMetadata

class RewardAsset(BaseModel):
    reward_id: str
    token_balance: float
    cashback_inr: float
    tier: str
    metadata: BlockchainBankingAssetMetadata

class NotificationAsset(BaseModel):
    notification_id: str
    title: str
    message: str
    severity: str
    metadata: BlockchainBankingAssetMetadata

class SupportTicketAsset(BaseModel):
    ticket_id: str
    category: str
    subject: str
    status: str
    priority: str
    metadata: BlockchainBankingAssetMetadata

# API Request Models
class UserSignupRequest(BaseModel):
    username: str = Field(..., min_length=3, max_length=64)
    password: str = Field(..., min_length=8, max_length=128)
    full_name: str = Field(..., min_length=2, max_length=120)
    email: str = Field(..., min_length=3, max_length=254)
    user_role: UserRole = UserRole.CUSTOMER
    institution: str = "Nexus Global Reserve Bank"
    department: str = "Retail & Wealth Management"
    security_credentials: Optional[str] = None
    wallet_address: Optional[str] = None

class UserLoginRequest(BaseModel):
    username: str = Field(..., min_length=1, max_length=254)
    password: str = Field(..., min_length=8, max_length=128)

class UserUpdateRequest(BaseModel):
    user_id: str
    full_name: Optional[str] = None
    email: Optional[str] = None
    user_role: Optional[UserRole] = None
    institution: Optional[str] = None
    department: Optional[str] = None
    status: Optional[str] = None

class UserSuspendRequest(BaseModel):
    user_id: str
    reason: str

class Web3SignupRequest(BaseModel):
    wallet_address: str
    full_name: str
    email: str
    user_role: UserRole = UserRole.CUSTOMER
    institution: str = "Nexus Global Reserve Bank"
    department: str = "Retail & Wealth Management"

class Web3LoginRequest(BaseModel):
    wallet_address: str
    signature: str
    nonce: str

class TermsConsentRequest(BaseModel):
    user_id: str
    user_role: UserRole = UserRole.CUSTOMER
    accepted_version: str = "v2.4-banking"
    continuous_monitoring_consent: bool = True
    revocation_terms_consent: bool = True

class CredentialIssueRequest(BaseModel):
    user_id: str
    user_role: UserRole = UserRole.CUSTOMER
    institution: str = "Nexus Global Reserve Bank"
    department: str = "Retail & Wealth Management"
    full_name: str
    consent_hash: str

class AuthStartRequest(BaseModel):
    user_id: str
    device_id: str
    ip_address: str = "127.0.0.1"
    user_agent: str = "Mozilla/5.0"

class StepUpVerificationRequest(BaseModel):
    session_id: str
    challenge_type: str
    challenge_response: str
    device_sig: str

class TrustSignalPayload(BaseModel):
    session_id: str
    behavior_sig: float = Field(..., ge=0.0, le=1.0)
    device_sig: float = Field(..., ge=0.0, le=1.0)
    context_sig: float = Field(..., ge=0.0, le=1.0)

class RevokeCredentialRequest(BaseModel):
    credential_id: str
    reason: str
    admin_id: str

# Citizen Identity & Verification Request Models
class ProfileCreateRequest(BaseModel):
    full_name: str
    date_of_birth: str
    gender: str
    mobile_number: str
    email_address: str
    address: str
    city: str
    state: str
    postal_code: str
    country: str

class VerificationSubmitRequest(BaseModel):
    citizen_id_number: str
    proof_type: str
    proof_document_front: str
    proof_document_back: str
    selfie_or_live_photo: Optional[str] = None

class AdminReviewRequest(BaseModel):
    action: str
    notes: Optional[str] = ""
    rejection_reason: Optional[str] = ""

class TrustEvaluationResult(BaseModel):
    session_id: str
    trust_score: float
    risk_level: RiskLevel
    recommended_action: AuthAction
    reasons: List[str]
    latency_ms: float
    timestamp: float

class TransferRequest(BaseModel):
    sender_account: str
    receiver_account: str
    amount: float = Field(..., gt=0, le=250000)
    currency: str = "INR"
    description: str = "Instant Blockchain Transfer"
    signature: Optional[str] = None

class UPIPaymentRequest(BaseModel):
    vpa: str
    amount: float = Field(..., gt=0, le=100000)
    note: str = "UPI 2.0 Blockchain Transfer"

class LoanApplicationRequest(BaseModel):
    loan_type: str
    amount: float = Field(..., gt=0, le=10000000)
    tenure_months: int = Field(..., ge=1, le=360)

class DepositCreationRequest(BaseModel):
    deposit_type: str
    amount: float = Field(..., gt=0, le=10000000)
    tenure_months: int = Field(..., ge=1, le=120)

class CardFreezeRequest(BaseModel):
    card_number: str
    is_frozen: bool
