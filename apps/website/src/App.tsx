import { BrowserRouter as Router, Routes, Route } from 'react-router-dom'
import { Header, Footer } from '@wyalink/ui'
import Home from './pages/Home'
import Plans from './pages/Plans'
import Coverage from './pages/Coverage'
import Support from './pages/Support'
import About from './pages/About'
import ProfileSettings from './pages/ProfileSettings'
import AuthButton from './components/AuthButton'

 const navLinks = [
   { label: 'Home', to: '/' },
   { label: 'Plans', to: '/plans' },
   { label: 'Coverage', to: '/coverage' },
   { label: 'Support', to: '/support' },
   { label: 'About', to: '/about' },
 ]

 const footerSections = [
   {
     title: 'Products',
     links: [
       { label: 'Mobile Plans', to: '/plans' },
       { label: 'Coverage Map', to: '/coverage' },
     ],
   },
   {
     title: 'Support',
     links: [
       { label: 'Help Center', to: '/support' },
       { label: 'Contact Us', to: '/support' },
     ],
   },
   {
     title: 'Company',
     links: [
       { label: 'About Us', to: '/about' },
       { label: 'Locations', to: '/about' },
     ],
   },
 ]

function App() {
  return (
    <Router>
      <div className="flex flex-col min-h-screen bg-gray-50">
        <Header
          logo="WyaLink"
          logoImage="/logos/wyalink-logo.svg"
          navLinks={navLinks}
          showCTA
          ctaText="View Plans"
          ctaLink="/plans"
          authButton={<AuthButton />}
        />
        <main className="flex-grow">
          <Routes>
            <Route path="/" element={<Home />} />
            <Route path="/plans" element={<Plans />} />
            <Route path="/coverage" element={<Coverage />} />
            <Route path="/support" element={<Support />} />
            <Route path="/about" element={<About />} />
            <Route path="/profile" element={<ProfileSettings />} />
          </Routes>
        </main>
        <Footer
          logo="WyaLink"
          logoImage="/logos/wyalink-logo-alt.svg"
          sections={footerSections}
          copyright="© 2025 WyaLink. All rights reserved."
        />
      </div>
    </Router>
  )
}

export default App
