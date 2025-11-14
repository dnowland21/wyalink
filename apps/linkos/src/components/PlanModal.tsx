import { useState, useEffect } from 'react'
import {
  createMVNOPlan,
  updateMVNOPlan,
  type MVNOPlan,
  type PlanStatus,
} from '@wyalink/supabase-client'

interface PlanModalProps {
  isOpen: boolean
  onClose: (shouldRefresh?: boolean) => void
  plan?: MVNOPlan | null
}

export default function PlanModal({ isOpen, onClose, plan }: PlanModalProps) {
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)

  // Form state
  const [planName, setPlanName] = useState('')
  const [description, setDescription] = useState('')
  const [planStatus, setPlanStatus] = useState<PlanStatus>('active')
  const [planUuid, setPlanUuid] = useState('')
  const [iftNumber, setIftNumber] = useState('')
  const [externalSku, setExternalSku] = useState('')
  const [voiceMinutes, setVoiceMinutes] = useState('')
  const [smsMessages, setSmsMessages] = useState('')
  const [highPriorityData, setHighPriorityData] = useState('')
  const [generalData, setGeneralData] = useState('')
  const [lowPriorityData, setLowPriorityData] = useState('')
  const [monthlyPrice, setMonthlyPrice] = useState('')
  const [networkName, setNetworkName] = useState('')

  useEffect(() => {
    if (isOpen && plan) {
      // Populate form with existing plan data
      setPlanName(plan.plan_name)
      setDescription(plan.description || '')
      setPlanStatus(plan.plan_status)
      setPlanUuid(plan.plan_uuid || '')
      setIftNumber(plan.ift_number || '')
      setExternalSku(plan.external_sku || '')
      setVoiceMinutes(plan.voice_minutes !== null ? plan.voice_minutes.toString() : '')
      setSmsMessages(plan.sms_messages !== null ? plan.sms_messages.toString() : '')
      setHighPriorityData(plan.high_priority_data_mb !== null ? plan.high_priority_data_mb.toString() : '')
      setGeneralData(plan.general_data_mb !== null ? plan.general_data_mb.toString() : '')
      setLowPriorityData(plan.low_priority_data_mb !== null ? plan.low_priority_data_mb.toString() : '')
      setNetworkName(plan.network_name || '')

      // Extract monthly price from prices object
      if (plan.prices) {
        const monthly = plan.prices['monthly'] || plan.prices['1'] || Object.values(plan.prices)[0]
        setMonthlyPrice(monthly ? monthly.toString() : '')
      }
    } else if (isOpen && !plan) {
      resetForm()
    }
  }, [isOpen, plan])

  const resetForm = () => {
    setPlanName('')
    setDescription('')
    setPlanStatus('active')
    setPlanUuid('')
    setIftNumber('')
    setExternalSku('')
    setVoiceMinutes('')
    setSmsMessages('')
    setHighPriorityData('')
    setGeneralData('')
    setLowPriorityData('')
    setMonthlyPrice('')
    setNetworkName('')
    setError(null)
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setError(null)
    setLoading(true)

    try {
      // Prepare prices object
      const prices: Record<string, number> = {}
      if (monthlyPrice) {
        prices['monthly'] = parseFloat(monthlyPrice)
        prices['1'] = parseFloat(monthlyPrice) // Also store with key '1' for compatibility
      }

      const planData = {
        plan_name: planName,
        description: description || undefined,
        plan_status: planStatus,
        plan_uuid: planUuid || undefined,
        ift_number: iftNumber || undefined,
        external_sku: externalSku || undefined,
        voice_minutes: voiceMinutes ? parseInt(voiceMinutes) : undefined,
        sms_messages: smsMessages ? parseInt(smsMessages) : undefined,
        high_priority_data_mb: highPriorityData ? parseInt(highPriorityData) : undefined,
        general_data_mb: generalData ? parseInt(generalData) : undefined,
        low_priority_data_mb: lowPriorityData ? parseInt(lowPriorityData) : undefined,
        prices: Object.keys(prices).length > 0 ? prices : undefined,
        network_name: networkName || undefined,
      }

      const result = plan
        ? await updateMVNOPlan(plan.id, planData)
        : await createMVNOPlan(planData)

      if (result.error) throw result.error

      onClose(true)
      resetForm()
    } catch (err: any) {
      setError(err.message || 'Failed to save plan')
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
              {plan ? 'Edit Plan' : 'Create New Plan'}
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
            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Plan Name <span className="text-red-500">*</span>
                </label>
                <input
                  type="text"
                  required
                  value={planName}
                  onChange={(e) => setPlanName(e.target.value)}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary-500"
                  placeholder="e.g., Unlimited Plus"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Status <span className="text-red-500">*</span>
                </label>
                <select
                  value={planStatus}
                  onChange={(e) => setPlanStatus(e.target.value as PlanStatus)}
                  required
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary-500"
                >
                  <option value="active">Active</option>
                  <option value="inactive">Inactive</option>
                  <option value="archived">Archived</option>
                </select>
              </div>
            </div>

            {/* Description */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">Description</label>
              <textarea
                value={description}
                onChange={(e) => setDescription(e.target.value)}
                rows={3}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary-500"
                placeholder="Plan description and features..."
              />
            </div>

            {/* Technical Details */}
            <div className="grid grid-cols-3 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Plan UUID</label>
                <input
                  type="text"
                  value={planUuid}
                  onChange={(e) => setPlanUuid(e.target.value)}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary-500"
                  placeholder="UUID"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">IFT Number</label>
                <input
                  type="text"
                  value={iftNumber}
                  onChange={(e) => setIftNumber(e.target.value)}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary-500"
                  placeholder="IFT#"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">External SKU</label>
                <input
                  type="text"
                  value={externalSku}
                  onChange={(e) => setExternalSku(e.target.value)}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary-500"
                  placeholder="SKU"
                />
              </div>
            </div>

            {/* Voice & SMS */}
            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Voice Minutes</label>
                <input
                  type="number"
                  min="0"
                  value={voiceMinutes}
                  onChange={(e) => setVoiceMinutes(e.target.value)}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary-500"
                  placeholder="Leave empty for unlimited"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">SMS Messages</label>
                <input
                  type="number"
                  min="0"
                  value={smsMessages}
                  onChange={(e) => setSmsMessages(e.target.value)}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary-500"
                  placeholder="Leave empty for unlimited"
                />
              </div>
            </div>

            {/* Data Allowances */}
            <div className="grid grid-cols-3 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">High Priority Data (MB)</label>
                <input
                  type="number"
                  min="0"
                  value={highPriorityData}
                  onChange={(e) => setHighPriorityData(e.target.value)}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary-500"
                  placeholder="MB"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">General Data (MB)</label>
                <input
                  type="number"
                  min="0"
                  value={generalData}
                  onChange={(e) => setGeneralData(e.target.value)}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary-500"
                  placeholder="MB"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Low Priority Data (MB)</label>
                <input
                  type="number"
                  min="0"
                  value={lowPriorityData}
                  onChange={(e) => setLowPriorityData(e.target.value)}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary-500"
                  placeholder="MB"
                />
              </div>
            </div>

            {/* Pricing & Network */}
            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Monthly Price ($)</label>
                <input
                  type="number"
                  step="0.01"
                  min="0"
                  value={monthlyPrice}
                  onChange={(e) => setMonthlyPrice(e.target.value)}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary-500"
                  placeholder="0.00"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Network Name</label>
                <input
                  type="text"
                  value={networkName}
                  onChange={(e) => setNetworkName(e.target.value)}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary-500"
                  placeholder="e.g., T-Mobile, AT&T"
                />
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
              className="px-4 py-2 bg-primary-800 text-white rounded-lg hover:bg-primary-700 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {loading ? 'Saving...' : plan ? 'Update Plan' : 'Create Plan'}
            </button>
          </div>
        </form>
      </div>
    </div>
  )
}
