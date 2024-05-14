import { defineConfig } from "vite";
import react from "@vitejs/plugin-react";

import tsconfigPaths from "vite-tsconfig-paths";

// https://vitejs.dev/config/
export default defineConfig(({ mode }) => ({
  plugins: [
    // unfontsPlugin,
    tsconfigPaths(),
    react()
  ],

  define: {
    "process.env": {}
  },

  server: {
    port: 4200
  }
}));
