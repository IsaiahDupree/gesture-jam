import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';

export default defineConfig({
  plugins: [react()],
  server: {
    port: 8383,
    host: 'localhost'
  },
  build: {
    outDir: 'dist'
  },
  optimizeDeps: {
    include: [
      '@tensorflow/tfjs',
      '@tensorflow/tfjs-backend-webgl',
      '@tensorflow-models/hand-pose-detection',
      '@tensorflow-models/face-landmarks-detection',
      'tone'
    ]
  }
});
