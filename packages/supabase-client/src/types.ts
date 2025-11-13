// Database Types
// Auto-generated types based on database schema

export type UserRole = 'customer' | 'support' | 'admin'
export type OrderStatus = 'pending' | 'processing' | 'active' | 'suspended' | 'cancelled'
export type LeadStatus = 'new' | 'contacted' | 'qualified' | 'converted' | 'lost'
export type PaymentStatus = 'pending' | 'paid' | 'failed' | 'refunded'
export type ActivityType = 'call' | 'email' | 'note' | 'status_change' | 'assignment'
export type CallOutcome = 'connected' | 'voicemail' | 'no_answer' | 'busy' | 'wrong_number'

// MVNO System Types
export type LeadType = 'business' | 'consumer' | 'internal'
export type SexType = 'male' | 'female' | 'prefer_not_to_say'
export type PlanType = 'base' | 'booster'
export type PlanStatus = 'active' | 'inactive' | 'archived'
export type UserPlanStatus = 'pre_provisioned' | 'queued' | 'active' | 'expired' | 'terminated' | 'cancelled'
export type SimType = 'esim' | 'psim'
export type SimStatus = 'cold' | 'warm' | 'hot' | 'pending_swap' | 'swapped' | 'deleted'
export type LineType = 'mobility' | 'mifi' | 'm2m'
export type LineStatus = 'initiating' | 'pending' | 'activated' | 'paused' | 'deactivated' | 'terminated'
export type PhoneNumberStatus = 'available' | 'reserved' | 'active' | 'suspended' | 'terminated'
export type SubscriptionStartType = 'asap' | 'specific_date'
export type SubscriptionEndType = 'unlimited' | 'after_cycles' | 'on_date'
export type SubscriptionRenewalType = 'automatic' | 'manual'
export type SubscriptionActivationType = 'pre_active' | 'active'
export type InventoryType = 'phone' | 'tablet' | 'wearable' | 'hotspot' | 'accessory' | 'other'
export type InventoryStatus = 'available' | 'reserved' | 'sold' | 'returned' | 'damaged' | 'obsolete'
export type PromotionStatus = 'planned' | 'active' | 'cancelled' | 'expired' | 'draft'
export type DiscountType = 'dollar' | 'percent'
export type DiscountDuration = 'one_time' | 'recurring'
export type QuoteStatus = 'draft' | 'sent' | 'accepted' | 'declined' | 'expired' | 'converted'

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

// ==================================================
// MVNO SYSTEM ENTITIES
// ==================================================

export interface Customer {
  id: string
  account_number: string
  type: LeadType
  company_name: string | null
  first_name: string
  middle_initial: string | null
  last_name: string
  sex: SexType | null
  date_of_birth: string | null
  email: string
  phone: string
  billing_address_line1: string
  billing_address_line2: string | null
  billing_city: string
  billing_state: string
  billing_zip: string
  billing_country: string
  shipping_address_line1: string | null
  shipping_address_line2: string | null
  shipping_city: string | null
  shipping_state: string | null
  shipping_zip: string | null
  shipping_country: string | null
  source: string | null
  details: string | null
  created_by: string | null
  created_at: string
  updated_at: string
}

export interface Vendor {
  id: string
  company_name: string
  first_name: string | null
  last_name: string | null
  email: string | null
  phone: string | null
  billing_address_line1: string | null
  billing_address_line2: string | null
  billing_city: string | null
  billing_state: string | null
  billing_zip: string | null
  billing_country: string | null
  shipping_address_line1: string | null
  shipping_address_line2: string | null
  shipping_city: string | null
  shipping_state: string | null
  shipping_zip: string | null
  shipping_country: string | null
  terms: string | null
  notes: string | null
  created_at: string
  updated_at: string
}

export interface MVNOPlan {
  id: string
  plan_uuid: string | null
  plan_name: string
  description: string | null
  plan_status: PlanStatus
  ift_number: string | null
  external_sku: string | null
  promotions_offer_id: string | null
  voice_minutes: number | null
  sms_messages: number | null
  high_priority_data_mb: number | null
  general_data_mb: number | null
  low_priority_data_mb: number | null
  prices: Record<string, number> | null
  max_queue_allowance: number | null
  network_name: string | null
  created_at: string
  updated_at: string
}

export interface Inventory {
  id: string
  type: InventoryType
  status: InventoryStatus
  item_name: string
  item_description: string | null
  item_number: string | null
  upc: string | null
  retail_price: number | null
  cost: number | null
  cost_per_unit: number
  brand: string | null
  model: string | null
  sku: string | null
  storage: string | null
  color: string | null
  quantity_on_hand: number
  reorder_point: number | null
  reorder_quantity: number | null
  track_serial_numbers: boolean
  created_at: string
  updated_at: string
}

export interface InventorySerial {
  id: string
  inventory_id: string
  serial_number: string
  imei: string | null
  status: InventoryStatus
  received_at: string
  assigned_at: string | null
  assigned_to: string | null
  created_at: string
  updated_at: string
}

