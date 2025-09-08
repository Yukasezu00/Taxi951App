// vitest.config.js
import { defineConfig } from 'vitest/config';
import react from '@vitejs/plugin-react-swc';

export default defineConfig({
  plugins: [react()],
  test: {
    environment: 'jsdom', // simuleert de browser
    globals: true, // describe/it/expect zonder import
    css: true, // sta CSS-imports toe in tests
    // setupFiles: ['./src/test/setup.js'], // optioneel (zie hieronder)
  },
});
