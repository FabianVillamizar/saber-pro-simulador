import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'

// Debe coincidir con el nombre del repo en GitHub Pages (user.github.io/<repo>/)
// o el sitio carga en blanco.
export default defineConfig({
  base: '/saber-pro-simulador/',
  plugins: [react()],
})
