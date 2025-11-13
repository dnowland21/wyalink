import { useState, useEffect } from 'react'
import { useParams, useNavigate, Link } from 'react-router-dom'
import {
  getSubscription,
  deleteSubscription,
  type Subscription,
} from '@wyalink/supabase-client'
import { Card } from '@wyalink/ui'
import SubscriptionModal from '../components/SubscriptionModal'

export default function SubscriptionDetail() {
  const { id } = useParams<{ id: string }>()
  const navigate = useNavigate()

  const [subscription, setSubscription] = useState<Subscription | null>(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [isEditModalOpen, setIsEditModalOpen] = useState(false)

  useEffect(() => {
    if (!id) {
      navigate('/subscriptions')
      return
    }

    fetchSubscription()
  }, [id])

  const fetchSubscription = async () => {
    if (!id) return

    setLoading(true)
    setError(null)

    try {
      const result = await getSubscription(id)

      if (result.error) throw result.error

      setSubscription(result.data)
    } catch (err: any) {
      setError('Failed to load subscription')
      console.error(err)
    } finally {
      setLoading(false)
    }
  }

  const handleEditModalClose = (shouldRefresh?: boolean) => {
    setIsEditModalOpen(false)
    if (shouldRefresh) {
      fetchSubscription()
    }
  }

  const handleDelete = async () => {
    if (!id || !window.confirm('Permanently delete this subscription? This action cannot be undone.')) return

    try {
      const result = await deleteSubscription(id)
      if (result.error) throw result.error

      navigate('/subscriptions')
    } catch (err: any) {
      alert('Failed to delete subscription')
      console.error(err)
    }
  }

  const formatDate = (dateString: string | null) => {
    if (!dateString) return 'N/A'
    return new Date(dateString).toLocaleDateString('en-US', {
      month: 'short',
      day: 'numeric',
      year: 'numeric',
    })
  }

  const formatDateTime = (dateString: string | null) => {
    if (!dateString) return 'N/A'
    return new Date(dateString).toLocaleString()
  }

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="text-center">
          <div className="w-16 h-16 border-4 border-primary-600 border-t-transparent rounded-full animate-spin mx-auto mb-4"></div>
          <p className="text-gray-600">Loading subscription...</p>
        </div>
      </div>
    )
  }

  if (error || !subscription) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="text-center">
          <p className="text-red-600 mb-4">{error || 'Subscription not found'}</p>
          <Link to="/subscriptions" className="text-primary-600 hover:text-primary-700">
            Back to Subscriptions
          </Link>
        </div>
      </div>
    )
  }

  return (
    <div>
      {/* Header */}
      <div className="mb-6">
        <div className="flex items-center gap-2 text-sm text-gray-600 mb-4">
          <Link to="/subscriptions" className="hover:text-primary-600">
            Subscriptions
          </Link>
          <span>/</span>
          <span>
            {(subscription as any).customer
              ? `${(subscription as any).customer.first_name} ${(subscription as any).customer.last_name}`
              : 'Subscription'}
          </span>
        </div>

        <div className="flex items-start justify-between">
          <div>
            <h1 className="text-3xl font-bold text-gray-900">
              {(subscription as any).plan?.plan_name || 'Subscription'}
            </h1>
            {(subscription as any).customer && (
              <p className="text-gray-600 mt-1">
                {(subscription as any).customer.first_name} {(subscription as any).customer.last_name}
              </p>
            )}
          </div>
          <div className="flex items-center gap-2">
            <button
              onClick={() => setIsEditModalOpen(true)}
              className="px-4 py-2 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 transition-colors"
            >
              Edit Subscription
            </button>
            <button
              onClick={handleDelete}
              className="px-4 py-2 border border-red-300 text-red-700 rounded-lg hover:bg-red-50 transition-colors"
            >
              Delete
            </button>
          </div>
        </div>
      </div>

      {/* Status Badge */}
      <div className="flex items-center gap-3 mb-6">
        <span className={`px-3 py-1 rounded-full text-sm font-medium ${
          subscription.is_active ? 'bg-green-100 text-green-800' : 'bg-gray-100 text-gray-800'
        }`}>
          {subscription.is_active ? 'Active' : 'Inactive'}
        </span>
        <span className="px-3 py-1 bg-blue-100 text-blue-800 rounded-full text-sm font-medium">
          {subscription.activation_type === 'active' ? 'Active Subscription' : 'Pre-Active'}
        </span>
        <span className="px-3 py-1 bg-purple-100 text-purple-800 rounded-full text-sm font-medium">
          {subscription.renewal_type === 'automatic' ? 'Auto-Renew' : 'Manual Renew'}
        </span>
      </div>

      {/* Main Content */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Left Column - Subscription Details */}
        <div className="lg:col-span-2 space-y-6">
          {/* Plan Information */}
          <Card>
            <h3 className="text-lg font-semibold text-gray-900 mb-4">Plan Information</h3>
            <div className="space-y-3">
              <div>
                <label className="block text-sm font-medium text-gray-600 mb-1">Plan</label>
                {subscription.plan_id && (
                  <Link
                    to={`/plans/${subscription.plan_id}`}
                    className="text-sm text-primary-600 hover:text-primary-700"
                  >
                    {(subscription as any).plan?.plan_name || 'View Plan'}
                  </Link>
                )}
              </div>
              {(subscription as any).plan?.description && (
                <div>
                  <label className="block text-sm font-medium text-gray-600 mb-1">Description</label>
                  <p className="text-sm text-gray-900">{(subscription as any).plan.description}</p>
                </div>
              )}
            </div>
          </Card>

          {/* Customer & Line Information */}
          <Card>
            <h3 className="text-lg font-semibold text-gray-900 mb-4">Customer & Line</h3>
            <div className="space-y-3">
              <div>
                <label className="block text-sm font-medium text-gray-600 mb-1">Customer</label>
                <Link
                  to={`/customers/${subscription.customer_id}`}
                  className="text-sm text-primary-600 hover:text-primary-700"
                >
                  {(subscription as any).customer
                    ? `${(subscription as any).customer.first_name} ${(subscription as any).customer.last_name} (${(subscription as any).customer.account_number})`
                    : 'View Customer'}
                </Link>
              </div>
              {subscription.line_id && (
                <div>
                  <label className="block text-sm font-medium text-gray-600 mb-1">Line</label>
                  <Link
                    to={`/lines/${subscription.line_id}`}
                    className="text-sm text-primary-600 hover:text-primary-700 font-mono"
                  >
                    {(subscription as any).line?.phone_number || 'View Line'}
                  </Link>
                </div>
              )}
            </div>
          </Card>

          {/* Billing Information */}
          <Card>
            <h3 className="text-lg font-semibold text-gray-900 mb-4">Billing & Renewal</h3>
            <div className="space-y-3">
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-600 mb-1">Start Type</label>
                  <p className="text-sm text-gray-900">{subscription.start_type === 'asap' ? 'ASAP' : 'Specific Date'}</p>
                </div>
                {subscription.start_date && (
                  <div>
                    <label className="block text-sm font-medium text-gray-600 mb-1">Start Date</label>
                    <p className="text-sm text-gray-900">{formatDate(subscription.start_date)}</p>
                  </div>
                )}
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-600 mb-1">End Type</label>
                  <p className="text-sm text-gray-900">
                    {subscription.end_type === 'unlimited' ? 'Unlimited' :
                     subscription.end_type === 'after_cycles' ? `After ${subscription.end_cycles} cycles` :
                     'On Date'}
                  </p>
                </div>
                {subscription.end_date && (
                  <div>
                    <label className="block text-sm font-medium text-gray-600 mb-1">End Date</label>
                    <p className="text-sm text-gray-900">{formatDate(subscription.end_date)}</p>
                  </div>
                )}
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-600 mb-1">Renewal Type</label>
                  <p className="text-sm text-gray-900">
                    {subscription.renewal_type === 'automatic' ? 'Automatic' : 'Manual'}
                  </p>
                </div>
                {subscription.next_renewal_date && (
                  <div>
                    <label className="block text-sm font-medium text-gray-600 mb-1">Next Renewal</label>
                    <p className="text-sm text-gray-900 font-semibold">{formatDate(subscription.next_renewal_date)}</p>
                  </div>
                )}
              </div>
              {subscription.renewal_interval_days && (
                <div>
                  <label className="block text-sm font-medium text-gray-600 mb-1">Renewal Interval</label>
                  <p className="text-sm text-gray-900">{subscription.renewal_interval_days} days</p>
                </div>
              )}
              {subscription.renewal_day_of_month && (
                <div>
                  <label className="block text-sm font-medium text-gray-600 mb-1">Renewal Day of Month</label>
                  <p className="text-sm text-gray-900">{subscription.renewal_day_of_month}</p>
                </div>
              )}
              <div>
                <label className="block text-sm font-medium text-gray-600 mb-1">Grace Period</label>
                <p className="text-sm text-gray-900">{subscription.grace_period_days} days</p>
              </div>
            </div>
          </Card>

          {/* Additional Details */}
          {(subscription.bill_to || subscription.transaction_reason) && (
            <Card>
              <h3 className="text-lg font-semibold text-gray-900 mb-4">Additional Details</h3>
              <div className="space-y-3">
                {subscription.bill_to && (
                  <div>
                    <label className="block text-sm font-medium text-gray-600 mb-1">Bill To</label>
                    <p className="text-sm text-gray-900">{subscription.bill_to}</p>
                  </div>
                )}
                {subscription.transaction_reason && (
                  <div>
                    <label className="block text-sm font-medium text-gray-600 mb-1">Transaction Reason</label>
                    <p className="text-sm text-gray-900">{subscription.transaction_reason}</p>
                  </div>
                )}
              </div>
            </Card>
          )}
        </div>

        {/* Right Column - Status & Metadata */}
        <div className="space-y-6">
          {/* Status Information */}
          <Card>
            <h3 className="text-lg font-semibold text-gray-900 mb-4">Status</h3>
            <div className="space-y-3">
              <div>
                <label className="block text-sm font-medium text-gray-600 mb-1">Active</label>
                <span className={`inline-block px-3 py-1 rounded-full text-sm font-medium ${
                  subscription.is_active ? 'bg-green-100 text-green-800' : 'bg-gray-100 text-gray-800'
                }`}>
                  {subscription.is_active ? 'Yes' : 'No'}
                </span>
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-600 mb-1">Activation Type</label>
                <p className="text-sm text-gray-900">
                  {subscription.activation_type === 'active' ? 'Active' : 'Pre-Active'}
                </p>
              </div>
              {subscription.activated_at && (
                <div>
                  <label className="block text-sm font-medium text-gray-600 mb-1">Activated At</label>
                  <p className="text-sm text-gray-900">{formatDateTime(subscription.activated_at)}</p>
                </div>
              )}
              {subscription.paused_at && (
                <div>
                  <label className="block text-sm font-medium text-gray-600 mb-1">Paused At</label>
                  <p className="text-sm text-gray-900">{formatDateTime(subscription.paused_at)}</p>
                </div>
              )}
              {subscription.cancelled_at && (
                <div>
                  <label className="block text-sm font-medium text-gray-600 mb-1">Cancelled At</label>
                  <p className="text-sm text-gray-900">{formatDateTime(subscription.cancelled_at)}</p>
                </div>
              )}
            </div>
          </Card>

          {/* Metadata */}
          <Card>
            <h3 className="text-lg font-semibold text-gray-900 mb-4">Metadata</h3>
            <div className="space-y-3">
              <div>
                <label className="block text-sm font-medium text-gray-600 mb-1">Created</label>
                <p className="text-sm text-gray-900">{formatDateTime(subscription.created_at)}</p>
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-600 mb-1">Last Updated</label>
                <p className="text-sm text-gray-900">{formatDateTime(subscription.updated_at)}</p>
              </div>
            </div>
          </Card>
        </div>
      </div>

      {/* Edit Modal */}
      <SubscriptionModal isOpen={isEditModalOpen} onClose={handleEditModalClose} subscription={subscription} />
    </div>
  )
}
