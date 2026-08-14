/**
 * Advanced Loan Management Core Service & State Machine
 * Ministry Cooperative Contributory Fund
 */

export type LoanType = 'SALARY_ADVANCE' | 'EMERGENCY_LOAN';

export type LoanLifecycleStatus = 
  | 'DRAFT'
  | 'SUBMITTED'
  | 'UNDER_REVIEW'
  | 'APPROVED'
  | 'REJECTED'
  | 'ACTIVE'
  | 'FULLY_REPAID'
  | 'CANCELLED';

export interface CommitteeDecisionAudit {
  approverId: string;
  approverName: string;
  approverRole: string;
  decision: 'APPROVED' | 'REJECTED';
  date: string; // 'YYYY-MM-DD'
  time: string; // 'HH:MM:SS'
  timestampIso: string;
  comment: string;
  ipAddress?: string;
}

export interface LoanInstallmentRecord {
  installmentNumber: number;
  dueMonth: string; // 'YYYY-MM'
  dueDate: string;
  expectedAmount: number;
  principalPortion: number;
  interestPortion: number; // Strictly 0.00
  paidAmount: number;
  status: 'PENDING' | 'PAID' | 'PARTIAL' | 'MISSED';
  paymentReference?: string;
  settledDate?: string;
}

export interface ComprehensiveLoanEntity {
  id: string;
  loanNumber: string;
  memberId: string;
  employeeId: string;
  applicantName: string;
  department: string;
  gradeLevel: string;
  loanType: LoanType;
  
  // Financial Figures
  accumulatedSavingsAtApplication: number;
  maxEligibleLoan: number;
  originalLoanAmount: number;
  interestRate: number; // 0.00%
  tenorMonths: number;
  monthlyRepayment: number;
  totalRepayable: number;
  totalAmountRepaid: number;
  outstandingBalance: number;
  
  // Installments Progress
  installmentsCompleted: number;
  installmentsRemaining: number;
  
  // Lifecycle & Governance
  status: LoanLifecycleStatus;
  purpose: string;
  applicationDate: string;
  committeeDecision?: CommitteeDecisionAudit;
  disbursementDate?: string;
  disbursementReference?: string;
  schedule: LoanInstallmentRecord[];
  cancellationReason?: string;
}

export interface LoanEligibilityCalculation {
  isEligible: boolean;
  maximumEligibleLoan: number;
  requestedLoan: number;
  monthlyRepayment: number;
  numberOfInstallments: number;
  interestRate: number; // 0.00
  savingsBuffer: number;
  violations: string[];
}

export class AdvancedLoanService {
  /**
   * 1. Loan Eligibility Calculator & Constraint Enforcement
   * Rule: Maximum loan amount must never exceed member accumulated contributions.
   */
  public static calculateEligibility(
    accumulatedSavings: number,
    requestedAmount: number,
    tenorMonths: number
  ): LoanEligibilityCalculation {
    const violations: string[] = [];

    if (requestedAmount <= 0) {
      violations.push('Requested loan amount must be greater than zero.');
    }

    if (requestedAmount > accumulatedSavings) {
      violations.push(
        `Requested loan amount (₦${requestedAmount.toLocaleString()}) exceeds maximum eligible accumulated savings limit of ₦${accumulatedSavings.toLocaleString()}.`
      );
    }

    if (tenorMonths < 1 || tenorMonths > 24) {
      violations.push('Number of installments (tenor) must be between 1 and 24 months.');
    }

    const monthlyRepayment = tenorMonths > 0 ? Number((requestedAmount / tenorMonths).toFixed(2)) : 0;
    const savingsBuffer = Math.max(0, accumulatedSavings - requestedAmount);

    return {
      isEligible: violations.length === 0,
      maximumEligibleLoan: accumulatedSavings,
      requestedLoan: requestedAmount,
      monthlyRepayment,
      numberOfInstallments: tenorMonths,
      interestRate: 0.0,
      savingsBuffer,
      violations,
    };
  }

