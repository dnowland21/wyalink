import { useState, useEffect } from 'react'
import { useParams, useNavigate, Link } from 'react-router-dom'
import {
  getMVNOPlan,
  deleteMVNOPlan,
  archiveMVNOPlan,
  type MVNOPlan,
  type PlanStatus,
} from '@wyalink/supabase-client'
import { Card } from '@wyalink/ui'
import PlanModal from '../components/PlanModal'

const statusColors: Record<PlanStatus, string> = {
  active: 'bg-green-100 text-green-800',
  inactive: 'bg-gray-100 text-gray-800',
  archived: 'bg-red-100 text-red-800',
}

export default function PlanDetail() {
  const { id } = useParams<{ id: string }>()
  const navigate = useNavigate()

  const [plan, setPlan] = useState<MVNOPlan | null>(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [isEditModalOpen, setIsEditModalOpen] = useState(false)

  useEffect(() => {
    if (!id) {
      navigate('/plans')
      return
    }

    fetchPlan()
  }, [id])

  const fetchPlan = async () => {
    if (!id) return

    setLoading(true)
    setError(null)

    try {
      const result = await getMVNOPlan(id)

      if (result.error) throw result.error

      setPlan(result.data)
    } catch (err: any) {
      setError('Failed to load plan')
      console.error(err)
    } finally {
      setLoading(false)
    }
  }

  const handleEditModalClose = (shouldRefresh?: boolean) => {
    setIsEditModalOpen(false)
    if (shouldRefresh) {
      fetchPlan()
    }
  }

  const handleArchive = async () => {
    if (!id || !window.confirm('Archive this plan? It will be hidden from active use.')) return

    try {
      const result = await archiveMVNOPlan(id)
      if (result.error) throw result.error

      navigate('/plans')
    } catch (err: any) {
      alert('Failed to archive plan')
      console.error(err)
    }
  }

  const handleDelete = async () => {
    if (!id || !window.confirm('Permanently delete this plan? This action cannot be undone.')) return

    try {
      const result = await deleteMVNOPlan(id)
      if (result.error) throw result.error

      navigate('/plans')
    } catch (err: any) {
      alert('Failed to delete plan')
      console.error(err)
    }
  }

  const formatDataAmount = (mb: number | null) => {
    if (mb === null) return 'Unlimited'
    if (mb >= 1024) return `${(mb / 1024).toFixed(1)} GB`
    return `${mb} MB`
  }

  const formatMinutes = (minutes: number | null) => {
    if (minutes === null) return 'Unlimited'
    return `${minutes.toLocaleString()} minutes`
  }

  const formatMessages = (messages: number | null) => {
    if (messages === null) return 'Unlimited'
    return `${messages.toLocaleString()} messages`
  }

  const formatPrice = (prices: Record<string, number> | null) => {
    if (!prices) return 'N/A'
    const monthly = prices['monthly'] || prices['1'] || Object.values(prices)[0]
    return monthly ? `$${monthly.toFixed(2)}/month` : 'N/A'
  }

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="text-center">
          <div className="w-16 h-16 border-4 border-primary-600 border-t-transparent rounded-full animate-spin mx-auto mb-4"></div>
          <p className="text-gray-600">Loading plan...</p>
        </div>
      </div>
    )
  }

  if (error || !plan) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="text-center">
          <p className="text-red-600 mb-4">{error || 'Plan not found'}</p>
          <Link to="/plans" className="text-primary-600 hover:text-primary-700">
            Back to Plans
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
          <Link to="/plans" className="hover:text-primary-600">
            Plans
          </Link>
          <span>/</span>
          <span>{plan.plan_name}</span>
        </div>

        <div className="flex items-start justify-between">
          <div>
            <h1 className="text-3xl font-bold text-gray-900">{plan.plan_name}</h1>
            {plan.ift_number && <p className="text-gray-600 font-mono mt-1">IFT: {plan.ift_number}</p>}
          </div>
          <div className="flex items-center gap-2">
            <button
              onClick={() => setIsEditModalOpen(true)}
              className="px-4 py-2 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 transition-colors"
            >
              Edit Plan
            </button>
            {plan.plan_status !== 'archived' && (
              <button
                onClick={handleArchive}
                className="px-4 py-2 border border-orange-300 text-orange-700 rounded-lg hover:bg-orange-50 transition-colors"
              >
                Archive
              </button>
            )}
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
        <span className={`px-3 py-1 rounded-full text-sm font-medium ${statusColors[plan.plan_status]}`}>
          {plan.plan_status.charAt(0).toUpperCase() + plan.plan_status.slice(1)}
        </span>
        {plan.network_name && (
          <span className="px-3 py-1 bg-blue-100 text-blue-800 rounded-full text-sm font-medium">
            {plan.network_name}
          </span>
        )}
      </div>

      {/* Main Content */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Left Column - Plan Details */}
        <div className="lg:col-span-2 space-y-6">
          {/* Basic Information */}
          <Card>
            <h3 className="text-lg font-semibold text-gray-900 mb-4">Plan Information</h3>
            <div className="space-y-3">
              {plan.description && (
                <div>
                  <label className="block text-sm font-medium text-gray-600 mb-1">Description</label>
                  <p className="text-sm text-gray-900">{plan.description}</p>
                </div>
              )}
              <div className="grid grid-cols-2 gap-4">
                {plan.plan_uuid && (
                  <div>
                    <label className="block text-sm font-medium text-gray-600 mb-1">Plan UUID</label>
                    <p className="text-sm text-gray-900 font-mono">{plan.plan_uuid}</p>
                  </div>
                )}
                {plan.external_sku && (
                  <div>
                    <label className="block text-sm font-medium text-gray-600 mb-1">External SKU</label>
                    <p className="text-sm text-gray-900">{plan.external_sku}</p>
                  </div>
                )}
              </div>
            </div>
          </Card>

          {/* Service Features */}
          <Card>
            <h3 className="text-lg font-semibold text-gray-900 mb-4">Service Features</h3>
            <div className="grid grid-cols-3 gap-6">
              {/* Voice */}
              <div className="text-center p-4 bg-blue-50 rounded-lg">
                <svg className="w-8 h-8 mx-auto mb-2 text-blue-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M3 5a2 2 0 012-2h3.28a1 1 0 01.948.684l1.498 4.493a1 1 0 01-.502 1.21l-2.257 1.13a11.042 11.042 0 005.516 5.516l1.13-2.257a1 1 0 011.21-.502l4.493 1.498a1 1 0 01.684.949V19a2 2 0 01-2 2h-1C9.716 21 3 14.284 3 6V5z"
                  />
                </svg>
                <div className="text-sm font-medium text-gray-600 mb-1">Voice</div>
                <div className="text-lg font-bold text-gray-900">{formatMinutes(plan.voice_minutes)}</div>
              </div>

              {/* SMS */}
              <div className="text-center p-4 bg-green-50 rounded-lg">
                <svg className="w-8 h-8 mx-auto mb-2 text-green-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M8 10h.01M12 10h.01M16 10h.01M9 16H5a2 2 0 01-2-2V6a2 2 0 012-2h14a2 2 0 012 2v8a2 2 0 01-2 2h-5l-5 5v-5z"
                  />
                </svg>
                <div className="text-sm font-medium text-gray-600 mb-1">SMS</div>
                <div className="text-lg font-bold text-gray-900">{formatMessages(plan.sms_messages)}</div>
              </div>

              {/* Data */}
              <div className="text-center p-4 bg-purple-50 rounded-lg">
                <svg className="w-8 h-8 mx-auto mb-2 text-purple-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M20 13V6a2 2 0 00-2-2H6a2 2 0 00-2 2v7m16 0v5a2 2 0 01-2 2H6a2 2 0 01-2-2v-5m16 0h-2.586a1 1 0 00-.707.293l-2.414 2.414a1 1 0 01-.707.293h-3.172a1 1 0 01-.707-.293l-2.414-2.414A1 1 0 006.586 13H4"
                  />
                </svg>
                <div className="text-sm font-medium text-gray-600 mb-1">Total Data</div>
                <div className="text-lg font-bold text-gray-900">
                  {plan.high_priority_data_mb || plan.general_data_mb || plan.low_priority_data_mb
                    ? formatDataAmount(
                        (plan.high_priority_data_mb || 0) +
                          (plan.general_data_mb || 0) +
                          (plan.low_priority_data_mb || 0)
                      )
                    : 'N/A'}
                </div>
              </div>
            </div>
          </Card>

          {/* Data Breakdown */}
          {(plan.high_priority_data_mb || plan.general_data_mb || plan.low_priority_data_mb) && (
            <Card>
              <h3 className="text-lg font-semibold text-gray-900 mb-4">Data Breakdown</h3>
              <div className="space-y-3">
                {plan.high_priority_data_mb !== null && (
                  <div className="flex items-center justify-between py-2 border-b">
                    <span className="text-sm font-medium text-gray-700">High Priority Data</span>
                    <span className="text-sm font-bold text-gray-900">{formatDataAmount(plan.high_priority_data_mb)}</span>
                  </div>
                )}
                {plan.general_data_mb !== null && (
                  <div className="flex items-center justify-between py-2 border-b">
                    <span className="text-sm font-medium text-gray-700">General Data</span>
                    <span className="text-sm font-bold text-gray-900">{formatDataAmount(plan.general_data_mb)}</span>
                  </div>
                )}
                {plan.low_priority_data_mb !== null && (
                  <div className="flex items-center justify-between py-2">
                    <span className="text-sm font-medium text-gray-700">Low Priority Data</span>
                    <span className="text-sm font-bold text-gray-900">{formatDataAmount(plan.low_priority_data_mb)}</span>
                  </div>
                )}
              </div>
            </Card>
          )}
        </div>

        {/* Right Column - Pricing & Metadata */}
        <div className="space-y-6">
          {/* Pricing */}
          <Card>
            <h3 className="text-lg font-semibold text-gray-900 mb-4">Pricing</h3>
            <div className="text-center py-6">
              <div className="text-4xl font-bold text-primary-600 mb-2">{formatPrice(plan.prices)}</div>
              <p className="text-sm text-gray-600">Monthly subscription</p>
            </div>
          </Card>

          {/* Metadata */}
          <Card>
            <h3 className="text-lg font-semibold text-gray-900 mb-4">Metadata</h3>
            <div className="space-y-3">
              <div>
                <label className="block text-sm font-medium text-gray-600 mb-1">Created</label>
                <p className="text-sm text-gray-900">{new Date(plan.created_at).toLocaleString()}</p>
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-600 mb-1">Last Updated</label>
                <p className="text-sm text-gray-900">{new Date(plan.updated_at).toLocaleString()}</p>
              </div>
              {plan.max_queue_allowance !== null && (
                <div>
                  <label className="block text-sm font-medium text-gray-600 mb-1">Max Queue Allowance</label>
                  <p className="text-sm text-gray-900">{plan.max_queue_allowance}</p>
                </div>
              )}
              {plan.promotions_offer_id && (
                <div>
                  <label className="block text-sm font-medium text-gray-600 mb-1">Promotions Offer ID</label>
                  <p className="text-sm text-gray-900 font-mono">{plan.promotions_offer_id}</p>
                </div>
              )}
            </div>
          </Card>
        </div>
      </div>

      {/* Edit Modal */}
      <PlanModal isOpen={isEditModalOpen} onClose={handleEditModalClose} plan={plan} />
    </div>
  )
}
