-- Temporarily disable RLS on profiles table to fix infinite recursion
-- We'll re-enable it later with proper policies

-- Drop ALL policies
DROP POLICY IF EXISTS "Users can view their own profile" ON public.profiles;
DROP POLICY IF EXISTS "Users can update their own profile" ON public.profiles;
DROP POLICY IF EXISTS "Staff can view all profiles" ON public.profiles;
DROP POLICY IF EXISTS "Staff can update all profiles" ON public.profiles;
DROP POLICY IF EXISTS "Users can view own profile" ON public.profiles;
DROP POLICY IF EXISTS "Users can update own profile" ON public.profiles;
DROP POLICY IF EXISTS "Users can insert own profile" ON public.profiles;
DROP POLICY IF EXISTS "Admin can update all profiles" ON public.profiles;
DROP POLICY IF EXISTS "Enable read access for own profile" ON public.profiles;
DROP POLICY IF EXISTS "Enable update for own profile" ON public.profiles;
DROP POLICY IF EXISTS "Enable insert for own profile" ON public.profiles;
DROP POLICY IF EXISTS "Anyone can read user roles" ON public.user_roles;

-- Clean up helper tables/functions
DROP TRIGGER IF EXISTS sync_user_role_trigger ON public.profiles;
DROP FUNCTION IF EXISTS public.sync_user_role();
DROP FUNCTION IF EXISTS public.get_user_role();
DROP TABLE IF EXISTS public.user_roles;

-- Disable RLS entirely on profiles table
ALTER TABLE public.profiles DISABLE ROW LEVEL SECURITY;
