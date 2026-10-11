import react from '@vitejs/plugin-react'
import tailwindcss from '@tailwindcss/vite'
import { defineConfig } from 'vite'

// Configuração do Kids_Play.
// Não precisa mudar nada aqui para usar o app.
export default defineConfig({
  plugins: [react(), tailwindcss()],
})
