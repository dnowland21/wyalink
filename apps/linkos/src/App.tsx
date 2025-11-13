import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom'
import { useAuth } from '@wyalink/supabase-client'
import Layout from './components/Layout'
import Dashboard from './pages/Dashboard'
import Leads from './pages/Leads'
import LeadProfile from './pages/LeadProfile'
import Customers from './pages/Customers'
import CustomerDetail from './pages/CustomerDetail'
import Plans from './pages/Plans'
import Inventory from './pages/Inventory'
import InventoryDetail from './pages/InventoryDetail'
import SimCards from './pages/SimCards'
import Lines from './pages/Lines'
import Quotes from './pages/Quotes'
import QuoteDetail from './pages/QuoteDetail'
import Subscriptions from './pages/Subscriptions'
import Promotions from './pages/Promotions'
import Vendors from './pages/Vendors'
import Login from './pages/Login'
import ProfileSettings from './pages/ProfileSettings'
import Settings from './pages/Settings'

function ProtectedRoute({ children }: { children: React.ReactNode }) {
  const { isAuthenticated, isLoading } = useAuth()

  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <div className="w-16 h-16 border-4 border-primary-600 border-t-transparent rounded-full animate-spin mx-auto mb-4"></div>
          <p className="text-gray-600">Loading...</p>
        </div>
      </div>
    )
  }

  if (!isAuthenticated) {
    return <Navigate to="/login" replace />
  }

  return <>{children}</>
}

function App() {
  return (
    <Router>
      <Routes>
        <Route path="/login" element={<Login />} />
        <Route
          path="*"
          element={
            <ProtectedRoute>
              <Layout>
                <Routes>
                  <Route path="/" element={<Dashboard />} />
                  <Route path="/dashboard" element={<Dashboard />} />
                  <Route path="/leads" element={<Leads />} />
                  <Route path="/leads/:id" element={<LeadProfile />} />
                  <Route path="/customers" element={<Customers />} />
                  <Route path="/customers/:id" element={<CustomerDetail />} />
                  <Route path="/plans" element={<Plans />} />
                  <Route path="/inventory" element={<Inventory />} />
                  <Route path="/inventory/:id" element={<InventoryDetail />} />
                  <Route path="/sim-cards" element={<SimCards />} />
                  <Route path="/lines" element={<Lines />} />
                  <Route path="/quotes" element={<Quotes />} />
                  <Route path="/quotes/:id" element={<QuoteDetail />} />
                  <Route path="/subscriptions" element={<Subscriptions />} />
                  <Route path="/promotions" element={<Promotions />} />
                  <Route path="/vendors" element={<Vendors />} />
                  <Route path="/profile" element={<ProfileSettings />} />
                  <Route path="/settings" element={<Settings />} />
                </Routes>
              </Layout>
            </ProtectedRoute>
          }
        />
      </Routes>
    </Router>
  )
}

export default App
