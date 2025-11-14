import { useState, useEffect } from 'react'
import {
  createSimCard,
  updateSimCard,
  type SimCard,
  type CreateSimCardForm,
  type SimType,
  type SimStatus,
} from '@wyalink/supabase-client'

interface SimCardModalProps {
  isOpen: boolean
  onClose: (shouldRefresh?: boolean) => void
  simCard?: SimCard | null
}

export default function SimCardModal({ isOpen, onClose, simCard }: SimCardModalProps) {
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)

  // Form state
  const [iccid, setIccid] = useState('')
  const [type, setType] = useState<SimType>('psim')
  const [status, setStatus] = useState<SimStatus>('cold')
  const [activationCode, setActivationCode] = useState('')
  const [country, setCountry] = useState('US')
  const [simOrder, setSimOrder] = useState('')
  const [simTag, setSimTag] = useState('')
  const [manufacturer, setManufacturer] = useState('')
  const [manufacturerProfile, setManufacturerProfile] = useState('')

  useEffect(() => {
    if (simCard) {
      setIccid(simCard.iccid)
      setType(simCard.type)
      setStatus(simCard.status)
      setActivationCode(simCard.activation_code || '')
      setCountry(simCard.country || 'US')
      setSimOrder(simCard.sim_order || '')
      setSimTag(simCard.sim_tag || '')
      setManufacturer(simCard.manufacturer || '')
      setManufacturerProfile(simCard.manufacturer_profile || '')
    } else {
      resetForm()
    }
  }, [simCard, isOpen])

  const resetForm = () => {
    setIccid('')
    setType('psim')
    setStatus('cold')
    setActivationCode('')
    setCountry('US')
    setSimOrder('')
    setSimTag('')
    setManufacturer('')
    setManufacturerProfile('')
    setError(null)
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setError(null)
    setLoading(true)

    try {
      const simCardData: CreateSimCardForm = {
        iccid,
        type,
        status,
        activation_code: activationCode || undefined,
        country: country || undefined,
        sim_order: simOrder || undefined,
        sim_tag: simTag || undefined,
        manufacturer: manufacturer || undefined,
        manufacturer_profile: manufacturerProfile || undefined,
      }

      let result
      if (simCard) {
        result = await updateSimCard(simCard.id, simCardData)
      } else {
        result = await createSimCard(simCardData)
      }

      if (result.error) throw result.error

      onClose(true)
      resetForm()
    } catch (err: any) {
      setError(err.message || 'Failed to save SIM card')
      console.error(err)
    } finally {
      setLoading(false)
    }
  }

  if (!isOpen) return null

  return (
    <div className="fixed inset-0 bg-gray-900/50 backdrop-blur-sm flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-lg shadow-xl max-w-2xl w-full max-h-[90vh] overflow-y-auto">
        <div className="sticky top-0 bg-white border-b border-gray-200 px-6 py-4">
          <div className="flex items-center justify-between">
            <h2 className="text-xl font-bold text-gray-900">
              {simCard ? 'Edit SIM Card' : 'Add New SIM Card'}
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
            {/* SIM Card Details */}
            <div>
              <h3 className="text-sm font-semibold text-gray-900 mb-4">SIM Card Details</h3>
              <div className="space-y-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    ICCID <span className="text-red-500">*</span>
                  </label>
                  <input
                    type="text"
                    required
                    value={iccid}
                    onChange={(e) => setIccid(e.target.value)}
                    placeholder="Integrated Circuit Card Identifier"
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary-500"
                  />
                </div>
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Type <span className="text-red-500">*</span>
                    </label>
                    <select
                      value={type}
                      onChange={(e) => setType(e.target.value as SimType)}
                      required
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary-500"
                    >
                      <option value="psim">Physical SIM</option>
                      <option value="esim">eSIM</option>
                    </select>
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Status <span className="text-red-500">*</span>
                    </label>
                    <select
                      value={status}
                      onChange={(e) => setStatus(e.target.value as SimStatus)}
                      required
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary-500"
                    >
                      <option value="cold">Cold (Inventory)</option>
                      <option value="warm">Warm (Reserved)</option>
                      <option value="hot">Hot (Active)</option>
                      <option value="pending_swap">Pending Swap</option>
                      <option value="swapped">Swapped</option>
                      <option value="deleted">Deleted</option>
                    </select>
                  </div>
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">Activation Code</label>
                  <input
                    type="text"
                    value={activationCode}
                    onChange={(e) => setActivationCode(e.target.value)}
                    placeholder="SIM activation code"
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary-500"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">Country</label>
                  <input
                    type="text"
                    value={country}
                    onChange={(e) => setCountry(e.target.value)}
                    placeholder="Country code or name"
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary-500"
                  />
                </div>
              </div>
            </div>

            {/* Additional Information */}
            <div>
              <h3 className="text-sm font-semibold text-gray-900 mb-4">Additional Information</h3>
              <div className="space-y-4">
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">SIM Order</label>
                    <input
                      type="text"
                      value={simOrder}
                      onChange={(e) => setSimOrder(e.target.value)}
                      placeholder="Order reference"
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary-500"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">SIM Tag</label>
                    <input
                      type="text"
                      value={simTag}
                      onChange={(e) => setSimTag(e.target.value)}
                      placeholder="Tag or label"
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary-500"
                    />
                  </div>
                </div>
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">Manufacturer</label>
                    <input
                      type="text"
                      value={manufacturer}
                      onChange={(e) => setManufacturer(e.target.value)}
                      placeholder="e.g., Giesecke+Devrient"
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary-500"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">Manufacturer Profile</label>
                    <input
                      type="text"
                      value={manufacturerProfile}
                      onChange={(e) => setManufacturerProfile(e.target.value)}
                      placeholder="Profile ID or name"
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
              className="px-4 py-2 bg-primary-800 text-white rounded-lg hover:bg-primary-700 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {loading ? 'Saving...' : simCard ? 'Update SIM Card' : 'Create SIM Card'}
            </button>
          </div>
        </form>
      </div>
    </div>
  )
}
