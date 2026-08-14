-- ============================================================================
-- COOPERATIVE CONTRIBUTORY FUND MANAGEMENT PLATFORM
-- Complete Normalized Relational Database Schema (PostgreSQL 15+)
-- ============================================================================

-- Enable UUID Generation
CREATE EXTENSION IF NOT EXISTS "pgcrypto";

-- Clean drop for idempotent execution in test environments
DROP VIEW IF EXISTS view_member_ledger_summary CASCADE;
DROP TABLE IF EXISTS audit_logs CASCADE;
DROP TABLE IF EXISTS reports CASCADE;
DROP TABLE IF EXISTS notifications CASCADE;
DROP TABLE IF EXISTS system_settings CASCADE;
DROP TABLE IF EXISTS approval_requests CASCADE;
DROP TABLE IF EXISTS withdrawals CASCADE;
DROP TABLE IF EXISTS loan_repayments CASCADE;
DROP TABLE IF EXISTS loans CASCADE;
DROP TABLE IF EXISTS manual_payments CASCADE;
DROP TABLE IF EXISTS payroll_contribution_records CASCADE;
DROP TABLE IF EXISTS payroll_imports CASCADE;
DROP TABLE IF EXISTS member_contributions CASCADE;
DROP TABLE IF EXISTS fund_transactions CASCADE;
DROP TABLE IF EXISTS committee_members CASCADE;
DROP TABLE IF EXISTS beneficiaries CASCADE;
DROP TABLE IF EXISTS members CASCADE;
DROP TABLE IF EXISTS users CASCADE;
DROP TABLE IF EXISTS contribution_rules CASCADE;
DROP TABLE IF EXISTS grade_levels CASCADE;
DROP TABLE IF EXISTS departments CASCADE;
DROP TABLE IF EXISTS ministries CASCADE;

-- ----------------------------------------------------------------------------
-- 1. MINISTRIES
-- ----------------------------------------------------------------------------
CREATE TABLE ministries (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    code VARCHAR(50) UNIQUE NOT NULL,
    name VARCHAR(255) NOT NULL,
    is_active BOOLEAN DEFAULT TRUE NOT NULL,
    created_at TIMESTAMPTZ DEFAULT CURRENT_TIMESTAMP NOT NULL,
    updated_at TIMESTAMPTZ DEFAULT CURRENT_TIMESTAMP NOT NULL
);

-- ----------------------------------------------------------------------------
-- 2. DEPARTMENTS
-- ----------------------------------------------------------------------------
CREATE TABLE departments (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    ministry_id UUID NOT NULL REFERENCES ministries(id) ON DELETE RESTRICT,
    code VARCHAR(50) NOT NULL,
    name VARCHAR(255) NOT NULL,
    created_at TIMESTAMPTZ DEFAULT CURRENT_TIMESTAMP NOT NULL,
    CONSTRAINT uq_ministry_department_code UNIQUE (ministry_id, code)
);

-- ----------------------------------------------------------------------------
-- 3. GRADE LEVELS
-- ----------------------------------------------------------------------------
CREATE TABLE grade_levels (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    level_code VARCHAR(20) UNIQUE NOT NULL, -- e.g. 'GL_08', 'GL_12'
    description VARCHAR(100),
    basic_monthly_salary DECIMAL(15, 2) NOT NULL CHECK (basic_monthly_salary > 0),
    created_at TIMESTAMPTZ DEFAULT CURRENT_TIMESTAMP NOT NULL
);

-- ----------------------------------------------------------------------------
-- 4. CONTRIBUTION RULES
-- ----------------------------------------------------------------------------
CREATE TABLE contribution_rules (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    grade_level_id UUID NOT NULL REFERENCES grade_levels(id) ON DELETE CASCADE,
    minimum_contribution_amount DECIMAL(15, 2) NOT NULL CHECK (minimum_contribution_amount > 0),
    default_contribution_amount DECIMAL(15, 2) NOT NULL CHECK (default_contribution_amount >= minimum_contribution_amount),
    max_loan_multiplier DECIMAL(4, 2) DEFAULT 1.00 NOT NULL CHECK (max_loan_multiplier > 0 AND max_loan_multiplier <= 1.00), -- Max loan <= 100% savings
    effective_from DATE NOT NULL,
    effective_to DATE,
    is_active BOOLEAN DEFAULT TRUE NOT NULL,
    created_at TIMESTAMPTZ DEFAULT CURRENT_TIMESTAMP NOT NULL
);

