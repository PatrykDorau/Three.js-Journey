import glsl from "vite-plugin-glsl"
import { defineConfig } from 'vite';

export default defineConfig({
    base: './',
    build:
    {
        outDir: '../dist', // Output in the dist/ folder
        emptyOutDir: true, // Empty the folder first
        sourcemap: true // Add sourcemap
    },
    plugins: [
        glsl()
      ]
})