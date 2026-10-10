import { defineConfig } from "vite";
import react from "@vitejs/plugin-react";

export default defineConfig({
  plugins: [react()],
  server: {
    proxy: {
      "/webhook-test": {
        target: "http://127.0.0.1:5678",
        changeOrigin: true,
      },
      "/webhook": {
        target: "http://127.0.0.1:5678",
        changeOrigin: true,
      },
    },
  },
});