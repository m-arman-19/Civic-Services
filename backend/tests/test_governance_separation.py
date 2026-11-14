import pytest
from httpx import AsyncClient

@pytest.mark.asyncio
async def test_governance_head_and_system_admin_separation(client: AsyncClient):
    # -------------------------------------------------------------
    # 1. Logins & Credentials
    # -------------------------------------------------------------
    # System Admin
    admin_login = await client.post("/api/auth/login", json={
        "phone_or_email": "admin@nagoriksathi.gov.bd",
        "password": "AdminPass1234!"
    })
    assert admin_login.status_code == 200
    admin_token = admin_login.json()["access_token"]
    admin_headers = {"Authorization": f"Bearer {admin_token}"}

    # City Governance Head (6th Role)
    gov_login = await client.post("/api/auth/login", json={
        "phone_or_email": "governance@nagoriksathi.gov.bd",
        "password": "GovPass1234!"
    })
    assert gov_login.status_code == 200
    gov_token = gov_login.json()["access_token"]
    gov_headers = {"Authorization": f"Bearer {gov_token}"}

    # Coordinator
    coord_login = await client.post("/api/auth/login", json={
        "phone_or_email": "coordinator@nagoriksathi.gov.bd",
        "password": "Pass1234!"
    })
    assert coord_login.status_code == 200
    coord_token = coord_login.json()["access_token"]
    coord_headers = {"Authorization": f"Bearer {coord_token}"}

    # -------------------------------------------------------------
    # 2. City Governance Head authorized functions
    # -------------------------------------------------------------
    gov_overview = await client.get("/api/governance/overview", headers=gov_headers)
    assert gov_overview.status_code == 200
    assert "active_policy_version" in gov_overview.json()["overview"]

    gov_resp_rules = await client.get("/api/governance/responsibility-rules", headers=gov_headers)
    assert gov_resp_rules.status_code == 200
    assert len(gov_resp_rules.json()) > 0

    gov_seq_rules = await client.get("/api/governance/sequencing-rules", headers=gov_headers)
    assert gov_seq_rules.status_code == 200
    assert len(gov_seq_rules.json()) >= 2

    gov_gate = await client.get("/api/governance/ai-gate", headers=gov_headers)
    assert gov_gate.status_code == 200
    assert gov_gate.json()["default_baseline"] == 0.80

    # -------------------------------------------------------------
    # 3. Governance Head owns SLA Targets
    # -------------------------------------------------------------
    sla_get = await client.get("/api/governance/sla-policies", headers=gov_headers)
    assert sla_get.status_code == 200
    assert len(sla_get.json()) >= 4

    sla_put = await client.put("/api/governance/sla-policies/emergency", json={
        "first_response_hours": 2,
        "resolution_hours": 6,
        "notes_bn": "জরুরি দুর্যোগ প্রস্তুতি এসএলএ"
    }, headers=gov_headers)
    assert sla_put.status_code == 200
    assert sla_put.json()["resolution_hours"] == 6

    # -------------------------------------------------------------
    # 4. Strict Role Boundaries & 403 Forbidden checks
    # -------------------------------------------------------------
    # City Governance Head CANNOT provision users (Admin only)
    gov_create_user = await client.post("/api/admin/users", json={
        "full_name": "অবৈধ চেষ্টা",
        "phone": "01788990011",
        "role": "dept_officer"
    }, headers=gov_headers)
    assert gov_create_user.status_code == 403

    # City Governance Head CANNOT access technical infrastructure diagnostics (Admin only)
    gov_infra = await client.get("/api/admin/infrastructure", headers=gov_headers)
    assert gov_infra.status_code == 403

    # System Administrator CANNOT access Governance Head exclusive overview
    admin_gov_overview = await client.get("/api/governance/overview", headers=admin_headers)
    assert admin_gov_overview.status_code == 403

    # -------------------------------------------------------------
    # 5. Neither role can close cases or review closure evidence (Coordinator only)
    # -------------------------------------------------------------
    # Find demo case
    cases_res = await client.get("/api/cases", headers=coord_headers)
    assert cases_res.status_code == 200
    raw_cases = cases_res.json()
    cases_list = raw_cases if isinstance(raw_cases, list) else raw_cases.get("cases", [])
    assert len(cases_list) > 0
    test_case_id = cases_list[0]["id"]

    # Admin cannot close case
    admin_close = await client.post(f"/api/cases/{test_case_id}/close", json={
        "satisfaction_rating": 5,
        "closure_notes": "অ্যাডমিন বন্ধ করার চেষ্টা"
    }, headers=admin_headers)
    assert admin_close.status_code == 403

    # Governance Head cannot close case
    gov_close = await client.post(f"/api/cases/{test_case_id}/close", json={
        "satisfaction_rating": 5,
        "closure_notes": "গভর্নেন্স প্রধান বন্ধ করার চেষ্টা"
    }, headers=gov_headers)
    assert gov_close.status_code == 403

    # -------------------------------------------------------------
    # 6. Dual Approval Workflow: Creation, Technical Review & Governance Decision
    # -------------------------------------------------------------
    # City Governance Head proposes a policy change
    prop_res = await client.post("/api/governance/policy-requests", json={
        "change_category": "RESPONSIBILITY_RULE",
        "current_configuration": {"waste_primary": "dept-waste"},
        "proposed_configuration": {"waste_primary": "dept-waste", "enforce_hazardous_waste_division": True},
        "proposed_version": "1.3",
        "reason": "মেডিকেল ও ঝুঁকিপূর্ণ বর্জ্য পৃথকীকরণ প্রবিধানমালা ২০২৬"
    }, headers=gov_headers)
    assert prop_res.status_code == 200
    req_id = prop_res.json()["request_id"]

    # One individual cannot satisfy both approvals!
    # If Governance Head tries to approve as System Administrator or self-approve:
    gov_tech_review = await client.post(f"/api/admin/policy-requests/{req_id}/technical-review", json={
        "decision": "approve",
        "decision_notes": "গভর্নেন্স প্রধান টেকনিক্যাল অনুমোদন দেওয়ার চেষ্টা"
    }, headers=gov_headers)
    assert gov_tech_review.status_code == 403 # Governance Head forbidden from admin technical review!

    # System Administrator reviews and approves technical feasibility
    admin_tech_review = await client.post(f"/api/admin/policy-requests/{req_id}/technical-review", json={
        "decision": "approve",
        "decision_notes": "ডাটাবেজ স্কিমা ও রুল ইঞ্জিন সামঞ্জস্যপূর্ণ।"
    }, headers=admin_headers)
    assert admin_tech_review.status_code == 200
    assert admin_tech_review.json()["approval_state"] == "approved"
    assert admin_tech_review.json()["implementation_state"] == "applied"

    # -------------------------------------------------------------
    # 7. Rejection prevents application
    # -------------------------------------------------------------
    prop_reject = await client.post("/api/governance/policy-requests", json={
        "change_category": "TASK_SEQUENCING_RULE",
        "current_configuration": {"step": 1},
        "proposed_configuration": {"step": 99},
        "proposed_version": "1.99",
        "reason": "ত্রুটিপূর্ণ প্রস্তাবনা যা বাতিল হবে"
    }, headers=gov_headers)
    assert prop_reject.status_code == 200
    reject_req_id = prop_reject.json()["request_id"]

    # System Admin rejects technical feasibility
    admin_reject = await client.post(f"/api/admin/policy-requests/{reject_req_id}/technical-review", json={
        "decision": "reject",
        "decision_notes": "সার্কুলার ডিপেনডেন্সি ত্রুটি রয়েছে।"
    }, headers=admin_headers)
    assert admin_reject.status_code == 200
    assert admin_reject.json()["approval_state"] == "rejected"
    assert admin_reject.json()["implementation_state"] == "pending"

    # -------------------------------------------------------------
    # 8. AI Confidence Gate Lowering requires dual approval
    # -------------------------------------------------------------
    # Propose lowering gate from 0.80 to 0.70
    gate_lower_prop = await client.post("/api/governance/policy-requests", json={
        "change_category": "AI_CONFIDENCE_GATE",
        "current_configuration": {"threshold": 0.80},
        "proposed_configuration": {"threshold": 0.70},
        "proposed_version": "1.4",
        "reason": "বিশেষ দুর্যোগ পরিস্থিতিতে গেট শিথিলকরণ"
    }, headers=gov_headers)
    assert gate_lower_prop.status_code == 200
    gate_req_id = gate_lower_prop.json()["request_id"]

    # Admin provides technical review
    admin_gate_review = await client.post(f"/api/admin/policy-requests/{gate_req_id}/technical-review", json={
        "decision": "approve",
        "decision_notes": "ইনফারেন্স গতি ও রিসোর্স ব্যবহারের সাথে সামঞ্জস্যপূর্ণ।"
    }, headers=admin_headers)
    assert admin_gate_review.status_code == 200
    # Both approved -> Revalidation checked and applied
    assert admin_gate_review.json()["approval_state"] == "approved"
    assert admin_gate_review.json()["implementation_state"] == "applied"

    # -------------------------------------------------------------
    # 9. Audit trail verification
    # -------------------------------------------------------------
    history_res = await client.get("/api/governance/history", headers=gov_headers)
    assert history_res.status_code == 200
    assert "policy_requests_history" in history_res.json()
    assert len(history_res.json()["policy_requests_history"]) > 0
    assert "audit_trail" in history_res.json()

    # -------------------------------------------------------------
    # 10. Privacy Safe Analytics (Zero PII)
    # -------------------------------------------------------------
    perf_res = await client.get("/api/governance/service-performance", headers=gov_headers)
    assert perf_res.status_code == 200
    perf_data = perf_res.json()
    assert "city_wide_summary" in perf_data
    assert "privacy_guarantee" in perf_data
    # Ensure no citizen phone numbers or names exist in the performance payload
    import json
    perf_text = json.dumps(perf_data, ensure_ascii=False)
    assert "01711000001" not in perf_text
    assert "মুশফিকুর" not in perf_text
