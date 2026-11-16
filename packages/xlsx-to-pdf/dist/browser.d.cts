import { W as WasmInitInput, P as PdfExportOptions, a as WorkbookInfo, S as SheetInfo, F as FontDescriptor } from './types-CgwJlEU-.cjs';
export { C as CustomFont, H as HorizontalAlignment, M as MarginPreset, O as Orientation, b as PageOrder, c as PaperSize, d as ScaleMode, V as VerticalAlignment } from './types-CgwJlEU-.cjs';

/**
 * Check if the WASM engine is currently initialized.
 */
declare function isInitialized(): boolean;
/**
 * Initialize the WebAssembly engine in the browser or WebWorker.
 *
 * @param source - Optional URL, Request, Response, ArrayBuffer, or WebAssembly.Module.
 *                 If omitted, defaults to loading `xlsx_to_pdf_wasm_bg.wasm` relative to this module.
 */
declare function init(source?: WasmInitInput): Promise<void>;
/**
 * Synchronous initialization in the browser using preloaded bytes or module.
 */
declare function initSyncEngine(source?: BufferSource | WebAssembly.Module): void;

/**
 * Converts XLSX spreadsheet bytes into PDF bytes asynchronously in the browser.
 */
declare function convertXlsxToPdf(xlsxData: Uint8Array | ArrayBuffer, options?: PdfExportOptions): Promise<Uint8Array>;
/**
 * Converts XLSX spreadsheet bytes into PDF bytes synchronously in the browser.
 * Requires calling `await init(...)` beforehand.
 */
declare function convertXlsxToPdfSync(xlsxData: Uint8Array | ArrayBuffer, options?: PdfExportOptions): Uint8Array;
/**
 * Retrieves workbook metadata including sheet names, visibility, and font descriptors.
 */
declare function getWorkbookInfo(xlsxData: Uint8Array | ArrayBuffer): Promise<WorkbookInfo>;
/**
 * Retrieves workbook metadata synchronously. Requires pre-initialization.
 */
declare function getWorkbookInfoSync(xlsxData: Uint8Array | ArrayBuffer): WorkbookInfo;
/**
 * Represents a parsed XLSX workbook in memory.
 */
declare class XlsxDocument {
    private inner;
    private infoCache?;
    private constructor();
    static load(xlsxData: Uint8Array | ArrayBuffer): Promise<XlsxDocument>;
    static loadSync(xlsxData: Uint8Array | ArrayBuffer): XlsxDocument;
    toPdf(options?: PdfExportOptions): Uint8Array;
    getInfo(): WorkbookInfo;
    get sheets(): SheetInfo[];
    get fonts(): FontDescriptor[];
    dispose(): void;
    [Symbol.dispose](): void;
}

export { FontDescriptor, PdfExportOptions, SheetInfo, WasmInitInput, WorkbookInfo, XlsxDocument, convertXlsxToPdf, convertXlsxToPdfSync, convertXlsxToPdf as default, getWorkbookInfo, getWorkbookInfoSync, init, initSyncEngine, isInitialized };
