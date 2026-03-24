import { defineConfig, loadEnv } from "vite";
import react from "@vitejs/plugin-react-swc";
import path from "path";
import { componentTagger } from "lovable-tagger";

// https://vitejs.dev/config/
export default defineConfig(({ mode }) => {
  const env = loadEnv(mode, process.cwd(), "");
  const backendBaseUrl = env.VITE_API_BASE_URL || "https://api.convobridge.in:3000";

  return {
    server: {
      host: "::",
      port: 8080,
      // In production, /api/* is handled by Vercel Functions.
      // In local dev, proxy /api/* to your backend so the frontend can keep
      // using same-origin fetches.
      proxy: {
        "/api/campaign": {
          target: backendBaseUrl,
          changeOrigin: true,
          secure: true,
        },
        "/api/payments": {
          target: backendBaseUrl,
          changeOrigin: true,
          secure: true,
        },
      },
    },
    build: {
      outDir: "dist",
      sourcemap: mode === "development",
      minify: "terser",
      terserOptions: {
        compress: {
          drop_console: mode === "production",
        },
      },
      rollupOptions: {
        output: {
          manualChunks: {
            vendor: ["react", "react-dom", "react-router-dom"],
            ui: [
              "@radix-ui/react-accordion",
              "@radix-ui/react-alert-dialog",
              "@radix-ui/react-dialog",
            ],
          },
        },
      },
    },
    plugins: [react(), mode === "development" && componentTagger()].filter(Boolean),
    resolve: {
      alias: {
        "@": path.resolve(__dirname, "./src"),
      },
    },
  };
});
