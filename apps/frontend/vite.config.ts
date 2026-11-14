import { defineConfig } from "vite";
import react from "@vitejs/plugin-react";
import tailwindcss from "@tailwindcss/vite";
import { dirname, resolve } from "node:path";
import { fileURLToPath } from "node:url";

const root = dirname(fileURLToPath(import.meta.url));

const port = Number(process.env.VITE_DEV_PORT ?? process.env.PORT ?? 3000);

export default defineConfig({
  plugins: [react(), tailwindcss()],
  resolve: {
    alias: {
      "@": resolve(root, "src"),
    },
  },
  server: {
    port,
    strictPort: false,
  },
  preview: {
    port,
    strictPort: true,
  },
});