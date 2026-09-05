---
name: viral-gsb-analyzer
description: Phân tích Gold/Silver/Bronze một creator hoặc một format để rút ra 3-5 performance driver đã validate. Tạo Google Sheet template + report markdown. Use when user says "phân tích creator X", "GSB sheet", "rút driver", "tại sao video này viral", "so sánh video hit vs flop".
---

# Viral GSB Analyzer

Áp dụng phương pháp **Gold / Silver / Bronze** (GSB) của Brendan Kane để rút performance driver từ 1 creator hoặc 1 format.

## Định nghĩa tier

| Tier | Định nghĩa | Ghi chú |
|---|---|---|
| **Gold** | Video đột phá, view cao hơn hẳn mức thường của creator đó | Không tính theo view tuyệt đối; tính RELATIVE trong format |
| **Silver** | View ở mức **mode** (xuất hiện nhiều nhất) — baseline | Dùng mode thay vì mean để tránh skew |
| **Bronze** | View dưới median — underperform so với chính creator đó | "Disappointing" từ góc creator |

**Ví dụ:** Creator avg 100-300K views, thỉnh thoảng 600K-1M (Gold), có video 10-15K (Bronze).

## Input từ user
- 1 creator handle + platform, HOẶC
- 1 format tên + 2-4 creator cùng dùng format đó

## Workflow 7 bước

### 1. Xác định baseline
- Xem 30 video gần nhất
- Tính mode view = Silver range
- Xác định Gold cutoff (thường ≥ 2x Silver)
- Xác định Bronze cutoff (thường ≤ 0.3x Silver)

### 2. Chọn sample
- **5 Gold** (top performer)
- **5 Bronze** (under performer, không phải video hỏng kỹ thuật)
- Nếu có điều kiện: thêm 3-5 Silver để so sánh

### 3. Xem kỹ từng video — ghi vào sheet

**Cột bắt buộc:**
| Tier | Video link | Title | Summary | Page | Views | Followers | Notes | Key findings |

**Checklist quan sát mỗi video:**
- Common elements (symbol, character, props lặp lại)
- Storytelling structure (problem-solution? before-after?)
- Pacing (fast suốt? có khoảng chậm?)
- Tonality (drama/humor/warm/cold)
- Environment (indoor/outdoor/studio)
- **Opening 3s** (cái gì grab attention)
- Lighting (consistent? varied?)
- Cadence speech (steady? varied?)
- Camera technique (cut, angle, focus)

### 4. Hypothesize drivers từ Gold

Liệt kê 5-10 pattern xuất hiện thường xuyên trong Gold.

### 5. Test hypothesis với Bronze

| Pattern | Có trong Gold? | Có trong Bronze? | Verdict |
|---|---|---|---|
| Hook 3s = câu hỏi mở | 5/5 | 1/5 | ✅ **DRIVER** |
| Dùng trending music | 5/5 | 5/5 | ❌ Không phải driver |
| Close-up trong 2s đầu | 4/5 | 1/5 | ✅ **DRIVER** |

- **Có ở cả 2 → KHÔNG phải driver**
- **Chỉ ở Gold → DRIVER tích cực**
- **Chỉ ở Bronze → yếu tố gây hại (anti-driver)**

### 6. Rút 3-5 driver cốt lõi

Giới hạn 3-5 driver quan trọng nhất (Hook Point có > 1000 driver trong thư viện, nhưng mỗi format chỉ nên focus 3-5).

### 7. TÁCH TACTIC khỏi EOV

**CỰC QUAN TRỌNG** — đây là chỗ 99% creator fail. Cho mỗi driver, phân biệt:

| Tactic | EOV (Effect on Viewer) |
|---|---|
| Text overlay màu vàng 3s đầu | Intrigue, promise of insider info |
| Cut nhanh 6 shot trong 5s | Tăng urgency, cảm giác "gấp rút" |
| Close-up vào tay đang cầm đồ vật | Potential energy — "chuẩn bị có gì đó" |

→ Khi tái tạo, tập trung vào **tái tạo EOV**, không copy tactic. Nhiều tactic khác nhau có thể tạo cùng 1 EOV.

## Output format

```markdown
# GSB ANALYSIS — [Creator / Format name]
**Platform:** ...
**Sample:** 5 Gold + 5 Bronze
**Baseline (Silver):** X–Y views
**Gold cutoff:** ≥ Z views

## Video samples
[Table 10 dòng với đầy đủ metadata]

## Hypothesis testing
[Table pattern vs Gold/Bronze vs Verdict]

## 3-5 Performance Drivers đã validate

### Driver 1: [Tên driver]
- **Tactic cụ thể:** ...
- **EOV:** ...
- **Ví dụ Gold:** [link] — dùng driver này ở giây thứ Y
- **Counter-example Bronze:** [link] — KHÔNG dùng driver này

### Driver 2–5 tương tự

## Anti-drivers (tránh)
- ...

## Action items cho user
1. Khi làm content format này, ƯU TIÊN 3 driver trên
2. Tập trung vào EOV, không copy tactic
3. Khi A/B test, chỉ thay 1 driver 1 lần
```

## Mẹo quan trọng
- **Không giới hạn analysis trong Gold** — phải có Bronze để contrast, nếu chỉ xem Gold sẽ phóng đại tầm quan trọng một số yếu tố
- **Accept outliers** — 1 Gold video thiếu driver A nhưng vẫn viral = driver khác đang bù; đừng vì 1 outlier mà vứt hypothesis
- **Format-specific baseline** — 1M view có thể là Gold ở format niche, là Silver ở format pop music — luôn so trong CÙNG format

## Template Google Sheet
Có template sẵn tại: `http://guide.hookpoint.com/` (Brendan Kane cung cấp miễn phí)
