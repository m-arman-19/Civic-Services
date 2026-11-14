import test from 'node:test';
import assert from 'node:assert/strict';

// ==========================================
// 1. Coordinator Jurisdiction Scope & RBAC
// ==========================================
function checkJurisdictionAccess(user, targetWardId) {
  if (user.role === 'admin' || user.role === 'coordinator') {
    return { allowed: true, scope: 'city_corporation_wide' };
  }
  if (user.role === 'ward_desk') {
    if (user.ward_id === targetWardId) {
      return { allowed: true, scope: 'ward_scoped' };
    }
    return { allowed: false, error: 'Ward Desk user cannot access cases outside assigned ward' };
  }
  return { allowed: false, error: 'Forbidden' };
}

test('Coordinator Jurisdiction: City-wide access vs Ward Desk restriction', () => {
  const coordinator = { id: 'usr-coord', role: 'coordinator' };
  const wardDesk = { id: 'usr-ward12', role: 'ward_desk', ward_id: 'ward_12' };

  // Coordinator can coordinate across Ward 12, Ward 15, Ward 19
  assert.equal(checkJurisdictionAccess(coordinator, 'ward_12').allowed, true);
  assert.equal(checkJurisdictionAccess(coordinator, 'ward_15').allowed, true);
  assert.equal(checkJurisdictionAccess(coordinator, 'ward_19').allowed, true);

  // Ward Desk cannot access outside its ward
  assert.equal(checkJurisdictionAccess(wardDesk, 'ward_12').allowed, true);
  assert.equal(checkJurisdictionAccess(wardDesk, 'ward_19').allowed, false);
});

// ==========================================
// 2. Case-Plan Approval & Prerequisite Enforcement
// ==========================================
function evaluateTaskSequenceExecution(tasks, taskIdToStart) {
  const task = tasks.find(t => t.id === taskIdToStart);
  if (!task) return { canStart: false, error: 'টাস্ক পাওয়া যায়নি।' };

  if (task.prerequisite_task_id) {
    const prereq = tasks.find(t => t.id === task.prerequisite_task_id);
    if (!prereq || prereq.status !== 'resolved' && prereq.status !== 'verified_completed') {
      return {
        canStart: false,
        error: `পূর্বশর্ত অবরুদ্ধ: '${prereq ? prereq.title : 'পূর্ববর্তী কাজ'}' সম্পন্ন হওয়ার আগে এই কাজ শুরু করা যাবে না।`
      };
    }
  }

  return { canStart: true, task };
}

test('Task Sequence Planner: Prerequisite rules prevent starting dependent work', () => {
  const tasks = [
    { id: 't1', title: 'ড্রেন স্লাব অপসারণ ও বর্জ্য উত্তোলন', status: 'in_progress', prerequisite_task_id: null },
    { id: 't2', title: 'ড্রেনেজ পাইপ মেরামত ও পুনঃস্থাপন', status: 'pending_dependency', prerequisite_task_id: 't1' }
  ];

  // Attempting to start Task 2 while Task 1 is in_progress should fail
  const blockedCheck = evaluateTaskSequenceExecution(tasks, 't2');
  assert.equal(blockedCheck.canStart, false);
  assert.match(blockedCheck.error, /পূর্বশর্ত অবরুদ্ধ/);

  // Once Task 1 is resolved, Task 2 can start
  tasks[0].status = 'verified_completed';
  const readyCheck = evaluateTaskSequenceExecution(tasks, 't2');
  assert.equal(readyCheck.canStart, true);
});

// ==========================================
// 3. Department Handover & Rejection History
// ==========================================
function handleDepartmentRejection(task, rejectionReason) {
  if (!rejectionReason || rejectionReason.trim().length < 5) {
    return { success: false, error: 'প্রত্যাখ্যানের সুনির্দিষ্ট কারণ উল্লেখ করা বাধ্যতামূলক।' };
  }

  return {
    success: true,
    task: {
      ...task,
      acceptance_status: 'rejected',
      rejection_reason: rejectionReason,
      requires_review: true
    },
    audit_entry: {
      action: 'TASK_REJECTED',
      task_id: task.id,
      reason: rejectionReason,
      case_history_preserved: true
    }
  };
}

test('Department Handover: Rejection preserves case history and records reason', () => {
  const task = { id: 'task-eng-01', title: 'সড়ক ড্রিলিং', department: 'engineering', acceptance_status: 'pending' };

  // Fails with empty reason
  const fail = handleDepartmentRejection(task, '');
  assert.equal(fail.success, false);

  // Succeeds with documented reason, flags for coordinator review
  const pass = handleDepartmentRejection(task, 'এটি প্রধান গ্যাস পাইপলাইনের আওতাধীন, তিতাস গ্যাস দলের উপস্থিতি প্রয়োজন।');
  assert.equal(pass.success, true);
  assert.equal(pass.task.acceptance_status, 'rejected');
  assert.equal(pass.task.requires_review, true);
  assert.equal(pass.audit_entry.case_history_preserved, true);
});