-- ----------------------------------------------------------------------------
-- 5. USERS
-- ----------------------------------------------------------------------------
CREATE TABLE users (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    email VARCHAR(255) UNIQUE NOT NULL,
    phone_number VARCHAR(20) UNIQUE NOT NULL,
    password_hash VARCHAR(255) NOT NULL,
    role VARCHAR(50) NOT NULL CHECK (role IN ('SUPER_ADMIN', 'FINANCE_OFFICER', 'APPROVING_OFFICER', 'MEMBER')),
    is_active BOOLEAN DEFAULT TRUE NOT NULL,
    last_login_at TIMESTAMPTZ,
    created_at TIMESTAMPTZ DEFAULT CURRENT_TIMESTAMP NOT NULL,
    updated_at TIMESTAMPTZ DEFAULT CURRENT_TIMESTAMP NOT NULL
);

-- ----------------------------------------------------------------------------
-- 6. MEMBERS
-- ----------------------------------------------------------------------------
CREATE TABLE members (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID UNIQUE REFERENCES users(id) ON DELETE SET NULL,
    serial_number BIGSERIAL UNIQUE NOT NULL,
    member_number VARCHAR(50) UNIQUE NOT NULL,
    employee_id VARCHAR(50) UNIQUE NOT NULL, -- Ministry Staff / IPPIS ID
    first_name VARCHAR(100) NOT NULL,
    last_name VARCHAR(100) NOT NULL,
    full_name VARCHAR(255) GENERATED ALWAYS AS (first_name || ' ' || last_name) STORED,
    ministry_id UUID NOT NULL REFERENCES ministries(id) ON DELETE RESTRICT,
    department_id UUID NOT NULL REFERENCES departments(id) ON DELETE RESTRICT,
    grade_level_id UUID NOT NULL REFERENCES grade_levels(id) ON DELETE RESTRICT,
    phone_number VARCHAR(20) NOT NULL,
    date_joined DATE NOT NULL,
    monthly_contribution_amount DECIMAL(15, 2) NOT NULL CHECK (monthly_contribution_amount > 0),
    current_contribution_balance DECIMAL(15, 2) DEFAULT 0.00 NOT NULL CHECK (current_contribution_balance >= 0),
    current_loan_balance DECIMAL(15, 2) DEFAULT 0.00 NOT NULL CHECK (current_loan_balance >= 0),
    status VARCHAR(30) DEFAULT 'ACTIVE' NOT NULL CHECK (status IN ('ACTIVE', 'INACTIVE', 'SUSPENDED', 'EXITED')),
    bank_name VARCHAR(100),
    bank_account_number VARCHAR(20),
    created_at TIMESTAMPTZ DEFAULT CURRENT_TIMESTAMP NOT NULL,
    updated_at TIMESTAMPTZ DEFAULT CURRENT_TIMESTAMP NOT NULL
);

-- ----------------------------------------------------------------------------
-- 7. BENEFICIARIES
-- ----------------------------------------------------------------------------
CREATE TABLE beneficiaries (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    member_id UUID NOT NULL REFERENCES members(id) ON DELETE CASCADE,
    full_name VARCHAR(255) NOT NULL,
    relationship VARCHAR(50) NOT NULL,
    phone_number VARCHAR(20) NOT NULL,
    allocation_percentage DECIMAL(5, 2) NOT NULL CHECK (allocation_percentage > 0 AND allocation_percentage <= 100),
    is_primary BOOLEAN DEFAULT FALSE NOT NULL,
    created_at TIMESTAMPTZ DEFAULT CURRENT_TIMESTAMP NOT NULL
);

-- ----------------------------------------------------------------------------
-- 8. COMMITTEE MEMBERS
-- ----------------------------------------------------------------------------
CREATE TABLE committee_members (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID UNIQUE NOT NULL REFERENCES users(id) ON DELETE RESTRICT,
    member_id UUID UNIQUE NOT NULL REFERENCES members(id) ON DELETE RESTRICT,
    designation VARCHAR(100) NOT NULL, -- 'CHAIRMAN', 'SECRETARY', 'TREASURER', 'COMMITTEE_MEMBER'
    term_start_date DATE NOT NULL,
    term_end_date DATE,
    is_active BOOLEAN DEFAULT TRUE NOT NULL,
    created_at TIMESTAMPTZ DEFAULT CURRENT_TIMESTAMP NOT NULL
);

