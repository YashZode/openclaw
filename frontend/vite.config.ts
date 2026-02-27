import path from "path";
import react from "@vitejs/plugin-react";
import { defineConfig } from "vite";

export default defineConfig({
  plugins: [react()],
  resolve: {
    alias: {
      "@": path.resolve(__dirname, "./src"),
    },
  },
  server: {
    port: 5173,
    host: true,
    proxy: {
      "/api": {
        target: "http://localhost:18810",
        changeOrigin: true,
      },
      "/baserow": {
        target: "https://api.baserow.io/api/database/rows",
        changeOrigin: true,
        rewrite: (path) => path.replace(/^\/baserow/, ""),
        headers: {
          Authorization: `Token ${process.env.BASEROW_TOKEN || ""}`,
        },
      },
      "/tg": {
        target: `https://api.telegram.org/bot${process.env.TELEGRAM_BOT_TOKEN || "MISSING"}`,
        changeOrigin: true,
        rewrite: (path) => path.replace(/^\/tg/, ""),
      },
    },
  },
});
