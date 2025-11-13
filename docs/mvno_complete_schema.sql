ALTER TABLE public.leads
  ADD COLUMN IF NOT EXISTS type lead_type DEFAULT 'consumer',
  ADD COLUMN IF NOT EXISTS company_name TEXT,
  ADD COLUMN IF NOT EXISTS middle_initial VARCHAR(1),
  ADD COLUMN IF NOT EXISTS sex sex_type,
  ADD COLUMN IF NOT EXISTS date_of_birth DATE,
  ADD COLUMN IF NOT EXISTS billing_address_line1 TEXT,
  ADD COLUMN IF NOT EXISTS billing_address_line2 TEXT,
  ADD COLUMN IF NOT EXISTS billing_city TEXT,
  ADD COLUMN IF NOT EXISTS billing_state VARCHAR(2),
  ADD COLUMN IF NOT EXISTS billing_zip VARCHAR(10),
  ADD COLUMN IF NOT EXISTS billing_country VARCHAR(2) DEFAULT 'US',
  ADD COLUMN IF NOT EXISTS shipping_address_line1 TEXT,
  ADD COLUMN IF NOT EXISTS shipping_address_line2 TEXT,
  ADD COLUMN IF NOT EXISTS shipping_city TEXT,
  ADD COLUMN IF NOT EXISTS shipping_state VARCHAR(2),
  ADD COLUMN IF NOT EXISTS shipping_zip VARCHAR(10),
  ADD COLUMN IF NOT EXISTS shipping_country VARCHAR(2) DEFAULT 'US',
  ADD COLUMN IF NOT EXISTS customer_id UUID, -- FK constraint added after customers table exists
  ADD COLUMN IF NOT EXISTS converted_at TIMESTAMPTZ,
  ADD COLUMN IF NOT EXISTS details TEXT;

-- Create index on type for filtering
CREATE INDEX IF NOT EXISTS leads_type_idx ON public.leads(type);
CREATE INDEX IF NOT EXISTS leads_customer_id_idx ON public.leads(customer_id);

-- =====================================================
-- 2. CUSTOMERS TABLE
-- =====================================================

CREATE TABLE IF NOT EXISTS public.customers (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    account_number VARCHAR(10) UNIQUE NOT NULL,
    type lead_type NOT NULL,

    -- Business fields
    company_name TEXT,

    -- Personal fields
    first_name TEXT NOT NULL,
    middle_initial VARCHAR(1),
    last_name TEXT NOT NULL,
    sex sex_type,
    date_of_birth DATE,

    -- Contact information
    email TEXT NOT NULL,
    phone TEXT NOT NULL,

    -- Billing address
    billing_address_line1 TEXT NOT NULL,
    billing_address_line2 TEXT,
    billing_city TEXT NOT NULL,
    billing_state VARCHAR(2) NOT NULL,
    billing_zip VARCHAR(10) NOT NULL,
    billing_country VARCHAR(2) DEFAULT 'US' NOT NULL,

    -- Shipping address
    shipping_address_line1 TEXT,
    shipping_address_line2 TEXT,
    shipping_city TEXT,
    shipping_state VARCHAR(2),
    shipping_zip VARCHAR(10),
    shipping_country VARCHAR(2) DEFAULT 'US',

    -- Metadata
    source TEXT,
    details TEXT,
    created_by UUID REFERENCES auth.users(id),
    created_at TIMESTAMPTZ DEFAULT NOW() NOT NULL,
    updated_at TIMESTAMPTZ DEFAULT NOW() NOT NULL
);

-- Indexes
CREATE INDEX customers_account_number_idx ON public.customers(account_number);
CREATE INDEX customers_type_idx ON public.customers(type);
CREATE INDEX customers_email_idx ON public.customers(email);
CREATE INDEX customers_phone_idx ON public.customers(phone);
CREATE INDEX customers_created_at_idx ON public.customers(created_at);

-- Auto-update timestamp
CREATE TRIGGER set_customers_updated_at
BEFORE UPDATE ON public.customers
FOR EACH ROW
EXECUTE FUNCTION public.handle_updated_at();

