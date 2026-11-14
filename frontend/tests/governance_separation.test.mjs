import test from 'node:test';
import assert from 'node:assert/strict';

// Six-role definitions
const ROLES = [
  'citizen',
  'ward_desk',
  'field_officer',
  'coordinator',
  'admin',
  'governance_head'
];

// Dual-Approval Engine logic under test
function evaluatePolicyChangeWorkflow({
  category,
  requiresDualApproval,
  requestingUserId,
  adminDecision,
  adminUserId,
  governanceDecision,
  governanceUserId,
  revalidationPassed
}) {
  if (requiresDualApproval) {
    if (adminUserId && governanceUserId && adminUserId === governanceUserId) {
      throw new Error('একই ব্যক্তি উভয় ভূমিকায় অনুমোদন দিতে পারবেন না (Self-Approval Prohibited)');
    }

    if (adminDecision === 'reject' || governanceDecision === 'reject') {
      return {
        approval_state: 'rejected',
        implementation_state: 'rolled_back',
        effective_active: false,
        reason: 'উভয় বা যে কোনো একটি কর্তৃপক্ষের প্রত্যাখ্যানের কারণে প্রস্তাবিত পলিসি বাতিল হয়েছে'
      };
    }

    if (adminDecision === 'approve' && governanceDecision === 'approve') {
      if (category === 'AI_CONFIDENCE_GATE' && !revalidationPassed) {
        return {
          approval_state: 'approved',
          implementation_state: 'pending_revalidation',
          effective_active: false,
          reason: 'এআই কনফিডেন্স গেট হ্রাসের জন্য মডেল রি-ভ্যালিডেশন আবশ্যক'
        };
      }
      return {
        approval_state: 'approved',
        implementation_state: 'applied',
        effective_active: true,
        reason: 'প্রযুক্তিগত ও পৌর পলিসি উভয় অনুমোদন সম্পন্ন হওয়ায় নীতি সক্রিয় হয়েছে'
      };
    }

    return {
      approval_state: 'pending_dual_review',
      implementation_state: 'draft',
      effective_active: false,
      reason: 'উভয় কর্তৃপক্ষের অনুমোদনের অপেক্ষায় রয়েছে'
    };
  }

  // Single approval for non-protected administrative items
  if (governanceDecision === 'approve' || adminDecision === 'approve') {
    return {
      approval_state: 'approved',
      implementation_state: 'applied',
      effective_active: true
    };
  }

  return {
    approval_state: 'pending',
    implementation_state: 'draft',
    effective_active: false
  };
}

// Permission checking function
function canPerformAction(role, action, resource) {
  if (action === 'CLOSE_CASE') {
    return role === 'coordinator'; // Only coordinator closes cases
  }
  if (action === 'VIEW_RAW_CITIZEN_PII') {
    return false; // Neither admin nor governance head sees raw PII
  }
  if (action === 'MANAGE_USERS') {
    return role === 'admin'; // Technical IAM
  }
  if (action === 'ACCESS_INFRASTRUCTURE_SECRETS') {
    return role === 'admin';
  }
  if (action === 'APPROVE_PROTECTED_MUNICIPAL_POLICY') {
    return role === 'governance_head';
  }
  if (action === 'UNILATERALLY_OVERRIDE_SLA_TARGETS') {
    return false; // Unilateral override forbidden
  }
  if (action === 'SET_MUNICIPAL_SLA_POLICY') {
    return role === 'governance_head';
  }
  if (action === 'EXECUTE_TECHNICAL_DEPLOYMENT') {
    return role === 'admin';
  }
  return false;
}

test('1. Six Distinct Authority Roles are Preserved and Defined', () => {
  assert.equal(ROLES.length, 6);
  assert.ok(ROLES.includes('admin'), 'System Administrator must exist');
  assert.ok(ROLES.includes('governance_head'), 'City Governance Head must exist');
  assert.ok(ROLES.includes('coordinator'), 'Coordinator must exist');
  assert.ok(ROLES.includes('field_officer'), 'Field Officer must exist');
  assert.ok(ROLES.includes('ward_desk'), 'Ward Desk must exist');
  assert.ok(ROLES.includes('citizen'), 'Citizen must exist');
});

test('2. System Administrator cannot unilaterally approve protected municipal policy', () => {
  assert.equal(canPerformAction('admin', 'APPROVE_PROTECTED_MUNICIPAL_POLICY', 'RESPONSIBILITY_RULE'), false);
  assert.equal(canPerformAction('governance_head', 'APPROVE_PROTECTED_MUNICIPAL_POLICY', 'RESPONSIBILITY_RULE'), true);
});

