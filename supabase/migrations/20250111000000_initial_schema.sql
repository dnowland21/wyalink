-- WyaLink Database Schema
-- Initial migration for customer management, plans, orders, and leads

-- Enable necessary extensions
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";
CREATE EXTENSION IF NOT EXISTS "pgcrypto";

-- Create custom types
CREATE TYPE user_role AS ENUM ('customer', 'support', 'admin');
CREATE TYPE order_status AS ENUM ('pending', 'processing', 'active', 'suspended', 'cancelled');
CREATE TYPE lead_status AS ENUM ('new', 'contacted', 'qualified', 'converted', 'lost');
CREATE TYPE payment_status AS ENUM ('pending', 'paid', 'failed', 'refunded');

-- =====================================================
-- PROFILES TABLE (extends auth.users)
-- =====================================================
CREATE TABLE public.profiles (
    id UUID PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
    role user_role DEFAULT 'customer' NOT NULL,
    first_name TEXT,
    last_name TEXT,
    phone TEXT,
    address JSONB,
    created_at TIMESTAMPTZ DEFAULT NOW() NOT NULL,
    updated_at TIMESTAMPTZ DEFAULT NOW() NOT NULL
);

-- Enable RLS
ALTER TABLE public.profiles ENABLE ROW LEVEL SECURITY;

-- Policies: Users can read their own profile
CREATE POLICY "Users can view own profile"
    ON public.profiles FOR SELECT
    USING (auth.uid() = id);

-- Policies: Users can update their own profile
CREATE POLICY "Users can update own profile"
    ON public.profiles FOR UPDATE
    USING (auth.uid() = id);

-- Policies: Admins can view all profiles
CREATE POLICY "Admins can view all profiles"
    ON public.profiles FOR SELECT
    USING (
        EXISTS (
            SELECT 1 FROM public.profiles
            WHERE id = auth.uid() AND role = 'admin'
        )
    );

-- =====================================================
-- PLANS TABLE
-- =====================================================
CREATE TABLE public.plans (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    name TEXT NOT NULL,
    description TEXT,
    price_monthly DECIMAL(10,2) NOT NULL,
    data_gb INTEGER NOT NULL,
    talk_minutes INTEGER DEFAULT NULL, -- NULL = unlimited
    text_messages INTEGER DEFAULT NULL, -- NULL = unlimited
    features JSONB DEFAULT '[]'::jsonb,
    is_active BOOLEAN DEFAULT true NOT NULL,
    sort_order INTEGER DEFAULT 0,
    created_at TIMESTAMPTZ DEFAULT NOW() NOT NULL,
    updated_at TIMESTAMPTZ DEFAULT NOW() NOT NULL
);

-- Enable RLS
ALTER TABLE public.plans ENABLE ROW LEVEL SECURITY;

-- Policies: Everyone can view active plans
CREATE POLICY "Anyone can view active plans"
    ON public.plans FOR SELECT
    USING (is_active = true);

-- Policies: Only admins can modify plans
CREATE POLICY "Admins can manage plans"
    ON public.plans FOR ALL
    USING (
        EXISTS (
            SELECT 1 FROM public.profiles
            WHERE id = auth.uid() AND role = 'admin'
        )
    );

-- =====================================================
-- ORDERS TABLE
-- =====================================================
CREATE TABLE public.orders (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE NOT NULL,
    plan_id UUID REFERENCES public.plans(id) NOT NULL,
    status order_status DEFAULT 'pending' NOT NULL,

    -- SIM and service details
    sim_iccid TEXT,
    phone_number TEXT,
    imei TEXT,

    -- Activation and billing
    activation_date TIMESTAMPTZ,
    billing_start_date TIMESTAMPTZ,
    next_billing_date TIMESTAMPTZ,

    -- Telco provider reference
    telco_order_id TEXT,
    telco_sim_id TEXT,

    -- Metadata
    notes TEXT,
    created_at TIMESTAMPTZ DEFAULT NOW() NOT NULL,
    updated_at TIMESTAMPTZ DEFAULT NOW() NOT NULL
);

