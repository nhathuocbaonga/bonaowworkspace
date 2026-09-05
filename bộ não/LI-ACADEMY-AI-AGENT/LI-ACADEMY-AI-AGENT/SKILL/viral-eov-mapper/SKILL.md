---
name: viral-eov-mapper
description: Tách TACTIC (cái nhìn/nghe được) khỏi EOV (Effect on Viewer — cảm xúc tạo ra) để tránh copycat syndrome. Dùng khi user muốn hiểu VÌ SAO video X viral, không phải CÁI GÌ video X có. Use when user says "tại sao video này viral", "EOV là gì", "tránh copycat", "tách tactic vs cảm xúc".
---

# Viral EOV Mapper

Ngăn **Copycat Syndrome** — lỗi 99% brand gặp phải: copy tactic mà không hiểu EOV (Effect on Viewer).

## Định nghĩa cốt lõi

| Khái niệm | Định nghĩa | Ví dụ |
|---|---|---|
| **Tactic** | Mọi thứ **nhìn/nghe được** trong video | text overlay, cut nhanh, nhạc drama, prop, camera angle |
| **EOV** | **Cảm xúc/trải nghiệm** viewer có được | intrigue, shock, relate, anticipation, "gut punch" |

**Công thức:** `1 tactic có thể tạo nhiều EOV — 1 EOV có thể đạt bằng nhiều tactic khác nhau`.

**Bài học Brendan Kane:** "Viewers don't engage because the music was nice or the lighting was dramatic. Engagement depends much more on the EOV."

## Input từ user
- 1 video viral reference (link + đã xem)
- (Optional) GSB sheet đã làm (từ `viral-gsb-analyzer`)

## 10 EOV phổ biến (có thể target)

| EOV | Trigger cảm xúc |
|---|---|
| Intrigue | Tò mò, muốn biết tiếp theo gì |
| Shock | Bất ngờ cực độ |
| Anticipation | Hồi hộp chờ sự kiện sắp diễn ra |
| Relate | "Ôi đúng cảm giác của tôi!" |
| Clarity | "À thì ra là vậy" — aha moment |
| Satisfaction | Thoả mãn khi nhìn thấy resolution |
| Awe | Ngưỡng mộ, choáng ngợp |
| Gut punch | Cảm xúc mạnh như bị đấm (dramatic twist) |
| Insider feeling | Cảm giác được biết bí mật, "được chọn" |
| Perspective shift | Nhìn vấn đề theo góc chưa từng thấy |

## Workflow

### 1. List mọi tactic quan sát được

Xem video 3 lần. Ghi lại:
- Text overlay (nội dung, màu, vị trí, timing)
- Nhạc (thể loại, tempo, volume dynamic)
- Cut (tần suất, transition type)
- Camera (angle, movement, zoom)
- Prop (vật gì, tương tác thế nào)
- Lời thoại (intonation, pace)
- Lighting (soft/hard, warm/cold)
- Facial expression của creator

### 2. Xác định EOV tại từng thời điểm

Break video thành các beat (mỗi 2-5 giây), gán EOV cho mỗi beat:

| Thời điểm | Tactic quan sát | EOV tạo ra |
|---|---|---|
| 0-3s | Close-up tay cầm búa + đĩa sứ (chưa đập) | Potential energy, Anticipation |
| 3-8s | Text "Kintsugi" + voiceover đặt câu hỏi | Intrigue |
| 8-15s | Đập vỡ đĩa, nhạc drop | Shock |
| 15-25s | Ghép vàng vào vết nứt | Satisfaction, Awe |
| 25-30s | Voiceover "...and that's you" | Gut punch, Relate |

### 3. Rút "EOV recipe" của video

```
Video này viral vì combo:
Potential energy (0-3s) → Intrigue (3-8s) → Shock (8-15s) → Satisfaction (15-25s) → Gut punch (25-30s)
```

### 4. Map lại: Tactic nào KHÔNG tạo EOV quan trọng?

Nhiều tactic chỉ là "filler" không drive performance. Loại khỏi list.

### 5. Đề xuất TACTIC THAY THẾ cho cùng EOV

Đây là output quan trọng nhất — giúp user **tái tạo EOV bằng cách riêng**, không copy:

| EOV cần tái tạo | Tactic gốc | Tactic thay thế (user có thể dùng) |
|---|---|---|
| Potential energy | Cầm búa + đĩa | Cầm kéo + áo vest cũ; đứng sát vách đá; cầm diêm + pháo hoa |
| Shock | Đập vỡ đĩa sứ | Lật ngược cốc cà phê; rơi iPhone xuống nước; xé hợp đồng |
| Gut punch | "...and that's you" | "...bạn vừa thấy chính mình"; "Đây là câu chuyện của 80% học viên mình" |

## Output format

```markdown
# EOV MAP — [Video title]
**Reference:** [link]
**Tổng view:** ...

## Beat-by-beat analysis
| Time | Tactic | EOV |
|---|---|---|
[full table]

## EOV Recipe
[Chuỗi EOV tạo nên virality]

## Tactic-vs-EOV assessment
- ✅ Tactic driving EOV (tái tạo EOV này bằng mọi giá): ...
- ⚠️ Tactic không liên quan EOV (bỏ qua khi tái tạo): ...

## Tactic thay thế đề xuất cho user
[Table cross-reference EOV → multiple tactic options]

## Lưu ý khi áp dụng
- KHÔNG copy tactic trực tiếp (→ copycat syndrome)
- Mục tiêu: người xem cảm thấy CÙNG EOV, không nhìn thấy CÙNG THỨ
- Thử 2-3 tactic khác nhau cho cùng 1 EOV, test cái nào phù hợp brand
```

## Case study — Mark Rober "World's Largest Jello Pool" (138M views)

| Tactic | EOV |
|---|---|
| Mở đầu Rober đứng TRONG hồ Jello, nói chuyện | Visual shock, Intrigue |
| Cut sang cảnh chuẩn bị nhảy, dừng ngay trước khi chạm | **Anticipation** ← driver chính |
| Story giữa về cách làm | Educational curiosity |
| Pay-off cú nhảy + phản ứng | Satisfaction |

**EOV recipe:** Shock → Anticipation → Curiosity → Satisfaction

**Tactic thay thế** cho creator khác với cùng recipe:
- Shock: đứng trên núi tiền xu, trong bể cá, trên đỉnh tháp sách
- Anticipation: cầm kéo trước mái tóc dài, đứng cạnh bức tường sắp phá

## Anti-pattern (sai lầm thường gặp)
- ❌ "Video top của họ có text vàng, mình cũng dùng text vàng" — chưa hiểu EOV
- ❌ "Họ dùng nhạc Billie Eilish, mình copy" — nhạc là tactic, EOV mới là mục tiêu
- ❌ "Họ quay close-up, mình cũng close-up" — không phân biệt EOV của close-up đó là gì
