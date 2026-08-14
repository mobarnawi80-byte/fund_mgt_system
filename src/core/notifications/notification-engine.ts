/**
 * Cooperative Fund Comprehensive Multi-Channel Notification Engine
 * Ministry Cooperative Contributory Fund
 */

export type NotificationChannel = 'IN_APP' | 'SMS' | 'EMAIL';

export type NotificationEventType =
  // Member Notifications (10 Triggers)
  | 'MEMBER_CONTRIBUTION_RECEIVED'
  | 'MEMBER_CONTRIBUTION_MISSING'
  | 'MEMBER_MANUAL_PAYMENT_RECORDED'
  | 'MEMBER_LOAN_SUBMITTED'
  | 'MEMBER_LOAN_APPROVED'
  | 'MEMBER_LOAN_REJECTED'
  | 'MEMBER_LOAN_REPAYMENT_RECEIVED'
  | 'MEMBER_WITHDRAWAL_SUBMITTED'
  | 'MEMBER_WITHDRAWAL_APPROVED'
  | 'MEMBER_WITHDRAWAL_REJECTED'
  
  // Finance Officer Notifications (4 Triggers)
  | 'FO_PAYROLL_UPLOADED'
  | 'FO_PAYROLL_RECONCILIATION_EXCEPTIONS'
  | 'FO_MANUAL_PAYMENT_VERIFICATION_REQUIRED'
  | 'FO_LOAN_REPAYMENT_EXCEPTION'
  
  // Committee Member Notifications (2 Triggers)
  | 'COMM_LOAN_APPROVAL_REQUIRED'
  | 'COMM_WITHDRAWAL_APPROVAL_REQUIRED';

export type UserAudienceRole = 'MEMBER' | 'FINANCE_OFFICER' | 'COMMITTEE_MEMBER' | 'SUPER_ADMIN';

export interface UserNotificationRecord {
  id: string;
  userId: string;
  userRole: UserAudienceRole;
  recipientName: string;
  recipientPhone?: string;
  recipientEmail?: string;
  eventType: NotificationEventType;
  title: string;
  message: string;
  smsContent?: string;
  emailSubject?: string;
  emailHtmlBody?: string;
  channelsDelivered: NotificationChannel[];
  timestamp: string;
  isRead: boolean;
  referenceId?: string; // loanId, withdrawalId, batchId, etc.
  actionUrl?: string;
}

export interface NotificationEventData {
  eventType: NotificationEventType;
  recipient: {
    userId: string;
    role: UserAudienceRole;
    name: string;
    phone?: string;
    email?: string;
  };
  variables: {
    amount?: number;
    month?: string;
    reference?: string;
    tenorMonths?: number;
    reason?: string;
    approverName?: string;
    balance?: number;
    exceptionCount?: number;
    department?: string;
  };
}

export class NotificationEngine {
  private static formatNaira(val?: number): string {
    if (val === undefined || isNaN(val)) return '₦0';
    return `₦${val.toLocaleString('en-NG', { maximumFractionDigits: 0 })}`;
  }

