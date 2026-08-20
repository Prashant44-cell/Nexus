import time
import uuid
import hashlib
from typing import Dict, List, Optional
from app.config import ADMIN_PASSWORD, ADMIN_USERNAME, DEMO_MODE, DEMO_USER_PASSWORD
from app.models import UserRole, RiskLevel, AuthAction
from app.passwords import hash_password

INSTITUTION = "Nexus Global Reserve Bank"

def generate_blockchain_metadata(
    object_name: str,
    customer_id: str = "CUST-982341",
    account_number: str = "ACC-NEXUS-884920",
    balance: float = 248900.50,
    currency: str = "INR",
    account_type: str = "Savings Tier-1 Escrow",
    status: str = "ACTIVE_SETTLED",
    risk_score: float = 0.02,
    fraud_score: float = 0.01,
) -> dict:
    obj_id = str(uuid.uuid4())
    block_num = 1489203 + int(time.time() % 10000)
    tx_hash = "0x" + hashlib.sha256(f"{obj_id}_{time.time()}".encode()).hexdigest()
    block_hash = "0x" + hashlib.sha256(f"BLOCK_{block_num}_{tx_hash}".encode()).hexdigest()
    prev_hash = "0x" + hashlib.sha256(f"PREV_{block_num-1}".encode()).hexdigest()
    merkle_root = "0x" + hashlib.sha256(f"MERKLE_{tx_hash}".encode()).hexdigest()
    pub_key = "0x04a89f31c" + hashlib.sha256(customer_id.encode()).hexdigest()[:40]
    wallet_addr = "0x71C" + hashlib.sha256(customer_id.encode()).hexdigest()[:37]

    return {
        "object_name": object_name,
        "object_id": obj_id,
        "customer_id": customer_id,
        "account_number": account_number,
        "wallet_address": wallet_addr,
        "public_key": pub_key,
        "private_key_ref": f"kms://nexus-vault/keys/enc_ref_{customer_id.lower()}_v1",
        "account_type": account_type,
        "currency": currency,
        "balance": balance,
        "status": status,
        "blockchain_network_type": "Permissioned Enterprise Hybrid",
        "ledger_type": "Hyperledger Besu / Sepolia ZK Rollup",
        "consensus_algorithm": "IBFT 2.0 / PBFT Finality",
        "smart_contract_name": f"Nexus{object_name}Contract.sol",
        "smart_contract_address_id": "0x" + hashlib.sha256(object_name.encode()).hexdigest()[:40],
        "asset_id": f"AST-{object_name[:3].upper()}-{obj_id[:8].upper()}",
        "node_id": "NODE-VAL-IND-01",
        "validator_id": "VAL-RBI-NODE-04",
        "channel_organization": "org1.nexusbank.rbi",
        "block_number": block_num,
        "block_hash": block_hash,
        "previous_block_hash": prev_hash,
        "merkle_root": merkle_root,
        "transaction_hash": tx_hash,
        "digital_signature": "0x" + hashlib.sha256(f"SIG_{tx_hash}".encode()).hexdigest(),
        "nonce": block_num % 100,
        "timestamp": time.strftime("%Y-%m-%dT%H:%M:%SZ", time.gmtime()),
        "version": "v2.4-blockchain",
        "encryption_algorithm": "AES-256-GCM",
        "hash_algorithm": "SHA-256 / Keccak-256",
        "access_control": "RBAC / ABAC Zero-Trust",
        "read_write_permissions": "READ_ONLY_AUDITOR, EXECUTE_SMART_CONTRACT",
        "authentication_method": "Biometric MFA + EIP-712 Signature",
        "kyc_status": "Verified ZK-Proof",
        "aml_status": "Clean / Passed AI Sanction Screening",
        "compliance_standards": "RBI Cyber Security Framework, PCI-DSS v4.0, ISO 27001, GDPR",
        "audit_trail": [
            f"INIT_BLOCK:{block_num}:{tx_hash[:10]}",
            f"VERIFIED_BY_VALIDATOR:VAL-RBI-NODE-04",
            f"MERKLE_ANCHORED:{merkle_root[:10]}"
        ],
        "data_integrity_status": "Verified Immutable",
        "replication_status": "Synced across 12 Enterprise Nodes",
        "backup_status": "Encrypted Zero-Knowledge Snapshot Stored",
        "created_by": "SYSTEM_SMART_CONTRACT",
        "updated_by": "ORACLE_NODE_SYNC",
        "verified_by": "VALIDATOR_RBI_NODE_04",
        "created_timestamp": time.strftime("%Y-%m-%dT%H:%M:%SZ", time.gmtime(time.time() - 86400)),
        "updated_timestamp": time.strftime("%Y-%m-%dT%H:%M:%SZ", time.gmtime()),
        "last_access_timestamp": time.strftime("%Y-%m-%dT%H:%M:%SZ", time.gmtime()),
        "source_channel": "Web Banking Portal",
        "device_id": "DEV-SEC-DESKTOP-892",
        "ip_address": "127.0.0.1",
        "session_id": f"SES-NEXUS-{obj_id[:6].upper()}",
        "api_version": "v1.0.0-core",
        "event_log_id": f"EVT-{obj_id[:8].upper()}",
        "error_log_id": "NONE",
        "risk_score": risk_score,
        "fraud_score": fraud_score,
        "transaction_limits": {"daily": 1000000.0, "per_tx": 250000.0},
        "approval_workflow": "Automated Multi-Sig PBFT Finality",
        "notification_status": "DELIVERED_ON_CHAIN",
        "remarks": f"Blockchain asset {object_name} initialized and validated.",
        "tags": ["core-banking", "blockchain-asset", "immutable", object_name.lower()],
        "lifecycle_state": status
    }

