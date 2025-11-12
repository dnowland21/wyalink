-- =====================================================
-- SETTINGS TABLE
-- =====================================================
-- Stores application-wide configuration settings

CREATE TABLE public.settings (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    key TEXT UNIQUE NOT NULL,
    value JSONB NOT NULL,
    category TEXT NOT NULL, -- e.g., 'email', 'general', 'notifications'
    description TEXT,
    is_encrypted BOOLEAN DEFAULT false,
    updated_by UUID REFERENCES auth.users(id),
    created_at TIMESTAMPTZ DEFAULT NOW() NOT NULL,
    updated_at TIMESTAMPTZ DEFAULT NOW() NOT NULL
);

-- Indexes
CREATE INDEX settings_key_idx ON public.settings(key);
CREATE INDEX settings_category_idx ON public.settings(category);

-- Enable Row Level Security
ALTER TABLE public.settings ENABLE ROW LEVEL SECURITY;

-- RLS Policies: Only admins can view settings
CREATE POLICY "settings_select_admin"
ON public.settings FOR SELECT
TO authenticated
USING (
  public.get_current_user_role() = 'admin'
);

-- RLS Policies: Only admins can insert settings
CREATE POLICY "settings_insert_admin"
ON public.settings FOR INSERT
TO authenticated
WITH CHECK (
  public.get_current_user_role() = 'admin'
);

-- RLS Policies: Only admins can update settings
CREATE POLICY "settings_update_admin"
ON public.settings FOR UPDATE
TO authenticated
USING (
  public.get_current_user_role() = 'admin'
)
WITH CHECK (
  public.get_current_user_role() = 'admin'
);

-- RLS Policies: Only admins can delete settings
CREATE POLICY "settings_delete_admin"
ON public.settings FOR DELETE
TO authenticated
USING (
  public.get_current_user_role() = 'admin'
);

-- Auto-update updated_at timestamp trigger
CREATE TRIGGER set_updated_at
BEFORE UPDATE ON public.settings
FOR EACH ROW
EXECUTE FUNCTION public.handle_updated_at();

-- =====================================================
-- SEED DEFAULT SETTINGS
-- =====================================================

-- Email Settings (Office 365 / Outlook)
INSERT INTO public.settings (key, value, category, description) VALUES
(
    'email.smtp.host',
    '"smtp.office365.com"',
    'email',
    'SMTP server hostname for Office 365'
),
(
    'email.smtp.port',
    '587',
    'email',
    'SMTP server port (587 for TLS, 465 for SSL)'
),
(
    'email.smtp.secure',
    'false',
    'email',
    'Use SSL (true) or TLS (false)'
),
(
    'email.smtp.username',
    '""',
    'email',
    'Office 365 email address for authentication'
),
(
    'email.smtp.password',
    '""',
    'email',
    'Office 365 password or app password'
),
(
    'email.from.name',
    '"WyaLink Support"',
    'email',
    'Default sender name for outgoing emails'
),
(
    'email.from.address',
    '""',
    'email',
    'Default sender email address'
),
(
    'email.enabled',
    'false',
    'email',
    'Enable or disable email sending functionality'
);

-- =====================================================
-- HELPER FUNCTIONS
-- =====================================================

-- Function to get a setting value by key
CREATE OR REPLACE FUNCTION public.get_setting(setting_key TEXT)
RETURNS JSONB AS $$
BEGIN
  RETURN (
    SELECT value
    FROM public.settings
    WHERE key = setting_key
    LIMIT 1
  );
END;
$$ LANGUAGE plpgsql SECURITY DEFINER STABLE;

-- Grant execute permission
GRANT EXECUTE ON FUNCTION public.get_setting(TEXT) TO authenticated;

-- Function to update a setting value
CREATE OR REPLACE FUNCTION public.update_setting(
  setting_key TEXT,
  setting_value JSONB,
  user_id UUID DEFAULT auth.uid()
)
RETURNS BOOLEAN AS $$
BEGIN
  UPDATE public.settings
  SET value = setting_value,
      updated_by = user_id,
      updated_at = NOW()
  WHERE key = setting_key;

  RETURN FOUND;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Grant execute permission
GRANT EXECUTE ON FUNCTION public.update_setting(TEXT, JSONB, UUID) TO authenticated;
