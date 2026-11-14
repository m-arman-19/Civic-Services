import test from 'node:test';
import assert from 'node:assert/strict';

// ==========================================
// 1. Ward-Scoped Access & PII Protection
// ==========================================
function enforceWardScope(user, targetWardId) {
  if (user.role === 'admin' || user.role === 'coordinator') {
    return { allowed: true };
  }
  if (user.role === 'ward_desk') {
    if (user.ward_id === targetWardId || (user.assigned_ward_ids && user.assigned_ward_ids.includes(targetWardId))) {
      return { allowed: true };
    }
    return { allowed: false, error: 'Forbidden: Ward Desk user is restricted to assigned ward(s)' };
  }
  return { allowed: false, error: 'Forbidden' };
}

function sanitizeCitizenPII(caseRecord, viewerRole) {
  if (viewerRole === 'admin' || viewerRole === 'coordinator') {
    return caseRecord;
  }
  const sanitized = { ...caseRecord };
  if (sanitized.citizenPhone) {
    sanitized.citizenPhone = sanitized.citizenPhone.slice(0, 5) + 'XXXX' + sanitized.citizenPhone.slice(-2);
  }
  return sanitized;
}

test('Ward Scope Enforcement: Prevents Cross-Ward Operations', () => {
  const wardUser = { id: 'u_ward1', role: 'ward_desk', ward_id: 'ward_19' };
  
  const ownWardCheck = enforceWardScope(wardUser, 'ward_19');
  assert.equal(ownWardCheck.allowed, true);

  const crossWardCheck = enforceWardScope(wardUser, 'ward_20');
  assert.equal(crossWardCheck.allowed, false);
  assert.match(crossWardCheck.error, /restricted to assigned ward/);
});

test('Citizen Privacy & PII Separation', () => {
  const rawCase = {
    id: 'NS-2026-001',
    citizenName: 'রহিমা বেগম',
    citizenPhone: '01712345678',
    wardId: 'ward_19'
  };

  const masked = sanitizeCitizenPII(rawCase, 'ward_desk');
  assert.equal(masked.citizenPhone, '01712XXXX78');
});

// ==========================================
// 2. Report Intake, Assisted Consent & Emergency Workflow
// ==========================================
function validateAssistedIntake(data) {
  if (!data.citizen_consent) {
    return { valid: false, error: 'নাগরিকের স্পষ্ট সম্মতি ছাড়া সহায়তা ইনটেক গৃহীত হবে না।' };
  }
  if (!data.citizen_name || !data.citizen_phone) {
    return { valid: false, error: 'নাগরিকের নাম এবং সচল ফোন নম্বর বাধ্যতামূলক।' };
  }
  if (!data.description || data.description.trim().length < 10) {
    return { valid: false, error: 'সমস্যার বিস্তারিত বিবরণ ন্যূনতম ১০ অক্ষর হতে হবে।' };
  }
  return { valid: true };
}

function determineIntakeWorkflow(report) {
  if (report.hasEmergencySignals || report.priority === 'critical') {
    return { workflow: 'EMERGENCY_DISPATCH', requiresImmediateEscalation: true };
  }
  return { workflow: 'STANDARD_TRIAGE', requiresImmediateEscalation: false };
}

test('Assisted Intake Requires Citizen Consent', () => {
  const withoutConsent = {
    citizen_name: 'আব্দুল করিম',
    citizen_phone: '01811223344',
    description: 'রাস্তা ভাঙা পানি জমে আছে',
    citizen_consent: false
  };
  const result1 = validateAssistedIntake(withoutConsent);
  assert.equal(result1.valid, false);
  assert.match(result1.error, /সম্মতি ছাড়া/);

  const withConsent = { ...withoutConsent, citizen_consent: true };
  const result2 = validateAssistedIntake(withConsent);
  assert.equal(result2.valid, true);
});

test('Emergency Intake Trigger', () => {
  const emergencyCase = {
    id: 'NS-2026-999',
    hasEmergencySignals: true,
    priority: 'critical'
  };
  const workflow = determineIntakeWorkflow(emergencyCase);
  assert.equal(workflow.workflow, 'EMERGENCY_DISPATCH');
  assert.equal(workflow.requiresImmediateEscalation, true);
});

