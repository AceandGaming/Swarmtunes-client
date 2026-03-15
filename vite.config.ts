import { defineConfig } from "vite"
import react from '@vitejs/plugin-react'; //plan to use react later
import path from 'path';

export default defineConfig({
    plugins: [react()],
    resolve: {
        alias: {
            '@': path.resolve(__dirname, 'src'),
            '@ts': path.resolve(__dirname, 'src/scripts'),
            '@css': path.resolve(__dirname, 'src/styles'),
        },
    },
    css: {
        preprocessorOptions: {
            scss: {
                additionalData: `@use "@css/_variables" as *;`
            },
        },
    },
});