import { useState, useEffect } from 'react'
import { Link } from 'react-router-dom'
import { getSimCards, type SimCard, type SimType, type SimStatus } from '@wyalink/supabase-client'
import { Card, CardHeader, CardTitle, CardContent } from '../components/ui/card'
import { Badge } from '../components/ui/badge'
import { Button } from '../components/ui/button'
import { Input } from '../components/ui/input'
import { Search, Plus } from 'lucide-react'
import SimCardModal from '../components/SimCardModal'

const typeColors: Record<SimType, string> = {
  esim: 'secondary',
  psim: 'info',
}

const statusColors: Record<SimStatus, string> = {
  cold: 'default',
  warm: 'warning',
  hot: 'success',
  pending_swap: 'warning',
  swapped: 'info',
  deleted: 'error',
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

  // Modal state
  const [isModalOpen, setIsModalOpen] = useState(false)
  const [selectedSimCard, setSelectedSimCard] = useState<SimCard | null>(null)

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

  // Modal handlers
  const handleOpenCreateModal = () => {
    setSelectedSimCard(null)
    setIsModalOpen(true)
  }

  const handleOpenEditModal = (simCard: SimCard) => {
    setSelectedSimCard(simCard)
    setIsModalOpen(true)
  }

  const handleCloseModal = (shouldRefresh?: boolean) => {
    setIsModalOpen(false)
    setSelectedSimCard(null)
    if (shouldRefresh) {
      fetchSimCards()
    }
  }

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
          <CardContent className="p-6">
            <div className="text-sm text-muted-foreground">Total SIMs</div>
            <div className="text-2xl font-bold mt-1">{stats.total}</div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-6">
            <div className="text-sm text-muted-foreground">Cold</div>
            <div className="text-2xl font-bold text-muted-foreground mt-1">{stats.cold}</div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-6">
            <div className="text-sm text-muted-foreground">Warm</div>
            <div className="text-2xl font-bold text-warning mt-1">{stats.warm}</div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-6">
            <div className="text-sm text-muted-foreground">Hot</div>
            <div className="text-2xl font-bold text-success mt-1">{stats.hot}</div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-6">
            <div className="text-sm text-muted-foreground">eSIMs</div>
            <div className="text-2xl font-bold text-secondary mt-1">{stats.esim}</div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-6">
            <div className="text-sm text-muted-foreground">Physical SIMs</div>
            <div className="text-2xl font-bold text-info mt-1">{stats.psim}</div>
          </CardContent>
        </Card>
      </div>

      {/* Error Message */}
      {error && (
        <div className="bg-error-50 border border-error-200 rounded-lg p-4 mb-6">
          <p className="text-sm text-error-800">{error}</p>
        </div>
      )}

      {/* SIM Cards Table */}
      <Card>
        <CardHeader>
          <div className="flex items-center justify-between">
            <CardTitle className="text-lg">All SIM Cards</CardTitle>
            <div className="flex items-center gap-3">
              <div className="relative">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground pointer-events-none" />
                <Input
                  type="text"
                  placeholder="Search by ICCID, IMSI..."
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
                <option value="esim">eSIM</option>
                <option value="psim">Physical SIM</option>
              </select>
              <select
                value={statusFilter}
                onChange={(e) => setStatusFilter(e.target.value)}
                className="text-sm border border-input rounded-md px-3 py-2 h-10 focus:outline-none focus:ring-2 focus:ring-ring"
              >
                <option value="all">All Status</option>
                <option value="cold">Cold</option>
                <option value="warm">Warm</option>
                <option value="hot">Hot</option>
                <option value="pending_swap">Pending Swap</option>
                <option value="swapped">Swapped</option>
                <option value="deleted">Deleted</option>
              </select>
              <Button onClick={handleOpenCreateModal}>
                <Plus className="h-4 w-4 mr-2" />
                Add SIM
              </Button>
            </div>
          </div>
        </CardHeader>
        <CardContent>
          {loading ? (
            <div className="p-8 text-center text-muted-foreground">Loading SIM cards...</div>
          ) : filteredSimCards.length === 0 ? (
            <div className="p-8 text-center text-muted-foreground">
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
                        <Badge variant={typeColors[sim.type] as any}>
                          {sim.type === 'esim' ? 'eSIM' : 'pSIM'}
                        </Badge>
                      </td>
                      <td className="py-4 px-4">
                        <div className="flex flex-col gap-1">
                          <Badge variant={statusColors[sim.status] as any}>
                            {sim.status.charAt(0).toUpperCase() + sim.status.slice(1).replace('_', ' ')}
                          </Badge>
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
                          <span className="text-sm text-muted-foreground">-</span>
                        )}
                      </td>
                      <td className="py-4 px-4">
                        {sim.assigned_to ? (
                          <Link
                            to={`/customers/${sim.assigned_to}`}
                            className="text-sm text-primary hover:text-primary/80"
                          >
                            View Customer
                          </Link>
                        ) : (
                          <span className="text-sm text-muted-foreground">Unassigned</span>
                        )}
                      </td>
                      <td className="py-4 px-4">
                        {sim.line_id ? (
                          <Link
                            to={`/lines/${sim.line_id}`}
                            className="text-sm text-primary hover:text-primary/80"
                          >
                            View Line
                          </Link>
                        ) : (
                          <span className="text-sm text-muted-foreground">No line</span>
                        )}
                      </td>
                      <td className="py-4 px-4">
                        <span className="text-sm text-gray-600">{formatDate(sim.first_network_attachment)}</span>
                      </td>
                      <td className="py-4 px-4">
                        <div className="flex items-center gap-2">
                          <Button
                            size="sm"
                            onClick={() => handleOpenEditModal(sim)}
                          >
                            Edit
                          </Button>
                          <Button
                            variant="outline"
                            size="sm"
                            asChild
                          >
                            <Link to={`/sim-cards/${sim.id}`}>
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

      {/* Lifecycle Info */}
      <Card className="mt-6">
        <CardHeader>
          <CardTitle className="text-lg">SIM Lifecycle States</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div className="flex items-start gap-3">
              <Badge variant={statusColors.cold as any} className="mt-1">
                Cold
              </Badge>
              <div>
                <p className="text-sm text-gray-900 font-medium">New Inventory</p>
                <p className="text-xs text-gray-600">SIMs that have been received but not yet assigned to any customer</p>
              </div>
            </div>
            <div className="flex items-start gap-3">
              <Badge variant={statusColors.warm as any} className="mt-1">
                Warm
              </Badge>
              <div>
                <p className="text-sm text-gray-900 font-medium">Customer Assigned</p>
                <p className="text-xs text-gray-600">SIMs assigned to a customer but not yet activated on the network</p>
              </div>
            </div>
            <div className="flex items-start gap-3">
              <Badge variant={statusColors.hot as any} className="mt-1">
                Hot
              </Badge>
              <div>
                <p className="text-sm text-gray-900 font-medium">Network Active</p>
                <p className="text-xs text-gray-600">SIMs that are active and connected to the network</p>
              </div>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* SIM Card Modal */}
      <SimCardModal isOpen={isModalOpen} onClose={handleCloseModal} simCard={selectedSimCard} />
    </div>
  )
}
