/**
 * Centralized Financial Approval Engine & Governance System
 * Ministry Cooperative Contributory Fund
 */

export type FinancialRequestType = 
  | 'LOAN_APPLICATION' 
  | 'MEMBER_WITHDRAWAL' 
  | 'FINANCIAL_ADJUSTMENT' 
  | 'SPECIAL_LIQUIDITY_RELEASE';

export type CentralApprovalStatus = 
  | 'PENDING_APPROVAL' 
  | 'UNDER_REVIEW' 
  | 'CLARIFICATION_REQUESTED' 
  | 'APPROVED' 
  | 'REJECTED';

export interface ApprovalThresholdTier {
  id: string;
  name: string;
  minAmount: number;
  maxAmount: number;
  requiredSignatures: number;
  requiresChairmanApproval: boolean;
}

export interface DecisionAuditRecord {
  approverId: string;
  approverName: string;
  approverRole: string;
  action: 'APPROVED' | 'REJECTED' | 'CLARIFICATION_REQUESTED';
  date: string; // 'YYYY-MM-DD'
  time: string; // 'HH:MM:SS'
  timestampIso: string;
  comment: string;
  clarificationQuery?: string;
  signatureHash: string;
}

export interface FinancialApprovalRequest {
  id: string;
  requestNumber: string;
  requestType: FinancialRequestType;
  initiatorUserId: string; // Used for Maker-Checker (Separation of Duties)
  initiatorName: string;
  memberId: string;
  employeeId: string;
  applicantName: string;
  department: string;
  gradeLevel: string;
  
  // Financial Snapshot
  requestedAmount: number;
  memberContributionBalance: number;
  previousLoansCount: number;
  currentLoanBalance: number;
  
  // Request Details
  requestDate: string;
  supportingInformation: string;
  attachments?: string[];
  
  // Multi-Signature Governance
  thresholdTier: ApprovalThresholdTier;
  signaturesReceived: number;
  signaturesRequired: number;
  status: CentralApprovalStatus;
  
  // Audit Trail
  decisionHistory: DecisionAuditRecord[];
  clarificationThread?: {
    query: string;
    queriedAt: string;
    queriedBy: string;
    response?: string;
    respondedAt?: string;
  }[];
}

export interface NotificationPayload {
  id: string;
  recipientUserId: string;
  recipientName: string;
  recipientEmail?: string;
  title: string;
  message: string;
  eventType: 'REQUEST_SUBMITTED' | 'REQUEST_APPROVED' | 'REQUEST_REJECTED' | 'CLARIFICATION_REQUESTED';
  requestNumber: string;
  timestamp: string;
  isRead: boolean;
}

export class ApprovalEngine {
  public static THRESHOLD_TIERS: ApprovalThresholdTier[] = [
    {
      id: 'tier-1',
      name: 'Standard Tier (₦0 - ₦200,000)',
      minAmount: 0,
      maxAmount: 200000,
      requiredSignatures: 1,
      requiresChairmanApproval: false,
    },
    {
      id: 'tier-2',
      name: 'Mid Tier (₦200,001 - ₦1,000,000)',
      minAmount: 200001,
      maxAmount: 1000000,
      requiredSignatures: 2,
      requiresChairmanApproval: false,
    },
    {
      id: 'tier-3',
      name: 'Executive Tier (> ₦1,000,000)',
      minAmount: 1000001,
      maxAmount: Infinity,
      requiredSignatures: 3,
      requiresChairmanApproval: true,
    },
  ];

  /**
   * Determine the appropriate threshold tier for a requested amount
   */
  public static getThresholdForAmount(amount: number): ApprovalThresholdTier {
    const tier = this.THRESHOLD_TIERS.find(t => amount >= t.minAmount && amount <= t.maxAmount);
    return tier || this.THRESHOLD_TIERS[this.THRESHOLD_TIERS.length - 1];
  }

  /**
   * Submit a new financial request into the centralized approval queue
   */
  public static createRequest(params: {
    requestType: FinancialRequestType;
    initiatorUserId: string;
    initiatorName: string;
    memberId: string;
    employeeId: string;
    applicantName: string;
    department: string;
    gradeLevel: string;
    requestedAmount: number;
    memberContributionBalance: number;
    previousLoansCount: number;
    currentLoanBalance: number;
    supportingInformation: string;
    attachments?: string[];
  }): { request: FinancialApprovalRequest; notification: NotificationPayload } {
    const threshold = this.getThresholdForAmount(params.requestedAmount);
    const requestNumber = `REQ-${params.requestType.slice(0, 3)}-${Date.now().toString().slice(-6)}`;
    const now = new Date();

    const request: FinancialApprovalRequest = {
      id: `appr_${Date.now()}_${Math.random().toString(36).substr(2, 6)}`,
      requestNumber,
      requestType: params.requestType,
      initiatorUserId: params.initiatorUserId,
      initiatorName: params.initiatorName,
      memberId: params.memberId,
      employeeId: params.employeeId,
      applicantName: params.applicantName,
      department: params.department,
      gradeLevel: params.gradeLevel,
      requestedAmount: params.requestedAmount,
      memberContributionBalance: params.memberContributionBalance,
      previousLoansCount: params.previousLoansCount,
      currentLoanBalance: params.currentLoanBalance,
      requestDate: now.toISOString().slice(0, 10),
      supportingInformation: params.supportingInformation,
      attachments: params.attachments || [],
      thresholdTier: threshold,
      signaturesReceived: 0,
      signaturesRequired: threshold.requiredSignatures,
      status: 'PENDING_APPROVAL',
      decisionHistory: [],
    };

    const notification: NotificationPayload = {
      id: `notif-${Date.now()}`,
      recipientUserId: 'group-committee',
      recipientName: 'Cooperative Committee Members',
      title: `New Financial Request: ${requestNumber}`,
      message: `A new ${params.requestType.replace('_', ' ')} of ₦${params.requestedAmount.toLocaleString()} was submitted by ${params.applicantName} (${params.department}).`,
      eventType: 'REQUEST_SUBMITTED',
      requestNumber,
      timestamp: now.toISOString(),
      isRead: false,
    };

    return { request, notification };
  }

