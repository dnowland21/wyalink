import { supabase } from './client'
import type {
  POSSession,
  POSTransaction,
  POSTransactionItem,
  POSTransactionPayment,
  POSTransactionSerial,
  POSCommission,
  CreatePOSSessionForm,
  ClosePOSSessionForm,
  CreatePOSTransactionForm,
  AddPOSTransactionItemForm,
  AddPOSPaymentForm,
  AddPOSSerialForm,
} from './types'

// =====================================================
// POS SESSION FUNCTIONS
// =====================================================

/**
 * Get current open session for the user
 */
export async function getCurrentSession(userId: string) {
  try {
    const { data, error } = await supabase
      .from('pos_sessions')
      .select('*')
      .eq('opened_by', userId)
      .eq('status', 'open')
      .order('opened_at', { ascending: false })
      .limit(1)
      .single()

    if (error && error.code !== 'PGRST116') throw error // PGRST116 is "no rows returned"
    return { data: data as POSSession | null, error: null }
  } catch (error) {
    return { data: null, error: error as Error }
  }
}

/**
 * Get all sessions with optional filtering
 */
export async function getSessions(filters?: {
  status?: string
  opened_by?: string
  date_from?: string
  date_to?: string
}) {
  try {
    let query = supabase
      .from('pos_sessions')
      .select('*')
      .order('opened_at', { ascending: false })

    if (filters?.status) {
      query = query.eq('status', filters.status)
    }
    if (filters?.opened_by) {
      query = query.eq('opened_by', filters.opened_by)
    }
    if (filters?.date_from) {
      query = query.gte('opened_at', filters.date_from)
    }
    if (filters?.date_to) {
      query = query.lte('opened_at', filters.date_to)
    }

    const { data, error } = await query

    if (error) throw error
    return { data: data as POSSession[], error: null }
  } catch (error) {
    return { data: null, error: error as Error }
  }
}

/**
 * Get a single session by ID
 */
export async function getSession(id: string) {
  try {
    const { data, error } = await supabase
      .from('pos_sessions')
      .select('*')
      .eq('id', id)
      .single()

    if (error) throw error
    return { data: data as POSSession, error: null }
  } catch (error) {
    return { data: null, error: error as Error }
  }
}

/**
 * Open a new POS session
 */
export async function openSession(sessionData: CreatePOSSessionForm, userId: string) {
  try {
    // Generate session number using database function
    const { data: sessionNumber, error: numberError } = await supabase
      .rpc('generate_session_number')

    if (numberError) throw numberError

    const { data, error } = await supabase
      .from('pos_sessions')
      // @ts-ignore - Supabase typing issue
    .insert({
        session_number: sessionNumber,
        register_name: sessionData.register_name || 'Main Register',
        starting_cash: sessionData.starting_cash,
        opening_notes: sessionData.opening_notes,
        opened_by: userId,
        status: 'open',
      })
      .select('*')
      .single()

    if (error) throw error
    return { data: data as POSSession, error: null }
  } catch (error) {
    return { data: null, error: error as Error }
  }
}

/**
 * Close a POS session
 */
export async function closeSession(
  sessionId: string,
  closeData: ClosePOSSessionForm,
  userId: string
) {
  try {
    // Get session to calculate expected cash
    const { data: session, error: sessionError } = await getSession(sessionId)
    if (sessionError) throw sessionError
    if (!session) throw new Error('Session not found')

    const expected_cash =
      session.starting_cash +
      session.total_cash_payments -
      session.total_refunds

    const cash_difference = closeData.actual_cash - expected_cash

    // Determine status based on cash difference
    let status: 'closed' | 'balanced' | 'over' | 'short' = 'closed'
    if (Math.abs(cash_difference) < 0.01) {
      status = 'balanced'
    } else if (cash_difference > 0) {
      status = 'over'
    } else {
      status = 'short'
    }

    const { data, error } = await supabase
      .from('pos_sessions')
      // @ts-ignore - Supabase typing issue
      .update({
        actual_cash: closeData.actual_cash,
        expected_cash: expected_cash,
        cash_difference: cash_difference,
        closing_notes: closeData.closing_notes,
        closed_by: userId,
        closed_at: new Date().toISOString(),
        status: status,
      })
      .eq('id', sessionId)
      .select('*')
      .single()

    if (error) throw error
    return { data: data as POSSession, error: null }
  } catch (error) {
    return { data: null, error: error as Error }
  }
}

