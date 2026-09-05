# Kết nối GitHub — đồng bộ 2 máy

Repo này đã được tạo sẵn (branch main). Rác build và file .env đã bị loại khỏi git.

## LẦN ĐẦU (trên máy hiện tại) — đưa lên GitHub
1. Vào https://github.com/new tạo repo MỚI:
   - Tên: bo-nao-workspace (tuỳ ý)
   - Chọn **Private** (RIÊNG TƯ) — bắt buộc, vì có dữ liệu khách.
   - KHÔNG tick "Add a README".
2. Mở terminal ngay tại thư mục "bộ não", chạy 3 lệnh (thay <TEN-TAI-KHOAN> và <TEN-REPO>):
   git remote add origin https://github.com/<TEN-TAI-KHOAN>/<TEN-REPO>.git
   git push -u origin main
   → Lần đầu push, cửa sổ đăng nhập GitHub sẽ hiện ra — chị đăng nhập bằng tài khoản của mình.

## TRÊN MÁY MỚI — lấy về làm tiếp
1. Cài: Git (git-scm.com) + Claude Desktop.
2. Chạy:  git clone https://github.com/<TEN-TAI-KHOAN>/<TEN-REPO>.git
3. Mở thư mục vừa clone bằng Claude Desktop → làm tiếp.
   - Dự án nào có node_modules (vd quan-ly-tai-chinh-gia-dinh): chạy `npm install` để cài lại.

## HẰNG NGÀY — giữ 2 máy giống nhau
- Trước khi làm:   git pull
- Sau khi làm xong: git add -A && git commit -m "cap nhat" && git push

## LƯU Ý
- Bộ 768 agent + 380 skill nằm ở C:\Users\<user>\.claude (KHÔNG nằm trong repo này).
  Muốn máy mới có ngay bộ đó thì cần đồng bộ riêng thư mục .claude.
- Thư mục agent-cskh-zalo là repo riêng (đã loại khỏi repo này) — đẩy riêng nếu cần.
- File .env (chứa khoá) KHÔNG được đưa lên GitHub. Sang máy mới thì tạo lại .env thủ công.
