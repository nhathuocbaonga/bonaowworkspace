# Hướng dẫn kết nối form → Google Sheet (làm 1 lần, ~5 phút)

Form trên trang gửi dữ liệu khách hàng về **Google Sheet** của chị. Làm theo các bước sau:

## Bước 1 — Tạo Google Sheet
1. Vào https://sheets.google.com → tạo 1 bảng tính mới, đặt tên VD **"Đăng ký 768 AI Agent"**.
2. (Có thể để trong 1 folder riêng trên Drive để gom dữ liệu chiến dịch này.)

## Bước 2 — Dán code backend
1. Trong Sheet vừa tạo, mở **Tiện ích mở rộng (Extensions) → Apps Script**.
2. Xoá code mẫu, **dán toàn bộ nội dung file `backend-apps-script.gs`** vào.
3. Bấm 💾 **Lưu**.

## Bước 3 — Triển khai Web App
1. Bấm **Triển khai (Deploy) → Bản triển khai mới (New deployment)**.
2. Loại: chọn **Ứng dụng web (Web app)**.
3. Cấu hình:
   - **Execute as:** *Me* (chính chị)
   - **Who has access:** *Anyone* (Bất kỳ ai) — bắt buộc để form gửi được.
4. Bấm **Deploy** → cấp quyền (Authorize) cho tài khoản Google của chị.
5. Copy **URL Web App** (dạng `https://script.google.com/macros/s/..../exec`).

## Bước 4 — Dán link vào trang
1. Mở file `index.html`, tìm dòng:
   ```js
   var SAVE_ENDPOINT = "";
   ```
2. Dán link vừa copy vào giữa 2 dấu ngoặc:
   ```js
   var SAVE_ENDPOINT = "https://script.google.com/macros/s/..../exec";
   ```
3. Lưu lại. Xong!

## Kiểm tra
- Mở trang → điền form thử → bấm đăng ký.
- Mở lại Google Sheet, tab **DangKy** sẽ có 1 dòng dữ liệu mới.

---

### Ghi chú
- Dữ liệu lưu: Thời gian · Họ tên · SĐT · Email · Ngành · Loại vé · Mã đơn · Nguồn.
- Vé VIP/VIPP: sau khi đăng ký, khách thấy **QR chuyển khoản MB** + mã đơn để ghi nội dung CK. Khách chuyển xong gửi biên lai vào nhóm Zalo để chị kích hoạt vé.
- Khi `SAVE_ENDPOINT` còn để trống `""`: form vẫn hiện QR bình thường nhưng **dữ liệu chưa được ghi** — nhớ làm Bước 3–4.
- Muốn tự động khớp thanh toán (SePay) như trang cũ: báo em nối thêm webhook.
