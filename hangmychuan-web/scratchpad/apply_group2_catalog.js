const fs = require("fs");
const path = require("path");
const vm = require("vm");

const root = path.resolve(__dirname, "..");
function load(file, key) {
  const sandbox = { window: {} };
  vm.runInNewContext(fs.readFileSync(file, "utf8"), sandbox, { filename: file });
  return sandbox.window[key];
}
function slugify(value) {
  return value.normalize("NFD").replace(/[\u0300-\u036f]/g, "").toLowerCase()
    .replace(/đ/g, "d").replace(/[^a-z0-9]+/g, "-").replace(/^-|-$/g, "");
}

const productFile = path.join(root, "data", "products.js");
const stockFile = path.join(root, "data", "stock.js");
const products = load(productFile, "HMC_PRODUCTS");
const stock = load(stockFile, "HMC_STOCK");
const catalog = JSON.parse(fs.readFileSync(path.join(root, "_nguon", "hang-nhom-2-catalog.json"), "utf8"));
const ids = new Set([...stock, ...products].map((p) => p.id));
const slugs = new Set([...stock, ...products].map((p) => p.slug || p.id));
const exact = new Set([...stock, ...products].map((p) => `${slugify(p.brand || "")}::${slugify(p.name)}`));
let added = 0;

for (const item of catalog) {
  const key = `${slugify(item.brand)}::${slugify(item.name)}`;
  if (ids.has(item.id) || exact.has(key)) continue;
  let slug = `g2-${slugify(`${item.brand}-${item.name}`)}`;
  let n = 2;
  while (slugs.has(slug)) slug = `g2-${slugify(`${item.brand}-${item.name}`)}-${n++}`;
  products.push({
    id: item.id, slug, name: item.name, brand: item.brand, price: item.price,
    group: item.group, sub: item.sub, img: item.img, gift: !!item.gift,
  });
  ids.add(item.id); slugs.add(slug); exact.add(key); added += 1;
}

const multi = stock.find((p) => p.id === "multinutri-orange");
if (!multi) throw new Error("Không tìm thấy multinutri-orange trong data/stock.js");
multi.price = 49900;
fs.writeFileSync(productFile, `window.HMC_PRODUCTS = ${JSON.stringify(products)};\n`, "utf8");
fs.writeFileSync(stockFile, `window.HMC_STOCK = ${JSON.stringify(stock)};\n`, "utf8");
console.log(`Đã thêm ${added} sản phẩm; tổng order ${products.length}; Multinutri = 49.900đ.`);
