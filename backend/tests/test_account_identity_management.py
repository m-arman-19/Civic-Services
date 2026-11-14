import pytest
import datetime
from httpx import AsyncClient

@pytest.mark.asyncio
async def test_account_and_identity_management_suite(client: AsyncClient):
    # -------------------------------------------------------------
    # 0. Setup: Logins
    # -------------------------------------------------------------
    # System Admin
    admin_login = await client.post("/api/auth/login", json={
        "phone_or_email": "admin@nagoriksathi.gov.bd",
        "password": "AdminPass1234!"
    })
    assert admin_login.status_code == 200
    admin_token = admin_login.json()["access_token"]
    admin_headers = {"Authorization": f"Bearer {admin_token}"}

    # City Governance Head
    gov_login = await client.post("/api/auth/login", json={
        "phone_or_email": "governance@nagoriksathi.gov.bd",
        "password": "GovPass1234!"
    })
    assert gov_login.status_code == 200
    gov_token = gov_login.json()["access_token"]
    gov_headers = {"Authorization": f"Bearer {gov_token}"}

    # Citizen User
    citizen_login = await client.post("/api/auth/login", json={
        "phone_or_email": "01711000001",
        "password": "Pass1234!"
    })
    assert citizen_login.status_code == 200
    citizen_token = citizen_login.json()["access_token"]
    citizen_headers = {"Authorization": f"Bearer {citizen_token}"}

    # -------------------------------------------------------------
    # Req 1: Authorized administrator can create permitted new member account
    # -------------------------------------------------------------
    unique_suffix = int(datetime.datetime.now().timestamp())
    new_user_payload = {
        "full_name": f"অফিসার টেস্ট {unique_suffix}",
        "email": f"officer_{unique_suffix}@nagoriksathi.gov.bd",
        "phone": f"017{unique_suffix % 100000000:08d}",
        "role": "ward_desk",
        "account_status": "active",
        "require_password_change": True
    }
    create_res = await client.post("/api/admin/users", json=new_user_payload, headers=admin_headers)
    assert create_res.status_code == 200, create_res.text
    created_user = create_res.json()
    assert created_user["full_name"] == new_user_payload["full_name"]
    assert created_user["role"] == "ward_desk"
    assert created_user["must_change_password"] is True
    # Temporary password must be returned once in the creation response
    temp_password = created_user.get("temporary_password")
    assert temp_password is not None
    assert len(temp_password) >= 12
    created_user_id = created_user["id"]

    # -------------------------------------------------------------
    # Req 2: Duplicate usernames or login identifiers are rejected
    # -------------------------------------------------------------
    duplicate_res = await client.post("/api/admin/users", json=new_user_payload, headers=admin_headers)
    assert duplicate_res.status_code == 400
    assert "নিবন্ধিত" in duplicate_res.json()["detail"] or "ইতিমধ্যে" in duplicate_res.json()["detail"]

    # -------------------------------------------------------------
    # Req 3: Invalid role assignments are rejected
    # -------------------------------------------------------------
    invalid_role_payload = {
        "full_name": "অবৈধ রোল কর্মী",
        "email": f"invalid_role_{unique_suffix}@domain.com",
        "role": "super_god_mode"
    }
    invalid_role_res = await client.post("/api/admin/users", json=invalid_role_payload, headers=admin_headers)
    assert invalid_role_res.status_code in (400, 422)

    # -------------------------------------------------------------
    # Req 4: Unauthorized users cannot create, edit, suspend or reset accounts
    # -------------------------------------------------------------
    unauth_create = await client.post("/api/admin/users", json={
        "full_name": "অননুমোদিত চেষ্টা",
        "email": f"hacker_{unique_suffix}@domain.com",
        "role": "admin"
    }, headers=citizen_headers)
    assert unauth_create.status_code in (401, 403)

    unauth_reset = await client.post(f"/api/admin/users/{created_user_id}/reset-password", json={}, headers=citizen_headers)
    assert unauth_reset.status_code in (401, 403)

    unauth_status = await client.put(f"/api/admin/users/{created_user_id}/status", json={
        "account_status": "suspended"
    }, headers=citizen_headers)
    assert unauth_status.status_code in (401, 403)

    # -------------------------------------------------------------
    # Req 5 & 6: Login identifiers changed through authorized process with append-only history
    # -------------------------------------------------------------
    new_email = f"updated_officer_{unique_suffix}@nagoriksathi.gov.bd"
    id_change_res = await client.post(f"/api/admin/users/{created_user_id}/change-identifier", json={
        "identifier_type": "email",
        "new_identifier": new_email,
        "reason": "অফিসিয়াল ডোমেন স্থানান্তর"
    }, headers=admin_headers)
    assert id_change_res.status_code == 200
    assert id_change_res.json()["new_identifier"] == new_email

    # Check append-only identifier history
    hist_res = await client.get(f"/api/admin/users/{created_user_id}/identifier-history", headers=admin_headers)
    assert hist_res.status_code == 200
    hist_records = hist_res.json()
    assert len(hist_records) >= 1
    assert hist_records[0]["old_identifier"] == new_user_payload["email"]
    assert hist_records[0]["new_identifier"] == new_email
    assert hist_records[0]["reason"] == "অফিসিয়াল ডোমেন স্থানান্তর"

    # -------------------------------------------------------------
    # Req 7, 8, 9, 10, 11: Secure Password Reset & Temporary Credentials Handling
    # -------------------------------------------------------------
    reset_res = await client.post(f"/api/admin/users/{created_user_id}/reset-password", json={
        "require_change_at_next_login": True,
        "revoke_existing_sessions": True,
        "reason": "সিকিউরিটি অডিট অনুমোদন অনুযায়ী"
    }, headers=admin_headers)
    assert reset_res.status_code == 200
    reset_data = reset_res.json()
    new_temp_pw = reset_data["temporary_password"]
    assert len(new_temp_pw) >= 12
    # Verify no plaintext secrets or hashes leaked
    assert "password_hash" not in reset_data
    assert "old_password" not in reset_data
    assert reset_data["must_change_password"] is True

    # Login with the temporary password (after short monotonic gap)
    import asyncio
    await asyncio.sleep(0.02)
    temp_login = await client.post("/api/auth/login", json={
        "phone_or_email": new_email,
        "password": new_temp_pw
    })
    assert temp_login.status_code == 200
    temp_auth_data = temp_login.json()
    assert temp_auth_data["must_change_password"] is True
    temp_token = temp_auth_data["access_token"]
    temp_headers = {"Authorization": f"Bearer {temp_token}"}

    # Change password to new permanent password
    new_perm_pw = "PermPass9876#Secure"
    chg_res = await client.post("/api/auth/change-password", json={
        "old_password": new_temp_pw,
        "new_password": new_perm_pw
    }, headers=temp_headers)
    assert chg_res.status_code == 200

    # Login with new permanent password succeeds, must_change_password is now False
    await asyncio.sleep(0.02)
    perm_login = await client.post("/api/auth/login", json={
        "phone_or_email": new_email,
        "password": new_perm_pw
    })
    assert perm_login.status_code == 200
    assert perm_login.json()["must_change_password"] is False
    perm_token = perm_login.json()["access_token"]

    # -------------------------------------------------------------
    # Req 12: Session Revocation Works After Reset / Revoke
    # -------------------------------------------------------------
    perm_headers = {"Authorization": f"Bearer {perm_token}"}
    # User can access their profile
    prof_before = await client.get("/api/auth/me", headers=perm_headers)
    assert prof_before.status_code == 200

    # Admin revokes user sessions
    await asyncio.sleep(0.02)
    revoke_res = await client.post(f"/api/admin/users/{created_user_id}/revoke-sessions", headers=admin_headers)
    assert revoke_res.status_code == 200

    # Previous session token must now be rejected
    prof_after = await client.get("/api/auth/me", headers=perm_headers)
    assert prof_after.status_code == 401

    # -------------------------------------------------------------
    # Req 13: Failed authentication lockout tracking & audit
    # -------------------------------------------------------------
    # Intentionally trigger 5 failed login attempts
    for _ in range(5):
        await client.post("/api/auth/login", json={
            "phone_or_email": new_email,
            "password": "WrongPasswordAttempt!"
        })

    # The 6th attempt should return 403 or 423 (Locked)
    locked_attempt = await client.post("/api/auth/login", json={
        "phone_or_email": new_email,
        "password": new_perm_pw
    })
    assert locked_attempt.status_code in (403, 423)
    assert "লক" in locked_attempt.json()["detail"]

    # -------------------------------------------------------------
    # Req 14: System Admin cannot unilaterally assign City Governance Head
    # -------------------------------------------------------------
    unilateral_gov_create = await client.post("/api/admin/users", json={
        "full_name": f"অননুমোদিত গভর্নেন্স {unique_suffix}",
        "email": f"unauth_gov_{unique_suffix}@domain.com",
        "role": "governance_head"
    }, headers=admin_headers)
    assert unilateral_gov_create.status_code == 403
    assert "অনুমোদন" in unilateral_gov_create.json()["detail"]

    # Submit privileged role request via dual authority workflow
    priv_req_res = await client.post("/api/admin/privileged-role-requests", json={
        "target_user_id": created_user_id,
        "requested_role": "governance_head",
        "justification": "পৌরসভার নীতি পরিষদ কর্তৃক মনোনীত"
    }, headers=admin_headers)
    assert priv_req_res.status_code == 200
    priv_req_id = priv_req_res.json()["request_id"]

    # City Governance Head reviews and decides on the request
    gov_decision_res = await client.post(f"/api/governance/privileged-role-requests/{priv_req_id}/decide", json={
        "decision": "approve",
        "decision_notes": "নথি নং ১৪/২০২৬ অনুযায়ী অনুমোদিত"
    }, headers=gov_headers)
    assert gov_decision_res.status_code == 200
    assert gov_decision_res.json()["status"] == "approved"
    assert gov_decision_res.json()["new_role"] == "governance_head"

    # -------------------------------------------------------------
    # Req 15 & 16: System Admin cannot access private citizen cases merely through admin role
    # -------------------------------------------------------------
    admin_dash = await client.get("/api/admin/accounts/dashboard", headers=admin_headers)
    assert admin_dash.status_code == 200
    dash_data = admin_dash.json()
    assert "summary" in dash_data
    assert "total_accounts" in dash_data["summary"]

    # Citizen accounts list masks citizen phone & email
    acc_list_res = await client.get("/api/admin/accounts?role=citizen", headers=admin_headers)
    assert acc_list_res.status_code == 200
    citizens = acc_list_res.json()["accounts"]
    if citizens:
        first_cit = citizens[0]
        # Contact identifier must be masked (e.g. contains asterisk ***)
        assert "*" in first_cit["identifier"]

    # -------------------------------------------------------------
    # Req 17: Security history logs events with zero secret leaks
    # -------------------------------------------------------------
    sec_history = await client.get("/api/admin/security-history?limit=20", headers=admin_headers)
    assert sec_history.status_code == 200
    history_events = sec_history.json()
    assert len(history_events) > 0
    # Confirm actions exist and zero passwords or hashes leak
    for ev in history_events:
        after_str = str(ev.get("after_state", {})).lower()
        assert "password_hash" not in after_str
        assert "$2b$" not in after_str
        assert "hashed_password" not in after_str
        assert "token" not in after_str
        assert "otp" not in after_str
