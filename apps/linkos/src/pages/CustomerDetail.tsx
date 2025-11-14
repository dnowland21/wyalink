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
import { Card } from '@wyalink/ui'
import CustomerModal from '../components/CustomerModal'
import LineModal from '../components/LineModal'
import SubscriptionModal from '../components/SubscriptionModal'
import QuoteModal from '../components/QuoteModal'
import CustomerActivityTimeline from '../components/CustomerActivityTimeline'

const lineStatusColors: Record<LineStatus, string> = {
  initiating: 'bg-gray-100 text-gray-800',
  pending: 'bg-blue-100 text-blue-800',
  activated: 'bg-green-100 text-green-800',
  paused: 'bg-yellow-100 text-yellow-800',
  deactivated: 'bg-orange-100 text-orange-800',
  terminated: 'bg-red-100 text-red-800',
}

export default function CustomerDetail() {
  const { id } = useParams<{ id: string }>()
  const navigate = useNavigate()

  const [customer, setCustomer] = useState<Customer | null>(null)
  const [lines, setLines] = useState<Line[]>([])
  const [subscriptions, setSubscriptions] = useState<Subscription[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [activeTab, setActiveTab] = useState<'overview' | 'lines' | 'subscriptions' | 'activity' | 'billing'>('overview')
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
        <div className="text-gray-600">Loading customer...</div>
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
            <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
            </svg>
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
            <button
              onClick={() => setIsQuoteModalOpen(true)}
              className="px-4 py-2 bg-white/20 backdrop-blur-sm border border-white/30 text-white rounded-lg hover:bg-white/30 transition-colors"
            >
              Create Quote
            </button>
            <button
              onClick={() => setIsEditModalOpen(true)}
              className="px-4 py-2 bg-white/20 backdrop-blur-sm border border-white/30 text-white rounded-lg hover:bg-white/30 transition-colors"
            >
              Edit Customer
            </button>
            <button className="px-4 py-2 bg-white text-primary-600 rounded-lg hover:bg-white/90 transition-colors font-medium">
              Account Actions
            </button>
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
            <h3 className="text-lg font-semibold text-gray-900 mb-4">Contact Information</h3>
            <div className="space-y-3">
              <div>
                <label className="text-sm font-medium text-gray-600">Email</label>
                <p className="text-gray-900">{customer.email}</p>
              </div>
              <div>
                <label className="text-sm font-medium text-gray-600">Phone</label>
                <p className="text-gray-900">{customer.phone}</p>
              </div>
            </div>
          </Card>

          {/* Billing Address */}
          <Card>
            <h3 className="text-lg font-semibold text-gray-900 mb-4">Billing Address</h3>
            <div className="space-y-1 text-gray-900">
              <p>{customer.billing_address_line1}</p>
              {customer.billing_address_line2 && <p>{customer.billing_address_line2}</p>}
              <p>
                {customer.billing_city}, {customer.billing_state} {customer.billing_zip}
              </p>
            </div>
          </Card>

          {/* Shipping Address */}
          <Card>
            <h3 className="text-lg font-semibold text-gray-900 mb-4">Shipping Address</h3>
            <div className="space-y-1 text-gray-900">
              {customer.shipping_address_line1 ? (
                <>
                  <p>{customer.shipping_address_line1}</p>
                  {customer.shipping_address_line2 && <p>{customer.shipping_address_line2}</p>}
                  <p>
                    {customer.shipping_city}, {customer.shipping_state} {customer.shipping_zip}
                  </p>
                </>
              ) : (
                <p className="text-gray-500 italic">Same as billing address</p>
              )}
            </div>
          </Card>

          {/* Account Details */}
          <Card>
            <h3 className="text-lg font-semibold text-gray-900 mb-4">Account Details</h3>
            <div className="space-y-3">
              <div>
                <label className="text-sm font-medium text-gray-600">Account Number</label>
                <p className="text-gray-900 font-mono font-semibold">{customer.account_number}</p>
              </div>
              <div>
                <label className="text-sm font-medium text-gray-600">Customer Type</label>
                <p className="text-gray-900">{customer.type.charAt(0).toUpperCase() + customer.type.slice(1)}</p>
              </div>
              <div>
                <label className="text-sm font-medium text-gray-600">Account Created</label>
                <p className="text-gray-900">{formatDate(customer.created_at)}</p>
              </div>
              {customer.company_name && (
                <div>
                  <label className="text-sm font-medium text-gray-600">Company Name</label>
                  <p className="text-gray-900">{customer.company_name}</p>
                </div>
              )}
            </div>
          </Card>

          {/* Service Summary */}
          <Card className="lg:col-span-2">
            <h3 className="text-lg font-semibold text-gray-900 mb-4">Service Summary</h3>
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
              <div className="bg-gray-50 rounded-lg p-4">
                <div className="text-sm text-gray-600">Active Lines</div>
                <div className="text-2xl font-bold text-gray-900 mt-1">
                  {lines.filter((l) => l.status === 'activated').length}
                </div>
              </div>
              <div className="bg-gray-50 rounded-lg p-4">
                <div className="text-sm text-gray-600">Total Lines</div>
                <div className="text-2xl font-bold text-gray-900 mt-1">{lines.length}</div>
              </div>
              <div className="bg-gray-50 rounded-lg p-4">
                <div className="text-sm text-gray-600">Active Subscriptions</div>
                <div className="text-2xl font-bold text-gray-900 mt-1">
                  {subscriptions.filter((s) => s.is_active).length}
                </div>
              </div>
              <div className="bg-gray-50 rounded-lg p-4">
                <div className="text-sm text-gray-600">Total Subscriptions</div>
                <div className="text-2xl font-bold text-gray-900 mt-1">{subscriptions.length}</div>
              </div>
            </div>
          </Card>
        </div>
      )}

      {activeTab === 'lines' && (
        <div>
          <div className="flex items-center justify-between mb-6">
            <h3 className="text-lg font-semibold text-gray-900">Customer Lines</h3>
            <button
              onClick={() => setIsLineModalOpen(true)}
              className="px-4 py-2 bg-primary-800 text-white rounded-lg hover:bg-primary-700 transition-colors text-sm font-medium"
            >
              + Add Line
            </button>
          </div>

          {lines.length === 0 ? (
            <Card>
              <div className="text-center py-8 text-gray-600">
                No lines yet. Add a line to get started.
              </div>
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
                            <h4 className="font-semibold text-gray-900 text-base tracking-wide">
                              {line.phone_number || 'Pending Activation'}
                            </h4>
                            {line.type && (
                              <span className="px-2.5 py-0.5 bg-primary-800 text-white text-xs font-medium rounded-full uppercase tracking-wide">
                                {line.type.charAt(0).toUpperCase() + line.type.slice(1)}
                              </span>
                            )}
                          </div>
                          <div className={`mt-1 px-3 py-1 rounded-full text-xs font-medium inline-flex uppercase tracking-wide ${lineStatusColors[line.status]}`}>
                            {line.status.charAt(0).toUpperCase() + line.status.slice(1)}
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
                          <div className="bg-white border-2 border-dashed border-gray-300 rounded-xl min-h-[160px] flex flex-col items-center justify-center text-gray-500 text-sm">
                            <svg className="w-12 h-12 mb-2 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M12 18h.01M8 21h8a2 2 0 002-2V5a2 2 0 00-2-2H8a2 2 0 00-2 2v14a2 2 0 002 2z" />
                            </svg>
                            <span>Device Photo</span>
                          </div>

                          {/* Device Details */}
                          <div>
                            <h4 className="text-base font-bold text-primary-900 mb-3">
                              {line.device_manufacturer && line.device_model
                                ? `${line.device_manufacturer} ${line.device_model}`
                                : 'Device Information'}
                            </h4>

                            <div className="grid grid-cols-[120px_1fr] gap-x-4 gap-y-2 text-sm mb-4">
                              {line.active_sim_id && (
                                <>
                                  <label className="font-semibold text-gray-700">ICCID:</label>
                                  <span className="text-gray-900 font-mono">{line.active_sim_id}</span>
                                </>
                              )}
                              {line.sim_type && (
                                <>
                                  <label className="font-semibold text-gray-700">SIM Type:</label>
                                  <span className="text-gray-900">
                                    {line.sim_type === 'esim' ? 'eSIM' : 'Physical SIM'}
                                  </span>
                                </>
                              )}
                              {line.type && (
                                <>
                                  <label className="font-semibold text-gray-700">Line Type:</label>
                                  <span className="text-gray-900">
                                    {line.type.charAt(0).toUpperCase() + line.type.slice(1)}
                                  </span>
                                </>
                              )}
                              {line.updated_at && (
                                <>
                                  <label className="font-semibold text-gray-700">Last Change:</label>
                                  <span className="text-gray-900">{formatDate(line.updated_at)}</span>
                                </>
                              )}
                            </div>

                            {/* Action Buttons */}
                            <div className="flex flex-wrap gap-2 mt-4">
                              <button className="px-4 py-2 rounded-full text-sm font-medium bg-yellow-50 text-yellow-800 border border-yellow-200 hover:bg-yellow-100 transition-colors">
                                Change Device
                              </button>
                              <button className="px-4 py-2 rounded-full text-sm font-medium bg-red-50 text-red-800 border border-red-200 hover:bg-red-100 transition-colors">
                                Upgrade
                              </button>
                              <button className="px-4 py-2 rounded-full text-sm font-medium bg-teal-50 text-teal-800 border border-teal-200 hover:bg-teal-100 transition-colors">
                                Update Info
                              </button>
                              <Link
                                to={`/lines/${line.id}`}
                                className="px-4 py-2 rounded-full text-sm font-medium bg-blue-50 text-blue-800 border border-blue-200 hover:bg-blue-100 transition-colors"
                                onClick={(e) => e.stopPropagation()}
                              >
                                View Details
                              </Link>
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
            <h3 className="text-lg font-semibold text-gray-900">Customer Subscriptions</h3>
            <button
              onClick={() => setIsSubscriptionModalOpen(true)}
              className="px-4 py-2 bg-primary-800 text-white rounded-lg hover:bg-primary-700 transition-colors text-sm font-medium"
            >
              + Add Subscription
            </button>
          </div>

          {subscriptions.length === 0 ? (
            <Card>
              <div className="text-center py-8 text-gray-600">
                No subscriptions yet. Add a subscription to get started.
              </div>
            </Card>
          ) : (
            <div className="space-y-4">
              {subscriptions.map((subscription) => (
                <Card key={subscription.id}>
                  <div className="flex items-center justify-between">
                    <div className="flex-1">
                      <div className="flex items-center gap-3 mb-2">
                        <h4 className="font-semibold text-gray-900">
                          Plan: {subscription.plan_id.slice(0, 8)}...
                        </h4>
                        <span
                          className={`px-2 py-1 rounded-full text-xs font-medium ${
                            subscription.is_active
                              ? 'bg-green-100 text-green-800'
                              : subscription.cancelled_at
                              ? 'bg-red-100 text-red-800'
                              : subscription.paused_at
                              ? 'bg-yellow-100 text-yellow-800'
                              : 'bg-gray-100 text-gray-800'
                          }`}
                        >
                          {subscription.is_active
                            ? 'Active'
                            : subscription.cancelled_at
                            ? 'Cancelled'
                            : subscription.paused_at
                            ? 'Paused'
                            : 'Inactive'}
                        </span>
                      </div>
                      <div className="grid grid-cols-2 md:grid-cols-4 gap-4 text-sm">
                        {subscription.start_date && (
                          <div>
                            <span className="text-gray-600">Start:</span>{' '}
                            <span className="text-gray-900">{formatDate(subscription.start_date)}</span>
                          </div>
                        )}
                        {subscription.end_date && (
                          <div>
                            <span className="text-gray-600">End:</span>{' '}
                            <span className="text-gray-900">{formatDate(subscription.end_date)}</span>
                          </div>
                        )}
                        <div>
                          <span className="text-gray-600">Next Renewal:</span>{' '}
                          <span className="text-gray-900">
                            {subscription.next_renewal_date ? formatDate(subscription.next_renewal_date) : 'N/A'}
                          </span>
                        </div>
                        <div>
                          <span className="text-gray-600">Renewal Type:</span>{' '}
                          <span className="text-gray-900">
                            {subscription.renewal_type.charAt(0).toUpperCase() + subscription.renewal_type.slice(1)}
                          </span>
                        </div>
                      </div>
                    </div>
                    <button className="px-3 py-1.5 text-sm bg-gray-100 text-gray-700 rounded-lg hover:bg-gray-200 transition-colors">
                      Manage
                    </button>
                  </div>
                </Card>
              ))}
            </div>
          )}
        </div>
      )}

      {activeTab === 'activity' && (
        <div>
          <div className="mb-6">
            <h3 className="text-lg font-semibold text-gray-900">Activity Timeline</h3>
            <p className="text-gray-600 text-sm mt-1">
              Track all customer interactions including store visits, quotes, and subscriptions
            </p>
          </div>
          <CustomerActivityTimeline customerId={customer.id} />
        </div>
      )}

      {activeTab === 'billing' && (
        <Card>
          <h3 className="text-lg font-semibold text-gray-900 mb-4">Billing Information</h3>
          <div className="text-center py-8 text-gray-600">Billing management coming soon...</div>
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
