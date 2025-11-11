import React from 'react'
import { Link } from 'react-router-dom'

interface FooterLink {
  label: string
  to: string
}

interface FooterSection {
  title: string
  links: FooterLink[]
}

interface FooterProps {
  logo: string
  logoImage?: string
  sections: FooterSection[]
  copyright?: string
}

export const Footer: React.FC<FooterProps> = ({
  logo,
  logoImage,
  sections,
  copyright = `© ${new Date().getFullYear()} All rights reserved.`,
}) => {
  return (
    <footer className="bg-gradient-to-b from-primary-900 to-primary-950 text-white">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-16">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-8">
          <div className="col-span-1">
            <div className="mb-4">
              {logoImage ? (
                <img src={logoImage} alt={logo} className="h-10 w-auto" />
              ) : (
                <span className="text-2xl font-bold">{logo}</span>
              )}
            </div>
            <p className="text-gray-300 text-sm leading-relaxed">
              Northeast Pennsylvania's community-first cellular carrier.
            </p>
          </div>

          {sections.map((section) => (
            <div key={section.title}>
              <h3 className="font-semibold text-lg mb-4">{section.title}</h3>
              <ul className="space-y-2">
                {section.links.map((link) => (
                  <li key={link.to}>
                    <Link
                      to={link.to}
                      className="text-gray-300 hover:text-white transition-colors text-sm"
                    >
                      {link.label}
                    </Link>
                  </li>
                ))}
              </ul>
            </div>
          ))}
        </div>

        <div className="border-t border-primary-700/50 mt-12 pt-8 text-center text-gray-300 text-sm">
          {copyright}
        </div>
      </div>
    </footer>
  )
}
