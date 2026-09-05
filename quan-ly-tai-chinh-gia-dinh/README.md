# Sổ Thu Chi Gia Đình

Ứng dụng quản lý thu — chi gia đình bằng tiếng Việt, tích hợp phương pháp **6 Chiếc Lọ** của T. Harv Eker, ngân sách theo tháng, quản lý nợ/cho vay, mục tiêu tài chính, giao dịch định kỳ và báo cáo trực quan. Thiết kế mobile-first, hỗ trợ chế độ sáng/tối.

> **Trạng thái:** Giai đoạn 1 (MVP lõi) và Giai đoạn 2 (Nợ, Mục tiêu tài chính, Quỹ dự phòng, Giao dịch định kỳ, Import/Export, Nhật ký chỉnh sửa) đã hoàn thành và chạy được thật — không phải giao diện giả. Còn lại một số mục nhỏ chưa triển khai — xem mục [Giới hạn đã biết](#8-giới-hạn-đã-biết--chưa-triển-khai).

## 1. Tính năng đã có

**Giai đoạn 1 — lõi tài chính**
- **Đăng ký / Đăng nhập** theo từng gia đình (không gian dữ liệu riêng biệt).
- **Thành viên gia đình**: Quản trị viên / Thành viên / Trẻ em, có thể cấp hoặc không cấp tài khoản đăng nhập riêng.
- **Tài khoản tiền**: tiền mặt, ngân hàng, ví điện tử, thẻ tín dụng, sổ tiết kiệm... số dư tính tự động từ giao dịch (không lưu số dư cứng).
- **Thu nhập & Chi tiêu**: đầy đủ trường (người chi, chi cho ai, chi chung/cá nhân, mức độ cần thiết, hình thức thanh toán, cố định/phát sinh...), hỗ trợ **chia nhỏ 1 giao dịch** thành nhiều danh mục/lọ khác nhau.
- **Chuyển tiền giữa tài khoản** và **chuyển tiền giữa 6 lọ** — không tính là thu/chi, không gây trùng số liệu.
- **6 Chiếc Lọ**: tỷ lệ tùy chỉnh (validate luôn bằng 100%), tự động đề xuất phân bổ khi có thu nhập, số dư/đã chi/tỷ lệ sử dụng từng lọ, cảnh báo lọ âm hoặc sắp hết.
- **Ngân sách** theo danh mục / thành viên / lọ, theo từng tháng — cảnh báo 70% / 90% / vượt ngân sách, dự báo cuối tháng.
- **Dashboard tổng quan** + **Báo cáo**: xu hướng 6 tháng, theo danh mục, theo lọ, theo thành viên, top 3 khoản chi lớn nhất, nhận xét nhanh sinh tự động từ dữ liệu thật.
- **65+ danh mục thu/chi** dựng sẵn theo đúng cấu trúc yêu cầu, có thể thêm/ẩn tại Cài đặt.

**Giai đoạn 2 — mở rộng**
- **Quản lý Nợ**: khoản đang vay (gốc, lãi suất, kỳ trả, ngày đến hạn), ghi nhận trả gốc/lãi thành giao dịch thật, tự đánh dấu "Đã trả hết" khi trả đủ gốc.
- **Khoản phải thu**: cho người khác vay, thu hồi từng phần/toàn bộ, xóa nợ, cảnh báo sắp/đã quá hạn.
- **Mục tiêu tài chính**: theo dõi tiến độ, tự tính số tiền cần tiết kiệm/tháng, cảnh báo chậm tiến độ.
- **Quỹ dự phòng**: tự tính chi phí thiết yếu trung bình 3 tháng gần nhất, số tháng đủ sống, mục tiêu 3/6/12 tháng.
- **Giao dịch định kỳ**: tự sinh danh sách "đến hạn", xác nhận thanh toán tạo giao dịch thật + tự dời ngày kế tiếp, hoặc bỏ qua 1 kỳ, tạm dừng/bật lại.
- **Import/Export**: xuất Excel (.xlsx, 2 sheet: Giao dịch + Tóm tắt) và CSV theo đúng bộ lọc đang xem; nhập hàng loạt giao dịch từ file CSV (có file mẫu tải sẵn, xem trước trước khi xác nhận, báo lỗi từng dòng); in báo cáo qua trình duyệt.
- **Nhật ký chỉnh sửa**: ghi lại người, thời điểm và nội dung của mọi lần tạo/sửa/xóa/khôi phục giao dịch, tài khoản, thành viên, nợ, khoản cho vay, mục tiêu.
- **Cảnh báo "Sắp đến hạn trong 7 ngày"** trên Dashboard, gộp từ nợ, khoản cho vay và giao dịch định kỳ.
- Xóa mềm + khôi phục giao dịch, cô lập dữ liệu tuyệt đối giữa các gia đình.
- Chế độ sáng/tối, giao diện tối ưu cho điện thoại.

## 2. Công nghệ & lý do lựa chọn

| Thành phần | Lựa chọn | Ghi chú |
|---|---|---|
| Framework | Next.js 16 (App Router, TypeScript) | |
| Giao diện | Tailwind CSS v4 | |
| CSDL (dev) | **SQLite** qua Prisma | Máy phát triển không có Docker nên không dùng được Supabase local; SQLite chạy ngay không cần cài đặt gì thêm |
| CSDL (production) | PostgreSQL / **Supabase** | Chỉ cần đổi `provider` trong `prisma/schema.prisma` và `DATABASE_URL` — xem mục 5 |
| Xác thực | Cookie phiên JWT tự viết (thư viện `jose`) | Không dùng NextAuth vì bản beta hiện tại chưa tương thích ổn định với Next.js 16 / React 19.2; có thể thay bằng Supabase Auth khi lên production |
| Biểu đồ | Recharts | |
| Xuất Excel | ExcelJS | |
| Validate | Zod | |
| Icon | lucide-react | |

## 3. Chạy thử ngay (không cần cài Supabase)

```bash
npm install
npx prisma migrate dev   # tạo file dev.db (SQLite) theo schema
npm run db:seed          # tạo dữ liệu mẫu: 1 gia đình 4 người, giao dịch 3 tháng + nợ/mục tiêu/định kỳ
npm run dev
```

Mở http://localhost:3000 — sẽ tự chuyển đến trang đăng nhập.

**Tài khoản demo** (sau khi `npm run db:seed`):

- Email: `demo@giadinh.vn`
- Mật khẩu: `demo123456`

Hoặc bấm "Đăng ký ngay" để tạo một gia đình hoàn toàn mới (tự động có 6 lọ mặc định, danh mục mặc định, tài khoản Tiền mặt).

### Các lệnh hữu ích

```bash
npm run dev            # chạy dev server (Turbopack)
npm run build           # build production
npx prisma studio        # xem/sửa dữ liệu SQLite bằng giao diện web
npm run db:reset         # xóa sạch DB, chạy lại migration + tự seed lại
npm run db:seed          # tạo lại dữ liệu mẫu (bỏ qua nếu tài khoản demo đã tồn tại)
```

## 4. Cấu trúc thư mục

```
prisma/
  schema.prisma              # schema Prisma (SQLite, dev)
  migrations_postgres/       # SQL migration tương đương cho Postgres/Supabase (001 = GĐ1, 002 = GĐ2)
  seed.ts                    # script tạo dữ liệu mẫu

src/
  app/
    (auth)/login, register   # trang công khai
    (app)/                   # các trang sau đăng nhập — layout dùng chung (sidebar/bottom-nav)
      dashboard, transactions, jars, budgets, accounts, members, reports, settings,
      debts, goals, emergency-fund, recurring, audit-log, import
    api/export/               # route xuất Excel/CSV giao dịch + file mẫu nhập liệu
    api/session-cleanup/       # dọn phiên đăng nhập không còn hợp lệ (gia đình đã bị xóa)
  components/
    ui/                      # Button, Card, Modal, Input... dùng chung
    quick-add/               # Modal "Thêm giao dịch" đa bước (Thu/Chi)
    nav/                     # Sidebar, Bottom nav
    transactions/, accounts/, jars/, budgets/, members/, settings/, reports/,
    debts/, goals/, recurring/
  lib/
    prisma.ts, session.ts    # kết nối DB, quản lý phiên đăng nhập
    finance.ts               # logic tính số dư tài khoản/lọ, ngân sách, báo cáo (GĐ1)
    debts-goals.ts            # logic tính dư nợ, khoản phải thu, tiến độ mục tiêu, quỹ dự phòng (GĐ2)
    jar-math.ts              # hàm thuần: đề xuất phân bổ 6 lọ (dùng cả client & server)
    insights.ts              # sinh nhận xét tiếng Việt từ dữ liệu thật
    audit.ts                  # ghi nhật ký chỉnh sửa
    csv-parse.ts               # parser CSV thuần cho luồng nhập dữ liệu
    default-categories.ts    # danh mục thu/chi khởi tạo sẵn
    actions/                 # Server Actions: transactions, accounts, jars, budgets, members,
                              # settings, auth, debts, receivables, goals, recurring, import
  proxy.ts                   # bảo vệ route (đăng nhập) — quy ước Next.js 16 thay cho middleware.ts
```

## 5. Triển khai lên Supabase (production)

1. Tạo project tại https://supabase.com, lấy connection string (Project Settings → Database → Connection string → URI).
2. Chạy lần lượt 2 file SQL trong Supabase SQL Editor:
   - `prisma/migrations_postgres/001_init.sql` (bảng Giai đoạn 1)
   - `prisma/migrations_postgres/002_phase2.sql` (bảng Nợ, Mục tiêu, Định kỳ, Nhật ký — Giai đoạn 2)
3. Trong `prisma/schema.prisma`, đổi:
   ```prisma
   datasource db {
     provider = "postgresql"   // đổi từ "sqlite"
     url      = env("DATABASE_URL")
   }
   ```
4. Cập nhật `.env`:
   ```
   DATABASE_URL="postgresql://postgres:[PASSWORD]@[HOST]:5432/postgres"
   ```
5. `npx prisma generate` rồi build lại (`npm run build`).
6. (Tùy chọn) Thay xác thực JWT tự viết bằng Supabase Auth để tận dụng RLS theo `auth.uid()` — các policy mẫu đã có sẵn (dạng comment) trong file SQL migration.

Có thể deploy phần Next.js lên Vercel như bình thường; chỉ cần biến môi trường `DATABASE_URL` và `AUTH_SECRET` (chuỗi bí mật ngẫu nhiên, dài) trỏ đúng tới Supabase.

## 6. Quy tắc nghiệp vụ quan trọng đã áp dụng

- Chuyển tiền giữa tài khoản / giữa 6 lọ **không** được tính vào tổng thu hoặc tổng chi ở bất kỳ báo cáo nào.
- Đi vay (`DEBT_BORROW`), trả nợ gốc (`DEBT_PRINCIPAL`), cho vay (`LOAN_OUT`), thu hồi nợ (`LOAN_COLLECT`) đều **không** tính vào thu/chi — chỉ ảnh hưởng số dư tài khoản. Riêng trả lãi vay dùng chung loại `EXPENSE` (được ghi nhận là chi phí thật, đúng theo quy tắc nghiệp vụ).
- Mỗi giao dịch có đúng 1 `type`. Giao dịch chia nhỏ (`transaction_splits`) bắt buộc tổng các dòng chia phải khớp số tiền gốc.
- Số dư tài khoản/lọ/dư nợ/khoản phải thu luôn được **tính lại từ lịch sử giao dịch thật** (không có cột "số dư hiện tại" lưu cứng), đảm bảo không bao giờ lệch số liệu và không trùng tiền.
- Cập nhật tiến độ mục tiêu tài chính (`GoalContribution`) là theo dõi thuần túy, không tạo giao dịch thu/chi mới.
- Xóa giao dịch là xóa mềm (`isDeleted`), có thể khôi phục; báo cáo luôn loại trừ giao dịch đã xóa.
- Mọi thao tác tạo/sửa/xóa quan trọng đều ghi vào `audit_logs` kèm người thực hiện.
- Dữ liệu cô lập tuyệt đối theo `familyId` ở tất cả các truy vấn.

## 7. Đã kiểm thử trong trình duyệt

Toàn bộ luồng dưới đây đã chạy thử thực tế (không chỉ đọc code): đăng ký/đăng nhập, thêm thu nhập kèm tự động phân bổ 6 lọ, thêm chi tiêu 5 bước, chuyển khoản/chuyển lọ, tạo và trả một phần khoản nợ, tạo và thu hồi một phần khoản cho vay, cập nhật mục tiêu tài chính và quỹ dự phòng, xác nhận thanh toán giao dịch định kỳ, xuất Excel/CSV, nhập giao dịch từ CSV (kèm xem trước và báo lỗi dòng), xem nhật ký chỉnh sửa, chế độ sáng/tối, giao diện di động.

## 8. Đính kèm hóa đơn qua Google Drive (tùy chọn)

Trang chi tiết giao dịch hỗ trợ đính kèm 1 ảnh/PDF hóa đơn, lưu trên Google Drive (không cần S3/Supabase Storage). Nếu chưa cấu hình, mục này **tự ẩn** — không hiển thị nút không hoạt động.

**Thiết lập:**
1. Tạo project tại [Google Cloud Console](https://console.cloud.google.com), bật **Google Drive API**.
2. Vào **IAM & Admin → Service Accounts**, tạo 1 Service Account, tạo và tải file JSON key.
3. Trên Google Drive cá nhân, tạo 1 thư mục (VD "Hóa đơn Sổ Thu Chi") → **Chia sẻ (Share)** thư mục đó với email của Service Account (dạng `...@...iam.gserviceaccount.com`, lấy trong file JSON) — quyền **Editor**.
4. Lấy ID thư mục từ URL (`https://drive.google.com/drive/folders/<ID>`).
5. Thêm vào `.env`:
   ```
   GOOGLE_SERVICE_ACCOUNT_KEY='{"type":"service_account", ...dán nguyên nội dung file JSON...}'
   GOOGLE_DRIVE_FOLDER_ID="id-thu-muc-o-buoc-4"
   ```
6. Khởi động lại `npm run dev` — mục "Đính kèm ảnh hóa đơn / PDF" sẽ xuất hiện trên trang chi tiết giao dịch.

File tải lên được đặt quyền "xem qua link" (không cho chỉnh sửa), giới hạn 8MB, chỉ nhận JPG/PNG/WEBP/PDF. Code đã sẵn sàng tại `src/lib/google-drive.ts` và `src/lib/actions/attachments.ts` — **chưa được test với credentials thật** vì môi trường phát triển hiện tại chưa có Service Account, cần bạn tự tạo theo hướng dẫn trên rồi kiểm thử.

## 9. Nhập ảnh hàng loạt từ Google Drive mỗi sáng (tùy chọn)

Ngoài cách gửi từng ảnh qua Telegram (xử lý ngay lập tức), app còn hỗ trợ cách thứ hai: bỏ nhiều ảnh hóa đơn/chuyển khoản vào 1 thư mục Google Drive trong ngày, mỗi sáng lúc **7h (giờ Việt Nam)** app tự động quét thư mục, đọc từng ảnh bằng AI và tự ghi nhận giao dịch — không cần mở app, không cần gửi qua Telegram. Sau khi xử lý xong, app gửi 1 tin nhắn Telegram tổng kết (đã ghi nhận bao nhiêu, ảnh nào cần xem lại).

**Thiết lập (làm 1 lần):**
1. Đã có Service Account từ mục 8 ở trên (`GOOGLE_SERVICE_ACCOUNT_KEY`) thì dùng lại, không cần tạo lại. Nếu chưa từng làm mục 8, làm bước 1–2 của mục 8 trước.
2. Trên Google Drive, tạo **1 thư mục mới riêng** dùng làm "hộp thư đến" (VD "Hộp thư ảnh hóa đơn") — khác với thư mục ở mục 8. Chia sẻ thư mục này với email Service Account, quyền **Editor**.
3. Lấy ID thư mục từ URL, thêm vào biến môi trường (trên Vercel: Project Settings → Environment Variables):
   ```
   GOOGLE_DRIVE_INBOX_FOLDER_ID="id-thu-muc-hop-thu-den"
   CRON_SECRET="một-chuỗi-ngẫu-nhiên-bí-mật-tự-đặt"
   ```
4. Deploy lại — Vercel sẽ tự nhận cấu hình `crons` trong `vercel.json` và gọi `/api/cron/drive-import` mỗi ngày lúc 00:00 UTC (7h sáng giờ Việt Nam).
5. Hằng ngày, bỏ ảnh hóa đơn/chuyển khoản trực tiếp vào thư mục hộp thư đến (từ điện thoại, dùng app Google Drive) — không cần đặt tên file theo quy tắc gì.

**Cách hoạt động:** mỗi lần chạy, app xử lý tối đa 8 ảnh (đủ dùng cho nhu cầu gia đình hằng ngày; nếu hôm nào nhiều hơn, phần còn lại tự xử lý vào sáng hôm sau, không bị mất ảnh). Ảnh đọc thành công được gán làm chứng từ đính kèm cho giao dịch (xem lại trong app) và chuyển vào thư mục con "Đã xử lý"; ảnh không đọc được (mờ, thiếu thông tin...) chuyển vào thư mục con "Cần xem lại" để tự thêm tay sau. Giao dịch được gán cho gia đình và người quản trị đầu tiên trong hệ thống (app hiện chỉ phục vụ 1 gia đình nên không cần chọn thêm).

Nếu không cấu hình `GOOGLE_DRIVE_INBOX_FOLDER_ID`, cron job tự bỏ qua, không ảnh hưởng gì đến phần còn lại của app.

## 10. Giới hạn đã biết / chưa triển khai

- Số tiền lưu dạng `Float` trong SQLite (không phải `Decimal`) — đủ chính xác cho VND (không có phần thập phân) nhưng khi chuyển sang Postgres nên cân nhắc `numeric(18,2)` (đã áp dụng sẵn trong file SQL migration).
- Sửa một giao dịch đã bị chia nhỏ (`transaction_splits`) chỉ cho phép sửa ghi chú/trạng thái, không cho đổi lại cách chia — cần xóa và tạo lại nếu muốn thay đổi số tiền từng phần.
- Nhập dữ liệu hàng loạt chỉ hỗ trợ file **CSV** (không đọc trực tiếp `.xlsx`) — có thể lưu file Excel dưới dạng CSV trước khi nhập.
- Chưa có bảng `notifications` (nhắc việc qua email/push) độc lập — chưa có hạ tầng gửi email/push được cấu hình trong môi trường này.
- Đính kèm hóa đơn qua Google Drive đã có code đầy đủ nhưng **chưa kiểm thử với credentials thật** — xem mục 8.
- Chưa có đăng nhập bằng sinh trắc học / mã PIN trên di động (cần app native hoặc PWA riêng với quyền truy cập phần cứng).
- Chuyển đổi loại tiền tệ ở Cài đặt hiện chỉ đổi ký hiệu hiển thị, chưa quy đổi tỷ giá giữa các đơn vị tiền tệ khác nhau.
