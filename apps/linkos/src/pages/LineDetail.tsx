import { useState, useEffect } from 'react'
import { useParams, useNavigate, Link } from 'react-router-dom'
import {
  getLine,
  deleteLine,
  type Line,
  type LineStatus,
  type PhoneNumberStatus,
} from '@wyalink/supabase-client'
import { Card } from '@wyalink/ui'
import LineModal from '../components/LineModal'

const statusColors: Record<LineStatus, string> = {
  initiating: 'bg-blue-100 text-blue-800',
  pending: 'bg-yellow-100 text-yellow-800',
  activated: 'bg-green-100 text-green-800',
  paused: 'bg-orange-100 text-orange-800',
  deactivated: 'bg-gray-100 text-gray-800',
  terminated: 'bg-red-100 text-red-800',
}

const phoneNumberStatusColors: Record<PhoneNumberStatus, string> = {
  available: 'bg-blue-100 text-blue-800',
  reserved: 'bg-yellow-100 text-yellow-800',
  active: 'bg-green-100 text-green-800',
  suspended: 'bg-orange-100 text-orange-800',
  terminated: 'bg-red-100 text-red-800',
}

export default function LineDetail() {
  const { id } = useParams<{ id: string }>()
  const navigate = useNavigate()

  const [line, setLine] = useState<Line | null>(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [isEditModalOpen, setIsEditModalOpen] = useState(false)

  useEffect(() => {
    if (!id) {
      navigate('/lines')
      return
    }

    fetchLine()
  }, [id])

  const fetchLine = async () => {
    if (!id) return

    setLoading(true)
    setError(null)

    try {
      const result = await getLine(id)

      if (result.error) throw result.error

      setLine(result.data)
    } catch (err: any) {
      setError('Failed to load line')
      console.error(err)
    } finally {
      setLoading(false)
    }
  }

  const handleEditModalClose = (shouldRefresh?: boolean) => {
    setIsEditModalOpen(false)
    if (shouldRefresh) {
      fetchLine()
    }
  }

  const handleDelete = async () => {
    if (!id || !window.confirm('Permanently delete this line? This action cannot be undone.')) return

    try {
      const result = await deleteLine(id)
      if (result.error) throw result.error

      navigate('/lines')
    } catch (err: any) {
      alert('Failed to delete line')
      console.error(err)
    }
  }

  const formatDate = (dateString: string | null) => {
    if (!dateString) return 'N/A'
    return new Date(dateString).toLocaleString()
  }

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="text-center">
          <div className="w-16 h-16 border-4 border-primary-600 border-t-transparent rounded-full animate-spin mx-auto mb-4"></div>
          <p className="text-gray-600">Loading line...</p>
        </div>
      </div>
    )
  }

  if (error || !line) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="text-center">
          <p className="text-red-600 mb-4">{error || 'Line not found'}</p>
          <Link to="/lines" className="text-primary-600 hover:text-primary-700">
            Back to Lines
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
          <Link to="/lines" className="hover:text-primary-600">
            Lines
          </Link>
          <span>/</span>
          <span>{line.phone_number}</span>
        </div>

        <div className="flex items-start justify-between">
          <div>
            <h1 className="text-3xl font-bold text-gray-900">{line.phone_number}</h1>
            <p className="text-gray-600 mt-1">
              {line.type.charAt(0).toUpperCase() + line.type.slice(1)} Line
            </p>
          </div>
          <div className="flex items-center gap-2">
            <button
              onClick={() => setIsEditModalOpen(true)}
              className="px-4 py-2 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 transition-colors"
            >
              Edit Line
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
        <span className={`px-3 py-1 rounded-full text-sm font-medium ${statusColors[line.status]}`}>
          {line.status.charAt(0).toUpperCase() + line.status.slice(1)}
        </span>
        <span className={`px-3 py-1 rounded-full text-sm font-medium ${phoneNumberStatusColors[line.phone_number_status]}`}>
          Phone: {line.phone_number_status.charAt(0).toUpperCase() + line.phone_number_status.slice(1)}
        </span>
        <span className="px-3 py-1 bg-blue-100 text-blue-800 rounded-full text-sm font-medium">
          {line.type.toUpperCase()}
        </span>
      </div>

      {/* Main Content */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Left Column - Line Details */}
        <div className="lg:col-span-2 space-y-6">
          {/* Basic Information */}
          <Card>
            <h3 className="text-lg font-semibold text-gray-900 mb-4">Line Information</h3>
            <div className="space-y-3">
              <div>
                <label className="block text-sm font-medium text-gray-600 mb-1">Phone Number</label>
                <p className="text-sm text-gray-900 font-mono text-xl">{line.phone_number}</p>
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-600 mb-1">Line Type</label>
                  <p className="text-sm text-gray-900">{line.type.toUpperCase()}</p>
                </div>
                {line.sim_type && (
                  <div>
                    <label className="block text-sm font-medium text-gray-600 mb-1">SIM Type</label>
                    <p className="text-sm text-gray-900">{line.sim_type === 'esim' ? 'eSIM' : 'Physical SIM'}</p>
                  </div>
                )}
              </div>
            </div>
          </Card>

          {/* Customer Information */}
          {line.customer_id && (
            <Card>
              <h3 className="text-lg font-semibold text-gray-900 mb-4">Customer Information</h3>
              <div className="space-y-3">
                <div>
                  <label className="block text-sm font-medium text-gray-600 mb-1">Customer</label>
                  <Link
                    to={`/customers/${line.customer_id}`}
                    className="text-sm text-primary-600 hover:text-primary-700"
                  >
                    {(line as any).customer
                      ? `${(line as any).customer.first_name} ${(line as any).customer.last_name} (${(line as any).customer.account_number})`
                      : 'View Customer'}
                  </Link>
                </div>
              </div>
            </Card>
          )}

          {/* SIM Card Information */}
          {line.active_sim_id && (
            <Card>
              <h3 className="text-lg font-semibold text-gray-900 mb-4">Active SIM Card</h3>
              <div className="space-y-3">
                <div>
                  <label className="block text-sm font-medium text-gray-600 mb-1">SIM Card</label>
                  <Link
                    to={`/sim-cards/${line.active_sim_id}`}
                    className="text-sm text-primary-600 hover:text-primary-700 font-mono"
                  >
                    {(line as any).active_sim?.iccid || line.active_sim_id}
                  </Link>
                </div>
                {(line as any).active_sim?.status && (
                  <div>
                    <label className="block text-sm font-medium text-gray-600 mb-1">SIM Status</label>
                    <p className="text-sm text-gray-900">
                      {(line as any).active_sim.status.charAt(0).toUpperCase() + (line as any).active_sim.status.slice(1)}
                    </p>
                  </div>
                )}
              </div>
            </Card>
          )}

          {/* Device Information */}
          {(line.device_manufacturer || line.device_model) && (
            <Card>
              <h3 className="text-lg font-semibold text-gray-900 mb-4">Device Information</h3>
              <div className="space-y-3">
                {line.device_manufacturer && (
                  <div>
                    <label className="block text-sm font-medium text-gray-600 mb-1">Manufacturer</label>
                    <p className="text-sm text-gray-900">{line.device_manufacturer}</p>
                  </div>
                )}
                {line.device_model && (
                  <div>
                    <label className="block text-sm font-medium text-gray-600 mb-1">Model</label>
                    <p className="text-sm text-gray-900">{line.device_model}</p>
                  </div>
                )}
              </div>
            </Card>
          )}
        </div>

        {/* Right Column - Status & Metadata */}
        <div className="space-y-6">
          {/* Status Information */}
          <Card>
            <h3 className="text-lg font-semibold text-gray-900 mb-4">Status</h3>
            <div className="space-y-3">
              <div>
                <label className="block text-sm font-medium text-gray-600 mb-1">Line Status</label>
                <span className={`inline-block px-3 py-1 rounded-full text-sm font-medium ${statusColors[line.status]}`}>
                  {line.status.charAt(0).toUpperCase() + line.status.slice(1)}
                </span>
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-600 mb-1">Phone Number Status</label>
                <span className={`inline-block px-3 py-1 rounded-full text-sm font-medium ${phoneNumberStatusColors[line.phone_number_status]}`}>
                  {line.phone_number_status.charAt(0).toUpperCase() + line.phone_number_status.slice(1)}
                </span>
              </div>
            </div>
          </Card>

          {/* Usage Information */}
          {line.last_consumption && (
            <Card>
              <h3 className="text-lg font-semibold text-gray-900 mb-4">Usage</h3>
              <div className="space-y-3">
                <div>
                  <label className="block text-sm font-medium text-gray-600 mb-1">Last Consumption</label>
                  <p className="text-sm text-gray-900">{formatDate(line.last_consumption)}</p>
                </div>
              </div>
            </Card>
          )}

          {/* Metadata */}
          <Card>
            <h3 className="text-lg font-semibold text-gray-900 mb-4">Metadata</h3>
            <div className="space-y-3">
              <div>
                <label className="block text-sm font-medium text-gray-600 mb-1">Created</label>
                <p className="text-sm text-gray-900">{formatDate(line.created_at)}</p>
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-600 mb-1">Last Updated</label>
                <p className="text-sm text-gray-900">{formatDate(line.updated_at)}</p>
              </div>
            </div>
          </Card>
        </div>
      </div>

      {/* Edit Modal */}
      <LineModal isOpen={isEditModalOpen} onClose={handleEditModalClose} line={line} />
    </div>
  )
}
