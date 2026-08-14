/**
 * Immutable Financial Transaction Lifecycle & Reversal Engine
 * Ministry Cooperative Contributory Fund
 */

export type TransactionLifecycleState = 
  | 'DRAFT'
  | 'PENDING'
  | 'VERIFIED'
  | 'POSTED'
  | 'REVERSED';

export interface FinancialLifecycleTransaction {
  id: string;
  transactionReference: string;
  lifecycleState: TransactionLifecycleState;
  transactionType: 'CONTRIBUTION' | 'LOAN_DISBURSEMENT' | 'LOAN_REPAYMENT' | 'WITHDRAWAL' | 'MANUAL_PAYMENT' | 'ADJUSTMENT' | 'REVERSAL';
  memberId: string;
  employeeId: string;
  memberName: string;
  department: string;
  debitAccountCode: string;
  creditAccountCode: string;
  amount: number;
  description: string;
  createdAt: string;
  createdByUserId: string;
  verifiedAt?: string;
  verifiedByUserId?: string;
  postedAt?: string;
  isReversed: boolean;
  reversalReason?: string;
  reversedByUserId?: string;
  reversedAt?: string;
  reversalTransactionId?: string;
}

export class FinancialLifecycleEngine {
  /**
   * 1. Hard Delete Prevention Guard
   * Invariant: Financial records must NEVER be deleted from the database.
   */
  public static preventHardDelete(transactionId: string): never {
    throw new Error(
      `Statutory Compliance Violation: Hard deletion of financial transaction '${transactionId}' is prohibited. Financial records must be corrected using transaction reversals.`
    );
  }

  /**
   * 2. Transition from DRAFT to PENDING
   */
  public static submitToPending(tx: FinancialLifecycleTransaction): FinancialLifecycleTransaction {
    if (tx.lifecycleState !== 'DRAFT') {
      throw new Error(`Cannot submit transaction with state '${tx.lifecycleState}'. Must be 'DRAFT'.`);
    }
    return {
      ...tx,
      lifecycleState: 'PENDING',
    };
  }

  /**
   * 3. Transition from PENDING to VERIFIED
   */
  public static verifyTransaction(
    tx: FinancialLifecycleTransaction,
    verifierUserId: string
  ): FinancialLifecycleTransaction {
    if (tx.lifecycleState !== 'PENDING') {
      throw new Error(`Cannot verify transaction with state '${tx.lifecycleState}'. Must be 'PENDING'.`);
    }
    if (tx.createdByUserId === verifierUserId) {
      throw new Error(`Segregation of Duties Violation: Originator '${verifierUserId}' cannot verify their own transaction.`);
    }

    return {
      ...tx,
      lifecycleState: 'VERIFIED',
      verifiedAt: new Date().toISOString(),
      verifiedByUserId: verifierUserId,
    };
  }

  /**
   * 4. Transition from VERIFIED to POSTED
   */
  public static postToLedger(tx: FinancialLifecycleTransaction): FinancialLifecycleTransaction {
    if (tx.lifecycleState !== 'VERIFIED') {
      throw new Error(`Cannot post transaction with state '${tx.lifecycleState}'. Must be 'VERIFIED'.`);
    }

    return {
      ...tx,
      lifecycleState: 'POSTED',
      postedAt: new Date().toISOString(),
    };
  }

  /**
   * 5. Authorized Transaction Reversal Mechanism (Replaces Deletion)
   * Creates an equal and opposite reversing double-entry transaction.
   */
  public static reversePostedTransaction(
    originalTx: FinancialLifecycleTransaction,
    authorizerUserId: string,
    reversalReason: string
  ): {
    updatedOriginalTx: FinancialLifecycleTransaction;
    reversalTransaction: FinancialLifecycleTransaction;
  } {
    if (originalTx.lifecycleState !== 'POSTED') {
      throw new Error(`Only 'POSTED' transactions can be reversed. Current state is '${originalTx.lifecycleState}'.`);
    }
    if (originalTx.isReversed) {
      throw new Error(`Transaction '${originalTx.transactionReference}' has already been reversed.`);
    }
    if (!reversalReason || reversalReason.trim().length < 10) {
      throw new Error('A detailed justification reason (minimum 10 characters) is mandatory for financial reversals.');
    }

    const now = new Date().toISOString();
    const reversalId = `REV-${Date.now()}`;
    const reversalRef = `REV-JE-${originalTx.transactionReference}`;

    // Reversal Transaction with swapped debits & credits
    const reversalTransaction: FinancialLifecycleTransaction = {
      id: reversalId,
      transactionReference: reversalRef,
      lifecycleState: 'POSTED',
      transactionType: 'REVERSAL',
      memberId: originalTx.memberId,
      employeeId: originalTx.employeeId,
      memberName: originalTx.memberName,
      department: originalTx.department,
      debitAccountCode: originalTx.creditAccountCode, // Swapped
      creditAccountCode: originalTx.debitAccountCode, // Swapped
      amount: originalTx.amount,
      description: `REVERSAL of ${originalTx.transactionReference}: ${reversalReason.trim()}`,
      createdAt: now,
      createdByUserId: authorizerUserId,
      verifiedAt: now,
      verifiedByUserId: authorizerUserId,
      postedAt: now,
      isReversed: false,
    };

    const updatedOriginalTx: FinancialLifecycleTransaction = {
      ...originalTx,
      lifecycleState: 'REVERSED',
      isReversed: true,
      reversalReason: reversalReason.trim(),
      reversedByUserId: authorizerUserId,
      reversedAt: now,
      reversalTransactionId: reversalId,
    };

    return {
      updatedOriginalTx,
      reversalTransaction,
    };
  }
}
