@echo off
echo ======================================================================
echo    NEXUS BLOCKBANK - DIGITAL BANKING AND IDENTITY PLATFORM
echo ======================================================================
echo  1. Starting FastAPI service on http://localhost:8000 ...
echo  2. Starting customer portal on http://localhost:3000 ...
echo  3. Starting administrator portal on http://localhost:3001 ...
echo ======================================================================

start "Nexus API (Port 8000)" cmd /k "cd backend && python run.py"
start "Nexus Customer Portal (Port 3000)" cmd /k "cd client-app && npm run dev"
start "Nexus Admin Portal (Port 3001)" cmd /k "cd admin-app && npm run dev"

echo Launch completed. Open http://localhost:3000 for the customer portal and http://localhost:3001 for the administrator portal.
