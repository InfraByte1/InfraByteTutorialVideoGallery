import { defineConfig, loadEnv } from 'vite'
import react from '@vitejs/plugin-react'

// https://vite.dev/config/
export default defineConfig(({ mode }) => {
  // Loads .env, .env.[mode], .env.local, .env.[mode].local for this mode —
  // needed here because vite.config.ts itself runs outside the app's
  // import.meta.env and only sees process.env by default.
  const env = loadEnv(mode, process.cwd(), '')

  return {
    plugins: [react()],
    server: {
      port: 3000,
      proxy: {
        // Forwards /api/* to the backend server-to-server, so the browser only
        // ever talks to localhost:3000 and never triggers a cross-origin/CORS
        // check in dev. Target varies per mode via VITE_API_PROXY_TARGET.
        '/api': {
          target: env.VITE_API_PROXY_TARGET ?? 'https://localhost:5020',
          changeOrigin: true,
          secure: false,
        },
      },
    },
  }
})
