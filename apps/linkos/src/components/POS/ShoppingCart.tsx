import { useState } from 'react'
import {
  type POSTransaction,
  type POSTransactionItem,
  updateTransactionItemQuantity,
  removeTransactionItem,
} from '@wyalink/supabase-client'
import { FiTrash2, FiEdit2, FiCheck, FiX } from 'react-icons/fi'

interface ShoppingCartProps {
  items: POSTransactionItem[]
  transaction: POSTransaction | null
  onReload: () => void
}

export default function ShoppingCart({ items, transaction, onReload }: ShoppingCartProps) {
  const [editingItemId, setEditingItemId] = useState<string | null>(null)
  const [editQuantity, setEditQuantity] = useState(1)

  if (!transaction) {
    return (
      <div className="p-8 text-center text-gray-500">
        <p>No active transaction</p>
        <p className="text-sm mt-2">Select a customer and start a transaction to begin</p>
      </div>
    )
  }

  if (items.length === 0) {
    return (
      <div className="p-8 text-center text-gray-500">
        <p>Cart is empty</p>
        <p className="text-sm mt-2">Add items to continue</p>
      </div>
    )
  }

  const handleStartEdit = (item: POSTransactionItem) => {
    setEditingItemId(item.id)
    setEditQuantity(item.quantity)
  }

  const handleSaveEdit = async (item: POSTransactionItem) => {
    if (editQuantity === item.quantity) {
      setEditingItemId(null)
      return
    }

    const { error } = await updateTransactionItemQuantity(item.id, editQuantity)

    if (error) {
      alert('Error updating item: ' + error.message)
      return
    }

    setEditingItemId(null)
    onReload()
  }

  const handleCancelEdit = () => {
    setEditingItemId(null)
    setEditQuantity(1)
  }

  const handleRemoveItem = async (itemId: string) => {
    if (!confirm('Remove this item from the cart?')) return

    const { error } = await removeTransactionItem(itemId)

    if (error) {
      alert('Error removing item: ' + error.message)
      return
    }

    onReload()
  }

  // Calculate totals
  const subtotal = items.reduce((sum, item) => sum + item.subtotal, 0)
  const taxRate = 0.08 // 8% tax - should come from settings
  const tax = subtotal * taxRate
  const total = subtotal + tax

  return (
    <div className="flex flex-col h-full">
      {/* Cart Items */}
      <div className="flex-1 overflow-y-auto p-4">
        {items.map((item) => (
          <div key={item.id} className="mb-3 pb-3 border-b last:border-b-0">
            <div className="flex justify-between items-start">
              <div className="flex-1">
                <p className="font-medium text-gray-900">{item.item_name}</p>
                <p className="text-xs text-gray-500 mt-0.5">
                  {item.item_type === 'inventory' ? 'Device' : 'Plan'}
                </p>

                {editingItemId === item.id ? (
                  <div className="flex items-center gap-2 mt-2">
                    <span className="text-sm text-gray-600">Qty:</span>
                    <input
                      type="number"
                      min="1"
                      value={editQuantity}
                      onChange={(e) => setEditQuantity(parseInt(e.target.value) || 1)}
                      className="w-16 px-2 py-1 border rounded text-sm text-center"
                      autoFocus
                    />
                    <button
                      onClick={() => handleSaveEdit(item)}
                      className="p-1 text-green-600 hover:bg-green-50 rounded"
                      title="Save"
                    >
                      <FiCheck />
                    </button>
                    <button
                      onClick={handleCancelEdit}
                      className="p-1 text-gray-600 hover:bg-gray-50 rounded"
                      title="Cancel"
                    >
                      <FiX />
                    </button>
                  </div>
                ) : (
                  <div className="flex items-center gap-3 mt-1">
                    <p className="text-sm text-gray-600">
                      ${item.unit_price.toFixed(2)} × {item.quantity}
                    </p>
                    <button
                      onClick={() => handleStartEdit(item)}
                      className="p-1 text-blue-600 hover:bg-blue-50 rounded"
                      title="Edit quantity"
                    >
                      <FiEdit2 className="text-xs" />
                    </button>
                  </div>
                )}
              </div>

              <div className="flex items-start gap-2 ml-3">
                <div className="text-right">
                  <p className="font-medium text-gray-900">${item.subtotal.toFixed(2)}</p>
                </div>
                <button
                  onClick={() => handleRemoveItem(item.id)}
                  className="p-1 text-red-600 hover:bg-red-50 rounded"
                  title="Remove item"
                >
                  <FiTrash2 className="text-sm" />
                </button>
              </div>
            </div>
          </div>
        ))}
      </div>

      {/* Totals */}
      <div className="border-t bg-gray-50 p-4 space-y-2">
        <div className="flex justify-between text-sm">
          <span className="text-gray-600">Subtotal</span>
          <span className="font-medium">${subtotal.toFixed(2)}</span>
        </div>
        <div className="flex justify-between text-sm">
          <span className="text-gray-600">Tax ({(taxRate * 100).toFixed(0)}%)</span>
          <span className="font-medium">${tax.toFixed(2)}</span>
        </div>
        <div className="flex justify-between text-lg font-bold pt-2 border-t">
          <span>Total</span>
          <span className="text-blue-600">${total.toFixed(2)}</span>
        </div>
      </div>
    </div>
  )
}
