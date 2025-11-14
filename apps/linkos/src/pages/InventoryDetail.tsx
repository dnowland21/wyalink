import { useState, useEffect } from 'react'
import { useParams, useNavigate, Link } from 'react-router-dom'
import {
  getInventoryItem,
  getInventorySerials,
  type Inventory,
  type InventorySerial,
  type InventoryStatus,
} from '@wyalink/supabase-client'
import { Card } from '@wyalink/ui'
import InventoryModal from '../components/InventoryModal'
import AddSerialsModal from '../components/AddSerialsModal'

const statusColors: Record<InventoryStatus, string> = {
  available: 'bg-green-100 text-green-800',
  reserved: 'bg-yellow-100 text-yellow-800',
  sold: 'bg-blue-100 text-blue-800',
  returned: 'bg-orange-100 text-orange-800',
  damaged: 'bg-red-100 text-red-800',
  obsolete: 'bg-gray-100 text-gray-800',
}

const serialStatusColors = {
  available: 'bg-green-100 text-green-800',
  reserved: 'bg-yellow-100 text-yellow-800',
  sold: 'bg-blue-100 text-blue-800',
  returned: 'bg-orange-100 text-orange-800',
  damaged: 'bg-red-100 text-red-800',
  obsolete: 'bg-gray-100 text-gray-800',
}