-- ----------------------------------------------------------------------------
-- 9. FUND TRANSACTIONS (Authoritative Immutable Core Ledger)
-- ----------------------------------------------------------------------------
CREATE TABLE fund_transactions (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    transaction_number VARCHAR(60) UNIQUE NOT NULL,
    member_id UUID REFERENCES members(id) ON DELETE RESTRICT,
    transaction_type VARCHAR(50) NOT NULL CHECK (
        transaction_type IN (
            'CONTRIBUTION',
            'LOAN_DISBURSEMENT',
            'LOAN_REPAYMENT',
            'WITHDRAWAL_PAYOUT',
            'MANUAL_PAYMENT_CREDIT',
            'FEE_PAYMENT',
            'ADJUSTMENT_ENTRY'
        )
    ),
    entry_type VARCHAR(10) NOT NULL CHECK (entry_type IN ('CREDIT', 'DEBIT')),
    amount DECIMAL(15, 2) NOT NULL CHECK (amount > 0),
    running_balance_after DECIMAL(15, 2) NOT NULL,
    transaction_date TIMESTAMPTZ NOT NULL,
    reference_number VARCHAR(100) NOT NULL,
    source VARCHAR(50) NOT NULL CHECK (
        source IN (
            'PAYROLL_IMPORT',
            'MANUAL_PAYMENT',
            'LOAN_DISBURSEMENT',
            'WITHDRAWAL_PROCESSOR',
            'DIRECT_ADJUSTMENT'
        )
    ),
    status VARCHAR(30) DEFAULT 'POSTED' NOT NULL CHECK (status IN ('POSTED', 'REVERSED', 'CANCELLED')),
    created_by_user_id UUID NOT NULL REFERENCES users(id) ON DELETE RESTRICT,
    verified_by_user_id UUID REFERENCES users(id) ON DELETE RESTRICT,
    description TEXT NOT NULL,
    created_at TIMESTAMPTZ DEFAULT CURRENT_TIMESTAMP NOT NULL
);

-- ----------------------------------------------------------------------------
-- 10. PAYROLL IMPORTS
-- ----------------------------------------------------------------------------
CREATE TABLE payroll_imports (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    batch_reference VARCHAR(100) UNIQUE NOT NULL,
    payroll_month VARCHAR(7) NOT NULL, -- 'YYYY-MM'
    total_records INT NOT NULL CHECK (total_records >= 0),
    total_amount_deducted DECIMAL(15, 2) NOT NULL CHECK (total_amount_deducted >= 0),
    matched_records_count INT DEFAULT 0 NOT NULL,
    variance_records_count INT DEFAULT 0 NOT NULL,
    file_name VARCHAR(255) NOT NULL,
    file_path TEXT NOT NULL,
    file_hash_sha256 VARCHAR(64) NOT NULL,
    status VARCHAR(30) DEFAULT 'STAGED' NOT NULL CHECK (status IN ('STAGED', 'RECONCILED', 'POSTED', 'FAILED', 'CANCELLED')),
    uploaded_by_user_id UUID NOT NULL REFERENCES users(id) ON DELETE RESTRICT,
    reconciled_by_user_id UUID REFERENCES users(id) ON DELETE RESTRICT,
    posted_at TIMESTAMPTZ,
    created_at TIMESTAMPTZ DEFAULT CURRENT_TIMESTAMP NOT NULL
);

