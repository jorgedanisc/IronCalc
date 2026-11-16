use ironcalc::base::types::SheetState;
use ironcalc::base::Model;
use ironcalc::import::load_from_xlsx_bytes;
use ironcalc_pdf::{export_to_pdf, PdfExportOptions, PdfExportOptionsPayload};
use serde::Serialize;
use wasm_bindgen::prelude::*;

fn to_js_error(err: impl std::fmt::Display) -> JsError {
    JsError::new(&err.to_string())
}

fn parse_options(options_val: JsValue) -> Result<PdfExportOptions, JsError> {
    if options_val.is_undefined() || options_val.is_null() {
        return Ok(PdfExportOptions::default());
    }
    let payload: PdfExportOptionsPayload = serde_wasm_bindgen::from_value(options_val)
        .map_err(|e| to_js_error(format!("Failed to parse PDF options: {e}")))?;
    Ok(payload.into_options())
}

#[derive(Serialize)]
pub struct SheetInfo {
    pub index: usize,
    pub name: String,
    pub visible: bool,
}

#[derive(Serialize)]
pub struct FontDescriptor {
    pub family: String,
    pub bold: bool,
    pub italic: bool,
}

#[derive(Serialize)]
pub struct WorkbookInfo {
    pub name: String,
    pub sheets: Vec<SheetInfo>,
    pub fonts: Vec<FontDescriptor>,
}

fn extract_workbook_info(model: &Model) -> WorkbookInfo {
    let workbook = &model.workbook;
    let mut sheets = Vec::with_capacity(workbook.worksheets.len());
    for (i, ws) in workbook.worksheets.iter().enumerate() {
        sheets.push(SheetInfo {
            index: i,
            name: ws.name.clone(),
            visible: ws.state == SheetState::Visible,
        });
    }

    let mut seen_fonts = std::collections::HashSet::new();
    let mut fonts = Vec::new();
    for f in &workbook.styles.fonts {
        let name = f.name.trim();
        if !name.is_empty() {
            let key = (name.to_lowercase(), f.b, f.i);
            if seen_fonts.insert(key) {
                fonts.push(FontDescriptor {
                    family: name.to_string(),
                    bold: f.b,
                    italic: f.i,
                });
            }
        }
    }

    WorkbookInfo {
        name: workbook.name.clone(),
        sheets,
        fonts,
    }
}

/// Converts XLSX bytes directly to PDF bytes according to options.
#[wasm_bindgen(js_name = "convertXlsxToPdf")]
pub fn convert_xlsx_to_pdf(xlsx_bytes: &[u8], options: JsValue) -> Result<Vec<u8>, JsError> {
    let workbook = load_from_xlsx_bytes(xlsx_bytes, "workbook", "en", "UTC")
        .map_err(|e| to_js_error(format!("Failed to parse XLSX: {e}")))?;
    let model = Model::from_workbook(workbook, "en")
        .map_err(|e| to_js_error(format!("Failed to create model: {e}")))?;
    let opts = parse_options(options)?;
    export_to_pdf(&model, &opts).map_err(|e| to_js_error(format!("PDF export failed: {e}")))
}

/// Returns metadata about the workbook (sheets, fonts used).
#[wasm_bindgen(js_name = "getWorkbookInfo")]
pub fn get_workbook_info(xlsx_bytes: &[u8]) -> Result<JsValue, JsError> {
    let workbook = load_from_xlsx_bytes(xlsx_bytes, "workbook", "en", "UTC")
        .map_err(|e| to_js_error(format!("Failed to parse XLSX: {e}")))?;
    let model = Model::from_workbook(workbook, "en")
        .map_err(|e| to_js_error(format!("Failed to create model: {e}")))?;
    let info = extract_workbook_info(&model);
    serde_wasm_bindgen::to_value(&info).map_err(|e| to_js_error(e.to_string()))
}

/// Represents a loaded XLSX document that can be queried or converted to PDF multiple times.
#[wasm_bindgen]
pub struct XlsxDocument {
    model: Model<'static>,
}

#[wasm_bindgen]
impl XlsxDocument {
    #[wasm_bindgen(constructor)]
    pub fn new(xlsx_bytes: &[u8]) -> Result<XlsxDocument, JsError> {
        let workbook = load_from_xlsx_bytes(xlsx_bytes, "workbook", "en", "UTC")
            .map_err(|e| to_js_error(format!("Failed to parse XLSX: {e}")))?;
        let model = Model::from_workbook(workbook, "en")
            .map_err(|e| to_js_error(format!("Failed to create model: {e}")))?;
        Ok(XlsxDocument { model })
    }

    #[wasm_bindgen(js_name = "toPdf")]
    pub fn to_pdf(&self, options: JsValue) -> Result<Vec<u8>, JsError> {
        let opts = parse_options(options)?;
        export_to_pdf(&self.model, &opts).map_err(|e| to_js_error(format!("PDF export failed: {e}")))
    }

    #[wasm_bindgen(js_name = "getInfo")]
    pub fn get_info(&self) -> Result<JsValue, JsError> {
        let info = extract_workbook_info(&self.model);
        serde_wasm_bindgen::to_value(&info).map_err(|e| to_js_error(e.to_string()))
    }
}
