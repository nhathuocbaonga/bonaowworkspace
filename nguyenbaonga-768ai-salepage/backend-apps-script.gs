/**
 * BACKEND LƯU ĐĂNG KÝ — Lớp 768 AI Agent (Nguyễn Bảo Nga)
 * Nhận dữ liệu từ form landing page → ghi vào Google Sheet.
 *
 * CÁCH DÙNG: xem HUONG-DAN-KET-NOI.md (làm 1 lần, ~5 phút).
 */

// (Tuỳ chọn) Dán ID Google Sheet muốn ghi vào. Để trống "" nếu script được
// tạo TỪ trong Sheet (Extensions → Apps Script) — khi đó tự dùng Sheet đang mở.
var SHEET_ID = "";
var SHEET_NAME = "DangKy"; // tên tab/sheet sẽ ghi

var HEADERS = ["Thời gian","Họ tên","SĐT (Zalo)","Email","Ngành nghề","Loại vé","Mã đơn","Nguồn"];

function getSheet_() {
  var ss = SHEET_ID ? SpreadsheetApp.openById(SHEET_ID) : SpreadsheetApp.getActiveSpreadsheet();
  var sh = ss.getSheetByName(SHEET_NAME);
  if (!sh) { sh = ss.insertSheet(SHEET_NAME); }
  if (sh.getLastRow() === 0) { sh.appendRow(HEADERS); }
  return sh;
}

function doPost(e) {
  try {
    var d = JSON.parse(e.postData.contents);
    getSheet_().appendRow([
      d.time || new Date().toLocaleString('vi-VN'),
      d.name || "",
      "'" + (d.phone || ""),   // dấu ' giữ số 0 đầu SĐT
      d.email || "",
      d.industry || "",
      d.ticket || "",
      d.order || "",
      d.source || ""
    ]);
    return ContentService
      .createTextOutput(JSON.stringify({ok:true}))
      .setMimeType(ContentService.MimeType.JSON);
  } catch (err) {
    return ContentService
      .createTextOutput(JSON.stringify({ok:false, error:String(err)}))
      .setMimeType(ContentService.MimeType.JSON);
  }
}

// Mở link Web App bằng trình duyệt sẽ thấy dòng này → nghĩa là deploy OK.
function doGet() {
  return ContentService.createTextOutput("768 AI Agent backend dang chay OK.");
}
