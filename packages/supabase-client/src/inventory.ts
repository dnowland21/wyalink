import { supabase } from './client'
import type { Inventory, InventorySerial, CreateInventoryForm, UpdateInventoryForm } from './types'

/**
 * Fetch all inventory items with optional filtering
 */
export async function getInventory(filters?: {
  type?: string
  status?: string
  search?: string
}) {
  try {
    let query = supabase
      .from('inventory')
      .select('*')
      .order('item_name', { ascending: true })

    if (filters?.type) {
      query = query.eq('type', filters.type)
    }

    if (filters?.status) {
      query = query.eq('status', filters.status)
    }

    if (filters?.search) {
      query = query.or(
        `item_name.ilike.%${filters.search}%,item_description.ilike.%${filters.search}%,item_number.ilike.%${filters.search}%,brand.ilike.%${filters.search}%`
      )
    }

    const { data, error } = await query

    if (error) throw error
    return { data: data as Inventory[], error: null }
  } catch (error) {
    return { data: null, error: error as Error }
  }
}

/**
 * Fetch available inventory items only
 */
export async function getAvailableInventory() {
  try {
    const { data, error } = await supabase
      .from('inventory')
      .select('*')
      .eq('status', 'available')
      .gt('quantity_on_hand', 0)
      .order('item_name', { ascending: true })

    if (error) throw error
    return { data: data as Inventory[], error: null }
  } catch (error) {
    return { data: null, error: error as Error }
  }
}

/**
 * Fetch a single inventory item by ID
 */
export async function getInventoryItem(id: string) {
  try {
    const { data, error } = await supabase
      .from('inventory')
      .select('*')
      .eq('id', id)
      .single()

    if (error) throw error
    return { data: data as Inventory, error: null }
  } catch (error) {
    return { data: null, error: error as Error }
  }
}

/**
 * Create a new inventory item
 */
export async function createInventoryItem(inventoryData: CreateInventoryForm) {
  try {
    const { data, error } = await supabase
      .from('inventory')
      // @ts-ignore - Supabase typing issue with Database schema
      .insert(inventoryData)
      .select('*')
      .single()

    if (error) throw error
    return { data: data as Inventory, error: null }
  } catch (error) {
    return { data: null, error: error as Error }
  }
}

/**
 * Update an existing inventory item
 */
export async function updateInventoryItem(id: string, inventoryData: UpdateInventoryForm) {
  try {
    const { data, error } = await supabase
      .from('inventory')
      // @ts-ignore - Supabase typing issue with Database schema
      .update(inventoryData)
      .eq('id', id)
      .select('*')
      .single()

    if (error) throw error
    return { data: data as Inventory, error: null }
  } catch (error) {
    return { data: null, error: error as Error }
  }
}

/**
 * Delete an inventory item
 */
export async function deleteInventoryItem(id: string) {
  try {
    const { error } = await supabase.from('inventory').delete().eq('id', id)

    if (error) throw error
    return { error: null }
  } catch (error) {
    return { error: error as Error }
  }
}

/**
 * Fetch inventory serials for a specific inventory item (FIFO order)
 */
export async function getInventorySerials(inventoryId: string, status?: string) {
  try {
    let query = supabase
      .from('inventory_serials')
      .select('*')
      .eq('inventory_id', inventoryId)
      .order('received_at', { ascending: true }) // FIFO order

    if (status) {
      query = query.eq('status', status)
    }

    const { data, error } = await query

    if (error) throw error
    return { data: data as InventorySerial[], error: null }
  } catch (error) {
    return { data: null, error: error as Error }
  }
}

/**
 * Get the next available serial (FIFO - first in, first out)
 */
export async function getNextAvailableSerial(inventoryId: string) {
  try {
    const { data, error } = await supabase
      .from('inventory_serials')
      .select('*')
      .eq('inventory_id', inventoryId)
      .eq('status', 'available')
      .is('assigned_to', null)
      .order('received_at', { ascending: true })
      .limit(1)
      .single()

    if (error) throw error
    return { data: data as InventorySerial, error: null }
  } catch (error) {
    return { data: null, error: error as Error }
  }
}

/**
 * Assign an inventory serial to a customer
 */
export async function assignInventorySerial(
  serialId: string,
  customerId: string,
  status: 'reserved' | 'sold'
) {
  try {
    const { data, error } = await supabase
      .from('inventory_serials')
      // @ts-ignore - Supabase typing issue with Database schema
      .update({
        status,
        assigned_to: customerId,
        assigned_at: new Date().toISOString(),
      })
      .eq('id', serialId)
      .select('*')
      .single()

    if (error) throw error
    return { data: data as InventorySerial, error: null }
  } catch (error) {
    return { data: null, error: error as Error }
  }
}

/**
 * Add inventory serials in bulk
 */
export async function addInventorySerials(
  inventoryId: string,
  serials: { serial_number: string; imei?: string }[]
) {
  try {
    const serialsToInsert = serials.map((serial) => ({
      inventory_id: inventoryId,
      serial_number: serial.serial_number,
      imei: serial.imei,
      status: 'available',
      received_at: new Date().toISOString(),
    }))

    const { data, error } = await supabase
      .from('inventory_serials')
      // @ts-ignore - Supabase typing issue with Database schema
      .insert(serialsToInsert)
      .select('*')

    if (error) throw error
    return { data: data as InventorySerial[], error: null }
  } catch (error) {
    return { data: null, error: error as Error }
  }
}
