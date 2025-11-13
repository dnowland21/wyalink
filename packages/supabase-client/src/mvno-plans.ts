import { supabase } from './client'
import type { MVNOPlan, CreateMVNOPlanForm, UpdateMVNOPlanForm } from './types'

/**
 * Fetch all MVNO plans with optional filtering
 */
export async function getMVNOPlans(filters?: {
  status?: string
  search?: string
}) {
  try {
    let query = supabase
      .from('plans')
      .select('*')
      .order('plan_name', { ascending: true })

    if (filters?.status) {
      query = query.eq('plan_status', filters.status)
    }

    if (filters?.search) {
      query = query.or(
        `plan_name.ilike.%${filters.search}%,description.ilike.%${filters.search}%,plan_uuid.ilike.%${filters.search}%`
      )
    }

    const { data, error } = await query

    if (error) throw error
    return { data: data as MVNOPlan[], error: null }
  } catch (error) {
    return { data: null, error: error as Error }
  }
}

/**
 * Fetch active MVNO plans only
 */
export async function getActiveMVNOPlans() {
  try {
    const { data, error } = await supabase
      .from('plans')
      .select('*')
      .eq('plan_status', 'active')
      .order('plan_name', { ascending: true })

    if (error) throw error
    return { data: data as MVNOPlan[], error: null }
  } catch (error) {
    return { data: null, error: error as Error }
  }
}

/**
 * Fetch a single MVNO plan by ID
 */
export async function getMVNOPlan(id: string) {
  try {
    const { data, error } = await supabase
      .from('plans')
      .select('*')
      .eq('id', id)
      .single()

    if (error) throw error
    return { data: data as MVNOPlan, error: null }
  } catch (error) {
    return { data: null, error: error as Error }
  }
}

/**
 * Create a new MVNO plan
 */
export async function createMVNOPlan(planData: CreateMVNOPlanForm) {
  try {
    const { data, error } = await supabase
      .from('plans')
      // @ts-ignore - Supabase typing issue with Database schema
      .insert(planData)
      .select('*')
      .single()

    if (error) throw error
    return { data: data as MVNOPlan, error: null }
  } catch (error) {
    return { data: null, error: error as Error }
  }
}

/**
 * Update an existing MVNO plan
 */
export async function updateMVNOPlan(id: string, planData: UpdateMVNOPlanForm) {
  try {
    const { data, error } = await supabase
      .from('plans')
      // @ts-ignore - Supabase typing issue with Database schema
      .update(planData)
      .eq('id', id)
      .select('*')
      .single()

    if (error) throw error
    return { data: data as MVNOPlan, error: null }
  } catch (error) {
    return { data: null, error: error as Error }
  }
}

/**
 * Delete an MVNO plan
 */
export async function deleteMVNOPlan(id: string) {
  try {
    const { error } = await supabase.from('plans').delete().eq('id', id)

    if (error) throw error
    return { error: null }
  } catch (error) {
    return { error: error as Error }
  }
}

/**
 * Archive an MVNO plan (soft delete)
 */
export async function archiveMVNOPlan(id: string) {
  try {
    const { data, error } = await supabase
      .from('plans')
      // @ts-ignore - Supabase typing issue with Database schema
      .update({ plan_status: 'archived' })
      .eq('id', id)
      .select('*')
      .single()

    if (error) throw error
    return { data: data as MVNOPlan, error: null }
  } catch (error) {
    return { data: null, error: error as Error }
  }
}
