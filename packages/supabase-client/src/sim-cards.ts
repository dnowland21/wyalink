import { supabase } from './client'
import type { SimCard, CreateSimCardForm, UpdateSimCardForm } from './types'

/**
 * Fetch all SIM cards with optional filtering
 */
export async function getSimCards(filters?: {
  status?: string
  type?: string
  search?: string
}) {
  try {
    let query = supabase
      .from('sim_cards')
      .select('*, assigned_customer:customers(id, first_name, last_name, account_number), line:lines!sim_cards_line_id_fkey(id, phone_number)')
      .order('created_at', { ascending: false })

    if (filters?.status) {
      query = query.eq('status', filters.status)
    }

    if (filters?.type) {
      query = query.eq('type', filters.type)
    }

    if (filters?.search) {
      query = query.or(
        `iccid.ilike.%${filters.search}%,activation_code.ilike.%${filters.search}%`
      )
    }

    const { data, error } = await query

    if (error) throw error
    return { data: data as SimCard[], error: null }
  } catch (error) {
    return { data: null, error: error as Error }
  }
}

/**
 * Fetch available SIM cards
 */
export async function getAvailableSimCards(type?: 'esim' | 'psim') {
  try {
    let query = supabase
      .from('sim_cards')
      .select('*')
      .eq('status', 'cold')
      .is('assigned_to', null)
      .order('created_at', { ascending: true })

    if (type) {
      query = query.eq('type', type)
    }

    const { data, error } = await query

    if (error) throw error
    return { data: data as SimCard[], error: null }
  } catch (error) {
    return { data: null, error: error as Error }
  }
}

/**
 * Fetch a single SIM card by ID
 */
export async function getSimCard(id: string) {
  try {
    const { data, error } = await supabase
      .from('sim_cards')
      .select('*, assigned_customer:customers(*), line:lines!sim_cards_line_id_fkey(*)')
      .eq('id', id)
      .single()

    if (error) throw error
    return { data: data as SimCard, error: null }
  } catch (error) {
    return { data: null, error: error as Error }
  }
}

/**
 * Fetch a SIM card by ICCID
 */
export async function getSimCardByICCID(iccid: string) {
  try {
    const { data, error } = await supabase
      .from('sim_cards')
      .select('*, assigned_customer:customers(*), line:lines!sim_cards_line_id_fkey(*)')
      .eq('iccid', iccid)
      .single()

    if (error) throw error
    return { data: data as SimCard, error: null }
  } catch (error) {
    return { data: null, error: error as Error }
  }
}

/**
 * Create a new SIM card
 */
export async function createSimCard(simCardData: CreateSimCardForm) {
  try {
    const { data, error } = await supabase
      .from('sim_cards')
      // @ts-ignore - Supabase typing issue with Database schema
      .insert(simCardData)
      .select('*')
      .single()

    if (error) throw error
    return { data: data as SimCard, error: null }
  } catch (error) {
    return { data: null, error: error as Error }
  }
}

/**
 * Update an existing SIM card
 */
export async function updateSimCard(id: string, simCardData: UpdateSimCardForm) {
  try {
    const { data, error } = await supabase
      .from('sim_cards')
      // @ts-ignore - Supabase typing issue with Database schema
      .update(simCardData)
      .eq('id', id)
      .select('*')
      .single()

    if (error) throw error
    return { data: data as SimCard, error: null }
  } catch (error) {
    return { data: null, error: error as Error }
  }
}

/**
 * Delete a SIM card
 */
export async function deleteSimCard(id: string) {
  try {
    const { error } = await supabase.from('sim_cards').delete().eq('id', id)

    if (error) throw error
    return { error: null }
  } catch (error) {
    return { error: error as Error }
  }
}

/**
 * Assign a SIM card to a customer
 */
export async function assignSimCard(id: string, customerId: string, status: string = 'warm') {
  try {
    const { data, error } = await supabase
      .from('sim_cards')
      // @ts-ignore - Supabase typing issue with Database schema
      .update({
        assigned_to: customerId,
        status,
      })
      .eq('id', id)
      .select('*')
      .single()

    if (error) throw error
    return { data: data as SimCard, error: null }
  } catch (error) {
    return { data: null, error: error as Error }
  }
}

/**
 * Activate a SIM card (attach to line and set status to hot)
 */
export async function activateSimCard(id: string, lineId: string) {
  try {
    const { data, error } = await supabase
      .from('sim_cards')
      // @ts-ignore - Supabase typing issue with Database schema
      .update({
        line_id: lineId,
        status: 'hot',
        first_network_attachment: new Date().toISOString(),
      })
      .eq('id', id)
      .select('*')
      .single()

    if (error) throw error
    return { data: data as SimCard, error: null }
  } catch (error) {
    return { data: null, error: error as Error }
  }
}

/**
 * Swap SIM card on a line
 */
export async function swapSimCard(oldSimId: string, newSimId: string, lineId: string) {
  try {
    // Mark old SIM as swapped
    await supabase
      .from('sim_cards')
      // @ts-ignore - Supabase typing issue with Database schema
      .update({ status: 'swapped', line_id: null })
      .eq('id', oldSimId)

    // Activate new SIM
    const { data, error } = await supabase
      .from('sim_cards')
      // @ts-ignore - Supabase typing issue with Database schema
      .update({
        line_id: lineId,
        status: 'hot',
        first_network_attachment: new Date().toISOString(),
      })
      .eq('id', newSimId)
      .select('*')
      .single()

    if (error) throw error
    return { data: data as SimCard, error: null }
  } catch (error) {
    return { data: null, error: error as Error }
  }
}

/**
 * Get SIM card statistics
 */
export async function getSimCardStats() {
  try {
    const { data, error } = await supabase.from('sim_cards').select('status, type')

    if (error) throw error

    const stats = {
      total: data.length,
      cold: data.filter((s: any) => s.status === 'cold').length,
      warm: data.filter((s: any) => s.status === 'warm').length,
      hot: data.filter((s: any) => s.status === 'hot').length,
      esim: data.filter((s: any) => s.type === 'esim').length,
      psim: data.filter((s: any) => s.type === 'psim').length,
    }

    return { data: stats, error: null }
  } catch (error) {
    return { data: null, error: error as Error }
  }
}
