import { supabase } from './client'
import type { StoreQueueEntry } from './types'

export interface CustomerActivity {
  id: string
  type: 'store_visit' | 'note' | 'quote' | 'subscription' | 'line_activation'
  title: string
  description?: string
  timestamp: string
  user_name?: string
  metadata?: Record<string, any>

  // Relations
  queue_entry?: StoreQueueEntry
}

/**
 * Fetch all activities for a customer
 * This includes store visits, quotes, subscriptions, line activations, etc.
 */
export async function getCustomerActivities(customerId: string) {
  try {
    const activities: CustomerActivity[] = []

    // Fetch store visits (queue entries)
    const { data: queueEntries, error: queueError } = await supabase
      .from('store_queue')
      .select(`
        *,
        assisting_user:profiles(first_name, last_name)
      `)
      .eq('customer_id', customerId)
      .order('checked_in_at', { ascending: false })

    if (queueError) {
      console.error('Error fetching queue entries:', queueError)
    } else if (queueEntries) {
      // Transform queue entries into activities
      queueEntries.forEach((entry: any) => {
        const userName = entry.assisting_user
          ? `${entry.assisting_user.first_name} ${entry.assisting_user.last_name}`
          : undefined

        activities.push({
          id: entry.id,
          type: 'store_visit',
          title: 'Store Visit',
          description: entry.notes || undefined,
          timestamp: entry.checked_in_at,
          user_name: userName,
          metadata: {
            status: entry.status,
            assistance_started_at: entry.assistance_started_at,
            completed_at: entry.completed_at,
          },
          queue_entry: entry,
        })
      })
    }

    // TODO: Fetch other activity types (quotes, subscriptions, etc.)
    // This can be expanded to include other activities

    // Sort all activities by timestamp (most recent first)
    activities.sort((a, b) => new Date(b.timestamp).getTime() - new Date(a.timestamp).getTime())

    return { data: activities, error: null }
  } catch (error) {
    return { data: null, error: error as Error }
  }
}

/**
 * Create a note activity for a customer
 */
export async function createCustomerNote(_customerId: string, _note: string) {
  // TODO: Implement customer notes table and functionality
  // For now, this is a placeholder
  return { data: null, error: new Error('Not implemented yet') }
}
