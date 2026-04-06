/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {
      fontFamily: {
        // Luxury serif for headings — Cormorant Garamond
        serif:  ['Cormorant Garamond', 'Georgia', 'serif'],
        // Modern geometric sans for body & UI
        sans:   ['Jost', 'Inter', 'system-ui', 'sans-serif'],
      },
      colors: {
        // ── 1. Deep Navy — Primary brand ─────────────────────────────
        brand: {
          50:  '#E8EDF5',
          100: '#C8D3E8',
          200: '#97ADCF',
          300: '#6587B6',
          400: '#3A63A0',
          500: '#1A3060',   // ← main navy-light
          600: '#122040',
          700: '#0D1830',
          800: '#0A1220',
          900: '#070D18',
          950: '#040810',
        },
        navy: {
          50:  '#E8EDF5',
          100: '#C8D3E8',
          200: '#97ADCF',
          300: '#6587B6',
          400: '#3A63A0',
          500: '#1A3060',
          600: '#122040',
          700: '#0D1830',
          800: '#0A1228',
          900: '#070D18',
          950: '#040810',
        },
        // ── 2. Royal Gold — Luxury accent ─────────────────────────────
        gold: {
          50:  '#FDF8EC',
          100: '#FBF0D0',
          200: '#F5DFA0',
          300: '#EEC968',
          400: '#E8B84B',
          500: '#C9942A',   // ← main gold
          600: '#A8780F',
          700: '#89600A',
          800: '#6A4A07',
          900: '#4B3505',
          950: '#2D1F02',
        },
        // ── 3. Warm Ivory / Cream Surface ─────────────────────────────
        ivory: {
          50:  '#FEFDFB',
          100: '#FAF7F0',
          200: '#F2EDE0',
          300: '#E8DFC8',
          400: '#DDD1B2',
          500: '#CFC39C',
          600: '#B5A87C',
          700: '#9A8C5E',
          800: '#7A6E46',
          900: '#5A5133',
        },
        // ── Semantic aliases ──────────────────────────────────────────
        surface: '#FAF7F0',
        muted:   '#8B7E6A',
      },
      backgroundImage: {
        // 3-tone luxury hero gradient: Navy → Navy-mid → Gold
        'hero-gradient':
          'linear-gradient(135deg, #040810 0%, #0A1628 35%, #122040 65%, #C9942A 100%)',
        // Stats band gradient
        'navy-gradient':
          'linear-gradient(135deg, #040810 0%, #0A1628 50%, #0D1830 100%)',
        // Gold shimmer strip
        'gold-gradient':
          'linear-gradient(90deg, #C9942A 0%, #E8B84B 40%, #F5D98C 60%, #C9942A 100%)',
        // CTA section
        'cta-gradient':
          'linear-gradient(150deg, #040810 0%, #122040 40%, #1A3060 70%, #8B600A 100%)',
        // Fallback hero
        'fallback-gradient':
          'linear-gradient(135deg, #040810 0%, #0A1628 50%, #122040 75%, #C9942A 100%)',
      },
      boxShadow: {
        'gold-glow':  '0 0 24px rgba(201, 148, 42, 0.35)',
        'navy-deep':  '0 20px 60px rgba(4, 8, 16, 0.45)',
        'card-hover': '0 16px 48px rgba(10, 22, 40, 0.18), 0 0 0 1px rgba(201,148,42,0.15)',
        'topbar':     '0 2px 20px rgba(4, 8, 16, 0.3)',
        'navbar':     '0 4px 32px rgba(4, 8, 16, 0.12)',
      },
      keyframes: {
        'fade-up': {
          '0%':   { opacity: '0', transform: 'translateY(28px)' },
          '100%': { opacity: '1', transform: 'translateY(0)' },
        },
        'fade-in': {
          '0%':   { opacity: '0' },
          '100%': { opacity: '1' },
        },
        shimmer: {
          '0%':   { backgroundPosition: '-200% center' },
          '100%': { backgroundPosition:  '200% center' },
        },
        'slide-down': {
          '0%':   { opacity: '0', transform: 'translateY(-14px)' },
          '100%': { opacity: '1', transform: 'translateY(0)' },
        },
        float: {
          '0%, 100%': { transform: 'translateY(0px)' },
          '50%':      { transform: 'translateY(-8px)' },
        },
        'scale-in': {
          '0%':   { opacity: '0', transform: 'scale(0.94)' },
          '100%': { opacity: '1', transform: 'scale(1)' },
        },
        'pulse-ring': {
          '0%':   { boxShadow: '0 0 0 0 rgba(201,148,42,0.4)' },
          '70%':  { boxShadow: '0 0 0 12px rgba(201,148,42,0)' },
          '100%': { boxShadow: '0 0 0 0 rgba(201,148,42,0)' },
        },
      },
      animation: {
        'fade-up':    'fade-up 0.7s ease-out both',
        'fade-in':    'fade-in 0.5s ease-out both',
        'slide-down': 'slide-down 0.35s ease-out both',
        shimmer:      'shimmer 2.5s linear infinite',
        float:        'float 3.5s ease-in-out infinite',
        'scale-in':   'scale-in 0.4s ease-out both',
        'pulse-ring': 'pulse-ring 2s ease-out infinite',
      },
      transitionDuration: {
        '400': '400ms',
      },
    },
  },
  plugins: [],
}
