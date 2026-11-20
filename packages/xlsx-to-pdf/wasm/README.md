# xlsx-to-pdf

Convert Excel (`.xlsx`) workbooks to PDF with the [IronCalc](https://www.ironcalc.com)
engine. This crate provides the WebAssembly bindings used by the
[`@jorgedanisc/xlsx-to-pdf`](https://www.npmjs.com/package/@jorgedanisc/xlsx-to-pdf)
npm package.

No LibreOffice, no headless browser, no external binaries.

## JavaScript / TypeScript usage

```bash
npm install @jorgedanisc/xlsx-to-pdf
```

```typescript
import { convertXlsxToPdf } from '@jorgedanisc/xlsx-to-pdf';
import fs from 'node:fs/promises';

const xlsxBytes = await fs.readFile('workbook.xlsx');
const pdfBytes = await convertXlsxToPdf(xlsxBytes);
await fs.writeFile('workbook.pdf', pdfBytes);
```

See the [project README](https://github.com/ironcalc/IronCalc/tree/main/packages/xlsx-to-pdf)
for Node.js, browser, and bundler integration.

## Native Rust

The PDF engine is also exposed as `xlsx_to_pdf::pdf`:

```rust
use ironcalc_base::Model;
use xlsx_to_pdf::pdf::{export_to_pdf, PdfExportOptions};

let model = Model::new_empty("Sheet1", "en", "UTC", "en").unwrap();
let options = PdfExportOptions::default().fit_to_page();
let pdf_bytes = export_to_pdf(&model, &options).unwrap();
```

The functions at the crate root are built with
[`wasm-bindgen`](https://crates.io/crates/wasm-bindgen) and are intended to be
called from JavaScript.

## License

Licensed under either of [Apache License, Version 2.0](LICENSE-Apache-2.0) or
[MIT license](LICENSE-MIT) at your option.
