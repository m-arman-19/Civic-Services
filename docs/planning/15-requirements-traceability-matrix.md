# 15 — Requirements Traceability Matrix
## Nagorik Sathi AI — R&D Report v1.2

> Links R&D requirements → workflow → module → screen → API → data entity → authorization rule → test.
> **Status codes:** S = Specified (R&D source), P = Proposed (implementation decision), NC = Needs Clarification, OOS = Out of Scope (this phase)

---

## 1. Core Functional Requirements

| Req ID | R&D Source | Description | Workflow | Module | Screen | API | Entity | Auth Rule | Test |
|--------|-----------|-------------|---------|--------|--------|-----|--------|-----------|------|
| FR-M1-01 | R&D Table 9 | Citizens submit in Bangla text or voice | §4 Flow 1 | M1 | S-CIT-02 | POST /reports | reports.raw_text_bn / voice_file_key | CITIZEN: C own | T-API-01, E2E-01 |
| FR-M1-02 | R&D Table 9 | AI transcribes voice; original kept | §4 Async path | M4 | S-CIT-02 | (async job) | reports.transcription_text_bn, voice_file_key | System only | UT-RE-09 |
| FR-M1-03 | R&D §2.3 | Photo and video upload from start | §4 Flow 1 | M1 | S-CIT-04 | POST /reports/{id}/media | report_media | CITIZEN: C own | T-API-03, E2E-01 |
| FR-M1-04 | R&D Table 9 | System asks where, how long, public/private | §4 Flow 1 | M1 | S-CIT-02/03 | POST /reports | reports.location_description, is_public_place, reported_duration | CITIZEN: C own | CT-FE-03 |
| FR-M1-05 | R&D Table 9 | GPS pin confirmed by citizen | §4 Flow 1 | M1 | S-CIT-03 | POST /reports | reports.reported_location, location_confirmed_by_citizen | CITIZEN: C own | IT-GEO-01 |
| FR-M1-06 | R&D §10.9 | API returns 202 Accepted + job ID | §4 Async | M1 | S-CIT-05 | POST /reports → 202 | ai_jobs | System | T-API-01 |
| FR-M1-07 | R&D §2.3 | Consent before location use | §4 Flow 1 | M9 | S-CIT-01 | POST /auth/register | consent_records | CITIZEN: C own | E2E-01 |
| FR-M1-08 | R&D §7.3 | Drafts saved for weak connections | §6 Fallback | M1 | S-CIT-02 | (IndexedDB, offline) | (client-side) | CITIZEN | FR-07 |
| FR-M1-09 | R&D §2.3 | Ward desk may file on behalf of citizen | §4 Assisted | M1 | S-WARD-03 | POST /reports | reports.submission_channel=ward_desk | WARD_DESK: C | E2E-01 |
| FR-M2-01 | R&D §10.7 | Retrieve from verified docs; answer from retrieved text only | §1 Service path | M2 | S-CIT-09 | POST /guidance/query | service_knowledge, knowledge_sources | PUBLIC+any | IT-VEC-01 |
| FR-M2-02 | R&D §10.7 | Show source, area, and update date | §1 Service path | M2 | S-CIT-09 | POST /guidance/query | knowledge_sources.last_verified_at | PUBLIC | E2E-08 |
| FR-M2-03 | R&D §10.7 | If no source: say so; hand to staff | §1 Service path | M2 | S-CIT-09 | POST /guidance/query → no_source | — | — | IT-VEC-02 |
| FR-M2-04 | R&D §10.7 | Never answer fees/eligibility from model memory | §1 Service path | M2 | S-CIT-09 | POST /guidance/query | — | — | Manual review |
| FR-M3-01 | R&D Table 11 | Eight status values | §3 Closure | M3, M7, M8 | S-CIT-07 | GET /incidents/{id} | incidents.status, status_history | CITIZEN: R own | CT-FE-04 |
| FR-M3-02 | R&D Table 11 | Status visible in real time | §4 Async | M3 | S-CIT-07 | GET /events/stream | incidents.status | CITIZEN: R own | E2E-11 |
| FR-M3-03 | R&D Table 9 | Waiting reasons shown if blocked | §2 Work phase | M3, M7 | S-CIT-07 | GET /incidents/{id} | dept_tasks.waiting_reason | CITIZEN: R own | CT-FE-08 |
| FR-M3-04 | R&D Table 9 | Officer details shown on citizen's own case only | §2 Work phase | M5 | S-CIT-07 | GET /incidents/{id} | officers.* | CITIZEN: R own case | T-RBAC-08 |
| FR-M3-05 | R&D Table 9 | Staff proof shown at Resolved status | §3 Closure | M8 | S-CIT-07 | GET /incidents/{id}.proof_evidence | evidence_files | CITIZEN: R visible | CT-FE-05 |
| FR-M3-06 | R&D §6.5 | Live map: incidents, never reporters | §4 Map | M3, M10 | S-PUB-02 | GET /public/map | incidents.location | PUBLIC | T-RBAC-10, E2E-09 |
| FR-M3-07 | R&D Table 9 | Notifications via SMS/e-mail/push with consent | §2 Work phase | M3 | All | (notification service) | notification_preferences, consent_records | CITIZEN: consent | E2E-01 |
| FR-M3-08 | R&D Table 9 | Citizen feedback and objection | §3 Closure | M3, M8 | S-CIT-08 | POST /cases/{id}/citizen-response | citizen_responses | CITIZEN: F own | E2E-04 |
| FR-M5-01 | R&D Table 9 | Ward boundary + asset owner + rules → departments | §4 Routing | M5 | S-WARD-03 | GET /reports/{id}/ai-proposal | wards, assets, responsibility_rules, ai_results | WARD_DESK: R ward | UT-RE-01, IT-GEO-01 |
| FR-M5-02 | R&D §10.11 | Confidence gate: 80% initial | §4 Routing | M5 | S-WARD-03 | GET /reports/{id}/ai-proposal | ai_results.gate_passed | System | UT-CG-01 |
| FR-M5-03 | R&D §10.11 | Below gate → manual; at/above gate → proposal | §4 Routing | M5 | S-WARD-03 | GET /reports/{id}/ai-proposal | ai_results.gate_passed | System | UT-CG-01, UT-CG-02 |
| FR-M5-04 | R&D Table 26 | Critical flags always stop process | §4 Routing | M5 | S-WARD-03 | GET /reports/{id}/ai-proposal | ai_results.critical_flag | System | UT-CG-03, E2E-05 |
| FR-M5-05 | R&D Table 12 | AI proposes priority with reasons | §4 Routing | M5 | S-WARD-03 | GET /reports/{id}/ai-proposal | ai_results.proposed_priority | WARD_DESK: R | UT-PT-01 |
| FR-M5-06 | R&D §10.5 | Staff override priority with recorded reason | §4 Routing | M5 | S-WARD-03 | POST /incidents/{id}/verify | priority_history.reason | WARD_DESK: O | UT-PT-03 |
| FR-M5-07 | R&D §10.5 | AI cannot lower staff-set priority | §4 Routing | M5 | — | (backend enforcement) | priority_history | System (S9) | UT-PT-02 |
| FR-M5-08 | R&D §10.5, S9 | Emergency always triggers urgent escalation | §4 Emergency | M5 | S-WARD-02 | (immediate SSE + notification) | incidents.priority=emergency | System | E2E-05 |
| FR-M5-10 | R&D Table 24 | Officer directory: name, designation, phone, email, ward, backup, validity | §2 Work | M5 | S-CIT-07 | GET /incidents/{id}.lead_officer | officers.* | CITIZEN: own case; WARD_DESK: ward | T-RBAC-08 |
| FR-M6-01 | R&D §10.8 | Duplicate candidates: GPS + type + time + text | §5 Duplicate | M6 | S-WARD-03 | GET /reports/{id}/ai-proposal.duplicate_candidates | ai_results.duplicate_candidates | WARD_DESK: R | E2E-06 |
| FR-M6-03 | R&D §10.8 | Staff confirm before merge; one incident, one pin | §5 Duplicate | M6 | S-WARD-03 | POST /incidents/{id}/duplicate-action | duplicate_links | WARD_DESK: A ward | E2E-06 |
| FR-M6-05 | R&D §10.8 | Each reporter sees own status; identities hidden | §5 Duplicate | M6, M3 | S-CIT-07 | GET /incidents/{id} | incidents.canonical_report_id | CITIZEN: own only | T-RBAC-01 |
| FR-M6-06 | R&D §10.8 | Links reversible | §5 Duplicate | M6 | S-WARD-03 | POST /incidents/{id}/duplicate-action | duplicate_links.is_reversible | WARD_DESK: A | — |
| FR-M6-09 | R&D §10.8 | Hotspot: repeated closure and return | §5 Hotspot | M6 | S-COORD-04 | GET /hotspots | hotspot_zones | COORD: R | — |
| FR-M6-11 | R&D §10.8 | AI review note: history, photos, alternative solutions | §5 Hotspot | M6 | S-COORD-03 | GET /hotspots | hotspot_zones.ai_review_note | COORD: R | — |
| FR-M7-01 | R&D §6.3 | One case holds all tasks for one problem | §2 Work | M7 | S-COORD-03 | GET /cases/{id} | cases, dept_tasks | COORD, WARD_DESK: R | E2E-03 |
| FR-M7-03 | R&D Table 23 | Task prerequisites and sequencing | §2 Work | M7 | S-COORD-03 | POST /cases (plan_sequence) | task_prerequisites | COORD: A | UT-DM-04, E2E-03 |
| FR-M7-06 | R&D §6.3 | Department accepts or rejects task | §2 Work | M7 | S-DEPT-03 | POST /tasks/{id}/accept, /reject | dept_tasks.status | DEPT_OFFICER: own | T-RBAC-02 |
| FR-M7-07 | R&D §12.1 | Rejection re-routed; nothing dropped | §2 Work | M7 | S-COORD-03 | POST /tasks/{id}/reject → reroute | dept_tasks | DEPT_OFFICER: own | E2E-03 |
| FR-M8-01 | R&D Table 9 | Department uploads proof shown to citizen | §3 Closure | M8 | S-CIT-07 | POST /tasks/{id}/evidence | evidence_files.visible_to_citizen | DEPT_OFFICER: C own | E2E-04 |
| FR-M8-02 | R&D Table 9 | Closure blocked without evidence | §3 Closure | M8 | S-DEPT-03 | PATCH /tasks/{id}/status → 409 | dept_tasks.evidence_required | System (S8) | UT-DM-05, T-API-04 |
| FR-M8-03 | R&D Table 9 | Citizen confirms or objects | §3 Closure | M8 | S-CIT-08 | POST /cases/{id}/citizen-response | citizen_responses | CITIZEN: F own | E2E-04 |
| FR-M8-05 | R&D Table 26 | Objection re-opens related task | §3 Closure | M8 | S-CIT-08 | POST /cases/{id}/citizen-response (objects) | dept_tasks.status=re_opened | CITIZEN: F (S8) | E2E-04 |
| FR-M9-01 | R&D Table 29 | MFA for all staff | §N/A Auth | M9 | Login | POST /auth/mfa/verify | users.mfa_enabled | All staff roles | SEC-05, T-API-06 |
| FR-M9-04 | R&D §11 | Immutable audit log | All workflows | M9 | S-ADMIN-06 | GET /audit | audit_events | ADMIN: H | IT-AUD-01, IT-AUD-02, SEC-07 |
| FR-M10-03 | R&D Table 14 | Public dashboard: aggregated only | §7 Analytics | M10 | S-PUB-03 | GET /public/analytics | — | PUBLIC | T-API-08 |
| FR-M10-05 | R&D §10.11 | Gate lowering: dual approval | §7 Config | M10 | S-ADMIN-03 | PUT /admin/config/routing_confidence_gate | system_config | ADMIN: dual A | E2E-10, T-RBAC-07 |

