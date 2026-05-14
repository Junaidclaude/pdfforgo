import type { Config } from 'tailwindcss'

const config: Config = {
  content: [
    './pages/**/*.{js,ts,jsx,tsx,mdx}',
    './components/**/*.{js,ts,jsx,tsx,mdx}',
    './app/**/*.{js,ts,jsx,tsx,mdx}',
    './lib/**/*.{js,ts,jsx,tsx}',
  ],
  theme: {
    extend: {
      colors: {
        primary: {
          DEFAULT: '#E84A4A',
          light: '#FF6B6B',
          dark: '#C93636',
        },
        dark: {
          DEFAULT: '#0F1117',
          800: '#1A1D27',
          700: '#252836',
          600: '#2E3245',
        },
        bg: {
          DEFAULT: '#F5F5F7',
          dark: '#E8E8EF',
        },
        tool: {
          merge: '#E84A4A',
          split: '#F97316',
          compress: '#3B82F6',
          word: '#16A34A',
          jpg: '#A855F7',
          image: '#EC4899',
          rotate: '#EAB308',
          watermark: '#06B6D4',
          protect: '#6366F1',
          unlock: '#14B8A6',
        },
      },
      fontFamily: {
        syne: ['var(--font-syne)', 'sans-serif'],
        sans: ['var(--font-dm-sans)', 'system-ui', 'sans-serif'],
      },
      borderRadius: {
        '2xl': '1rem',
        '3xl': '1.5rem',
      },
      boxShadow: {
        card: '0 4px 24px rgba(0, 0, 0, 0.06)',
        'card-hover': '0 8px 40px rgba(0, 0, 0, 0.12)',
        'red-glow': '0 0 30px rgba(232, 74, 74, 0.3)',
      },
      animation: {
        'fade-in': 'fadeIn 0.5s ease-in-out',
        'slide-up': 'slideUp 0.4s ease-out',
        float: 'float 6s ease-in-out infinite',
        pulse: 'pulse 2s cubic-bezier(0.4, 0, 0.6, 1) infinite',
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
        float: {
          '0%, 100%': { transform: 'translateY(0)' },
          '50%': { transform: 'translateY(-10px)' },
        },
      },
    },
  },
  plugins: [],
}

export default config
