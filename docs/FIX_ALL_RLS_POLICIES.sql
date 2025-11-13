-- =====================================================
-- COMPLETE RLS POLICIES FOR ALL MVNO TABLES
-- =====================================================
-- This script adds the missing INSERT/UPDATE/DELETE policies
-- that were "abbreviated for brevity" in mvno_complete_schema.sql
--
-- Run this in Supabase Dashboard → SQL Editor to fix all RLS issues
-- =====================================================

-- VENDORS (missing INSERT/UPDATE/DELETE)
CREATE POLICY "vendors_insert_staff" ON public.vendors FOR INSERT TO authenticated
WITH CHECK (public.get_current_user_role() IN ('admin', 'support'));

CREATE POLICY "vendors_update_staff" ON public.vendors FOR UPDATE TO authenticated
USING (public.get_current_user_role() IN ('admin', 'support'));

CREATE POLICY "vendors_delete_admin" ON public.vendors FOR DELETE TO authenticated
USING (public.get_current_user_role() = 'admin');

-- PLANS (missing INSERT/UPDATE/DELETE)
CREATE POLICY "plans_insert_staff" ON public.plans FOR INSERT TO authenticated
WITH CHECK (public.get_current_user_role() IN ('admin', 'support'));

CREATE POLICY "plans_update_staff" ON public.plans FOR UPDATE TO authenticated
USING (public.get_current_user_role() IN ('admin', 'support'));

CREATE POLICY "plans_delete_admin" ON public.plans FOR DELETE TO authenticated
USING (public.get_current_user_role() = 'admin');

-- INVENTORY (missing INSERT/UPDATE/DELETE)
CREATE POLICY "inventory_insert_staff" ON public.inventory FOR INSERT TO authenticated
WITH CHECK (public.get_current_user_role() IN ('admin', 'support'));

CREATE POLICY "inventory_update_staff" ON public.inventory FOR UPDATE TO authenticated
USING (public.get_current_user_role() IN ('admin', 'support'));

CREATE POLICY "inventory_delete_admin" ON public.inventory FOR DELETE TO authenticated
USING (public.get_current_user_role() = 'admin');

-- INVENTORY_SERIALS (missing INSERT/UPDATE/DELETE)
CREATE POLICY "inventory_serials_insert_staff" ON public.inventory_serials FOR INSERT TO authenticated
WITH CHECK (public.get_current_user_role() IN ('admin', 'support'));

CREATE POLICY "inventory_serials_update_staff" ON public.inventory_serials FOR UPDATE TO authenticated
USING (public.get_current_user_role() IN ('admin', 'support'));

CREATE POLICY "inventory_serials_delete_admin" ON public.inventory_serials FOR DELETE TO authenticated
USING (public.get_current_user_role() = 'admin');

-- INVENTORY_VENDORS (missing INSERT/UPDATE/DELETE)
CREATE POLICY "inventory_vendors_insert_staff" ON public.inventory_vendors FOR INSERT TO authenticated
WITH CHECK (public.get_current_user_role() IN ('admin', 'support'));

CREATE POLICY "inventory_vendors_update_staff" ON public.inventory_vendors FOR UPDATE TO authenticated
USING (public.get_current_user_role() IN ('admin', 'support'));

CREATE POLICY "inventory_vendors_delete_admin" ON public.inventory_vendors FOR DELETE TO authenticated
USING (public.get_current_user_role() = 'admin');

-- SIM_CARDS (missing INSERT/UPDATE/DELETE)
CREATE POLICY "sim_cards_insert_staff" ON public.sim_cards FOR INSERT TO authenticated
WITH CHECK (public.get_current_user_role() IN ('admin', 'support'));

CREATE POLICY "sim_cards_update_staff" ON public.sim_cards FOR UPDATE TO authenticated
USING (public.get_current_user_role() IN ('admin', 'support'));

CREATE POLICY "sim_cards_delete_admin" ON public.sim_cards FOR DELETE TO authenticated
USING (public.get_current_user_role() = 'admin');

-- LINES (missing INSERT/UPDATE/DELETE)
CREATE POLICY "lines_insert_staff" ON public.lines FOR INSERT TO authenticated
WITH CHECK (public.get_current_user_role() IN ('admin', 'support'));

