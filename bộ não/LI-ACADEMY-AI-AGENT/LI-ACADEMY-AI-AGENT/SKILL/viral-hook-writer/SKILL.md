---
name: viral-hook-writer
description: Viết 5-10 phương án Hook Point (3 giây đầu) cho 1 video — có promise of story, potential energy, và EOV rõ ràng. Use when user says "viết hook", "câu mở đầu video", "intro 3 giây", "Hook Point", "mở bài video như thế nào".
---

# Viral Hook Writer

Viết **Hook Point** — câu/cảnh mở đầu bắt sự chú ý trong 3 giây đầu. Dựa trên sách *Hook Point* của Brendan Kane và phần Hook trong *The Guide to Going Viral*.

## Định nghĩa Hook Point
Một concept dùng để **grab attention nhanh nhất có thể** → khiến người xem dừng scroll và cho video 1 cơ hội.

## Input từ user
- Ý tưởng video (từ `viral-ideation-engine`)
- Format đang dùng
- Niche / target audience
- Gold reference video (nếu có — để học style hook của creator top)

## 6 yêu cầu của 1 Hook Point mạnh

1. **Promise of story** — ngụ ý sẽ có 1 câu chuyện, không phải info dump
2. **Potential energy** — khung hình/lời gợi "sắp có gì đó" sắp xảy ra
3. **Curiosity gap** — tạo khoảng trống thông tin phải coi tiếp mới lấp được
4. **Specific, not vague** — con số cụ thể, tên cụ thể
5. **Mass appeal** — không jargon ngành
6. **Under 3 giây** — nếu nói, dưới 12 từ

## 8 mẫu Hook hiệu quả (templates)

| # | Template | Ví dụ |
|---|---|---|
| 1 | **Số gây sốc** | "Saving 15 hours/week = 30 extra days/year" |
| 2 | **Question trái với common sense** | "Tại sao người kiếm $80k làm 15 phút/tuần?" |
| 3 | **Tuyên bố nghịch lý** | "The biggest song of 2023 was meant to fail" |
| 4 | **Tiết lộ insider** | "Not many people know this but [insider fact]…" |
| 5 | **Hidden cost reveal** | "Consumers might be overpaying for [luxury brand] by 3x" |
| 6 | **Visual shock** | Cảnh mở: tay cầm búa + đĩa sứ (chưa đập) |
| 7 | **Template $ vs $** | "$1 Pizza vs $1,000,000 Pizza" |
| 8 | **Deep cut setup** | "Have you heard this viral song? The creators also made…" |

## 3 loại potential energy (open với 1 trong 3)

1. **Verbal tension:** "You'd think X, but actually…"
2. **Visual cliffhanger:** show khung hình "sắp xảy ra" nhưng cắt ngay (Mark Rober đứng bên hồ Jello chuẩn bị nhảy)
3. **Curiosity prop:** tay cầm vật thể lạ, viewer không biết sẽ dùng làm gì

## Workflow

### 1. Xác định EOV mong muốn
Viewer phải cảm thấy gì trong 3s? → chọn 1:
- Intrigue (tò mò)
- Shock (sốc)
- Relate (đồng cảm)
- Promise of insider knowledge (cảm giác được biết bí mật)
- Suspense (hồi hộp)

### 2. Sinh 10 phương án hook, mỗi cái áp 1 template khác

### 3. Chấm mỗi hook theo 6 yêu cầu (1 điểm/tiêu chí, tối đa 6)

### 4. Chọn top 3 → refine tiếp

## Output format

```markdown
# HOOK POINT — [Video idea]
**Format:** ...
**EOV target:** ...

## Top 3 Hook Points

### Option A (score 6/6)
**Verbal:** "Saving 15 hours a week = 30 extra days of life a year"
**Visual:** Cầm đồng hồ, nhìn camera, shot mặt close-up
**Tại sao mạnh:**
- ✓ Promise of story (sẽ tiết lộ cách)
- ✓ Potential energy (con số dẫn dắt)
- ✓ Curiosity gap (làm thế nào?)
- ✓ Specific (15h, 30 ngày)
- ✓ Mass appeal (ai cũng muốn tiết kiệm thời gian)
- ✓ Under 3s

### Option B (score 5/6)
[tương tự]

### Option C (score 5/6)
[tương tự]

## Recommendation
Chọn Option A vì [lý do].
Title-card đi kèm: "[text gợi ý]"
```

## Mẹo quan trọng
- **Không bắt đầu bằng:** "Hi, my name is X, today we'll talk about…" → giết view ngay
- **Thumbnail + Title + Hook 3s = 1 unit** — phải nhất quán gây curiosity
- **Test bằng "mother test":** mẹ/bà bạn thấy hook này có muốn coi tiếp không?
- **Refine là key** — MrBeast dành hàng giờ cho 1 mini-preview

## Anti-patterns
- ❌ "Follow me for more tips on..."
- ❌ "Welcome back to my channel!"
- ❌ "In this video you'll learn..."
- ❌ Hook dài 8+ giây mới có punch line
