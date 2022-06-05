import { defineConfig } from 'vite'
import shopify from 'vite-plugin-shopify'

export default defineConfig({
  build: {
    emptyOutDir: true
  },
  plugins: [
    shopify()
  ]
})
