import { Card } from '@wyalink/ui'

export default function Dashboard() {
  const stats = [
    {
      label: 'Total Customers',
      value: '2,847',
      change: '+12.5%',
      trend: 'up',
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
      value: '486',
      change: '+8.2%',
      trend: 'up',
      icon: (
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 10V3L4 14h7v7l9-11h-7z" />
      ),
      color: 'secondary',
    },
    {
      label: 'Monthly Revenue',
      value: '$84,200',
      change: '+15.3%',
      trend: 'up',
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
      value: '68.4%',
      change: '+3.1%',
      trend: 'up',
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

  const recentActivity = [
    { type: 'customer', name: 'John Smith', action: 'New customer signed up', time: '5 min ago' },
    { type: 'lead', name: 'Sarah Johnson', action: 'Lead moved to qualified', time: '12 min ago' },
    { type: 'customer', name: 'Mike Davis', action: 'Upgraded to Premium plan', time: '1 hour ago' },
    { type: 'lead', name: 'Emily Wilson', action: 'New lead created', time: '2 hours ago' },
    { type: 'customer', name: 'David Brown', action: 'Support ticket resolved', time: '3 hours ago' },
  ]

  const topPlans = [
    { name: 'Unlimited', customers: 1243, percentage: 44 },
    { name: 'Plus', customers: 982, percentage: 34 },
    { name: 'Essential', customers: 622, percentage: 22 },
  ]

  return (
    <div>
      {/* Header */}
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-gray-900">Dashboard</h1>
        <p className="text-gray-600 mt-1">Welcome back! Here's what's happening with your business today.</p>
      </div>

      {/* Stats Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-4 gap-6 mb-8">
        {stats.map((stat, index) => (
          <Card key={index} className="relative overflow-hidden">
            <div className="flex items-start justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600 mb-1">{stat.label}</p>
                <h3 className="text-3xl font-bold text-gray-900 mb-2">{stat.value}</h3>
                <div className="flex items-center gap-1">
                  <span
                    className={`text-sm font-semibold ${
                      stat.trend === 'up' ? 'text-green-600' : 'text-red-600'
                    }`}
                  >
                    {stat.change}
                  </span>
                  <span className="text-sm text-gray-500">from last month</span>
                </div>
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
        ))}
      </div>

      <div className="grid grid-cols-1 xl:grid-cols-3 gap-6 mb-8">
        {/* Chart Placeholder */}
        <Card className="xl:col-span-2">
          <div className="flex items-center justify-between mb-6">
            <h3 className="text-lg font-semibold text-gray-900">Revenue Overview</h3>
            <select className="text-sm border border-gray-300 rounded-lg px-3 py-2 focus:outline-none focus:ring-2 focus:ring-primary-500">
              <option>Last 7 days</option>
              <option>Last 30 days</option>
              <option>Last 90 days</option>
            </select>
          </div>
          <div className="h-80 bg-gradient-to-br from-gray-50 to-gray-100 rounded-lg flex items-center justify-center border-2 border-dashed border-gray-300">
            <div className="text-center">
              <svg
                className="w-16 h-16 mx-auto text-gray-400 mb-4"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={1.5}
                  d="M7 12l3-3 3 3 4-4M8 21l4-4 4 4M3 4h18M4 4h16v12a1 1 0 01-1 1H5a1 1 0 01-1-1V4z"
                />
              </svg>
              <p className="text-gray-500 font-medium">Chart visualization coming soon</p>
            </div>
          </div>
        </Card>

        {/* Top Plans */}
        <Card>
          <h3 className="text-lg font-semibold text-gray-900 mb-6">Top Plans</h3>
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
                        : 'bg-primary-400'
                    }`}
                    style={{ width: `${plan.percentage}%` }}
                  ></div>
                </div>
              </div>
            ))}
          </div>
        </Card>
      </div>

      {/* Recent Activity */}
      <Card>
        <div className="flex items-center justify-between mb-6">
          <h3 className="text-lg font-semibold text-gray-900">Recent Activity</h3>
          <a href="#" className="text-sm font-medium text-primary-600 hover:text-primary-700">
            View all
          </a>
        </div>
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
      </Card>
    </div>
  )
}
