-- WyaLink Point of Sale (POS) System Schema
-- Migration: Add tables for in-person sales, activations, returns, refunds, and cash management

-- =====================================================
-- ENUM TYPES FOR POS
-- =====================================================
CREATE TYPE pos_transaction_type AS ENUM (
    'sale',              -- Regular sale
    'activation',        -- Service activation
    'bill_payment',      -- Bill payment
    'return',            -- Product return
    'refund',            -- Refund
    'exchange'           -- Exchange
);

CREATE TYPE pos_payment_method AS ENUM (
    'cash',
    'credit_card',
    'debit_card',
    'check',
    'account_credit',
    'other'
);

CREATE TYPE pos_transaction_status AS ENUM (
    'pending',           -- In progress
    'completed',         -- Successfully completed
    'voided',            -- Voided/cancelled
    'refunded',          -- Fully refunded
    'partially_refunded' -- Partially refunded
);

CREATE TYPE pos_session_status AS ENUM (
    'open',              -- Session is active
    'closed',            -- Session is closed
    'balanced',          -- Session is balanced and reconciled
    'over',              -- Cash over
    'short'              -- Cash short
);

-- =====================================================
-- POS SESSIONS TABLE (Shift/Register Management)
-- =====================================================
CREATE TABLE public.pos_sessions (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),

    -- Session details
    session_number VARCHAR(20) UNIQUE NOT NULL, -- e.g., "2025-001"
    register_name VARCHAR(50) DEFAULT 'Main Register' NOT NULL,

    -- Staff assignment
    opened_by UUID REFERENCES auth.users(id) NOT NULL,
    closed_by UUID REFERENCES auth.users(id),

    -- Session timing
    opened_at TIMESTAMPTZ DEFAULT NOW() NOT NULL,
    closed_at TIMESTAMPTZ,

    -- Cash tracking
    starting_cash DECIMAL(10,2) NOT NULL DEFAULT 0.00,
    expected_cash DECIMAL(10,2),
    actual_cash DECIMAL(10,2),
    cash_difference DECIMAL(10,2), -- actual - expected

    -- Summary totals
    total_sales DECIMAL(10,2) DEFAULT 0.00,
    total_refunds DECIMAL(10,2) DEFAULT 0.00,
    total_cash_payments DECIMAL(10,2) DEFAULT 0.00,
    total_card_payments DECIMAL(10,2) DEFAULT 0.00,
    total_other_payments DECIMAL(10,2) DEFAULT 0.00,
    transaction_count INTEGER DEFAULT 0,

    -- Status
    status pos_session_status DEFAULT 'open' NOT NULL,

    -- Notes
    opening_notes TEXT,
    closing_notes TEXT,

    -- Metadata
    created_at TIMESTAMPTZ DEFAULT NOW() NOT NULL,
    updated_at TIMESTAMPTZ DEFAULT NOW() NOT NULL
);

-- Indexes
CREATE INDEX pos_sessions_opened_by_idx ON public.pos_sessions(opened_by);
CREATE INDEX pos_sessions_closed_by_idx ON public.pos_sessions(closed_by);
CREATE INDEX pos_sessions_status_idx ON public.pos_sessions(status);
CREATE INDEX pos_sessions_opened_at_idx ON public.pos_sessions(opened_at);
CREATE INDEX pos_sessions_session_number_idx ON public.pos_sessions(session_number);

