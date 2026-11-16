import test from 'node:test';
import assert from 'node:assert';
import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

import {
  init,
  convertXlsxToPdf,
  convertXlsxToPdfSync,
  getWorkbookInfo,
  XlsxDocument,
  isInitialized,
} from '../dist/browser.js';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const exampleXlsxPath = path.resolve(__dirname, '../../../xlsx/tests/example.xlsx');
const sampleXlsx = fs.readFileSync(exampleXlsxPath);
const wasmPath = path.resolve(__dirname, '../dist/xlsx_to_pdf_wasm_bg.wasm');
const wasmBytes = fs.readFileSync(wasmPath);

test('Browser bundle: manual init with wasm bytes and convert', async () => {
  assert.strictEqual(isInitialized(), false);

  // Initialize with raw bytes (simulating fetch in browser)
  await init(wasmBytes);
  assert.strictEqual(isInitialized(), true);

  const pdfBytes = await convertXlsxToPdf(sampleXlsx, {
    paperSize: 'A4',
    orientation: 'Portrait',
    showGridLines: true,
  });

  assert.ok(pdfBytes instanceof Uint8Array);
  assert.strictEqual(Buffer.from(pdfBytes.subarray(0, 5)).toString('ascii'), '%PDF-');

  // Sync conversion also works once initialized
  const syncPdf = convertXlsxToPdfSync(sampleXlsx, { paperSize: 'Letter' });
  assert.ok(syncPdf instanceof Uint8Array);
  assert.strictEqual(Buffer.from(syncPdf.subarray(0, 5)).toString('ascii'), '%PDF-');

  const info = await getWorkbookInfo(sampleXlsx);
  assert.ok(info.sheets.length >= 10);

  const doc = await XlsxDocument.load(sampleXlsx);
  const docPdf = doc.toPdf({ paperSize: 'A4' });
  assert.ok(docPdf.length > 1000);
  doc.dispose();
});
