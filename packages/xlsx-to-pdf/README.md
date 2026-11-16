# @jorgedanisc/xlsx-to-pdf

> Fast, pure WebAssembly Excel (`.xlsx`) to PDF converter for **Node.js**, **Browsers**, and **Edge runtimes**. Built on [IronCalc](https://github.com/ironcalc/IronCalc).

[![npm version](https://img.shields.io/npm/v/@jorgedanisc/xlsx-to-pdf.svg)](https://www.npmjs.com/package/@jorgedanisc/xlsx-to-pdf)
[![license](https://img.shields.io/npm/l/@jorgedanisc/xlsx-to-pdf.svg)](https://github.com/ironcalc/IronCalc)

No LibreOffice, no Puppeteer, no headless Chrome, no external native binaries, no cloud services. Just fast, deterministic WebAssembly.

---

## Features

- ⚡ **Pure WebAssembly**: Fast, lightweight, cross-platform execution with no external runtime dependencies.
- 🌐 **Isomorphic**: Runs seamlessly in **Node.js** (18+), **Browsers**, **Web Workers**, and modern bundlers (Vite, Webpack, Rollup, Next.js).
- 📦 **Zero-Config Node.js**: Works out of the box with zero manual WASM initialization in Node.js.
- 📐 **Rich Layout Controls**:
  - Paper sizes: `A4`, `Letter`, `Legal`, `Tabloid`, `A3`, `A5`, `Custom`, etc.
  - Orientations: `Portrait` or `Landscape`.
  - Scaling: `FitToWidth`, `FitToHeight`, `FitToPage`, or custom scale percentage.
  - Margins: `Normal`, `Narrow`, `Wide`, or point-accurate custom margins.
  - Gridlines & Row/Column headings toggle.
  - Scope: Export active sheet, entire workbook, or specific cell ranges (e.g. `A1:E20`).
  - Frozen headers and title repeating.
- 🔤 **Custom Fonts**: Embed TrueType (`.ttf`) or OpenType (`.otf`) fonts (e.g. Google Fonts) for pixel-perfect rendering.
- 🛡️ **Full TypeScript Support**: Comprehensive TypeScript definitions, CommonJS (`.cjs`), and ESM (`.mjs`) exports.

---

## Installation

```bash
npm install @jorgedanisc/xlsx-to-pdf
# or
pnpm add @jorgedanisc/xlsx-to-pdf
# or
yarn add @jorgedanisc/xlsx-to-pdf
```

---

## Quick Start

### Node.js

```typescript
import { convertXlsxToPdf } from '@jorgedanisc/xlsx-to-pdf';
import fs from 'node:fs/promises';

// Read your spreadsheet
const xlsxBytes = await fs.readFile('budget.xlsx');

// Convert to PDF
const pdfBytes = await convertXlsxToPdf(xlsxBytes, {
  paperSize: 'A4',
  orientation: 'Landscape',
  showGridLines: true,
  scale: 'FitToWidth',
});

// Save PDF to disk
await fs.writeFile('budget.pdf', pdfBytes);
```

Or using the file-to-file convenience helper:

```typescript
import { convertXlsxFileToPdf } from '@jorgedanisc/xlsx-to-pdf';

await convertXlsxFileToPdf('input.xlsx', 'output.pdf', {
  paperSize: 'Letter',
  orientation: 'Portrait',
});
```

Synchronous conversion is also supported in Node.js:

```typescript
import { convertXlsxToPdfSync } from '@jorgedanisc/xlsx-to-pdf';
import fs from 'node:fs';

const xlsxBytes = fs.readFileSync('input.xlsx');
const pdfBytes = convertXlsxToPdfSync(xlsxBytes, { paperSize: 'A4' });
fs.writeFileSync('output.pdf', pdfBytes);
```

---

### Browser (Vite / Webpack / Next.js / Vanilla)

In the browser, import from `'@jorgedanisc/xlsx-to-pdf'` (or `'@jorgedanisc/xlsx-to-pdf/browser'`):

```typescript
import { convertXlsxToPdf, init } from '@jorgedanisc/xlsx-to-pdf';

// Optional: customize the WASM location or let it load automatically
await init(); // or await init('/assets/xlsx_to_pdf_wasm_bg.wasm')

// Convert from an <input type="file"> event or fetch
async function handleFile(file: File) {
  const arrayBuffer = await file.arrayBuffer();
  const pdfBytes = await convertXlsxToPdf(arrayBuffer, {
    paperSize: 'A4',
    orientation: 'Portrait',
  });

  // Download the resulting PDF
  const blob = new Blob([pdfBytes], { type: 'application/pdf' });
  const url = URL.createObjectURL(blob);
  const a = document.createElement('a');
  a.href = url;
  a.download = 'export.pdf';
  a.click();
  URL.revokeObjectURL(url);
}
```

---

## Advanced Usage

### Inspect Workbook Metadata

Before exporting, you can inspect the worksheets and fonts used in the spreadsheet:

```typescript
import { getWorkbookInfo } from '@jorgedanisc/xlsx-to-pdf';

const info = await getWorkbookInfo(xlsxBytes);

console.log('Workbook name:', info.name);
console.log('Sheets:', info.sheets);
// [
//   { index: 0, name: 'Q1 Sales', visible: true },
//   { index: 1, name: 'Summary', visible: true }
// ]

console.log('Fonts used:', info.fonts);
// [
//   { family: 'Calibri', bold: false, italic: false },
//   { family: 'Calibri', bold: true, italic: false }
// ]
```

### In-Memory Document (`XlsxDocument`)

If you want to perform multiple exports of the same spreadsheet with different settings without re-parsing:

```typescript
import { XlsxDocument } from '@jorgedanisc/xlsx-to-pdf';

const doc = await XlsxDocument.load(xlsxBytes);

// Export Sheet 0 in portrait
const pdfSheet1 = doc.toPdf({
  sheetIndex: 0,
  paperSize: 'A4',
  orientation: 'Portrait',
});

// Export Sheet 1 in landscape
const pdfSheet2 = doc.toPdf({
  sheetIndex: 1,
  paperSize: 'A4',
  orientation: 'Landscape',
});

// Free WASM memory when done
doc.dispose();
```

`XlsxDocument` also supports Explicit Resource Management (`using` statement):

```typescript
{
  using doc = await XlsxDocument.load(xlsxBytes);
  const pdf = doc.toPdf();
  // Automatically disposed at end of scope
}
```

---

### Custom Fonts Embedding

By default, the engine uses built-in standard fonts. You can embed custom TrueType (`.ttf`) or OpenType (`.otf`) fonts to preserve branding or special typography:

```typescript
import { convertXlsxToPdf } from '@jorgedanisc/xlsx-to-pdf';
import fs from 'node:fs/promises';

const interFont = await fs.readFile('Inter-Regular.ttf');
const interBoldFont = await fs.readFile('Inter-Bold.ttf');

const pdfBytes = await convertXlsxToPdf(xlsxBytes, {
  customFonts: [
    { family: 'Inter', data: interFont },
    { family: 'Inter', data: interBoldFont },
  ],
});
```

Fonts can be provided as `Uint8Array`, `Buffer`, or base64-encoded strings.

---

## API Reference

### `convertXlsxToPdf(xlsxData, options?): Promise<Uint8Array>`
Converts XLSX file data (`Uint8Array`, `Buffer`, or `ArrayBuffer`) into PDF bytes.

### `convertXlsxToPdfSync(xlsxData, options?): Uint8Array`
Synchronously converts XLSX bytes into PDF bytes (Node.js or pre-initialized browser).

### `getWorkbookInfo(xlsxData): Promise<WorkbookInfo>`
Retrieves worksheet names, indices, visibility flags, and font descriptors.

### `convertXlsxFileToPdf(inputPath, outputPath, options?): Promise<void>`
Node.js helper to read an `.xlsx` file from disk and write the `.pdf` to disk.

### `init(source?): Promise<void>`
Explicitly initializes the WebAssembly engine. Accepts a URL, fetch Request/Response, ArrayBuffer, or WebAssembly.Module.

---

## Options (`PdfExportOptions`)

| Option | Type | Default | Description |
|---|---|---|---|
| `paperSize` | `PaperSize` | `'A4'` | `'A4'`, `'Letter'`, `'Legal'`, `'Tabloid'`, `'A3'`, `'A5'`, etc. |
| `orientation` | `Orientation` | `'Portrait'` | `'Portrait'` or `'Landscape'`. |
| `scale` | `ScaleMode` | `'FitToWidth'` | `'Normal'`, `'FitToWidth'`, `'FitToHeight'`, `'FitToPage'`, or `'Custom'`. |
| `scalePercentage` | `number` | `undefined` | Scale percentage (e.g. `100` for 100%) when `scale: 'Custom'`. |
| `margins` | `MarginPreset` | `'Normal'` | `'Normal'`, `'Narrow'`, `'Wide'`, or `'Custom'`. |
| `marginTopPt` | `number` | `undefined` | Top margin in points (72 pt = 1 inch). |
| `marginRightPt` | `number` | `undefined` | Right margin in points. |
| `marginBottomPt` | `number` | `undefined` | Bottom margin in points. |
| `marginLeftPt` | `number` | `undefined` | Left margin in points. |
| `showGridLines` | `boolean` | `false` | Whether to render worksheet cell gridlines. |
| `showHeadings` | `boolean` | `false` | Whether to print column letters (A, B, C) and row numbers (1, 2, 3). |
| `scope` | `string` | `'ActiveSheet'` | `'ActiveSheet'`, `'EntireWorkbook'`, or `'SelectedCells'`. |
| `sheetIndex` | `number` | `0` | 0-based index of worksheet to export. |
| `selectionRange` | `string` | `undefined` | Cell range (e.g. `'A1:F20'`) when `scope: 'SelectedCells'`. |
| `pageOrder` | `PageOrder` | `'DownThenOver'` | `'DownThenOver'` or `'OverThenDown'`. |
| `horizontalAlignment` | `string` | `'Left'` | `'Left'`, `'Center'`, or `'Right'`. |
| `verticalAlignment` | `string` | `'Top'` | `'Top'`, `'Middle'`, or `'Bottom'`. |
| `pageNumbers` | `boolean` | `false` | Display page numbers in footer. |
| `workbookTitle` | `boolean` | `false` | Display workbook title in header. |
| `sheetName` | `boolean` | `false` | Display sheet name in header. |
| `currentDate` | `boolean` | `false` | Display export date in header/footer. |
| `currentTime` | `boolean` | `false` | Display export time in header/footer. |
| `repeatFrozenRows` | `boolean` | `true` | Repeat frozen rows at top of each page. |
| `repeatFrozenColumns` | `boolean` | `true` | Repeat frozen columns at left of each page. |
| `customFonts` | `CustomFont[]` | `[]` | Embedded TrueType/OpenType font definitions. |

---

## License

MIT OR Apache-2.0 © IronCalc Contributors
