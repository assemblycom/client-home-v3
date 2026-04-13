import path from 'node:path'
import { defineConfig } from 'vitest/config'

export default defineConfig({
  test: {
    environment: 'node',
    include: ['src/**/*.test.ts'],
  },
  resolve: {
    alias: {
      '@app-bridge': path.resolve(__dirname, 'src/features/app-bridge'),
      '@auth': path.resolve(__dirname, 'src/features/auth'),
      '@assembly': path.resolve(__dirname, 'src/lib/assembly'),
      '@common': path.resolve(__dirname, 'src/features/common'),
      '@extensions': path.resolve(__dirname, 'src/features/editor/components/Editor/extensions'),
      '@editor': path.resolve(__dirname, 'src/features/editor'),
      '@media': path.resolve(__dirname, 'src/features/media'),
      '@segments': path.resolve(__dirname, 'src/features/segments'),
      '@settings': path.resolve(__dirname, 'src/features/settings'),
      '@users': path.resolve(__dirname, 'src/features/users'),
      '@notification-counts': path.resolve(__dirname, 'src/features/notification-counts'),
      '@': path.resolve(__dirname, 'src'),
    },
  },
})
