-- Fix infinite recursion in profiles RLS policies
-- SIMPLEST APPROACH: Only allow users to manage their own profiles
-- Staff/admin access will be handled via service role or backend functions

-- Drop ALL existing policies to start fresh
DROP POLICY IF EXISTS "Users can view their own profile" ON public.profiles;
DROP POLICY IF EXISTS "Users can update their own profile" ON public.profiles;
DROP POLICY IF EXISTS "Staff can view all profiles" ON public.profiles;
DROP POLICY IF EXISTS "Staff can update all profiles" ON public.profiles;
DROP POLICY IF EXISTS "Users can view own profile" ON public.profiles;
DROP POLICY IF EXISTS "Users can update own profile" ON public.profiles;
DROP POLICY IF EXISTS "Users can insert own profile" ON public.profiles;
DROP POLICY IF EXISTS "Admin can update all profiles" ON public.profiles;
DROP POLICY IF EXISTS "Anyone can read user roles" ON public.user_roles;

-- Clean up if needed
DROP TRIGGER IF EXISTS sync_user_role_trigger ON public.profiles;
DROP FUNCTION IF EXISTS public.sync_user_role();
DROP FUNCTION IF EXISTS public.get_user_role();
DROP TABLE IF EXISTS public.user_roles;

-- Create ONLY the simplest policies - no staff policies
-- This avoids ALL circular references

CREATE POLICY "Enable read access for own profile"
ON public.profiles FOR SELECT
TO authenticated
USING (auth.uid() = id);

CREATE POLICY "Enable update for own profile"
ON public.profiles FOR UPDATE
TO authenticated
USING (auth.uid() = id)
WITH CHECK (auth.uid() = id);

CREATE POLICY "Enable insert for own profile"
ON public.profiles FOR INSERT
TO authenticated
WITH CHECK (auth.uid() = id);