-- Add foreign key constraint to leads table now that customers exists
ALTER TABLE public.leads
  ADD CONSTRAINT leads_customer_id_fkey
  FOREIGN KEY (customer_id)
  REFERENCES public.customers(id)
  ON DELETE SET NULL;

-- Function to generate unique account number
CREATE OR REPLACE FUNCTION generate_account_number()
RETURNS VARCHAR(10) AS $$
DECLARE
    new_account_number VARCHAR(10);
    account_exists BOOLEAN;
BEGIN
    LOOP
        -- Generate random 10-digit number
        new_account_number := LPAD(FLOOR(RANDOM() * 10000000000)::TEXT, 10, '0');

        -- Check if it already exists
        SELECT EXISTS(SELECT 1 FROM public.customers WHERE account_number = new_account_number) INTO account_exists;

        -- If unique, return it
        IF NOT account_exists THEN
            RETURN new_account_number;
        END IF;
    END LOOP;
END;
$$ LANGUAGE plpgsql;

-- =====================================================
-- 3. VENDORS TABLE
-- =====================================================

CREATE TABLE IF NOT EXISTS public.vendors (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    company_name TEXT NOT NULL,
    first_name TEXT,
    last_name TEXT,

    -- Contact information
    email TEXT,
    phone TEXT,

    -- Billing address
    billing_address_line1 TEXT,
    billing_address_line2 TEXT,
    billing_city TEXT,
    billing_state VARCHAR(2),
    billing_zip VARCHAR(10),
    billing_country VARCHAR(2) DEFAULT 'US',

    -- Shipping address
    shipping_address_line1 TEXT,
    shipping_address_line2 TEXT,
    shipping_city TEXT,
    shipping_state VARCHAR(2),
    shipping_zip VARCHAR(10),
    shipping_country VARCHAR(2) DEFAULT 'US',

    -- Terms and notes
    terms TEXT,
    notes TEXT,

    -- Metadata
    created_at TIMESTAMPTZ DEFAULT NOW() NOT NULL,
    updated_at TIMESTAMPTZ DEFAULT NOW() NOT NULL
);

-- Indexes
CREATE INDEX vendors_company_name_idx ON public.vendors(company_name);

-- Auto-update timestamp
CREATE TRIGGER set_vendors_updated_at
BEFORE UPDATE ON public.vendors
FOR EACH ROW
EXECUTE FUNCTION public.handle_updated_at();

-- =====================================================
-- 4. PLANS TABLE
-- =====================================================

CREATE TABLE IF NOT EXISTS public.plans (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    plan_uuid VARCHAR(255) UNIQUE,
    plan_name TEXT NOT NULL,
    description TEXT,
    plan_status plan_status DEFAULT 'active' NOT NULL,

    -- Plan identifiers
    ift_number TEXT,
    external_sku TEXT,
    promotions_offer_id TEXT,

    -- Allowances
    voice_minutes INTEGER, -- NULL for unlimited
    sms_messages INTEGER, -- NULL for unlimited
    high_priority_data_mb INTEGER,
    general_data_mb INTEGER,
    low_priority_data_mb INTEGER,

    -- Pricing (JSONB to support multiple price tiers)
    prices JSONB, -- e.g., {"retail": 29.99, "wholesale": 24.99}

    -- Network settings
    max_queue_allowance INTEGER,
    network_name TEXT,

    -- Metadata
    created_at TIMESTAMPTZ DEFAULT NOW() NOT NULL,
    updated_at TIMESTAMPTZ DEFAULT NOW() NOT NULL
);

-- Indexes
CREATE INDEX plans_plan_name_idx ON public.plans(plan_name);
CREATE INDEX plans_plan_status_idx ON public.plans(plan_status);
CREATE INDEX plans_plan_uuid_idx ON public.plans(plan_uuid);

-- Auto-update timestamp
CREATE TRIGGER set_plans_updated_at
BEFORE UPDATE ON public.plans
FOR EACH ROW
EXECUTE FUNCTION public.handle_updated_at();

-- =====================================================
-- 5. INVENTORY TABLE
-- =====================================================

