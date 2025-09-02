import tailwindcss from "@tailwindcss/vite";
import { resolve } from "path";
import { defineConfig } from "vite";
import tsconfigPaths from "vite-tsconfig-paths";

export default defineConfig({
  plugins: [
    tailwindcss(),
    tsconfigPaths()
  ],
  resolve: {
    alias: {
      "@": resolve(__dirname, "src"),
    },
  },
  // This makes sure it works on GitHub Pages under /GuessTheAnime/
  base: "/GuessTheAnime/",
  build: {
    outDir: "dist",       // <- switch back to Vite default (recommended)
    emptyOutDir: true,
  },
});
