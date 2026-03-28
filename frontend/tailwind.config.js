/** @type {import('tailwindcss').Config} */
module.exports = {
  content: [
    './src/pages/**/*.{js,ts,jsx,tsx,mdx}',
    './src/components/**/*.{js,ts,jsx,tsx,mdx}',
    './src/app/**/*.{js,ts,jsx,tsx,mdx}',
  ],
  theme: {
    extend: {
      colors: {
        dark: {
          50: '#f7f7f7',
          100: '#eeeeee',
          900: '#1d1c1c',
          950: '#111111',
        },
        primary: {
          50: '#fffbeb',
          100: '#fef3c7',
          200: '#fde68a',
          300: '#fcd34d',
          400: '#fbbf24',
          500: '#F5A900',
          600: '#D97706',
          700: '#b45309',
          800: '#92400e',
          900: '#78350f',
          950: '#451a03',
        },
        secondary: {
          50: '#f7f7f7',
          100: '#eeeeee',
          200: '#e6e6e6',
          300: '#d4d4d4',
          400: '#a3a3a3',
          500: '#737373',
          600: '#525252',
          700: '#404040',
          800: '#262626',
          900: '#1d1c1c',
        },
        neon: {
          violet: '#F5A900',
          purple: '#D97706',
          pink: '#b45309',
          cyan: '#0ea5e9',
          mint: '#10B981',
        },
      },
      fontFamily: {
        sans: ['var(--font-poppins)', 'Poppins', 'system-ui', 'sans-serif'],
        display: ['var(--font-playfair)', 'Georgia', 'serif'],
      },
      backgroundImage: {
        'gradient-radial': 'radial-gradient(var(--tw-gradient-stops))',
        'mesh-1': 'radial-gradient(at 40% 20%, #F5A90011 0px, transparent 50%), radial-gradient(at 80% 0%, #fde68a22 0px, transparent 50%), radial-gradient(at 0% 50%, #fef3c711 0px, transparent 50%)',
        'card-glow': 'linear-gradient(135deg, rgba(245,169,0,0.05), rgba(217,119,6,0.03))',
        'gold-gradient': 'linear-gradient(135deg, #F5A900, #D97706)',
        'violet-gradient': 'linear-gradient(135deg, #F5A900, #D97706)',
        'dark-card': 'linear-gradient(135deg, #ffffff 0%, #f9f9f9 100%)',
      },
      animation: {
        'float': 'float 6s ease-in-out infinite',
        'float-slow': 'float 9s ease-in-out infinite',
        'float-delayed': 'float 6s ease-in-out 2s infinite',
        'pulse-slow': 'pulse 4s cubic-bezier(0.4, 0, 0.6, 1) infinite',
        'gradient-x': 'gradient-x 8s ease infinite',
        'spin-slow': 'spin 20s linear infinite',
        'orbit': 'orbit 12s linear infinite',
        'shimmer': 'shimmer 2s linear infinite',
        'glow-pulse': 'glow-pulse 3s ease-in-out infinite',
        'slide-up': 'slide-up 0.6s ease-out forwards',
        'blob': 'blob 8s ease-in-out infinite',
      },
      keyframes: {
        float: {
          '0%, 100%': { transform: 'translateY(0px) rotate(0deg)' },
          '50%': { transform: 'translateY(-24px) rotate(2deg)' },
        },
        'gradient-x': {
          '0%, 100%': { 'background-size': '200% 200%', 'background-position': 'left center' },
          '50%': { 'background-size': '200% 200%', 'background-position': 'right center' },
        },
        shimmer: {
          '0%': { backgroundPosition: '-200% 0' },
          '100%': { backgroundPosition: '200% 0' },
        },
        'glow-pulse': {
          '0%, 100%': { opacity: '0.4', transform: 'scale(1)' },
          '50%': { opacity: '0.8', transform: 'scale(1.05)' },
        },
        orbit: {
          '0%': { transform: 'rotate(0deg) translateX(120px) rotate(0deg)' },
          '100%': { transform: 'rotate(360deg) translateX(120px) rotate(-360deg)' },
        },
        blob: {
          '0%, 100%': { transform: 'translate(0px, 0px) scale(1)' },
          '33%': { transform: 'translate(30px, -50px) scale(1.1)' },
          '66%': { transform: 'translate(-20px, 20px) scale(0.9)' },
        },
      },
      backdropBlur: {
        xs: '2px',
      },
      boxShadow: {
        'glow-sm': '0 2px 8px rgba(245, 169, 0, 0.25)',
        'glow': '0 4px 20px rgba(245, 169, 0, 0.3)',
        'glow-lg': '0 8px 40px rgba(245, 169, 0, 0.35)',
        'glow-xl': '0 12px 60px rgba(245, 169, 0, 0.3)',
        'gold-glow': '0 4px 20px rgba(245, 169, 0, 0.3)',
        'gold-glow-lg': '0 8px 40px rgba(245, 169, 0, 0.4)',
        'card-dark': '0 1px 4px rgba(0,0,0,0.06), 0 4px 16px rgba(0,0,0,0.04)',
        'card-hover': '0 4px 24px rgba(0,0,0,0.1), 0 0 0 1px rgba(245,169,0,0.15)',
        'inset-glow': 'inset 0 1px 0 rgba(255,255,255,0.8)',
      },
      borderColor: {
        'glass': '#e6e6e6',
        'glass-hover': 'rgba(245, 169, 0, 0.4)',
      },
    },
  },
  plugins: [],
}
