# Hàng Mỹ Chuẩn (hangmychuan.vn) — Design Spec v1
> Web tĩnh HTML/CSS/JS thuần, deploy Vercel. Mobile-first từ 360px. Khách: nữ 30–50, chủ yếu điện thoại.
> Tinh thần: "cửa hàng nhập khẩu uy tín", kiểu iHerb / Costco / nhà thuốc hiện đại: sạch, nhiều khoảng trắng, chữ to, ảnh sản phẩm là nhân vật chính. Không gradient chói, không chữ nhấp nháy, không đếm ngược giả.
> Chữ trong [ngoặc vuông] là chỗ chị Nga cần xác nhận hoặc bổ sung. Không bịa số liệu.

## 1. Design tokens

### 1.1 Màu
| Token | Hex | Vai trò |
|---|---|---|
| `--navy` | #3C3B6E | Màu chính: nút chính, tiêu đề, link, icon |
| `--navy-900` | #24234A | Navy đậm: thanh trên, footer, khối CTA cuối, hover của nút chính |
| `--navy-100` | #E3E3EF | Viền nhấn, chip đang chọn khi hover |
| `--navy-50` | #F1F1F7 | Nền section "Đang giảm giá", nền icon tròn |
| `--red` | #B22234 | Nhấn: nhãn -%, giá đang giảm, mục menu "Đang giảm giá" |
| `--red-700` | #8F1B2A | Hover của phần tử đỏ |
| `--cream` | #FAF7F2 | Màu phụ 1: nền hero, thẻ danh mục, các section xen kẽ |
| `--line` | #E6E2DA | Màu phụ 2 (xám ấm): viền thẻ, đường kẻ, viền input |
| `--ink` | #1E1F33 | Chữ tiêu đề, tên sản phẩm |
| `--text` | #3D3F52 | Chữ thân bài |
| `--muted` | #686A7B | Chữ phụ: thương hiệu, giá cũ, chú thích (5,3:1 trên trắng) |
| `--white` | #FFFFFF | Nền trang (bắt buộc) |
| `--ok` | #1F7A4D | Chỉ dùng cho icon tick ở các mục cam kết |

Quy tắc: trang chủ yếu là nền trắng. Navy chiếm khoảng 15% diện tích, đỏ dưới 5% (chỉ dùng cho giá giảm và nhãn). Không đặt chữ đỏ trên nền navy. Họa tiết cờ Mỹ chỉ dùng tiết chế: 3 vạch mảnh đỏ, trắng, đỏ (cao 4px) ở mép trên khối CTA cuối và góc ảnh hero.

### 1.2 Typography (font Be Vietnam Pro, 400/500/600/700, subset vietnamese, `font-display: swap`, preload 400 và 700)
| Style | Mobile (cỡ/độ đậm/line-height) | Desktop ≥900 | Dùng cho |
|---|---|---|---|
| display | 30 / 700 / 1.2 | 44 / 700 / 1.15 | H1 hero |
| h1 | 26 / 700 / 1.25 | 34 / 700 / 1.2 | H1 trang danh mục/chi tiết |
| h2 | 22 / 700 / 1.3 | 30 / 700 / 1.25 | Tiêu đề section |
| h3 | 18 / 600 / 1.35 | 20 / 600 / 1.35 | Tiêu đề thẻ, câu hỏi FAQ |
| body-lg | 17 / 400 / 1.6 | 18 / 400 / 1.6 | Mô tả hero, đoạn giới thiệu |
| body | 16 / 400 / 1.6 | 16 / 400 / 1.6 | Thân bài (tối thiểu 15) |
| name | 15 / 500 / 1.4 | 16 / 500 / 1.4 | Tên sản phẩm trong thẻ |
| price | 18 / 700 / 1.2 | 20 / 700 / 1.2 | Giá mới (trang chi tiết: 28/32) |
| small | 14 / 400 / 1.5 | 14 / 400 / 1.5 | Giá cũ, chú thích, footer |
| label | 13 / 600 / 1.2, chữ HOA, letter-spacing .04em | như mobile | Thương hiệu, eyebrow, nhãn -% |
Không dùng chữ dưới 13px ở bất kỳ đâu. Số tiền dùng `font-variant-numeric: tabular-nums`, định dạng `1.250.000đ`.

