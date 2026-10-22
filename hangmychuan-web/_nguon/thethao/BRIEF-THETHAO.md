# Brief: thêm sản phẩm từ bảng giá Thế Thảo Pharma vào hangmychuan.vn

Nguồn: `bang-gia-nhom-2.pdf` (30 trang). Ảnh từng trang đã xuất sẵn:
- `trang\pNN.jpg` (150 dpi – đọc nhanh), `trang300\pNN.jpg` (300 dpi – dùng để cắt ảnh dự phòng).
Mỗi ô sản phẩm có: ảnh bao bì, tên, quy cách, mô tả ngắn, **Giá niêm yết**, Giá bán sỉ (KHÔNG dùng giá sỉ).

Danh sách sản phẩm đang có trên web: `san-pham-dang-co.txt` (id | hãng | tên | nhóm).
Brief viết nội dung (bắt buộc đọc, áp dụng y nguyên quy tắc nội dung): `..\noidung\BRIEF.md`.

## Việc cho MỖI sản phẩm trong các trang được giao
1. **Chép đúng** từ PDF: hãng, tên, quy cách (hộp/lọ bao nhiêu viên/ml), giá niêm yết (số nguyên VND).
2. **Loại hàng Việt Nam**: thương hiệu Việt hoặc sản xuất tại Việt Nam (vd Cocoon, LiveSpo, Inocare…) → ghi `"loai": "hang-viet"` và dừng, không làm tiếp. Hàng Úc, Nhật, Hàn, Đức, Pháp, Anh, Mỹ, Canada, Ý… đều giữ.
3. **Kiểm tra trùng**: nếu đúng sản phẩm đó (cùng hãng, cùng loại, cùng quy cách) đã có trong `san-pham-dang-co.txt` → ghi `"trung_voi": "<id>"` và dừng. Khác quy cách (vd 120 viên vs 200 viên) thì KHÔNG tính trùng.
4. **Chia nhóm** (`group/sub`), chọn đúng một:
   - `vitamin-tpcn/`: `vitamin-tong-hop`, `vitamin-khoang` (C, D, E, B, kẽm, sắt, magie, canxi đơn thuần…), `tim` (tim mạch, omega-3, CoQ10, cholesterol, nattokinase), `nao` (não, giấc ngủ, ginkgo, melatonin, căng thẳng), `mat`, `co-xuong-khop` (canxi+D3/K2 người lớn, glucosamine, khớp), `tieu-hoa` (men vi sinh người lớn), `gan` (gan, giải rượu, thanh lọc), `than`, `giam-can` (cân nặng, đường huyết), `phu-nu` (nội tiết nữ, tiền mãn kinh, men phụ khoa, hoa anh thảo), `nam-gioi` (sinh lý nam, tuyến tiền liệt, tinh chất hàu).
   - `me-be/`: `me-bau` (bà bầu, cho con bú, sau sinh), `vitamin-be` (vitamin, DHA, canxi, D3K2, men vi sinh, siro cho trẻ), `cham-soc-be`, `suc-khoe-be`.
   - `lam-dep/`: `collagen` (collagen, biotin, uống đẹp da tóc móng), `cham-soc-da` (kem, serum, chống nắng, dán mụn, son dưỡng, giấy thấm dầu), `tam-goi` (dầu gội, gội khô, dung dịch vệ sinh phụ nữ), `rang-mieng`, `khu-mui`.
   - `suc-khoe/`: `giam-dau`, `di-ung`, `da-day`, `xoa-bop`, `mat-mui` (nước muối, xịt mũi họng).
   - `thuc-pham-tieu-dung/`: `thuc-pham`, `sua-dinh-duong`, `gia-dung`.
5. **Giá đối thủ**: tìm giá bán lẻ hiện tại (sau khuyến mãi) của đúng sản phẩm, đúng quy cách tại các hệ thống nhà thuốc lớn: Long Châu (nhathuoclongchau.com.vn), Pharmacity, An Khang (nhathuocankhang.com), Trung Sơn, Guardian, Medicare. Ghi tối đa 3 kết quả có giá rõ ràng, kèm URL thật đã mở. `"tang_qua": true` nếu CÓ ít nhất 1 nơi bán **thấp hơn** giá niêm yết; `false` nếu tất cả bằng/cao hơn; `null` nếu không tìm được nơi nào.
6. **Ảnh**: tìm ảnh bao bì nền trắng, chụp thẳng, đúng mẫu, cạnh ngắn ≥ 400 px (trang hãng, Long Châu, Pharmacity, iHerb, Amazon…). Tải về `anh-raw\<id>.<đuôi>` bằng Python/curl rồi MỞ XEM bằng Read để chắc đúng mẫu và nền trắng. Nếu không có ảnh đạt: cắt ảnh bao bì từ `trang300\pNN.jpg` bằng Python (Pillow), lưu `anh-raw\<id>.png`, ghi `"anh_nguon": "pdf"`.
7. **Nội dung**: viết `noi_dau`, `cong_dung`, `thanh_phan_chinh`, `lieu_dung`, `luu_y`, `nguon`, `do_tin_cay`, `ghi_chu` đúng như `..\noidung\BRIEF.md` (tra nhãn thật; không nhắc tên nguồn trong câu cho khách; TPCN dùng "hỗ trợ"; không "chữa/điều trị").

## Định dạng đầu ra (mảng JSON UTF-8)
```json
{
  "id": "tt-blackmores-omega-double-90",     // tt-<hãng>-<tên ngắn>-<quy cách>, chữ thường không dấu, gạch nối
  "trang_pdf": 3,
  "loai": "moi | hang-viet",
  "trung_voi": null,
  "brand": "Blackmores",
  "xuat_xu": "Úc",
  "name": "Blackmores Omega Double High Strength Fish Oil – dầu cá omega-3 hàm lượng cao, lọ 90 viên",
  "group": "vitamin-tpcn", "sub": "tim",
  "gia_niem_yet": 649963,
  "gia_doi_thu": [{"nha_thuoc": "Long Châu", "gia": 590000, "url": "https://..."}],
  "tang_qua": true,
  "anh": "anh-raw/tt-blackmores-omega-double-90.jpg", "anh_nguon": "web | pdf",
  "noi_dau": [], "cong_dung": [], "thanh_phan_chinh": "", "lieu_dung": "", "luu_y": [],
  "nguon": [], "do_tin_cay": "cao | trung binh | thap", "ghi_chu": ""
}
```
Tên `name` theo kiểu web đang dùng: "Hãng + tên gốc – mô tả tiếng Việt ngắn, quy cách". Không emoji.
