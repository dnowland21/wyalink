import { useState, useEffect } from 'react'
import { getPromotions, updatePromotion, approvePromotion, type Promotion, type PromotionStatus } from '@wyalink/supabase-client'
import { Card } from '@wyalink/ui'
import { useAuth } from '@wyalink/supabase-client'

const statusColors: Record<PromotionStatus, string> = {
  draft: 'bg-gray-100 text-gray-800',
  planned: 'bg-yellow-100 text-yellow-800',
  active: 'bg-green-100 text-green-800',
  cancelled: 'bg-red-100 text-red-800',
  expired: 'bg-orange-100 text-orange-800',
}

export default function Promotions() {
  const { user } = useAuth()
  const [promotions, setPromotions] = useState<Promotion[]>([])
  const [filteredPromotions, setFilteredPromotions] = useState<Promotion[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [actionLoading, setActionLoading] = useState<string | null>(null)

  // Filters
  const [statusFilter, setStatusFilter] = useState<string>('all')
  const [searchQuery, setSearchQuery] = useState('')

  // Stats
  const [stats, setStats] = useState({
    total: 0,
    draft: 0,
    pending_approval: 0,
    active: 0,
    inactive: 0,
    expired: 0,
  })

  // Fetch promotions
  const fetchPromotions = async () => {
    setLoading(true)
    setError(null)

    try {
      const result = await getPromotions()

      if (result.error) throw result.error

      const promotionsData = result.data || []
      setPromotions(promotionsData)

      // Calculate stats
      setStats({
        total: promotionsData.length,
        draft: promotionsData.filter((p) => p.status === 'draft').length,
        pending_approval: promotionsData.filter((p) => p.status === 'planned').length,
        active: promotionsData.filter((p) => p.status === 'active').length,
        inactive: promotionsData.filter((p) => p.status === 'cancelled').length,
        expired: promotionsData.filter((p) => p.status === 'expired').length,
      })
    } catch (err: any) {
      setError('Failed to load promotions')
      console.error(err)
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    fetchPromotions()
  }, [])

  // Apply filters
  useEffect(() => {
    let filtered = [...promotions]

    // Status filter
    if (statusFilter !== 'all') {
      filtered = filtered.filter((promo) => promo.status === statusFilter)
    }

    // Search filter
    if (searchQuery) {
      const query = searchQuery.toLowerCase()
      filtered = filtered.filter(
        (promo) =>
          promo.promotion_name.toLowerCase().includes(query) ||
          promo.promotion_code?.toLowerCase().includes(query) ||
          promo.promotion_description?.toLowerCase().includes(query)
      )
    }

    setFilteredPromotions(filtered)
  }, [promotions, statusFilter, searchQuery])

  const handleApprove = async (id: string) => {
    if (!user?.id) return

    setActionLoading(id)
    try {
      const result = await approvePromotion(id, user.id)
      if (result.error) throw result.error

      await fetchPromotions()
    } catch (err: any) {
      alert('Failed to approve promotion')
      console.error(err)
    } finally {
      setActionLoading(null)
    }
  }

  const handleActivate = async (id: string) => {
    setActionLoading(id)
    try {
      const result = await updatePromotion(id, { status: 'active' })
      if (result.error) throw result.error

      await fetchPromotions()
    } catch (err: any) {
      alert('Failed to activate promotion')
      console.error(err)
    } finally {
      setActionLoading(null)
    }
  }

  const handleDeactivate = async (id: string) => {
    setActionLoading(id)
    try {
      const result = await updatePromotion(id, { status: 'cancelled' })
      if (result.error) throw result.error

      await fetchPromotions()
    } catch (err: any) {
      alert('Failed to deactivate promotion')
      console.error(err)
    } finally {
      setActionLoading(null)
    }
  }

  const isExpired = (promo: Promotion) => {
    if (!promo.valid_until) return false
    return new Date(promo.valid_until) < new Date()
  }

  const isValidNow = (promo: Promotion) => {
    const now = new Date()
    const from = promo.valid_from ? new Date(promo.valid_from) : null
    const until = promo.valid_until ? new Date(promo.valid_until) : null

    if (from && from > now) return false
    if (until && until < now) return false
    return true
  }

  const formatDate = (dateString: string | null) => {
    if (!dateString) return '-'
    return new Date(dateString).toLocaleDateString('en-US', {
      month: 'short',
      day: 'numeric',
      year: 'numeric',
    })
  }

  const formatDiscount = (promo: Promotion) => {
    if (promo.discount_type === 'percent') {
      return `${promo.discount_amount}% off`
    } else if (promo.discount_type === 'dollar') {
      return `$${promo.discount_amount} off`
    }
    return '-'
  }

  return (
    <div>
      {/* Header */}
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-gray-900">Promotions</h1>
        <p className="text-gray-600 mt-1">Manage discounts and promotional offers</p>
      </div>

      {/* Stats Grid */}
      <div className="grid grid-cols-2 md:grid-cols-6 gap-4 mb-8">
        <Card>
          <div className="text-sm text-gray-600">Total</div>
          <div className="text-2xl font-bold text-gray-900 mt-1">{stats.total}</div>
        </Card>
        <Card>
          <div className="text-sm text-gray-600">Draft</div>
          <div className="text-2xl font-bold text-gray-600 mt-1">{stats.draft}</div>
        </Card>
        <Card>
          <div className="text-sm text-gray-600">Pending</div>
          <div className="text-2xl font-bold text-yellow-600 mt-1">{stats.pending_approval}</div>
        </Card>
        <Card>
          <div className="text-sm text-gray-600">Active</div>
          <div className="text-2xl font-bold text-green-600 mt-1">{stats.active}</div>
        </Card>
        <Card>
          <div className="text-sm text-gray-600">Inactive</div>
          <div className="text-2xl font-bold text-red-600 mt-1">{stats.inactive}</div>
        </Card>
        <Card>
          <div className="text-sm text-gray-600">Expired</div>
          <div className="text-2xl font-bold text-orange-600 mt-1">{stats.expired}</div>
        </Card>
      </div>

      {/* Error Message */}
      {error && (
        <div className="bg-red-50 border border-red-200 rounded-lg p-4 mb-6">
          <p className="text-sm text-red-800">{error}</p>
        </div>
      )}

      {/* Promotions Table */}
      <Card>
        <div className="flex items-center justify-between mb-6">
          <h3 className="text-lg font-semibold text-gray-900">All Promotions</h3>
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
                placeholder="Search promotions..."
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
              <option value="planned">Planned</option>
              <option value="active">Active</option>
              <option value="cancelled">Cancelled</option>
              <option value="expired">Expired</option>
            </select>
            <button className="px-4 py-2 bg-primary-600 text-white rounded-lg hover:bg-primary-700 transition-colors text-sm font-medium">
              + Create Promotion
            </button>
          </div>
        </div>

        {loading ? (
          <div className="p-8 text-center text-gray-600">Loading promotions...</div>
        ) : filteredPromotions.length === 0 ? (
          <div className="p-8 text-center text-gray-600">
            {searchQuery || statusFilter !== 'all' ? 'No promotions found matching your filters' : 'No promotions yet'}
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead>
                <tr className="border-b border-gray-200">
                  <th className="text-left py-3 px-4 text-sm font-semibold text-gray-700">Promotion</th>
                  <th className="text-left py-3 px-4 text-sm font-semibold text-gray-700">Code</th>
                  <th className="text-left py-3 px-4 text-sm font-semibold text-gray-700">Discount</th>
                  <th className="text-left py-3 px-4 text-sm font-semibold text-gray-700">Duration</th>
                  <th className="text-left py-3 px-4 text-sm font-semibold text-gray-700">Valid Period</th>
                  <th className="text-left py-3 px-4 text-sm font-semibold text-gray-700">Status</th>
                  <th className="text-center py-3 px-4 text-sm font-semibold text-gray-700">Actions</th>
                </tr>
              </thead>
              <tbody>
                {filteredPromotions.map((promo) => (
                  <tr key={promo.id} className="border-b border-gray-100 hover:bg-gray-50 transition-colors">
                    <td className="py-4 px-4">
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
                          <p className="text-sm font-semibold text-gray-900">{promo.promotion_name}</p>
                          {promo.promotion_description && (
                            <p className="text-xs text-gray-600 mt-1">{promo.promotion_description}</p>
                          )}
                        </div>
                      </div>
                    </td>
                    <td className="py-4 px-4">
                      {promo.promotion_code ? (
                        <span className="px-2 py-1 bg-gray-100 rounded text-xs font-mono font-semibold text-gray-900">
                          {promo.promotion_code}
                        </span>
                      ) : (
                        <span className="text-sm text-gray-400">-</span>
                      )}
                    </td>
                    <td className="py-4 px-4">
                      <div>
                        <p className="text-sm font-semibold text-gray-900">{formatDiscount(promo)}</p>
                        <p className="text-xs text-gray-600 capitalize">{promo.discount_type}</p>
                      </div>
                    </td>
                    <td className="py-4 px-4">
                      <span className="text-sm text-gray-900 capitalize">{promo.discount_duration.replace('_', ' ')}</span>
                      {promo.discount_duration === 'recurring' && promo.recurring_months && (
                        <p className="text-xs text-gray-600">{promo.recurring_months} months</p>
                      )}
                    </td>
                    <td className="py-4 px-4">
                      <div>
                        <p className="text-sm text-gray-900">
                          {formatDate(promo.valid_from)} - {formatDate(promo.valid_until)}
                        </p>
                        {isExpired(promo) ? (
                          <p className="text-xs text-red-600">Expired</p>
                        ) : !isValidNow(promo) ? (
                          <p className="text-xs text-yellow-600">Not yet valid</p>
                        ) : (
                          <p className="text-xs text-green-600">Valid now</p>
                        )}
                      </div>
                    </td>
                    <td className="py-4 px-4">
                      <span className={`px-2 py-1 rounded-full text-xs font-medium ${statusColors[promo.status]}`}>
                        {promo.status.replace('_', ' ').charAt(0).toUpperCase() + promo.status.replace('_', ' ').slice(1)}
                      </span>
                    </td>
                    <td className="py-4 px-4">
                      <div className="flex items-center justify-center gap-2">
                        {promo.status === 'planned' && promo.approval_required && (
                          <button
                            onClick={() => handleApprove(promo.id)}
                            disabled={actionLoading === promo.id}
                            className="p-2 text-green-500 hover:text-green-700 hover:bg-green-50 rounded-lg transition-colors disabled:opacity-50"
                            title="Approve promotion"
                          >
                            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                              <path
                                strokeLinecap="round"
                                strokeLinejoin="round"
                                strokeWidth={2}
                                d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z"
                              />
                            </svg>
                          </button>
                        )}
                        {(promo.status === 'draft' || promo.status === 'cancelled') && (
                          <button
                            onClick={() => handleActivate(promo.id)}
                            disabled={actionLoading === promo.id}
                            className="p-2 text-green-500 hover:text-green-700 hover:bg-green-50 rounded-lg transition-colors disabled:opacity-50"
                            title="Activate promotion"
                          >
                            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                              <path
                                strokeLinecap="round"
                                strokeLinejoin="round"
                                strokeWidth={2}
                                d="M5 13l4 4L19 7"
                              />
                            </svg>
                          </button>
                        )}
                        {promo.status === 'active' && (
                          <button
                            onClick={() => handleDeactivate(promo.id)}
                            disabled={actionLoading === promo.id}
                            className="p-2 text-red-500 hover:text-red-700 hover:bg-red-50 rounded-lg transition-colors disabled:opacity-50"
                            title="Deactivate promotion"
                          >
                            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                              <path
                                strokeLinecap="round"
                                strokeLinejoin="round"
                                strokeWidth={2}
                                d="M6 18L18 6M6 6l12 12"
                              />
                            </svg>
                          </button>
                        )}
                        <button
                          className="p-2 text-gray-500 hover:text-primary-600 hover:bg-primary-50 rounded-lg transition-colors"
                          title="Edit promotion"
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
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </Card>

      {/* Quick Info */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mt-6">
        <Card>
          <div className="flex items-start gap-3">
            <div className="w-10 h-10 bg-blue-100 rounded-lg flex items-center justify-center">
              <svg className="w-5 h-5 text-blue-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M7 7h.01M7 3h5c.512 0 1.024.195 1.414.586l7 7a2 2 0 010 2.828l-7 7a2 2 0 01-2.828 0l-7-7A1.994 1.994 0 013 12V7a4 4 0 014-4z"
                />
              </svg>
            </div>
            <div>
              <h4 className="text-sm font-semibold text-gray-900 mb-1">Promotional Codes</h4>
              <p className="text-xs text-gray-600">Create unique codes for customers to apply discounts</p>
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
                  d="M12 8c-1.657 0-3 .895-3 2s1.343 2 3 2 3 .895 3 2-1.343 2-3 2m0-8c1.11 0 2.08.402 2.599 1M12 8V7m0 1v8m0 0v1m0-1c-1.11 0-2.08-.402-2.599-1M21 12a9 9 0 11-18 0 9 9 0 0118 0z"
                />
              </svg>
            </div>
            <div>
              <h4 className="text-sm font-semibold text-gray-900 mb-1">Flexible Discounts</h4>
              <p className="text-xs text-gray-600">Percentage or fixed dollar amount discounts</p>
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
                  d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2m-6 9l2 2 4-4"
                />
              </svg>
            </div>
            <div>
              <h4 className="text-sm font-semibold text-gray-900 mb-1">Approval Workflow</h4>
              <p className="text-xs text-gray-600">Optional approval required before activation</p>
            </div>
          </div>
        </Card>
      </div>
    </div>
  )
}
