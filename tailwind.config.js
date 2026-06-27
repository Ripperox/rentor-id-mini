/** @type {import('tailwindcss').Config} */
export default {
  content: ['./index.html', './src/**/*.{js,ts,jsx,tsx}'],
  theme: {
    extend: {
      fontFamily: {
        display: ['"Bricolage Grotesque"', 'system-ui', 'sans-serif'],
        sans: ['"Hanken Grotesk"', 'system-ui', 'sans-serif'],
        mono: ['"JetBrains Mono"', 'ui-monospace', 'monospace'],
      },
      colors: {
        // Warm charcoal — softer and less "blue-black tech" than before.
        ink: {
          950: '#0d0c0b',
          900: '#131211',
          850: '#1a1815',
          800: '#201e1a',
          700: '#2b2823',
          600: '#3a362f',
          500: '#6f685d',
        },
        // Muted dusty blue — calm and human, not electric indigo.
        signal: {
          DEFAULT: '#7d92ad',
          soft: '#a8b6c9',
          deep: '#5f718a',
        },
        live: '#85a98d', // muted sage — resolved / paid / positive
        warn: '#cba364', // muted amber
        alert: '#c67f74', // muted terracotta
      },
      boxShadow: {
        // Neutral, soft elevation — no colored glow.
        glow: '0 1px 2px rgba(0,0,0,0.35), 0 18px 44px -24px rgba(0,0,0,0.75)',
        card: '0 1px 0 0 rgba(255,255,255,0.03) inset, 0 16px 38px -28px rgba(0,0,0,0.8)',
      },
      keyframes: {
        'fade-up': {
          '0%': { opacity: '0', transform: 'translateY(8px)' },
          '100%': { opacity: '1', transform: 'translateY(0)' },
        },
        'scale-in': {
          '0%': { opacity: '0', transform: 'scale(0.97)' },
          '100%': { opacity: '1', transform: 'scale(1)' },
        },
        ring: {
          '0%': { transform: 'scale(0.92)', opacity: '0.5' },
          '70%': { transform: 'scale(1.5)', opacity: '0' },
          '100%': { transform: 'scale(1.5)', opacity: '0' },
        },
        'pulse-soft': {
          '0%, 100%': { opacity: '1' },
          '50%': { opacity: '0.5' },
        },
      },
      animation: {
        'fade-up': 'fade-up 0.5s cubic-bezier(0.22,1,0.36,1) both',
        'scale-in': 'scale-in 0.28s cubic-bezier(0.22,1,0.36,1) both',
        ring: 'ring 2.4s cubic-bezier(0,0,0.2,1) infinite',
        'pulse-soft': 'pulse-soft 2s ease-in-out infinite',
      },
    },
  },
  plugins: [],
}
