/** @type {import('tailwindcss').Config} */
module.exports = {
  content: [
    './pages/**/*.{js,ts,jsx,tsx,mdx}',
    './components/**/*.{js,ts,jsx,tsx,mdx}',
    './app/**/*.{js,ts,jsx,tsx,mdx}',
    './lib/**/*.{js,ts,jsx,tsx}',
  ],
  theme: {
    extend: {
      colors: {
        brand: {
          50:  '#fef7ee',
          100: '#fdedd6',
          200: '#fad7ac',
          300: '#f6ba77',
          400: '#f19440',
          500: '#ed7a1e',
          600: '#de6014',
          700: '#b84812',
          800: '#923916',
          900: '#763115',
          950: '#401608',
        },
        earth: {
          50:  '#f9f6f0',
          100: '#f0e9da',
          200: '#e0d0b5',
          300: '#ccb288',
          400: '#b99060',
          500: '#a97a48',
          600: '#92653c',
          700: '#784f33',
          800: '#63412e',
          900: '#533829',
          950: '#2d1c14',
        }
      },
      fontFamily: {
        display: ['var(--font-display)', 'serif'],
        body: ['var(--font-body)', 'sans-serif'],
      },
      fontSize: {
        'base': ['1.0625rem', { lineHeight: '1.6' }],
        'lg':   ['1.1875rem', { lineHeight: '1.6' }],
        'xl':   ['1.3125rem', { lineHeight: '1.5' }],
      },
      animation: {
        'fade-up': 'fadeUp 0.4s ease-out forwards',
        'slide-in': 'slideIn 0.3s ease-out forwards',
      },
      keyframes: {
        fadeUp: {
          '0%':   { opacity: '0', transform: 'translateY(12px)' },
          '100%': { opacity: '1', transform: 'translateY(0)' },
        },
        slideIn: {
          '0%':   { opacity: '0', transform: 'translateX(-8px)' },
          '100%': { opacity: '1', transform: 'translateX(0)' },
        },
      },
    },
  },
  plugins: [],
}
