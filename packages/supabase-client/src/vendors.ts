import { supabase } from './client'
import type { Vendor, CreateVendorForm, UpdateVendorForm } from './types'

/**
 * Fetch all vendors with optional filtering
 */
export async function getVendors(filters?: {
  search?: string
}) {
  try {
    let query = supabase
      .from('vendors')
      .select('*')
      .order('company_name', { ascending: true })

    if (filters?.search) {
      query = query.or(
        `company_name.ilike.%${filters.search}%,email.ilike.%${filters.search}%,phone.ilike.%${filters.search}%`
      )
    }

    const { data, error } = await query

    if (error) throw error
    return { data: data as Vendor[], error: null }
  } catch (error) {
    return { data: null, error: error as Error }
  }
}

/**
 * Fetch a single vendor by ID
 */
export async function getVendor(id: string) {
  try {
    const { data, error } = await supabase
      .from('vendors')
      .select('*')
      .eq('id', id)
      .single()

    if (error) throw error
    return { data: data as Vendor, error: null }
  } catch (error) {
    return { data: null, error: error as Error }
  }
}

/**
 * Create a new vendor
 */
export async function createVendor(vendorData: CreateVendorForm) {
  try {
    const { data, error } = await supabase
      .from('vendors')
      // @ts-ignore - Supabase typing issue with Database schema
      .insert(vendorData)
      .select('*')
      .single()

    if (error) throw error
    return { data: data as Vendor, error: null }
  } catch (error) {
    return { data: null, error: error as Error }
  }
}

/**
 * Update an existing vendor
 */
export async function updateVendor(id: string, vendorData: UpdateVendorForm) {
  try {
    const { data, error } = await supabase
      .from('vendors')
      // @ts-ignore - Supabase typing issue with Database schema
      .update(vendorData)
      .eq('id', id)
      .select('*')
      .single()

    if (error) throw error
    return { data: data as Vendor, error: null }
  } catch (error) {
    return { data: null, error: error as Error }
  }
}

/**
 * Delete a vendor
 */
export async function deleteVendor(id: string) {
  try {
    const { error } = await supabase.from('vendors').delete().eq('id', id)

    if (error) throw error
    return { error: null }
  } catch (error) {
    return { error: error as Error }
  }
}