// ==========================================
// 4. Assignment Queue & Recommender Engine
// ==========================================
function calculateOfficerSuitability(officer, task) {
  let score = 0.5; // base

  // Ward coverage match (+0.3)
  if (officer.ward_id === task.ward_id || (officer.ward_coverage && officer.ward_coverage.includes(task.ward_id))) {
    score += 0.3;
  }

  // Workload capacity (+0.2 if load < 50%, -0.3 if at max capacity)
  const currentTasks = officer.current_active_tasks || 0;
  const maxCapacity = officer.max_capacity || 4;
  if (currentTasks >= maxCapacity) {
    return { eligible: false, score: 0, reason: 'কর্মকর্তা বর্তমানে সর্বোচ্চ ধারণক্ষমতায় আছেন।' };
  } else if (currentTasks / maxCapacity <= 0.5) {
    score += 0.2;
  }

  return { eligible: true, score: Math.min(score, 1.0) };
}

test('Assignment Queue: Recommends officer based on workload and ward proximity', () => {
  const task = { id: 'task-10', ward_id: 'ward_12' };
  const officerA = { id: 'off-a', name: 'কামরুল', ward_id: 'ward_12', current_active_tasks: 1, max_capacity: 4 };
  const officerB = { id: 'off-b', name: 'রফিক', ward_id: 'ward_19', current_active_tasks: 4, max_capacity: 4 };

  const recA = calculateOfficerSuitability(officerA, task);
  const recB = calculateOfficerSuitability(officerB, task);

  assert.equal(recA.eligible, true);
  assert.equal(recA.score, 1.0); // 0.5 + 0.3 + 0.2

  assert.equal(recB.eligible, false);
  assert.match(recB.reason, /সর্বোচ্চ ধারণক্ষমতা/);
});

// ==========================================
// 5. Duplicate Merge & Reversal
// ==========================================
function mergeCases(parentCase, childCase, coordinatorUser, mergeNotes) {
  if (coordinatorUser.role !== 'coordinator' && coordinatorUser.role !== 'admin') {
    return { success: false, error: '403 Forbidden: কেবল সমন্বয়ক ডুপ্লিকেট মার্জ করতে পারেন।' };
  }

  const updatedParent = {
    ...parentCase,
    duplicate_children: [...(parentCase.duplicate_children || []), childCase.id]
  };

  const updatedChild = {
    ...childCase,
    status: 'merged',
    merged_into_case_id: parentCase.id,
    merge_notes: mergeNotes
  };

  return { success: true, parent: updatedParent, child: updatedChild };
}

function reverseMerge(parentCase, childCase, coordinatorUser, reason) {
  if (coordinatorUser.role !== 'coordinator' && coordinatorUser.role !== 'admin') {
    return { success: false, error: '403 Forbidden' };
  }

  const updatedParent = {
    ...parentCase,
    duplicate_children: (parentCase.duplicate_children || []).filter(id => id !== childCase.id)
  };

  const restoredChild = {
    ...childCase,
    status: 'in_progress',
    merged_into_case_id: null,
    unmerge_reason: reason
  };

  return { success: true, parent: updatedParent, child: restoredChild };
}

test('Duplicate Review: Merge and Reversal by Coordinator with audit note', () => {
  const coordinator = { role: 'coordinator' };
  const wardDesk = { role: 'ward_desk' };

  const parent = { id: 'case-parent', duplicate_children: [] };
  const child = { id: 'case-child', status: 'submitted' };

  // Non-coordinator blocked
  assert.equal(mergeCases(parent, child, wardDesk, 'একই ড্রেন').success, false);

  // Coordinator merges
  const merged = mergeCases(parent, child, coordinator, 'একই এলাকার বর্জ্য স্তূপ');
  assert.equal(merged.success, true);
  assert.equal(merged.child.status, 'merged');
  assert.equal(merged.parent.duplicate_children.includes('case-child'), true);

  // Coordinator reverses merge
  const reversed = reverseMerge(merged.parent, merged.child, coordinator, 'ভিন্ন স্থান প্রমাণিত হওয়ায় মার্জ বাতিল');
  assert.equal(reversed.success, true);
  assert.equal(reversed.child.status, 'in_progress');
  assert.equal(reversed.parent.duplicate_children.length, 0);
});

