import { defineConfig } from 'vite-plus';
import vue from '@vitejs/plugin-vue';
import tailwindcss from '@tailwindcss/vite';

export default defineConfig({
  base: process.env.NODE_ENV === 'production' ? '/vsix-download/' : '/',
  plugins: [vue(), tailwindcss()],
  fmt: { semi: true, singleQuote: true },
  lint: { options: { typeAware: true, typeCheck: true } },
});
