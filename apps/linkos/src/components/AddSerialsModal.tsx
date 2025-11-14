import { useState } from 'react'
import { addInventorySerials } from '@wyalink/supabase-client'

interface AddSerialsModalProps {
  isOpen: boolean
  onClose: (shouldRefresh?: boolean) => void
  inventoryId: string
}

export default function AddSerialsModal({ isOpen, onClose, inventoryId }: AddSerialsModalProps) {
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [serialsText, setSerialsText] = useState('')

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setError(null)
    setLoading(true)

    try {
      // Parse serials text - each line should be either:
      // - Just a serial number
      // - Serial number, IMEI (comma separated)
      const lines = serialsText.trim().split('\n').filter(line => line.trim())

      if (lines.length === 0) {
        throw new Error('Please enter at least one serial number')
      }

      const serials = lines.map(line => {
        const parts = line.split(',').map(p => p.trim())
        return {
          serial_number: parts[0],
          imei: parts[1] || undefined,
        }
      })

      const result = await addInventorySerials(inventoryId, serials)

      if (result.error) throw result.error

      onClose(true)
      setSerialsText('')
    } catch (err: any) {
      setError(err.message || 'Failed to add serial numbers')
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
            <h2 className="text-xl font-bold text-gray-900">Add Serial Numbers</h2>
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

          <div className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Serial Numbers <span className="text-red-500">*</span>
              </label>
              <textarea
                required
                value={serialsText}
                onChange={(e) => setSerialsText(e.target.value)}
                rows={12}
                placeholder="Enter one serial per line&#10;&#10;Format options:&#10;SERIAL123456&#10;SERIAL123457, 123456789012345&#10;&#10;First column: Serial Number (required)&#10;Second column: IMEI (optional, comma-separated)"
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary-500 font-mono text-sm"
              />
              <p className="text-xs text-gray-500 mt-2">
                Enter one serial number per line. Optionally include IMEI separated by comma.
              </p>
            </div>

            <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
              <h4 className="text-sm font-semibold text-blue-900 mb-2">Bulk Entry Tips:</h4>
              <ul className="text-xs text-blue-800 space-y-1">
                <li>• Paste from Excel/CSV: Serial numbers in column A, IMEIs in column B</li>
                <li>• Each line becomes one inventory serial record</li>
                <li>• All serials will be marked as "available" status</li>
                <li>• Received date will be set to current time (FIFO ordering)</li>
              </ul>
            </div>
          </div>

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
              {loading ? 'Adding...' : 'Add Serial Numbers'}
            </button>
          </div>
        </form>
      </div>
    </div>
  )
}
