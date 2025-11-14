import { supabase } from './client'
import type { StoreQueueEntry, CreateQueueEntryForm, UpdateQueueEntryForm, QueueStatus } from './types'

/**
 * Fetch all queue entries with optional filtering
 */
export async function getQueueEntries(filters?: {
  status?: QueueStatus
  visitor_type?: 'lead' | 'customer'
}) {
  try {
    let query = supabase
      .from('store_queue')
      .select(`
        *,
        lead:leads(*),
        customer:customers(*),
        assisting_user:profiles(*)
      `)
      .order('checked_in_at', { ascending: true })

    if (filters?.status) {
      query = query.eq('status', filters.status)
    }

    if (filters?.visitor_type) {
      query = query.eq('visitor_type', filters.visitor_type)
    }

    const { data, error } = await query

    if (error) throw error
    return { data: data as StoreQueueEntry[], error: null }
  } catch (error) {
    return { data: null, error: error as Error }
  }
}

/**
 * Fetch waiting queue entries (current queue)
 */
export async function getWaitingQueue() {
  try {
    const { data, error } = await supabase
      .from('store_queue')
      .select(`
        *,
        lead:leads(*),
        customer:customers(*)
      `)
      .eq('status', 'waiting')
      .order('checked_in_at', { ascending: true })

    if (error) throw error
    return { data: data as StoreQueueEntry[], error: null }
  } catch (error) {
    return { data: null, error: error as Error }
  }
}

/**
 * Fetch entries being assisted
 */
export async function getBeingAssistedEntries() {
  try {
    const { data, error } = await supabase
      .from('store_queue')
      .select(`
        *,
        lead:leads(*),
        customer:customers(*),
        assisting_user:profiles(*)
      `)
      .eq('status', 'being_assisted')
      .order('assistance_started_at', { ascending: true })

    if (error) throw error
    return { data: data as StoreQueueEntry[], error: null }
  } catch (error) {
    return { data: null, error: error as Error }
  }
}

/**
 * Fetch a single queue entry by ID
 */
export async function getQueueEntry(id: string) {
  try {
    const { data, error } = await supabase
      .from('store_queue')
      .select(`
        *,
        lead:leads(*),
        customer:customers(*),
        assisting_user:profiles(*)
      `)
      .eq('id', id)
      .single()

    if (error) throw error
    return { data: data as StoreQueueEntry, error: null }
  } catch (error) {
    return { data: null, error: error as Error }
  }
}

/**
 * Add a visitor to the queue
 */
export async function addToQueue(entryData: CreateQueueEntryForm) {
  try {
    const { data, error } = await supabase
      .from('store_queue')
      // @ts-ignore - Supabase typing issue with Database schema
      .insert({
        ...entryData,
        status: 'waiting',
        checked_in_at: new Date().toISOString(),
      })
      .select(`
        *,
        lead:leads(*),
        customer:customers(*)
      `)
      .single()

    if (error) throw error
    return { data: data as StoreQueueEntry, error: null }
  } catch (error) {
    return { data: null, error: error as Error }
  }
}

/**
 * Start assisting a queue entry
 */
export async function startAssisting(id: string, userId: string) {
  try {
    const { data, error } = await supabase
      .from('store_queue')
      // @ts-ignore - Supabase typing issue with Database schema
      .update({
        status: 'being_assisted',
        assisted_by: userId,
        assistance_started_at: new Date().toISOString(),
      })
      .eq('id', id)
      .select(`
        *,
        lead:leads(*),
        customer:customers(*),
        assisting_user:profiles(*)
      `)
      .single()

    if (error) throw error
    return { data: data as StoreQueueEntry, error: null }
  } catch (error) {
    return { data: null, error: error as Error }
  }
}

/**
 * Complete assistance for a queue entry
 */
export async function completeAssistance(id: string) {
  try {
    const { data, error } = await supabase
      .from('store_queue')
      // @ts-ignore - Supabase typing issue with Database schema
      .update({
        status: 'completed',
        completed_at: new Date().toISOString(),
      })
      .eq('id', id)
      .select('*')
      .single()

    if (error) throw error
    return { data: data as StoreQueueEntry, error: null }
  } catch (error) {
    return { data: null, error: error as Error }
  }
}

/**
 * Remove a visitor from the queue
 */
export async function removeFromQueue(id: string, reason?: string) {
  try {
    const { data, error } = await supabase
      .from('store_queue')
      // @ts-ignore - Supabase typing issue with Database schema
      .update({
        status: 'removed',
        removed_at: new Date().toISOString(),
        removal_reason: reason || null,
      })
      .eq('id', id)
      .select('*')
      .single()

    if (error) throw error
    return { data: data as StoreQueueEntry, error: null }
  } catch (error) {
    return { data: null, error: error as Error }
  }
}

/**
 * Update a queue entry
 */
export async function updateQueueEntry(id: string, entryData: UpdateQueueEntryForm) {
  try {
    const { data, error } = await supabase
      .from('store_queue')
      // @ts-ignore - Supabase typing issue with Database schema
      .update(entryData)
      .eq('id', id)
      .select(`
        *,
        lead:leads(*),
        customer:customers(*),
        assisting_user:profiles(*)
      `)
      .single()

    if (error) throw error
    return { data: data as StoreQueueEntry, error: null }
  } catch (error) {
    return { data: null, error: error as Error }
  }
}

/**
 * Get queue statistics
 */
export async function getQueueStats() {
  try {
    const { data: waiting, error: waitingError } = await supabase
      .from('store_queue')
      .select('id', { count: 'exact', head: true })
      .eq('status', 'waiting')

    const { data: assisting, error: assistingError } = await supabase
      .from('store_queue')
      .select('id', { count: 'exact', head: true })
      .eq('status', 'being_assisted')

    if (waitingError || assistingError) {
      throw waitingError || assistingError
    }

    return {
      data: {
        waiting: waiting?.length || 0,
        being_assisted: assisting?.length || 0,
      },
      error: null,
    }
  } catch (error) {
    return { data: null, error: error as Error }
  }
}
