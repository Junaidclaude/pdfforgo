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
        // ── New design system ───────────────────────────────
        ink:    '#0b1220',
        royal:  '#1e40af',
        royald: '#1e3a8a',
        royall: '#3b82f6',
        ruby:   '#e11d48',
        rubyd:  '#be123c',
        paper:  '#fafbff',
        line:   '#e6e8ef',
        mute:   '#5b6478',
        // ── Legacy brand (used by tool pages) ───────────────
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
        display: ['var(--font-display)', 'system-ui', 'sans-serif'],
        // font-syne class used by tool pages maps to same Space Grotesk variable
        syne:    ['var(--font-display)', 'sans-serif'],
        sans:    ['var(--font-sans)', 'system-ui', 'sans-serif'],
      },
      borderRadius: {
        '2xl': '1rem',
        '3xl': '1.5rem',
      },
      boxShadow: {
        card:        '0 1px 0 rgba(15,23,42,0.04), 0 8px 24px -12px rgba(30,64,175,0.18)',
        'card-hover':'0 2px 0 rgba(15,23,42,0.04), 0 22px 42px -18px rgba(30,64,175,0.30)',
        lift:        '0 2px 0 rgba(15,23,42,0.04), 0 22px 42px -18px rgba(30,64,175,0.30)',
        'red-glow':  '0 0 30px rgba(232, 74, 74, 0.3)',
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
