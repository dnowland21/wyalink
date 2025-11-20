import { useState, useEffect } from 'react'
import { Link } from 'react-router-dom'
import { getInventory, type Inventory, type InventoryType, type InventoryStatus } from '@wyalink/supabase-client'
import { Card, CardHeader, CardTitle, CardContent } from '../components/ui/card'
import { Badge } from '../components/ui/badge'
import { Button } from '../components/ui/button'
import { Input } from '../components/ui/input'
import { Search, Plus } from 'lucide-react'
import InventoryModal from '../components/InventoryModal'

const typeColors: Record<InventoryType, string> = {
  phone: 'info',
  tablet: 'secondary',
  wearable: 'secondary',
  hotspot: 'warning',
  accessory: 'default',
  other: 'default',
}

const statusColors: Record<InventoryStatus, string> = {
  available: 'success',
  reserved: 'warning',
  sold: 'info',
  returned: 'warning',
  damaged: 'error',
  obsolete: 'default',
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
          <CardContent className="p-6">
            <div className="text-sm text-muted-foreground">Total Items</div>
            <div className="text-2xl font-bold mt-1">{stats.total}</div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-6">
            <div className="text-sm text-muted-foreground">Available</div>
            <div className="text-2xl font-bold text-success mt-1">{stats.available}</div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-6">
            <div className="text-sm text-muted-foreground">Reserved</div>
            <div className="text-2xl font-bold text-warning mt-1">{stats.reserved}</div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-6">
            <div className="text-sm text-muted-foreground">Sold</div>
            <div className="text-2xl font-bold text-info mt-1">{stats.sold}</div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-6">
            <div className="text-sm text-muted-foreground">Total Value</div>
            <div className="text-2xl font-bold text-primary mt-1">{formatPrice(stats.totalValue)}</div>
          </CardContent>
        </Card>
      </div>

      {/* Error Message */}
      {error && (
        <div className="bg-error-50 border border-error-200 rounded-lg p-4 mb-6">
          <p className="text-sm text-error-800">{error}</p>
        </div>
      )}

      {/* Inventory Table */}
      <Card>
        <CardHeader>
          <div className="flex items-center justify-between">
            <CardTitle className="text-lg">All Items</CardTitle>
            <div className="flex items-center gap-3">
              <div className="relative">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground pointer-events-none" />
                <Input
                  type="text"
                  placeholder="Search inventory..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="w-64 pl-9"
                />
              </div>
              <select
                value={typeFilter}
                onChange={(e) => setTypeFilter(e.target.value)}
                className="text-sm border border-input rounded-md px-3 py-2 h-10 focus:outline-none focus:ring-2 focus:ring-ring"
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
                className="text-sm border border-input rounded-md px-3 py-2 h-10 focus:outline-none focus:ring-2 focus:ring-ring"
              >
                <option value="all">All Status</option>
                <option value="available">Available</option>
                <option value="reserved">Reserved</option>
                <option value="sold">Sold</option>
                <option value="returned">Returned</option>
                <option value="damaged">Damaged</option>
                <option value="obsolete">Obsolete</option>
              </select>
              <Button onClick={handleOpenCreateModal}>
                <Plus className="h-4 w-4 mr-2" />
                Add Item
              </Button>
            </div>
          </div>
        </CardHeader>
        <CardContent>
          {loading ? (
            <div className="p-8 text-center text-muted-foreground">Loading inventory...</div>
          ) : filteredInventory.length === 0 ? (
            <div className="p-8 text-center text-muted-foreground">
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
                        <Badge variant={typeColors[item.type] as any}>
                          {item.type.charAt(0).toUpperCase() + item.type.slice(1)}
                        </Badge>
                      </td>
                      <td className="py-4 px-4">
                        <span className="text-sm text-gray-700">{item.brand || '-'}</span>
                      </td>
                      <td className="py-4 px-4">
                        <div className="text-xs text-gray-600">
                          {item.storage && <div>Storage: {item.storage}</div>}
                          {item.color && <div>Color: {item.color}</div>}
                          {!item.storage && !item.color && <span className="text-muted-foreground">-</span>}
                        </div>
                      </td>
                      <td className="py-4 px-4">
                        <span
                          className={`text-sm font-semibold ${
                            item.quantity_on_hand === 0
                              ? 'text-error'
                              : item.quantity_on_hand < 10
                              ? 'text-warning'
                              : 'text-success'
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
                        <Badge variant={statusColors[item.status] as any}>
                          {item.status.charAt(0).toUpperCase() + item.status.slice(1)}
                        </Badge>
                      </td>
                      <td className="py-4 px-4">
                        <div className="flex items-center gap-2">
                          <Button size="sm" asChild>
                            <Link to={`/inventory/${item.id}`}>
                              View
                            </Link>
                          </Button>
                          <Button
                            variant="outline"
                            size="sm"
                            onClick={() => handleOpenEditModal(item)}
                          >
                            Edit
                          </Button>
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </CardContent>
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
