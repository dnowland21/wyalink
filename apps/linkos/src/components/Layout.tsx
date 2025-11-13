import React, { useState, useEffect } from 'react'
import { Link, useLocation, useNavigate } from 'react-router-dom'
import { useAuth, useIsAdmin } from '@wyalink/supabase-client'
import { MdDashboard } from 'react-icons/md'
import {
  FaFunnelDollar,
  FaUsers,
  FaShoppingCart,
  FaStore,
  FaUserClock,
  FaCashRegister,
  FaHeadset,
  FaTicketAlt,
  FaSearchDollar,
  FaExclamationTriangle,
  FaFileInvoiceDollar,
  FaRedoAlt,
  FaFileInvoice,
  FaCreditCard,
  FaCogs,
  FaClipboardList,
  FaSimCard,
  FaBoxes,
  FaBuilding,
  FaTags,
  FaCog
} from 'react-icons/fa'

interface LayoutProps {
  children: React.ReactNode
}

interface NavItem {
  name: string
  path: string
  icon: React.ReactNode
  adminOnly?: boolean
}

interface NavGroup {
  name: string
  icon: React.ReactNode
  items: NavItem[]
}

type NavElement = NavItem | NavGroup

function isNavGroup(item: NavElement): item is NavGroup {
  return 'items' in item
}

