# Known Issues

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