-- =====================================================
-- POS TRANSACTIONS TABLE
-- =====================================================
CREATE TABLE public.pos_transactions (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),

    -- Transaction identification
    transaction_number VARCHAR(20) UNIQUE NOT NULL, -- e.g., "T-2025-00001"
    transaction_type pos_transaction_type NOT NULL,
    status pos_transaction_status DEFAULT 'pending' NOT NULL,

    -- Session and customer
    session_id UUID REFERENCES public.pos_sessions(id) NOT NULL,
    customer_id UUID, -- Will add FK constraint after customers table is created

    -- Staff tracking
    sales_person UUID REFERENCES auth.users(id) NOT NULL,
    processed_by UUID REFERENCES auth.users(id), -- Who completed the transaction

    -- Manager override
    requires_manager_override BOOLEAN DEFAULT false,
    override_reason TEXT,
    overridden_by UUID REFERENCES auth.users(id),
    overridden_at TIMESTAMPTZ,

    -- Financial totals
    subtotal DECIMAL(10,2) NOT NULL DEFAULT 0.00,
    tax_total DECIMAL(10,2) NOT NULL DEFAULT 0.00,
    discount_total DECIMAL(10,2) NOT NULL DEFAULT 0.00,
    total DECIMAL(10,2) NOT NULL DEFAULT 0.00,

    -- Return/Refund linking
    original_transaction_id UUID REFERENCES public.pos_transactions(id),
    refund_amount DECIMAL(10,2),
    refund_reason TEXT,

    -- Activation details (for activation transactions)
    activation_plan_id UUID REFERENCES public.plans(id),
    activation_line_id UUID, -- Will add FK constraint after lines table is created
    activation_sim_id UUID, -- Will add FK constraint after sim_cards table is created

    -- Bill payment details
    bill_payment_account_number VARCHAR(50),
    bill_payment_amount DECIMAL(10,2),

    -- Notes and metadata
    notes TEXT,
    receipt_printed BOOLEAN DEFAULT false,
    receipt_printed_at TIMESTAMPTZ,

    -- Timestamps
    completed_at TIMESTAMPTZ,
    voided_at TIMESTAMPTZ,
    voided_by UUID REFERENCES auth.users(id),
    void_reason TEXT,

    created_at TIMESTAMPTZ DEFAULT NOW() NOT NULL,
    updated_at TIMESTAMPTZ DEFAULT NOW() NOT NULL
);

-- Indexes
CREATE INDEX pos_transactions_transaction_number_idx ON public.pos_transactions(transaction_number);
CREATE INDEX pos_transactions_session_id_idx ON public.pos_transactions(session_id);
CREATE INDEX pos_transactions_customer_id_idx ON public.pos_transactions(customer_id);
CREATE INDEX pos_transactions_sales_person_idx ON public.pos_transactions(sales_person);
CREATE INDEX pos_transactions_status_idx ON public.pos_transactions(status);
CREATE INDEX pos_transactions_type_idx ON public.pos_transactions(transaction_type);
CREATE INDEX pos_transactions_created_at_idx ON public.pos_transactions(created_at);
CREATE INDEX pos_transactions_original_transaction_id_idx ON public.pos_transactions(original_transaction_id);

-- =====================================================
-- POS TRANSACTION ITEMS TABLE
-- =====================================================
CREATE TABLE public.pos_transaction_items (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),

    -- Transaction reference
    transaction_id UUID REFERENCES public.pos_transactions(id) ON DELETE CASCADE NOT NULL,

    -- Item type (inventory or plan)
    item_type VARCHAR(20) NOT NULL, -- 'inventory', 'plan', 'service', 'fee'
    inventory_id UUID, -- Will add FK constraint after inventory table is created
    plan_id UUID REFERENCES public.plans(id),

    -- Item details
    item_name TEXT NOT NULL,
    item_description TEXT,
    item_sku TEXT,

    -- Quantity and pricing
    quantity INTEGER NOT NULL DEFAULT 1,
    unit_price DECIMAL(10,2) NOT NULL,
    discount_amount DECIMAL(10,2) DEFAULT 0.00,
    tax_amount DECIMAL(10,2) DEFAULT 0.00,
    subtotal DECIMAL(10,2) NOT NULL, -- (unit_price * quantity) - discount_amount + tax_amount

    -- Promotion tracking
    promotion_id UUID REFERENCES public.promotions(id),

    -- Returns/refunds
    is_returned BOOLEAN DEFAULT false,
    returned_quantity INTEGER DEFAULT 0,

    -- Metadata
    created_at TIMESTAMPTZ DEFAULT NOW() NOT NULL,
    updated_at TIMESTAMPTZ DEFAULT NOW() NOT NULL,

    -- Constraints
    CONSTRAINT valid_item_type CHECK (item_type IN ('inventory', 'plan', 'service', 'fee')),
    CONSTRAINT valid_quantity CHECK (quantity > 0),
    CONSTRAINT valid_returned_quantity CHECK (returned_quantity >= 0 AND returned_quantity <= quantity)
);