### 1.3 Bo góc · đổ bóng · spacing · container
- Bo góc: `--r-sm 8px` (input, thumbnail) · `--r-md 12px` (nút) · `--r-lg 16px` (thẻ sản phẩm, thẻ danh mục) · `--r-xl 24px` (hero, khối CTA) · `--r-pill 999px` (chip, nhãn, ô tìm kiếm).
- Bóng (pha sắc navy, không dùng đen thuần):
  `--sh-1: 0 1px 2px rgb(36 35 74 / .06)` (thẻ lúc nghỉ) · `--sh-2: 0 6px 20px rgb(36 35 74 / .10)` (hover, dropdown) · `--sh-3: 0 12px 32px rgb(36 35 74 / .16)` (nút nổi, thanh đáy).
- Spacing hệ 4px: 4 · 8 · 12 · 16 · 20 · 24 · 32 · 40 · 48 · 64 · 80. Khoảng cách dọc giữa các section: 48 (mobile), 64 (tablet), 80 (desktop).
- Container: max-width 1200px, căn giữa. Gutter 16 (<600), 24 (600–899), 32 (≥900).
- Breakpoint: base 360 · `sm 600` · `md 900` · `lg 1200`.
- Chuyển động: 150ms ease-out cho hover, 250ms cho accordion/dropdown. Tôn trọng `prefers-reduced-motion` (tắt translate/scale).

## 2. Header

### Desktop (≥900)
1. **Thanh trên** cao 36px, nền `--navy-900`, chữ 13px trắng 85%. Trái: icon tick + "Hàng chính hãng Mỹ – Canada – Nhật – Hàn". Phải: "Hotline/Zalo: 0984 542 459" (link `tel:`), gạch đứng, link Fanpage và TikTok. Thanh này cuộn đi bình thường, không dính.
2. **Thanh chính** cao 76px, nền trắng, viền dưới `--line`. Logo `logo.png` cao 48px ở trái. Ô tìm kiếm ở giữa: flex 1, max 560px, cao 48px, bo pill, nền `--cream`, viền `--line`; khi focus đổi nền trắng, viền navy, ring 3px `--navy-100`. Placeholder "Tìm vitamin, sữa, mỹ phẩm, thương hiệu…", nút kính lúp 40px tròn navy nằm trong ô. Phải: nút "Chat Zalo" (nút chính cao 48) và khối 2 dòng "Gọi tư vấn / 0984 542 459".
3. **Thanh menu danh mục** cao 52px, chữ 15/600 màu ink, gap 32. Thứ tự: Vitamin & TPCN ▾ · Làm đẹp & Chăm sóc cá nhân · Thực phẩm & Tiêu dùng ▾ · Thời trang ▾ · Mẹ & Bé · **Đang giảm giá** (màu đỏ) · Giới thiệu. Mục đang mở có gạch chân 3px navy. Hover vào mục có ▾ mở dropdown: thẻ trắng `--sh-2`, bo 16. Riêng Vitamin & TPCN mở mega-menu 3×3 gồm 9 nhóm con, mỗi ô có icon cơ quan 28px kèm nhãn.
- Khi cuộn xuống: thanh chính và thanh menu dính `top:0`. Thanh chính thu còn 60px, logo còn 40px, có `--sh-1`.

