# Known Issues

## Lead to Customer Conversion Error

**Issue**: Converting a lead to a customer fails with error: "null value in column 'billing_address_line1' of relation 'customers' violates not-null constraint"

**Root Cause**: The database function `convert_lead_to_customer` attempts to create a customer record using lead information, but leads don't have billing address fields. The `customers` table requires `billing_address_line1` (and other address fields) as NOT NULL, but these fields don't exist in the `leads` table.

**Permanent Fix**:
Update the `convert_lead_to_customer` database function in Supabase to handle missing billing address fields. The function should either:

1. **Use placeholder values** for required address fields:

```sql
CREATE OR REPLACE FUNCTION convert_lead_to_customer(lead_uuid UUID)
RETURNS UUID AS $$
DECLARE
  new_customer_id UUID;
BEGIN
  -- Create customer with placeholder billing address
  INSERT INTO customers (
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
  )
  SELECT
    COALESCE(type, 'consumer'),
    first_name,
    last_name,
    email,
    phone,
    company,
    'Pending', -- Placeholder for required field
    'Pending', -- Placeholder for required field
    'CA',      -- Placeholder for required field
    '00000',   -- Placeholder for required field
    'USA'
  FROM leads
  WHERE id = lead_uuid
  RETURNING id INTO new_customer_id;

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
