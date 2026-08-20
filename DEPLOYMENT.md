# Nexus BlockBank deployment gate

## Intended release level

This repository is ready for a public hackathon demonstration. It is not a production core-banking system: balances, credentials, audit events, and blockchain proofs are stored in process memory and reset whenever the backend restarts. The blockchain and benchmark data are simulated.

## Required backend settings

Copy `backend/.env.example` into the environment-variable settings of the backend host. Do not commit a populated `.env` file.

- `APP_ENV=production` disables auto-reload and activates strict configuration checks.
- `PUBLIC_SIGNUP_ENABLED=false` prevents new accounts from entering the shared demo dataset.
- `WEB3_DEMO_AUTH_ENABLED=false` disables the unsigned wallet-login simulation.
- `JWT_SECRET` must be a random value with at least 32 characters.
- `CORS_ORIGINS` must list the exact client and admin HTTPS origins.
- `ADMIN_PASSWORD` and, when `DEMO_MODE=true`, `DEMO_USER_PASSWORD` must be changed from local defaults.
- `PORT` may be supplied by the hosting platform.

Start the API from `backend` with:

```powershell
python -m pip install -r requirements.txt
python run.py
```

## Container deployment

The backend includes `backend/Dockerfile` and runs on any Docker-compatible Python host. Configure the backend service with these required environment values:

```text
APP_ENV=production
DEMO_MODE=true
PUBLIC_SIGNUP_ENABLED=false
WEB3_DEMO_AUTH_ENABLED=false
JWT_SECRET=<random value of at least 32 characters>
ADMIN_USERNAME=superadmin
ADMIN_PASSWORD=<strong password>
DEMO_USER_PASSWORD=<strong password>
CORS_ORIGINS=https://prashant44-cell.github.io
```

The host supplies `PORT`; use `/health` as its health-check path. After the host assigns an HTTPS backend URL, set that exact origin as the repository Actions variable `VITE_API_BASE_URL` and rerun the Pages workflow. The client derives its secure WebSocket URL automatically.

## Frontend settings

Set `VITE_API_BASE_URL` before building both portals. Set `VITE_WS_BASE_URL` for the client portal. The values must point to the public backend origin and use HTTPS/WSS.

Build each portal with:

```powershell
cd client-app
npm ci
npm run build

cd ..\admin-app
npm ci
npm run build
```

Publish each generated `dist` directory as a static site. If the API variables are left blank, the web host must proxy `/api` and `/ws` to the backend.

## GitHub Pages

The repository includes `.github/workflows/deploy-pages.yml`. It publishes:

- Customer portal: `https://prashant44-cell.github.io/Nexus/`
- Admin portal: `https://prashant44-cell.github.io/Nexus/admin/`

GitHub Pages hosts static files only. Deploy the FastAPI backend separately over HTTPS before enabling this workflow.

Repository setup:

1. Open **Settings → Pages** and choose **GitHub Actions** as the source.
2. Open **Settings → Secrets and variables → Actions → Variables**.
3. Add `VITE_API_BASE_URL` with the public HTTPS backend origin, without a trailing slash.
4. Optionally add `VITE_WS_BASE_URL` with the public WSS backend origin. When omitted, the client derives it from the API URL.
5. Add `https://prashant44-cell.github.io` to the backend `CORS_ORIGINS` value.
6. Push to `main` or run **Deploy portals to GitHub Pages** manually from the Actions tab.

The workflow builds the customer portal under `/Nexus/` and the admin portal under `/Nexus/admin/`, then uploads one Pages artifact. When `VITE_API_BASE_URL` is missing, the static interface still publishes but authentication and banking requests remain unavailable until the variable is configured.

The invalid `.agents/skills/claude-code-plugin` and `.agents/skills/ui-ux-pro-max-skill` Git entries have been removed from tracking. Local agent/plugin files are ignored and are not application dependencies.

## Release checks

Run from `backend`:

```powershell
python -m pip install -r requirements-dev.txt
python -m pytest -q
```

Then confirm:

1. `/health` returns `status: online`.
2. Anonymous banking and admin requests are rejected.
3. Customer login opens the trust stream over WSS.
4. Customer tokens cannot access validator or contract administration data.
5. Admin login can load governance data.
6. Restarting the backend is acceptable for the demo because all state resets.

## Before any real financial pilot

Replace the in-memory database with durable encrypted storage, connect real blockchain infrastructure, implement signed wallet-nonce verification, add rate limiting and account lockout, use a managed secret store, add immutable audit retention, and complete load, recovery, penetration, and compliance testing.
