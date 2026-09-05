---
name: phan-biet-khach-tai-chinh
description: Phân biệt khách hàng tài chính ngân hàng vào 1 trong 8 segment chuẩn (Tân binh / Gánh nợ thẻ / Thu nhập không chính quy / Nâng cấp credit / Nợ xấu CIC / SME mới / DN xoay vốn / DN tách bạch). Output card đẹp + insight + content angle. Use when user says "phân biệt khách", "khách này thuộc nhóm nào", "classify khách", "khách hàng tài chính", "đây là segment nào", "xếp khách vào nhóm".
---

# Phân Biệt Khách Hàng Tài Chính

Skill phân loại 1 khách hàng vào 1 trong **8 hồ sơ khách hàng tài chính chuẩn** (vault NAO THINH) → output card đẹp với segment + đau + lợi ích + content angle phù hợp.

## Input từ user

Sếp paste 1 trong các dạng:
- **Câu khách hỏi** (DM, comment FB, tin nhắn Zalo)
- **Mô tả tình huống** ("khách 32 tuổi lương 15tr đang nợ thẻ 80tr")
- **Profile khách** (CV, sao kê, thông tin tự khai)
- **Đoạn hội thoại** (chat với sale/coach)

## 8 Segment chuẩn — bảng nhận diện

| # | Segment | Signal keywords | Tình huống điển hình |
|---|---------|-----------------|---------------------|
| **01** | **Tân binh credit** | "lần đầu", "mới đi làm", "chưa có thẻ", "lương 7-15tr", "sinh viên", "mới ra trường", "có làm được không" | Chưa có thẻ tín dụng nào, đa số 22-30 tuổi |
| **02** | **Gánh nợ thẻ** | "nợ 50-300tr", "trả lãi", "quay vòng", "thẻ A trả thẻ B", "ngộp", "mỗi tháng trả X mà nợ vẫn", "giấu vợ/chồng", "mất ngủ" | Có thẻ rồi, đang khủng hoảng dòng tiền |
| **03** | **Thu nhập không chính quy** | "freelancer", "KOL", "shop online", "Shopee", "TikTok Shop", "không HĐLĐ", "bị từ chối", "bank không hiểu", "thu nhập 30-50tr nhưng từ chối" | Kiếm nhiều nhưng không có giấy tờ chuẩn |
| **04** | **Nâng cấp credit** | "nâng hạn mức", "lên Gold/Platinum/Signature", "combo thẻ", "max cashback", "miles", "Visa Infinite", "đã dùng 1-2 năm tốt" | Đã có thẻ, dùng tốt, muốn upgrade |
| **05** | **Nợ xấu CIC** | "CIC nhóm 3/4/5", "nợ xấu", "đã trả xong rồi mà", "bị từ chối khắp nơi", "5 năm xóa", "rebuild credit", "check CIC", "có còn cơ hội không" | Đã từng quá hạn → CIC kém |
| **06** | **SME mới** | "công ty em mới mở", "DN 1-2 năm", "BCTC năm đầu lỗ", "thẻ DN đầu tiên", "đang dùng thẻ cá nhân chi cho công ty", "chủ shop", "chủ quán" | Vừa lập DN, chưa có thẻ business |
| **07** | **DN xoay vốn** | "xoay vốn", "kỳ miễn lãi 45 ngày", "gối đầu", "3 thẻ DN", "rút tiền mặt phí", "dòng tiền", "tín chấp DN lâu", "doanh thu 10-100 tỷ" | DN ổn định, dùng thẻ làm working capital |
| **08** | **DN tách bạch** | "trộn cá nhân với công ty", "gọi vốn", "IPO", "thanh tra thuế", "BCTC chưa đẹp", "kế toán rối", "DN 3-15 năm" | DN đã ổn, cần chuẩn hoá tài chính |

## Decision tree (nhanh)

```
Là cá nhân hay DN?
│
├─ CÁ NHÂN
│  ├─ Đã có thẻ chưa?
│  │  ├─ CHƯA có thẻ nào → 01 Tân binh credit
│  │  └─ ĐÃ CÓ thẻ → tình trạng ra sao?
│  │     ├─ Đang nợ nặng / quay vòng → 02 Gánh nợ thẻ
│  │     ├─ Đang dùng tốt, muốn upgrade → 04 Nâng cấp credit
│  │     └─ Đã từng quá hạn / CIC kém → 05 Nợ xấu CIC
│  │
│  └─ Có HĐLĐ chuẩn không?
│     └─ KHÔNG có (freelancer/KOL/shop online) → 03 Thu nhập không chính quy
│        (override các nhánh trên nếu khách emphasize "không HĐLĐ")
│
└─ DOANH NGHIỆP
   ├─ Tuổi DN < 3 năm? → 06 SME mới
   ├─ DN ổn định, focus dòng tiền? → 07 DN xoay vốn
   └─ DN ổn định, focus chuẩn hoá/gọi vốn? → 08 DN tách bạch
```

