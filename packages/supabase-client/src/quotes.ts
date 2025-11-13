import { supabase } from './client'
import type { Quote, QuoteItem, Promotion, CreateQuoteForm, CreateQuoteItemForm, UpdateQuoteForm } from './types'

/**
 * Fetch all quotes with optional filtering
 */
export async function getQuotes(filters?: {
  status?: string
  customer_id?: string
  lead_id?: string
  search?: string
}) {
  try {
    let query = supabase
      .from('quotes')
      .select('*, customer:customers(id, first_name, last_name, account_number), lead:leads(id, first_name, last_name, email)')
      .order('created_at', { ascending: false })

    if (filters?.status) {
      query = query.eq('status', filters.status)
    }

    if (filters?.customer_id) {
      query = query.eq('customer_id', filters.customer_id)
    }

    if (filters?.lead_id) {
      query = query.eq('lead_id', filters.lead_id)
    }

    if (filters?.search) {
      query = query.or(`quote_number.ilike.%${filters.search}%`)
    }

    const { data, error } = await query

    if (error) throw error
    return { data: data as Quote[], error: null }
  } catch (error) {
    return { data: null, error: error as Error }
  }
}

/**
 * Fetch a single quote by ID with all related data
 */
export async function getQuote(id: string) {
  try {
    const { data, error } = await supabase
      .from('quotes')
      .select(`
        *,
        customer:customers(*),
        lead:leads(*),
        quote_items:quote_items(*, inventory:inventory(*), plan:plans(*)),
        quote_promotions:quote_promotions(*, promotion:promotions(*))
      `)
      .eq('id', id)
      .single()

    if (error) throw error
    return { data: data as Quote, error: null }
  } catch (error) {
    return { data: null, error: error as Error }
  }
}

/**
 * Fetch a quote by quote number
 */
export async function getQuoteByNumber(quoteNumber: string) {
  try {
    const { data, error } = await supabase
      .from('quotes')
      .select(`
        *,
        customer:customers(*),
        lead:leads(*),
        quote_items:quote_items(*, inventory:inventory(*), plan:plans(*)),
        quote_promotions:quote_promotions(*, promotion:promotions(*))
      `)
      .eq('quote_number', quoteNumber)
      .single()

    if (error) throw error
    return { data: data as Quote, error: null }
  } catch (error) {
    return { data: null, error: error as Error }
  }
}

/**
 * Create a new quote
 */
export async function createQuote(quoteData: CreateQuoteForm) {
  try {
    // Generate quote number using database function
    const { data: quoteNumber, error: numberError } = await supabase.rpc('generate_quote_number')

    if (numberError) throw numberError

    const { data, error } = await supabase
      .from('quotes')
      // @ts-ignore - Supabase typing issue with Database schema
      .insert({
        ...quoteData,
        quote_number: quoteNumber,
      })
      .select('*')
      .single()

    if (error) throw error
    return { data: data as Quote, error: null }
  } catch (error) {
    return { data: null, error: error as Error }
  }
}

/**
 * Update an existing quote
 */
export async function updateQuote(id: string, quoteData: UpdateQuoteForm) {
  try {
    const { data, error } = await supabase
      .from('quotes')
      // @ts-ignore - Supabase typing issue with Database schema
      .update(quoteData)
      .eq('id', id)
      .select('*')
      .single()

    if (error) throw error
    return { data: data as Quote, error: null }
  } catch (error) {
    return { data: null, error: error as Error }
  }
}

/**
 * Delete a quote
 */
export async function deleteQuote(id: string) {
  try {
    const { error } = await supabase.from('quotes').delete().eq('id', id)

    if (error) throw error
    return { error: null }
  } catch (error) {
    return { error: error as Error }
  }
}

/**
 * Add an item to a quote
 */
export async function addQuoteItem(quoteId: string, itemData: CreateQuoteItemForm) {
  try {
    const { data, error } = await supabase
      .from('quote_items')
      // @ts-ignore - Supabase typing issue with Database schema
      .insert({
        quote_id: quoteId,
        ...itemData,
      })
      .select('*')
      .single()

    if (error) throw error
    return { data: data as QuoteItem, error: null }
  } catch (error) {
    return { data: null, error: error as Error }
  }
}

/**
 * Remove an item from a quote
 */
export async function removeQuoteItem(itemId: string) {
  try {
    const { error } = await supabase.from('quote_items').delete().eq('id', itemId)

    if (error) throw error
    return { error: null }
  } catch (error) {
    return { error: error as Error }
  }
}

