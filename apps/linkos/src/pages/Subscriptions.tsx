import { useState, useEffect } from 'react'
import { Link } from 'react-router-dom'
import { getSubscriptions, activateSubscription, pauseSubscription, cancelSubscription } from '@wyalink/supabase-client'
import { Card } from '@wyalink/ui'

export default function Subscriptions() {
  const [subscriptions, setSubscriptions] = useState<any[]>([])
  const [filteredSubscriptions, setFilteredSubscriptions] = useState<any[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [actionLoading, setActionLoading] = useState<string | null>(null)

  // Filters
  const [statusFilter, setStatusFilter] = useState<string>('all')
  const [searchQuery, setSearchQuery] = useState('')

  // Stats
  const [stats, setStats] = useState({
    total: 0,
    active: 0,
    paused: 0,
    cancelled: 0,
  })

  // Fetch subscriptions
  const fetchSubscriptions = async () => {
    setLoading(true)
    setError(null)

    try {
      const result = await getSubscriptions()

      if (result.error) throw result.error

      const subscriptionsData = result.data || []
      setSubscriptions(subscriptionsData)

      // Calculate stats
      setStats({
        total: subscriptionsData.length,
        active: subscriptionsData.filter((s: any) => s.is_active && !s.paused_at && !s.cancelled_at).length,
        paused: subscriptionsData.filter((s: any) => s.paused_at).length,
        cancelled: subscriptionsData.filter((s: any) => s.cancelled_at).length,
      })
    } catch (err: any) {
      setError('Failed to load subscriptions')
      console.error(err)
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    fetchSubscriptions()
  }, [])

  // Apply filters
  useEffect(() => {
    let filtered = [...subscriptions]

    // Status filter
    if (statusFilter === 'active') {
      filtered = filtered.filter((s) => s.is_active && !s.paused_at && !s.cancelled_at)
    } else if (statusFilter === 'paused') {
      filtered = filtered.filter((s) => s.paused_at)
    } else if (statusFilter === 'cancelled') {
      filtered = filtered.filter((s) => s.cancelled_at)
    }

    // Search filter
    if (searchQuery) {
      const query = searchQuery.toLowerCase()
      filtered = filtered.filter(
        (sub) =>
          sub.customer?.account_number?.toLowerCase().includes(query) ||
          sub.customer?.first_name?.toLowerCase().includes(query) ||
          sub.customer?.last_name?.toLowerCase().includes(query) ||
          sub.plan?.plan_name?.toLowerCase().includes(query) ||
          sub.line?.phone_number?.toLowerCase().includes(query)
      )
    }

    setFilteredSubscriptions(filtered)
  }, [subscriptions, statusFilter, searchQuery])

  const handleActivate = async (id: string) => {
    setActionLoading(id)
    try {
      const result = await activateSubscription(id)
      if (result.error) throw result.error

      await fetchSubscriptions()
    } catch (err: any) {
      alert('Failed to activate subscription')
      console.error(err)
    } finally {
      setActionLoading(null)
    }
  }

  const handlePause = async (id: string) => {
    setActionLoading(id)
    try {
      const result = await pauseSubscription(id)
      if (result.error) throw result.error

      await fetchSubscriptions()
    } catch (err: any) {
      alert('Failed to pause subscription')
      console.error(err)
    } finally {
      setActionLoading(null)
    }
  }

  const handleCancel = async (id: string) => {
    if (!confirm('Are you sure you want to cancel this subscription?')) return

    setActionLoading(id)
    try {
      const result = await cancelSubscription(id)
      if (result.error) throw result.error

      await fetchSubscriptions()
    } catch (err: any) {
      alert('Failed to cancel subscription')
      console.error(err)
    } finally {
      setActionLoading(null)
    }
  }

  const getStatus = (sub: any) => {
    if (sub.cancelled_at) return { label: 'Cancelled', color: 'bg-red-100 text-red-800' }
    if (sub.paused_at) return { label: 'Paused', color: 'bg-yellow-100 text-yellow-800' }
    if (sub.is_active) return { label: 'Active', color: 'bg-green-100 text-green-800' }
    return { label: 'Inactive', color: 'bg-gray-100 text-gray-800' }
  }

  const formatDate = (dateString: string | null) => {
    if (!dateString) return '-'
    return new Date(dateString).toLocaleDateString('en-US', {
      month: 'short',
      day: 'numeric',
      year: 'numeric',
    })
  }

  const isRenewalSoon = (sub: any) => {
    if (!sub.next_renewal_date || !sub.is_active) return false
    const renewalDate = new Date(sub.next_renewal_date)
    const today = new Date()
    const daysUntilRenewal = Math.ceil((renewalDate.getTime() - today.getTime()) / (1000 * 60 * 60 * 24))
    return daysUntilRenewal <= 7 && daysUntilRenewal >= 0
  }

  return (
    <div>
      {/* Header */}
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-gray-900">Subscriptions</h1>
        <p className="text-gray-600 mt-1">Manage customer subscriptions and renewals</p>
      </div>

      {/* Stats Grid */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-8">
        <Card>
          <div className="text-sm text-gray-600">Total</div>
          <div className="text-2xl font-bold text-gray-900 mt-1">{stats.total}</div>
        </Card>
        <Card>
          <div className="text-sm text-gray-600">Active</div>
          <div className="text-2xl font-bold text-green-600 mt-1">{stats.active}</div>
        </Card>
        <Card>
          <div className="text-sm text-gray-600">Paused</div>
          <div className="text-2xl font-bold text-yellow-600 mt-1">{stats.paused}</div>
        </Card>
        <Card>
          <div className="text-sm text-gray-600">Cancelled</div>
          <div className="text-2xl font-bold text-red-600 mt-1">{stats.cancelled}</div>
        </Card>
      </div>

      {/* Error Message */}
      {error && (
        <div className="bg-red-50 border border-red-200 rounded-lg p-4 mb-6">
          <p className="text-sm text-red-800">{error}</p>
        </div>
      )}

      {/* Subscriptions Table */}
      <Card>
        <div className="flex items-center justify-between mb-6">
          <h3 className="text-lg font-semibold text-gray-900">All Subscriptions</h3>
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
                placeholder="Search subscriptions..."
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
              <option value="active">Active</option>
              <option value="paused">Paused</option>
              <option value="cancelled">Cancelled</option>
            </select>
            <button className="px-4 py-2 bg-primary-600 text-white rounded-lg hover:bg-primary-700 transition-colors text-sm font-medium">
              + Create Subscription
            </button>
          </div>
        </div>

        {loading ? (
          <div className="p-8 text-center text-gray-600">Loading subscriptions...</div>
        ) : filteredSubscriptions.length === 0 ? (
          <div className="p-8 text-center text-gray-600">
            {searchQuery || statusFilter !== 'all' ? 'No subscriptions found matching your filters' : 'No subscriptions yet'}
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead>
                <tr className="border-b border-gray-200">
                  <th className="text-left py-3 px-4 text-sm font-semibold text-gray-700">Customer</th>
                  <th className="text-left py-3 px-4 text-sm font-semibold text-gray-700">Plan</th>
                  <th className="text-left py-3 px-4 text-sm font-semibold text-gray-700">Line</th>
                  <th className="text-left py-3 px-4 text-sm font-semibold text-gray-700">Status</th>
                  <th className="text-left py-3 px-4 text-sm font-semibold text-gray-700">Start Date</th>
                  <th className="text-left py-3 px-4 text-sm font-semibold text-gray-700">Next Renewal</th>
                  <th className="text-left py-3 px-4 text-sm font-semibold text-gray-700">Renewal Type</th>
                  <th className="text-center py-3 px-4 text-sm font-semibold text-gray-700">Actions</th>
                </tr>
              </thead>
              <tbody>
                {filteredSubscriptions.map((sub: any) => {
                  const status = getStatus(sub)
                  const renewingSoon = isRenewalSoon(sub)

                  return (
                    <tr key={sub.id} className="border-b border-gray-100 hover:bg-gray-50 transition-colors">
                      <td className="py-4 px-4">
                        {sub.customer ? (
                          <Link
                            to={`/customers/${sub.customer_id}`}
                            className="text-sm text-primary-600 hover:text-primary-700 font-semibold"
                          >
                            {sub.customer.first_name} {sub.customer.last_name}
                          </Link>
                        ) : (
                          <span className="text-sm text-gray-400">Unknown</span>
                        )}
                        {sub.customer?.account_number && (
                          <p className="text-xs text-gray-500">{sub.customer.account_number}</p>
                        )}
                      </td>
                      <td className="py-4 px-4">
                        {sub.plan ? (
                          <div>
                            <p className="text-sm font-semibold text-gray-900">{sub.plan.plan_name}</p>
                            <p className="text-xs text-gray-500">{sub.plan.plan_category}</p>
                          </div>
                        ) : (
                          <span className="text-sm text-gray-400">-</span>
                        )}
                      </td>
                      <td className="py-4 px-4">
                        {sub.line ? (
                          <Link
                            to={`/lines/${sub.line_id}`}
                            className="text-sm text-primary-600 hover:text-primary-700"
                          >
                            {sub.line.phone_number}
                          </Link>
                        ) : (
                          <span className="text-sm text-gray-400">-</span>
                        )}
                      </td>
                      <td className="py-4 px-4">
                        <span className={`px-2 py-1 rounded-full text-xs font-medium ${status.color}`}>
                          {status.label}
                        </span>
                      </td>
                      <td className="py-4 px-4">
                        <span className="text-sm text-gray-900">{formatDate(sub.start_date)}</span>
                      </td>
                      <td className="py-4 px-4">
                        <span
                          className={`text-sm ${
                            renewingSoon ? 'text-orange-600 font-semibold' : 'text-gray-900'
                          }`}
                        >
                          {formatDate(sub.next_renewal_date)}
                        </span>
                        {renewingSoon && (
                          <p className="text-xs text-orange-600">Renews soon</p>
                        )}
                      </td>
                      <td className="py-4 px-4">
                        <span className={`px-2 py-1 rounded text-xs font-medium ${
                          sub.renewal_type === 'automatic'
                            ? 'bg-blue-100 text-blue-800'
                            : 'bg-gray-100 text-gray-800'
                        }`}>
                          {sub.renewal_type === 'automatic' ? 'Auto' : 'Manual'}
                        </span>
                      </td>
                      <td className="py-4 px-4">
                        <div className="flex items-center justify-center gap-2">
                          {!sub.cancelled_at && !sub.paused_at && sub.is_active && (
                            <button
                              onClick={() => handlePause(sub.id)}
                              disabled={actionLoading === sub.id}
                              className="p-2 text-yellow-500 hover:text-yellow-700 hover:bg-yellow-50 rounded-lg transition-colors disabled:opacity-50"
                              title="Pause subscription"
                            >
                              <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path
                                  strokeLinecap="round"
                                  strokeLinejoin="round"
                                  strokeWidth={2}
                                  d="M10 9v6m4-6v6m7-3a9 9 0 11-18 0 9 9 0 0118 0z"
                                />
                              </svg>
                            </button>
                          )}
                          {sub.paused_at && !sub.cancelled_at && (
                            <button
                              onClick={() => handleActivate(sub.id)}
                              disabled={actionLoading === sub.id}
                              className="p-2 text-green-500 hover:text-green-700 hover:bg-green-50 rounded-lg transition-colors disabled:opacity-50"
                              title="Activate subscription"
                            >
                              <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path
                                  strokeLinecap="round"
                                  strokeLinejoin="round"
                                  strokeWidth={2}
                                  d="M14.752 11.168l-3.197-2.132A1 1 0 0010 9.87v4.263a1 1 0 001.555.832l3.197-2.132a1 1 0 000-1.664z"
                                />
                                <path
                                  strokeLinecap="round"
                                  strokeLinejoin="round"
                                  strokeWidth={2}
                                  d="M21 12a9 9 0 11-18 0 9 9 0 0118 0z"
                                />
                              </svg>
                            </button>
                          )}
                          {!sub.cancelled_at && (
                            <button
                              onClick={() => handleCancel(sub.id)}
                              disabled={actionLoading === sub.id}
                              className="p-2 text-red-500 hover:text-red-700 hover:bg-red-50 rounded-lg transition-colors disabled:opacity-50"
                              title="Cancel subscription"
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
                          <Link
                            to={`/subscriptions/${sub.id}`}
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
                          </Link>
                        </div>
                      </td>
                    </tr>
                  )
                })}
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
                  d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15"
                />
              </svg>
            </div>
            <div>
              <h4 className="text-sm font-semibold text-gray-900 mb-1">Automatic Renewals</h4>
              <p className="text-xs text-gray-600">Active subscriptions renew automatically on schedule</p>
            </div>
          </div>
        </Card>
        <Card>
          <div className="flex items-start gap-3">
            <div className="w-10 h-10 bg-yellow-100 rounded-lg flex items-center justify-center">
              <svg className="w-5 h-5 text-yellow-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M10 9v6m4-6v6m7-3a9 9 0 11-18 0 9 9 0 0118 0z"
                />
              </svg>
            </div>
            <div>
              <h4 className="text-sm font-semibold text-gray-900 mb-1">Pause Subscriptions</h4>
              <p className="text-xs text-gray-600">Temporarily halt billing while preserving customer data</p>
            </div>
          </div>
        </Card>
        <Card>
          <div className="flex items-start gap-3">
            <div className="w-10 h-10 bg-red-100 rounded-lg flex items-center justify-center">
              <svg className="w-5 h-5 text-red-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z"
                />
              </svg>
            </div>
            <div>
              <h4 className="text-sm font-semibold text-gray-900 mb-1">Grace Periods</h4>
              <p className="text-xs text-gray-600">Configurable grace periods for failed payments</p>
            </div>
          </div>
        </Card>
      </div>
    </div>
  )
}
