# Graph Report - Prasunethon 2.0 (same as  fintech + blockchain)  (2026-08-22)

## Corpus Check
- 59 files · ~30,150 words
- Verdict: corpus is large enough that graph structure adds value.

## Summary
- 333 nodes · 753 edges · 13 communities (12 shown, 1 thin omitted)
- Extraction: 94% EXTRACTED · 6% INFERRED · 0% AMBIGUOUS · INFERRED: 44 edges (avg confidence: 0.94)
- Token cost: 0 input · 0 output

## Graph Freshness
- Built from commit: `cae11c83`
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
- `user_signup()` --uses--> `UserSignupRequest`  [INFERRED]
  backend/app/main.py → backend/app/models.py
- `web3_signup()` --uses--> `Web3SignupRequest`  [INFERRED]
  backend/app/main.py → backend/app/models.py
- `web3_login()` --uses--> `Web3LoginRequest`  [INFERRED]
  backend/app/main.py → backend/app/models.py
- `accept_terms()` --uses--> `TermsConsentRequest`  [INFERRED]
  backend/app/main.py → backend/app/models.py
- `issue_credential()` --uses--> `CredentialIssueRequest`  [INFERRED]
  backend/app/main.py → backend/app/models.py

## Import Cycles
- None detected.

## Communities (13 total, 1 thin omitted)

### Community 0 - "main.py"
Cohesion: 0.06
Nodes (65): BlockchainProofLayer, generate_blockchain_metadata(), InMemoryDatabase, accept_terms(), admin_get_verifications(), admin_login(), admin_review_verification(), apply_loan() (+57 more)

### Community 1 - "api"
Cohesion: 0.05
Nodes (44): api(), getWebSocketUrl(), setToken(), ClientApp(), AdminLogin(), fieldStyle, AdminVerificationReview(), detailRowStyle (+36 more)

### Community 2 - "api.js"
Cohesion: 0.09
Nodes (38): AdminApp(), configuredApiBase, downloadCSV(), fmtTime(), riskClass(), scoreColor(), useOverview(), useRiskSummary() (+30 more)

### Community 3 - "models.py"
Cohesion: 0.09
Nodes (38): websocket_trust_stream(), AccountAsset, AdminReviewRequest, AuthStartRequest, BeneficiaryAsset, BillPaymentAsset, BlockchainBankingAssetMetadata, CardAsset (+30 more)

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
Cohesion: 0.16
Nodes (17): Any, mount_portals(), decode_access_token(), get_current_user(), get_user_from_token(), require_admin_role(), require_customer_role(), _admin_headers() (+9 more)

## Knowledge Gaps
- **59 isolated node(s):** `name`, `private`, `version`, `type`, `dev` (+54 more)
  These have ≤1 connection - possible missing edges or undocumented components.
- **1 thin communities (<3 nodes) omitted from report** — run `graphify query` to explore isolated nodes.

## Suggested Questions
_Questions this graph is uniquely positioned to answer:_

- **Why does `api()` connect `api` to `api.js`?**
  _High betweenness centrality (0.032) - this node is a cross-community bridge._
- **Why does `dependencies` connect `dependencies` to `package.json`?**
  _High betweenness centrality (0.011) - this node is a cross-community bridge._
- **What connects `name`, `private`, `version` to the rest of the system?**
  _59 weakly-connected nodes found - possible documentation gaps or missing edges._
- **Should `main.py` be split into smaller, more focused modules?**
  _Cohesion score 0.05964912280701754 - nodes in this community are weakly interconnected._
- **Should `api` be split into smaller, more focused modules?**
  _Cohesion score 0.05472636815920398 - nodes in this community are weakly interconnected._
- **Should `api.js` be split into smaller, more focused modules?**
  _Cohesion score 0.09453551912568306 - nodes in this community are weakly interconnected._
- **Should `models.py` be split into smaller, more focused modules?**
  _Cohesion score 0.09291521486643438 - nodes in this community are weakly interconnected._