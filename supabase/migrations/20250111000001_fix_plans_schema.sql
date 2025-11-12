-- Fix the plans table to allow NULL for unlimited plans
-- Run this BEFORE the seed data

ALTER TABLE public.plans
  ALTER COLUMN data_gb DROP NOT NULL;
