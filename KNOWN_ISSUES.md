# Known Issues

## CRITICAL: Incomplete Database Schema

**Issue**: The MVNO database schema ([docs/mvno_complete_schema.sql](docs/mvno_complete_schema.sql)) is incomplete. Line 786-787 states "Similar policies for other tables... (Abbreviated for brevity)" which means RLS is enabled on 14 tables but INSERT/UPDATE/DELETE policies were only created for the `customers` table.

**Impact**: All CRUD operations fail with "new row violates row-level security policy" errors for:
- vendors
- plans
- inventory
- inventory_serials
- inventory_vendors
- sim_cards
- lines
- user_plans
- subscriptions
- promotions
- quotes
- quote_items
- quote_promotions

**IMMEDIATE FIX REQUIRED:**
🚨 **Run this SQL script in Supabase Dashboard → SQL Editor:**

See [docs/FIX_ALL_RLS_POLICIES.sql](docs/FIX_ALL_RLS_POLICIES.sql) - this adds all 39 missing RLS policies (INSERT/UPDATE/DELETE for 13 tables).

**Date Identified**: 2025-11-12

---

## Lead to Customer Conversion Error

**Issue**: Converting a lead to a customer fails with multiple errors:

- "null value in column 'billing_address_line1' of relation 'customers' violates not-null constraint"
- "null value in column 'account_number' of relation 'customers' violates not-null constraint"
- "value too long for type character varying(2)" (billing_country or shipping_country with 'USA' instead of 'US')
- "insert or update on table 'leads' violates foreign key constraint 'leads_converted_to_user_id_fkey'"

**Root Cause**: The database function `convert_lead_to_customer` has multiple issues:

1. Tries to copy billing/shipping country codes from leads table that may contain 'USA' (3 chars) instead of 'US' (2 chars)
2. May not set the required account_number field
3. Doesn't handle missing billing address fields properly
4. Tries to set `converted_to_user_id` (FK to auth.users) instead of `customer_id` (FK to customers)

**IMMEDIATE FIX REQUIRED:**
🚨 **Run this SQL script in Supabase Dashboard → SQL Editor:**

```sql
CREATE OR REPLACE FUNCTION convert_lead_to_customer(lead_uuid UUID)
RETURNS UUID AS $$
DECLARE
  new_customer_id UUID;
  v_account_number VARCHAR(10);
  v_first_name TEXT;
  v_last_name TEXT;
  v_email TEXT;
  v_phone TEXT;
  v_company TEXT;
BEGIN
  -- Get lead data (only fields that exist in base leads table)
  SELECT
    COALESCE(first_name, 'Unknown'),
    COALESCE(last_name, 'Unknown'),
    email,
    COALESCE(phone, 'N/A'),
    company
  INTO
    v_first_name,
    v_last_name,
    v_email,
    v_phone,
    v_company
  FROM leads
  WHERE id = lead_uuid;

  IF NOT FOUND THEN
    RAISE EXCEPTION 'Lead not found';
  END IF;

  -- Generate account number
  v_account_number := generate_account_number();

  -- Create customer with placeholder billing address
  INSERT INTO customers (
    account_number,
    type,
    first_name,
    last_name,
    email,
    phone,
    company_name,
    billing_address_line1,
    billing_city,
    billing_state,
    billing_zip,
    billing_country
  ) VALUES (
    v_account_number,
    'consumer'::lead_type, -- Default to consumer type, cast to enum
    v_first_name,
    v_last_name,
    v_email,
    v_phone,
    v_company,
    'Pending', -- Placeholder billing address - customer should update
    'Pending', -- Placeholder billing city - customer should update
    'CA',      -- Placeholder billing state (2-char state code)
    '00000',   -- Placeholder billing zip
    'US'       -- 2-letter country code (NOT 'USA')
  ) RETURNING id INTO new_customer_id;

  -- Update the lead to mark as converted
  UPDATE leads
  SET
    status = 'converted',
    customer_id = new_customer_id, -- Link to customers table, not auth.users
    converted_at = NOW()
  WHERE id = lead_uuid;

  RETURN new_customer_id;
END;
$$ LANGUAGE plpgsql;
```