CREATE TABLE IF NOT EXISTS public.inventory (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    type inventory_type NOT NULL,
    status inventory_status DEFAULT 'available' NOT NULL,

    -- Item details
    item_name TEXT NOT NULL,
    item_description TEXT,
    item_number TEXT UNIQUE,
    upc TEXT,

    -- Pricing
    retail_price DECIMAL(10, 2),
    cost DECIMAL(10, 2),

    -- Product details
    brand TEXT,
    storage TEXT, -- e.g., "64GB", "128GB", "256GB"
    color TEXT, -- e.g., "Black", "White", "Blue"

    -- Inventory tracking
    quantity_on_hand INTEGER DEFAULT 0,

    -- Metadata
    created_at TIMESTAMPTZ DEFAULT NOW() NOT NULL,
    updated_at TIMESTAMPTZ DEFAULT NOW() NOT NULL
);

-- Indexes
CREATE INDEX inventory_type_idx ON public.inventory(type);
CREATE INDEX inventory_status_idx ON public.inventory(status);
CREATE INDEX inventory_item_number_idx ON public.inventory(item_number);
CREATE INDEX inventory_brand_idx ON public.inventory(brand);

-- Auto-update timestamp
CREATE TRIGGER set_inventory_updated_at
BEFORE UPDATE ON public.inventory
FOR EACH ROW
EXECUTE FUNCTION public.handle_updated_at();

-- =====================================================
-- 6. INVENTORY SERIALS TABLE (FIFO Tracking)
-- =====================================================

CREATE TABLE IF NOT EXISTS public.inventory_serials (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    inventory_id UUID REFERENCES public.inventory(id) ON DELETE CASCADE NOT NULL,
    serial_number TEXT UNIQUE NOT NULL,
    imei TEXT UNIQUE,

    -- Status
    status inventory_status DEFAULT 'available' NOT NULL,

    -- FIFO tracking
    received_at TIMESTAMPTZ DEFAULT NOW() NOT NULL,
    assigned_at TIMESTAMPTZ,
    assigned_to UUID REFERENCES public.customers(id),

    -- Metadata
    created_at TIMESTAMPTZ DEFAULT NOW() NOT NULL,
    updated_at TIMESTAMPTZ DEFAULT NOW() NOT NULL
);

-- Indexes
CREATE INDEX inventory_serials_inventory_id_idx ON public.inventory_serials(inventory_id);
CREATE INDEX inventory_serials_serial_number_idx ON public.inventory_serials(serial_number);
CREATE INDEX inventory_serials_imei_idx ON public.inventory_serials(imei);
CREATE INDEX inventory_serials_status_idx ON public.inventory_serials(status);
CREATE INDEX inventory_serials_received_at_idx ON public.inventory_serials(received_at);

-- Auto-update timestamp
CREATE TRIGGER set_inventory_serials_updated_at
BEFORE UPDATE ON public.inventory_serials
FOR EACH ROW
EXECUTE FUNCTION public.handle_updated_at();

-- =====================================================
-- 7. INVENTORY VENDORS JUNCTION TABLE
-- =====================================================

CREATE TABLE IF NOT EXISTS public.inventory_vendors (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    inventory_id UUID REFERENCES public.inventory(id) ON DELETE CASCADE NOT NULL,
    vendor_id UUID REFERENCES public.vendors(id) ON DELETE CASCADE NOT NULL,

    -- Vendor-specific pricing
    vendor_sku TEXT,
    vendor_cost DECIMAL(10, 2),

    -- Metadata
    created_at TIMESTAMPTZ DEFAULT NOW() NOT NULL,

    UNIQUE(inventory_id, vendor_id)
);

-- Indexes
CREATE INDEX inventory_vendors_inventory_id_idx ON public.inventory_vendors(inventory_id);
CREATE INDEX inventory_vendors_vendor_id_idx ON public.inventory_vendors(vendor_id);

-- =====================================================
-- 8. SIM CARDS TABLE
-- =====================================================

CREATE TABLE IF NOT EXISTS public.sim_cards (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    iccid TEXT UNIQUE NOT NULL,
    imsi TEXT[], -- Array of IMSI numbers
    type sim_type NOT NULL,
    activation_code TEXT,
    status sim_status DEFAULT 'cold' NOT NULL,

    -- Location and assignment
    country VARCHAR(2),
    line_id UUID, -- FK constraint added after lines table exists
    assigned_to UUID REFERENCES public.customers(id),

    -- Network details
    first_network_attachment TIMESTAMPTZ,
    network_configuration JSONB,

    -- Ordering
    sim_order TEXT,
    sim_tag TEXT,

    -- Manufacturing
    manufacturer TEXT,
    manufacturer_profile TEXT,

    -- Metadata
    created_at TIMESTAMPTZ DEFAULT NOW() NOT NULL,
    updated_at TIMESTAMPTZ DEFAULT NOW() NOT NULL
);

