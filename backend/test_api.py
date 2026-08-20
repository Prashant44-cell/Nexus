from fastapi.testclient import TestClient

from app.config import ADMIN_PASSWORD, ADMIN_USERNAME, DEMO_MODE, DEMO_USER_PASSWORD
from app.main import app


client = TestClient(app)


def _customer_headers() -> dict:
    assert DEMO_MODE, "The integration suite requires DEMO_MODE=true."
    response = client.post(
        "/auth/user-login",
        json={"username": "aarav_sharma", "password": DEMO_USER_PASSWORD},
    )
    assert response.status_code == 200, response.text
    return {"Authorization": f"Bearer {response.json()['id_token']}"}


def _admin_headers() -> dict:
    response = client.post(
        "/auth/admin-login",
        json={"username": ADMIN_USERNAME, "password": ADMIN_PASSWORD},
    )
    assert response.status_code == 200, response.text
    return {"Authorization": f"Bearer {response.json()['id_token']}"}


def test_full_system_flow():
    health = client.get("/health")
    assert health.status_code == 200

    customer_headers = _customer_headers()
    overview = client.get("/api/banking/overview", headers=customer_headers)
    assert overview.status_code == 200, overview.text
    assert overview.json()["status"] == "success"

    session = client.post(
        "/auth/start",
        headers=customer_headers,
        json={
            "user_id": "stu001",
            "device_id": "RELEASE-TEST-CLIENT",
            "ip_address": "127.0.0.1",
            "user_agent": "Nexus release test",
        },
    )
    assert session.status_code == 200, session.text
    session_data = session.json()
    with client.websocket_connect(
        f"/ws/trust/{session_data['session_id']}?ticket={session_data['websocket_ticket']}"
    ) as websocket:
        websocket.send_json({"behavior_sig": 0.95, "device_sig": 0.98, "context_sig": 0.94})
        trust_result = websocket.receive_json()
        assert trust_result["recommended_action"] == "allow"

    accounts_response = client.get("/api/banking/accounts", headers=customer_headers)
    assert accounts_response.status_code == 200, accounts_response.text
    accounts = accounts_response.json()["accounts"]
    assert accounts

    transfer = client.post(
        "/api/banking/transfer",
        headers=customer_headers,
        json={
            "sender_account": "ACC-NEX-884920",
            "receiver_account": "ACC-HDFC-302910",
            "amount": 2500.0,
            "currency": "INR",
            "description": "Test Transfer",
        },
    )
    assert transfer.status_code == 200, transfer.text
    assert "blockchain_tx_hash" in transfer.json()

    upi = client.post(
        "/api/banking/upi/pay",
        headers=customer_headers,
        json={"vpa": "merchant@nexusbank", "amount": 500.0, "note": "Unit Test UPI"},
    )
    assert upi.status_code == 200, upi.text
    assert "blockchain_tx_hash" in upi.json()

    object_id = accounts[0]["metadata"]["object_id"]
    metadata = client.get(f"/api/banking/metadata/{object_id}", headers=customer_headers)
    assert metadata.status_code == 200, metadata.text
    assert metadata.json()["metadata"]["object_name"] == accounts[0]["metadata"]["object_name"]

    admin_headers = _admin_headers()
    nodes = client.get("/api/blockchain/nodes", headers=admin_headers)
    assert nodes.status_code == 200, nodes.text
    assert nodes.json()["active_validators"]

    risk_summary = client.get("/admin/risk-summary", headers=admin_headers)
    assert risk_summary.status_code == 200, risk_summary.text
    assert all("websocket_ticket_hash" not in item for item in risk_summary.json()["sessions"])


def test_sensitive_routes_require_authentication_and_role():
    assert client.get("/api/banking/accounts").status_code in {401, 403}
    assert client.post(
        "/api/banking/transfer",
        json={
            "sender_account": "ACC-NEX-884920",
            "receiver_account": "ACC-HDFC-302910",
            "amount": 1.0,
        },
    ).status_code in {401, 403}

    customer_headers = _customer_headers()
    assert client.get("/api/blockchain/nodes", headers=customer_headers).status_code == 403


def test_transaction_values_are_validated():
    response = client.post(
        "/api/banking/transfer",
        headers=_customer_headers(),
        json={
            "sender_account": "ACC-NEX-884920",
            "receiver_account": "ACC-HDFC-302910",
            "amount": -100.0,
        },
    )
    assert response.status_code == 422


def test_public_signup_cannot_escalate_role_or_use_demo_password_bypass():
    username = "release_test_user"
    signup = client.post(
        "/auth/user-signup",
        json={
            "username": username,
            "password": "A-unique-release-password-2026",
            "full_name": "Release Test User",
            "email": "release-test@nexusbank.example",
            "user_role": "admin",
        },
    )
    assert signup.status_code == 200, signup.text
    assert signup.json()["credential"]["user_role"] == "customer"

    bypass = client.post(
        "/auth/user-login",
        json={"username": username, "password": "password123"},
    )
    assert bypass.status_code == 401

    revoke = client.post(
        "/credential/revoke",
        headers=_admin_headers(),
        json={
            "credential_id": signup.json()["credential"]["credential_id"],
            "reason": "Release test revocation",
            "admin_id": "admin001",
        },
    )
    assert revoke.status_code == 200, revoke.text

    revoked_headers = {"Authorization": f"Bearer {signup.json()['id_token']}"}
    assert client.get("/api/banking/accounts", headers=revoked_headers).status_code == 401