---

## 2. Safety Rules Traceability

| Safety Rule | R&D Source | Enforcing Module | API Enforcement | Test |
|-------------|-----------|-----------------|----------------|------|
| S1: Below gate → fallback | R&D Table 33 | M5, confidence_gate.py | GET /ai-proposal gate_passed=false | UT-CG-02, FR-01 |
| S2: Pass → pre-filled proposal | R&D Table 33 | M5 | GET /ai-proposal gate_passed=true | UT-CG-01 |
| S3: Critical flag → hard stop | R&D Table 33 | M5 | GET /ai-proposal critical_flag=true → 422 | UT-CG-03, E2E-05 |
| S4: Unknown → below gate | R&D Table 33 | M5 | (no_source path) | UT-CG-04 |
| S5: Always human in loop | R&D Table 33 | M7, M8 | No auto-close endpoint; POST /cases/{id}/close requires coordinator | T-RBAC-04, T-API-05 |
| S6: AI failure → manual mode | R&D Table 33 | AI worker + circuit breaker | 503 AI_UNAVAILABLE + SSE banner | E2E-07, FR-01, FR-02 |
| S7: Gate governance | R&D Table 33 | M10 | PUT /admin/config + dual approval | E2E-10, T-RBAC-07 |
| S8: Closure rule | R&D Table 33 | M7, M8 | POST /cases/{id}/close → validation | T-API-05, UT-DM-05 |
| S9: Emergency/hazard priority | R&D Table 33 | M5 | (backend: priority never lowered from staff-set) | UT-PT-02, E2E-05 |
| S10: Privacy by default | R&D Table 33 | M9, M3 | All responses: no citizen identity | T-RBAC-01, T-RBAC-10, T-API-08 |

