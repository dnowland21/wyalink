import { useState, useEffect } from 'react'
import { useParams, useNavigate, Link } from 'react-router-dom'
import {
  getPromotion,
  deletePromotion,
  type Promotion,
  type PromotionStatus,
} from '@wyalink/supabase-client'
import { Card, CardHeader, CardTitle, CardContent } from '../components/ui/card'
import { Badge } from '../components/ui/badge'
import { Button } from '../components/ui/button'
import { Loader2, Edit, Trash2, CheckCircle } from 'lucide-react'
import PromotionModal from '../components/PromotionModal'

const statusVariants: Record<PromotionStatus, 'default' | 'info' | 'success' | 'warning' | 'error'> = {
  draft: 'default',
  planned: 'info',
  active: 'success',
  expired: 'warning',
  cancelled: 'error',
}

export default function PromotionDetail() {
  const { id } = useParams<{ id: string }>()
  const navigate = useNavigate()

  const [promotion, setPromotion] = useState<Promotion | null>(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [isEditModalOpen, setIsEditModalOpen] = useState(false)

  useEffect(() => {
    if (!id) {
      navigate('/promotions')
      return
    }

    fetchPromotion()
  }, [id])

  const fetchPromotion = async () => {
    if (!id) return

    setLoading(true)
    setError(null)

    try {
      const result = await getPromotion(id)

      if (result.error) throw result.error

      setPromotion(result.data)
    } catch (err: any) {
      setError('Failed to load promotion')
      console.error(err)
    } finally {
      setLoading(false)
    }
  }

  const handleEditModalClose = (shouldRefresh?: boolean) => {
    setIsEditModalOpen(false)
    if (shouldRefresh) {
      fetchPromotion()
    }
  }

  const handleDelete = async () => {
    if (!id || !window.confirm('Permanently delete this promotion? This action cannot be undone.')) return

    try {
      const result = await deletePromotion(id)
      if (result.error) throw result.error

      navigate('/promotions')
    } catch (err: any) {
      alert('Failed to delete promotion')
      console.error(err)
    }
  }

  const formatDate = (dateString: string | null) => {
    if (!dateString) return 'N/A'
    return new Date(dateString).toLocaleDateString('en-US', {
      month: 'short',
      day: 'numeric',
      year: 'numeric',
    })
  }

  const formatDateTime = (dateString: string | null) => {
    if (!dateString) return 'N/A'
    return new Date(dateString).toLocaleString()
  }

  const formatDiscount = (promotion: Promotion) => {
    if (promotion.discount_type === 'dollar') {
      return `$${promotion.discount_amount.toFixed(2)}`
    } else {
      return `${promotion.discount_amount}%`
    }
  }

  const isPromotionActive = (promotion: Promotion) => {
    if (promotion.status !== 'active') return false
    const now = new Date()
    const validFrom = promotion.valid_from ? new Date(promotion.valid_from) : null
    const validUntil = promotion.valid_until ? new Date(promotion.valid_until) : null

    if (validFrom && now < validFrom) return false
    if (validUntil && now > validUntil) return false
    return true
  }

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="text-center">
          <Loader2 className="w-16 h-16 mx-auto mb-4 animate-spin text-primary" />
          <p className="text-muted-foreground">Loading promotion...</p>
        </div>
      </div>
    )
  }

  if (error || !promotion) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="text-center">
          <p className="text-destructive mb-4">{error || 'Promotion not found'}</p>
          <Link to="/promotions" className="text-primary hover:underline">
            Back to Promotions
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
          <Link to="/promotions" className="hover:text-primary">
            Promotions
          </Link>
          <span>/</span>
          <span>{promotion.promotion_name}</span>
        </div>

        <div className="flex items-start justify-between">
          <div>
            <h1 className="text-3xl font-bold">{promotion.promotion_name}</h1>
            {promotion.promotion_code && (
              <p className="text-muted-foreground font-mono mt-1">Code: {promotion.promotion_code}</p>
            )}
          </div>
          <div className="flex items-center gap-2">
            <Button
              onClick={() => setIsEditModalOpen(true)}
              variant="outline"
            >
              <Edit className="w-4 h-4 mr-2" />
              Edit Promotion
            </Button>
            <Button
              onClick={handleDelete}
              variant="outline"
              className="border-destructive text-destructive hover:bg-destructive hover:text-destructive-foreground"
            >
              <Trash2 className="w-4 h-4 mr-2" />
              Delete
            </Button>
          </div>
        </div>
      </div>

      {/* Status Badges */}
      <div className="flex items-center gap-3 mb-6">
        <Badge variant={statusVariants[promotion.status]}>
          {promotion.status.charAt(0).toUpperCase() + promotion.status.slice(1)}
        </Badge>
        {isPromotionActive(promotion) && (
          <Badge variant="success">
            <CheckCircle className="w-3 h-3 mr-1" />
            Currently Active
          </Badge>
        )}
        {promotion.approval_required && (
          <Badge variant="warning">
            Approval Required
          </Badge>
        )}
      </div>

      {/* Main Content */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Left Column - Promotion Details */}
        <div className="lg:col-span-2 space-y-6">
          {/* Basic Information */}
          <Card>
            <CardHeader>
              <CardTitle>Promotion Information</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-3">
                <div>
                  <label className="block text-sm font-medium text-muted-foreground mb-1">Promotion Name</label>
                  <p className="text-sm">{promotion.promotion_name}</p>
                </div>
                {promotion.promotion_description && (
                  <div>
                    <label className="block text-sm font-medium text-muted-foreground mb-1">Description</label>
                    <p className="text-sm">{promotion.promotion_description}</p>
                  </div>
                )}
                {promotion.promotion_code && (
                  <div>
                    <label className="block text-sm font-medium text-muted-foreground mb-1">Promotion Code</label>
                    <p className="font-mono text-lg font-semibold">{promotion.promotion_code}</p>
                  </div>
                )}
              </div>
            </CardContent>
          </Card>

          {/* Discount Details */}
          <Card>
            <CardHeader>
              <CardTitle>Discount Details</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-3">
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-muted-foreground mb-1">Discount Type</label>
                    <p className="text-sm">
                      {promotion.discount_type === 'dollar' ? 'Dollar Amount' : 'Percentage'}
                    </p>
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-muted-foreground mb-1">Discount Amount</label>
                    <p className="text-2xl font-bold text-primary">{formatDiscount(promotion)}</p>
                  </div>
                </div>
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-muted-foreground mb-1">Duration</label>
                    <p className="text-sm">
                      {promotion.discount_duration === 'one_time' ? 'One Time' : 'Recurring'}
                    </p>
                  </div>
                  {promotion.discount_duration === 'recurring' && promotion.recurring_months && (
                    <div>
                      <label className="block text-sm font-medium text-muted-foreground mb-1">Recurring Months</label>
                      <p className="text-sm">{promotion.recurring_months} months</p>
                    </div>
                  )}
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Validity Period */}
          <Card>
            <CardHeader>
              <CardTitle>Validity Period</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-3">
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-muted-foreground mb-1">Valid From</label>
                    <p className="text-sm">{formatDate(promotion.valid_from)}</p>
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-muted-foreground mb-1">Valid Until</label>
                    <p className="text-sm">{formatDate(promotion.valid_until)}</p>
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Applicable Items */}
          {(promotion.included_plan_ids?.length || promotion.included_inventory_ids?.length) && (
            <Card>
              <CardHeader>
                <CardTitle>Applicable Items</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-3">
                  {promotion.included_plan_ids && promotion.included_plan_ids.length > 0 && (
                    <div>
                      <label className="block text-sm font-medium text-muted-foreground mb-1">Included Plans</label>
                      <p className="text-sm">{promotion.included_plan_ids.length} plan(s) included</p>
                    </div>
                  )}
                  {promotion.included_inventory_ids && promotion.included_inventory_ids.length > 0 && (
                    <div>
                      <label className="block text-sm font-medium text-muted-foreground mb-1">Included Inventory</label>
                      <p className="text-sm">{promotion.included_inventory_ids.length} item(s) included</p>
                    </div>
                  )}
                  {!promotion.included_plan_ids?.length && !promotion.included_inventory_ids?.length && (
                    <p className="text-sm text-muted-foreground italic">Applies to all items</p>
                  )}
                </div>
              </CardContent>
            </Card>
          )}
        </div>

        {/* Right Column - Status & Metadata */}
        <div className="space-y-6">
          {/* Status */}
          <Card>
            <CardHeader>
              <CardTitle>Status</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-3">
                <div>
                  <label className="block text-sm font-medium text-muted-foreground mb-1">Current Status</label>
                  <Badge variant={statusVariants[promotion.status]}>
                    {promotion.status.charAt(0).toUpperCase() + promotion.status.slice(1)}
                  </Badge>
                </div>
                {isPromotionActive(promotion) && (
                  <div className="p-3 bg-success/10 border border-success/20 rounded-lg">
                    <p className="text-sm text-success font-medium">This promotion is currently active and available for use.</p>
                  </div>
                )}
              </div>
            </CardContent>
          </Card>

          {/* Approval Information */}
          {promotion.approval_required && (
            <Card>
              <CardHeader>
                <CardTitle>Approval</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-3">
                  <div>
                    <label className="block text-sm font-medium text-muted-foreground mb-1">Approval Required</label>
                    <p className="text-sm">Yes</p>
                  </div>
                  {promotion.approved_by && (
                    <div>
                      <label className="block text-sm font-medium text-muted-foreground mb-1">Approved By</label>
                      <p className="text-sm">{promotion.approved_by}</p>
                    </div>
                  )}
                  {promotion.approved_at && (
                    <div>
                      <label className="block text-sm font-medium text-muted-foreground mb-1">Approved At</label>
                      <p className="text-sm">{formatDateTime(promotion.approved_at)}</p>
                    </div>
                  )}
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
                  <p className="text-sm">{formatDateTime(promotion.created_at)}</p>
                </div>
                <div>
                  <label className="block text-sm font-medium text-muted-foreground mb-1">Last Updated</label>
                  <p className="text-sm">{formatDateTime(promotion.updated_at)}</p>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>

      {/* Edit Modal */}
      <PromotionModal isOpen={isEditModalOpen} onClose={handleEditModalClose} promotion={promotion} />
    </div>
  )
}
