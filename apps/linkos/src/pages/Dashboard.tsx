import { useState, useEffect } from 'react'
import { Link } from 'react-router-dom'
import { Card, CardHeader, CardTitle, CardContent } from '../components/ui/card'
import { Users, Zap, DollarSign, TrendingUp, RefreshCw, Phone, FileText, Plus, Tag, User } from 'lucide-react'
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
      icon: Users,
      color: 'primary',
    },
    {
      label: 'Active Leads',
      value: stats.activeLeads.toLocaleString(),
      link: '/leads',
      icon: Zap,
      color: 'secondary',
    },
    {
      label: 'Monthly Revenue',
      value: formatCurrency(stats.monthlyRevenue),
      link: '/subscriptions',
      icon: DollarSign,
      color: 'primary',
    },
    {
      label: 'Conversion Rate',
      value: `${stats.conversionRate.toFixed(1)}%`,
      link: '/leads',
      icon: TrendingUp,
      color: 'secondary',
    },
  ]

  if (loading) {
    return (
      <div className="p-8 text-center">
        <div className="w-16 h-16 border-4 border-primary border-t-transparent rounded-full animate-spin mx-auto mb-4"></div>
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
        {statsData.map((stat, index) => {
          const Icon = stat.icon
          return (
            <Link key={index} to={stat.link}>
              <Card className="relative overflow-hidden hover:shadow-lg transition-shadow cursor-pointer">
                <CardContent className="p-6">
                  <div className="flex items-start justify-between">
                    <div>
                      <p className="text-sm font-medium text-muted-foreground mb-1">{stat.label}</p>
                      <h3 className="text-3xl font-bold mb-2">{stat.value}</h3>
                    </div>
                    <div
                      className={`w-14 h-14 rounded-xl flex items-center justify-center ${
                        stat.color === 'primary'
                          ? 'bg-primary/10 text-primary'
                          : 'bg-secondary/10 text-secondary'
                      }`}
                    >
                      <Icon className="w-7 h-7" />
                    </div>
                  </div>
                </CardContent>
              </Card>
            </Link>
          )
        })}
      </div>

      {/* Secondary Stats */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
        <Link to="/subscriptions">
          <Card className="hover:shadow-lg transition-shadow cursor-pointer">
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-muted-foreground mb-1">Active Subscriptions</p>
                  <h3 className="text-2xl font-bold">{stats.activeSubscriptions}</h3>
                </div>
                <div className="w-12 h-12 rounded-lg bg-success/10 text-success flex items-center justify-center">
                  <RefreshCw className="w-6 h-6" />
                </div>
              </div>
            </CardContent>
          </Card>
        </Link>
        <Link to="/lines">
          <Card className="hover:shadow-lg transition-shadow cursor-pointer">
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-muted-foreground mb-1">Active Lines</p>
                  <h3 className="text-2xl font-bold">{stats.activeLines}</h3>
                </div>
                <div className="w-12 h-12 rounded-lg bg-info/10 text-info flex items-center justify-center">
                  <Phone className="w-6 h-6" />
                </div>
              </div>
            </CardContent>
          </Card>
        </Link>
        <Link to="/quotes">
          <Card className="hover:shadow-lg transition-shadow cursor-pointer">
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-muted-foreground mb-1">Pending Quotes</p>
                  <h3 className="text-2xl font-bold">{stats.pendingQuotes}</h3>
                </div>
                <div className="w-12 h-12 rounded-lg bg-warning/10 text-warning flex items-center justify-center">
                  <FileText className="w-6 h-6" />
                </div>
              </div>
            </CardContent>
          </Card>
        </Link>
      </div>

      <div className="grid grid-cols-1 xl:grid-cols-3 gap-6 mb-8">
        {/* Quick Actions */}
        <Card className="xl:col-span-2">
          <CardHeader>
            <CardTitle className="text-lg">Quick Actions</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
              <Link
                to="/leads"
                className="p-4 bg-gradient-to-br from-info-50 to-info-100 rounded-lg hover:shadow-md transition-all group"
              >
                <div className="w-12 h-12 bg-info rounded-lg flex items-center justify-center mb-3 group-hover:scale-110 transition-transform">
                  <Plus className="w-6 h-6 text-white" />
                </div>
                <p className="text-sm font-semibold text-gray-900">New Lead</p>
              </Link>
              <Link
                to="/customers"
                className="p-4 bg-gradient-to-br from-success-50 to-success-100 rounded-lg hover:shadow-md transition-all group"
              >
                <div className="w-12 h-12 bg-success rounded-lg flex items-center justify-center mb-3 group-hover:scale-110 transition-transform">
                  <Plus className="w-6 h-6 text-white" />
                </div>
                <p className="text-sm font-semibold text-gray-900">New Customer</p>
              </Link>
              <Link
                to="/quotes"
                className="p-4 bg-gradient-to-br from-warning-50 to-warning-100 rounded-lg hover:shadow-md transition-all group"
              >
                <div className="w-12 h-12 bg-warning rounded-lg flex items-center justify-center mb-3 group-hover:scale-110 transition-transform">
                  <Plus className="w-6 h-6 text-white" />
                </div>
                <p className="text-sm font-semibold text-gray-900">Create Quote</p>
              </Link>
              <Link
                to="/promotions"
                className="p-4 bg-gradient-to-br from-accent-50 to-accent-100 rounded-lg hover:shadow-md transition-all group"
              >
                <div className="w-12 h-12 bg-accent rounded-lg flex items-center justify-center mb-3 group-hover:scale-110 transition-transform">
                  <Tag className="w-6 h-6 text-white" />
                </div>
                <p className="text-sm font-semibold text-gray-900">New Promo</p>
              </Link>
            </div>
          </CardContent>
        </Card>

        {/* Top Plans */}
        <Card>
          <CardHeader>
            <div className="flex items-center justify-between">
              <CardTitle className="text-lg">Top Plans</CardTitle>
              <Link to="/plans" className="text-sm text-primary hover:text-primary/80">
                View all
              </Link>
            </div>
          </CardHeader>
          <CardContent>
            {topPlans.length === 0 ? (
              <p className="text-sm text-muted-foreground text-center py-8">No plan data available</p>
            ) : (
              <div className="space-y-6">
                {topPlans.map((plan, index) => (
                  <div key={index}>
                    <div className="flex items-center justify-between mb-2">
                      <span className="text-sm font-medium">{plan.name}</span>
                      <span className="text-sm font-semibold text-muted-foreground">{plan.customers}</span>
                    </div>
                    <div className="w-full bg-muted rounded-full h-2">
                      <div
                        className={`h-2 rounded-full ${
                          index === 0
                            ? 'bg-primary'
                            : index === 1
                            ? 'bg-secondary'
                            : index === 2
                            ? 'bg-primary/60'
                            : 'bg-muted-foreground'
                        }`}
                        style={{ width: `${plan.percentage}%` }}
                      ></div>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </CardContent>
        </Card>
      </div>

      {/* Recent Activity */}
      <Card>
        <CardHeader>
          <CardTitle className="text-lg">Recent Activity</CardTitle>
        </CardHeader>
        <CardContent>
          {recentActivity.length === 0 ? (
            <p className="text-sm text-muted-foreground text-center py-8">No recent activity</p>
          ) : (
            <div className="space-y-4">
              {recentActivity.map((activity, index) => (
                <div key={index} className="flex items-start gap-4 pb-4 border-b last:border-0 last:pb-0">
                  <div
                    className={`w-10 h-10 rounded-lg flex items-center justify-center flex-shrink-0 ${
                      activity.type === 'customer'
                        ? 'bg-primary/10 text-primary'
                        : 'bg-secondary/10 text-secondary'
                    }`}
                  >
                    {activity.type === 'customer' ? (
                      <User className="w-5 h-5" />
                    ) : (
                      <Zap className="w-5 h-5" />
                    )}
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="text-sm font-semibold">{activity.name}</p>
                    <p className="text-sm text-muted-foreground mt-0.5">{activity.action}</p>
                  </div>
                  <span className="text-xs text-muted-foreground flex-shrink-0">{activity.time}</span>
                </div>
              ))}
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  )
}