### Mobile (<900)
- Thanh trên cao 32px, chỉ hiện "Chính hãng Mỹ · Canada · Nhật · Hàn" căn giữa, cuộn đi.
- Hàng 1 (dính) cao 56px: logo cao 36px ở trái. Bên phải có nút kính lúp 44px (chỉ hiện sau khi ô tìm kiếm đã cuộn khỏi màn hình) và nút Gọi 44px.
- Hàng 2 (cuộn đi): ô tìm kiếm full width, cao 44px.
- Hàng 3 (dính) cao 48px: **menu chip cuộn ngang** gồm các chip Vitamin & TPCN · Làm đẹp · Thực phẩm · Thời trang · Mẹ & Bé · Đang giảm giá · Giới thiệu. Chip cao 36px, vùng chạm 44px, `scroll-snap`, mép phải có lớp mờ trắng 24px để báo còn nội dung phải cuộn.
- **Quyết định: chọn chip cuộn ngang, không dùng drawer.** Lý do: chỉ có 5 danh mục cấp 1 nên đủ hiện ngay. Khách 30–50 tuổi hay bỏ qua icon hamburger, còn chip chỉ cần một chạm và luôn nằm trong tầm mắt. Nhóm con được lọc bằng chip ngay trên trang danh mục, nên menu không cần nhiều cấp.

## 3. Trang chủ (thứ tự section)
1. **Hero**: nền `--cream`, khối bo 24 nằm trong container, padding 48/32 (desktop/mobile).
   - Desktop chia 2 cột 6/6. Cột trái: eyebrow (label, navy) "Hàng nhập khẩu chính hãng", H1 display ví dụ "Hàng Mỹ chuẩn, chọn đúng cho cả nhà", mô tả body-lg tối đa 2 dòng, 2 nút "Xem sản phẩm" (chính) và "Hỏi nhanh qua Zalo" (viền). Dưới nút là 3 tick nhỏ (14px): Chính hãng · Rõ hạn dùng · Tư vấn qua Zalo.
   - Cột phải: **ảnh ghép 5 sản phẩm thật** (PNG/WebP nền trắng hoặc đã tách nền). 1 sản phẩm lớn ở giữa, 4 sản phẩm nhỏ xếp lệch tầng, đặt trên một hình tròn `--navy-50` đường kính khoảng 420px. Thêm 3 vạch cờ mảnh ở góc trên phải. Không dùng ảnh stock người.
   - Mobile: chữ ở trên, ảnh ghép ở dưới (cao tối đa 260px, 3 sản phẩm). Hai nút xếp dọc full width.
2. **Thanh 4 cam kết**: nền trắng, viền trên/dưới `--line`. Desktop 4 cột, mobile lưới 2×2. Mỗi ô: icon line 28px navy, tiêu đề 15/600, mô tả 14 muted 1 dòng. Nội dung đề xuất: Chính hãng, rõ nguồn gốc · Hạn dùng rõ ràng · Tư vấn tận tình qua Zalo · [Giao hàng toàn quốc – chị xác nhận chính sách].
3. **Lưới 5 danh mục**: tiêu đề h2 "Mua theo danh mục". Desktop 5 cột, tablet 3 cột, mobile 2 cột (thẻ thứ 5 trải 2 cột, bố cục ngang ảnh trái chữ phải). Thẻ nền `--cream`, bo 16, padding 16. Ảnh đại diện vuông là 2–3 sản phẩm thật của nhóm xếp chồng. Tên h3 kèm "{n} sản phẩm" (đếm tự động từ dữ liệu) và mũi tên →. Hover: nền trắng, `--sh-2`, mũi tên dịch 4px.
4. **Vitamin theo nhu cầu**: h2 kèm mô tả 1 dòng "Chọn theo bộ phận cơ thể bạn muốn chăm sóc". 9 ô: Gan · Não & Trí nhớ · Thận · Mắt · Tim mạch · Cơ xương khớp · Tăng cân · Giảm cân · Vitamin khác. Mỗi ô: vòng tròn 64px nền `--navy-50` chứa icon line navy 32px (bộ icon tự vẽ hoặc dùng icon line thống nhất 1 nét 1.75px), nhãn 15/500 bên dưới. Desktop xếp 9 cột trên 1 hàng, tablet 5+4, mobile lưới 3×3 (ô tối thiểu 96×104). Bấm vào ô thì sang `/danh-muc/vitamin-tpcn?nhom=gan`.
5. **Sản phẩm nổi bật**: hàng tiêu đề gồm h2 ở trái và link "Xem tất cả →" ở phải. Lưới thẻ sản phẩm (mục 4): 8 thẻ trên desktop, 6 thẻ trên mobile. Dữ liệu lấy từ cờ `noiBat: true`.
6. **Đang giảm giá**: section nền `--navy-50` full-bleed. h2 có chấm đỏ 8px phía trước. Sản phẩm sắp theo % giảm giảm dần. Desktop là lưới 4 cột (8 thẻ). Mobile là **hàng cuộn ngang scroll-snap** (thấy khoảng 2,2 thẻ để báo còn tiếp), cuối hàng có thẻ "Xem tất cả ưu đãi".
7. **Vì sao chọn Hàng Mỹ Chuẩn**:
   - Phần A "Bạn từng lo…": 3 thẻ nhỏ nền `--cream`, icon dấu hỏi muted, chữ 16. Nội dung: Sợ mua phải hàng giả · Không rõ hạn dùng, nguồn gốc · Mua xong không ai hướng dẫn cách dùng.
   - Một mũi tên/đường nối navy dẫn xuống phần B.
   - Phần B "Chúng tôi làm thế này": 4 thẻ nền trắng, viền trái 4px navy, icon tick `--ok`, tiêu đề h3 kèm 2 dòng mô tả [chị duyệt nội dung]. Desktop 3 cột rồi 4 cột, mobile xếp dọc.
