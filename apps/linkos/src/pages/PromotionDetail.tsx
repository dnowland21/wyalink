import { useState, useEffect } from 'react'
import { useParams, useNavigate, Link } from 'react-router-dom'
import {
  getPromotion,
  deletePromotion,
  type Promotion,
  type PromotionStatus,
} from '@wyalink/supabase-client'
import { Card } from '@wyalink/ui'
import PromotionModal from '../components/PromotionModal'

const statusColors: Record<PromotionStatus, string> = {
  draft: 'bg-gray-100 text-gray-800',
  planned: 'bg-blue-100 text-blue-800',
  active: 'bg-green-100 text-green-800',
  expired: 'bg-orange-100 text-orange-800',
  cancelled: 'bg-red-100 text-red-800',
}

export default function PromotionDetail() {
  const { id } = useParams<{ id: string }>()
  const navigate = useNavigate()

  const [promotion, setPromotion] = useState<Promotion | null>(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [isEditModalOpen, setIsEditModalOpen] = useState(false)

  useEffect(() => {
    if (!id) {
      navigate('/promotions')
      return
    }

    fetchPromotion()
  }, [id])

  const fetchPromotion = async () => {
    if (!id) return

    setLoading(true)
    setError(null)

    try {
      const result = await getPromotion(id)

      if (result.error) throw result.error

      setPromotion(result.data)
    } catch (err: any) {
      setError('Failed to load promotion')
      console.error(err)
    } finally {
      setLoading(false)
    }
  }

  const handleEditModalClose = (shouldRefresh?: boolean) => {
    setIsEditModalOpen(false)
    if (shouldRefresh) {
      fetchPromotion()
    }
  }

  const handleDelete = async () => {
    if (!id || !window.confirm('Permanently delete this promotion? This action cannot be undone.')) return

    try {
      const result = await deletePromotion(id)
      if (result.error) throw result.error

      navigate('/promotions')
    } catch (err: any) {
      alert('Failed to delete promotion')
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

  const formatDiscount = (promotion: Promotion) => {
    if (promotion.discount_type === 'dollar') {
      return `$${promotion.discount_amount.toFixed(2)}`
    } else {
      return `${promotion.discount_amount}%`
    }
  }

  const isPromotionActive = (promotion: Promotion) => {
    if (promotion.status !== 'active') return false
    const now = new Date()
    const validFrom = promotion.valid_from ? new Date(promotion.valid_from) : null
    const validUntil = promotion.valid_until ? new Date(promotion.valid_until) : null

    if (validFrom && now < validFrom) return false
    if (validUntil && now > validUntil) return false
    return true
  }

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="text-center">
          <div className="w-16 h-16 border-4 border-primary-600 border-t-transparent rounded-full animate-spin mx-auto mb-4"></div>
          <p className="text-gray-600">Loading promotion...</p>
        </div>
      </div>
    )
  }

  if (error || !promotion) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="text-center">
          <p className="text-red-600 mb-4">{error || 'Promotion not found'}</p>
          <Link to="/promotions" className="text-primary-600 hover:text-primary-700">
            Back to Promotions
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
          <Link to="/promotions" className="hover:text-primary-600">
            Promotions
          </Link>
          <span>/</span>
          <span>{promotion.promotion_name}</span>
        </div>

        <div className="flex items-start justify-between">
          <div>
            <h1 className="text-3xl font-bold text-gray-900">{promotion.promotion_name}</h1>
            {promotion.promotion_code && (
              <p className="text-gray-600 font-mono mt-1">Code: {promotion.promotion_code}</p>
            )}
          </div>
          <div className="flex items-center gap-2">
            <button
              onClick={() => setIsEditModalOpen(true)}
              className="px-4 py-2 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 transition-colors"
            >
              Edit Promotion
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

      {/* Status Badges */}
      <div className="flex items-center gap-3 mb-6">
        <span className={`px-3 py-1 rounded-full text-sm font-medium ${statusColors[promotion.status]}`}>
          {promotion.status.charAt(0).toUpperCase() + promotion.status.slice(1)}
        </span>
        {isPromotionActive(promotion) && (
          <span className="px-3 py-1 bg-green-100 text-green-800 rounded-full text-sm font-medium">
            Currently Active
          </span>
        )}
        {promotion.approval_required && (
          <span className="px-3 py-1 bg-yellow-100 text-yellow-800 rounded-full text-sm font-medium">
            Approval Required
          </span>
        )}
      </div>

      {/* Main Content */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Left Column - Promotion Details */}
        <div className="lg:col-span-2 space-y-6">
          {/* Basic Information */}
          <Card>
            <h3 className="text-lg font-semibold text-gray-900 mb-4">Promotion Information</h3>
            <div className="space-y-3">
              <div>
                <label className="block text-sm font-medium text-gray-600 mb-1">Promotion Name</label>
                <p className="text-sm text-gray-900">{promotion.promotion_name}</p>
              </div>
              {promotion.promotion_description && (
                <div>
                  <label className="block text-sm font-medium text-gray-600 mb-1">Description</label>
                  <p className="text-sm text-gray-900">{promotion.promotion_description}</p>
                </div>
              )}
              {promotion.promotion_code && (
                <div>
                  <label className="block text-sm font-medium text-gray-600 mb-1">Promotion Code</label>
                  <p className="text-sm text-gray-900 font-mono text-lg font-semibold">{promotion.promotion_code}</p>
                </div>
              )}
            </div>
          </Card>

          {/* Discount Details */}
          <Card>
            <h3 className="text-lg font-semibold text-gray-900 mb-4">Discount Details</h3>
            <div className="space-y-3">
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-600 mb-1">Discount Type</label>
                  <p className="text-sm text-gray-900">
                    {promotion.discount_type === 'dollar' ? 'Dollar Amount' : 'Percentage'}
                  </p>
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-600 mb-1">Discount Amount</label>
                  <p className="text-2xl font-bold text-primary-600">{formatDiscount(promotion)}</p>
                </div>
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-600 mb-1">Duration</label>
                  <p className="text-sm text-gray-900">
                    {promotion.discount_duration === 'one_time' ? 'One Time' : 'Recurring'}
                  </p>
                </div>
                {promotion.discount_duration === 'recurring' && promotion.recurring_months && (
                  <div>
                    <label className="block text-sm font-medium text-gray-600 mb-1">Recurring Months</label>
                    <p className="text-sm text-gray-900">{promotion.recurring_months} months</p>
                  </div>
                )}
              </div>
            </div>
          </Card>

          {/* Validity Period */}
          <Card>
            <h3 className="text-lg font-semibold text-gray-900 mb-4">Validity Period</h3>
            <div className="space-y-3">
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-600 mb-1">Valid From</label>
                  <p className="text-sm text-gray-900">{formatDate(promotion.valid_from)}</p>
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-600 mb-1">Valid Until</label>
                  <p className="text-sm text-gray-900">{formatDate(promotion.valid_until)}</p>
                </div>
              </div>
            </div>
          </Card>

          {/* Applicable Items */}
          {(promotion.included_plan_ids?.length || promotion.included_inventory_ids?.length) && (
            <Card>
              <h3 className="text-lg font-semibold text-gray-900 mb-4">Applicable Items</h3>
              <div className="space-y-3">
                {promotion.included_plan_ids && promotion.included_plan_ids.length > 0 && (
                  <div>
                    <label className="block text-sm font-medium text-gray-600 mb-1">Included Plans</label>
                    <p className="text-sm text-gray-900">{promotion.included_plan_ids.length} plan(s) included</p>
                  </div>
                )}
                {promotion.included_inventory_ids && promotion.included_inventory_ids.length > 0 && (
                  <div>
                    <label className="block text-sm font-medium text-gray-600 mb-1">Included Inventory</label>
                    <p className="text-sm text-gray-900">{promotion.included_inventory_ids.length} item(s) included</p>
                  </div>
                )}
                {!promotion.included_plan_ids?.length && !promotion.included_inventory_ids?.length && (
                  <p className="text-sm text-gray-500 italic">Applies to all items</p>
                )}
              </div>
            </Card>
          )}
        </div>

        {/* Right Column - Status & Metadata */}
        <div className="space-y-6">
          {/* Status */}
          <Card>
            <h3 className="text-lg font-semibold text-gray-900 mb-4">Status</h3>
            <div className="space-y-3">
              <div>
                <label className="block text-sm font-medium text-gray-600 mb-1">Current Status</label>
                <span className={`inline-block px-3 py-1 rounded-full text-sm font-medium ${statusColors[promotion.status]}`}>
                  {promotion.status.charAt(0).toUpperCase() + promotion.status.slice(1)}
                </span>
              </div>
              {isPromotionActive(promotion) && (
                <div className="p-3 bg-green-50 border border-green-200 rounded-lg">
                  <p className="text-sm text-green-800 font-medium">This promotion is currently active and available for use.</p>
                </div>
              )}
            </div>
          </Card>

          {/* Approval Information */}
          {promotion.approval_required && (
            <Card>
              <h3 className="text-lg font-semibold text-gray-900 mb-4">Approval</h3>
              <div className="space-y-3">
                <div>
                  <label className="block text-sm font-medium text-gray-600 mb-1">Approval Required</label>
                  <p className="text-sm text-gray-900">Yes</p>
                </div>
                {promotion.approved_by && (
                  <div>
                    <label className="block text-sm font-medium text-gray-600 mb-1">Approved By</label>
                    <p className="text-sm text-gray-900">{promotion.approved_by}</p>
                  </div>
                )}
                {promotion.approved_at && (
                  <div>
                    <label className="block text-sm font-medium text-gray-600 mb-1">Approved At</label>
                    <p className="text-sm text-gray-900">{formatDateTime(promotion.approved_at)}</p>
                  </div>
                )}
              </div>
            </Card>
          )}

          {/* Metadata */}
          <Card>
            <h3 className="text-lg font-semibold text-gray-900 mb-4">Metadata</h3>
            <div className="space-y-3">
              <div>
                <label className="block text-sm font-medium text-gray-600 mb-1">Created</label>
                <p className="text-sm text-gray-900">{formatDateTime(promotion.created_at)}</p>
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-600 mb-1">Last Updated</label>
                <p className="text-sm text-gray-900">{formatDateTime(promotion.updated_at)}</p>
              </div>
            </div>
          </Card>
        </div>
      </div>

      {/* Edit Modal */}
      <PromotionModal isOpen={isEditModalOpen} onClose={handleEditModalClose} promotion={promotion} />
    </div>
  )
}