---

## 3. Non-Functional Requirements Traceability

| NFR | R&D Source | Architecture | Test |
|-----|-----------|-------------|------|
| NFR-PERF-01: AI p95 ≤ 8 s | R&D Table 27 | Async AI workers + ONNX | PERF-01 |
| NFR-PERF-02: Rule engine p95 ≤ 300 ms | R&D §10.9 | Redis cache + in-memory engine | UT-RE-09, PERF-02 |
| NFR-PERF-03: AI timeout > 10 s → manual | R&D §10.9 | Circuit breaker in backend | FR-02 |
| NFR-SEC-01: TLS 1.3 | R&D Table 29 | Nginx TLS termination | SEC-01 (ZAP) |
| NFR-SEC-02: AES-256 at rest | R&D Table 29 | MinIO SSE + app encryption | SEC-01 |
| NFR-SEC-03: MFA for staff | R&D Table 29 | M9 auth | SEC-05, T-RBAC tests |
| NFR-SEC-05: Append-only audit | R&D §11 | Postgres trigger | IT-AUD-02, SEC-07 |
| NFR-PRIV-01: Citizen identity hidden | R&D §11, S10 | M9 RBAC | T-RBAC-01, T-RBAC-10 |
| NFR-PRIV-02: Location once with permission | R&D §2.3 | M9 consent | E2E-01 |
| NFR-ACCESS-01: WCAG 2.1 AA | R&D Table 34 | CSS design tokens, axe-core | ACC-01 to ACC-10 |
| NFR-STD-01: Open311-style | R&D Table 34 | API response schema | UT-DM tests |

---

## 4. Out-of-Scope Requirements (this phase)

| Item | Status | Phase |
|------|--------|-------|
| AI photo/video content analysis | OOS | Phase 2 |
| Photo/video duplicate similarity | OOS | Phase 2 |
| Seasonal risk forecasting | OOS | Phase 2 |
| Pre-monsoon inspection list | OOS | Phase 2 (when enough history) |
| Native Android client | OOS | Phase 2 |
| Read-aloud text mode | OOS | Phase 2 |
| Road-cutting/repair coordination | OOS | Phase 2 |
| Full GRS / National Portal integration | OOS | Future (requires formal agreement) |
| 333 helpline integration | OOS | Future (optional; requires operator agreement) |
| Licence issuance or payments | OOS | Permanently out of scope |
| Autonomous legal responsibility decisions | OOS | Permanently out of scope |
| Continuous citizen location tracking | OOS | Permanently out of scope |

---

## 5. Requirements Needing Clarification

