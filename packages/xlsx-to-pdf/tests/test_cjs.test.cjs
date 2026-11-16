const test = require('node:test');
const assert = require('node:assert');
const fs = require('node:fs');
const path = require('node:path');

const {
  convertXlsxToPdf,
  convertXlsxToPdfSync,
  getWorkbookInfoSync,
  XlsxDocument,
} = require('../dist/index.cjs');

const exampleXlsxPath = path.resolve(__dirname, '../../../xlsx/tests/example.xlsx');
const sampleXlsx = fs.readFileSync(exampleXlsxPath);

test('CJS: convertXlsxToPdf async and sync work in CommonJS', async () => {
  const pdfAsync = await convertXlsxToPdf(sampleXlsx, { paperSize: 'A4' });
  assert.ok(pdfAsync instanceof Uint8Array);
  assert.strictEqual(Buffer.from(pdfAsync.subarray(0, 5)).toString('ascii'), '%PDF-');

  const pdfSync = convertXlsxToPdfSync(sampleXlsx, { paperSize: 'Letter' });
  assert.ok(pdfSync instanceof Uint8Array);
  assert.strictEqual(Buffer.from(pdfSync.subarray(0, 5)).toString('ascii'), '%PDF-');
});

test('CJS: XlsxDocument works in CommonJS', () => {
  const doc = XlsxDocument.loadSync(sampleXlsx);
  assert.ok(doc.sheets.length >= 10);
  const pdf = doc.toPdf({ orientation: 'Landscape' });
  assert.ok(pdf.length > 1000);
  doc.dispose();
});
