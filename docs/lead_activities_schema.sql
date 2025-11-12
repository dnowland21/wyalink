-- =====================================================
-- LEAD ACTIVITIES TABLE
-- =====================================================
-- Tracks all interactions and communications with leads

-- Activity type enum
CREATE TYPE activity_type AS ENUM ('call', 'email', 'note', 'status_change', 'assignment');

-- Call outcome enum
CREATE TYPE call_outcome AS ENUM ('connected', 'voicemail', 'no_answer', 'busy', 'wrong_number');

-- Lead activities table
CREATE TABLE public.lead_activities (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    lead_id UUID REFERENCES public.leads(id) ON DELETE CASCADE NOT NULL,
    user_id UUID REFERENCES auth.users(id) NOT NULL,

    -- Activity type and metadata
    type activity_type NOT NULL,
    subject TEXT,
    content TEXT,

    -- Call-specific fields
    call_duration INTEGER, -- in seconds
    call_outcome call_outcome,

    -- Email-specific fields
    email_to TEXT,
    email_cc TEXT,
    email_bcc TEXT,
    email_sent BOOLEAN DEFAULT false,
    email_sent_at TIMESTAMPTZ,

    -- Metadata
    created_at TIMESTAMPTZ DEFAULT NOW() NOT NULL,
    updated_at TIMESTAMPTZ DEFAULT NOW() NOT NULL
);

-- Indexes for performance
CREATE INDEX lead_activities_lead_id_idx ON public.lead_activities(lead_id);
CREATE INDEX lead_activities_user_id_idx ON public.lead_activities(user_id);
CREATE INDEX lead_activities_type_idx ON public.lead_activities(type);
CREATE INDEX lead_activities_created_at_idx ON public.lead_activities(created_at DESC);

-- Enable Row Level Security
ALTER TABLE public.lead_activities ENABLE ROW LEVEL SECURITY;

-- RLS Policies: Only staff can view activities
CREATE POLICY "lead_activities_select_staff"
ON public.lead_activities FOR SELECT
TO authenticated
USING (
  public.get_current_user_role() IN ('admin', 'support')
);

-- RLS Policies: Only staff can insert activities
CREATE POLICY "lead_activities_insert_staff"
ON public.lead_activities FOR INSERT
TO authenticated
WITH CHECK (
  public.get_current_user_role() IN ('admin', 'support')
);

-- RLS Policies: Only staff can update activities
CREATE POLICY "lead_activities_update_staff"
ON public.lead_activities FOR UPDATE
TO authenticated
USING (
  public.get_current_user_role() IN ('admin', 'support')
)
WITH CHECK (
  public.get_current_user_role() IN ('admin', 'support')
);

-- RLS Policies: Only staff can delete activities
CREATE POLICY "lead_activities_delete_staff"
ON public.lead_activities FOR DELETE
TO authenticated
USING (
  public.get_current_user_role() IN ('admin', 'support')
);

-- Auto-update updated_at timestamp trigger
CREATE TRIGGER set_updated_at
BEFORE UPDATE ON public.lead_activities
FOR EACH ROW
EXECUTE FUNCTION public.handle_updated_at();

-- =====================================================
-- HELPER VIEW: Activities with user details
-- =====================================================
CREATE VIEW public.lead_activities_with_users AS
SELECT
    la.*,
    p.first_name as user_first_name,
    p.last_name as user_last_name,
    u.email as user_email
FROM public.lead_activities la
JOIN auth.users u ON la.user_id = u.id
LEFT JOIN public.profiles p ON la.user_id = p.id;

-- Grant access to the view
GRANT SELECT ON public.lead_activities_with_users TO authenticated;