## Output template — CARD ĐẸP

Output ALWAYS theo template này (markdown rendered đẹp trong terminal):

```markdown
# 🎯 KẾT QUẢ PHÂN TÍCH KHÁCH HÀNG

> **Input gốc:** "{trích 1-2 câu user paste}"

---

## 📋 PHÂN LOẠI

| | |
|---|---|
| **Segment chính** | `0X — TÊN SEGMENT` |
| **Confidence** | `XX%` ████████░░ |
| **Secondary (nếu có)** | `0Y — TÊN` (XX%) |
| **Group** | Cá nhân / Doanh nghiệp |
| **Profile detail** | [01-tan-binh-credit.md](E:/NAO THINH/NAO THINH/wiki/queries/ho-so-khach-hang-tai-chinh/0X-...md) |

---

## 🧠 ĐỘNG LỰC GỐC (5 lớp "tại sao")

> {1 câu bắt động lực sâu nhất của segment, lấy từ profile mục 5}

---

## 🔥 TOP 3 ĐAU CỦA KHÁCH

1. **{đau 1}** — {1 dòng giải thích áp dụng vào case này}
2. **{đau 2}** — {giải thích}
3. **{đau 3}** — {giải thích}

## ✨ TOP 3 LỢI ÍCH CẦN NHẤN

1. **{lợi ích 1}**
2. **{lợi ích 2}**
3. **{lợi ích 3}**

---

## 💬 CÂU MỞ CHUYỆN GỢI Ý

> *"{câu chạm đúng đau lớn nhất, dùng ngôn ngữ khách}"*

---

## 🎬 CONTENT ANGLE PHÙ HỢP (top 2)

1. **{angle 1 từ profile mục 7}** — vì sao phù hợp với case này
2. **{angle 2 từ profile mục 7}**

---

## ⚠️ KHÔNG PHẢI SEGMENT (loại trừ)

- ❌ `0X` vì {lý do — bằng chứng từ input gốc}
- ❌ `0Y` vì {lý do}

---

## 📌 NEXT STEP CHO sếp

- [ ] {action 1: vd "DM lại với câu mở chuyện"}
- [ ] {action 2: vd "Gửi case study segment phù hợp"}
- [ ] {action 3: vd "Đề xuất combo coaching nếu fit"}
```

## Heuristic phân tích

### Bước 1 — Quét signal keywords
Đọc input → highlight keywords match với cột "Signal keywords" của bảng. Ưu tiên match đa dấu hiệu.

### Bước 2 — Áp decision tree
Đi từ trên xuống. Khi không chắc 100% → dùng confidence < 80%, nêu Secondary.

### Bước 3 — Cross-check với "Ngôn ngữ khách dùng"
Mỗi profile (file `wiki/queries/ho-so-khach-hang-tai-chinh/0X-*.md`) có mục **"6. Ngôn ngữ khách dùng"** — match với câu khách thật → confidence cao.

### Bước 4 — Loại trừ rõ ràng
Liệt kê 1-2 segment KHÔNG phải kèm bằng chứng → giúp sếp tin output.

### Bước 5 — Lifecycle awareness
Nếu khách đang ở giai đoạn chuyển đổi (vd: tân binh sắp rớt vào gánh nợ), note "Cảnh báo: có nguy cơ chuyển sang segment 0X nếu Y".

## Confidence calibration

| Match | Confidence |
|---|---|
| 4+ signal keywords + ngôn ngữ khách rõ | 90-95% |
| 2-3 signal keywords + tình huống rõ | 70-85% |
| 1 signal + suy đoán | 50-65% |
| Mơ hồ, có thể nhiều segment | < 50% → ASK CLARIFY thay vì đoán |

## Khi confidence < 50%

KHÔNG đoán bừa. Hỏi sếp 1-2 câu cụ thể để phân biệt:
- "Khách này đã có thẻ tín dụng nào chưa?"
- "Khách hỏi vì đang nợ hay vì muốn mở mới?"
- "Khách là cá nhân hay đang làm chủ DN?"

## Examples

### Example 1 — Input rõ ràng

**User input:**
> "Em mới đi làm 8 tháng, lương 9 triệu, công ty trả qua ngân hàng. Em muốn mở thẻ tín dụng đầu tiên có được không anh?"

**Output:**

