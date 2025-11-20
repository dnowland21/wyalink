import { useState, useEffect } from 'react'
import { useParams, useNavigate, Link } from 'react-router-dom'
import {
  getInventoryItem,
  getInventorySerials,
  type Inventory,
  type InventorySerial,
  type InventoryStatus,
} from '@wyalink/supabase-client'
import { Card, CardHeader, CardTitle, CardContent } from '../components/ui/card'
import { Badge } from '../components/ui/badge'
import { Button } from '../components/ui/button'
import { ChevronLeft, Edit, Plus, AlertCircle } from 'lucide-react'
import InventoryModal from '../components/InventoryModal'
import AddSerialsModal from '../components/AddSerialsModal'

const statusVariants: Record<InventoryStatus, 'success' | 'warning' | 'info' | 'error' | 'default' | 'secondary'> = {
  available: 'success',
  reserved: 'warning',
  sold: 'info',
  returned: 'secondary',
  damaged: 'error',
  obsolete: 'default',
}

const serialStatusVariants: Record<string, 'success' | 'warning' | 'info' | 'error' | 'default' | 'secondary'> = {
  available: 'success',
  reserved: 'warning',
  sold: 'info',
  returned: 'secondary',
  damaged: 'error',
  obsolete: 'default',
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
        <div className="text-muted-foreground">Loading inventory item...</div>
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
            className="text-muted-foreground hover:text-foreground transition-colors"
            title="Back to Inventory"
          >
            <ChevronLeft className="w-6 h-6" />
          </Link>
          <div className="flex-1">
            <div className="flex items-center gap-3">
              <div className="w-14 h-14 bg-gradient-to-br from-primary-500 to-primary-700 rounded-xl flex items-center justify-center text-white font-bold text-xl">
                {item.item_name[0]}
              </div>
              <div>
                <h1 className="text-3xl font-bold text-foreground">{item.item_name}</h1>
                <p className="text-muted-foreground font-mono">{item.item_number}</p>
              </div>
            </div>
          </div>
          <Button variant="outline" onClick={() => setIsEditModalOpen(true)}>
            <Edit className="w-4 h-4 mr-2" />
            Edit Item
          </Button>
        </div>
      </div>

      {/* Status Badge */}
      <div className="flex items-center gap-3 mb-6">
        <Badge variant={statusVariants[item.status]}>
          {item.status.charAt(0).toUpperCase() + item.status.slice(1)}
        </Badge>
        {item.type && (
          <Badge variant="default">
            {item.type.charAt(0).toUpperCase() + item.type.slice(1)}
          </Badge>
        )}
      </div>

      {/* Tabs */}
      <div className="border-b border-border mb-6">
        <div className="flex gap-6">
          <button
            onClick={() => setActiveTab('details')}
            className={`pb-3 px-1 border-b-2 font-medium transition-colors ${
              activeTab === 'details'
                ? 'border-primary text-primary'
                : 'border-transparent text-muted-foreground hover:text-foreground'
            }`}
          >
            Details
          </button>
          {item.track_serial_numbers && (
            <button
              onClick={() => setActiveTab('serials')}
              className={`pb-3 px-1 border-b-2 font-medium transition-colors ${
                activeTab === 'serials'
                  ? 'border-primary text-primary'
                  : 'border-transparent text-muted-foreground hover:text-foreground'
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
            <CardHeader>
              <CardTitle>Item Information</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-3">
                <div>
                  <label className="text-sm font-medium text-muted-foreground">Item Name</label>
                  <p className="text-foreground">{item.item_name}</p>
                </div>
                <div>
                  <label className="text-sm font-medium text-muted-foreground">Item Number</label>
                  <p className="text-foreground font-mono">{item.item_number}</p>
                </div>
                {item.item_description && (
                  <div>
                    <label className="text-sm font-medium text-muted-foreground">Description</label>
                    <p className="text-foreground">{item.item_description}</p>
                  </div>
                )}
                {item.brand && (
                  <div>
                    <label className="text-sm font-medium text-muted-foreground">Brand</label>
                    <p className="text-foreground">{item.brand}</p>
                  </div>
                )}
                {item.model && (
                  <div>
                    <label className="text-sm font-medium text-muted-foreground">Model</label>
                    <p className="text-foreground">{item.model}</p>
                  </div>
                )}
                {item.sku && (
                  <div>
                    <label className="text-sm font-medium text-muted-foreground">SKU</label>
                    <p className="text-foreground font-mono">{item.sku}</p>
                  </div>
                )}
              </div>
            </CardContent>
          </Card>

          {/* Pricing */}
          <Card>
            <CardHeader>
              <CardTitle>Pricing</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-3">
                <div>
                  <label className="text-sm font-medium text-muted-foreground">Cost Per Unit</label>
                  <p className="text-foreground text-xl font-semibold">{formatPrice(item.cost_per_unit)}</p>
                </div>
                {item.retail_price && (
                  <div>
                    <label className="text-sm font-medium text-muted-foreground">Retail Price</label>
                    <p className="text-foreground text-xl font-semibold">{formatPrice(item.retail_price)}</p>
                  </div>
                )}
                <div className="pt-3 border-t">
                  <label className="text-sm font-medium text-muted-foreground">Total Value</label>
                  <p className="text-foreground text-2xl font-bold text-primary">
                    {formatPrice(item.cost_per_unit * item.quantity_on_hand)}
                  </p>
                  <p className="text-xs text-muted-foreground mt-1">
                    Based on {item.quantity_on_hand} units at {formatPrice(item.cost_per_unit)} each
                  </p>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Stock Information */}
          <Card>
            <CardHeader>
              <CardTitle>Stock Information</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-3">
                <div>
                  <label className="text-sm font-medium text-muted-foreground">Quantity on Hand</label>
                  <p className="text-foreground text-2xl font-bold">{item.quantity_on_hand}</p>
                </div>
                {item.reorder_point !== null && (
                  <div>
                    <label className="text-sm font-medium text-muted-foreground">Reorder Point</label>
                    <p className="text-foreground">{item.reorder_point}</p>
                    {item.quantity_on_hand <= item.reorder_point && (
                      <div className="flex items-center gap-1 text-xs text-destructive mt-1 font-medium">
                        <AlertCircle className="w-3 h-3" />
                        Below reorder point - consider restocking
                      </div>
                    )}
                  </div>
                )}
                {item.reorder_quantity !== null && (
                  <div>
                    <label className="text-sm font-medium text-muted-foreground">Reorder Quantity</label>
                    <p className="text-foreground">{item.reorder_quantity}</p>
                  </div>
                )}
                <div>
                  <label className="text-sm font-medium text-muted-foreground">Serial Number Tracking</label>
                  <p className="text-foreground">{item.track_serial_numbers ? 'Enabled' : 'Disabled'}</p>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Additional Details */}
          <Card>
            <CardHeader>
              <CardTitle>Additional Details</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-3">
                <div>
                  <label className="text-sm font-medium text-muted-foreground">Type</label>
                  <p className="text-foreground">{item.type.charAt(0).toUpperCase() + item.type.slice(1)}</p>
                </div>
                <div>
                  <label className="text-sm font-medium text-muted-foreground">Status</label>
                  <p className="text-foreground">{item.status.charAt(0).toUpperCase() + item.status.slice(1)}</p>
                </div>
                <div>
                  <label className="text-sm font-medium text-muted-foreground">Created</label>
                  <p className="text-foreground">{formatDate(item.created_at)}</p>
                </div>
                <div>
                  <label className="text-sm font-medium text-muted-foreground">Last Updated</label>
                  <p className="text-foreground">{formatDate(item.updated_at)}</p>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>
      )}

      {activeTab === 'serials' && item.track_serial_numbers && (
        <div>
          <div className="flex items-center justify-between mb-6">
            <div>
              <h3 className="text-lg font-semibold text-foreground">Serial Number Tracking</h3>
              <p className="text-sm text-muted-foreground mt-1">
                Track individual units by serial number and IMEI (FIFO - First In, First Out)
              </p>
            </div>
            <Button onClick={() => setIsAddSerialsModalOpen(true)}>
              <Plus className="w-4 h-4 mr-2" />
              Add Serials
            </Button>
          </div>

          {/* Serial Stats */}
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-6">
            <Card>
              <CardContent className="pt-6">
                <div className="text-sm text-muted-foreground">Total Serials</div>
                <div className="text-2xl font-bold text-foreground mt-1">{serials.length}</div>
              </CardContent>
            </Card>
            <Card>
              <CardContent className="pt-6">
                <div className="text-sm text-muted-foreground">Available</div>
                <div className="text-2xl font-bold text-green-600 mt-1">
                  {serials.filter((s) => s.status === 'available').length}
                </div>
              </CardContent>
            </Card>
            <Card>
              <CardContent className="pt-6">
                <div className="text-sm text-muted-foreground">Reserved</div>
                <div className="text-2xl font-bold text-yellow-600 mt-1">
                  {serials.filter((s) => s.status === 'reserved').length}
                </div>
              </CardContent>
            </Card>
            <Card>
              <CardContent className="pt-6">
                <div className="text-sm text-muted-foreground">Sold</div>
                <div className="text-2xl font-bold text-blue-600 mt-1">
                  {serials.filter((s) => s.status === 'sold').length}
                </div>
              </CardContent>
            </Card>
          </div>

          <Card>
            <CardContent>
              {serials.length === 0 ? (
                <div className="text-center py-8 text-muted-foreground">
                  No serial numbers tracked yet. Add serials to begin tracking individual units.
                </div>
              ) : (
                <div className="overflow-x-auto">
                  <table className="w-full">
                    <thead>
                      <tr className="border-b border-border">
                        <th className="text-left py-3 px-4 text-sm font-semibold text-muted-foreground">Serial Number</th>
                        <th className="text-left py-3 px-4 text-sm font-semibold text-muted-foreground">IMEI</th>
                        <th className="text-left py-3 px-4 text-sm font-semibold text-muted-foreground">Status</th>
                        <th className="text-left py-3 px-4 text-sm font-semibold text-muted-foreground">Received</th>
                        <th className="text-left py-3 px-4 text-sm font-semibold text-muted-foreground">Assigned</th>
                        <th className="text-left py-3 px-4 text-sm font-semibold text-muted-foreground">Actions</th>
                      </tr>
                    </thead>
                    <tbody>
                      {serials.map((serial) => (
                        <tr key={serial.id} className="border-b border-border hover:bg-muted/50 transition-colors">
                          <td className="py-4 px-4">
                            <span className="text-sm font-mono font-semibold text-foreground">
                              {serial.serial_number}
                            </span>
                          </td>
                          <td className="py-4 px-4">
                            <span className="text-sm font-mono text-foreground">{serial.imei || '-'}</span>
                          </td>
                          <td className="py-4 px-4">
                            <Badge variant={serialStatusVariants[serial.status as keyof typeof serialStatusVariants]}>
                              {serial.status.charAt(0).toUpperCase() + serial.status.slice(1)}
                            </Badge>
                          </td>
                          <td className="py-4 px-4">
                            <span className="text-sm text-muted-foreground">
                              {serial.received_at ? formatDate(serial.received_at) : '-'}
                            </span>
                          </td>
                          <td className="py-4 px-4">
                            <span className="text-sm text-muted-foreground">
                              {serial.assigned_at ? formatDate(serial.assigned_at) : '-'}
                            </span>
                          </td>
                          <td className="py-4 px-4">
                            {serial.status === 'available' && (
                              <Button size="sm">Assign</Button>
                            )}
                            {serial.assigned_to && (
                              <Button size="sm" variant="outline" asChild>
                                <Link to={`/customers/${serial.assigned_to}`}>View Customer</Link>
                              </Button>
                            )}
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              )}
            </CardContent>
          </Card>
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
