import { defineConfig } from 'vite-plus';
import vue from '@vitejs/plugin-vue';
import tailwindcss from '@tailwindcss/vite';

export default defineConfig({
  plugins: [vue(), tailwindcss()],
  fmt: { semi: true, singleQuote: true },
  lint: { options: { typeAware: true, typeCheck: true } },
});
