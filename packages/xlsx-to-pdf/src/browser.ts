import {
  convertXlsxToPdf as wasmConvertXlsxToPdf,
  getWorkbookInfo as wasmGetWorkbookInfo,
  XlsxDocument as WasmXlsxDocument,
} from '../pkg-wasm/xlsx_to_pdf.js';

import {
  init,
  initSyncEngine,
  isInitialized,
  ensureInitialized,
  ensureInitializedSync,
} from './loader.browser.js';

import type {
  CustomFont,
  FontDescriptor,
  HorizontalAlignment,
  MarginPreset,
  Orientation,
  PageOrder,
  PaperSize,
  PdfExportOptions,
  ScaleMode,
  SheetInfo,
  VerticalAlignment,
  WasmInitInput,
  WorkbookInfo,
} from './types.js';

export type {
  CustomFont,
  FontDescriptor,
  HorizontalAlignment,
  MarginPreset,
  Orientation,
  PageOrder,
  PaperSize,
  PdfExportOptions,
  ScaleMode,
  SheetInfo,
  VerticalAlignment,
  WasmInitInput,
  WorkbookInfo,
};

export { init, initSyncEngine, isInitialized };

/**
 * Normalizes input bytes into a Uint8Array.
 */
function normalizeInput(input: Uint8Array | ArrayBuffer | unknown): Uint8Array {
  if (input instanceof Uint8Array) {
    return input;
  }
  if (input instanceof ArrayBuffer) {
    return new Uint8Array(input);
  }
  if (
    typeof input === 'object' &&
    input !== null &&
    'buffer' in input &&
    (input as { buffer: unknown }).buffer instanceof ArrayBuffer
  ) {
    const view = input as ArrayBufferView;
    return new Uint8Array(view.buffer, view.byteOffset, view.byteLength);
  }
  throw new TypeError(
    'Expected xlsx input to be an instance of Uint8Array, Buffer, or ArrayBuffer'
  );
}

/**
 * Converts XLSX spreadsheet bytes into PDF bytes asynchronously in the browser.
 */
export async function convertXlsxToPdf(
  xlsxData: Uint8Array | ArrayBuffer,
  options?: PdfExportOptions
): Promise<Uint8Array> {
  await ensureInitialized();
  const bytes = normalizeInput(xlsxData);
  return wasmConvertXlsxToPdf(bytes, options ?? {});
}

/**
 * Converts XLSX spreadsheet bytes into PDF bytes synchronously in the browser.
 * Requires calling `await init(...)` beforehand.
 */
export function convertXlsxToPdfSync(
  xlsxData: Uint8Array | ArrayBuffer,
  options?: PdfExportOptions
): Uint8Array {
  ensureInitializedSync();
  const bytes = normalizeInput(xlsxData);
  return wasmConvertXlsxToPdf(bytes, options ?? {});
}

/**
 * Retrieves workbook metadata including sheet names, visibility, and font descriptors.
 */
export async function getWorkbookInfo(
  xlsxData: Uint8Array | ArrayBuffer
): Promise<WorkbookInfo> {
  await ensureInitialized();
  const bytes = normalizeInput(xlsxData);
  return wasmGetWorkbookInfo(bytes) as WorkbookInfo;
}

/**
 * Retrieves workbook metadata synchronously. Requires pre-initialization.
 */
export function getWorkbookInfoSync(
  xlsxData: Uint8Array | ArrayBuffer
): WorkbookInfo {
  ensureInitializedSync();
  const bytes = normalizeInput(xlsxData);
  return wasmGetWorkbookInfo(bytes) as WorkbookInfo;
}

/**
 * Represents a parsed XLSX workbook in memory.
 */
export class XlsxDocument {
  private inner: WasmXlsxDocument;
  private infoCache?: WorkbookInfo;

  private constructor(inner: WasmXlsxDocument) {
    this.inner = inner;
  }

  static async load(xlsxData: Uint8Array | ArrayBuffer): Promise<XlsxDocument> {
    await ensureInitialized();
    const bytes = normalizeInput(xlsxData);
    const inner = new WasmXlsxDocument(bytes);
    return new XlsxDocument(inner);
  }

  static loadSync(xlsxData: Uint8Array | ArrayBuffer): XlsxDocument {
    ensureInitializedSync();
    const bytes = normalizeInput(xlsxData);
    const inner = new WasmXlsxDocument(bytes);
    return new XlsxDocument(inner);
  }

  toPdf(options?: PdfExportOptions): Uint8Array {
    return this.inner.toPdf(options ?? {});
  }

  getInfo(): WorkbookInfo {
    if (!this.infoCache) {
      this.infoCache = this.inner.getInfo() as WorkbookInfo;
    }
    return this.infoCache;
  }

  get sheets(): SheetInfo[] {
    return this.getInfo().sheets;
  }

  get fonts(): FontDescriptor[] {
    return this.getInfo().fonts;
  }

  dispose(): void {
    this.inner.free();
  }

  [Symbol.dispose](): void {
    this.dispose();
  }
}

export default convertXlsxToPdf;
