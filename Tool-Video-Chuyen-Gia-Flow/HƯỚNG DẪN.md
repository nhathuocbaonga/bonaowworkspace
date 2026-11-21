# VIDEO 247 AI BAO NGA (trước đây: Xưởng Video Chuyên Gia Flow)

Gõ 1 dòng chủ đề → chọn nhân vật → bấm TẠO VIDEO → ra video 9:16 (hook + phụ đề theo concept ảnh) trong `THANH-PHAM\`.
Mở bằng lối tắt Desktop **"VIDEO 247 AI BAO NGA"** (hoặc `CHAY-TOOL.bat`).

## Dùng hằng ngày
1. Gõ chủ đề (mỗi dòng 1 video; dán nhiều dòng = hàng chờ).
2. **Dạng video**: mặc định **5C – Quảng cáo 40 giây (Master Framework)** = đúng 5 cảnh × 8 giây: Hook · Nỗi đau · Giải pháp · Giá trị & bằng chứng · Kêu gọi. Vẫn chọn được 12 dạng chuyên gia cũ.
3. **Mục đích** (marketing sản phẩm / quảng cáo app-khoá học) và **Thông tin SP đã xác minh** (không bắt buộc — AI chỉ dùng đúng các ý này làm bằng chứng, không bịa số liệu).
4. **Nhân vật**: chọn trong danh sách 33 hồ sơ hoặc bấm **🖼 Bảng ảnh** để chọn bằng hình. Mỗi hồ sơ khoá trang phục + bối cảnh + phụ kiện cổ tay của ảnh đó; khuôn mặt, kính, tóc khoá chung (Character Lock). Ảnh hồ sơ = khung hình đầu gửi Flow.
5. Bấm **TẠO VIDEO**. Bảng cảnh hiện từng cảnh: PHẦN · lời thoại · số GIÂY ước tính (đỏ ⚠ = quá 7,6 giây) · TÌNH TRẠNG (Đang chờ / Đang tạo / Hoàn thành / Lỗi).

Muốn xem/sửa lời trước khi tốn tín dụng: bỏ tick "Tự chạy hết", bấm đúp ô lời thoại để sửa rồi bấm GỬI SANG FLOW.

## Cảnh lỗi / làm lại
- Một cảnh lỗi: app tự thử lại 1 lần, vẫn lỗi thì đánh dấu **Lỗi**, làm tiếp cảnh khác và **không ghép** video thiếu cảnh.
- Chọn cảnh trong bảng → **🔁 Tạo lại cảnh đang chọn** (bản cũ được cất `.bak.mp4`) → app tự ghép lại.
- **🕘 Mở dự án cũ**: mở lại dự án trong `du-an\` để sửa lời, tạo lại cảnh hoặc **🎬 Ghép lại**.

## Chữ trong video theo concept từng ảnh
Không cố định màu: mỗi hồ sơ có màu hộp hook, nền phụ đề, font lấy tự động từ ảnh (nhà thuốc → xanh, trang sức → vàng + font có chân, spa → nâu ấm…). Xem trước ở khung bên phải bảng cảnh. Chỉnh tay: **🎨 Concept chữ**. Hook nằm ~60% chiều cao để không che mặt.

## Làm 1 lần
- Bấm **Đăng nhập Flow** → chị tự đăng nhập Gmail `nguyenbaonga06@gmail.com` (tool không tự gõ mật khẩu).
- Lệnh `claude` phải đăng nhập (mở CMD gõ `claude`, rồi `/login`) để viết kịch bản. Dự phòng: `GEMINI_API_KEY` trong `.env` của thư mục này.
- Thêm ảnh nhân vật mới: thả vào `anh-nhan-vat\` rồi bấm ⟳ — app tự tạo hồ sơ + concept (sửa tên/trang phục trong `anh-nhan-vat\nhan_vat.json`).
- Thương hiệu, CTA, giọng nói (Voice Lock), giới hạn giây: sửa `cau_hinh.json` (tạo file nếu chưa có; mặc định trong `master_5c.py`).

## Lưu ý thật thà
- Độ dài lời thoại là **ước lượng theo số tiếng** (≈4,2 tiếng/giây — nhịp nói nhanh kiểu chuyên gia, 26–31 tiếng/cảnh), chưa đo bằng giọng đọc thử.
- Giọng tiếng Việt do Veo tạo có thể sai vài chữ, giọng giữa các cảnh có thể lệch nhẹ; phụ đề lấy từ kịch bản nên chữ trên màn hình luôn đúng.
- Phần bấm Flow (tải ảnh khung đầu, tải video về) cần chạy thử lần đầu để chỉnh bảng `SEL` trong `flow.py`.

## Ô 🎤 Giọng (chốt 18/11/2026 tối)
Hai lựa chọn:
- **Giọng Bảo Nga** (mặc định): đổi giọng Veo của mọi cảnh sang giọng thật của chị.
  Giọng mẫu `giong-noi\bao-nga-mau.wav` dài 21 giây, bóc từ bản quay gốc `3. Video gốc\Ngày 6.mov` (bản chưa ghép nhạc).
  Bản đầy đủ `bao-nga-day-du.wav` dài 60 giây. Mẫu cũ bóc từ 7B giữ lại ở `*-7B-cu.wav`.
  Thay file mẫu thì lần ghép sau app tự đổi giọng lại các cảnh cũ.
- **Giọng Veo nữ miền Bắc**: Veo đọc theo Voice Lock (giọng Hà Nội, khoảng 40 tuổi). Khi ghép, app lấy giọng cảnh 1 làm mẫu rồi đổi mọi cảnh về đúng giọng đó.

**Chữ "ây ai":**
- Chỉ dùng trong lời đọc gửi Veo, để Veo đọc liền như tiếng Anh "A.I.".
- Mọi chữ hiện ra luôn là **"Bảo Nga AI"**: phụ đề, hook, keyword, sơ đồ, CTA, tên dưới màn hình, caption .txt, tên file. App tự đổi qua hàm `common.man_hinh`.

## Lệnh chung theo Notion (21/11/2026)
- Chị chỉ cần nhắn Claude: **"làm video số 9"**, **"làm video số 9, 10"** hoặc **"làm 3 video tiếp theo"**.
- "Tiếp theo" = các ngành CHƯA tích "Hộp kiểm đã tạo video" trong Notion "30 Kịch Bản ADS APP 247", theo số thứ tự.
- Claude soạn `video-notion/<số>.json` rồi chạy `python lam_video.py <số...>`; xong thì gửi video và tự tích hộp kiểm.

## Nhanh hơn, ít tốn credit hơn (20/11/2026)
- **Tạo cảnh song song:** mỗi cảnh mở 1 tab Flow riêng, gửi hết 5 lệnh rồi cùng chờ. Video bảo hiểm: 4 cảnh xong trong ~4 phút (trước ~12–15 phút). Số credit không đổi (mỗi cảnh 1 lần Veo 3.1 - Lite x1). Tắt bằng `"flow_song_song": false` trong `cau_hinh.json`.
- **Cài đặt Flow lưu theo TỪNG DỰ ÁN:** tab nào cũng phải đặt Veo 3.1 - Lite + "Không bao giờ xác nhận". Nếu Flow vẫn hỏi "Phê duyệt … X tín dụng", app chỉ bấm duyệt khi đúng model Lite; model khác (Omni Flash 24 tín dụng) thì không duyệt.
- **Giao diện Flow 20/11:** "Cài đặt tác nhân" ở bảng phải, không còn nút Lưu; app tự đặt và tự đóng hộp thông báo tính năng mới.
- **Ảnh khung đầu:** dừng ngay khi có bản giống ≥ 0,73 (trước luôn tạo đủ 3 bản, ~5 phút + credit mỗi bản).
- **Đổi giọng gom cảnh:** cảnh về cùng lúc thì đổi giọng 1 lượt (nạp mô hình 1 lần), ~70 giây/cảnh thay vì ~88.
- **Video đã đủ cảnh** thì không mở dự án Flow nữa (chỉ ghép).
- Lời đọc viết "pờ rom" để Veo đọc đúng, màn hình tự ghi "prompt" (như "ây ai" → "AI").

## Thumbnail ở 1 giây đầu (18/11/2026)
Video nào xuất ra cũng tự có thumbnail (`thumbnail.py`):
- Kiểu giống tool edit video short: 2 thanh chữ font Anton, viết hoa. Thanh trên nền đỏ chữ vàng, thanh dưới nền trắng chữ đỏ. Thanh đặt dưới cằm, không che mặt.
- Ảnh nền lấy từ đầu cảnh 1. App đo độ mở mắt và chọn khung chị mở mắt, nét nhất.
- Thumbnail là **đoạn 1 giây riêng, nối vào TRƯỚC video**. Video gốc giữ nguyên, kể cả dòng phụ đề đầu, nên video dài thêm 1 giây.
- Chữ có ngay từ khung đầu tiên, vì nền tảng hay lấy khung này làm ảnh bìa.
- Chuyển động trong đoạn mở: nền lùi từ 1,1x về 1x, loé sáng nhẹ. Hai thanh chữ "đập" vào đúng chỗ, thanh trắng chậm hơn 0,14 giây. Cuối đoạn đẩy nhẹ vào video.
- Âm thanh (bộ âm nhận diện `sfx.py`): impact và pop ở 0 giây, pop ở 0,14 giây. Whoosh bắt đầu ở 0,62 giây, chạy qua điểm nối nên rơi đúng cú impact của hook video gốc. Chỉnh thời điểm và độ to ở `thumbnail.AM_MO`.
- App xuất thêm `<tên video>.jpg` để dùng làm ảnh bìa khi đăng.
- Chữ mặc định là hook, tự tách làm 2 dòng. Muốn tự đặt chữ: ghi `"thumbnail": ["dòng trên", "dòng dưới"]` trong `kichban.json`. Muốn tắt: ghi `"thumbnail_1s": false`.

## Giọng thật, nhạc nền, nhịp 40 giây (16/11/2026)
- **🎤 Giọng thật Bảo Nga**: đổi giọng Veo sang giọng chị bằng Seed-VC, mẫu giọng 20 giây `giong-noiao-nga-mau.wav`
  (đo thử: mẫu 20 giây rõ chữ hơn mẫu 11 giây). App đổi giọng **từng cảnh ngay khi Flow làm xong cảnh đó** (song song lúc Flow tạo cảnh sau),
  nên khi Flow xong thì ghép gần như ngay. Đổi giọng 1 cảnh ~1 phút trên máy này (`giong-noi\doi_giong_nhanh.py`, Whisper chạy float32).
- **Tự cắt hình thừa**: đầu/cuối mỗi cảnh 8 giây, đoạn nhân vật chỉ làm động tác không nói được cắt bỏ (đo năng lượng giọng, `ghep.moc_loi_noi`).
- **🎵 Nhạc nền**: thả mp3/m4a/wav vào `nhac-nen\` (nút 📂). Mặc định 3 bản nhạc không lời chị tự làm bằng Suno; chọn 1 bài, Ngẫu nhiên, hoặc Không dùng.
  Nhạc tự nhỏ dưới giọng nói và tự hạ thêm khi đang nói, mờ dần đầu/cuối.
- **Nhịp nói nhanh**: Voice Lock + prompt yêu cầu nói liền mạch gần kín 7,5 giây/cảnh, 5 cảnh ≈ 40 giây.

## Video động: motion graphics + âm thanh thông minh (18/11/2026)
Mặc định mọi video xuất kiểu động (`dong_hoa.py` vẽ đồ hoạ, `dong_hoa_xuat.py` ghép; tắt bằng `"dong_hoa": false` trong kichban.json):
- **Căn đúng chữ đang nói** (`can_chu.py`, Whisper trên tiếng Veo gốc): phụ đề, keyword, âm thanh hiện đúng lúc chị nói chữ đó.
- **Zoom + motion**: mỗi cảnh đẩy chậm rồi punch-in giữa cảnh (giả lập đổi góc máy) — mỗi ~3–4 giây có 1 thay đổi.
- **Hiệu ứng theo ý nghĩa** (`hieu_ung` từng cảnh — AI viết kịch bản 5C tự sinh, hoặc Claude viết tay):
  keyword chữ 3D + icon · danh sách việc hiện lần lượt · sơ đồ các bước nối mũi tên · lưới icon (vd hàng ngàn shop, 6 trợ lý AI)
  · con dấu cảnh báo · B-roll ảnh minh hoạ toàn màn hình (Ken Burns) · CTA chữ khoá 3D + ô bình luận gõ chữ + mũi tên + vòng tròn.
- **Luôn có**: hook nảy 3D, lower-third tên chị, thanh tiến trình trên cùng.
- **Âm thanh nhận diện cố định** (`sfx.py` -> `sfx/`): pop = keyword · whoosh = chuyển ý/B-roll · ding = insight · riser trước reveal
  · impact = nhấn mạnh · click = giao diện. Nhạc nền **tự chọn theo mood** (mặc định modern-tech "Forward Motion"), tự hạ khi chị nói;
  giọng được làm sạch (giảm ồn, EQ, nén, cân âm lượng).
- **CTA cố định** (`master_5c.CTA_CO_DINH`): cảnh cuối dùng nguyên văn 1 trong 2 câu "Comment từ ZOOM…" / "Hãy bình luận từ khóa VIDEO…".

**Quy tắc chị chốt 18/11/2026:** đồ hoạ không bao giờ che mặt (app đo mặt từng cảnh, tự đặt trên đầu / dưới cằm, log ghi
"rà soát che mặt"); video 5 cảnh đủ ~40 giây, giữ nguyên văn kịch bản Notion trừ khi vượt 40s; chữ "ây ai" viết và đọc đúng "ây ai".

## Ảnh khung đầu giống chị nhất
`python khung_dau.py <tên ảnh ra> "" <số bản>` — Flow lấy **ảnh thật chính diện** trong `Ảnh tham chiếu các góc mặt Bảo Nga\` làm ảnh gốc để
chỉnh sửa (tóc đen dài, son đỏ), chỉ thay trang phục + bối cảnh mô tả bằng chữ; tạo vài bản, `do_mat.py` (OpenCV SFace) đo độ giống
khuôn mặt và giữ bản giống nhất, tự xoá dấu sao Gemini. KHÔNG đính ảnh mẫu có người khác (Flow sẽ chép mặt người đó).
Mô hình nhận diện mặt `models\*.onnx` chép từ tool Edit video DÀI (không lên git).

## Khi Flow đổi giao diện
Bấm **Kiểm tra giao diện Flow**: chỉ mở Flow và ghi cây nút vào `debug\giao_dien.txt`, không tạo video, không tốn tín dụng.

## Các file
`gui.py` giao diện · `master_5c.py` Master Framework 5C + Character Lock + đo lời thoại · `nhan_vat.py` 33 hồ sơ · `concept.py` lấy màu/font từ ảnh ·
`kichban.py` viết kịch bản · `flow.py` điều khiển Google Flow · `ghep.py` cắt hình thừa + ghép + hook + phụ đề + nhạc nền · `giong.py` giọng thật · `nhac.py` nhạc nền · `khung_dau.py` + `do_mat.py` ảnh khung đầu giống chị · `prompt_kich_ban.md`, `dang_video.json` 12 dạng cũ.
