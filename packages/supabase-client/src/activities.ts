import { supabase } from './client'
import type {
  LeadActivity,
  CreateCallActivityForm,
  CreateEmailActivityForm,
  CreateNoteActivityForm,
} from './types'

/**
 * Fetch all activities for a lead
 */
export async function getLeadActivities(leadId: string) {
  try {
    const { data, error } = await supabase
      .from('lead_activities_with_users')
      .select('*')
      .eq('lead_id', leadId)
      .order('created_at', { ascending: false })

    if (error) throw error
    return { data: data as LeadActivity[], error: null }
  } catch (error) {
    return { data: null, error: error as Error }
  }
}

/**
 * Log a call activity
 */
export async function logCall(activityData: CreateCallActivityForm) {
  try {
    const { data: userData } = await supabase.auth.getUser()
    if (!userData.user) throw new Error('User not authenticated')

    const { data, error } = await supabase
      .from('lead_activities')
      // @ts-ignore - Supabase typing issue
      .insert({
        ...activityData,
        user_id: userData.user.id,
        type: 'call',
      })
      .select()
      .single()

    if (error) throw error
    return { data: data as LeadActivity, error: null }
  } catch (error) {
    return { data: null, error: error as Error }
  }
}

/**
 * Log an email activity
 */
export async function logEmail(activityData: CreateEmailActivityForm) {
  try {
    const { data: userData } = await supabase.auth.getUser()
    if (!userData.user) throw new Error('User not authenticated')

    const { data, error } = await supabase
      .from('lead_activities')
      // @ts-ignore - Supabase typing issue
      .insert({
        ...activityData,
        user_id: userData.user.id,
        type: 'email',
        email_sent: true,
        email_sent_at: new Date().toISOString(),
      })
      .select()
      .single()

    if (error) throw error
    return { data: data as LeadActivity, error: null }
  } catch (error) {
    return { data: null, error: error as Error }
  }
}

/**
 * Create a note activity
 */
export async function createNote(activityData: CreateNoteActivityForm) {
  try {
    const { data: userData } = await supabase.auth.getUser()
    if (!userData.user) throw new Error('User not authenticated')

    const { data, error } = await supabase
      .from('lead_activities')
      // @ts-ignore - Supabase typing issue
      .insert({
        ...activityData,
        user_id: userData.user.id,
        type: 'note',
      })
      .select()
      .single()

    if (error) throw error
    return { data: data as LeadActivity, error: null }
  } catch (error) {
    return { data: null, error: error as Error }
  }
}

/**
 * Log a status change activity
 */
export async function logStatusChange(leadId: string, oldStatus: string, newStatus: string) {
  try {
    const { data: userData } = await supabase.auth.getUser()
    if (!userData.user) throw new Error('User not authenticated')

    const { data, error } = await supabase
      .from('lead_activities')
      // @ts-ignore - Supabase typing issue
      .insert({
        lead_id: leadId,
        user_id: userData.user.id,
        type: 'status_change',
        subject: 'Status Changed',
        content: `Changed status from "${oldStatus}" to "${newStatus}"`,
      })
      .select()
      .single()

    if (error) throw error
    return { data: data as LeadActivity, error: null }
  } catch (error) {
    return { data: null, error: error as Error }
  }
}

/**
 * Delete an activity
 */
export async function deleteActivity(id: string) {
  try {
    const { error } = await supabase.from('lead_activities').delete().eq('id', id)

    if (error) throw error
    return { error: null }
  } catch (error) {
    return { error: error as Error }
  }
}
