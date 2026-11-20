import { defineConfig } from 'tsup';
import fs from 'node:fs';
import path from 'node:path';

export default defineConfig({
  entry: ['src/index.ts', 'src/browser.ts'],
  format: ['cjs', 'esm'],
  dts: true,
  clean: true,
  sourcemap: true,
  shims: true,
  onSuccess: async () => {
    const srcWasm = path.resolve('pkg-wasm/xlsx_to_pdf_bg.wasm');
    const destWasm = path.resolve('dist/xlsx_to_pdf_bg.wasm');
    if (fs.existsSync(srcWasm)) {
      fs.copyFileSync(srcWasm, destWasm);
      console.log('Copied wasm binary to dist/');
    }
  },
});
