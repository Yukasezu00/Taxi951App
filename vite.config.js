// vite.config.js
import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react-swc'

// Alleen Vite-config (geen Vitest hier)
export default defineConfig({
  plugins: [react()],
  server: { port: 5173, open: true },
  preview: { port: 4173 },
})
