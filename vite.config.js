import { defineConfig } from 'vite'
import vue from '@vitejs/plugin-vue'
import tailwindcss from '@tailwindcss/vite'
import { resolve } from 'path'

export default defineConfig({
  plugins: [
    vue(),
    tailwindcss(),
  ],
  resolve: {
    alias: {
      '@': resolve(__dirname, 'src'),
    },
  },
  esbuild: {
    target: 'es2020',
    drop: ['console', 'debugger'],
  },
  build: {
    target: 'es2020',
  },
  ssgOptions: {
    script: 'sync',
    formatting: 'minify',
    crittersOptions: {
      reduceInlineStyles: false,
    },
    // Format for generated files
    format: 'esm',
  }
})