```markdown
# 🎯 KẾT QUẢ PHÂN TÍCH KHÁCH HÀNG

> **Input gốc:** "Em mới đi làm 8 tháng, lương 9 triệu... muốn mở thẻ đầu tiên"

## 📋 PHÂN LOẠI
| | |
|---|---|
| **Segment chính** | `01 — Tân Binh Credit` |
| **Confidence** | `92%` █████████░ |
| **Secondary** | Không có |
| **Group** | Cá nhân |

## 🧠 ĐỘNG LỰC GỐC
> Cảm giác **TRƯỞNG THÀNH TÀI CHÍNH** + sự độc lập (không phụ thuộc gia đình, không bị bạn bè vượt qua)

## 🔥 TOP 3 ĐAU
1. **Sợ bị từ chối / không đủ điều kiện** — lương 9tr là biên, một số bank yêu cầu 10tr
2. **Bối rối, không biết bắt đầu từ đâu** — không có ai hướng dẫn 1-1
3. **Sợ bước vào "nợ" mà không kiểm soát được**

## ✨ TOP 3 LỢI ÍCH CẦN NHẤN
1. **Được duyệt thẻ với hạn mức hợp lý**
2. **Có người tư vấn rõ ràng từ A đến Z**
3. **Hiểu cách dùng để tận dụng kỳ miễn lãi và cashback**

## 💬 CÂU MỞ CHUYỆN GỢI Ý
> *"Lương 9 triệu, 8 tháng — đủ tiêu chuẩn rồi em, mình lo cách trình bày hồ sơ + chọn đúng ngân hàng để duyệt 1 lần là xong. Em đã tham khảo bank nào chưa?"*

## 🎬 CONTENT ANGLE
1. **"Lương 9 triệu có mở được thẻ không?"** — trả lời thẳng câu khách hỏi
2. **Checklist mở thẻ đầu tiên** — gửi luôn cho khách

## ⚠️ KHÔNG PHẢI SEGMENT
- ❌ `02` Gánh nợ thẻ — khách CHƯA có thẻ nào
- ❌ `03` Thu nhập không chính quy — khách có HĐLĐ + lương qua bank

## 📌 NEXT STEP
- [ ] DM lại bằng câu mở chuyện trên
- [ ] Gửi checklist 5 giấy tờ + danh sách 3 bank dễ duyệt cho người mới
- [ ] Follow-up 7 ngày sau khi nộp
```

### Example 2 — Input lưỡng nghĩa

**User input:**
> "Em đang nợ thẻ Vietcombank 60 triệu, mỗi tháng trả 5tr lãi. Sao kê em chuyển khoản nhiều nguồn vì em làm content creator. Có cách nào không?"

**Output:**

Segment chính = `02 Gánh nợ thẻ` (75%) — pain "đang nợ + trả lãi cao" rõ.
Secondary = `03 Thu nhập không chính quy` (45%) — keyword "content creator + chuyển khoản nhiều nguồn" → ảnh hưởng nếu cần đảo nợ qua tín chấp DN/cá nhân.

→ **Compound case**: ưu tiên giải pain 02 trước (giảm áp lực ngay), song song chuẩn bị hồ sơ 03 cho dài hạn.

### Example 3 — Confidence thấp

**User input:**
> "anh ơi em làm thẻ được không?"

**Output:**
> Confidence < 40%. Cần clarify trước khi phân loại:
> 1. Em đã có thẻ tín dụng nào chưa?
> 2. Em đang đi làm công ty hay tự do (freelancer/shop)?
> 3. Em muốn thẻ để làm gì cụ thể?

## References

- Vault: `E:\NAO THINH\NAO THINH\wiki\queries\ho-so-khach-hang-tai-chinh\` (8 profile chi tiết)
- Concept: `E:\NAO THINH\NAO THINH\wiki\concepts\ho-so-khach-hang-tai-chinh-overview.md` (master index + lifecycle)
- Source: `E:\NAO THINH\NAO THINH\wiki\sources\hskh-8-financial-segments.md`

## Quy tắc cứng (KHÔNG vi phạm)

1. **KHÔNG đoán bừa** khi confidence < 50% → hỏi clarify
2. **KHÔNG dùng từ ngân hàng** trong câu mở chuyện (DTI, hard inquiry, credit utilization) → dùng ngôn ngữ khách lấy từ profile mục 6
3. **LUÔN có mục "Không phải segment"** với bằng chứng → builds trust
4. **LUÔN trỏ link đến profile detail** trong vault để sếp đọc sâu nếu cần
5. **Output bằng tiếng Việt casual** xưng "em" với sếp, output cho khách thì dùng "em/anh/chị" tuỳ ngữ cảnh
