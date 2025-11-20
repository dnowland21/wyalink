import { useState, useEffect } from 'react'
import { useParams, useNavigate, Link } from 'react-router-dom'
import {
  getSimCard,
  deleteSimCard,
  type SimCard,
  type SimStatus,
} from '@wyalink/supabase-client'
import { Card, CardHeader, CardTitle, CardContent } from '../components/ui/card'
import { Badge } from '../components/ui/badge'
import { Button } from '../components/ui/button'
import { Edit, Trash2, ChevronLeft } from 'lucide-react'
import SimCardModal from '../components/SimCardModal'

const statusVariants: Record<SimStatus, 'info' | 'warning' | 'success' | 'warning' | 'default' | 'error'> = {
  cold: 'info',
  warm: 'warning',
  hot: 'success',
  pending_swap: 'warning',
  swapped: 'default',
  deleted: 'error',
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
          <div className="w-16 h-16 border-4 border-primary border-t-transparent rounded-full animate-spin mx-auto mb-4"></div>
          <p className="text-muted-foreground">Loading SIM card...</p>
        </div>
      </div>
    )
  }

  if (error || !simCard) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="text-center">
          <p className="text-destructive mb-4">{error || 'SIM card not found'}</p>
          <Button variant="ghost" asChild>
            <Link to="/sim-cards">
              <ChevronLeft className="h-4 w-4 mr-2" />
              Back to SIM Cards
            </Link>
          </Button>
        </div>
      </div>
    )
  }

  return (
    <div>
      {/* Header */}
      <div className="mb-6">
        <div className="flex items-center gap-2 text-sm text-muted-foreground mb-4">
          <Link to="/sim-cards" className="hover:text-foreground">
            SIM Cards
          </Link>
          <span>/</span>
          <span>{simCard.iccid}</span>
        </div>

        <div className="flex items-start justify-between">
          <div>
            <h1 className="text-3xl font-bold">SIM Card</h1>
            <p className="text-muted-foreground font-mono mt-1">{simCard.iccid}</p>
          </div>
          <div className="flex items-center gap-2">
            <Button
              variant="outline"
              onClick={() => setIsEditModalOpen(true)}
            >
              <Edit className="h-4 w-4 mr-2" />
              Edit SIM Card
            </Button>
            <Button
              variant="outline"
              onClick={handleDelete}
              className="border-destructive text-destructive hover:bg-destructive hover:text-destructive-foreground"
            >
              <Trash2 className="h-4 w-4 mr-2" />
              Delete
            </Button>
          </div>
        </div>
      </div>

      {/* Status Badge */}
      <div className="flex items-center gap-3 mb-6">
        <Badge variant={statusVariants[simCard.status]}>
          {simCard.status.charAt(0).toUpperCase() + simCard.status.slice(1).replace('_', ' ')}
        </Badge>
        <Badge variant={simCard.type === 'esim' ? 'secondary' : 'info'}>
          {simCard.type === 'esim' ? 'eSIM' : 'Physical SIM'}
        </Badge>
      </div>

      {/* Main Content */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Left Column - SIM Details */}
        <div className="lg:col-span-2 space-y-6">
          {/* Basic Information */}
          <Card>
            <CardHeader>
              <CardTitle>SIM Card Information</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-3">
                <div>
                  <label className="block text-sm font-medium text-muted-foreground mb-1">ICCID</label>
                  <p className="text-sm font-mono">{simCard.iccid}</p>
                </div>
                {simCard.imsi && simCard.imsi.length > 0 && (
                  <div>
                    <label className="block text-sm font-medium text-muted-foreground mb-1">IMSI</label>
                    <div className="space-y-1">
                      {simCard.imsi.map((imsi, index) => (
                        <p key={index} className="text-sm font-mono">{imsi}</p>
                      ))}
                    </div>
                  </div>
                )}
                {simCard.activation_code && (
                  <div>
                    <label className="block text-sm font-medium text-muted-foreground mb-1">Activation Code</label>
                    <p className="text-sm font-mono">{simCard.activation_code}</p>
                  </div>
                )}
                {simCard.country && (
                  <div>
                    <label className="block text-sm font-medium text-muted-foreground mb-1">Country</label>
                    <p className="text-sm">{simCard.country}</p>
                  </div>
                )}
              </div>
            </CardContent>
          </Card>

          {/* Assignment Information */}
          <Card>
            <CardHeader>
              <CardTitle>Assignment Information</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-3">
                {simCard.line_id && (
                  <div>
                    <label className="block text-sm font-medium text-muted-foreground mb-1">Assigned Line</label>
                    <Link
                      to={`/lines/${simCard.line_id}`}
                      className="text-sm text-primary hover:underline font-mono"
                    >
                      {(simCard as any).line?.phone_number || simCard.line_id}
                    </Link>
                  </div>
                )}
                {simCard.assigned_to && (
                  <div>
                    <label className="block text-sm font-medium text-muted-foreground mb-1">Assigned Customer</label>
                    <Link
                      to={`/customers/${simCard.assigned_to}`}
                      className="text-sm text-primary hover:underline"
                    >
                      {(simCard as any).assigned_customer
                        ? `${(simCard as any).assigned_customer.first_name} ${(simCard as any).assigned_customer.last_name} (${(simCard as any).assigned_customer.account_number})`
                        : simCard.assigned_to}
                    </Link>
                  </div>
                )}
                {simCard.first_network_attachment && (
                  <div>
                    <label className="block text-sm font-medium text-muted-foreground mb-1">First Network Attachment</label>
                    <p className="text-sm">{formatDate(simCard.first_network_attachment)}</p>
                  </div>
                )}
                {!simCard.line_id && !simCard.assigned_to && (
                  <p className="text-sm text-muted-foreground italic">Not assigned to any customer or line</p>
                )}
              </div>
            </CardContent>
          </Card>

          {/* Additional Details */}
          {(simCard.manufacturer || simCard.manufacturer_profile || simCard.sim_order || simCard.sim_tag) && (
            <Card>
              <CardHeader>
                <CardTitle>Additional Details</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-3">
                  {simCard.manufacturer && (
                    <div>
                      <label className="block text-sm font-medium text-muted-foreground mb-1">Manufacturer</label>
                      <p className="text-sm">{simCard.manufacturer}</p>
                    </div>
                  )}
                  {simCard.manufacturer_profile && (
                    <div>
                      <label className="block text-sm font-medium text-muted-foreground mb-1">Manufacturer Profile</label>
                      <p className="text-sm">{simCard.manufacturer_profile}</p>
                    </div>
                  )}
                  {simCard.sim_order && (
                    <div>
                      <label className="block text-sm font-medium text-muted-foreground mb-1">SIM Order</label>
                      <p className="text-sm font-mono">{simCard.sim_order}</p>
                    </div>
                  )}
                  {simCard.sim_tag && (
                    <div>
                      <label className="block text-sm font-medium text-muted-foreground mb-1">SIM Tag</label>
                      <p className="text-sm">{simCard.sim_tag}</p>
                    </div>
                  )}
                </div>
              </CardContent>
            </Card>
          )}
        </div>

        {/* Right Column - Metadata */}
        <div className="space-y-6">
          {/* Status Info */}
          <Card>
            <CardHeader>
              <CardTitle>Status</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-3">
                <div>
                  <label className="block text-sm font-medium text-muted-foreground mb-1">Current Status</label>
                  <Badge variant={statusVariants[simCard.status]}>
                    {simCard.status.charAt(0).toUpperCase() + simCard.status.slice(1).replace('_', ' ')}
                  </Badge>
                </div>
                <div>
                  <label className="block text-sm font-medium text-muted-foreground mb-1">Type</label>
                  <p className="text-sm">{simCard.type === 'esim' ? 'eSIM' : 'Physical SIM'}</p>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Network Configuration */}
          {simCard.network_configuration && Object.keys(simCard.network_configuration).length > 0 && (
            <Card>
              <CardHeader>
                <CardTitle>Network Configuration</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-2">
                  {Object.entries(simCard.network_configuration).map(([key, value]) => (
                    <div key={key}>
                      <label className="block text-sm font-medium text-muted-foreground mb-1">
                        {key.charAt(0).toUpperCase() + key.slice(1).replace(/_/g, ' ')}
                      </label>
                      <p className="text-sm font-mono">{JSON.stringify(value)}</p>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          )}

          {/* Metadata */}
          <Card>
            <CardHeader>
              <CardTitle>Metadata</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-3">
                <div>
                  <label className="block text-sm font-medium text-muted-foreground mb-1">Created</label>
                  <p className="text-sm">{formatDate(simCard.created_at)}</p>
                </div>
                <div>
                  <label className="block text-sm font-medium text-muted-foreground mb-1">Last Updated</label>
                  <p className="text-sm">{formatDate(simCard.updated_at)}</p>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>

      {/* Edit Modal */}
      <SimCardModal isOpen={isEditModalOpen} onClose={handleEditModalClose} simCard={simCard} />
    </div>
  )
}
