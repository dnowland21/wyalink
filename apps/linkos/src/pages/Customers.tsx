import { useState, useEffect } from 'react'
import { Link, useSearchParams } from 'react-router-dom'
import { getCustomers, getCustomerStats, type Customer, type LeadType } from '@wyalink/supabase-client'
import { Card } from '@wyalink/ui'
import CustomerModal from '../components/CustomerModal'

const typeColors: Record<LeadType, string> = {
  business: 'bg-purple-100 text-purple-800',
  consumer: 'bg-blue-100 text-blue-800',
  internal: 'bg-gray-100 text-gray-800',
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
          <div className="text-sm text-gray-600">Total Customers</div>
          <div className="text-2xl font-bold text-gray-900 mt-1">{stats.total}</div>
        </Card>
        <Card>
          <div className="text-sm text-gray-600">Business</div>
          <div className="text-2xl font-bold text-purple-600 mt-1">{stats.business}</div>
        </Card>
        <Card>
          <div className="text-sm text-gray-600">Consumer</div>
          <div className="text-2xl font-bold text-blue-600 mt-1">{stats.consumer}</div>
        </Card>
        <Card>
          <div className="text-sm text-gray-600">Internal</div>
          <div className="text-2xl font-bold text-gray-600 mt-1">{stats.internal}</div>
        </Card>
      </div>

      {/* Error Message */}
      {error && (
        <div className="bg-red-50 border border-red-200 rounded-lg p-4 mb-6">
          <p className="text-sm text-red-800">{error}</p>
        </div>
      )}

      {/* Customers Table */}
      <Card>
        <div className="flex items-center justify-between mb-6">
          <h3 className="text-lg font-semibold text-gray-900">All Customers</h3>
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
                placeholder="Search customers..."
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
              <option value="business">Business</option>
              <option value="consumer">Consumer</option>
              <option value="internal">Internal</option>
            </select>
            <button
              onClick={handleOpenCreateModal}
              className="px-4 py-2 bg-primary-600 text-white rounded-lg hover:bg-primary-700 transition-colors text-sm font-medium"
            >
              + New Customer
            </button>
          </div>
        </div>

        {loading ? (
          <div className="p-8 text-center text-gray-600">Loading customers...</div>
        ) : filteredCustomers.length === 0 ? (
          <div className="p-8 text-center text-gray-600">
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
                        <span className="text-sm font-mono font-semibold text-primary-600">
                          {customer.account_number}
                        </span>
                        {customer.company_name && (
                          <span className="text-xs text-gray-500">{customer.company_name}</span>
                        )}
                      </div>
                    </td>
                    <td className="py-4 px-4">
                      <div className="flex items-center gap-3">
                        <div className="w-10 h-10 bg-gradient-to-br from-primary-500 to-primary-700 rounded-lg flex items-center justify-center text-white font-semibold text-sm">
                          {customer.first_name[0]}
                          {customer.last_name[0]}
                        </div>
                        <div>
                          <p className="text-sm font-semibold text-gray-900">
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
                      <span className={`px-3 py-1 rounded-full text-xs font-medium ${typeColors[customer.type]}`}>
                        {customer.type.charAt(0).toUpperCase() + customer.type.slice(1)}
                      </span>
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
                        <Link
                          to={`/customers/${customer.id}`}
                          className="px-3 py-1.5 text-sm bg-primary-600 text-white rounded-lg hover:bg-primary-700 transition-colors"
                        >
                          View
                        </Link>
                        <button
                          onClick={() => handleOpenEditModal(customer)}
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

      {/* Customer Modal */}
      <CustomerModal
        isOpen={isModalOpen}
        onClose={handleCloseModal}
        customer={selectedCustomer}
      />
    </div>
  )
}
