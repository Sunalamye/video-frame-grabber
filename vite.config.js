import { defineConfig } from 'vite';
import { viteSingleFile } from 'vite-plugin-singlefile';

export default defineConfig({
  base: '/video-frame-grabber/',
  server: {
    host: '127.0.0.1',
    allowedHosts: ['vfg.soane.dev'],
  },
  css: {
    modules: {
      localsConvention: 'camelCase',
    },
  },
  plugins: [viteSingleFile()],
  build: {
    target: 'es2022',
  },
});
