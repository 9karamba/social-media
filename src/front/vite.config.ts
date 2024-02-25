import {fileURLToPath, URL} from 'url'
import {defineConfig, loadEnv} from 'vite'
import vue from '@vitejs/plugin-vue';
import checker from 'vite-plugin-checker';
import {join} from "path";

// https://vitejs.dev/config/
export default (mode: string) => {

    Object.assign(process.env, loadEnv(mode, join(
        process.cwd(),
        '/../../'
    ), ''))

    return defineConfig({
        plugins: [
            vue(),
            checker({
                vueTsc: true,
            }),
        ],
        resolve: {
            alias: {
                '@': fileURLToPath(new URL('./src', import.meta.url))
            }
        },
        build: {
            outDir: '../../build/front'
        }
    })
}
