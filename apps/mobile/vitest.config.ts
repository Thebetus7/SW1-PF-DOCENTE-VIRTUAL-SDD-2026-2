import { defineConfig } from 'vitest/config';

export default defineConfig({
  test: {
    globals: true,
    environment: 'jsdom',
    setupFiles: ['./src/test/setup.ts'],
    server: {
      deps: {
        inline: [/expo/, /expo-sqlite/],
      },
    },
  },
  resolve: {
    alias: {
      'react-native': 'react-native-web',
    },
  },
});