| ID | Requirement | NC Reason | Impact | Priority |
|----|------------|-----------|--------|----------|
| Q1 | Which city corporation? | Affects all geographic data | Critical | Must resolve before Phase 0 |
| Q2 | Which 3-5 specific wards? | Affects asset registry, officer directory | Critical | Must resolve before Phase 0 |
| Q3 | Exact list of 10-15 service-information items | Affects M2 RAG corpus | High | Must resolve before Phase 1 |
| Q4 | Which SMS gateway provider? | Affects M3 notifications | High | Must resolve before Phase 4 |
| Q5 | Hotspot threshold (N recurrences, T time window) | Affects M6 configuration | Medium | City corporation to set; before Phase 3 |
| Q6 | Real department connections approved for v1? | Affects M7 demo vs. real | Medium | Affects demo scope |
| Q7 | NID required for citizen registration? | Affects M9 identity model | Medium | Security/privacy decision |
| Q8 | CloudApper capability verification results? | Affects optional integration | Low | Before Phase 3 if integration needed |
| Q9 | Audit log retention policy | Affects D5 schema | Medium | City corporation / legal requirement |
| Q10 | Specific AI models for ASR and NLU? | Affects Phase 2 implementation | High | Must resolve before Phase 2 |
| Q11 | Evaluation labelled dataset — available or to be created? | Affects Phase 6 timeline | High | Must resolve before Phase 5 |

---

## 6. Inconsistency Resolution Log

| ID | Inconsistency | Resolution |
|----|--------------|-----------|
| INC-01 | R&D mentions "ward desk officer" and "service-centre entrepreneur" as separate stakeholders but maps to one RBAC role (WARD_DESK) | Treated as one role per RBAC matrix; service-centre staff have the same interface and permissions as ward desk staff |
| INC-02 | R&D says "photo analysis is added step by step" — could imply partial v1 analysis | Confirmed OOS for v1: upload is passive storage; all AI photo/video interpretation is phase 2 |
| INC-03 | DFD has 7 processes; application has 10 modules | Explicitly mapped in 05-dfd-and-sequence-design.md §4; they are different decompositions (data-flow vs. functional); not an error |
| INC-04 | R&D mentions "about 10-15 verified service-information items" — exact count not specified | Confirmed as NEEDS CLARIFICATION (Q3); fixture of 10 items used for prototype until real list confirmed |
| INC-05 | R&D says "confidence >= gate" shows proposal — does this include cases where only one critical field is below 80%? | Specified in 11-ai-pipeline-and-safety.md: any single critical field below minimum confidence (location < 85%) → treated as below gate; conservative interpretation chosen |

---

## 7. Traceability for Department Workspace, Workload & Queue Management (Explicit Addition)

| Req ID | Requirement Description | Database Entities | API Endpoints | UI Views | Test Target |
|--------|------------------------|-------------------|---------------|----------|-------------|
| **FR-DEPT-ACCEPT** | Department acceptance and rejection with mandatory reason | `case_tasks` (`acceptance_status`, `rejection_reason_bn`) | `GET /tasks/department-requests`, `POST /tasks/{id}/accept`, `POST /tasks/{id}/reject` | `OfficerDepartmentRequestsPage` | T3, T13 |
| **FR-OFFICER-AVAIL** | 5-state officer availability, duty status & capacity | `officers` (`availability_status`, `max_concurrent_tasks`, `current_active_tasks`) | `GET /officers/availability`, `PUT /officers/{id}/availability`, `GET /officers/workload-summary` | `OfficerAvailabilityPage`, `OfficerWorkloadPage` | T7, T9 |
| **FR-ASSIGN-REC** | Deterministic explainable assignment recommendations | `officers`, `task_assignment_history` | `GET /tasks/{id}/recommendations`, `POST /tasks/{id}/assign` | `OfficerAssignmentRecommendationsModal` | T4, T8, T14 |
| **FR-WAIT-QUEUE** | Restart-persistent, concurrency-safe priority waiting queue | `task_waiting_queue` | `GET /tasks/waiting-queue`, `POST /tasks/queue/auto-dispatch` | `OfficerAssignmentQueuePage` | T5, T6, T10, T11, T12, T16, T17 |
| **FR-OFFICER-WORKSPACE** | Complete 9-view department officer workspace | Multiple | All department endpoints | Expanded officer features & routes | Full suite |

---

## 8. Complete Case Coordinator Workspace Traceability (R&D Sections 6.3, 10.8, 11, 14, 15)