// =====================================================
// POS TRANSACTION FUNCTIONS
// =====================================================

/**
 * Get transactions with optional filtering
 */
export async function getTransactions(filters?: {
  session_id?: string
  customer_id?: string
  sales_person?: string
  status?: string
  transaction_type?: string
  date_from?: string
  date_to?: string
}) {
  try {
    // Note: customer and salesperson relations removed until FK constraints are added to database
    let query = supabase
      .from('pos_transactions')
      .select(`
        *,
        session:pos_sessions(*)
      `)
      .order('created_at', { ascending: false })

    if (filters?.session_id) {
      query = query.eq('session_id', filters.session_id)
    }
    if (filters?.customer_id) {
      query = query.eq('customer_id', filters.customer_id)
    }
    if (filters?.sales_person) {
      query = query.eq('sales_person', filters.sales_person)
    }
    if (filters?.status) {
      query = query.eq('status', filters.status)
    }
    if (filters?.transaction_type) {
      query = query.eq('transaction_type', filters.transaction_type)
    }
    if (filters?.date_from) {
      query = query.gte('created_at', filters.date_from)
    }
    if (filters?.date_to) {
      query = query.lte('created_at', filters.date_to)
    }

    const { data, error } = await query

    if (error) throw error
    return { data: data as POSTransaction[], error: null }
  } catch (error) {
    return { data: null, error: error as Error }
  }
}

/**
 * Get recent transactions for a customer
 */
export async function getCustomerTransactions(customerId: string, limit: number = 10) {
  try {
    const { data, error } = await supabase
      .from('pos_transactions')
      .select(`
        *,
        session:pos_sessions(*)
      `)
      .eq('customer_id', customerId)
      .order('created_at', { ascending: false })
      .limit(limit)

    if (error) throw error
    return { data: data as POSTransaction[], error: null }
  } catch (error) {
    return { data: null, error: error as Error }
  }
}

/**
 * Get a single transaction by ID with all related data
 */
export async function getTransaction(id: string) {
  try {
    // Note: customer and salesperson relations removed until FK constraints are added to database
    const { data, error } = await supabase
      .from('pos_transactions')
      .select(`
        *,
        session:pos_sessions(*),
        items:pos_transaction_items(*),
        payments:pos_transaction_payments(*),
        serials:pos_transaction_serials(*)
      `)
      .eq('id', id)
      .single()

    if (error) throw error
    return { data: data as POSTransaction, error: null }
  } catch (error) {
    return { data: null, error: error as Error }
  }
}

/**
 * Create a new transaction
 */
export async function createTransaction(
  transactionData: CreatePOSTransactionForm,
  userId: string
) {
  try {
    // Generate transaction number using database function
    const { data: transactionNumber, error: numberError } = await supabase
      .rpc('generate_transaction_number')

    if (numberError) throw numberError

    const { data, error } = await supabase
      .from('pos_transactions')
      // @ts-ignore - Supabase typing issue
    .insert({
        transaction_number: transactionNumber,
        transaction_type: transactionData.transaction_type,
        customer_id: transactionData.customer_id,
        session_id: transactionData.session_id,
        sales_person: userId,
        requires_manager_override: transactionData.requires_manager_override || false,
        override_reason: transactionData.override_reason,
        activation_plan_id: transactionData.activation_plan_id,
        bill_payment_amount: transactionData.bill_payment_amount,
        bill_payment_account_number: transactionData.bill_payment_account_number,
        notes: transactionData.notes,
        status: 'pending',
        subtotal: 0,
        tax_total: 0,
        discount_total: 0,
        total: 0,
      })
      .select('*')
      .single()

    if (error) throw error
    return { data: data as POSTransaction, error: null }
  } catch (error) {
    return { data: null, error: error as Error }
  }
}

/**
 * Complete a transaction
 */
export async function completeTransaction(transactionId: string, userId: string) {
  try {
    const { data, error } = await supabase
      .from('pos_transactions')
      // @ts-ignore - Supabase typing issue
      .update({
        status: 'completed',
        processed_by: userId,
        completed_at: new Date().toISOString(),
      })
      .eq('id', transactionId)
      .select('*')
      .single()

    if (error) throw error
    return { data: data as POSTransaction, error: null }
  } catch (error) {
    return { data: null, error: error as Error }
  }
}