  /**
   * Generates formatted content for In-App, SMS, and Email across all 16 system triggers
   */
  public static compileNotification(event: NotificationEventData): UserNotificationRecord {
    const { eventType, recipient, variables } = event;
    const now = new Date().toISOString();
    const formattedAmt = this.formatNaira(variables.amount);
    const memberName = recipient.name;

    let title = '';
    let message = '';
    let smsContent = '';
    let emailSubject = '';
    let emailHtmlBody = '';
    const channels: NotificationChannel[] = ['IN_APP'];

    if (recipient.phone) channels.push('SMS');
    if (recipient.email) channels.push('EMAIL');

    switch (eventType) {
      // 1. Member: Contribution Received
      case 'MEMBER_CONTRIBUTION_RECEIVED':
        title = 'Monthly Contribution Received';
        message = `Your monthly contribution of ${formattedAmt} for ${variables.month || 'this month'} has been credited to your savings balance.`;
        smsContent = `CoopFund: Dear ${memberName}, your contribution of ${formattedAmt} for ${variables.month} was received. Cumulative balance: ${this.formatNaira(variables.balance)}.`;
        emailSubject = `Contribution Credit Confirmation - ${variables.month}`;
        emailHtmlBody = `<h3>Monthly Contribution Received</h3><p>Dear ${memberName},</p><p>We confirm receipt of your monthly contribution of <strong>${formattedAmt}</strong> for <strong>${variables.month}</strong>.</p><p>Current Cumulative Savings: <strong>${this.formatNaira(variables.balance)}</strong></p>`;
        break;

      // 2. Member: Contribution Missing
      case 'MEMBER_CONTRIBUTION_MISSING':
        title = 'Missed Monthly Contribution Alert';
        message = `Your monthly contribution for ${variables.month} was omitted from the electronic payroll deduction. Please make a direct deposit.`;
        smsContent = `CoopFund Alert: Dear ${memberName}, your contribution for ${variables.month} was missed on payroll. Please record a direct transfer to avoid arrears.`;
        emailSubject = `Notice: Missed Contribution Deduction for ${variables.month}`;
        emailHtmlBody = `<h3>Missed Payroll Contribution</h3><p>Dear ${memberName},</p><p>Your monthly contribution of <strong>${formattedAmt}</strong> was omitted from the recent payroll deduction for <strong>${variables.month}</strong>.</p><p>You can make a direct bank transfer and upload your receipt on the member portal.</p>`;
        break;

      // 3. Member: Manual Payment Recorded
      case 'MEMBER_MANUAL_PAYMENT_RECORDED':
        title = 'Manual Payment Verified & Credited';
        message = `Your direct manual payment of ${formattedAmt} (Ref: ${variables.reference}) has been verified and posted.`;
        smsContent = `CoopFund: Manual payment of ${formattedAmt} verified (Ref: ${variables.reference}). Your account has been credited.`;
        emailSubject = `Manual Payment Receipt Verified - ${variables.reference}`;
        emailHtmlBody = `<h3>Manual Payment Verified</h3><p>Dear ${memberName},</p><p>Your manual payment of <strong>${formattedAmt}</strong> has been verified by the Finance Department.</p><p>Transaction Reference: <strong>${variables.reference}</strong></p>`;
        break;

      // 4. Member: Loan Application Submitted
      case 'MEMBER_LOAN_SUBMITTED':
        title = 'Loan Application Received';
        message = `Your 0% interest loan application of ${formattedAmt} (${variables.tenorMonths} months tenor) has been submitted for committee review.`;
        smsContent = `CoopFund: Loan request of ${formattedAmt} submitted. Ref: ${variables.reference}. Awaiting committee review.`;
        emailSubject = `Loan Application Submitted - ${variables.reference}`;
        emailHtmlBody = `<h3>Loan Application Submitted</h3><p>Dear ${memberName},</p><p>Your loan application for <strong>${formattedAmt}</strong> has been received and routed to the credit committee.</p>`;
        break;

      // 5. Member: Loan Approved
      case 'MEMBER_LOAN_APPROVED':
        title = 'Loan Application APPROVED!';
        message = `Congratulations! Your 0% interest loan of ${formattedAmt} has been approved by the committee and queued for disbursement.`;
        smsContent = `CoopFund: Congratulations! Your loan of ${formattedAmt} (Ref: ${variables.reference}) was APPROVED by the committee.`;
        emailSubject = `Loan Approved - ${variables.reference}`;
        emailHtmlBody = `<h3>Loan Application Approved</h3><p>Dear ${memberName},</p><p>We are pleased to inform you that your loan application of <strong>${formattedAmt}</strong> has been <strong>APPROVED</strong>.</p>`;
        break;

      // 6. Member: Loan Rejected
      case 'MEMBER_LOAN_REJECTED':
        title = 'Loan Application Disapproved';
        message = `Your loan application of ${formattedAmt} was rejected. Reason: "${variables.reason || 'Criteria not met'}".`;
        smsContent = `CoopFund: Your loan request ${variables.reference} was rejected. Reason: ${variables.reason}.`;
        emailSubject = `Update on Loan Request - ${variables.reference}`;
        emailHtmlBody = `<h3>Loan Application Decision</h3><p>Dear ${memberName},</p><p>Your loan application of <strong>${formattedAmt}</strong> was declined. Reason: <em>${variables.reason}</em>.</p>`;
        break;

      // 7. Member: Loan Repayment Received
      case 'MEMBER_LOAN_REPAYMENT_RECEIVED':
        title = 'Loan Repayment Received';
        message = `Monthly loan repayment of ${formattedAmt} received. Outstanding loan balance: ${this.formatNaira(variables.balance)}.`;
        smsContent = `CoopFund: Loan repayment of ${formattedAmt} posted. Remaining debt balance: ${this.formatNaira(variables.balance)}.`;
        emailSubject = `Loan Repayment Confirmation - ${variables.reference}`;
        emailHtmlBody = `<h3>Loan Repayment Received</h3><p>Dear ${memberName},</p><p>Repayment of <strong>${formattedAmt}</strong> has been posted. Remaining balance: <strong>${this.formatNaira(variables.balance)}</strong>.</p>`;
        break;

      // 8. Member: Withdrawal Submitted
      case 'MEMBER_WITHDRAWAL_SUBMITTED':
        title = 'Withdrawal Request Submitted';
        message = `Your withdrawal request of ${formattedAmt} has been submitted to the executive committee for clearance.`;
        smsContent = `CoopFund: Withdrawal request of ${formattedAmt} submitted. Ref: ${variables.reference}. Awaiting clearance.`;
        emailSubject = `Withdrawal Request Received - ${variables.reference}`;
        emailHtmlBody = `<h3>Withdrawal Request Submitted</h3><p>Dear ${memberName},</p><p>Your savings withdrawal request of <strong>${formattedAmt}</strong> is under review.</p>`;
        break;

      // 9. Member: Withdrawal Approved
      case 'MEMBER_WITHDRAWAL_APPROVED':
        title = 'Withdrawal Approved for Payout';
        message = `Your withdrawal request of ${formattedAmt} was approved by the committee. Finance is processing bank disbursement.`;
        smsContent = `CoopFund: Withdrawal of ${formattedAmt} was APPROVED. Payment processing underway.`;
        emailSubject = `Withdrawal Approved - ${variables.reference}`;
        emailHtmlBody = `<h3>Withdrawal Approved</h3><p>Dear ${memberName},</p><p>Your withdrawal request of <strong>${formattedAmt}</strong> has been approved for disbursement.</p>`;
        break;

      // 10. Member: Withdrawal Rejected
      case 'MEMBER_WITHDRAWAL_REJECTED':
        title = 'Withdrawal Request Declined';
        message = `Your withdrawal request of ${formattedAmt} was declined. Reason: "${variables.reason}".`;
        smsContent = `CoopFund: Withdrawal request ${variables.reference} was rejected. Reason: ${variables.reason}.`;
        emailSubject = `Withdrawal Decision - ${variables.reference}`;
        emailHtmlBody = `<h3>Withdrawal Decision</h3><p>Dear ${memberName},</p><p>Your withdrawal request was declined. Reason: <em>${variables.reason}</em>.</p>`;
        break;

      // 11. Finance Officer: Payroll File Uploaded
      case 'FO_PAYROLL_UPLOADED':
        title = 'Payroll Ingestion File Ready';
        message = `A new electronic payroll file for ${variables.month} containing ${formattedAmt} has been uploaded for automated reconciliation.`;
        smsContent = `CoopFund Finance: New payroll file uploaded for ${variables.month} (${formattedAmt}). Reconcile now.`;
        emailSubject = `Action Required: Electronic Payroll Uploaded - ${variables.month}`;
        emailHtmlBody = `<h3>Payroll File Ingested</h3><p>Electronic payroll deduction file for <strong>${variables.month}</strong> totaling <strong>${formattedAmt}</strong> is ready for verification.</p>`;
        break;

      // 12. Finance Officer: Reconciliation Exceptions
      case 'FO_PAYROLL_RECONCILIATION_EXCEPTIONS':
        title = 'Payroll Reconciliation Exceptions Detected';
        message = `Payroll batch for ${variables.month} has ${variables.exceptionCount || 0} exception(s) requiring manual review and remapping.`;
        smsContent = `CoopFund Finance: ${variables.exceptionCount} exceptions found in ${variables.month} payroll reconciliation. Review required.`;
        emailSubject = `Attention: ${variables.exceptionCount} Exceptions in Payroll ${variables.month}`;
        emailHtmlBody = `<h3>Payroll Exceptions Detected</h3><p>Automated reconciliation detected <strong>${variables.exceptionCount}</strong> discrepancies in the <strong>${variables.month}</strong> batch.</p>`;
        break;

      // 13. Finance Officer: Manual Payment Requires Verification
      case 'FO_MANUAL_PAYMENT_VERIFICATION_REQUIRED':
        title = 'Manual Payment Verification Pending';
        message = `Member ${memberName} (${variables.department}) uploaded a direct bank receipt of ${formattedAmt}. Verification required.`;
        smsContent = `CoopFund Finance: Direct payment of ${formattedAmt} by ${memberName} requires verification. Ref: ${variables.reference}.`;
        emailSubject = `Pending Payment Verification: ${memberName}`;
        emailHtmlBody = `<h3>Payment Receipt Verification</h3><p>Member <strong>${memberName}</strong> uploaded a bank transfer receipt of <strong>${formattedAmt}</strong>.</p>`;
        break;

      // 14. Finance Officer: Loan Repayment Exception
      case 'FO_LOAN_REPAYMENT_EXCEPTION':
        title = 'Loan Repayment Variance Alert';
        message = `Loan repayment variance detected for ${memberName}. Expected ${formattedAmt} but payroll deducted less.`;
        smsContent = `CoopFund Finance: Repayment under-deduction variance for ${memberName}. Review loan ledger.`;
        emailSubject = `Alert: Loan Repayment Variance - ${memberName}`;
        emailHtmlBody = `<h3>Loan Repayment Variance</h3><p>Under-deduction detected for <strong>${memberName}</strong>. Facility Ref: <strong>${variables.reference}</strong>.</p>`;
        break;

      // 15. Committee: Loan Approval Required
      case 'COMM_LOAN_APPROVAL_REQUIRED':
        title = 'Action Required: Loan Approval Request';
        message = `New 0% loan request of ${formattedAmt} by ${memberName} (${variables.department}) requires committee review and sign-off.`;
        smsContent = `CoopFund Committee: Loan request of ${formattedAmt} by ${memberName} (${variables.department}) requires your digital signature.`;
        emailSubject = `Committee Action: Loan Approval Required for ${memberName}`;
        emailHtmlBody = `<h3>Loan Approval Required</h3><p>A new 0% interest loan application of <strong>${formattedAmt}</strong> submitted by <strong>${memberName}</strong> (${variables.department}) is pending committee signature.</p>`;
        break;

      // 16. Committee: Withdrawal Approval Required
      case 'COMM_WITHDRAWAL_APPROVAL_REQUIRED':
        title = 'Action Required: Withdrawal Approval Request';
        message = `Member ${memberName} (${variables.department}) requested savings withdrawal of ${formattedAmt}. Committee approval required.`;
        smsContent = `CoopFund Committee: Withdrawal request of ${formattedAmt} by ${memberName} requires committee review.`;
        emailSubject = `Committee Action: Withdrawal Clearance for ${memberName}`;
        emailHtmlBody = `<h3>Withdrawal Clearance Required</h3><p>Member <strong>${memberName}</strong> has submitted a savings withdrawal request of <strong>${formattedAmt}</strong>.</p>`;
        break;
    }

    const emailFooter = '<p style="color: #64748b; font-size: 11px; margin-top: 16px; border-top: 1px solid #e2e8f0; padding-top: 8px;">Ministry Cooperative Contributory Fund Society</p>';
    if (emailHtmlBody) {
      emailHtmlBody += emailFooter;
    }

    return {
      id: `notif_${Date.now()}_${Math.random().toString(36).substr(2, 6)}`,
      userId: recipient.userId,
      userRole: recipient.role,
      recipientName: memberName,
      recipientPhone: recipient.phone,
      recipientEmail: recipient.email,
      eventType,
      title,
      message,
      smsContent,
      emailSubject,
      emailHtmlBody,
      channelsDelivered: channels,
      timestamp: now,
      isRead: false,
      referenceId: variables.reference,
      actionUrl: eventType.includes('LOAN') ? '/loans' : eventType.includes('WITHDRAWAL') ? '/withdrawals' : '/contributions',
    };
  }
}
