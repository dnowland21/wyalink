import React from 'react'

interface ButtonProps extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: 'primary' | 'secondary' | 'accent' | 'outline' | 'ghost'
  size?: 'sm' | 'md' | 'lg' | 'xl'
  children: React.ReactNode
}

export const Button: React.FC<ButtonProps> = ({
  variant = 'primary',
  size = 'md',
  children,
  className = '',
  ...props
}) => {
  const baseStyles = 'font-semibold rounded-xl transition-all duration-300 focus:outline-none focus:ring-4 focus:ring-offset-2 disabled:opacity-50 disabled:cursor-not-allowed transform hover:scale-105 active:scale-95'

  const variantStyles = {
    primary: 'bg-gradient-to-r from-primary-700 to-primary-900 text-white hover:from-primary-600 hover:to-primary-800 shadow-lg hover:shadow-xl focus:ring-primary-500/50',
    secondary: 'bg-gradient-to-r from-secondary-400 to-secondary-500 text-white hover:from-secondary-300 hover:to-secondary-400 shadow-lg hover:shadow-xl focus:ring-secondary-400/50',
    accent: 'bg-gradient-to-r from-accent-400 to-accent-500 text-white hover:from-accent-300 hover:to-accent-400 shadow-lg hover:shadow-xl focus:ring-accent-400/50',
    outline: 'border-2 border-primary-800 text-primary-800 hover:bg-primary-800 hover:text-white focus:ring-primary-500/50 shadow-md hover:shadow-lg',
    ghost: 'text-primary-800 hover:bg-primary-50 focus:ring-primary-500/50',
  }

  const sizeStyles = {
    sm: 'px-4 py-2 text-sm',
    md: 'px-6 py-3 text-base',
    lg: 'px-8 py-4 text-lg',
    xl: 'px-10 py-5 text-xl',
  }

  return (
    <button
      className={`${baseStyles} ${variantStyles[variant]} ${sizeStyles[size]} ${className}`}
      {...props}
    >
      {children}
    </button>
  )
}
