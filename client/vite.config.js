import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';
import path from 'path'; // 👈 Thêm thư viện path của Node.js

export default defineConfig({
  plugins: [react()],
  resolve: {
    alias: {
      // 👈 Trỏ ký tự '@' thẳng vào thư mục 'src'
      '@': path.resolve(__dirname, './src'),
    },
  },
});