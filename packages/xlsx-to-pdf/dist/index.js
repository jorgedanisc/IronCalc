import {
  XlsxDocument,
  __dirname,
  __wbg_init,
  convertXlsxToPdf,
  getWorkbookInfo,
  initSync
} from "./chunk-BV2AWE4T.js";

// src/index.ts
import * as fs2 from "fs";
import * as fsPromises from "fs/promises";

// src/loader.node.ts
import * as fs from "fs";
import * as path from "path";
import { fileURLToPath } from "url";
var initialized = false;
var initPromise = null;
function getWasmBytes() {
  let wasmPath;
  try {
    wasmPath = fileURLToPath(new URL("./xlsx_to_pdf_wasm_bg.wasm", import.meta.url));
  } catch {
    wasmPath = path.resolve(__dirname, "xlsx_to_pdf_wasm_bg.wasm");
  }
  return fs.readFileSync(wasmPath);
}
function isInitialized() {
  return initialized;
}
async function init(source) {
  if (initialized) return;
  if (initPromise) return initPromise;
  initPromise = (async () => {
    if (source) {
      if (source instanceof Uint8Array || source instanceof ArrayBuffer || source instanceof WebAssembly.Module) {
        initSync({ module: source });
      } else {
        await __wbg_init(source);
      }
    } else {
      const bytes = getWasmBytes();
      initSync({ module: bytes });
    }
    initialized = true;
  })();
  return initPromise;
}
function initSyncEngine(source) {
  if (initialized) return;
  if (source) {
    initSync({ module: source });
  } else {
    const bytes = getWasmBytes();
    initSync({ module: bytes });
  }
  initialized = true;
}
async function ensureInitialized() {
  if (!initialized) {
    await init();
  }
}
function ensureInitializedSync() {
  if (!initialized) {
    initSyncEngine();
  }
}

// src/index.ts
function normalizeInput(input) {
  if (input instanceof Uint8Array) {
    return input;
  }
  if (input instanceof ArrayBuffer) {
    return new Uint8Array(input);
  }
  if (typeof input === "object" && input !== null && "buffer" in input && input.buffer instanceof ArrayBuffer) {
    const view = input;
    return new Uint8Array(view.buffer, view.byteOffset, view.byteLength);
  }
  throw new TypeError(
    "Expected xlsx input to be an instance of Uint8Array, Buffer, or ArrayBuffer"
  );
}
async function convertXlsxToPdf2(xlsxData, options) {
  await ensureInitialized();
  const bytes = normalizeInput(xlsxData);
  return convertXlsxToPdf(bytes, options ?? {});
}
function convertXlsxToPdfSync(xlsxData, options) {
  ensureInitializedSync();
  const bytes = normalizeInput(xlsxData);
  return convertXlsxToPdf(bytes, options ?? {});
}
async function getWorkbookInfo2(xlsxData) {
  await ensureInitialized();
  const bytes = normalizeInput(xlsxData);
  return getWorkbookInfo(bytes);
}
function getWorkbookInfoSync(xlsxData) {
  ensureInitializedSync();
  const bytes = normalizeInput(xlsxData);
  return getWorkbookInfo(bytes);
}
var XlsxDocument2 = class _XlsxDocument {
  inner;
  infoCache;
  constructor(inner) {
    this.inner = inner;
  }
  /**
   * Parses an XLSX file and returns an `XlsxDocument` instance.
   */
  static async load(xlsxData) {
    await ensureInitialized();
    const bytes = normalizeInput(xlsxData);
    const inner = new XlsxDocument(bytes);
    return new _XlsxDocument(inner);
  }
  /**
   * Synchronously parses an XLSX file and returns an `XlsxDocument` instance.
   */
  static loadSync(xlsxData) {
    ensureInitializedSync();
    const bytes = normalizeInput(xlsxData);
    const inner = new XlsxDocument(bytes);
    return new _XlsxDocument(inner);
  }
  /**
   * Exports this document or a selected sheet to PDF according to the provided options.
   *
   * @param options - Configuration for the PDF export.
   * @returns Generated PDF bytes as a `Uint8Array`.
   */
  toPdf(options) {
    return this.inner.toPdf(options ?? {});
  }
  /**
   * Returns metadata about this workbook (sheet names, visibility, and font descriptors).
   */
  getInfo() {
    if (!this.infoCache) {
      this.infoCache = this.inner.getInfo();
    }
    return this.infoCache;
  }
  /**
   * List of worksheets in this workbook.
   */
  get sheets() {
    return this.getInfo().sheets;
  }
  /**
   * List of font descriptors (family, bold, italic) used in this workbook.
   */
  get fonts() {
    return this.getInfo().fonts;
  }
  /**
   * Releases the WebAssembly memory allocated for this document.
   */
  dispose() {
    this.inner.free();
  }
  /**
   * Explicit Resource Management support (`using doc = await XlsxDocument.load(...)`).
   */
  [Symbol.dispose]() {
    this.dispose();
  }
};
async function convertXlsxFileToPdf(inputFilePath, outputFilePath, options) {
  const xlsxBytes = await fsPromises.readFile(inputFilePath);
  const pdfBytes = await convertXlsxToPdf2(xlsxBytes, options);
  await fsPromises.writeFile(outputFilePath, pdfBytes);
}
function convertXlsxFileToPdfSync(inputFilePath, outputFilePath, options) {
  const xlsxBytes = fs2.readFileSync(inputFilePath);
  const pdfBytes = convertXlsxToPdfSync(xlsxBytes, options);
  fs2.writeFileSync(outputFilePath, pdfBytes);
}
var index_default = convertXlsxToPdf2;
export {
  XlsxDocument2 as XlsxDocument,
  convertXlsxFileToPdf,
  convertXlsxFileToPdfSync,
  convertXlsxToPdf2 as convertXlsxToPdf,
  convertXlsxToPdfSync,
  index_default as default,
  getWorkbookInfo2 as getWorkbookInfo,
  getWorkbookInfoSync,
  init,
  initSyncEngine,
  isInitialized
};
//# sourceMappingURL=index.js.map