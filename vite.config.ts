import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'
import tailwindcss from '@tailwindcss/vite'
import { copyFileSync, existsSync } from 'node:fs'
import { resolve } from 'node:path'

// BASE_PATH lo fija el workflow de GitHub Pages ("/<repo>/"). En local es "/".
export default defineConfig({
  base: process.env.BASE_PATH ?? '/',
  plugins: [
    react(),
    tailwindcss(),
    {
      // GitHub Pages no conoce las rutas del SPA: 404.html = index.html.
      name: 'spa-404',
      closeBundle() {
        const index = resolve('dist/index.html')
        if (existsSync(index)) copyFileSync(index, resolve('dist/404.html'))
      },
    },
  ],
  build: {
    target: 'es2022',
    chunkSizeWarningLimit: 900,
    rolldownOptions: {
      output: {
        manualChunks(id: string) {
          if (/node_modules\/(three|@react-three|postprocessing)/.test(id)) return 'three'
          if (/node_modules\/(gsap|lenis)/.test(id)) return 'motion'
          return undefined
        },
      },
    },
  },
})
