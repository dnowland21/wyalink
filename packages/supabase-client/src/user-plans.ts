import { supabase } from './client'
import type { UserPlan } from './types'

/**
 * Fetch all user plans with optional filtering
 */
export async function getUserPlans(filters?: {
  customer_id?: string
  line_id?: string
  status?: string
  plan_type?: string
}) {
  try {
    let query = supabase
      .from('user_plans')
      .select('*, plan:plans(*), customer:customers(id, first_name, last_name, account_number), line:lines(id, phone_number), subscription:subscriptions(id, is_active)')
      .order('created_at', { ascending: false })

    if (filters?.customer_id) {
      query = query.eq('customer_id', filters.customer_id)
    }

    if (filters?.line_id) {
      query = query.eq('line_id', filters.line_id)
    }

    if (filters?.status) {
      query = query.eq('status', filters.status)
    }

    if (filters?.plan_type) {
      query = query.eq('plan_type', filters.plan_type)
    }

    const { data, error } = await query

    if (error) throw error
    return { data: data as UserPlan[], error: null }
  } catch (error) {
    return { data: null, error: error as Error }
  }
}

/**
 * Fetch active user plans for a customer
 */
export async function getCustomerUserPlans(customerId: string, activeOnly: boolean = true) {
  try {
    let query = supabase
      .from('user_plans')
      .select('*, plan:plans(*), line:lines(id, phone_number), subscription:subscriptions(id, is_active)')
      .eq('customer_id', customerId)
      .order('created_at', { ascending: false })

    if (activeOnly) {
      query = query.eq('status', 'active')
    }

    const { data, error } = await query

    if (error) throw error
    return { data: data as UserPlan[], error: null }
  } catch (error) {
    return { data: null, error: error as Error }
  }
}

/**
 * Fetch user plans for a specific line
 */
export async function getLineUserPlans(lineId: string) {
  try {
    const { data, error } = await supabase
      .from('user_plans')
      .select('*, plan:plans(*), customer:customers(id, first_name, last_name, account_number), subscription:subscriptions(id, is_active)')
      .eq('line_id', lineId)
      .order('created_at', { ascending: false })

    if (error) throw error
    return { data: data as UserPlan[], error: null }
  } catch (error) {
    return { data: null, error: error as Error }
  }
}

/**
 * Fetch a single user plan by ID
 */
export async function getUserPlan(id: string) {
  try {
    const { data, error } = await supabase
      .from('user_plans')
      .select('*, plan:plans(*), customer:customers(*), line:lines(*), subscription:subscriptions(*), vendor:vendors(*)')
      .eq('id', id)
      .single()

    if (error) throw error
    return { data: data as UserPlan, error: null }
  } catch (error) {
    return { data: null, error: error as Error }
  }
}

/**
 * Create a new user plan
 */
export async function createUserPlan(userPlanData: any) {
  try {
    const { data, error } = await supabase
      .from('user_plans')
      // @ts-ignore - Supabase typing issue with Database schema
      .insert(userPlanData)
      .select('*')
      .single()

    if (error) throw error
    return { data: data as UserPlan, error: null }
  } catch (error) {
    return { data: null, error: error as Error }
  }
}

/**
 * Update an existing user plan
 */
export async function updateUserPlan(id: string, userPlanData: any) {
  try {
    const { data, error } = await supabase
      .from('user_plans')
      // @ts-ignore - Supabase typing issue with Database schema
      .update(userPlanData)
      .eq('id', id)
      .select('*')
      .single()

    if (error) throw error
    return { data: data as UserPlan, error: null }
  } catch (error) {
    return { data: null, error: error as Error }
  }
}

/**
 * Delete a user plan
 */
export async function deleteUserPlan(id: string) {
  try {
    const { error } = await supabase.from('user_plans').delete().eq('id', id)

    if (error) throw error
    return { error: null }
  } catch (error) {
    return { error: error as Error }
  }
}

/**
 * Activate a user plan
 */
export async function activateUserPlan(id: string) {
  try {
    const { data, error } = await supabase
      .from('user_plans')
      // @ts-ignore - Supabase typing issue with Database schema
      .update({
        status: 'active',
        activation_date: new Date().toISOString(),
      })
      .eq('id', id)
      .select('*')
      .single()

    if (error) throw error
    return { data: data as UserPlan, error: null }
  } catch (error) {
    return { data: null, error: error as Error }
  }
}

/**
 * Expire a user plan
 */
export async function expireUserPlan(id: string) {
  try {
    const { data, error } = await supabase
      .from('user_plans')
      // @ts-ignore - Supabase typing issue with Database schema
      .update({
        status: 'expired',
        expiration_date: new Date().toISOString(),
      })
      .eq('id', id)
      .select('*')
      .single()

    if (error) throw error
    return { data: data as UserPlan, error: null }
  } catch (error) {
    return { data: null, error: error as Error }
  }
}

/**
 * Cancel a user plan
 */
export async function cancelUserPlan(id: string) {
  try {
    const { data, error } = await supabase
      .from('user_plans')
      // @ts-ignore - Supabase typing issue with Database schema
      .update({ status: 'cancelled' })
      .eq('id', id)
      .select('*')
      .single()

    if (error) throw error
    return { data: data as UserPlan, error: null }
  } catch (error) {
    return { data: null, error: error as Error }
  }
}

/**
 * Update user plan usage
 */
export async function updateUserPlanUsage(
  id: string,
  usage: {
    data_usage_mb?: number
    voice_usage_minutes?: number
    sms_usage_count?: number
  }
) {
  try {
    const { data, error } = await supabase
      .from('user_plans')
      // @ts-ignore - Supabase typing issue with Database schema
      .update(usage)
      .eq('id', id)
      .select('*')
      .single()

    if (error) throw error
    return { data: data as UserPlan, error: null }
  } catch (error) {
    return { data: null, error: error as Error }
  }
}

/**
 * Get user plans expiring soon
 */
export async function getUserPlansExpiringSoon(daysAhead: number = 7) {
  try {
    const futureDate = new Date()
    futureDate.setDate(futureDate.getDate() + daysAhead)

    const { data, error } = await supabase
      .from('user_plans')
      .select('*, plan:plans(*), customer:customers(id, first_name, last_name, email, account_number), line:lines(id, phone_number)')
      .eq('status', 'active')
      .not('expiration_date', 'is', null)
      .lte('expiration_date', futureDate.toISOString())
      .order('expiration_date', { ascending: true })

    if (error) throw error
    return { data: data as UserPlan[], error: null }
  } catch (error) {
    return { data: null, error: error as Error }
  }
}
