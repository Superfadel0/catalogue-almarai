import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'

// Pour GitHub Pages : changer 'atelier-catalogue' par le nom de ton repo
// ou laisser '/' si déployé sur un domaine custom / username.github.io
export default defineConfig({
  plugins: [react()],
  base: process.env.VITE_BASE_PATH || '/atelier-catalogue/',
})
