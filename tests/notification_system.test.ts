import { describe, it, expect } from 'vitest';
import { 
  NotificationEngine, 
  NotificationEventType 
} from '../src/core/notifications/notification-engine';

describe('Cooperative Multi-Channel Notification Engine', () => {
  describe('1. Member Notification Event Triggers (All 10 Triggers)', () => {
    const member = {
      userId: 'mem-01',
      role: 'MEMBER' as const,
      name: 'Dr. Aliyu Mohammed',
      phone: '+2348031234567',
      email: 'aliyu.m@ministry.gov.ng',
    };

    const memberTriggers: { event: NotificationEventType; vars: any; expectedSnippet: string }[] = [
      { event: 'MEMBER_CONTRIBUTION_RECEIVED', vars: { amount: 50000, month: 'August 2026', balance: 1800000 }, expectedSnippet: 'contribution of ₦50,000' },
      { event: 'MEMBER_CONTRIBUTION_MISSING', vars: { amount: 50000, month: 'August 2026' }, expectedSnippet: 'omitted from the electronic payroll' },
      { event: 'MEMBER_MANUAL_PAYMENT_RECORDED', vars: { amount: 50000, reference: 'NIBSS-991823' }, expectedSnippet: 'manual payment of ₦50,000' },
      { event: 'MEMBER_LOAN_SUBMITTED', vars: { amount: 480000, tenorMonths: 12, reference: 'LOAN-0042' }, expectedSnippet: 'loan application of ₦480,000' },
      { event: 'MEMBER_LOAN_APPROVED', vars: { amount: 480000, reference: 'LOAN-0042' }, expectedSnippet: 'loan of ₦480,000 has been approved' },
      { event: 'MEMBER_LOAN_REJECTED', vars: { amount: 480000, reason: 'Savings insufficient', reference: 'LOAN-0042' }, expectedSnippet: 'Savings insufficient' },
      { event: 'MEMBER_LOAN_REPAYMENT_RECEIVED', vars: { amount: 40000, balance: 200000, reference: 'REPAY-01' }, expectedSnippet: 'Monthly loan repayment of ₦40,000 received' },
      { event: 'MEMBER_WITHDRAWAL_SUBMITTED', vars: { amount: 500000, reference: 'WTH-0012' }, expectedSnippet: 'withdrawal request of ₦500,000' },
      { event: 'MEMBER_WITHDRAWAL_APPROVED', vars: { amount: 500000, reference: 'WTH-0012' }, expectedSnippet: 'withdrawal request of ₦500,000 was approved' },
      { event: 'MEMBER_WITHDRAWAL_REJECTED', vars: { amount: 500000, reason: 'Active loan uncleared', reference: 'WTH-0012' }, expectedSnippet: 'Active loan uncleared' },
    ];

    memberTriggers.forEach(({ event, vars, expectedSnippet }) => {
      it(`should compile notification for trigger: ${event}`, () => {
        const notif = NotificationEngine.compileNotification({
          eventType: event,
          recipient: member,
          variables: vars,
        });

        expect(notif.userId).toBe('mem-01');
        expect(notif.channelsDelivered).toContain('IN_APP');
        expect(notif.channelsDelivered).toContain('SMS');
        expect(notif.channelsDelivered).toContain('EMAIL');
        expect(notif.message).toContain(expectedSnippet);
        expect(notif.smsContent).toBeDefined();
        expect(notif.emailHtmlBody).toContain('Ministry Cooperative Contributory Fund');
      });
    });
  });

  describe('2. Finance Officer Notification Event Triggers (All 4 Triggers)', () => {
    const fo = {
      userId: 'usr-finance-01',
      role: 'FINANCE_OFFICER' as const,
      name: 'Mallam Ibrahim Finance Officer',
      phone: '+2348077778899',
      email: 'finance@ministry.gov.ng',
    };

    it('should notify FO when payroll file is uploaded', () => {
      const notif = NotificationEngine.compileNotification({
        eventType: 'FO_PAYROLL_UPLOADED',
        recipient: fo,
        variables: { month: 'August 2026', amount: 150000 },
      });

      expect(notif.title).toContain('Payroll Ingestion File Ready');
      expect(notif.message).toContain('August 2026');
    });

    it('should notify FO when reconciliation exceptions occur', () => {
      const notif = NotificationEngine.compileNotification({
        eventType: 'FO_PAYROLL_RECONCILIATION_EXCEPTIONS',
        recipient: fo,
        variables: { month: 'August 2026', exceptionCount: 3 },
      });

      expect(notif.title).toContain('Exceptions Detected');
      expect(notif.message).toContain('3 exception(s)');
    });

    it('should notify FO when manual payment requires verification', () => {
      const notif = NotificationEngine.compileNotification({
        eventType: 'FO_MANUAL_PAYMENT_VERIFICATION_REQUIRED',
        recipient: fo,
        variables: { amount: 35000, department: 'Procurement', reference: 'NIBSS-99182' },
      });

      expect(notif.title).toContain('Manual Payment Verification Pending');
      expect(notif.message).toContain('₦35,000');
    });

    it('should notify FO when loan repayment variance occurs', () => {
      const notif = NotificationEngine.compileNotification({
        eventType: 'FO_LOAN_REPAYMENT_EXCEPTION',
        recipient: fo,
        variables: { amount: 40000, reference: 'LOAN-0042' },
      });

      expect(notif.title).toContain('Loan Repayment Variance Alert');
    });
  });

  describe('3. Committee Member Notification Event Triggers (All 2 Triggers)', () => {
    const comm = {
      userId: 'usr-comm-01',
      role: 'COMMITTEE_MEMBER' as const,
      name: 'Dr. Sarah Aliyu',
      phone: '+2348011112233',
      email: 'chairman@ministry.gov.ng',
    };

    it('should notify committee when loan requires approval', () => {
      const notif = NotificationEngine.compileNotification({
        eventType: 'COMM_LOAN_APPROVAL_REQUIRED',
        recipient: comm,
        variables: { amount: 480000, department: 'Finance & Accounts', reference: 'LOAN-0042' },
      });

      expect(notif.title).toContain('Loan Approval Request');
      expect(notif.message).toContain('₦480,000');
    });

    it('should notify committee when withdrawal requires approval', () => {
      const notif = NotificationEngine.compileNotification({
        eventType: 'COMM_WITHDRAWAL_APPROVAL_REQUIRED',
        recipient: comm,
        variables: { amount: 500000, department: 'Legal Services', reference: 'WTH-0012' },
      });

      expect(notif.title).toContain('Withdrawal Approval Request');
      expect(notif.message).toContain('₦500,000');
    });
  });

  describe('4. Multi-Channel Output Verification', () => {
    it('should generate properly formatted SMS length and email HTML', () => {
      const notif = NotificationEngine.compileNotification({
        eventType: 'MEMBER_CONTRIBUTION_RECEIVED',
        recipient: { userId: 'mem-01', role: 'MEMBER', name: 'Dr. Aliyu Mohammed', phone: '+2348031234567', email: 'aliyu.m@ministry.gov.ng' },
        variables: { amount: 50000, month: 'August 2026', balance: 1800000 },
      });

      expect(notif.smsContent?.length).toBeLessThan(160); // Standard single-page SMS GSM limit
      expect(notif.emailSubject).toContain('August 2026');
      expect(notif.emailHtmlBody).toContain('<h3>');
    });
  });
});
