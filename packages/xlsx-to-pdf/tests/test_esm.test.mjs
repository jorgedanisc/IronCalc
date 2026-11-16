import test from 'node:test';
import assert from 'node:assert';
import fs from 'node:fs';
import os from 'node:os';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

import {
  convertXlsxToPdf,
  convertXlsxToPdfSync,
  getWorkbookInfo,
  getWorkbookInfoSync,
  XlsxDocument,
  convertXlsxFileToPdf,
  convertXlsxFileToPdfSync,
  isInitialized,
} from '../dist/index.js';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const exampleXlsxPath = path.resolve(__dirname, '../../../xlsx/tests/example.xlsx');
const sampleXlsx = fs.readFileSync(exampleXlsxPath);

test('convertXlsxToPdf: converts xlsx bytes to valid PDF asynchronously', async () => {
  const pdfBytes = await convertXlsxToPdf(sampleXlsx);
  assert.ok(pdfBytes instanceof Uint8Array, 'Result should be Uint8Array');
  assert.ok(pdfBytes.length > 1000, 'PDF size should be substantial');

  // Verify PDF magic bytes '%PDF-'
  const header = Buffer.from(pdfBytes.subarray(0, 5)).toString('ascii');
  assert.strictEqual(header, '%PDF-');

  // Engine is now initialized
  assert.strictEqual(isInitialized(), true);
});

test('convertXlsxToPdf: supports options (paperSize, orientation, gridlines)', async () => {
  const pdfPortrait = await convertXlsxToPdf(sampleXlsx, {
    paperSize: 'A4',
    orientation: 'Portrait',
    showGridLines: true,
  });

  const pdfLandscape = await convertXlsxToPdf(sampleXlsx, {
    paperSize: 'Letter',
    orientation: 'Landscape',
    showGridLines: false,
    scale: 'FitToWidth',
  });

  assert.ok(pdfPortrait.length > 0);
  assert.ok(pdfLandscape.length > 0);
  // Different settings should generate different PDFs
  assert.notStrictEqual(pdfPortrait.length, pdfLandscape.length);
});

test('convertXlsxToPdf: supports sheet selection and selection range', async () => {
  const sheet0 = await convertXlsxToPdf(sampleXlsx, {
    sheetIndex: 0,
  });

  const sheet1 = await convertXlsxToPdf(sampleXlsx, {
    sheetIndex: 1,
  });

  assert.ok(sheet0.length > 0);
  assert.ok(sheet1.length > 0);

  const rangePdf = await convertXlsxToPdf(sampleXlsx, {
    scope: 'SelectedCells',
    sheetIndex: 0,
    selectionRange: 'A1:C5',
  });
  assert.ok(rangePdf.length > 0);
});

test('convertXlsxToPdfSync: converts synchronously', () => {
  const pdfBytes = convertXlsxToPdfSync(sampleXlsx, { paperSize: 'A4' });
  assert.ok(pdfBytes instanceof Uint8Array);
  const header = Buffer.from(pdfBytes.subarray(0, 5)).toString('ascii');
  assert.strictEqual(header, '%PDF-');
});

test('getWorkbookInfo: retrieves sheet list and font descriptors', async () => {
  const info = await getWorkbookInfo(sampleXlsx);
  assert.ok(Array.isArray(info.sheets));
  assert.ok(info.sheets.length >= 10);
  assert.strictEqual(info.sheets[0].name, 'Sheet1');
  assert.strictEqual(info.sheets[0].visible, true);

  assert.ok(Array.isArray(info.fonts));
  assert.ok(info.fonts.length > 0);
  const fontFamilies = info.fonts.map((f) => f.family);
  assert.ok(fontFamilies.includes('Calibri'));
});

test('getWorkbookInfoSync: retrieves info synchronously', () => {
  const info = getWorkbookInfoSync(sampleXlsx);
  assert.ok(info.sheets.length >= 10);
});

test('XlsxDocument: load, inspect, and export multiple times', async () => {
  const doc = await XlsxDocument.load(sampleXlsx);
  assert.ok(doc.sheets.length >= 10);
  assert.ok(doc.fonts.length > 0);

  const pdfA4 = doc.toPdf({ paperSize: 'A4' });
  const pdfLetter = doc.toPdf({ paperSize: 'Letter', orientation: 'Landscape' });

  assert.ok(pdfA4.length > 0);
  assert.ok(pdfLetter.length > 0);

  doc.dispose();
});

test('convertXlsxFileToPdf & convertXlsxFileToPdfSync: converts files directly on disk', async () => {
  const tmpOutAsync = path.join(os.tmpdir(), `test_output_async_${Date.now()}.pdf`);
  const tmpOutSync = path.join(os.tmpdir(), `test_output_sync_${Date.now()}.pdf`);

  try {
    await convertXlsxFileToPdf(exampleXlsxPath, tmpOutAsync, { paperSize: 'A4' });
    assert.ok(fs.existsSync(tmpOutAsync));
    assert.ok(fs.statSync(tmpOutAsync).size > 1000);

    convertXlsxFileToPdfSync(exampleXlsxPath, tmpOutSync, { paperSize: 'Letter' });
    assert.ok(fs.existsSync(tmpOutSync));
    assert.ok(fs.statSync(tmpOutSync).size > 1000);
  } finally {
    if (fs.existsSync(tmpOutAsync)) fs.unlinkSync(tmpOutAsync);
    if (fs.existsSync(tmpOutSync)) fs.unlinkSync(tmpOutSync);
  }
});
