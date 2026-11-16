import {
  XlsxDocument,
  __wbg_init,
  convertXlsxToPdf,
  getWorkbookInfo,
  initSync
} from "./chunk-BV2AWE4T.js";

// src/loader.browser.ts
var initialized = false;
var initPromise = null;
function isInitialized() {
  return initialized;
}
async function init(source) {
  if (initialized) return;
  if (initPromise) return initPromise;
  initPromise = (async () => {
    if (source instanceof Uint8Array || source instanceof ArrayBuffer || source instanceof WebAssembly.Module) {
      initSync({ module: source });
    } else if (source) {
      await __wbg_init(source);
    } else {
      await __wbg_init(new URL("./xlsx_to_pdf_wasm_bg.wasm", import.meta.url));
    }
    initialized = true;
  })();
  return initPromise;
}
function initSyncEngine(source) {
  if (initialized) return;
  if (source) {
    initSync({ module: source });
    initialized = true;
    return;
  }
  throw new Error(
    "In browser environments, initSyncEngine requires a BufferSource or WebAssembly.Module. Alternatively, use `await init()`."
  );
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

// src/browser.ts
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
  static async load(xlsxData) {
    await ensureInitialized();
    const bytes = normalizeInput(xlsxData);
    const inner = new XlsxDocument(bytes);
    return new _XlsxDocument(inner);
  }
  static loadSync(xlsxData) {
    ensureInitializedSync();
    const bytes = normalizeInput(xlsxData);
    const inner = new XlsxDocument(bytes);
    return new _XlsxDocument(inner);
  }
  toPdf(options) {
    return this.inner.toPdf(options ?? {});
  }
  getInfo() {
    if (!this.infoCache) {
      this.infoCache = this.inner.getInfo();
    }
    return this.infoCache;
  }
  get sheets() {
    return this.getInfo().sheets;
  }
  get fonts() {
    return this.getInfo().fonts;
  }
  dispose() {
    this.inner.free();
  }
  [Symbol.dispose]() {
    this.dispose();
  }
};
var browser_default = convertXlsxToPdf2;
export {
  XlsxDocument2 as XlsxDocument,
  convertXlsxToPdf2 as convertXlsxToPdf,
  convertXlsxToPdfSync,
  browser_default as default,
  getWorkbookInfo2 as getWorkbookInfo,
  getWorkbookInfoSync,
  init,
  initSyncEngine,
  isInitialized
};
//# sourceMappingURL=browser.js.map