| Group | Req ID | Feature Screen | Route | Database Entities | API Endpoints | Authorization & Governance | Test Coverage |
|-------|--------|----------------|-------|-------------------|---------------|----------------------------|---------------|
| **Overview** | **FR-COORD-01** | Coordinator Dashboard | `/coordinator` | `cases`, `case_tasks`, `hotspot_zones` | `GET /cases/coordinator/stats` | Jurisdiction-wide read | `test_coordinator_operations.py`, `coordinator_operations.test.mjs` |
| **Overview** | **FR-COORD-02** | Unified Case Board | `/coordinator/cases` | `cases`, `case_tasks` | `GET /cases` | Jurisdiction-wide read, filters by priority, ward, dept, age | `coordinator_operations.test.mjs` |
| **Operations** | **FR-COORD-03** | Multi-Department Coordination | `/coordinator/multi-dept` | `cases`, `case_tasks` | `GET /cases` | Compound cross-department cases oversight | `test_coordinator_operations.py` |
| **Operations** | **FR-COORD-04** | Task Sequence Planner | `/coordinator/sequence-planner` | `case_tasks` (`sequence_order`, `prerequisite_task_id`) | `POST /cases/{id}/approve-sequence` | Coordinator: Sequence approval; blocks start before prerequisite completion | `test_coordinator_operations.py`, `coordinator_operations.test.mjs` |
| **Operations** | **FR-COORD-05** | Department Handover | `/coordinator/handovers` | `case_tasks` (`acceptance_status`, `rejection_reason`) | `GET /tasks/department-requests` | History preserved on rejection; prompts coordinator reassignment | `coordinator_operations.test.mjs` |
| **Operations** | **FR-COORD-06** | Assignment Queue & Officer Workload | `/coordinator/workload` | `task_waiting_queue`, `officers` | `GET /tasks/waiting-queue`, `GET /officers/availability`, `POST /tasks/{id}/assign` | Deterministic explainability; ward coverage and capacity limits enforced | `test_officer_workflow.py`, `coordinator_operations.test.mjs` |
| **Operations** | **FR-COORD-07** | Duplicate Incident Review | `/coordinator/duplicates` | `cases` (`duplicate_children`, `canonical_case_id`) | `GET /reports/{id}/ai-proposal`, `POST /cases/{id}/merge`, `/unmerge` | Reversible merge; PII masked; single canonical incident pin | `test_duplicates_hotspots.py`, `coordinator_operations.test.mjs` |
| **Review** | **FR-COORD-08** | Evidence Review | `/coordinator/evidence-review` | `case_evidence` (`BEFORE`, `AFTER`, SHA-256) | `POST /cases/{id}/resolution-review` | Approve resolution or issue mandatory rework directive | `test_coordinator_operations.py`, `coordinator_operations.test.mjs` |
| **Review** | **FR-COORD-09** | Citizen Objections | `/coordinator/objections` | `cases` (`citizen_feedback`, `citizen_satisfaction_rating`) | `GET /cases/coordinator/objections`, `POST /cases/{id}/resolution-review` | Silence != satisfaction; coordinator reopens or documents uphold justification | `test_coordinator_operations.py`, `coordinator_operations.test.mjs` |
| **Review** | **FR-COORD-10** | Reopened Cases | `/coordinator/reopened-cases` | `cases` (`status=reopened`), `case_tasks` | `GET /cases` | Tracks repeated work scope and resubmission verification rules | `coordinator_operations.test.mjs` |
| **Review** | **FR-COORD-11** | Closure Review | `/coordinator/closure-review` | `cases` (`status=closed`), `audit_logs` | `POST /cases/{id}/close` | **Strict RBAC**: Coordinator/Admin only (Ward Desk/Citizen = 403); Evidence required (No evidence = 409 unless exception documented) | `test_coordinator_operations.py`, `coordinator_operations.test.mjs` |
| **Monitoring** | **FR-COORD-12** | SLA and Escalation | `/coordinator/escalations` | `case_tasks` (`sla_hours`, `started_at`) | `GET /cases` | Dynamic SLA countdown, pause conditions (materials, weather, utility NOC) | `test_sla_escalation.py`, `coordinator_operations.test.mjs` |
| **Monitoring** | **FR-COORD-13** | City Incident Map | `/coordinator/map` | `cases` (GeoLocation), `hotspot_zones` | `GET /cases`, `GET /hotspots/zones` | Geographic visualization, layers filter, strict citizen PII masking | `test_pii_masking.py`, `coordinator_operations.test.mjs` |
| **Monitoring** | **FR-COORD-14** | Hotspot & Repeat Analytics | `/coordinator/hotspots` | `hotspot_zones` (`recurrence_count`, `boundary_polygon`) | `GET /hotspots/zones` | Advisory recurrence detection; infrastructure renewal proposals | `test_duplicates_hotspots.py`, `coordinator_operations.test.mjs` |
| **Governance** | **FR-COORD-15** | Department Performance | `/coordinator/department-performance` | Aggregated persisted task data | `GET /cases/coordinator/department-performance` | Response/resolution times, waiting reasons, small-sample (<5) safeguards | `test_coordinator_operations.py`, `coordinator_operations.test.mjs` |
| **Governance** | **FR-COORD-16** | Case Audit History | `/coordinator/case-audit` | `audit_logs` (SHA-256 chain) | `GET /audit/logs?resource_type=CASE` | Case-level scope; cryptographic SHA-256 tamper-evidence; PII protected | `test_audit_log.py`, `coordinator_operations.test.mjs` |
| **Governance** | **FR-COORD-17** | Service-Level Targets | `/coordinator/sla-targets` | `sla_policies` | `GET /admin/sla-policies` | Coordinator has **Read-Only** access; Admin retains exclusive configuration | `test_coordinator_operations.py`, `coordinator_operations.test.mjs` |

---

## 9. Complete System Administrator & Governance Workspace Traceability (R&D Sections 6.4, 7, 10.11, 11, 11.2, 11.3)

