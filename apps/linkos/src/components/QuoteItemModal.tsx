import { useState, useEffect } from 'react'
import {
  addQuoteItem,
  getInventory,
  getMVNOPlans,
  type Inventory,
  type MVNOPlan,
} from '@wyalink/supabase-client'

interface QuoteItemModalProps {
  isOpen: boolean
  onClose: (shouldRefresh?: boolean) => void
  quoteId: string
}

export default function QuoteItemModal({ isOpen, onClose, quoteId }: QuoteItemModalProps) {
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [loadingData, setLoadingData] = useState(false)

  // Form state
  const [itemType, setItemType] = useState<'inventory' | 'plan'>('inventory')
  const [inventoryId, setInventoryId] = useState('')
  const [planId, setPlanId] = useState('')
  const [quantity, setQuantity] = useState('1')
  const [unitPrice, setUnitPrice] = useState('')

  // Dropdown data
  const [inventoryItems, setInventoryItems] = useState<Inventory[]>([])
  const [plans, setPlans] = useState<MVNOPlan[]>([])

  useEffect(() => {
    if (isOpen) {
      fetchData()
    }
  }, [isOpen])

  useEffect(() => {
    // Auto-populate price when item is selected
    if (itemType === 'inventory' && inventoryId) {
      const item = inventoryItems.find((i) => i.id === inventoryId)
      if (item && item.retail_price) {
        setUnitPrice(item.retail_price.toString())
      }
    } else if (itemType === 'plan' && planId) {
      const plan = plans.find((p) => p.id === planId)
      if (plan && plan.prices) {
        // Try to get the first price from the prices object
        const priceKeys = Object.keys(plan.prices)
        if (priceKeys.length > 0) {
          setUnitPrice(plan.prices[priceKeys[0]].toString())
        }
      }
    }
  }, [itemType, inventoryId, planId, inventoryItems, plans])

  const fetchData = async () => {
    setLoadingData(true)
    setError(null)

    try {
      const [inventoryResult, plansResult] = await Promise.all([
        getInventory({ status: 'available' }),
        getMVNOPlans({ status: 'active' }),
      ])

      if (inventoryResult.data) setInventoryItems(inventoryResult.data)
      if (plansResult.data) setPlans(plansResult.data)
    } catch (err: any) {
      setError('Failed to load inventory and plans')
      console.error(err)
    } finally {
      setLoadingData(false)
    }
  }

  const resetForm = () => {
    setItemType('inventory')
    setInventoryId('')
    setPlanId('')
    setQuantity('1')
    setUnitPrice('')
    setError(null)
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setError(null)
    setLoading(true)

    try {
      const itemData = {
        item_type: itemType,
        inventory_id: itemType === 'inventory' ? inventoryId : undefined,
        plan_id: itemType === 'plan' ? planId : undefined,
        quantity: parseInt(quantity),
        unit_price: parseFloat(unitPrice),
      }

      const result = await addQuoteItem(quoteId, itemData)

      if (result.error) throw result.error

      onClose(true)
      resetForm()
    } catch (err: any) {
      setError(err.message || 'Failed to add item to quote')
      console.error(err)
    } finally {
      setLoading(false)
    }
  }

  if (!isOpen) return null

  const subtotal = parseFloat(unitPrice || '0') * parseInt(quantity || '1')

  return (
    <div className="fixed inset-0 bg-gray-900/50 backdrop-blur-sm flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-lg shadow-xl max-w-2xl w-full max-h-[90vh] overflow-y-auto">
        <div className="sticky top-0 bg-white border-b border-gray-200 px-6 py-4">
          <div className="flex items-center justify-between">
            <h2 className="text-xl font-bold text-gray-900">Add Item to Quote</h2>
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
            {/* Item Type Selection */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Item Type <span className="text-red-500">*</span>
              </label>
              <select
                value={itemType}
                onChange={(e) => {
                  setItemType(e.target.value as 'inventory' | 'plan')
                  setInventoryId('')
                  setPlanId('')
                  setUnitPrice('')
                }}
                required
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary-500"
              >
                <option value="inventory">Device/Accessory</option>
                <option value="plan">Service Plan</option>
              </select>
            </div>

            {/* Item Selection */}
            {itemType === 'inventory' ? (
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Select Device/Accessory <span className="text-red-500">*</span>
                </label>
                <select
                  value={inventoryId}
                  onChange={(e) => setInventoryId(e.target.value)}
                  required
                  disabled={loadingData}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary-500"
                >
                  <option value="">Select an item</option>
                  {inventoryItems.map((item) => (
                    <option key={item.id} value={item.id}>
                      {item.item_name} {item.brand ? `- ${item.brand}` : ''} {item.model ? `${item.model}` : ''} (
                      {item.quantity_on_hand} available)
                    </option>
                  ))}
                </select>
                {inventoryItems.length === 0 && !loadingData && (
                  <p className="text-xs text-gray-500 mt-1">No inventory items available</p>
                )}
              </div>
            ) : (
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Select Service Plan <span className="text-red-500">*</span>
                </label>
                <select
                  value={planId}
                  onChange={(e) => setPlanId(e.target.value)}
                  required
                  disabled={loadingData}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary-500"
                >
                  <option value="">Select a plan</option>
                  {plans.map((plan) => {
                    const price = plan.prices ? Object.values(plan.prices)[0] : 0
                    return (
                      <option key={plan.id} value={plan.id}>
                        {plan.plan_name} {price > 0 ? `- $${price}/month` : ''}
                      </option>
                    )
                  })}
                </select>
                {plans.length === 0 && !loadingData && (
                  <p className="text-xs text-gray-500 mt-1">No plans available</p>
                )}
              </div>
            )}

            {/* Quantity and Price */}
            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Quantity <span className="text-red-500">*</span>
                </label>
                <input
                  type="number"
                  min="1"
                  required
                  value={quantity}
                  onChange={(e) => setQuantity(e.target.value)}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary-500"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Unit Price ($) <span className="text-red-500">*</span>
                </label>
                <input
                  type="number"
                  step="0.01"
                  min="0"
                  required
                  value={unitPrice}
                  onChange={(e) => setUnitPrice(e.target.value)}
                  placeholder="0.00"
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary-500"
                />
              </div>
            </div>

            {/* Subtotal Display */}
            {unitPrice && quantity && (
              <div className="bg-gray-50 rounded-lg p-4 border border-gray-200">
                <div className="flex items-center justify-between">
                  <span className="text-sm font-medium text-gray-700">Subtotal</span>
                  <span className="text-lg font-bold text-primary-600">${subtotal.toFixed(2)}</span>
                </div>
                <p className="text-xs text-gray-500 mt-1">
                  {quantity} × ${parseFloat(unitPrice).toFixed(2)}
                </p>
              </div>
            )}
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
              disabled={loading || loadingData}
              className="px-4 py-2 bg-primary-600 text-white rounded-lg hover:bg-primary-700 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {loading ? 'Adding...' : 'Add Item'}
            </button>
          </div>
        </form>
      </div>
    </div>
  )
}