-- Indexes
CREATE INDEX sim_cards_iccid_idx ON public.sim_cards(iccid);
CREATE INDEX sim_cards_status_idx ON public.sim_cards(status);
CREATE INDEX sim_cards_type_idx ON public.sim_cards(type);
CREATE INDEX sim_cards_line_id_idx ON public.sim_cards(line_id);
CREATE INDEX sim_cards_assigned_to_idx ON public.sim_cards(assigned_to);

-- Auto-update timestamp
CREATE TRIGGER set_sim_cards_updated_at
BEFORE UPDATE ON public.sim_cards
FOR EACH ROW
EXECUTE FUNCTION public.handle_updated_at();

-- =====================================================
-- 9. LINES TABLE
-- =====================================================

CREATE TABLE IF NOT EXISTS public.lines (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    phone_number TEXT UNIQUE NOT NULL,
    status line_status DEFAULT 'initiating' NOT NULL,
    type line_type NOT NULL,
    sim_type sim_type,
    phone_number_status phone_number_status DEFAULT 'available' NOT NULL,

    -- Current active SIM (one-to-one at any time)
    active_sim_id UUID REFERENCES public.sim_cards(id),

    -- Device information
    device_manufacturer TEXT,
    device_model TEXT,

    -- Customer assignment
    customer_id UUID REFERENCES public.customers(id),

    -- Usage tracking
    last_consumption TIMESTAMPTZ,

    -- Metadata
    created_at TIMESTAMPTZ DEFAULT NOW() NOT NULL,
    updated_at TIMESTAMPTZ DEFAULT NOW() NOT NULL
);

-- Indexes
CREATE INDEX lines_phone_number_idx ON public.lines(phone_number);
CREATE INDEX lines_status_idx ON public.lines(status);
CREATE INDEX lines_type_idx ON public.lines(type);
CREATE INDEX lines_customer_id_idx ON public.lines(customer_id);
CREATE INDEX lines_active_sim_id_idx ON public.lines(active_sim_id);

-- Auto-update timestamp
CREATE TRIGGER set_lines_updated_at
BEFORE UPDATE ON public.lines
FOR EACH ROW
EXECUTE FUNCTION public.handle_updated_at();

-- Add foreign key constraint to sim_cards table now that lines exists
ALTER TABLE public.sim_cards
  ADD CONSTRAINT sim_cards_line_id_fkey
  FOREIGN KEY (line_id)
  REFERENCES public.lines(id)
  ON DELETE SET NULL;

-- =====================================================
-- 10. USER PLANS TABLE
-- =====================================================

CREATE TABLE IF NOT EXISTS public.user_plans (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    user_plan_id TEXT UNIQUE,
    plan_type plan_type NOT NULL,
    plan_id UUID REFERENCES public.plans(id) NOT NULL,
    status user_plan_status DEFAULT 'pre_provisioned' NOT NULL,

    -- Customer/Line assignment
    customer_id UUID REFERENCES public.customers(id),
    line_id UUID REFERENCES public.lines(id),

    -- Activation and expiration
    activation_date TIMESTAMPTZ,
    expiration_date TIMESTAMPTZ,
    duration_days INTEGER,

    -- Purchase information
    purchase_date TIMESTAMPTZ,
    final_price DECIMAL(10, 2),
    payment_channel TEXT,
    bill_to_account UUID REFERENCES public.customers(id),
    transaction_reason TEXT,

    -- Usage tracking
    data_usage_mb INTEGER DEFAULT 0,
    voice_usage_minutes INTEGER DEFAULT 0,
    sms_usage_count INTEGER DEFAULT 0,

    -- Subscription reference (FK constraint added after subscriptions table exists)
    subscription_id UUID,

    -- Vendor
    vendor_id UUID REFERENCES public.vendors(id),

    -- Metadata
    created_at TIMESTAMPTZ DEFAULT NOW() NOT NULL,
    updated_at TIMESTAMPTZ DEFAULT NOW() NOT NULL
);

