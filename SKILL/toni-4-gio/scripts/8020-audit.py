#!/usr/bin/env python3
"""
8020-audit.py — Áp Pareto 80/20 lên 1 list task của boss Thịnh.

Input: JSON file hoặc stdin với schema:
[
  {"task": "Soạn báo cáo tuần 2dm.vn", "hours": 4, "value_to_q_goal": 80, "deadline_hard": false},
  ...
]

Output: bảng quyết định Keep / Cut / Defer / Automate / Outsource / Batch
        + tổng giờ trước/sau audit
        + top 3 việc high-leverage
        + top 5 việc cắt thẳng

Usage:
  python 8020-audit.py tasks.json
  cat tasks.json | python 8020-audit.py
"""

import json
import sys
from typing import List, Dict

if sys.stdout.encoding and sys.stdout.encoding.lower() != "utf-8":
    sys.stdout.reconfigure(encoding="utf-8")


def classify(task: Dict) -> Dict:
    """Áp Eliminate Ladder lên 1 task. Trả về quyết định + lý do."""
    value = task.get("value_to_q_goal", 0)
    hours = task.get("hours", 0)
    hard_deadline = task.get("deadline_hard", False)
    automatable = task.get("automatable", False)
    outsourceable = task.get("outsourceable", False)
    repeatable = task.get("repeatable", False)

    # Cửa 1: ELIMINATE — value < 10% và không phục vụ mục tiêu nào
    if value < 10:
        return {
            **task,
            "decision": "CUT",
            "reason": f"Giá trị → mục tiêu Q chỉ {value}%. Hậu quả tệ nhất recover được nhanh. Cắt.",
            "new_hours": 0,
        }

    # Cửa 2: DEFER — không có deadline cứng, value 10-30%
    # NHƯNG nếu task vừa automatable VỪA repeatable → automate ngay tốt hơn defer
    # (defer chỉ trì hoãn pain; automate giải quyết tận gốc)
    if not hard_deadline and value < 30 and not (automatable and repeatable):
        return {
            **task,
            "decision": "DEFER",
            "reason": f"Không deadline cứng, giá trị thấp ({value}%). Hoãn ≥ 1 tháng, review lại sau.",
            "new_hours": 0,  # tuần này
        }

    # Cửa 3: AUTOMATE — có thể automate
    if automatable:
        return {
            **task,
            "decision": "AUTOMATE",
            "reason": f"Có thể setup tool/AI một lần, chạy mãi. Tiết kiệm ~{hours}h/tuần lặp lại.",
            "new_hours": 0.5,  # setup ban đầu chia trung bình
        }

    # Cửa 4: OUTSOURCE — có thể giao
    if outsourceable:
        return {
            **task,
            "decision": "OUTSOURCE",
            "reason": "Không cần boss làm tay — viết SOP, giao VA/em làm.",
            "new_hours": 0.5,  # boss chỉ review
        }

    # Cửa 5: BATCH — repeatable
    if repeatable:
        return {
            **task,
            "decision": "BATCH",
            "reason": "Lặp lại nhiều lần/tuần — gộp vào 1 slot duy nhất, giảm context switch.",
            "new_hours": hours * 0.7,  # giảm 30% nhờ batch
        }

    # Cuối: DO — Parkinson deadline ngắn
    return {
        **task,
        "decision": "DO",
        "reason": "Phải tự làm. Áp Parkinson — compress thời gian xuống 50%.",
        "new_hours": hours * 0.5,
    }


def report(tasks: List[Dict]) -> str:
    """Tạo báo cáo Markdown."""
    classified = [classify(t) for t in tasks]
    total_before = sum(t["hours"] for t in tasks)
    total_after = sum(t["new_hours"] for t in classified)
    cut_count = sum(1 for t in classified if t["decision"] == "CUT")
    auto_count = sum(1 for t in classified if t["decision"] == "AUTOMATE")
    out_count = sum(1 for t in classified if t["decision"] == "OUTSOURCE")

    # Sort by value desc cho high-leverage
    high_leverage = sorted(
        [t for t in classified if t["decision"] in ("DO", "BATCH")],
        key=lambda t: t.get("value_to_q_goal", 0),
        reverse=True,
    )[:3]

    # Sort cut by hours desc (cắt cái mất nhiều giờ nhất trước)
    to_cut = sorted(
        [t for t in classified if t["decision"] in ("CUT", "DEFER")],
        key=lambda t: t.get("hours", 0),
        reverse=True,
    )[:5]

    out = []
    out.append("# Audit 80/20 — Boss Thịnh\n")
    out.append("## Tổng quan\n")
    out.append(f"- Tổng giờ kế hoạch: **{total_before:.1f}h**")
    out.append(f"- Sau audit: **{total_after:.1f}h** (cắt {total_before - total_after:.1f}h = -{(1 - total_after/total_before)*100:.0f}%)" if total_before else "- (no input)")
    out.append(f"- Cắt thẳng: {cut_count} task")
    out.append(f"- Automate: {auto_count} task")
    out.append(f"- Outsource: {out_count} task\n")

    out.append("## Bảng quyết định\n")
    out.append("| Task | Giờ | %Value | Quyết định | Giờ mới | Lý do |")
    out.append("|------|-----|--------|------------|---------|-------|")
    for t in classified:
        out.append(
            f"| {t['task']} | {t['hours']}h | {t.get('value_to_q_goal', '?')}% | "
            f"**{t['decision']}** | {t['new_hours']:.1f}h | {t['reason']} |"
        )

    out.append("\n## Top 3 High-Leverage (20% tạo 80% giá trị)\n")
    for i, t in enumerate(high_leverage, 1):
        out.append(f"{i}. **{t['task']}** ({t['hours']}h, {t.get('value_to_q_goal', '?')}% giá trị)")

    out.append("\n## Top 5 Cắt thẳng (chi phí cơ hội cao)\n")
    for i, t in enumerate(to_cut, 1):
        out.append(f"{i}. **{t['task']}** ({t['hours']}h) — {t['reason']}")

    out.append("\n## Comfort Challenge tuần này\n")
    out.append("Em đề xuất 1 thử thách dựa trên audit:\n")
    if cut_count >= 3:
        out.append("→ Tuần này boss **gửi 3 email từ chối** cho các task em đã đánh CUT — luyện cơ \"nói không\".")
    elif out_count >= 2:
        out.append("→ Tuần này boss **viết 1 SOP 1 trang** cho task em đánh OUTSOURCE đầu tiên — buông control.")
    else:
        out.append("→ Tuần này boss **đặt deadline ngắn 50% cho 1 task DO** — kiểm chứng Parkinson's Law.")

    return "\n".join(out)


def main():
    if len(sys.argv) > 1:
        with open(sys.argv[1], "r", encoding="utf-8") as f:
            tasks = json.load(f)
    else:
        tasks = json.load(sys.stdin)

    print(report(tasks))


if __name__ == "__main__":
    main()
