/** @type {import('tailwindcss').Config} */
export default {
  content: [
    '../../apps/*/index.html',
    '../../apps/*/src/**/*.{js,ts,jsx,tsx}',
    '../../packages/ui/src/**/*.{js,ts,jsx,tsx}',
  ],
  theme: {
    extend: {
      fontFamily: {
        sans: ['Nunito', 'sans-serif'],
      },
      colors: {
        primary: {
          50:  '#e5eef5',
          100: '#cbddea',
          200: '#99bcd5',
          300: '#669ac0',
          400: '#3379ab',
          500: '#005896',
          600: '#004b80',
          700: '#003866',
          800: '#00254a', // WyaLink Blue
          900: '#00172d',
          950: '#000c17',
        },
        secondary: {
          50:  '#e8f9f9',
          100: '#c9f0f0',
          200: '#95e0e0',
          300: '#61d0d0',
          400: '#36b1b3', // WyaLink Teal
          500: '#2a9192',
          600: '#1e7273',
          700: '#135354',
          800: '#093535',
          900: '#021818',
        },
        accent: {
          50:  '#fff2e8',
          100: '#ffd9c2',
          200: '#ffb68a',
          300: '#ff9351',
          400: '#f37021', // WyaLink Orange
          500: '#d95e16',
          600: '#b34a0e',
          700: '#8c3809',
          800: '#662604',
          900: '#401601',
        },
        // Messaging Colors with shade variations
        success: {
          50:  '#e6fdf2',
          100: '#c0fbe0',
          200: '#8df7c4',
          300: '#4feea6',
          400: '#01df72', // Primary success color
          500: '#00c563',
          600: '#00a854',
          700: '#008543',
          800: '#006232',
          900: '#003f20',
        },
        error: {
          50:  '#fef2f2',
          100: '#fee2e2',
          200: '#fecaca',
          300: '#fca5a5',
          400: '#f82834', // Primary error color
          500: '#dc2626',
          600: '#b91c1c',
          700: '#991b1b',
          800: '#7f1d1d',
          900: '#5f1515',
        },
        warning: {
          50:  '#fffbeb',
          100: '#fef3c7',
          200: '#fde68a',
          300: '#fcd34d',
          400: '#fcb700', // Primary warning color
          500: '#f59e0b',
          600: '#d97706',
          700: '#b45309',
          800: '#92400e',
          900: '#78350f',
        },
        info: {
          50:  '#e6f7ff',
          100: '#b3e5ff',
          200: '#80d4ff',
          300: '#4dc2ff',
          400: '#00bafe', // Primary info color
          500: '#009dd9',
          600: '#007fb3',
          700: '#00618c',
          800: '#004366',
          900: '#002640',
        },
      },
    },
  },
  plugins: [],
}
