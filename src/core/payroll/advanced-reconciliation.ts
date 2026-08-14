import { read, utils } from 'xlsx';

export interface RawPayrollRecord {
  rowNumber: number;
  employeeId: string;
  name: string;
  department: string;
  gradeLevel: string;
  contribution: number;
  month: string; // 'YYYY-MM'
}

export interface RegisteredMember {
  id: string;
  employeeId: string;
  fullName: string;
  department: string;
  gradeLevel: string;
  monthlyContribution: number;
  status: 'ACTIVE' | 'INACTIVE' | 'SUSPENDED';
  existingContributionsMonths: string[]; // List of months already paid
}

export type ExceptionType =
  | 'UNMATCHED_EMPLOYEE'
  | 'IN-FILE_DUPLICATE'
  | 'ALREADY_PAID_FOR_MONTH'
  | 'INCORRECT_AMOUNT'
  | 'MISSING_FROM_PAYROLL';

export interface ReconciliationException {
  id: string;
  rowNumber?: number;
  employeeId: string;
  employeeName: string;
  department: string;
  gradeLevel: string;
  importedAmount: number;
  expectedAmount: number;
  difference: number;
  month: string;
  type: ExceptionType;
  description: string;
  resolutionStatus: 'UNRESOLVED' | 'RESOLVED' | 'IGNORED';
  resolvedMemberId?: string;
  resolutionNote?: string;
}

export interface PayrollReconciliationReport {
  importId: string;
  fileName: string;
  payrollMonth: string;
  totalRowsProcessed: number;
  
  // Financial Summary
  totalExpectedContribution: number;
  totalImportedContribution: number;
  totalDifference: number; // Imported - Expected

  // Counts
  matchedMembersCount: number;
  unmatchedEmployeesCount: number;
  missingContributionsCount: number;
  duplicateRecordsCount: number;
  incorrectAmountsCount: number;
  totalExceptionsCount: number;

  // Breakdown
  matchedRecords: {
    memberId: string;
    employeeId: string;
    name: string;
    amount: number;
  }[];
  missingMembers: {
    memberId: string;
    employeeId: string;
    name: string;
    department: string;
    expectedAmount: number;
  }[];
  exceptions: ReconciliationException[];

  // Workflow State
  workflowStage: 'VALIDATED' | 'RECONCILED' | 'EXCEPTIONS_REVIEWED' | 'VERIFIED' | 'POSTED';
  isVerified: boolean;
  verifiedBy?: string;
  verifiedAt?: string;
  postedAt?: string;
}

