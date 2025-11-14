import { useState, useEffect } from 'react'
import { Link } from 'react-router-dom'
import { getLeads, getLeadStats, type Lead, type LeadStatus } from '@wyalink/supabase-client'
import { Card } from '@wyalink/ui'
import LeadModal from '../components/LeadModal'
import ConvertLeadModal from '../components/ConvertLeadModal'
import QuoteModal from '../components/QuoteModal'

const statusColors: Record<LeadStatus, string> = {
  new: 'bg-blue-100 text-blue-800',
  contacted: 'bg-yellow-100 text-yellow-800',
  qualified: 'bg-purple-100 text-purple-800',
  converted: 'bg-green-100 text-green-800',
  lost: 'bg-gray-100 text-gray-800',
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
          <div className="text-sm text-gray-600">Total</div>
          <div className="text-2xl font-bold text-gray-900 mt-1">{stats.total}</div>
        </Card>
        <Card>
          <div className="text-sm text-gray-600">New</div>
          <div className="text-2xl font-bold text-blue-600 mt-1">{stats.new}</div>
        </Card>
        <Card>
          <div className="text-sm text-gray-600">Contacted</div>
          <div className="text-2xl font-bold text-yellow-600 mt-1">{stats.contacted}</div>
        </Card>
        <Card>
          <div className="text-sm text-gray-600">Qualified</div>
          <div className="text-2xl font-bold text-purple-600 mt-1">{stats.qualified}</div>
        </Card>
        <Card>
          <div className="text-sm text-gray-600">Converted</div>
          <div className="text-2xl font-bold text-green-600 mt-1">{stats.converted}</div>
        </Card>
        <Card>
          <div className="text-sm text-gray-600">Lost</div>
          <div className="text-2xl font-bold text-gray-600 mt-1">{stats.lost}</div>
        </Card>
      </div>

      {/* Error Message */}
      {error && (
        <div className="bg-red-50 border border-red-200 rounded-lg p-4 mb-6">
          <p className="text-sm text-red-800">{error}</p>
        </div>
      )}

      {/* Leads Table */}
      <Card>
        <div className="flex items-center justify-between mb-6">
          <h3 className="text-lg font-semibold text-gray-900">All Leads</h3>
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
                placeholder="Search leads..."
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
              <option value="new">New</option>
              <option value="contacted">Contacted</option>
              <option value="qualified">Qualified</option>
              <option value="converted">Converted</option>
              <option value="lost">Lost</option>
            </select>
            <button
              onClick={handleCreateLead}
              className="px-4 py-2 bg-primary-800 text-white rounded-lg hover:bg-primary-700 transition-colors text-sm font-medium"
            >
              + Add Lead
            </button>
          </div>
        </div>

        {loading ? (
          <div className="p-8 text-center text-gray-600">Loading leads...</div>
        ) : filteredLeads.length === 0 ? (
          <div className="p-8 text-center text-gray-600">
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
                      <span className={`px-3 py-1 rounded-full text-xs font-medium ${statusColors[lead.status]}`}>
                        {lead.status.charAt(0).toUpperCase() + lead.status.slice(1)}
                      </span>
                    </td>
                    <td className="py-4 px-4">
                      <span className="text-sm text-gray-700">{lead.source || '-'}</span>
                    </td>
                    <td className="py-4 px-4">
                      <span className="text-sm text-gray-600">{formatDate(lead.created_at)}</span>
                    </td>
                    <td className="py-4 px-4">
                      <div className="flex items-center gap-2">
                        <Link
                          to={`/leads/${lead.id}`}
                          className="p-2 text-gray-500 hover:text-primary-600 hover:bg-primary-50 rounded-lg transition-colors"
                          title="View Profile"
                        >
                          <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path
                              strokeLinecap="round"
                              strokeLinejoin="round"
                              strokeWidth={2}
                              d="M15 12a3 3 0 11-6 0 3 3 0 016 0z"
                            />
                            <path
                              strokeLinecap="round"
                              strokeLinejoin="round"
                              strokeWidth={2}
                              d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z"
                            />
                          </svg>
                        </Link>
                        <button
                          onClick={() => handleEditLead(lead)}
                          className="p-2 text-gray-500 hover:text-primary-600 hover:bg-primary-50 rounded-lg transition-colors"
                          title="Quick Edit"
                        >
                          <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path
                              strokeLinecap="round"
                              strokeLinejoin="round"
                              strokeWidth={2}
                              d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z"
                            />
                          </svg>
                        </button>
                        <button
                          onClick={() => handleCreateQuote(lead)}
                          className="p-2 text-gray-500 hover:text-blue-600 hover:bg-blue-50 rounded-lg transition-colors"
                          title="Create Quote"
                        >
                          <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path
                              strokeLinecap="round"
                              strokeLinejoin="round"
                              strokeWidth={2}
                              d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z"
                            />
                          </svg>
                        </button>
                        {lead.status !== 'converted' && (
                          <button
                            onClick={() => handleConvertLead(lead)}
                            className="p-2 text-gray-500 hover:text-green-600 hover:bg-green-50 rounded-lg transition-colors"
                            title="Convert to Customer"
                          >
                            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                              <path
                                strokeLinecap="round"
                                strokeLinejoin="round"
                                strokeWidth={2}
                                d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z"
                              />
                            </svg>
                          </button>
                        )}
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
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
