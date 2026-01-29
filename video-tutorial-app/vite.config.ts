import { defineConfig } from "vite";
import react from "@vitejs/plugin-react";

// https://vite.dev/config/
export default defineConfig({
  plugins: [react()],
    build: {
    sourcemap: false,
  },
  optimizeDeps: {
    exclude: ["@googlemaps/js-api-loader"],
  },
  base: "/",
  server: {
    proxy: {
      "/baseUrl": {
        target: "https://api.staging.infrabyte.com.au/api",
        changeOrigin: true,
        rewrite: (path) => path.replace(/^\/baseUrl/, ""),
      },
    },
  },
});