export class AdvancedPayrollService {
  /**
   * 1. Parse Excel or CSV buffer/content into structured RawPayrollRecords
   */
  public static parseFile(fileBuffer: ArrayBuffer | string, fileName: string): RawPayrollRecord[] {
    let sheetData: any[][];

    if (typeof fileBuffer === 'string') {
      // CSV string
      const lines = fileBuffer.trim().split(/\r?\n/);
      sheetData = lines.map(l => l.split(',').map(c => c.trim().replace(/^["']|["']$/g, '')));
    } else {
      // Excel workbook binary buffer
      const workbook = read(fileBuffer, { type: 'array' });
      const firstSheetName = workbook.SheetNames[0];
      const worksheet = workbook.Sheets[firstSheetName];
      sheetData = utils.sheet_to_json(worksheet, { header: 1 }) as any[][];
    }

    if (!sheetData || sheetData.length < 2) {
      throw new Error('Invalid or empty payroll file. Header and data rows are required.');
    }

    const header = sheetData[0].map(h => String(h || '').toLowerCase().trim());
    const empIdIdx = header.findIndex(h => h.includes('employee id') || h.includes('staff id') || h.includes('ippis') || h === 'id');
    const nameIdx = header.findIndex(h => h.includes('name'));
    const deptIdx = header.findIndex(h => h.includes('dept') || h.includes('department'));
    const gradeIdx = header.findIndex(h => h.includes('grade') || h.includes('level'));
    const contIdx = header.findIndex(h => h.includes('contribution') || h.includes('amount') || h.includes('deduction'));
    const monthIdx = header.findIndex(h => h.includes('month') || h.includes('period'));

    if (empIdIdx === -1 || contIdx === -1) {
      throw new Error('Missing mandatory columns: "Employee ID" and "Contribution" are required.');
    }

    const records: RawPayrollRecord[] = [];

    for (let i = 1; i < sheetData.length; i++) {
      const row = sheetData[i];
      if (!row || row.length === 0 || row.every(c => c === undefined || c === '')) continue;

      const rawEmpId = String(row[empIdIdx] || '').trim();
      const rawName = nameIdx !== -1 && row[nameIdx] ? String(row[nameIdx]).trim() : 'Unknown';
      const rawDept = deptIdx !== -1 && row[deptIdx] ? String(row[deptIdx]).trim() : 'General';
      const rawGrade = gradeIdx !== -1 && row[gradeIdx] ? String(row[gradeIdx]).trim() : 'N/A';
      const rawCont = row[contIdx];
      const parsedAmount = typeof rawCont === 'number' ? rawCont : parseFloat(String(rawCont || '0').replace(/[^0-9.-]+/g, '')) || 0;
      const rawMonth = monthIdx !== -1 && row[monthIdx] ? String(row[monthIdx]).trim() : new Date().toISOString().slice(0, 7);

      records.push({
        rowNumber: i + 1,
        employeeId: rawEmpId,
        name: rawName,
        department: rawDept,
        gradeLevel: rawGrade,
        contribution: parsedAmount,
        month: rawMonth,
      });
    }

    return records;
  }

  /**
   * 2. Full Automated Reconciliation Pipeline
   * Detects:
   * - In-file duplicates
   * - Unmatched Staff IDs
   * - Duplicate monthly contributions (already paid)
   * - Incorrect contribution amounts (under/over)
   * - Missing active members absent from payroll
   */
  public static reconcile(
    payrollRows: RawPayrollRecord[],
    registeredMembers: RegisteredMember[],
    targetMonth: string,
    fileName: string = 'PAYROLL_UPLOAD.xlsx'
  ): PayrollReconciliationReport {
    const memberByEmpId = new Map<string, RegisteredMember>();
    const activeMembers = registeredMembers.filter(m => m.status === 'ACTIVE');

    for (const m of registeredMembers) {
      memberByEmpId.set(m.employeeId.toUpperCase().trim(), m);
    }

    let totalExpectedContribution = 0;
    for (const m of activeMembers) {
      totalExpectedContribution += m.monthlyContribution;
    }

    let totalImportedContribution = 0;
    const seenEmpIdsInFile = new Map<string, number>();
    const matchedRecords: { memberId: string; employeeId: string; name: string; amount: number }[] = [];
    const exceptions: ReconciliationException[] = [];

    const presentMemberEmpIds = new Set<string>();

    let duplicateRecordsCount = 0;
    let unmatchedEmployeesCount = 0;
    let incorrectAmountsCount = 0;

    // Process uploaded rows
    for (const row of payrollRows) {
      totalImportedContribution += row.contribution;
      const cleanEmpId = row.employeeId.toUpperCase().trim();

      // Check 1: In-File Duplicate Record
      if (seenEmpIdsInFile.has(cleanEmpId)) {
        duplicateRecordsCount++;
        exceptions.push({
          id: `exc-dup-${row.rowNumber}`,
          rowNumber: row.rowNumber,
          employeeId: row.employeeId,
          employeeName: row.name,
          department: row.department,
          gradeLevel: row.gradeLevel,
          importedAmount: row.contribution,
          expectedAmount: 0,
          difference: row.contribution,
          month: row.month || targetMonth,
          type: 'IN-FILE_DUPLICATE',
          description: `Duplicate entry in payroll file. Employee ID appeared previously at row ${seenEmpIdsInFile.get(cleanEmpId)}.`,
          resolutionStatus: 'UNRESOLVED',
        });
        continue;
      }
      seenEmpIdsInFile.set(cleanEmpId, row.rowNumber);

      // Check 2: Match against registered members
      const member = memberByEmpId.get(cleanEmpId);

      if (!member) {
        unmatchedEmployeesCount++;
        exceptions.push({
          id: `exc-unm-${row.rowNumber}`,
          rowNumber: row.rowNumber,
          employeeId: row.employeeId,
          employeeName: row.name,
          department: row.department,
          gradeLevel: row.gradeLevel,
          importedAmount: row.contribution,
          expectedAmount: 0,
          difference: row.contribution,
          month: row.month || targetMonth,
          type: 'UNMATCHED_EMPLOYEE',
          description: `Staff ID '${row.employeeId}' is not found in cooperative membership registry.`,
          resolutionStatus: 'UNRESOLVED',
        });
        continue;
      }

      presentMemberEmpIds.add(cleanEmpId);

      // Check 3: Duplicate Monthly Contribution (Already posted previously in database)
      if (member.existingContributionsMonths.includes(targetMonth)) {
        duplicateRecordsCount++;
        exceptions.push({
          id: `exc-alr-${row.rowNumber}`,
          rowNumber: row.rowNumber,
          employeeId: row.employeeId,
          employeeName: member.fullName,
          department: member.department,
          gradeLevel: member.gradeLevel,
          importedAmount: row.contribution,
          expectedAmount: member.monthlyContribution,
          difference: row.contribution,
          month: targetMonth,
          type: 'ALREADY_PAID_FOR_MONTH',
          description: `Member '${member.fullName}' already has a posted contribution recorded for ${targetMonth}.`,
          resolutionStatus: 'UNRESOLVED',
        });
        continue;
      }

      // Check 4: Incorrect Contribution Amount (Under or Over deduction)
      const diff = row.contribution - member.monthlyContribution;
      if (diff !== 0) {
        incorrectAmountsCount++;
        exceptions.push({
          id: `exc-amt-${row.rowNumber}`,
          rowNumber: row.rowNumber,
          employeeId: row.employeeId,
          employeeName: member.fullName,
          department: member.department,
          gradeLevel: member.gradeLevel,
          importedAmount: row.contribution,
          expectedAmount: member.monthlyContribution,
          difference: diff,
          month: targetMonth,
          type: 'INCORRECT_AMOUNT',
          description: diff < 0
            ? `Under-deducted by ₦${Math.abs(diff).toLocaleString()} (Expected ₦${member.monthlyContribution.toLocaleString()}, Got ₦${row.contribution.toLocaleString()}).`
            : `Over-deducted by ₦${diff.toLocaleString()} (Expected ₦${member.monthlyContribution.toLocaleString()}, Got ₦${row.contribution.toLocaleString()}).`,
          resolutionStatus: 'UNRESOLVED',
          resolvedMemberId: member.id,
        });
        continue;
      }

      // Exact Match
      matchedRecords.push({
        memberId: member.id,
        employeeId: member.employeeId,
        name: member.fullName,
        amount: row.contribution,
      });
    }

    // Check 5: Missing Active Members absent from payroll
    const missingMembers: { memberId: string; employeeId: string; name: string; department: string; expectedAmount: number }[] = [];
    let missingContributionsCount = 0;

    for (const m of activeMembers) {
      const cleanEmpId = m.employeeId.toUpperCase().trim();
      if (!presentMemberEmpIds.has(cleanEmpId) && !m.existingContributionsMonths.includes(targetMonth)) {
        missingContributionsCount++;
        missingMembers.push({
          memberId: m.id,
          employeeId: m.employeeId,
          name: m.fullName,
          department: m.department,
          expectedAmount: m.monthlyContribution,
        });

        exceptions.push({
          id: `exc-mis-${m.employeeId}`,
          employeeId: m.employeeId,
          employeeName: m.fullName,
          department: m.department,
          gradeLevel: m.gradeLevel,
          importedAmount: 0,
          expectedAmount: m.monthlyContribution,
          difference: -m.monthlyContribution,
          month: targetMonth,
          type: 'MISSING_FROM_PAYROLL',
          description: `Active member was omitted from this month's payroll deduction sheet.`,
          resolutionStatus: 'UNRESOLVED',
          resolvedMemberId: m.id,
        });
      }
    }

    const totalDifference = totalImportedContribution - totalExpectedContribution;
    const totalExceptionsCount = exceptions.length;

    return {
      importId: `imp-${Date.now()}`,
      fileName,
      payrollMonth: targetMonth,
      totalRowsProcessed: payrollRows.length,
      totalExpectedContribution,
      totalImportedContribution,
      totalDifference,
      matchedMembersCount: matchedRecords.length,
      unmatchedEmployeesCount,
      missingContributionsCount,
      duplicateRecordsCount,
      incorrectAmountsCount,
      totalExceptionsCount,
      matchedRecords,
      missingMembers,
      exceptions,
      workflowStage: 'RECONCILED',
      isVerified: false,
    };
  }

  /**
   * 3. Authorize and Resolve an Exception
   */
  public static resolveException(
    report: PayrollReconciliationReport,
    exceptionId: string,
    action: 'RESOLVE_MAP' | 'ACCEPT_OVERRIDE' | 'IGNORE',
    note: string,
    targetMemberId?: string
  ): PayrollReconciliationReport {
    const updatedExceptions = report.exceptions.map(exc => {
      if (exc.id === exceptionId) {
        return {
          ...exc,
          resolutionStatus: (action === 'IGNORE' ? 'IGNORED' : 'RESOLVED') as 'RESOLVED' | 'IGNORED',
          resolvedMemberId: targetMemberId || exc.resolvedMemberId,
          resolutionNote: note,
        };
      }
      return exc;
    });

    const unresolvedCount = updatedExceptions.filter(e => e.resolutionStatus === 'UNRESOLVED').length;

    return {
      ...report,
      exceptions: updatedExceptions,
      workflowStage: unresolvedCount === 0 ? 'EXCEPTIONS_REVIEWED' : 'RECONCILED',
    };
  }

  /**
   * 4. Verify & Submit for Double-Entry Ledger Posting
   * Modifies financial balances ONLY after explicit verification
   */
  public static verifyAndCommitPosting(
    report: PayrollReconciliationReport,
    verifierUserId: string
  ): {
    success: boolean;
    postedJournalId: string;
    totalAmountPosted: number;
    membersCreditedCount: number;
    auditLog: {
      action: string;
      verifiedBy: string;
      timestamp: string;
      batchReference: string;
    };
  } {
    if (report.workflowStage === 'POSTED') {
      throw new Error('This payroll batch has already been posted to the general ledger.');
    }

    const validRecordsToPost = [
      ...report.matchedRecords,
      ...report.exceptions
        .filter(e => e.resolutionStatus === 'RESOLVED' && e.importedAmount > 0 && e.resolvedMemberId)
        .map(e => ({
          memberId: e.resolvedMemberId!,
          employeeId: e.employeeId,
          name: e.employeeName,
          amount: e.importedAmount,
        })),
    ];

    const totalPosted = validRecordsToPost.reduce((sum, r) => sum + r.amount, 0);
    const journalId = `JE-PAYROLL-${report.payrollMonth}-${Date.now()}`;

    return {
      success: true,
      postedJournalId: journalId,
      totalAmountPosted: totalPosted,
      membersCreditedCount: validRecordsToPost.length,
      auditLog: {
        action: 'PAYROLL_BATCH_VERIFIED_AND_POSTED',
        verifiedBy: verifierUserId,
        timestamp: new Date().toISOString(),
        batchReference: `BATCH-${report.payrollMonth}`,
      },
    };
  }
}