const navStructure: NavElement[] = [
  // Top-level items
  {
    name: 'Insight',
    path: '/insight',
    icon: (
      <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 1536 1536" fill="currentColor">
        <path d="M 767.9375 1071.109375 C 698.308594 1071.109375 641.207031 1128.171875 641.207031 1197.839844 C 641.207031 1267.511719 698.308594 1324.574219 767.9375 1324.574219 C 837.570312 1324.574219 894.671875 1267.472656 894.671875 1197.839844 C 894.671875 1128.210938 837.570312 1071.109375 767.9375 1071.109375 Z M 767.9375 1071.109375 " />
        <path d="M 767.9375 770.828125 C 651.496094 770.828125 541.882812 816.503906 459.6875 897.5625 C 426.578125 930.667969 426.578125 984.316406 459.6875 1017.421875 C 475.667969 1033.40625 497.347656 1042.519531 520.203125 1042.519531 C 543.0625 1042.519531 564.738281 1033.367188 580.722656 1017.421875 C 630.953125 967.191406 697.167969 939.78125 767.976562 939.78125 C 838.785156 939.78125 906.101562 967.191406 956.332031 1017.421875 C 972.316406 1033.40625 993.992188 1042.519531 1016.851562 1042.519531 C 1039.707031 1042.519531 1061.347656 1033.367188 1077.371094 1017.421875 C 1110.476562 984.316406 1110.476562 930.667969 1077.371094 897.5625 C 994.03125 816.503906 884.421875 770.828125 767.976562 770.828125 Z M 767.9375 770.828125 " />
        <path d="M 1473.476562 503.691406 C 1285.085938 315.300781 1033.933594 211.421875 767.9375 211.421875 C 501.941406 211.421875 250.753906 314.199219 62.363281 502.554688 C 29.253906 535.660156 29.253906 589.308594 62.363281 622.414062 C 78.347656 638.398438 100.0625 647.511719 122.882812 647.511719 C 145.699219 647.511719 167.417969 638.359375 183.398438 622.414062 C 338.683594 467.128906 546.476562 381.515625 767.9375 381.515625 C 989.398438 381.515625 1197.191406 467.128906 1353.617188 623.554688 C 1369.601562 639.539062 1391.316406 648.648438 1414.136719 648.648438 C 1436.953125 648.648438 1458.671875 639.5 1474.65625 623.554688 C 1506.625 590.445312 1506.625 536.800781 1473.515625 503.691406 Z M 1473.476562 503.691406 " />
        <path d="M 767.9375 497.996094 C 578.40625 497.996094 400.304688 571.046875 265.597656 704.652344 C 249.613281 720.636719 240.503906 742.316406 240.503906 765.171875 C 240.503906 788.027344 249.652344 809.667969 265.597656 825.691406 C 281.582031 841.675781 303.261719 850.785156 326.117188 850.785156 C 348.972656 850.785156 370.652344 841.636719 386.636719 825.691406 C 488.238281 724.050781 624.121094 668.128906 767.976562 668.128906 C 911.832031 668.128906 1047.679688 724.050781 1149.277344 825.691406 C 1165.261719 841.675781 1186.941406 850.785156 1209.796875 850.785156 C 1232.652344 850.785156 1254.332031 841.636719 1270.316406 825.691406 C 1286.300781 809.707031 1295.414062 787.988281 1295.414062 765.171875 C 1295.414062 742.351562 1286.261719 720.636719 1270.316406 704.652344 C 1135.609375 572.222656 957.507812 497.996094 767.976562 497.996094 Z M 767.9375 497.996094 " />
      </svg>
    ),
  },
  {
    name: 'Dashboard',
    path: '/dashboard',
    icon: <MdDashboard />,
  },
  {
    name: 'Leads',
    path: '/leads',
    icon: <FaFunnelDollar />,
  },
  {
    name: 'Customers',
    path: '/customers',
    icon: <FaUsers />,
  },
  {
    name: 'Orders',
    path: '/orders',
    icon: <FaShoppingCart />,
  },

  // In Store Group
  {
    name: 'In Store',
    icon: <FaStore />,
    items: [
      {
        name: 'Queue',
        path: '/queue',
        icon: <FaUserClock />,
      },
      {
        name: 'POS',
        path: '/pos',
        icon: <FaCashRegister />,
      },
    ],
  },

  // Help Desk Group
  {
    name: 'Help Desk',
    icon: <FaHeadset />,
    items: [
      {
        name: 'Tickets',
        path: '/tickets',
        icon: <FaTicketAlt />,
      },
      {
        name: 'Investigations',
        path: '/investigations',
        icon: <FaSearchDollar />,
      },
      {
        name: 'Incidents',
        path: '/incidents',
        icon: <FaExclamationTriangle />,
      },
    ],
  },

  // Billing Group
  {
    name: 'Billing',
    icon: <FaFileInvoiceDollar />,
    items: [
      {
        name: 'Subscriptions',
        path: '/subscriptions',
        icon: <FaRedoAlt />,
      },
      {
        name: 'Invoices',
        path: '/invoices',
        icon: <FaFileInvoice />,
      },
      {
        name: 'Payments',
        path: '/payments',
        icon: <FaCreditCard />,
      },
    ],
  },

  // Operations Group
  {
    name: 'Operations',
    icon: <FaCogs />,
    items: [
      {
        name: 'Plans',
        path: '/plans',
        icon: <FaClipboardList />,
      },
      {
        name: 'SIM Cards',
        path: '/sim-cards',
        icon: <FaSimCard />,
      },
      {
        name: 'Inventory',
        path: '/inventory',
        icon: <FaBoxes />,
      },
      {
        name: 'Vendors',
        path: '/vendors',
        icon: <FaBuilding />,
      },
      {
        name: 'Promotions',
        path: '/promotions',
        icon: <FaTags />,
      },
    ],
  },

  // Settings (bottom)
  {
    name: 'Settings',
    path: '/settings',
    adminOnly: true,
    icon: <FaCog />,
  },
]

