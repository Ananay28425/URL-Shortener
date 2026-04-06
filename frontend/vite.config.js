import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'

// https://vite.dev/config/
export default defineConfig({
  plugins: [react()],
  // Allow requests proxied from preview/deployment host used by Vercel/Playground
  server: {
    allowedHosts: ['*.vercel.run']
  }
})
