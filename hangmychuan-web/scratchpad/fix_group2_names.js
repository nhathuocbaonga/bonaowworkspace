const fs = require("fs");
const vm = require("vm");
const file = "data/products.js";
const sandbox = { window: {} };
vm.runInNewContext(fs.readFileSync(file, "utf8"), sandbox);
const fixes = {
  "g2-p10-l-01": "Daily Intimate Wash Fem Cam – chai 250ml",
  "g2-p10-l-02": "Intimate Skin Care Daily Wash Fem Cam Bé – chai 150ml",
  "g2-p10-l-03": "Active Wash Fem Xanh – chai 250ml",
  "g2-p10-r-04": "Soothing Wash Fem Hồng – chai 250ml",
  "g2-p10-r-05": "0% Sensitive Intimate Wash Fem Xám – chai 250ml",
  "g2-p18-r-03": "Kem cừu Lanolin Cream màu vàng – lọ 100ml",
  "g2-p18-r-04": "Fish Oil 1000mg Careline – hộp 100 viên",
};
let changed = 0;
for (const product of sandbox.window.HMC_PRODUCTS) {
  if (fixes[product.id] && product.name !== fixes[product.id]) {
    product.name = fixes[product.id]; changed += 1;
  }
  if (product.id.startsWith("g2-") && !product.img.includes("?v=2")) {
    product.img += "?v=2"; changed += 1;
  }
  if (product.id.startsWith("g2-") && !product.img.includes("?v=2")) {
    product.img += "?v=2"; changed += 1;
  }
}
fs.writeFileSync(file, `window.HMC_PRODUCTS = ${JSON.stringify(sandbox.window.HMC_PRODUCTS)};\n`, "utf8");
console.log(`Đã chuẩn hóa ${changed} trường dữ liệu sản phẩm theo catalogue.`);