export default function Layout({ children }: LayoutProps) {
  const [sidebarCollapsed, setSidebarCollapsed] = useState(false)
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false)
  const [userMenuOpen, setUserMenuOpen] = useState(false)
  const [expandedGroups, setExpandedGroups] = useState<Record<string, boolean>>({})
  const location = useLocation()
  const navigate = useNavigate()
  const { user, profile, signOut, refreshProfile } = useAuth()
  const isAdmin = useIsAdmin()

  // Refresh profile data when component mounts
  useEffect(() => {
    refreshProfile()
  }, [])

  const handleSignOut = async () => {
    await signOut()
    navigate('/login')
  }

  const toggleGroup = (groupName: string) => {
    setExpandedGroups((prev) => ({
      ...prev,
      [groupName]: !prev[groupName],
    }))
  }

  // Check if any item in a group is active
  const isGroupActive = (group: NavGroup) => {
    return group.items.some((item) => location.pathname.startsWith(item.path))
  }

  // Filter nav items based on admin status
  const filterNavStructure = (structure: NavElement[]): NavElement[] => {
    return structure
      .map((item) => {
        if (isNavGroup(item)) {
          const filteredItems = item.items.filter((subItem) => !subItem.adminOnly || isAdmin)
          return filteredItems.length > 0 ? { ...item, items: filteredItems } : null
        }
        return !item.adminOnly || isAdmin ? item : null
      })
      .filter((item): item is NavElement => item !== null)
  }

  const visibleNavStructure = filterNavStructure(navStructure)

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Mobile sidebar backdrop */}
      {mobileMenuOpen && (
        <div
          className="fixed inset-0 bg-gray-900/50 backdrop-blur-sm z-40 lg:hidden transition-opacity"
          onClick={() => setMobileMenuOpen(false)}
        />
      )}

      {/* Sidebar */}
      <aside
        className={`fixed inset-y-0 left-0 z-50 bg-gradient-to-b from-primary-50 via-white to-secondary-50 border-r border-primary-100 shadow-lg transition-all duration-300 ease-in-out ${
          sidebarCollapsed ? 'w-20' : 'w-56'
        } ${mobileMenuOpen ? 'translate-x-0' : '-translate-x-full lg:translate-x-0'}`}
      >
        <div className="flex flex-col h-full">
          {/* Logo & Collapse Toggle */}
          <div className="h-16 flex items-center justify-between px-4 border-b border-primary-100 bg-white/50 backdrop-blur-sm">
            <div className="flex items-center gap-2 flex-1">
              {!sidebarCollapsed && (
                <img src="/logos/linkos-logo.svg" alt="LinkOS" className="h-8 w-auto" />
              )}
              {sidebarCollapsed && (
                <button
                  onClick={() => setSidebarCollapsed(false)}
                  className="mx-auto p-2 rounded-lg hover:bg-primary-50 transition-colors"
                  title="Expand sidebar"
                >
                  <img src="/logos/linkos-icon.svg" alt="LinkOS" className="h-12 w-12" />
                </button>
              )}
            </div>

            {/* Collapse Toggle (Desktop Only - Hidden when collapsed) */}
            {!sidebarCollapsed && (
              <button
                onClick={() => setSidebarCollapsed(true)}
                className="hidden lg:flex p-2 rounded-lg text-primary-600 hover:bg-primary-100 hover:text-primary-700 transition-colors"
                title="Collapse sidebar"
              >
                <svg
                  className="w-5 h-5"
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M11 19l-7-7 7-7m8 14l-7-7 7-7"
                  />
                </svg>
              </button>
            )}

            {/* Mobile Close Button */}
            <button
              onClick={() => setMobileMenuOpen(false)}
              className="lg:hidden text-gray-500 hover:text-gray-700 p-2 rounded-lg hover:bg-white"
            >
              <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
              </svg>
            </button>
          </div>

          {/* Navigation */}
          <nav className="flex-1 px-3 py-6 space-y-1 overflow-y-auto">
            {visibleNavStructure.map((element) => {
              if (isNavGroup(element)) {
                const group = element
                const isExpanded = expandedGroups[group.name] || isGroupActive(group)
                const groupActive = isGroupActive(group)

                return (
                  <div key={group.name}>
                    {/* Group Header */}
                    <button
                      onClick={() => !sidebarCollapsed && toggleGroup(group.name)}
                      className={`w-full flex items-center justify-between px-3 py-2.5 rounded-lg transition-all group ${
                        groupActive
                          ? 'bg-primary-50 text-primary-700'
                          : 'text-gray-700 hover:bg-white/80 hover:text-primary-700'
                      }`}
                      title={sidebarCollapsed ? group.name : undefined}
                    >
                      <div className="flex items-center">
                        <span
                          className={`flex-shrink-0 ${sidebarCollapsed ? 'text-2xl' : 'text-lg mr-3'} ${
                            groupActive ? 'text-primary-600' : 'text-secondary-500 group-hover:text-primary-600'
                          }`}
                        >
                          {group.icon}
                        </span>
                        {!sidebarCollapsed && (
                          <span className="font-medium text-sm">{group.name}</span>
                        )}
                      </div>
                      {!sidebarCollapsed && (
                        <svg
                          className={`w-4 h-4 transition-transform ${isExpanded ? 'rotate-180' : ''}`}
                          fill="none"
                          stroke="currentColor"
                          viewBox="0 0 24 24"
                        >
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
                        </svg>
                      )}
                    </button>

                    {/* Group Items */}
                    {!sidebarCollapsed && isExpanded && (
                      <div className="ml-4 mt-1 space-y-1 border-l-2 border-gray-200 pl-2">
                        {group.items.map((item) => {
                          const isActive = location.pathname === item.path
                          return (
                            <Link
                              key={item.path}
                              to={item.path}
                              onClick={() => setMobileMenuOpen(false)}
                              className={`flex items-center px-3 py-2 rounded-lg transition-all group text-sm ${
                                isActive
                                  ? 'bg-gradient-to-r from-primary-600 to-primary-700 text-white shadow-md'
                                  : 'text-gray-600 hover:bg-white/80 hover:text-primary-700 hover:shadow-sm'
                              }`}
                            >
                              <span
                                className={`flex-shrink-0 text-sm mr-2 ${
                                  isActive ? 'text-white' : 'text-secondary-400 group-hover:text-primary-600'
                                }`}
                              >
                                {item.icon}
                              </span>
                              <span>{item.name}</span>
                            </Link>
                          )
                        })}
                      </div>
                    )}
                  </div>
                )
              } else {
                // Regular nav item
                const item = element
                const isActive = location.pathname === item.path
                return (
                  <Link
                    key={item.path}
                    to={item.path}
                    onClick={() => setMobileMenuOpen(false)}
                    className={`flex items-center px-3 py-3 rounded-lg transition-all group ${
                      isActive
                        ? 'bg-gradient-to-r from-primary-600 to-primary-700 text-white shadow-md'
                        : 'text-gray-700 hover:bg-white/80 hover:text-primary-700 hover:shadow-sm'
                    }`}
                    title={sidebarCollapsed ? item.name : undefined}
                  >
                    <span
                      className={`flex-shrink-0 ${sidebarCollapsed ? 'text-2xl' : 'text-lg mr-3'} ${
                        isActive ? 'text-white' : 'text-secondary-500 group-hover:text-primary-600'
                      }`}
                    >
                      {item.icon}
                    </span>
                    {!sidebarCollapsed && <span className="font-medium text-sm">{item.name}</span>}
                    {sidebarCollapsed && isActive && (
                      <div className="absolute left-0 w-1 h-8 bg-white rounded-r shadow-sm"></div>
                    )}
                  </Link>
                )
              }
            })}
          </nav>
        </div>
      </aside>

      {/* Main Content */}
      <div className={`transition-all duration-300 ${sidebarCollapsed ? 'lg:pl-20' : 'lg:pl-56'}`}>
        {/* Header */}
        <header className="sticky top-0 z-30 bg-white border-b border-gray-200 shadow-sm">
          <div className="flex items-center justify-between h-16 px-6">
            {/* Left: Mobile menu & Search */}
            <div className="flex items-center flex-1 gap-4">
              <button
                onClick={() => setMobileMenuOpen(true)}
                className="lg:hidden text-gray-600 hover:text-gray-900 p-2 rounded-lg hover:bg-gray-100"
              >
                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M4 12h16M4 18h16" />
                </svg>
              </button>

              {/* Search Bar */}
              <div className="flex-1 max-w-md">
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
                    placeholder="Search..."
                    className="block w-full pl-10 pr-3 py-2 border border-gray-300 rounded-lg leading-5 bg-white placeholder-gray-500 focus:outline-none focus:placeholder-gray-400 focus:ring-2 focus:ring-primary-500 focus:border-transparent text-sm"
                  />
                </div>
              </div>
            </div>

            {/* Right: Notifications & User Menu */}
            <div className="flex items-center gap-2">
              {/* Notifications */}
              <button className="relative p-2 text-gray-600 hover:text-gray-900 rounded-lg hover:bg-gray-100 transition-colors">
                <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M15 17h5l-1.405-1.405A2.032 2.032 0 0118 14.158V11a6.002 6.002 0 00-4-5.659V5a2 2 0 10-4 0v.341C7.67 6.165 6 8.388 6 11v3.159c0 .538-.214 1.055-.595 1.436L4 17h5m6 0v1a3 3 0 11-6 0v-1m6 0H9"
                  />
                </svg>
                <span className="absolute top-1.5 right-1.5 w-2 h-2 bg-accent-400 rounded-full ring-2 ring-white"></span>
              </button>

              {/* User Menu */}
              <div className="relative ml-2">
                <button
                  onClick={() => setUserMenuOpen(!userMenuOpen)}
                  className="flex items-center gap-3 p-1.5 rounded-lg hover:bg-gray-100 transition-colors"
                >
                  <div className="flex items-center gap-3">
                    <div className="hidden sm:block text-right">
                      <p className="text-sm font-semibold text-gray-900">
                        {profile?.first_name && profile?.last_name
                          ? `${profile.first_name} ${profile.last_name}`
                          : 'User Account'}
                      </p>
                      <p className="text-xs text-gray-500 capitalize">{profile?.role || 'User'}</p>
                    </div>
                    <div className="w-9 h-9 bg-gradient-to-br from-primary-500 to-primary-700 rounded-lg flex items-center justify-center text-white font-semibold text-sm shadow-sm">
                      {profile?.first_name?.[0]?.toUpperCase() || user?.email?.[0]?.toUpperCase() || 'U'}
                    </div>
                  </div>
                  <svg
                    className={`w-4 h-4 text-gray-500 transition-transform ${userMenuOpen ? 'rotate-180' : ''}`}
                    fill="none"
                    stroke="currentColor"
                    viewBox="0 0 24 24"
                  >
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
                  </svg>
                </button>

                {/* User Dropdown */}
                {userMenuOpen && (
                  <>
                    <div className="fixed inset-0 z-40" onClick={() => setUserMenuOpen(false)}></div>
                    <div className="absolute right-0 mt-2 w-56 bg-white rounded-lg shadow-lg border border-gray-200 py-1 z-50">
                      <div className="px-4 py-3 border-b border-gray-100">
                        <p className="text-sm font-semibold text-gray-900">
                          {profile?.first_name && profile?.last_name
                            ? `${profile.first_name} ${profile.last_name}`
                            : 'User Account'}
                        </p>
                        <p className="text-xs text-gray-500 mt-0.5">{user?.email || 'user@wyalink.com'}</p>
                      </div>
                      <Link
                        to="/profile"
                        onClick={() => setUserMenuOpen(false)}
                        className="block px-4 py-2 text-sm text-gray-700 hover:bg-gray-100 transition-colors"
                      >
                        Profile Settings
                      </Link>
                      <a
                        href="#"
                        className="block px-4 py-2 text-sm text-gray-700 hover:bg-gray-100 transition-colors"
                      >
                        Preferences
                      </a>
                      <div className="border-t border-gray-100 mt-1 pt-1">
                        <button
                          onClick={handleSignOut}
                          className="block w-full text-left px-4 py-2 text-sm text-red-600 hover:bg-red-50 transition-colors"
                        >
                          Sign Out
                        </button>
                      </div>
                    </div>
                  </>
                )}
              </div>
            </div>
          </div>
        </header>

        {/* Page Content */}
        <main className="p-8">{children}</main>
      </div>
    </div>
  )
}
