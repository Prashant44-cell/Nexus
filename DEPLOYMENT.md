# Deploy Nexus BlockBank

This project deploys as one full-stack service. FastAPI serves the customer portal, the administrator portal, the API, and the WebSocket connection from one address.

## Before you begin

- The latest code must be on the `main` branch of [Prashant44-cell/Nexus](https://github.com/Prashant44-cell/Nexus).
- Have three private values ready: a token secret, an administrator password, and a demo customer password.
- Do not create GitHub Pages variables or a separate frontend service for this version.

## Create the service in Render

1. Open [Render Dashboard](https://dashboard.render.com/) and sign in with GitHub.
2. Click **New +** in the top-right corner.
3. Select **Blueprint**.
4. Find **Prashant44-cell / Nexus** and click **Connect**.
5. Keep **Branch** set to `main`.
6. Keep **Blueprint Path** set to `render.yaml`.
7. Confirm that Render shows one service named `nexus-blockbank`, with **Docker** as its runtime and **Free** as its plan.
8. Enter values for the requested fields:

   ```text
   JWT_SECRET=<new secret of 32 or more characters>
   ADMIN_PASSWORD=<your administrator password>
   DEMO_USER_PASSWORD=<your demo customer password>
   ```

9. Click **Deploy Blueprint**.
10. Wait until the service status changes to **Live**.

Render reads the root `Dockerfile`, builds both React portals, then starts FastAPI. Docker service configuration is defined in [`render.yaml`](render.yaml). [Render Docker guide](https://render.com/docs/docker)

## Open the deployed application

Render provides a URL similar to:

```text
https://nexus-blockbank.onrender.com
```

Use the same address for every part of the project:

| Open this path | It shows |
|---|---|
| `/` | Customer portal |
| `/admin/` | Administrator portal |
| `/health` | Health response |
| `/docs` | FastAPI API documentation |

For example:

```text
https://nexus-blockbank.onrender.com/
https://nexus-blockbank.onrender.com/admin/
https://nexus-blockbank.onrender.com/health
```

## Verify after deployment

1. Open `/health` and confirm it reports `"status":"online"`.
2. Open `/` and confirm the customer design loads.
3. Open `/admin/` and confirm the administrator design loads.
4. Sign in as `aarav_sharma` using the password entered for `DEMO_USER_PASSWORD`.
5. Sign in as `superadmin` using the password entered for `ADMIN_PASSWORD`.
6. Test one customer dashboard action and one administrator dashboard action.

## Update a live deployment

1. Commit and push changes to `main`.
2. Render detects the change because `autoDeploy` is enabled in `render.yaml`.
3. Wait for the new Render deployment to become **Live**.
4. Refresh the same public URL.

## Local one-service verification

Use Docker Desktop from the repository root:

```powershell
docker build -t nexus-blockbank .
docker run --rm -p 8000:8000 --env APP_ENV=production --env DEMO_MODE=true --env JWT_SECRET=<32-character-secret> --env ADMIN_PASSWORD=<admin-password> --env DEMO_USER_PASSWORD=<demo-password> nexus-blockbank
```

Then open `http://localhost:8000/`, `http://localhost:8000/admin/`, and `http://localhost:8000/health`.

## Demo behavior

The deployed version has no database. Data exists only while the service is running, and it resets after a restart. The free service can sleep after inactivity; opening the URL wakes it again.
