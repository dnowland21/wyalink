import { supabase } from './client'
import type { Subscription } from './types'

/**
 * Fetch all subscriptions with optional filtering
 */
export async function getSubscriptions(filters?: {
  customer_id?: string
  line_id?: string
  is_active?: boolean
}) {
  try {
    let query = supabase
      .from('subscriptions')
      .select('*, plan:plans(*), customer:customers(id, first_name, last_name, account_number), line:lines(id, phone_number)')
      .order('created_at', { ascending: false })

    if (filters?.customer_id) {
      query = query.eq('customer_id', filters.customer_id)
    }

    if (filters?.line_id) {
      query = query.eq('line_id', filters.line_id)
    }

    if (filters?.is_active !== undefined) {
      query = query.eq('is_active', filters.is_active)
    }

    const { data, error } = await query

    if (error) throw error
    return { data: data as Subscription[], error: null }
  } catch (error) {
    return { data: null, error: error as Error }
  }
}

/**
 * Fetch active subscriptions for a customer
 */
export async function getCustomerSubscriptions(customerId: string, activeOnly: boolean = true) {
  try {
    let query = supabase
      .from('subscriptions')
      .select('*, plan:plans(*), line:lines(id, phone_number)')
      .eq('customer_id', customerId)
      .order('created_at', { ascending: false })

    if (activeOnly) {
      query = query.eq('is_active', true)
    }

    const { data, error } = await query

    if (error) throw error
    return { data: data as Subscription[], error: null }
  } catch (error) {
    return { data: null, error: error as Error }
  }
}

/**
 * Fetch a single subscription by ID
 */
export async function getSubscription(id: string) {
  try {
    const { data, error } = await supabase
      .from('subscriptions')
      .select('*, plan:plans(*), customer:customers(*), line:lines(*)')
      .eq('id', id)
      .single()

    if (error) throw error
    return { data: data as Subscription, error: null }
  } catch (error) {
    return { data: null, error: error as Error }
  }
}

/**
 * Create a new subscription
 */
export async function createSubscription(subscriptionData: any) {
  try {
    const { data, error } = await supabase
      .from('subscriptions')
      // @ts-ignore - Supabase typing issue with Database schema
      .insert(subscriptionData)
      .select('*')
      .single()

    if (error) throw error
    return { data: data as Subscription, error: null }
  } catch (error) {
    return { data: null, error: error as Error }
  }
}

/**
 * Update an existing subscription
 */
export async function updateSubscription(id: string, subscriptionData: any) {
  try {
    const { data, error } = await supabase
      .from('subscriptions')
      // @ts-ignore - Supabase typing issue with Database schema
      .update(subscriptionData)
      .eq('id', id)
      .select('*')
      .single()

    if (error) throw error
    return { data: data as Subscription, error: null }
  } catch (error) {
    return { data: null, error: error as Error }
  }
}

/**
 * Delete a subscription
 */
export async function deleteSubscription(id: string) {
  try {
    const { error } = await supabase.from('subscriptions').delete().eq('id', id)

    if (error) throw error
    return { error: null }
  } catch (error) {
    return { error: error as Error }
  }
}

/**
 * Activate a subscription
 */
export async function activateSubscription(id: string) {
  try {
    const { data, error } = await supabase
      .from('subscriptions')
      // @ts-ignore - Supabase typing issue with Database schema
      .update({
        is_active: true,
        activation_type: 'active',
        activated_at: new Date().toISOString(),
      })
      .eq('id', id)
      .select('*')
      .single()

    if (error) throw error
    return { data: data as Subscription, error: null }
  } catch (error) {
    return { data: null, error: error as Error }
  }
}

/**
 * Pause a subscription
 */
export async function pauseSubscription(id: string) {
  try {
    const { data, error } = await supabase
      .from('subscriptions')
      // @ts-ignore - Supabase typing issue with Database schema
      .update({
        is_active: false,
        paused_at: new Date().toISOString(),
      })
      .eq('id', id)
      .select('*')
      .single()

    if (error) throw error
    return { data: data as Subscription, error: null }
  } catch (error) {
    return { data: null, error: error as Error }
  }
}

/**
 * Cancel a subscription
 */
export async function cancelSubscription(id: string) {
  try {
    const { data, error } = await supabase
      .from('subscriptions')
      // @ts-ignore - Supabase typing issue with Database schema
      .update({
        is_active: false,
        cancelled_at: new Date().toISOString(),
      })
      .eq('id', id)
      .select('*')
      .single()

    if (error) throw error
    return { data: data as Subscription, error: null }
  } catch (error) {
    return { data: null, error: error as Error }
  }
}

/**
 * Get subscriptions due for renewal
 */
export async function getSubscriptionsDueForRenewal(daysAhead: number = 7) {
  try {
    const futureDate = new Date()
    futureDate.setDate(futureDate.getDate() + daysAhead)

    const { data, error } = await supabase
      .from('subscriptions')
      .select('*, plan:plans(*), customer:customers(id, first_name, last_name, email, account_number), line:lines(id, phone_number)')
      .eq('is_active', true)
      .eq('renewal_type', 'automatic')
      .lte('next_renewal_date', futureDate.toISOString())
      .order('next_renewal_date', { ascending: true })

    if (error) throw error
    return { data: data as Subscription[], error: null }
  } catch (error) {
    return { data: null, error: error as Error }
  }
}
