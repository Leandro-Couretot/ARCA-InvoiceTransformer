/**
 * ARCA InvoiceTransformer - Google Apps Script
 * Transformador de certificados ARCA a planillas Google Sheets
 */

/**
 * Función principal de entrada.
 * Procesa los datos de certificados ARCA y los carga en la hoja activa.
 */
function procesarCertificadoARCA() {
  var hoja = SpreadsheetApp.getActiveSpreadsheet().getActiveSheet();
  Logger.log("ARCA InvoiceTransformer iniciado en: " + hoja.getName());
}