-- Indexes
CREATE INDEX user_plans_plan_id_idx ON public.user_plans(plan_id);
CREATE INDEX user_plans_customer_id_idx ON public.user_plans(customer_id);
CREATE INDEX user_plans_line_id_idx ON public.user_plans(line_id);
CREATE INDEX user_plans_status_idx ON public.user_plans(status);
CREATE INDEX user_plans_subscription_id_idx ON public.user_plans(subscription_id);

-- Auto-update timestamp
CREATE TRIGGER set_user_plans_updated_at
BEFORE UPDATE ON public.user_plans
FOR EACH ROW
EXECUTE FUNCTION public.handle_updated_at();

-- =====================================================
-- 11. SUBSCRIPTIONS TABLE
-- =====================================================

CREATE TABLE IF NOT EXISTS public.subscriptions (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    plan_id UUID REFERENCES public.plans(id) NOT NULL,
    customer_id UUID REFERENCES public.customers(id) NOT NULL,
    line_id UUID REFERENCES public.lines(id),

    -- Start configuration
    start_type subscription_start_type DEFAULT 'asap' NOT NULL,
    start_date TIMESTAMPTZ,

    -- End configuration
    end_type subscription_end_type DEFAULT 'unlimited' NOT NULL,
    end_cycles INTEGER,
    end_date TIMESTAMPTZ,

    -- Renewal configuration
    renewal_type subscription_renewal_type DEFAULT 'automatic' NOT NULL,
    renewal_interval_days INTEGER, -- e.g., 30 for monthly
    renewal_day_of_month INTEGER, -- e.g., 1 for first of month
    next_renewal_date TIMESTAMPTZ,
    grace_period_days INTEGER DEFAULT 0,

    -- Billing
    bill_to UUID REFERENCES public.customers(id),
    transaction_reason TEXT,

    -- Activation
    activation_type subscription_activation_type DEFAULT 'pre_active' NOT NULL,
    activated_at TIMESTAMPTZ,

    -- Status tracking
    is_active BOOLEAN DEFAULT true,
    paused_at TIMESTAMPTZ,
    cancelled_at TIMESTAMPTZ,

    -- Metadata
    created_at TIMESTAMPTZ DEFAULT NOW() NOT NULL,
    updated_at TIMESTAMPTZ DEFAULT NOW() NOT NULL
);

-- Indexes
CREATE INDEX subscriptions_plan_id_idx ON public.subscriptions(plan_id);
CREATE INDEX subscriptions_customer_id_idx ON public.subscriptions(customer_id);
CREATE INDEX subscriptions_line_id_idx ON public.subscriptions(line_id);
CREATE INDEX subscriptions_is_active_idx ON public.subscriptions(is_active);
CREATE INDEX subscriptions_next_renewal_date_idx ON public.subscriptions(next_renewal_date);

-- Auto-update timestamp
CREATE TRIGGER set_subscriptions_updated_at
BEFORE UPDATE ON public.subscriptions
FOR EACH ROW
EXECUTE FUNCTION public.handle_updated_at();

-- Add foreign key constraint to user_plans table now that subscriptions exists
ALTER TABLE public.user_plans
  ADD CONSTRAINT user_plans_subscription_id_fkey
  FOREIGN KEY (subscription_id)
  REFERENCES public.subscriptions(id)
  ON DELETE SET NULL;

-- =====================================================
-- 12. PROMOTIONS TABLE
-- =====================================================

