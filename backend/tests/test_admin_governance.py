import pytest
from httpx import AsyncClient

@pytest.mark.asyncio
async def test_admin_governance_and_rbac_boundaries(client: AsyncClient):
    # 1. Login as Admin
    admin_login = await client.post("/api/auth/login", json={
        "phone_or_email": "admin@nagoriksathi.gov.bd",
        "password": "AdminPass1234!"
    })
    assert admin_login.status_code == 200
    admin_token = admin_login.json()["access_token"]
    admin_headers = {"Authorization": f"Bearer {admin_token}"}

    # Login as Coordinator for boundary verification
    coord_login = await client.post("/api/auth/login", json={
        "phone_or_email": "coordinator@nagoriksathi.gov.bd",
        "password": "Pass1234!"
    })
    assert coord_login.status_code == 200
    coord_token = coord_login.json()["access_token"]
    coord_headers = {"Authorization": f"Bearer {coord_token}"}

    # 2. System Health Diagnostics
    health_res = await client.get("/api/admin/health", headers=admin_headers)
    assert health_res.status_code == 200
    health_data = health_res.json()
    assert health_data["status"] in ["healthy", "degraded"]
    assert "components" in health_data
    assert health_data["components"]["database"]["status"] == "healthy"
    assert "latency_ms" in health_data["components"]["database"]
    assert health_data["components"]["api"]["status"] == "healthy"

    # 3. Dual-Approval Confidence Gate Flow (R&D Section 10.11 / Table 33 / S7)
    # Admin can raise gate directly
    raise_res = await client.post("/api/admin/gate-config/update", json={
        "new_threshold": 0.85,
        "reason": "উচ্চ নির্ভরযোগ্যতা নিশ্চিতকরণ"
    }, headers=admin_headers)
    assert raise_res.status_code == 200
    assert raise_res.json()["status"] == "updated"
    assert raise_res.json()["current_threshold"] == 0.85

    # Lowering gate requires dual approval!
    lower_res = await client.post("/api/admin/gate-config/update", json={
        "new_threshold": 0.75,
        "reason": "জরুরি বন্যা পরিস্থিতিতে ফিল্টার শিথিলকরণ"
    }, headers=admin_headers)
    assert lower_res.status_code == 200
    assert lower_res.json()["status"] == "pending_dual_approval"

    # Check pending approvals queue
    pending_res = await client.get("/api/admin/pending-approvals", headers=admin_headers)
    assert pending_res.status_code == 200
    pending_list = pending_res.json()
    assert len(pending_list) > 0
    app_id = pending_list[0]["id"]

    # Initiator cannot self-approve! (Dual approval enforcement)
    self_approve_res = await client.post(f"/api/admin/pending-approvals/{app_id}/decide", json={
        "approval_request_id": app_id,
        "decision": "approve",
        "decision_notes": "নিজে অনুমোদন করার চেষ্টা"
    }, headers=admin_headers)
    assert self_approve_res.status_code == 400
    assert "উদ্যোক্তা নিজে দ্বিতীয় অনুমোদনকারী হতে পারবেন না" in self_approve_res.json()["detail"]

    # 4. User Management & Account Status
    new_user_res = await client.post("/api/admin/users", json={
        "full_name": "ইঞ্জিনিয়ার জহিরুল হক",
        "phone": "01799887766",
        "email": "zahirul@nagoriksathi.gov.bd",
        "role": "dept_officer",
        "is_active": True,
        "assigned_ward_ids": [],
        "assigned_department_ids": []
    }, headers=admin_headers)
    assert new_user_res.status_code == 200
    created_user_id = new_user_res.json()["user_id"]

    # Toggle status (lock/unlock)
    toggle_res = await client.post(f"/api/admin/users/{created_user_id}/toggle-status", headers=admin_headers)
    assert toggle_res.status_code == 200
    assert toggle_res.json()["is_active"] is False

    # Accounts summary
    summary_res = await client.get("/api/admin/accounts/summary", headers=admin_headers)
    assert summary_res.status_code == 200
    assert summary_res.json()["total_users"] > 0
    assert "by_role" in summary_res.json()

    # Authoritative 5-Role Matrix
    matrix_res = await client.get("/api/admin/roles/matrix", headers=admin_headers)
    assert matrix_res.status_code == 200
    assert len(matrix_res.json()) >= 10

    # 5. Civic Data Registry & Inconsistent Ownership Prevention
    depts = (await client.get("/api/departments")).json()
    wards = (await client.get("/api/wards")).json()
    valid_dept_id = depts[0]["id"]
    valid_ward_id = wards[0]["id"]

    # Invalid asset creation fails (Prevents inconsistent ownership)
    invalid_asset_res = await client.post("/api/admin/assets", json={
        "asset_code": "AST-INVALID-001",
        "name_bn": "অবৈধ সম্পদ",
        "name_en": "Invalid Asset",
        "asset_type": "drain",
        "ward_id": "non-existent-ward",
        "department_id": valid_dept_id,
        "latitude": 22.35,
        "longitude": 91.82,
        "health_status": "operational"
    }, headers=admin_headers)
    assert invalid_asset_res.status_code == 400

    # Valid asset creation succeeds
    valid_asset_res = await client.post("/api/admin/assets", json={
        "asset_code": f"AST-TEST-{valid_ward_id[:4]}",
        "name_bn": "টেস্ট ড্রেন সেগমেন্ট",
        "name_en": "Test Drain Segment",
        "asset_type": "drain",
        "ward_id": valid_ward_id,
        "department_id": valid_dept_id,
        "latitude": 22.35,
        "longitude": 91.82,
        "health_status": "operational"
    }, headers=admin_headers)
    assert valid_asset_res.status_code == 200

    # 6. Rules & AI Safety Configuration
    safety_res = await client.get("/api/admin/ai-safety-config", headers=admin_headers)
    assert safety_res.status_code == 200
    safety_data = safety_res.json()
    assert "critical_safety_flags" in safety_data
    assert any(f["flag"] == "ELECTRIC_SHOCK_RISK" for f in safety_data["critical_safety_flags"])

    # Sequencing rules
    seq_rules = await client.get("/api/admin/sequencing-rules", headers=admin_headers)
    assert seq_rules.status_code == 200
    assert len(seq_rules.json()) >= 2

    # 7. SLA Policy Admin vs Coordinator Permission Boundaries
    sla_update_res = await client.put("/api/admin/sla-policies/emergency", json={
        "response_target_hours": 2,
        "resolution_target_hours": 4,
        "reminder_lead_hours": 1,
        "escalation_1_hours": 3,
        "escalation_2_hours": 4
    }, headers=admin_headers)
    assert sla_update_res.status_code == 200

    # Restore default emergency SLA so subsequent tests are not affected
    await client.put("/api/admin/sla-policies/emergency", json={
        "response_target_hours": 2,
        "resolution_target_hours": 6,
        "reminder_lead_hours": 1,
        "escalation_1_hours": 4,
        "escalation_2_hours": 8
    }, headers=admin_headers)

    # Coordinator cannot edit SLA policies (Read-only as per RBAC Table 30)
    coord_edit_sla = await client.put("/api/admin/sla-policies/emergency", json={
        "response_target_hours": 1,
        "resolution_target_hours": 2,
        "reminder_lead_hours": 1,
        "escalation_1_hours": 2,
        "escalation_2_hours": 3
    }, headers=coord_headers)
    assert coord_edit_sla.status_code == 403

    # 8. Strict Administrator Boundaries (Negative RBAC Tests)
    # Admin cannot close cases (Only Coordinator has case closure authority)
    admin_close_case = await client.post("/api/cases/dummy-case-id/close", json={
        "reason_bn": "অ্যাডমিন কর্তৃক সমাপ্তির চেষ্টা",
        "exception_documented": False
    }, headers=admin_headers)
    assert admin_close_case.status_code == 403

    # Admin cannot perform operational resolution review
    admin_review_res = await client.post("/api/cases/dummy-case-id/resolution-review", json={
        "decision": "approved",
        "notes_bn": "অ্যাডমিন প্রমাণক অনুমোদনের চেষ্টা"
    }, headers=admin_headers)
    assert admin_review_res.status_code == 403

    # 9. Privacy-Preserving Aggregated Analytics
    analytics_res = await client.get("/api/admin/analytics/aggregated", headers=admin_headers)
    assert analytics_res.status_code == 200
    analytics_data = analytics_res.json()
    assert "total_cases_logged" in analytics_data
    assert "overall_resolution_rate" in analytics_data
    assert "citizen_phone" not in analytics_data
    assert "citizen_name" not in analytics_data
    assert analytics_data["privacy_guarantee"] == "PII-free aggregated telemetry"
