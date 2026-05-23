// ═══════════════════════════════════════════════════════════════════
// Finanzas Lea y Jo — Google Apps Script
//
// INSTRUCCIONES:
// 1. Abrí el spreadsheet "File: APIs & Webhooks"
// 2. Extensiones → Apps Script
// 3. Borrá el contenido existente y pegá este archivo completo
// 4. Guardar (Ctrl+S)
// 5. Implementar → Nueva implementación
//    · Tipo: Aplicación web
//    · Ejecutar como: Yo (tu cuenta)
//    · Quién tiene acceso: Cualquiera
// 6. Autorizá los permisos cuando lo pida
// 7. Copiá la URL de implementación
// 8. Pegala en el dashboard (⚙ Configurar)
// ═══════════════════════════════════════════════════════════════════

const SPREADSHEET_ID = '1QRk4Isewh5p_rP8H3mdJuksg40LY7uFahYd0QMKJUyw';
const SHEET_NAME     = 'gastos_unificados';

function doGet(e) {
  try {
    const ss    = SpreadsheetApp.openById(SPREADSHEET_ID);
    const sheet = ss.getSheetByName(SHEET_NAME);
    if (!sheet) throw new Error('Hoja no encontrada: ' + SHEET_NAME);

    const data    = sheet.getDataRange().getValues();
    const headers = data[0].map(function(h) { return String(h).trim(); });

    // Find column indices (case-insensitive)
    function col(names) {
      for (var i = 0; i < names.length; i++) {
        var idx = headers.findIndex(function(h) {
          return h.toLowerCase() === names[i].toLowerCase();
        });
        if (idx >= 0) return idx;
      }
      return -1;
    }

    var iDate  = col(['date']);
    var iFecha = col(['fecha']);
    var iIng   = col(['ingresos']);
    var iEgr   = col(['egreso', 'egresos']);
    var iRef   = col(['referencia']);
    var iDet   = col(['detalle', 'Detalle']);
    var iMov   = col(['movimiento', 'Movimiento']);

    var rows = [];
    for (var i = 1; i < data.length; i++) {
      var row = data[i];

      var dateVal = (iDate  >= 0 ? row[iDate]  : null)
                 || (iFecha >= 0 ? row[iFecha] : null);
      if (!dateVal) continue;

      var dateStr;
      if (dateVal instanceof Date) {
        dateStr = Utilities.formatDate(
          dateVal, 'America/Argentina/Buenos_Aires', 'yyyy-MM-dd'
        );
      } else {
        var s = String(dateVal).trim();
        if (!s) continue;
        // "2026-02-01T20:24:55" → "2026-02-01"
        dateStr = s.substring(0, 10);
      }
      if (!dateStr || dateStr.length < 10) continue;

      rows.push({
        date:       dateStr,
        ingresos:   toNum(iIng >= 0 ? row[iIng] : 0),
        egreso:     toNum(iEgr >= 0 ? row[iEgr] : 0),
        referencia: String(iRef >= 0 ? row[iRef] : '').trim(),
        Detalle:    String(iDet >= 0 ? row[iDet] : '').trim(),
        Movimiento: String(iMov >= 0 ? row[iMov] : '').trim()
      });
    }

    return ok({ count: rows.length, lastUpdated: new Date().toISOString(), rows: rows });

  } catch(err) {
    return ok({ success: false, error: err.message });
  }
}

function ok(payload) {
  payload.success = payload.success !== false;
  return ContentService
    .createTextOutput(JSON.stringify(payload))
    .setMimeType(ContentService.MimeType.JSON);
}

function toNum(val) {
  if (typeof val === 'number') return val < 0 ? -val : val;
  if (!val) return 0;
  var n = parseFloat(String(val).replace(/[^0-9.]/g, ''));
  return isNaN(n) ? 0 : n;
}