CREATE TABLE IF NOT EXISTS public.promotions (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    status promotion_status DEFAULT 'draft' NOT NULL,
    promotion_name TEXT NOT NULL,
    promotion_description TEXT,
    promotion_code TEXT UNIQUE,

    -- Discount configuration
    discount_type discount_type NOT NULL,
    discount_amount DECIMAL(10, 2) NOT NULL, -- Dollar amount or percentage

    -- Discount duration
    discount_duration discount_duration DEFAULT 'one_time' NOT NULL,
    recurring_months INTEGER, -- NULL for lifetime recurring

    -- Included items/plans (JSONB arrays)
    included_inventory_ids JSONB, -- Array of inventory UUIDs
    included_plan_ids JSONB, -- Array of plan UUIDs

    -- Approval workflow
    approval_required BOOLEAN DEFAULT false,
    approved_by UUID REFERENCES auth.users(id),
    approved_at TIMESTAMPTZ,

    -- Validity period
    valid_from TIMESTAMPTZ,
    valid_until TIMESTAMPTZ,

    -- Metadata
    created_at TIMESTAMPTZ DEFAULT NOW() NOT NULL,
    updated_at TIMESTAMPTZ DEFAULT NOW() NOT NULL
);

-- Indexes
CREATE INDEX promotions_status_idx ON public.promotions(status);
CREATE INDEX promotions_promotion_code_idx ON public.promotions(promotion_code);
CREATE INDEX promotions_valid_from_idx ON public.promotions(valid_from);
CREATE INDEX promotions_valid_until_idx ON public.promotions(valid_until);

-- Auto-update timestamp
CREATE TRIGGER set_promotions_updated_at
BEFORE UPDATE ON public.promotions
FOR EACH ROW
EXECUTE FUNCTION public.handle_updated_at();

-- =====================================================
-- 13. QUOTES TABLE
-- =====================================================

CREATE TABLE IF NOT EXISTS public.quotes (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    quote_number TEXT UNIQUE NOT NULL,
    status quote_status DEFAULT 'draft' NOT NULL,

    -- Customer/Lead reference
    customer_id UUID REFERENCES public.customers(id),
    lead_id UUID REFERENCES public.leads(id),

    -- Pricing
    subtotal DECIMAL(10, 2) DEFAULT 0,
    discount_total DECIMAL(10, 2) DEFAULT 0,
    tax_total DECIMAL(10, 2) DEFAULT 0,
    total DECIMAL(10, 2) DEFAULT 0,

    -- Validity
    expires_at TIMESTAMPTZ NOT NULL,

    -- Acceptance
    accepted_at TIMESTAMPTZ,
    accepted_by UUID REFERENCES auth.users(id),
    declined_at TIMESTAMPTZ,
    declined_reason TEXT,

    -- Notes
    notes TEXT,
    terms TEXT,

    -- Created by
    created_by UUID REFERENCES auth.users(id),

    -- Metadata
    created_at TIMESTAMPTZ DEFAULT NOW() NOT NULL,
    updated_at TIMESTAMPTZ DEFAULT NOW() NOT NULL
);

-- Indexes
CREATE INDEX quotes_quote_number_idx ON public.quotes(quote_number);
CREATE INDEX quotes_status_idx ON public.quotes(status);
CREATE INDEX quotes_customer_id_idx ON public.quotes(customer_id);
CREATE INDEX quotes_lead_id_idx ON public.quotes(lead_id);
CREATE INDEX quotes_expires_at_idx ON public.quotes(expires_at);

-- Auto-update timestamp
CREATE TRIGGER set_quotes_updated_at
BEFORE UPDATE ON public.quotes
FOR EACH ROW
EXECUTE FUNCTION public.handle_updated_at();

-- Function to generate quote number
CREATE OR REPLACE FUNCTION generate_quote_number()
RETURNS TEXT AS $$
DECLARE
    new_quote_number TEXT;
    quote_exists BOOLEAN;
BEGIN
    LOOP
        -- Generate quote number: QT-YYYYMMDD-XXXX
        new_quote_number := 'QT-' || TO_CHAR(NOW(), 'YYYYMMDD') || '-' || LPAD(FLOOR(RANDOM() * 10000)::TEXT, 4, '0');

        -- Check if it already exists
        SELECT EXISTS(SELECT 1 FROM public.quotes WHERE quote_number = new_quote_number) INTO quote_exists;

        -- If unique, return it
        IF NOT quote_exists THEN
            RETURN new_quote_number;
        END IF;
    END LOOP;
END;
$$ LANGUAGE plpgsql;

-- =====================================================
-- 14. QUOTE ITEMS TABLE
-- =====================================================