| Group | Req ID | Feature Screen | Route | Database Entities | API Endpoints | Authorization & Governance | Test Coverage |
|-------|--------|----------------|-------|-------------------|---------------|----------------------------|---------------|
| **Governance** | **FR-ADMIN-01** | Governance Overview | `/admin` | `system_config`, `approval_requests`, `users`, `cases` | `GET /admin/health`, `GET /admin/accounts/summary`, `GET /admin/pending-approvals`, `GET /admin/analytics/aggregated` | Admin exclusive system health and cross-wing governance telemetry | `test_admin_governance.py` |
| **Governance** | **FR-ADMIN-02** | System Health | `/admin/health` | Diagnostic state | `GET /admin/health` | Real diagnostics: DB latency, Asyncio worker, local media storage, SMS gateway adapter, cache | `test_admin_governance.py` |
| **Governance** | **FR-ADMIN-03** | Pending Approvals | `/admin/pending-approvals` | `approval_requests` (`status=pending`) | `GET /admin/pending-approvals`, `POST /admin/pending-approvals/{id}/decide` | Dual approval enforcement (Four-Eyes Principle); blocks initiator self-approval (HTTP 400) | `test_admin_governance.py`, `admin_governance.test.mjs` |
| **Identity & Access** | **FR-ADMIN-04** | User Management | `/admin/users` | `users`, `user_scopes` | `GET /admin/users`, `POST /admin/users`, `PUT /admin/users/{id}`, `POST /admin/users/{id}/toggle-status` | Admin: Manages institutional staff; citizen private profiles separation preserved | `test_admin_governance.py`, `admin_governance.test.mjs` |
| **Identity & Access** | **FR-ADMIN-05** | Roles & RBAC | `/admin/roles` | RBAC Specification | `GET /admin/roles/matrix` | Complete 5-role institutional matrix (Table 30); displays separation of duties and negative RBAC rules | `test_admin_governance.py`, `admin_governance.test.mjs` |
| **Identity & Access** | **FR-ADMIN-06** | Account Status | `/admin/accounts` | `users` (`is_active`, `mfa_enabled`) | `GET /admin/accounts/summary` | Security hygiene, MFA adoption telemetry, locked accounts monitor | `test_admin_governance.py` |
| **Civic Data Registry** | **FR-ADMIN-07** | Department Directory | `/admin/departments` | `departments` | `GET /admin/departments`, `POST /admin/departments`, `PUT /admin/departments/{id}` | Official organizational hierarchy, department codes, head officers and hotlines | `test_admin_governance.py` |
| **Civic Data Registry** | **FR-ADMIN-08** | Officer Directory | `/admin/officers` | `officers`, `departments`, `wards` | `GET /admin/officers`, `POST /admin/officers` | Official contact info, ward/zone coverage, capacity limits, availability states | `test_admin_governance.py` |
| **Civic Data Registry** | **FR-ADMIN-09** | Ward & Asset Registry | `/admin/registry` | `wards`, `assets` | `GET /admin/wards`, `POST /admin/wards`, `GET /admin/assets`, `POST /admin/assets` | Physical asset ownership; strictly validates ward and department existence to prevent orphaned assets | `test_admin_governance.py`, `admin_governance.test.mjs` |
| **Rules & AI Governance** | **FR-ADMIN-10** | Responsibility Rules | `/admin/rules` | `responsibility_rules`, `departments` | `GET /admin/rules`, `POST /admin/rules` | Asset ownership mapping, default priorities, lead descriptions, and supporting departments | `test_admin_governance.py` |
| **Rules & AI Governance** | **FR-ADMIN-11** | Task-Sequencing Rules | `/admin/sequencing-rules` | Sequencing rules | `GET /admin/sequencing-rules` | Compound cross-department dependency rules (e.g. Waste -> Drain -> Road) visualizer | `test_admin_governance.py` |
| **Rules & AI Governance** | **FR-ADMIN-12** | AI Confidence Gate | `/admin/ai-gate` | `system_config` (`routing_confidence_gate`) | `GET /admin/gate-config`, `POST /admin/gate-config/update` | Raising gate allowed solo; lowering gate requires mandatory dual approval and audit record | `test_admin_governance.py`, `admin_governance.test.mjs` |
| **Rules & AI Governance** | **FR-ADMIN-13** | AI Safety Configuration | `/admin/ai-safety` | Safety configuration | `GET /admin/ai-safety-config` | Critical safety flags (Electric shock, Collapse, Manhole, Gas leak) & mandatory human triage mandates | `test_admin_governance.py` |
| **Service Knowledge** | **FR-ADMIN-14** | Verified Service Documents | `/admin/services` | `service_documents`, `service_document_chunks` | `GET /services/documents` | Official Citizen Charter metadata, verification dates, area applicability | `test_admin_governance.py` |
| **Service Knowledge** | **FR-ADMIN-15** | Service Sources | `/admin/service-sources` | Sources registry | `GET /admin/knowledge/sources` | Verified government circulars and official gazette references | `test_admin_governance.py` |
| **Service Knowledge** | **FR-ADMIN-16** | Knowledge Update History | `/admin/knowledge-history` | `audit_logs` (`SERVICE_DOCUMENT`) | `GET /admin/knowledge/history` | Immutable ingestion log and RAG vector update audit trail | `test_admin_governance.py` |
| **SLA & Operations** | **FR-ADMIN-17** | SLA Policies | `/admin/sla-policies` | `sla_policies` | `GET /admin/sla-policies`, `PUT /admin/sla-policies/{priority}` | Admin retains exclusive update rights; custom response and resolution targets per priority | `test_admin_governance.py` |
| **SLA & Operations** | **FR-ADMIN-18** | Escalation Configuration | `/admin/escalation-config` | Escalation settings | `GET /admin/escalation-config` | Tier 1 (ZEO) and Tier 2 (CEO) lead hours, auto SMS triggers and councillor alerts | `test_admin_governance.py` |
| **SLA & Operations** | **FR-ADMIN-19** | Public Dashboard Settings | `/admin/public-dashboard-settings` | Public config | `GET /admin/public-dashboard-config` | k=5 anonymity threshold, refresh interval, and citizen PII masking controls | `test_admin_governance.py` |
| **Audit & Security** | **FR-ADMIN-20** | Immutable Audit Log | `/admin/audit` | `audit_logs` (SHA-256 chain) | `GET /audit/logs` | Cryptographic tamper-evidence, state before/after diffs, append-only (no edit/delete) | `test_audit_log.py`, `test_admin_governance.py` |
| **Audit & Security** | **FR-ADMIN-21** | Security Events | `/admin/security-events` | `audit_logs` (Security actions) | `GET /admin/security-events` | Failed logins, 403 permission denials, safety gate changes and dual approvals | `test_admin_governance.py` |
| **Audit & Security** | **FR-ADMIN-22** | Configuration Change History | `/admin/config-history` | `audit_logs` (`SYSTEM_CONFIG`, `SLA_POLICY`) | `GET /admin/config-history` | Versioned parameter audit with administrative justifications | `test_admin_governance.py` |
| **Analytics & Transparency** | **FR-ADMIN-23** | Aggregated Service Metrics | `/admin/analytics` | `cases` (Aggregated) | `GET /admin/analytics/aggregated` | PII-free city-wide telemetry: volumes, resolution rates, emergency ratios | `test_admin_governance.py`, `admin_governance.test.mjs` |
| **Analytics & Transparency** | **FR-ADMIN-24** | Repeat-Issue Analytics | `/admin/repeat-issues` | `hotspots` | `GET /admin/analytics/repeat-issues` | 90-day recurring incident clusters, severity classifications, chronic asset alerts | `test_admin_governance.py` |
| **Analytics & Transparency** | **FR-ADMIN-25** | Public Transparency Metrics | `/admin/transparency-metrics` | Telemetry indices | `GET /admin/analytics/transparency` | Citizen satisfaction index, evidence compliance percentage, RTI compliance | `test_admin_governance.py` |
| **RBAC Negative Boundary** | **FR-ADMIN-26** | Admin Operational Restriction | All Routes | `cases`, `case_tasks`, `case_evidence` | `POST /cases/{id}/close` (403), `POST /cases/{id}/resolution-review` (403) | **Negative RBAC Enforcement**: Admin cannot close cases, approve evidence, or access raw citizen PII | `test_admin_governance.py`, `admin_governance.test.mjs` |

