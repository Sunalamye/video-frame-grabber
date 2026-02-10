import { defineConfig } from 'vite';

export default defineConfig({
  server: {
    host: '127.0.0.1',
    allowedHosts: ['vfg.soane.dev'],
  },
  css: {
    modules: {
      localsConvention: 'camelCase',
    },
  },
  build: {
    target: 'es2022',
  },
});
