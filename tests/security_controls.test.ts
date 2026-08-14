import { describe, it, expect } from 'vitest';
import { SecurityEngine } from '../src/core/security/security-engine';
import { 
  FinancialLifecycleEngine, 
  FinancialLifecycleTransaction 
} from '../src/core/security/financial-lifecycle';

describe('Security Controls & Financial Immutability Engine', () => {
  describe('1. Secure Authentication & Password Controls', () => {
    it('should enforce strong password policy (min 12 chars, upper, lower, digit, symbol)', () => {
      const weak = SecurityEngine.validatePasswordStrength('weakpass');
      expect(weak.isValid).toBe(false);
      expect(weak.errors.length).toBeGreaterThan(0);

      const strong = SecurityEngine.validatePasswordStrength('Cooperative$2026!Secure');
      expect(strong.isValid).toBe(true);
      expect(strong.score).toBe(5);
    });

    it('should hash and verify passwords using salted iterations', () => {
      const plain = 'FederalMinistry@2026';
      const hash = SecurityEngine.hashPassword(plain);

      expect(hash).toContain('$pbkdf2-sha256$');
      expect(SecurityEngine.verifyPassword(plain, hash)).toBe(true);
      expect(SecurityEngine.verifyPassword('WrongPassword', hash)).toBe(false);
    });
  });

  describe('2. Two-Factor Authentication (TOTP 2FA)', () => {
    it('should generate secret and verify valid 6-digit TOTP token with time drift', () => {
      const { secret } = SecurityEngine.generateTotpSecret('usr-admin-01');
      const currentCode = SecurityEngine.generateCurrentTotp(secret);

      expect(currentCode).toMatch(/^\d{6}$/);
      expect(SecurityEngine.verifyTotp(secret, currentCode)).toBe(true);
      expect(SecurityEngine.verifyTotp(secret, '000000')).toBe(false);
    });
  });

  describe('3. Field-Level AES-256 Encryption for Sensitive Data', () => {
    it('should encrypt sensitive PII (BVN, Bank Account Numbers) and decrypt cleanly', () => {
      const rawBvn = '22334455667';
      const cipher = SecurityEngine.encryptSensitiveField(rawBvn);

      expect(cipher).toContain('ENC:v1:');
      expect(cipher).not.toBe(rawBvn);

      const decrypted = SecurityEngine.decryptSensitiveField(cipher);
      expect(decrypted).toBe(rawBvn);
    });
  });

  describe('4. Session Management & Inactivity Timeout', () => {
    it('should create session and invalidate on inactivity timeout', () => {
      const session = SecurityEngine.createSession('usr-finance-01', 'FINANCE_OFFICER', '10.0.4.12', 'Mozilla/5.0');
      expect(session.isValid).toBe(true);

      const validCheck = SecurityEngine.validateSession(session.sessionId);
      expect(validCheck.isValid).toBe(true);

      // Simulate 16 minutes inactivity
      session.lastActivityAt = Date.now() - (16 * 60 * 1000);
      const expiredCheck = SecurityEngine.validateSession(session.sessionId);
      expect(expiredCheck.isValid).toBe(false);
      expect(expiredCheck.reason).toContain('inactivity');
    });

    it('should revoke session on logout', () => {
      const session = SecurityEngine.createSession('usr-comm-01', 'COMMITTEE_MEMBER', '10.0.4.15', 'Chrome/120');
      SecurityEngine.revokeSession(session.sessionId);

      const check = SecurityEngine.validateSession(session.sessionId);
      expect(check.isValid).toBe(false);
    });
  });

  describe('5. Sliding-Window Rate Limiting', () => {
    it('should allow requests within limit and throttle/lockout when threshold exceeded', () => {
      const clientId = 'ip_192_168_1_100';
      const limit = 5;

      for (let i = 0; i < limit; i++) {
        const res = SecurityEngine.checkRateLimit(clientId, limit, 1000, 5000);
        expect(res.allowed).toBe(true);
      }

      // 6th request triggers rate limit lockout
      const blocked = SecurityEngine.checkRateLimit(clientId, limit, 1000, 5000);
      expect(blocked.allowed).toBe(false);
      expect(blocked.remainingRequests).toBe(0);
    });
  });

  describe('6. Secure File Upload Validation', () => {
    it('should accept valid Excel and CSV documents <= 5MB', () => {
      const valid = SecurityEngine.validateFileUpload({
        fileName: 'PAYROLL_AUGUST_2026.xlsx',
        sizeBytes: 1.5 * 1024 * 1024,
        mimeType: 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet',
      });
      expect(valid.isValid).toBe(true);
    });

    it('should reject files exceeding 5MB, malicious extensions, and path traversal names', () => {
      const oversize = SecurityEngine.validateFileUpload({
        fileName: 'huge.xlsx',
        sizeBytes: 8 * 1024 * 1024,
        mimeType: 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet',
      });
      expect(oversize.isValid).toBe(false);
      expect(oversize.errors[0]).toContain('exceeds statutory maximum of 5 MB');

      const traversal = SecurityEngine.validateFileUpload({
        fileName: '../../etc/passwd.exe',
        sizeBytes: 1024,
        mimeType: 'application/octet-stream',
      });
      expect(traversal.isValid).toBe(false);
      expect(traversal.errors.some(e => e.includes('Path traversal'))).toBe(true);
    });
  });

  describe('7. Financial Immutability (5 States & Reversals)', () => {
    let tx: FinancialLifecycleTransaction;

    it('should progress through DRAFT -> PENDING -> VERIFIED -> POSTED', () => {
      tx = {
        id: 'tx-test-01',
        transactionReference: 'TX-2026-001',
        lifecycleState: 'DRAFT',
        transactionType: 'CONTRIBUTION',
        memberId: 'mem-01',
        employeeId: 'MIN-EMP-1042',
        memberName: 'Dr. Aliyu Mohammed',
        department: 'Finance & Accounts',
        debitAccountCode: '1010',
        creditAccountCode: '2010',
        amount: 50000,
        description: 'Test Contribution',
        createdAt: new Date().toISOString(),
        createdByUserId: 'usr-finance-01',
        isReversed: false,
      };

      // 1. Submit to Pending
      tx = FinancialLifecycleEngine.submitToPending(tx);
      expect(tx.lifecycleState).toBe('PENDING');

      // 2. Verify by independent officer (Maker-Checker)
      tx = FinancialLifecycleEngine.verifyTransaction(tx, 'usr-comm-01');
      expect(tx.lifecycleState).toBe('VERIFIED');
      expect(tx.verifiedByUserId).toBe('usr-comm-01');

      // 3. Post to General Ledger
      tx = FinancialLifecycleEngine.postToLedger(tx);
      expect(tx.lifecycleState).toBe('POSTED');
    });

    it('should STRICTLY throw an error if hard deletion is attempted', () => {
      expect(() => {
        FinancialLifecycleEngine.preventHardDelete('tx-test-01');
      }).toThrowError(/Hard deletion of financial transaction.*is prohibited/i);
    });

    it('should reverse a POSTED transaction by creating an equal and opposite reversal journal', () => {
      const { updatedOriginalTx, reversalTransaction } = FinancialLifecycleEngine.reversePostedTransaction(
        tx,
        'usr-super-admin',
        'Correction of double payroll posting per Audit Committee Review #2026-08'
      );

      expect(updatedOriginalTx.lifecycleState).toBe('REVERSED');
      expect(updatedOriginalTx.isReversed).toBe(true);
      expect(updatedOriginalTx.reversalReason).toContain('Audit Committee Review');

      // Reversal transaction has swapped debits and credits
      expect(reversalTransaction.lifecycleState).toBe('POSTED');
      expect(reversalTransaction.transactionType).toBe('REVERSAL');
      expect(reversalTransaction.debitAccountCode).toBe(tx.creditAccountCode); // Swapped
      expect(reversalTransaction.creditAccountCode).toBe(tx.debitAccountCode); // Swapped
      expect(reversalTransaction.amount).toBe(50000);
    });
  });
});
