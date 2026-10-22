const fs = require("fs");
const path = require("path");
const vm = require("vm");

const root = path.resolve(__dirname, "..");

function loadWindowData(file, key) {
  const context = { window: {} };
  vm.runInNewContext(fs.readFileSync(file, "utf8"), context);
  return context.window[key];
}

const stockFile = path.join(root, "data", "stock.js");
const stock = loadWindowData(stockFile, "HMC_STOCK");
const product = {
  id: "multinutri-orange",
  name: "Viên sủi Multinutri Orange bổ sung Vitamin C, B1, B5, B6, PP – hộp 20 viên",
  brand: "Nhất Tín Tâm",
  price: 0,
  group: "vitamin-tpcn",
  sub: "vitamin-khoang"
};
const stockIndex = stock.findIndex((item) => item.id === product.id);
if (stockIndex >= 0) stock[stockIndex] = product;
else stock.push(product);
fs.writeFileSync(stockFile, "window.HMC_STOCK = " + JSON.stringify(stock) + ";\n", "utf8");

const infoFile = path.join(root, "data", "info.js");
const info = loadWindowData(infoFile, "HMC_INFO");
info[product.id] = {
  noi_dau: [
    "Bữa ăn ít rau quả, chị lo cả nhà không nhận đủ vitamin mỗi ngày.",
    "Trẻ nhỏ hoặc người lớn ngại nuốt viên nén, mua vitamin về rồi lại để quên.",
    "Thời tiết thay đổi, cơ thể dễ mệt và chị muốn bổ sung vitamin theo cách dễ uống hơn."
  ],
  cong_dung: [
    "Bổ sung vitamin C, vitamin B1, vitamin B5, vitamin B6 và vitamin PP.",
    "Vitamin C góp phần hỗ trợ hoạt động bình thường của hệ miễn dịch.",
    "Dạng viên sủi vị cam, pha thành đồ uống dễ dùng cho trẻ từ 4 tuổi và người lớn.",
    "Hộp 20 viên, mỗi viên có khối lượng 4 g."
  ],
  thanh_phan_chinh: "Mỗi viên 4 g: Vitamin C 150 mg, Vitamin B5 7 mg, Vitamin B1 1 mg, Vitamin B6 1,2 mg và Vitamin PP 1,2 mg.",
  lieu_dung: "Pha 1 viên với 200–250 ml nước đun sôi để nguội, đợi viên tan hết rồi uống sau ăn. Trẻ từ 4 tuổi dùng 2–3 viên/ngày; trẻ trên 12 tuổi và người lớn dùng 2–5 viên/ngày.",
  luu_y: [
    "Không dùng cho người mẫn cảm với bất kỳ thành phần nào của sản phẩm; không sử dụng quá liều khuyến cáo.",
    "Sản phẩm không có đường. Bảo quản nơi khô mát, nhiệt độ dưới 30°C, tránh ánh nắng trực tiếp."
  ]
};
fs.writeFileSync(infoFile, "window.HMC_INFO = " + JSON.stringify(info) + ";\n", "utf8");

console.log(JSON.stringify({ stock: stock.length, info: Object.keys(info).length, id: product.id }));
