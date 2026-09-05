---
name: viral-myth-buster
description: Audit chiến lược social media của 1 brand/creator, phát hiện họ đang mắc myth nào trong 7 myth viral (Brendan Kane). Use when user says "audit kênh", "soi strategy", "kênh này sai ở đâu", "check trang fanpage/TikTok/YouTube này".
---

# Viral Myth Buster

Audit chiến lược content của 1 brand/creator theo 7 myth Brendan Kane đã debunk trong *The Guide to Going Viral*.

## Input từ user
- Link profile (TikTok/YouTube/Instagram/Facebook) hoặc tên brand
- (Optional) Mục tiêu họ muốn đạt: follower, sales, brand awareness, leads

## Checklist 7 myth — đánh ✓/✗ cho từng cái

| # | Myth | Dấu hiệu mắc phải | Bằng chứng cần thu |
|---|---|---|---|
| 1 | "Phải có kinh nghiệm lâu năm" | Creator mới, bỏ cuộc sớm vì nghĩ mình không đủ trình | Tuổi kênh, tần suất nghỉ đăng |
| 2 | "Phải có team/ngân sách lớn" | Video over-produced, camera đắt tiền nhưng kịch bản nhạt | Quality production vs storytelling depth |
| 3 | "Phải có mặt mọi nền tảng" | Đăng cross-post 1 video lên 5 platform không tối ưu từng cái | Check ratio views/followers từng platform |
| 4 | "Đăng càng nhiều càng tốt" | Tần suất cao (daily) nhưng view tụt đều | Spread views posts 30 ngày gần nhất |
| 5 | "Ngành mình không sexy" | Dùng quá nhiều jargon, từ chuyên môn, không có hook đại chúng | Xem 10 caption gần nhất: có từ nào dân thường không hiểu? |
| 6 | "Hashtag cứu mình" | Dùng 20+ hashtag/post, nhét hashtag vào caption | Count hashtag density |
| 7 | "Viral là hên xui" | Không có hệ thống phân tích, reuse concept cũ mà không biết vì sao cũ lại viral | Hỏi creator: "Video top của bạn thành công vì cái gì?" — nếu họ không trả lời cụ thể được, myth 7 |

## Workflow

1. **Quét 20 post gần nhất** — ghi views, likes, comment, share
2. **Tính ratio likes/views:**
   - YouTube: Gold ≥ 1%; dưới = có dấu hiệu paid boost
   - TikTok: Gold ≥ 5–10%; dưới = không organic
3. **Xác định creator đang Gold/Silver/Bronze** — so view cao nhất vs trung vị
4. **Check từng myth** — ghi ✓/✗ + evidence
5. **Xuất report** theo format bên dưới

## Output format

```markdown
# MYTH AUDIT — [Tên creator/brand]
**Platform:** ...
**Sample size:** 20 post gần nhất
**Organic score:** Likes/views = X% → ORGANIC / PAID-HEAVY / MIXED

## Myth mắc phải
- ✗ Myth 3 — Đang đăng cross-post cả 5 platform, TikTok engagement 8% nhưng FB chỉ 0.2%
- ✗ Myth 4 — Post 3 lần/ngày, view giảm đều từ 50K → 5K trong 30 ngày
- ✗ Myth 7 — Không có pattern rõ giữa các post viral; copy concept đối thủ không biết lý do

## Ưu tiên fix
1. [Critical] Gộp effort về 1 platform mạnh nhất — TikTok
2. [High] Giảm tần suất còn 3–4 post/tuần, chất lượng cao
3. [High] Bắt đầu GSB sheet để hiểu driver
```

## Red flags không được bỏ qua
- Post viết "Please like & subscribe" → vi phạm Rule 5 (Autocratic)
- Hook 3s toàn dạng "Hi my name is X today I'll talk about Y" → mất kèo ngay
- Content toàn jargon ngành → vi phạm generalist principle
