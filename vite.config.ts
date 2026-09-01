import { defineConfig } from 'vite'
import path from 'node:path'
import { svelte } from '@sveltejs/vite-plugin-svelte'

export default defineConfig({
    plugins: [svelte({
        onwarn: (warning, handler) => {
            //silence accessibility warnings (will fix later)
            if (warning.code.startsWith('a11y_')) {
                return
            }

            handler(warning)
        }
    })],
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
                target: "https://api.swarmtunes.com",
                changeOrigin: true,
                secure: true,
                rewrite: (path) => path.replace(/^\/api/, ""),
            },
        }
    },
    build: {
        sourcemap: true,
        rollupOptions: {
            input: {
                main: path.resolve(__dirname, "index.html"),
                about: path.resolve(__dirname, "about.html"),
            },
        },
    },
})