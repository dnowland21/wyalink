import { useState, useEffect } from 'react'
import { useParams, useNavigate, Link } from 'react-router-dom'
import {
  getCustomer,
  getLines,
  getSubscriptions,
  type Customer,
  type Line,
  type Subscription,
  type LeadType,
  type LineStatus,
} from '@wyalink/supabase-client'
import { Card } from '@wyalink/ui'
import CustomerModal from '../components/CustomerModal'

const typeColors: Record<LeadType, string> = {
  business: 'bg-purple-100 text-purple-800',
  consumer: 'bg-blue-100 text-blue-800',
  internal: 'bg-gray-100 text-gray-800',
}

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
  const [activeTab, setActiveTab] = useState<'overview' | 'lines' | 'subscriptions' | 'billing'>('overview')
  const [isEditModalOpen, setIsEditModalOpen] = useState(false)

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

      if (linesResult.error) console.error('Failed to load lines:', linesResult.error)
      if (subscriptionsResult.error) console.error('Failed to load subscriptions:', subscriptionsResult.error)

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
      {/* Header */}
      <div className="mb-8">
        <div className="flex items-center gap-3 mb-2">
          <Link
            to="/customers"
            className="text-gray-500 hover:text-gray-700 transition-colors"
            title="Back to Customers"
          >
            <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
            </svg>
          </Link>
          <div className="flex-1">
            <div className="flex items-center gap-3">
              <div className="w-14 h-14 bg-gradient-to-br from-primary-500 to-primary-700 rounded-xl flex items-center justify-center text-white font-bold text-xl">
                {customer.first_name[0]}
                {customer.last_name[0]}
              </div>
              <div>
                <h1 className="text-3xl font-bold text-gray-900">
                  {customer.first_name} {customer.middle_initial ? `${customer.middle_initial}. ` : ''}
                  {customer.last_name}
                </h1>
                <p className="text-gray-600 font-mono">{customer.account_number}</p>
              </div>
            </div>
          </div>
          <button
            onClick={() => setIsEditModalOpen(true)}
            className="px-4 py-2 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 transition-colors"
          >
            Edit Customer
          </button>
        </div>
      </div>

      {/* Customer Type Badge and Status */}
      <div className="flex items-center gap-3 mb-6">
        <span className={`px-3 py-1 rounded-full text-sm font-medium ${typeColors[customer.type]}`}>
          {customer.type.charAt(0).toUpperCase() + customer.type.slice(1)}
        </span>
        {customer.company_name && (
          <span className="text-sm text-gray-600">
            <span className="font-medium">Company:</span> {customer.company_name}
          </span>
        )}
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
            <button className="px-4 py-2 bg-primary-600 text-white rounded-lg hover:bg-primary-700 transition-colors text-sm font-medium">
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
            <div className="space-y-4">
              {lines.map((line) => (
                <Card key={line.id}>
                  <div className="flex items-center justify-between">
                    <div className="flex-1">
                      <div className="flex items-center gap-3 mb-2">
                        <h4 className="font-semibold text-gray-900">{line.phone_number || 'Pending Activation'}</h4>
                        <span className={`px-2 py-1 rounded-full text-xs font-medium ${lineStatusColors[line.status]}`}>
                          {line.status.charAt(0).toUpperCase() + line.status.slice(1)}
                        </span>
                      </div>
                      <div className="grid grid-cols-2 md:grid-cols-3 gap-4 text-sm">
                        {line.active_sim_id && (
                          <div>
                            <span className="text-gray-600">SIM:</span>{' '}
                            <span className="text-gray-900 font-mono">{line.active_sim_id.slice(0, 8)}...</span>
                          </div>
                        )}
                        {line.device_manufacturer && line.device_model && (
                          <div>
                            <span className="text-gray-600">Device:</span>{' '}
                            <span className="text-gray-900">{line.device_manufacturer} {line.device_model}</span>
                          </div>
                        )}
                        <div>
                          <span className="text-gray-600">Type:</span>{' '}
                          <span className="text-gray-900">{line.type.charAt(0).toUpperCase() + line.type.slice(1)}</span>
                        </div>
                      </div>
                    </div>
                    <Link
                      to={`/lines/${line.id}`}
                      className="px-3 py-1.5 text-sm bg-gray-100 text-gray-700 rounded-lg hover:bg-gray-200 transition-colors"
                    >
                      View
                    </Link>
                  </div>
                </Card>
              ))}
            </div>
          )}
        </div>
      )}

      {activeTab === 'subscriptions' && (
        <div>
          <div className="flex items-center justify-between mb-6">
            <h3 className="text-lg font-semibold text-gray-900">Customer Subscriptions</h3>
            <button className="px-4 py-2 bg-primary-600 text-white rounded-lg hover:bg-primary-700 transition-colors text-sm font-medium">
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
    </div>
  )
}