export default function InventoryDetail() {
  const { id } = useParams<{ id: string }>()
  const navigate = useNavigate()

  const [item, setItem] = useState<Inventory | null>(null)
  const [serials, setSerials] = useState<InventorySerial[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [isEditModalOpen, setIsEditModalOpen] = useState(false)
  const [isAddSerialsModalOpen, setIsAddSerialsModalOpen] = useState(false)
  const [activeTab, setActiveTab] = useState<'details' | 'serials'>('details')

  useEffect(() => {
    if (!id) {
      navigate('/inventory')
      return
    }

    fetchItemData()
  }, [id])

  const handleEditModalClose = (shouldRefresh?: boolean) => {
    setIsEditModalOpen(false)
    if (shouldRefresh) {
      fetchItemData()
    }
  }

  const handleAddSerialsModalClose = (shouldRefresh?: boolean) => {
    setIsAddSerialsModalOpen(false)
    if (shouldRefresh) {
      fetchItemData()
    }
  }

  const fetchItemData = async () => {
    if (!id) return

    setLoading(true)
    setError(null)

    try {
      // Fetch inventory item
      const itemResult = await getInventoryItem(id)
      if (itemResult.error) throw itemResult.error
      if (!itemResult.data) throw new Error('Inventory item not found')

      setItem(itemResult.data)

      // Fetch serials if this item has serial tracking enabled
      if (itemResult.data.track_serial_numbers) {
        const serialsResult = await getInventorySerials(id)
        if (serialsResult.error) console.error('Failed to load serials:', serialsResult.error)
        setSerials(serialsResult.data || [])
      }
    } catch (err: any) {
      setError(err.message || 'Failed to load inventory item')
      console.error(err)
    } finally {
      setLoading(false)
    }
  }

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('en-US', {
      month: 'short',
      day: 'numeric',
      year: 'numeric',
    })
  }

  const formatPrice = (price: number | null | undefined) => {
    if (price === null || price === undefined || isNaN(price)) {
      return '$0.00'
    }
    return `$${price.toFixed(2)}`
  }

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="text-gray-600">Loading inventory item...</div>
      </div>
    )
  }

  if (error || !item) {
    return (
      <div className="max-w-4xl mx-auto mt-8">
        <div className="bg-red-50 border border-red-200 rounded-lg p-6">
          <p className="text-red-800">{error || 'Inventory item not found'}</p>
          <Link to="/inventory" className="text-primary-600 hover:text-primary-700 mt-4 inline-block">
            &larr; Back to Inventory
          </Link>
        </div>
      </div>
    )
  }

  return (
    <div>
      {/* Header */}
      <div className="mb-8">
        <div className="flex items-center gap-3 mb-2">
          <Link
            to="/inventory"
            className="text-gray-500 hover:text-gray-700 transition-colors"
            title="Back to Inventory"
          >
            <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
            </svg>
          </Link>
          <div className="flex-1">
            <div className="flex items-center gap-3">
              <div className="w-14 h-14 bg-gradient-to-br from-primary-500 to-primary-700 rounded-xl flex items-center justify-center text-white font-bold text-xl">
                {item.item_name[0]}
              </div>
              <div>
                <h1 className="text-3xl font-bold text-gray-900">{item.item_name}</h1>
                <p className="text-gray-600 font-mono">{item.item_number}</p>
              </div>
            </div>
          </div>
          <button
            onClick={() => setIsEditModalOpen(true)}
            className="px-4 py-2 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 transition-colors"
          >
            Edit Item
          </button>
        </div>
      </div>

      {/* Status Badge */}
      <div className="flex items-center gap-3 mb-6">
        <span className={`px-3 py-1 rounded-full text-sm font-medium ${statusColors[item.status]}`}>
          {item.status.charAt(0).toUpperCase() + item.status.slice(1)}
        </span>
        {item.type && (
          <span className="px-3 py-1 rounded-full text-sm font-medium bg-gray-100 text-gray-800">
            {item.type.charAt(0).toUpperCase() + item.type.slice(1)}
          </span>
        )}
      </div>

      {/* Tabs */}
      <div className="border-b border-gray-200 mb-6">
        <div className="flex gap-6">
          <button
            onClick={() => setActiveTab('details')}
            className={`pb-3 px-1 border-b-2 font-medium transition-colors ${
              activeTab === 'details'
                ? 'border-primary-600 text-primary-600'
                : 'border-transparent text-gray-600 hover:text-gray-900'
            }`}
          >
            Details
          </button>
          {item.track_serial_numbers && (
            <button
              onClick={() => setActiveTab('serials')}
              className={`pb-3 px-1 border-b-2 font-medium transition-colors ${
                activeTab === 'serials'
                  ? 'border-primary-600 text-primary-600'
                  : 'border-transparent text-gray-600 hover:text-gray-900'
              }`}
            >
              Serial Numbers ({serials.length})
            </button>
          )}
        </div>
      </div>

      {/* Tab Content */}
      {activeTab === 'details' && (
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {/* Item Information */}
          <Card>
            <h3 className="text-lg font-semibold text-gray-900 mb-4">Item Information</h3>
            <div className="space-y-3">
              <div>
                <label className="text-sm font-medium text-gray-600">Item Name</label>
                <p className="text-gray-900">{item.item_name}</p>
              </div>
              <div>
                <label className="text-sm font-medium text-gray-600">Item Number</label>
                <p className="text-gray-900 font-mono">{item.item_number}</p>
              </div>
              {item.item_description && (
                <div>
                  <label className="text-sm font-medium text-gray-600">Description</label>
                  <p className="text-gray-900">{item.item_description}</p>
                </div>
              )}
              {item.brand && (
                <div>
                  <label className="text-sm font-medium text-gray-600">Brand</label>
                  <p className="text-gray-900">{item.brand}</p>
                </div>
              )}
              {item.model && (
                <div>
                  <label className="text-sm font-medium text-gray-600">Model</label>
                  <p className="text-gray-900">{item.model}</p>
                </div>
              )}
              {item.sku && (
                <div>
                  <label className="text-sm font-medium text-gray-600">SKU</label>
                  <p className="text-gray-900 font-mono">{item.sku}</p>
                </div>
              )}
            </div>
          </Card>

          {/* Pricing */}
          <Card>
            <h3 className="text-lg font-semibold text-gray-900 mb-4">Pricing</h3>
            <div className="space-y-3">
              <div>
                <label className="text-sm font-medium text-gray-600">Cost Per Unit</label>
                <p className="text-gray-900 text-xl font-semibold">{formatPrice(item.cost_per_unit)}</p>
              </div>
              {item.retail_price && (
                <div>
                  <label className="text-sm font-medium text-gray-600">Retail Price</label>
                  <p className="text-gray-900 text-xl font-semibold">{formatPrice(item.retail_price)}</p>
                </div>
              )}
              <div className="pt-3 border-t">
                <label className="text-sm font-medium text-gray-600">Total Value</label>
                <p className="text-gray-900 text-2xl font-bold text-primary-600">
                  {formatPrice(item.cost_per_unit * item.quantity_on_hand)}
                </p>
                <p className="text-xs text-gray-500 mt-1">
                  Based on {item.quantity_on_hand} units at {formatPrice(item.cost_per_unit)} each
                </p>
              </div>
            </div>
          </Card>

          {/* Stock Information */}
          <Card>
            <h3 className="text-lg font-semibold text-gray-900 mb-4">Stock Information</h3>
            <div className="space-y-3">
              <div>
                <label className="text-sm font-medium text-gray-600">Quantity on Hand</label>
                <p className="text-gray-900 text-2xl font-bold">{item.quantity_on_hand}</p>
              </div>
              {item.reorder_point !== null && (
                <div>
                  <label className="text-sm font-medium text-gray-600">Reorder Point</label>
                  <p className="text-gray-900">{item.reorder_point}</p>
                  {item.quantity_on_hand <= item.reorder_point && (
                    <p className="text-xs text-red-600 mt-1 font-medium">
                      ⚠️ Below reorder point - consider restocking
                    </p>
                  )}
                </div>
              )}
              {item.reorder_quantity !== null && (
                <div>
                  <label className="text-sm font-medium text-gray-600">Reorder Quantity</label>
                  <p className="text-gray-900">{item.reorder_quantity}</p>
                </div>
              )}
              <div>
                <label className="text-sm font-medium text-gray-600">Serial Number Tracking</label>
                <p className="text-gray-900">{item.track_serial_numbers ? 'Enabled' : 'Disabled'}</p>
              </div>
            </div>
          </Card>

          {/* Additional Details */}
          <Card>
            <h3 className="text-lg font-semibold text-gray-900 mb-4">Additional Details</h3>
            <div className="space-y-3">
              <div>
                <label className="text-sm font-medium text-gray-600">Type</label>
                <p className="text-gray-900">{item.type.charAt(0).toUpperCase() + item.type.slice(1)}</p>
              </div>
              <div>
                <label className="text-sm font-medium text-gray-600">Status</label>
                <p className="text-gray-900">{item.status.charAt(0).toUpperCase() + item.status.slice(1)}</p>
              </div>
              <div>
                <label className="text-sm font-medium text-gray-600">Created</label>
                <p className="text-gray-900">{formatDate(item.created_at)}</p>
              </div>
              <div>
                <label className="text-sm font-medium text-gray-600">Last Updated</label>
                <p className="text-gray-900">{formatDate(item.updated_at)}</p>
              </div>
            </div>
          </Card>
        </div>
      )}

      {activeTab === 'serials' && item.track_serial_numbers && (
        <div>
          <div className="flex items-center justify-between mb-6">
            <div>
              <h3 className="text-lg font-semibold text-gray-900">Serial Number Tracking</h3>
              <p className="text-sm text-gray-600 mt-1">
                Track individual units by serial number and IMEI (FIFO - First In, First Out)
              </p>
            </div>
            <button
              onClick={() => setIsAddSerialsModalOpen(true)}
              className="px-4 py-2 bg-primary-800 text-white rounded-lg hover:bg-primary-700 transition-colors text-sm font-medium"
            >
              + Add Serials
            </button>
          </div>

          {/* Serial Stats */}
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-6">
            <Card>
              <div className="text-sm text-gray-600">Total Serials</div>
              <div className="text-2xl font-bold text-gray-900 mt-1">{serials.length}</div>
            </Card>
            <Card>
              <div className="text-sm text-gray-600">Available</div>
              <div className="text-2xl font-bold text-green-600 mt-1">
                {serials.filter((s) => s.status === 'available').length}
              </div>
            </Card>
            <Card>
              <div className="text-sm text-gray-600">Reserved</div>
              <div className="text-2xl font-bold text-yellow-600 mt-1">
                {serials.filter((s) => s.status === 'reserved').length}
              </div>
            </Card>
            <Card>
              <div className="text-sm text-gray-600">Sold</div>
              <div className="text-2xl font-bold text-blue-600 mt-1">
                {serials.filter((s) => s.status === 'sold').length}
              </div>
            </Card>
          </div>

          {serials.length === 0 ? (
            <Card>
              <div className="text-center py-8 text-gray-600">
                No serial numbers tracked yet. Add serials to begin tracking individual units.
              </div>
            </Card>
          ) : (
            <Card>
              <div className="overflow-x-auto">
                <table className="w-full">
                  <thead>
                    <tr className="border-b border-gray-200">
                      <th className="text-left py-3 px-4 text-sm font-semibold text-gray-700">Serial Number</th>
                      <th className="text-left py-3 px-4 text-sm font-semibold text-gray-700">IMEI</th>
                      <th className="text-left py-3 px-4 text-sm font-semibold text-gray-700">Status</th>
                      <th className="text-left py-3 px-4 text-sm font-semibold text-gray-700">Received</th>
                      <th className="text-left py-3 px-4 text-sm font-semibold text-gray-700">Assigned</th>
                      <th className="text-left py-3 px-4 text-sm font-semibold text-gray-700">Actions</th>
                    </tr>
                  </thead>
                  <tbody>
                    {serials.map((serial) => (
                      <tr key={serial.id} className="border-b border-gray-100 hover:bg-gray-50 transition-colors">
                        <td className="py-4 px-4">
                          <span className="text-sm font-mono font-semibold text-gray-900">
                            {serial.serial_number}
                          </span>
                        </td>
                        <td className="py-4 px-4">
                          <span className="text-sm font-mono text-gray-900">{serial.imei || '-'}</span>
                        </td>
                        <td className="py-4 px-4">
                          <span
                            className={`px-2 py-1 rounded-full text-xs font-medium ${
                              serialStatusColors[serial.status as keyof typeof serialStatusColors]
                            }`}
                          >
                            {serial.status.charAt(0).toUpperCase() + serial.status.slice(1)}
                          </span>
                        </td>
                        <td className="py-4 px-4">
                          <span className="text-sm text-gray-600">
                            {serial.received_at ? formatDate(serial.received_at) : '-'}
                          </span>
                        </td>
                        <td className="py-4 px-4">
                          <span className="text-sm text-gray-600">
                            {serial.assigned_at ? formatDate(serial.assigned_at) : '-'}
                          </span>
                        </td>
                        <td className="py-4 px-4">
                          {serial.status === 'available' && (
                            <button className="px-3 py-1.5 text-sm bg-primary-800 text-white rounded-lg hover:bg-primary-700 transition-colors">
                              Assign
                            </button>
                          )}
                          {serial.assigned_to && (
                            <Link
                              to={`/customers/${serial.assigned_to}`}
                              className="px-3 py-1.5 text-sm bg-gray-100 text-gray-700 rounded-lg hover:bg-gray-200 transition-colors inline-block"
                            >
                              View Customer
                            </Link>
                          )}
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </Card>
          )}
        </div>
      )}

      {/* Edit Modal */}
      <InventoryModal isOpen={isEditModalOpen} onClose={handleEditModalClose} inventory={item} />

      {/* Add Serials Modal */}
      {item && (
        <AddSerialsModal
          isOpen={isAddSerialsModalOpen}
          onClose={handleAddSerialsModalClose}
          inventoryId={item.id}
        />
      )}
    </div>
  )
}