-- ----------------------------------------------------------------------------
-- 11. PAYROLL CONTRIBUTION RECORDS
-- ----------------------------------------------------------------------------
CREATE TABLE payroll_contribution_records (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    payroll_import_id UUID NOT NULL REFERENCES payroll_imports(id) ON DELETE CASCADE,
    employee_id VARCHAR(50) NOT NULL,
    raw_employee_name VARCHAR(255),
    deducted_amount DECIMAL(15, 2) NOT NULL CHECK (deducted_amount >= 0),
    savings_portion DECIMAL(15, 2) DEFAULT 0.00 NOT NULL CHECK (savings_portion >= 0),
    loan_repayment_portion DECIMAL(15, 2) DEFAULT 0.00 NOT NULL CHECK (loan_repayment_portion >= 0),
    member_id UUID REFERENCES members(id) ON DELETE SET NULL,
    match_status VARCHAR(30) DEFAULT 'MATCHED' NOT NULL CHECK (
        match_status IN (
            'MATCHED',
            'UNMATCHED_EMPLOYEE_ID',
            'AMOUNT_MISMATCH',
            'OVER_DEDUCTION',
            'UNDER_DEDUCTION'
        )
    ),
    resolution_notes TEXT,
    is_resolved BOOLEAN DEFAULT FALSE NOT NULL,
    created_at TIMESTAMPTZ DEFAULT CURRENT_TIMESTAMP NOT NULL
);

-- ----------------------------------------------------------------------------
-- 12. MEMBER CONTRIBUTIONS
-- ----------------------------------------------------------------------------
CREATE TABLE member_contributions (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    member_id UUID NOT NULL REFERENCES members(id) ON DELETE RESTRICT,
    amount DECIMAL(15, 2) NOT NULL CHECK (amount > 0),
    contribution_month VARCHAR(7) NOT NULL, -- 'YYYY-MM'
    payment_method VARCHAR(50) NOT NULL CHECK (
        payment_method IN (
            'PAYROLL_DEDUCTION',
            'DIRECT_BANK_TRANSFER',
            'CASH_DEPOSIT',
            'SPECIAL_OVERRIDE'
        )
    ),
    payroll_import_id UUID REFERENCES payroll_imports(id) ON DELETE SET NULL,
    transaction_reference VARCHAR(100) UNIQUE NOT NULL,
    fund_transaction_id UUID UNIQUE REFERENCES fund_transactions(id) ON DELETE RESTRICT,
    status VARCHAR(30) DEFAULT 'COMPLETED' NOT NULL CHECK (status IN ('PENDING', 'COMPLETED', 'REJECTED', 'REVERSED')),
    contribution_date DATE NOT NULL,
    verification_status VARCHAR(30) DEFAULT 'VERIFIED' NOT NULL CHECK (verification_status IN ('UNVERIFIED', 'VERIFIED', 'FLAGGED')),
    allow_duplicate_override BOOLEAN DEFAULT FALSE NOT NULL,
    override_reason TEXT,
    created_by_user_id UUID NOT NULL REFERENCES users(id) ON DELETE RESTRICT,
    created_at TIMESTAMPTZ DEFAULT CURRENT_TIMESTAMP NOT NULL
);

-- Constraint: Prevent duplicate monthly contributions for the same member unless explicitly authorized
CREATE UNIQUE INDEX idx_unique_member_monthly_contribution 
ON member_contributions (member_id, contribution_month) 
WHERE status != 'REVERSED' AND allow_duplicate_override = FALSE;

-- ----------------------------------------------------------------------------
-- 13. MANUAL PAYMENTS
-- ----------------------------------------------------------------------------
CREATE TABLE manual_payments (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    payment_number VARCHAR(60) UNIQUE NOT NULL,
    member_id UUID NOT NULL REFERENCES members(id) ON DELETE RESTRICT,
    target_month VARCHAR(7) NOT NULL, -- 'YYYY-MM'
    payment_type VARCHAR(50) NOT NULL CHECK (
        payment_type IN (
            'MISSED_CONTRIBUTION',
            'LOAN_DIRECT_PAYOFF',
            'VOLUNTARY_SAVINGS_BOOST'
        )
    ),
    amount DECIMAL(15, 2) NOT NULL CHECK (amount > 0),
    payment_date DATE NOT NULL,
    bank_reference VARCHAR(100) UNIQUE NOT NULL,
    proof_of_payment_url TEXT NOT NULL,
    status VARCHAR(30) DEFAULT 'PENDING_VERIFICATION' NOT NULL CHECK (status IN ('PENDING_VERIFICATION', 'VERIFIED', 'REJECTED')),
    verified_by_user_id UUID REFERENCES users(id) ON DELETE RESTRICT,
    verified_at TIMESTAMPTZ,
    rejection_reason TEXT,
    fund_transaction_id UUID REFERENCES fund_transactions(id) ON DELETE RESTRICT,
    created_at TIMESTAMPTZ DEFAULT CURRENT_TIMESTAMP NOT NULL
);

