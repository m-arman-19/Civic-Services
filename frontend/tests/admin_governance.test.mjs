import test from 'node:test';
import assert from 'node:assert/strict';

// 1. RBAC Boundaries (R&D Table 30 & Section 11.3)
function canRoleCloseCase(role) {
  // Only Coordinator has case closure authority
  return role === 'coordinator';
}

function canRoleReviewResolution(role) {
  // Only Coordinator and Ward Desk can review resolution evidence
  return role === 'coordinator' || role === 'ward_desk';
}

function canAdminViewRawCitizenPII(role) {
  // Administrator view must always mask raw citizen PII
  return false;
}

// 2. Dual Approval Engine for AI Confidence Gate (R&D Section 10.11 / Table 33)
function evaluateGateChangePolicy(currentThreshold, newThreshold, initiatorId, approverId) {
  if (newThreshold > currentThreshold) {
    return { status: 'approved_direct', reason: 'Raising confidence gate increases safety; solo admin allowed' };
  }
  if (newThreshold < currentThreshold) {
    if (!approverId) {
      return { status: 'pending_dual_approval', reason: 'Lowering gate requires second authorized admin approval' };
    }
    if (initiatorId === approverId) {
      throw new Error('উদ্যোক্তা নিজে দ্বিতীয় অনুমোদনকারী হতে পারবেন না (স্বতন্ত্র দ্বৈত অনুমোদন বাধ্যতামূলক)');
    }
    return { status: 'approved_dual', reason: 'Dual approval satisfied by independent administrator' };
  }
  return { status: 'unchanged' };
}

// 3. Asset Registry Inconsistent Ownership Prevention
function validateAssetRegistration(asset) {
  if (!asset.asset_code || !asset.name_bn) {
    throw new Error('কোড এবং নাম বাধ্যতামূলক');
  }
  if (!asset.ward_id) {
    throw new Error('নির্ধারিত ওয়ার্ড পাওয়া যায়নি');
  }
  if (!asset.department_id) {
    throw new Error('নির্ধারিত দায়িত্বপ্রাপ্ত বিভাগ পাওয়া যায়নি');
  }
  return { valid: true, registered_code: asset.asset_code };
}

// 4. Privacy Telemetry Guarantees
function sanitizeAdminTelemetry(caseRecords) {
  return {
    total_cases_logged: caseRecords.length,
    closed_cases: caseRecords.filter(c => c.status === 'closed').length,
    active_cases: caseRecords.filter(c => c.status === 'in_progress').length,
    emergency_cases: caseRecords.filter(c => c.priority === 'emergency').length,
    privacy_guarantee: 'PII-free aggregated telemetry'
  };
}

// Tests
test('Admin RBAC Boundary: Admin CANNOT close cases or approve evidence', () => {
  assert.equal(canRoleCloseCase('admin'), false, 'Admin must not have case closure rights');
  assert.equal(canRoleCloseCase('coordinator'), true, 'Coordinator has case closure authority');

  assert.equal(canRoleReviewResolution('admin'), false, 'Admin must not review resolution evidence directly');
  assert.equal(canRoleReviewResolution('ward_desk'), true, 'Ward desk can review resolution evidence');
  assert.equal(canRoleReviewResolution('coordinator'), true, 'Coordinator can review resolution evidence');

  assert.equal(canAdminViewRawCitizenPII('admin'), false, 'Admin must never see unmasked citizen PII');
});

test('AI Confidence Gate: Raising gate is direct, Lowering gate requires dual approval', () => {
  // Raising from 80% to 85%
  const raiseResult = evaluateGateChangePolicy(0.80, 0.85, 'admin-1', null);
  assert.equal(raiseResult.status, 'approved_direct');

  // Lowering from 80% to 75% without second approver
  const lowerPending = evaluateGateChangePolicy(0.80, 0.75, 'admin-1', null);
  assert.equal(lowerPending.status, 'pending_dual_approval');

  // Lowering with self-approval attempt must fail
  assert.throws(
    () => evaluateGateChangePolicy(0.80, 0.75, 'admin-1', 'admin-1'),
    /উদ্যোক্তা নিজে দ্বিতীয় অনুমোদনকারী হতে পারবেন না/
  );

  // Lowering with distinct second admin succeeds
  const lowerApproved = evaluateGateChangePolicy(0.80, 0.75, 'admin-1', 'admin-2');
  assert.equal(lowerApproved.status, 'approved_dual');
});

test('Asset Registry Validation prevents inconsistent ownership', () => {
  // Missing ward
  assert.throws(
    () => validateAssetRegistration({ asset_code: 'D-1', name_bn: 'ড্রেন', department_id: 'dept-1' }),
    /নির্ধারিত ওয়ার্ড পাওয়া যায়নি/
  );

  // Missing department
  assert.throws(
    () => validateAssetRegistration({ asset_code: 'D-1', name_bn: 'ড্রেন', ward_id: 'ward-1' }),
    /নির্ধারিত দায়িত্বপ্রাপ্ত বিভাগ পাওয়া যায়নি/
  );

  // Valid asset
  const res = validateAssetRegistration({
    asset_code: 'D-102',
    name_bn: 'হাতেম আলী ড্রেন',
    ward_id: 'ward-3',
    department_id: 'dept-drain'
  });
  assert.equal(res.valid, true);
  assert.equal(res.registered_code, 'D-102');
});

test('Admin Telemetry enforces zero PII exposure', () => {
  const dummyCases = [
    { id: '1', citizen_name: 'গোপন নাগরিক', phone: '01711999999', status: 'closed', priority: 'high' },
    { id: '2', citizen_name: 'আরেক নাগরিক', phone: '01711888888', status: 'in_progress', priority: 'emergency' }
  ];

  const telemetry = sanitizeAdminTelemetry(dummyCases);
  assert.equal(telemetry.total_cases_logged, 2);
  assert.equal(telemetry.closed_cases, 1);
  assert.equal(telemetry.emergency_cases, 1);
  assert.equal(telemetry.citizen_name, undefined);
  assert.equal(telemetry.phone, undefined);
  assert.equal(telemetry.privacy_guarantee, 'PII-free aggregated telemetry');
});
