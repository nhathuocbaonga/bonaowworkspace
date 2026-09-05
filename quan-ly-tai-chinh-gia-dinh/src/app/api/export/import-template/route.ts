export async function GET() {
  const headers = [
    "Ngày",
    "Loại giao dịch",
    "Số tiền",
    "Danh mục",
    "Thành viên",
    "Chi cho ai",
    "Tài khoản",
    "Chiếc lọ",
    "Nội dung",
    "Ghi chú",
  ];
  const example1 = [
    "15/07/2026",
    "Chi",
    "150000",
    "Đi chợ / Siêu thị / Thực phẩm",
    "Nguyễn Thị Lan",
    "Cả gia đình",
    "Tiền mặt",
    "Chi tiêu thiết yếu",
    "Đi chợ cuối tuần",
    "",
  ];
  const example2 = [
    "05/07/2026",
    "Thu",
    "20000000",
    "Lương",
    "Nguyễn Văn Minh",
    "",
    "Vietcombank - Vợ",
    "",
    "Lương tháng 7",
    "",
  ];

  const lines = [headers, example1, example2]
    .map((row) => row.map((v) => `"${String(v).replace(/"/g, '""')}"`).join(","))
    .join("\r\n");
  const csv = "﻿" + lines;

  return new Response(csv, {
    headers: {
      "Content-Type": "text/csv; charset=utf-8",
      "Content-Disposition": 'attachment; filename="mau-nhap-giao-dich.csv"',
    },
  });
}
