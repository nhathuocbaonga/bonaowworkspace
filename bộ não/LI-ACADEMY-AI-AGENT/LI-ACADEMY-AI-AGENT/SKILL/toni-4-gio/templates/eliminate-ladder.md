# Eliminate Ladder — 5 cửa cho mỗi task

> Tim Ferriss: trước khi làm bất cứ task nào, hỏi 5 câu hỏi theo thứ tự. Task chỉ được tự làm nếu lọt qua TẤT CẢ 5 cửa.

```
┌──────────────────────────────────────┐
│ Task được giao                       │
└──────────────────────────────────────┘
              ↓
       Cửa 1: ELIMINATE
       "Có thể KHÔNG làm được không?"
       ├─ Yes → Drop task. STOP.
       └─ No → tiếp
              ↓
       Cửa 2: DEFER
       "Có thể hoãn 1 tuần / 1 tháng / vô hạn?"
       ├─ Yes → Lên lịch defer. STOP.
       └─ No → tiếp
              ↓
       Cửa 3: AUTOMATE
       "Có thể tool / template / AI thay người?"
       ├─ Yes → Setup automation. STOP.
       └─ No → tiếp
              ↓
       Cửa 4: OUTSOURCE
       "Có thể VA / freelancer / em làm?"
       ├─ Yes → Viết SOP + delegate. STOP.
       └─ No → tiếp
              ↓
       Cửa 5: BATCH
       "Có thể gom với task tương tự, làm 1 cử/tuần?"
       ├─ Yes → Schedule batch slot. sếp làm trong batch.
       └─ No → tiếp
              ↓
       sếp TỰ LÀM
       Áp Parkinson's Law: đặt deadline ngắn nhân tạo
```

## Câu hỏi chi tiết từng cửa

### Cửa 1 — ELIMINATE

**Câu hỏi chính**: "Nếu em KHÔNG làm task này — hậu quả tệ nhất là gì? Có recover được không?"

Sub-questions:
- Task này phục vụ mục tiêu Q nào? (Nếu không phục vụ mục tiêu nào → drop)
- Ai yêu cầu task này? Họ có thực sự cần kết quả, hay chỉ habit?
- Nếu drop task → 3 tháng sau có ai nhắc đến không?
- Task này từng được làm trước đây và có ai dùng kết quả không?

**Drop nếu**:
- Không phục vụ mục tiêu Q nào
- Hậu quả tệ nhất recover được trong < 1 tuần
- 3 tháng sau không ai nhớ
- Kết quả task trước đó không ai dùng

---

### Cửa 2 — DEFER

**Câu hỏi chính**: "Task này phải làm hôm nay, hay có thể hoãn?"

Sub-questions:
- Có deadline cứng không (legal / hợp đồng)? Hay deadline tự đặt?
- Hoãn 1 tuần — có ai thiệt hại không?
- Hoãn 1 tháng — có ai thiệt hại không?
- Hoãn vô hạn — task có tự "biến mất" không (nhu cầu thay đổi)?

**Defer nếu**:
- Không có deadline cứng
- Hoãn 1 tháng không ai thiệt hại
- Nhu cầu có thể thay đổi → đợi clarity

→ Lên lịch reminder defer. Khi đến hạn, chạy lại Eliminate Ladder.

---

### Cửa 3 — AUTOMATE

**Câu hỏi chính**: "Task này có patternable không? Có thể setup 1 lần, chạy mãi không?"

Sub-questions:
- Task này lặp lại bao nhiêu lần/tuần?
- Có input → output rule rõ ràng không?
- Có tool / API / AI agent làm được không?

**Automation tools 2026**:
- **Email auto-responder**: Gmail filters + canned responses + AI draft (Gemini Smart Compose)
- **Schedule social post**: Buffer, Hootsuite, hoặc tự build n8n workflow
- **Format/transcribe**: ChatGPT, Claude, Otter.ai
- **Phản hồi câu hỏi thường gặp**: Build chatbot Claude Sonnet 4.6 (theo CLAUDE.md)
- **Data entry**: Make.com, Zapier, n8n
- **Research**: Perplexity, Claude với web search
- **Calendar booking**: Calendly + autoresponder
- **Invoice / báo cáo**: Google Sheets + Apps Script + cron

**Automate nếu**:
- Task lặp ≥ 3 lần/tuần
- Có rule rõ ràng (if X then Y)
- Setup time < ROI 30 ngày

---

### Cửa 4 — OUTSOURCE

