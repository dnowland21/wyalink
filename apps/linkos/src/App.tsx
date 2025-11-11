import { BrowserRouter as Router, Routes, Route } from 'react-router-dom'
import Login from './pages/Login'
// import Layout from './components/Layout'
// import Dashboard from './pages/Dashboard'
// import Leads from './pages/Leads'
// import Customers from './pages/Customers'

function App() {
  // TODO: Implement authentication logic
  // const isAuthenticated = false

  return (
    <Router>
      <Routes>
        {/* Login Page - Show until authentication is implemented */}
        <Route path="*" element={<Login />} />

        {/* TODO: Uncomment when authentication is ready */}
        {/* {isAuthenticated ? (
          <Route path="*" element={
            <Layout>
              <Routes>
                <Route path="/" element={<Dashboard />} />
                <Route path="/dashboard" element={<Dashboard />} />
                <Route path="/leads" element={<Leads />} />
                <Route path="/customers" element={<Customers />} />
              </Routes>
            </Layout>
          } />
        ) : (
          <Route path="*" element={<Login />} />
        )} */}
      </Routes>
    </Router>
  )
}

export default App
