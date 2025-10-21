import { defineConfig } from 'vite'

export default defineConfig({
  server: {
    port: 5174,
    host: true // 允許外部訪問
  },
  preview: {
    port: 5174,
    host: true
  }
})