  /**
   * Process Committee Decision with Maker-Checker Enforcement & Separation of Duties
   */
  public static recordDecision(
    request: FinancialApprovalRequest,
    approver: { id: string; name: string; role: string },
    action: 'APPROVED' | 'REJECTED' | 'CLARIFICATION_REQUESTED',
    comment: string,
    clarificationQuery?: string
  ): { updatedRequest: FinancialApprovalRequest; notification: NotificationPayload } {
    // 1. Separation of Duties (Maker-Checker) Rule:
    if (request.initiatorUserId === approver.id) {
      throw new Error(
        `Segregation of Duties Violation: Approver '${approver.name}' cannot approve a financial request they initiated (${request.requestNumber}).`
      );
    }

    // 2. Prevent duplicate sign-off by the same officer
    const alreadySigned = request.decisionHistory.some(d => d.approverId === approver.id && d.action === 'APPROVED');
    if (action === 'APPROVED' && alreadySigned) {
      throw new Error(`Officer '${approver.name}' has already recorded an approval signature on this request.`);
    }

    if (!comment || comment.trim().length === 0) {
      throw new Error('A detailed justification comment is mandatory for permanent audit records.');
    }

    const now = new Date();
    const dateStr = now.toISOString().slice(0, 10);
    const timeStr = now.toTimeString().slice(0, 8);
    const signatureHash = `SIG-SHA256-${approver.id}-${Date.now()}`;

    const auditRecord: DecisionAuditRecord = {
      approverId: approver.id,
      approverName: approver.name,
      approverRole: approver.role,
      action,
      date: dateStr,
      time: timeStr,
      timestampIso: now.toISOString(),
      comment: comment.trim(),
      clarificationQuery: clarificationQuery?.trim(),
      signatureHash,
    };

    let newStatus: CentralApprovalStatus = request.status;
    let newSignatures = request.signaturesReceived;
    const history = [...request.decisionHistory, auditRecord];
    const clarificationThread = request.clarificationThread ? [...request.clarificationThread] : [];

    let notificationTitle = '';
    let notificationMessage = '';
    let eventType: NotificationPayload['eventType'] = 'REQUEST_APPROVED';

    if (action === 'REJECTED') {
      newStatus = 'REJECTED';
      notificationTitle = `Request Rejected: ${request.requestNumber}`;
      notificationMessage = `Your ${request.requestType.replace('_', ' ')} request of ₦${request.requestedAmount.toLocaleString()} was rejected by ${approver.name}. Reason: "${comment.trim()}".`;
      eventType = 'REQUEST_REJECTED';
    } else if (action === 'CLARIFICATION_REQUESTED') {
      newStatus = 'CLARIFICATION_REQUESTED';
      clarificationThread.push({
        query: clarificationQuery || comment,
        queriedAt: now.toISOString(),
        queriedBy: approver.name,
      });
      notificationTitle = `Clarification Requested: ${request.requestNumber}`;
      notificationMessage = `Committee member ${approver.name} requested clarification on your ${request.requestType.replace('_', ' ')}: "${clarificationQuery || comment}".`;
      eventType = 'CLARIFICATION_REQUESTED';
    } else if (action === 'APPROVED') {
      newSignatures += 1;
      if (newSignatures >= request.signaturesRequired) {
        newStatus = 'APPROVED';
        notificationTitle = `Request Approved: ${request.requestNumber}`;
        notificationMessage = `Your ${request.requestType.replace('_', ' ')} of ₦${request.requestedAmount.toLocaleString()} has received all required committee signatures (${newSignatures}/${request.signaturesRequired}) and is fully APPROVED.`;
      } else {
        newStatus = 'UNDER_REVIEW';
        notificationTitle = `Signature Recorded (${newSignatures}/${request.signaturesRequired}): ${request.requestNumber}`;
        notificationMessage = `Approval signature added by ${approver.name}. Awaiting ${request.signaturesRequired - newSignatures} more signature(s).`;
      }
      eventType = 'REQUEST_APPROVED';
    }

    const updatedRequest: FinancialApprovalRequest = {
      ...request,
      status: newStatus,
      signaturesReceived: newSignatures,
      decisionHistory: history,
      clarificationThread,
    };

    const notification: NotificationPayload = {
      id: `notif-${Date.now()}`,
      recipientUserId: request.memberId,
      recipientName: request.applicantName,
      title: notificationTitle,
      message: notificationMessage,
      eventType,
      requestNumber: request.requestNumber,
      timestamp: now.toISOString(),
      isRead: false,
    };

    return { updatedRequest, notification };
  }
}