-- Indexes
CREATE INDEX pos_transaction_items_transaction_id_idx ON public.pos_transaction_items(transaction_id);
CREATE INDEX pos_transaction_items_inventory_id_idx ON public.pos_transaction_items(inventory_id);
CREATE INDEX pos_transaction_items_plan_id_idx ON public.pos_transaction_items(plan_id);
CREATE INDEX pos_transaction_items_item_type_idx ON public.pos_transaction_items(item_type);

-- =====================================================
-- POS TRANSACTION SERIALS TABLE (Track device serials)
-- =====================================================
CREATE TABLE public.pos_transaction_serials (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),

    -- Transaction item reference
    transaction_item_id UUID REFERENCES public.pos_transaction_items(id) ON DELETE CASCADE NOT NULL,
    transaction_id UUID REFERENCES public.pos_transactions(id) ON DELETE CASCADE NOT NULL,
    inventory_id UUID, -- Will add FK constraint after inventory table is created

    -- Serial number tracking
    serial_number TEXT NOT NULL,
    imei TEXT,

    -- Inventory serial reference (if using inventory_serials table)
    inventory_serial_id UUID, -- Will add FK constraint after inventory_serials table is created

    -- Status
    is_returned BOOLEAN DEFAULT false,
    returned_at TIMESTAMPTZ,

    -- Metadata
    created_at TIMESTAMPTZ DEFAULT NOW() NOT NULL,
    updated_at TIMESTAMPTZ DEFAULT NOW() NOT NULL
);

-- Indexes
CREATE INDEX pos_transaction_serials_transaction_id_idx ON public.pos_transaction_serials(transaction_id);
CREATE INDEX pos_transaction_serials_transaction_item_id_idx ON public.pos_transaction_serials(transaction_item_id);
CREATE INDEX pos_transaction_serials_serial_number_idx ON public.pos_transaction_serials(serial_number);
CREATE INDEX pos_transaction_serials_imei_idx ON public.pos_transaction_serials(imei);
CREATE INDEX pos_transaction_serials_inventory_id_idx ON public.pos_transaction_serials(inventory_id);

-- =====================================================
-- POS TRANSACTION PAYMENTS TABLE
-- =====================================================
CREATE TABLE public.pos_transaction_payments (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),

    -- Transaction reference
    transaction_id UUID REFERENCES public.pos_transactions(id) ON DELETE CASCADE NOT NULL,

    -- Payment details
    payment_method pos_payment_method NOT NULL,
    amount DECIMAL(10,2) NOT NULL,

    -- Payment provider details (for card payments)
    card_last_four VARCHAR(4),
    card_type VARCHAR(20), -- 'visa', 'mastercard', 'amex', etc.
    authorization_code TEXT,
    transaction_id_external TEXT, -- Payment processor transaction ID

    -- Cash payment details
    cash_tendered DECIMAL(10,2),
    cash_change DECIMAL(10,2),

    -- Check details
    check_number TEXT,

    -- Metadata
    processed_at TIMESTAMPTZ DEFAULT NOW() NOT NULL,
    created_at TIMESTAMPTZ DEFAULT NOW() NOT NULL,
    updated_at TIMESTAMPTZ DEFAULT NOW() NOT NULL,

    -- Constraints
    CONSTRAINT valid_amount CHECK (amount > 0),
    CONSTRAINT valid_cash_tendered CHECK (cash_tendered IS NULL OR cash_tendered >= amount),
    CONSTRAINT valid_cash_change CHECK (cash_change IS NULL OR cash_change >= 0)
);

-- Indexes
CREATE INDEX pos_transaction_payments_transaction_id_idx ON public.pos_transaction_payments(transaction_id);
CREATE INDEX pos_transaction_payments_payment_method_idx ON public.pos_transaction_payments(payment_method);
CREATE INDEX pos_transaction_payments_processed_at_idx ON public.pos_transaction_payments(processed_at);

