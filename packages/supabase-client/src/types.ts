// Database Types
// Auto-generated types based on database schema

export type UserRole = 'customer' | 'support' | 'admin'
export type OrderStatus = 'pending' | 'processing' | 'active' | 'suspended' | 'cancelled'
export type LeadStatus = 'new' | 'contacted' | 'qualified' | 'converted' | 'lost'
export type PaymentStatus = 'pending' | 'paid' | 'failed' | 'refunded'
export type ActivityType = 'call' | 'email' | 'note' | 'status_change' | 'assignment'
export type CallOutcome = 'connected' | 'voicemail' | 'no_answer' | 'busy' | 'wrong_number'

export interface Profile {
  id: string
  role: UserRole
  first_name: string | null
  last_name: string | null
  phone: string | null
  address: Address | null
  created_at: string
  updated_at: string
}

export interface Address {
  street: string
  city: string
  state: string
  zip: string
  country?: string
}

export interface Plan {
  id: string
  name: string
  description: string | null
  price_monthly: number
  data_gb: number | null // null = unlimited
  talk_minutes: number | null // null = unlimited
  text_messages: number | null // null = unlimited
  features: string[]
  is_active: boolean
  sort_order: number
  created_at: string
  updated_at: string
}

export interface Order {
  id: string
  user_id: string
  plan_id: string
  status: OrderStatus
  sim_iccid: string | null
  phone_number: string | null
  imei: string | null
  activation_date: string | null
  billing_start_date: string | null
  next_billing_date: string | null
  telco_order_id: string | null
  telco_sim_id: string | null
  notes: string | null
  created_at: string
  updated_at: string

  // Relations
  plan?: Plan
}

export interface Payment {
  id: string
  order_id: string
  user_id: string
  amount: number
  status: PaymentStatus
  stripe_payment_intent_id: string | null
  stripe_invoice_id: string | null
  description: string | null
  paid_at: string | null
  failed_at: string | null
  failure_reason: string | null
  created_at: string
  updated_at: string
}

export interface UsageRecord {
  id: string
  order_id: string
  data_used_mb: number
  talk_minutes_used: number
  text_messages_sent: number
  period_start: string
  period_end: string
  last_synced_at: string | null
  created_at: string
  updated_at: string
}

export interface Lead {
  id: string
  email: string
  first_name: string | null
  last_name: string | null
  phone: string | null
  company: string | null
  status: LeadStatus
  source: string | null
  interested_plan_id: string | null
  notes: string | null
  assigned_to: string | null
  converted_to_user_id: string | null
  converted_at: string | null
  created_at: string
  updated_at: string

  // Relations
  interested_plan?: Plan
}

export interface SupportTicket {
  id: string
  user_id: string
  order_id: string | null
  subject: string
  description: string
  status: string
  priority: string
  assigned_to: string | null
  resolved_at: string | null
  resolved_by: string | null
  resolution_notes: string | null
  created_at: string
  updated_at: string
}

export interface LeadActivity {
  id: string
  lead_id: string
  user_id: string
  type: ActivityType
  subject: string | null
  content: string | null
  call_duration: number | null
  call_outcome: CallOutcome | null
  email_to: string | null
  email_cc: string | null
  email_bcc: string | null
  email_sent: boolean
  email_sent_at: string | null
  created_at: string
  updated_at: string

  // From joined view
  user_first_name?: string
  user_last_name?: string
  user_email?: string
}

export interface Setting {
  id: string
  key: string
  value: any
  category: string
  description: string | null
  is_encrypted: boolean
  updated_by: string | null
  created_at: string
  updated_at: string
}

export interface EmailSettings {
  'email.smtp.host': string
  'email.smtp.port': number
  'email.smtp.secure': boolean
  'email.smtp.username': string
  'email.smtp.password': string
  'email.from.name': string
  'email.from.address': string
  'email.enabled': boolean
}

// Form Types
export interface RegisterForm {
  email: string
  password: string
  first_name: string
  last_name: string
  phone?: string
}

export interface LoginForm {
  email: string
  password: string
}

export interface UpdateProfileForm {
  first_name?: string
  last_name?: string
  phone?: string
  address?: Address
}

export interface CreateOrderForm {
  plan_id: string
  sim_iccid?: string
  phone_number?: string
}

export interface CreateLeadForm {
  email: string
  first_name?: string
  last_name?: string
  phone?: string
  company?: string
  source?: string
  interested_plan_id?: string
  notes?: string
}

export interface UpdateLeadForm {
  email?: string
  first_name?: string
  last_name?: string
  phone?: string
  company?: string
  status?: LeadStatus
  source?: string
  interested_plan_id?: string
  notes?: string
  assigned_to?: string
}

export interface CreateCallActivityForm {
  lead_id: string
  subject?: string
  content?: string
  call_duration?: number
  call_outcome?: CallOutcome
}

export interface CreateEmailActivityForm {
  lead_id: string
  subject: string
  content: string
  email_to: string
  email_cc?: string
  email_bcc?: string
  email_sent?: boolean
  email_sent_at?: string
}

export interface CreateNoteActivityForm {
  lead_id: string
  subject?: string
  content: string
}

// Database schema type for Supabase client
export interface Database {
  public: {
    Tables: {
      profiles: {
        Row: Profile
        Insert: Omit<Profile, 'created_at' | 'updated_at'>
        Update: Partial<Omit<Profile, 'id' | 'created_at' | 'updated_at'>>
      }
      plans: {
        Row: Plan
        Insert: Omit<Plan, 'id' | 'created_at' | 'updated_at'>
        Update: Partial<Omit<Plan, 'id' | 'created_at' | 'updated_at'>>
      }
      orders: {
        Row: Order
        Insert: Omit<Order, 'id' | 'created_at' | 'updated_at'>
        Update: Partial<Omit<Order, 'id' | 'created_at' | 'updated_at'>>
      }
      payments: {
        Row: Payment
        Insert: Omit<Payment, 'id' | 'created_at' | 'updated_at'>
        Update: Partial<Omit<Payment, 'id' | 'created_at' | 'updated_at'>>
      }
      usage_records: {
        Row: UsageRecord
        Insert: Omit<UsageRecord, 'id' | 'created_at' | 'updated_at'>
        Update: Partial<Omit<UsageRecord, 'id' | 'created_at' | 'updated_at'>>
      }
      leads: {
        Row: Lead
        Insert: Omit<Lead, 'id' | 'created_at' | 'updated_at'>
        Update: Partial<Omit<Lead, 'id' | 'created_at' | 'updated_at'>>
      }
      support_tickets: {
        Row: SupportTicket
        Insert: Omit<SupportTicket, 'id' | 'created_at' | 'updated_at'>
        Update: Partial<Omit<SupportTicket, 'id' | 'created_at' | 'updated_at'>>
      }
    }
  }
}
