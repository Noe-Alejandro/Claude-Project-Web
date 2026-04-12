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

        // Only measure files that contain real logic.
        // UI shells, pages, routing wrappers, providers, and type-only
        // files are intentionally excluded so the percentage stays
        // meaningful and doesn't punish developers for not testing wiring.
        include: [
          'src/domain/**',
          'src/application/**',
          'src/infrastructure/**',
          'src/shared/utils/**',
        ],
        exclude: [
          // test helpers and setup
          'src/test/**',
          'src/**/__tests__/**',
          // type declarations and config
          '**/*.d.ts',
          '**/*.config.*',
          // barrel re-exports (no logic)
          '**/index.ts',
          // React wiring — context shape and provider setup, not logic
          'src/application/auth/AuthContext.ts',
          'src/application/auth/AuthProvider.tsx',
        ],

        // No enforced thresholds — coverage is a helpful signal, not a gate.
        // Add thresholds here only when the team agrees on a baseline.
      },
    },
  }),
)
