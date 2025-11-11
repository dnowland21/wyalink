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
        warning: {
          400: '#f37021', // duplicate of accent for branding consistency
        },
      },
    },
  },
  plugins: [],
}
