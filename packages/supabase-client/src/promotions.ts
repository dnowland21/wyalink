import { supabase } from './client'
import type { Promotion, CreatePromotionForm, UpdatePromotionForm } from './types'

/**
 * Fetch all promotions with optional filtering
 */
export async function getPromotions(filters?: {
  status?: string
  search?: string
}) {
  try {
    let query = supabase
      .from('promotions')
      .select('*')
      .order('created_at', { ascending: false })

    if (filters?.status) {
      query = query.eq('status', filters.status)
    }

    if (filters?.search) {
      query = query.or(
        `promotion_name.ilike.%${filters.search}%,promotion_description.ilike.%${filters.search}%,promotion_code.ilike.%${filters.search}%`
      )
    }

    const { data, error } = await query

    if (error) throw error
    return { data: data as Promotion[], error: null }
  } catch (error) {
    return { data: null, error: error as Error }
  }
}

/**
 * Fetch active promotions only
 */
export async function getActivePromotions() {
  try {
    const now = new Date().toISOString()

    const { data, error } = await supabase
      .from('promotions')
      .select('*')
      .eq('status', 'active')
      .lte('valid_from', now)
      .gte('valid_until', now)
      .order('promotion_name', { ascending: true })

    if (error) throw error
    return { data: data as Promotion[], error: null }
  } catch (error) {
    return { data: null, error: error as Error }
  }
}

/**
 * Fetch a single promotion by ID
 */
export async function getPromotion(id: string) {
  try {
    const { data, error } = await supabase
      .from('promotions')
      .select('*')
      .eq('id', id)
      .single()

    if (error) throw error
    return { data: data as Promotion, error: null }
  } catch (error) {
    return { data: null, error: error as Error }
  }
}

/**
 * Fetch a promotion by code
 */
export async function getPromotionByCode(code: string) {
  try {
    const { data, error } = await supabase
      .from('promotions')
      .select('*')
      .eq('promotion_code', code)
      .single()

    if (error) throw error
    return { data: data as Promotion, error: null }
  } catch (error) {
    return { data: null, error: error as Error }
  }
}

/**
 * Create a new promotion
 */
export async function createPromotion(promotionData: CreatePromotionForm) {
  try {
    const { data, error } = await supabase
      .from('promotions')
      // @ts-ignore - Supabase typing issue with Database schema
      .insert(promotionData)
      .select('*')
      .single()

    if (error) throw error
    return { data: data as Promotion, error: null }
  } catch (error) {
    return { data: null, error: error as Error }
  }
}

/**
 * Update an existing promotion
 */
export async function updatePromotion(id: string, promotionData: UpdatePromotionForm) {
  try {
    const { data, error } = await supabase
      .from('promotions')
      // @ts-ignore - Supabase typing issue with Database schema
      .update(promotionData)
      .eq('id', id)
      .select('*')
      .single()

    if (error) throw error
    return { data: data as Promotion, error: null }
  } catch (error) {
    return { data: null, error: error as Error }
  }
}

/**
 * Delete a promotion
 */
export async function deletePromotion(id: string) {
  try {
    const { error } = await supabase.from('promotions').delete().eq('id', id)

    if (error) throw error
    return { error: null }
  } catch (error) {
    return { error: error as Error }
  }
}

/**
 * Approve a promotion
 */
export async function approvePromotion(id: string, userId: string) {
  try {
    const { data, error } = await supabase
      .from('promotions')
      // @ts-ignore - Supabase typing issue with Database schema
      .update({
        approved_by: userId,
        approved_at: new Date().toISOString(),
        status: 'active',
      })
      .eq('id', id)
      .select('*')
      .single()

    if (error) throw error
    return { data: data as Promotion, error: null }
  } catch (error) {
    return { data: null, error: error as Error }
  }
}

/**
 * Validate a promotion code
 */
export async function validatePromotionCode(code: string) {
  try {
    const now = new Date().toISOString()

    const { data, error } = await supabase
      .from('promotions')
      .select('*')
      .eq('promotion_code', code)
      .eq('status', 'active')
      .lte('valid_from', now)
      .gte('valid_until', now)
      .single()

    if (error) throw error
    return { data: data as Promotion, error: null, valid: true }
  } catch (error) {
    return { data: null, error: error as Error, valid: false }
  }
}
