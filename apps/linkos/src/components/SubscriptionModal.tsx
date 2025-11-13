import { useState, useEffect } from 'react'
import {
  createSubscription,
  updateSubscription,
  getMVNOPlans,
  getCustomers,
  type Subscription,
  type SubscriptionStartType,
  type SubscriptionEndType,
  type SubscriptionRenewalType,
  type SubscriptionActivationType,
  type MVNOPlan,
  type Customer,
} from '@wyalink/supabase-client'

interface SubscriptionModalProps {
  isOpen: boolean
  onClose: (shouldRefresh?: boolean) => void
  subscription?: Subscription | null
}

export default function SubscriptionModal({ isOpen, onClose, subscription }: SubscriptionModalProps) {
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)

  // Data loading
  const [plans, setPlans] = useState<MVNOPlan[]>([])
  const [customers, setCustomers] = useState<Customer[]>([])
  const [dataLoading, setDataLoading] = useState(true)

  // Form state
  const [planId, setPlanId] = useState('')
  const [customerId, setCustomerId] = useState('')
  const [startType, setStartType] = useState<SubscriptionStartType>('asap')
  const [startDate, setStartDate] = useState('')
  const [endType, setEndType] = useState<SubscriptionEndType>('unlimited')
  const [endCycles, setEndCycles] = useState('')
  const [endDate, setEndDate] = useState('')
  const [renewalType, setRenewalType] = useState<SubscriptionRenewalType>('automatic')
  const [renewalIntervalDays, setRenewalIntervalDays] = useState('30')
  const [gracePeriodDays, setGracePeriodDays] = useState('7')
  const [activationType, setActivationType] = useState<SubscriptionActivationType>('pre_active')

  // Fetch plans and customers on mount
  useEffect(() => {
    const fetchData = async () => {
      setDataLoading(true)
      try {
        const [plansResult, customersResult] = await Promise.all([
          getMVNOPlans(),
          getCustomers(),
        ])

        if (plansResult.data) setPlans(plansResult.data)
        if (customersResult.data) setCustomers(customersResult.data)
      } catch (err) {
        console.error('Failed to load data:', err)
      } finally {
        setDataLoading(false)
      }
    }

    if (isOpen) {
      fetchData()
    }
  }, [isOpen])

  useEffect(() => {
    if (subscription) {
      setPlanId(subscription.plan_id)
      setCustomerId(subscription.customer_id)
      setStartType(subscription.start_type)
      setStartDate(subscription.start_date ? subscription.start_date.split('T')[0] : '')
      setEndType(subscription.end_type)
      setEndCycles(subscription.end_cycles?.toString() || '')
      setEndDate(subscription.end_date ? subscription.end_date.split('T')[0] : '')
      setRenewalType(subscription.renewal_type)
      setRenewalIntervalDays(subscription.renewal_interval_days?.toString() || '30')
      setGracePeriodDays(subscription.grace_period_days.toString())
      setActivationType(subscription.activation_type)
    } else {
      resetForm()
    }
  }, [subscription, isOpen])

  const resetForm = () => {
    setPlanId('')
    setCustomerId('')
    setStartType('asap')
    setStartDate('')
    setEndType('unlimited')
    setEndCycles('')
    setEndDate('')
    setRenewalType('automatic')
    setRenewalIntervalDays('30')
    setGracePeriodDays('7')
    setActivationType('pre_active')
    setError(null)
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setError(null)
    setLoading(true)

    try {
      const subscriptionData = {
        plan_id: planId,
        customer_id: customerId,
        start_type: startType,
        start_date: startType === 'specific_date' ? startDate : null,
        end_type: endType,
        end_cycles: endType === 'after_cycles' ? parseInt(endCycles) : null,
        end_date: endType === 'on_date' ? endDate : null,
        renewal_type: renewalType,
        renewal_interval_days: parseInt(renewalIntervalDays),
        grace_period_days: parseInt(gracePeriodDays),
        activation_type: activationType,
        is_active: activationType === 'active',
      }

      let result
      if (subscription) {
        result = await updateSubscription(subscription.id, subscriptionData)
      } else {
        result = await createSubscription(subscriptionData)
      }

      if (result.error) throw result.error

      onClose(true)
      resetForm()
    } catch (err: any) {
      setError(err.message || 'Failed to save subscription')
      console.error(err)
    } finally {
      setLoading(false)
    }
  }

  if (!isOpen) return null

  return (
    <div className="fixed inset-0 bg-gray-900/50 backdrop-blur-sm flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-lg shadow-xl max-w-3xl w-full max-h-[90vh] overflow-y-auto">
        <div className="sticky top-0 bg-white border-b border-gray-200 px-6 py-4">
          <div className="flex items-center justify-between">
            <h2 className="text-xl font-bold text-gray-900">
              {subscription ? 'Edit Subscription' : 'Add New Subscription'}
            </h2>
            <button
              onClick={() => onClose()}
              className="text-gray-400 hover:text-gray-600 transition-colors"
            >
              <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
              </svg>
            </button>
          </div>
        </div>

        <form onSubmit={handleSubmit} className="p-6">
          {error && (
            <div className="mb-4 bg-red-50 border border-red-200 rounded-lg p-4">
              <p className="text-sm text-red-800">{error}</p>
            </div>
          )}

          <div className="space-y-6">
            {/* Basic Information */}
            <div>
              <h3 className="text-sm font-semibold text-gray-900 mb-4">Basic Information</h3>
              <div className="space-y-4">
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Plan <span className="text-red-500">*</span>
                    </label>
                    {dataLoading ? (
                      <div className="w-full px-3 py-2 border border-gray-300 rounded-lg bg-gray-50 text-gray-500">
                        Loading plans...
                      </div>
                    ) : (
                      <select
                        required
                        value={planId}
                        onChange={(e) => setPlanId(e.target.value)}
                        className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary-500"
                      >
                        <option value="">Select a plan</option>
                        {plans.map((plan) => (
                          <option key={plan.id} value={plan.id}>
                            {plan.plan_name} {plan.description ? `- ${plan.description}` : ''}
                          </option>
                        ))}
                      </select>
                    )}
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Customer <span className="text-red-500">*</span>
                    </label>
                    {dataLoading ? (
                      <div className="w-full px-3 py-2 border border-gray-300 rounded-lg bg-gray-50 text-gray-500">
                        Loading customers...
                      </div>
                    ) : (
                      <select
                        required
                        value={customerId}
                        onChange={(e) => setCustomerId(e.target.value)}
                        className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary-500"
                      >
                        <option value="">Select a customer</option>
                        {customers.map((customer) => (
                          <option key={customer.id} value={customer.id}>
                            {customer.first_name} {customer.last_name} ({customer.account_number})
                          </option>
                        ))}
                      </select>
                    )}
                  </div>
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">Activation Type</label>
                  <select
                    value={activationType}
                    onChange={(e) => setActivationType(e.target.value as SubscriptionActivationType)}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary-500"
                  >
                    <option value="pre_active">Pre-Active</option>
                    <option value="active">Active</option>
                  </select>
                </div>
              </div>
            </div>

            {/* Start Configuration */}
            <div>
              <h3 className="text-sm font-semibold text-gray-900 mb-4">Start Configuration</h3>
              <div className="space-y-4">
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">Start Type</label>
                    <select
                      value={startType}
                      onChange={(e) => setStartType(e.target.value as SubscriptionStartType)}
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary-500"
                    >
                      <option value="asap">As Soon As Possible</option>
                      <option value="specific_date">Specific Date</option>
                    </select>
                  </div>
                  {startType === 'specific_date' && (
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">Start Date</label>
                      <input
                        type="date"
                        value={startDate}
                        onChange={(e) => setStartDate(e.target.value)}
                        className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary-500"
                      />
                    </div>
                  )}
                </div>
              </div>
            </div>

            {/* End Configuration */}
            <div>
              <h3 className="text-sm font-semibold text-gray-900 mb-4">End Configuration</h3>
              <div className="space-y-4">
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">End Type</label>
                    <select
                      value={endType}
                      onChange={(e) => setEndType(e.target.value as SubscriptionEndType)}
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary-500"
                    >
                      <option value="unlimited">Unlimited</option>
                      <option value="after_cycles">After Cycles</option>
                      <option value="on_date">On Specific Date</option>
                    </select>
                  </div>
                  {endType === 'after_cycles' && (
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">Number of Cycles</label>
                      <input
                        type="number"
                        min="1"
                        value={endCycles}
                        onChange={(e) => setEndCycles(e.target.value)}
                        className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary-500"
                      />
                    </div>
                  )}
                  {endType === 'on_date' && (
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">End Date</label>
                      <input
                        type="date"
                        value={endDate}
                        onChange={(e) => setEndDate(e.target.value)}
                        className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary-500"
                      />
                    </div>
                  )}
                </div>
              </div>
            </div>

            {/* Renewal Configuration */}
            <div>
              <h3 className="text-sm font-semibold text-gray-900 mb-4">Renewal Configuration</h3>
              <div className="space-y-4">
                <div className="grid grid-cols-3 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">Renewal Type</label>
                    <select
                      value={renewalType}
                      onChange={(e) => setRenewalType(e.target.value as SubscriptionRenewalType)}
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary-500"
                    >
                      <option value="automatic">Automatic</option>
                      <option value="manual">Manual</option>
                    </select>
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">Interval (Days)</label>
                    <input
                      type="number"
                      min="1"
                      value={renewalIntervalDays}
                      onChange={(e) => setRenewalIntervalDays(e.target.value)}
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary-500"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">Grace Period (Days)</label>
                    <input
                      type="number"
                      min="0"
                      value={gracePeriodDays}
                      onChange={(e) => setGracePeriodDays(e.target.value)}
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary-500"
                    />
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* Actions */}
          <div className="flex items-center justify-end gap-3 mt-6 pt-6 border-t">
            <button
              type="button"
              onClick={() => onClose()}
              className="px-4 py-2 text-gray-700 hover:bg-gray-100 rounded-lg transition-colors"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={loading}
              className="px-4 py-2 bg-primary-600 text-white rounded-lg hover:bg-primary-700 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {loading ? 'Saving...' : subscription ? 'Update Subscription' : 'Create Subscription'}
            </button>
          </div>
        </form>
      </div>
    </div>
  )
}