-- Indexes
CREATE INDEX orders_user_id_idx ON public.orders(user_id);
CREATE INDEX orders_status_idx ON public.orders(status);
CREATE INDEX orders_sim_iccid_idx ON public.orders(sim_iccid);
CREATE INDEX orders_phone_number_idx ON public.orders(phone_number);

-- Enable RLS
ALTER TABLE public.orders ENABLE ROW LEVEL SECURITY;

-- Policies: Users can view their own orders
CREATE POLICY "Users can view own orders"
    ON public.orders FOR SELECT
    USING (auth.uid() = user_id);

-- Policies: Admins can view all orders
CREATE POLICY "Admins can view all orders"
    ON public.orders FOR SELECT
    USING (
        EXISTS (
            SELECT 1 FROM public.profiles
            WHERE id = auth.uid() AND role = 'admin'
        )
    );

-- Policies: Admins can manage orders
CREATE POLICY "Admins can manage orders"
    ON public.orders FOR ALL
    USING (
        EXISTS (
            SELECT 1 FROM public.profiles
            WHERE id = auth.uid() AND role = 'admin'
        )
    );

-- =====================================================
-- PAYMENTS TABLE
-- =====================================================
CREATE TABLE public.payments (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    order_id UUID REFERENCES public.orders(id) ON DELETE CASCADE NOT NULL,
    user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE NOT NULL,

    amount DECIMAL(10,2) NOT NULL,
    status payment_status DEFAULT 'pending' NOT NULL,

    -- Payment provider details
    stripe_payment_intent_id TEXT,
    stripe_invoice_id TEXT,

    -- Metadata
    description TEXT,
    paid_at TIMESTAMPTZ,
    failed_at TIMESTAMPTZ,
    failure_reason TEXT,

    created_at TIMESTAMPTZ DEFAULT NOW() NOT NULL,
    updated_at TIMESTAMPTZ DEFAULT NOW() NOT NULL
);

-- Indexes
CREATE INDEX payments_user_id_idx ON public.payments(user_id);
CREATE INDEX payments_order_id_idx ON public.payments(order_id);
CREATE INDEX payments_status_idx ON public.payments(status);

-- Enable RLS
ALTER TABLE public.payments ENABLE ROW LEVEL SECURITY;

-- Policies: Users can view their own payments
CREATE POLICY "Users can view own payments"
    ON public.payments FOR SELECT
    USING (auth.uid() = user_id);

-- Policies: Admins can view all payments
CREATE POLICY "Admins can view all payments"
    ON public.payments FOR SELECT
    USING (
        EXISTS (
            SELECT 1 FROM public.profiles
            WHERE id = auth.uid() AND role = 'admin'
        )
    );

-- =====================================================
-- USAGE RECORDS TABLE
-- =====================================================
CREATE TABLE public.usage_records (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    order_id UUID REFERENCES public.orders(id) ON DELETE CASCADE NOT NULL,

    -- Usage data
    data_used_mb BIGINT DEFAULT 0 NOT NULL,
    talk_minutes_used INTEGER DEFAULT 0 NOT NULL,
    text_messages_sent INTEGER DEFAULT 0 NOT NULL,

    -- Billing period
    period_start TIMESTAMPTZ NOT NULL,
    period_end TIMESTAMPTZ NOT NULL,

    -- Telco provider sync
    last_synced_at TIMESTAMPTZ,

    created_at TIMESTAMPTZ DEFAULT NOW() NOT NULL,
    updated_at TIMESTAMPTZ DEFAULT NOW() NOT NULL
);

-- Indexes
CREATE INDEX usage_records_order_id_idx ON public.usage_records(order_id);
CREATE INDEX usage_records_period_idx ON public.usage_records(period_start, period_end);

-- Enable RLS
ALTER TABLE public.usage_records ENABLE ROW LEVEL SECURITY;

-- Policies: Users can view usage for their orders
CREATE POLICY "Users can view own usage"
    ON public.usage_records FOR SELECT
    USING (
        EXISTS (
            SELECT 1 FROM public.orders
            WHERE orders.id = usage_records.order_id
            AND orders.user_id = auth.uid()
        )
    );

