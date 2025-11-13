import { useState, useEffect } from 'react'
import {
  createPromotion,
  updatePromotion,
  type Promotion,
  type CreatePromotionForm,
  type PromotionStatus,
  type DiscountType,
  type DiscountDuration,
} from '@wyalink/supabase-client'

interface PromotionModalProps {
  isOpen: boolean
  onClose: (shouldRefresh?: boolean) => void
  promotion?: Promotion | null
}

export default function PromotionModal({ isOpen, onClose, promotion }: PromotionModalProps) {
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)

  // Form state
  const [status, setStatus] = useState<PromotionStatus>('draft')
  const [promotionName, setPromotionName] = useState('')
  const [promotionDescription, setPromotionDescription] = useState('')
  const [promotionCode, setPromotionCode] = useState('')
  const [discountType, setDiscountType] = useState<DiscountType>('percent')
  const [discountAmount, setDiscountAmount] = useState('')
  const [discountDuration, setDiscountDuration] = useState<DiscountDuration>('one_time')
  const [recurringMonths, setRecurringMonths] = useState('')
  const [approvalRequired, setApprovalRequired] = useState(false)
  const [validFrom, setValidFrom] = useState('')
  const [validUntil, setValidUntil] = useState('')

  useEffect(() => {
    if (promotion) {
      setStatus(promotion.status)
      setPromotionName(promotion.promotion_name)
      setPromotionDescription(promotion.promotion_description || '')
      setPromotionCode(promotion.promotion_code || '')
      setDiscountType(promotion.discount_type)
      setDiscountAmount(promotion.discount_amount.toString())
      setDiscountDuration(promotion.discount_duration)
      setRecurringMonths(promotion.recurring_months?.toString() || '')
      setApprovalRequired(promotion.approval_required)
      setValidFrom(promotion.valid_from ? promotion.valid_from.split('T')[0] : '')
      setValidUntil(promotion.valid_until ? promotion.valid_until.split('T')[0] : '')
    } else {
      resetForm()
    }
  }, [promotion, isOpen])

  const resetForm = () => {
    setStatus('draft')
    setPromotionName('')
    setPromotionDescription('')
    setPromotionCode('')
    setDiscountType('percent')
    setDiscountAmount('')
    setDiscountDuration('one_time')
    setRecurringMonths('')
    setApprovalRequired(false)
    setValidFrom('')
    setValidUntil('')
    setError(null)
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setError(null)
    setLoading(true)

    try {
      const promotionData: CreatePromotionForm = {
        status,
        promotion_name: promotionName,
        promotion_description: promotionDescription || undefined,
        promotion_code: promotionCode || undefined,
        discount_type: discountType,
        discount_amount: parseFloat(discountAmount),
        discount_duration: discountDuration,
        recurring_months: recurringMonths ? parseInt(recurringMonths) : undefined,
        approval_required: approvalRequired,
        valid_from: validFrom || undefined,
        valid_until: validUntil || undefined,
      }

      let result
      if (promotion) {
        result = await updatePromotion(promotion.id, promotionData)
      } else {
        result = await createPromotion(promotionData)
      }

      if (result.error) throw result.error

      onClose(true)
      resetForm()
    } catch (err: any) {
      setError(err.message || 'Failed to save promotion')
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
              {promotion ? 'Edit Promotion' : 'Add New Promotion'}
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
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Promotion Name <span className="text-red-500">*</span>
                  </label>
                  <input
                    type="text"
                    required
                    value={promotionName}
                    onChange={(e) => setPromotionName(e.target.value)}
                    placeholder="e.g., Summer Sale 2025"
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary-500"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">Description</label>
                  <textarea
                    value={promotionDescription}
                    onChange={(e) => setPromotionDescription(e.target.value)}
                    rows={2}
                    placeholder="Brief description of the promotion..."
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary-500"
                  />
                </div>
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">Promotion Code</label>
                    <input
                      type="text"
                      value={promotionCode}
                      onChange={(e) => setPromotionCode(e.target.value.toUpperCase())}
                      placeholder="SAVE25"
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary-500 uppercase"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">Status</label>
                    <select
                      value={status}
                      onChange={(e) => setStatus(e.target.value as PromotionStatus)}
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary-500"
                    >
                      <option value="draft">Draft</option>
                      <option value="planned">Planned</option>
                      <option value="active">Active</option>
                      <option value="cancelled">Cancelled</option>
                      <option value="expired">Expired</option>
                    </select>
                  </div>
                </div>
              </div>
            </div>

            {/* Discount Configuration */}
            <div>
              <h3 className="text-sm font-semibold text-gray-900 mb-4">Discount Configuration</h3>
              <div className="space-y-4">
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Discount Type <span className="text-red-500">*</span>
                    </label>
                    <select
                      value={discountType}
                      onChange={(e) => setDiscountType(e.target.value as DiscountType)}
                      required
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary-500"
                    >
                      <option value="percent">Percentage (%)</option>
                      <option value="dollar">Fixed Amount ($)</option>
                    </select>
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Discount Amount <span className="text-red-500">*</span>
                    </label>
                    <div className="relative">
                      {discountType === 'dollar' && (
                        <span className="absolute left-3 top-2 text-gray-500">$</span>
                      )}
                      <input
                        type="number"
                        step="0.01"
                        min="0"
                        required
                        value={discountAmount}
                        onChange={(e) => setDiscountAmount(e.target.value)}
                        className={`w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary-500 ${
                          discountType === 'dollar' ? 'pl-7' : ''
                        }`}
                      />
                      {discountType === 'percent' && (
                        <span className="absolute right-3 top-2 text-gray-500">%</span>
                      )}
                    </div>
                  </div>
                </div>
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Discount Duration <span className="text-red-500">*</span>
                    </label>
                    <select
                      value={discountDuration}
                      onChange={(e) => setDiscountDuration(e.target.value as DiscountDuration)}
                      required
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary-500"
                    >
                      <option value="one_time">One-Time</option>
                      <option value="recurring">Recurring</option>
                    </select>
                  </div>
                  {discountDuration === 'recurring' && (
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">Recurring Months</label>
                      <input
                        type="number"
                        min="1"
                        value={recurringMonths}
                        onChange={(e) => setRecurringMonths(e.target.value)}
                        placeholder="Number of months"
                        className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary-500"
                      />
                    </div>
                  )}
                </div>
              </div>
            </div>

            {/* Validity Period */}
            <div>
              <h3 className="text-sm font-semibold text-gray-900 mb-4">Validity Period</h3>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">Valid From</label>
                  <input
                    type="date"
                    value={validFrom}
                    onChange={(e) => setValidFrom(e.target.value)}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary-500"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">Valid Until</label>
                  <input
                    type="date"
                    value={validUntil}
                    onChange={(e) => setValidUntil(e.target.value)}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary-500"
                  />
                </div>
              </div>
            </div>

            {/* Additional Settings */}
            <div>
              <h3 className="text-sm font-semibold text-gray-900 mb-4">Additional Settings</h3>
              <div className="flex items-center gap-2">
                <input
                  id="approval-required"
                  type="checkbox"
                  checked={approvalRequired}
                  onChange={(e) => setApprovalRequired(e.target.checked)}
                  className="w-4 h-4 text-primary-600 border-gray-300 rounded focus:ring-primary-500"
                />
                <label htmlFor="approval-required" className="text-sm text-gray-700">
                  Require approval before activation
                </label>
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
              {loading ? 'Saving...' : promotion ? 'Update Promotion' : 'Create Promotion'}
            </button>
          </div>
        </form>
      </div>
    </div>
  )
}
