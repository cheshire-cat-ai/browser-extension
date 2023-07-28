import tsconfigPaths from 'vite-tsconfig-paths'
import { defineConfig } from 'vite'
import { resolve } from 'path'
import vue from '@vitejs/plugin-vue'
import Icons from 'unplugin-icons/vite'
import IconsResolver from "unplugin-icons/resolver"
import { HeadlessUiResolver } from 'unplugin-vue-components/resolvers'
import Components from "unplugin-vue-components/vite"
import AutoImport from 'unplugin-auto-import/vite'

// https://vitejs.dev/config/
export default defineConfig({
  plugins: [
    vue(),
    AutoImport({
      dts: true,
      imports: [
        'vue',
        '@vueuse/core',
        'pinia'
      ],
      eslintrc: {
        enabled: true
      }
    }),
    Components({
      dts: true,
      resolvers: [
        HeadlessUiResolver({ prefix: "" }),
        IconsResolver({ prefix: "" })
      ]
    }),
    Icons({ autoInstall: true }),
    tsconfigPaths()
  ],
  build: {
    outDir: 'dist',
    assetsDir: '',
    cssCodeSplit: false,
    rollupOptions: {
      input: {
        main: resolve(__dirname, 'index.html'),
        options: resolve(__dirname, 'options.html'),
        background: resolve(__dirname, 'background.ts'),
      },
      output: {
        minifyInternalExports: true,
        entryFileNames: (info) => `${info.name.includes('background') ? 'background' : 'extension'}.js`,
        assetFileNames: (info) => `${info.name?.endsWith('css') ? 'extension' : '[name]'}[extname]`,
        chunkFileNames: '[name].js',
        manualChunks: (id) => id.includes('background.ts') ? 'background' : 'extension',
        generatedCode: {
          preset: 'es2015',
          constBindings: true,
          objectShorthand: true
        }
      }
    }
  }
})