-- ----------------------------------------------------------------------------
-- 14. LOANS (0% Interest Guaranteed)
-- ----------------------------------------------------------------------------
CREATE TABLE loans (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    loan_number VARCHAR(60) UNIQUE NOT NULL,
    member_id UUID NOT NULL REFERENCES members(id) ON DELETE RESTRICT,
    loan_type VARCHAR(50) NOT NULL CHECK (loan_type IN ('SALARY_ADVANCE', 'EMERGENCY_LOAN')),
    principal_amount DECIMAL(15, 2) NOT NULL CHECK (principal_amount > 0),
    interest_rate DECIMAL(5, 2) DEFAULT 0.00 NOT NULL CHECK (interest_rate = 0.00), -- 0% Interest Rule
    tenor_months INT NOT NULL CHECK (tenor_months > 0),
    monthly_installment DECIMAL(15, 2) NOT NULL CHECK (monthly_installment > 0),
    total_repayable DECIMAL(15, 2) NOT NULL,
    total_paid DECIMAL(15, 2) DEFAULT 0.00 NOT NULL CHECK (total_paid >= 0),
    outstanding_balance DECIMAL(15, 2) NOT NULL CHECK (outstanding_balance >= 0),
    disbursement_date DATE,
    disbursement_reference VARCHAR(100),
    status VARCHAR(30) DEFAULT 'PENDING_APPROVAL' NOT NULL CHECK (
        status IN (
            'PENDING_APPROVAL',
            'APPROVED',
            'DISBURSED',
            'ACTIVE',
            'PAID_OFF',
            'DEFAULTED',
            'REJECTED'
        )
    ),
    created_at TIMESTAMPTZ DEFAULT CURRENT_TIMESTAMP NOT NULL,
    updated_at TIMESTAMPTZ DEFAULT CURRENT_TIMESTAMP NOT NULL
);

-- ----------------------------------------------------------------------------
-- 15. LOAN REPAYMENTS
-- ----------------------------------------------------------------------------
CREATE TABLE loan_repayments (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    loan_id UUID NOT NULL REFERENCES loans(id) ON DELETE RESTRICT,
    member_id UUID NOT NULL REFERENCES members(id) ON DELETE RESTRICT,
    installment_number INT NOT NULL CHECK (installment_number > 0),
    repayment_month VARCHAR(7) NOT NULL, -- 'YYYY-MM'
    amount_due DECIMAL(15, 2) NOT NULL,
    amount_paid DECIMAL(15, 2) NOT NULL CHECK (amount_paid > 0),
    principal_portion DECIMAL(15, 2) NOT NULL,
    payment_method VARCHAR(50) NOT NULL CHECK (payment_method IN ('PAYROLL_DEDUCTION', 'MANUAL_TRANSFER', 'SAVINGS_OFFSET')),
    fund_transaction_id UUID NOT NULL REFERENCES fund_transactions(id) ON DELETE RESTRICT,
    paid_date DATE NOT NULL,
    status VARCHAR(30) DEFAULT 'PAID' NOT NULL CHECK (status IN ('PENDING', 'PAID', 'PARTIAL', 'REVERSED')),
    created_at TIMESTAMPTZ DEFAULT CURRENT_TIMESTAMP NOT NULL
);

-- ----------------------------------------------------------------------------
-- 16. WITHDRAWALS
-- ----------------------------------------------------------------------------
CREATE TABLE withdrawals (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    withdrawal_number VARCHAR(60) UNIQUE NOT NULL,
    member_id UUID NOT NULL REFERENCES members(id) ON DELETE RESTRICT,
    withdrawal_type VARCHAR(50) NOT NULL CHECK (withdrawal_type IN ('PARTIAL_WITHDRAWAL', 'MEMBERSHIP_EXIT_LIQUIDATION')),
    requested_amount DECIMAL(15, 2) NOT NULL CHECK (requested_amount > 0),
    accumulated_savings_at_request DECIMAL(15, 2) NOT NULL,
    active_loan_deduction DECIMAL(15, 2) DEFAULT 0.00 NOT NULL,
    net_payout_amount DECIMAL(15, 2) NOT NULL CHECK (net_payout_amount >= 0),
    reason TEXT NOT NULL,
    payout_bank_name VARCHAR(100) NOT NULL,
    payout_account_number VARCHAR(20) NOT NULL,
    status VARCHAR(30) DEFAULT 'PENDING_APPROVAL' NOT NULL CHECK (
        status IN (
            'PENDING_APPROVAL',
            'COMMITTEE_REVIEW',
            'APPROVED',
            'DISBURSED',
            'REJECTED',
            'CANCELLED'
        )
    ),
    fund_transaction_id UUID REFERENCES fund_transactions(id) ON DELETE RESTRICT,
    created_at TIMESTAMPTZ DEFAULT CURRENT_TIMESTAMP NOT NULL
);