---

## 10. City Governance Head & Dual-Approval Policy Traceability (Approved Extension: Sixth Authority Role)

| Group | Req ID | Feature Screen | Route | Database Entities | API Endpoints | Authorization & Governance | Test Coverage |
|-------|--------|----------------|-------|-------------------|---------------|----------------------------|---------------|
| **Municipal Policy** | **FR-GOV-01** | Governance Overview | `/governance` | `cases`, `system_config`, `policy_change_requests` | `GET /governance/overview` | Exclusively accessible by City Governance Head; municipal health, policy version, and compliance overview | `test_governance_separation.py` |
| **Dual Approval** | **FR-GOV-02** | Pending Policy Approvals | `/governance/approvals` | `policy_change_requests` | `GET /governance/policy-requests`, `POST /governance/policy-requests/{id}/decide` | Mandatory dual approval for protected policy; strictly blocks same individual from approving both capacities | `test_governance_separation.py` |
| **Municipal Policy** | **FR-GOV-03** | Propose Policy Change | `/governance/approvals` | `policy_change_requests` | `POST /governance/policy-requests` | Initiates policy change request in `pending_technical_review` state; records category, version, and rationale | `test_governance_separation.py` |
| **Municipal Policy** | **FR-GOV-04** | Responsibility Policies | `/governance/responsibility-rules` | `responsibility_rules` | `GET /governance/responsibility-rules` | Reviews municipal responsibility allocation across departments; protected from unilateral admin edits | `test_governance_separation.py` |
| **Municipal Policy** | **FR-GOV-05** | Task-Sequencing Rules | `/governance/task-sequencing` | Sequencing rules | `GET /governance/sequencing-rules` | Multi-department sequencing pipelines (e.g., Waste $\rightarrow$ Drain $\rightarrow$ Road) enforcement review | `test_governance_separation.py` |
| **AI Governance** | **FR-GOV-06** | AI Gate Approval | `/governance/ai-gate` | `system_config` (`routing_confidence_gate`), `policy_change_requests` | `GET /governance/ai-gate`, `POST /governance/policy-requests` | Lowering AI gate from 80% baseline requires dual approval + held-out model revalidation ($N \ge 250$) | `test_governance_separation.py` |
| **SLA Ownership** | **FR-GOV-07** | Municipal SLA Policies | `/governance/sla-policy` | `sla_policies` | `GET /governance/sla-policies`, `PUT /governance/sla-policies/{priority}` | Municipal SLA targets owned by City Governance Head; System Admin assists technical implementation only | `test_governance_separation.py` |
| **Oversight** | **FR-GOV-08** | Escalated Cases Oversight | `/governance/escalations` | `cases`, `sla_events` | `GET /governance/escalations` | Minimum-necessary case context (tracking number, ward, priority, escalation tier); strictly **NO citizen PII** | `test_governance_separation.py` |
| **Analytics** | **FR-GOV-09** | Service Performance Analytics | `/governance/service-performance` | `cases`, `case_tasks` | `GET /governance/service-performance` | Aggregated city-wide resolution rates; small sample suppression ($<5$); zero citizen phone/names | `test_governance_separation.py` |
| **Analytics** | **FR-GOV-10** | Hotspot & Recurring-Issue Review | `/governance/recurring-issues` | `hotspots`, `wards` | `GET /governance/recurring-issues` | Chronic repeat asset failures and multi-incident density clusters for policy resource allocation | `test_governance_separation.py` |
| **Transparency** | **FR-GOV-11** | Public Transparency Policy | `/governance/transparency-policy` | `system_config` (`public_transparency_policy`) | `GET /governance/transparency-policy`, `PUT /governance/transparency-policy` | Governance defines public disclosure thresholds, $k$-anonymity minimums, and privacy masking rules | `test_governance_separation.py` |
| **Audit & History** | **FR-GOV-12** | Policy Versions & Approval History | `/governance/history` | `policy_change_requests`, `audit_logs` | `GET /governance/history` | Complete historical audit trail of policy revisions, dual approval timestamps, and SHA-256 hash chains | `test_governance_separation.py` |
| **Technical Admin** | **FR-ADMIN-27** | Infrastructure Diagnostics | `/admin/infrastructure` | Diagnostic state | `GET /admin/infrastructure` | Technical platform operations (DB connection pool, queue depth, cache hit ratio); forbidden to Governance Head | `test_governance_separation.py` |
| **Technical Admin** | **FR-ADMIN-28** | Technical Configuration | `/admin/technical-config` | Configuration state | `GET /admin/technical-config` | Technical platform settings (token TTL, CORS, rate limits); does not alter municipal policy independently | `test_governance_separation.py` |
| **Technical Admin** | **FR-ADMIN-29** | Technical Policy Review | `/admin/policy-requests` | `policy_change_requests` | `POST /admin/policy-requests/{id}/technical-review` | Technical feasibility verification; cannot unilaterally enact protected municipal policies | `test_governance_separation.py` |
| **RBAC Negative Boundary** | **FR-GOV-13** | Governance Head Scope Restrictions | All Routes | `users`, `infrastructure` | `POST /admin/users` (403), `GET /admin/infrastructure` (403) | **Negative RBAC Enforcement**: Governance Head cannot provision users or access database secrets | `test_governance_separation.py` |
| **RBAC Negative Boundary** | **FR-GOV-14** | Shared Case Closure Restriction | `/cases/{id}/close` | `cases` | `POST /cases/{id}/close` (403 for Admin, 403 for Governance Head) | Neither System Admin nor City Governance Head can close operational cases (Coordinator only) | `test_governance_separation.py` |

