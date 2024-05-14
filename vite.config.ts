import { defineConfig, transformWithEsbuild } from "vite";
import react from "@vitejs/plugin-react";

import tsconfigPaths from "vite-tsconfig-paths";
import svgr from "vite-plugin-svgr";

import { unfontsPlugin } from "./unfonts";

// https://vitejs.dev/config/
export default defineConfig(({ mode }) => ({
  plugins: [
    unfontsPlugin,
    tsconfigPaths(),
    svgr(),
    react()
  ],

  define: {
    "process.env": {}
  },

  server: {
    port: 4200
  }
}));
