---
name: viral-ideation-engine
description: Sinh 20-100 ý tưởng video dựa trên 1 format đã validate, chấm 1-5 theo tiêu chí Brendan Kane, chọn idea mạnh nhất. Use when user says "brainstorm ideas", "sinh ý tưởng content", "chọn video tiếp theo làm gì", "100 ý tưởng cho format X".
---

# Viral Ideation Engine

Áp dụng nguyên tắc **100:1** — sinh 100 ý tưởng để chọn ra 1 cái mạnh nhất. Dựa trên Ideation Sheet của Brendan Kane.

## Input từ user
- Format đã chọn (từ `viral-format-hunter`) + driver đã validate (từ `viral-gsb-analyzer`)
- Niche / ngành / chủ đề gốc
- Brand identity (optional)

## Workflow

### 1. Template hoá Gold references
Lấy video Gold của format → thay topic-specific word bằng placeholder:
- MrBeast "$1 vs $10,000,000 Yacht" → `$1 vs $10,000,000 "X"`
- "How to Make Homemade Plant Food with Just 2 Ingredients" → `How to Make "X" with Just "Y"`
- "Your City Is Full of Fake Buildings" → `Your "X" Is Full of "Y"`

### 2. Điền X/Y bằng niche
Ví dụ niche tài chính:
- `$1 tiết kiệm vs $10,000,000 tiết kiệm`
- `How to Save 30% Thuế TNCN with Just 1 Động tác`
- `Ví của bạn đang đầy [X] bạn không biết`

### 3. Sinh bulk 20-100 idea

**Kỹ thuật sinh:**
- **Mother/grandparent test:** "Mẹ tôi/ông tôi có xem không?" → nếu không, loại
- **Neo vào topic hot:** Google Trends, Google News, TV shows, celebs, music hit — bắt sóng
- **Tránh jargon:** "LTV", "CAC", "ROAS" → dịch thành ngôn ngữ đại chúng
- **Strip-and-replace:** lấy Gold reference → thay chủ thể → kiểm tra có còn hấp dẫn không

### 4. Chấm điểm 1-5 (ruthlessly)

| Điểm | Tiêu chí |
|---|---|
| **1** (top) | Rich detail + có Gold reference mạnh + dễ visualize + clear narrative |
| **2** | Có potential, cần tweak nhỏ |
| **3** | Có ý tưởng nhưng thiếu hook hoặc narrative |
| **4** | Chung chung, cần rework đáng kể |
| **5** (loại) | Vague, generic, không có Hook Point |

**Ví dụ chuẩn Brendan Kane:**
- ❌ "Outfits for travel" = 5
- 🟡 "Outfits to wear on a 5-hour plane ride" = 3
- ✅ "Outfits inspired by The Little Mermaid" = 1

### 5. Ưu tiên top 1s

Focus vào idea đã chấm = 1 + có Gold reference mạnh. KHÔNG làm idea 3-5.

### 6. Workshop top pick

- Brainstorm 5 variation của idea top
- Thử đổi angle, đổi chủ thể phụ
- Mở rộng reference pool

## Ideation Sheet template

| # | Idea (1-2 câu) | Hook Point | Reference link | Notes | Rating 1-5 |
|---|---|---|---|---|---|
| 1 | ... | ... | ... | ... | ... |

## Output format

```markdown
# IDEATION — [Ngành + Format]
**Format:** ...
**Driver áp dụng:** [từ GSB analyzer]
**Target audience (mass appeal):** ...

## 20-100 ideas
[Full table]

## TOP 5 picks (rating = 1)
### Pick 1: [Title]
- **Hook Point:** ...
- **Gold reference:** [link]
- **EOV target:** [cảm xúc nhắm tới]
- **Visualization:** [mô tả 3 shot đầu]
- **Branding touch:** [làm sao lồng brand tự nhiên]

### Pick 2–5 tương tự

## Recommended next
Làm Pick 1 trước vì:
- Reference Gold có 7M+ views
- Barrier to entry thấp (chỉ cần iPhone + 1 prop)
- Gắn tự nhiên với expertise user
```

## Mindset quan trọng

- **"Welcome the chaos":** đừng kiểm duyệt sớm, ghi cả idea "điên"
- **Reach-for-the-stars:** idea có vẻ quá tham vọng → vẫn ghi, sau scale down được
- **"The more the merrier":** cứ ghi hết, loại sau
- **Triangle, not Set Play:** đừng cố chấp với idea đầu tiên; xem xét nhiều góc trước khi commit
- **Say no to mediocre:** nếu idea cảm thấy "tàm tạm" → đừng sản xuất, refine thêm

## Anti-pattern cần tránh
- **Team yes-men:** nếu làm team, bắt buộc có người phản biện
- **Personal taste:** "tôi thích cái này" — loại, chỉ follow data
- **Industry jargon trong hook:** chết ngay giây đầu
- **Copy concept đối thủ mà không hiểu EOV:** copycat syndrome
