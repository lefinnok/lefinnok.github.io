import { reactRouter } from "@react-router/dev/vite";
import { defineConfig } from "vite";
import tsconfigPaths from "vite-tsconfig-paths";

export default defineConfig({
  plugins: [reactRouter(), tsconfigPaths()],
  base: "/",
  ssr: {
    noExternal: [/^@mui\//, /^@emotion\//],
  },
  optimizeDeps: {
    include: ["@tensorflow/tfjs"],
  },
  environments: {
    client: {
      build: {
        rollupOptions: {
          output: {
            manualChunks: {
              three: ["three", "three-stdlib"],
              tensorflow: ["@tensorflow/tfjs"],
            },
          },
        },
      },
    },
  },
});