-- Policies: Admins can view all usage
CREATE POLICY "Admins can view all usage"
    ON public.usage_records FOR ALL
    USING (
        EXISTS (
            SELECT 1 FROM public.profiles
            WHERE id = auth.uid() AND role = 'admin'
        )
    );

-- =====================================================
-- LEADS TABLE (for LinkOS CRM)
-- =====================================================
CREATE TABLE public.leads (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    email TEXT NOT NULL,
    first_name TEXT,
    last_name TEXT,
    phone TEXT,
    company TEXT,

    status lead_status DEFAULT 'new' NOT NULL,
    source TEXT, -- e.g., 'website', 'referral', 'social'

    -- Interest details
    interested_plan_id UUID REFERENCES public.plans(id),
    notes TEXT,

    -- Assignment
    assigned_to UUID REFERENCES auth.users(id),

    -- Conversion tracking
    converted_to_user_id UUID REFERENCES auth.users(id),
    converted_at TIMESTAMPTZ,

    created_at TIMESTAMPTZ DEFAULT NOW() NOT NULL,
    updated_at TIMESTAMPTZ DEFAULT NOW() NOT NULL
);

-- Indexes
CREATE INDEX leads_email_idx ON public.leads(email);
CREATE INDEX leads_status_idx ON public.leads(status);
CREATE INDEX leads_assigned_to_idx ON public.leads(assigned_to);

-- Enable RLS
ALTER TABLE public.leads ENABLE ROW LEVEL SECURITY;

-- Policies: Only staff can view leads
CREATE POLICY "Staff can view leads"
    ON public.leads FOR SELECT
    USING (
        EXISTS (
            SELECT 1 FROM public.profiles
            WHERE id = auth.uid() AND role IN ('admin', 'support')
        )
    );

-- Policies: Only staff can manage leads
CREATE POLICY "Staff can manage leads"
    ON public.leads FOR ALL
    USING (
        EXISTS (
            SELECT 1 FROM public.profiles
            WHERE id = auth.uid() AND role IN ('admin', 'support')
        )
    );

-- =====================================================
-- SUPPORT TICKETS TABLE
-- =====================================================
CREATE TABLE public.support_tickets (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE NOT NULL,
    order_id UUID REFERENCES public.orders(id),

    subject TEXT NOT NULL,
    description TEXT NOT NULL,
    status TEXT DEFAULT 'open' NOT NULL, -- open, in_progress, resolved, closed
    priority TEXT DEFAULT 'normal' NOT NULL, -- low, normal, high, urgent

    -- Assignment
    assigned_to UUID REFERENCES auth.users(id),

    -- Resolution
    resolved_at TIMESTAMPTZ,
    resolved_by UUID REFERENCES auth.users(id),
    resolution_notes TEXT,

    created_at TIMESTAMPTZ DEFAULT NOW() NOT NULL,
    updated_at TIMESTAMPTZ DEFAULT NOW() NOT NULL
);

-- Indexes
CREATE INDEX support_tickets_user_id_idx ON public.support_tickets(user_id);
CREATE INDEX support_tickets_status_idx ON public.support_tickets(status);
CREATE INDEX support_tickets_assigned_to_idx ON public.support_tickets(assigned_to);

-- Enable RLS
ALTER TABLE public.support_tickets ENABLE ROW LEVEL SECURITY;

-- Policies: Users can view their own tickets
CREATE POLICY "Users can view own tickets"
    ON public.support_tickets FOR SELECT
    USING (auth.uid() = user_id);

-- Policies: Users can create tickets
CREATE POLICY "Users can create tickets"
    ON public.support_tickets FOR INSERT
    WITH CHECK (auth.uid() = user_id);

-- Policies: Staff can view all tickets
CREATE POLICY "Staff can view all tickets"
    ON public.support_tickets FOR SELECT
    USING (
        EXISTS (
            SELECT 1 FROM public.profiles
            WHERE id = auth.uid() AND role IN ('admin', 'support')
        )
    );

