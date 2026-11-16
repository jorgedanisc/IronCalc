import { W as WasmInitInput, P as PdfExportOptions, a as WorkbookInfo, S as SheetInfo, F as FontDescriptor } from './types-CgwJlEU-.js';
export { C as CustomFont, H as HorizontalAlignment, M as MarginPreset, O as Orientation, b as PageOrder, c as PaperSize, d as ScaleMode, V as VerticalAlignment } from './types-CgwJlEU-.js';

/**
 * Check if the WASM engine is currently initialized.
 */
declare function isInitialized(): boolean;
/**
 * Initialize the WebAssembly engine.
 *
 * In Node.js, calling this is optional as the library automatically initializes
 * from the bundled WebAssembly binary on first use.
 */
declare function init(source?: WasmInitInput): Promise<void>;
/**
 * Synchronous initialization of the WebAssembly engine.
 */
declare function initSyncEngine(source?: BufferSource | WebAssembly.Module): void;

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
declare function convertXlsxToPdf(xlsxData: Uint8Array | ArrayBuffer, options?: PdfExportOptions): Promise<Uint8Array>;
/**
 * Converts XLSX spreadsheet bytes into PDF bytes synchronously.
 *
 * Available in Node.js environments or anywhere the WASM engine has been pre-initialized.
 *
 * @param xlsxData - Raw XLSX file data as a `Uint8Array`, `Buffer`, or `ArrayBuffer`.
 * @param options - Configuration for the PDF export.
 * @returns The generated PDF bytes as a `Uint8Array`.
 */
declare function convertXlsxToPdfSync(xlsxData: Uint8Array | ArrayBuffer, options?: PdfExportOptions): Uint8Array;
/**
 * Retrieves workbook metadata including sheet names, sheet indices, visibility,
 * and font descriptors used in the spreadsheet.
 *
 * @param xlsxData - Raw XLSX file data as a `Uint8Array`, `Buffer`, or `ArrayBuffer`.
 * @returns A Promise resolving to `WorkbookInfo`.
 */
declare function getWorkbookInfo(xlsxData: Uint8Array | ArrayBuffer): Promise<WorkbookInfo>;
/**
 * Retrieves workbook metadata synchronously.
 *
 * Available in Node.js or anywhere the WASM engine has been pre-initialized.
 */
declare function getWorkbookInfoSync(xlsxData: Uint8Array | ArrayBuffer): WorkbookInfo;
/**
 * Represents a parsed XLSX workbook in memory.
 *
 * Useful when performing multiple PDF exports with different settings
 * or inspecting workbook metadata without reparsing the XLSX archive repeatedly.
 */
declare class XlsxDocument {
    private inner;
    private infoCache?;
    private constructor();
    /**
     * Parses an XLSX file and returns an `XlsxDocument` instance.
     */
    static load(xlsxData: Uint8Array | ArrayBuffer): Promise<XlsxDocument>;
    /**
     * Synchronously parses an XLSX file and returns an `XlsxDocument` instance.
     */
    static loadSync(xlsxData: Uint8Array | ArrayBuffer): XlsxDocument;
    /**
     * Exports this document or a selected sheet to PDF according to the provided options.
     *
     * @param options - Configuration for the PDF export.
     * @returns Generated PDF bytes as a `Uint8Array`.
     */
    toPdf(options?: PdfExportOptions): Uint8Array;
    /**
     * Returns metadata about this workbook (sheet names, visibility, and font descriptors).
     */
    getInfo(): WorkbookInfo;
    /**
     * List of worksheets in this workbook.
     */
    get sheets(): SheetInfo[];
    /**
     * List of font descriptors (family, bold, italic) used in this workbook.
     */
    get fonts(): FontDescriptor[];
    /**
     * Releases the WebAssembly memory allocated for this document.
     */
    dispose(): void;
    /**
     * Explicit Resource Management support (`using doc = await XlsxDocument.load(...)`).
     */
    [Symbol.dispose](): void;
}
/**
 * Node.js convenience helper to convert a file from disk directly to a PDF file on disk.
 *
 * @param inputFilePath - Path to the source `.xlsx` file.
 * @param outputFilePath - Destination path for the `.pdf` file.
 * @param options - PDF export options.
 */
declare function convertXlsxFileToPdf(inputFilePath: string, outputFilePath: string, options?: PdfExportOptions): Promise<void>;
/**
 * Synchronous Node.js convenience helper to convert an `.xlsx` file on disk to a `.pdf` file.
 */
declare function convertXlsxFileToPdfSync(inputFilePath: string, outputFilePath: string, options?: PdfExportOptions): void;

export { FontDescriptor, PdfExportOptions, SheetInfo, WasmInitInput, WorkbookInfo, XlsxDocument, convertXlsxFileToPdf, convertXlsxFileToPdfSync, convertXlsxToPdf, convertXlsxToPdfSync, convertXlsxToPdf as default, getWorkbookInfo, getWorkbookInfoSync, init, initSyncEngine, isInitialized };