export interface SimCard {
  id: string
  iccid: string
  imsi: string[] | null
  type: SimType
  activation_code: string | null
  status: SimStatus
  country: string | null
  line_id: string | null
  assigned_to: string | null
  first_network_attachment: string | null
  network_configuration: Record<string, any> | null
  sim_order: string | null
  sim_tag: string | null
  manufacturer: string | null
  manufacturer_profile: string | null
  created_at: string
  updated_at: string
}

export interface Line {
  id: string
  phone_number: string
  status: LineStatus
  type: LineType
  sim_type: SimType | null
  phone_number_status: PhoneNumberStatus
  active_sim_id: string | null
  device_manufacturer: string | null
  device_model: string | null
  customer_id: string | null
  last_consumption: string | null
  created_at: string
  updated_at: string
}

export interface UserPlan {
  id: string
  user_plan_id: string | null
  plan_type: PlanType
  plan_id: string
  status: UserPlanStatus
  customer_id: string | null
  line_id: string | null
  activation_date: string | null
  expiration_date: string | null
  duration_days: number | null
  purchase_date: string | null
  final_price: number | null
  payment_channel: string | null
  bill_to_account: string | null
  transaction_reason: string | null
  data_usage_mb: number
  voice_usage_minutes: number
  sms_usage_count: number
  subscription_id: string | null
  vendor_id: string | null
  created_at: string
  updated_at: string
}

export interface Subscription {
  id: string
  plan_id: string
  customer_id: string
  line_id: string | null
  start_type: SubscriptionStartType
  start_date: string | null
  end_type: SubscriptionEndType
  end_cycles: number | null
  end_date: string | null
  renewal_type: SubscriptionRenewalType
  renewal_interval_days: number | null
  renewal_day_of_month: number | null
  next_renewal_date: string | null
  grace_period_days: number
  bill_to: string | null
  transaction_reason: string | null
  activation_type: SubscriptionActivationType
  activated_at: string | null
  is_active: boolean
  paused_at: string | null
  cancelled_at: string | null
  created_at: string
  updated_at: string
}

export interface Promotion {
  id: string
  status: PromotionStatus
  promotion_name: string
  promotion_description: string | null
  promotion_code: string | null
  discount_type: DiscountType
  discount_amount: number
  discount_duration: DiscountDuration
  recurring_months: number | null
  included_inventory_ids: string[] | null
  included_plan_ids: string[] | null
  approval_required: boolean
  approved_by: string | null
  approved_at: string | null
  valid_from: string | null
  valid_until: string | null
  created_at: string
  updated_at: string
}

export interface Quote {
  id: string
  quote_number: string
  status: QuoteStatus
  customer_id: string | null
  lead_id: string | null
  subtotal: number
  discount_total: number
  tax_total: number
  total: number
  expires_at: string
  accepted_at: string | null
  accepted_by: string | null
  declined_at: string | null
  declined_reason: string | null
  notes: string | null
  terms: string | null
  created_by: string | null
  created_at: string
  updated_at: string
}

export interface QuoteItem {
  id: string
  quote_id: string
  item_type: 'inventory' | 'plan'
  inventory_id: string | null
  plan_id: string | null
  item_name: string
  item_description: string | null
  quantity: number
  unit_price: number
  subtotal: number
  created_at: string
}