8. **Đặt hàng 3 bước**: các bước ① Chọn sản phẩm → ② Bấm "Đặt qua Zalo", nhắn tên và địa chỉ → ③ Chuyển khoản Seabank hoặc [COD?] rồi nhận hàng. Vòng số 48px nền navy, chữ trắng 20/700. Desktop xếp ngang 3 cột, nối nhau bằng đường gạch 2px `--navy-100`. Mobile là stepper dọc với đường nối bên trái.
9. **FAQ**: max-width 760px căn giữa, 6–8 câu. Dùng `<details>/<summary>`, mỗi dòng cao tối thiểu 56px, câu hỏi 17/600, icon + xoay thành ×. Câu trả lời body, padding dưới 16. Ví dụ câu hỏi: Làm sao biết hàng chính hãng? · Đặt hàng thế nào? · Thanh toán ra sao? · Bao lâu nhận hàng? · Có đổi trả không? · Tôi cần tư vấn chọn vitamin? (câu trả lời do chị cung cấp).
10. **CTA cuối**: khối `--navy-900` bo 24 trong container, padding 48/32, mép trên có 3 vạch cờ. H2 trắng "Chưa chắc chọn loại nào? Nhắn Zalo, mình tư vấn" và 2 nút: Zalo (nền trắng, chữ navy) và Gọi 0984 542 459 (viền trắng).
11. **Footer** (mục 9).

