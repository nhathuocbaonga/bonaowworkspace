# Hướng dẫn cài đặt Chatbot Zalo OA cho HANA (qua n8n)

File `n8n-workflow-hana-zalo-bot.json` là bản thiết kế/scaffold ban đầu — cần import vào n8n, gắn đúng credential và **test kỹ với dữ liệu thật** trước khi cho khách dùng thật. Đây là bản khởi điểm chắc chắn về logic, chưa phải bản đã chạy thử trên n8n thật (vì tôi chưa có instance n8n của sếp).

## Sơ đồ hoạt động

1. Khách nhắn tin vào Zalo OA (0978459369) → Zalo gửi webhook đến n8n.
2. n8n tải nội dung file Google Doc Q&A, đọc thành danh sách câu hỏi/trả lời.
3. n8n gọi Claude API, gửi kèm: danh sách Q&A + lịch sử vài tin nhắn gần nhất của khách đó + tin nhắn mới → AI trả về JSON: có khớp câu hỏi không, có cần chuyên gia không, khách đã hài lòng/kết thúc chưa.
4. Định tuyến:
   - Khớp & không cần chuyên gia → tự động trả lời khách qua Zalo OA.
   - Không khớp, hoặc cần chuyên gia → báo ngay qua Telegram để sếp Phương vào Zalo trả lời trực tiếp.
   - Khách xác nhận hết vấn đề (vd: "dạ em cảm ơn", "vậy là đủ rồi ạ") → n8n soạn tóm tắt buổi chăm sóc, gửi báo cáo qua Telegram, gửi lời cảm ơn cho khách, rồi xoá lịch sử phiên.

## Việc cần chuẩn bị trước khi import

### 1. Google Drive OAuth2 (đọc file Q&A)
- Trong n8n: Credentials → New → "Google Drive OAuth2 API" → đăng nhập bằng Google đang chứa file Q&A (nhathuocbaonga@gmail.com) → cấp quyền đọc Drive.
- File Q&A đã tạo sẵn, ID là: `1DppsBeoJJ9zAyeMJuqqw6hhIAbp1_gCEs3uzWn7beps` (đã điền sẵn trong node "Tai Q&A tu Google Doc" — không cần đổi trừ khi sếp tạo file khác).

### 2. Zalo OA Access Token
- Sau khi có App ID/Secret Key từ developers.zalo.me và Access Token của OA, dán vào 2 node:
  - "Gui tra loi qua Zalo OA"
  - "Gui loi cam on qua Zalo"
  - Thay giá trị `YOUR_ZALO_OA_ACCESS_TOKEN` bằng token thật.
- Access Token của Zalo OA thường hết hạn sau ~25 giờ và cần Refresh Token để làm mới — bản thiết kế này CHƯA có bước tự động refresh token, cần bổ sung thêm một workflow nhỏ chạy định kỳ (n8n Cron) gọi API refresh token của Zalo trước khi hết hạn. Báo tôi khi đến bước này, tôi sẽ bổ sung.
- Trên Zalo Developers, cấu hình Webhook URL trỏ về: `https://<n8n-của-sếp>/webhook/zalo-oa-webhook`, đăng ký sự kiện `user_send_text`.

### 3. Telegram Bot
- Trong n8n: Credentials → New → "Telegram API" → dán Bot Token đã có.
- Thay `YOUR_TELEGRAM_CHAT_ID` trong 2 node Telegram bằng Chat ID của sếp (lấy bằng cách nhắn `/start` cho bot rồi mở `https://api.telegram.org/bot<token>/getUpdates` để xem `chat.id`).

### 4. Claude API Key
- Vào node "Goi Claude API so khop", thay `YOUR_ANTHROPIC_API_KEY` bằng API key thật (lấy tại console.anthropic.com), và thay `REPLACE_WITH_YOUR_CLAUDE_MODEL` bằng tên model bạn có quyền dùng (ví dụ một model Claude hiện có trong tài khoản API của sếp).
- Đây là bước tốn phí theo lượt gọi API (rất rẻ cho việc phân loại/so khớp câu hỏi ngắn), khác với phí n8n/Zalo/MoMo.

## Cách import vào n8n
1. Mở n8n → góc trên phải → "Import from File" → chọn `n8n-workflow-hana-zalo-bot.json`.
2. Mở từng node còn thiếu credential (biểu tượng đỏ) → gán credential tương ứng ở trên.
3. Nhấn "Execute Workflow" thử với một payload webhook giả để kiểm tra từng bước trước khi Active.
4. Bật "Active" khi đã test ổn với vài câu hỏi mẫu trong file Q&A.

## Lưu ý an toàn/độ chính xác
- Đây là bản khung logic đầy đủ nhưng **chưa qua chạy thử thật trên n8n + Zalo + Telegram** — nên chạy thử nội bộ (tự nhắn tin test) trước khi để khách thật dùng.
- Cấu trúc điều kiện dùng schema n8n bản ổn định (IF node kiểu cũ) để giảm rủi ro lỗi khi import giữa các phiên bản n8n khác nhau — nếu n8n của sếp là bản rất mới, có thể node IF hiện ra dạng khác, chỉ cần cấu hình lại đúng 1 điều kiện so sánh chuỗi/boolean tương đương.
- Câu hỏi liên quan chỉ định y khoa luôn được đánh dấu "CẦN CHUYÊN GIA" trong file Q&A → bot không tự trả lời, luôn chuyển sếp Phương, đúng nguyên tắc an toàn y khoa.
