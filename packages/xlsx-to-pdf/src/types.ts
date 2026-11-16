/**
 * Paper size options supported for PDF export.
 */
export type PaperSize =
  | 'Letter'
  | 'Tabloid'
  | 'Legal'
  | 'Statement'
  | 'Executive'
  | 'Folio'
  | 'A3'
  | 'A4'
  | 'A5'
  | 'B4'
  | 'B5'
  | 'Custom';

/**
 * Page orientation for PDF output.
 */
export type Orientation = 'Portrait' | 'Landscape';

/**
 * Scaling mode for fitting spreadsheet content to pages.
 */
export type ScaleMode =
  | 'Normal'
  | 'FitToWidth'
  | 'FitToHeight'
  | 'FitToPage'
  | 'Custom';

/**
 * Margin preset options.
 */
export type MarginPreset = 'Normal' | 'Narrow' | 'Wide' | 'Custom';

/**
 * Page numbering order when content spans across multiple pages.
 */
export type PageOrder = 'DownThenOver' | 'OverThenDown';

/**
 * Horizontal alignment on the page.
 */
export type HorizontalAlignment = 'Left' | 'Center' | 'Right';

/**
 * Vertical alignment on the page.
 */
export type VerticalAlignment = 'Top' | 'Middle' | 'Bottom';

/**
 * Custom TrueType (.ttf) or OpenType (.otf) font data to embed into the generated PDF.
 */
export interface CustomFont {
  /** Font family name or PostScript name matching spreadsheet font (e.g. "Inter", "Roboto", "Calibri") */
  family?: string;
  /** Alias for family */
  name?: string;
  /** Raw font file bytes (Uint8Array) or base64-encoded string */
  data: Uint8Array | string;
}

/**
 * Full configuration options for spreadsheet-to-PDF export.
 */
export interface PdfExportOptions {
  /**
   * Export scope:
   * - "ActiveSheet" / "CurrentSheet": export only the active worksheet (default)
   * - "EntireWorkbook" / "Workbook": export all visible worksheets
   * - "SelectedCells" / "Selection": export only the range specified in `selectionRange`
   */
  scope?:
    | 'CurrentSheet'
    | 'ActiveSheet'
    | 'Workbook'
    | 'EntireWorkbook'
    | 'SelectedCells'
    | 'Selection'
    | string;

  /**
   * 0-based worksheet index to export (used when scope is sheet-specific, default is 0).
   */
  sheetIndex?: number;

  /**
   * Selected cell range string when `scope` is "SelectedCells" (e.g. "A1:E20").
   */
  selectionRange?: string;

  /**
   * Target paper size. Defaults to "A4" or document settings.
   */
  paperSize?: PaperSize;

  /**
   * Custom page width in points (72 points = 1 inch), used when paperSize is "Custom".
   */
  customWidthPt?: number;

  /**
   * Custom page height in points (72 points = 1 inch), used when paperSize is "Custom".
   */
  customHeightPt?: number;

  /**
   * Page orientation. Defaults to "Portrait" or document settings.
   */
  orientation?: Orientation;

  /**
   * Scaling mode:
   * - "Normal": no scaling (100%)
   * - "FitToWidth": fit columns onto 1 page wide
   * - "FitToHeight": fit rows onto 1 page tall
   * - "FitToPage": fit entire sheet onto a single page
   * - "Custom": use `scalePercentage`
   */
  scale?: ScaleMode;

  /**
   * Custom scale percentage (e.g. 100 for 100%, 80 for 80%).
   */
  scalePercentage?: number;

  /**
   * Page margins preset ("Normal", "Narrow", "Wide", or "Custom").
   */
  margins?: MarginPreset;

  /** Top margin in points (72 pt = 1 inch). */
  marginTopPt?: number;
  /** Right margin in points (72 pt = 1 inch). */
  marginRightPt?: number;
  /** Bottom margin in points (72 pt = 1 inch). */
  marginBottomPt?: number;
  /** Left margin in points (72 pt = 1 inch). */
  marginLeftPt?: number;

  /** Whether to render cell gridlines. Defaults to document settings (or false). */
  showGridLines?: boolean;

  /** Whether to print column letter headings (A, B, C) and row number headings (1, 2, 3). */
  showHeadings?: boolean;

  /** Page numbering sequence when pages span in both directions. */
  pageOrder?: PageOrder;

  /** Horizontal alignment on the page. */
  horizontalAlignment?: HorizontalAlignment;

  /** Vertical alignment on the page. */
  verticalAlignment?: VerticalAlignment;

  /** Whether to display page numbers in the footer ("Page 1 of N"). */
  pageNumbers?: boolean;

  /** Whether to display workbook title in the header. */
  workbookTitle?: boolean;

  /** Whether to display the sheet name in the header. */
  sheetName?: boolean;

  /** Whether to display the export date in the header/footer. */
  currentDate?: boolean;

  /** Whether to display the export time in the header/footer. */
  currentTime?: boolean;

  /** Repeat frozen rows at the top of each page. */
  repeatFrozenRows?: boolean;

  /** Repeat frozen columns at the left of each page. */
  repeatFrozenColumns?: boolean;

  /**
   * Custom TrueType (.ttf) or OpenType (.otf) font data to embed into the PDF.
   */
  customFonts?: CustomFont[];
}

/**
 * Metadata for a worksheet in the workbook.
 */
export interface SheetInfo {
  index: number;
  name: string;
  visible: boolean;
}

/**
 * Font used in the workbook.
 */
export interface FontDescriptor {
  family: string;
  bold: boolean;
  italic: boolean;
}

/**
 * Workbook metadata containing sheet names, indices, visibility, and font descriptors.
 */
export interface WorkbookInfo {
  name: string;
  sheets: SheetInfo[];
  fonts: FontDescriptor[];
}

/**
 * Input source for WASM initialization.
 */
export type WasmInitInput =
  | RequestInfo
  | URL
  | Response
  | BufferSource
  | WebAssembly.Module;
