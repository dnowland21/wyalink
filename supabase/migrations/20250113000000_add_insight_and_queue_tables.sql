-- WyaLink - Insight and Queue System Tables
-- Migration: Add carriers table for Insight, store_queue for Queue system, and enhance existing tables

-- =====================================================
-- CARRIERS TABLE (for Insight porting information)
-- =====================================================
CREATE TABLE public.carriers (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    name TEXT NOT NULL,
    account_info TEXT NOT NULL,
    pin_info TEXT NOT NULL,
    support_number TEXT,
    tips TEXT,
    sort_order INTEGER DEFAULT 0,
    is_active BOOLEAN DEFAULT true NOT NULL,
    created_at TIMESTAMPTZ DEFAULT NOW() NOT NULL,
    updated_at TIMESTAMPTZ DEFAULT NOW() NOT NULL
);

-- Indexes
CREATE INDEX carriers_name_idx ON public.carriers(name);
CREATE INDEX carriers_is_active_idx ON public.carriers(is_active);

-- Enable RLS
ALTER TABLE public.carriers ENABLE ROW LEVEL SECURITY;

-- Policies: Staff can view all carriers
CREATE POLICY "Staff can view carriers"
    ON public.carriers FOR SELECT
    USING (
        EXISTS (
            SELECT 1 FROM public.profiles
            WHERE id = auth.uid() AND role IN ('admin', 'support')
        )
    );

-- Policies: Only admins can manage carriers
CREATE POLICY "Admins can manage carriers"
    ON public.carriers FOR ALL
    USING (
        EXISTS (
            SELECT 1 FROM public.profiles
            WHERE id = auth.uid() AND role = 'admin'
        )
    );

-- Trigger: Auto-update updated_at
CREATE TRIGGER set_updated_at BEFORE UPDATE ON public.carriers FOR EACH ROW EXECUTE FUNCTION public.handle_updated_at();

-- =====================================================
-- PROMOTIONS TABLE (for MVNO system)
-- =====================================================
CREATE TABLE IF NOT EXISTS public.promotions (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    status TEXT DEFAULT 'draft' NOT NULL,
    promotion_name TEXT NOT NULL,
    promotion_description TEXT,
    promotion_code TEXT UNIQUE,
    discount_type TEXT NOT NULL, -- 'dollar' or 'percent'
    discount_amount DECIMAL(10,2) NOT NULL,
    discount_duration TEXT NOT NULL, -- 'one_time' or 'recurring'
    recurring_months INTEGER,
    included_inventory_ids TEXT[] DEFAULT ARRAY[]::TEXT[],
    included_plan_ids TEXT[] DEFAULT ARRAY[]::TEXT[],
    approval_required BOOLEAN DEFAULT false NOT NULL,
    approved_by UUID REFERENCES auth.users(id),
    approved_at TIMESTAMPTZ,
    valid_from TIMESTAMPTZ,
    valid_until TIMESTAMPTZ,
    created_at TIMESTAMPTZ DEFAULT NOW() NOT NULL,
    updated_at TIMESTAMPTZ DEFAULT NOW() NOT NULL
);

-- Indexes
CREATE INDEX IF NOT EXISTS promotions_status_idx ON public.promotions(status);
CREATE INDEX IF NOT EXISTS promotions_code_idx ON public.promotions(promotion_code);
CREATE INDEX IF NOT EXISTS promotions_valid_from_idx ON public.promotions(valid_from);
CREATE INDEX IF NOT EXISTS promotions_valid_until_idx ON public.promotions(valid_until);

-- Enable RLS
ALTER TABLE public.promotions ENABLE ROW LEVEL SECURITY;

-- Policies: Staff can view all promotions
CREATE POLICY "Staff can view promotions"
    ON public.promotions FOR SELECT
    USING (
        EXISTS (
            SELECT 1 FROM public.profiles
            WHERE id = auth.uid() AND role IN ('admin', 'support')
        )
    );

-- Policies: Admins can manage promotions
CREATE POLICY "Admins can manage promotions"
    ON public.promotions FOR ALL
    USING (
        EXISTS (
            SELECT 1 FROM public.profiles
            WHERE id = auth.uid() AND role = 'admin'
        )
    );

-- Trigger: Auto-update updated_at
CREATE TRIGGER set_updated_at_promotions BEFORE UPDATE ON public.promotions FOR EACH ROW EXECUTE FUNCTION public.handle_updated_at();

-- =====================================================
-- STORE QUEUE TABLE (for in-store visitor queue)
-- =====================================================
CREATE TYPE queue_visitor_type AS ENUM ('lead', 'customer');
CREATE TYPE queue_status AS ENUM ('waiting', 'being_assisted', 'completed', 'removed');

