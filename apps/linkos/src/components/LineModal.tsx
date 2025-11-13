import { useState, useEffect } from 'react'
import {
  createLine,
  updateLine,
  type Line,
  type CreateLineForm,
  type LineType,
  type LineStatus,
  type PhoneNumberStatus,
  type SimType,
} from '@wyalink/supabase-client'

interface LineModalProps {
  isOpen: boolean
  onClose: (shouldRefresh?: boolean) => void
  line?: Line | null
}

export default function LineModal({ isOpen, onClose, line }: LineModalProps) {
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)

  // Form state
  const [phoneNumber, setPhoneNumber] = useState('')
  const [type, setType] = useState<LineType>('mobility')
  const [status, setStatus] = useState<LineStatus>('pending')
  const [phoneNumberStatus, setPhoneNumberStatus] = useState<PhoneNumberStatus>('available')
  const [simType, setSimType] = useState<SimType>('psim')
  const [deviceManufacturer, setDeviceManufacturer] = useState('')
  const [deviceModel, setDeviceModel] = useState('')

  useEffect(() => {
    if (line) {
      setPhoneNumber(line.phone_number)
      setType(line.type)
      setStatus(line.status)
      setPhoneNumberStatus(line.phone_number_status)
      setSimType(line.sim_type || 'psim')
      setDeviceManufacturer(line.device_manufacturer || '')
      setDeviceModel(line.device_model || '')
    } else {
      resetForm()
    }
  }, [line, isOpen])

  const resetForm = () => {
    setPhoneNumber('')
    setType('mobility')
    setStatus('pending')
    setPhoneNumberStatus('available')
    setSimType('psim')
    setDeviceManufacturer('')
    setDeviceModel('')
    setError(null)
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setError(null)
    setLoading(true)

    try {
      const lineData: CreateLineForm = {
        phone_number: phoneNumber,
        type,
        status,
        phone_number_status: phoneNumberStatus,
        sim_type: simType,
        device_manufacturer: deviceManufacturer || undefined,
        device_model: deviceModel || undefined,
      }

      let result
      if (line) {
        result = await updateLine(line.id, lineData)
      } else {
        result = await createLine(lineData)
      }

      if (result.error) throw result.error

      onClose(true)
      resetForm()
    } catch (err: any) {
      setError(err.message || 'Failed to save line')
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
              {line ? 'Edit Line' : 'Add New Line'}
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
            {/* Line Details */}
            <div>
              <h3 className="text-sm font-semibold text-gray-900 mb-4">Line Details</h3>
              <div className="space-y-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Phone Number <span className="text-red-500">*</span>
                  </label>
                  <input
                    type="tel"
                    required
                    value={phoneNumber}
                    onChange={(e) => setPhoneNumber(e.target.value)}
                    placeholder="+1 (555) 123-4567"
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary-500"
                  />
                </div>
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Line Type <span className="text-red-500">*</span>
                    </label>
                    <select
                      value={type}
                      onChange={(e) => setType(e.target.value as LineType)}
                      required
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary-500"
                    >
                      <option value="mobility">Mobility (Phone)</option>
                      <option value="mifi">MiFi (Hotspot)</option>
                      <option value="m2m">M2M (Machine-to-Machine)</option>
                    </select>
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      SIM Type
                    </label>
                    <select
                      value={simType}
                      onChange={(e) => setSimType(e.target.value as SimType)}
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary-500"
                    >
                      <option value="psim">Physical SIM</option>
                      <option value="esim">eSIM</option>
                    </select>
                  </div>
                </div>
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Line Status
                    </label>
                    <select
                      value={status}
                      onChange={(e) => setStatus(e.target.value as LineStatus)}
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary-500"
                    >
                      <option value="initiating">Initiating</option>
                      <option value="pending">Pending</option>
                      <option value="activated">Activated</option>
                      <option value="paused">Paused</option>
                      <option value="deactivated">Deactivated</option>
                      <option value="terminated">Terminated</option>
                    </select>
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Phone Number Status
                    </label>
                    <select
                      value={phoneNumberStatus}
                      onChange={(e) => setPhoneNumberStatus(e.target.value as PhoneNumberStatus)}
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary-500"
                    >
                      <option value="available">Available</option>
                      <option value="reserved">Reserved</option>
                      <option value="active">Active</option>
                      <option value="suspended">Suspended</option>
                      <option value="terminated">Terminated</option>
                    </select>
                  </div>
                </div>
              </div>
            </div>

            {/* Device Information */}
            <div>
              <h3 className="text-sm font-semibold text-gray-900 mb-4">Device Information</h3>
              <div className="space-y-4">
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">Device Manufacturer</label>
                    <input
                      type="text"
                      value={deviceManufacturer}
                      onChange={(e) => setDeviceManufacturer(e.target.value)}
                      placeholder="e.g., Apple, Samsung"
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary-500"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">Device Model</label>
                    <input
                      type="text"
                      value={deviceModel}
                      onChange={(e) => setDeviceModel(e.target.value)}
                      placeholder="e.g., iPhone 15 Pro"
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
              {loading ? 'Saving...' : line ? 'Update Line' : 'Create Line'}
            </button>
          </div>
        </form>
      </div>
    </div>
  )
}