/**
 * Void a transaction
 */
export async function voidTransaction(
  transactionId: string,
  userId: string,
  reason: string
) {
  try {
    const { data, error } = await supabase
      .from('pos_transactions')
      // @ts-ignore - Supabase typing issue
      .update({
        status: 'voided',
        voided_by: userId,
        voided_at: new Date().toISOString(),
        void_reason: reason,
      })
      .eq('id', transactionId)
      .select('*')
      .single()

    if (error) throw error
    return { data: data as POSTransaction, error: null }
  } catch (error) {
    return { data: null, error: error as Error }
  }
}

/**
 * Apply manager override to a transaction
 */
export async function applyManagerOverride(
  transactionId: string,
  managerId: string
) {
  try {
    const { data, error } = await supabase
      .from('pos_transactions')
      // @ts-ignore - Supabase typing issue
      .update({
        overridden_by: managerId,
        overridden_at: new Date().toISOString(),
      })
      .eq('id', transactionId)
      .select('*')
      .single()

    if (error) throw error
    return { data: data as POSTransaction, error: null }
  } catch (error) {
    return { data: null, error: error as Error }
  }
}

// =====================================================
// POS TRANSACTION ITEMS FUNCTIONS
// =====================================================

/**
 * Get transaction items for a transaction
 */
export async function getTransactionItems(transactionId: string) {
  try {
    // Note: inventory and plan relations removed until FK constraints are added
    const { data, error } = await supabase
      .from('pos_transaction_items')
      .select('*')
      .eq('transaction_id', transactionId)

    if (error) throw error
    return { data: data as POSTransactionItem[], error: null }
  } catch (error) {
    return { data: null, error: error as Error }
  }
}

/**
 * Add an item to a transaction
 */
export async function addTransactionItem(
  transactionId: string,
  itemData: AddPOSTransactionItemForm
) {
  try {
    // Calculate subtotal
    const subtotal =
      itemData.unit_price * itemData.quantity -
      (itemData.discount_amount || 0) +
      (itemData.tax_amount || 0)

    const { data, error } = await supabase
      .from('pos_transaction_items')
      // @ts-ignore - Supabase typing issue
    .insert({
        transaction_id: transactionId,
        item_type: itemData.item_type,
        inventory_id: itemData.inventory_id,
        plan_id: itemData.plan_id,
        item_name: itemData.item_name,
        item_description: itemData.item_description,
        item_sku: itemData.item_sku,
        quantity: itemData.quantity,
        unit_price: itemData.unit_price,
        discount_amount: itemData.discount_amount || 0,
        tax_amount: itemData.tax_amount || 0,
        subtotal: subtotal,
        promotion_id: itemData.promotion_id,
      })
      .select('*')
      .single()

    if (error) throw error

    // Update transaction totals
    await updateTransactionTotals(transactionId)

    return { data: data as POSTransactionItem, error: null }
  } catch (error) {
    return { data: null, error: error as Error }
  }
}

/**
 * Remove an item from a transaction
 */
export async function removeTransactionItem(itemId: string) {
  try {
    // Get the item to know which transaction to update
    const { data: item, error: getError } = await supabase
      .from('pos_transaction_items')
      .select('transaction_id')
      .eq('id', itemId)
      .single()

    if (getError) throw getError

    const { error } = await supabase
      .from('pos_transaction_items')
      .delete()
      .eq('id', itemId)

    if (error) throw error

    // Update transaction totals
    // @ts-ignore - Type issue with Supabase
    await updateTransactionTotals(item.transaction_id)

    return { error: null }
  } catch (error) {
    return { error: error as Error }
  }
}

/**
 * Update transaction item quantity
 */