// ==========================================
// 3. AI 80% Routing Confidence Gate
// ==========================================
function evaluateAiRoutingGate(aiAnalysis) {
  const GATE_THRESHOLD = 80;
  if (aiAnalysis.confidenceScore >= GATE_THRESHOLD && !aiAnalysis.safetyFlags?.length) {
    return {
      canPrefill: true,
      requiresManualTriage: false,
      reason: 'AI confidence satisfies 80% gate and has no safety flags'
    };
  }
  return {
    canPrefill: false,
    requiresManualTriage: true,
    reason: aiAnalysis.confidenceScore < GATE_THRESHOLD
      ? `AI confidence ${aiAnalysis.confidenceScore}% is below 80% threshold`
      : 'Safety flag present, requiring human scrutiny'
  };
}

test('AI Confidence Gate: Below 80% routes to Manual Verification', () => {
  const lowConfidence = { confidenceScore: 68, safetyFlags: [] };
  const gateCheck = evaluateAiRoutingGate(lowConfidence);
  assert.equal(gateCheck.canPrefill, false);
  assert.equal(gateCheck.requiresManualTriage, true);
  assert.match(gateCheck.reason, /below 80% threshold/);

  const highConfidence = { confidenceScore: 92, safetyFlags: [] };
  const gatePass = evaluateAiRoutingGate(highConfidence);
  assert.equal(gatePass.canPrefill, true);
  assert.equal(gatePass.requiresManualTriage, false);
});

test('AI Confidence Gate: Safety Flags enforce Human Triage even at 95% Confidence', () => {
  const highConfWithFlag = { confidenceScore: 95, safetyFlags: ['FIRE_RISK', 'EXPOSED_HIGH_VOLTAGE'] };
  const gateCheck = evaluateAiRoutingGate(highConfWithFlag);
  assert.equal(gateCheck.canPrefill, false);
  assert.equal(gateCheck.requiresManualTriage, true);
  assert.match(gateCheck.reason, /Safety flag present/);
});

// ==========================================
// 4. Multi-Department Case Planner & Sequential Prerequisites
// ==========================================
function validateTaskSequencing(tasks) {
  // Demonstration scenario: Waste removal (1) -> Drain cleaning (2) -> Road repair (3)
  for (let i = 0; i < tasks.length; i++) {
    const current = tasks[i];
    if (current.prerequisiteTaskId) {
      const prereq = tasks.find(t => t.id === current.prerequisiteTaskId);
      if (!prereq) {
        return { valid: false, error: `Task ${current.id} references non-existent prerequisite ${current.prerequisiteTaskId}` };
      }
      if (prereq.sequenceOrder >= current.sequenceOrder) {
        return { valid: false, error: `Prerequisite ${prereq.id} must have earlier sequence order than ${current.id}` };
      }
    }
  }
  return { valid: true };
}

function canTaskStart(task, allTasks) {
  if (!task.prerequisiteTaskId) {
    return { canStart: true, reason: 'No prerequisite' };
  }
  const prereq = allTasks.find(t => t.id === task.prerequisiteTaskId);
  if (!prereq || prereq.status !== 'resolved') {
    return {
      canStart: false,
      reason: `Blocked: waiting on ${prereq ? prereq.title : 'upstream task'} to finish`
    };
  }
  return { canStart: true, reason: 'Prerequisite completed' };
}

test('Multi-Department Demonstration Scenario: Waste -> Drain -> Road', () => {
  const tasks = [
    { id: 'T1', sequenceOrder: 1, title: 'Waste removal', status: 'in_progress', prerequisiteTaskId: null },
    { id: 'T2', sequenceOrder: 2, title: 'Drain cleaning', status: 'pending_dependency', prerequisiteTaskId: 'T1' },
    { id: 'T3', sequenceOrder: 3, title: 'Road repair', status: 'pending_dependency', prerequisiteTaskId: 'T2' }
  ];

  const validation = validateTaskSequencing(tasks);
  assert.equal(validation.valid, true);

  // Road repair cannot start while drain cleaning is not resolved
  const roadCheck = canTaskStart(tasks[2], tasks);
  assert.equal(roadCheck.canStart, false);
  assert.match(roadCheck.reason, /waiting on Drain cleaning/);

  // Complete Waste and Drain
  tasks[0].status = 'resolved';
  tasks[1].status = 'resolved';

  const roadCheckAfter = canTaskStart(tasks[2], tasks);
  assert.equal(roadCheckAfter.canStart, true);
});