CREATE POLICY "lines_update_staff" ON public.lines FOR UPDATE TO authenticated
USING (public.get_current_user_role() IN ('admin', 'support'));

CREATE POLICY "lines_delete_admin" ON public.lines FOR DELETE TO authenticated
USING (public.get_current_user_role() = 'admin');

-- USER_PLANS (missing INSERT/UPDATE/DELETE)
CREATE POLICY "user_plans_insert_staff" ON public.user_plans FOR INSERT TO authenticated
WITH CHECK (public.get_current_user_role() IN ('admin', 'support'));

CREATE POLICY "user_plans_update_staff" ON public.user_plans FOR UPDATE TO authenticated
USING (public.get_current_user_role() IN ('admin', 'support'));

CREATE POLICY "user_plans_delete_admin" ON public.user_plans FOR DELETE TO authenticated
USING (public.get_current_user_role() = 'admin');

-- SUBSCRIPTIONS (missing INSERT/UPDATE/DELETE)
CREATE POLICY "subscriptions_insert_staff" ON public.subscriptions FOR INSERT TO authenticated
WITH CHECK (public.get_current_user_role() IN ('admin', 'support'));

CREATE POLICY "subscriptions_update_staff" ON public.subscriptions FOR UPDATE TO authenticated
USING (public.get_current_user_role() IN ('admin', 'support'));

CREATE POLICY "subscriptions_delete_admin" ON public.subscriptions FOR DELETE TO authenticated
USING (public.get_current_user_role() = 'admin');

-- PROMOTIONS (missing INSERT/UPDATE/DELETE)
CREATE POLICY "promotions_insert_staff" ON public.promotions FOR INSERT TO authenticated
WITH CHECK (public.get_current_user_role() IN ('admin', 'support'));

CREATE POLICY "promotions_update_staff" ON public.promotions FOR UPDATE TO authenticated
USING (public.get_current_user_role() IN ('admin', 'support'));

CREATE POLICY "promotions_delete_admin" ON public.promotions FOR DELETE TO authenticated
USING (public.get_current_user_role() = 'admin');

-- QUOTES (missing INSERT/UPDATE/DELETE)
CREATE POLICY "quotes_insert_staff" ON public.quotes FOR INSERT TO authenticated
WITH CHECK (public.get_current_user_role() IN ('admin', 'support'));

CREATE POLICY "quotes_update_staff" ON public.quotes FOR UPDATE TO authenticated
USING (public.get_current_user_role() IN ('admin', 'support'));

CREATE POLICY "quotes_delete_admin" ON public.quotes FOR DELETE TO authenticated
USING (public.get_current_user_role() = 'admin');

-- QUOTE_ITEMS (missing INSERT/UPDATE/DELETE)
CREATE POLICY "quote_items_insert_staff" ON public.quote_items FOR INSERT TO authenticated
WITH CHECK (public.get_current_user_role() IN ('admin', 'support'));

CREATE POLICY "quote_items_update_staff" ON public.quote_items FOR UPDATE TO authenticated
USING (public.get_current_user_role() IN ('admin', 'support'));

CREATE POLICY "quote_items_delete_admin" ON public.quote_items FOR DELETE TO authenticated
USING (public.get_current_user_role() = 'admin');

-- QUOTE_PROMOTIONS (missing INSERT/UPDATE/DELETE)
CREATE POLICY "quote_promotions_insert_staff" ON public.quote_promotions FOR INSERT TO authenticated
WITH CHECK (public.get_current_user_role() IN ('admin', 'support'));

CREATE POLICY "quote_promotions_update_staff" ON public.quote_promotions FOR UPDATE TO authenticated
USING (public.get_current_user_role() IN ('admin', 'support'));

CREATE POLICY "quote_promotions_delete_admin" ON public.quote_promotions FOR DELETE TO authenticated
USING (public.get_current_user_role() = 'admin');

-- =====================================================
-- VERIFICATION QUERY
-- =====================================================
-- Run this after to verify all policies exist:
/*
SELECT
  schemaname,
  tablename,
  policyname,
  cmd
FROM pg_policies
WHERE schemaname = 'public'
ORDER BY tablename, cmd, policyname;
*/
