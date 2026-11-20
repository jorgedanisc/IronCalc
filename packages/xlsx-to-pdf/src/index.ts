import * as fs from 'node:fs';
import * as fsPromises from 'node:fs/promises';
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
} from './loader.node.js';

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
 * Normalizes input bytes from Uint8Array, Buffer, or ArrayBuffer into a Uint8Array.
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
 * Converts XLSX spreadsheet bytes into PDF bytes asynchronously.
 *
 * Automatically initializes the WebAssembly engine if not yet initialized.
 *
 * @param xlsxData - Raw XLSX file data as a `Uint8Array`, `Buffer`, or `ArrayBuffer`.
 * @param options - Configuration for the PDF export (paper size, orientation, margins, gridlines, fonts, etc.).
 * @returns A Promise resolving to the generated PDF bytes as a `Uint8Array`.
 *
 * @example
 * ```ts
 * import { convertXlsxToPdf } from 'xlsx-to-pdf';
 * import fs from 'node:fs';
 *
 * const xlsxBytes = fs.readFileSync('financials.xlsx');
 * const pdfBytes = await convertXlsxToPdf(xlsxBytes, {
 *   paperSize: 'A4',
 *   orientation: 'Landscape',
 *   showGridLines: true,
 *   scale: 'FitToWidth',
 * });
 * fs.writeFileSync('financials.pdf', pdfBytes);
 * ```
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
 * Converts XLSX spreadsheet bytes into PDF bytes synchronously.
 *
 * Available in Node.js environments or anywhere the WASM engine has been pre-initialized.
 *
 * @param xlsxData - Raw XLSX file data as a `Uint8Array`, `Buffer`, or `ArrayBuffer`.
 * @param options - Configuration for the PDF export.
 * @returns The generated PDF bytes as a `Uint8Array`.
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
 * Retrieves workbook metadata including sheet names, sheet indices, visibility,
 * and font descriptors used in the spreadsheet.
 *
 * @param xlsxData - Raw XLSX file data as a `Uint8Array`, `Buffer`, or `ArrayBuffer`.
 * @returns A Promise resolving to `WorkbookInfo`.
 */
export async function getWorkbookInfo(
  xlsxData: Uint8Array | ArrayBuffer
): Promise<WorkbookInfo> {
  await ensureInitialized();
  const bytes = normalizeInput(xlsxData);
  return wasmGetWorkbookInfo(bytes) as WorkbookInfo;
}

/**
 * Retrieves workbook metadata synchronously.
 *
 * Available in Node.js or anywhere the WASM engine has been pre-initialized.
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
 *
 * Useful when performing multiple PDF exports with different settings
 * or inspecting workbook metadata without reparsing the XLSX archive repeatedly.
 */
export class XlsxDocument {
  private inner: WasmXlsxDocument;
  private infoCache?: WorkbookInfo;

  private constructor(inner: WasmXlsxDocument) {
    this.inner = inner;
  }

  /**
   * Parses an XLSX file and returns an `XlsxDocument` instance.
   */
  static async load(xlsxData: Uint8Array | ArrayBuffer): Promise<XlsxDocument> {
    await ensureInitialized();
    const bytes = normalizeInput(xlsxData);
    const inner = new WasmXlsxDocument(bytes);
    return new XlsxDocument(inner);
  }

  /**
   * Synchronously parses an XLSX file and returns an `XlsxDocument` instance.
   */
  static loadSync(xlsxData: Uint8Array | ArrayBuffer): XlsxDocument {
    ensureInitializedSync();
    const bytes = normalizeInput(xlsxData);
    const inner = new WasmXlsxDocument(bytes);
    return new XlsxDocument(inner);
  }

  /**
   * Exports this document or a selected sheet to PDF according to the provided options.
   *
   * @param options - Configuration for the PDF export.
   * @returns Generated PDF bytes as a `Uint8Array`.
   */
  toPdf(options?: PdfExportOptions): Uint8Array {
    return this.inner.toPdf(options ?? {});
  }

  /**
   * Returns metadata about this workbook (sheet names, visibility, and font descriptors).
   */
  getInfo(): WorkbookInfo {
    if (!this.infoCache) {
      this.infoCache = this.inner.getInfo() as WorkbookInfo;
    }
    return this.infoCache;
  }

  /**
   * List of worksheets in this workbook.
   */
  get sheets(): SheetInfo[] {
    return this.getInfo().sheets;
  }

  /**
   * List of font descriptors (family, bold, italic) used in this workbook.
   */
  get fonts(): FontDescriptor[] {
    return this.getInfo().fonts;
  }

  /**
   * Releases the WebAssembly memory allocated for this document.
   */
  dispose(): void {
    this.inner.free();
  }

  /**
   * Explicit Resource Management support (`using doc = await XlsxDocument.load(...)`).
   */
  [Symbol.dispose](): void {
    this.dispose();
  }
}

/**
 * Node.js convenience helper to convert a file from disk directly to a PDF file on disk.
 *
 * @param inputFilePath - Path to the source `.xlsx` file.
 * @param outputFilePath - Destination path for the `.pdf` file.
 * @param options - PDF export options.
 */
export async function convertXlsxFileToPdf(
  inputFilePath: string,
  outputFilePath: string,
  options?: PdfExportOptions
): Promise<void> {
  const xlsxBytes = await fsPromises.readFile(inputFilePath);
  const pdfBytes = await convertXlsxToPdf(xlsxBytes, options);
  await fsPromises.writeFile(outputFilePath, pdfBytes);
}

/**
 * Synchronous Node.js convenience helper to convert an `.xlsx` file on disk to a `.pdf` file.
 */
export function convertXlsxFileToPdfSync(
  inputFilePath: string,
  outputFilePath: string,
  options?: PdfExportOptions
): void {
  const xlsxBytes = fs.readFileSync(inputFilePath);
  const pdfBytes = convertXlsxToPdfSync(xlsxBytes, options);
  fs.writeFileSync(outputFilePath, pdfBytes);
}

export default convertXlsxToPdf;
