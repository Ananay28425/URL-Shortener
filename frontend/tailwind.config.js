/** @type {import('tailwindcss').Config} */
export default {
  content: ['./index.html', './src/**/*.{js,jsx,ts,tsx}'],
  theme: {
    extend: {
      colors: {
        brand: {
          bg: '#0B0F19',
          bgSoft: '#0F172A',
          bgCard: '#111827',
          indigo: '#6366F1',
          purple: '#8B5CF6',
          cyan: '#06B6D4',
          success: '#22C55E',
          warning: '#F59E0B',
          error: '#EF4444',
          text: '#F8FAFC',
          muted: '#CBD5E1',
          slate: '#64748B'
        }
      },
      boxShadow: {
        glow: '0 0 0 1px rgba(99,102,241,0.3), 0 10px 45px rgba(99,102,241,0.25)'
      }
    }
  },
  plugins: []
}
