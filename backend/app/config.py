import os


def _as_bool(name: str, default: bool) -> bool:
    value = os.getenv(name)
    if value is None:
        return default
    return value.strip().lower() in {"1", "true", "yes", "on"}


APP_ENV = os.getenv("APP_ENV", "development").strip().lower()
IS_PRODUCTION = APP_ENV in {"production", "prod"}
DEMO_MODE = _as_bool("DEMO_MODE", not IS_PRODUCTION)
PUBLIC_SIGNUP_ENABLED = _as_bool("PUBLIC_SIGNUP_ENABLED", True)
WEB3_DEMO_AUTH_ENABLED = _as_bool("WEB3_DEMO_AUTH_ENABLED", DEMO_MODE and not IS_PRODUCTION)

JWT_SECRET = os.getenv("JWT_SECRET", "")
if not JWT_SECRET:
    if IS_PRODUCTION:
        raise RuntimeError("JWT_SECRET must be set in production.")
    JWT_SECRET = "nexus-local-development-secret-change-before-deploy"

if len(JWT_SECRET) < 32:
    raise RuntimeError("JWT_SECRET must contain at least 32 characters.")

TOKEN_TTL_MINUTES = int(os.getenv("TOKEN_TTL_MINUTES", "60"))

_origins = os.getenv("CORS_ORIGINS", "http://localhost:3000,http://localhost:3001")
CORS_ORIGINS = [origin.strip().rstrip("/") for origin in _origins.split(",") if origin.strip()]
if IS_PRODUCTION and (not CORS_ORIGINS or "*" in CORS_ORIGINS):
    raise RuntimeError("CORS_ORIGINS must list explicit frontend origins in production.")

ADMIN_USERNAME = os.getenv("ADMIN_USERNAME", "superadmin")
ADMIN_PASSWORD = os.getenv("ADMIN_PASSWORD", "SuperAdmin@2026" if not IS_PRODUCTION else "")
if IS_PRODUCTION and not ADMIN_PASSWORD:
    raise RuntimeError("ADMIN_PASSWORD must be set in production.")

DEMO_USER_PASSWORD = os.getenv("DEMO_USER_PASSWORD", "password123" if not IS_PRODUCTION else "")
if IS_PRODUCTION and DEMO_MODE and not DEMO_USER_PASSWORD:
    raise RuntimeError("DEMO_USER_PASSWORD must be set when DEMO_MODE is enabled in production.")
