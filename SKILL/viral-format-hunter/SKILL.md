---
name: viral-format-hunter
description: Đào format viral đang hoạt động trong 1 ngành cụ thể trên TikTok/YouTube/Instagram. Tìm creator dùng format consistent ≥5-10 video với view cao đều. Use when user says "tìm format viral cho ngành X", "research đối thủ", "format nào đang hot", "đào creator top ngành...".
---

# Viral Format Hunter

Tìm các **Format** (khung kể chuyện lặp được) đang viral trong 1 ngành — không phải trend nhất thời.

## Định nghĩa quan trọng
- **Format** = cấu trúc storytelling tái sử dụng được (ví dụ "Two Characters, One Lightbulb", "Visual Metaphor", "Is It Worth It?", "Man on the Street", "Walking Listicle")
- **Trend** = ca khúc/meme/hiệu ứng nhất thời → KHÔNG phải target

## Input từ user
- Ngành / chủ đề (ví dụ "tài chính cá nhân", "fitness", "luật", "F&B")
- Platform ưu tiên (TikTok / YouTube Shorts / Instagram Reels / YouTube long-form)
- (Optional) Ngôn ngữ target (VN / EN / mix)

## Tiêu chí lọc creator (STRICT)

| Tiêu chí | Gold pass | Loại |
|---|---|---|
| Followers | ≥ 500K | < 100K (chưa đủ chứng minh) |
| View consistency | 5-10 video liên tiếp view cao tương đương | 1 video viral, còn lại 10K |
| Format nhất quán | Có pattern rõ lặp lại | Mỗi video 1 kiểu |
| Organic | Likes/views ≥ 5% (TikTok) / 1% (YT) | < 1% = paid-boost |
| Không celebrity | Thành công nhờ content, không phải danh tiếng có sẵn | Apple, Lady Gaga — loại |

## Keyword search strategy

### TikTok / YouTube
- Topic keyword + format keyword:
  - "Nutrition" + "Challenge"
  - "Real Estate" + "Tour"
  - "Finance" + "vs"
  - "Legal" + "Story Time"
- Dùng ChatGPT/Google để mở rộng keyword phụ
- Click vào video viral → mở profile → scroll xem có ≥ 5 video cùng format không

### Instagram
- **Bắt buộc dùng mobile app** (desktop search yếu)
- Search → chọn tab "reels" (cuối hàng horizontal)
- Scroll thủ công, không có sort theo view — phải ghi manually

## Common format pool (để quick-match)

| Format | Mô tả ngắn | Creator tham khảo |
|---|---|---|
| Visual Metaphor | Dùng vật thể ẩn dụ khái niệm trừu tượng | Dr. Julie Smith |
| Two Characters, One Lightbulb | 1 diễn viên đóng 2 vai Novice vs Expert | Erika Kullberg, Mark Tilbury |
| Untold Stories | Kể insider story ít ai biết | Daniel Wall |
| Is It Worth It? | Deconstruct sản phẩm luxury | Tanner Leatherstein |
| Man on the Street | Phỏng vấn người lạ ngẫu nhiên | Hunter Prosper, Alex Stemp |
| Watch Me Work | Expert showcase skill, teaser đầu | Mark Rober |
| Walking Listicle | Vừa đi vừa kể list tips | Robert Croak |
| Omegle Reactions | Bất ngờ tương tác với strangers qua video call | Marcus Veltri |
| $1 vs $10,000,000 | So sánh cực đoan giá trị | MrBeast template |
| How to Make X with Just Y | Template simplicity | Creative Explained |

## Workflow

1. **Phase 1 — Seed search:** nhập keyword → thu 20 video có view cao
2. **Phase 2 — Creator verification:** mở profile từng creator → check consistency
3. **Phase 3 — Format grouping:** gom video thành các cluster format
4. **Phase 4 — Output report**

## Output format

```markdown
# FORMAT HUNT — [Ngành]
**Platform:** [TikTok / YT / IG]
**Date:** YYYY-MM-DD

## Top 5 Format đang viral

### Format 1: [Tên format]
- **Cấu trúc:** [mô tả 2-3 dòng]
- **Creator examples:**
  - @handle1 — 2.3M followers, 5 video gần nhất trung bình 800K views
  - @handle2 — 1.1M followers, 4 video gần nhất trung bình 500K views
- **Gold sample:** [link + view + lý do sample này top]
- **Suitability cho user:** High / Medium / Low — vì [lý do]

### Format 2: ...
(repeat)

## Recommendation
Chọn Format X vì:
- Phù hợp niche user
- Barrier to entry thấp (không cần setup phức tạp)
- Đang trong giai đoạn "growing", chưa bão hòa
```

## Các cú lừa cần tránh
- **Outlier creator:** 1 video 20M nhưng avg 10K — loại
- **Celebrity-driven:** kênh Apple/brand lớn — loại, content không drive growth
- **Format-in-decline:** format đã hot 2-3 năm, giờ chỉ người cũ còn viral — note lại nhưng không khuyến nghị