-- ----------------------------------------------------------------------------
-- 17. APPROVAL REQUESTS (Mandatory Approver, Date, Time, Decision, Comment)
-- ----------------------------------------------------------------------------
CREATE TABLE approval_requests (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    entity_type VARCHAR(50) NOT NULL CHECK (
        entity_type IN (
            'LOAN',
            'WITHDRAWAL',
            'MANUAL_PAYMENT_OVERRIDE',
            'CONTRIBUTION_EXCEPTION',
            'SYSTEM_POLICY_CHANGE'
        )
    ),
    entity_id UUID NOT NULL,
    approver_user_id UUID NOT NULL REFERENCES users(id) ON DELETE RESTRICT,
    decision VARCHAR(30) NOT NULL CHECK (decision IN ('APPROVED', 'REJECTED', 'DEFERRED')),
    comment TEXT NOT NULL CHECK (length(trim(comment)) > 0),
    decision_date DATE NOT NULL,
    decision_time TIME NOT NULL,
    decision_timestamp TIMESTAMPTZ DEFAULT CURRENT_TIMESTAMP NOT NULL,
    ip_address VARCHAR(50),
    user_agent TEXT,
    digital_signature_hash VARCHAR(64),
    created_at TIMESTAMPTZ DEFAULT CURRENT_TIMESTAMP NOT NULL
);

-- ----------------------------------------------------------------------------
-- 18. NOTIFICATIONS
-- ----------------------------------------------------------------------------
CREATE TABLE notifications (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    member_id UUID REFERENCES members(id) ON DELETE CASCADE,
    title VARCHAR(200) NOT NULL,
    message TEXT NOT NULL,
    category VARCHAR(50) NOT NULL CHECK (
        category IN (
            'CONTRIBUTION_ALERT',
            'LOAN_UPDATE',
            'APPROVAL_REQUEST',
            'WITHDRAWAL_STATUS',
            'SYSTEM_BROADCAST'
        )
    ),
    channel VARCHAR(30) DEFAULT 'IN_APP' NOT NULL CHECK (channel IN ('IN_APP', 'SMS', 'EMAIL', 'PUSH')),
    is_read BOOLEAN DEFAULT FALSE NOT NULL,
    read_at TIMESTAMPTZ,
    created_at TIMESTAMPTZ DEFAULT CURRENT_TIMESTAMP NOT NULL
);

-- ----------------------------------------------------------------------------
-- 19. REPORTS
-- ----------------------------------------------------------------------------
CREATE TABLE reports (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    report_number VARCHAR(60) UNIQUE NOT NULL,
    title VARCHAR(255) NOT NULL,
    report_type VARCHAR(50) NOT NULL CHECK (
        report_type IN (
            'MEMBER_STATEMENT',
            'MONTHLY_CONTRIBUTION_SCHEDULE',
            'LOAN_PORTFOLIO_AGING',
            'PAYROLL_VARIANCE_REPORT',
            'FUND_BALANCE_SHEET',
            'AUDIT_TRAIL_DUMP'
        )
    ),
    parameters JSONB,
    file_url TEXT,
    file_format VARCHAR(10) DEFAULT 'PDF' NOT NULL CHECK (file_format IN ('PDF', 'EXCEL', 'CSV', 'JSON')),
    generated_by_user_id UUID NOT NULL REFERENCES users(id) ON DELETE RESTRICT,
    created_at TIMESTAMPTZ DEFAULT CURRENT_TIMESTAMP NOT NULL
);