export async function updateTransactionItemQuantity(
  itemId: string,
  quantity: number
) {
  try {
    // Get the current item to recalculate subtotal
    const { data: item, error: getError } = await supabase
      .from('pos_transaction_items')
      .select('*')
      .eq('id', itemId)
      .single()

    if (getError) throw getError

    // @ts-ignore - Type issue with Supabase
    const newSubtotal =
      // @ts-ignore - Type issue with Supabase
      item.unit_price * quantity - item.discount_amount + item.tax_amount

    const { data, error } = await supabase
      .from('pos_transaction_items')
      // @ts-ignore - Supabase typing issue
      .update({
        quantity: quantity,
        subtotal: newSubtotal,
      })
      .eq('id', itemId)
      .select('*')
      .single()

    if (error) throw error

    // @ts-ignore - Type issue with Supabase
    // Update transaction totals
    await updateTransactionTotals(item.transaction_id)

    return { data: data as POSTransactionItem, error: null }
  } catch (error) {
    return { data: null, error: error as Error }
  }
}

// =====================================================
// POS TRANSACTION PAYMENTS FUNCTIONS
// =====================================================

/**
 * Get payments for a transaction
 */
export async function getTransactionPayments(transactionId: string) {
  try {
    const { data, error } = await supabase
      .from('pos_transaction_payments')
      .select('*')
      .eq('transaction_id', transactionId)

    if (error) throw error
    return { data: data as POSTransactionPayment[], error: null }
  } catch (error) {
    return { data: null, error: error as Error }
  }
}

/**
 * Add a payment to a transaction
 */
export async function addTransactionPayment(
  transactionId: string,
  paymentData: AddPOSPaymentForm
) {
  try {
    // Calculate cash change if cash payment
    let cashChange = null
    if (
      paymentData.payment_method === 'cash' &&
      paymentData.cash_tendered !== undefined
    ) {
      cashChange = paymentData.cash_tendered - paymentData.amount
    }

    const { data, error } = await supabase
      .from('pos_transaction_payments')
      // @ts-ignore - Supabase typing issue
    .insert({
        transaction_id: transactionId,
        payment_method: paymentData.payment_method,
        amount: paymentData.amount,
        card_last_four: paymentData.card_last_four,
        card_type: paymentData.card_type,
        authorization_code: paymentData.authorization_code,
        transaction_id_external: paymentData.transaction_id_external,
        cash_tendered: paymentData.cash_tendered,
        cash_change: cashChange,
        check_number: paymentData.check_number,
      })
      .select('*')
      .single()

    if (error) throw error
    return { data: data as POSTransactionPayment, error: null }
  } catch (error) {
    return { data: null, error: error as Error }
  }
}

// =====================================================
// POS TRANSACTION SERIALS FUNCTIONS
// =====================================================

/**
 * Get serial numbers for a transaction
 */
export async function getTransactionSerials(transactionId: string) {
  try {
    const { data, error } = await supabase
      .from('pos_transaction_serials')
      .select('*')
      .eq('transaction_id', transactionId)

    if (error) throw error
    return { data: data as POSTransactionSerial[], error: null }
  } catch (error) {
    return { data: null, error: error as Error }
  }
}

/**
 * Add a serial number to a transaction item
 */
export async function addTransactionSerial(
  transactionId: string,
  serialData: AddPOSSerialForm
) {
  try {
    const { data, error } = await supabase
      .from('pos_transaction_serials')
      // @ts-ignore - Supabase typing issue
    .insert({
        transaction_id: transactionId,
        transaction_item_id: serialData.transaction_item_id,
        inventory_id: serialData.inventory_id,
        serial_number: serialData.serial_number,
        imei: serialData.imei,
        inventory_serial_id: serialData.inventory_serial_id,
      })
      .select('*')
      .single()

    if (error) throw error

    // Update inventory serial status if inventory_serial_id is provided
    if (serialData.inventory_serial_id) {
      await supabase
        .from('inventory_serials')
        // @ts-ignore - Supabase typing issue
      .update({
          status: 'sold',
          assigned_at: new Date().toISOString(),
        })
        .eq('id', serialData.inventory_serial_id)
    }

    return { data: data as POSTransactionSerial, error: null }
  } catch (error) {
    return { data: null, error: error as Error }
  }
}

// =====================================================
// POS COMMISSION FUNCTIONS
// =====================================================

/**
 * Get commissions for a sales person
 */
export async function getSalespersonCommissions(
  salesPersonId: string,
  filters?: {
    is_paid?: boolean
    period?: string
  }
) {
  try {
    let query = supabase
      .from('pos_commissions')
      .select('*, transaction:pos_transactions(*)')
      .eq('sales_person', salesPersonId)
      .order('created_at', { ascending: false })

    if (filters?.is_paid !== undefined) {
      query = query.eq('is_paid', filters.is_paid)
    }
    if (filters?.period) {
      query = query.eq('paid_in_period', filters.period)
    }

    const { data, error } = await query

    if (error) throw error
    return { data: data as POSCommission[], error: null }
  } catch (error) {
    return { data: null, error: error as Error }
  }
}

