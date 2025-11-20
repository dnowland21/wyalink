import { useState, useEffect } from 'react'
import { Link, useSearchParams } from 'react-router-dom'
import { getCustomers, getCustomerStats, type Customer, type LeadType } from '@wyalink/supabase-client'
import { Card, CardHeader, CardTitle, CardContent } from '../components/ui/card'
import { Badge } from '../components/ui/badge'
import { Button } from '../components/ui/button'
import { Input } from '../components/ui/input'
import { Search, Plus } from 'lucide-react'
import CustomerModal from '../components/CustomerModal'

const typeColors: Record<LeadType, string> = {
  business: 'warning',
  consumer: 'info',
  internal: 'default',
}

export default function Customers() {
  const [searchParams] = useSearchParams()
  const [customers, setCustomers] = useState<Customer[]>([])
  const [filteredCustomers, setFilteredCustomers] = useState<Customer[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  // Modal state
  const [isModalOpen, setIsModalOpen] = useState(false)
  const [selectedCustomer, setSelectedCustomer] = useState<Customer | null>(null)

  // Filters
  const [typeFilter, setTypeFilter] = useState<string>('all')
  const [searchQuery, setSearchQuery] = useState(searchParams.get('account') || '')

  // Stats
  const [stats, setStats] = useState({
    total: 0,
    business: 0,
    consumer: 0,
    internal: 0,
  })

  // Fetch customers and stats
  const fetchData = async () => {
    setLoading(true)
    setError(null)

    try {
      const [customersResult, statsResult] = await Promise.all([getCustomers(), getCustomerStats()])

      if (customersResult.error) throw customersResult.error
      if (statsResult.error) throw statsResult.error

      setCustomers(customersResult.data || [])
      setStats(statsResult.data || stats)
    } catch (err) {
      setError('Failed to load customers')
      console.error(err)
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    fetchData()
  }, [])

  // Apply filters
  useEffect(() => {
    let filtered = [...customers]

    // Type filter
    if (typeFilter !== 'all') {
      filtered = filtered.filter((customer) => customer.type === typeFilter)
    }

    // Search filter
    if (searchQuery) {
      const query = searchQuery.toLowerCase()
      filtered = filtered.filter(
        (customer) =>
          customer.email.toLowerCase().includes(query) ||
          customer.first_name.toLowerCase().includes(query) ||
          customer.last_name.toLowerCase().includes(query) ||
          customer.company_name?.toLowerCase().includes(query) ||
          customer.account_number.includes(query)
      )
    }

    setFilteredCustomers(filtered)
  }, [customers, typeFilter, searchQuery])

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('en-US', {
      month: 'short',
      day: 'numeric',
      year: 'numeric',
    })
  }

  const handleOpenCreateModal = () => {
    setSelectedCustomer(null)
    setIsModalOpen(true)
  }

  const handleOpenEditModal = (customer: Customer) => {
    setSelectedCustomer(customer)
    setIsModalOpen(true)
  }

  const handleCloseModal = (shouldRefresh?: boolean) => {
    setIsModalOpen(false)
    setSelectedCustomer(null)
    if (shouldRefresh) {
      fetchData()
    }
  }

  return (
    <div>
      {/* Header */}
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-gray-900">Customers</h1>
        <p className="text-gray-600 mt-1">Manage customer accounts and services</p>
      </div>

      {/* Stats Grid */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-8">
        <Card>
          <CardContent className="p-6">
            <div className="text-sm text-muted-foreground">Total Customers</div>
            <div className="text-2xl font-bold mt-1">{stats.total}</div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-6">
            <div className="text-sm text-muted-foreground">Business</div>
            <div className="text-2xl font-bold text-warning mt-1">{stats.business}</div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-6">
            <div className="text-sm text-muted-foreground">Consumer</div>
            <div className="text-2xl font-bold text-info mt-1">{stats.consumer}</div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-6">
            <div className="text-sm text-muted-foreground">Internal</div>
            <div className="text-2xl font-bold text-muted-foreground mt-1">{stats.internal}</div>
          </CardContent>
        </Card>
      </div>

      {/* Error Message */}
      {error && (
        <div className="bg-error-50 border border-error-200 rounded-lg p-4 mb-6">
          <p className="text-sm text-error-800">{error}</p>
        </div>
      )}

      {/* Customers Table */}
      <Card>
        <CardHeader>
          <div className="flex items-center justify-between">
            <CardTitle className="text-lg">All Customers</CardTitle>
            <div className="flex items-center gap-3">
              <div className="relative">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground pointer-events-none" />
                <Input
                  type="text"
                  placeholder="Search customers..."
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
                <option value="business">Business</option>
                <option value="consumer">Consumer</option>
                <option value="internal">Internal</option>
              </select>
              <Button onClick={handleOpenCreateModal}>
                <Plus className="h-4 w-4 mr-2" />
                New Customer
              </Button>
            </div>
          </div>
        </CardHeader>
        <CardContent>

          {loading ? (
            <div className="p-8 text-center text-muted-foreground">Loading customers...</div>
          ) : filteredCustomers.length === 0 ? (
            <div className="p-8 text-center text-muted-foreground">
              {searchQuery || typeFilter !== 'all' ? 'No customers found matching your filters' : 'No customers yet'}
            </div>
          ) : (
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead>
                <tr className="border-b border-gray-200">
                  <th className="text-left py-3 px-4 text-sm font-semibold text-gray-700">Account</th>
                  <th className="text-left py-3 px-4 text-sm font-semibold text-gray-700">Name</th>
                  <th className="text-left py-3 px-4 text-sm font-semibold text-gray-700">Contact</th>
                  <th className="text-left py-3 px-4 text-sm font-semibold text-gray-700">Type</th>
                  <th className="text-left py-3 px-4 text-sm font-semibold text-gray-700">Location</th>
                  <th className="text-left py-3 px-4 text-sm font-semibold text-gray-700">Created</th>
                  <th className="text-left py-3 px-4 text-sm font-semibold text-gray-700">Actions</th>
                </tr>
              </thead>
              <tbody>
                {filteredCustomers.map((customer) => (
                  <tr key={customer.id} className="border-b border-gray-100 hover:bg-gray-50 transition-colors">
                    <td className="py-4 px-4">
                      <div className="flex flex-col">
                        <span className="text-sm font-mono font-semibold text-primary">
                          {customer.account_number}
                        </span>
                        {customer.company_name && (
                          <span className="text-xs text-muted-foreground">{customer.company_name}</span>
                        )}
                      </div>
                    </td>
                    <td className="py-4 px-4">
                      <div className="flex items-center gap-3">
                        <div className="w-10 h-10 bg-gradient-brand rounded-lg flex items-center justify-center text-white font-semibold text-sm">
                          {customer.first_name[0]}
                          {customer.last_name[0]}
                        </div>
                        <div>
                          <p className="text-sm font-semibold">
                            {customer.first_name} {customer.middle_initial ? `${customer.middle_initial}. ` : ''}
                            {customer.last_name}
                          </p>
                        </div>
                      </div>
                    </td>
                    <td className="py-4 px-4">
                      <div className="flex flex-col gap-1">
                        <p className="text-sm text-gray-900">{customer.email}</p>
                        <p className="text-xs text-gray-500">{customer.phone}</p>
                      </div>
                    </td>
                    <td className="py-4 px-4">
                      <Badge variant={typeColors[customer.type] as any}>
                        {customer.type.charAt(0).toUpperCase() + customer.type.slice(1)}
                      </Badge>
                    </td>
                    <td className="py-4 px-4">
                      <span className="text-sm text-gray-700">
                        {customer.billing_city}, {customer.billing_state}
                      </span>
                    </td>
                    <td className="py-4 px-4">
                      <span className="text-sm text-gray-600">{formatDate(customer.created_at)}</span>
                    </td>
                    <td className="py-4 px-4">
                      <div className="flex items-center gap-2">
                        <Button asChild size="sm">
                          <Link to={`/customers/${customer.id}`}>
                            View
                          </Link>
                        </Button>
                        <Button
                          variant="outline"
                          size="sm"
                          onClick={() => handleOpenEditModal(customer)}
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

      {/* Customer Modal */}
      <CustomerModal
        isOpen={isModalOpen}
        onClose={handleCloseModal}
        customer={selectedCustomer}
      />
    </div>
  )
}
