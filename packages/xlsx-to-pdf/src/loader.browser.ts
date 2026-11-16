import initWasm, { initSync } from '../pkg-wasm/xlsx_to_pdf_wasm.js';
import type { WasmInitInput } from './types.js';

let initialized = false;
let initPromise: Promise<void> | null = null;

/**
 * Check if the WASM engine is currently initialized.
 */
export function isInitialized(): boolean {
  return initialized;
}

/**
 * Initialize the WebAssembly engine in the browser or WebWorker.
 *
 * @param source - Optional URL, Request, Response, ArrayBuffer, or WebAssembly.Module.
 *                 If omitted, defaults to loading `xlsx_to_pdf_wasm_bg.wasm` relative to this module.
 */
export async function init(source?: WasmInitInput): Promise<void> {
  if (initialized) return;
  if (initPromise) return initPromise;

  initPromise = (async () => {
    if (
      source instanceof Uint8Array ||
      source instanceof ArrayBuffer ||
      source instanceof WebAssembly.Module
    ) {
      initSync({ module: source });
    } else if (source) {
      await initWasm(source);
    } else {
      // Default URL resolution for bundlers and modern browsers
      await initWasm(new URL('./xlsx_to_pdf_wasm_bg.wasm', import.meta.url));
    }
    initialized = true;
  })();

  return initPromise;
}

/**
 * Synchronous initialization in the browser using preloaded bytes or module.
 */
export function initSyncEngine(source?: BufferSource | WebAssembly.Module): void {
  if (initialized) return;
  if (source) {
    initSync({ module: source });
    initialized = true;
    return;
  }
  throw new Error(
    'In browser environments, initSyncEngine requires a BufferSource or WebAssembly.Module. Alternatively, use `await init()`.'
  );
}

/**
 * Internal helper to ensure WASM is ready before async operations.
 */
export async function ensureInitialized(): Promise<void> {
  if (!initialized) {
    await init();
  }
}

/**
 * Internal helper to ensure WASM is ready before synchronous operations.
 */
export function ensureInitializedSync(): void {
  if (!initialized) {
    initSyncEngine();
  }
}