// ==========================================
// 5. Duplicate Incident Merging & Reversibility
// ==========================================
function mergeDuplicateCases(primaryCase, duplicateCase, operatorRole) {
  if (operatorRole !== 'ward_desk' && operatorRole !== 'coordinator' && operatorRole !== 'admin') {
    return { success: false, error: 'Unauthorized duplicate operation' };
  }
  if (primaryCase.id === duplicateCase.id) {
    return { success: false, error: 'Cannot merge a case with itself' };
  }

  const updatedPrimary = {
    ...primaryCase,
    duplicateCases: [...(primaryCase.duplicateCases || []), duplicateCase.id]
  };

  const updatedDuplicate = {
    ...duplicateCase,
    status: 'merged',
    mergedIntoCaseId: primaryCase.id,
    mergeHistory: {
      mergedInto: primaryCase.id,
      timestamp: new Date().toISOString(),
      previousStatus: duplicateCase.status
    }
  };

  return { success: true, updatedPrimary, updatedDuplicate };
}

function reverseMergeCase(primaryCase, duplicateCase) {
  if (duplicateCase.mergedIntoCaseId !== primaryCase.id) {
    return { success: false, error: 'Case is not merged into this primary' };
  }

  const updatedPrimary = {
    ...primaryCase,
    duplicateCases: (primaryCase.duplicateCases || []).filter(id => id !== duplicateCase.id)
  };

  const updatedDuplicate = {
    ...duplicateCase,
    status: duplicateCase.mergeHistory?.previousStatus || 'submitted',
    mergedIntoCaseId: null,
    unmergedAt: new Date().toISOString()
  };

  return { success: true, updatedPrimary, updatedDuplicate };
}

test('Reversible Duplicate Merging preserves history and restores case', () => {
  const primary = { id: 'NS-001', duplicateCases: [] };
  const duplicate = { id: 'NS-002', status: 'submitted' };

  // 1. Merge
  const mergeResult = mergeDuplicateCases(primary, duplicate, 'ward_desk');
  assert.equal(mergeResult.success, true);
  assert.equal(mergeResult.updatedPrimary.duplicateCases.length, 1);
  assert.equal(mergeResult.updatedDuplicate.status, 'merged');
  assert.equal(mergeResult.updatedDuplicate.mergedIntoCaseId, 'NS-001');

  // 2. Reverse Merge
  const unmergeResult = reverseMergeCase(mergeResult.updatedPrimary, mergeResult.updatedDuplicate);
  assert.equal(unmergeResult.success, true);
  assert.equal(unmergeResult.updatedPrimary.duplicateCases.length, 0);
  assert.equal(unmergeResult.updatedDuplicate.status, 'submitted');
  assert.equal(unmergeResult.updatedDuplicate.mergedIntoCaseId, null);
});

// ==========================================
// 6. Evidence Review & Citizen Objection Reopening
// ==========================================
function processCitizenObjection(caseRecord, objection) {
  if (!objection.reasons || objection.reasons.length === 0) {
    return { success: false, error: 'আপত্তির কারণ উল্লেখ করা আবশ্যক।' };
  }

  // Preserve history and reopen
  const updatedCase = {
    ...caseRecord,
    status: 'reopened',
    objection: {
      ...objection,
      submittedAt: new Date().toISOString(),
      status: 'pending_review'
    },
    lifecycle: [
      ...(caseRecord.lifecycle || []),
      {
        action: 'CITIZEN_OBJECTION_SUBMITTED',
        timestamp: new Date().toISOString(),
        details: objection.notes || objection.reasons.join(', ')
      }
    ]
  };

  return { success: true, updatedCase };
}

test('Citizen Objection Reopens Case retaining complete audit trail', () => {
  const resolvedCase = {
    id: 'NS-2026-042',
    status: 'resolved_pending_citizen',
    lifecycle: [{ action: 'STAFF_COMPLETION_UPLOADED', timestamp: '2026-10-24T10:00:00Z' }]
  };

  const objection = {
    reasons: ['ড্রেন এখনও উপচে পড়ছে'],
    notes: 'সামান্য কাদা পরিষ্কার করেই কাজ শেষ ঘোষণা দেওয়া হয়েছে।'
  };

  const result = processCitizenObjection(resolvedCase, objection);
  assert.equal(result.success, true);
  assert.equal(result.updatedCase.status, 'reopened');
  assert.equal(result.updatedCase.objection.status, 'pending_review');
  assert.equal(result.updatedCase.lifecycle.length, 2);
  assert.equal(result.updatedCase.lifecycle[1].action, 'CITIZEN_OBJECTION_SUBMITTED');
});