// ==========================================
// 6. Case Closure Rules & Citizen Objections
// ==========================================
function validateCaseClosure(caseRecord, user, { satisfaction_confirmed, exception_documented, closure_notes }) {
  // RBAC enforcement: Coordinator or Admin only
  if (user.role !== 'coordinator' && user.role !== 'admin') {
    return { allowed: false, status_code: 403, error: 'কেবলমাত্র অনুমোদিত কেস সমন্বয়ক কেস বন্ধ করতে পারেন।' };
  }

  // R&D Section 11.3: Evidence proof required unless administrative exception documented
  const hasProof = caseRecord.has_resolution_evidence || false;
  if (!hasProof && !exception_documented) {
    return {
      allowed: false,
      status_code: 409,
      error: 'সমাধানের প্রমাণক (AFTER Photo) ব্যতিরেকে কেস বন্ধ করা নিষিদ্ধ। বিশেষ কারণে ব্যতিক্রম নথিভুক্ত করুন।'
    };
  }

  // Silence cannot count as automatic satisfaction
  if (!satisfaction_confirmed && !exception_documented) {
    return {
      allowed: false,
      status_code: 422,
      error: 'নাগরিক সন্তুষ্টি বা প্রশাসনিক ব্যতিক্রমের নিশ্চয়তা আবশ্যক।'
    };
  }

  return { allowed: true, status_code: 200, status: 'closed' };
}

test('Case Closure: Enforces Coordinator role, Evidence Proof, and Administrative Exception rules', () => {
  const coord = { role: 'coordinator' };
  const ward = { role: 'ward_desk' };
  const citizen = { role: 'citizen' };

  const caseWithProof = { id: 'c1', has_resolution_evidence: true };
  const caseWithoutProof = { id: 'c2', has_resolution_evidence: false };

  // Ward Desk and Citizen cannot close (403)
  assert.equal(validateCaseClosure(caseWithProof, ward, { satisfaction_confirmed: true }).status_code, 403);
  assert.equal(validateCaseClosure(caseWithProof, citizen, { satisfaction_confirmed: true }).status_code, 403);

  // Closure without proof blocked with 409
  const blockedProof = validateCaseClosure(caseWithoutProof, coord, { satisfaction_confirmed: true, exception_documented: false });
  assert.equal(blockedProof.status_code, 409);

  // Closure without proof allowed ONLY with documented administrative exception
  const exceptionClosure = validateCaseClosure(caseWithoutProof, coord, {
    satisfaction_confirmed: false,
    exception_documented: true,
    closure_notes: 'বিশেষ মেগা প্রকল্পের আওতাভুক্ত হওয়ায় দীর্ঘমেয়াদী পরিকল্পনায় হস্তান্তর'
  });
  assert.equal(exceptionClosure.status_code, 200);

  // Normal closure with verified proof succeeds
  const normalClosure = validateCaseClosure(caseWithProof, coord, { satisfaction_confirmed: true, exception_documented: false });
  assert.equal(normalClosure.status_code, 200);
});

// ==========================================
// 7. Hotspot Recurrence Logic
// ==========================================
function evaluateHotspotRecurrence(incidentsInZone, threshold = 3) {
  if (incidentsInZone.length >= threshold) {
    return {
      isHotspot: true,
      incidentCount: incidentsInZone.length,
      severity: incidentsInZone.length >= 6 ? 'critical' : 'moderate',
      suggestion: 'বারংবার সমস্যা শনাক্ত হয়েছে। ড্রেনেজ চ্যানেল স্থায়ী পুনর্নির্মাণ সুপারিশকৃত।'
    };
  }
  return { isHotspot: false, incidentCount: incidentsInZone.length };
}

test('Hotspot Recurrence: Advisory trigger when incident threshold reached', () => {
  const normalCluster = [{ id: '1' }, { id: '2' }];
  const repeatCluster = [{ id: '1' }, { id: '2' }, { id: '3' }, { id: '4' }];

  assert.equal(evaluateHotspotRecurrence(normalCluster).isHotspot, false);

  const hotspot = evaluateHotspotRecurrence(repeatCluster);
  assert.equal(hotspot.isHotspot, true);
  assert.equal(hotspot.incidentCount, 4);
  assert.match(hotspot.suggestion, /স্থায়ী পুনর্নির্মাণ/);
});

// ==========================================
// 8. Service-Level Targets & RBAC Boundaries
// ==========================================
function checkSlaTargetConfigPermissions(user) {
  if (user.role === 'admin') {
    return { canView: true, canEdit: true };
  }
  if (user.role === 'coordinator') {
    return { canView: true, canEdit: false, notice: 'সমন্বয়ক কেবল এসএলএ লক্ষ্যমাত্রা পর্যবেক্ষণ করতে পারেন।' };
  }
  return { canView: false, canEdit: false };
}

test('Service-Level Targets: Coordinator has Read-Only view, Admin has Edit', () => {
  const coord = { role: 'coordinator' };
  const admin = { role: 'admin' };
  const ward = { role: 'ward_desk' };

  assert.deepEqual(checkSlaTargetConfigPermissions(coord), {
    canView: true,
    canEdit: false,
    notice: 'সমন্বয়ক কেবল এসএলএ লক্ষ্যমাত্রা পর্যবেক্ষণ করতে পারেন।'
  });

  assert.deepEqual(checkSlaTargetConfigPermissions(admin), {
    canView: true,
    canEdit: true
  });

  assert.equal(checkSlaTargetConfigPermissions(ward).canView, false);
});
