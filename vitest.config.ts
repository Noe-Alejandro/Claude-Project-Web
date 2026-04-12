import { defineConfig, mergeConfig } from 'vitest/config'
import viteConfig from './vite.config'

export default mergeConfig(
  viteConfig,
  defineConfig({
    test: {
      globals: true,
      environment: 'jsdom',
      setupFiles: ['./src/test/setup.ts'],
      css: true,
      coverage: {
        provider: 'v8',
        reporter: ['text', 'json', 'html'],
        include: ['src/domain/**', 'src/application/**', 'src/shared/utils/**'],
        exclude: [
          'src/test/**',
          'src/**/__tests__/**',
          '**/*.d.ts',
          '**/*.config.*',
          '**/index.ts',
          'src/application/auth/AuthContext.ts',
          'src/application/auth/AuthProvider.tsx',
        ],
      },
    },
  }),
)