  /**
   * 2. Submit Loan Application (Draft -> Submitted)
   */
  public static submitApplication(params: {
    memberId: string;
    employeeId: string;
    applicantName: string;
    department: string;
    gradeLevel: string;
    accumulatedSavings: number;
    loanType: LoanType;
    requestedAmount: number;
    tenorMonths: number;
    purpose: string;
  }): ComprehensiveLoanEntity {
    const eligibility = this.calculateEligibility(
      params.accumulatedSavings,
      params.requestedAmount,
      params.tenorMonths
    );

    if (!eligibility.isEligible) {
      throw new Error(`Loan application ineligible: ${eligibility.violations.join(' ')}`);
    }

    const loanNumber = `LOAN-${new Date().getFullYear()}-${Math.floor(1000 + Math.random() * 9000)}`;

    return {
      id: `loan_${Date.now()}_${Math.random().toString(36).substr(2, 6)}`,
      loanNumber,
      memberId: params.memberId,
      employeeId: params.employeeId,
      applicantName: params.applicantName,
      department: params.department,
      gradeLevel: params.gradeLevel,
      loanType: params.loanType,
      accumulatedSavingsAtApplication: params.accumulatedSavings,
      maxEligibleLoan: params.accumulatedSavings,
      originalLoanAmount: params.requestedAmount,
      interestRate: 0.0,
      tenorMonths: params.tenorMonths,
      monthlyRepayment: eligibility.monthlyRepayment,
      totalRepayable: params.requestedAmount,
      totalAmountRepaid: 0.0,
      outstandingBalance: params.requestedAmount,
      installmentsCompleted: 0,
      installmentsRemaining: params.tenorMonths,
      status: 'SUBMITTED',
      purpose: params.purpose,
      applicationDate: new Date().toISOString().slice(0, 10),
      schedule: [],
    };
  }

  /**
   * 3. Move Application to Under Review
   */
  public static startCommitteeReview(loan: ComprehensiveLoanEntity): ComprehensiveLoanEntity {
    if (loan.status !== 'SUBMITTED') {
      throw new Error(`Cannot review loan with status '${loan.status}'. Must be 'SUBMITTED'.`);
    }
    return { ...loan, status: 'UNDER_REVIEW' };
  }

  /**
   * 4. Record Committee Decision (Approves or Rejects)
   * Captures Approver, Decision, Date, Time, and Mandatory Comment
   */
  public static recordCommitteeDecision(
    loan: ComprehensiveLoanEntity,
    approver: { id: string; name: string; role: string },
    decision: 'APPROVED' | 'REJECTED',
    comment: string,
    ipAddress?: string
  ): ComprehensiveLoanEntity {
    if (loan.status !== 'SUBMITTED' && loan.status !== 'UNDER_REVIEW') {
      throw new Error(`Cannot record decision on loan with status '${loan.status}'.`);
    }

    if (!comment || comment.trim().length === 0) {
      throw new Error('Mandatory justification comment is required for committee audit records.');
    }

    const now = new Date();
    const decisionDate = now.toISOString().slice(0, 10);
    const decisionTime = now.toTimeString().slice(0, 8);

    const audit: CommitteeDecisionAudit = {
      approverId: approver.id,
      approverName: approver.name,
      approverRole: approver.role,
      decision,
      date: decisionDate,
      time: decisionTime,
      timestampIso: now.toISOString(),
      comment: comment.trim(),
      ipAddress,
    };

    return {
      ...loan,
      status: decision === 'APPROVED' ? 'APPROVED' : 'REJECTED',
      committeeDecision: audit,
    };
  }

