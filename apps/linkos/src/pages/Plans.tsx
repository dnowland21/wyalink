import { useState, useEffect } from 'react'
import { Link } from 'react-router-dom'
import { getMVNOPlans, type MVNOPlan, type PlanStatus } from '@wyalink/supabase-client'
import { Card, CardHeader, CardTitle, CardContent } from '../components/ui/card'
import { Badge } from '../components/ui/badge'
import { Button } from '../components/ui/button'
import { Input } from '../components/ui/input'
import { Search, Plus } from 'lucide-react'
import PlanModal from '../components/PlanModal'

const statusColors: Record<PlanStatus, string> = {
  active: 'success',
  inactive: 'default',
  archived: 'error',
}

export default function Plans() {
  const [plans, setPlans] = useState<MVNOPlan[]>([])
  const [filteredPlans, setFilteredPlans] = useState<MVNOPlan[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  // Modal state
  const [isPlanModalOpen, setIsPlanModalOpen] = useState(false)
  const [selectedPlan, setSelectedPlan] = useState<MVNOPlan | null>(null)

  // Filters
  const [statusFilter, setStatusFilter] = useState<string>('all')
  const [searchQuery, setSearchQuery] = useState('')

  // Stats
  const [stats, setStats] = useState({
    total: 0,
    active: 0,
    inactive: 0,
    archived: 0,
  })

  // Fetch plans
  const fetchPlans = async () => {
    setLoading(true)
    setError(null)

    try {
      const result = await getMVNOPlans()

      if (result.error) throw result.error

      const plansData = result.data || []
      setPlans(plansData)

      // Calculate stats
      setStats({
        total: plansData.length,
        active: plansData.filter((p) => p.plan_status === 'active').length,
        inactive: plansData.filter((p) => p.plan_status === 'inactive').length,
        archived: plansData.filter((p) => p.plan_status === 'archived').length,
      })
    } catch (err: any) {
      setError('Failed to load plans')
      console.error(err)
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    fetchPlans()
  }, [])

  // Apply filters
  useEffect(() => {
    let filtered = [...plans]

    // Status filter
    if (statusFilter !== 'all') {
      filtered = filtered.filter((plan) => plan.plan_status === statusFilter)
    }

    // Search filter
    if (searchQuery) {
      const query = searchQuery.toLowerCase()
      filtered = filtered.filter(
        (plan) =>
          plan.plan_name.toLowerCase().includes(query) ||
          plan.description?.toLowerCase().includes(query) ||
          plan.ift_number?.toLowerCase().includes(query) ||
          plan.external_sku?.toLowerCase().includes(query)
      )
    }

    setFilteredPlans(filtered)
  }, [plans, statusFilter, searchQuery])

  const handleOpenCreateModal = () => {
    setSelectedPlan(null)
    setIsPlanModalOpen(true)
  }

  const handleOpenEditModal = (plan: MVNOPlan) => {
    setSelectedPlan(plan)
    setIsPlanModalOpen(true)
  }

  const handleClosePlanModal = (shouldRefresh?: boolean) => {
    setIsPlanModalOpen(false)
    setSelectedPlan(null)
    if (shouldRefresh) {
      fetchPlans()
    }
  }

  const formatDataAmount = (mb: number | null) => {
    if (mb === null) return 'Unlimited'
    if (mb >= 1024) return `${(mb / 1024).toFixed(1)} GB`
    return `${mb} MB`
  }

  const formatMinutes = (minutes: number | null) => {
    if (minutes === null) return 'Unlimited'
    return `${minutes} min`
  }

  const formatMessages = (messages: number | null) => {
    if (messages === null) return 'Unlimited'
    return `${messages} msgs`
  }

  const formatPrice = (prices: Record<string, number> | null) => {
    if (!prices) return 'N/A'
    // Assuming a 'monthly' price exists
    const monthly = prices['monthly'] || prices['1'] || Object.values(prices)[0]
    return monthly ? `$${monthly.toFixed(2)}` : 'N/A'
  }

  return (
    <div>
      {/* Header */}
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-gray-900">MVNO Plans</h1>
        <p className="text-gray-600 mt-1">Manage service plans and pricing</p>
      </div>

      {/* Stats Grid */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-8">
        <Card>
          <CardContent className="p-6">
            <div className="text-sm text-muted-foreground">Total Plans</div>
            <div className="text-2xl font-bold mt-1">{stats.total}</div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-6">
            <div className="text-sm text-muted-foreground">Active</div>
            <div className="text-2xl font-bold text-success mt-1">{stats.active}</div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-6">
            <div className="text-sm text-muted-foreground">Inactive</div>
            <div className="text-2xl font-bold text-muted-foreground mt-1">{stats.inactive}</div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-6">
            <div className="text-sm text-muted-foreground">Archived</div>
            <div className="text-2xl font-bold text-error mt-1">{stats.archived}</div>
          </CardContent>
        </Card>
      </div>

      {/* Error Message */}
      {error && (
        <div className="bg-error-50 border border-error-200 rounded-lg p-4 mb-6">
          <p className="text-sm text-error-800">{error}</p>
        </div>
      )}

      {/* Plans Table */}
      <Card>
        <CardHeader>
          <div className="flex items-center justify-between">
            <CardTitle className="text-lg">All Plans</CardTitle>
            <div className="flex items-center gap-3">
              <div className="relative">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground pointer-events-none" />
                <Input
                  type="text"
                  placeholder="Search plans..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="w-64 pl-9"
                />
              </div>
              <select
                value={statusFilter}
                onChange={(e) => setStatusFilter(e.target.value)}
                className="text-sm border border-input rounded-md px-3 py-2 h-10 focus:outline-none focus:ring-2 focus:ring-ring"
              >
                <option value="all">All Status</option>
                <option value="active">Active</option>
                <option value="inactive">Inactive</option>
                <option value="archived">Archived</option>
              </select>
              <Button onClick={handleOpenCreateModal}>
                <Plus className="h-4 w-4 mr-2" />
                Add Plan
              </Button>
            </div>
          </div>
        </CardHeader>
        <CardContent>
          {loading ? (
            <div className="p-8 text-center text-muted-foreground">Loading plans...</div>
          ) : filteredPlans.length === 0 ? (
            <div className="p-8 text-center text-muted-foreground">
              {searchQuery || statusFilter !== 'all' ? 'No plans found matching your filters' : 'No plans yet'}
            </div>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead>
                  <tr className="border-b border-gray-200">
                    <th className="text-left py-3 px-4 text-sm font-semibold text-gray-700">Plan Name</th>
                    <th className="text-left py-3 px-4 text-sm font-semibold text-gray-700">Data</th>
                    <th className="text-left py-3 px-4 text-sm font-semibold text-gray-700">Voice</th>
                    <th className="text-left py-3 px-4 text-sm font-semibold text-gray-700">SMS</th>
                    <th className="text-left py-3 px-4 text-sm font-semibold text-gray-700">Price</th>
                    <th className="text-left py-3 px-4 text-sm font-semibold text-gray-700">Status</th>
                    <th className="text-left py-3 px-4 text-sm font-semibold text-gray-700">Actions</th>
                  </tr>
                </thead>
                <tbody>
                  {filteredPlans.map((plan) => (
                    <tr key={plan.id} className="border-b border-gray-100 hover:bg-gray-50 transition-colors">
                      <td className="py-4 px-4">
                        <div className="flex flex-col">
                          <span className="text-sm font-semibold text-gray-900">{plan.plan_name}</span>
                          {plan.description && (
                            <span className="text-xs text-gray-500 line-clamp-1">{plan.description}</span>
                          )}
                          {plan.ift_number && (
                            <span className="text-xs text-gray-500 font-mono">IFT: {plan.ift_number}</span>
                          )}
                        </div>
                      </td>
                      <td className="py-4 px-4">
                        <div className="text-sm text-gray-900">
                          {plan.high_priority_data_mb !== null && (
                            <div>
                              <span className="font-medium">HP:</span>{' '}
                              {formatDataAmount(plan.high_priority_data_mb)}
                            </div>
                          )}
                          {plan.general_data_mb !== null && (
                            <div>
                              <span className="font-medium">Gen:</span> {formatDataAmount(plan.general_data_mb)}
                            </div>
                          )}
                          {plan.low_priority_data_mb !== null && (
                            <div>
                              <span className="font-medium">LP:</span> {formatDataAmount(plan.low_priority_data_mb)}
                            </div>
                          )}
                          {plan.high_priority_data_mb === null &&
                            plan.general_data_mb === null &&
                            plan.low_priority_data_mb === null && <span className="text-muted-foreground">No data</span>}
                        </div>
                      </td>
                      <td className="py-4 px-4">
                        <span className="text-sm text-gray-700">{formatMinutes(plan.voice_minutes)}</span>
                      </td>
                      <td className="py-4 px-4">
                        <span className="text-sm text-gray-700">{formatMessages(plan.sms_messages)}</span>
                      </td>
                      <td className="py-4 px-4">
                        <span className="text-sm font-semibold text-gray-900">{formatPrice(plan.prices)}</span>
                      </td>
                      <td className="py-4 px-4">
                        <Badge variant={statusColors[plan.plan_status] as any}>
                          {plan.plan_status.charAt(0).toUpperCase() + plan.plan_status.slice(1)}
                        </Badge>
                      </td>
                      <td className="py-4 px-4">
                        <div className="flex items-center gap-2">
                          <Button size="sm" asChild>
                            <Link to={`/plans/${plan.id}`}>
                              View
                            </Link>
                          </Button>
                          <Button
                            variant="outline"
                            size="sm"
                            onClick={() => handleOpenEditModal(plan)}
                          >
                            Edit
                          </Button>
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </CardContent>
      </Card>

      {/* Plan Modal */}
      <PlanModal isOpen={isPlanModalOpen} onClose={handleClosePlanModal} plan={selectedPlan} />
    </div>
  )
}