-- ----------------------------------------------------------------------------
-- 20. AUDIT LOGS (Immutable Activity Log)
-- ----------------------------------------------------------------------------
CREATE TABLE audit_logs (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID REFERENCES users(id) ON DELETE SET NULL,
    action VARCHAR(100) NOT NULL,
    entity_name VARCHAR(100) NOT NULL,
    entity_id UUID,
    old_state JSONB,
    new_state JSONB,
    ip_address VARCHAR(50),
    user_agent TEXT,
    created_at TIMESTAMPTZ DEFAULT CURRENT_TIMESTAMP NOT NULL
);

-- ----------------------------------------------------------------------------
-- 21. SYSTEM SETTINGS
-- ----------------------------------------------------------------------------
CREATE TABLE system_settings (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    setting_key VARCHAR(100) UNIQUE NOT NULL,
    setting_value TEXT NOT NULL,
    value_type VARCHAR(20) DEFAULT 'STRING' NOT NULL CHECK (value_type IN ('STRING', 'NUMBER', 'BOOLEAN', 'JSON')),
    description TEXT,
    is_public BOOLEAN DEFAULT FALSE NOT NULL,
    updated_by_user_id UUID REFERENCES users(id) ON DELETE SET NULL,
    updated_at TIMESTAMPTZ DEFAULT CURRENT_TIMESTAMP NOT NULL
);

-- ============================================================================
-- PERFORMANCE & AUDIT INDEXES
-- ============================================================================
CREATE INDEX idx_members_employee_id ON members(employee_id);
CREATE INDEX idx_members_user_id ON members(user_id);
CREATE INDEX idx_members_ministry_dept ON members(ministry_id, department_id);
CREATE INDEX idx_members_status ON members(status);

CREATE INDEX idx_fund_transactions_member ON fund_transactions(member_id);
CREATE INDEX idx_fund_transactions_type ON fund_transactions(transaction_type);
CREATE INDEX idx_fund_transactions_date ON fund_transactions(transaction_date);

CREATE INDEX idx_member_contributions_member_month ON member_contributions(member_id, contribution_month);
CREATE INDEX idx_member_contributions_payroll_import ON member_contributions(payroll_import_id);

CREATE INDEX idx_loans_member_status ON loans(member_id, status);
CREATE INDEX idx_loan_repayments_loan ON loan_repayments(loan_id);
CREATE INDEX idx_withdrawals_member_status ON withdrawals(member_id, status);
CREATE INDEX idx_approval_requests_entity ON approval_requests(entity_type, entity_id);
CREATE INDEX idx_notifications_user_unread ON notifications(user_id) WHERE is_read = FALSE;
CREATE INDEX idx_audit_logs_entity ON audit_logs(entity_name, entity_id);

-- ============================================================================
-- RECONCILIATION & BALANCE DERIVATION VIEW
-- ============================================================================
CREATE OR REPLACE VIEW view_member_ledger_summary AS
SELECT 
    m.id AS member_id,
    m.serial_number,
    m.employee_id,
    m.full_name,
    COALESCE(
        SUM(
            CASE 
                WHEN ft.transaction_type IN ('CONTRIBUTION', 'MANUAL_PAYMENT_CREDIT') AND ft.status = 'POSTED' 
                THEN ft.amount 
                ELSE 0 
            END
        ), 0
    ) - 
    COALESCE(
        SUM(
            CASE 
                WHEN ft.transaction_type = 'WITHDRAWAL_PAYOUT' AND ft.status = 'POSTED' 
                THEN ft.amount 
                ELSE 0 
            END
        ), 0
    ) AS derived_savings_balance,
    m.current_contribution_balance AS cached_savings_balance,
    COALESCE(
        SUM(
            CASE 
                WHEN l.status IN ('ACTIVE', 'DISBURSED') 
                THEN l.outstanding_balance 
                ELSE 0 
            END
        ), 0
    ) AS derived_loan_balance,
    m.current_loan_balance AS cached_loan_balance
FROM members m
LEFT JOIN fund_transactions ft ON m.id = ft.member_id
LEFT JOIN loans l ON m.id = l.member_id
GROUP BY m.id, m.serial_number, m.employee_id, m.full_name, m.current_contribution_balance, m.current_loan_balance;
