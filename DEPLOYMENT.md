# Nexus BlockBank full-stack deployment

One Docker service builds the customer portal, builds the admin portal, and runs the FastAPI API. The portals and API share one public domain, so no frontend API URL, proxy, or GitHub Pages configuration is required.

## Deploy on Render

1. Push `main` to GitHub.
2. In Render, select **New** then **Blueprint** and connect `Prashant44-cell/Nexus`.
3. Keep the branch as `main` and Blueprint path as `render.yaml`.
4. Enter values for `JWT_SECRET`, `ADMIN_PASSWORD`, and `DEMO_USER_PASSWORD` when prompted.
5. Choose **Deploy Blueprint**. The included configuration uses Render's `free` plan.
6. When the service is live, open its URL for the customer portal and append `/admin/` for the admin portal.
7. Confirm `<service-url>/health` returns `status: online`.

The service uses `PORT` from the host, serves the customer portal at `/`, serves the admin portal at `/admin/`, and exposes the existing API and WebSocket routes on the same origin.

## Required environment values

```text
APP_ENV=production
DEMO_MODE=true
PUBLIC_SIGNUP_ENABLED=false
WEB3_DEMO_AUTH_ENABLED=false
JWT_SECRET=<random value with at least 32 characters>
ADMIN_USERNAME=superadmin
ADMIN_PASSWORD=<strong password>
DEMO_USER_PASSWORD=<strong password>
```

The demo stores data in memory, so restart resets its data. No database configuration is required for the current design.

## Local full-stack check

```powershell
docker build -t nexus-blockbank .
docker run --rm -p 8000:8000 --env APP_ENV=production --env JWT_SECRET=<32-character-secret> --env ADMIN_PASSWORD=<admin-password> --env DEMO_MODE=true --env DEMO_USER_PASSWORD=<demo-password> nexus-blockbank
```

Then open `http://localhost:8000/`, `http://localhost:8000/admin/`, and `http://localhost:8000/health`.
