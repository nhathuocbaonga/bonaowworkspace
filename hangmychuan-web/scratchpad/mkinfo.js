const fs = require("fs");
const path = require("path");
const vm = require("vm");

const root = path.resolve(__dirname, "..");
const sourceDir = path.join(root, "_nguon", "noidung");

function loadWindowData(file, key) {
  const sandbox = { window: {} };
  vm.runInNewContext(fs.readFileSync(file, "utf8"), sandbox, { filename: file });
  if (!Array.isArray(sandbox.window[key])) {
    throw new Error(`${path.basename(file)} không khai báo window.${key} dạng mảng`);
  }
  return sandbox.window[key];
}

const expectedProducts = [
  ...loadWindowData(path.join(root, "data", "stock.js"), "HMC_STOCK"),
  ...loadWindowData(path.join(root, "data", "products.js"), "HMC_PRODUCTS"),
];
const expectedIds = new Set(expectedProducts.map((product) => product.id));

const records = [];
for (let batch = 1; batch <= 8; batch += 1) {
  const file = path.join(sourceDir, `output-${batch}.json`);
  const items = JSON.parse(fs.readFileSync(file, "utf8"));
  if (!Array.isArray(items)) throw new Error(`${path.basename(file)} không phải mảng JSON`);
  records.push(...items);
}

const info = {};
for (const record of records) {
  if (!record.id) throw new Error("Có bản ghi thiếu id");
  if (info[record.id]) throw new Error(`Trùng id nội dung: ${record.id}`);
  if (!expectedIds.has(record.id)) throw new Error(`Nội dung không có sản phẩm tương ứng: ${record.id}`);
  if (!Array.isArray(record.noi_dau) || record.noi_dau.length !== 3) {
    throw new Error(`${record.id}: noi_dau phải có đúng 3 câu`);
  }
  if (!Array.isArray(record.cong_dung) || record.cong_dung.length < 3 || record.cong_dung.length > 5) {
    throw new Error(`${record.id}: cong_dung phải có 3–5 câu`);
  }
  if (!record.lieu_dung) throw new Error(`${record.id}: thiếu lieu_dung`);

  info[record.id] = {
    noi_dau: record.noi_dau,
    cong_dung: record.cong_dung,
    ...(record.thanh_phan_chinh ? { thanh_phan_chinh: record.thanh_phan_chinh } : {}),
    lieu_dung: record.lieu_dung,
    luu_y: Array.isArray(record.luu_y) ? record.luu_y : [],
  };
}

const missing = [...expectedIds].filter((id) => !info[id]);
if (missing.length) throw new Error(`Thiếu ${missing.length} sản phẩm: ${missing.join(", ")}`);
if (Object.keys(info).length !== expectedIds.size) {
  throw new Error(`Sai tổng số: nội dung ${Object.keys(info).length}, danh mục ${expectedIds.size}`);
}

const output = `window.HMC_INFO = ${JSON.stringify(info)};\n`;
fs.writeFileSync(path.join(root, "data", "info.js"), output, "utf8");
console.log(`Đã tạo data/info.js cho ${Object.keys(info).length} sản phẩm.`);