  /**
   * 5. Disburse Loan (Approved -> Active)
   * Generates initial amortization schedule
   */
  public static disburseLoan(
    loan: ComprehensiveLoanEntity,
    disbursementRef: string,
    startRepaymentMonth: string // 'YYYY-MM'
  ): ComprehensiveLoanEntity {
    if (loan.status !== 'APPROVED') {
      throw new Error(`Cannot disburse loan with status '${loan.status}'. Loan must be 'APPROVED'.`);
    }

    if (!disbursementRef || disbursementRef.trim().length === 0) {
      throw new Error('Disbursement bank transfer reference is required.');
    }

    // Generate Amortization Schedule
    const schedule: LoanInstallmentRecord[] = [];
    const monthlyInstallment = Number((loan.originalLoanAmount / loan.tenorMonths).toFixed(2));
    let runningSum = 0;

    const [startYearStr, startMonthStr] = startRepaymentMonth.split('-');
    let currentYear = parseInt(startYearStr, 10);
    let currentMonth = parseInt(startMonthStr, 10);

    for (let i = 1; i <= loan.tenorMonths; i++) {
      const isLast = i === loan.tenorMonths;
      const expectedAmount = isLast ? Number((loan.originalLoanAmount - runningSum).toFixed(2)) : monthlyInstallment;
      runningSum += expectedAmount;

      const formattedMonth = `${currentYear}-${String(currentMonth).padStart(2, '0')}`;
      const dueDate = `${formattedMonth}-25`;

      schedule.push({
        installmentNumber: i,
        dueMonth: formattedMonth,
        dueDate,
        expectedAmount,
        principalPortion: expectedAmount,
        interestPortion: 0.0,
        paidAmount: 0.0,
        status: 'PENDING',
      });

      currentMonth++;
      if (currentMonth > 12) {
        currentMonth = 1;
        currentYear++;
      }
    }

    return {
      ...loan,
      status: 'ACTIVE',
      disbursementDate: new Date().toISOString().slice(0, 10),
      disbursementReference: disbursementRef.trim(),
      schedule,
    };
  }

  /**
   * 6. Process Monthly Repayment
   * Automatically updates:
   * - Total amount repaid
   * - Outstanding balance
   * - Installments completed & remaining
   * - Transitions to 'FULLY_REPAID' when balance reaches zero
   */
  public static processRepayment(
    loan: ComprehensiveLoanEntity,
    paymentAmount: number,
    paymentMonth: string,
    paymentRef: string
  ): { updatedLoan: LoanEntityProcessed; isFullyLiquidated: boolean } {
    if (loan.status !== 'ACTIVE') {
      throw new Error(`Cannot apply repayment to loan with status '${loan.status}'. Loan must be 'ACTIVE'.`);
    }

    if (paymentAmount <= 0) {
      throw new Error('Payment amount must be greater than zero.');
    }

    const updatedSchedule = [...loan.schedule];
    let remainingToAllocate = paymentAmount;
    let completedCount = 0;

    for (let i = 0; i < updatedSchedule.length; i++) {
      const inst = updatedSchedule[i];
      if (inst.status !== 'PAID') {
        const unpaidForInst = inst.expectedAmount - inst.paidAmount;
        const allocation = Math.min(remainingToAllocate, unpaidForInst);

        inst.paidAmount = Number((inst.paidAmount + allocation).toFixed(2));
        remainingToAllocate = Number((remainingToAllocate - allocation).toFixed(2));
        inst.paymentReference = paymentRef;
        inst.settledDate = new Date().toISOString().slice(0, 10);

        if (inst.paidAmount >= inst.expectedAmount) {
          inst.status = 'PAID';
        } else {
          inst.status = 'PARTIAL';
        }
      }

      if (inst.status === 'PAID') {
        completedCount++;
      }

      if (remainingToAllocate <= 0 && inst.status !== 'PAID') {
        // Break once allocation exhausted
        break;
      }
    }

    const totalRepaid = Number((loan.totalAmountRepaid + paymentAmount).toFixed(2));
    const outstanding = Math.max(0, Number((loan.totalRepayable - totalRepaid).toFixed(2)));
    const installmentsRemaining = loan.tenorMonths - completedCount;
    const isFullyLiquidated = outstanding === 0;

    const updatedLoan: ComprehensiveLoanEntity = {
      ...loan,
      totalAmountRepaid: totalRepaid,
      outstandingBalance: outstanding,
      installmentsCompleted: completedCount,
      installmentsRemaining,
      status: isFullyLiquidated ? 'FULLY_REPAID' : 'ACTIVE',
      schedule: updatedSchedule,
    };

    return {
      updatedLoan,
      isFullyLiquidated,
    };
  }

  /**
   * 7. Cancel Application
   */
  public static cancelApplication(loan: ComprehensiveLoanEntity, reason: string): ComprehensiveLoanEntity {
    if (loan.status === 'ACTIVE' || loan.status === 'FULLY_REPAID') {
      throw new Error(`Cannot cancel a loan that is already active or repaid.`);
    }

    return {
      ...loan,
      status: 'CANCELLED',
      cancellationReason: reason,
    };
  }
}

export type LoanEntityProcessed = ComprehensiveLoanEntity;
