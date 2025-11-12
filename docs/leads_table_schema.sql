-- =====================================================
-- LEADS TABLE SCHEMA
-- =====================================================
-- Table for managing sales leads in LinkOS CRM

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

-- Indexes for better query performance
CREATE INDEX leads_email_idx ON public.leads(email);
CREATE INDEX leads_status_idx ON public.leads(status);
CREATE INDEX leads_assigned_to_idx ON public.leads(assigned_to);

-- Enable Row Level Security
ALTER TABLE public.leads ENABLE ROW LEVEL SECURITY;

-- Auto-update updated_at timestamp trigger
CREATE TRIGGER set_updated_at
BEFORE UPDATE ON public.leads
FOR EACH ROW
EXECUTE FUNCTION public.handle_updated_at();

-- Lead status enum (if not already created)
-- CREATE TYPE lead_status AS ENUM ('new', 'contacted', 'qualified', 'converted', 'lost');
