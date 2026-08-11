import { defineConfig } from 'vite'
import path from 'node:path'
import { svelte } from '@sveltejs/vite-plugin-svelte'

export default defineConfig({
    plugins: [svelte()],
    resolve: {
        alias: {
            '@ts': path.resolve(__dirname, 'src/scripts'),
            '@css': path.resolve(__dirname, 'src/styles'),
            '@assets': path.resolve(__dirname, 'src/assets'),
        },
    },
    server: {
        proxy: {
            "/api": {
                //target: "https://api.swarmtunes.com",
                target: "http://localhost:8000",
                changeOrigin: true,
                secure: true,
                rewrite: (path) => path.replace(/^\/api/, ""),
            },
        }
    },
    build: {
        rollupOptions: {
            input: {
                main: path.resolve(__dirname, "index.html"),
                about: path.resolve(__dirname, "about.html"),
            },
        },
    },
})