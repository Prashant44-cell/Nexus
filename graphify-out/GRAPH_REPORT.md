# Graph Report - Prasunethon 2.0 (same as  fintech + blockchain)  (2026-08-23)

## Corpus Check
- 64 files · ~37,929 words
- Verdict: corpus is large enough that graph structure adds value.

## Summary
- 361 nodes · 777 edges · 28 communities (26 shown, 2 thin omitted)
- Extraction: 94% EXTRACTED · 6% INFERRED · 0% AMBIGUOUS · INFERRED: 44 edges (avg confidence: 0.94)
- Token cost: 0 input · 0 output

## Graph Freshness
- Built from commit: `4d4894b6`
- Run `git rev-parse HEAD` and compare to check if the graph is stale.
- Run `graphify update .` after code changes (no API cost).

## Community Hubs (Navigation)
- main.py
- api
- fmtTime
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
- vercel.json
- LumenHero.tsx
- api.js
- CredentialManagement.jsx
- LoansDepositsPanel.jsx
- AdminVerificationReview.jsx

## God Nodes (most connected - your core abstractions)
1. `api()` - 43 edges
2. `fmtTime()` - 17 edges
3. `UserRole` - 15 edges
4. `scoreColor()` - 13 edges
5. `useOverview()` - 12 edges
6. `public_credential()` - 11 edges
7. `Nexus BlockBank — AI-Resistant Continuous Identity & Digital Banking Platform` - 11 edges
8. `RiskLevel` - 10 edges
9. `AuthAction` - 9 edges
10. `create_access_token()` - 9 edges

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

## Communities (28 total, 2 thin omitted)

### Community 0 - "main.py"
Cohesion: 0.13
Nodes (28): admin_get_verifications(), delete_user(), get_accounts(), get_admin_risk_summary(), get_banking_overview(), get_beneficiaries(), get_bills(), get_blockchain_nodes() (+20 more)

### Community 1 - "api"
Cohesion: 0.10
Nodes (23): api(), BankingAdminDashboard(), CredentialManagement(), BackgroundVideo(), AccountsPanel(), inputStyle, BankingDashboard(), CardsPanel() (+15 more)

### Community 2 - "fmtTime"
Cohesion: 0.21
Nodes (22): downloadCSV(), fmtTime(), riskClass(), scoreColor(), useOverview(), LiveSessions(), SuperAdminDashboard(), analyse() (+14 more)

### Community 3 - "models.py"
Cohesion: 0.11
Nodes (33): AccountAsset, AdminReviewRequest, AuthStartRequest, BeneficiaryAsset, BillPaymentAsset, BlockchainBankingAssetMetadata, CardAsset, CardFreezeRequest (+25 more)

### Community 4 - "package.json"
Cohesion: 0.10
Nodes (20): devDependencies, @types/react, @types/react-dom, vite, @vitejs/plugin-react, name, private, scripts (+12 more)

### Community 5 - "Nexus BlockBank — AI-Resistant Continuous Identity & Digital Banking Platform"
Cohesion: 0.10
Nodes (20): 🛡️ 14-Clause Cryptographic Rules & Regulations System, 1. Run Backend Automated Tests, 2. Test Production Frontend Builds, 🏛️ Architecture Overview, 🔑 Demo Login Credentials, 🔧 Environment Configuration, 🚀 Execution Process (Step-by-Step), ✨ LŪMEN // ÍNDEX — Sovereign DeFi & Private Banking Experience (+12 more)

### Community 6 - "dependencies"
Cohesion: 0.10
Nodes (21): autoprefixer, class-variance-authority, clsx, framer-motion, dependencies, autoprefixer, class-variance-authority, clsx (+13 more)

### Community 7 - "security.py"
Cohesion: 0.12
Nodes (13): Any, BlockchainProofLayer, generate_blockchain_metadata(), InMemoryDatabase, apply_loan(), create_deposit(), hash_password(), decode_access_token() (+5 more)

### Community 13 - "AdminApp.jsx"
Cohesion: 0.13
Nodes (13): AdminApp(), useRiskSummary(), AdminNavbar(), AdminSidebar(), SECTIONS, AMLCompliancePanel(), cardStyle, AuditCompliance() (+5 more)

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

### Community 19 - "LumenHero.tsx"
Cohesion: 0.22
Nodes (3): ConnectorLineProps, LumenHeroProps, NavItemProps

### Community 23 - "api.js"
Cohesion: 0.20
Nodes (8): configuredApiBase, getWebSocketUrl(), setToken(), ClientApp(), AdminLogin(), fieldStyle, AuthModal(), fieldStyle

### Community 24 - "CredentialManagement.jsx"
Cohesion: 0.42
Nodes (5): STATUS_CLASS, ErrorNote(), PanelHeader(), StatGrid(), Table()

### Community 25 - "LoansDepositsPanel.jsx"
Cohesion: 0.22
Nodes (8): cancelBtn, cardStyle, inputStyle, labelStyle, metaBtn, modalBox, modalOverlay, submitBtn

### Community 27 - "AdminVerificationReview.jsx"
Cohesion: 0.40
Nodes (4): AdminVerificationReview(), detailRowStyle, labelStyle, valueStyle

## Knowledge Gaps
- **68 isolated node(s):** `name`, `private`, `version`, `type`, `dev` (+63 more)
  These have ≤1 connection - possible missing edges or undocumented components.
- **2 thin communities (<3 nodes) omitted from report** — run `graphify query` to explore isolated nodes.

## Suggested Questions
_Questions this graph is uniquely positioned to answer:_

- **Why does `api()` connect `api` to `fmtTime`, `AdminApp.jsx`, `api.js`, `CredentialManagement.jsx`, `LoansDepositsPanel.jsx`, `AdminVerificationReview.jsx`?**
  _High betweenness centrality (0.028) - this node is a cross-community bridge._
- **Why does `dependencies` connect `dependencies` to `package.json`?**
  _High betweenness centrality (0.009) - this node is a cross-community bridge._
- **What connects `name`, `private`, `version` to the rest of the system?**
  _68 weakly-connected nodes found - possible documentation gaps or missing edges._
- **Should `main.py` be split into smaller, more focused modules?**
  _Cohesion score 0.12807881773399016 - nodes in this community are weakly interconnected._
- **Should `api` be split into smaller, more focused modules?**
  _Cohesion score 0.10241820768136557 - nodes in this community are weakly interconnected._
- **Should `models.py` be split into smaller, more focused modules?**
  _Cohesion score 0.1140819964349376 - nodes in this community are weakly interconnected._
- **Should `package.json` be split into smaller, more focused modules?**
  _Cohesion score 0.09523809523809523 - nodes in this community are weakly interconnected._