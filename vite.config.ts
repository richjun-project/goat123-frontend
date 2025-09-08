import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'

// https://vite.dev/config/
export default defineConfig({
  plugins: [react()],
  build: {
    rollupOptions: {
      output: {
        manualChunks: {
          'react-vendor': ['react', 'react-dom', 'react-router-dom'],
          'antd': ['antd', '@ant-design/icons'],
          'supabase': ['@supabase/supabase-js'],
          'charts': ['@ant-design/charts', 'recharts'],
        }
      }
    }
  },
  optimizeDeps: {
    exclude: ['@antv/layout']
  },
  worker: {
    format: 'es'
  }
})
