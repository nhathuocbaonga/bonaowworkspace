---
name: lam-video-247
description: Làm video 40 giây "VIDEO 247 AI BAO NGA" từ Notion "30 Kịch Bản ADS APP 247". Dùng khi chị Nga nhắn "làm video số 1, 2...", "làm video số 9 và 10", "làm video tiếp theo", "làm 3 video tiếp theo", hoặc nhắc tới làm video ngành nghề theo Notion.
---

# Làm video 247 theo Notion (lệnh chung, chị chốt 21/11/2026)

Tool: `D:\BỘ NÃO BRAIN\bộ não\Tool-Video-Chuyen-Gia-Flow\` · lệnh chạy: `lam_video.py`.

## 1. Lấy dữ liệu
- Notion data source `collection://41bfc15b-b8c9-80f7-a799-000bb0d29bac` (DB "30 Kịch Bản ADS APP 247").
  Cột: `Số thứ tự` (title, có thể dạng "8 (1)" = bản sửa của số 8), `Chủ đề`, `Kịch bản`, `Hộp kiểm đã tạo video` (checkbox).
- "làm video số N" → lấy đúng hàng số N (dù đã tích vẫn làm lại nếu chị yêu cầu đích danh).
- "làm video tiếp theo" / "K video tiếp theo" → các hàng CHƯA tích hộp kiểm, xếp theo số thứ tự tăng dần, lấy K hàng đầu (mặc định 1). Bỏ hàng đã tích.

## 2. Soạn cấu hình `video-notion/<số>.json`
Mẫu xem các file sẵn có (1, 2, 4, 6, 7, 8, 19, 31). Quy tắc:
- 4 câu nội dung + 1 CTA = 5 cảnh × 8 giây ≈ 40 giây. Mỗi câu ≤ ~31 tiếng (Veo ~4 tiếng/giây), nói kín 8 giây, được ngắt giữa câu.
- Dùng NGUYÊN VĂN kịch bản Notion, chỉ rút bớt cho vừa. Bỏ câu hứa quá ("hàng ngàn khách hàng", "triệu view"). Không bịa số liệu.
- Lời đọc: "AI" → "ây ai", "prompt" → "pờ rom" (màn hình tự ghi "AI"/"prompt"). Xưng "Bảo Nga", không "tôi"/"cô Nga".
- `cta`: 0 = câu ZOOM, 1 = câu VIDEO (theo từ khoá trong Notion; "Tham gia cộng đồng" → 0). Câu riêng thì ghi chuỗi.
- `thumb`: 2 dòng hook giật tít (≤ ~22 ký tự/dòng), đánh nỗi đau ngành.
- `anh`: ảnh khung đầu `anh-nhan-vat/00-bao-nga-<ngành>.png`. Có sẵn: bac-si, bao-hiem, cafe, dinh-duong, duoc-si, my-pham, spa, studio-ai, thoi-trang, marketing, yoga. Ngành mới → đặt tên mới + viết `mo_ta` (trang phục + bối cảnh đúng ngành, câu KHUNG chuẩn) và `ho_so` (tiếng Anh + concept màu riêng ngành); tool tự tạo ảnh từ mặt thật của chị.
- `hu`: hiệu ứng từng cảnh (keyword / danh_sach / so_do / dau / broll / cta). Mọi `tu`/`den` phải là cụm có trong lời cảnh đó. 1–2 b-roll/video, mô tả ảnh không chữ, không mặt người.
- Kiểm tra nhanh trước khi chạy: từ khoá hiệu ứng có trong lời, mỗi cảnh ≤ 31 tiếng.

## 3. Chạy
```
$env:PYTHONUTF8=1; python lam_video.py 1 4 7      (chạy nền, output ra scratchpad)
```
Nhiều số chạy nối tiếp trong 1 lệnh. Mỗi video: Flow tạo 5 cảnh song song (Veo 3.1 Lite), đổi giọng Bảo Nga, ghép động + thumbnail 1 giây.
Lỗi giữa chừng → chạy lại cùng lệnh: cảnh/ảnh đã có được giữ, không tốn credit lại. `--ghep` = chỉ ghép lại.

## 4. Kiểm tra rồi gửi
- Cắt 7 khung (0.1, 3, 9, 15, 22, 27, 35s) ghép thành dải xem không che mặt, chữ đúng; Whisper nghe lại đủ lời.
- Gửi file `THANH-PHAM/<tiêu đề>.mp4` cho chị (SendUserFile).
- Tích `Hộp kiểm đã tạo video` = `__YES__` cho hàng đó trên Notion (để "video tiếp theo" lần sau bỏ qua).
- Ghi 1 dòng vào AGENTS.md (mục VIDEO 247) nếu có điều mới học được.
