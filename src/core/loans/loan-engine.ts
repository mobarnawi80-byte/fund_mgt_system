/**
 * Loan Management & 0% Interest Amortization Engine
 * Ministry Cooperative Contributory Fund
 */

export interface LoanValidationResult {
  isEligible: boolean;
  maxLoanAmount: number;
  requestedAmount: number;
  tenorMonths: number;
  monthlyInstallment: number;
  interestRate: number; // Strictly 0.00
  savingsSecurityBuffer: number;
  violations: string[];
}

export interface AmortizationScheduleItem {
  installmentNumber: number;
  dueMonth: string; // 'YYYY-MM'
  dueDate: string;
  expectedAmount: number;
  principalPortion: number;
  interestPortion: number; // 0.00
  paidAmount: number;
  status: 'PENDING' | 'PAID' | 'PARTIAL' | 'MISSED';
  settledDate?: string;
  paymentReference?: string;
}

export interface LoanEntity {
  id: string;
  loanNumber: string;
  memberId: string;
  loanType: 'SALARY_ADVANCE' | 'EMERGENCY_LOAN';
  principalAmount: number;
  interestRate: number; // 0.00
  monthlyInstallment: number;
  tenorMonths: number;
  totalRepayable: number;
  totalPaid: number;
  outstandingBalance: number;
  status: 'PENDING_APPROVAL' | 'APPROVED' | 'DISBURSED' | 'ACTIVE' | 'PAID_OFF';
  schedule: AmortizationScheduleItem[];
  disbursementDate?: string;
}

export class LoanEngine {
  /**
   * Validate Loan Application Eligibility Against Cooperative Rules
   * Rule 1: Max Loan Amount <= Accumulated Member Savings
   * Rule 2: Interest Rate is strictly 0%
   * Rule 3: Tenor must be between 1 and 24 months
   */
  public static validateApplication(
    accumulatedSavings: number,
    requestedAmount: number,
    tenorMonths: number,
    activeLoansCount: number = 0
  ): LoanValidationResult {
    const violations: string[] = [];

    if (requestedAmount <= 0) {
      violations.push('Requested loan amount must be greater than zero.');
    }

    if (requestedAmount > accumulatedSavings) {
      violations.push(
        `Requested loan amount (₦${requestedAmount.toLocaleString()}) exceeds member accumulated contributions (₦${accumulatedSavings.toLocaleString()}).`
      );
    }

    if (tenorMonths < 1 || tenorMonths > 24) {
      violations.push('Tenor must be between 1 and 24 months.');
    }

    if (activeLoansCount >= 2) {
      violations.push('Member already has maximum allowable concurrent active loans (2).');
    }

    const monthlyInstallment = tenorMonths > 0 ? Number((requestedAmount / tenorMonths).toFixed(2)) : 0;
    const savingsSecurityBuffer = accumulatedSavings - requestedAmount;

    return {
      isEligible: violations.length === 0,
      maxLoanAmount: accumulatedSavings,
      requestedAmount,
      tenorMonths,
      monthlyInstallment,
      interestRate: 0.0,
      savingsSecurityBuffer,
      violations,
    };
  }

  /**
   * Generate Full Amortization Schedule (0% Interest)
   */
  public static generateSchedule(
    principal: number,
    tenorMonths: number,
    startYearMonth: string // '2026-09'
  ): AmortizationScheduleItem[] {
    const schedule: AmortizationScheduleItem[] = [];
    const monthlyInstallment = Number((principal / tenorMonths).toFixed(2));
    let runningSum = 0;

    const [startYearStr, startMonthStr] = startYearMonth.split('-');
    let currentYear = parseInt(startYearStr, 10);
    let currentMonth = parseInt(startMonthStr, 10);

    for (let i = 1; i <= tenorMonths; i++) {
      // Adjustment for last installment rounding if any
      const isLast = i === tenorMonths;
      const expectedAmount = isLast ? Number((principal - runningSum).toFixed(2)) : monthlyInstallment;
      runningSum += expectedAmount;

      const formattedMonth = `${currentYear}-${String(currentMonth).padStart(2, '0')}`;
      const dueDate = `${formattedMonth}-25`; // Standard 25th payroll cut-off

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

      // Increment month
      currentMonth++;
      if (currentMonth > 12) {
        currentMonth = 1;
        currentYear++;
      }
    }

    return schedule;
  }

  /**
   * Process a Monthly Loan Repayment
   * Updates schedule, deducts from outstanding balance, and transitions status
   */
  public static applyRepayment(
    loan: LoanEntity,
    paymentAmount: number,
    repaymentMonth: string,
    reference: string
  ): { updatedLoan: LoanEntity; settledInstallment: AmortizationScheduleItem | null } {
    if (paymentAmount <= 0) {
      throw new Error('Repayment amount must be greater than zero.');
    }

    const updatedSchedule = [...loan.schedule];
    let remainingPayment = paymentAmount;
    let targetInstallment: AmortizationScheduleItem | null = null;

    // Find first pending or partial installment for the given month or earliest unpaid
    for (let i = 0; i < updatedSchedule.length; i++) {
      const item = updatedSchedule[i];
      if (item.status === 'PENDING' || item.status === 'PARTIAL' || item.status === 'MISSED') {
        const unpaidForThisItem = item.expectedAmount - item.paidAmount;
        const allocation = Math.min(remainingPayment, unpaidForThisItem);

        item.paidAmount += allocation;
        remainingPayment -= allocation;
        item.paymentReference = reference;
        item.settledDate = new Date().toISOString().split('T')[0];

        if (item.paidAmount >= item.expectedAmount) {
          item.status = 'PAID';
        } else {
          item.status = 'PARTIAL';
        }

        if (!targetInstallment) targetInstallment = item;

        if (remainingPayment <= 0) break;
      }
    }

    const newTotalPaid = Number((loan.totalPaid + paymentAmount).toFixed(2));
    const newOutstandingBalance = Math.max(0, Number((loan.totalRepayable - newTotalPaid).toFixed(2)));
    const newStatus = newOutstandingBalance === 0 ? 'PAID_OFF' : 'ACTIVE';

    const updatedLoan: LoanEntity = {
      ...loan,
      totalPaid: newTotalPaid,
      outstandingBalance: newOutstandingBalance,
      status: newStatus,
      schedule: updatedSchedule,
    };

    return {
      updatedLoan,
      settledInstallment: targetInstallment,
    };
  }
}
