import { useState, useEffect } from 'react'
import { getVendors, deleteVendor, type Vendor } from '@wyalink/supabase-client'
import { Card, CardHeader, CardTitle, CardContent } from '../components/ui/card'
import { Button } from '../components/ui/button'
import { Input } from '../components/ui/input'
import { Search, Plus } from 'lucide-react'
import VendorModal from '../components/VendorModal'

export default function Vendors() {
  const [vendors, setVendors] = useState<Vendor[]>([])
  const [filteredVendors, setFilteredVendors] = useState<Vendor[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [actionLoading, setActionLoading] = useState<string | null>(null)

  // Modal state
  const [isModalOpen, setIsModalOpen] = useState(false)
  const [selectedVendor, setSelectedVendor] = useState<Vendor | null>(null)

  // Filters
  const [searchQuery, setSearchQuery] = useState('')

  // Stats
  const [stats, setStats] = useState({
    total: 0,
  })

  // Fetch vendors
  const fetchVendors = async () => {
    setLoading(true)
    setError(null)

    try {
      const result = await getVendors()

      if (result.error) throw result.error

      const vendorsData = result.data || []
      setVendors(vendorsData)
      setFilteredVendors(vendorsData)

      setStats({
        total: vendorsData.length,
      })
    } catch (err: any) {
      setError('Failed to load vendors')
      console.error(err)
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    fetchVendors()
  }, [])

  // Apply search filter
  useEffect(() => {
    if (!searchQuery) {
      setFilteredVendors(vendors)
      return
    }

    const query = searchQuery.toLowerCase()
    const filtered = vendors.filter(
      (vendor) =>
        vendor.company_name.toLowerCase().includes(query) ||
        vendor.email?.toLowerCase().includes(query) ||
        vendor.phone?.toLowerCase().includes(query) ||
        vendor.first_name?.toLowerCase().includes(query) ||
        vendor.last_name?.toLowerCase().includes(query)
    )

    setFilteredVendors(filtered)
  }, [vendors, searchQuery])

  const handleDelete = async (id: string, companyName: string) => {
    if (!confirm(`Are you sure you want to delete ${companyName}?`)) return

    setActionLoading(id)
    try {
      const result = await deleteVendor(id)
      if (result.error) throw result.error

      await fetchVendors()
    } catch (err: any) {
      alert('Failed to delete vendor')
      console.error(err)
    } finally {
      setActionLoading(null)
    }
  }

  const formatAddress = (vendor: Vendor, type: 'billing' | 'shipping') => {
    const prefix = type === 'billing' ? 'billing' : 'shipping'
    const line1 = vendor[`${prefix}_address_line1` as keyof Vendor]
    const line2 = vendor[`${prefix}_address_line2` as keyof Vendor]
    const city = vendor[`${prefix}_city` as keyof Vendor]
    const state = vendor[`${prefix}_state` as keyof Vendor]
    const zip = vendor[`${prefix}_zip` as keyof Vendor]
    const country = vendor[`${prefix}_country` as keyof Vendor]

    if (!line1 && !city) return '-'

    const parts = []
    if (line1) parts.push(line1)
    if (line2) parts.push(line2)

    const cityState = []
    if (city) cityState.push(city)
    if (state) cityState.push(state)
    if (zip) cityState.push(zip)
    if (cityState.length > 0) parts.push(cityState.join(', '))

    if (country) parts.push(country)

    return parts.join(', ')
  }

  const handleOpenCreateModal = () => {
    setSelectedVendor(null)
    setIsModalOpen(true)
  }

  const handleOpenEditModal = (vendor: Vendor) => {
    setSelectedVendor(vendor)
    setIsModalOpen(true)
  }

  const handleCloseModal = (shouldRefresh?: boolean) => {
    setIsModalOpen(false)
    setSelectedVendor(null)
    if (shouldRefresh) {
      fetchVendors()
    }
  }

  return (
    <div>
      {/* Header */}
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-gray-900">Vendors</h1>
        <p className="text-gray-600 mt-1">Manage device suppliers and inventory sources</p>
      </div>

      {/* Stats Grid */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-8">
        <Card>
          <CardContent className="p-6">
            <div className="text-sm text-muted-foreground">Total Vendors</div>
            <div className="text-2xl font-bold mt-1">{stats.total}</div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-6">
            <div className="text-sm text-muted-foreground">Active Relationships</div>
            <div className="text-2xl font-bold text-success mt-1">{stats.total}</div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-6">
            <div className="text-sm text-muted-foreground">Countries</div>
            <div className="text-2xl font-bold text-info mt-1">
              {new Set(vendors.map(v => v.billing_country).filter(Boolean)).size}
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-6">
            <div className="text-sm text-muted-foreground">US States</div>
            <div className="text-2xl font-bold text-secondary mt-1">
              {new Set(vendors.map(v => v.billing_state).filter(Boolean)).size}
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Error Message */}
      {error && (
        <div className="bg-error-50 border border-error-200 rounded-lg p-4 mb-6">
          <p className="text-sm text-error-800">{error}</p>
        </div>
      )}

      {/* Vendors Table */}
      <Card>
        <CardHeader>
          <div className="flex items-center justify-between">
            <CardTitle className="text-lg">All Vendors</CardTitle>
            <div className="flex items-center gap-3">
              <div className="relative">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground pointer-events-none" />
                <Input
                  type="text"
                  placeholder="Search vendors..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="w-64 pl-9"
                />
              </div>
              <Button onClick={handleOpenCreateModal}>
                <Plus className="h-4 w-4 mr-2" />
                Add Vendor
              </Button>
            </div>
          </div>
        </CardHeader>
        <CardContent>
          {loading ? (
            <div className="p-8 text-center text-muted-foreground">Loading vendors...</div>
          ) : filteredVendors.length === 0 ? (
            <div className="p-8 text-center text-muted-foreground">
              {searchQuery ? 'No vendors found matching your search' : 'No vendors yet'}
            </div>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full">
              <thead>
                <tr className="border-b border-gray-200">
                  <th className="text-left py-3 px-4 text-sm font-semibold text-gray-700">Company</th>
                  <th className="text-left py-3 px-4 text-sm font-semibold text-gray-700">Contact Person</th>
                  <th className="text-left py-3 px-4 text-sm font-semibold text-gray-700">Contact Info</th>
                  <th className="text-left py-3 px-4 text-sm font-semibold text-gray-700">Billing Address</th>
                  <th className="text-left py-3 px-4 text-sm font-semibold text-gray-700">Shipping Address</th>
                  <th className="text-center py-3 px-4 text-sm font-semibold text-gray-700">Actions</th>
                </tr>
              </thead>
              <tbody>
                {filteredVendors.map((vendor) => (
                  <tr key={vendor.id} className="border-b border-gray-100 hover:bg-gray-50 transition-colors">
                    <td className="py-4 px-4">
                      <div className="flex items-center gap-3">
                        <div className="w-10 h-10 bg-gradient-to-br from-blue-500 to-blue-700 rounded-lg flex items-center justify-center text-white font-semibold text-sm">
                          {vendor.company_name[0]?.toUpperCase() || 'V'}
                        </div>
                        <div>
                          <p className="text-sm font-semibold text-gray-900">{vendor.company_name}</p>
                          {vendor.notes && (
                            <p className="text-xs text-gray-500 mt-1">{vendor.notes.slice(0, 50)}{vendor.notes.length > 50 ? '...' : ''}</p>
                          )}
                        </div>
                      </div>
                    </td>
                    <td className="py-4 px-4">
                      {vendor.first_name || vendor.last_name ? (
                        <div>
                          <p className="text-sm text-gray-900">
                            {vendor.first_name} {vendor.last_name}
                          </p>
                        </div>
                      ) : (
                        <span className="text-sm text-gray-400">-</span>
                      )}
                    </td>
                    <td className="py-4 px-4">
                      <div>
                        {vendor.email && (
                          <a href={`mailto:${vendor.email}`} className="text-sm text-primary hover:text-primary/80">
                            {vendor.email}
                          </a>
                        )}
                        {vendor.phone && (
                          <a href={`tel:${vendor.phone}`} className="text-sm text-foreground hover:text-foreground/80 block mt-1">
                            {vendor.phone}
                          </a>
                        )}
                        {!vendor.email && !vendor.phone && (
                          <span className="text-sm text-muted-foreground">-</span>
                        )}
                      </div>
                    </td>
                    <td className="py-4 px-4">
                      <p className="text-sm text-gray-700 max-w-xs">{formatAddress(vendor, 'billing')}</p>
                    </td>
                    <td className="py-4 px-4">
                      <p className="text-sm text-gray-700 max-w-xs">{formatAddress(vendor, 'shipping')}</p>
                    </td>
                    <td className="py-4 px-4">
                      <div className="flex items-center justify-center gap-2">
                        <button
                          className="p-2 text-gray-500 hover:text-primary-600 hover:bg-primary-50 rounded-lg transition-colors"
                          title="View details"
                        >
                          <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path
                              strokeLinecap="round"
                              strokeLinejoin="round"
                              strokeWidth={2}
                              d="M15 12a3 3 0 11-6 0 3 3 0 016 0z"
                            />
                            <path
                              strokeLinecap="round"
                              strokeLinejoin="round"
                              strokeWidth={2}
                              d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z"
                            />
                          </svg>
                        </button>
                        <button
                          onClick={() => handleOpenEditModal(vendor)}
                          className="p-2 text-gray-500 hover:text-primary-600 hover:bg-primary-50 rounded-lg transition-colors"
                          title="Edit vendor"
                        >
                          <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path
                              strokeLinecap="round"
                              strokeLinejoin="round"
                              strokeWidth={2}
                              d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z"
                            />
                          </svg>
                        </button>
                        <button
                          onClick={() => handleDelete(vendor.id, vendor.company_name)}
                          disabled={actionLoading === vendor.id}
                          className="p-2 text-red-500 hover:text-red-700 hover:bg-red-50 rounded-lg transition-colors disabled:opacity-50"
                          title="Delete vendor"
                        >
                          <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path
                              strokeLinecap="round"
                              strokeLinejoin="round"
                              strokeWidth={2}
                              d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16"
                            />
                          </svg>
                        </button>
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

      {/* Quick Info */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mt-6">
        <Card>
          <CardContent className="p-6">
            <div className="flex items-start gap-3">
              <div className="w-10 h-10 bg-blue-100 rounded-lg flex items-center justify-center">
                <svg className="w-5 h-5 text-blue-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M19 21V5a2 2 0 00-2-2H7a2 2 0 00-2 2v16m14 0h2m-2 0h-5m-9 0H3m2 0h5M9 7h1m-1 4h1m4-4h1m-1 4h1m-5 10v-5a1 1 0 011-1h2a1 1 0 011 1v5m-4 0h4"
                  />
                </svg>
              </div>
              <div>
                <h4 className="text-sm font-semibold text-gray-900 mb-1">Supplier Management</h4>
                <p className="text-xs text-gray-600">Track devices, SIM cards, and equipment suppliers</p>
              </div>
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-6">
            <div className="flex items-start gap-3">
              <div className="w-10 h-10 bg-green-100 rounded-lg flex items-center justify-center">
                <svg className="w-5 h-5 text-green-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z"
                  />
                </svg>
              </div>
              <div>
                <h4 className="text-sm font-semibold text-gray-900 mb-1">Contract Terms</h4>
                <p className="text-xs text-gray-600">Store payment terms and agreement details</p>
              </div>
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-6">
            <div className="flex items-start gap-3">
              <div className="w-10 h-10 bg-purple-100 rounded-lg flex items-center justify-center">
                <svg className="w-5 h-5 text-purple-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M3 12l2-2m0 0l7-7 7 7M5 10v10a1 1 0 001 1h3m10-11l2 2m-2-2v10a1 1 0 01-1 1h-3m-6 0a1 1 0 001-1v-4a1 1 0 011-1h2a1 1 0 011 1v4a1 1 0 001 1m-6 0h6"
                  />
                </svg>
              </div>
              <div>
                <h4 className="text-sm font-semibold text-gray-900 mb-1">Dual Addresses</h4>
                <p className="text-xs text-gray-600">Separate billing and shipping address tracking</p>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Vendor Modal */}
      <VendorModal
        isOpen={isModalOpen}
        onClose={handleCloseModal}
        vendor={selectedVendor}
      />
    </div>
  )
}
