import { useState, useEffect } from 'react'
import { Link } from 'react-router-dom'
import { getLines, type Line, type LineType, type LineStatus } from '@wyalink/supabase-client'
import { Card } from '@wyalink/ui'

const typeColors: Record<LineType, string> = {
  mobility: 'bg-blue-100 text-blue-800',
  mifi: 'bg-purple-100 text-purple-800',
  m2m: 'bg-orange-100 text-orange-800',
}

const statusColors: Record<LineStatus, string> = {
  initiating: 'bg-gray-100 text-gray-800',
  pending: 'bg-blue-100 text-blue-800',
  activated: 'bg-green-100 text-green-800',
  paused: 'bg-yellow-100 text-yellow-800',
  deactivated: 'bg-orange-100 text-orange-800',
  terminated: 'bg-red-100 text-red-800',
}

export default function Lines() {
  const [lines, setLines] = useState<Line[]>([])
  const [filteredLines, setFilteredLines] = useState<Line[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  // Filters
  const [typeFilter, setTypeFilter] = useState<string>('all')
  const [statusFilter, setStatusFilter] = useState<string>('all')
  const [searchQuery, setSearchQuery] = useState('')

  // Stats
  const [stats, setStats] = useState({
    total: 0,
    activated: 0,
    paused: 0,
    pending: 0,
    mobility: 0,
    mifi: 0,
    m2m: 0,
  })

  // Fetch lines
  const fetchLines = async () => {
    setLoading(true)
    setError(null)

    try {
      const result = await getLines()

      if (result.error) throw result.error

      const linesData = result.data || []
      setLines(linesData)

      // Calculate stats
      setStats({
        total: linesData.length,
        activated: linesData.filter((l) => l.status === 'activated').length,
        paused: linesData.filter((l) => l.status === 'paused').length,
        pending: linesData.filter((l) => l.status === 'pending').length,
        mobility: linesData.filter((l) => l.type === 'mobility').length,
        mifi: linesData.filter((l) => l.type === 'mifi').length,
        m2m: linesData.filter((l) => l.type === 'm2m').length,
      })
    } catch (err: any) {
      setError('Failed to load lines')
      console.error(err)
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    fetchLines()
  }, [])

  // Apply filters
  useEffect(() => {
    let filtered = [...lines]

    // Type filter
    if (typeFilter !== 'all') {
      filtered = filtered.filter((line) => line.type === typeFilter)
    }

    // Status filter
    if (statusFilter !== 'all') {
      filtered = filtered.filter((line) => line.status === statusFilter)
    }

    // Search filter
    if (searchQuery) {
      const query = searchQuery.toLowerCase()
      filtered = filtered.filter(
        (line) =>
          line.phone_number.toLowerCase().includes(query) ||
          line.device_manufacturer?.toLowerCase().includes(query) ||
          line.device_model?.toLowerCase().includes(query) ||
          line.active_sim_id?.toLowerCase().includes(query)
      )
    }

    setFilteredLines(filtered)
  }, [lines, typeFilter, statusFilter, searchQuery])

  const formatDate = (dateString: string | null) => {
    if (!dateString) return 'N/A'
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
        <h1 className="text-3xl font-bold text-gray-900">Lines</h1>
        <p className="text-gray-600 mt-1">Manage mobile service lines</p>
      </div>

      {/* Stats Grid */}
      <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-7 gap-4 mb-8">
        <Card>
          <div className="text-sm text-gray-600">Total Lines</div>
          <div className="text-2xl font-bold text-gray-900 mt-1">{stats.total}</div>
        </Card>
        <Card>
          <div className="text-sm text-gray-600">Active</div>
          <div className="text-2xl font-bold text-green-600 mt-1">{stats.activated}</div>
        </Card>
        <Card>
          <div className="text-sm text-gray-600">Paused</div>
          <div className="text-2xl font-bold text-yellow-600 mt-1">{stats.paused}</div>
        </Card>
        <Card>
          <div className="text-sm text-gray-600">Pending</div>
          <div className="text-2xl font-bold text-blue-600 mt-1">{stats.pending}</div>
        </Card>
        <Card>
          <div className="text-sm text-gray-600">Mobility</div>
          <div className="text-2xl font-bold text-blue-600 mt-1">{stats.mobility}</div>
        </Card>
        <Card>
          <div className="text-sm text-gray-600">MiFi</div>
          <div className="text-2xl font-bold text-purple-600 mt-1">{stats.mifi}</div>
        </Card>
        <Card>
          <div className="text-sm text-gray-600">M2M</div>
          <div className="text-2xl font-bold text-orange-600 mt-1">{stats.m2m}</div>
        </Card>
      </div>

      {/* Error Message */}
      {error && (
        <div className="bg-red-50 border border-red-200 rounded-lg p-4 mb-6">
          <p className="text-sm text-red-800">{error}</p>
        </div>
      )}

      {/* Lines Table */}
      <Card>
        <div className="flex items-center justify-between mb-6">
          <h3 className="text-lg font-semibold text-gray-900">All Lines</h3>
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
                placeholder="Search by phone number..."
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
              <option value="mobility">Mobility</option>
              <option value="mifi">MiFi</option>
              <option value="m2m">M2M</option>
            </select>
            <select
              value={statusFilter}
              onChange={(e) => setStatusFilter(e.target.value)}
              className="text-sm border border-gray-300 rounded-lg px-3 py-2 focus:outline-none focus:ring-2 focus:ring-primary-500"
            >
              <option value="all">All Status</option>
              <option value="activated">Activated</option>
              <option value="paused">Paused</option>
              <option value="pending">Pending</option>
              <option value="initiating">Initiating</option>
              <option value="deactivated">Deactivated</option>
              <option value="terminated">Terminated</option>
            </select>
            <button className="px-4 py-2 bg-primary-600 text-white rounded-lg hover:bg-primary-700 transition-colors text-sm font-medium">
              + Add Line
            </button>
          </div>
        </div>

        {loading ? (
          <div className="p-8 text-center text-gray-600">Loading lines...</div>
        ) : filteredLines.length === 0 ? (
          <div className="p-8 text-center text-gray-600">
            {searchQuery || typeFilter !== 'all' || statusFilter !== 'all'
              ? 'No lines found matching your filters'
              : 'No lines yet'}
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead>
                <tr className="border-b border-gray-200">
                  <th className="text-left py-3 px-4 text-sm font-semibold text-gray-700">Phone Number</th>
                  <th className="text-left py-3 px-4 text-sm font-semibold text-gray-700">Type</th>
                  <th className="text-left py-3 px-4 text-sm font-semibold text-gray-700">Status</th>
                  <th className="text-left py-3 px-4 text-sm font-semibold text-gray-700">Customer</th>
                  <th className="text-left py-3 px-4 text-sm font-semibold text-gray-700">Device</th>
                  <th className="text-left py-3 px-4 text-sm font-semibold text-gray-700">SIM</th>
                  <th className="text-left py-3 px-4 text-sm font-semibold text-gray-700">Last Activity</th>
                  <th className="text-left py-3 px-4 text-sm font-semibold text-gray-700">Actions</th>
                </tr>
              </thead>
              <tbody>
                {filteredLines.map((line) => (
                  <tr key={line.id} className="border-b border-gray-100 hover:bg-gray-50 transition-colors">
                    <td className="py-4 px-4">
                      <span className="text-sm font-mono font-semibold text-gray-900">
                        {line.phone_number || 'Pending'}
                      </span>
                    </td>
                    <td className="py-4 px-4">
                      <span className={`px-2 py-1 rounded-full text-xs font-medium ${typeColors[line.type]}`}>
                        {line.type === 'mifi' ? 'MiFi' : line.type === 'm2m' ? 'M2M' : 'Mobility'}
                      </span>
                    </td>
                    <td className="py-4 px-4">
                      <span className={`px-2 py-1 rounded-full text-xs font-medium ${statusColors[line.status]}`}>
                        {line.status.charAt(0).toUpperCase() + line.status.slice(1)}
                      </span>
                    </td>
                    <td className="py-4 px-4">
                      {line.customer_id ? (
                        <Link
                          to={`/customers/${line.customer_id}`}
                          className="text-sm text-primary-600 hover:text-primary-700"
                        >
                          View Customer
                        </Link>
                      ) : (
                        <span className="text-sm text-gray-400">Unassigned</span>
                      )}
                    </td>
                    <td className="py-4 px-4">
                      {line.device_manufacturer && line.device_model ? (
                        <div className="text-sm text-gray-900">
                          {line.device_manufacturer} {line.device_model}
                        </div>
                      ) : (
                        <span className="text-sm text-gray-400">No device</span>
                      )}
                    </td>
                    <td className="py-4 px-4">
                      {line.active_sim_id ? (
                        <Link
                          to={`/sim-cards/${line.active_sim_id}`}
                          className="text-sm text-primary-600 hover:text-primary-700 font-mono"
                        >
                          {line.active_sim_id.slice(0, 8)}...
                        </Link>
                      ) : (
                        <span className="text-sm text-gray-400">No SIM</span>
                      )}
                    </td>
                    <td className="py-4 px-4">
                      <span className="text-sm text-gray-600">{formatDate(line.last_consumption)}</span>
                    </td>
                    <td className="py-4 px-4">
                      <div className="flex items-center gap-2">
                        <Link
                          to={`/lines/${line.id}`}
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
    </div>
  )
}
