import React, { useState, useEffect } from 'react'
import { Link, useLocation } from 'react-router-dom'

interface NavLink {
  label: string
  to: string
}

interface HeaderProps {
  logo: string
  logoImage?: string
  navLinks: NavLink[]
  showCTA?: boolean
  ctaText?: string
  ctaLink?: string
}

export const Header: React.FC<HeaderProps> = ({
  logo,
  logoImage,
  navLinks,
  showCTA = false,
  ctaText = 'Get Started',
  ctaLink = '/plans',
}) => {
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false)
  const [scrolled, setScrolled] = useState(false)
  const location = useLocation()

  useEffect(() => {
    const handleScroll = () => {
      setScrolled(window.scrollY > 10)
    }
    window.addEventListener('scroll', handleScroll)
    return () => window.removeEventListener('scroll', handleScroll)
  }, [])

  return (
    <header
      className={`sticky top-0 z-50 transition-all duration-300 ${
        scrolled
          ? 'bg-white/80 backdrop-blur-xl shadow-lg border-b border-gray-100'
          : 'bg-white/95 backdrop-blur-sm shadow-sm'
      }`}
    >
      <nav className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between items-center h-20">
          <div className="flex items-center">
            <Link to="/" className="flex items-center space-x-3 group">
              {logoImage ? (
                <img src={logoImage} alt={logo} className="h-10 w-auto transition-transform duration-300 group-hover:scale-105" />
              ) : (
                <span className="text-3xl font-bold bg-gradient-to-r from-primary-800 to-primary-600 bg-clip-text text-transparent">
                  {logo}
                </span>
              )}
            </Link>
          </div>

          <div className="hidden md:flex items-center space-x-1">
            {navLinks.map((link) => {
              const isActive = location.pathname === link.to
              return (
                <Link
                  key={link.to}
                  to={link.to}
                  className={`font-medium transition-all duration-200 px-4 py-2 rounded-lg ${
                    isActive
                      ? 'text-primary-800 bg-primary-50'
                      : 'text-gray-700 hover:text-primary-800 hover:bg-primary-50'
                  }`}
                >
                  {link.label}
                </Link>
              )
            })}
            {showCTA && (
              <Link
                to={ctaLink}
                className="ml-4 bg-gradient-to-r from-accent-400 to-accent-500 text-white px-6 py-3 rounded-xl font-semibold hover:from-accent-300 hover:to-accent-400 transition-all duration-300 shadow-lg hover:shadow-xl transform hover:scale-105"
              >
                {ctaText}
              </Link>
            )}
          </div>

          <div className="md:hidden">
            <button
              onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
              className="text-gray-700 hover:text-primary-800 p-2 rounded-lg hover:bg-primary-50 transition-colors"
              aria-label="Toggle menu"
            >
              <svg
                className="h-6 w-6"
                fill="none"
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth="2"
                viewBox="0 0 24 24"
                stroke="currentColor"
              >
                {mobileMenuOpen ? (
                  <path d="M6 18L18 6M6 6l12 12" />
                ) : (
                  <path d="M4 6h16M4 12h16M4 18h16" />
                )}
              </svg>
            </button>
          </div>
        </div>

        {mobileMenuOpen && (
          <div className="md:hidden py-4 border-t border-gray-100">
            <div className="flex flex-col space-y-2">
              {navLinks.map((link) => {
                const isActive = location.pathname === link.to
                return (
                  <Link
                    key={link.to}
                    to={link.to}
                    className={`font-medium transition-colors px-4 py-3 rounded-lg ${
                      isActive
                        ? 'text-primary-800 bg-primary-50'
                        : 'text-gray-700 hover:text-primary-800 hover:bg-primary-50'
                    }`}
                    onClick={() => setMobileMenuOpen(false)}
                  >
                    {link.label}
                  </Link>
                )
              })}
              {showCTA && (
                <Link
                  to={ctaLink}
                  className="mt-2 bg-gradient-to-r from-accent-400 to-accent-500 text-white px-6 py-3 rounded-xl font-semibold hover:from-accent-300 hover:to-accent-400 transition-all duration-300 text-center shadow-lg"
                  onClick={() => setMobileMenuOpen(false)}
                >
                  {ctaText}
                </Link>
              )}
            </div>
          </div>
        )}
      </nav>
    </header>
  )
}
