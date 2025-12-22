import { defineConfig } from "vite";
import react from "@vitejs/plugin-react";
import tailwindcss from "@tailwindcss/vite";

export default defineConfig({
  plugins: [react(), tailwindcss()],
  build: {
    chunkSizeWarningLimit: 1500,

    rollupOptions: {
      output: {
        manualChunks(id) {
          // React core
          if (id.includes("node_modules/react")) {
            return "react";
          }
        },
      },
    },
  },
});
