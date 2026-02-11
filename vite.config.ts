import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react-swc'
import tailwindcss from '@tailwindcss/vite'
import { nodePolyfills } from 'vite-plugin-node-polyfills';
import wasm from 'vite-plugin-wasm'
import topLevelAwait from "vite-plugin-top-level-await";

const wasmSensitiveDeps = [
  "@shelby-protocol/sdk/browser",
  "@shelby-protocol/clay-codes",
];

import path from "path";

// https://vite.dev/config/
export default defineConfig({
    plugins: [
        react(),
        tailwindcss(),
        wasm(),
        topLevelAwait()
    ],
    assetsInclude: ['**/*.wasm'],
    optimizeDeps: {
        include: ["buffer", "@aptos-labs/ts-sdk"],
        exclude: wasmSensitiveDeps,
    },
    resolve: {
      alias: {
        "@": path.resolve(__dirname, "./src"),
      },
    },
})