export interface QuotePromotion {
  id: string
  quote_id: string
  promotion_id: string
  discount_type: DiscountType
  discount_amount: number
  created_at: string
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

// ==================================================
// MVNO FORM TYPES
// ==================================================

export interface CreateCustomerForm {
  type: LeadType
  company_name?: string
  first_name: string
  middle_initial?: string
  last_name: string
  sex?: SexType
  date_of_birth?: string
  email: string
  phone: string
  billing_address_line1: string
  billing_address_line2?: string
  billing_city: string
  billing_state: string
  billing_zip: string
  billing_country?: string
  shipping_address_line1?: string
  shipping_address_line2?: string
  shipping_city?: string
  shipping_state?: string
  shipping_zip?: string
  shipping_country?: string
  source?: string
  details?: string
}

export interface UpdateCustomerForm {
  type?: LeadType
  company_name?: string
  first_name?: string
  middle_initial?: string
  last_name?: string
  sex?: SexType
  date_of_birth?: string
  email?: string
  phone?: string
  billing_address_line1?: string
  billing_address_line2?: string
  billing_city?: string
  billing_state?: string
  billing_zip?: string
  billing_country?: string
  shipping_address_line1?: string
  shipping_address_line2?: string
  shipping_city?: string
  shipping_state?: string
  shipping_zip?: string
  shipping_country?: string
  source?: string
  details?: string
}

export interface CreateVendorForm {
  company_name: string
  first_name?: string
  last_name?: string
  email?: string
  phone?: string
  billing_address_line1?: string
  billing_address_line2?: string
  billing_city?: string
  billing_state?: string
  billing_zip?: string
  billing_country?: string
  shipping_address_line1?: string
  shipping_address_line2?: string
  shipping_city?: string
  shipping_state?: string
  shipping_zip?: string
  shipping_country?: string
  terms?: string
  notes?: string
}

export interface UpdateVendorForm {
  company_name?: string
  first_name?: string
  last_name?: string
  email?: string
  phone?: string
  billing_address_line1?: string
  billing_address_line2?: string
  billing_city?: string
  billing_state?: string
  billing_zip?: string
  billing_country?: string
  shipping_address_line1?: string
  shipping_address_line2?: string
  shipping_city?: string
  shipping_state?: string
  shipping_zip?: string
  shipping_country?: string
  terms?: string
  notes?: string
}

export interface CreateMVNOPlanForm {
  plan_name: string
  description?: string
  plan_status?: PlanStatus
  plan_uuid?: string
  ift_number?: string
  external_sku?: string
  promotions_offer_id?: string
  voice_minutes?: number
  sms_messages?: number
  high_priority_data_mb?: number
  general_data_mb?: number
  low_priority_data_mb?: number
  prices?: Record<string, number>
  max_queue_allowance?: number
  network_name?: string
}

export interface UpdateMVNOPlanForm {
  plan_name?: string
  description?: string
  plan_status?: PlanStatus
  plan_uuid?: string
  ift_number?: string
  external_sku?: string
  promotions_offer_id?: string
  voice_minutes?: number
  sms_messages?: number
  high_priority_data_mb?: number
  general_data_mb?: number
  low_priority_data_mb?: number
  prices?: Record<string, number>
  max_queue_allowance?: number
  network_name?: string
}

export interface CreateInventoryForm {
  type: InventoryType
  status?: InventoryStatus
  item_name: string
  item_description?: string
  item_number?: string
  upc?: string
  retail_price?: number
  cost?: number
  brand?: string
  model?: string
  sku?: string
  storage?: string
  color?: string
  quantity_on_hand?: number
  reorder_point?: number
  reorder_quantity?: number
  track_serial_numbers?: boolean
}

export interface UpdateInventoryForm {
  type?: InventoryType
  status?: InventoryStatus
  item_name?: string
  item_description?: string
  item_number?: string
  upc?: string
  retail_price?: number
  cost?: number
  brand?: string
  model?: string
  sku?: string
  storage?: string
  color?: string
  quantity_on_hand?: number
  reorder_point?: number
  reorder_quantity?: number
  track_serial_numbers?: boolean
}

export interface CreateSimCardForm {
  iccid: string
  imsi?: string[]
  type: SimType
  activation_code?: string
  status?: SimStatus
  country?: string
  line_id?: string
  assigned_to?: string
  network_configuration?: Record<string, any>
  sim_order?: string
  sim_tag?: string
  manufacturer?: string
  manufacturer_profile?: string
}

export interface UpdateSimCardForm {
  iccid?: string
  imsi?: string[]
  type?: SimType
  activation_code?: string
  status?: SimStatus
  country?: string
  line_id?: string
  assigned_to?: string
  network_configuration?: Record<string, any>
  sim_order?: string
  sim_tag?: string
  manufacturer?: string
  manufacturer_profile?: string
}

export interface CreateLineForm {
  phone_number: string
  status?: LineStatus
  type: LineType
  sim_type?: SimType
  phone_number_status?: PhoneNumberStatus
  active_sim_id?: string
  device_manufacturer?: string
  device_model?: string
  customer_id?: string
}

export interface UpdateLineForm {
  phone_number?: string
  status?: LineStatus
  type?: LineType
  sim_type?: SimType
  phone_number_status?: PhoneNumberStatus
  active_sim_id?: string
  device_manufacturer?: string
  device_model?: string
  customer_id?: string
}

export interface CreatePromotionForm {
  status?: PromotionStatus
  promotion_name: string
  promotion_description?: string
  promotion_code?: string
  discount_type: DiscountType
  discount_amount: number
  discount_duration: DiscountDuration
  recurring_months?: number
  included_inventory_ids?: string[]
  included_plan_ids?: string[]
  approval_required?: boolean
  valid_from?: string
  valid_until?: string
}

export interface UpdatePromotionForm {
  status?: PromotionStatus
  promotion_name?: string
  promotion_description?: string
  promotion_code?: string
  discount_type?: DiscountType
  discount_amount?: number
  discount_duration?: DiscountDuration
  recurring_months?: number
  included_inventory_ids?: string[]
  included_plan_ids?: string[]
  approval_required?: boolean
  valid_from?: string
  valid_until?: string
}

export interface CreateQuoteForm {
  customer_id?: string
  lead_id?: string
  expires_at: string
  notes?: string
  terms?: string
  items?: CreateQuoteItemForm[]
  promotion_ids?: string[]
}

export interface CreateQuoteItemForm {
  item_type: 'inventory' | 'plan'
  inventory_id?: string
  plan_id?: string
  quantity: number
  unit_price: number
}

export interface UpdateQuoteForm {
  status?: QuoteStatus
  customer_id?: string
  lead_id?: string
  expires_at?: string
  notes?: string
  terms?: string
  declined_reason?: string
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