-- =====================================================
-- POS COMMISSION TRACKING TABLE
-- =====================================================
CREATE TABLE public.pos_commissions (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),

    -- Transaction and sales person
    transaction_id UUID REFERENCES public.pos_transactions(id) ON DELETE CASCADE NOT NULL,
    sales_person UUID REFERENCES auth.users(id) NOT NULL,

    -- Commission details
    commission_amount DECIMAL(10,2) NOT NULL,
    commission_rate DECIMAL(5,4), -- e.g., 0.0500 for 5%
    base_amount DECIMAL(10,2) NOT NULL, -- Amount commission is calculated on

    -- Commission type/category
    commission_type VARCHAR(50), -- 'device_sale', 'activation', 'plan_sale', 'accessory', etc.

    -- Payment status
    is_paid BOOLEAN DEFAULT false,
    paid_at TIMESTAMPTZ,
    paid_in_period VARCHAR(20), -- e.g., "2025-01" for January 2025

    -- Metadata
    notes TEXT,
    created_at TIMESTAMPTZ DEFAULT NOW() NOT NULL,
    updated_at TIMESTAMPTZ DEFAULT NOW() NOT NULL,

    -- Constraints
    CONSTRAINT valid_commission_amount CHECK (commission_amount >= 0)
);

-- Indexes
CREATE INDEX pos_commissions_transaction_id_idx ON public.pos_commissions(transaction_id);
CREATE INDEX pos_commissions_sales_person_idx ON public.pos_commissions(sales_person);
CREATE INDEX pos_commissions_is_paid_idx ON public.pos_commissions(is_paid);
CREATE INDEX pos_commissions_paid_in_period_idx ON public.pos_commissions(paid_in_period);
CREATE INDEX pos_commissions_created_at_idx ON public.pos_commissions(created_at);

-- =====================================================
-- ROW LEVEL SECURITY (RLS) POLICIES
-- =====================================================

-- Enable RLS on all POS tables
ALTER TABLE public.pos_sessions ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.pos_transactions ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.pos_transaction_items ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.pos_transaction_serials ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.pos_transaction_payments ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.pos_commissions ENABLE ROW LEVEL SECURITY;

-- POS Sessions Policies: Staff can view and manage
CREATE POLICY "Staff can view pos_sessions"
    ON public.pos_sessions FOR SELECT
    USING (
        EXISTS (
            SELECT 1 FROM public.profiles
            WHERE id = auth.uid() AND role IN ('admin', 'support')
        )
    );

CREATE POLICY "Staff can manage pos_sessions"
    ON public.pos_sessions FOR ALL
    USING (
        EXISTS (
            SELECT 1 FROM public.profiles
            WHERE id = auth.uid() AND role IN ('admin', 'support')
        )
    );

-- POS Transactions Policies: Staff can view and manage
CREATE POLICY "Staff can view pos_transactions"
    ON public.pos_transactions FOR SELECT
    USING (
        EXISTS (
            SELECT 1 FROM public.profiles
            WHERE id = auth.uid() AND role IN ('admin', 'support')
        )
    );

CREATE POLICY "Staff can manage pos_transactions"
    ON public.pos_transactions FOR ALL
    USING (
        EXISTS (
            SELECT 1 FROM public.profiles
            WHERE id = auth.uid() AND role IN ('admin', 'support')
        )
    );

-- POS Transaction Items Policies: Staff can view and manage
CREATE POLICY "Staff can view pos_transaction_items"
    ON public.pos_transaction_items FOR SELECT
    USING (
        EXISTS (
            SELECT 1 FROM public.profiles
            WHERE id = auth.uid() AND role IN ('admin', 'support')
        )
    );

CREATE POLICY "Staff can manage pos_transaction_items"
    ON public.pos_transaction_items FOR ALL
    USING (
        EXISTS (
            SELECT 1 FROM public.profiles
            WHERE id = auth.uid() AND role IN ('admin', 'support')
        )
    );

-- POS Transaction Serials Policies: Staff can view and manage
CREATE POLICY "Staff can view pos_transaction_serials"
    ON public.pos_transaction_serials FOR SELECT
    USING (
        EXISTS (
            SELECT 1 FROM public.profiles
            WHERE id = auth.uid() AND role IN ('admin', 'support')
        )
    );