-- Policies: Staff can manage tickets
CREATE POLICY "Staff can manage tickets"
    ON public.support_tickets FOR ALL
    USING (
        EXISTS (
            SELECT 1 FROM public.profiles
            WHERE id = auth.uid() AND role IN ('admin', 'support')
        )
    );

-- =====================================================
-- FUNCTIONS
-- =====================================================

-- Function: Auto-create profile on signup
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS TRIGGER AS $$
BEGIN
    INSERT INTO public.profiles (id, role, created_at, updated_at)
    VALUES (NEW.id, 'customer', NOW(), NOW());
    RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Trigger: Create profile on new auth user
CREATE TRIGGER on_auth_user_created
    AFTER INSERT ON auth.users
    FOR EACH ROW
    EXECUTE FUNCTION public.handle_new_user();

-- Function: Update updated_at timestamp
CREATE OR REPLACE FUNCTION public.handle_updated_at()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = NOW();
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Triggers: Auto-update updated_at on all tables
CREATE TRIGGER set_updated_at BEFORE UPDATE ON public.profiles FOR EACH ROW EXECUTE FUNCTION public.handle_updated_at();
CREATE TRIGGER set_updated_at BEFORE UPDATE ON public.plans FOR EACH ROW EXECUTE FUNCTION public.handle_updated_at();
CREATE TRIGGER set_updated_at BEFORE UPDATE ON public.orders FOR EACH ROW EXECUTE FUNCTION public.handle_updated_at();
CREATE TRIGGER set_updated_at BEFORE UPDATE ON public.payments FOR EACH ROW EXECUTE FUNCTION public.handle_updated_at();
CREATE TRIGGER set_updated_at BEFORE UPDATE ON public.usage_records FOR EACH ROW EXECUTE FUNCTION public.handle_updated_at();
CREATE TRIGGER set_updated_at BEFORE UPDATE ON public.leads FOR EACH ROW EXECUTE FUNCTION public.handle_updated_at();
CREATE TRIGGER set_updated_at BEFORE UPDATE ON public.support_tickets FOR EACH ROW EXECUTE FUNCTION public.handle_updated_at();

-- =====================================================
-- SEED DATA: Sample Plans
-- =====================================================
INSERT INTO public.plans (name, description, price_monthly, data_gb, talk_minutes, text_messages, features, sort_order) VALUES
('Starter', 'Perfect for light users', 45.00, 5, NULL, NULL,
 '["Unlimited talk & text", "5GB high-speed data", "Mobile hotspot", "Free shipping"]'::jsonb, 1),

('Plus', 'Great for everyday use', 60.00, 15, NULL, NULL,
 '["Unlimited talk & text", "15GB high-speed data", "Mobile hotspot", "HD streaming", "Free shipping"]'::jsonb, 2),

('Premium', 'For heavy data users', 75.00, 30, NULL, NULL,
 '["Unlimited talk & text", "30GB high-speed data", "Mobile hotspot", "4K streaming", "Priority support", "Free shipping"]'::jsonb, 3),

('Unlimited', 'True unlimited everything', 90.00, NULL, NULL, NULL,
 '["Unlimited everything", "Truly unlimited 5G data", "50GB mobile hotspot", "4K streaming", "Priority support", "International calls", "Free shipping"]'::jsonb, 4);

-- =====================================================
-- VIEWS FOR ANALYTICS
-- =====================================================

-- View: Active customers count
CREATE VIEW public.analytics_active_customers AS
SELECT COUNT(DISTINCT user_id) as count
FROM public.orders
WHERE status = 'active';

-- View: Revenue by plan
CREATE VIEW public.analytics_revenue_by_plan AS
SELECT
    p.name as plan_name,
    COUNT(o.id) as active_subscriptions,
    SUM(p.price_monthly) as monthly_revenue
FROM public.orders o
JOIN public.plans p ON o.plan_id = p.id
WHERE o.status = 'active'
GROUP BY p.id, p.name;

-- Grant access to views
GRANT SELECT ON public.analytics_active_customers TO authenticated;
GRANT SELECT ON public.analytics_revenue_by_plan TO authenticated;
