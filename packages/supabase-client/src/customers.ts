import { supabase } from './client'
import type { Customer, CreateCustomerForm, UpdateCustomerForm } from './types'

/**
 * Fetch all customers with optional filtering
 */
export async function getCustomers(filters?: {
  type?: string
  search?: string
}) {
  try {
    let query = supabase
      .from('customers')
      .select('*')
      .order('created_at', { ascending: false })

    if (filters?.type) {
      query = query.eq('type', filters.type)
    }

    if (filters?.search) {
      query = query.or(
        `email.ilike.%${filters.search}%,first_name.ilike.%${filters.search}%,last_name.ilike.%${filters.search}%,company_name.ilike.%${filters.search}%,account_number.ilike.%${filters.search}%`
      )
    }

    const { data, error } = await query

    if (error) throw error
    return { data: data as Customer[], error: null }
  } catch (error) {
    return { data: null, error: error as Error }
  }
}

/**
 * Fetch a single customer by ID
 */
export async function getCustomer(id: string) {
  try {
    const { data, error } = await supabase
      .from('customers')
      .select('*')
      .eq('id', id)
      .single()

    if (error) throw error
    return { data: data as Customer, error: null }
  } catch (error) {
    return { data: null, error: error as Error }
  }
}

/**
 * Fetch a customer by account number
 */
export async function getCustomerByAccountNumber(accountNumber: string) {
  try {
    const { data, error } = await supabase
      .from('customers')
      .select('*')
      .eq('account_number', accountNumber)
      .single()

    if (error) throw error
    return { data: data as Customer, error: null }
  } catch (error) {
    return { data: null, error: error as Error }
  }
}

/**
 * Create a new customer (manually, without conversion)
 */
export async function createCustomer(customerData: CreateCustomerForm) {
  try {
    const { data, error } = await supabase
      .from('customers')
      // @ts-ignore - Supabase typing issue with Database schema
      .insert(customerData)
      .select('*')
      .single()

    if (error) throw error
    return { data: data as Customer, error: null }
  } catch (error) {
    return { data: null, error: error as Error }
  }
}

/**
 * Update an existing customer
 */
export async function updateCustomer(id: string, customerData: UpdateCustomerForm) {
  try {
    const { data, error } = await supabase
      .from('customers')
      // @ts-ignore - Supabase typing issue with Database schema
      .update(customerData)
      .eq('id', id)
      .select('*')
      .single()

    if (error) throw error
    return { data: data as Customer, error: null }
  } catch (error) {
    return { data: null, error: error as Error }
  }
}

/**
 * Delete a customer
 */
export async function deleteCustomer(id: string) {
  try {
    const { error } = await supabase.from('customers').delete().eq('id', id)

    if (error) throw error
    return { error: null }
  } catch (error) {
    return { error: error as Error }
  }
}

/**
 * Convert a lead to a customer using the database function
 */
export async function convertLeadToCustomer(leadId: string) {
  try {
    // @ts-ignore - RPC function typing issue
    const { data, error } = await supabase.rpc('convert_lead_to_customer', {
      lead_uuid: leadId,
    })

    if (error) throw error
    return { data: data as string, error: null } // Returns customer ID
  } catch (error) {
    return { data: null, error: error as Error }
  }
}

/**
 * Get customer statistics
 */
export async function getCustomerStats() {
  try {
    const { data, error } = await supabase.from('customers').select('type')

    if (error) throw error

    const stats = {
      total: data.length,
      business: data.filter((c: any) => c.type === 'business').length,
      consumer: data.filter((c: any) => c.type === 'consumer').length,
      internal: data.filter((c: any) => c.type === 'internal').length,
    }

    return { data: stats, error: null }
  } catch (error) {
    return { data: null, error: error as Error }
  }
}