CREATE POLICY "Staff can manage pos_transaction_serials"
    ON public.pos_transaction_serials FOR ALL
    USING (
        EXISTS (
            SELECT 1 FROM public.profiles
            WHERE id = auth.uid() AND role IN ('admin', 'support')
        )
    );

-- POS Transaction Payments Policies: Staff can view and manage
CREATE POLICY "Staff can view pos_transaction_payments"
    ON public.pos_transaction_payments FOR SELECT
    USING (
        EXISTS (
            SELECT 1 FROM public.profiles
            WHERE id = auth.uid() AND role IN ('admin', 'support')
        )
    );

CREATE POLICY "Staff can manage pos_transaction_payments"
    ON public.pos_transaction_payments FOR ALL
    USING (
        EXISTS (
            SELECT 1 FROM public.profiles
            WHERE id = auth.uid() AND role IN ('admin', 'support')
        )
    );

-- POS Commissions Policies: Staff can view own, admins can view all
CREATE POLICY "Sales staff can view own commissions"
    ON public.pos_commissions FOR SELECT
    USING (
        sales_person = auth.uid() OR
        EXISTS (
            SELECT 1 FROM public.profiles
            WHERE id = auth.uid() AND role = 'admin'
        )
    );

CREATE POLICY "Admins can manage commissions"
    ON public.pos_commissions FOR ALL
    USING (
        EXISTS (
            SELECT 1 FROM public.profiles
            WHERE id = auth.uid() AND role = 'admin'
        )
    );

-- =====================================================
-- TRIGGERS FOR AUTO-UPDATE TIMESTAMPS
-- =====================================================

CREATE TRIGGER set_updated_at BEFORE UPDATE ON public.pos_sessions FOR EACH ROW EXECUTE FUNCTION public.handle_updated_at();
CREATE TRIGGER set_updated_at BEFORE UPDATE ON public.pos_transactions FOR EACH ROW EXECUTE FUNCTION public.handle_updated_at();
CREATE TRIGGER set_updated_at BEFORE UPDATE ON public.pos_transaction_items FOR EACH ROW EXECUTE FUNCTION public.handle_updated_at();
CREATE TRIGGER set_updated_at BEFORE UPDATE ON public.pos_transaction_serials FOR EACH ROW EXECUTE FUNCTION public.handle_updated_at();
CREATE TRIGGER set_updated_at BEFORE UPDATE ON public.pos_transaction_payments FOR EACH ROW EXECUTE FUNCTION public.handle_updated_at();
CREATE TRIGGER set_updated_at BEFORE UPDATE ON public.pos_commissions FOR EACH ROW EXECUTE FUNCTION public.handle_updated_at();

-- =====================================================
-- FUNCTIONS FOR POS OPERATIONS
-- =====================================================

-- Function to generate next transaction number
CREATE OR REPLACE FUNCTION public.generate_transaction_number()
RETURNS TEXT AS $$
DECLARE
    next_num INTEGER;
    year_str TEXT;
BEGIN
    year_str := to_char(CURRENT_DATE, 'YYYY');

    SELECT COALESCE(MAX(
        CAST(SUBSTRING(transaction_number FROM '[0-9]+$') AS INTEGER)
    ), 0) + 1
    INTO next_num
    FROM public.pos_transactions
    WHERE transaction_number LIKE 'T-' || year_str || '-%';

    RETURN 'T-' || year_str || '-' || LPAD(next_num::TEXT, 5, '0');
END;
$$ LANGUAGE plpgsql;

-- Function to generate next session number
CREATE OR REPLACE FUNCTION public.generate_session_number()
RETURNS TEXT AS $$
DECLARE
    next_num INTEGER;
    year_str TEXT;
BEGIN
    year_str := to_char(CURRENT_DATE, 'YYYY');

    SELECT COALESCE(MAX(
        CAST(SUBSTRING(session_number FROM '[0-9]+$') AS INTEGER)
    ), 0) + 1
    INTO next_num
    FROM public.pos_sessions
    WHERE session_number LIKE year_str || '-%';

    RETURN year_str || '-' || LPAD(next_num::TEXT, 3, '0');
END;
$$ LANGUAGE plpgsql;

