import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'
import basicSsl from '@vitejs/plugin-basic-ssl'

// https://vitejs.dev/config/
export default defineConfig({
  plugins: [react(),basicSsl()],
  resolve: {
    alias: {
      "src": "/src",
      "components":"/src/components/",
      "assets":"/src/assets/",
      "styles":"/src/styles/",
    },
  },
})
