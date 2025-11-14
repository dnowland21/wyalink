import { useState, useEffect } from 'react'
import { Link } from 'react-router-dom'
import { getInventory, type Inventory, type InventoryType, type InventoryStatus } from '@wyalink/supabase-client'
import { Card } from '@wyalink/ui'
import InventoryModal from '../components/InventoryModal'

const typeColors: Record<InventoryType, string> = {
  phone: 'bg-blue-100 text-blue-800',
  tablet: 'bg-purple-100 text-purple-800',
  wearable: 'bg-pink-100 text-pink-800',
  hotspot: 'bg-orange-100 text-orange-800',
  accessory: 'bg-gray-100 text-gray-800',
  other: 'bg-gray-100 text-gray-800',
}

const statusColors: Record<InventoryStatus, string> = {
  available: 'bg-green-100 text-green-800',
  reserved: 'bg-yellow-100 text-yellow-800',
  sold: 'bg-blue-100 text-blue-800',
  returned: 'bg-orange-100 text-orange-800',
  damaged: 'bg-red-100 text-red-800',
  obsolete: 'bg-gray-100 text-gray-800',
}

export default function InventoryPage() {
  const [inventory, setInventory] = useState<Inventory[]>([])
  const [filteredInventory, setFilteredInventory] = useState<Inventory[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  // Modal state
  const [isModalOpen, setIsModalOpen] = useState(false)
  const [selectedInventory, setSelectedInventory] = useState<Inventory | null>(null)

  // Filters
  const [typeFilter, setTypeFilter] = useState<string>('all')
  const [statusFilter, setStatusFilter] = useState<string>('all')
  const [searchQuery, setSearchQuery] = useState('')

  // Stats
  const [stats, setStats] = useState({
    total: 0,
    available: 0,
    reserved: 0,
    sold: 0,
    totalValue: 0,
  })

  // Fetch inventory
  const fetchInventory = async () => {
    setLoading(true)
    setError(null)

    try {
      const result = await getInventory()

      if (result.error) throw result.error

      const inventoryData = result.data || []
      setInventory(inventoryData)

      // Calculate stats
      const totalValue = inventoryData.reduce(
        (sum, item) => sum + (item.retail_price || 0) * item.quantity_on_hand,
        0
      )

      setStats({
        total: inventoryData.reduce((sum, item) => sum + item.quantity_on_hand, 0),
        available: inventoryData
          .filter((i) => i.status === 'available')
          .reduce((sum, item) => sum + item.quantity_on_hand, 0),
        reserved: inventoryData
          .filter((i) => i.status === 'reserved')
          .reduce((sum, item) => sum + item.quantity_on_hand, 0),
        sold: inventoryData.filter((i) => i.status === 'sold').length,
        totalValue,
      })
    } catch (err: any) {
      setError('Failed to load inventory')
      console.error(err)
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    fetchInventory()
  }, [])

  // Apply filters
  useEffect(() => {
    let filtered = [...inventory]

    // Type filter
    if (typeFilter !== 'all') {
      filtered = filtered.filter((item) => item.type === typeFilter)
    }

    // Status filter
    if (statusFilter !== 'all') {
      filtered = filtered.filter((item) => item.status === statusFilter)
    }

    // Search filter
    if (searchQuery) {
      const query = searchQuery.toLowerCase()
      filtered = filtered.filter(
        (item) =>
          item.item_name.toLowerCase().includes(query) ||
          item.item_description?.toLowerCase().includes(query) ||
          item.item_number?.toLowerCase().includes(query) ||
          item.brand?.toLowerCase().includes(query)
      )
    }

    setFilteredInventory(filtered)
  }, [inventory, typeFilter, statusFilter, searchQuery])

  const formatPrice = (price: number | null | undefined) => {
    if (price === null || price === undefined) return 'N/A'
    return `$${price.toFixed(2)}`
  }

  const handleOpenCreateModal = () => {
    setSelectedInventory(null)
    setIsModalOpen(true)
  }

  const handleOpenEditModal = (item: Inventory) => {
    setSelectedInventory(item)
    setIsModalOpen(true)
  }

  const handleCloseModal = (shouldRefresh?: boolean) => {
    setIsModalOpen(false)
    setSelectedInventory(null)
    if (shouldRefresh) {
      fetchInventory()
    }
  }

  return (
    <div>
      {/* Header */}
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-gray-900">Inventory</h1>
        <p className="text-gray-600 mt-1">Manage devices, accessories, and stock</p>
      </div>

      {/* Stats Grid */}
      <div className="grid grid-cols-2 md:grid-cols-5 gap-4 mb-8">
        <Card>
          <div className="text-sm text-gray-600">Total Items</div>
          <div className="text-2xl font-bold text-gray-900 mt-1">{stats.total}</div>
        </Card>
        <Card>
          <div className="text-sm text-gray-600">Available</div>
          <div className="text-2xl font-bold text-green-600 mt-1">{stats.available}</div>
        </Card>
        <Card>
          <div className="text-sm text-gray-600">Reserved</div>
          <div className="text-2xl font-bold text-yellow-600 mt-1">{stats.reserved}</div>
        </Card>
        <Card>
          <div className="text-sm text-gray-600">Sold</div>
          <div className="text-2xl font-bold text-blue-600 mt-1">{stats.sold}</div>
        </Card>
        <Card>
          <div className="text-sm text-gray-600">Total Value</div>
          <div className="text-2xl font-bold text-primary-600 mt-1">{formatPrice(stats.totalValue)}</div>
        </Card>
      </div>

      {/* Error Message */}
      {error && (
        <div className="bg-red-50 border border-red-200 rounded-lg p-4 mb-6">
          <p className="text-sm text-red-800">{error}</p>
        </div>
      )}

      {/* Inventory Table */}
      <Card>
        <div className="flex items-center justify-between mb-6">
          <h3 className="text-lg font-semibold text-gray-900">All Items</h3>
          <div className="flex items-center gap-3">
            <div className="relative">
              <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                <svg className="h-5 w-5 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z"
                  />
                </svg>
              </div>
              <input
                type="text"
                placeholder="Search inventory..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="block w-64 pl-10 pr-3 py-2 border border-gray-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-primary-500 focus:border-transparent"
              />
            </div>
            <select
              value={typeFilter}
              onChange={(e) => setTypeFilter(e.target.value)}
              className="text-sm border border-gray-300 rounded-lg px-3 py-2 focus:outline-none focus:ring-2 focus:ring-primary-500"
            >
              <option value="all">All Types</option>
              <option value="phone">Phones</option>
              <option value="tablet">Tablets</option>
              <option value="wearable">Wearables</option>
              <option value="hotspot">Hotspots</option>
              <option value="accessory">Accessories</option>
              <option value="other">Other</option>
            </select>
            <select
              value={statusFilter}
              onChange={(e) => setStatusFilter(e.target.value)}
              className="text-sm border border-gray-300 rounded-lg px-3 py-2 focus:outline-none focus:ring-2 focus:ring-primary-500"
            >
              <option value="all">All Status</option>
              <option value="available">Available</option>
              <option value="reserved">Reserved</option>
              <option value="sold">Sold</option>
              <option value="returned">Returned</option>
              <option value="damaged">Damaged</option>
              <option value="obsolete">Obsolete</option>
            </select>
            <button
              onClick={handleOpenCreateModal}
              className="px-4 py-2 bg-primary-800 text-white rounded-lg hover:bg-primary-700 transition-colors text-sm font-medium"
            >
              + Add Item
            </button>
          </div>
        </div>

        {loading ? (
          <div className="p-8 text-center text-gray-600">Loading inventory...</div>
        ) : filteredInventory.length === 0 ? (
          <div className="p-8 text-center text-gray-600">
            {searchQuery || typeFilter !== 'all' || statusFilter !== 'all'
              ? 'No items found matching your filters'
              : 'No inventory yet'}
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead>
                <tr className="border-b border-gray-200">
                  <th className="text-left py-3 px-4 text-sm font-semibold text-gray-700">Item</th>
                  <th className="text-left py-3 px-4 text-sm font-semibold text-gray-700">Type</th>
                  <th className="text-left py-3 px-4 text-sm font-semibold text-gray-700">Brand</th>
                  <th className="text-left py-3 px-4 text-sm font-semibold text-gray-700">Specs</th>
                  <th className="text-left py-3 px-4 text-sm font-semibold text-gray-700">Quantity</th>
                  <th className="text-left py-3 px-4 text-sm font-semibold text-gray-700">Cost</th>
                  <th className="text-left py-3 px-4 text-sm font-semibold text-gray-700">Retail</th>
                  <th className="text-left py-3 px-4 text-sm font-semibold text-gray-700">Status</th>
                  <th className="text-left py-3 px-4 text-sm font-semibold text-gray-700">Actions</th>
                </tr>
              </thead>
              <tbody>
                {filteredInventory.map((item) => (
                  <tr key={item.id} className="border-b border-gray-100 hover:bg-gray-50 transition-colors">
                    <td className="py-4 px-4">
                      <div className="flex flex-col">
                        <span className="text-sm font-semibold text-gray-900">{item.item_name}</span>
                        {item.item_description && (
                          <span className="text-xs text-gray-500 line-clamp-1">{item.item_description}</span>
                        )}
                        {item.item_number && <span className="text-xs text-gray-500">#{item.item_number}</span>}
                      </div>
                    </td>
                    <td className="py-4 px-4">
                      <span className={`px-2 py-1 rounded-full text-xs font-medium ${typeColors[item.type]}`}>
                        {item.type.charAt(0).toUpperCase() + item.type.slice(1)}
                      </span>
                    </td>
                    <td className="py-4 px-4">
                      <span className="text-sm text-gray-700">{item.brand || '-'}</span>
                    </td>
                    <td className="py-4 px-4">
                      <div className="text-xs text-gray-600">
                        {item.storage && <div>Storage: {item.storage}</div>}
                        {item.color && <div>Color: {item.color}</div>}
                        {!item.storage && !item.color && <span className="text-gray-400">-</span>}
                      </div>
                    </td>
                    <td className="py-4 px-4">
                      <span
                        className={`text-sm font-semibold ${
                          item.quantity_on_hand === 0
                            ? 'text-red-600'
                            : item.quantity_on_hand < 10
                            ? 'text-yellow-600'
                            : 'text-green-600'
                        }`}
                      >
                        {item.quantity_on_hand}
                      </span>
                    </td>
                    <td className="py-4 px-4">
                      <span className="text-sm text-gray-700">{formatPrice(item.cost)}</span>
                    </td>
                    <td className="py-4 px-4">
                      <span className="text-sm font-semibold text-gray-900">{formatPrice(item.retail_price)}</span>
                    </td>
                    <td className="py-4 px-4">
                      <span className={`px-2 py-1 rounded-full text-xs font-medium ${statusColors[item.status]}`}>
                        {item.status.charAt(0).toUpperCase() + item.status.slice(1)}
                      </span>
                    </td>
                    <td className="py-4 px-4">
                      <div className="flex items-center gap-2">
                        <Link
                          to={`/inventory/${item.id}`}
                          className="px-3 py-1.5 text-sm bg-primary-800 text-white rounded-lg hover:bg-primary-700 transition-colors"
                        >
                          View
                        </Link>
                        <button
                          onClick={() => handleOpenEditModal(item)}
                          className="px-3 py-1.5 text-sm bg-gray-100 text-gray-700 rounded-lg hover:bg-gray-200 transition-colors"
                        >
                          Edit
                        </button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </Card>

      {/* Inventory Modal */}
      <InventoryModal
        isOpen={isModalOpen}
        onClose={handleCloseModal}
        inventory={selectedInventory}
      />
    </div>
  )
}
