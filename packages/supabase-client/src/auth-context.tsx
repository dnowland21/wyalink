import { createContext, useContext, useEffect, useState, ReactNode } from 'react'
import { User, Session, AuthError } from '@supabase/supabase-js'
import { supabase } from './client'
import type { Profile, RegisterForm, LoginForm, UpdateProfileForm } from './types'

interface AuthContextType {
  user: User | null
  profile: Profile | null
  session: Session | null
  isLoading: boolean
  isAuthenticated: boolean

  // Auth methods
  signUp: (data: RegisterForm) => Promise<{ error: AuthError | null }>
  signIn: (data: LoginForm) => Promise<{ error: AuthError | null }>
  signOut: () => Promise<{ error: AuthError | null }>
  changePassword: (newPassword: string) => Promise<{ error: AuthError | null }>

  // Profile methods
  updateProfile: (data: UpdateProfileForm) => Promise<{ error: Error | null }>
  refreshProfile: () => Promise<void>
}

const AuthContext = createContext<AuthContextType | undefined>(undefined)

export function AuthProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<User | null>(null)
  const [profile, setProfile] = useState<Profile | null>(null)
  const [session, setSession] = useState<Session | null>(null)
  const [isLoading, setIsLoading] = useState(true)

  // Fetch user profile
  const fetchProfile = async (userId: string) => {
    try {
      const { data, error } = await supabase
        .from('profiles')
        .select('*')
        .eq('id', userId)
        .single()

      if (error) throw error
      setProfile(data)
    } catch (error) {
      console.error('Error fetching profile:', error)
      setProfile(null)
    }
  }

  // Initialize auth state
  useEffect(() => {
    // Get initial session
    supabase.auth.getSession().then(({ data: { session } }) => {
      setSession(session)
      setUser(session?.user ?? null)

      if (session?.user) {
        fetchProfile(session.user.id)
      }

      setIsLoading(false)
    })

    // Listen for auth changes
    const {
      data: { subscription },
    } = supabase.auth.onAuthStateChange((_event, session) => {
      setSession(session)
      setUser(session?.user ?? null)

      if (session?.user) {
        fetchProfile(session.user.id)
      } else {
        setProfile(null)
      }

      setIsLoading(false)
    })

    return () => subscription.unsubscribe()
  }, [])

  // Sign up new user
  const signUp = async ({ email, password, first_name, last_name, phone }: RegisterForm) => {
    try {
      const { data, error } = await supabase.auth.signUp({
        email,
        password,
        options: {
          data: {
            first_name,
            last_name,
            phone,
          },
        },
      })

      if (error) return { error }

      // Profile is auto-created by database trigger
      // Update it with user details
      if (data.user) {
        const { error: profileError } = await supabase
          .from('profiles')
          // @ts-ignore - Supabase typing issue with Database schema
          .update({
            first_name,
            last_name,
            phone,
          })
          .eq('id', data.user.id)

        if (profileError) {
          console.error('Error updating profile:', profileError)
        }
      }

      return { error: null }
    } catch (error) {
      return { error: error as AuthError }
    }
  }

  // Sign in existing user
  const signIn = async ({ email, password }: LoginForm) => {
    const { error } = await supabase.auth.signInWithPassword({
      email,
      password,
    })

    return { error }
  }

  // Sign out
  const signOut = async () => {
    const { error } = await supabase.auth.signOut()
    return { error }
  }

  // Change password
  const changePassword = async (newPassword: string) => {
    const { error } = await supabase.auth.updateUser({
      password: newPassword,
    })
    return { error }
  }

  // Update user profile
  const updateProfile = async (data: UpdateProfileForm) => {
    if (!user) {
      return { error: new Error('No user logged in') }
    }

    try {
      const { error } = await supabase
        .from('profiles')
        // @ts-ignore - Supabase typing issue with Database schema
        .update(data)
        .eq('id', user.id)

      if (error) throw error

      // Refresh profile
      await fetchProfile(user.id)

      return { error: null }
    } catch (error) {
      return { error: error as Error }
    }
  }

  // Refresh profile data
  const refreshProfile = async () => {
    if (user) {
      await fetchProfile(user.id)
    }
  }

  const value: AuthContextType = {
    user,
    profile,
    session,
    isLoading,
    isAuthenticated: !!user,
    signUp,
    signIn,
    signOut,
    changePassword,
    updateProfile,
    refreshProfile,
  }

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>
}

// Hook to use auth context
export function useAuth() {
  const context = useContext(AuthContext)
  if (context === undefined) {
    throw new Error('useAuth must be used within an AuthProvider')
  }
  return context
}

// Hook to require authentication
export function useRequireAuth() {
  const { isAuthenticated, isLoading } = useAuth()

  if (!isLoading && !isAuthenticated) {
    throw new Error('Authentication required')
  }

  return useAuth()
}

// Hook to check if user is admin
export function useIsAdmin() {
  const { profile } = useAuth()
  return profile?.role === 'admin'
}

// Hook to check if user is staff (admin or support)
export function useIsStaff() {
  const { profile } = useAuth()
  return profile?.role === 'admin' || profile?.role === 'support'
}
