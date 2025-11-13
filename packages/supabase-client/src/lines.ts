import { supabase } from './client'
import type { Line, CreateLineForm, UpdateLineForm } from './types'

/**
 * Fetch all lines with optional filtering
 */
export async function getLines(filters?: {
  status?: string
  type?: string
  customer_id?: string
  search?: string
}) {
  try {
    let query = supabase
      .from('lines')
      .select('*, customer:customers(id, first_name, last_name, account_number), active_sim:sim_cards(id, iccid, status)')
      .order('created_at', { ascending: false })

    if (filters?.status) {
      query = query.eq('status', filters.status)
    }

    if (filters?.type) {
      query = query.eq('type', filters.type)
    }

    if (filters?.customer_id) {
      query = query.eq('customer_id', filters.customer_id)
    }

    if (filters?.search) {
      query = query.or(
        `phone_number.ilike.%${filters.search}%,device_manufacturer.ilike.%${filters.search}%,device_model.ilike.%${filters.search}%`
      )
    }

    const { data, error } = await query

    if (error) throw error
    return { data: data as Line[], error: null }
  } catch (error) {
    return { data: null, error: error as Error }
  }
}

/**
 * Fetch active lines for a customer
 */
export async function getCustomerLines(customerId: string) {
  try {
    const { data, error } = await supabase
      .from('lines')
      .select('*, active_sim:sim_cards(id, iccid, status)')
      .eq('customer_id', customerId)
      .in('status', ['activated', 'paused'])
      .order('created_at', { ascending: false })

    if (error) throw error
    return { data: data as Line[], error: null }
  } catch (error) {
    return { data: null, error: error as Error }
  }
}

/**
 * Fetch a single line by ID
 */
export async function getLine(id: string) {
  try {
    const { data, error } = await supabase
      .from('lines')
      .select('*, customer:customers(*), active_sim:sim_cards(*)')
      .eq('id', id)
      .single()

    if (error) throw error
    return { data: data as Line, error: null }
  } catch (error) {
    return { data: null, error: error as Error }
  }
}

/**
 * Fetch a line by phone number
 */
export async function getLineByPhoneNumber(phoneNumber: string) {
  try {
    const { data, error } = await supabase
      .from('lines')
      .select('*, customer:customers(*), active_sim:sim_cards(*)')
      .eq('phone_number', phoneNumber)
      .single()

    if (error) throw error
    return { data: data as Line, error: null }
  } catch (error) {
    return { data: null, error: error as Error }
  }
}

/**
 * Create a new line
 */
export async function createLine(lineData: CreateLineForm) {
  try {
    const { data, error } = await supabase
      .from('lines')
      // @ts-ignore - Supabase typing issue with Database schema
      .insert(lineData)
      .select('*')
      .single()

    if (error) throw error
    return { data: data as Line, error: null }
  } catch (error) {
    return { data: null, error: error as Error }
  }
}

/**
 * Update an existing line
 */
export async function updateLine(id: string, lineData: UpdateLineForm) {
  try {
    const { data, error } = await supabase
      .from('lines')
      // @ts-ignore - Supabase typing issue with Database schema
      .update(lineData)
      .eq('id', id)
      .select('*')
      .single()

    if (error) throw error
    return { data: data as Line, error: null }
  } catch (error) {
    return { data: null, error: error as Error }
  }
}

/**
 * Delete a line
 */
export async function deleteLine(id: string) {
  try {
    const { error } = await supabase.from('lines').delete().eq('id', id)

    if (error) throw error
    return { error: null }
  } catch (error) {
    return { error: error as Error }
  }
}

/**
 * Activate a line
 */
export async function activateLine(id: string, simId: string) {
  try {
    const { data, error } = await supabase
      .from('lines')
      // @ts-ignore - Supabase typing issue with Database schema
      .update({
        status: 'activated',
        active_sim_id: simId,
      })
      .eq('id', id)
      .select('*')
      .single()

    if (error) throw error
    return { data: data as Line, error: null }
  } catch (error) {
    return { data: null, error: error as Error }
  }
}

/**
 * Pause a line
 */
export async function pauseLine(id: string) {
  try {
    const { data, error } = await supabase
      .from('lines')
      // @ts-ignore - Supabase typing issue with Database schema
      .update({ status: 'paused' })
      .eq('id', id)
      .select('*')
      .single()

    if (error) throw error
    return { data: data as Line, error: null }
  } catch (error) {
    return { data: null, error: error as Error }
  }
}

/**
 * Terminate a line
 */
export async function terminateLine(id: string) {
  try {
    const { data, error } = await supabase
      .from('lines')
      // @ts-ignore - Supabase typing issue with Database schema
      .update({
        status: 'terminated',
        phone_number_status: 'terminated',
      })
      .eq('id', id)
      .select('*')
      .single()

    if (error) throw error
    return { data: data as Line, error: null }
  } catch (error) {
    return { data: null, error: error as Error }
  }
}

/**
 * Get line statistics
 */
export async function getLineStats() {
  try {
    const { data, error } = await supabase.from('lines').select('status, type')

    if (error) throw error

    const stats = {
      total: data.length,
      activated: data.filter((l: any) => l.status === 'activated').length,
      paused: data.filter((l: any) => l.status === 'paused').length,
      terminated: data.filter((l: any) => l.status === 'terminated').length,
      mobility: data.filter((l: any) => l.type === 'mobility').length,
      mifi: data.filter((l: any) => l.type === 'mifi').length,
      m2m: data.filter((l: any) => l.type === 'm2m').length,
    }

    return { data: stats, error: null }
  } catch (error) {
    return { data: null, error: error as Error }
  }
}
