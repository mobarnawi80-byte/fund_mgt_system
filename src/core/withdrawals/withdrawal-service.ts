/**
 * Withdrawal Management Core Service & State Machine
 * Ministry Cooperative Contributory Fund
 */

export type WithdrawalStatus = 
  | 'PENDING_COMMITTEE_REVIEW'
  | 'APPROVED'
  | 'REJECTED'
  | 'PAID_OUT_AND_SETTLED'
  | 'CANCELLED';

export interface WithdrawalEligibilityResult {
  isEligible: boolean;
  totalAccumulatedSavings: number;
  activeLoanBalance: number;
  maxAllowableWithdrawal: number;
  requestedAmount: number;
  netPayoutAmount: number;
  violations: string[];
}

export interface WithdrawalCommitteeAudit {
  approverId: string;
  approverName: string;
  approverRole: string;
  decision: 'APPROVED' | 'REJECTED';
  approvedAmount: number;
  approvalDate: string; // 'YYYY-MM-DD'
  approvalTime: string; // 'HH:MM:SS'
  timestampIso: string;
  comment: string;
}

export interface WithdrawalPayoutAudit {
  processedByUserId: string;
  processedByName: string;
  paymentDate: string; // 'YYYY-MM-DD'
  paymentReference: string; // Bank transfer ref / NIBSS session ID
  disbursedFromAccount: string; // '1010 - Cooperative Bank Main Account'
  timestampIso: string;
}

export interface WithdrawalRequestEntity {
  id: string;
  requestNumber: string;
  memberId: string;
  employeeId: string;
  memberName: string;
  department: string;
  gradeLevel: string;
  bankName: string;
  accountNumber: string;
  accountName: string;
  
  // Financial Figures
  accumulatedSavingsAtRequest: number;
  activeLoanBalanceAtRequest: number;
  requestedAmount: number;
  approvedAmount?: number;
  loanDeductionOffset: number;
  netPayoutAmount: number;

  // Metadata & Workflow
  reason: string;
  requestDate: string; // 'YYYY-MM-DD'
  status: WithdrawalStatus;
  
  // Audits
  committeeAudit?: WithdrawalCommitteeAudit;
  payoutAudit?: WithdrawalPayoutAudit;
  cancellationReason?: string;
}

export class WithdrawalService {
  /**
   * 1. Validate Withdrawal Eligibility
   * Rule: Withdrawal Amount <= (Accumulated Savings - Active Outstanding Loans)
   */
  public static checkEligibility(
    accumulatedSavings: number,
    activeLoanBalance: number,
    requestedAmount: number
  ): WithdrawalEligibilityResult {
    const violations: string[] = [];

    if (requestedAmount <= 0) {
      violations.push('Withdrawal amount must be greater than zero.');
    }

    const maxAllowableWithdrawal = Math.max(0, accumulatedSavings - activeLoanBalance);

    if (requestedAmount > maxAllowableWithdrawal) {
      violations.push(
        `Requested withdrawal amount (₦${requestedAmount.toLocaleString()}) exceeds maximum allowable net savings balance of ₦${maxAllowableWithdrawal.toLocaleString()} (Total Savings: ₦${accumulatedSavings.toLocaleString()} less Active Loan: ₦${activeLoanBalance.toLocaleString()}).`
      );
    }

    const netPayoutAmount = requestedAmount;

    return {
      isEligible: violations.length === 0,
      totalAccumulatedSavings: accumulatedSavings,
      activeLoanBalance,
      maxAllowableWithdrawal,
      requestedAmount,
      netPayoutAmount,
      violations,
    };
  }

  /**
   * 2. Submit Withdrawal Request (Savings balance is NOT deducted here)
   */
  public static submitRequest(params: {
    memberId: string;
    employeeId: string;
    memberName: string;
    department: string;
    gradeLevel: string;
    bankName: string;
    accountNumber: string;
    accountName: string;
    accumulatedSavings: number;
    activeLoanBalance: number;
    requestedAmount: number;
    reason: string;
    requestDate?: string;
  }): WithdrawalRequestEntity {
    const eligibility = this.checkEligibility(
      params.accumulatedSavings,
      params.activeLoanBalance,
      params.requestedAmount
    );

    if (!eligibility.isEligible) {
      throw new Error(`Withdrawal request ineligible: ${eligibility.violations.join(' ')}`);
    }

    const requestNumber = `WTH-${new Date().getFullYear()}-${Math.floor(1000 + Math.random() * 9000)}`;

    return {
      id: `wth_${Date.now()}_${Math.random().toString(36).substr(2, 6)}`,
      requestNumber,
      memberId: params.memberId,
      employeeId: params.employeeId,
      memberName: params.memberName,
      department: params.department,
      gradeLevel: params.gradeLevel,
      bankName: params.bankName,
      accountNumber: params.accountNumber,
      accountName: params.accountName,
      accumulatedSavingsAtRequest: params.accumulatedSavings,
      activeLoanBalanceAtRequest: params.activeLoanBalance,
      requestedAmount: params.requestedAmount,
      loanDeductionOffset: params.activeLoanBalance,
      netPayoutAmount: params.requestedAmount,
      reason: params.reason,
      requestDate: params.requestDate || new Date().toISOString().slice(0, 10),
      status: 'PENDING_COMMITTEE_REVIEW',
    };
  }

