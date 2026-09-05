import { defineConfig } from 'vite'
import path from 'path'
import tailwindcss from '@tailwindcss/vite'
import react from '@vitejs/plugin-react'

export default defineConfig({
  plugins: [
    // The React and Tailwind plugins are both required for Make, even if
    // Tailwind is not being actively used – do not remove them
    react(),
    tailwindcss(),
  ],
  resolve: {
    alias: {
      // Alias @ to the src directory
      '@': path.resolve(__dirname, './src'),
    },
  },

  // File types to support raw imports. Never add .css, .tsx, or .ts files to this.
  assetsInclude: ['**/*.svg', '**/*.csv'],

  build: {
    // Désactiver les sourcemaps en production pour ne pas exposer le code source
    sourcemap: false,
    // Avertissement si un chunk dépasse 1000 kB
    chunkSizeWarningLimit: 1000,
    rollupOptions: {
      output: {
        // Découpage du bundle en chunks pour un meilleur caching navigateur
        manualChunks: {
          // React core
          'vendor-react': ['react', 'react-dom', 'react-router'],
          // MUI composants
          'vendor-mui': ['@mui/material', '@mui/icons-material', '@emotion/react', '@emotion/styled'],
          // Animations
          'vendor-motion': ['framer-motion', 'motion'],
          // Graphiques
          'vendor-recharts': ['recharts'],
          // Radix UI primitives
          'vendor-radix': [
            '@radix-ui/react-dialog',
            '@radix-ui/react-dropdown-menu',
            '@radix-ui/react-select',
            '@radix-ui/react-tabs',
            '@radix-ui/react-tooltip',
            '@radix-ui/react-accordion',
            '@radix-ui/react-alert-dialog',
            '@radix-ui/react-popover',
            '@radix-ui/react-avatar',
            '@radix-ui/react-checkbox',
          ],
          // Icônes (lucide peut être volumineux selon les imports)
          'vendor-icons': ['lucide-react'],
          // Formulaires
          'vendor-forms': ['react-hook-form', 'class-variance-authority'],
          // Dates
          'vendor-date': ['date-fns', 'react-day-picker'],
          // IA / face detection (très lourd — TensorFlow inclus)
          'vendor-faceapi': ['face-api.js'],
          // Drag & Drop
          'vendor-dnd': ['react-dnd', 'react-dnd-html5-backend'],
          // Carrousels
          'vendor-carousel': ['embla-carousel-react', 'react-slick'],
          // Utilitaires
          'vendor-utils': ['clsx', 'tailwind-merge', 'sonner'],
        },
      },
    },
  },
})