**Alternative Fix**:
Make billing address fields nullable in the customers table:

```sql
ALTER TABLE customers ALTER COLUMN billing_address_line1 DROP NOT NULL;
ALTER TABLE customers ALTER COLUMN billing_city DROP NOT NULL;
ALTER TABLE customers ALTER COLUMN billing_state DROP NOT NULL;
ALTER TABLE customers ALTER COLUMN billing_zip DROP NOT NULL;
```

**Date Identified**: 2025-11-12

---

## Invalid Lead-to-Plans Relationship

**Issue**: Lead queries fail with error: "Could not find a relationship between 'leads' and 'plans' in the schema cache"

**Root Cause**: All lead query functions were trying to join with `plans` table using `interested_plan:plans(*)` but this foreign key relationship doesn't exist in the database schema.

**Status**: ✅ **FIXED** in application code

**Fix Applied**: Removed invalid `.select('*, interested_plan:plans(*)')` from all lead functions in [packages/supabase-client/src/leads.ts](packages/supabase-client/src/leads.ts)

**Date Identified**: 2025-11-12

---

## VARCHAR(2) Constraint Violations in Forms

**Issue**: Creating or updating customers/vendors fails with error: "value too long for type character varying(2)"

**Root Cause**: Database schema uses `VARCHAR(2)` for state and country codes (expecting 'CA', 'US') but forms had:
- Text inputs allowing users to type full names ('California', 'USA')
- Default values of 'USA' (3 chars) instead of 'US' (2 chars)

**Status**: ✅ **FIXED** in application code

**Fixes Applied**:
1. [apps/linkos/src/components/CustomerModal.tsx](apps/linkos/src/components/CustomerModal.tsx):
   - Changed default country from 'USA' to 'US'
   - Replaced billing state text input with dropdown (all 50 states + DC, 2-letter codes)

2. [apps/linkos/src/components/VendorModal.tsx](apps/linkos/src/components/VendorModal.tsx):
   - Changed default countries from 'USA' to 'US' (6 locations)
   - Replaced both billing and shipping state text inputs with dropdowns (2-letter codes)

**Database Schema Affected**:
- billing_state: VARCHAR(2)
- shipping_state: VARCHAR(2)
- billing_country: VARCHAR(2)
- shipping_country: VARCHAR(2)

**Date Identified**: 2025-11-12

---

## Summary: What's Fixed vs What Needs Database Admin

### ✅ Fixed in Application Code (No DB Changes Needed):
1. Invalid lead-to-plans relationship joins removed
2. Customer form VARCHAR(2) constraints (state/country dropdowns)
3. Vendor form VARCHAR(2) constraints (state/country dropdowns)

### ⚠️ Requires Running SQL in Supabase:
1. **FIX_ALL_RLS_POLICIES.sql** - Adds 39 missing RLS policies for 13 tables
2. **convert_lead_to_customer function** - Fix lead conversion with proper validation

### 📊 Tables with RLS Enabled (14 total):
| Table | SELECT Policy | INSERT/UPDATE/DELETE Policies |
|-------|--------------|-------------------------------|
| customers | ✅ | ✅ (complete) |
| vendors | ✅ | ❌ **MISSING** |
| plans | ✅ | ❌ **MISSING** |
| inventory | ✅ | ❌ **MISSING** |
| inventory_serials | ✅ | ❌ **MISSING** |
| inventory_vendors | ✅ | ❌ **MISSING** |
| sim_cards | ✅ | ❌ **MISSING** |
| lines | ✅ | ❌ **MISSING** |
| user_plans | ✅ | ❌ **MISSING** |
| subscriptions | ✅ | ❌ **MISSING** |
| promotions | ✅ | ❌ **MISSING** |
| quotes | ✅ | ❌ **MISSING** |
| quote_items | ✅ | ❌ **MISSING** |
| quote_promotions | ✅ | ❌ **MISSING** |

**Total Missing Policies**: 39 (3 policies × 13 tables)
