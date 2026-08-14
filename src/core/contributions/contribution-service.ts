/**
 * Monthly Contribution Management Core Service
 * Ministry Cooperative Contributory Fund
 */

export type MemberPaymentStatus = 
  | 'PAID'
  | 'PARTIALLY_PAID'
  | 'NOT_PAID'
  | 'OVERPAID'
  | 'PENDING_VERIFICATION';

export type ContributionVerificationStatus = 
  | 'VERIFIED'
  | 'PENDING_VERIFICATION'
  | 'UNVERIFIED';

export interface GradeContributionRule {
  gradeLevel: string; // e.g. 'GL-08', 'GL-12', 'GL-14'
  basicSalary: number;
  minMonthlyContribution: number;
  defaultMonthlyContribution: number;
}

export interface MemberMonthlyContributionRecord {
  id: string;
  memberId: string;
  employeeId: string;
  fullName: string;
  department: string;
  gradeLevel: string;
  month: string; // 'YYYY-MM'
  expectedContribution: number;
  actualContribution: number;
  difference: number; // actual - expected
  paymentStatus: MemberPaymentStatus;
  verificationStatus: ContributionVerificationStatus;
  paymentMethod?: 'PAYROLL_DEDUCTION' | 'DIRECT_BANK_TRANSFER' | 'MANUAL_DEPOSIT' | 'SPECIAL_ADJUSTMENT';
  transactionReference?: string;
  paymentDate?: string;
  notes?: string;
}

export interface ManualPaymentPayload {
  memberId: string;
  month: string; // 'YYYY-MM'
  amount: number;
  paymentDate: string; // 'YYYY-MM-DD'
  transactionReference: string;
  paymentMethod: 'DIRECT_BANK_TRANSFER' | 'MANUAL_DEPOSIT';
  recordedByUserId: string;
  receiptProofUrl?: string;
  notes?: string;
}

export interface ContributionAdjustmentPayload {
  memberId: string;
  month: string;
  adjustmentAmount: number; // positive or negative
  reason: string;
  authorizedByUserId: string;
}

export class ContributionService {
  public static GRADE_RULES: Record<string, GradeContributionRule> = {
    'GL-07': { gradeLevel: 'GL-07', basicSalary: 120000, minMonthlyContribution: 10000, defaultMonthlyContribution: 15000 },
    'GL-08': { gradeLevel: 'GL-08', basicSalary: 150000, minMonthlyContribution: 15000, defaultMonthlyContribution: 20000 },
    'GL-09': { gradeLevel: 'GL-09', basicSalary: 180000, minMonthlyContribution: 15000, defaultMonthlyContribution: 20000 },
    'GL-10': { gradeLevel: 'GL-10', basicSalary: 220000, minMonthlyContribution: 20000, defaultMonthlyContribution: 25000 },
    'GL-12': { gradeLevel: 'GL-12', basicSalary: 280000, minMonthlyContribution: 25000, defaultMonthlyContribution: 30000 },
    'GL-13': { gradeLevel: 'GL-13', basicSalary: 350000, minMonthlyContribution: 30000, defaultMonthlyContribution: 40000 },
    'GL-14': { gradeLevel: 'GL-14', basicSalary: 420000, minMonthlyContribution: 35000, defaultMonthlyContribution: 50000 },
    'GL-15': { gradeLevel: 'GL-15', basicSalary: 500000, minMonthlyContribution: 40000, defaultMonthlyContribution: 60000 },
    'GL-16': { gradeLevel: 'GL-16', basicSalary: 600000, minMonthlyContribution: 50000, defaultMonthlyContribution: 75000 },
  };

  /**
   * Validate custom member-selected contribution against grade minimum
   */
  public static validateMemberSelectedAmount(gradeLevel: string, amount: number): { isValid: boolean; error?: string } {
    const rule = this.GRADE_RULES[gradeLevel];
    if (!rule) {
      return { isValid: amount > 0, error: amount <= 0 ? 'Amount must be greater than zero' : undefined };
    }

    if (amount < rule.minMonthlyContribution) {
      return {
        isValid: false,
        error: `Selected amount (₦${amount.toLocaleString()}) is below the minimum mandatory contribution of ₦${rule.minMonthlyContribution.toLocaleString()} for Grade Level ${gradeLevel}.`,
      };
    }

    return { isValid: true };
  }

