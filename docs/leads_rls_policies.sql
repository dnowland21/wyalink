-- =====================================================
-- LEADS TABLE RLS POLICIES
-- =====================================================
-- Row Level Security policies for the leads table
-- This prevents infinite recursion by using a SECURITY DEFINER function

-- Create a SECURITY DEFINER function to safely get user role
-- This function bypasses RLS and prevents infinite recursion
CREATE OR REPLACE FUNCTION public.get_current_user_role()
RETURNS user_role AS $$
BEGIN
  RETURN (
    SELECT role
    FROM public.profiles
    WHERE id = auth.uid()
    LIMIT 1
  );
END;
$$ LANGUAGE plpgsql SECURITY DEFINER STABLE;

-- Grant execute permission on the function to authenticated users
GRANT EXECUTE ON FUNCTION public.get_current_user_role() TO authenticated;

-- Drop existing leads policies (if any)
DROP POLICY IF EXISTS "Staff can view leads" ON public.leads;
DROP POLICY IF EXISTS "Staff can manage leads" ON public.leads;
DROP POLICY IF EXISTS "leads_select_staff" ON public.leads;
DROP POLICY IF EXISTS "leads_insert_staff" ON public.leads;
DROP POLICY IF EXISTS "leads_update_staff" ON public.leads;
DROP POLICY IF EXISTS "leads_delete_staff" ON public.leads;

-- =====================================================
-- CREATE NEW POLICIES
-- =====================================================

-- Policy: Only staff (admin and support) can view leads
CREATE POLICY "leads_select_staff"
ON public.leads FOR SELECT
TO authenticated
USING (
  public.get_current_user_role() IN ('admin', 'support')
);

-- Policy: Only staff can insert leads
CREATE POLICY "leads_insert_staff"
ON public.leads FOR INSERT
TO authenticated
WITH CHECK (
  public.get_current_user_role() IN ('admin', 'support')
);

-- Policy: Only staff can update leads
CREATE POLICY "leads_update_staff"
ON public.leads FOR UPDATE
TO authenticated
USING (
  public.get_current_user_role() IN ('admin', 'support')
)
WITH CHECK (
  public.get_current_user_role() IN ('admin', 'support')
);

-- Policy: Only staff can delete leads
CREATE POLICY "leads_delete_staff"
ON public.leads FOR DELETE
TO authenticated
USING (
  public.get_current_user_role() IN ('admin', 'support')
);

-- =====================================================
-- NOTES
-- =====================================================
--
-- Why SECURITY DEFINER?
-- The SECURITY DEFINER attribute on get_current_user_role() means
-- the function executes with the privileges of the user who defined
-- it (bypassing RLS). This breaks the potential recursion cycle that
-- occurs when RLS policies query the same table they're protecting.
--
-- Without this, checking user roles would trigger:
-- 1. RLS check on leads table
-- 2. Query profiles table to get role
-- 3. RLS check on profiles table (checks role again)
-- 4. Infinite loop!
--
-- The SECURITY DEFINER function safely queries profiles without
-- triggering RLS recursion.
--
