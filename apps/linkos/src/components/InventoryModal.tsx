import { useState, useEffect } from 'react'
import {
  createInventoryItem,
  updateInventoryItem,
  type Inventory,
  type CreateInventoryForm,
  type InventoryType,
  type InventoryStatus,
} from '@wyalink/supabase-client'

interface InventoryModalProps {
  isOpen: boolean
  onClose: (shouldRefresh?: boolean) => void
  inventory?: Inventory | null
}

export default function InventoryModal({ isOpen, onClose, inventory }: InventoryModalProps) {
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)

  // Form state
  const [type, setType] = useState<InventoryType>('phone')
  const [status, setStatus] = useState<InventoryStatus>('available')
  const [itemName, setItemName] = useState('')
  const [itemDescription, setItemDescription] = useState('')
  const [itemNumber, setItemNumber] = useState('')
  const [upc, setUpc] = useState('')
  const [retailPrice, setRetailPrice] = useState('')
  const [cost, setCost] = useState('')
  const [brand, setBrand] = useState('')
  const [storage, setStorage] = useState('')
  const [color, setColor] = useState('')
  const [quantityOnHand, setQuantityOnHand] = useState('0')

  useEffect(() => {
    if (inventory) {
      setType(inventory.type)
      setStatus(inventory.status)
      setItemName(inventory.item_name)
      setItemDescription(inventory.item_description || '')
      setItemNumber(inventory.item_number || '')
      setUpc(inventory.upc || '')
      setRetailPrice(inventory.retail_price?.toString() || '')
      setCost(inventory.cost?.toString() || '')
      setBrand(inventory.brand || '')
      setStorage(inventory.storage || '')
      setColor(inventory.color || '')
      setQuantityOnHand(inventory.quantity_on_hand.toString())
    } else {
      resetForm()
    }
  }, [inventory, isOpen])

  const resetForm = () => {
    setType('phone')
    setStatus('available')
    setItemName('')
    setItemDescription('')
    setItemNumber('')
    setUpc('')
    setRetailPrice('')
    setCost('')
    setBrand('')
    setStorage('')
    setColor('')
    setQuantityOnHand('0')
    setError(null)
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setError(null)
    setLoading(true)

    try {
      const inventoryData: CreateInventoryForm = {
        type,
        status,
        item_name: itemName,
        item_description: itemDescription || undefined,
        item_number: itemNumber || undefined,
        upc: upc || undefined,
        retail_price: retailPrice ? parseFloat(retailPrice) : undefined,
        cost: cost ? parseFloat(cost) : undefined,
        brand: brand || undefined,
        storage: storage || undefined,
        color: color || undefined,
        quantity_on_hand: parseInt(quantityOnHand) || 0,
      }

      let result
      if (inventory) {
        result = await updateInventoryItem(inventory.id, inventoryData)
      } else {
        result = await createInventoryItem(inventoryData)
      }

      if (result.error) throw result.error

      onClose(true)
      resetForm()
    } catch (err: any) {
      setError(err.message || 'Failed to save inventory item')
      console.error(err)
    } finally {
      setLoading(false)
    }
  }

  if (!isOpen) return null

  return (
    <div className="fixed inset-0 bg-gray-900/50 backdrop-blur-sm flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-lg shadow-xl max-w-3xl w-full max-h-[90vh] overflow-y-auto">
        <div className="sticky top-0 bg-white border-b border-gray-200 px-6 py-4">
          <div className="flex items-center justify-between">
            <h2 className="text-xl font-bold text-gray-900">
              {inventory ? 'Edit Inventory Item' : 'Add New Inventory Item'}
            </h2>
            <button
              onClick={() => onClose()}
              className="text-gray-400 hover:text-gray-600 transition-colors"
            >
              <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
              </svg>
            </button>
          </div>
        </div>

        <form onSubmit={handleSubmit} className="p-6">
          {error && (
            <div className="mb-4 bg-red-50 border border-red-200 rounded-lg p-4">
              <p className="text-sm text-red-800">{error}</p>
            </div>
          )}

          <div className="space-y-6">
            {/* Basic Information */}
            <div>
              <h3 className="text-sm font-semibold text-gray-900 mb-4">Basic Information</h3>
              <div className="space-y-4">
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Item Type <span className="text-red-500">*</span>
                    </label>
                    <select
                      value={type}
                      onChange={(e) => setType(e.target.value as InventoryType)}
                      required
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary-500"
                    >
                      <option value="phone">Phone</option>
                      <option value="tablet">Tablet</option>
                      <option value="wearable">Wearable</option>
                      <option value="hotspot">Hotspot</option>
                      <option value="accessory">Accessory</option>
                      <option value="other">Other</option>
                    </select>
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Status <span className="text-red-500">*</span>
                    </label>
                    <select
                      value={status}
                      onChange={(e) => setStatus(e.target.value as InventoryStatus)}
                      required
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary-500"
                    >
                      <option value="available">Available</option>
                      <option value="reserved">Reserved</option>
                      <option value="sold">Sold</option>
                      <option value="returned">Returned</option>
                      <option value="damaged">Damaged</option>
                      <option value="obsolete">Obsolete</option>
                    </select>
                  </div>
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Item Name <span className="text-red-500">*</span>
                  </label>
                  <input
                    type="text"
                    required
                    value={itemName}
                    onChange={(e) => setItemName(e.target.value)}
                    placeholder="e.g., iPhone 15 Pro Max"
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary-500"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">Description</label>
                  <textarea
                    value={itemDescription}
                    onChange={(e) => setItemDescription(e.target.value)}
                    rows={2}
                    placeholder="Brief description of the item..."
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary-500"
                  />
                </div>
              </div>
            </div>

            {/* Item Details */}
            <div>
              <h3 className="text-sm font-semibold text-gray-900 mb-4">Item Details</h3>
              <div className="space-y-4">
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">Item Number/SKU</label>
                    <input
                      type="text"
                      value={itemNumber}
                      onChange={(e) => setItemNumber(e.target.value)}
                      placeholder="SKU or internal item number"
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary-500"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">UPC/Barcode</label>
                    <input
                      type="text"
                      value={upc}
                      onChange={(e) => setUpc(e.target.value)}
                      placeholder="Universal Product Code"
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary-500"
                    />
                  </div>
                </div>
                <div className="grid grid-cols-3 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">Brand</label>
                    <input
                      type="text"
                      value={brand}
                      onChange={(e) => setBrand(e.target.value)}
                      placeholder="e.g., Apple, Samsung"
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary-500"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">Storage</label>
                    <input
                      type="text"
                      value={storage}
                      onChange={(e) => setStorage(e.target.value)}
                      placeholder="e.g., 256GB"
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary-500"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">Color</label>
                    <input
                      type="text"
                      value={color}
                      onChange={(e) => setColor(e.target.value)}
                      placeholder="e.g., Space Gray"
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary-500"
                    />
                  </div>
                </div>
              </div>
            </div>

            {/* Pricing and Quantity */}
            <div>
              <h3 className="text-sm font-semibold text-gray-900 mb-4">Pricing & Quantity</h3>
              <div className="grid grid-cols-3 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">Retail Price ($)</label>
                  <input
                    type="number"
                    step="0.01"
                    min="0"
                    value={retailPrice}
                    onChange={(e) => setRetailPrice(e.target.value)}
                    placeholder="0.00"
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary-500"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">Cost ($)</label>
                  <input
                    type="number"
                    step="0.01"
                    min="0"
                    value={cost}
                    onChange={(e) => setCost(e.target.value)}
                    placeholder="0.00"
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary-500"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">Quantity on Hand</label>
                  <input
                    type="number"
                    min="0"
                    value={quantityOnHand}
                    onChange={(e) => setQuantityOnHand(e.target.value)}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary-500"
                  />
                </div>
              </div>
            </div>
          </div>

          {/* Actions */}
          <div className="flex items-center justify-end gap-3 mt-6 pt-6 border-t">
            <button
              type="button"
              onClick={() => onClose()}
              className="px-4 py-2 text-gray-700 hover:bg-gray-100 rounded-lg transition-colors"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={loading}
              className="px-4 py-2 bg-primary-600 text-white rounded-lg hover:bg-primary-700 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {loading ? 'Saving...' : inventory ? 'Update Item' : 'Create Item'}
            </button>
          </div>
        </form>
      </div>
    </div>
  )
}
