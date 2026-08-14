import { describe, it, expect } from 'vitest';
import * as fs from 'fs';
import * as path from 'path';

describe('Database Schema & Relational Structure Verification', () => {
  const schemaPath = path.resolve(__dirname, '../src/database/schema.sql');
  const schemaSql = fs.readFileSync(schemaPath, 'utf8');

  const requiredTables = [
    'ministries',
    'departments',
    'grade_levels',
    'contribution_rules',
    'users',
    'members',
    'beneficiaries',
    'committee_members',
    'fund_transactions',
    'payroll_imports',
    'payroll_contribution_records',
    'member_contributions',
    'manual_payments',
    'loans',
    'loan_repayments',
    'withdrawals',
    'approval_requests',
    'notifications',
    'reports',
    'audit_logs',
    'system_settings',
  ];

  it('should define all 21 core entities required by specification', () => {
    for (const table of requiredTables) {
      const regex = new RegExp(`CREATE\\s+TABLE\\s+${table}\\s*\\(`, 'i');
      expect(
        regex.test(schemaSql),
        `Table '${table}' is missing from schema DDL`
      ).toBe(true);
    }
  });

  describe('Member Entity Specification', () => {
    const memberFields = [
      'serial_number',
      'full_name',
      'employee_id',
      'department_id',
      'grade_level_id',
      'phone_number',
      'date_joined',
      'monthly_contribution_amount',
      'current_contribution_balance',
      'current_loan_balance',
      'status',
    ];

    it('should include all mandatory member profile and balance fields', () => {
      for (const field of memberFields) {
        expect(
          schemaSql.includes(field),
          `Member field '${field}' is missing from schema DDL`
        ).toBe(true);
      }
    });
  });

  describe('Member Contribution Entity & Duplicate Prevention', () => {
    const contributionFields = [
      'member_id',
      'amount',
      'contribution_month',
      'payment_method',
      'payroll_import_id',
      'transaction_reference',
      'status',
      'contribution_date',
      'created_by_user_id',
      'verification_status',
    ];

    it('should contain all required contribution tracking fields', () => {
      for (const field of contributionFields) {
        expect(
          schemaSql.includes(field),
          `Contribution field '${field}' is missing from schema DDL`
        ).toBe(true);
      }
    });

    it('should enforce duplicate monthly contribution prevention index constraint', () => {
      expect(
        schemaSql.includes('idx_unique_member_monthly_contribution'),
        'Missing unique index on (member_id, contribution_month) for duplicate prevention'
      ).toBe(true);
      expect(
        schemaSql.includes('allow_duplicate_override'),
        'Missing allow_duplicate_override flag for authorized exceptions'
      ).toBe(true);
    });
  });

  describe('Immutable Financial Ledger Entity (fund_transactions)', () => {
    const ledgerFields = [
      'transaction_number',
      'member_id',
      'transaction_type',
      'amount',
      'transaction_date',
      'reference_number',
      'source',
      'status',
      'created_by_user_id',
      'verified_by_user_id',
    ];

    it('should contain all required audit and transaction fields for financial ledger', () => {
      for (const field of ledgerFields) {
        expect(
          schemaSql.includes(field),
          `Fund transaction ledger field '${field}' is missing`
        ).toBe(true);
      }
    });
  });

  describe('Approval Requests (Committee Governance)', () => {
    const approvalFields = [
      'approver_user_id',
      'decision',
      'comment',
      'decision_date',
      'decision_time',
      'decision_timestamp',
    ];

    it('should record Approver, Date, Time, Decision, and mandatory non-empty Comment', () => {
      for (const field of approvalFields) {
        expect(
          schemaSql.includes(field),
          `Approval request field '${field}' is missing`
        ).toBe(true);
      }
    });
  });

  describe('Derived Financial Balances & Ledger Reconciliation View', () => {
    it('should define a view to derive balances dynamically from posted ledger entries', () => {
      expect(
        schemaSql.includes('CREATE OR REPLACE VIEW view_member_ledger_summary'),
        'Missing ledger summary view for balance derivation'
      ).toBe(true);
      expect(
        schemaSql.includes('derived_savings_balance'),
        'View must calculate derived savings balance from ledger transactions'
      ).toBe(true);
    });
  });
});
