// Export the Supabase client
export { supabase } from './client'
export type { SupabaseClient, Database } from './client'

// Export all types
export * from './types'

// Export auth context and hooks
export { AuthProvider, useAuth, useRequireAuth, useIsAdmin, useIsStaff } from './auth-context'

// Export lead API functions
export * from './leads'

// Export activity API functions
export * from './activities'

// Export settings API functions
export * from './settings'
