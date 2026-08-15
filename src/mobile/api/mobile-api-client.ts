/**
 * Secure Backend API Client for Mobile Application (Android & iOS)
 * Ministry Cooperative Contributory Fund
 * 
 * Strict Constraint: All financial calculations and authorizations happen on the backend.
 * The mobile client consumes server-derived balances and submit requests via secure Bearer tokens.
 */

export interface MobileMemberDashboardDto {
  memberId: string;
  employeeId: string;
  fullName: string;
  department: string;
  gradeLevel: string;
  phone: string;
  email: string;
  dateJoined: string;
  
  // Server-Derived Financial Figures
  totalAccumulatedSavings: number;
  currentSavingsBalance: number;
  monthlyContributionCommitment: number;
  activeLoanBalance: number;
  
  // Latest Transaction
  latestTransaction?: {
    reference: string;
    date: string;
    type: string;
    amount: number;
    description: string;
  };

  beneficiary: {
    name: string;
    relationship: string;
    phone: string;
    percentage: number;
  };
}

export interface MobileContributionHistoryItem {
  id: string;
  month: string; // 'YYYY-MM'
  expectedAmount: number;
  actualAmount: number;
  difference: number;
  paymentStatus: 'PAID' | 'PARTIALLY_PAID' | 'NOT_PAID' | 'OVERPAID' | 'PENDING_VERIFICATION';
  paymentDate?: string;
  paymentMethod?: string;
  transactionReference?: string;
}

export interface MobileLoanSummaryDto {
  hasActiveLoan: boolean;
  activeLoan?: {
    id: string;
    loanNumber: string;
    loanType: 'SALARY_ADVANCE' | 'EMERGENCY_LOAN';
    originalPrincipal: number;
    interestRate: number; // 0.00%
    monthlyRepayment: number;
    totalPaid: number;
    outstandingBalance: number;
    installmentsCompleted: number;
    installmentsRemaining: number;
    tenorMonths: number;
    disbursementDate: string;
    status: 'ACTIVE' | 'SUBMITTED' | 'UNDER_REVIEW' | 'FULLY_REPAID';
  };
  loanEligibility: {
    maxEligibleAmount: number; // Calculated on backend (<= Accumulated Savings)
    isEligibleForNewLoan: boolean;
    reasonIfIneligible?: string;
  };
}

export interface MobileWithdrawalSummaryDto {
  isEligibleForWithdrawal: boolean;
  totalSavingsPool: number;
  activeLoanDeduction: number;
  maxNetAllowableWithdrawal: number;
  requestsHistory: {
    id: string;
    requestNumber: string;
    requestedAmount: number;
    approvedAmount?: number;
    requestDate: string;
    reason: string;
    status: 'PENDING_COMMITTEE_REVIEW' | 'APPROVED' | 'PAID_OUT_AND_SETTLED' | 'REJECTED';
  }[];
}

export class MobileApiClient {
  private static authToken: string | null = 'bearer_mock_mobile_jwt_token_2026';
  private static activeMemberId: string = 'mem-01';

  /**
   * Set Bearer authentication token
   */
  public static setAuthToken(token: string, memberId: string) {
    this.authToken = token;
    this.activeMemberId = memberId;
  }

  /**
   * 1. Fetch Member Home Dashboard (Server-Calculated Balances)
   */
  public static async fetchHomeDashboard(): Promise<MobileMemberDashboardDto> {
    // In production, makes HTTPS GET to /api/v1/mobile/members/me/dashboard
    return {
      memberId: 'mem-01',
      employeeId: 'MIN-EMP-1042',
      fullName: 'Dr. Aliyu Mohammed',
      department: 'Finance & Accounts',
      gradeLevel: 'GL-14',
      phone: '+234 803 123 4567',
      email: 'aliyu.m@ministry.gov.ng',
      dateJoined: '2021-03-15',
      totalAccumulatedSavings: 1750000,
      currentSavingsBalance: 1750000,
      monthlyContributionCommitment: 50000,
      activeLoanBalance: 240000,
      latestTransaction: {
        reference: 'PAYROLL-AUG-2026-1042',
        date: '2026-08-14',
        type: 'Monthly Contribution',
        amount: 50000,
        description: 'August 2026 Monthly Payroll Contribution',
      },
      beneficiary: {
        name: 'Amina Aliyu Mohammed',
        relationship: 'Spouse',
        phone: '+234 802 987 6543',
        percentage: 100,
      },
    };
  }

