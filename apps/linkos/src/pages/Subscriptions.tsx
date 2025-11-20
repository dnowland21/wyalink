import { useState, useEffect } from 'react'
import { Link } from 'react-router-dom'
import { getSubscriptions, activateSubscription, pauseSubscription, cancelSubscription, type Subscription } from '@wyalink/supabase-client'
import { Card, CardHeader, CardTitle, CardContent } from '../components/ui/card'
import { Badge } from '../components/ui/badge'
import { Button } from '../components/ui/button'
import { Input } from '../components/ui/input'
import { Search, Plus, Pause, Play, X, Edit, Eye, RefreshCw, AlertCircle } from 'lucide-react'
import SubscriptionModal from '../components/SubscriptionModal'

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

  // Modal state
  const [isModalOpen, setIsModalOpen] = useState(false)
  const [selectedSubscription, setSelectedSubscription] = useState<Subscription | null>(null)

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

  // Modal handlers
  const handleOpenCreateModal = () => {
    setSelectedSubscription(null)
    setIsModalOpen(true)
  }

  const handleOpenEditModal = (subscription: Subscription) => {
    setSelectedSubscription(subscription)
    setIsModalOpen(true)
  }

  const handleCloseModal = (shouldRefresh?: boolean) => {
    setIsModalOpen(false)
    setSelectedSubscription(null)
    if (shouldRefresh) {
      fetchSubscriptions()
    }
  }

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
    if (sub.cancelled_at) return { label: 'Cancelled', color: 'error' }
    if (sub.paused_at) return { label: 'Paused', color: 'warning' }
    if (sub.is_active) return { label: 'Active', color: 'success' }
    return { label: 'Inactive', color: 'default' }
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
          <CardContent className="p-6">
            <div className="text-sm text-muted-foreground">Total</div>
            <div className="text-2xl font-bold mt-1">{stats.total}</div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-6">
            <div className="text-sm text-muted-foreground">Active</div>
            <div className="text-2xl font-bold text-success mt-1">{stats.active}</div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-6">
            <div className="text-sm text-muted-foreground">Paused</div>
            <div className="text-2xl font-bold text-warning mt-1">{stats.paused}</div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-6">
            <div className="text-sm text-muted-foreground">Cancelled</div>
            <div className="text-2xl font-bold text-error mt-1">{stats.cancelled}</div>
          </CardContent>
        </Card>
      </div>

      {/* Error Message */}
      {error && (
        <div className="bg-error-50 border border-error-200 rounded-lg p-4 mb-6">
          <p className="text-sm text-error-800">{error}</p>
        </div>
      )}

      {/* Subscriptions Table */}
      <Card>
        <CardHeader>
          <div className="flex items-center justify-between">
            <CardTitle className="text-lg">All Subscriptions</CardTitle>
            <div className="flex items-center gap-3">
              <div className="relative">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground pointer-events-none" />
                <Input
                  type="text"
                  placeholder="Search subscriptions..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="w-64 pl-9"
                />
              </div>
              <select
                value={statusFilter}
                onChange={(e) => setStatusFilter(e.target.value)}
                className="text-sm border border-input rounded-md px-3 py-2 h-10 focus:outline-none focus:ring-2 focus:ring-ring"
              >
                <option value="all">All Status</option>
                <option value="active">Active</option>
                <option value="paused">Paused</option>
                <option value="cancelled">Cancelled</option>
              </select>
              <Button onClick={handleOpenCreateModal}>
                <Plus className="h-4 w-4 mr-2" />
                Create Subscription
              </Button>
            </div>
          </div>
        </CardHeader>
        <CardContent>
          {loading ? (
            <div className="p-8 text-center text-muted-foreground">Loading subscriptions...</div>
          ) : filteredSubscriptions.length === 0 ? (
            <div className="p-8 text-center text-muted-foreground">
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
                              className="text-sm text-primary hover:text-primary/80 font-semibold"
                            >
                              {sub.customer.first_name} {sub.customer.last_name}
                            </Link>
                          ) : (
                            <span className="text-sm text-muted-foreground">Unknown</span>
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
                            <span className="text-sm text-muted-foreground">-</span>
                          )}
                        </td>
                        <td className="py-4 px-4">
                          {sub.line ? (
                            <Link
                              to={`/lines/${sub.line_id}`}
                              className="text-sm text-primary hover:text-primary/80"
                            >
                              {sub.line.phone_number}
                            </Link>
                          ) : (
                            <span className="text-sm text-muted-foreground">-</span>
                          )}
                        </td>
                        <td className="py-4 px-4">
                          <Badge variant={status.color as any}>
                            {status.label}
                          </Badge>
                        </td>
                        <td className="py-4 px-4">
                          <span className="text-sm text-gray-900">{formatDate(sub.start_date)}</span>
                        </td>
                        <td className="py-4 px-4">
                          <span
                            className={`text-sm ${
                              renewingSoon ? 'text-warning font-semibold' : 'text-gray-900'
                            }`}
                          >
                            {formatDate(sub.next_renewal_date)}
                          </span>
                          {renewingSoon && (
                            <p className="text-xs text-warning">Renews soon</p>
                          )}
                        </td>
                        <td className="py-4 px-4">
                          <Badge variant={sub.renewal_type === 'automatic' ? 'info' : 'default'}>
                            {sub.renewal_type === 'automatic' ? 'Auto' : 'Manual'}
                          </Badge>
                        </td>
                        <td className="py-4 px-4">
                          <div className="flex items-center justify-center gap-2">
                            {!sub.cancelled_at && !sub.paused_at && sub.is_active && (
                              <Button
                                variant="ghost"
                                size="sm"
                                onClick={() => handlePause(sub.id)}
                                disabled={actionLoading === sub.id}
                                title="Pause subscription"
                              >
                                <Pause className="w-4 h-4" />
                              </Button>
                            )}
                            {sub.paused_at && !sub.cancelled_at && (
                              <Button
                                variant="ghost"
                                size="sm"
                                onClick={() => handleActivate(sub.id)}
                                disabled={actionLoading === sub.id}
                                title="Activate subscription"
                              >
                                <Play className="w-4 h-4" />
                              </Button>
                            )}
                            {!sub.cancelled_at && (
                              <Button
                                variant="ghost"
                                size="sm"
                                onClick={() => handleCancel(sub.id)}
                                disabled={actionLoading === sub.id}
                                title="Cancel subscription"
                              >
                                <X className="w-4 h-4" />
                              </Button>
                            )}
                            <Button
                              variant="ghost"
                              size="sm"
                              onClick={() => handleOpenEditModal(sub)}
                              title="Edit subscription"
                            >
                              <Edit className="w-4 h-4" />
                            </Button>
                            <Button
                              variant="ghost"
                              size="sm"
                              asChild
                              title="View details"
                            >
                              <Link to={`/subscriptions/${sub.id}`}>
                                <Eye className="w-4 h-4" />
                              </Link>
                            </Button>
                          </div>
                        </td>
                      </tr>
                    )
                  })}
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
              <div className="w-10 h-10 bg-info-50 rounded-lg flex items-center justify-center">
                <RefreshCw className="w-5 h-5 text-info" />
              </div>
              <div>
                <h4 className="text-sm font-semibold text-gray-900 mb-1">Automatic Renewals</h4>
                <p className="text-xs text-gray-600">Active subscriptions renew automatically on schedule</p>
              </div>
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-6">
            <div className="flex items-start gap-3">
              <div className="w-10 h-10 bg-warning-50 rounded-lg flex items-center justify-center">
                <Pause className="w-5 h-5 text-warning" />
              </div>
              <div>
                <h4 className="text-sm font-semibold text-gray-900 mb-1">Pause Subscriptions</h4>
                <p className="text-xs text-gray-600">Temporarily halt billing while preserving customer data</p>
              </div>
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-6">
            <div className="flex items-start gap-3">
              <div className="w-10 h-10 bg-error-50 rounded-lg flex items-center justify-center">
                <AlertCircle className="w-5 h-5 text-error" />
              </div>
              <div>
                <h4 className="text-sm font-semibold text-gray-900 mb-1">Grace Periods</h4>
                <p className="text-xs text-gray-600">Configurable grace periods for failed payments</p>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Subscription Modal */}
      <SubscriptionModal isOpen={isModalOpen} onClose={handleCloseModal} subscription={selectedSubscription} />
    </div>
  )
}
