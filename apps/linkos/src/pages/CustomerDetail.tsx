import { useState, useEffect } from 'react'
import { useParams, useNavigate, Link } from 'react-router-dom'
import {
  getCustomer,
  getLines,
  getSubscriptions,
  type Customer,
  type Line,
  type Subscription,
  type LineStatus,
} from '@wyalink/supabase-client'
import { Card, CardHeader, CardTitle, CardContent } from '../components/ui/card'
import { Badge } from '../components/ui/badge'
import { Button } from '../components/ui/button'
import { ChevronLeft, Plus, Smartphone, FileText } from 'lucide-react'
import CustomerModal from '../components/CustomerModal'
import LineModal from '../components/LineModal'
import SubscriptionModal from '../components/SubscriptionModal'
import QuoteModal from '../components/QuoteModal'
import CustomerActivityTimeline from '../components/CustomerActivityTimeline'
import QuotesList from '../components/QuotesList'

const lineStatusVariants: Record<LineStatus, 'default' | 'info' | 'success' | 'warning' | 'warning' | 'error'> = {
  initiating: 'default',
  pending: 'info',
  activated: 'success',
  paused: 'warning',
  deactivated: 'warning',
  terminated: 'error',
}

export default function CustomerDetail() {
  const { id } = useParams<{ id: string }>()
  const navigate = useNavigate()

  const [customer, setCustomer] = useState<Customer | null>(null)
  const [lines, setLines] = useState<Line[]>([])
  const [subscriptions, setSubscriptions] = useState<Subscription[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [activeTab, setActiveTab] = useState<'overview' | 'lines' | 'subscriptions' | 'activity' | 'quotes' | 'billing'>('overview')
  const [isEditModalOpen, setIsEditModalOpen] = useState(false)
  const [isLineModalOpen, setIsLineModalOpen] = useState(false)
  const [isSubscriptionModalOpen, setIsSubscriptionModalOpen] = useState(false)
  const [isQuoteModalOpen, setIsQuoteModalOpen] = useState(false)
  const [expandedLines, setExpandedLines] = useState<Set<string>>(new Set())

  useEffect(() => {
    if (!id) {
      navigate('/customers')
      return
    }

    fetchCustomerData()
  }, [id])

  const handleEditModalClose = (shouldRefresh?: boolean) => {
    setIsEditModalOpen(false)
    if (shouldRefresh) {
      fetchCustomerData()
    }
  }

  const handleLineModalClose = (shouldRefresh?: boolean) => {
    setIsLineModalOpen(false)
    if (shouldRefresh) {
      fetchCustomerData()
    }
  }

  const handleSubscriptionModalClose = (shouldRefresh?: boolean) => {
    setIsSubscriptionModalOpen(false)
    if (shouldRefresh) {
      fetchCustomerData()
    }
  }

  const handleQuoteModalClose = (shouldRefresh?: boolean) => {
    setIsQuoteModalOpen(false)
    if (shouldRefresh) {
      fetchCustomerData()
    }
  }

  const fetchCustomerData = async () => {
    if (!id) return

    setLoading(true)
    setError(null)

    try {
      // Fetch customer
      const customerResult = await getCustomer(id)
      if (customerResult.error) throw customerResult.error
      if (!customerResult.data) throw new Error('Customer not found')

      setCustomer(customerResult.data)

      // Fetch related data in parallel
      const [linesResult, subscriptionsResult] = await Promise.all([
        getLines({ customer_id: id }),
        getSubscriptions({ customer_id: id }),
      ])

      if (linesResult.error) {
        console.error('Failed to load lines:', linesResult.error.message || linesResult.error)
      }
      if (subscriptionsResult.error) {
        console.error('Failed to load subscriptions:', subscriptionsResult.error.message || subscriptionsResult.error)
      }

      setLines(linesResult.data || [])
      setSubscriptions(subscriptionsResult.data || [])
    } catch (err: any) {
      setError(err.message || 'Failed to load customer')
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

  const toggleLineExpansion = (lineId: string) => {
    setExpandedLines((prev) => {
      const newSet = new Set(prev)
      if (newSet.has(lineId)) {
        newSet.delete(lineId)
      } else {
        newSet.add(lineId)
      }
      return newSet
    })
  }

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="text-muted-foreground">Loading customer...</div>
      </div>
    )
  }

  if (error || !customer) {
    return (
      <div className="max-w-4xl mx-auto mt-8">
        <div className="bg-red-50 border border-red-200 rounded-lg p-6">
          <p className="text-red-800">{error || 'Customer not found'}</p>
          <Link to="/customers" className="text-primary-600 hover:text-primary-700 mt-4 inline-block">
            &larr; Back to Customers
          </Link>
        </div>
      </div>
    )
  }

  return (
    <div>
      {/* Header with Gradient Background */}
      <div className="bg-gradient-to-r from-primary-600 to-secondary-400 rounded-2xl p-6 mb-8 shadow-lg">
        <div className="flex items-center gap-4 mb-4">
          <Link
            to="/customers"
            className="text-white hover:text-white/80 transition-colors"
            title="Back to Customers"
          >
            <ChevronLeft className="w-6 h-6" />
          </Link>
          <div className="flex-1">
            <div className="flex items-center gap-4">
              <div className="w-16 h-16 bg-white/20 backdrop-blur-sm rounded-2xl flex items-center justify-center text-white font-bold text-2xl border-2 border-white/30">
                {customer.first_name[0]}
                {customer.last_name[0]}
              </div>
              <div>
                <h1 className="text-3xl font-bold text-white tracking-tight">
                  {customer.first_name} {customer.middle_initial ? `${customer.middle_initial}. ` : ''}
                  {customer.last_name}
                </h1>
                <p className="text-white/90 font-mono text-sm mt-1">Account #{customer.account_number}</p>
              </div>
            </div>
          </div>
          <div className="flex gap-2">
            <Button
              onClick={() => setIsQuoteModalOpen(true)}
              variant="outline"
              className="bg-white/20 backdrop-blur-sm border-white/30 text-white hover:bg-white/30"
            >
              <FileText className="w-4 h-4 mr-2" />
              Create Quote
            </Button>
            <Button
              onClick={() => setIsEditModalOpen(true)}
              variant="outline"
              className="bg-white/20 backdrop-blur-sm border-white/30 text-white hover:bg-white/30"
            >
              Edit Customer
            </Button>
            <Button className="bg-white text-primary-600 hover:bg-white/90">
              Account Actions
            </Button>
          </div>
        </div>

        {/* Quick Stats */}
        <div className="flex gap-4 mt-4">
          <div className="bg-white/20 backdrop-blur-sm rounded-lg px-4 py-2 border border-white/30">
            <span className="text-white/80 text-sm">Active Lines:</span>{' '}
            <span className="text-white font-bold">{lines.filter((l) => l.status === 'activated').length}</span>
          </div>
          {customer.company_name && (
            <div className="bg-white/20 backdrop-blur-sm rounded-lg px-4 py-2 border border-white/30">
              <span className="text-white/80 text-sm">Company:</span>{' '}
              <span className="text-white font-semibold">{customer.company_name}</span>
            </div>
          )}
        </div>
      </div>

      {/* Tabs */}
      <div className="border-b border-gray-200 mb-6">
        <div className="flex gap-6">
          <button
            onClick={() => setActiveTab('overview')}
            className={`pb-3 px-1 border-b-2 font-medium transition-colors ${
              activeTab === 'overview'
                ? 'border-primary-600 text-primary-600'
                : 'border-transparent text-gray-600 hover:text-gray-900'
            }`}
          >
            Overview
          </button>
          <button
            onClick={() => setActiveTab('lines')}
            className={`pb-3 px-1 border-b-2 font-medium transition-colors ${
              activeTab === 'lines'
                ? 'border-primary-600 text-primary-600'
                : 'border-transparent text-gray-600 hover:text-gray-900'
            }`}
          >
            Lines ({lines.length})
          </button>
          <button
            onClick={() => setActiveTab('subscriptions')}
            className={`pb-3 px-1 border-b-2 font-medium transition-colors ${
              activeTab === 'subscriptions'
                ? 'border-primary-600 text-primary-600'
                : 'border-transparent text-gray-600 hover:text-gray-900'
            }`}
          >
            Subscriptions ({subscriptions.length})
          </button>
          <button
            onClick={() => setActiveTab('activity')}
            className={`pb-3 px-1 border-b-2 font-medium transition-colors ${
              activeTab === 'activity'
                ? 'border-primary-600 text-primary-600'
                : 'border-transparent text-gray-600 hover:text-gray-900'
            }`}
          >
            Activity
          </button>
          <button
            onClick={() => setActiveTab('quotes')}
            className={`pb-3 px-1 border-b-2 font-medium transition-colors ${
              activeTab === 'quotes'
                ? 'border-primary-600 text-primary-600'
                : 'border-transparent text-gray-600 hover:text-gray-900'
            }`}
          >
            Quotes
          </button>
          <button
            onClick={() => setActiveTab('billing')}
            className={`pb-3 px-1 border-b-2 font-medium transition-colors ${
              activeTab === 'billing'
                ? 'border-primary-600 text-primary-600'
                : 'border-transparent text-gray-600 hover:text-gray-900'
            }`}
          >
            Billing
          </button>
        </div>
      </div>

      {/* Tab Content */}
      {activeTab === 'overview' && (
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {/* Contact Information */}
          <Card>
            <CardHeader>
              <CardTitle className="text-lg">Contact Information</CardTitle>
            </CardHeader>
            <CardContent className="space-y-3">
              <div>
                <label className="text-sm font-medium text-muted-foreground">Email</label>
                <p className="text-foreground">{customer.email}</p>
              </div>
              <div>
                <label className="text-sm font-medium text-muted-foreground">Phone</label>
                <p className="text-foreground">{customer.phone}</p>
              </div>
            </CardContent>
          </Card>

          {/* Billing Address */}
          <Card>
            <CardHeader>
              <CardTitle className="text-lg">Billing Address</CardTitle>
            </CardHeader>
            <CardContent className="space-y-1 text-foreground">
              <p>{customer.billing_address_line1}</p>
              {customer.billing_address_line2 && <p>{customer.billing_address_line2}</p>}
              <p>
                {customer.billing_city}, {customer.billing_state} {customer.billing_zip}
              </p>
            </CardContent>
          </Card>

          {/* Shipping Address */}
          <Card>
            <CardHeader>
              <CardTitle className="text-lg">Shipping Address</CardTitle>
            </CardHeader>
            <CardContent className="space-y-1 text-foreground">
              {customer.shipping_address_line1 ? (
                <>
                  <p>{customer.shipping_address_line1}</p>
                  {customer.shipping_address_line2 && <p>{customer.shipping_address_line2}</p>}
                  <p>
                    {customer.shipping_city}, {customer.shipping_state} {customer.shipping_zip}
                  </p>
                </>
              ) : (
                <p className="text-muted-foreground italic">Same as billing address</p>
              )}
            </CardContent>
          </Card>

          {/* Account Details */}
          <Card>
            <CardHeader>
              <CardTitle className="text-lg">Account Details</CardTitle>
            </CardHeader>
            <CardContent className="space-y-3">
              <div>
                <label className="text-sm font-medium text-muted-foreground">Account Number</label>
                <p className="text-foreground font-mono font-semibold">{customer.account_number}</p>
              </div>
              <div>
                <label className="text-sm font-medium text-muted-foreground">Customer Type</label>
                <p className="text-foreground">{customer.type.charAt(0).toUpperCase() + customer.type.slice(1)}</p>
              </div>
              <div>
                <label className="text-sm font-medium text-muted-foreground">Account Created</label>
                <p className="text-foreground">{formatDate(customer.created_at)}</p>
              </div>
              {customer.company_name && (
                <div>
                  <label className="text-sm font-medium text-muted-foreground">Company Name</label>
                  <p className="text-foreground">{customer.company_name}</p>
                </div>
              )}
            </CardContent>
          </Card>

          {/* Service Summary */}
          <Card className="lg:col-span-2">
            <CardHeader>
              <CardTitle className="text-lg">Service Summary</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                <div className="bg-muted rounded-lg p-4">
                  <div className="text-sm text-muted-foreground">Active Lines</div>
                  <div className="text-2xl font-bold text-foreground mt-1">
                    {lines.filter((l) => l.status === 'activated').length}
                  </div>
                </div>
                <div className="bg-muted rounded-lg p-4">
                  <div className="text-sm text-muted-foreground">Total Lines</div>
                  <div className="text-2xl font-bold text-foreground mt-1">{lines.length}</div>
                </div>
                <div className="bg-muted rounded-lg p-4">
                  <div className="text-sm text-muted-foreground">Active Subscriptions</div>
                  <div className="text-2xl font-bold text-foreground mt-1">
                    {subscriptions.filter((s) => s.is_active).length}
                  </div>
                </div>
                <div className="bg-muted rounded-lg p-4">
                  <div className="text-sm text-muted-foreground">Total Subscriptions</div>
                  <div className="text-2xl font-bold text-foreground mt-1">{subscriptions.length}</div>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>
      )}

      {activeTab === 'lines' && (
        <div>
          <div className="flex items-center justify-between mb-6">
            <h3 className="text-lg font-semibold text-foreground">Customer Lines</h3>
            <Button onClick={() => setIsLineModalOpen(true)}>
              <Plus className="w-4 h-4 mr-2" />
              Add Line
            </Button>
          </div>

          {lines.length === 0 ? (
            <Card>
              <CardContent className="text-center py-8 text-muted-foreground">
                No lines yet. Add a line to get started.
              </CardContent>
            </Card>
          ) : (
            <div className="space-y-3">
              {lines.map((line, index) => {
                const isExpanded = expandedLines.has(line.id)
                return (
                  <div
                    key={line.id}
                    className={`bg-white rounded-2xl border overflow-hidden transition-all duration-200 ${
                      isExpanded
                        ? 'shadow-lg border-primary-100'
                        : 'border-gray-200 hover:border-gray-300'
                    }`}
                  >
                    {/* Line Header */}
                    <div
                      className="flex items-center justify-between gap-4 p-4 cursor-pointer"
                      onClick={() => toggleLineExpansion(line.id)}
                    >
                      <div className="flex items-center gap-4 flex-1 min-w-0">
                        {/* Line Number Badge */}
                        <div className="flex-shrink-0 w-10 h-10 rounded-xl bg-gray-100 border border-gray-200 flex items-center justify-center text-sm font-semibold text-gray-700">
                          {index + 1}
                        </div>

                        <div className="flex-1 min-w-0">
                          <div className="flex items-center gap-2 flex-wrap">
                            <h4 className="font-semibold text-foreground text-base tracking-wide">
                              {line.phone_number || 'Pending Activation'}
                            </h4>
                            {line.type && (
                              <Badge variant="secondary" className="uppercase">
                                {line.type.charAt(0).toUpperCase() + line.type.slice(1)}
                              </Badge>
                            )}
                          </div>
                          <div className="mt-1">
                            <Badge variant={lineStatusVariants[line.status]} className="uppercase">
                              {line.status.charAt(0).toUpperCase() + line.status.slice(1)}
                            </Badge>
                          </div>
                        </div>
                      </div>

                      {/* Expand Button */}
                      <button
                        className={`flex-shrink-0 w-10 h-10 rounded-full bg-primary-800 text-white flex items-center justify-center text-2xl font-light transition-transform duration-200 hover:bg-primary-700 ${
                          isExpanded ? 'rotate-45' : ''
                        }`}
                        onClick={(e) => {
                          e.stopPropagation()
                          toggleLineExpansion(line.id)
                        }}
                      >
                        +
                      </button>
                    </div>

                    {/* Line Body (Expandable) */}
                    <div
                      className={`overflow-hidden transition-all duration-300 ${
                        isExpanded ? 'max-h-[500px] opacity-100' : 'max-h-0 opacity-0'
                      }`}
                    >
                      <div className="border-t border-gray-100 bg-gray-50 p-4">
                        <div className="grid grid-cols-1 md:grid-cols-[200px_1fr] gap-6">
                          {/* Device Photo Placeholder */}
                          <div className="bg-white border-2 border-dashed border-gray-300 rounded-xl min-h-[160px] flex flex-col items-center justify-center text-muted-foreground text-sm">
                            <Smartphone className="w-12 h-12 mb-2" />
                            <span>Device Photo</span>
                          </div>

                          {/* Device Details */}
                          <div>
                            <h4 className="text-base font-bold text-foreground mb-3">
                              {line.device_manufacturer && line.device_model
                                ? `${line.device_manufacturer} ${line.device_model}`
                                : 'Device Information'}
                            </h4>

                            <div className="grid grid-cols-[120px_1fr] gap-x-4 gap-y-2 text-sm mb-4">
                              {line.active_sim_id && (
                                <>
                                  <label className="font-semibold text-muted-foreground">ICCID:</label>
                                  <span className="text-foreground font-mono">{line.active_sim_id}</span>
                                </>
                              )}
                              {line.sim_type && (
                                <>
                                  <label className="font-semibold text-muted-foreground">SIM Type:</label>
                                  <span className="text-foreground">
                                    {line.sim_type === 'esim' ? 'eSIM' : 'Physical SIM'}
                                  </span>
                                </>
                              )}
                              {line.type && (
                                <>
                                  <label className="font-semibold text-muted-foreground">Line Type:</label>
                                  <span className="text-foreground">
                                    {line.type.charAt(0).toUpperCase() + line.type.slice(1)}
                                  </span>
                                </>
                              )}
                              {line.updated_at && (
                                <>
                                  <label className="font-semibold text-muted-foreground">Last Change:</label>
                                  <span className="text-foreground">{formatDate(line.updated_at)}</span>
                                </>
                              )}
                            </div>

                            {/* Action Buttons */}
                            <div className="flex flex-wrap gap-2 mt-4">
                              <Button variant="outline" size="sm" className="rounded-full">
                                Change Device
                              </Button>
                              <Button variant="outline" size="sm" className="rounded-full">
                                Upgrade
                              </Button>
                              <Button variant="outline" size="sm" className="rounded-full">
                                Update Info
                              </Button>
                              <Button variant="outline" size="sm" className="rounded-full" asChild>
                                <Link to={`/lines/${line.id}`} onClick={(e) => e.stopPropagation()}>
                                  View Details
                                </Link>
                              </Button>
                            </div>
                          </div>
                        </div>
                      </div>
                    </div>
                  </div>
                )
              })}
            </div>
          )}
        </div>
      )}

      {activeTab === 'subscriptions' && (
        <div>
          <div className="flex items-center justify-between mb-6">
            <h3 className="text-lg font-semibold text-foreground">Customer Subscriptions</h3>
            <Button onClick={() => setIsSubscriptionModalOpen(true)}>
              <Plus className="w-4 h-4 mr-2" />
              Add Subscription
            </Button>
          </div>

          {subscriptions.length === 0 ? (
            <Card>
              <CardContent className="text-center py-8 text-muted-foreground">
                No subscriptions yet. Add a subscription to get started.
              </CardContent>
            </Card>
          ) : (
            <div className="space-y-4">
              {subscriptions.map((subscription) => (
                <Card key={subscription.id}>
                  <CardContent className="flex items-center justify-between">
                    <div className="flex-1">
                      <div className="flex items-center gap-3 mb-2">
                        <h4 className="font-semibold text-foreground">
                          Plan: {subscription.plan_id.slice(0, 8)}...
                        </h4>
                        <Badge
                          variant={
                            subscription.is_active
                              ? 'success'
                              : subscription.cancelled_at
                              ? 'error'
                              : subscription.paused_at
                              ? 'warning'
                              : 'default'
                          }
                        >
                          {subscription.is_active
                            ? 'Active'
                            : subscription.cancelled_at
                            ? 'Cancelled'
                            : subscription.paused_at
                            ? 'Paused'
                            : 'Inactive'}
                        </Badge>
                      </div>
                      <div className="grid grid-cols-2 md:grid-cols-4 gap-4 text-sm">
                        {subscription.start_date && (
                          <div>
                            <span className="text-muted-foreground">Start:</span>{' '}
                            <span className="text-foreground">{formatDate(subscription.start_date)}</span>
                          </div>
                        )}
                        {subscription.end_date && (
                          <div>
                            <span className="text-muted-foreground">End:</span>{' '}
                            <span className="text-foreground">{formatDate(subscription.end_date)}</span>
                          </div>
                        )}
                        <div>
                          <span className="text-muted-foreground">Next Renewal:</span>{' '}
                          <span className="text-foreground">
                            {subscription.next_renewal_date ? formatDate(subscription.next_renewal_date) : 'N/A'}
                          </span>
                        </div>
                        <div>
                          <span className="text-muted-foreground">Renewal Type:</span>{' '}
                          <span className="text-foreground">
                            {subscription.renewal_type.charAt(0).toUpperCase() + subscription.renewal_type.slice(1)}
                          </span>
                        </div>
                      </div>
                    </div>
                    <Button variant="ghost" size="sm">
                      Manage
                    </Button>
                  </CardContent>
                </Card>
              ))}
            </div>
          )}
        </div>
      )}

      {activeTab === 'activity' && (
        <div>
          <div className="mb-6">
            <h3 className="text-lg font-semibold text-foreground">Activity Timeline</h3>
            <p className="text-muted-foreground text-sm mt-1">
              Track all customer interactions including store visits, quotes, and subscriptions
            </p>
          </div>
          <CustomerActivityTimeline customerId={customer.id} />
        </div>
      )}

      {activeTab === 'quotes' && (
        <div>
          <div className="mb-6">
            <h3 className="text-lg font-semibold text-foreground">Customer Quotes</h3>
            <p className="text-muted-foreground text-sm mt-1">
              View and manage all quotes for this customer
            </p>
          </div>
          <QuotesList customerId={customer.id} />
        </div>
      )}

      {activeTab === 'billing' && (
        <Card>
          <CardHeader>
            <CardTitle className="text-lg">Billing Information</CardTitle>
          </CardHeader>
          <CardContent className="text-center py-8 text-muted-foreground">
            Billing management coming soon...
          </CardContent>
        </Card>
      )}

      {/* Edit Customer Modal */}
      <CustomerModal
        isOpen={isEditModalOpen}
        onClose={handleEditModalClose}
        customer={customer}
      />

      {/* Add Line Modal */}
      <LineModal
        isOpen={isLineModalOpen}
        onClose={handleLineModalClose}
        customerId={customer?.id}
      />

      {/* Add Subscription Modal */}
      <SubscriptionModal
        isOpen={isSubscriptionModalOpen}
        onClose={handleSubscriptionModalClose}
        preSelectedCustomerId={customer?.id}
      />

      {/* Create Quote Modal */}
      <QuoteModal isOpen={isQuoteModalOpen} onClose={handleQuoteModalClose} preSelectedCustomerId={customer?.id} />
    </div>
  )
}
