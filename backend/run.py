import uvicorn
import os
import sys

from app.config import IS_PRODUCTION

# Ensure backend directory is in sys.path
sys.path.insert(0, os.path.dirname(os.path.abspath(__file__)))

if __name__ == "__main__":
    host = os.getenv("HOST", "0.0.0.0" if IS_PRODUCTION else "127.0.0.1")
    port = int(os.getenv("PORT", "8000"))
    mode = "production" if IS_PRODUCTION else "development"
    print(f"Starting Nexus BlockBank API on {host}:{port} ({mode})")
    uvicorn.run("app.main:app", host=host, port=port, reload=not IS_PRODUCTION)
