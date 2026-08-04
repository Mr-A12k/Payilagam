/**
 * @file vite.config.js
 * @description Vite build configuration for the TaskPro frontend.
 *              Sets up React, TailwindCSS v4, and the '@' path alias
 *              so we can import like: import { Button } from '@/components/ui'
 */

import { defineConfig } from "vite";
import react from "@vitejs/plugin-react";
import tailwindcss from "@tailwindcss/vite";
import path from "path";
import { fileURLToPath } from "url";

/* Derive __dirname in ESM (import.meta.url gives us a file:// URL) */
const __dirname = path.dirname(fileURLToPath(import.meta.url));

export default defineConfig({
  plugins: [react(), tailwindcss()],
  resolve: {
    alias: {
      /* Map '@' to the 'src' directory so every import becomes clean:
         import X from '@/pages/Dashboard' instead of '../../../pages/Dashboard' */
      "@": path.resolve(__dirname, "./src"),
    },
  },
});