/**
 * Apply a promotion to a quote
 */
export async function applyPromotionToQuote(quoteId: string, promotionId: string) {
  try {
    // Get promotion details
    const { data: promotionData, error: promoError } = await supabase
      .from('promotions')
      .select('*')
      .eq('id', promotionId)
      .single()

    if (promoError) throw promoError
    if (!promotionData) throw new Error('Promotion not found')

    const promotion = promotionData as Promotion

    // Add promotion to quote
    const { data, error } = await supabase
      .from('quote_promotions')
      // @ts-ignore - Supabase typing issue with Database schema
      .insert({
        quote_id: quoteId,
        promotion_id: promotionId,
        discount_type: promotion.discount_type,
        discount_amount: promotion.discount_amount,
      })
      .select('*')
      .single()

    if (error) throw error
    return { data, error: null }
  } catch (error) {
    return { data: null, error: error as Error }
  }
}

/**
 * Remove a promotion from a quote
 */
export async function removePromotionFromQuote(quoteId: string, promotionId: string) {
  try {
    const { error } = await supabase
      .from('quote_promotions')
      .delete()
      .eq('quote_id', quoteId)
      .eq('promotion_id', promotionId)

    if (error) throw error
    return { error: null }
  } catch (error) {
    return { error: error as Error }
  }
}

/**
 * Accept a quote
 */
export async function acceptQuote(id: string, userId: string) {
  try {
    const { data, error } = await supabase
      .from('quotes')
      // @ts-ignore - Supabase typing issue with Database schema
      .update({
        status: 'accepted',
        accepted_at: new Date().toISOString(),
        accepted_by: userId,
      })
      .eq('id', id)
      .select('*')
      .single()

    if (error) throw error
    return { data: data as Quote, error: null }
  } catch (error) {
    return { data: null, error: error as Error }
  }
}

/**
 * Decline a quote
 */
export async function declineQuote(id: string, reason?: string) {
  try {
    const { data, error } = await supabase
      .from('quotes')
      // @ts-ignore - Supabase typing issue with Database schema
      .update({
        status: 'declined',
        declined_at: new Date().toISOString(),
        declined_reason: reason,
      })
      .eq('id', id)
      .select('*')
      .single()

    if (error) throw error
    return { data: data as Quote, error: null }
  } catch (error) {
    return { data: null, error: error as Error }
  }
}

/**
 * Send a quote to customer
 */
export async function sendQuote(id: string) {
  try {
    const { data, error } = await supabase
      .from('quotes')
      // @ts-ignore - Supabase typing issue with Database schema
      .update({ status: 'sent' })
      .eq('id', id)
      .select('*')
      .single()

    if (error) throw error
    return { data: data as Quote, error: null }
  } catch (error) {
    return { data: null, error: error as Error }
  }
}

/**
 * Recalculate quote totals based on items and promotions
 */
export async function recalculateQuoteTotals(quoteId: string) {
  try {
    // Get quote items
    const { data: items, error: itemsError } = await supabase
      .from('quote_items')
      .select('*')
      .eq('quote_id', quoteId)

    if (itemsError) throw itemsError

    // Get quote promotions
    const { data: promotions, error: promosError } = await supabase
      .from('quote_promotions')
      .select('*')
      .eq('quote_id', quoteId)

    if (promosError) throw promosError

    // Calculate subtotal
    const subtotal = items.reduce((sum: number, item: any) => sum + item.subtotal, 0)

    // Calculate discount total
    let discountTotal = 0
    promotions.forEach((promo: any) => {
      if (promo.discount_type === 'dollar') {
        discountTotal += promo.discount_amount
      } else if (promo.discount_type === 'percent') {
        discountTotal += (subtotal * promo.discount_amount) / 100
      }
    })

    // Calculate tax (placeholder - you may want to implement tax calculation)
    const taxTotal = 0

    // Calculate total
    const total = subtotal - discountTotal + taxTotal

    // Update quote
    const { data, error } = await supabase
      .from('quotes')
      // @ts-ignore - Supabase typing issue with Database schema
      .update({
        subtotal,
        discount_total: discountTotal,
        tax_total: taxTotal,
        total,
      })
      .eq('id', quoteId)
      .select('*')
      .single()

    if (error) throw error
    return { data: data as Quote, error: null }
  } catch (error) {
    return { data: null, error: error as Error }
  }
}
