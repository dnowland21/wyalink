import { useState, useEffect } from 'react'
import { Link } from 'react-router-dom'
import { getSimCards, type SimCard, type SimType, type SimStatus } from '@wyalink/supabase-client'
import { Card } from '@wyalink/ui'

const typeColors: Record<SimType, string> = {
  esim: 'bg-purple-100 text-purple-800',
  psim: 'bg-blue-100 text-blue-800',
}

const statusColors: Record<SimStatus, string> = {
  cold: 'bg-gray-100 text-gray-800',
  warm: 'bg-yellow-100 text-yellow-800',
  hot: 'bg-green-100 text-green-800',
  pending_swap: 'bg-orange-100 text-orange-800',
  swapped: 'bg-blue-100 text-blue-800',
  deleted: 'bg-red-100 text-red-800',
}

const statusDescriptions: Record<SimStatus, string> = {
  cold: 'New, unassigned',
  warm: 'Assigned to customer',
  hot: 'Active on network',
  pending_swap: 'Swap in progress',
  swapped: 'Replaced by new SIM',
  deleted: 'Deactivated',
}

export default function SimCards() {
  const [simCards, setSimCards] = useState<SimCard[]>([])
  const [filteredSimCards, setFilteredSimCards] = useState<SimCard[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  // Filters
  const [typeFilter, setTypeFilter] = useState<string>('all')
  const [statusFilter, setStatusFilter] = useState<string>('all')
  const [searchQuery, setSearchQuery] = useState('')

  // Stats
  const [stats, setStats] = useState({
    total: 0,
    cold: 0,
    warm: 0,
    hot: 0,
    esim: 0,
    psim: 0,
  })

  // Fetch SIM cards
  const fetchSimCards = async () => {
    setLoading(true)
    setError(null)

    try {
      const result = await getSimCards()

      if (result.error) throw result.error

      const simCardsData = result.data || []
      setSimCards(simCardsData)

      // Calculate stats
      setStats({
        total: simCardsData.length,
        cold: simCardsData.filter((s) => s.status === 'cold').length,
        warm: simCardsData.filter((s) => s.status === 'warm').length,
        hot: simCardsData.filter((s) => s.status === 'hot').length,
        esim: simCardsData.filter((s) => s.type === 'esim').length,
        psim: simCardsData.filter((s) => s.type === 'psim').length,
      })
    } catch (err: any) {
      setError('Failed to load SIM cards')
      console.error(err)
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    fetchSimCards()
  }, [])

  // Apply filters
  useEffect(() => {
    let filtered = [...simCards]

    // Type filter
    if (typeFilter !== 'all') {
      filtered = filtered.filter((sim) => sim.type === typeFilter)
    }

    // Status filter
    if (statusFilter !== 'all') {
      filtered = filtered.filter((sim) => sim.status === statusFilter)
    }

    // Search filter
    if (searchQuery) {
      const query = searchQuery.toLowerCase()
      filtered = filtered.filter(
        (sim) =>
          sim.iccid.toLowerCase().includes(query) ||
          sim.imsi?.some((imsi) => imsi.toLowerCase().includes(query)) ||
          sim.activation_code?.toLowerCase().includes(query) ||
          sim.manufacturer?.toLowerCase().includes(query)
      )
    }

    setFilteredSimCards(filtered)
  }, [simCards, typeFilter, statusFilter, searchQuery])

  const formatDate = (dateString: string | null) => {
    if (!dateString) return 'Never'
    return new Date(dateString).toLocaleDateString('en-US', {
      month: 'short',
      day: 'numeric',
      year: 'numeric',
    })
  }

  return (
    <div>
      {/* Header */}
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-gray-900">SIM Cards</h1>
        <p className="text-gray-600 mt-1">Manage SIM inventory and lifecycle</p>
      </div>

      {/* Stats Grid */}
      <div className="grid grid-cols-2 md:grid-cols-6 gap-4 mb-8">
        <Card>
          <div className="text-sm text-gray-600">Total SIMs</div>
          <div className="text-2xl font-bold text-gray-900 mt-1">{stats.total}</div>
        </Card>
        <Card>
          <div className="text-sm text-gray-600">Cold</div>
          <div className="text-2xl font-bold text-gray-600 mt-1">{stats.cold}</div>
        </Card>
        <Card>
          <div className="text-sm text-gray-600">Warm</div>
          <div className="text-2xl font-bold text-yellow-600 mt-1">{stats.warm}</div>
        </Card>
        <Card>
          <div className="text-sm text-gray-600">Hot</div>
          <div className="text-2xl font-bold text-green-600 mt-1">{stats.hot}</div>
        </Card>
        <Card>
          <div className="text-sm text-gray-600">eSIMs</div>
          <div className="text-2xl font-bold text-purple-600 mt-1">{stats.esim}</div>
        </Card>
        <Card>
          <div className="text-sm text-gray-600">Physical SIMs</div>
          <div className="text-2xl font-bold text-blue-600 mt-1">{stats.psim}</div>
        </Card>
      </div>

      {/* Error Message */}
      {error && (
        <div className="bg-red-50 border border-red-200 rounded-lg p-4 mb-6">
          <p className="text-sm text-red-800">{error}</p>
        </div>
      )}

      {/* SIM Cards Table */}
      <Card>
        <div className="flex items-center justify-between mb-6">
          <h3 className="text-lg font-semibold text-gray-900">All SIM Cards</h3>
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
                placeholder="Search by ICCID, IMSI..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="block w-64 pl-10 pr-3 py-2 border border-gray-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-primary-500 focus:border-transparent"
              />
            </div>
            <select
              value={typeFilter}
              onChange={(e) => setTypeFilter(e.target.value)}
              className="text-sm border border-gray-300 rounded-lg px-3 py-2 focus:outline-none focus:ring-2 focus:ring-primary-500"
            >
              <option value="all">All Types</option>
              <option value="esim">eSIM</option>
              <option value="psim">Physical SIM</option>
            </select>
            <select
              value={statusFilter}
              onChange={(e) => setStatusFilter(e.target.value)}
              className="text-sm border border-gray-300 rounded-lg px-3 py-2 focus:outline-none focus:ring-2 focus:ring-primary-500"
            >
              <option value="all">All Status</option>
              <option value="cold">Cold</option>
              <option value="warm">Warm</option>
              <option value="hot">Hot</option>
              <option value="pending_swap">Pending Swap</option>
              <option value="swapped">Swapped</option>
              <option value="deleted">Deleted</option>
            </select>
            <button className="px-4 py-2 bg-primary-600 text-white rounded-lg hover:bg-primary-700 transition-colors text-sm font-medium">
              + Add SIM
            </button>
          </div>
        </div>

        {loading ? (
          <div className="p-8 text-center text-gray-600">Loading SIM cards...</div>
        ) : filteredSimCards.length === 0 ? (
          <div className="p-8 text-center text-gray-600">
            {searchQuery || typeFilter !== 'all' || statusFilter !== 'all'
              ? 'No SIM cards found matching your filters'
              : 'No SIM cards yet'}
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead>
                <tr className="border-b border-gray-200">
                  <th className="text-left py-3 px-4 text-sm font-semibold text-gray-700">ICCID</th>
                  <th className="text-left py-3 px-4 text-sm font-semibold text-gray-700">Type</th>
                  <th className="text-left py-3 px-4 text-sm font-semibold text-gray-700">Status</th>
                  <th className="text-left py-3 px-4 text-sm font-semibold text-gray-700">IMSI</th>
                  <th className="text-left py-3 px-4 text-sm font-semibold text-gray-700">Assigned To</th>
                  <th className="text-left py-3 px-4 text-sm font-semibold text-gray-700">Line</th>
                  <th className="text-left py-3 px-4 text-sm font-semibold text-gray-700">Network Attach</th>
                  <th className="text-left py-3 px-4 text-sm font-semibold text-gray-700">Actions</th>
                </tr>
              </thead>
              <tbody>
                {filteredSimCards.map((sim) => (
                  <tr key={sim.id} className="border-b border-gray-100 hover:bg-gray-50 transition-colors">
                    <td className="py-4 px-4">
                      <div className="flex flex-col">
                        <span className="text-sm font-mono font-semibold text-gray-900">{sim.iccid}</span>
                        {sim.activation_code && (
                          <span className="text-xs text-gray-500">Code: {sim.activation_code}</span>
                        )}
                        {sim.manufacturer && (
                          <span className="text-xs text-gray-500">{sim.manufacturer}</span>
                        )}
                      </div>
                    </td>
                    <td className="py-4 px-4">
                      <span className={`px-2 py-1 rounded-full text-xs font-medium ${typeColors[sim.type]}`}>
                        {sim.type === 'esim' ? 'eSIM' : 'pSIM'}
                      </span>
                    </td>
                    <td className="py-4 px-4">
                      <div className="flex flex-col gap-1">
                        <span className={`px-2 py-1 rounded-full text-xs font-medium ${statusColors[sim.status]} w-fit`}>
                          {sim.status.charAt(0).toUpperCase() + sim.status.slice(1).replace('_', ' ')}
                        </span>
                        <span className="text-xs text-gray-500">{statusDescriptions[sim.status]}</span>
                      </div>
                    </td>
                    <td className="py-4 px-4">
                      {sim.imsi && sim.imsi.length > 0 ? (
                        <div className="text-xs font-mono text-gray-700">
                          {sim.imsi.map((imsi, idx) => (
                            <div key={idx}>{imsi}</div>
                          ))}
                        </div>
                      ) : (
                        <span className="text-sm text-gray-400">-</span>
                      )}
                    </td>
                    <td className="py-4 px-4">
                      {sim.assigned_to ? (
                        <Link
                          to={`/customers/${sim.assigned_to}`}
                          className="text-sm text-primary-600 hover:text-primary-700"
                        >
                          View Customer
                        </Link>
                      ) : (
                        <span className="text-sm text-gray-400">Unassigned</span>
                      )}
                    </td>
                    <td className="py-4 px-4">
                      {sim.line_id ? (
                        <Link
                          to={`/lines/${sim.line_id}`}
                          className="text-sm text-primary-600 hover:text-primary-700"
                        >
                          View Line
                        </Link>
                      ) : (
                        <span className="text-sm text-gray-400">No line</span>
                      )}
                    </td>
                    <td className="py-4 px-4">
                      <span className="text-sm text-gray-600">{formatDate(sim.first_network_attachment)}</span>
                    </td>
                    <td className="py-4 px-4">
                      <div className="flex items-center gap-2">
                        <Link
                          to={`/sim-cards/${sim.id}`}
                          className="px-3 py-1.5 text-sm bg-primary-600 text-white rounded-lg hover:bg-primary-700 transition-colors"
                        >
                          View
                        </Link>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </Card>

      {/* Lifecycle Info */}
      <Card className="mt-6">
        <h3 className="text-lg font-semibold text-gray-900 mb-4">SIM Lifecycle States</h3>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <div className="flex items-start gap-3">
            <div className={`px-3 py-1 rounded-full text-xs font-medium ${statusColors.cold} mt-1`}>Cold</div>
            <div>
              <p className="text-sm text-gray-900 font-medium">New Inventory</p>
              <p className="text-xs text-gray-600">SIMs that have been received but not yet assigned to any customer</p>
            </div>
          </div>
          <div className="flex items-start gap-3">
            <div className={`px-3 py-1 rounded-full text-xs font-medium ${statusColors.warm} mt-1`}>Warm</div>
            <div>
              <p className="text-sm text-gray-900 font-medium">Customer Assigned</p>
              <p className="text-xs text-gray-600">SIMs assigned to a customer but not yet activated on the network</p>
            </div>
          </div>
          <div className="flex items-start gap-3">
            <div className={`px-3 py-1 rounded-full text-xs font-medium ${statusColors.hot} mt-1`}>Hot</div>
            <div>
              <p className="text-sm text-gray-900 font-medium">Network Active</p>
              <p className="text-xs text-gray-600">SIMs that are active and connected to the network</p>
            </div>
          </div>
        </div>
      </Card>
    </div>
  )
}
