import { useState, useEffect } from 'react'
import { Link } from 'react-router-dom'
import { getLines, type Line, type LineType, type LineStatus } from '@wyalink/supabase-client'
import { Card, CardHeader, CardTitle, CardContent } from '../components/ui/card'
import { Badge } from '../components/ui/badge'
import { Button } from '../components/ui/button'
import { Input } from '../components/ui/input'
import { Search, Plus } from 'lucide-react'
import LineModal from '../components/LineModal'

const typeColors: Record<LineType, string> = {
  mobility: 'info',
  mifi: 'secondary',
  m2m: 'warning',
}

const statusColors: Record<LineStatus, string> = {
  initiating: 'default',
  pending: 'info',
  activated: 'success',
  paused: 'warning',
  deactivated: 'warning',
  terminated: 'error',
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

  // Modal state
  const [isModalOpen, setIsModalOpen] = useState(false)
  const [selectedLine, setSelectedLine] = useState<Line | null>(null)

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

  // Modal handlers
  const handleOpenCreateModal = () => {
    setSelectedLine(null)
    setIsModalOpen(true)
  }

  const handleOpenEditModal = (line: Line) => {
    setSelectedLine(line)
    setIsModalOpen(true)
  }

  const handleCloseModal = (shouldRefresh?: boolean) => {
    setIsModalOpen(false)
    setSelectedLine(null)
    if (shouldRefresh) {
      fetchLines()
    }
  }

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
          <CardContent className="p-6">
            <div className="text-sm text-muted-foreground">Total Lines</div>
            <div className="text-2xl font-bold mt-1">{stats.total}</div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-6">
            <div className="text-sm text-muted-foreground">Active</div>
            <div className="text-2xl font-bold text-success mt-1">{stats.activated}</div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-6">
            <div className="text-sm text-muted-foreground">Paused</div>
            <div className="text-2xl font-bold text-warning mt-1">{stats.paused}</div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-6">
            <div className="text-sm text-muted-foreground">Pending</div>
            <div className="text-2xl font-bold text-info mt-1">{stats.pending}</div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-6">
            <div className="text-sm text-muted-foreground">Mobility</div>
            <div className="text-2xl font-bold text-info mt-1">{stats.mobility}</div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-6">
            <div className="text-sm text-muted-foreground">MiFi</div>
            <div className="text-2xl font-bold text-secondary mt-1">{stats.mifi}</div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-6">
            <div className="text-sm text-muted-foreground">M2M</div>
            <div className="text-2xl font-bold text-warning mt-1">{stats.m2m}</div>
          </CardContent>
        </Card>
      </div>

      {/* Error Message */}
      {error && (
        <div className="bg-error-50 border border-error-200 rounded-lg p-4 mb-6">
          <p className="text-sm text-error-800">{error}</p>
        </div>
      )}

      {/* Lines Table */}
      <Card>
        <CardHeader>
          <div className="flex items-center justify-between">
            <CardTitle className="text-lg">All Lines</CardTitle>
            <div className="flex items-center gap-3">
              <div className="relative">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground pointer-events-none" />
                <Input
                  type="text"
                  placeholder="Search by phone number..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="w-64 pl-9"
                />
              </div>
              <select
                value={typeFilter}
                onChange={(e) => setTypeFilter(e.target.value)}
                className="text-sm border border-input rounded-md px-3 py-2 h-10 focus:outline-none focus:ring-2 focus:ring-ring"
              >
                <option value="all">All Types</option>
                <option value="mobility">Mobility</option>
                <option value="mifi">MiFi</option>
                <option value="m2m">M2M</option>
              </select>
              <select
                value={statusFilter}
                onChange={(e) => setStatusFilter(e.target.value)}
                className="text-sm border border-input rounded-md px-3 py-2 h-10 focus:outline-none focus:ring-2 focus:ring-ring"
              >
                <option value="all">All Status</option>
                <option value="activated">Activated</option>
                <option value="paused">Paused</option>
                <option value="pending">Pending</option>
                <option value="initiating">Initiating</option>
                <option value="deactivated">Deactivated</option>
                <option value="terminated">Terminated</option>
              </select>
              <Button onClick={handleOpenCreateModal}>
                <Plus className="h-4 w-4 mr-2" />
                Add Line
              </Button>
            </div>
          </div>
        </CardHeader>
        <CardContent>
          {loading ? (
            <div className="p-8 text-center text-muted-foreground">Loading lines...</div>
          ) : filteredLines.length === 0 ? (
            <div className="p-8 text-center text-muted-foreground">
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
                        <Badge variant={typeColors[line.type] as any}>
                          {line.type === 'mifi' ? 'MiFi' : line.type === 'm2m' ? 'M2M' : 'Mobility'}
                        </Badge>
                      </td>
                      <td className="py-4 px-4">
                        <Badge variant={statusColors[line.status] as any}>
                          {line.status.charAt(0).toUpperCase() + line.status.slice(1)}
                        </Badge>
                      </td>
                      <td className="py-4 px-4">
                        {line.customer_id ? (
                          <Link
                            to={`/customers/${line.customer_id}`}
                            className="text-sm text-primary hover:text-primary/80"
                          >
                            View Customer
                          </Link>
                        ) : (
                          <span className="text-sm text-muted-foreground">Unassigned</span>
                        )}
                      </td>
                      <td className="py-4 px-4">
                        {line.device_manufacturer && line.device_model ? (
                          <div className="text-sm text-gray-900">
                            {line.device_manufacturer} {line.device_model}
                          </div>
                        ) : (
                          <span className="text-sm text-muted-foreground">No device</span>
                        )}
                      </td>
                      <td className="py-4 px-4">
                        {line.active_sim_id ? (
                          <Link
                            to={`/sim-cards/${line.active_sim_id}`}
                            className="text-sm text-primary hover:text-primary/80 font-mono"
                          >
                            {line.active_sim_id.slice(0, 8)}...
                          </Link>
                        ) : (
                          <span className="text-sm text-muted-foreground">No SIM</span>
                        )}
                      </td>
                      <td className="py-4 px-4">
                        <span className="text-sm text-gray-600">{formatDate(line.last_consumption)}</span>
                      </td>
                      <td className="py-4 px-4">
                        <div className="flex items-center gap-2">
                          <Button
                            size="sm"
                            onClick={() => handleOpenEditModal(line)}
                          >
                            Edit
                          </Button>
                          <Button
                            variant="outline"
                            size="sm"
                            asChild
                          >
                            <Link to={`/lines/${line.id}`}>
                              View
                            </Link>
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

      {/* Line Modal */}
      <LineModal isOpen={isModalOpen} onClose={handleCloseModal} line={selectedLine} />
    </div>
  )
}
