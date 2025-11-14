-- Fix store_queue.assisted_by foreign key to reference profiles instead of auth.users
-- This allows proper JOIN with profiles table in queries

-- Drop the old foreign key constraint
ALTER TABLE public.store_queue
DROP CONSTRAINT IF EXISTS store_queue_assisted_by_fkey;

-- Add new foreign key constraint to profiles
ALTER TABLE public.store_queue
ADD CONSTRAINT store_queue_assisted_by_fkey
FOREIGN KEY (assisted_by) REFERENCES public.profiles(id);
