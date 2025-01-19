import {defineConfig} from 'vite'
import react from '@vitejs/plugin-react'
import {resolve} from 'path'
import typescript from '@rollup/plugin-typescript';
import {libInjectCss} from 'vite-plugin-lib-inject-css';

function fixPath(str: string) {
  return resolve(__dirname, str)
}

// https://vite.dev/config/
export default defineConfig({
  build: {
    lib: {
      entry: fixPath('src/index.ts'),  // 入口文件
      name: 'xcn-waterfall',      // 库的全局名称
      fileName: (format) => `xcn-waterfall.${format}.js`, // 输出文件名
      formats: ["es", 'umd'],
    },
    rollupOptions: {
      // 确保外部化处理那些你不想打包进库的依赖
      external: ['react', 'react-dom'],
      output: {
        // 在 UMD 构建模式下为这些外部化的依赖提供一个全局变量
        globals: {
          react: 'react',
          'react-dom': 'react-dom',
        },
      },
    },
  },
  plugins: [
    react(),
    libInjectCss(),
    typescript({
      target: 'es5',
      rootDir: fixPath('src/'),
      declaration: true,
      declarationDir: fixPath('dist'),
      exclude: fixPath('node_modules/**'),
      allowSyntheticDefaultImports: true,
    })
  ],
})
