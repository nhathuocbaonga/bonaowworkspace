#!/usr/bin/env python3
"""
dreamline-generator.py — Convert dreamline input của boss thành báo cáo TMI.

Tim Ferriss: thay vì goal "kiếm X tỷ", quy đổi DREAMLINE thành Target Monthly Income (TMI)
cần để duy trì lối sống đó. TMI = chi phí tháng + (chi phí 1 lần / số tháng dreamline).

Input: JSON
{
  "timeframe": 6,  // 6 hoặc 12
  "items": [
    {"type": "HAVING", "item": "Macbook M4 16inch", "one_time_vnd": 80000000, "monthly_vnd": 0, "action_24h": "Search 3 dealer ở SG"},
    {"type": "DOING", "item": "Đi Nhật 14 ngày tháng 4/2027", "one_time_vnd": 80000000, "monthly_vnd": 0, "action_24h": "Search visa requirement"},
    {"type": "BEING", "item": "100 học viên Mầm Non Tài Chính tốt nghiệp", "one_time_vnd": 0, "monthly_vnd": 5000000, "action_24h": "List 10 ứng viên đầu tiên"}
  ]
}

Output: báo cáo Markdown — TMI, gap analysis, muse business gợi ý.

Usage:
  python dreamline-generator.py dreamline.json
"""

import json
import sys

if sys.stdout.encoding and sys.stdout.encoding.lower() != "utf-8":
    sys.stdout.reconfigure(encoding="utf-8")


def vnd(n):
    return f"{n:,.0f}đ".replace(",", ".")


def report(data: dict) -> str:
    timeframe = data["timeframe"]
    items = data["items"]

    total_one_time = sum(i.get("one_time_vnd", 0) for i in items)
    total_monthly = sum(i.get("monthly_vnd", 0) for i in items)

    tmi = total_monthly + (total_one_time / timeframe)

    by_type = {"HAVING": [], "BEING": [], "DOING": []}
    for i in items:
        by_type.setdefault(i["type"], []).append(i)

    out = []
    out.append(f"# Dreamline {timeframe} tháng — Boss Thịnh\n")
    out.append(f"Deadline: **+{timeframe} tháng từ hôm nay**\n")

    for typ in ["HAVING", "BEING", "DOING"]:
        if not by_type.get(typ):
            continue
        labels = {
            "HAVING": "HAVING — Thứ boss muốn CÓ",
            "BEING": "BEING — Người boss muốn TRỞ THÀNH",
            "DOING": "DOING — Việc boss muốn LÀM",
        }
        out.append(f"## {labels[typ]}\n")
        out.append("| Item | Chi phí 1 lần | Chi phí tháng | Action 24h |")
        out.append("|------|---------------|---------------|------------|")
        for i in by_type[typ]:
            out.append(
                f"| {i['item']} | {vnd(i.get('one_time_vnd', 0))} | "
                f"{vnd(i.get('monthly_vnd', 0))} | {i.get('action_24h', '⚠️ chưa có')} |"
            )
        out.append("")

    out.append("## 💰 Target Monthly Income (TMI)\n")
    out.append(f"- Tổng chi phí 1 lần: **{vnd(total_one_time)}**")
    out.append(f"- Tổng chi phí tháng: **{vnd(total_monthly)}**")
    out.append(f"- **TMI = {vnd(total_monthly)} + ({vnd(total_one_time)} / {timeframe} tháng)**")
    out.append(f"- **TMI = {vnd(tmi)}/tháng**\n")
    out.append("→ Boss cần thu nhập tháng ≥ TMI để duy trì dreamline này.\n")

    out.append("## 🚀 Muse business gợi ý\n")
    out.append(
        "Theo Tim Ferriss, muse = sản phẩm passive thu nhập đủ TMI, KHÔNG cần unicorn startup.\n"
    )
    out.append(f"Để đạt {vnd(tmi)}/tháng, em đề xuất 3 đường:\n")
    if tmi <= 30_000_000:
        out.append("- **Mini-course evergreen**: bán 1 khoá ~3-5tr × 6-10 học viên/tháng = đủ TMI")
        out.append("- **Affiliate finance**: đẩy 1-2 sản phẩm fintech, hoa hồng ~200-500K/lead")
        out.append("- **Template library**: bán template Excel/Notion finance, giá thấp, scale tự động")
    elif tmi <= 100_000_000:
        out.append("- **Coaching cohort 2dm**: cohort 30 người × 3-5tr/người mỗi quý")
        out.append("- **Membership Mầm Non Tài Chính**: monthly 300-500K × 200-300 thành viên")
        out.append("- **Online course bán cao cấp**: 10-20tr × 5 học viên/tháng")
    else:
        out.append("- **High-ticket consulting**: 30-100tr/dự án × 1-2 dự án/tháng")
        out.append("- **Đầu tư + chia sẻ**: scale invest portfolio + dạy người khác")
        out.append("- **Book + speaking**: publish + sự kiện 50-100tr/buổi")
    out.append("")

    items_missing_action = [i for i in items if not i.get("action_24h")]
    if items_missing_action:
        out.append("## ⚠️ Item thiếu action 24h\n")
        out.append(
            "Tim Ferriss: nếu 1 item không có action khả thi trong 24h, item đó **vẫn còn ảo**, chưa phải dreamline thật. Boss refine lại:\n"
        )
        for i in items_missing_action:
            out.append(f"- **{i['item']}** — em đề xuất 3 action 24h khả thi:")
            out.append("  1. (Em sẽ generate dựa context khi boss confirm)")
            out.append("  2. ...")
            out.append("  3. ...")

    return "\n".join(out)


def main():
    if len(sys.argv) < 2:
        print("Usage: python dreamline-generator.py dreamline.json", file=sys.stderr)
        sys.exit(1)
    with open(sys.argv[1], "r", encoding="utf-8") as f:
        data = json.load(f)
    print(report(data))


if __name__ == "__main__":
    main()