**Câu hỏi chính**: "Có ai làm được task này thay sếp, với chất lượng đủ tốt?"

Sub-questions:
- Skill cần thiết: cao cấp (writing có giọng riêng, quyết định chiến lược) hay thấp cấp (research, format, schedule)?
- Có thể viết SOP 1-2 trang không?
- VA / freelancer / nhân viên / em vợ — ai phù hợp?

**Outsource options 2026**:
- **VA Việt Nam**: trên 6 USD/giờ, dùng cho việc tiếng Việt, contact local
- **VA Philippines**: 5-10 USD/giờ, dùng cho tiếng Anh
- **Upwork / Fiverr**: cho task 1 lần (logo, video edit, copywriting EN)
- **Em vợ / người thân**: việc admin, booking, chăm sóc 1-1
- **Em (Claude)**: việc soạn email, research, draft content, audit, code

**Outsource nếu**:
- Task không cần "sếp touch" cá nhân
- Có thể viết SOP 1 trang
- ROI > giờ setup + cost giám sát
- sếp SẴN SÀNG buông control

⚠️ **Sai lầm phổ biến**: outsource trước khi có SOP. sếp phải viết SOP trước (em có thể giúp viết SOP), sau đó mới delegate. Không SOP = micromanage = mất thời gian hơn tự làm.

---

### Cửa 5 — BATCH

**Câu hỏi chính**: "Task này còn lại sếp phải tự làm — có thể GỘP với task tương tự không?"

Sub-questions:
- Có task khác cùng loại trong tuần (cùng workflow, cùng tool)?
- Có thể gộp tất cả vào 1 slot duy nhất/tuần?

**Batching gợi ý**:
- **Email khó cần sếp reply** → gộp vào 1 slot Thứ Sáu chiều, 2 giờ
- **Họp 1-1 quan trọng** → gộp vào Thứ Hai/Thứ Tư, mỗi ngày 1 slot 9-11h
- **Soạn nội dung** → gộp vào Thứ Ba sáng, 3 giờ — viết 4-5 post FB/tuần trong 1 cử
- **Review báo cáo** → Thứ Sáu chiều, 1 giờ — review hết báo cáo tuần
- **Quyết định lớn cần suy nghĩ kỹ** → Chủ nhật sáng, 90 phút — đưa ra 3-5 quyết định lớn nhất tuần sau

**Lợi ích batching**:
- Giảm context-switching cost (mỗi switch tốn 23 phút phục hồi)
- Tăng deep work
- Cho phép set "Do Not Disturb" rõ ràng

---

## Sau khi lọt 5 cửa — Áp Parkinson's Law

Task còn lại sếp phải tự làm → **đặt deadline ngắn nhân tạo**:

| Task ước tính | Deadline thực | Deadline nhân tạo (Parkinson) |
|---------------|---------------|-------------------------------|
| 8 giờ | 1 tuần | 1 ngày |
| 2 giờ | 1 ngày | 1 giờ |
| 30 phút | 4 giờ | 15 phút |

→ sếp sẽ ngạc nhiên về việc 80% task vẫn xong với 50% thời gian.

## Em sẽ apply ladder này như thế nào

Khi sếp đưa 1 task / 1 list todo:

1. **Em chạy ladder cho từng task** trong context
2. **Output bảng**:

```markdown
| Task | Cửa 1 | Cửa 2 | Cửa 3 | Cửa 4 | Cửa 5 | Verdict | Action |
|------|-------|-------|-------|-------|-------|---------|--------|
| Soạn báo cáo tuần | Không | Không | ✓ Apps Script | — | — | AUTOMATE | Em setup script T2 |
| Họp với agency | Không | ✓ Defer 1 tháng | — | — | — | DEFER | Reschedule T6/12 |
| Trả lời học viên FB | Không | Không | Không | ✓ VA | — | OUTSOURCE | Viết SOP + thuê |
| Soạn 3 bài FB Q4 | Không | Không | Không | Không | ✓ Batch | BATCH | Slot T3 sáng |
| Quyết định brand LI ACADEMY | Không | Không | Không | Không | Không | DO | T4 sáng, 2h |
```

3. **Em ưu tiên hỏi sếp về 2 dòng đầu** (cắt + automate) — vì impact lớn nhất, ROI cao nhất, có thể chạy ngay trong session.

---

*Nguồn: Tim Ferriss, "The 4-Hour Workweek" — Step E (Elimination). Reference: `references/02-step-e-elimination.md`.*
