import * as fs from 'node:fs';
import * as path from 'node:path';
import { fileURLToPath } from 'node:url';
import initWasm, { initSync } from '../pkg-wasm/xlsx_to_pdf.js';
import type { WasmInitInput } from './types.js';

let initialized = false;
let initPromise: Promise<void> | null = null;

function getWasmBytes(): Buffer {
  let wasmPath: string;
  try {
    wasmPath = fileURLToPath(new URL('./xlsx_to_pdf_bg.wasm', import.meta.url));
  } catch {
    wasmPath = path.resolve(__dirname, 'xlsx_to_pdf_bg.wasm');
  }
  return fs.readFileSync(wasmPath);
}

/**
 * Check if the WASM engine is currently initialized.
 */
export function isInitialized(): boolean {
  return initialized;
}

/**
 * Initialize the WebAssembly engine.
 *
 * In Node.js, calling this is optional as the library automatically initializes
 * from the bundled WebAssembly binary on first use.
 */
export async function init(source?: WasmInitInput): Promise<void> {
  if (initialized) return;
  if (initPromise) return initPromise;

  initPromise = (async () => {
    if (source) {
      if (
        source instanceof Uint8Array ||
        source instanceof ArrayBuffer ||
        source instanceof WebAssembly.Module
      ) {
        initSync({ module: source });
      } else {
        await initWasm(source);
      }
    } else {
      const bytes = getWasmBytes();
      initSync({ module: bytes });
    }
    initialized = true;
  })();

  return initPromise;
}

/**
 * Synchronous initialization of the WebAssembly engine.
 */
export function initSyncEngine(source?: BufferSource | WebAssembly.Module): void {
  if (initialized) return;
  if (source) {
    initSync({ module: source });
  } else {
    const bytes = getWasmBytes();
    initSync({ module: bytes });
  }
  initialized = true;
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
