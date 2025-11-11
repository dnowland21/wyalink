import React from 'react'

interface CardProps {
  children: React.ReactNode
  className?: string
  hover?: boolean
  gradient?: boolean
}

export const Card: React.FC<CardProps> = ({ children, className = '', hover = false, gradient = false }) => {
  const baseStyles = 'bg-white rounded-2xl shadow-xl p-8 border border-gray-100/50'
  const hoverStyles = hover ? 'transition-all duration-300 hover:shadow-2xl hover:-translate-y-2 cursor-pointer' : ''
  const gradientStyles = gradient ? 'bg-gradient-to-br from-white via-white to-primary-50/30' : ''

  return (
    <div
      className={`${baseStyles} ${hoverStyles} ${gradientStyles} ${className}`}
    >
      {children}
    </div>
  )
}
