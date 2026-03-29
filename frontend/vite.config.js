import { defineConfig } from 'vite' // it works as a intellisense from vite

import react from '@vitejs/plugin-react'
import tailwindcss from '@tailwindcss/vite'

export default defineConfig({
  plugins: [
    react(),    // helps it read react and tailwind
    tailwindcss(),
  ],
})