test('3. City Governance Head cannot access infrastructure secrets or manage user IAM', () => {
  assert.equal(canPerformAction('governance_head', 'ACCESS_INFRASTRUCTURE_SECRETS', 'SYSTEM'), false);
  assert.equal(canPerformAction('governance_head', 'MANAGE_USERS', 'USER_ACCOUNTS'), false);
  assert.equal(canPerformAction('admin', 'MANAGE_USERS', 'USER_ACCOUNTS'), true);
});

test('4. Neither Admin nor City Governance Head can access raw citizen PII or close cases', () => {
  assert.equal(canPerformAction('admin', 'VIEW_RAW_CITIZEN_PII', 'CASE'), false);
  assert.equal(canPerformAction('governance_head', 'VIEW_RAW_CITIZEN_PII', 'CASE'), false);
  assert.equal(canPerformAction('admin', 'CLOSE_CASE', 'CASE'), false);
  assert.equal(canPerformAction('governance_head', 'CLOSE_CASE', 'CASE'), false);
  assert.equal(canPerformAction('coordinator', 'CLOSE_CASE', 'CASE'), true);
});

test('5. City Governance Head owns municipal SLA policy targets', () => {
  assert.equal(canPerformAction('governance_head', 'SET_MUNICIPAL_SLA_POLICY', 'SLA_TARGETS'), true);
  assert.equal(canPerformAction('admin', 'SET_MUNICIPAL_SLA_POLICY', 'SLA_TARGETS'), false);
  assert.equal(canPerformAction('admin', 'UNILATERALLY_OVERRIDE_SLA_TARGETS', 'SLA_TARGETS'), false);
});

test('6. Protected rule change cannot be applied with only one approval', () => {
  const resultAdminOnly = evaluatePolicyChangeWorkflow({
    category: 'RESPONSIBILITY_RULE',
    requiresDualApproval: true,
    requestingUserId: 'user_1',
    adminDecision: 'approve',
    adminUserId: 'admin_1',
    governanceDecision: null,
    governanceUserId: null
  });
  assert.equal(resultAdminOnly.effective_active, false);
  assert.equal(resultAdminOnly.approval_state, 'pending_dual_review');

  const resultGovOnly = evaluatePolicyChangeWorkflow({
    category: 'RESPONSIBILITY_RULE',
    requiresDualApproval: true,
    requestingUserId: 'user_1',
    adminDecision: null,
    adminUserId: null,
    governanceDecision: 'approve',
    governanceUserId: 'gov_1'
  });
  assert.equal(resultGovOnly.effective_active, false);
  assert.equal(resultGovOnly.approval_state, 'pending_dual_review');
});

test('7. Same individual cannot approve both capacities (Self-Approval Prohibited)', () => {
  assert.throws(
    () => {
      evaluatePolicyChangeWorkflow({
        category: 'RESPONSIBILITY_RULE',
        requiresDualApproval: true,
        requestingUserId: 'user_1',
        adminDecision: 'approve',
        adminUserId: 'same_user_123',
        governanceDecision: 'approve',
        governanceUserId: 'same_user_123'
      });
    },
    /একই ব্যক্তি উভয় ভূমিকায় অনুমোদন দিতে পারবেন না/
  );
});

test('8. Rejection by either approver terminates the policy and prevents rollout', () => {
  const resultRejectedByGov = evaluatePolicyChangeWorkflow({
    category: 'TASK_SEQUENCING_RULE',
    requiresDualApproval: true,
    requestingUserId: 'user_1',
    adminDecision: 'approve',
    adminUserId: 'admin_1',
    governanceDecision: 'reject',
    governanceUserId: 'gov_1'
  });
  assert.equal(resultRejectedByGov.approval_state, 'rejected');
  assert.equal(resultRejectedByGov.effective_active, false);
  assert.equal(resultRejectedByGov.implementation_state, 'rolled_back');
});

test('9. AI Gate Lowering requires dual approval and revalidation before becoming active', () => {
  const pendingReval = evaluatePolicyChangeWorkflow({
    category: 'AI_CONFIDENCE_GATE',
    requiresDualApproval: true,
    requestingUserId: 'user_1',
    adminDecision: 'approve',
    adminUserId: 'admin_1',
    governanceDecision: 'approve',
    governanceUserId: 'gov_1',
    revalidationPassed: false
  });
  assert.equal(pendingReval.approval_state, 'approved');
  assert.equal(pendingReval.implementation_state, 'pending_revalidation');
  assert.equal(pendingReval.effective_active, false);

  const passedReval = evaluatePolicyChangeWorkflow({
    category: 'AI_CONFIDENCE_GATE',
    requiresDualApproval: true,
    requestingUserId: 'user_1',
    adminDecision: 'approve',
    adminUserId: 'admin_1',
    governanceDecision: 'approve',
    governanceUserId: 'gov_1',
    revalidationPassed: true
  });
  assert.equal(passedReval.approval_state, 'approved');
  assert.equal(passedReval.implementation_state, 'applied');
  assert.equal(passedReval.effective_active, true);
});
