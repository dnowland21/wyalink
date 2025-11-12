-- Debug script to see what's actually in the database

-- 1. Check current RLS status
SELECT schemaname, tablename, rowsecurity
FROM pg_tables
WHERE tablename = 'profiles';

-- 2. List all policies on profiles table
SELECT schemaname, tablename, policyname, permissive, roles, cmd, qual, with_check
FROM pg_policies
WHERE tablename = 'profiles';

-- 3. Check for triggers on profiles table
SELECT tgname, tgenabled, tgtype, proname
FROM pg_trigger
JOIN pg_proc ON pg_trigger.tgfoid = pg_proc.oid
WHERE tgrelid = 'public.profiles'::regclass;

-- 4. Check for any functions that reference profiles
SELECT p.proname, p.prosrc
FROM pg_proc p
WHERE p.prosrc ILIKE '%profiles%'
  AND p.pronamespace = 'public'::regnamespace;
