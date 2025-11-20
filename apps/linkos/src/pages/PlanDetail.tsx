import { useState, useEffect } from 'react'
import { useParams, useNavigate, Link } from 'react-router-dom'
import {
  getMVNOPlan,
  deleteMVNOPlan,
  archiveMVNOPlan,
  type MVNOPlan,
  type PlanStatus,
} from '@wyalink/supabase-client'
import { Card, CardHeader, CardTitle, CardContent } from '../components/ui/card'
import { Badge } from '../components/ui/badge'
import { Button } from '../components/ui/button'
import { Phone, MessageSquare, Inbox, Edit, Archive, Trash2 } from 'lucide-react'
import PlanModal from '../components/PlanModal'

const statusVariants: Record<PlanStatus, 'success' | 'default' | 'error'> = {
  active: 'success',
  inactive: 'default',
  archived: 'error',
}

export default function PlanDetail() {
  const { id } = useParams<{ id: string }>()
  const navigate = useNavigate()

  const [plan, setPlan] = useState<MVNOPlan | null>(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [isEditModalOpen, setIsEditModalOpen] = useState(false)

  useEffect(() => {
    if (!id) {
      navigate('/plans')
      return
    }

    fetchPlan()
  }, [id])

  const fetchPlan = async () => {
    if (!id) return

    setLoading(true)
    setError(null)

    try {
      const result = await getMVNOPlan(id)

      if (result.error) throw result.error

      setPlan(result.data)
    } catch (err: any) {
      setError('Failed to load plan')
      console.error(err)
    } finally {
      setLoading(false)
    }
  }

  const handleEditModalClose = (shouldRefresh?: boolean) => {
    setIsEditModalOpen(false)
    if (shouldRefresh) {
      fetchPlan()
    }
  }

  const handleArchive = async () => {
    if (!id || !window.confirm('Archive this plan? It will be hidden from active use.')) return

    try {
      const result = await archiveMVNOPlan(id)
      if (result.error) throw result.error

      navigate('/plans')
    } catch (err: any) {
      alert('Failed to archive plan')
      console.error(err)
    }
  }

  const handleDelete = async () => {
    if (!id || !window.confirm('Permanently delete this plan? This action cannot be undone.')) return

    try {
      const result = await deleteMVNOPlan(id)
      if (result.error) throw result.error

      navigate('/plans')
    } catch (err: any) {
      alert('Failed to delete plan')
      console.error(err)
    }
  }

  const formatDataAmount = (mb: number | null) => {
    if (mb === null) return 'Unlimited'
    if (mb >= 1024) return `${(mb / 1024).toFixed(1)} GB`
    return `${mb} MB`
  }

  const formatMinutes = (minutes: number | null) => {
    if (minutes === null) return 'Unlimited'
    return `${minutes.toLocaleString()} minutes`
  }

  const formatMessages = (messages: number | null) => {
    if (messages === null) return 'Unlimited'
    return `${messages.toLocaleString()} messages`
  }

  const formatPrice = (prices: Record<string, number> | null) => {
    if (!prices) return 'N/A'
    const monthly = prices['monthly'] || prices['1'] || Object.values(prices)[0]
    return monthly ? `$${monthly.toFixed(2)}/month` : 'N/A'
  }

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="text-center">
          <div className="w-16 h-16 border-4 border-primary border-t-transparent rounded-full animate-spin mx-auto mb-4"></div>
          <p className="text-muted-foreground">Loading plan...</p>
        </div>
      </div>
    )
  }

  if (error || !plan) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="text-center">
          <p className="text-destructive mb-4">{error || 'Plan not found'}</p>
          <Link to="/plans" className="text-primary hover:text-primary/90">
            Back to Plans
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
          <Link to="/plans" className="hover:text-primary">
            Plans
          </Link>
          <span>/</span>
          <span>{plan.plan_name}</span>
        </div>

        <div className="flex items-start justify-between">
          <div>
            <h1 className="text-3xl font-bold">{plan.plan_name}</h1>
            {plan.ift_number && <p className="text-muted-foreground font-mono mt-1">IFT: {plan.ift_number}</p>}
          </div>
          <div className="flex items-center gap-2">
            <Button
              onClick={() => setIsEditModalOpen(true)}
              variant="outline"
            >
              <Edit className="mr-2 h-4 w-4" />
              Edit Plan
            </Button>
            {plan.plan_status !== 'archived' && (
              <Button
                onClick={handleArchive}
                variant="outline"
                className="border-warning text-warning hover:bg-warning/10"
              >
                <Archive className="mr-2 h-4 w-4" />
                Archive
              </Button>
            )}
            <Button
              onClick={handleDelete}
              variant="outline"
              className="border-destructive text-destructive hover:bg-destructive/10"
            >
              <Trash2 className="mr-2 h-4 w-4" />
              Delete
            </Button>
          </div>
        </div>
      </div>

      {/* Status Badge */}
      <div className="flex items-center gap-3 mb-6">
        <Badge variant={statusVariants[plan.plan_status]}>
          {plan.plan_status.charAt(0).toUpperCase() + plan.plan_status.slice(1)}
        </Badge>
        {plan.network_name && (
          <Badge variant="info">
            {plan.network_name}
          </Badge>
        )}
      </div>

      {/* Main Content */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Left Column - Plan Details */}
        <div className="lg:col-span-2 space-y-6">
          {/* Basic Information */}
          <Card>
            <CardHeader>
              <CardTitle className="text-lg">Plan Information</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-3">
                {plan.description && (
                  <div>
                    <label className="block text-sm font-medium text-muted-foreground mb-1">Description</label>
                    <p className="text-sm">{plan.description}</p>
                  </div>
                )}
                <div className="grid grid-cols-2 gap-4">
                  {plan.plan_uuid && (
                    <div>
                      <label className="block text-sm font-medium text-muted-foreground mb-1">Plan UUID</label>
                      <p className="text-sm font-mono">{plan.plan_uuid}</p>
                    </div>
                  )}
                  {plan.external_sku && (
                    <div>
                      <label className="block text-sm font-medium text-muted-foreground mb-1">External SKU</label>
                      <p className="text-sm">{plan.external_sku}</p>
                    </div>
                  )}
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Service Features */}
          <Card>
            <CardHeader>
              <CardTitle className="text-lg">Service Features</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-3 gap-6">
                {/* Voice */}
                <div className="text-center p-4 bg-info/10 rounded-lg">
                  <Phone className="w-8 h-8 mx-auto mb-2 text-info" />
                  <div className="text-sm font-medium text-muted-foreground mb-1">Voice</div>
                  <div className="text-lg font-bold">{formatMinutes(plan.voice_minutes)}</div>
                </div>

                {/* SMS */}
                <div className="text-center p-4 bg-success/10 rounded-lg">
                  <MessageSquare className="w-8 h-8 mx-auto mb-2 text-success" />
                  <div className="text-sm font-medium text-muted-foreground mb-1">SMS</div>
                  <div className="text-lg font-bold">{formatMessages(plan.sms_messages)}</div>
                </div>

                {/* Data */}
                <div className="text-center p-4 bg-secondary/10 rounded-lg">
                  <Inbox className="w-8 h-8 mx-auto mb-2 text-secondary" />
                  <div className="text-sm font-medium text-muted-foreground mb-1">Total Data</div>
                  <div className="text-lg font-bold">
                    {plan.high_priority_data_mb || plan.general_data_mb || plan.low_priority_data_mb
                      ? formatDataAmount(
                          (plan.high_priority_data_mb || 0) +
                            (plan.general_data_mb || 0) +
                            (plan.low_priority_data_mb || 0)
                        )
                      : 'N/A'}
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Data Breakdown */}
          {(plan.high_priority_data_mb || plan.general_data_mb || plan.low_priority_data_mb) && (
            <Card>
              <CardHeader>
                <CardTitle className="text-lg">Data Breakdown</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-3">
                  {plan.high_priority_data_mb !== null && (
                    <div className="flex items-center justify-between py-2 border-b">
                      <span className="text-sm font-medium">High Priority Data</span>
                      <span className="text-sm font-bold">{formatDataAmount(plan.high_priority_data_mb)}</span>
                    </div>
                  )}
                  {plan.general_data_mb !== null && (
                    <div className="flex items-center justify-between py-2 border-b">
                      <span className="text-sm font-medium">General Data</span>
                      <span className="text-sm font-bold">{formatDataAmount(plan.general_data_mb)}</span>
                    </div>
                  )}
                  {plan.low_priority_data_mb !== null && (
                    <div className="flex items-center justify-between py-2">
                      <span className="text-sm font-medium">Low Priority Data</span>
                      <span className="text-sm font-bold">{formatDataAmount(plan.low_priority_data_mb)}</span>
                    </div>
                  )}
                </div>
              </CardContent>
            </Card>
          )}
        </div>

        {/* Right Column - Pricing & Metadata */}
        <div className="space-y-6">
          {/* Pricing */}
          <Card>
            <CardHeader>
              <CardTitle className="text-lg">Pricing</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-center py-6">
                <div className="text-4xl font-bold text-primary mb-2">{formatPrice(plan.prices)}</div>
                <p className="text-sm text-muted-foreground">Monthly subscription</p>
              </div>
            </CardContent>
          </Card>

          {/* Metadata */}
          <Card>
            <CardHeader>
              <CardTitle className="text-lg">Metadata</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-3">
                <div>
                  <label className="block text-sm font-medium text-muted-foreground mb-1">Created</label>
                  <p className="text-sm">{new Date(plan.created_at).toLocaleString()}</p>
                </div>
                <div>
                  <label className="block text-sm font-medium text-muted-foreground mb-1">Last Updated</label>
                  <p className="text-sm">{new Date(plan.updated_at).toLocaleString()}</p>
                </div>
                {plan.max_queue_allowance !== null && (
                  <div>
                    <label className="block text-sm font-medium text-muted-foreground mb-1">Max Queue Allowance</label>
                    <p className="text-sm">{plan.max_queue_allowance}</p>
                  </div>
                )}
                {plan.promotions_offer_id && (
                  <div>
                    <label className="block text-sm font-medium text-muted-foreground mb-1">Promotions Offer ID</label>
                    <p className="text-sm font-mono">{plan.promotions_offer_id}</p>
                  </div>
                )}
              </div>
            </CardContent>
          </Card>
        </div>
      </div>

      {/* Edit Modal */}
      <PlanModal isOpen={isEditModalOpen} onClose={handleEditModalClose} plan={plan} />
    </div>
  )
}
