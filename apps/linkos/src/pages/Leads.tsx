import { useState, useEffect } from 'react'
import { Link } from 'react-router-dom'
import { getLeads, getLeadStats, type Lead, type LeadStatus } from '@wyalink/supabase-client'
import { Card, CardHeader, CardTitle, CardContent } from '../components/ui/card'
import { Badge } from '../components/ui/badge'
import { Button } from '../components/ui/button'
import { Input } from '../components/ui/input'
import { Search, Plus, Eye, Edit, FileText, CheckCircle } from 'lucide-react'
import LeadModal from '../components/LeadModal'
import ConvertLeadModal from '../components/ConvertLeadModal'
import QuoteModal from '../components/QuoteModal'

const statusColors: Record<LeadStatus, string> = {
  new: 'info',
  contacted: 'warning',
  qualified: 'secondary',
  converted: 'success',
  lost: 'default',
}

export default function Leads() {
  const [leads, setLeads] = useState<Lead[]>([])
  const [filteredLeads, setFilteredLeads] = useState<Lead[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  // Filters
  const [statusFilter, setStatusFilter] = useState<string>('all')
  const [searchQuery, setSearchQuery] = useState('')

  // Stats
  const [stats, setStats] = useState({
    total: 0,
    new: 0,
    contacted: 0,
    qualified: 0,
    converted: 0,
    lost: 0,
  })

  // Modals
  const [isModalOpen, setIsModalOpen] = useState(false)
  const [isConvertModalOpen, setIsConvertModalOpen] = useState(false)
  const [isQuoteModalOpen, setIsQuoteModalOpen] = useState(false)
  const [selectedLead, setSelectedLead] = useState<Lead | null>(null)

  // Fetch leads and stats
  const fetchData = async () => {
    setLoading(true)
    setError(null)

    try {
      const [leadsResult, statsResult] = await Promise.all([getLeads(), getLeadStats()])

      if (leadsResult.error) throw leadsResult.error
      if (statsResult.error) throw statsResult.error

      setLeads(leadsResult.data || [])
      setStats(statsResult.data || stats)
    } catch (err) {
      setError('Failed to load leads')
      console.error(err)
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    fetchData()
  }, [])

  // Apply filters whenever leads, statusFilter, or searchQuery changes
  useEffect(() => {
    let filtered = [...leads]

    // Status filter
    if (statusFilter !== 'all') {
      filtered = filtered.filter((lead) => lead.status === statusFilter)
    }

    // Search filter
    if (searchQuery) {
      const query = searchQuery.toLowerCase()
      filtered = filtered.filter(
        (lead) =>
          lead.email.toLowerCase().includes(query) ||
          lead.first_name?.toLowerCase().includes(query) ||
          lead.last_name?.toLowerCase().includes(query) ||
          lead.company?.toLowerCase().includes(query)
      )
    }

    setFilteredLeads(filtered)
  }, [leads, statusFilter, searchQuery])

  const handleCreateLead = () => {
    setSelectedLead(null)
    setIsModalOpen(true)
  }

  const handleEditLead = (lead: Lead) => {
    setSelectedLead(lead)
    setIsModalOpen(true)
  }

  const handleModalClose = (shouldRefresh?: boolean) => {
    setIsModalOpen(false)
    setSelectedLead(null)
    if (shouldRefresh) {
      fetchData()
    }
  }

  const handleConvertLead = (lead: Lead) => {
    setSelectedLead(lead)
    setIsConvertModalOpen(true)
  }

  const handleConvertModalClose = (converted?: boolean) => {
    setIsConvertModalOpen(false)
    setSelectedLead(null)
    if (converted) {
      fetchData()
    }
  }

  const handleCreateQuote = (lead: Lead) => {
    setSelectedLead(lead)
    setIsQuoteModalOpen(true)
  }

  const handleQuoteModalClose = (shouldRefresh?: boolean) => {
    setIsQuoteModalOpen(false)
    setSelectedLead(null)
    if (shouldRefresh) {
      fetchData()
    }
  }

  const formatDate = (dateString: string) => {
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
        <h1 className="text-3xl font-bold text-gray-900">Leads</h1>
        <p className="text-gray-600 mt-1">Manage and track potential customers</p>
      </div>

      {/* Stats Grid */}
      <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-4 mb-8">
        <Card>
          <CardContent className="p-6">
            <div className="text-sm text-muted-foreground">Total</div>
            <div className="text-2xl font-bold mt-1">{stats.total}</div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-6">
            <div className="text-sm text-muted-foreground">New</div>
            <div className="text-2xl font-bold text-info mt-1">{stats.new}</div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-6">
            <div className="text-sm text-muted-foreground">Contacted</div>
            <div className="text-2xl font-bold text-warning mt-1">{stats.contacted}</div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-6">
            <div className="text-sm text-muted-foreground">Qualified</div>
            <div className="text-2xl font-bold text-secondary mt-1">{stats.qualified}</div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-6">
            <div className="text-sm text-muted-foreground">Converted</div>
            <div className="text-2xl font-bold text-success mt-1">{stats.converted}</div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-6">
            <div className="text-sm text-muted-foreground">Lost</div>
            <div className="text-2xl font-bold text-muted-foreground mt-1">{stats.lost}</div>
          </CardContent>
        </Card>
      </div>

      {/* Error Message */}
      {error && (
        <div className="bg-error-50 border border-error-200 rounded-lg p-4 mb-6">
          <p className="text-sm text-error-800">{error}</p>
        </div>
      )}

      {/* Leads Table */}
      <Card>
        <CardHeader>
          <div className="flex items-center justify-between">
            <CardTitle className="text-lg">All Leads</CardTitle>
            <div className="flex items-center gap-3">
              <div className="relative">
                <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                  <Search className="h-4 w-4 text-muted-foreground" />
                </div>
                <Input
                  type="text"
                  placeholder="Search leads..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="w-64 pl-10"
                />
              </div>
              <select
                value={statusFilter}
                onChange={(e) => setStatusFilter(e.target.value)}
                className="text-sm border border-gray-300 rounded-lg px-3 py-2 focus:outline-none focus:ring-2 focus:ring-primary-500"
              >
                <option value="all">All Status</option>
                <option value="new">New</option>
                <option value="contacted">Contacted</option>
                <option value="qualified">Qualified</option>
                <option value="converted">Converted</option>
                <option value="lost">Lost</option>
              </select>
              <Button onClick={handleCreateLead}>
                <Plus className="h-4 w-4 mr-2" />
                Add Lead
              </Button>
            </div>
          </div>
        </CardHeader>

        <CardContent>
          {loading ? (
            <div className="p-8 text-center text-muted-foreground">Loading leads...</div>
          ) : filteredLeads.length === 0 ? (
            <div className="p-8 text-center text-muted-foreground">
              {searchQuery || statusFilter !== 'all' ? 'No leads found matching your filters' : 'No leads yet'}
            </div>
          ) : (
            <div className="overflow-x-auto">
            <table className="w-full">
              <thead>
                <tr className="border-b border-gray-200">
                  <th className="text-left py-3 px-4 text-sm font-semibold text-gray-700">Name</th>
                  <th className="text-left py-3 px-4 text-sm font-semibold text-gray-700">Contact</th>
                  <th className="text-left py-3 px-4 text-sm font-semibold text-gray-700">Company</th>
                  <th className="text-left py-3 px-4 text-sm font-semibold text-gray-700">Status</th>
                  <th className="text-left py-3 px-4 text-sm font-semibold text-gray-700">Source</th>
                  <th className="text-left py-3 px-4 text-sm font-semibold text-gray-700">Created</th>
                  <th className="text-left py-3 px-4 text-sm font-semibold text-gray-700">Actions</th>
                </tr>
              </thead>
              <tbody>
                {filteredLeads.map((lead) => (
                  <tr key={lead.id} className="border-b border-gray-100 hover:bg-gray-50 transition-colors">
                    <td className="py-4 px-4">
                      <div className="flex items-center gap-3">
                        <div className="w-10 h-10 bg-gradient-to-br from-primary-500 to-primary-700 rounded-lg flex items-center justify-center text-white font-semibold text-sm">
                          {lead.first_name?.[0] || lead.last_name?.[0] || lead.email[0].toUpperCase()}
                        </div>
                        <div>
                          <p className="text-sm font-semibold text-gray-900">
                            {lead.first_name || lead.last_name
                              ? `${lead.first_name || ''} ${lead.last_name || ''}`.trim()
                              : '-'}
                          </p>
                          {lead.phone && <p className="text-xs text-gray-500">{lead.phone}</p>}
                        </div>
                      </div>
                    </td>
                    <td className="py-4 px-4">
                      <p className="text-sm text-gray-900">{lead.email}</p>
                    </td>
                    <td className="py-4 px-4">
                      <span className="text-sm text-gray-700">{lead.company || '-'}</span>
                    </td>
                    <td className="py-4 px-4">
                      <Badge variant={statusColors[lead.status] as any}>
                        {lead.status.charAt(0).toUpperCase() + lead.status.slice(1)}
                      </Badge>
                    </td>
                    <td className="py-4 px-4">
                      <span className="text-sm text-gray-700">{lead.source || '-'}</span>
                    </td>
                    <td className="py-4 px-4">
                      <span className="text-sm text-gray-600">{formatDate(lead.created_at)}</span>
                    </td>
                    <td className="py-4 px-4">
                      <div className="flex items-center gap-2">
                        <Button variant="ghost" size="sm" asChild>
                          <Link to={`/leads/${lead.id}`} title="View Profile">
                            <Eye className="w-4 h-4" />
                          </Link>
                        </Button>
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={() => handleEditLead(lead)}
                          title="Quick Edit"
                        >
                          <Edit className="w-4 h-4" />
                        </Button>
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={() => handleCreateQuote(lead)}
                          title="Create Quote"
                        >
                          <FileText className="w-4 h-4" />
                        </Button>
                        {lead.status !== 'converted' && (
                          <Button
                            variant="ghost"
                            size="sm"
                            onClick={() => handleConvertLead(lead)}
                            title="Convert to Customer"
                          >
                            <CheckCircle className="w-4 h-4" />
                          </Button>
                        )}
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

      {/* Lead Modal */}
      <LeadModal isOpen={isModalOpen} onClose={handleModalClose} lead={selectedLead} />

      {/* Convert Lead Modal */}
      <ConvertLeadModal isOpen={isConvertModalOpen} onClose={handleConvertModalClose} lead={selectedLead} />

      {/* Quote Modal */}
      <QuoteModal isOpen={isQuoteModalOpen} onClose={handleQuoteModalClose} preSelectedLeadId={selectedLead?.id} />
    </div>
  )
}
