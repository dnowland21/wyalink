# Known Issues

## Lead to Customer Conversion Error

**Issue**: Converting a lead to a customer fails with error:

- "null value in column 'billing_address_line1' of relation 'customers' violates not-null constraint"
- "null value in column 'account_number' of relation 'customers' violates not-null constraint"
- "value too long for type character varying(2)" (billing_country or shipping_country with 'USA' instead of 'US')

**Root Cause**: The database function `convert_lead_to_customer` has multiple issues:

1. Tries to copy billing/shipping country codes from leads table that may contain 'USA' (3 chars) instead of 'US' (2 chars)
2. May not set the required account_number field
3. Doesn't handle missing billing address fields properly

**IMMEDIATE FIX REQUIRED:**
🚨 **You must run the SQL script below in Supabase Dashboard to fix the database function:**

1. Go to Supabase Dashboard → SQL Editor
2. Copy and paste the entire SQL script from Option 1 below
3. Click "Run" to replace the broken function
4. Test the lead conversion again

**Permanent Fix Options:**
Update the `convert_lead_to_customer` database function in Supabase. The function should either:

1. **Use placeholder values** for required address fields:

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
    converted_to_user_id = new_customer_id,
    converted_at = NOW()
  WHERE id = lead_uuid;

  RETURN new_customer_id;
END;
$$ LANGUAGE plpgsql;
```

2. **OR make billing address fields nullable** in the customers table:

```sql
ALTER TABLE customers ALTER COLUMN billing_address_line1 DROP NOT NULL;
ALTER TABLE customers ALTER COLUMN billing_city DROP NOT NULL;
ALTER TABLE customers ALTER COLUMN billing_state DROP NOT NULL;
ALTER TABLE customers ALTER COLUMN billing_zip DROP NOT NULL;
```

**Temporary Workaround**:
Leads with incomplete address information cannot be converted until the database function is updated. Users should manually create customer records with full billing addresses.

**Date Identified**: 2025-11-12

## Inventory RLS Policy Error

**Issue**: Creating or updating inventory items fails with error: "new row violates row-level security policy for table 'inventory'"

**Root Cause**: Row-Level Security (RLS) is enabled on the `inventory` table in Supabase, but the current policy does not allow authenticated users to insert or update records.

**Temporary Workaround**:
The RLS policy on the `inventory` table needs to be updated in Supabase to allow authenticated users to perform INSERT and UPDATE operations.

**Permanent Fix**:
Update the RLS policy in Supabase Dashboard:

1. Go to Supabase Dashboard → Authentication → Policies
2. Select the `inventory` table
3. Add or modify the policy to allow INSERT/UPDATE for authenticated users:

```sql
-- Policy for INSERT
CREATE POLICY "Allow authenticated users to insert inventory"
ON inventory
FOR INSERT
TO authenticated
WITH CHECK (true);

-- Policy for UPDATE
CREATE POLICY "Allow authenticated users to update inventory"
ON inventory
FOR UPDATE
TO authenticated
USING (true)
WITH CHECK (true);

-- Policy for SELECT (if not already exists)
CREATE POLICY "Allow authenticated users to view inventory"
ON inventory
FOR SELECT
TO authenticated
USING (true);
```

Alternatively, if this is a development/testing environment and security is not a concern, RLS can be temporarily disabled:

```sql
ALTER TABLE inventory DISABLE ROW LEVEL SECURITY;
```

**Date Identified**: 2025-11-12