  /**
   * Classify Member Monthly Payment Status
   * - PAID: actual === expected
   * - PARTIALLY_PAID: 0 < actual < expected
   * - NOT_PAID: actual === 0
   * - OVERPAID: actual > expected
   * - PENDING_VERIFICATION: receipt submitted, pending verification
   */
  public static classifyPaymentStatus(
    expectedAmount: number,
    actualAmount: number,
    verificationStatus: ContributionVerificationStatus
  ): MemberPaymentStatus {
    if (verificationStatus === 'PENDING_VERIFICATION') {
      return 'PENDING_VERIFICATION';
    }

    if (actualAmount === 0) {
      return 'NOT_PAID';
    }

    if (actualAmount === expectedAmount) {
      return 'PAID';
    }

    if (actualAmount > 0 && actualAmount < expectedAmount) {
      return 'PARTIALLY_PAID';
    }

    if (actualAmount > expectedAmount) {
      return 'OVERPAID';
    }

    return 'NOT_PAID';
  }

  /**
   * Record a Manual Payment for a member who missed payroll deduction
   * Requires: Transaction Reference, Payment Date, Amount > 0
   */
  public static recordManualPayment(
    existingRecord: MemberMonthlyContributionRecord,
    payload: ManualPaymentPayload
  ): MemberMonthlyContributionRecord {
    if (!payload.transactionReference || payload.transactionReference.trim().length === 0) {
      throw new Error('Transaction Reference / NIBSS Session ID is mandatory for manual payment recording.');
    }

    if (!payload.paymentDate || !/^\d{4}-\d{2}-\d{2}$/.test(payload.paymentDate)) {
      throw new Error('Valid Payment Date (YYYY-MM-DD) is required.');
    }

    if (payload.amount <= 0) {
      throw new Error('Payment amount must be greater than zero.');
    }

    const newActual = existingRecord.actualContribution + payload.amount;
    const difference = newActual - existingRecord.expectedContribution;
    const paymentStatus = this.classifyPaymentStatus(existingRecord.expectedContribution, newActual, 'VERIFIED');

    return {
      ...existingRecord,
      actualContribution: newActual,
      difference,
      paymentStatus,
      verificationStatus: 'VERIFIED',
      paymentMethod: payload.paymentMethod,
      transactionReference: payload.transactionReference.trim(),
      paymentDate: payload.paymentDate,
      notes: payload.notes || `Manual contribution verified by Finance Officer (${payload.recordedByUserId}) on ${new Date().toISOString().slice(0, 10)}.`,
    };
  }

  /**
   * Apply Authorized Contribution Adjustment
   * Strict Rule: Unauthorized modification of financial records is prohibited.
   * Adjustments must record an explicit reason and authorizer ID.
   */
  public static applyAuthorizedAdjustment(
    existingRecord: MemberMonthlyContributionRecord,
    payload: ContributionAdjustmentPayload
  ): {
    updatedRecord: MemberMonthlyContributionRecord;
    adjustmentJournal: {
      journalId: string;
      adjustmentAmount: number;
      reason: string;
      authorizedBy: string;
      timestamp: string;
    };
  } {
    if (!payload.reason || payload.reason.trim().length < 10) {
      throw new Error('A detailed justification reason (min 10 chars) is mandatory for financial adjustments.');
    }

    if (!payload.authorizedByUserId) {
      throw new Error('Authorizing user ID is mandatory for applying financial adjustments.');
    }

    const newActual = Math.max(0, existingRecord.actualContribution + payload.adjustmentAmount);
    const difference = newActual - existingRecord.expectedContribution;
    const paymentStatus = this.classifyPaymentStatus(existingRecord.expectedContribution, newActual, 'VERIFIED');

    const updatedRecord: MemberMonthlyContributionRecord = {
      ...existingRecord,
      actualContribution: newActual,
      difference,
      paymentStatus,
      verificationStatus: 'VERIFIED',
      paymentMethod: 'SPECIAL_ADJUSTMENT',
      notes: `Adjusted by ₦${payload.adjustmentAmount.toLocaleString()}. Reason: "${payload.reason.trim()}". Authorized by ${payload.authorizedByUserId}.`,
    };

    const adjustmentJournal = {
      journalId: `ADJ-JE-${Date.now()}`,
      adjustmentAmount: payload.adjustmentAmount,
      reason: payload.reason.trim(),
      authorizedBy: payload.authorizedByUserId,
      timestamp: new Date().toISOString(),
    };

    return {
      updatedRecord,
      adjustmentJournal,
    };
  }
}
