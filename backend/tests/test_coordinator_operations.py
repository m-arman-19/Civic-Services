import pytest
from httpx import AsyncClient

@pytest.mark.asyncio
async def test_coordinator_operations_workflow(client: AsyncClient):
    # 1. Staff Login as Coordinator
    coord_login = await client.post("/api/auth/login", json={
        "phone_or_email": "coordinator@nagoriksathi.gov.bd",
        "password": "Pass1234!"
    })
    assert coord_login.status_code == 200
    coord_token = coord_login.json()["access_token"]
    coord_headers = {"Authorization": f"Bearer {coord_token}"}

    # Ward desk login for RBAC check
    ward_login = await client.post("/api/auth/login", json={
        "phone_or_email": "warddesk@nagoriksathi.gov.bd",
        "password": "Pass1234!"
    })
    assert ward_login.status_code == 200
    ward_token = ward_login.json()["access_token"]
    ward_headers = {"Authorization": f"Bearer {ward_token}"}

    # 2. Coordinator Dashboard Stats
    stats_res = await client.get("/api/cases/coordinator/stats", headers=coord_headers)
    assert stats_res.status_code == 200
    stats = stats_res.json()
    assert "awaiting_approval" in stats
    assert "emergency_incidents" in stats
    assert "pending_evidence_reviews" in stats
    assert "stalled_cases" in stats
    assert "multi_dept_cases" in stats

    # 3. Create a Compound Multi-Department Case
    intake_res = await client.post("/api/cases/intake", json={
        "raw_text_bn": "রাস্তার বড় ড্রেন উপচে সড়ক ভেঙে গেছে এবং প্রচুর আবর্জনা জমে তীব্র জলাবদ্ধতা হয়েছে।",
        "latitude": 22.3655,
        "longitude": 91.8210,
        "address_text": "পাঁচলাইশ ৩ নং মোড়",
        "landmark": "পাঁচলাইশ মোড়",
        "is_public_property": True,
        "intake_channel": "web_pwa"
    })
    assert intake_res.status_code == 200
    case_id = intake_res.json()["case_id"]

    # 4. Coordinator has jurisdiction access (can view case across all wards)
    case_detail_res = await client.get(f"/api/cases/{case_id}", headers=coord_headers)
    assert case_detail_res.status_code == 200
    assert case_detail_res.json()["id"] == case_id

    # 5. Coordinator Approves Multi-Department Sequence Plan (Waste -> Drain -> Road)
    depts = {d["code"]: d["id"] for d in (await client.get("/api/departments")).json()}
    plan_tasks = [
        {
            "department_id": depts["waste"],
            "title_bn": "১. বর্জ্য অপসারণ",
            "description_bn": "ড্রেনমুখ থেকে সকল আবর্জনা অপসারণ",
            "sequence_order": 1,
            "is_lead_task": True,
            "sla_hours": 24,
            "prerequisite_task_ids": []
        },
        {
            "department_id": depts["drain"],
            "title_bn": "২. নর্দমা পরিষ্কার ও পলি নিষ্কাশন",
            "description_bn": "ড্রেনের ভেতরের পলি অপসারণ ও প্রবাহ সচলকরণ",
            "sequence_order": 2,
            "is_lead_task": False,
            "sla_hours": 48,
            "prerequisite_task_ids": []
        },
        {
            "department_id": depts["road"],
            "title_bn": "৩. ক্ষতিগ্রস্ত সড়ক ও পিচ মেরামত",
            "description_bn": "ড্রেন ক্লিয়ারেন্সের পর সড়কের গর্ত ভরাট ও কার্পেটিং",
            "sequence_order": 3,
            "is_lead_task": False,
            "sla_hours": 72,
            "prerequisite_task_ids": []
        }
    ]

    seq_res = await client.post(f"/api/cases/{case_id}/approve-sequence", json={
        "case_id": case_id,
        "approval_notes": "সমন্বয়ক কর্তৃক ৩-ধাপের কর্মপরিকল্পনা অনুমোদিত",
        "approved_tasks": plan_tasks
    }, headers=coord_headers)
    assert seq_res.status_code == 200
    assert "সফলভাবে অনুমোদিত" in seq_res.json()["message_bn"]

    # 6. Negative RBAC: Ward Desk CANNOT Close a Case (T-RBAC-04)
    ward_close_res = await client.post(f"/api/cases/{case_id}/close", json={
        "reason_bn": "ওয়ার্ড ডেস্ক থেকে বন্ধ করার চেষ্টা"
    }, headers=ward_headers)
    assert ward_close_res.status_code == 403

    # 7. S8 / UT-DM-05: Coordinator Cannot Close without Evidence (Unless exception documented)
    close_without_ev = await client.post(f"/api/cases/{case_id}/close", json={
        "reason_bn": "প্রমাণ ছাড়া সমাপ্তির চেষ্টা",
        "exception_documented": False
    }, headers=coord_headers)
    assert close_without_ev.status_code == 409
    assert "প্রমাণক ব্যতীত কেস সমাপ্ত করা সম্ভব নয়" in close_without_ev.json()["detail"]

    # 8. Upload completion evidence (After photo)
    officer_login = await client.post("/api/auth/login", json={
        "phone_or_email": "officer_waste@nagoriksathi.gov.bd",
        "password": "Pass1234!"
    })
    assert officer_login.status_code == 200
    off_headers = {"Authorization": f"Bearer {officer_login.json()['access_token']}"}

    cd_updated = (await client.get(f"/api/cases/{case_id}", headers=coord_headers)).json()
    task_1_id = cd_updated["tasks"][0]["id"]

    ev_res = await client.post("/api/evidence/upload-proof", json={
        "case_id": case_id,
        "task_id": task_1_id,
        "evidence_type": "after",
        "media_url": "https://storage.nagoriksathi.gov.bd/evidence/after_waste_clean.jpg",
        "staff_notes": "বর্জ্য ও ময়লা সফলভাবে অপসারণ সম্পন্ন"
    }, headers=off_headers)
    assert ev_res.status_code == 200

    # 9. Resolution Review by Coordinator (Rework requested test)
    rework_res = await client.post(f"/api/cases/{case_id}/resolution-review", json={
        "decision": "rework_required",
        "notes_bn": "ছবিতে দেখা যাচ্ছে কিছু বর্জ্য এখনো নর্দমার মুখে আটকে আছে। পুনরায় কাজ করুন।",
        "target_task_id": task_1_id
    }, headers=coord_headers)
    assert rework_res.status_code == 200
    assert "পুনরায় কাজের নির্দেশ" in rework_res.json()["message_bn"]

    # Re-upload proof and approve resolution review
    await client.post("/api/evidence/upload-proof", json={
        "case_id": case_id,
        "task_id": task_1_id,
        "evidence_type": "after",
        "media_url": "https://storage.nagoriksathi.gov.bd/evidence/after_waste_clean_v2.jpg",
        "staff_notes": "পুনরায় ড্রেনমুখ সম্পূর্ণ পরিষ্কার করা হয়েছে"
    }, headers=off_headers)

    approve_review_res = await client.post(f"/api/cases/{case_id}/resolution-review", json={
        "decision": "approved",
        "notes_bn": "সম্পূর্ণ বর্জ্য অপসারণ ও ড্রেনমুখ উন্মুক্তকরণ সন্তোষজনক।"
    }, headers=coord_headers)
    assert approve_review_res.status_code == 200

    # 10. Coordinator Closes Case with Evidence
    close_res = await client.post(f"/api/cases/{case_id}/close", json={
        "reason_bn": "সমন্বয়ক কর্তৃক সরেজমিন পর্যবেক্ষণ ও প্রমাণক পর্যালোচনান্তে কেস সমাপ্ত",
        "exception_documented": False
    }, headers=coord_headers)
    assert close_res.status_code == 200
    assert close_res.json()["status"] == "closed"

    # 11. Department Performance Reporting
    perf_res = await client.get("/api/cases/coordinator/department-performance", headers=coord_headers)
    assert perf_res.status_code == 200
    perf = perf_res.json()
    assert len(perf) > 0
    assert "closure_rate_pct" in perf[0]
    assert "department_name_bn" in perf[0]

    # 12. Hotspot Zones Analytics
    hotspots_res = await client.get("/api/hotspots/zones", headers=coord_headers)
    assert hotspots_res.status_code == 200

    # 13. SLA Policies View for Coordinator
    sla_res = await client.get("/api/admin/sla-policies", headers=coord_headers)
    assert sla_res.status_code == 200
    assert len(sla_res.json()) >= 4

    # 14. Audit Log Access for Coordinator
    audit_res = await client.get("/api/audit/logs?resource_type=CASE", headers=coord_headers)
    assert audit_res.status_code == 200
    assert len(audit_res.json()) > 0