  /**
   * 2. Fetch Member Monthly Contribution Schedule
   */
  public static async fetchContributionHistory(): Promise<MobileContributionHistoryItem[]> {
    return [
      { id: 'c-01', month: '2026-08', expectedAmount: 50000, actualAmount: 50000, difference: 0, paymentStatus: 'PAID', paymentDate: '2026-08-14', paymentMethod: 'PAYROLL_DEDUCTION', transactionReference: 'PAYROLL-AUG-2026-1042' },
      { id: 'c-02', month: '2026-07', expectedAmount: 50000, actualAmount: 50000, difference: 0, paymentStatus: 'PAID', paymentDate: '2026-07-25', paymentMethod: 'PAYROLL_DEDUCTION', transactionReference: 'PAYROLL-JUL-2026-1042' },
      { id: 'c-03', month: '2026-06', expectedAmount: 50000, actualAmount: 50000, difference: 0, paymentStatus: 'PAID', paymentDate: '2026-06-25', paymentMethod: 'PAYROLL_DEDUCTION', transactionReference: 'PAYROLL-JUN-2026-1042' },
      { id: 'c-04', month: '2026-05', expectedAmount: 50000, actualAmount: 50000, difference: 0, paymentStatus: 'PAID', paymentDate: '2026-05-25', paymentMethod: 'PAYROLL_DEDUCTION', transactionReference: 'PAYROLL-MAY-2026-1042' },
      { id: 'c-05', month: '2026-04', expectedAmount: 50000, actualAmount: 50000, difference: 0, paymentStatus: 'PAID', paymentDate: '2026-04-25', paymentMethod: 'PAYROLL_DEDUCTION', transactionReference: 'PAYROLL-APR-2026-1042' },
    ];
  }

  /**
   * 3. Fetch Loan Facility & Backend Eligibility Figures
   */
  public static async fetchLoanSummary(): Promise<MobileLoanSummaryDto> {
    return {
      hasActiveLoan: true,
      activeLoan: {
        id: 'ln-01',
        loanNumber: 'LOAN-2026-0042',
        loanType: 'SALARY_ADVANCE',
        originalPrincipal: 480000,
        interestRate: 0.0,
        monthlyRepayment: 40000,
        totalPaid: 240000,
        outstandingBalance: 240000,
        installmentsCompleted: 6,
        installmentsRemaining: 6,
        tenorMonths: 12,
        disbursementDate: '2026-02-15',
        status: 'ACTIVE',
      },
      loanEligibility: {
        maxEligibleAmount: 1750000, // Member accumulated savings
        isEligibleForNewLoan: false, // 1 active loan already exists
        reasonIfIneligible: 'Member currently has an active facility in repayment (LOAN-2026-0042).',
      },
    };
  }

  /**
   * 4. Submit Loan Application to Backend
   */
  public static async submitLoanApplication(params: {
    loanType: 'SALARY_ADVANCE' | 'EMERGENCY_LOAN';
    requestedAmount: number;
    tenorMonths: number;
    purpose: string;
  }): Promise<{ success: boolean; loanNumber: string; message: string }> {
    if (params.requestedAmount <= 0) throw new Error('Amount must be greater than zero');
    return {
      success: true,
      loanNumber: `LOAN-2026-${Math.floor(1000 + Math.random() * 9000)}`,
      message: 'Loan application submitted for committee review.',
    };
  }

  /**
   * 5. Fetch Withdrawal Eligibility & Requests History
   */
  public static async fetchWithdrawalSummary(): Promise<MobileWithdrawalSummaryDto> {
    return {
      isEligibleForWithdrawal: true,
      totalSavingsPool: 1750000,
      activeLoanDeduction: 240000,
      maxNetAllowableWithdrawal: 1510000, // 1.75M - 240k active loan
      requestsHistory: [
        {
          id: 'wth-01',
          requestNumber: 'WTH-2026-0012',
          requestedAmount: 300000,
          approvedAmount: 300000,
          requestDate: '2026-08-10',
          reason: 'Children secondary school academic tuition',
          status: 'APPROVED',
        },
      ],
    };
  }

  /**
   * 6. Submit Withdrawal Request
   */
  public static async submitWithdrawalRequest(params: {
    requestedAmount: number;
    reason: string;
    bankName: string;
    accountNumber: string;
  }): Promise<{ success: boolean; requestNumber: string; message: string }> {
    if (params.requestedAmount <= 0) throw new Error('Withdrawal amount must be greater than zero');
    return {
      success: true,
      requestNumber: `WTH-2026-${Math.floor(1000 + Math.random() * 9000)}`,
      message: 'Withdrawal request submitted for committee clearance.',
    };
  }
}
