---
name: viral-post-mortem
description: Khám nghiệm tử thi 1 video đã đăng — so với Gold reference, xác định hit/miss, tách lỗi ideation vs script vs execution, đề xuất iteration tiếp theo. Use when user says "video này flop", "vì sao không viral", "post-mortem", "phân tích video vừa đăng", "sao không ai xem".
---

# Viral Post-Mortem

Khám nghiệm 1 video đã đăng sau 48-72h để rút insight cho iteration tiếp theo. Áp dụng Step 5-6 trong Viral Content Model của Brendan Kane.

## Input từ user
- Link video vừa đăng
- Metrics: views, likes, comments, shares, avg watch time, retention graph (nếu có)
- GSB reference đã dùng (từ `viral-gsb-analyzer`)
- Hypothesis/driver đã apply khi làm video

## Workflow 3 tầng

### TẦNG 1: Video có match Gold reference không?

Xem lại Gold video tham chiếu + video của user, compare theo checklist:

| Kiểm | Match Gold? | Ghi chú |
|---|---|---|
| Hook 3s có Promise of story | | |
| Potential energy ở opening | | |
| Tension/curiosity gap | | |
| Active metaphor (nếu Visual Metaphor format) | | |
| Contrast rõ (nếu Two Characters format) | | |
| Deep cut reveal (nếu Untold Stories format) | | |
| Pacing nhanh, không lag | | |
| CTA xuất hiện sau value, không mở đầu | | |
| Communication Algorithm: F+D+U có? | | |
| Không Values-based / Autocratic | | |

### TẦNG 2: Phân loại lỗi

Dựa trên kết quả tầng 1 và performance, map vào 1 trong 4 case:

#### Case A: Match Gold + viral ✅
- **Verdict:** Working as expected
- **Action:** Lặp lại format + driver. Increase posting frequency của format này.

#### Case B: Match Gold nhưng không viral ⚠️
- **Verdict:** Hypothesis về driver có thể sai
- **Action:** Quay lại research. Bronze/Silver check lại. Chọn driver mới hoặc format mới.

#### Case C: Không match Gold + không viral (lỗi execution)
- **Verdict:** Idea OK nhưng thi công thiếu sót
- **Action:** Xác định chỗ nào miss (hook/pacing/CTA) → redo video hoặc dùng idea tương tự với execution tốt hơn.

#### Case D: Không match Gold nhưng viral (may mắn hoặc driver khác)
- **Verdict:** Có driver bạn chưa nhận ra
- **Action:** GSB analyze chính video bạn vs 5 Bronze khác để tìm driver ẩn.

### TẦNG 3: Chẩn đoán cụ thể từng layer

#### Layer 1: Ideation (idea có tiềm năng không?)
- Có Hook Point rõ không?
- Mass appeal hay quá niche?
- Có Gold reference tương tự thành công?

#### Layer 2: Script/Storytelling
- Opening 3s mạnh?
- Tension build-up?
- Communication Algorithm 5 Rules?
- Linear communication? (1 msg/time)
- CTA sau value?

#### Layer 3: Execution (production)
- Pacing: có đoạn lag không?
- Visual hierarchy: chỗ nào viewer nên nhìn?
- Audio: clear? music supporting not overpowering?
- Branding integration: logo có làm giảm view không?

## Retention graph reading (nếu có)

| Pattern | Diagnosis |
|---|---|
| Drop 50%+ trong 3s đầu | Hook weak → fix Hook Point |
| Drop đều đặn xuyên video | Pacing chán, không có tension build-up |
| Drop mạnh giữa video | Đoạn đó lặp lại, jargon, hoặc mất contrast |
| Drop trước CTA | CTA đến quá sớm, trước khi đủ value |
| Spike replay ở 1 đoạn | Đoạn đó là key moment → khai thác cho video sau |

## Output format

```markdown
# POST-MORTEM — [Video title]
**Posted:** YYYY-MM-DD
**Platform:** ...
**Metrics (sau 48h):**
- Views: X
- Likes/views: Y%
- Comments: Z
- Shares: W
- Avg watch time: N%

**Expected (Silver baseline):** ...
**Verdict:** GOLD / SILVER / BRONZE

## Tầng 1: Match Gold reference
[Checklist filled]
**Match score:** X/10

## Tầng 2: Case classification
**Case:** A / B / C / D
**Lý do:** ...

## Tầng 3: Layer diagnosis

### Ideation
- ✅ Hook Point rõ
- ⚠️ Mass appeal: mid-level, hơi niche
- **Fix:** ...

### Script
- ✅ Tension build-up OK
- ❌ CTA "Subscribe now" → Autocratic, cần rewrite
- **Fix:** dùng Democratic: "Bạn muốn xem thêm?"

### Execution
- ✅ Pacing
- ❌ Text overlay đè voiceover 2 lần — vi phạm Linear Communication
- **Fix:** simplify layer

## Retention graph reading (nếu có)
[Diagnosis từ graph]

## Action items cho iteration tiếp theo
1. [Critical] Fix Hook Point trong video tiếp (dùng `viral-hook-writer`)
2. [High] Rewrite CTA (dùng `viral-cta-rewriter`)
3. [Medium] Test driver mới nếu case B
4. [Low] Cleanup visual clutter

## Key learning (ghi vào learning log)
- Hypothesis validate? CÓ / KHÔNG / CẦN THÊM DATA
- Nuance mới phát hiện: ...
- Cần research thêm về: ...
```

## Mindset (Brendan Kane)

- **"Each video is a hypothesis test"** — không phải content đơn thuần
- **Compare ruthlessly** — so với Gold, không tự an ủi "video mình cũng okay"
- **Don't give up on format after 1 flop** — cần ít nhất 3-5 video test trước khi bỏ format
- **Document everything** — mỗi vòng post-mortem viết lại thành learning log

## Red flags cần xử lý ngay

- 💀 Retention < 30% → video flop nặng, không lặp idea này
- 💀 Likes/views < 0.5% → có thể bị bóp/shadowban, check lại community guideline
- 💀 0 shares → content không tạo "worth sharing" cho viewer
- ⚠️ Comments toàn "interesting" / "cool" → content không evoke thảo luận → cần tension thật hơn

## Cross-skill references
- Nếu lỗi hook → chạy `viral-hook-writer`
- Nếu lỗi script tổng → `viral-script-doctor`
- Nếu lỗi CTA → `viral-cta-rewriter`
- Nếu lỗi hiểu driver → `viral-gsb-analyzer` + `viral-eov-mapper`
- Nếu lỗi idea → `viral-ideation-engine`
