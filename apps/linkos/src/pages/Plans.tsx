import { useState, useEffect } from 'react'
import { Link } from 'react-router-dom'
import { getMVNOPlans, type MVNOPlan, type PlanStatus } from '@wyalink/supabase-client'
import { Card } from '@wyalink/ui'
import PlanModal from '../components/PlanModal'

const statusColors: Record<PlanStatus, string> = {
  active: 'bg-green-100 text-green-800',
  inactive: 'bg-gray-100 text-gray-800',
  archived: 'bg-red-100 text-red-800',
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
          <div className="text-sm text-gray-600">Total Plans</div>
          <div className="text-2xl font-bold text-gray-900 mt-1">{stats.total}</div>
        </Card>
        <Card>
          <div className="text-sm text-gray-600">Active</div>
          <div className="text-2xl font-bold text-green-600 mt-1">{stats.active}</div>
        </Card>
        <Card>
          <div className="text-sm text-gray-600">Inactive</div>
          <div className="text-2xl font-bold text-gray-600 mt-1">{stats.inactive}</div>
        </Card>
        <Card>
          <div className="text-sm text-gray-600">Archived</div>
          <div className="text-2xl font-bold text-red-600 mt-1">{stats.archived}</div>
        </Card>
      </div>

      {/* Error Message */}
      {error && (
        <div className="bg-red-50 border border-red-200 rounded-lg p-4 mb-6">
          <p className="text-sm text-red-800">{error}</p>
        </div>
      )}

      {/* Plans Table */}
      <Card>
        <div className="flex items-center justify-between mb-6">
          <h3 className="text-lg font-semibold text-gray-900">All Plans</h3>
          <div className="flex items-center gap-3">
            <div className="relative">
              <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                <svg className="h-5 w-5 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z"
                  />
                </svg>
              </div>
              <input
                type="text"
                placeholder="Search plans..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="block w-64 pl-10 pr-3 py-2 border border-gray-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-primary-500 focus:border-transparent"
              />
            </div>
            <select
              value={statusFilter}
              onChange={(e) => setStatusFilter(e.target.value)}
              className="text-sm border border-gray-300 rounded-lg px-3 py-2 focus:outline-none focus:ring-2 focus:ring-primary-500"
            >
              <option value="all">All Status</option>
              <option value="active">Active</option>
              <option value="inactive">Inactive</option>
              <option value="archived">Archived</option>
            </select>
            <button
              onClick={handleOpenCreateModal}
              className="px-4 py-2 bg-primary-600 text-white rounded-lg hover:bg-primary-700 transition-colors text-sm font-medium"
            >
              + Add Plan
            </button>
          </div>
        </div>

        {loading ? (
          <div className="p-8 text-center text-gray-600">Loading plans...</div>
        ) : filteredPlans.length === 0 ? (
          <div className="p-8 text-center text-gray-600">
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
                          plan.low_priority_data_mb === null && <span className="text-gray-500">No data</span>}
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
                      <span className={`px-3 py-1 rounded-full text-xs font-medium ${statusColors[plan.plan_status]}`}>
                        {plan.plan_status.charAt(0).toUpperCase() + plan.plan_status.slice(1)}
                      </span>
                    </td>
                    <td className="py-4 px-4">
                      <div className="flex items-center gap-2">
                        <Link
                          to={`/plans/${plan.id}`}
                          className="px-3 py-1.5 text-sm bg-primary-600 text-white rounded-lg hover:bg-primary-700 transition-colors"
                        >
                          View
                        </Link>
                        <button
                          onClick={() => handleOpenEditModal(plan)}
                          className="px-3 py-1.5 text-sm bg-gray-100 text-gray-700 rounded-lg hover:bg-gray-200 transition-colors"
                        >
                          Edit
                        </button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </Card>

      {/* Plan Modal */}
      <PlanModal isOpen={isPlanModalOpen} onClose={handleClosePlanModal} plan={selectedPlan} />
    </div>
  )
}
