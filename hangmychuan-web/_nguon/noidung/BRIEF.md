# Brief: nội dung trang chi tiết sản phẩm – Hàng Mỹ Chuẩn (hangmychuan.vn)

Shop bán hàng nhập Mỹ/Canada cho gia đình Việt (khách chủ yếu nữ 30–50, mua cho cả nhà). Giọng: chân thật, tận tâm, gần gũi như người chị tư vấn; không giật gân, không hứa quá. KHÔNG emoji.

## Nhiệm vụ cho MỖI sản phẩm trong file input
1. **Xác định đúng mẫu**: mở ảnh `anh_cua_hang` (ảnh chị chủ shop chụp sản phẩm thật, đọc bằng Read) và/hoặc `anh_web` để biết đúng hãng, hàm lượng, số viên, bản Canada hay Mỹ. Nếu `ten_tren_web` sai so với ảnh thật thì ghi tên đúng vào `ten_chuan` và giải thích trong `ghi_chu`.
2. **Tra nhãn thật trên mạng** (WebSearch/WebFetch): ưu tiên trang chính hãng (webbernaturals.com, jamiesonvitamins.com, naturesbounty.com, costco.ca/costco.com, kirkland, sportsresearch.com, youtheory.com, olly.com, bauschhealth, trunature…), sau đó iHerb, Walmart, Amazon, Shoppers Drug Mart, Well.ca. Lấy **liều dùng đúng như nhãn của đúng mẫu đó** (ví dụ "2 viên kẹo/ngày", "1 viên/ngày uống cùng bữa ăn"). Bản Canada và bản Mỹ có thể khác liều – theo đúng bản trong ảnh.
3. Viết nội dung tiếng Việt theo cấu trúc JSON bên dưới.

## Quy tắc nội dung (bắt buộc)
- `noi_dau`: đúng 3 câu, mỗi câu ≤ 18 chữ, là nỗi lo/khó khăn thật của người cần sản phẩm này, viết đồng cảm, không chê bai ngoại hình, không doạ bệnh. Ví dụ kẹo giấm táo: "Ăn uống điều độ mà cân nặng vẫn nhích lên từng chút".
- `cong_dung`: 3–5 câu, mỗi câu ≤ 20 chữ, dựa trên công bố trên nhãn/website hãng. Với thực phẩm chức năng dùng từ "hỗ trợ", "góp phần", "bổ sung"; KHÔNG viết "chữa", "điều trị", "trị dứt", "khỏi bệnh", "giảm cân nhanh", không đưa con số % hiệu quả hay số kg.
- `lieu_dung`: 1–2 câu, đúng nhãn của mẫu đó (dịch sang tiếng Việt), ghi rõ thời điểm nếu nhãn có (cùng bữa ăn, trước khi ngủ…). Nếu không chắc chắn 100% thì ghi theo nhãn tìm được và đặt `do_tin_cay` = "trung binh".
- `luu_y`: 1–3 câu ngắn từ cảnh báo trên nhãn (phụ nữ có thai/cho con bú, trẻ em, người đang dùng thuốc chống đông…). Không bịa.
- `thanh_phan_chinh`: 1 câu ngắn, hàm lượng hoạt chất chính theo nhãn (ví dụ "Giấm táo 500 mg/viên kẹo"). Bỏ trống nếu không tìm được.
- Thuốc không kê đơn / dầu xoa / miếng dán / nhỏ mắt (nhóm `suc-khoe/...`): `cong_dung` = chỉ định trên nhãn; `lieu_dung` = đúng nhãn; `luu_y` phải có cảnh báo quan trọng nhất của nhãn.
- Mỹ phẩm, dầu gội, sữa tắm: `lieu_dung` = cách dùng.
- Thời trang (thắt lưng, ví LV): `noi_dau` = 3 băn khoăn khi chọn phụ kiện da cao cấp; `cong_dung` = 3–5 điểm nổi bật của thiết kế; `lieu_dung` = cách dùng và bảo quản; `luu_y` có thể bỏ trống. Không khẳng định nơi sản xuất nếu không thấy trên ảnh.
- Sữa dinh dưỡng, thực phẩm: `lieu_dung` = cách dùng theo nhãn.
- Không bịa nguồn. `nguon` là 1–3 URL thật bạn đã đọc.

## Định dạng đầu ra
Ghi một file JSON (UTF-8) là một mảng, mỗi phần tử:
```json
{
  "id": "goli-acv",
  "ten_chuan": "Goli Apple Cider Vinegar Gummies – 60 viên",
  "noi_dau": ["...", "...", "..."],
  "cong_dung": ["...", "...", "..."],
  "thanh_phan_chinh": "...",
  "lieu_dung": "...",
  "luu_y": ["..."],
  "nguon": ["https://..."],
  "do_tin_cay": "cao | trung binh | thap",
  "ghi_chu": "chỉ ghi khi tên trên web sai mẫu, hoặc không tìm được thông tin"
}
```
Giữ nguyên `id`. Làm đủ mọi sản phẩm trong file input; món nào không tra được thì vẫn viết `noi_dau`/`cong_dung` thận trọng và đặt `do_tin_cay` = "thap".