CREATE TABLE IF NOT EXISTS public.quote_items (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    quote_id UUID REFERENCES public.quotes(id) ON DELETE CASCADE NOT NULL,

    -- Item type (inventory or plan)
    item_type TEXT NOT NULL, -- 'inventory' or 'plan'
    inventory_id UUID REFERENCES public.inventory(id),
    plan_id UUID REFERENCES public.plans(id),

    -- Item details (snapshot at quote time)
    item_name TEXT NOT NULL,
    item_description TEXT,

    -- Pricing
    quantity INTEGER DEFAULT 1 NOT NULL,
    unit_price DECIMAL(10, 2) NOT NULL,
    subtotal DECIMAL(10, 2) NOT NULL,

    -- Metadata
    created_at TIMESTAMPTZ DEFAULT NOW() NOT NULL,

    CHECK (
        (item_type = 'inventory' AND inventory_id IS NOT NULL AND plan_id IS NULL) OR
        (item_type = 'plan' AND plan_id IS NOT NULL AND inventory_id IS NULL)
    )
);

-- Indexes
CREATE INDEX quote_items_quote_id_idx ON public.quote_items(quote_id);
CREATE INDEX quote_items_inventory_id_idx ON public.quote_items(inventory_id);
CREATE INDEX quote_items_plan_id_idx ON public.quote_items(plan_id);

-- =====================================================
-- 15. QUOTE PROMOTIONS TABLE
-- =====================================================

CREATE TABLE IF NOT EXISTS public.quote_promotions (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    quote_id UUID REFERENCES public.quotes(id) ON DELETE CASCADE NOT NULL,
    promotion_id UUID REFERENCES public.promotions(id) NOT NULL,

    -- Discount applied (snapshot at quote time)
    discount_type discount_type NOT NULL,
    discount_amount DECIMAL(10, 2) NOT NULL,

    -- Metadata
    created_at TIMESTAMPTZ DEFAULT NOW() NOT NULL,

    UNIQUE(quote_id, promotion_id)
);

-- Indexes
CREATE INDEX quote_promotions_quote_id_idx ON public.quote_promotions(quote_id);
CREATE INDEX quote_promotions_promotion_id_idx ON public.quote_promotions(promotion_id);

-- =====================================================
-- RLS POLICIES
-- =====================================================

-- Enable RLS on all tables
ALTER TABLE public.customers ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.vendors ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.plans ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.inventory ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.inventory_serials ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.inventory_vendors ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.sim_cards ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.lines ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.user_plans ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.subscriptions ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.promotions ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.quotes ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.quote_items ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.quote_promotions ENABLE ROW LEVEL SECURITY;

-- Staff can view all records (using existing get_current_user_role function)
CREATE POLICY "customers_select_staff" ON public.customers FOR SELECT TO authenticated
USING (public.get_current_user_role() IN ('admin', 'support'));

CREATE POLICY "vendors_select_staff" ON public.vendors FOR SELECT TO authenticated
USING (public.get_current_user_role() IN ('admin', 'support'));

CREATE POLICY "plans_select_staff" ON public.plans FOR SELECT TO authenticated
USING (public.get_current_user_role() IN ('admin', 'support'));

CREATE POLICY "inventory_select_staff" ON public.inventory FOR SELECT TO authenticated
USING (public.get_current_user_role() IN ('admin', 'support'));

CREATE POLICY "inventory_serials_select_staff" ON public.inventory_serials FOR SELECT TO authenticated
USING (public.get_current_user_role() IN ('admin', 'support'));

CREATE POLICY "inventory_vendors_select_staff" ON public.inventory_vendors FOR SELECT TO authenticated
USING (public.get_current_user_role() IN ('admin', 'support'));

CREATE POLICY "sim_cards_select_staff" ON public.sim_cards FOR SELECT TO authenticated
USING (public.get_current_user_role() IN ('admin', 'support'));

CREATE POLICY "lines_select_staff" ON public.lines FOR SELECT TO authenticated
USING (public.get_current_user_role() IN ('admin', 'support'));

CREATE POLICY "user_plans_select_staff" ON public.user_plans FOR SELECT TO authenticated
USING (public.get_current_user_role() IN ('admin', 'support'));

CREATE POLICY "subscriptions_select_staff" ON public.subscriptions FOR SELECT TO authenticated
USING (public.get_current_user_role() IN ('admin', 'support'));

