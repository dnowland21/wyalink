import { useState, useEffect } from 'react'
import { Link } from 'react-router-dom'
import { Card } from '@wyalink/ui'
import {
  getCustomers,
  getLeads,
  getLeadStats,
  getSubscriptions,
  getQuotes,
  getLines,
} from '@wyalink/supabase-client'

export default function Dashboard() {
  const [loading, setLoading] = useState(true)
  const [stats, setStats] = useState({
    totalCustomers: 0,
    activeLeads: 0,
    monthlyRevenue: 0,
    conversionRate: 0,
    activeSubscriptions: 0,
    activeLines: 0,
    pendingQuotes: 0,
  })

  const [recentActivity, setRecentActivity] = useState<any[]>([])
  const [topPlans, setTopPlans] = useState<any[]>([])

  useEffect(() => {
    fetchDashboardData()
  }, [])

  const fetchDashboardData = async () => {
    setLoading(true)
    try {
      // Fetch all data in parallel
      const [customersRes, leadsRes, leadStatsRes, subscriptionsRes, quotesRes, linesRes] =
        await Promise.all([
          getCustomers(),
          getLeads(),
          getLeadStats(),
          getSubscriptions(),
          getQuotes({ status: 'sent' }),
          getLines(),
        ])

      const customers = customersRes.data || []
      const leads = leadsRes.data || []
      const leadStats = leadStatsRes.data
      const subscriptions = subscriptionsRes.data || []
      const quotes = quotesRes.data || []
      const lines = linesRes.data || []

      // Calculate stats
      const totalCustomers = customers.length
      const activeLeads = leadStats
        ? leadStats.new + leadStats.contacted + leadStats.qualified
        : leads.filter((l: any) => ['new', 'contacted', 'qualified'].includes(l.status)).length
      const activeSubscriptions = subscriptions.filter((s: any) => s.is_active).length
      const activeLines = lines.filter((l: any) => l.status === 'activated').length
      const pendingQuotes = quotes.length

      // Calculate monthly revenue from active subscriptions
      const monthlyRevenue = subscriptions
        .filter((s: any) => s.is_active)
        .reduce((sum: number, sub: any) => {
          // Assuming plan data is joined
          return sum + (sub.plan?.monthly_price || 0)
        }, 0)

      // Calculate conversion rate
      const conversionRate =
        leadStats && leadStats.total > 0 ? (leadStats.converted / leadStats.total) * 100 : 0

      setStats({
        totalCustomers,
        activeLeads,
        monthlyRevenue,
        conversionRate,
        activeSubscriptions,
        activeLines,
        pendingQuotes,
      })

      // Build recent activity from various sources
      const activities: Array<{
        type: string
        name: string
        action: string
        time: string
        timestamp: number
      }> = []

      // Recent customers (last 5)
      const recentCustomers = customers.slice(0, 5)
      recentCustomers.forEach((customer: any) => {
        activities.push({
          type: 'customer',
          name: `${customer.first_name} ${customer.last_name}`,
          action: 'New customer registered',
          time: getRelativeTime(customer.created_at),
          timestamp: new Date(customer.created_at).getTime(),
        })
      })

      // Recent leads (last 5)
      const recentLeads = leads.slice(0, 5)
      recentLeads.forEach((lead: any) => {
        activities.push({
          type: 'lead',
          name: lead.first_name || lead.email,
          action: `Lead status: ${lead.status}`,
          time: getRelativeTime(lead.created_at),
          timestamp: new Date(lead.created_at).getTime(),
        })
      })

      // Sort by timestamp and take top 10
      activities.sort((a, b) => b.timestamp - a.timestamp)
      setRecentActivity(activities.slice(0, 10))

      // Calculate top plans by subscription count
      const planSubscriptions: Record<string, { name: string; count: number }> = {}
      subscriptions.forEach((sub: any) => {
        if (sub.plan) {
          const planName = sub.plan.plan_name
          if (!planSubscriptions[planName]) {
            planSubscriptions[planName] = { name: planName, count: 0 }
          }
          planSubscriptions[planName].count++
        }
      })

      const sortedPlans = Object.values(planSubscriptions).sort((a, b) => b.count - a.count)
      const totalSubs = subscriptions.length
      const topPlansData = sortedPlans.slice(0, 5).map((plan) => ({
        name: plan.name,
        customers: plan.count,
        percentage: totalSubs > 0 ? (plan.count / totalSubs) * 100 : 0,
      }))

      setTopPlans(topPlansData)
    } catch (error) {
      console.error('Failed to load dashboard data:', error)
    } finally {
      setLoading(false)
    }
  }

  const getRelativeTime = (dateString: string) => {
    const date = new Date(dateString)
    const now = new Date()
    const diffMs = now.getTime() - date.getTime()
    const diffMins = Math.floor(diffMs / 60000)
    const diffHours = Math.floor(diffMs / 3600000)
    const diffDays = Math.floor(diffMs / 86400000)

    if (diffMins < 1) return 'just now'
    if (diffMins < 60) return `${diffMins} min${diffMins > 1 ? 's' : ''} ago`
    if (diffHours < 24) return `${diffHours} hour${diffHours > 1 ? 's' : ''} ago`
    if (diffDays < 7) return `${diffDays} day${diffDays > 1 ? 's' : ''} ago`
    return date.toLocaleDateString()
  }

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: 'USD',
      minimumFractionDigits: 0,
      maximumFractionDigits: 0,
    }).format(amount)
  }

  const statsData = [
    {
      label: 'Total Customers',
      value: stats.totalCustomers.toLocaleString(),
      link: '/customers',
      icon: (
        <path
          strokeLinecap="round"
          strokeLinejoin="round"
          strokeWidth={2}
          d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0zm6 3a2 2 0 11-4 0 2 2 0 014 0zM7 10a2 2 0 11-4 0 2 2 0 014 0z"
        />
      ),
      color: 'primary',
    },
    {
      label: 'Active Leads',
      value: stats.activeLeads.toLocaleString(),
      link: '/leads',
      icon: <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 10V3L4 14h7v7l9-11h-7z" />,
      color: 'secondary',
    },
    {
      label: 'Monthly Revenue',
      value: formatCurrency(stats.monthlyRevenue),
      link: '/subscriptions',
      icon: (
        <path
          strokeLinecap="round"
          strokeLinejoin="round"
          strokeWidth={2}
          d="M12 8c-1.657 0-3 .895-3 2s1.343 2 3 2 3 .895 3 2-1.343 2-3 2m0-8c1.11 0 2.08.402 2.599 1M12 8V7m0 1v8m0 0v1m0-1c-1.11 0-2.08-.402-2.599-1M21 12a9 9 0 11-18 0 9 9 0 0118 0z"
        />
      ),
      color: 'primary',
    },
    {
      label: 'Conversion Rate',
      value: `${stats.conversionRate.toFixed(1)}%`,
      link: '/leads',
      icon: (
        <path
          strokeLinecap="round"
          strokeLinejoin="round"
          strokeWidth={2}
          d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z"
        />
      ),
      color: 'secondary',
    },
  ]

  if (loading) {
    return (
      <div className="p-8 text-center">
        <div className="w-16 h-16 border-4 border-primary-600 border-t-transparent rounded-full animate-spin mx-auto mb-4"></div>
        <p className="text-gray-600">Loading dashboard...</p>
      </div>
    )
  }

  return (
    <div>
      {/* Header */}
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-gray-900">Dashboard</h1>
        <p className="text-gray-600 mt-1">Welcome back! Here's what's happening with your business today.</p>
      </div>

      {/* Stats Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-4 gap-6 mb-8">
        {statsData.map((stat, index) => (
          <Link key={index} to={stat.link}>
            <Card className="relative overflow-hidden hover:shadow-lg transition-shadow cursor-pointer">
              <div className="flex items-start justify-between">
                <div>
                  <p className="text-sm font-medium text-gray-600 mb-1">{stat.label}</p>
                  <h3 className="text-3xl font-bold text-gray-900 mb-2">{stat.value}</h3>
                </div>
                <div
                  className={`w-14 h-14 rounded-xl flex items-center justify-center ${
                    stat.color === 'primary'
                      ? 'bg-primary-50 text-primary-600'
                      : 'bg-secondary-50 text-secondary-600'
                  }`}
                >
                  <svg className="w-7 h-7" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    {stat.icon}
                  </svg>
                </div>
              </div>
            </Card>
          </Link>
        ))}
      </div>

      {/* Secondary Stats */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
        <Link to="/subscriptions">
          <Card className="hover:shadow-lg transition-shadow cursor-pointer">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600 mb-1">Active Subscriptions</p>
                <h3 className="text-2xl font-bold text-gray-900">{stats.activeSubscriptions}</h3>
              </div>
              <div className="w-12 h-12 rounded-lg bg-green-50 text-green-600 flex items-center justify-center">
                <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15"
                  />
                </svg>
              </div>
            </div>
          </Card>
        </Link>
        <Link to="/lines">
          <Card className="hover:shadow-lg transition-shadow cursor-pointer">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600 mb-1">Active Lines</p>
                <h3 className="text-2xl font-bold text-gray-900">{stats.activeLines}</h3>
              </div>
              <div className="w-12 h-12 rounded-lg bg-blue-50 text-blue-600 flex items-center justify-center">
                <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M3 5a2 2 0 012-2h3.28a1 1 0 01.948.684l1.498 4.493a1 1 0 01-.502 1.21l-2.257 1.13a11.042 11.042 0 005.516 5.516l1.13-2.257a1 1 0 011.21-.502l4.493 1.498a1 1 0 01.684.949V19a2 2 0 01-2 2h-1C9.716 21 3 14.284 3 6V5z"
                  />
                </svg>
              </div>
            </div>
          </Card>
        </Link>
        <Link to="/quotes">
          <Card className="hover:shadow-lg transition-shadow cursor-pointer">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600 mb-1">Pending Quotes</p>
                <h3 className="text-2xl font-bold text-gray-900">{stats.pendingQuotes}</h3>
              </div>
              <div className="w-12 h-12 rounded-lg bg-purple-50 text-purple-600 flex items-center justify-center">
                <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z"
                  />
                </svg>
              </div>
            </div>
          </Card>
        </Link>
      </div>

      <div className="grid grid-cols-1 xl:grid-cols-3 gap-6 mb-8">
        {/* Quick Actions */}
        <Card className="xl:col-span-2">
          <h3 className="text-lg font-semibold text-gray-900 mb-6">Quick Actions</h3>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            <Link
              to="/leads"
              className="p-4 bg-gradient-to-br from-blue-50 to-blue-100 rounded-lg hover:shadow-md transition-all group"
            >
              <div className="w-12 h-12 bg-blue-600 rounded-lg flex items-center justify-center mb-3 group-hover:scale-110 transition-transform">
                <svg className="w-6 h-6 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
                </svg>
              </div>
              <p className="text-sm font-semibold text-gray-900">New Lead</p>
            </Link>
            <Link
              to="/customers"
              className="p-4 bg-gradient-to-br from-green-50 to-green-100 rounded-lg hover:shadow-md transition-all group"
            >
              <div className="w-12 h-12 bg-green-600 rounded-lg flex items-center justify-center mb-3 group-hover:scale-110 transition-transform">
                <svg className="w-6 h-6 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
                </svg>
              </div>
              <p className="text-sm font-semibold text-gray-900">New Customer</p>
            </Link>
            <Link
              to="/quotes"
              className="p-4 bg-gradient-to-br from-purple-50 to-purple-100 rounded-lg hover:shadow-md transition-all group"
            >
              <div className="w-12 h-12 bg-purple-600 rounded-lg flex items-center justify-center mb-3 group-hover:scale-110 transition-transform">
                <svg className="w-6 h-6 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
                </svg>
              </div>
              <p className="text-sm font-semibold text-gray-900">Create Quote</p>
            </Link>
            <Link
              to="/promotions"
              className="p-4 bg-gradient-to-br from-orange-50 to-orange-100 rounded-lg hover:shadow-md transition-all group"
            >
              <div className="w-12 h-12 bg-orange-600 rounded-lg flex items-center justify-center mb-3 group-hover:scale-110 transition-transform">
                <svg className="w-6 h-6 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M7 7h.01M7 3h5c.512 0 1.024.195 1.414.586l7 7a2 2 0 010 2.828l-7 7a2 2 0 01-2.828 0l-7-7A1.994 1.994 0 013 12V7a4 4 0 014-4z"
                  />
                </svg>
              </div>
              <p className="text-sm font-semibold text-gray-900">New Promo</p>
            </Link>
          </div>
        </Card>

        {/* Top Plans */}
        <Card>
          <div className="flex items-center justify-between mb-6">
            <h3 className="text-lg font-semibold text-gray-900">Top Plans</h3>
            <Link to="/plans" className="text-sm text-primary-600 hover:text-primary-700">
              View all
            </Link>
          </div>
          {topPlans.length === 0 ? (
            <p className="text-sm text-gray-500 text-center py-8">No plan data available</p>
          ) : (
            <div className="space-y-6">
              {topPlans.map((plan, index) => (
                <div key={index}>
                  <div className="flex items-center justify-between mb-2">
                    <span className="text-sm font-medium text-gray-900">{plan.name}</span>
                    <span className="text-sm font-semibold text-gray-600">{plan.customers}</span>
                  </div>
                  <div className="w-full bg-gray-200 rounded-full h-2">
                    <div
                      className={`h-2 rounded-full ${
                        index === 0
                          ? 'bg-primary-600'
                          : index === 1
                          ? 'bg-secondary-500'
                          : index === 2
                          ? 'bg-primary-400'
                          : 'bg-gray-400'
                      }`}
                      style={{ width: `${plan.percentage}%` }}
                    ></div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </Card>
      </div>

      {/* Recent Activity */}
      <Card>
        <div className="flex items-center justify-between mb-6">
          <h3 className="text-lg font-semibold text-gray-900">Recent Activity</h3>
        </div>
        {recentActivity.length === 0 ? (
          <p className="text-sm text-gray-500 text-center py-8">No recent activity</p>
        ) : (
          <div className="space-y-4">
            {recentActivity.map((activity, index) => (
              <div key={index} className="flex items-start gap-4 pb-4 border-b border-gray-100 last:border-0 last:pb-0">
                <div
                  className={`w-10 h-10 rounded-lg flex items-center justify-center flex-shrink-0 ${
                    activity.type === 'customer'
                      ? 'bg-primary-50 text-primary-600'
                      : 'bg-secondary-50 text-secondary-600'
                  }`}
                >
                  <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    {activity.type === 'customer' ? (
                      <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        strokeWidth={2}
                        d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z"
                      />
                    ) : (
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 10V3L4 14h7v7l9-11h-7z" />
                    )}
                  </svg>
                </div>
                <div className="flex-1 min-w-0">
                  <p className="text-sm font-semibold text-gray-900">{activity.name}</p>
                  <p className="text-sm text-gray-600 mt-0.5">{activity.action}</p>
                </div>
                <span className="text-xs text-gray-500 flex-shrink-0">{activity.time}</span>
              </div>
            ))}
          </div>
        )}
      </Card>
    </div>
  )
}
