import pytest
from httpx import AsyncClient

@pytest.mark.asyncio
async def test_ward_desk_operations_complete_flow(client: AsyncClient):
    # 1. Staff Login as Ward Desk Officer (Ward 3 scope)
    ward_login = await client.post("/api/auth/login", json={
        "phone_or_email": "warddesk@nagoriksathi.gov.bd",
        "password": "Pass1234!"
    })
    assert ward_login.status_code == 200
    ward_token = ward_login.json()["access_token"]
    ward_headers = {"Authorization": f"Bearer {ward_token}"}

    # 2. Citizen creates emergency intake in Ward 3
    intake_res = await client.post("/api/cases/intake", json={
        "raw_text_bn": "রাস্তার প্রধান ম্যানহোলের ঢাকনা ভাঙা। পথচারী পড়ে যাওয়ার মারাত্মক জরুরি ঝুঁকি।",
        "latitude": 22.3655,
        "longitude": 91.8210,
        "address_text": "পাঁচলাইশ ২ নং রোড",
        "landmark": "পাঁচলাইশ মোড়",
        "is_public_property": True,
        "intake_channel": "web_pwa"
    })
    assert intake_res.status_code == 200
    case_data = intake_res.json()
    case_id = case_data["case_id"]
    assert case_data["ai_analysis"]["is_hazard"] == True

    # 3. Ward Desk reads Ward 3 case details successfully
    case_detail_res = await client.get(f"/api/cases/{case_id}", headers=ward_headers)
    assert case_detail_res.status_code == 200
    cd = case_detail_res.json()
    assert cd["id"] == case_id
    assert cd["ward_number"] == 3

    # 4. Ward Desk verifies the report & confirms emergency priority and department
    depts = {d["code"]: d["id"] for d in (await client.get("/api/departments")).json()}
    verify_res = await client.post(f"/api/cases/{case_id}/verify", json={
        "lead_department_id": depts["drain"],
        "priority": "emergency",
        "is_overridden": False,
        "confirmed_notes": "সরেজমিনে জরুরি নিরাপত্তা ঝুঁকি নিশ্চিত করা হয়েছে।"
    }, headers=ward_headers)
    assert verify_res.status_code == 200
    assert verify_res.json()["status"] == "verified"

    # 5. Ward Desk assisted walk-in intake for another citizen
    walkin_res = await client.post("/api/cases/intake", json={
        "raw_text_bn": "নাগরিক সেবা কেন্দ্রে এসে অভিযোগ করলেন যে তাদের লেনে ড্রেনের পানি উপচে পড়ছে।",
        "latitude": 22.3650,
        "longitude": 91.8200,
        "address_text": "হাতেম আলী লেইন, পাঁচলাইশ",
        "landmark": "মসজিদের সামনে",
        "is_public_property": True,
        "intake_channel": "ward_desk"
    }, headers=ward_headers)
    assert walkin_res.status_code == 200
    walkin_id = walkin_res.json()["case_id"]

    # 6. Verify assisted intake history endpoint reflects the walk-in
    assisted_res = await client.get("/api/cases/assisted/history", headers=ward_headers)
    assert assisted_res.status_code == 200
    assisted_cases = assisted_res.json()
    assert any(c["id"] == walkin_id for c in assisted_cases)

    # 7. Multi-department sequence approval (Waste -> Drain -> Road)
    seq_payload = {
        "case_id": case_id,
        "approval_notes": "৩টি বিভাগের সমন্বিত কর্মপরিকল্পনা অনুমোদিত হলো।",
        "approved_tasks": [
            {
                "department_id": depts["waste"],
                "title_bn": "বর্জ্য অপসারণ",
                "description_bn": "কঠিন বর্জ্য পরিষ্কার",
                "sequence_order": 1,
                "is_lead_task": True,
                "sla_hours": 12
            },
            {
                "department_id": depts["drain"],
                "title_bn": "ড্রেন স্ল্যাব প্রতিস্থাপন",
                "description_bn": "নতুন স্ল্যাব স্থাপন",
                "sequence_order": 2,
                "is_lead_task": False,
                "sla_hours": 24
            }
        ]
    }
    seq_res = await client.post(f"/api/cases/{case_id}/approve-sequence", json=seq_payload, headers=ward_headers)
    assert seq_res.status_code == 200

    # 8. Duplicate detection & merge
    # Submit second report nearby
    dup_res = await client.post("/api/cases/intake", json={
        "raw_text_bn": "পাঁচলাইশ ২ নং রোডে ম্যানহোলের ঢাকনা ভাঙা অবস্থায় পড়ে আছে।",
        "latitude": 22.3656,
        "longitude": 91.8211,
        "address_text": "পাঁচলাইশ ২ নং রোড সংলগ্ন",
        "is_public_property": True,
        "intake_channel": "web_pwa"
    })
    dup_case_id = dup_res.json()["case_id"]

    # Ward desk merges the duplicate
    merge_res = await client.post("/api/duplicates/merge", json={
        "master_case_id": case_id,
        "duplicate_case_id": dup_case_id,
        "notes": "একই স্থানের একই ম্যানহোল ঢাকনা সমস্যার ডুপ্লিকেট"
    }, headers=ward_headers)
    assert merge_res.status_code == 200

    # Ward desk reverses merge (reversible unmerge per R&D §16)
    unmerge_res = await client.post("/api/duplicates/unmerge", json={
        "duplicate_case_id": dup_case_id,
        "reason": "আলাদা সেগমেন্ট হিসেবে পর্যালোচনার জন্য মার্জ প্রত্যাহার"
    }, headers=ward_headers)
    assert unmerge_res.status_code == 200

    # 9. Negative Authorization: Ward Desk (Ward 3) accessing Ward 1 incident -> 403
    # Find or create a case in Ward 1
    ward1_intake = await client.post("/api/cases/intake", json={
        "raw_text_bn": "১ নং পাহাড়তলী ওয়ার্ডে বাতি নষ্ট।",
        "latitude": 22.3800,
        "longitude": 91.7900,
        "address_text": "পাহাড়তলী মোড়",
        "is_public_property": True
    })
    ward1_case_id = ward1_intake.json()["case_id"]

    # Ward desk tries to view Ward 1 case -> 403 Forbidden
    cross_ward_res = await client.get(f"/api/cases/{ward1_case_id}", headers=ward_headers)
    assert cross_ward_res.status_code == 403

    # 10. Negative Authorization: Ward Desk trying to accept department task -> 403 Forbidden
    task1_id = (await client.get(f"/api/cases/{case_id}", headers=ward_headers)).json()["tasks"][0]["id"]
    task_accept_res = await client.post(f"/api/tasks/{task1_id}/accept", headers=ward_headers)
    assert task_accept_res.status_code == 403

    # 11. Ward Stats API
    wards_list = (await client.get("/api/wards")).json()
    ward3_id = next(w["id"] for w in wards_list if w["ward_number"] == 3)
    stats_res = await client.get(f"/api/wards/{ward3_id}/stats", headers=ward_headers)
    assert stats_res.status_code == 200
    s_data = stats_res.json()
    assert s_data["ward_number"] == 3
    assert s_data["total_cases"] >= 1
