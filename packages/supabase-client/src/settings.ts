import { supabase } from './client'
import type { Setting, EmailSettings } from './types'

/**
 * Fetch all settings
 */
export async function getSettings() {
  try {
    const { data, error } = await supabase
      .from('settings')
      .select('*')
      .order('category', { ascending: true })
      .order('key', { ascending: true })

    if (error) throw error
    return { data: data as Setting[], error: null }
  } catch (error) {
    return { data: null, error: error as Error }
  }
}

/**
 * Fetch settings by category
 */
export async function getSettingsByCategory(category: string) {
  try {
    const { data, error } = await supabase
      .from('settings')
      .select('*')
      .eq('category', category)
      .order('key', { ascending: true })

    if (error) throw error
    return { data: data as Setting[], error: null }
  } catch (error) {
    return { data: null, error: error as Error }
  }
}

/**
 * Get a single setting by key
 */
export async function getSetting(key: string) {
  try {
    const { data, error } = await supabase
      .from('settings')
      .select('*')
      .eq('key', key)
      .single()

    if (error) throw error
    return { data: data as Setting, error: null }
  } catch (error) {
    return { data: null, error: error as Error }
  }
}

/**
 * Update a setting
 */
export async function updateSetting(key: string, value: any) {
  try {
    const { data: userData } = await supabase.auth.getUser()
    if (!userData.user) throw new Error('User not authenticated')

    const { data, error } = await supabase
      .from('settings')
      // @ts-ignore - Supabase typing issue
      .update({
        value,
        updated_by: userData.user.id,
      })
      .eq('key', key)
      .select()
      .single()

    if (error) throw error
    return { data: data as Setting, error: null }
  } catch (error) {
    return { data: null, error: error as Error }
  }
}

/**
 * Get email settings as a structured object
 */
export async function getEmailSettings(): Promise<{ data: Partial<EmailSettings> | null; error: Error | null }> {
  try {
    const { data, error } = await getSettingsByCategory('email')

    if (error) throw error

    const emailSettings: Partial<EmailSettings> = {}

    data?.forEach((setting) => {
      const key = setting.key as keyof EmailSettings
      // Parse JSON values
      try {
        emailSettings[key] = JSON.parse(setting.value)
      } catch {
        emailSettings[key] = setting.value
      }
    })

    return { data: emailSettings, error: null }
  } catch (error) {
    return { data: null, error: error as Error }
  }
}

/**
 * Update email settings
 */
export async function updateEmailSettings(settings: Partial<EmailSettings>) {
  try {
    const updates = Object.entries(settings).map(async ([key, value]) => {
      return updateSetting(key, JSON.stringify(value))
    })

    await Promise.all(updates)

    return { error: null }
  } catch (error) {
    return { error: error as Error }
  }
}

/**
 * Test email configuration by sending a test email
 */
export async function testEmailConfiguration(testEmail: string) {
  try {
    // Call Express API endpoint
    const emailApiUrl = import.meta.env.VITE_EMAIL_API_URL || 'http://localhost:3001'
    const response = await fetch(`${emailApiUrl}/api/email/test`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({ to: testEmail }),
    })

    if (!response.ok) {
      const error = await response.json()
      throw new Error(error.message || 'Failed to send test email')
    }

    return { error: null }
  } catch (error) {
    return { error: error as Error }
  }
}
