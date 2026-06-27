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
        ink: {
          950: '#07080c',
          900: '#0a0b10',
          850: '#0e1017',
          800: '#13151e',
          700: '#1b1e2b',
          600: '#272b3d',
          500: '#3a3f57',
        },
        signal: {
          DEFAULT: '#6d7cff',
          soft: '#9aa5ff',
          deep: '#4b56d6',
        },
        live: '#34d99a',
        warn: '#ffb454',
        alert: '#ff6b81',
      },
      boxShadow: {
        glow: '0 0 0 1px rgba(109,124,255,0.18), 0 18px 60px -12px rgba(109,124,255,0.45)',
        card: '0 1px 0 0 rgba(255,255,255,0.04) inset, 0 20px 50px -28px rgba(0,0,0,0.9)',
      },
      keyframes: {
        'fade-up': {
          '0%': { opacity: '0', transform: 'translateY(10px)' },
          '100%': { opacity: '1', transform: 'translateY(0)' },
        },
        'scale-in': {
          '0%': { opacity: '0', transform: 'scale(0.96)' },
          '100%': { opacity: '1', transform: 'scale(1)' },
        },
        ring: {
          '0%': { transform: 'scale(0.9)', opacity: '0.7' },
          '70%': { transform: 'scale(1.6)', opacity: '0' },
          '100%': { transform: 'scale(1.6)', opacity: '0' },
        },
        shimmer: {
          '0%': { backgroundPosition: '-200% 0' },
          '100%': { backgroundPosition: '200% 0' },
        },
        'pulse-soft': {
          '0%, 100%': { opacity: '1' },
          '50%': { opacity: '0.45' },
        },
      },
      animation: {
        'fade-up': 'fade-up 0.5s cubic-bezier(0.22,1,0.36,1) both',
        'scale-in': 'scale-in 0.28s cubic-bezier(0.22,1,0.36,1) both',
        ring: 'ring 1.8s cubic-bezier(0,0,0.2,1) infinite',
        shimmer: 'shimmer 2.2s linear infinite',
        'pulse-soft': 'pulse-soft 1.6s ease-in-out infinite',
      },
    },
  },
  plugins: [],
}
