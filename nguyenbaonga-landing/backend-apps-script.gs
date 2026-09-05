/*******************************************************************
 * 6AI AGENT — BACKEND (Google Apps Script)
 * Gắn với Google Sheet "Quản lý học viên & thanh toán — 6AI Agent"
 * Xử lý 2 việc:
 *   1) Nhận ĐĂNG KÝ từ sale page  -> ghi 1 dòng (Chờ thanh toán)
 *   2) Nhận WEBHOOK THANH TOÁN từ SePay -> khớp mã đơn,
 *      tạo MÃ HỌC VIÊN + KÍCH HOẠT tài khoản (chỉ khi SePay báo đã nhận tiền)
 *
 * >>> CÁCH DÙNG: xem file HUONG-DAN-KET-NOI (gửi kèm).
 *******************************************************************/

var SHEET_ID   = '1Vwr-Cerz6NIqGcw1tg75aNtpGTlTyt6VZsS6mpbmWVo'; // Sheet quản lý học viên
var SEPAY_TOKEN = 'DOI_MA_BI_MAT_NAY'; // token bí mật, phải trùng với ?token=... ở URL webhook SePay
var ZALO_GROUP  = 'https://zalo.me/g/mtgphheicdm6helcj92w';

function getSheet(){
  var ss = SpreadsheetApp.openById(SHEET_ID);
  return ss.getSheetByName('Trang tính1') || ss.getSheets()[0];
}

/* ============ ROUTER ============ */
function doPost(e){
  try{
    var body = JSON.parse((e.postData && e.postData.contents) || '{}');
    // Webhook SePay có 'transferAmount' / 'transferType'; đăng ký thì không
    if (body.transferAmount !== undefined || body.transferType !== undefined){
      return handleSePay(e, body);
    }
    return handleDangKy(body);
  }catch(err){
    return json({success:false, error:String(err)});
  }
}
function doGet(){ return json({ok:true, service:'6AI enroll + SePay webhook'}); }

/* ============ 1) ĐĂNG KÝ TỪ SALE PAGE ============ */
function handleDangKy(d){
  var sh = getSheet();
  sh.appendRow([
    d.thoi_gian || new Date().toISOString(), // Thời gian
    d.ma_don   || '',                        // Mã đơn
    d.ho_ten   || '',                        // Họ tên
    "'" + (d.sdt || ''),                     // SĐT (giữ số 0 đầu)
    d.email    || '',                        // Email
    d.goi      || '',                        // Gói học
    d.so_tien  || '',                        // Số tiền
    'Chờ thanh toán',                        // Trạng thái thanh toán
    '',                                      // Mã học viên
    'CHƯA',                                  // Kích hoạt
    '',                                      // Ngày kích hoạt
    d.nguon || ''                            // Ghi chú
  ]);
  return json({success:true});
}

/* ============ 2) WEBHOOK SEPAY -> KÍCH HOẠT ============ */
function handleSePay(e, d){
  // Xác thực: URL webhook phải có ?token=SEPAY_TOKEN
  var token = e.parameter && e.parameter.token;
  if (SEPAY_TOKEN && token !== SEPAY_TOKEN) return json({success:false, error:'unauthorized'});

  var isIn = (d.transferType || 'in') === 'in';
  if(!isIn) return json({success:true, skipped:'tien ra, bo qua'});

  var content = ((d.content||'') + ' ' + (d.description||'') + ' ' + (d.code||'')).toUpperCase();
  var amount  = Number(d.transferAmount || 0);
  var m = content.match(/6AI[0-9A-Z]+/);           // tìm mã đơn 6AI...
  var sh = getSheet();
  var data = sh.getDataRange().getValues();
  var rowIdx = -1;
  if(m){ for(var i=1;i<data.length;i++){ if(String(data[i][1]).toUpperCase() === m[0]){ rowIdx = i; break; } } }

  // Không khớp đơn -> ghi lại để đối soát tay
  if(rowIdx < 0){
    sh.appendRow([ new Date().toISOString(), m?m[0]:'', '', '', '', '', amount,
      'ĐÃ NHẬN CK — CHƯA KHỚP ĐƠN', '', 'CHƯA', '', 'SePay: '+content ]);
    return json({success:true, matched:false});
  }

  // Đã khớp -> KÍCH HOẠT (chỉ khi SePay báo đã nhận tiền)
  var r = rowIdx + 1;
  var maHV = genMaHV();
  sh.getRange(r, 8 ).setValue('Đã thanh toán');
  sh.getRange(r, 9 ).setValue(maHV);
  sh.getRange(r, 10).setValue('ĐÃ KÍCH HOẠT');
  sh.getRange(r, 11).setValue(new Date().toISOString());

  // Gửi email kích hoạt cho học viên
  var hoTen = data[rowIdx][2], email = data[rowIdx][4], goi = data[rowIdx][5];
  if(email){
    try{
      MailApp.sendEmail(email,
        'Kích hoạt khoá 6 AI Agent — Mã học viên ' + maHV,
        'Chào ' + hoTen + ',\n\n'
        + 'Cảm ơn bạn đã thanh toán. Tài khoản học viên của bạn đã được KÍCH HOẠT.\n'
        + 'Mã học viên: ' + maHV + '\n'
        + 'Gói học: ' + goi + '\n\n'
        + 'Tham gia nhóm Zalo học viên: ' + ZALO_GROUP + '\n\n'
        + 'Trân trọng,\nNguyễn Bảo Nga — 6AI Agent');
    }catch(_){}
  }
  return json({success:true, matched:true, ma_hoc_vien:maHV});
}

/* ============ TIỆN ÍCH ============ */
function genMaHV(){
  var s = Utilities.formatDate(new Date(),'GMT+7','yyMMdd');
  return 'HV' + s + Math.floor(1000 + Math.random()*9000);
}
function json(o){
  return ContentService.createTextOutput(JSON.stringify(o))
         .setMimeType(ContentService.MimeType.JSON);
}
