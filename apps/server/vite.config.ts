import { reactRouter } from "@react-router/dev/vite";
import { cloudflare } from "@cloudflare/vite-plugin";
import { defineConfig, loadEnv } from "vite";
import tsconfigPaths from "vite-tsconfig-paths";
import tailwindcss from "@tailwindcss/vite";
import path from "path";

export default defineConfig(({ mode }) => {
  // Load env file from root directory
  const env = loadEnv(mode, path.resolve(__dirname, "../.."), "");

  return {
    envDir: path.resolve(__dirname, "../.."),
    plugins: [
      cloudflare({ viteEnvironment: { name: "ssr" } }),
      reactRouter(),
      tsconfigPaths(),
      tailwindcss(),
    ],
  };
});