  /**
   * 3. Committee Review (Approve or Reject)
   */
  public static recordCommitteeDecision(
    request: WithdrawalRequestEntity,
    approver: { id: string; name: string; role: string },
    decision: 'APPROVED' | 'REJECTED',
    approvedAmount: number,
    comment: string
  ): WithdrawalRequestEntity {
    if (request.status !== 'PENDING_COMMITTEE_REVIEW') {
      throw new Error(`Cannot review withdrawal request with status '${request.status}'.`);
    }

    if (!comment || comment.trim().length === 0) {
      throw new Error('Mandatory justification comment is required for committee audit records.');
    }

    const now = new Date();
    const approvalDate = now.toISOString().slice(0, 10);
    const approvalTime = now.toTimeString().slice(0, 8);

    const committeeAudit: WithdrawalCommitteeAudit = {
      approverId: approver.id,
      approverName: approver.name,
      approverRole: approver.role,
      decision,
      approvedAmount: decision === 'APPROVED' ? approvedAmount : 0,
      approvalDate,
      approvalTime,
      timestampIso: now.toISOString(),
      comment: comment.trim(),
    };

    return {
      ...request,
      status: decision === 'APPROVED' ? 'APPROVED' : 'REJECTED',
      approvedAmount: decision === 'APPROVED' ? approvedAmount : 0,
      netPayoutAmount: decision === 'APPROVED' ? approvedAmount : 0,
      committeeAudit,
    };
  }

  /**
   * 4. Finance Processes Payment & Commits to Financial Ledger
   * Modifies member savings balance and posts double-entry journal ONLY at this step
   */
  public static processPaymentAndPostLedger(
    request: WithdrawalRequestEntity,
    financeOfficer: { id: string; name: string },
    paymentRef: string,
    paymentDate: string
  ): {
    updatedRequest: WithdrawalRequestEntity;
    generalLedgerJournal: {
      journalId: string;
      debitAccount: string; // '2010 - Member Savings Pool'
      creditAccount: string; // '1010 - Cooperative Bank Main Account'
      amount: number;
      timestamp: string;
    };
    newMemberSavingsBalance: number;
  } {
    if (request.status !== 'APPROVED') {
      throw new Error(`Cannot process payment for request with status '${request.status}'. Must be 'APPROVED'.`);
    }

    if (!paymentRef || paymentRef.trim().length === 0) {
      throw new Error('Payment reference / NIBSS Session ID is required for bank payout.');
    }

    const now = new Date();
    const finalAmount = request.approvedAmount || request.requestedAmount;

    const payoutAudit: WithdrawalPayoutAudit = {
      processedByUserId: financeOfficer.id,
      processedByName: financeOfficer.name,
      paymentDate: paymentDate || now.toISOString().slice(0, 10),
      paymentReference: paymentRef.trim(),
      disbursedFromAccount: '1010 - Cooperative Bank Main Account',
      timestampIso: now.toISOString(),
    };

    const updatedRequest: WithdrawalRequestEntity = {
      ...request,
      status: 'PAID_OUT_AND_SETTLED',
      payoutAudit,
    };

    const newMemberSavingsBalance = Math.max(0, request.accumulatedSavingsAtRequest - finalAmount);

    const generalLedgerJournal = {
      journalId: `JE-WTH-${request.requestNumber}-${Date.now()}`,
      debitAccount: '2010 - Member Savings Pool (Liability Reduction)',
      creditAccount: '1010 - Cooperative Bank Main Account (Asset Outflow)',
      amount: finalAmount,
      timestamp: now.toISOString(),
    };

    return {
      updatedRequest,
      generalLedgerJournal,
      newMemberSavingsBalance,
    };
  }
}