-- Function to update session totals
CREATE OR REPLACE FUNCTION public.update_session_totals()
RETURNS TRIGGER AS $$
BEGIN
    -- Update session totals when a transaction is completed
    IF NEW.status = 'completed' AND (OLD.status IS NULL OR OLD.status != 'completed') THEN
        UPDATE public.pos_sessions
        SET
            total_sales = total_sales + CASE WHEN NEW.transaction_type = 'sale' OR NEW.transaction_type = 'activation' THEN NEW.total ELSE 0 END,
            total_refunds = total_refunds + CASE WHEN NEW.transaction_type = 'refund' OR NEW.transaction_type = 'return' THEN NEW.total ELSE 0 END,
            transaction_count = transaction_count + 1,
            updated_at = NOW()
        WHERE id = NEW.session_id;
    END IF;

    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Trigger to update session totals
CREATE TRIGGER update_session_totals_trigger
    AFTER INSERT OR UPDATE ON public.pos_transactions
    FOR EACH ROW
    EXECUTE FUNCTION public.update_session_totals();

-- Function to update session payment totals
CREATE OR REPLACE FUNCTION public.update_session_payment_totals()
RETURNS TRIGGER AS $$
DECLARE
    trans_status pos_transaction_status;
BEGIN
    -- Get transaction status
    SELECT status INTO trans_status
    FROM public.pos_transactions
    WHERE id = NEW.transaction_id;

    -- Only update if transaction is completed
    IF trans_status = 'completed' THEN
        UPDATE public.pos_sessions s
        SET
            total_cash_payments = total_cash_payments + CASE WHEN NEW.payment_method = 'cash' THEN NEW.amount ELSE 0 END,
            total_card_payments = total_card_payments + CASE WHEN NEW.payment_method IN ('credit_card', 'debit_card') THEN NEW.amount ELSE 0 END,
            total_other_payments = total_other_payments + CASE WHEN NEW.payment_method NOT IN ('cash', 'credit_card', 'debit_card') THEN NEW.amount ELSE 0 END,
            updated_at = NOW()
        FROM public.pos_transactions t
        WHERE t.id = NEW.transaction_id
        AND s.id = t.session_id;
    END IF;

    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Trigger to update session payment totals
CREATE TRIGGER update_session_payment_totals_trigger
    AFTER INSERT ON public.pos_transaction_payments
    FOR EACH ROW
    EXECUTE FUNCTION public.update_session_payment_totals();

-- =====================================================
-- VIEWS FOR REPORTING
-- =====================================================

-- View: Daily sales summary
CREATE VIEW public.pos_daily_sales_summary AS
SELECT
    DATE(t.created_at) as sale_date,
    COUNT(t.id) as transaction_count,
    SUM(CASE WHEN t.transaction_type IN ('sale', 'activation') THEN t.total ELSE 0 END) as total_sales,
    SUM(CASE WHEN t.transaction_type IN ('return', 'refund') THEN t.total ELSE 0 END) as total_refunds,
    SUM(CASE WHEN t.transaction_type = 'bill_payment' THEN t.total ELSE 0 END) as total_bill_payments,
    SUM(t.total) as net_total
FROM public.pos_transactions t
WHERE t.status = 'completed'
GROUP BY DATE(t.created_at)
ORDER BY sale_date DESC;

-- View: Sales person performance
CREATE VIEW public.pos_salesperson_performance AS
SELECT
    t.sales_person,
    p.first_name || ' ' || p.last_name as salesperson_name,
    COUNT(t.id) as transaction_count,
    SUM(CASE WHEN t.transaction_type IN ('sale', 'activation') THEN t.total ELSE 0 END) as total_sales,
    SUM(CASE WHEN t.transaction_type = 'activation' THEN 1 ELSE 0 END) as activation_count,
    SUM(c.commission_amount) as total_commissions
FROM public.pos_transactions t
LEFT JOIN public.profiles p ON p.id = t.sales_person
LEFT JOIN public.pos_commissions c ON c.transaction_id = t.id
WHERE t.status = 'completed'
GROUP BY t.sales_person, p.first_name, p.last_name
ORDER BY total_sales DESC;

-- Grant access to views
GRANT SELECT ON public.pos_daily_sales_summary TO authenticated;
GRANT SELECT ON public.pos_salesperson_performance TO authenticated;
