import { useState, useEffect } from 'react'
import { useParams, useNavigate, Link } from 'react-router-dom'
import {
  getLine,
  deleteLine,
  type Line,
  type LineStatus,
  type PhoneNumberStatus,
} from '@wyalink/supabase-client'
import { Card, CardHeader, CardTitle, CardContent } from '../components/ui/card'
import { Badge } from '../components/ui/badge'
import { Button } from '../components/ui/button'
import { ChevronRight, Edit, Trash2, Phone, Smartphone, User, CreditCard, Loader2 } from 'lucide-react'
import LineModal from '../components/LineModal'

const statusVariants: Record<LineStatus, 'info' | 'warning' | 'success' | 'error' | 'default'> = {
  initiating: 'info',
  pending: 'warning',
  activated: 'success',
  paused: 'warning',
  deactivated: 'default',
  terminated: 'error',
}

const phoneNumberStatusVariants: Record<PhoneNumberStatus, 'info' | 'warning' | 'success' | 'error'> = {
  available: 'info',
  reserved: 'warning',
  active: 'success',
  suspended: 'warning',
  terminated: 'error',
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
          <Loader2 className="w-16 h-16 animate-spin mx-auto mb-4 text-primary" />
          <p className="text-muted-foreground">Loading line...</p>
        </div>
      </div>
    )
  }

  if (error || !line) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="text-center">
          <p className="text-destructive mb-4">{error || 'Line not found'}</p>
          <Link to="/lines" className="text-primary hover:underline">
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
        <div className="flex items-center gap-2 text-sm text-muted-foreground mb-4">
          <Link to="/lines" className="hover:text-primary hover:underline">
            Lines
          </Link>
          <ChevronRight className="w-4 h-4" />
          <span>{line.phone_number}</span>
        </div>

        <div className="flex items-start justify-between">
          <div>
            <h1 className="text-3xl font-bold">{line.phone_number}</h1>
            <p className="text-muted-foreground mt-1">
              {line.type.charAt(0).toUpperCase() + line.type.slice(1)} Line
            </p>
          </div>
          <div className="flex items-center gap-2">
            <Button
              onClick={() => setIsEditModalOpen(true)}
              variant="outline"
            >
              <Edit className="w-4 h-4 mr-2" />
              Edit Line
            </Button>
            <Button
              onClick={handleDelete}
              variant="outline"
              className="text-destructive border-destructive hover:bg-destructive hover:text-destructive-foreground"
            >
              <Trash2 className="w-4 h-4 mr-2" />
              Delete
            </Button>
          </div>
        </div>
      </div>

      {/* Status Badges */}
      <div className="flex items-center gap-3 mb-6">
        <Badge variant={statusVariants[line.status]}>
          {line.status.charAt(0).toUpperCase() + line.status.slice(1)}
        </Badge>
        <Badge variant={phoneNumberStatusVariants[line.phone_number_status]}>
          <Phone className="w-3 h-3 mr-1" />
          {line.phone_number_status.charAt(0).toUpperCase() + line.phone_number_status.slice(1)}
        </Badge>
        <Badge variant="info">
          {line.type.toUpperCase()}
        </Badge>
      </div>

      {/* Main Content */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Left Column - Line Details */}
        <div className="lg:col-span-2 space-y-6">
          {/* Basic Information */}
          <Card>
            <CardHeader>
              <CardTitle>Line Information</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-3">
                <div>
                  <label className="block text-sm font-medium text-muted-foreground mb-1">Phone Number</label>
                  <p className="text-xl font-mono">{line.phone_number}</p>
                </div>
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-muted-foreground mb-1">Line Type</label>
                    <p className="text-sm">{line.type.toUpperCase()}</p>
                  </div>
                  {line.sim_type && (
                    <div>
                      <label className="block text-sm font-medium text-muted-foreground mb-1">SIM Type</label>
                      <p className="text-sm">{line.sim_type === 'esim' ? 'eSIM' : 'Physical SIM'}</p>
                    </div>
                  )}
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Customer Information */}
          {line.customer_id && (
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <User className="w-5 h-5" />
                  Customer Information
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-3">
                  <div>
                    <label className="block text-sm font-medium text-muted-foreground mb-1">Customer</label>
                    <Link
                      to={`/customers/${line.customer_id}`}
                      className="text-sm text-primary hover:underline"
                    >
                      {(line as any).customer
                        ? `${(line as any).customer.first_name} ${(line as any).customer.last_name} (${(line as any).customer.account_number})`
                        : 'View Customer'}
                    </Link>
                  </div>
                </div>
              </CardContent>
            </Card>
          )}

          {/* SIM Card Information */}
          {line.active_sim_id && (
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <CreditCard className="w-5 h-5" />
                  Active SIM Card
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-3">
                  <div>
                    <label className="block text-sm font-medium text-muted-foreground mb-1">SIM Card</label>
                    <Link
                      to={`/sim-cards/${line.active_sim_id}`}
                      className="text-sm text-primary hover:underline font-mono"
                    >
                      {(line as any).active_sim?.iccid || line.active_sim_id}
                    </Link>
                  </div>
                  {(line as any).active_sim?.status && (
                    <div>
                      <label className="block text-sm font-medium text-muted-foreground mb-1">SIM Status</label>
                      <p className="text-sm">
                        {(line as any).active_sim.status.charAt(0).toUpperCase() + (line as any).active_sim.status.slice(1)}
                      </p>
                    </div>
                  )}
                </div>
              </CardContent>
            </Card>
          )}

          {/* Device Information */}
          {(line.device_manufacturer || line.device_model) && (
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Smartphone className="w-5 h-5" />
                  Device Information
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-3">
                  {line.device_manufacturer && (
                    <div>
                      <label className="block text-sm font-medium text-muted-foreground mb-1">Manufacturer</label>
                      <p className="text-sm">{line.device_manufacturer}</p>
                    </div>
                  )}
                  {line.device_model && (
                    <div>
                      <label className="block text-sm font-medium text-muted-foreground mb-1">Model</label>
                      <p className="text-sm">{line.device_model}</p>
                    </div>
                  )}
                </div>
              </CardContent>
            </Card>
          )}
        </div>

        {/* Right Column - Status & Metadata */}
        <div className="space-y-6">
          {/* Status Information */}
          <Card>
            <CardHeader>
              <CardTitle>Status</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-3">
                <div>
                  <label className="block text-sm font-medium text-muted-foreground mb-1">Line Status</label>
                  <Badge variant={statusVariants[line.status]}>
                    {line.status.charAt(0).toUpperCase() + line.status.slice(1)}
                  </Badge>
                </div>
                <div>
                  <label className="block text-sm font-medium text-muted-foreground mb-1">Phone Number Status</label>
                  <Badge variant={phoneNumberStatusVariants[line.phone_number_status]}>
                    {line.phone_number_status.charAt(0).toUpperCase() + line.phone_number_status.slice(1)}
                  </Badge>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Usage Information */}
          {line.last_consumption && (
            <Card>
              <CardHeader>
                <CardTitle>Usage</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-3">
                  <div>
                    <label className="block text-sm font-medium text-muted-foreground mb-1">Last Consumption</label>
                    <p className="text-sm">{formatDate(line.last_consumption)}</p>
                  </div>
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
                  <p className="text-sm">{formatDate(line.created_at)}</p>
                </div>
                <div>
                  <label className="block text-sm font-medium text-muted-foreground mb-1">Last Updated</label>
                  <p className="text-sm">{formatDate(line.updated_at)}</p>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>

      {/* Edit Modal */}
      <LineModal isOpen={isEditModalOpen} onClose={handleEditModalClose} line={line} />
    </div>
  )
}