---

## 11. System Administrator Account & Identity Management (IAM Traceability)

| Group | Req ID | Feature Screen / Tab | Route / Endpoint | Database Entities | API Endpoints | Business & Security Rules | Test Coverage |
|-------|--------|----------------------|------------------|-------------------|---------------|---------------------------|---------------|
| **Account Overview** | **FR-IAM-01** | Account Dashboard | `/admin/accounts` (Dashboard Tab) | `users`, `audit_logs`, `privileged_role_requests` | `GET /api/admin/accounts/dashboard` | Real aggregated statistics (total, active, pending, suspended, locked, must_change_password); review queue; zero fabricated counts | `test_account_identity_management.py` |
| **Member Provisioning** | **FR-IAM-02** | Create Member Account | `/admin/accounts` (Create Tab) | `users`, `user_scopes`, `audit_logs` | `POST /api/admin/users` | Validates uniqueness of login identifiers, role delegation, department/ward scoping; displays temporary password once in controlled dialog | `test_account_identity_management.py`, `account_identity.test.mjs` |
| **Privileged Role Protection** | **FR-IAM-03** | Governance Head Elevation | `/admin/privileged-role-requests` & `/governance/privileged-role-requests` | `privileged_role_requests`, `users`, `audit_logs` | `POST /api/admin/privileged-role-requests`, `POST /api/governance/privileged-role-requests/{id}/decide` | Admin blocked from unilateral elevation to `governance_head`; explicit approval workflow with self-approval prohibition | `test_account_identity_management.py`, `account_identity.test.mjs` |
| **Lifecycle State Machine** | **FR-IAM-04** | Status Transitions | `/admin/accounts` (Directory Tab) | `users`, `audit_logs` | `PUT /api/admin/users/{id}/status` | Enforces valid lifecycle states: `pending` $\rightarrow$ `active` $\rightarrow$ `suspended` $\rightarrow$ `deactivated`; no cascading delete of audit records | `test_account_identity_management.py`, `account_identity.test.mjs` |
| **Identifier Management** | **FR-IAM-05** | Login Identifier Changes | `/admin/accounts` (Identifier History) | `account_identifier_histories`, `users` | `POST /api/admin/users/{id}/change-identifier`, `GET /api/admin/users/{id}/identifier-history` | Append-only history preserving immutable primary UUIDs; masks sensitive citizen emails and phones; records actor and verification status | `test_account_identity_management.py` |
| **Password Management** | **FR-IAM-06** | Password Reset & Temporary Credentials | `/admin/accounts` (Reset Dialog) | `users`, `audit_logs` | `POST /api/admin/users/{id}/reset-password`, `POST /api/auth/change-password` | Strong 12+ char temporary password shown once; forces first-login replacement (`must_change_password`); never persisted in plaintext or audit logs | `test_account_identity_management.py`, `account_identity.test.mjs` |
| **Session Control** | **FR-IAM-07** | Session Invalidation | `/admin/accounts` (Directory Tab) | `users` (`sessions_revoked_at`) | `POST /api/admin/users/{id}/revoke-sessions` | Microsecond-precision `iat` token validation in auth dependencies immediately invalidates compromised sessions | `test_account_identity_management.py` |
| **Authentication Security** | **FR-IAM-08** | Lockout & Failed Login Throttling | `/api/auth/login` | `users` (`failed_login_attempts`, `locked_until`) | `POST /api/auth/login` | 5 failed authentication attempts triggers 15-minute lockout; audits failed events with zero secret or password leakage | `test_account_identity_management.py`, `account_identity.test.mjs` |
| **Security History** | **FR-IAM-09** | Account Security Activity Trail | `/admin/accounts` (Security Log Tab) | `audit_logs` | `GET /api/admin/security-history` | Audit log of security actions (`CREATE_USER`, `ACCOUNT_STATUS_CHANGE`, `LOGIN_IDENTIFIER_CHANGED`, `PASSWORD_RESET_COMPLETED`, `SESSIONS_REVOKED`, `ACCOUNT_LOCKED`); zero secret leakage | `test_account_identity_management.py`, `account_identity.test.mjs` |
| **Citizen Privacy Protection** | **FR-IAM-10** | Contact Masking in Admin Views | `/admin/accounts` (Directory Tab) | `users` | `GET /api/admin/accounts` | Masked citizen emails (`c***@domain.com`) and phone numbers (`017****5678`); prevents technical admins from harvesting raw citizen PII | `test_account_identity_management.py`, `account_identity.test.mjs` |




