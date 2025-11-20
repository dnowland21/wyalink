import { useState, useEffect } from 'react'
import { useParams, useNavigate, Link } from 'react-router-dom'
import {
  getSubscription,
  deleteSubscription,
  type Subscription,
} from '@wyalink/supabase-client'
import { Card, CardHeader, CardTitle, CardContent } from '../components/ui/card'
import { Badge } from '../components/ui/badge'
import { Button } from '../components/ui/button'
import { Edit, Trash2, Loader2 } from 'lucide-react'
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
          <Loader2 className="w-16 h-16 animate-spin mx-auto mb-4 text-primary" />
          <p className="text-muted-foreground">Loading subscription...</p>
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
        <div className="flex items-center gap-2 text-sm text-muted-foreground mb-4">
          <Link to="/subscriptions" className="hover:text-primary">
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
              <p className="text-muted-foreground mt-1">
                {(subscription as any).customer.first_name} {(subscription as any).customer.last_name}
              </p>
            )}
          </div>
          <div className="flex items-center gap-2">
            <Button
              onClick={() => setIsEditModalOpen(true)}
              variant="outline"
            >
              <Edit className="w-4 h-4 mr-2" />
              Edit Subscription
            </Button>
            <Button
              onClick={handleDelete}
              variant="outline"
              className="border-red-300 text-red-700 hover:bg-red-50"
            >
              <Trash2 className="w-4 h-4 mr-2" />
              Delete
            </Button>
          </div>
        </div>
      </div>

      {/* Status Badge */}
      <div className="flex items-center gap-3 mb-6">
        <Badge variant={subscription.is_active ? 'success' : 'default'}>
          {subscription.is_active ? 'Active' : 'Inactive'}
        </Badge>
        <Badge variant="info">
          {subscription.activation_type === 'active' ? 'Active Subscription' : 'Pre-Active'}
        </Badge>
        <Badge variant="secondary">
          {subscription.renewal_type === 'automatic' ? 'Auto-Renew' : 'Manual Renew'}
        </Badge>
      </div>

      {/* Main Content */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Left Column - Subscription Details */}
        <div className="lg:col-span-2 space-y-6">
          {/* Plan Information */}
          <Card>
            <CardHeader>
              <CardTitle>Plan Information</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-3">
                <div>
                  <label className="block text-sm font-medium text-muted-foreground mb-1">Plan</label>
                  {subscription.plan_id && (
                    <Link
                      to={`/plans/${subscription.plan_id}`}
                      className="text-sm text-primary hover:text-primary/80"
                    >
                      {(subscription as any).plan?.plan_name || 'View Plan'}
                    </Link>
                  )}
                </div>
                {(subscription as any).plan?.description && (
                  <div>
                    <label className="block text-sm font-medium text-muted-foreground mb-1">Description</label>
                    <p className="text-sm text-gray-900">{(subscription as any).plan.description}</p>
                  </div>
                )}
              </div>
            </CardContent>
          </Card>

          {/* Customer & Line Information */}
          <Card>
            <CardHeader>
              <CardTitle>Customer & Line</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-3">
                <div>
                  <label className="block text-sm font-medium text-muted-foreground mb-1">Customer</label>
                  <Link
                    to={`/customers/${subscription.customer_id}`}
                    className="text-sm text-primary hover:text-primary/80"
                  >
                    {(subscription as any).customer
                      ? `${(subscription as any).customer.first_name} ${(subscription as any).customer.last_name} (${(subscription as any).customer.account_number})`
                      : 'View Customer'}
                  </Link>
                </div>
                {subscription.line_id && (
                  <div>
                    <label className="block text-sm font-medium text-muted-foreground mb-1">Line</label>
                    <Link
                      to={`/lines/${subscription.line_id}`}
                      className="text-sm text-primary hover:text-primary/80 font-mono"
                    >
                      {(subscription as any).line?.phone_number || 'View Line'}
                    </Link>
                  </div>
                )}
              </div>
            </CardContent>
          </Card>

          {/* Billing Information */}
          <Card>
            <CardHeader>
              <CardTitle>Billing & Renewal</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-3">
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-muted-foreground mb-1">Start Type</label>
                    <p className="text-sm text-gray-900">{subscription.start_type === 'asap' ? 'ASAP' : 'Specific Date'}</p>
                  </div>
                  {subscription.start_date && (
                    <div>
                      <label className="block text-sm font-medium text-muted-foreground mb-1">Start Date</label>
                      <p className="text-sm text-gray-900">{formatDate(subscription.start_date)}</p>
                    </div>
                  )}
                </div>
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-muted-foreground mb-1">End Type</label>
                    <p className="text-sm text-gray-900">
                      {subscription.end_type === 'unlimited' ? 'Unlimited' :
                       subscription.end_type === 'after_cycles' ? `After ${subscription.end_cycles} cycles` :
                       'On Date'}
                    </p>
                  </div>
                  {subscription.end_date && (
                    <div>
                      <label className="block text-sm font-medium text-muted-foreground mb-1">End Date</label>
                      <p className="text-sm text-gray-900">{formatDate(subscription.end_date)}</p>
                    </div>
                  )}
                </div>
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-muted-foreground mb-1">Renewal Type</label>
                    <p className="text-sm text-gray-900">
                      {subscription.renewal_type === 'automatic' ? 'Automatic' : 'Manual'}
                    </p>
                  </div>
                  {subscription.next_renewal_date && (
                    <div>
                      <label className="block text-sm font-medium text-muted-foreground mb-1">Next Renewal</label>
                      <p className="text-sm text-gray-900 font-semibold">{formatDate(subscription.next_renewal_date)}</p>
                    </div>
                  )}
                </div>
                {subscription.renewal_interval_days && (
                  <div>
                    <label className="block text-sm font-medium text-muted-foreground mb-1">Renewal Interval</label>
                    <p className="text-sm text-gray-900">{subscription.renewal_interval_days} days</p>
                  </div>
                )}
                {subscription.renewal_day_of_month && (
                  <div>
                    <label className="block text-sm font-medium text-muted-foreground mb-1">Renewal Day of Month</label>
                    <p className="text-sm text-gray-900">{subscription.renewal_day_of_month}</p>
                  </div>
                )}
                <div>
                  <label className="block text-sm font-medium text-muted-foreground mb-1">Grace Period</label>
                  <p className="text-sm text-gray-900">{subscription.grace_period_days} days</p>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Additional Details */}
          {(subscription.bill_to || subscription.transaction_reason) && (
            <Card>
              <CardHeader>
                <CardTitle>Additional Details</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-3">
                  {subscription.bill_to && (
                    <div>
                      <label className="block text-sm font-medium text-muted-foreground mb-1">Bill To</label>
                      <p className="text-sm text-gray-900">{subscription.bill_to}</p>
                    </div>
                  )}
                  {subscription.transaction_reason && (
                    <div>
                      <label className="block text-sm font-medium text-muted-foreground mb-1">Transaction Reason</label>
                      <p className="text-sm text-gray-900">{subscription.transaction_reason}</p>
                    </div>
                  )}
                </div>
              </CardContent>
            </Card>
          )}
        </div>

        {/* Right Column - Status & Metadata */}
        <div className="space-y-6">
          {/* Status Information */}
          <Card>
            <CardHeader>
              <CardTitle>Status</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-3">
                <div>
                  <label className="block text-sm font-medium text-muted-foreground mb-1">Active</label>
                  <Badge variant={subscription.is_active ? 'success' : 'default'}>
                    {subscription.is_active ? 'Yes' : 'No'}
                  </Badge>
                </div>
                <div>
                  <label className="block text-sm font-medium text-muted-foreground mb-1">Activation Type</label>
                  <p className="text-sm text-gray-900">
                    {subscription.activation_type === 'active' ? 'Active' : 'Pre-Active'}
                  </p>
                </div>
                {subscription.activated_at && (
                  <div>
                    <label className="block text-sm font-medium text-muted-foreground mb-1">Activated At</label>
                    <p className="text-sm text-gray-900">{formatDateTime(subscription.activated_at)}</p>
                  </div>
                )}
                {subscription.paused_at && (
                  <div>
                    <label className="block text-sm font-medium text-muted-foreground mb-1">Paused At</label>
                    <p className="text-sm text-gray-900">{formatDateTime(subscription.paused_at)}</p>
                  </div>
                )}
                {subscription.cancelled_at && (
                  <div>
                    <label className="block text-sm font-medium text-muted-foreground mb-1">Cancelled At</label>
                    <p className="text-sm text-gray-900">{formatDateTime(subscription.cancelled_at)}</p>
                  </div>
                )}
              </div>
            </CardContent>
          </Card>

          {/* Metadata */}
          <Card>
            <CardHeader>
              <CardTitle>Metadata</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-3">
                <div>
                  <label className="block text-sm font-medium text-muted-foreground mb-1">Created</label>
                  <p className="text-sm text-gray-900">{formatDateTime(subscription.created_at)}</p>
                </div>
                <div>
                  <label className="block text-sm font-medium text-muted-foreground mb-1">Last Updated</label>
                  <p className="text-sm text-gray-900">{formatDateTime(subscription.updated_at)}</p>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>

      {/* Edit Modal */}
      <SubscriptionModal isOpen={isEditModalOpen} onClose={handleEditModalClose} subscription={subscription} />
    </div>
  )
}