CREATE POLICY "promotions_select_staff" ON public.promotions FOR SELECT TO authenticated
USING (public.get_current_user_role() IN ('admin', 'support'));

CREATE POLICY "quotes_select_staff" ON public.quotes FOR SELECT TO authenticated
USING (public.get_current_user_role() IN ('admin', 'support'));

CREATE POLICY "quote_items_select_staff" ON public.quote_items FOR SELECT TO authenticated
USING (public.get_current_user_role() IN ('admin', 'support'));

CREATE POLICY "quote_promotions_select_staff" ON public.quote_promotions FOR SELECT TO authenticated
USING (public.get_current_user_role() IN ('admin', 'support'));

-- Insert/Update/Delete policies for staff
CREATE POLICY "customers_insert_staff" ON public.customers FOR INSERT TO authenticated
WITH CHECK (public.get_current_user_role() IN ('admin', 'support'));

CREATE POLICY "customers_update_staff" ON public.customers FOR UPDATE TO authenticated
USING (public.get_current_user_role() IN ('admin', 'support'));

CREATE POLICY "customers_delete_admin" ON public.customers FOR DELETE TO authenticated
USING (public.get_current_user_role() = 'admin');

-- Similar policies for other tables...
-- (Abbreviated for brevity - apply same pattern to all tables)

-- =====================================================
-- HELPER FUNCTIONS
-- =====================================================

-- Function to convert lead to customer
CREATE OR REPLACE FUNCTION convert_lead_to_customer(lead_uuid UUID)
RETURNS UUID AS $$
DECLARE
    new_customer_id UUID;
    lead_record RECORD;
BEGIN
    -- Get lead data
    SELECT * INTO lead_record FROM public.leads WHERE id = lead_uuid;

    IF NOT FOUND THEN
        RAISE EXCEPTION 'Lead not found';
    END IF;

    IF lead_record.customer_id IS NOT NULL THEN
        RAISE EXCEPTION 'Lead already converted to customer';
    END IF;

    -- Create customer record
    INSERT INTO public.customers (
        account_number,
        type,
        company_name,
        first_name,
        middle_initial,
        last_name,
        sex,
        date_of_birth,
        email,
        phone,
        billing_address_line1,
        billing_address_line2,
        billing_city,
        billing_state,
        billing_zip,
        billing_country,
        shipping_address_line1,
        shipping_address_line2,
        shipping_city,
        shipping_state,
        shipping_zip,
        shipping_country,
        source,
        details
    ) VALUES (
        generate_account_number(),
        lead_record.type,
        lead_record.company_name,
        lead_record.first_name,
        lead_record.middle_initial,
        lead_record.last_name,
        lead_record.sex,
        lead_record.date_of_birth,
        lead_record.email,
        lead_record.phone,
        lead_record.billing_address_line1,
        lead_record.billing_address_line2,
        lead_record.billing_city,
        lead_record.billing_state,
        lead_record.billing_zip,
        lead_record.billing_country,
        lead_record.shipping_address_line1,
        lead_record.shipping_address_line2,
        lead_record.shipping_city,
        lead_record.shipping_state,
        lead_record.shipping_zip,
        lead_record.shipping_country,
        lead_record.source,
        lead_record.details
    ) RETURNING id INTO new_customer_id;

    -- Update lead with customer reference
    UPDATE public.leads
    SET customer_id = new_customer_id,
        converted_at = NOW()
    WHERE id = lead_uuid;

    RETURN new_customer_id;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Grant execute permission
GRANT EXECUTE ON FUNCTION convert_lead_to_customer(UUID) TO authenticated;

-- =====================================================
-- SEED DATA (Optional - for testing)
-- =====================================================

-- Insert sample plan
INSERT INTO public.plans (
    plan_name,
    description,
    plan_status,
    voice_minutes,
    sms_messages,
    general_data_mb,
    prices,
    network_name
) VALUES (
    'Basic Plan',
    'Unlimited talk, text, and 5GB data',
    'active',
    NULL, -- unlimited
    NULL, -- unlimited
    5120, -- 5GB in MB
    '{"retail": 29.99, "wholesale": 24.99}'::JSONB,
    'Nationwide'
) ON CONFLICT DO NOTHING;
