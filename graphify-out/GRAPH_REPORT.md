# Graph Report - Prasunethon 2.0 (same as  fintech + blockchain)  (2026-08-22)

## Corpus Check
- 59 files · ~31,021 words
- Verdict: corpus is large enough that graph structure adds value.

## Summary
- 335 nodes · 757 edges · 18 communities (17 shown, 1 thin omitted)
- Extraction: 94% EXTRACTED · 6% INFERRED · 0% AMBIGUOUS · INFERRED: 44 edges (avg confidence: 0.94)
- Token cost: 0 input · 0 output

## Graph Freshness
- Built from commit: `65373b89`
- Run `git rev-parse HEAD` and compare to check if the graph is stale.
- Run `graphify update .` after code changes (no API cost).

## Community Hubs (Navigation)
- main.py
- api
- api.js
- models.py
- package.json
- Nexus BlockBank — AI-Resistant Continuous Identity & Digital Banking Platform
- dependencies
- security.py
- AGENTS.md
- AdminApp.jsx
- RiskLevel
- UserRole
- post
- test_api.py

## God Nodes (most connected - your core abstractions)
1. `api()` - 43 edges
2. `fmtTime()` - 17 edges
3. `UserRole` - 15 edges
4. `scoreColor()` - 13 edges
5. `useOverview()` - 12 edges
6. `public_credential()` - 11 edges
7. `RiskLevel` - 10 edges
8. `AuthAction` - 9 edges
9. `create_access_token()` - 9 edges
10. `setToken()` - 9 edges

## Surprising Connections (you probably didn't know these)
- `InMemoryDatabase` --uses--> `UserRole`  [INFERRED]
  backend/app/database.py → backend/app/models.py
- `user_signup()` --uses--> `UserSignupRequest`  [INFERRED]
  backend/app/main.py → backend/app/models.py
- `user_signup()` --calls--> `hash_password()`  [INFERRED]
  backend/app/main.py → backend/app/passwords.py
- `web3_signup()` --uses--> `Web3SignupRequest`  [INFERRED]
  backend/app/main.py → backend/app/models.py
- `web3_login()` --uses--> `Web3LoginRequest`  [INFERRED]
  backend/app/main.py → backend/app/models.py

## Import Cycles
- None detected.

## Communities (18 total, 1 thin omitted)

### Community 0 - "main.py"
Cohesion: 0.13
Nodes (28): admin_get_verifications(), delete_user(), get_accounts(), get_admin_risk_summary(), get_banking_overview(), get_beneficiaries(), get_bills(), get_blockchain_nodes() (+20 more)

### Community 1 - "api"
Cohesion: 0.07
Nodes (33): api(), BankingAdminDashboard(), CredentialManagement(), AuthModal(), fieldStyle, BackgroundVideo(), AccountsPanel(), inputStyle (+25 more)

### Community 2 - "api.js"
Cohesion: 0.15
Nodes (27): configuredApiBase, downloadCSV(), fmtTime(), riskClass(), scoreColor(), useOverview(), STATUS_CLASS, LiveSessions() (+19 more)

### Community 3 - "models.py"
Cohesion: 0.11
Nodes (33): AccountAsset, AdminReviewRequest, AuthStartRequest, BeneficiaryAsset, BillPaymentAsset, BlockchainBankingAssetMetadata, CardAsset, CardFreezeRequest (+25 more)

### Community 4 - "package.json"
Cohesion: 0.10
Nodes (19): devDependencies, @types/react, @types/react-dom, vite, @vitejs/plugin-react, name, private, scripts (+11 more)

### Community 5 - "Nexus BlockBank — AI-Resistant Continuous Identity & Digital Banking Platform"
Cohesion: 0.12
Nodes (16): 1. Run Backend Automated Tests, 2. Test Production Frontend Builds, 🏛️ Architecture Overview, 🔑 Demo Login Credentials, 🔧 Environment Configuration, 🚀 Execution Process (Step-by-Step), Nexus BlockBank — AI-Resistant Continuous Identity & Digital Banking Platform, Option 1: Quick Start (Windows) (+8 more)

### Community 6 - "dependencies"
Cohesion: 0.10
Nodes (21): autoprefixer, class-variance-authority, clsx, framer-motion, dependencies, autoprefixer, class-variance-authority, clsx (+13 more)

### Community 7 - "security.py"
Cohesion: 0.12
Nodes (13): Any, BlockchainProofLayer, generate_blockchain_metadata(), InMemoryDatabase, apply_loan(), create_deposit(), hash_password(), decode_access_token() (+5 more)

### Community 13 - "AdminApp.jsx"
Cohesion: 0.09
Nodes (22): AdminApp(), getWebSocketUrl(), setToken(), useRiskSummary(), ClientApp(), AdminLogin(), fieldStyle, AdminNavbar() (+14 more)

### Community 14 - "RiskLevel"
Cohesion: 0.25
Nodes (11): auth_start(), step_up_verification(), websocket_trust_stream(), AuthAction, RiskLevel, TrustEvaluationResult, TrustSignalPayload, ContinuousTrustEngine (+3 more)

### Community 15 - "UserRole"
Cohesion: 0.29
Nodes (13): admin_login(), public_credential(), Credential safe to serialise to any client., update_user(), user_login(), user_signup(), web3_login(), web3_signup() (+5 more)

### Community 16 - "post"
Cohesion: 0.17
Nodes (12): accept_terms(), admin_review_verification(), create_or_update_profile(), evaluate_trust(), execute_transfer(), freeze_card(), issue_credential(), pay_upi() (+4 more)

### Community 17 - "test_api.py"
Cohesion: 0.35
Nodes (10): mount_portals(), _admin_headers(), _customer_headers(), test_full_system_flow(), test_fullstack_container_serves_both_portals(), test_public_signup_cannot_escalate_role_or_use_demo_password_bypass(), test_sensitive_routes_require_authentication_and_role(), test_transaction_values_are_validated() (+2 more)

## Knowledge Gaps
- **59 isolated node(s):** `name`, `private`, `version`, `type`, `dev` (+54 more)
  These have ≤1 connection - possible missing edges or undocumented components.
- **1 thin communities (<3 nodes) omitted from report** — run `graphify query` to explore isolated nodes.

## Suggested Questions
_Questions this graph is uniquely positioned to answer:_

- **Why does `api()` connect `api` to `api.js`, `AdminApp.jsx`?**
  _High betweenness centrality (0.032) - this node is a cross-community bridge._
- **Why does `dependencies` connect `dependencies` to `package.json`?**
  _High betweenness centrality (0.010) - this node is a cross-community bridge._
- **What connects `name`, `private`, `version` to the rest of the system?**
  _59 weakly-connected nodes found - possible documentation gaps or missing edges._
- **Should `main.py` be split into smaller, more focused modules?**
  _Cohesion score 0.12807881773399016 - nodes in this community are weakly interconnected._
- **Should `api` be split into smaller, more focused modules?**
  _Cohesion score 0.0693815987933635 - nodes in this community are weakly interconnected._
- **Should `models.py` be split into smaller, more focused modules?**
  _Cohesion score 0.1140819964349376 - nodes in this community are weakly interconnected._
- **Should `package.json` be split into smaller, more focused modules?**
  _Cohesion score 0.1 - nodes in this community are weakly interconnected._