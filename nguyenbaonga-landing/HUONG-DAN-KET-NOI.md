# Hướng dẫn kết nối Sale page ↔ Google Sheet ↔ SePay (khoá 6AI Agent)

Sale page (`index.html`) đã làm xong phần: form đăng ký + hiện **mã QR VietQR** (MB · 0978459369).
Còn 3 bước dưới đây để **lưu học viên về Google Sheet** và **tự động kích hoạt khi SePay báo đã thanh toán**.

---

## 📁 Tài sản đã tạo sẵn trên Google Drive
- Folder chính: **6AI Agent — Sale page & Quản lý học viên**
- Google Sheet: **Quản lý học viên & thanh toán — 6AI Agent** (12 cột: Thời gian, Mã đơn, Họ tên, SĐT, Email, Gói học, Số tiền, Trạng thái, Mã học viên, Kích hoạt, Ngày kích hoạt, Ghi chú)
- Folder con: **Ảnh sale page**, **Chứng từ thanh toán**

---

## Bước 1 — Tạo Web App bằng Google Apps Script
1. Mở Google Sheet ở trên → menu **Tiện ích mở rộng → Apps Script**.
2. Xoá code mẫu, **dán toàn bộ** nội dung file `backend-apps-script.gs`.
3. Sửa dòng `SEPAY_TOKEN = 'DOI_MA_BI_MAT_NAY'` thành 1 chuỗi bí mật của bạn (vd: `nbn6ai2026`).
4. Bấm **Deploy → New deployment → chọn "Web app"**:
   - Execute as: **Me**
   - Who has access: **Anyone**
   - Bấm **Deploy**, cấp quyền, rồi **copy URL** dạng `https://script.google.com/macros/s/..../exec`.

## Bước 2 — Dán URL vào sale page
Trong file `index.html`, tìm dòng:
```js
var SAVE_ENDPOINT=""; // TODO: dán URL Google Apps Script Web App
```
Dán URL vừa copy vào giữa 2 dấu ngoặc kép. Lưu lại → từ giờ mỗi khách đăng ký sẽ tự ghi 1 dòng vào Sheet (trạng thái "Chờ thanh toán").

## Bước 3 — Kết nối SePay (tự động kích hoạt)
1. Tạo tài khoản tại **sepay.vn**, thêm ngân hàng **MB — 0978459369** (theo hướng dẫn liên kết của SePay).
2. Vào **Cấu hình → Webhooks → Thêm webhook**:
   - URL: dán chính URL Web App ở Bước 1, **thêm** `?token=` + đúng chuỗi bí mật đã đặt.
     Ví dụ: `https://script.google.com/macros/s/..../exec?token=nbn6ai2026`
   - Sự kiện: **Có tiền vào (in)**.
3. Xong. Khi khách chuyển khoản đúng nội dung (mã `6AI...`), SePay gọi webhook →
   hệ thống **khớp mã đơn → tạo Mã học viên → ghi "ĐÃ KÍCH HOẠT" → gửi email** cho học viên.
   **Ai chưa được SePay báo đã trả tiền thì cột "Kích hoạt" vẫn là CHƯA.**

---

## Ghi chú
- Mã đơn (vd `6AI5678K3P`) được nhúng sẵn trong QR ở phần "Nội dung CK" → khách chuyển khoản là tự có, không cần gõ.
- Muốn đổi số tài khoản/tên: sửa `BANK_BIN / BANK_ACC / BANK_NAME` trong `index.html` và `SHEET_ID / token` trong file `.gs`.
- "Kích hoạt tài khoản" hiện = ghi nhận trạng thái + gửi email + mã học viên. Nếu khoá học đặt trên 1 nền tảng học (LMS/website riêng), cho mình biết nền tảng đó để nối bước cấp quyền truy cập tự động.
