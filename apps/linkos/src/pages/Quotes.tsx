import { useState, useEffect } from 'react'
import { Link } from 'react-router-dom'
import { getQuotes, type Quote, type QuoteStatus } from '@wyalink/supabase-client'
import { Card } from '@wyalink/ui'
import QuoteModal from '../components/QuoteModal'

const statusColors: Record<QuoteStatus, string> = {
  draft: 'bg-gray-100 text-gray-800',
  sent: 'bg-blue-100 text-blue-800',
  accepted: 'bg-green-100 text-green-800',
  declined: 'bg-red-100 text-red-800',
  expired: 'bg-orange-100 text-orange-800',
  converted: 'bg-purple-100 text-purple-800',
}

export default function Quotes() {
  const [quotes, setQuotes] = useState<Quote[]>([])
  const [filteredQuotes, setFilteredQuotes] = useState<Quote[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [isQuoteModalOpen, setIsQuoteModalOpen] = useState(false)

  // Filters
  const [statusFilter, setStatusFilter] = useState<string>('all')
  const [searchQuery, setSearchQuery] = useState('')

  // Stats
  const [stats, setStats] = useState({
    total: 0,
    draft: 0,
    sent: 0,
    accepted: 0,
    declined: 0,
    expired: 0,
    totalValue: 0,
  })

  // Fetch quotes
  const fetchQuotes = async () => {
    setLoading(true)
    setError(null)

    try {
      const result = await getQuotes()

      if (result.error) throw result.error

      const quotesData = result.data || []
      setQuotes(quotesData)

      // Calculate stats
      const totalValue = quotesData.reduce((sum, quote) => sum + quote.total, 0)

      setStats({
        total: quotesData.length,
        draft: quotesData.filter((q) => q.status === 'draft').length,
        sent: quotesData.filter((q) => q.status === 'sent').length,
        accepted: quotesData.filter((q) => q.status === 'accepted').length,
        declined: quotesData.filter((q) => q.status === 'declined').length,
        expired: quotesData.filter((q) => q.status === 'expired').length,
        totalValue,
      })
    } catch (err: any) {
      setError('Failed to load quotes')
      console.error(err)
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    fetchQuotes()
  }, [])

  const handleQuoteModalClose = (shouldRefresh?: boolean) => {
    setIsQuoteModalOpen(false)
    if (shouldRefresh) {
      fetchQuotes()
    }
  }

  // Apply filters
  useEffect(() => {
    let filtered = [...quotes]

    // Status filter
    if (statusFilter !== 'all') {
      filtered = filtered.filter((quote) => quote.status === statusFilter)
    }

    // Search filter
    if (searchQuery) {
      const query = searchQuery.toLowerCase()
      filtered = filtered.filter(
        (quote) =>
          quote.quote_number.toLowerCase().includes(query) ||
          quote.notes?.toLowerCase().includes(query)
      )
    }

    setFilteredQuotes(filtered)
  }, [quotes, statusFilter, searchQuery])

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('en-US', {
      month: 'short',
      day: 'numeric',
      year: 'numeric',
    })
  }

  const formatPrice = (price: number) => {
    return `$${price.toFixed(2)}`
  }

  return (
    <div>
      {/* Header */}
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-gray-900">Quotes</h1>
        <p className="text-gray-600 mt-1">Create and manage sales quotes</p>
      </div>

      {/* Stats Grid */}
      <div className="grid grid-cols-2 md:grid-cols-6 gap-4 mb-8">
        <Card>
          <div className="text-sm text-gray-600">Total Quotes</div>
          <div className="text-2xl font-bold text-gray-900 mt-1">{stats.total}</div>
        </Card>
        <Card>
          <div className="text-sm text-gray-600">Draft</div>
          <div className="text-2xl font-bold text-gray-600 mt-1">{stats.draft}</div>
        </Card>
        <Card>
          <div className="text-sm text-gray-600">Sent</div>
          <div className="text-2xl font-bold text-blue-600 mt-1">{stats.sent}</div>
        </Card>
        <Card>
          <div className="text-sm text-gray-600">Accepted</div>
          <div className="text-2xl font-bold text-green-600 mt-1">{stats.accepted}</div>
        </Card>
        <Card>
          <div className="text-sm text-gray-600">Declined</div>
          <div className="text-2xl font-bold text-red-600 mt-1">{stats.declined}</div>
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

      {/* Quotes Table */}
      <Card>
        <div className="flex items-center justify-between mb-6">
          <h3 className="text-lg font-semibold text-gray-900">All Quotes</h3>
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
                placeholder="Search by quote number..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="block w-64 pl-10 pr-3 py-2 border border-gray-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-primary-500 focus:border-transparent"
              />
            </div>
            <select
              value={statusFilter}
              onChange={(e) => setStatusFilter(e.target.value)}
              className="text-sm border border-gray-300 rounded-lg px-3 py-2 focus:outline-none focus:ring-2 focus:ring-primary-500"
            >
              <option value="all">All Status</option>
              <option value="draft">Draft</option>
              <option value="sent">Sent</option>
              <option value="accepted">Accepted</option>
              <option value="declined">Declined</option>
              <option value="expired">Expired</option>
              <option value="converted">Converted</option>
            </select>
            <button
              onClick={() => setIsQuoteModalOpen(true)}
              className="px-4 py-2 bg-primary-800 text-white rounded-lg hover:bg-primary-700 transition-colors text-sm font-medium"
            >
              + Create Quote
            </button>
          </div>
        </div>

        {loading ? (
          <div className="p-8 text-center text-gray-600">Loading quotes...</div>
        ) : filteredQuotes.length === 0 ? (
          <div className="p-8 text-center text-gray-600">
            {searchQuery || statusFilter !== 'all' ? 'No quotes found matching your filters' : 'No quotes yet'}
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead>
                <tr className="border-b border-gray-200">
                  <th className="text-left py-3 px-4 text-sm font-semibold text-gray-700">Quote #</th>
                  <th className="text-left py-3 px-4 text-sm font-semibold text-gray-700">Status</th>
                  <th className="text-left py-3 px-4 text-sm font-semibold text-gray-700">Customer/Lead</th>
                  <th className="text-left py-3 px-4 text-sm font-semibold text-gray-700">Subtotal</th>
                  <th className="text-left py-3 px-4 text-sm font-semibold text-gray-700">Discount</th>
                  <th className="text-left py-3 px-4 text-sm font-semibold text-gray-700">Tax</th>
                  <th className="text-left py-3 px-4 text-sm font-semibold text-gray-700">Total</th>
                  <th className="text-left py-3 px-4 text-sm font-semibold text-gray-700">Expires</th>
                  <th className="text-left py-3 px-4 text-sm font-semibold text-gray-700">Actions</th>
                </tr>
              </thead>
              <tbody>
                {filteredQuotes.map((quote) => (
                  <tr key={quote.id} className="border-b border-gray-100 hover:bg-gray-50 transition-colors">
                    <td className="py-4 px-4">
                      <span className="text-sm font-mono font-semibold text-gray-900">{quote.quote_number}</span>
                    </td>
                    <td className="py-4 px-4">
                      <span className={`px-2 py-1 rounded-full text-xs font-medium ${statusColors[quote.status]}`}>
                        {quote.status.charAt(0).toUpperCase() + quote.status.slice(1)}
                      </span>
                    </td>
                    <td className="py-4 px-4">
                      {quote.customer_id ? (
                        <Link
                          to={`/customers/${quote.customer_id}`}
                          className="text-sm text-primary-600 hover:text-primary-700"
                        >
                          View Customer
                        </Link>
                      ) : quote.lead_id ? (
                        <Link
                          to={`/leads/${quote.lead_id}`}
                          className="text-sm text-primary-600 hover:text-primary-700"
                        >
                          View Lead
                        </Link>
                      ) : (
                        <span className="text-sm text-gray-400">None</span>
                      )}
                    </td>
                    <td className="py-4 px-4">
                      <span className="text-sm text-gray-900">{formatPrice(quote.subtotal)}</span>
                    </td>
                    <td className="py-4 px-4">
                      <span className="text-sm text-green-600">
                        {quote.discount_total > 0 ? `-${formatPrice(quote.discount_total)}` : '-'}
                      </span>
                    </td>
                    <td className="py-4 px-4">
                      <span className="text-sm text-gray-900">{formatPrice(quote.tax_total)}</span>
                    </td>
                    <td className="py-4 px-4">
                      <span className="text-sm font-semibold text-gray-900">{formatPrice(quote.total)}</span>
                    </td>
                    <td className="py-4 px-4">
                      <span
                        className={`text-sm ${
                          new Date(quote.expires_at) < new Date() && quote.status === 'sent'
                            ? 'text-red-600 font-medium'
                            : 'text-gray-600'
                        }`}
                      >
                        {formatDate(quote.expires_at)}
                      </span>
                    </td>
                    <td className="py-4 px-4">
                      <div className="flex items-center gap-2">
                        <Link
                          to={`/quotes/${quote.id}`}
                          className="px-3 py-1.5 text-sm bg-primary-800 text-white rounded-lg hover:bg-primary-700 transition-colors"
                        >
                          View
                        </Link>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </Card>

      {/* Quick Actions Info */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mt-6">
        <Card>
          <div className="flex items-start gap-3">
            <div className="w-10 h-10 bg-blue-100 rounded-lg flex items-center justify-center">
              <svg className="w-5 h-5 text-blue-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M12 6v6m0 0v6m0-6h6m-6 0H6"
                />
              </svg>
            </div>
            <div>
              <h4 className="text-sm font-semibold text-gray-900 mb-1">Create New Quote</h4>
              <p className="text-xs text-gray-600">Build customized quotes with plans, devices, and promotions</p>
            </div>
          </div>
        </Card>
        <Card>
          <div className="flex items-start gap-3">
            <div className="w-10 h-10 bg-green-100 rounded-lg flex items-center justify-center">
              <svg className="w-5 h-5 text-green-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z"
                />
              </svg>
            </div>
            <div>
              <h4 className="text-sm font-semibold text-gray-900 mb-1">Convert to Order</h4>
              <p className="text-xs text-gray-600">Accepted quotes can be converted to customer orders</p>
            </div>
          </div>
        </Card>
        <Card>
          <div className="flex items-start gap-3">
            <div className="w-10 h-10 bg-purple-100 rounded-lg flex items-center justify-center">
              <svg className="w-5 h-5 text-purple-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M7 7h.01M7 3h5c.512 0 1.024.195 1.414.586l7 7a2 2 0 010 2.828l-7 7a2 2 0 01-2.828 0l-7-7A1.994 1.994 0 013 12V7a4 4 0 014-4z"
                />
              </svg>
            </div>
            <div>
              <h4 className="text-sm font-semibold text-gray-900 mb-1">Apply Promotions</h4>
              <p className="text-xs text-gray-600">Add discounts and promotional offers to your quotes</p>
            </div>
          </div>
        </Card>
      </div>

      {/* Quote Modal */}
      <QuoteModal isOpen={isQuoteModalOpen} onClose={handleQuoteModalClose} />
    </div>
  )
}
