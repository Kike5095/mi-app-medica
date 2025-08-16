// vite.config.js
import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';

export default defineConfig({
  base: '/',
  plugins: [react()],
  server: {
    host: '0.0.0.0',
    port: 5173,
    allowedHosts: [
      '5173-kike5095-miappmedica-jui5hx5ybwi.ws-us120.gitpod.io' // <-- tu dominio
    ],
    hmr: { clientPort: 443 }
  }
});
