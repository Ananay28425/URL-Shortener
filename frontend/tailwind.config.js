/** @type {import('tailwindcss').Config} */
export default {
  content: ['./index.html', './src/**/*.{js,jsx,ts,tsx}'],
  theme: {
    extend: {
      colors: {
        brand: {
          bg: '#050505',
          bgSoft: '#0a0a0a',
          bgCard: '#0d0d0d',
          indigo: '#dc2626',
          purple: '#ef4444',
          cyan: '#f87171',
          success: '#22c55e',
          warning: '#f59e0b',
          error: '#ef4444',
          text: '#ffffff',
          muted: '#d4d4d4',
          slate: '#a3a3a3'
        }
      },
      boxShadow: {
        glow: '0 0 0 1px rgba(239,68,68,0.5), 0 0 32px rgba(239,68,68,0.2)'
      }
    }
  },
  plugins: []
}
