import { supabase } from './client'
import type { Carrier, CreateCarrierForm, UpdateCarrierForm } from './types'

/**
 * Fetch all carriers with optional filtering
 */
export async function getCarriers(filters?: {
  is_active?: boolean
  search?: string
}) {
  try {
    let query = supabase
      .from('carriers')
      .select('*')
      .order('sort_order', { ascending: true })
      .order('name', { ascending: true })

    if (filters?.is_active !== undefined) {
      query = query.eq('is_active', filters.is_active)
    }

    if (filters?.search) {
      query = query.or(
        `name.ilike.%${filters.search}%,account_info.ilike.%${filters.search}%,pin_info.ilike.%${filters.search}%`
      )
    }

    const { data, error } = await query

    if (error) throw error
    return { data: data as Carrier[], error: null }
  } catch (error) {
    return { data: null, error: error as Error }
  }
}

/**
 * Fetch active carriers only
 */
export async function getActiveCarriers() {
  try {
    const { data, error } = await supabase
      .from('carriers')
      .select('*')
      .eq('is_active', true)
      .order('sort_order', { ascending: true })
      .order('name', { ascending: true })

    if (error) throw error
    return { data: data as Carrier[], error: null }
  } catch (error) {
    return { data: null, error: error as Error }
  }
}

/**
 * Fetch a single carrier by ID
 */
export async function getCarrier(id: string) {
  try {
    const { data, error } = await supabase
      .from('carriers')
      .select('*')
      .eq('id', id)
      .single()

    if (error) throw error
    return { data: data as Carrier, error: null }
  } catch (error) {
    return { data: null, error: error as Error }
  }
}

/**
 * Create a new carrier
 */
export async function createCarrier(carrierData: CreateCarrierForm) {
  try {
    const { data, error } = await supabase
      .from('carriers')
      // @ts-ignore - Supabase typing issue with Database schema
      .insert(carrierData)
      .select('*')
      .single()

    if (error) throw error
    return { data: data as Carrier, error: null }
  } catch (error) {
    return { data: null, error: error as Error }
  }
}

/**
 * Update an existing carrier
 */
export async function updateCarrier(id: string, carrierData: UpdateCarrierForm) {
  try {
    const { data, error } = await supabase
      .from('carriers')
      // @ts-ignore - Supabase typing issue with Database schema
      .update(carrierData)
      .eq('id', id)
      .select('*')
      .single()

    if (error) throw error
    return { data: data as Carrier, error: null }
  } catch (error) {
    return { data: null, error: error as Error }
  }
}

/**
 * Delete a carrier
 */
export async function deleteCarrier(id: string) {
  try {
    const { error } = await supabase.from('carriers').delete().eq('id', id)

    if (error) throw error
    return { error: null }
  } catch (error) {
    return { error: error as Error }
  }
}

/**
 * Reorder carriers (update sort_order for multiple carriers)
 */
export async function reorderCarriers(carrierUpdates: Array<{ id: string; sort_order: number }>) {
  try {
    const promises = carrierUpdates.map(({ id, sort_order }) =>
      supabase
        .from('carriers')
        // @ts-ignore - Supabase typing issue with Database schema
        .update({ sort_order })
        .eq('id', id)
    )

    await Promise.all(promises)
    return { error: null }
  } catch (error) {
    return { error: error as Error }
  }
}
