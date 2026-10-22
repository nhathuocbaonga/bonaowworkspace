from pathlib import Path
import json

ROOT = Path(__file__).resolve().parents[1]
CATALOG = json.loads((ROOT / "_nguon" / "hang-nhom-2-catalog.json").read_text(encoding="utf-8"))
OUT = ROOT / "_nguon" / "noidung" / "output-9.json"

PAIN = {
    "lam-dep": ["Muốn chăm sóc cá nhân đều đặn nhưng ngại quy trình quá nhiều bước.", "Cần sản phẩm chính hãng, thông tin rõ ràng và dễ lựa chọn.", "Muốn duy trì vẻ ngoài chỉn chu bằng một sản phẩm phù hợp nhu cầu."],
    "me-be": ["Mẹ muốn chọn sản phẩm phù hợp từng giai đoạn nhưng thông tin trên thị trường dễ gây rối.", "Ưu tiên sản phẩm có nguồn gốc rõ ràng và hướng dẫn sử dụng cụ thể.", "Cần kiểm tra kỹ thành phần, độ tuổi và liều dùng trước khi sử dụng."],
    "suc-khoe": ["Muốn chủ động chăm sóc sức khỏe gia đình bằng sản phẩm tiện dùng.", "Cần lựa chọn đúng công dụng và đúng đối tượng sử dụng.", "Ưu tiên sản phẩm có thông tin minh bạch, dễ kiểm tra khi nhận hàng."],
    "vitamin-tpcn": ["Khẩu phần hằng ngày đôi khi chưa đáp ứng đúng nhu cầu dinh dưỡng cá nhân.", "Muốn bổ sung thuận tiện nhưng cần tránh dùng trùng thành phần.", "Cần sản phẩm rõ nguồn gốc và hướng dẫn phù hợp với từng người."],
}

records = []
for item in CATALOG:
    group = item["group"]
    is_beauty = group == "lam-dep"
    is_device = item["sub"] == "rang-mieng"
    benefits = [
        f"Sản phẩm {item['name']} của {item['brand']}.",
        "Phù hợp để tham khảo theo đúng nhu cầu và đối tượng sử dụng ghi trên nhãn.",
        "Quy cách và hình ảnh được đối chiếu trực tiếp từ catalogue nhà cung cấp.",
        "Hàng order; shop xác nhận phiên bản, hạn dùng và thời gian về hàng trước khi chốt đơn.",
    ]
    if is_device:
        directions = "Sử dụng đúng theo hướng dẫn kèm theo thiết bị; vệ sinh và bảo quản sau mỗi lần dùng."
    elif is_beauty:
        directions = "Sử dụng theo hướng dẫn trên bao bì. Nên thử trên vùng nhỏ trước khi dùng rộng, đặc biệt với da nhạy cảm."
    else:
        directions = "Dùng theo hướng dẫn trên nhãn sản phẩm. Nhắn Zalo để shop gửi ảnh nhãn và tư vấn theo độ tuổi, nhu cầu và sản phẩm đang dùng."
    warning = [
        "Đọc kỹ nhãn, thành phần và hướng dẫn trước khi sử dụng; ngừng dùng nếu có dấu hiệu không phù hợp.",
        "Phụ nữ mang thai, đang cho con bú, người đang điều trị bệnh hoặc dùng thuốc nên hỏi chuyên gia y tế trước khi dùng.",
    ]
    if not is_beauty and not is_device:
        warning.append("Thực phẩm bảo vệ sức khỏe không phải là thuốc và không có tác dụng thay thế thuốc chữa bệnh.")
    records.append({
        "id": item["id"],
        "noi_dau": PAIN.get(group, PAIN["vitamin-tpcn"]),
        "cong_dung": benefits[:5],
        "thanh_phan_chinh": "Vui lòng xem thành phần và hàm lượng chi tiết trên nhãn sản phẩm theo lô; shop gửi ảnh nhãn trước khi chốt đơn.",
        "lieu_dung": directions,
        "luu_y": warning,
    })

OUT.write_text(json.dumps(records, ensure_ascii=False, indent=2) + "\n", encoding="utf-8")
print(f"Đã tạo nội dung an toàn cho {len(records)} sản phẩm.")
