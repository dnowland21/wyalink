import { useState, useEffect } from 'react'
import { useParams, useNavigate, Link } from 'react-router-dom'
import {
  getSimCard,
  deleteSimCard,
  type SimCard,
  type SimStatus,
} from '@wyalink/supabase-client'
import { Card } from '@wyalink/ui'
import SimCardModal from '../components/SimCardModal'

const statusColors: Record<SimStatus, string> = {
  cold: 'bg-blue-100 text-blue-800',
  warm: 'bg-yellow-100 text-yellow-800',
  hot: 'bg-green-100 text-green-800',
  pending_swap: 'bg-orange-100 text-orange-800',
  swapped: 'bg-gray-100 text-gray-800',
  deleted: 'bg-red-100 text-red-800',
}

export default function SimCardDetail() {
  const { id } = useParams<{ id: string }>()
  const navigate = useNavigate()

  const [simCard, setSimCard] = useState<SimCard | null>(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [isEditModalOpen, setIsEditModalOpen] = useState(false)

  useEffect(() => {
    if (!id) {
      navigate('/sim-cards')
      return
    }

    fetchSimCard()
  }, [id])

  const fetchSimCard = async () => {
    if (!id) return

    setLoading(true)
    setError(null)

    try {
      const result = await getSimCard(id)

      if (result.error) throw result.error

      setSimCard(result.data)
    } catch (err: any) {
      setError('Failed to load SIM card')
      console.error(err)
    } finally {
      setLoading(false)
    }
  }

  const handleEditModalClose = (shouldRefresh?: boolean) => {
    setIsEditModalOpen(false)
    if (shouldRefresh) {
      fetchSimCard()
    }
  }

  const handleDelete = async () => {
    if (!id || !window.confirm('Permanently delete this SIM card? This action cannot be undone.')) return

    try {
      const result = await deleteSimCard(id)
      if (result.error) throw result.error

      navigate('/sim-cards')
    } catch (err: any) {
      alert('Failed to delete SIM card')
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
          <p className="text-gray-600">Loading SIM card...</p>
        </div>
      </div>
    )
  }

  if (error || !simCard) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="text-center">
          <p className="text-red-600 mb-4">{error || 'SIM card not found'}</p>
          <Link to="/sim-cards" className="text-primary-600 hover:text-primary-700">
            Back to SIM Cards
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
          <Link to="/sim-cards" className="hover:text-primary-600">
            SIM Cards
          </Link>
          <span>/</span>
          <span>{simCard.iccid}</span>
        </div>

        <div className="flex items-start justify-between">
          <div>
            <h1 className="text-3xl font-bold text-gray-900">SIM Card</h1>
            <p className="text-gray-600 font-mono mt-1">{simCard.iccid}</p>
          </div>
          <div className="flex items-center gap-2">
            <button
              onClick={() => setIsEditModalOpen(true)}
              className="px-4 py-2 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 transition-colors"
            >
              Edit SIM Card
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

      {/* Status Badge */}
      <div className="flex items-center gap-3 mb-6">
        <span className={`px-3 py-1 rounded-full text-sm font-medium ${statusColors[simCard.status]}`}>
          {simCard.status.charAt(0).toUpperCase() + simCard.status.slice(1)}
        </span>
        <span className={`px-3 py-1 rounded-full text-sm font-medium ${
          simCard.type === 'esim' ? 'bg-purple-100 text-purple-800' : 'bg-blue-100 text-blue-800'
        }`}>
          {simCard.type === 'esim' ? 'eSIM' : 'Physical SIM'}
        </span>
      </div>

      {/* Main Content */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Left Column - SIM Details */}
        <div className="lg:col-span-2 space-y-6">
          {/* Basic Information */}
          <Card>
            <h3 className="text-lg font-semibold text-gray-900 mb-4">SIM Card Information</h3>
            <div className="space-y-3">
              <div>
                <label className="block text-sm font-medium text-gray-600 mb-1">ICCID</label>
                <p className="text-sm text-gray-900 font-mono">{simCard.iccid}</p>
              </div>
              {simCard.imsi && simCard.imsi.length > 0 && (
                <div>
                  <label className="block text-sm font-medium text-gray-600 mb-1">IMSI</label>
                  <div className="space-y-1">
                    {simCard.imsi.map((imsi, index) => (
                      <p key={index} className="text-sm text-gray-900 font-mono">{imsi}</p>
                    ))}
                  </div>
                </div>
              )}
              {simCard.activation_code && (
                <div>
                  <label className="block text-sm font-medium text-gray-600 mb-1">Activation Code</label>
                  <p className="text-sm text-gray-900 font-mono">{simCard.activation_code}</p>
                </div>
              )}
              {simCard.country && (
                <div>
                  <label className="block text-sm font-medium text-gray-600 mb-1">Country</label>
                  <p className="text-sm text-gray-900">{simCard.country}</p>
                </div>
              )}
            </div>
          </Card>

          {/* Assignment Information */}
          <Card>
            <h3 className="text-lg font-semibold text-gray-900 mb-4">Assignment Information</h3>
            <div className="space-y-3">
              {simCard.line_id && (
                <div>
                  <label className="block text-sm font-medium text-gray-600 mb-1">Assigned Line</label>
                  <Link
                    to={`/lines/${simCard.line_id}`}
                    className="text-sm text-primary-600 hover:text-primary-700 font-mono"
                  >
                    {(simCard as any).line?.phone_number || simCard.line_id}
                  </Link>
                </div>
              )}
              {simCard.assigned_to && (
                <div>
                  <label className="block text-sm font-medium text-gray-600 mb-1">Assigned Customer</label>
                  <Link
                    to={`/customers/${simCard.assigned_to}`}
                    className="text-sm text-primary-600 hover:text-primary-700"
                  >
                    {(simCard as any).assigned_customer
                      ? `${(simCard as any).assigned_customer.first_name} ${(simCard as any).assigned_customer.last_name} (${(simCard as any).assigned_customer.account_number})`
                      : simCard.assigned_to}
                  </Link>
                </div>
              )}
              {simCard.first_network_attachment && (
                <div>
                  <label className="block text-sm font-medium text-gray-600 mb-1">First Network Attachment</label>
                  <p className="text-sm text-gray-900">{formatDate(simCard.first_network_attachment)}</p>
                </div>
              )}
              {!simCard.line_id && !simCard.assigned_to && (
                <p className="text-sm text-gray-500 italic">Not assigned to any customer or line</p>
              )}
            </div>
          </Card>

          {/* Additional Details */}
          {(simCard.manufacturer || simCard.manufacturer_profile || simCard.sim_order || simCard.sim_tag) && (
            <Card>
              <h3 className="text-lg font-semibold text-gray-900 mb-4">Additional Details</h3>
              <div className="space-y-3">
                {simCard.manufacturer && (
                  <div>
                    <label className="block text-sm font-medium text-gray-600 mb-1">Manufacturer</label>
                    <p className="text-sm text-gray-900">{simCard.manufacturer}</p>
                  </div>
                )}
                {simCard.manufacturer_profile && (
                  <div>
                    <label className="block text-sm font-medium text-gray-600 mb-1">Manufacturer Profile</label>
                    <p className="text-sm text-gray-900">{simCard.manufacturer_profile}</p>
                  </div>
                )}
                {simCard.sim_order && (
                  <div>
                    <label className="block text-sm font-medium text-gray-600 mb-1">SIM Order</label>
                    <p className="text-sm text-gray-900 font-mono">{simCard.sim_order}</p>
                  </div>
                )}
                {simCard.sim_tag && (
                  <div>
                    <label className="block text-sm font-medium text-gray-600 mb-1">SIM Tag</label>
                    <p className="text-sm text-gray-900">{simCard.sim_tag}</p>
                  </div>
                )}
              </div>
            </Card>
          )}
        </div>

        {/* Right Column - Metadata */}
        <div className="space-y-6">
          {/* Status Info */}
          <Card>
            <h3 className="text-lg font-semibold text-gray-900 mb-4">Status</h3>
            <div className="space-y-3">
              <div>
                <label className="block text-sm font-medium text-gray-600 mb-1">Current Status</label>
                <span className={`inline-block px-3 py-1 rounded-full text-sm font-medium ${statusColors[simCard.status]}`}>
                  {simCard.status.charAt(0).toUpperCase() + simCard.status.slice(1)}
                </span>
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-600 mb-1">Type</label>
                <p className="text-sm text-gray-900">{simCard.type === 'esim' ? 'eSIM' : 'Physical SIM'}</p>
              </div>
            </div>
          </Card>

          {/* Network Configuration */}
          {simCard.network_configuration && Object.keys(simCard.network_configuration).length > 0 && (
            <Card>
              <h3 className="text-lg font-semibold text-gray-900 mb-4">Network Configuration</h3>
              <div className="space-y-2">
                {Object.entries(simCard.network_configuration).map(([key, value]) => (
                  <div key={key}>
                    <label className="block text-sm font-medium text-gray-600 mb-1">
                      {key.charAt(0).toUpperCase() + key.slice(1).replace(/_/g, ' ')}
                    </label>
                    <p className="text-sm text-gray-900 font-mono">{JSON.stringify(value)}</p>
                  </div>
                ))}
              </div>
            </Card>
          )}

          {/* Metadata */}
          <Card>
            <h3 className="text-lg font-semibold text-gray-900 mb-4">Metadata</h3>
            <div className="space-y-3">
              <div>
                <label className="block text-sm font-medium text-gray-600 mb-1">Created</label>
                <p className="text-sm text-gray-900">{formatDate(simCard.created_at)}</p>
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-600 mb-1">Last Updated</label>
                <p className="text-sm text-gray-900">{formatDate(simCard.updated_at)}</p>
              </div>
            </div>
          </Card>
        </div>
      </div>

      {/* Edit Modal */}
      <SimCardModal isOpen={isEditModalOpen} onClose={handleEditModalClose} simCard={simCard} />
    </div>
  )
}
