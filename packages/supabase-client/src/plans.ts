import { supabase } from './client'
import type { Plan } from './types'

/**
 * Fetch all plans with optional filtering
 */
export async function getPlans(filters?: {
  type?: string
  status?: string
  search?: string
}) {
  try {
    let query = supabase
      .from('plans')
      .select('*')
      .order('plan_name', { ascending: true })

    if (filters?.type) {
      query = query.eq('plan_type', filters.type)
    }

    if (filters?.status) {
      query = query.eq('status', filters.status)
    }

    if (filters?.search) {
      query = query.or(
        `plan_name.ilike.%${filters.search}%,plan_description.ilike.%${filters.search}%`
      )
    }

    const { data, error } = await query

    if (error) throw error
    return { data: data as Plan[], error: null }
  } catch (error) {
    return { data: null, error: error as Error }
  }
}

/**
 * Fetch active plans only
 */
export async function getActivePlans() {
  try {
    const { data, error } = await supabase
      .from('plans')
      .select('*')
      .eq('status', 'active')
      .order('plan_name', { ascending: true })

    if (error) throw error
    return { data: data as Plan[], error: null }
  } catch (error) {
    return { data: null, error: error as Error }
  }
}

/**
 * Fetch a single plan by ID
 */
export async function getPlan(id: string) {
  try {
    const { data, error } = await supabase
      .from('plans')
      .select('*')
      .eq('id', id)
      .single()

    if (error) throw error
    return { data: data as Plan, error: null }
  } catch (error) {
    return { data: null, error: error as Error }
  }
}
