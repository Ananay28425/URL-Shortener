/** @type {import('tailwindcss').Config} */
export default {
  content: ['./index.html', './src/**/*.{js,jsx,ts,tsx}'],
  theme: {
    extend: {
      colors: {
        brand: {
          bg: '#000000',
          bgSoft: '#111111',
          bgCard: '#111111',
          indigo: '#F38020',
          purple: '#F38020',
          cyan: '#F38020',
          success: '#22C55E',
          warning: '#F59E0B',
          error: '#EF4444',
          text: '#E5E7EB',
          muted: '#A3A3A3',
          slate: '#737373'
        }
      },
      boxShadow: {
        glow: 'none'
      },
      borderRadius: {
        xl: '0.375rem',
        '2xl': '0.375rem'
      },
      fontFamily: {
        mono: ['ui-monospace', 'SFMono-Regular', 'Menlo', 'Monaco', 'Consolas', 'monospace']
      }
    }
  },
  plugins: []
}
