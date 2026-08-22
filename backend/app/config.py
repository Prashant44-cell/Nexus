import os


def _as_bool(name: str, default: bool) -> bool:
    value = os.getenv(name)
    if value is None:
        return default
    return value.strip().lower() in {"1", "true", "yes", "on"}


APP_ENV = os.getenv("APP_ENV", "development").strip().lower()
IS_PRODUCTION = APP_ENV in {"production", "prod"}
DEMO_MODE = _as_bool("DEMO_MODE", True)
PUBLIC_SIGNUP_ENABLED = _as_bool("PUBLIC_SIGNUP_ENABLED", True)
WEB3_DEMO_AUTH_ENABLED = _as_bool("WEB3_DEMO_AUTH_ENABLED", True)

JWT_SECRET = os.getenv("JWT_SECRET", "nexus-super-secret-key-32-chars-minimum-prod-2026")
if len(JWT_SECRET) < 32:
    JWT_SECRET = JWT_SECRET.ljust(32, "_")

TOKEN_TTL_MINUTES = int(os.getenv("TOKEN_TTL_MINUTES", "60"))

_origins = os.getenv("CORS_ORIGINS", "*")
CORS_ORIGINS = [origin.strip().rstrip("/") for origin in _origins.split(",") if origin.strip()]
if not CORS_ORIGINS:
    CORS_ORIGINS = ["*"]

ADMIN_USERNAME = os.getenv("ADMIN_USERNAME", "superadmin")
ADMIN_PASSWORD = os.getenv("ADMIN_PASSWORD", "SuperAdmin@2026")

DEMO_USER_PASSWORD = os.getenv("DEMO_USER_PASSWORD", "password123")
