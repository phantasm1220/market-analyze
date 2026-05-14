import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'

// GitHub Pages deploy: set base to your repo name
// e.g. if repo is https://github.com/yourname/next-wave → base: '/next-wave/'
// For local dev or custom domain, use base: '/'
export default defineConfig({
  plugins: [react()],
  base: '/market-analyze/',
})