## 4. Thẻ sản phẩm (component `.p-card`)
- Khung: nền trắng, viền 1px `--line`, bo 16, padding 12 (mobile 10), `--sh-1`, flex dọc, mọi thẻ trong một hàng cao bằng nhau.
- **Ảnh**: tỉ lệ **1:1**, nền trắng, `object-fit: contain`, padding trong 8%, bo 12. Có sẵn `width`/`height` để tránh nhảy layout, `loading="lazy"` (trừ 4 ảnh đầu), WebP rộng 480px kèm srcset 2x.
- **Nhãn % giảm**: góc trên trái ảnh (top/left 8px), nền `--red`, chữ trắng 13/700, pill cao 24, nội dung "-25%". Chỉ hiện khi `giaCu > gia`, làm tròn xuống. Không có giá cũ thì không hiện nhãn.
- **Thương hiệu**: style label, màu muted, 1 dòng có ellipsis.
- **Tên**: style name, màu ink, **tối đa 2 dòng** (`-webkit-line-clamp: 2`), `min-height` bằng 2 dòng để các hàng thẳng nhau.
- **Giá**: giá mới style price, màu đỏ khi đang giảm và màu navy khi không giảm. Giá cũ 14 muted gạch ngang, nằm cùng hàng, cho phép xuống dòng ở 360px.
- **Nút "Đặt qua Zalo"**: full width, cao 44, nền navy, chữ trắng 15/600, icon Zalo 18px, bo 12, nằm sát đáy thẻ (`margin-top: auto`).
- Ảnh và tên là link sang trang chi tiết. Nút là hành động riêng, không lồng link trong link.
- **Hover** (chỉ khi `@media (hover:hover)`): viền `--navy-100`, `--sh-2`, `translateY(-2px)`, ảnh `scale(1.03)`, nút đổi `--navy-900`. **Focus-visible**: ring 3px `--navy` offset 2px. **Active**: nút `scale(.98)`.
- **Số cột**: <600 → 2 cột (gap 12) · 600–899 → 3 cột (gap 16) · ≥900 → 4 cột (gap 20). Ở 360px mỗi thẻ rộng khoảng 158px, đã kiểm tra chữ nút vừa 1 dòng.
- **Hành vi Zalo**: `zalo.me/0984542459` không hỗ trợ điền sẵn tin nhắn. Khi bấm, JS chép vào clipboard câu "Chào shop, mình muốn đặt: {tên} – {giá}. Link: {url}", hiện toast "Đã chép tin nhắn – dán vào Zalo nhé" trong 3 giây, rồi mở `https://zalo.me/0984542459` ở tab mới.
- Trạng thái loading: skeleton gồm khối ảnh 1:1 và 3 thanh xám `--cream`, chạy shimmer (tắt khi bật reduced-motion).

## 5. Trang danh mục `/danh-muc/<slug>`
- Breadcrumb 14 muted: Trang chủ › Vitamin & TPCN.
- Khối đầu trang nền `--cream` bo 24: H1 kèm mô tả 1–2 câu (body, tối đa 640px) và "{n} sản phẩm".
- **Chip lọc nhóm con** (dính dưới header, nền trắng, cao 56): "Tất cả" và các nhóm con của danh mục đó (Vitamin có 9, Thực phẩm có 2, Thời trang có 3: Giày dép · Quần áo · Phụ kiện). Chip cao 40 bo pill, viền `--line`; chip đang chọn nền navy chữ trắng. Mobile cuộn ngang. Danh mục không có nhóm con thì ẩn hàng chip.
- **Sắp xếp**: `<select>` native cao 44, nhãn "Sắp xếp:". Các lựa chọn: Mặc định · Giá tăng dần · Giá giảm dần · Giảm nhiều nhất. Desktop đặt bên phải cùng hàng với số kết quả, mobile đặt một hàng riêng dưới chip.
- Trạng thái lọc và sắp xếp ghi lên URL (`?nhom=gan&sx=gia-tang`) để gửi link qua Zalo vẫn giữ đúng bộ lọc.
- Lưới thẻ theo mục 4. Hiện 24 sản phẩm trước, sau đó nút "Xem thêm 24 sản phẩm" (viền navy, cao 48, căn giữa).
- Empty state: icon, câu "Nhóm này đang cập nhật hàng", nút Zalo "Hỏi shop có hàng không".