class InMemoryDatabase:
    def __init__(self):
        self.credentials: Dict[str, dict] = {}
        self.terms_consents: Dict[str, dict] = {}
        self.sessions: Dict[str, dict] = {}
        self.audit_logs: List[dict] = []
        self.blockchain_proofs: List[dict] = []
        self.revoked_credentials: set = set()

        # Citizen Profile & Verification System
        self.profiles: Dict[str, dict] = {}
        self.verification_requests: Dict[str, dict] = {}
        self.verification_audit_logs: List[dict] = []

        # Core Banking Collections
        self.customers: Dict[str, dict] = {}
        self.accounts: List[dict] = []
        self.transactions: List[dict] = []
        self.upis: List[dict] = []
        self.cards: List[dict] = []
        self.loans: List[dict] = []
        self.deposits: List[dict] = []
        self.beneficiaries: List[dict] = []
        self.bill_payments: List[dict] = []
        self.kyc_vault: List[dict] = []
        self.rewards: Dict[str, dict] = {}
        self.notifications: List[dict] = []
        self.support_tickets: List[dict] = []

        self._seed_default_data()

    def _seed_default_data(self):
        # Demo Customer Credential
        student_cred_id = "CRED-STU-88492"
        student_user_key = "USR-KEY-" + hashlib.sha256(b"stu001_aarav_key").hexdigest()[:16].upper()
        consent_hash = hashlib.sha256(b"CONSENT_AGREED_V1.0_STU001").hexdigest()
        self.terms_consents["stu001"] = {
            "user_id": "stu001",
            "accepted_at": time.time() - 3600,
            "version": "v2.4-banking",
            "consent_hash": consent_hash
        }
        if DEMO_MODE:
            self.credentials[student_cred_id] = {
                "credential_id": student_cred_id,
                "user_id": "stu001",
                "username": "aarav_sharma",
                "user_key": student_user_key,
                "full_name": "Aarav Sharma",
                "email": "aarav.sharma@nexusbank.io",
                "user_role": UserRole.CUSTOMER.value,
                "institution": INSTITUTION,
                "department": "Private Wealth & Digital Vault",
                "issued_at": time.time() - 3600,
                "status": "active",
                "consent_hash": consent_hash,
                "password_hash": hash_password(DEMO_USER_PASSWORD)
            }

        # Admin Credential
        admin_cred_id = "CRED-ADM-00001"
        admin_consent_hash = hashlib.sha256(b"CONSENT_AGREED_V1.0_ADMIN001").hexdigest()
        self.terms_consents["admin001"] = {
            "user_id": "admin001",
            "accepted_at": time.time() - 86400,
            "version": "v2.4-banking",
            "consent_hash": admin_consent_hash
        }
        self.credentials[admin_cred_id] = {
            "credential_id": admin_cred_id,
            "user_id": "admin001",
            "username": ADMIN_USERNAME,
            "user_key": "USR-KEY-" + hashlib.sha256(b"admin001_platform_key").hexdigest()[:16].upper(),
            "full_name": "Regulatory Node Governor",
            "email": "governor@rbi.nexusbank.io",
            "user_role": UserRole.REGULATOR.value,
            "institution": "Reserve Bank Regulator Node",
            "department": "Monetary Stability & Blockchain Governance",
            "issued_at": time.time() - 86400,
            "status": "active",
            "consent_hash": admin_consent_hash,
            "password_hash": hash_password(ADMIN_PASSWORD)
        }

        # Seed Profile for Aarav Sharma
        self.profiles["stu001"] = {
            "user_id": "stu001",
            "full_name": "Aarav Sharma",
            "date_of_birth": "1994-08-12",
            "gender": "male",
            "mobile_number": "+919876543210",
            "email_address": "aarav.sharma@nexusbank.io",
            "address": "123 Green Valley Road",
            "city": "Bangalore",
            "state": "Karnataka",
            "postal_code": "560001",
            "country": "IN",
        }

        req_id = "req_aarav_verification"
        self.verification_requests[req_id] = {
            "request_id": req_id,
            "user_id": "stu001",
            "citizen_id_number": "123456789012",
            "proof_type": "aadhaar",
            "status": "approved",
            "submitted_at": time.time() - 3600,
            "reviewed_at": time.time() - 1800,
            "reviewed_by": "admin001",
            "rejection_reason": "",
            "notes": "Initial verification successful.",
            "proof_document_front": "/uploads/front_sample.jpg",
            "proof_document_back": "/uploads/back_sample.jpg",
            "selfie_or_live_photo": None
        }

        # Customer Asset
        cust_meta = generate_blockchain_metadata("CustomerAsset", "stu001", "ACC-NEX-884920", 384920.00, "INR", "Platinum Wealth Customer")
        self.customers["stu001"] = {
            "customer_id": "stu001",
            "full_name": "Aarav Sharma",
            "email": "aarav.sharma@nexusbank.io",
            "username": "aarav_sharma",
            "user_role": UserRole.CUSTOMER.value,
            "kyc_tier": "Tier 3 RBI ZK-Verified",
            "metadata": cust_meta
        }

        # Seed Banking Accounts
        acc1_meta = generate_blockchain_metadata("SavingsAccountAsset", "stu001", "ACC-NEX-884920", 248900.50, "INR", "Savings Tier-1 Escrow")
        self.accounts.append({
            "account_number": "ACC-NEX-884920",
            "account_type": "Savings Vault Account",
            "currency": "INR",
            "balance": 248900.50,
            "interest_rate": 4.5,
            "metadata": acc1_meta
        })

        acc2_meta = generate_blockchain_metadata("CBDCWalletAsset", "stu001", "CBDC-ERUPEE-99218", 35000.00, "e-Rupee CBDC", "Reserve Bank CBDC Token Vault")
        self.accounts.append({
            "account_number": "CBDC-ERUPEE-99218",
            "account_type": "Digital e-Rupee CBDC Wallet",
            "currency": "e-Rupee",
            "balance": 35000.00,
            "interest_rate": 0.0,
            "metadata": acc2_meta
        })

        acc3_meta = generate_blockchain_metadata("EscrowAccountAsset", "stu001", "ESCROW-CRYPTO-10293", 1.85, "ETH", "Smart Contract Crypto Vault")
        self.accounts.append({
            "account_number": "ESCROW-CRYPTO-10293",
            "account_type": "Collateralized Crypto Vault",
            "currency": "ETH",
            "balance": 1.85,
            "interest_rate": 6.2,
            "metadata": acc3_meta
        })

        # Seed Transactions
        tx1_meta = generate_blockchain_metadata("TransactionAsset", "stu001", "ACC-NEX-884920", 15000.00, "INR", "UPI Transfer")
        self.transactions.append({
            "tx_id": "TX-BLK-994821",
            "sender_account": "ACC-NEX-884920",
            "receiver_account": "ACC-HDFC-302910",
            "amount": 15000.00,
            "currency": "INR",
            "tx_type": "UPI 2.0 Instant Smart Transfer",
            "description": "Payment to Tech Corp VPA",
            "metadata": tx1_meta
        })

        tx2_meta = generate_blockchain_metadata("TransactionAsset", "stu001", "CBDC-ERUPEE-99218", 2500.00, "e-Rupee CBDC", "CBDC Transfer")
        self.transactions.append({
            "tx_id": "TX-CBDC-881029",
            "sender_account": "CBDC-ERUPEE-99218",
            "receiver_account": "CBDC-MERCHANT-44102",
            "amount": 2500.00,
            "currency": "e-Rupee",
            "tx_type": "Central Bank Digital Currency Settlement",
            "description": "Retail Merchant Settlement",
            "metadata": tx2_meta
        })

        # Seed UPI Handles
        upi1_meta = generate_blockchain_metadata("UPIAsset", "stu001", "ACC-NEX-884920", 248900.50, "INR", "UPI VPA Handle")
        self.upis.append({
            "vpa": "aarav@nexusbank",
            "linked_account": "ACC-NEX-884920",
            "qr_payload": "upi://pay?pa=aarav@nexusbank&pn=Aarav%20Sharma&mc=0000&mode=02&purpose=00",
            "is_active": True,
            "metadata": upi1_meta
        })

        # Seed Cards
        card1_meta = generate_blockchain_metadata("CardAsset", "stu001", "ACC-NEX-884920", 500000.00, "INR", "Virtual Card Escrow")
        self.cards.append({
            "card_number_masked": "4532 •••• •••• 8849",
            "card_type": "Visa Infinite Tokenized Debit",
            "expiry": "12/29",
            "network": "Visa Token Service",
            "is_frozen": False,
            "metadata": card1_meta
        })

        card2_meta = generate_blockchain_metadata("CardAsset", "stu001", "ACC-NEX-884920", 1000000.00, "INR", "Credit Card Smart Asset")
        self.cards.append({
            "card_number_masked": "5241 •••• •••• 1092",
            "card_type": "Nexus Black Card (Credit)",
            "expiry": "08/30",
            "network": "RuPay Select On-Chain",
            "is_frozen": False,
            "metadata": card2_meta
        })

        # Seed Loans
        loan1_meta = generate_blockchain_metadata("LoanAsset", "stu001", "ACC-NEX-884920", 500000.00, "INR", "Automated Smart Loan")
        self.loans.append({
            "loan_id": "LOAN-SMART-99102",
            "loan_type": "Solar Equipment Micro-Loan",
            "principal_amount": 500000.00,
            "outstanding_balance": 340000.00,
            "interest_rate": 8.5,
            "emi_amount": 14200.00,
            "status": "ACTIVE_AUTO_EMI",
            "metadata": loan1_meta
        })

        # Seed Deposits
        dep1_meta = generate_blockchain_metadata("DepositAsset", "stu001", "ACC-NEX-884920", 100000.00, "INR", "Fixed Staking Deposit")
        self.deposits.append({
            "deposit_id": "DEP-STAKE-77102",
            "deposit_type": "On-Chain Fixed Staking Deposit",
            "principal_amount": 100000.00,
            "maturity_amount": 107800.00,
            "interest_rate": 7.8,
            "maturity_date": "2027-08-02",
            "metadata": dep1_meta
        })

        # Seed Beneficiaries
        ben1_meta = generate_blockchain_metadata("BeneficiaryAsset", "stu001", "ACC-HDFC-302910", 0, "INR", "Whitelisted Beneficiary")
        self.beneficiaries.append({
            "beneficiary_id": "BEN-001",
            "name": "Priya Sharma",
            "account_number": "ACC-HDFC-302910",
            "ifsc_code": "HDFC0001092",
            "vpa": "priya@hdfc",
            "max_limit": 500000.00,
            "metadata": ben1_meta
        })

        # Seed Bill Payments
        bill1_meta = generate_blockchain_metadata("BillPaymentAsset", "stu001", "ACC-NEX-884920", 2450.00, "INR", "Utility Auto-Pay Escrow")
        self.bill_payments.append({
            "bill_id": "BILL-ELEC-44192",
            "biller_name": "BESCOM Electricity Board",
            "category": "Utilities",
            "amount": 2450.00,
            "due_date": "2026-08-15",
            "status": "PENDING_AUTO_PAY",
            "metadata": bill1_meta
        })

        # Seed KYC Vault
        kyc1_meta = generate_blockchain_metadata("KYCAsset", "stu001", "ACC-NEX-884920", 0, "INR", "Zero Knowledge Identity Asset")
        self.kyc_vault.append({
            "kyc_id": "KYC-ZK-RBI-88192",
            "document_type": "Aadhaar ZK-Proof Credentials",
            "verification_hash": "0x98f3b201948aeef12093847aef88410293a",
            "status": "VERIFIED_ON_CHAIN",
            "verified_at": "2026-01-15T10:30:00Z",
            "metadata": kyc1_meta
        })

        # Seed Rewards
        reward_meta = generate_blockchain_metadata("RewardAsset", "stu001", "ACC-NEX-884920", 450.00, "NEXUS-TOKEN", "ERC-20 Reward Vault")
        self.rewards["stu001"] = {
            "reward_id": "REW-STU001",
            "token_balance": 450.00,
            "cashback_inr": 1250.00,
            "tier": "Gold Validator",
            "metadata": reward_meta
        }

        # Seed Notifications
        notif1_meta = generate_blockchain_metadata("NotificationAsset", "stu001", "ACC-NEX-884920", 0, "INR", "On-Chain Notification")
        self.notifications.append({
            "notification_id": "NOTIF-88192",
            "title": "Block Finalized: UPI Payment",
            "message": "Your UPI transfer of ₹15,000 to Tech Corp has been committed in block #1489204.",
            "severity": "INFO",
            "metadata": notif1_meta
        })

        # Seed Support Tickets
        ticket1_meta = generate_blockchain_metadata("SupportTicketAsset", "stu001", "ACC-NEX-884920", 0, "INR", "Immutable Support Dispute")
        self.support_tickets.append({
            "ticket_id": "TCK-DISPUTE-1092",
            "category": "Merchant Refund Escrow",
            "subject": "Merchant refund delay for transaction #TX-BLK-994821",
            "status": "OPEN_IN_SMART_CONTRACT",
            "priority": "HIGH",
            "metadata": ticket1_meta
        })

        # Initial Audit Logs
        self.add_audit_log(
            user_id="stu001",
            event_type="BANKING_SESSION_OPENED",
            result="SUCCESS",
            reason_code="BIOMETRIC_EIP712_VERIFIED",
            device_id="DEV-SEC-DESKTOP-892",
            ip_address="127.0.0.1"
        )

    def add_audit_log(self, user_id: str, event_type: str, result: str, reason_code: str, device_id: str, ip_address: str, session_id: Optional[str] = None, tx_hash: Optional[str] = None) -> dict:
        log_entry = {
            "id": f"AUD-{uuid.uuid4().hex[:8].upper()}",
            "timestamp": time.time(),
            "user_id": user_id,
            "session_id": session_id,
            "event_type": event_type,
            "result": result,
            "reason_code": reason_code,
            "device_id": device_id,
            "ip_address": ip_address,
            "blockchain_tx_hash": tx_hash or f"0x{uuid.uuid4().hex}"
        }
        self.audit_logs.append(log_entry)
        return log_entry

db = InMemoryDatabase()
