import { defineConfig } from 'vite'
import path from 'node:path'

export default defineConfig({
    build: {
        rollupOptions: {
            treeshake: false
        }
    },
    resolve: {
        alias: {
            '@ts': path.resolve(__dirname, 'src/scripts'),
            '@css': path.resolve(__dirname, 'src/styles'),
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
    }
})