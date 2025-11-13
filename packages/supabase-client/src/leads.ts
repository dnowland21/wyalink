import { supabase } from './client'
import type { Lead, CreateLeadForm, UpdateLeadForm } from './types'

/**
 * Fetch all leads with optional filtering
 */
export async function getLeads(filters?: {
  status?: string
  assigned_to?: string
  search?: string
}) {
  try {
    let query = supabase
      .from('leads')
      .select('*')
      .order('created_at', { ascending: false })

    if (filters?.status) {
      query = query.eq('status', filters.status)
    }

    if (filters?.assigned_to) {
      query = query.eq('assigned_to', filters.assigned_to)
    }

    if (filters?.search) {
      query = query.or(
        `email.ilike.%${filters.search}%,first_name.ilike.%${filters.search}%,last_name.ilike.%${filters.search}%,company.ilike.%${filters.search}%`
      )
    }

    const { data, error } = await query

    if (error) throw error
    return { data: data as Lead[], error: null }
  } catch (error) {
    return { data: null, error: error as Error }
  }
}

/**
 * Fetch a single lead by ID
 */
export async function getLead(id: string) {
  try {
    const { data, error } = await supabase
      .from('leads')
      .select('*')
      .eq('id', id)
      .single()

    if (error) throw error
    return { data: data as Lead, error: null }
  } catch (error) {
    return { data: null, error: error as Error }
  }
}

/**
 * Create a new lead
 */
export async function createLead(leadData: CreateLeadForm) {
  try {
    const { data, error } = await supabase
      .from('leads')
      // @ts-ignore - Supabase typing issue with Database schema
      .insert(leadData)
      .select('*')
      .single()

    if (error) throw error
    return { data: data as Lead, error: null }
  } catch (error) {
    return { data: null, error: error as Error }
  }
}

/**
 * Update an existing lead
 */
export async function updateLead(id: string, leadData: UpdateLeadForm) {
  try {
    const { data, error } = await supabase
      .from('leads')
      // @ts-ignore - Supabase typing issue with Database schema
      .update(leadData)
      .eq('id', id)
      .select('*')
      .single()

    if (error) throw error
    return { data: data as Lead, error: null }
  } catch (error) {
    return { data: null, error: error as Error }
  }
}

/**
 * Delete a lead
 */
export async function deleteLead(id: string) {
  try {
    const { error } = await supabase.from('leads').delete().eq('id', id)

    if (error) throw error
    return { error: null }
  } catch (error) {
    return { error: error as Error }
  }
}

/**
 * Convert a lead to a customer
 */
export async function convertLead(id: string, userId: string) {
  try {
    const { data, error } = await supabase
      .from('leads')
      // @ts-ignore - Supabase typing issue with Database schema
      .update({
        status: 'converted',
        converted_to_user_id: userId,
        converted_at: new Date().toISOString(),
      })
      .eq('id', id)
      .select('*')
      .single()

    if (error) throw error
    return { data: data as Lead, error: null }
  } catch (error) {
    return { data: null, error: error as Error }
  }
}

/**
 * Get lead statistics
 */
export async function getLeadStats() {
  try {
    const { data, error } = await supabase.from('leads').select('status')

    if (error) throw error

    const stats = {
      total: data.length,
      new: data.filter((l: any) => l.status === 'new').length,
      contacted: data.filter((l: any) => l.status === 'contacted').length,
      qualified: data.filter((l: any) => l.status === 'qualified').length,
      converted: data.filter((l: any) => l.status === 'converted').length,
      lost: data.filter((l: any) => l.status === 'lost').length,
    }

    return { data: stats, error: null }
  } catch (error) {
    return { data: null, error: error as Error }
  }
}
