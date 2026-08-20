# Graph Report - Prasunethon 2.0 (same as  fintech + blockchain)  (2026-08-20)

## Corpus Check
- cluster-only mode — file stats not available

## Summary
- 337 nodes · 756 edges · 12 communities
- Extraction: 94% EXTRACTED · 6% INFERRED · 0% AMBIGUOUS · INFERRED: 42 edges (avg confidence: 0.94)
- Token cost: 0 input · 0 output

## Graph Freshness
- Built from commit: `70f7f8db`
- Run `git rev-parse HEAD` and compare to check if the graph is stale.
- Run `graphify update .` after code changes (no API cost).

## Community Hubs (Navigation)
- Community 0
- Community 1
- Community 2
- Community 3
- Community 4
- Community 5
- Community 6
- Community 7

## God Nodes (most connected - your core abstractions)
1. `api()` - 30 edges
2. `UserRole` - 15 edges
3. `api()` - 14 edges
4. `useOverview()` - 12 edges
5. `public_credential()` - 11 edges
6. `RiskLevel` - 10 edges
7. `AuthAction` - 9 edges
8. `create_access_token()` - 9 edges
9. `fmtTime()` - 9 edges
10. `fmtTime()` - 9 edges

## Surprising Connections (you probably didn't know these)
- `auth_start()` --uses--> `UserRole`  [INFERRED]
  backend/app/main.py → backend/app/models.py
- `admin_review_verification()` --uses--> `AdminReviewRequest`  [INFERRED]
  backend/app/main.py → backend/app/models.py
- `freeze_card()` --uses--> `CardFreezeRequest`  [INFERRED]
  backend/app/main.py → backend/app/models.py
- `issue_credential()` --uses--> `CredentialIssueRequest`  [INFERRED]
  backend/app/main.py → backend/app/models.py
- `create_deposit()` --uses--> `DepositCreationRequest`  [INFERRED]
  backend/app/main.py → backend/app/models.py

## Import Cycles
- None detected.

## Communities (12 total, 0 thin omitted)

### Community 0 - "Backend Core & Banking"
Cohesion: 0.06
Nodes (65): Any, BlockchainProofLayer, generate_blockchain_metadata(), InMemoryDatabase, accept_terms(), admin_get_verifications(), admin_login(), admin_review_verification() (+57 more)

### Community 1 - "Client Banking Portal"
Cohesion: 0.07
Nodes (37): api(), getWebSocketUrl(), setToken(), App(), AuthModal(), fieldStyle, BackgroundVideo(), AccountsPanel() (+29 more)

### Community 2 - "Admin Governance Portal"
Cohesion: 0.10
Nodes (34): api(), configuredApiBase, fmtTime(), riskClass(), scoreColor(), setToken(), useRiskSummary(), App() (+26 more)

### Community 3 - "Trust & Session Models"
Cohesion: 0.08
Nodes (45): auth_start(), step_up_verification(), websocket_trust_stream(), AccountAsset, AdminReviewRequest, AuthAction, AuthStartRequest, BeneficiaryAsset (+37 more)

### Community 4 - "Frontend Build Tooling"
Cohesion: 0.06
Nodes (31): devDependencies, @types/react, @types/react-dom, vite, @vitejs/plugin-react, @types/react, @types/react-dom, vite (+23 more)

### Community 5 - "Shared Analytics UI"
Cohesion: 0.24
Nodes (20): configuredApiBase, downloadCSV(), fmtTime(), riskClass(), scoreColor(), useOverview(), analyse(), AnalyticsPanel() (+12 more)

### Community 6 - "Runtime Dependencies"
Cohesion: 0.08
Nodes (26): dependencies, lucide-react, react, react-dom, lucide-react, react, react-dom, autoprefixer (+18 more)

### Community 7 - "Release Test Suite"
Cohesion: 0.52
Nodes (6): _admin_headers(), _customer_headers(), test_full_system_flow(), test_public_signup_cannot_escalate_role_or_use_demo_password_bypass(), test_sensitive_routes_require_authentication_and_role(), test_transaction_values_are_validated()

## Knowledge Gaps
- **49 isolated node(s):** `fieldStyle`, `inputStyle`, `cancelBtn`, `cardStyle`, `inputStyle` (+44 more)
  These have ≤1 connection - possible missing edges or undocumented components.

## Suggested Questions
_Questions this graph is uniquely positioned to answer:_

- **Why does `dependencies` connect `Runtime Dependencies` to `Frontend Build Tooling`?**
  _High betweenness centrality (0.017) - this node is a cross-community bridge._
- **Why does `api()` connect `Client Banking Portal` to `Shared Analytics UI`?**
  _High betweenness centrality (0.011) - this node is a cross-community bridge._
- **Are the 9 inferred relationships involving `UserRole` (e.g. with `InMemoryDatabase` and `admin_login()`) actually correct?**
  _`UserRole` has 9 INFERRED edges - model-reasoned connections that need verification._
- **What connects `fieldStyle`, `inputStyle`, `cancelBtn` to the rest of the system?**
  _49 weakly-connected nodes found - possible documentation gaps or missing edges._
- **Should `Backend Core & Banking` be split into smaller, more focused modules?**
  _Cohesion score 0.05569620253164557 - nodes in this community are weakly interconnected._
- **Should `Client Banking Portal` be split into smaller, more focused modules?**
  _Cohesion score 0.06641604010025062 - nodes in this community are weakly interconnected._
- **Should `Admin Governance Portal` be split into smaller, more focused modules?**
  _Cohesion score 0.09502262443438914 - nodes in this community are weakly interconnected._
