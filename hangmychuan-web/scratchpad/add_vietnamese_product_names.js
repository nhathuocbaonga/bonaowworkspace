const fs = require('fs');
const vm = require('vm');
const path = require('path');

const project = path.resolve(__dirname, '..');
const file = path.join(project, 'data', 'products.js');
const infoFile = path.join(project, 'data', 'info.js');
const context = { window: {} };
vm.createContext(context);
vm.runInContext(fs.readFileSync(file, 'utf8'), context);
vm.runInContext(fs.readFileSync(infoFile, 'utf8'), context);

const names = {
  'g2-p02-l-01': 'Vitamin C Hard Capsule – bổ sung vitamin C – 30 ngày',
  'g2-p02-l-02': 'Biotin Sustained Release – hỗ trợ tóc, da và móng – gói 30 viên',
  'g2-p02-l-03': 'Lip Cream – son dưỡng môi DHC 1,5g',
  'g2-p02-l-04': 'Calcium + CBP – bổ sung canxi, hỗ trợ xương – túi 90 ngày',
  'g2-p02-l-05': 'Zinc – bổ sung kẽm – 30 ngày',
  'g2-p02-r-06': 'Vitamin C Hard Capsule – bổ sung vitamin C – 90 ngày',
  'g2-p02-r-07': 'Adlay Extract – chiết xuất Ý Dĩ hỗ trợ chăm sóc da – 30 ngày',
  'g2-p02-r-08': 'Collagen – hỗ trợ da và độ đàn hồi – 30 ngày',
  'g2-p02-r-09': 'Zinc – bổ sung kẽm – 15 ngày',

  'g2-p03-l-01': 'Omega Double High Strength Fish Oil – dầu cá Omega-3 hàm lượng cao',
  'g2-p03-l-02': 'Bio Magnesium – bổ sung magie – 100 viên',
  'g2-p03-l-03': 'Milk Thistle – kế sữa hỗ trợ chức năng gan',
  'g2-p03-l-04': 'Pregnancy & Breastfeeding Gold – vitamin cho mẹ bầu và cho con bú',
  'g2-p03-l-05': 'Cholesterol Health – hỗ trợ sức khỏe tim mạch',
  'g2-p03-r-06': 'Evening Primrose Oil – dầu hoa anh thảo hỗ trợ sức khỏe nữ giới',
  'g2-p03-r-07': 'CoQ10 150mg – hỗ trợ sức khỏe tim mạch',
  'g2-p03-r-08': 'Bio C 1000mg – bổ sung vitamin C',
  'g2-p03-r-09': 'Multivitamin For Men – vitamin tổng hợp cho nam giới',
  'g2-p03-r-10': 'Ginkgo Forte – bạch quả hỗ trợ tuần hoàn não – 40 viên',

  'g2-p04-l-01': 'Aktiv Magnesium + Calcium + D3 – bổ sung magie, canxi và D3 – 30 viên',
  'g2-p04-l-02': 'A-Z Depot – vitamin và khoáng chất tổng hợp – 30 viên',
  'g2-p04-l-03': 'Ginkgo + B-Vitamins + Choline – hỗ trợ trí nhớ và tuần hoàn não – 30 viên',
  'g2-p04-l-04': 'Aktiv Vitamin E – bổ sung vitamin E – 30 viên',
  'g2-p04-l-05': 'Vitamin D3 + K2 – hỗ trợ xương chắc khỏe – 30 viên',
  'g2-p04-l-06': 'Aktiv Omega-3 Seefischöl 1000 – dầu cá hỗ trợ tim mạch – 80 viên',
  'g2-p04-l-07': 'Joints ULTRA – hỗ trợ xương khớp – 30 viên',
  'g2-p04-l-08': 'Aktiv Optima Kinder – vitamin tổng hợp cho trẻ – chai 100ml',
  'g2-p04-l-09': 'Haemo Vital – bổ sung sắt và dưỡng chất tạo máu – 30 viên',
  'g2-p04-l-10': 'Kinder Immune Syrup – siro hỗ trợ đề kháng cho trẻ – chai 150ml',
  'g2-p04-l-11': 'Prostacalm – hỗ trợ sức khỏe tuyến tiền liệt – 30 viên',
  'g2-p04-l-12': 'Vital Pregna – vitamin và khoáng chất cho mẹ bầu – 30 viên',
  'g2-p04-r-13': 'Aktiv Omega-3 Folic Acid B6+B12 – hỗ trợ tim mạch – 30 viên',
  'g2-p04-r-14': 'Coenzyme Q10 – hỗ trợ sức khỏe tim mạch – 30 viên',
  'g2-p04-r-15': 'Liver Complex – hỗ trợ chức năng gan – 30 viên',
  'g2-p04-r-16': 'Vitamin C 1000 – bổ sung vitamin C – 30 viên',
  'g2-p04-r-17': 'Active Men Plus – vitamin tổng hợp cho nam giới – 30 viên',
  'g2-p04-r-18': 'Eye Vital – bổ sung dưỡng chất cho mắt – 30 viên',
  'g2-p04-r-19': 'Active Breath – hỗ trợ hơi thở thơm mát – 30 viên',
  'g2-p04-r-20': 'Anti Stress – hỗ trợ thư giãn, giảm căng thẳng – 30 viên',
  'g2-p04-r-21': 'Hair Plus – hỗ trợ tóc và móng – 30 viên',
  'g2-p04-r-22': 'Kinder Omega-3 Syrup – siro Omega-3 cho trẻ – chai 250ml',
  'g2-p04-r-23': 'Thymepect – siro cỏ xạ hương hỗ trợ đường hô hấp – chai 100ml',

  'g2-p05-l-01': 'Clausy – men vi sinh dạng ống – hộp 10 ống',
  'g2-p05-l-02': 'Preg-Mom 3 tỷ – men vi sinh cho phụ nữ mang thai và mẹ – hộp 20 ống',
  'g2-p05-l-03': 'Dia 30 – men vi sinh hỗ trợ cân bằng hệ vi sinh đường ruột – hộp 10 ống',
  'g2-p05-r-05': 'Colon 3 tỷ – men vi sinh hỗ trợ đại tràng – hộp 10 ống',

  'g2-p06-l-01': 'GH Creation EX – bổ sung canxi, arginine và vitamin D – 270 viên',
  'g2-p06-l-02': 'Glucosamine – hỗ trợ xương khớp – 360 viên',
  'g2-p06-l-03': 'Glucosamine – hỗ trợ xương khớp – 950 viên',
  'g2-p06-l-05': 'Nattokinase 4000FU – hỗ trợ tuần hoàn máu – 60 viên',
  'g2-p06-l-08': 'Bột Collagen Hyaluronic Acid 11000mg – hỗ trợ da và độ ẩm – túi 180g',
  'g2-p06-r-13': 'Glucosamine – hỗ trợ xương khớp – 900 viên',
  'g2-p06-r-15': 'Viên nhai Collagen vị đào – hỗ trợ da – 180 viên',
  'g2-p06-r-16': 'Nattokinase 2000FU – hỗ trợ tuần hoàn máu – 60 viên',
  'g2-p06-r-17': 'Viên nhai Vitamin C vị cherry – bổ sung vitamin C',
  'g2-p06-r-18': 'Tảo xoắn Spirulina – bổ sung dinh dưỡng – 2200 viên',

  'g2-p07-l-01': 'Magnesium Bisglycinate 200mg – bổ sung magie – 120 viên',
  'g2-p07-r-02': 'Triple Strength Omega-3 900mg – dầu cá hỗ trợ tim mạch – 120 viên',
  'g2-p08-r-12': 'Winter Melon Gel Cream – thạch bí đao dưỡng ẩm 30ml',

  'g2-p09-l-01': 'Menopause – hỗ trợ phụ nữ giai đoạn mãn kinh – 30 viên',
  'g2-p09-l-02': 'Menopause – hỗ trợ phụ nữ giai đoạn mãn kinh – 90 viên',
  'g2-p09-l-03': 'Femmes Enceintes – vitamin dành cho bà bầu – 30 viên',
  'g2-p09-r-04': 'Menopause – hỗ trợ phụ nữ giai đoạn mãn kinh – 60 viên',
  'g2-p09-r-05': 'Intima Équilibre – hỗ trợ cân bằng hệ vi sinh phụ nữ – 30 viên',
  'g2-p09-r-06': 'Collagène Expert – collagen hỗ trợ da – 30 viên',

  'g2-p10-l-01': 'Daily Intimate Wash – dung dịch vệ sinh phụ nữ dịu nhẹ màu cam – chai 250ml',
  'g2-p10-l-02': 'Intimate Skin Care Daily Wash – dung dịch vệ sinh phụ nữ màu cam bé – chai 150ml',
  'g2-p10-l-03': 'Active Wash – dung dịch vệ sinh phụ nữ năng động màu xanh – chai 250ml',
  'g2-p10-r-04': 'Soothing Wash – dung dịch vệ sinh phụ nữ dịu nhẹ màu hồng – chai 250ml',
  'g2-p10-r-05': '0% Sensitive Intimate Wash – dung dịch vệ sinh cho da nhạy cảm – chai 250ml',

  'g2-p11-l-01': 'Dry Shampoo Fruity & Cheeky Cherry – dầu gội khô hương cherry 200ml',
  'g2-p11-l-02': 'Dry Shampoo Fresh Breezy Citrus – dầu gội khô hương cam chanh 200ml',
  'g2-p11-l-03': 'Dry Shampoo Original Classic Fresh – dầu gội khô hương tươi mát 200ml',
  'g2-p11-r-04': 'Dry Shampoo Blush Flirty Floral – dầu gội khô hương hoa 200ml',
  'g2-p11-r-05': 'Dry Shampoo Tropical Exotic Coconuts – dầu gội khô hương dừa 200ml',

  'g2-p12-l-01': 'Neubiotics Her – men vi sinh dành cho phụ nữ – 30 viên',
  'g2-p12-r-02': 'Neu Kid – vitamin tổng hợp và Omega-3 cho trẻ – 30 viên',
  'g2-p13-l-01': 'Feroglobin B12 Capsules – bổ sung sắt và vitamin B12 – 30 viên',
  'g2-p13-l-02': 'Pregnacare Max – vitamin tổng hợp cho mẹ bầu – 84 viên',
  'g2-p13-l-03': 'Pregnacare Plus Omega-3 – vitamin và Omega-3 cho mẹ bầu – 56 viên',
  'g2-p13-l-04': 'Feroglobin B12 Liquid – sắt và vitamin B12 dạng nước – chai 200ml',
  'g2-p13-r-05': 'Osteocare Tablets – bổ sung canxi, magie và vitamin D – 30 viên',
  'g2-p13-r-06': 'Osteocare Liquid – canxi, magie và vitamin D dạng nước – chai 200ml',
  'g2-p13-r-07': 'Pregnacare Breastfeeding – vitamin cho mẹ cho con bú – 84 viên',

  'g2-p14-l-01': 'For Women – men vi sinh dành cho phụ nữ – 30 viên',
  'g2-p14-l-02': 'Pregnancy – men vi sinh cho phụ nữ mang thai – 30 viên',
  'g2-p14-l-03': 'Baby Drops – men vi sinh dạng giọt cho bé',
  'g2-p14-r-04': 'For Women – men vi sinh dành cho phụ nữ – 90 viên',
  'g2-p14-r-05': 'Babies & Children – men vi sinh cho trẻ nhỏ – 30 gói',

  'g2-p15-l-01': 'Milk Calcium Bone Care – canxi sữa hỗ trợ xương – 150 viên',
  'g2-p15-l-02': 'Baby Ddrops Vitamin D3 – vitamin D3 dạng giọt cho bé – chai 2,5ml',
  'g2-p15-l-03': 'DHA For Kids – bổ sung DHA cho trẻ – 60 viên',
  'g2-p15-r-04': 'DHA For Pregnancy – bổ sung DHA cho mẹ bầu – 60 viên',
  'g2-p15-r-05': 'Zinc – bổ sung kẽm – 120 viên',
  'g2-p15-r-06': 'Milk Calcium For Kids – canxi sữa cho trẻ – 90 viên',

  'g2-p16-l-01': 'Kids High Strength DHA – DHA hàm lượng cao cho trẻ – 60 viên',
  'g2-p16-l-02': 'Kids Milk Calcium – canxi sữa cho trẻ – 60 viên',
  'g2-p16-l-03': 'Ginkgo Biloba 2000 – bạch quả hỗ trợ tuần hoàn não – 100 viên',
  'g2-p16-l-04': 'Vitamin E 500IU – bổ sung vitamin E – 200 viên',
  'g2-p16-l-05': 'Shark Cartilage 750mg – sụn cá mập hỗ trợ xương khớp – 200 viên',
  'g2-p16-r-06': 'Ultimate Omega 3-6-9 – hỗ trợ tim mạch – 200 viên',
  'g2-p16-r-07': 'Fish Oil Omega-3 1000mg – dầu cá hỗ trợ tim mạch – 200 viên',
  'g2-p16-r-08': 'Fish Oil 1000mg – dầu cá Omega-3 – 400 viên',
  'g2-p16-r-09': 'Super Lecithin 1200mg – bổ sung lecithin – 100 viên',

  'g2-p17-l-01': 'Elevit DHA – bổ sung DHA cho mẹ bầu – 30 viên',
  'g2-p17-r-03': 'Elevit Breastfeeding – vitamin cho mẹ cho con bú – 30 viên',
  'g2-p18-l-01': 'Lanolin Cream – kem cừu dưỡng ẩm màu tím',
  'g2-p18-l-02': 'Evening Primrose Oil 1000mg – dầu hoa anh thảo hỗ trợ nữ giới – 60 viên',
  'g2-p18-r-03': 'Lanolin Cream – kem cừu dưỡng ẩm màu vàng – lọ 100ml',
  'g2-p18-r-04': 'Fish Oil 1000mg – dầu cá Omega-3 Careline – 100 viên',
  'g2-p19-l-01': 'Calcium & Vitamin D3 – bổ sung canxi và D3 – 130 viên',
  'g2-p19-r-02': 'Calcium & Vitamin D3 – bổ sung canxi và D3 – 60 viên',

  'g2-p20-l-01': 'Liver Health Milk Thistle Plus – kế sữa hỗ trợ chức năng gan',
  'g2-p20-l-02': 'Signature Teeth Health – bổ sung canxi, vitamin D hỗ trợ răng và xương',
  'g2-p20-r-04': 'Biotin 10000 – hỗ trợ tóc, da và móng',
  'g2-p20-r-05': 'Fish Collagen Plus – collagen cá thủy phân hỗ trợ da',
  'g2-p21-l-01': 'Tone Up Sun Cream SPF50+ PA+++ – kem chống nắng nâng tông',
  'g2-p21-l-02': 'Mela-Light Ampoule – tinh chất hỗ trợ làm sáng da',
  'g2-p21-r-04': 'Whitening Body Cream – kem dưỡng thể hỗ trợ làm sáng da 300ml',
  'g2-p22-l-01': 'Crystal Sun Spray SPF50+ PA+++ – xịt chống nắng 180ml',
  'g2-p22-r-02': 'Crystal Sun Spray SPF50+ PA+++ – xịt chống nắng 80ml',

  'g2-p23-l-01': 'Ferrous Gluconate – sắt hữu cơ hỗ trợ tạo máu – 50 viên',
  'g2-p23-l-02': 'Milk Thistle 500mg – kế sữa hỗ trợ chức năng gan – 60 viên',
  'g2-p23-r-03': 'Ginkgo Biloba – bạch quả hỗ trợ tuần hoàn não – 60 viên',
  'g2-p23-r-04': 'Natural Calcium Citrate + D3 – bổ sung canxi và D3 – 60 viên',
  'g2-p24-l-01': 'Ginkgo Biloba – bạch quả hỗ trợ tuần hoàn não – 60 viên',
  'g2-p24-l-02': 'Milk Thistle 1000mg – kế sữa hỗ trợ chức năng gan – 50 viên',
  'g2-p24-r-03': 'Melatonin – hỗ trợ điều hòa giấc ngủ – 60 viên',
  'g2-p25-l-01': 'Ginkgo Biloba – bạch quả hỗ trợ tuần hoàn não – 30 viên',
  'g2-p25-r-02': 'DIM For Her – hỗ trợ cân bằng nội tiết tố nữ – 30 viên',

  'g2-p26-l-01': 'K2 + D3 Drops – bổ sung vitamin K2 và D3 dạng giọt',
  'g2-p26-l-02': 'Vitamin D3 K2 – bổ sung D3 và K2 dạng xịt',
  'g2-p26-r-03': 'K2 + D3 Plus+ – bổ sung vitamin K2 và D3',

  'g2-p29-l-01': 'Medical Classic Acne Patch – miếng dán mụn trong suốt – 46 miếng',
  'g2-p29-l-02': 'Pink Lover Acne Patch – miếng dán mụn màu hồng – 36 miếng',
  'g2-p29-l-03': 'Sensitive Skin Acne Patch – miếng dán mụn cho da nhạy cảm – 36 miếng',
  'g2-p29-l-04': 'Bling Pearl Flower Acne Patch – miếng dán mụn hình hoa ngọc trai – 16 miếng',
  'g2-p29-l-05': 'Bling Glitter Lover Acne Patch – miếng dán mụn lấp lánh – 36 miếng',
  'g2-p29-l-06': 'Bling Water Lover Acne Patch – miếng dán mụn chống nước – 36 miếng',
  'g2-p29-r-08': 'Nighttime Acne Patch – miếng dán mụn dùng ban đêm – 36 miếng',
  'g2-p29-r-09': 'Bling Diamond Flower Acne Patch – miếng dán mụn hình hoa kim cương',
  'g2-p29-r-10': 'Purple Lover Acne Patch – miếng dán mụn màu tím – 36 miếng',
  'g2-p29-r-11': 'Bling Happy Star Acne Patch – miếng dán mụn hình ngôi sao',

  'g2-p30-l-01': 'Oyster Plus – tinh chất hàu hỗ trợ sức khỏe nam giới – 60 viên',
  'g2-p30-l-02': 'BioGaia Protectis – men vi sinh dạng giọt cho bé – chai 5ml',
  'g2-p30-l-03': 'Bifidolab Woman Project – men vi sinh dành cho phụ nữ',
  'g2-p30-l-04': 'Vitaline D Natural Vitamin D3 4000IU – bổ sung vitamin D3 – 120 viên',
  'g2-p30-r-06': 'Bestical Strawberry Flavor Syrup – siro canxi và vitamin D vị dâu – 120ml',
  'g2-p30-r-07': 'Vitamin C 1000mg – bổ sung vitamin C – 120 viên',
  'g2-p30-r-08': 'Magnefol – magie hữu cơ – 30 viên'
};

const products = context.window.HMC_PRODUCTS;
const ids = new Set(products.map((p) => p.id));
const missing = Object.keys(names).filter((id) => !ids.has(id));
if (missing.length) throw new Error(`Không tìm thấy mã: ${missing.join(', ')}`);

let changed = 0;
for (const product of products) {
  if (names[product.id] && product.name !== names[product.id]) {
    product.name = names[product.id];
    changed += 1;
  }
}

fs.writeFileSync(file, `window.HMC_PRODUCTS = ${JSON.stringify(products)};\n`, 'utf8');
const byId = new Map(products.map((product) => [product.id, product]));
const info = context.window.HMC_INFO || {};
for (const id of Object.keys(names)) {
  const product = byId.get(id);
  if (info[id] && Array.isArray(info[id].cong_dung) && info[id].cong_dung.length) {
    info[id].cong_dung[0] = `Sản phẩm ${product.name} của ${product.brand}.`;
  }
}
fs.writeFileSync(infoFile, `window.HMC_INFO = ${JSON.stringify(info)};\n`, 'utf8');
console.log(`Đã chuẩn hóa ${changed}/${Object.keys(names).length} tên sản phẩm.`);
