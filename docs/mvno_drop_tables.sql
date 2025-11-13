-- =====================================================
-- DROP MVNO TABLES
-- Run this BEFORE running mvno_complete_schema.sql
-- =====================================================

-- WARNING: This will delete all data in these tables!
-- Only run this if you want to reset the MVNO schema completely.

-- Drop tables in reverse dependency order
DROP TABLE IF EXISTS public.quote_promotions CASCADE;
DROP TABLE IF EXISTS public.quote_items CASCADE;
DROP TABLE IF EXISTS public.quotes CASCADE;
DROP TABLE IF EXISTS public.promotions CASCADE;
DROP TABLE IF EXISTS public.subscriptions CASCADE;
DROP TABLE IF EXISTS public.user_plans CASCADE;
DROP TABLE IF EXISTS public.lines CASCADE;
DROP TABLE IF EXISTS public.sim_cards CASCADE;
DROP TABLE IF EXISTS public.inventory_vendors CASCADE;
DROP TABLE IF EXISTS public.inventory_serials CASCADE;
DROP TABLE IF EXISTS public.inventory CASCADE;
DROP TABLE IF EXISTS public.plans CASCADE;
DROP TABLE IF EXISTS public.vendors CASCADE;
DROP TABLE IF EXISTS public.customers CASCADE;

-- Drop functions
DROP FUNCTION IF EXISTS convert_lead_to_customer(UUID) CASCADE;
DROP FUNCTION IF EXISTS generate_quote_number() CASCADE;
DROP FUNCTION IF EXISTS generate_account_number() CASCADE;

-- Remove columns from leads table
ALTER TABLE public.leads
  DROP COLUMN IF EXISTS type,
  DROP COLUMN IF EXISTS company_name,
  DROP COLUMN IF EXISTS middle_initial,
  DROP COLUMN IF EXISTS sex,
  DROP COLUMN IF EXISTS date_of_birth,
  DROP COLUMN IF EXISTS billing_address_line1,
  DROP COLUMN IF EXISTS billing_address_line2,
  DROP COLUMN IF EXISTS billing_city,
  DROP COLUMN IF EXISTS billing_state,
  DROP COLUMN IF EXISTS billing_zip,
  DROP COLUMN IF EXISTS billing_country,
  DROP COLUMN IF EXISTS shipping_address_line1,
  DROP COLUMN IF EXISTS shipping_address_line2,
  DROP COLUMN IF EXISTS shipping_city,
  DROP COLUMN IF EXISTS shipping_state,
  DROP COLUMN IF EXISTS shipping_zip,
  DROP COLUMN IF EXISTS shipping_country,
  DROP COLUMN IF EXISTS customer_id,
  DROP COLUMN IF EXISTS converted_at,
  DROP COLUMN IF EXISTS details;

-- Drop indexes from leads
DROP INDEX IF EXISTS public.leads_type_idx;
DROP INDEX IF EXISTS public.leads_customer_id_idx;

-- Drop enum types (optional - only if you want to recreate them)
-- DROP TYPE IF EXISTS lead_type CASCADE;
-- DROP TYPE IF EXISTS sex_type CASCADE;
-- DROP TYPE IF EXISTS plan_type CASCADE;
-- DROP TYPE IF EXISTS plan_status CASCADE;
-- DROP TYPE IF EXISTS user_plan_status CASCADE;
-- DROP TYPE IF EXISTS sim_type CASCADE;
-- DROP TYPE IF EXISTS sim_status CASCADE;
-- DROP TYPE IF EXISTS line_type CASCADE;
-- DROP TYPE IF EXISTS line_status CASCADE;
-- DROP TYPE IF EXISTS phone_number_status CASCADE;
-- DROP TYPE IF EXISTS subscription_start_type CASCADE;
-- DROP TYPE IF EXISTS subscription_end_type CASCADE;
-- DROP TYPE IF EXISTS subscription_renewal_type CASCADE;
-- DROP TYPE IF EXISTS subscription_activation_type CASCADE;
-- DROP TYPE IF EXISTS inventory_type CASCADE;
-- DROP TYPE IF EXISTS inventory_status CASCADE;
-- DROP TYPE IF EXISTS promotion_status CASCADE;
-- DROP TYPE IF EXISTS discount_type CASCADE;
-- DROP TYPE IF EXISTS discount_duration CASCADE;
-- DROP TYPE IF EXISTS quote_status CASCADE;

-- Confirmation message
SELECT 'MVNO tables dropped successfully. You can now run mvno_complete_schema.sql' AS status;