## 6. Chi tiết sản phẩm: **chọn trang riêng** `/san-pham/<slug>`
Lý do: link chia sẻ được qua Zalo/Facebook, có SEO, nút Back hoạt động tự nhiên, khách lớn tuổi không bị lạc trong modal. Nên sinh sẵn file HTML tĩnh từ `products.json` bằng một script build. Phương án dự phòng: `san-pham.html?sp=slug`.
- Desktop chia 2 cột 7/5, gap 48.
  - **Trái**: ảnh chính 1:1 trong khung viền `--line` bo 16. Bấm vào ảnh để phóng to toàn màn hình. Dưới là hàng thumbnail 72px (viền navy 2px ở ảnh đang chọn).
  - **Phải**: thương hiệu (label, link sang tìm kiếm theo thương hiệu) · H1 (h1) · chip xuất xứ "Mỹ"/"Canada"/… nếu dữ liệu có · khối giá (giá mới 28/32 màu đỏ hoặc navy, giá cũ gạch ngang, nhãn "-25% · Tiết kiệm 150.000đ") · 3–5 gạch đầu dòng công dụng hoặc quy cách · **CTA**: "Đặt qua Zalo" (chính, cao 52, full width) và "Gọi 0984 542 459" (viền navy, cao 52) · dòng nhỏ "Hoặc nhắn Fanpage" · danh sách 3 tick cam kết.
  - **Hộp lưu ý TPCN** (chỉ hiện với nhóm Vitamin & TPCN): nền `--cream`, viền trái 4px navy, bo 12, padding 16, chữ 15: "Sản phẩm này không phải là thuốc và không có tác dụng thay thế thuốc chữa bệnh."
- Dưới 2 cột là các khối Mô tả · Cách dùng · Bảo quản / lưu ý. Desktop hiển thị liền nhau, mobile dùng accordion `<details>`, mở sẵn khối đầu.
- **Sản phẩm liên quan**: h2 "Có thể bạn quan tâm", 4 thẻ cùng nhóm con (desktop lưới 4, mobile hàng cuộn ngang).
- Mobile: ảnh full width, rồi đến thông tin. Thanh đáy (mục 8) đổi thành [Gọi] [Đặt qua Zalo sản phẩm này].

## 7. Tìm kiếm & Giới thiệu
- **Gợi ý khi gõ** (sau 2 ký tự, debounce 150ms): dropdown trắng `--sh-2` bo 16, tối đa 6 dòng (thumbnail 44 · tên 1 dòng · giá) và dòng "Xem tất cả kết quả cho '…'". Hỗ trợ phím ↑↓ và Enter. Tìm không phân biệt dấu: chuẩn hoá NFD, bỏ dấu, "đ" thành "d", so trên tên, thương hiệu và nhóm.
- **Trang `/tim-kiem?q=`**: H1 "Kết quả cho '{q}'" kèm số kết quả, chip lọc theo 5 danh mục, rồi lưới thẻ. Khi không có kết quả: câu gợi ý kiểm tra chính tả, chip 5 danh mục, nút Zalo "Không thấy? Nhắn shop tìm giúp".
- **Trang Giới thiệu** (`/gioi-thieu`), gồm 5 khối:
  1. Hero ngắn nền cream: H1 kèm 1 đoạn.
  2. Câu chuyện cửa hàng: 2–3 đoạn, max-width 720 [chị cung cấp, không bịa năm hay số khách]. Có thể kèm 1 ảnh thật của kệ hàng hoặc kho.
  3. Tái sử dụng thanh 4 cam kết.
  4. Khối thông tin liên hệ: SĐT, Zalo, Fanpage, TikTok, [địa chỉ nếu có].
  5. CTA cuối.

## 8. Liên hệ nổi
- **Desktop (≥900)**: cụm 3 nút tròn 56px ở góc phải dưới (right 24, bottom 24, gap 12), thứ tự từ trên xuống: Messenger · Gọi · Zalo (nút dưới cùng to nhất là 60px, có vòng pulse nhẹ 1 lần khi tải trang, tắt khi bật reduced-motion). Mỗi nút có `--sh-3`, hover hiện nhãn pill bên trái ("Chat Zalo", "0984 542 459", "Nhắn Fanpage").
- **Mobile (<900): QUYẾT ĐỊNH có thanh đáy cố định và bỏ nút nổi.** Thanh cao 64px cộng `env(safe-area-inset-bottom)`, nền trắng, viền trên `--line`, `--sh-3`. Gồm 3 ô: Gọi (icon và chữ, 25%) · **Đặt qua Zalo** (nút navy, 50%) · Messenger (25%).
  - Lý do: nằm trong vùng ngón cái, không che nút trên thẻ sản phẩm như bong bóng nổi, và nhãn chữ rõ hơn icon trơn với khách 30–50 tuổi.
  - `body` có `padding-bottom: 80px`. Thanh tự ẩn khi ô tìm kiếm đang focus (bàn phím mở).

