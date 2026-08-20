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