CREATE TABLE public.store_queue (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    visitor_type queue_visitor_type NOT NULL,
    lead_id UUID REFERENCES public.leads(id) ON DELETE CASCADE,
    customer_id UUID REFERENCES public.customers(id) ON DELETE CASCADE,

    -- Visitor info (for quick reference)
    visitor_name TEXT NOT NULL,
    visitor_phone TEXT,
    visitor_email TEXT,

    -- Queue management
    status queue_status DEFAULT 'waiting' NOT NULL,
    checked_in_at TIMESTAMPTZ DEFAULT NOW() NOT NULL,
    assisted_by UUID REFERENCES auth.users(id),
    assistance_started_at TIMESTAMPTZ,
    completed_at TIMESTAMPTZ,
    removed_at TIMESTAMPTZ,
    removal_reason TEXT,

    -- Notes
    notes TEXT,

    created_at TIMESTAMPTZ DEFAULT NOW() NOT NULL,
    updated_at TIMESTAMPTZ DEFAULT NOW() NOT NULL,

    -- Constraints
    CONSTRAINT valid_visitor_reference CHECK (
        (visitor_type = 'lead' AND lead_id IS NOT NULL AND customer_id IS NULL) OR
        (visitor_type = 'customer' AND customer_id IS NOT NULL AND lead_id IS NULL)
    )
);

-- Indexes
CREATE INDEX store_queue_status_idx ON public.store_queue(status);
CREATE INDEX store_queue_checked_in_at_idx ON public.store_queue(checked_in_at);
CREATE INDEX store_queue_lead_id_idx ON public.store_queue(lead_id);
CREATE INDEX store_queue_customer_id_idx ON public.store_queue(customer_id);
CREATE INDEX store_queue_assisted_by_idx ON public.store_queue(assisted_by);

-- Enable RLS
ALTER TABLE public.store_queue ENABLE ROW LEVEL SECURITY;

-- Policies: Staff can view queue
CREATE POLICY "Staff can view queue"
    ON public.store_queue FOR SELECT
    USING (
        EXISTS (
            SELECT 1 FROM public.profiles
            WHERE id = auth.uid() AND role IN ('admin', 'support')
        )
    );

-- Policies: Staff can manage queue
CREATE POLICY "Staff can manage queue"
    ON public.store_queue FOR ALL
    USING (
        EXISTS (
            SELECT 1 FROM public.profiles
            WHERE id = auth.uid() AND role IN ('admin', 'support')
        )
    );

-- Trigger: Auto-update updated_at
CREATE TRIGGER set_updated_at BEFORE UPDATE ON public.store_queue FOR EACH ROW EXECUTE FUNCTION public.handle_updated_at();

-- =====================================================
-- SEED DATA: Sample Carriers
-- =====================================================
INSERT INTO public.carriers (name, account_info, pin_info, support_number, tips, sort_order) VALUES
('AirVoice', 'SIM card number', 'Last 4 digits of phone number', '888-944-2355', NULL, 1),
('AT&T (Postpaid)', '9- or 12-digit wireless account number (not the phone number)', '6-digit Number Transfer PIN (*PORT, myAT&T app, or online)', '888-898-7685', 'Find account at myAT&T: Profile > Sign-in Info > My linked accounts. If bundled with wireline/Internet/DIRECTV, the wireless account is separate.', 2),
('AT&T (Prepaid)', '2-digit account number', '4-digit number', '800-901-9878', 'Prepaid and Postpaid have separate account numbers.', 3),
('Boost / Dish Wireless', '9-digit account number (not the phone number)', '4-digit number', '833-502-6678', NULL, 4),
('Consumer Cellular', 'Typically starts with 1000; upper-right of bill/online account (not the phone number)', '6-digit alphanumeric; sent to each device and tied to that number', '888-750-5519', 'You may be asked for account owner name, last 4 of SSN, and billing address.', 5),
('Cricket', '9-digit account number (not the phone number)', '4-digit Authorization ID (AID)', '800-274-2538', 'Reset AID: call 855-246-2461, enter ''1111'' 3 times, press # to get one-time PIN by text, then set new PIN.', 6),
('Google Fi (Project Fi)', '5-digit account number (Manage plan > Leave Google Fi)', '5-digit PIN (same flow as account number)', '844-825-5234', NULL, 7),
('Metro', '9-digit account number (from payment confirmation texts)', '8-digit number (remove 4-digit high-security PIN if present, then set 8-digit)', '888-863-8768', NULL, 8),
('Mint Mobile', '12-digit account number', '4-digit number (default last 4 of phone number)', '800-683-7392', NULL, 9),
('T-Mobile (Postpaid)', '9-digit account number (online account)', '6-digit Number Transfer PIN (MyT-Mobile or dial 611/800-937-8997)', '800-937-8997', 'Disable Number Lock in security settings if enabled.', 10),
('T-Mobile (Prepaid)', '9-digit account number (online account or support)', '4-digit number', '877-778-2106', NULL, 11),
('Verizon (Postpaid)', '9-digit account number (MyVerizon; not the MDN)', '6-digit Number Transfer PIN (MyVerizon > Number Transfer PIN > Generate or dial #PORT)', 'Verizon Care', NULL, 12),
('Verizon Prepaid', 'Shown on bill/online account', '6-digit Number Transfer PIN (MyVerizon > Number Transfer PIN > Generate or dial #PORT)', 'Verizon Care', 'Billing ZIP may be required.', 13),
('Visible', 'Shown in account', '6-digit Number Transfer PIN (request via app: Account > Port-Out PIN; delivered by email)', 'Verizon Care', 'PIN valid 7 days. Max 3 PINs per 24 hours. Requesting a new PIN invalidates prior ones. Email PIN can take up to 60 minutes. You can invalidate the latest PIN via the link in email/SMS.', 14);