/**
 * Create a commission for a transaction
 */
export async function createCommission(
  transactionId: string,
  salesPersonId: string,
  commissionData: {
    commission_amount: number
    commission_rate?: number
    base_amount: number
    commission_type?: string
    notes?: string
  }
) {
  try {
    const { data, error } = await supabase
      .from('pos_commissions')
      // @ts-ignore - Supabase typing issue
    .insert({
        transaction_id: transactionId,
        sales_person: salesPersonId,
        ...commissionData,
      })
      .select('*')
      .single()

    if (error) throw error
    return { data: data as POSCommission, error: null }
  } catch (error) {
    return { data: null, error: error as Error }
  }
}

/**
 * Mark commissions as paid
 */
export async function markCommissionsPaid(
  commissionIds: string[],
  period: string
) {
  try {
    const { data, error } = await supabase
      .from('pos_commissions')
      // @ts-ignore - Supabase typing issue
      .update({
        is_paid: true,
        paid_at: new Date().toISOString(),
        paid_in_period: period,
      })
      .in('id', commissionIds)
      .select('*')

    if (error) throw error
    return { data: data as POSCommission[], error: null }
  } catch (error) {
    return { data: null, error: error as Error }
  }
}

// =====================================================
// UTILITY FUNCTIONS
// =====================================================

/**
 * Update transaction totals based on items
 */
async function updateTransactionTotals(transactionId: string) {
  try {
    // Get all items for this transaction
    const { data: items, error: itemsError } = await supabase
      .from('pos_transaction_items')
      .select('subtotal, discount_amount, tax_amount')
      .eq('transaction_id', transactionId)

    if (itemsError) throw itemsError

    // @ts-ignore - Type issue with Supabase
    // Calculate totals
    // @ts-ignore - Type issue with Supabase
    const subtotal = items.reduce((sum, item) => sum + (item.subtotal - item.tax_amount + item.discount_amount), 0)
    // @ts-ignore - Type issue with Supabase
    const tax_total = items.reduce((sum, item) => sum + item.tax_amount, 0)
    // @ts-ignore - Type issue with Supabase
    const discount_total = items.reduce((sum, item) => sum + item.discount_amount, 0)
    const total = subtotal + tax_total - discount_total

    // Update transaction
    const { error: updateError } = await supabase
      .from('pos_transactions')
      // @ts-ignore - Supabase typing issue
      .update({
        subtotal: subtotal,
        tax_total: tax_total,
        discount_total: discount_total,
        total: total,
      })
      .eq('id', transactionId)

    if (updateError) throw updateError
  } catch (error) {
    console.error('Error updating transaction totals:', error)
  }
}

/**
 * Mark receipt as printed
 */
export async function markReceiptPrinted(transactionId: string) {
  try {
    const { data, error } = await supabase
      .from('pos_transactions')
      // @ts-ignore - Supabase typing issue
      .update({
        receipt_printed: true,
        receipt_printed_at: new Date().toISOString(),
      })
      .eq('id', transactionId)
      .select('*')
      .single()

    if (error) throw error
    return { data: data as POSTransaction, error: null }
  } catch (error) {
    return { data: null, error: error as Error }
  }
}

/**
 * Get daily sales summary
 */
export async function getDailySalesSummary(date?: string) {
  try {
    let query = supabase.from('pos_daily_sales_summary').select('*')

    if (date) {
      query = query.eq('sale_date', date)
    }

    const { data, error } = await query.order('sale_date', { ascending: false })

    if (error) throw error
    return { data, error: null }
  } catch (error) {
    return { data: null, error: error as Error }
  }
}

/**
 * Get salesperson performance report
 */
export async function getSalespersonPerformance() {
  try {
    const { data, error } = await supabase
      .from('pos_salesperson_performance')
      .select('*')
      .order('total_sales', { ascending: false })

    if (error) throw error
    return { data, error: null }
  } catch (error) {
    return { data: null, error: error as Error }
  }
}
