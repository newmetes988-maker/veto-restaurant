/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {
      fontFamily: {
        serif: ['"Playfair Display"', 'serif'],
        sans: ['"Inter"', 'sans-serif'],
      },
      colors: {
        brand: {
          50: '#fdf8f6',
          100: '#f2e8e5',
          200: '#eaddd7',
          300: '#e0cec7',
          400: '#d2bab0',
          500: '#a77f6b',
          600: '#8a5a44',
          700: '#6d4535',
          800: '#4a2e23',
          900: '#2b1a14',
        },
        gold: {
          300: '#e8c868',
          400: '#d4af37',
          500: '#c5a028',
          600: '#b08d1e',
        },
        obsidian: {
          50: '#1a1a1a',
          100: '#141414',
          200: '#101010',
          300: '#0c0c0c',
          400: '#090909',
          500: '#070707',
          600: '#050505',
          700: '#040404',
          800: '#030303',
          900: '#020202',
        },
        velvet: {
          DEFAULT: '#080808',
          light: '#0d0d0d',
          dark: '#050505',
        }
      },
      animation: {
        'fade-in': 'fadeIn 0.6s ease-out',
        'slide-up': 'slideUp 0.5s ease-out',
        'pulse-soft': 'pulseSoft 2s infinite',
        'shimmer': 'shimmer 3s ease-in-out infinite',
      },
      keyframes: {
        fadeIn: {
          '0%': { opacity: '0' },
          '100%': { opacity: '1' },
        },
        slideUp: {
          '0%': { opacity: '0', transform: 'translateY(20px)' },
          '100%': { opacity: '1', transform: 'translateY(0)' },
        },
        pulseSoft: {
          '0%, 100%': { opacity: '1' },
          '50%': { opacity: '0.7' },
        },
        shimmer: {
          '0%': { backgroundPosition: '-200% 0' },
          '100%': { backgroundPosition: '200% 0' },
        },
      },
    },
  },
  plugins: [],
}
