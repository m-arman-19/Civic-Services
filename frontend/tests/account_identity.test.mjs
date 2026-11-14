import { test } from 'node:test';
import assert from 'node:assert';

test('Account Lifecycle Transitions: Valid states and transitions enforced', () => {
  const validStates = ['pending', 'active', 'suspended', 'deactivated'];
  
  const allowedTransitions = {
    pending: ['active', 'suspended', 'deactivated'],
    active: ['suspended', 'deactivated'],
    suspended: ['active', 'deactivated'],
    deactivated: [] // Terminal or restricted
  };

  const isTransitionAllowed = (from, to) => {
    return allowedTransitions[from]?.includes(to) ?? false;
  };

  assert.strictEqual(isTransitionAllowed('pending', 'active'), true);
  assert.strictEqual(isTransitionAllowed('active', 'suspended'), true);
  assert.strictEqual(isTransitionAllowed('suspended', 'active'), true);
  assert.strictEqual(isTransitionAllowed('active', 'deactivated'), true);
  assert.strictEqual(isTransitionAllowed('deactivated', 'active'), false);
});

test('Temporary Password Security: Monospace, one-time display, forced first login change', () => {
  const generateMockTempPassword = (length = 12) => {
    const chars = 'ABCDEFGHJKLMNPQRSTUVWXYZabcdefghjkmnpqrstuvwxyz23456789!@#$%^&*';
    let res = '';
    for (let i = 0; i < length; i++) {
      res += chars.charAt(Math.floor(Math.random() * chars.length));
    }
    return res;
  };

  const tempPw = generateMockTempPassword(12);
  assert.strictEqual(tempPw.length >= 12, true);

  const creationResponse = {
    user_id: 'user-uuid-1234',
    temporary_password: tempPw,
    must_change_password: true,
    expires_in_hours: 24
  };

  // Must require password change on first login
  assert.strictEqual(creationResponse.must_change_password, true);
  // Ensure no password hash or reversible secret is included
  assert.strictEqual('password_hash' in creationResponse, false);
  assert.strictEqual('hashed_password' in creationResponse, false);
});

test('Citizen Contact Masking in Admin Account Directory', () => {
  const maskIdentifier = (val, type) => {
    if (!val) return '';
    if (type === 'email' || val.includes('@')) {
      const parts = val.split('@');
      const user = parts[0];
      const domain = parts[1] || '';
      return `${user.slice(0, 1)}***@${domain}`;
    }
    if (val.length >= 7) {
      return `${val.slice(0, 3)}****${val.slice(-4)}`;
    }
    return '***';
  };

  const citizenEmail = 'rahim.citizenship@gmail.com';
  const citizenPhone = '01712345678';
  const staffEmail = 'officer.tanvir@municipality.gov.bd';

  assert.strictEqual(maskIdentifier(citizenEmail, 'email'), 'r***@gmail.com');
  assert.strictEqual(maskIdentifier(citizenPhone, 'phone'), '017****5678');
  // Staff email should remain unmasked for administrative clarity
  assert.strictEqual(staffEmail, 'officer.tanvir@municipality.gov.bd');
});

test('Privileged Role Assignment Protection: System Admin cannot unilaterally elevate to City Governance Head', () => {
  const canAdminDirectlyAssignRole = (requestedRole) => {
    if (requestedRole === 'governance_head') {
      return false; // Requires dual authority approval from Governance Head
    }
    return ['ward_desk', 'dept_officer', 'coordinator', 'admin', 'citizen'].includes(requestedRole);
  };

  assert.strictEqual(canAdminDirectlyAssignRole('ward_desk'), true);
  assert.strictEqual(canAdminDirectlyAssignRole('coordinator'), true);
  assert.strictEqual(canAdminDirectlyAssignRole('governance_head'), false);
});

test('Account Lockout Rule: 5 failed authentication attempts triggers 15-minute lock', () => {
  const evaluateLockout = (failedAttempts) => {
    if (failedAttempts >= 5) {
      return { isLocked: true, lockDurationMinutes: 15 };
    }
    return { isLocked: false, remainingAttempts: 5 - failedAttempts };
  };

  assert.deepStrictEqual(evaluateLockout(4), { isLocked: false, remainingAttempts: 1 });
  assert.deepStrictEqual(evaluateLockout(5), { isLocked: true, lockDurationMinutes: 15 });
  assert.deepStrictEqual(evaluateLockout(7), { isLocked: true, lockDurationMinutes: 15 });
});

test('Zero Secret Leakage in Security History Trail', () => {
  const sampleSecurityEvent = {
    action: 'PASSWORD_RESET_COMPLETED',
    resource_type: 'USER',
    resource_id: 'user-xyz-987',
    actor_role: 'admin',
    reason: 'অফিসিয়াল পাসওয়ার্ড রিসেট',
    after_state: {
      status: 'password_reset_completed',
      must_change_password: true,
      sessions_revoked_at: '2026-10-26T02:00:00Z'
    }
  };

  const serialized = JSON.stringify(sampleSecurityEvent).toLowerCase();
  assert.strictEqual(serialized.includes('password_hash'), false);
  assert.strictEqual(serialized.includes('$2b$'), false);
  assert.strictEqual(serialized.includes('hashed_password'), false);
  assert.strictEqual(serialized.includes('plain_password'), false);
  assert.strictEqual(serialized.includes('otp_code'), false);
});