## 9. Footer
- Nền `--navy-900`, chữ trắng 80%, link trắng 100%, gạch chân khi hover. Padding trên 64.
- Desktop 4 cột (3/2/2/5 trên lưới 12):
  1. **Thông tin**: logo đặt trên tấm trắng bo 12 padding 12 (logo có cờ nên không đặt trực tiếp lên navy), 2 dòng giới thiệu, dòng "Hotline/Zalo: 0984 542 459", [địa chỉ/giờ làm việc].
  2. **Danh mục**: 5 link danh mục và "Đang giảm giá".
  3. **Hỗ trợ**: Cách đặt hàng · Câu hỏi thường gặp · Giới thiệu · [Chính sách đổi trả] · [Giao hàng].
  4. **Thanh toán – khối chuyển khoản**: thẻ nền trắng, chữ ink, bo 16, padding 20. Tiêu đề "Chuyển khoản Seabank" kèm logo ngân hàng. Bên trái là Chủ TK: [tên], STK: [số] (font 18/700, nút "Chép" 44px, chép xong toast "Đã chép số tài khoản"), Nội dung CK: "Tên + SĐT". Bên phải là **QR 160×160** (ảnh `images/qr-seabank.png`, có alt). Bên dưới là hàng icon mạng xã hội 44px: Zalo · Fanpage · TikTok.
- Mobile: khối chuyển khoản lên **đầu** footer, kế đến Thông tin, sau đó Danh mục và Hỗ trợ xếp 2 cột cạnh nhau, cuối cùng là mạng xã hội. QR 180px căn giữa.
- Dòng cuối: viền trên trắng 10%, chữ 13: "© {năm hiện tại} Hàng Mỹ Chuẩn · hangmychuan.vn".

## 10. Quy tắc a11y & chất lượng (bắt buộc, kiểm trước khi deploy)
- Tương phản WCAG AA: chữ thường ≥ 4.5:1, chữ lớn/icon ≥ 3:1. Các cặp đã đạt: ink, text, muted, navy, red trên trắng/cream; trắng trên navy, navy-900, red. **Cấm** dùng muted trên `--navy-50` cho chữ dưới 16px, và cấm chữ đỏ trên navy.
- Cỡ chữ: thân bài mobile tối thiểu **15px** (mặc định 16), không chữ nào dưới 13px. Dùng đơn vị `rem` để phóng chữ trình duyệt lên 200% vẫn không vỡ layout và không cuộn ngang.
- Vùng chạm tối thiểu **44×44px** (chip, icon, nút chép, link footer có padding). Khoảng cách giữa 2 vùng chạm tối thiểu 8px.
- Focus nhìn thấy rõ trên mọi phần tử tương tác (ring 3px navy, trên nền tối thì ring trắng). Thứ tự tab theo thứ tự đọc. Có link "Bỏ qua tới nội dung".
- HTML ngữ nghĩa: `header/nav/main/footer`, mỗi trang 1 H1, heading không nhảy cấp. Accordion dùng `<details>`. Menu dropdown có `aria-expanded` và đóng bằng Esc.
- Ảnh sản phẩm có `alt` = "{thương hiệu} {tên}". Icon trang trí dùng `aria-hidden`. Nút chỉ có icon phải có `aria-label` ("Gọi 0984 542 459", "Chat Zalo").
- Không truyền đạt thông tin chỉ bằng màu: giá giảm luôn kèm giá cũ gạch ngang và nhãn "-%".
- Hiệu năng: ảnh WebP ≤ 60KB/ảnh, lazy-load, font chỉ 2 file preload, không dùng thư viện JS ngoài. Mục tiêu Lighthouse mobile ≥ 90 (Performance và Accessibility).
- Ảnh tải về để trong `images/`, tham chiếu bằng đường dẫn tương đối, không hotlink Drive.
