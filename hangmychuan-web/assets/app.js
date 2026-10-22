(function () {
  "use strict";

  /* ---------- Dữ liệu cố định ---------- */
  var CONTACT = {
    phone: "0984 542 459",
    tel: "tel:0984542459",
    zalo: "https://zalo.me/0984542459",
    zaloGroup: "https://zalo.me/g/om76vlnwz0o84wvaht2d",
    messenger: "https://m.me/hangmychuan/",
    fanpage: "https://www.facebook.com/hangmychuan.1/",
    tiktok: "https://www.tiktok.com/@hangmychuan.1"
  };
  var BANK = { bank: "Seabank", number: "0984542459", holder: "NGUYEN THI NGA" };
  var TPCN_NOTE = "Thực phẩm này không phải là thuốc và không có tác dụng thay thế thuốc chữa bệnh.";
  var AFF = window.HMC_AFFILIATE || {};

  var GROUPS = [
    { slug: "vitamin-tpcn", name: "Vitamin & TPCN", full: "Vitamin & Thực phẩm chức năng", desc: "Bổ sung dưỡng chất hằng ngày cho cả nhà." },
    { slug: "suc-khoe", name: "Sức khỏe gia đình", full: "Sức khỏe gia đình", desc: "Giảm đau, dị ứng, dạ dày, dầu xoa bóp – tủ thuốc gia đình." },
    { slug: "lam-dep", name: "Làm đẹp", full: "Làm đẹp & Chăm sóc cá nhân", desc: "Collagen, chăm da, tắm gội, răng miệng." },
    { slug: "thuc-pham-tieu-dung", name: "Thực phẩm & Tiêu dùng", full: "Thực phẩm & Hàng tiêu dùng", desc: "Đồ ăn, sữa dinh dưỡng, đồ gia dụng từ Costco, Kirkland." },
    { slug: "thoi-trang", name: "Thời trang", full: "Thời trang", desc: "Giày dép, quần áo, phụ kiện hàng nhập." },
    { slug: "me-be", name: "Mẹ & Bé", full: "Mẹ & Bé", desc: "Vitamin, sữa và đồ chăm sóc cho bé." }
  ];
  var SUBS = {
    "vitamin-tpcn": [
      { slug: "vitamin-tong-hop", name: "Vitamin tổng hợp", icon: "pill" },
      { slug: "vitamin-khoang", name: "Vitamin & khoáng chất", icon: "shield" },
      { slug: "tim", name: "Tim mạch – Omega 3", icon: "heart" },
      { slug: "nao", name: "Não – Giấc ngủ", icon: "brain" },
      { slug: "mat", name: "Mắt", icon: "eye" },
      { slug: "co-xuong-khop", name: "Xương khớp – Canxi", icon: "bone" },
      { slug: "tieu-hoa", name: "Tiêu hóa – Men vi sinh", icon: "stomach" },
      { slug: "gan", name: "Gan – Thanh lọc", icon: "liver" },
      { slug: "than", name: "Thận – Tiết niệu", icon: "kidney" },
      { slug: "giam-can", name: "Cân nặng – Đường huyết", icon: "down" },
      { slug: "phu-nu", name: "Sức khỏe phụ nữ", icon: "female" },
      { slug: "nam-gioi", name: "Sức khỏe nam giới", icon: "male" }
    ],
    "suc-khoe": [
      { slug: "giam-dau", name: "Giảm đau – Hạ sốt" }, { slug: "di-ung", name: "Dị ứng – Cảm – Ho" },
      { slug: "da-day", name: "Dạ dày – Tiêu hóa" }, { slug: "xoa-bop", name: "Dầu & miếng dán xoa bóp" },
      { slug: "mat-mui", name: "Nhỏ mắt – Rửa mũi" }
    ],
    "lam-dep": [
      { slug: "collagen", name: "Collagen – Da, tóc, móng" }, { slug: "cham-soc-da", name: "Chăm sóc da" },
      { slug: "tam-goi", name: "Tắm gội – Vệ sinh" }, { slug: "rang-mieng", name: "Răng miệng" },
      { slug: "khu-mui", name: "Khử mùi – Cạo râu" }
    ],
    "thuc-pham-tieu-dung": [{ slug: "thuc-pham", name: "Thực phẩm – Đồ uống" }, { slug: "sua-dinh-duong", name: "Sữa dinh dưỡng" }, { slug: "gia-dung", name: "Gia dụng – Giặt xả" }],
    "thoi-trang": [{ slug: "giay-dep", name: "Giày dép" }, { slug: "quan-ao", name: "Quần áo" }, { slug: "phu-kien", name: "Phụ kiện" }],
    "me-be": [{ slug: "me-bau", name: "Mẹ bầu & sau sinh" }, { slug: "vitamin-be", name: "Vitamin – Sữa cho bé" }, { slug: "cham-soc-be", name: "Tắm gội – Chăm sóc bé" }, { slug: "suc-khoe-be", name: "Sức khỏe cho bé" }]
  };

  var decoder = document.createElement("textarea");
  function decode(s) { decoder.innerHTML = s || ""; return decoder.value; }
  // Hàng có sẵn tại cửa hàng (ảnh nền trắng trong images/sp) đứng trước danh mục cũ
  var STOCK = (window.HMC_STOCK || []).map(function (s) {
    var ext = s.id === "nb-melatonin-gummy" ? ".jpg" : ".webp";
    return { id: s.id, slug: s.id, name: s.name, brand: s.brand, price: s.price, old: s.old || 0, group: s.group, sub: s.sub, img: s.img || "images/sp/" + s.id + ext, stock: true, one: !!s.one, gift: !!s.gift };
  });
  // món cũ được gắn "stock":true trong products.js cũng tính là hàng có sẵn
  var OLD = window.HMC_PRODUCTS || [];
  STOCK = STOCK.concat(OLD.filter(function (p) { return p.stock; }));
  // Ảnh Melatonin cũ từng bị méo ở hero; giữ sản phẩm ở cuối danh sách hàng có sẵn.
  var melatoninIndex = STOCK.findIndex(function (p) { return p.id === "nb-melatonin-gummy"; });
  if (melatoninIndex >= 0) STOCK.push(STOCK.splice(melatoninIndex, 1)[0]);
  var P = STOCK.concat(OLD.filter(function (p) { return !p.stock; })).map(function (p) {
    p.name = decode(p.name);
    p.brand = decode(p.brand);
    p.off = p.old > p.price ? Math.floor((1 - p.price / p.old) * 100) : 0;
    p.key = norm(p.name + " " + p.brand + " " + groupName(p.group)).replace(/\s+/g, " ");
    return p;
  });
  var BY_SLUG = {};
  P.forEach(function (p) { BY_SLUG[p.slug] = p; });

  /* ---------- Icon ---------- */
  var ICONS = {
    search: '<circle cx="11" cy="11" r="7"/><path d="m20 20-3.5-3.5"/>',
    phone: '<path d="M5 4h4l2 5-2.5 1.5a11 11 0 0 0 5 5L15 13l5 2v4a2 2 0 0 1-2 2A16 16 0 0 1 3 6a2 2 0 0 1 2-2"/>',
    zalo: '<path d="M4 5.5A2.5 2.5 0 0 1 6.5 3h11A2.5 2.5 0 0 1 20 5.5v8a2.5 2.5 0 0 1-2.5 2.5H11l-4.5 4v-4h0A2.5 2.5 0 0 1 4 13.5z"/><path d="M8 8h4l-4 5h4M15 8v5"/>',
    msg: '<path d="M12 3C7 3 3 6.6 3 11c0 2.4 1.2 4.6 3 6v4l3.6-2c.8.2 1.6.3 2.4.3 5 0 9-3.6 9-8s-4-8.3-9-8.3"/><path d="m7.5 13 3-3 2.5 2 3.5-3"/>',
    check: '<path d="M20 6 9 17l-5-5"/>',
    dot: '<circle cx="12" cy="12" r="3.5" fill="currentColor"/>',
    shield: '<path d="M12 3 4 6v6c0 5 3.5 8 8 9 4.5-1 8-4 8-9V6z"/><path d="m9 12 2 2 4-4"/>',
    chat: '<path d="M21 12a8 8 0 0 1-11.8 7L4 20l1.1-4.6A8 8 0 1 1 21 12"/><path d="M8 11h.01M12 11h.01M16 11h.01"/>',
    bolt: '<path d="M13 2 4 14h7l-1 8 9-12h-7z"/>',
    card: '<rect x="3" y="5" width="18" height="14" rx="2"/><path d="M3 10h18M7 15h4"/>',
    arrow: '<path d="M5 12h14M13 6l6 6-6 6"/>',
    down2: '<path d="M12 4v16M6 14l6 6 6-6"/>',
    box: '<path d="M21 8 12 3 3 8v8l9 5 9-5z"/><path d="m3 8 9 5 9-5M12 13v8"/>',
    tag: '<path d="M3 12V4h8l10 10-8 8z"/><circle cx="7.5" cy="8.5" r="1.5"/>',
    fb: '<path d="M14 8h3V4h-3a4 4 0 0 0-4 4v3H7v4h3v6h4v-6h3l1-4h-4V8.5c0-.3.2-.5.5-.5"/>',
    tiktok: '<path d="M14 3v11.5a3.5 3.5 0 1 1-3.5-3.5"/><path d="M14 3c.5 3 2.5 5 5 5"/>',
    users: '<circle cx="9" cy="8" r="3.5"/><path d="M2.5 20c.5-3.5 3.2-6 6.5-6s6 2.5 6.5 6M16 4.5a3.5 3.5 0 0 1 0 7M18 14c2 .7 3.3 3 3.5 6"/>',
    liver: '<path d="M3 9c0-3 3-5 7-5 5 0 11 1 11 5 0 5-6 10-11 10-2 0-3-2-3-4-3 0-4-3-4-6"/><path d="M12 6v5"/>',
    brain: '<path d="M12 5a3 3 0 0 0-5.6-1.5A3 3 0 0 0 4 8a3 3 0 0 0 0 5 3 3 0 0 0 3 5 3 3 0 0 0 5 1z"/><path d="M12 5a3 3 0 0 1 5.6-1.5A3 3 0 0 1 20 8a3 3 0 0 1 0 5 3 3 0 0 1-3 5 3 3 0 0 1-5 1z"/>',
    kidney: '<path d="M9 3C5 3 3 7 3 11s2 9 6 9c2.5 0 3-2 2-4-.8-1.5-.8-3 0-4.5C12 9.5 13 3 9 3"/><path d="M15 3c4 0 6 4 6 8s-2 9-6 9c-2.5 0-3-2-2-4 .8-1.5.8-3 0-4.5C12 9.5 11 3 15 3"/>',
    eye: '<path d="M2 12s3.5-7 10-7 10 7 10 7-3.5 7-10 7S2 12 2 12"/><circle cx="12" cy="12" r="3"/>',
    heart: '<path d="M12 20s-8-4.7-8-11a4.5 4.5 0 0 1 8-2.8A4.5 4.5 0 0 1 20 9c0 6.3-8 11-8 11"/><path d="M7 11h2.5l1.5-2.5 2 5 1.5-2.5H17"/>',
    bone: '<path d="M8.5 6.5a2.5 2.5 0 1 0-3.5 3.5 2.5 2.5 0 1 0 3.5 3.5l5-5a2.5 2.5 0 1 0 3.5-3.5 2.5 2.5 0 1 0-3.5-3.5" transform="translate(1.5 4)"/>',
    up: '<rect x="3" y="12" width="18" height="8" rx="2"/><path d="M12 3v6M9 6l3-3 3 3"/>',
    down: '<rect x="3" y="12" width="18" height="8" rx="2"/><path d="M12 9V3M9 6l3 3 3-3"/>',
    stomach: '<path d="M9 3v4c0 2-3 2.5-3 6a6 6 0 0 0 6 6c4 0 7-2.5 7-6 0-2.5-2-4-4.5-4-2 0-2.5 1.5-4.5 1.5V3"/>',
    female: '<circle cx="12" cy="9" r="5"/><path d="M12 14v7M9 18h6"/>',
    male: '<circle cx="10" cy="14" r="5"/><path d="M14 10l6-6M15 4h5v5"/>',
    gift: '<rect x="3" y="8" width="18" height="4" rx="1"/><path d="M12 8v13M19 12v9H5v-9M7.5 8a2.5 2.5 0 1 1 4.5-1.5A2.5 2.5 0 1 1 16.5 8"/>',
    pill: '<rect x="3" y="8" width="18" height="8" rx="4" transform="rotate(-45 12 12)"/><path d="m9 9 6 6"/>'
  };
  function ic(name) {
    return '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.75" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true">' + (ICONS[name] || "") + "</svg>";
  }

  /* ---------- Tiện ích ---------- */
  function norm(s) { return (s || "").normalize("NFD").replace(/[̀-ͯ]/g, "").replace(/đ/gi, "d").toLowerCase(); }
  function esc(s) { return String(s).replace(/[&<>"']/g, function (c) { return { "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;", "'": "&#39;" }[c]; }); }
  function vnd(n) { return n ? n.toLocaleString("vi-VN").replace(/,/g, ".") + "đ" : "Liên hệ"; }
  function groupOf(slug) { for (var i = 0; i < GROUPS.length; i++) if (GROUPS[i].slug === slug) return GROUPS[i]; return null; }
  function groupName(slug) { var g = groupOf(slug); return g ? g.full : ""; }
  function inGroup(g) { return P.filter(function (p) { return p.group === g; }); }
  function link(path) { return "#/" + path; }
  function $(s, r) { return (r || document).querySelector(s); }
  function cleanRef(value) { return String(value || "").toUpperCase().replace(/[^A-Z0-9_-]/g, "").slice(0, 24); }
  function activeRef() { try { return cleanRef(localStorage.getItem("hmc_aff_ref")); } catch (e) { return ""; } }
  function saveRef(value) { try { localStorage.setItem("hmc_aff_ref", cleanRef(value)); } catch (e) {} }

  var toastTimer;
  function toast(msg) {
    var t = $("#toast");
    t.textContent = msg;
    t.classList.add("show");
    clearTimeout(toastTimer);
    toastTimer = setTimeout(function () { t.classList.remove("show"); }, 3000);
  }
  function copyText(text) {
    if (navigator.clipboard && window.isSecureContext) return navigator.clipboard.writeText(text);
    return new Promise(function (ok, fail) {
      var ta = document.createElement("textarea");
      ta.value = text; ta.setAttribute("readonly", ""); ta.style.position = "fixed"; ta.style.opacity = "0";
      document.body.appendChild(ta); ta.select();
      try { document.execCommand("copy") ? ok() : fail(); } catch (e) { fail(e); }
      document.body.removeChild(ta);
    });
  }
  function orderZalo(p) {
    var ref = activeRef();
    var msg = p
      ? "Chào shop, mình muốn đặt: " + p.name + (p.price ? " – giá " + vnd(p.price) : " – shop báo giá giúp mình") + (p.gift ? " (kèm quà tặng " + GIFT_NAME + ")" : "") + ". Số lượng: 1. Shop kiểm tra còn hàng và báo phí giao giúp mình nhé." + (ref ? " Mã đại lý/affiliate: " + ref + "." : "") + " Link: " + location.origin + location.pathname + link("san-pham/" + p.slug)
      : "Chào shop, mình cần tư vấn sản phẩm.";
    var copying = copyText(msg);
    var win = window.open(CONTACT.zalo, "_blank", "noopener");
    copying.then(function () { toast("Đã chép tin nhắn đặt hàng, chị dán vào Zalo nhé"); }, function () { toast("Đang mở Zalo 0984 542 459"); });
    if (!win) setTimeout(function () { location.href = CONTACT.zalo; }, 300);
  }

  /* ---------- Thành phần ---------- */
  function card(p, eager) {
    var url = link("san-pham/" + p.slug);
    var alt = esc((p.brand ? p.brand + " " : "") + p.name);
    return '<article class="p-card">' +
      '<a class="p-img" href="' + url + '" tabindex="-1" aria-hidden="true">' +
      (p.off ? '<span class="badge">-' + p.off + "%</span>" : "") +
      (p.stock ? '<span class="badge-stock">Có sẵn</span>' : '<span class="badge-stock order">Order</span>') +
      (p.gift ? '<span class="badge-gift">' + ic("gift") + "Tặng sủi</span>" : "") +
      '<img src="' + p.img + '" alt="' + alt + '" width="640" height="640"' + (eager ? "" : ' loading="lazy"') + ' decoding="async"></a>' +
      '<div class="p-brand label">' + esc(p.brand || "Chính hãng") + "</div>" +
      '<a class="p-name" href="' + url + '">' + esc(p.name) + "</a>" +
      '<div class="price-row"><span class="price' + (p.off ? " sale" : "") + (p.price ? "" : " ask") + '">' + vnd(p.price) + "</span>" +
      (p.off ? '<span class="old"><span class="sr-only">Giá cũ </span>' + vnd(p.old) + "</span>" : "") + "</div>" +
      '<button class="btn-zalo" type="button" data-order="' + p.slug + '">' + ic("zalo") + "Đặt qua Zalo</button>" +
      "</article>";
  }
  function grid(list, eagerN) {
    return '<div class="p-grid">' + list.map(function (p, i) { return card(p, i < (eagerN || 0)); }).join("") + "</div>";
  }
  function ctaBlock() {
    return '<section class="section" style="padding-top:0"><div class="container"><div class="cta on-dark">' +
      "<h2>Chưa biết chọn món nào? Hỏi shop trước đã.</h2>" +
      "<p>Nhắn Zalo, shop tư vấn tận tình, chị thấy hợp hãy đặt.</p>" +
      '<div class="row"><button class="btn btn-white" type="button" data-order="">' + ic("zalo") + "Chat Zalo " + CONTACT.phone + "</button>" +
      '<a class="btn btn-ghost-white" href="' + link("tat-ca") + '">Xem tất cả sản phẩm</a></div>' +
      "</div></div></section>";
  }
  var COMMITS = [
    ["shield", "Hàng chính hãng", "Nhập từ Mỹ, Canada, Nhật, Hàn"],
    ["chat", "Tư vấn tận tâm", "Hỏi kỹ nhu cầu rồi mới gợi ý"],
    ["bolt", "Đặt nhanh qua Zalo", "Một tin nhắn là có người trả lời"],
    ["card", "Chuyển khoản tiện", "Seabank, có sẵn mã QR"]
  ];
  function commitBar() {
    return '<section class="commit" aria-label="Cam kết"><div class="container commit-grid">' +
      COMMITS.map(function (c) { return '<div class="commit-item">' + ic(c[0]) + "<div><strong>" + c[1] + "</strong><span>" + c[2] + "</span></div></div>"; }).join("") +
      "</div></section>";
  }
  var FAQ = [
    ["Hàng ở shop có phải hàng thật không?", "Shop chỉ bán hàng nhập chính hãng từ Mỹ, Canada, Nhật, Hàn. Chị cần xem thông tin nguồn gốc của món nào thì nhắn Zalo, shop gửi chi tiết."],
    ["Đặt hàng thế nào?", "Bấm nút \"Đặt qua Zalo\" ở sản phẩm: web tự chép sẵn tin nhắn đặt hàng, chị chỉ cần dán vào Zalo và gửi. Hoặc nhắn trực tiếp Zalo " + CONTACT.phone + "."],
    ["Thanh toán bằng cách nào?", "Chuyển khoản qua tài khoản Seabank của shop (số tài khoản và mã QR ở cuối trang). Chị chuyển khoản sau khi shop đã xác nhận đơn qua Zalo."],
    ["Bao lâu thì nhận được hàng?", "Tuỳ khu vực và tình trạng hàng. Shop báo rõ thời gian giao và phí ship khi xác nhận đơn, chị đồng ý rồi mới chốt."],
    ["Sản phẩm hết hàng thì sao?", "Chị cứ nhắn shop. Shop báo khi nào có hàng lại, hoặc gợi ý sản phẩm tương đương nếu chị cần dùng ngay."],
    ["Shop có tư vấn chọn sản phẩm không?", "Có. Chị cho shop biết ai dùng, độ tuổi và nhu cầu, shop sẽ gợi ý loại phù hợp. Với thực phẩm chức năng, shop chỉ tư vấn về sản phẩm, không thay lời khuyên của bác sĩ. " + TPCN_NOTE]
  ];

  /* ---------- Trang ---------- */
  function pageHome() {
    var pick = [];
    // ảnh ghép hero: lọ vitamin của 5 thương hiệu khác nhau
    var seen = {};
    inGroup("vitamin-tpcn").forEach(function (p) {
      var b = norm(p.brand).split(" ")[0];
      if (pick.length < 5 && b && !seen[b]) { seen[b] = 1; pick.push(p); }
    });
    P.forEach(function (p) { if (pick.length < 5 && pick.indexOf(p) < 0) pick.push(p); });

    // hàng có sẵn: mỗi thương hiệu 1 món, ưu tiên món đã có giá
    var featured = [], seenB = {};
    STOCK.filter(function (p) { return p.price; }).forEach(function (p) {
      if (featured.length < 8 && !seenB[p.brand]) { seenB[p.brand] = 1; featured.push(p); }
    });
    var sale = P.filter(function (p) { return p.off; }).sort(function (a, b) { return b.off - a.off; }).slice(0, 8);

    var html = "";
    html += '<section class="hero"><div class="container"><div class="hero-box">' +
      '<div><span class="eyebrow label">Hàng nhập Mỹ · Canada · Nhật · Hàn</span>' +
      "<h1>Hàng nhập chính hãng, yên tâm cho cả nhà</h1>" +
      '<p class="lead">Vitamin, làm đẹp, thực phẩm, thời trang và đồ mẹ bé. Được tư vấn kỹ trước khi mua, đặt nhanh qua Zalo.</p>' +
      '<div class="hero-cta"><a class="btn btn-primary" href="' + link("tat-ca") + '">Xem sản phẩm ' + ic("arrow") + "</a>" +
      '<button class="btn btn-outline" type="button" data-order="">' + ic("zalo") + "Chat Zalo tư vấn</button></div>" +
      '<ul class="ticks"><li>' + ic("check") + "Chính hãng</li><li>" + ic("check") + "Tư vấn trước khi mua</li><li>" + ic("check") + "Đặt qua Zalo</li></ul></div>" +
      '<div class="collage" aria-hidden="true"><div class="disc"></div><div class="flag"><i></i><i></i><i></i></div>' +
      pick.map(function (p, i) { return '<a class="item i' + i + '" href="' + link("san-pham/" + p.slug) + '" tabindex="-1"><img src="' + p.img + '" alt="" width="320" height="320"></a>'; }).join("") +
      "</div></div></div></section>";

    html += commitBar();

    html += '<section class="section"><div class="container"><div class="section-head"><h2>Mua theo danh mục</h2></div><div class="cat-grid">' +
      GROUPS.map(function (g) {
        var items = inGroup(g.slug);
        var imgs = items.slice(0, 3).map(function (p) { return '<img src="' + p.img + '" alt="" loading="lazy" width="200" height="200">'; }).join("");
        return '<a class="cat-tile" href="' + link("danh-muc/" + g.slug) + '"><div class="stack">' + (imgs || '<div class="empty">' + ic("tag") + "</div>") + "</div>" +
          "<div><h3>" + g.full + '</h3><p class="cat-desc">' + g.desc + '</p></div><div class="meta"><span>' + (items.length ? items.length + " sản phẩm" : "Đang cập nhật") + "</span>" + ic("arrow") + "</div></a>";
      }).join("") + "</div></div></section>";

    html += '<section class="section bg-cream"><div class="container"><div class="section-head"><div><h2>Vitamin theo nhu cầu</h2><p class="muted" style="margin:0">Chọn theo bộ phận cơ thể muốn chăm sóc.</p></div></div><div class="organ-grid">' +
      SUBS["vitamin-tpcn"].map(function (s) {
        return '<a class="organ" href="' + link("danh-muc/vitamin-tpcn?nhom=" + s.slug) + '"><span class="ring">' + ic(s.icon) + "</span>" + s.name + "</a>";
      }).join("") + '</div><p class="muted" style="font-size:.875rem;margin:20px 0 0;text-align:center">' + TPCN_NOTE + "</p></div></section>";

    html += '<section class="section"><div class="container"><div class="section-head"><div><h2>Hàng có sẵn tại cửa hàng</h2><p class="muted" style="margin:0">' + STOCK.length + ' sản phẩm đang có trên kệ, giao ngay.</p></div><a href="' + link("co-san") + '">Xem tất cả →</a></div>' + grid(featured) + "</div></section>";

    html += '<section class="section bg-navy50"><div class="container"><div class="section-head"><h2><span class="dot"></span>Đang giảm giá</h2><a href="' + link("giam-gia") + '">Xem tất cả →</a></div><div class="rail">' +
      sale.map(function (p) { return card(p); }).join("") + '<a class="rail-more" href="' + link("giam-gia") + '">' + ic("arrow") + "Xem tất cả ưu đãi</a></div></div></section>";

    html += '<section class="section"><div class="container"><div class="section-head" style="justify-content:center;text-align:center"><h2>Mua hàng nhập, ai cũng từng lo những điều này</h2></div>' +
      '<div class="why-a">' + [
        ["01", "Sợ mua phải hàng giả", "Hàng \"xách tay\" trên mạng nhiều vô kể, nhìn bên ngoài khó phân biệt thật giả. Mua cho gia đình dùng thì càng không dám liều."],
        ["02", "Không biết chọn loại nào", "Cùng một nhóm vitamin mà có hàng chục nhãn hiệu, hàng chục loại. Đọc nhãn tiếng Anh lại càng rối."],
        ["03", "Đặt rồi chờ mãi, hỏi không ai trả lời", "Chuyển khoản xong là mất liên lạc, hàng về không như mô tả. Ai từng gặp một lần là ngại mua online."]
      ].map(function (w) { return '<div class="worry"><span class="num">' + w[0] + "</span><h3>" + w[1] + "</h3><p>" + w[2] + "</p></div>"; }).join("") + "</div>" +
      '<div class="why-arrow">' + ic("down2") + '</div><h3 class="sub-h">Hàng Mỹ Chuẩn làm thế này</h3><div class="why-b">' + [
        ["Nguồn hàng rõ ràng", "Hàng nhập từ Mỹ, Canada, Nhật, Hàn, của những thương hiệu quen thuộc như Nature's Bounty, Kirkland. Hỏi nguồn gốc, shop trả lời rõ ràng."],
        ["Tư vấn trước, bán sau", "Shop hỏi kỹ ai dùng, dùng để làm gì rồi mới gợi ý sản phẩm phù hợp. Không hợp thì shop nói thẳng, không cố bán."],
        ["Báo rõ trước khi chốt", "Giá, tình trạng hàng và phí giao được báo rõ qua Zalo trước khi chị chuyển khoản."],
        ["Luôn có người trả lời", "Đặt hàng, hỏi đơn, hỏi cách dùng đều qua một số Zalo " + CONTACT.phone + ". Có nhóm Zalo cộng đồng để cập nhật hàng mới."]
      ].map(function (s) { return '<div class="sol">' + ic("check") + "<h3>" + s[0] + "</h3><p>" + s[1] + "</p></div>"; }).join("") + "</div></div></section>";

    html += '<section class="section bg-cream" id="dat-hang"><div class="container"><div class="section-head"><h2>Đặt hàng chỉ 3 bước</h2></div><ol class="steps">' + [
      ["Chọn sản phẩm", "Xem sản phẩm trên web, bấm \"Đặt qua Zalo\" ở món mình cần."],
      ["Nhắn Zalo xác nhận", "Shop báo lại giá, tình trạng hàng và phí giao. Chị chuyển khoản Seabank để chốt đơn."],
      ["Nhận hàng", "Shop đóng gói cẩn thận và gửi hàng. Có vấn đề gì cứ nhắn shop."]
    ].map(function (s, i) { return '<li class="step"><span class="n">' + (i + 1) + "</span><div><h3>" + s[0] + "</h3><p>" + s[1] + "</p></div></li>"; }).join("") + "</ol></div></section>";

    html += '<section class="section" id="faq"><div class="container"><div class="section-head" style="justify-content:center"><h2>Câu hỏi thường gặp</h2></div><div class="faq">' +
      FAQ.map(function (f, i) { return "<details" + (i === 0 ? " open" : "") + "><summary>" + esc(f[0]) + '</summary><div class="ans"><p>' + esc(f[1]) + "</p></div></details>"; }).join("") +
      "</div></div></section>";

    html += ctaBlock();
    return { title: "Hàng Mỹ Chuẩn – Hàng nhập chính hãng Mỹ, Canada, Nhật, Hàn", html: html };
  }

  var PAGE_SIZE = 24;
  function sortList(list, sx) {
    list = list.slice();
    // món "Liên hệ" (chưa có giá) luôn xếp cuối khi sắp theo giá
    var pr = function (p) { return p.price || Infinity; };
    if (sx === "gia-tang") list.sort(function (a, b) { return pr(a) - pr(b); });
    else if (sx === "gia-giam") list.sort(function (a, b) { return (b.price || -1) - (a.price || -1); });
    else if (sx === "giam-nhieu") list.sort(function (a, b) { return b.off - a.off; });
    return list;
  }
  function sortSelect(sx) {
    var opts = [["", "Mặc định"], ["gia-tang", "Giá tăng dần"], ["gia-giam", "Giá giảm dần"], ["giam-nhieu", "Giảm nhiều nhất"]];
    return '<label>Sắp xếp: <select data-sort>' + opts.map(function (o) { return '<option value="' + o[0] + '"' + (o[0] === (sx || "") ? " selected" : "") + ">" + o[1] + "</option>"; }).join("") + "</select></label>";
  }
  function listing(list, q, base) {
    var limit = +(q.get("xem") || PAGE_SIZE);
    var html = grid(list.slice(0, limit), 4);
    if (list.length > limit) {
      var nq = new URLSearchParams(q); nq.set("xem", limit + PAGE_SIZE);
      html += '<div class="more-wrap"><a class="btn btn-outline" href="' + link(base + "?" + nq) + '" data-keep-scroll>Xem thêm ' + Math.min(PAGE_SIZE, list.length - limit) + " sản phẩm</a></div>";
    }
    return html;
  }
  function emptyState(text) {
    return '<div class="empty-state">' + ic("box") + "<h3>" + text + '</h3><p class="muted">Chị nhắn Zalo để shop kiểm tra và tìm giúp.</p><button class="btn btn-primary" type="button" data-order="">' + ic("zalo") + "Hỏi shop có hàng không</button></div>";
  }

  function pageCategory(slug, q) {
    var g = groupOf(slug);
    if (!g) return pageNotFound();
    var subs = SUBS[slug] || [];
    var nhom = q.get("nhom") || "";
    var sx = q.get("sx") || "";
    var all = inGroup(slug);
    var list = sortList(nhom ? all.filter(function (p) { return p.sub === nhom; }) : all, sx);
    var base = "danh-muc/" + slug;
    function chipUrl(s) { var nq = new URLSearchParams(); if (s) nq.set("nhom", s); if (sx) nq.set("sx", sx); var t = nq.toString(); return link(base + (t ? "?" + t : "")); }
    var html = '<div class="container"><nav class="crumb" aria-label="Đường dẫn"><a href="#/">Trang chủ</a> › ' + g.full + "</nav>" +
      '<div class="page-head"><h1>' + g.full + "</h1><p>" + g.desc + '</p><span class="muted">' + all.length + " sản phẩm</span>" +
      (slug === "vitamin-tpcn" ? '<div class="note">' + TPCN_NOTE + "</div>" : "") + "</div></div>";
    html += '<div class="filters"><div class="container">' +
      (subs.length ? '<div class="chips" role="list"><a role="listitem" class="chip' + (nhom ? "" : " on") + '" href="' + chipUrl("") + '">Tất cả<span class="c">' + all.length + "</span></a>" +
        subs.map(function (s) {
          var n = all.filter(function (p) { return p.sub === s.slug; }).length;
          if (!n) return "";
          return '<a role="listitem" class="chip' + (nhom === s.slug ? " on" : "") + '" href="' + chipUrl(s.slug) + '">' + s.name + '<span class="c">' + n + "</span></a>";
        }).join("") + "</div>" : "") +
      '<div class="toolbar"><span class="muted">' + list.length + " kết quả</span>" + sortSelect(sx) + "</div></div></div>";
    html += '<div class="container">' + (list.length ? listing(list, q, base) : emptyState("Nhóm này đang cập nhật hàng")) + "</div>";
    html += '<div style="height:var(--sec)"></div>' + ctaBlock();
    return { title: g.full + " – Hàng Mỹ Chuẩn", html: html, active: slug };
  }

  function pageFlat(kind, q) {
    var sx = q.get("sx") || (kind === "giam-gia" ? "giam-nhieu" : "");
    var list = kind === "giam-gia" ? P.filter(function (p) { return p.off; }) : kind === "co-san" ? STOCK : P;
    list = sortList(list, sx);
    var title = { "giam-gia": "Đang giảm giá", "co-san": "Hàng có sẵn tại cửa hàng" }[kind] || "Tất cả sản phẩm";
    var desc = {
      "giam-gia": "Sản phẩm đang có giá tốt hơn giá niêm yết, sắp theo mức giảm.",
      "co-san": "Hàng đã về, đang có trên kệ tại cửa hàng. Món ghi \"Liên hệ\" chị nhắn Zalo để shop báo giá."
    }[kind] || "Toàn bộ hàng nhập chính hãng đang có tại shop.";
    var html = '<div class="container"><nav class="crumb" aria-label="Đường dẫn"><a href="#/">Trang chủ</a> › ' + title + "</nav>" +
      '<div class="page-head"><h1>' + title + "</h1><p>" + desc + '</p><span class="muted">' + list.length + " sản phẩm</span></div></div>" +
      '<div class="filters"><div class="container"><div class="chips">' + GROUPS.map(function (g) { return '<a class="chip" href="' + link("danh-muc/" + g.slug) + '">' + g.name + "</a>"; }).join("") + '</div><div class="toolbar"><span class="muted">' + list.length + " kết quả</span>" + sortSelect(sx) + "</div></div></div>" +
      '<div class="container">' + listing(list, q, kind) + '</div><div style="height:var(--sec)"></div>' + ctaBlock();
    return { title: title + " – Hàng Mỹ Chuẩn", html: html, active: kind === "tat-ca" ? "" : kind };
  }

  function searchList(term) {
    var phrase = norm(term).trim().replace(/\s+/g, " ");
    var words = phrase.split(/[^a-z0-9]+/).filter(Boolean);
    if (!words.length) return [];
    var hits = P.filter(function (p) {
      var toks = p.key.split(/[^a-z0-9]+/);
      return words.every(function (w) { return toks.some(function (t) { return t.indexOf(w) === 0; }); });
    });
    // khớp nguyên cụm lên trước
    return hits.filter(function (p) { return p.key.indexOf(phrase) >= 0; })
      .concat(hits.filter(function (p) { return p.key.indexOf(phrase) < 0; }));
  }
  function pageSearch(q) {
    var term = (q.get("q") || "").trim();
    var list = term ? searchList(term) : [];
    var html = '<div class="container"><nav class="crumb" aria-label="Đường dẫn"><a href="#/">Trang chủ</a> › Tìm kiếm</nav>' +
      '<div class="page-head"><h1>' + (term ? "Kết quả cho “" + esc(term) + "”" : "Tìm sản phẩm") + '</h1><span class="muted">' + list.length + " sản phẩm</span></div>" +
      '<div class="chips" style="margin:16px 0 20px">' + GROUPS.map(function (g) { return '<a class="chip" href="' + link("danh-muc/" + g.slug) + '">' + g.name + "</a>"; }).join("") + "</div>" +
      (list.length ? grid(list, 4) : '<div class="empty-state">' + ic("search") + "<h3>Chưa thấy sản phẩm phù hợp</h3><p class=\"muted\">Chị thử gõ tên ngắn hơn hoặc tên thương hiệu (ví dụ: Kirkland, Omega 3).</p><button class=\"btn btn-primary\" type=\"button\" data-order=\"\">" + ic("zalo") + "Không thấy? Nhắn shop tìm giúp</button></div>") +
      '</div><div style="height:var(--sec)"></div>';
    return { title: "Tìm kiếm – Hàng Mỹ Chuẩn", html: html };
  }

  function pageProduct(slug) {
    var p = BY_SLUG[slug];
    if (!p) return pageNotFound();
    var g = groupOf(p.group);
    var sub = (SUBS[p.group] || []).filter(function (s) { return s.slug === p.sub; })[0];
    var related = P.filter(function (x) { return x !== p && x.group === p.group && (!p.sub || x.sub === p.sub); });
    if (related.length < 4) related = related.concat(P.filter(function (x) { return x !== p && x.group === p.group && related.indexOf(x) < 0; }));
    related = related.slice(0, 4);
    var html = '<div class="container"><nav class="crumb" aria-label="Đường dẫn"><a href="#/">Trang chủ</a> › <a href="' + link("danh-muc/" + p.group) + '">' + (g ? g.full : "") + "</a>" +
      (sub ? ' › <a href="' + link("danh-muc/" + p.group + "?nhom=" + sub.slug) + '">' + sub.name + "</a>" : "") + "</nav>" +
      '<div class="pd"><div class="pd-img" data-zoom role="button" tabindex="0" aria-label="Phóng to ảnh">' + (p.off ? '<span class="badge">-' + p.off + "%</span>" : "") +
      '<img src="' + p.img + '" alt="' + esc((p.brand ? p.brand + " " : "") + p.name) + '" width="640" height="640"></div>' +
      '<div class="pd-info">' + (p.brand ? '<a class="pd-brand label" href="' + link("tim-kiem?q=" + encodeURIComponent(p.brand)) + '">' + esc(p.brand) + "</a>" : "") +
      "<h1>" + esc(p.name) + "</h1>" +
      '<div class="pd-price"><span class="price' + (p.off ? " sale" : "") + '">' + vnd(p.price) + "</span>" + (p.off ? '<span class="old">' + vnd(p.old) + "</span>" : "") + "</div>" +
      (p.off ? '<div class="save">-' + p.off + "% · Tiết kiệm " + vnd(p.old - p.price) + "</div>" : "") +
      '<div class="pd-cta"><button class="btn btn-primary" type="button" data-order="' + p.slug + '">' + ic("zalo") + "Đặt qua Zalo</button>" +
      '<a class="btn btn-outline" href="' + CONTACT.tel + '">' + ic("phone") + "Gọi " + CONTACT.phone + "</a></div>" +
      '<p class="pd-stock">' + ic("box") + (p.stock ? "<strong>Có sẵn tại cửa hàng – giao ngay</strong>" + (p.one ? " · shop chỉ có 1 chiếc" : "") : "<strong>Hàng order</strong> – shop báo thời gian hàng về khi chốt đơn") + "</p>" +
      giftBox(p) +
      productInfo(p) +
      "</div></div>" +
      (related.length ? '<section style="padding-bottom:var(--sec)"><div class="section-head"><h2>Có thể bạn quan tâm</h2></div><div class="rail">' + related.map(function (x) { return card(x); }).join("") + "</div></section>" : "") +
      "</div>";
    return { title: p.name + " – Hàng Mỹ Chuẩn", html: html, active: p.group, product: p };
  }

  // Nội dung chi tiết (nỗi lo – công dụng – liều dùng) lấy từ data/info.js, tra theo nhãn thật
  var INFO = window.HMC_INFO || {};
  // Quà tặng: món có gift=true (đối thủ bán dưới giá niêm yết) được tặng kèm 1 tub sủi
  var GIFT_ID = "multinutri-orange";
  var GIFT_NAME = "1 tub viên sủi Multinutri Orange 20 viên trị giá 49.900đ";
  function giftBox(p) {
    if (!p.gift) return "";
    return '<a class="pd-gift" href="' + link("san-pham/" + GIFT_ID) + '">' + ic("gift") +
      "<span><strong>Quà tặng kèm</strong>Tặng " + GIFT_NAME + " khi mua sản phẩm này.</span></a>";
  }
  function productInfo(p) {
    var f = INFO[p.id];
    var tpcn = p.group === "vitamin-tpcn" ? '<p class="pd-tpcn">' + TPCN_NOTE + "</p>" : "";
    if (!f) {
      return '<div class="pd-block"><h3>Thông tin sản phẩm</h3><p>Thành phần, cách dùng và hạn sử dụng của lô hàng hiện có, chị nhắn Zalo để shop gửi ảnh nhãn thật và tư vấn cụ thể.</p></div>' + tpcn;
    }
    function list(items, cls, icon) {
      return '<ul class="' + cls + '">' + items.map(function (t) { return "<li>" + ic(icon) + "<span>" + esc(t) + "</span></li>"; }).join("") + "</ul>";
    }
    var fashion = p.group === "thoi-trang";
    return (f.noi_dau && f.noi_dau.length ? '<div class="pd-block pd-pain"><h3>' + (fashion ? "Chị đang băn khoăn?" : "Bạn có đang gặp?") + "</h3>" + list(f.noi_dau, "pain-list", "dot") + "</div>" : "") +
      (f.cong_dung && f.cong_dung.length ? '<div class="pd-block"><h3>' + (fashion ? "Điểm nổi bật" : "Công dụng chính") + "</h3>" + list(f.cong_dung, "use-list", "check") + "</div>" : "") +
      (f.thanh_phan_chinh ? '<p class="pd-line"><strong>Thành phần chính:</strong> ' + esc(f.thanh_phan_chinh) + "</p>" : "") +
      (f.lieu_dung ? '<div class="pd-dose"><strong>' + (fashion ? "Cách dùng & bảo quản" : "Liều dùng") + "</strong><p>" + esc(f.lieu_dung) + "</p></div>" : "") +
      (f.luu_y && f.luu_y.length ? '<div class="pd-warn"><strong>Lưu ý</strong>' + list(f.luu_y, "warn-list", "dot") + "</div>" : "") +
      tpcn;
  }

  function pageAffiliate(q) {
    var ref = cleanRef(q.get("ref"));
    if (ref) saveRef(ref);
    ref = ref || activeRef();
    var theThao = OLD.filter(function (p) { return p.id.indexOf("g2-") === 0; });
    var featured = theThao.filter(function (p) { return p.price; }).slice(0, 8);
    var refNote = ref
      ? '<div class="aff-ref-live">' + ic("check") + '<span>Đang ghi nhận đơn qua mã đại lý <strong>' + esc(ref) + '</strong></span></div>'
      : '';
    var html = '<section class="aff-hero"><div class="container"><div class="aff-hero-grid"><div>' +
      '<span class="eyebrow label">Đồng hành cùng Hàng Mỹ Chuẩn</span><h1>Trang bán hàng dành cho đại lý & affiliate</h1>' +
      '<p class="lead">Không cần tự làm website. Đại lý dùng chính trang này để giới thiệu sản phẩm; khi khách đặt qua Zalo, mã giới thiệu được gửi kèm để đối soát.</p>' + refNote +
      '<div class="hero-cta"><a class="btn btn-primary" href="' + AFF.formUrl + '" target="_blank" rel="noopener">Đăng ký làm đại lý ' + ic("arrow") + '</a>' +
      '<a class="btn btn-outline" href="#aff-link">Tạo link giới thiệu</a></div></div>' +
      '<div class="aff-card on-dark"><span>Chính sách Thế Thảo Pharma</span><strong>8%</strong><p>Hoa hồng nhóm A</p><hr><strong>5%</strong><p>Hoa hồng nhóm B</p></div>' +
      '</div></div></section>' +
      '<section class="section"><div class="container"><div class="section-head"><div><h2>Chính sách rõ ràng, dễ đối soát</h2><p class="muted">Áp dụng theo nhóm đại lý được Hàng Mỹ Chuẩn phê duyệt.</p></div></div>' +
      '<div class="policy-grid"><article><span class="policy-tag">NHÓM A</span><h3>Hoa hồng 8%</h3><p>Áp dụng cho hàng Thế Thảo Pharma, tính trên giá bán lẻ thực thu của đơn đủ điều kiện.</p></article>' +
      '<article><span class="policy-tag b">NHÓM B</span><h3>Hoa hồng 5%</h3><p>Áp dụng cho hàng Thế Thảo Pharma, tính trên giá bán lẻ thực thu của đơn đủ điều kiện.</p></article>' +
      '<article><span class="policy-tag import">HÀNG NHẬP</span><h3>Giá giao = giá nhập × 1,20</h3><p>Hàng Mỹ/Canada do Bảo Nga nhập trực tiếp từ Walmart hoặc Costco. Chưa gồm VAT và phí vận chuyển.</p></article></div></div></section>' +
      '<section class="section bg-cream" id="aff-link"><div class="container"><div class="aff-link-box"><div><span class="eyebrow label">Công cụ cho đại lý</span><h2>Tạo link giới thiệu riêng</h2><p>Nhập đúng mã đã được cấp. Khách mở link rồi đặt hàng, tin nhắn Zalo sẽ tự kèm mã của đại lý.</p></div>' +
      '<div class="aff-link-form"><label for="aff-code">Mã đại lý/affiliate</label><div class="row"><input id="aff-code" type="text" maxlength="24" autocomplete="off" placeholder="Ví dụ: DL001" value="' + esc(ref) + '"><button class="btn btn-primary" type="button" data-aff-copy>Tạo & chép link</button></div><output id="aff-link-result">' + (ref ? esc(location.origin + location.pathname + '#/dai-ly?ref=' + ref) : 'Link giới thiệu sẽ hiện ở đây') + '</output><small>Chỉ dùng mã đã được Hàng Mỹ Chuẩn phê duyệt.</small></div>' +
      '</div></div></section>' +
      '<section class="section"><div class="container"><div class="section-head"><div><h2>Sản phẩm Thế Thảo nổi bật</h2><p class="muted">Khách xem giá bán lẻ và đặt trực tiếp qua Zalo.</p></div><a href="' + link('tat-ca') + '">Xem toàn bộ sản phẩm →</a></div>' + grid(featured, 4) + '</div></section>' +
      '<section class="section bg-navy50"><div class="container"><div class="steps-aff"><div><b>1</b><h3>Đăng ký</h3><p>Điền biểu mẫu, đội ngũ liên hệ xác minh.</p></div><div><b>2</b><h3>Nhận mã</h3><p>Được duyệt nhóm A hoặc B và cấp mã riêng.</p></div><div><b>3</b><h3>Chia sẻ & nhận hoa hồng</h3><p>Gửi link cho khách, theo dõi đơn và đối soát.</p></div></div><p class="aff-manager-link"><a href="' + link('quan-ly') + '">Dành cho quản lý →</a></p></div></section>';
    return { title: "Chương trình đại lý – Hàng Mỹ Chuẩn", html: html, active: "dai-ly" };
  }

  function pageDashboard() {
    var theThao = OLD.filter(function (p) { return p.id.indexOf("g2-") === 0; });
    var imported = STOCK.filter(function (p) { return ["multinutri-orange", "lv-belt-damier", "lv-wallet-damier"].indexOf(p.id) < 0; });
    var rows = theThao.map(function (p) {
      return '<tr data-manage-row="' + esc(norm(p.name + ' ' + p.brand)) + '"><td><strong>' + esc(p.name) + '</strong><small>' + esc(p.brand || 'Chính hãng') + '</small></td><td>' + vnd(p.price) + '</td><td>' + (p.price ? vnd(Math.round(p.price * (AFF.groupA || .08))) : '—') + '</td><td>' + (p.price ? vnd(Math.round(p.price * (AFF.groupB || .05))) : '—') + '</td></tr>';
    }).join("");
    var html = '<div class="container manage"><nav class="crumb" aria-label="Đường dẫn"><a href="#/">Trang chủ</a> › Quản lý đại lý</nav>' +
      '<div class="manage-head"><div><span class="eyebrow label">Dashboard vận hành</span><h1>Quản lý đại lý & affiliate</h1><p>Tra chính sách, tính giá giao, kiểm tra hoa hồng và mở dữ liệu đăng ký tại một nơi.</p></div><a class="btn btn-primary" href="' + AFF.sheetUrl + '" target="_blank" rel="noopener">Mở Google Sheet quản lý ' + ic("arrow") + '</a></div>' +
      '<div class="metric-grid"><article><span>Tổng sản phẩm</span><strong>' + P.length + '</strong></article><article><span>Hàng Thế Thảo</span><strong>' + theThao.length + '</strong></article><article><span>Hàng nhập đang quản lý</span><strong>' + imported.length + '</strong></article><article><span>Nhóm hoa hồng</span><strong>A · B</strong></article></div>' +
      '<section class="manage-section"><div class="section-head"><div><h2>Công cụ tính nhanh</h2><p class="muted">Kết quả chỉ là phép tính theo chính sách; giá nhập phải dùng số thực tế đã xác nhận.</p></div></div>' +
      '<div class="calc-grid"><article class="calc-card"><h3>Giá giao hàng nhập trực tiếp</h3><label for="import-cost">Tổng giá nhập thực tế</label><input id="import-cost" data-calc-import type="number" min="0" step="1000" inputmode="numeric" placeholder="Nhập số tiền"><div class="calc-result"><span>Giá giao đại lý</span><output id="import-result">0đ</output></div><p>Giá nhập × 1,20. Chưa bao gồm VAT và phí ship.</p></article>' +
      '<article class="calc-card"><h3>Hoa hồng Thế Thảo</h3><label for="commission-price">Giá bán lẻ thực thu</label><input id="commission-price" data-calc-commission type="number" min="0" step="1000" inputmode="numeric" placeholder="Nhập giá bán"><label for="commission-group">Nhóm đại lý</label><select id="commission-group" data-calc-commission><option value="0.08">Nhóm A – 8%</option><option value="0.05">Nhóm B – 5%</option></select><div class="calc-result"><span>Hoa hồng dự kiến</span><output id="commission-result">0đ</output></div></article></div></section>' +
      '<section class="manage-section"><div class="section-head"><div><h2>Bảng hoa hồng Thế Thảo Pharma</h2><p class="muted">Tính theo giá bán lẻ đang hiển thị trên website.</p></div><label class="manage-search"><span class="sr-only">Tìm sản phẩm</span><input type="search" data-manage-search placeholder="Tìm tên hoặc thương hiệu…"></label></div>' +
      '<div class="manage-table-wrap"><table class="manage-table"><thead><tr><th>Sản phẩm</th><th>Giá bán lẻ</th><th>Nhóm A · 8%</th><th>Nhóm B · 5%</th></tr></thead><tbody>' + rows + '</tbody></table></div></section>' +
      '<div class="manage-note"><strong>Nguyên tắc dữ liệu:</strong> thông tin cá nhân người đăng ký chỉ nằm trong Google Sheet riêng. Dashboard công khai này không tải hoặc hiển thị dữ liệu cá nhân.</div></div>';
    return { title: "Dashboard đại lý – Hàng Mỹ Chuẩn", html: html };
  }

  function updateManageCalculators() {
    var cost = $("#import-cost"), importOut = $("#import-result");
    if (cost && importOut) importOut.textContent = cost.value ? vnd(Math.round(Number(cost.value) * (1 + (AFF.importMarkup || .20)))) : "0đ";
    var price = $("#commission-price"), group = $("#commission-group"), commissionOut = $("#commission-result");
    if (price && group && commissionOut) commissionOut.textContent = price.value ? vnd(Math.round(Number(price.value) * Number(group.value || 0))) : "0đ";
  }

  function pageAbout() {
    var html = '<div class="container"><nav class="crumb" aria-label="Đường dẫn"><a href="#/">Trang chủ</a> › Giới thiệu</nav>' +
      '<div class="page-head"><h1>Về Hàng Mỹ Chuẩn</h1><p>Hàng Mỹ Chuẩn — Đặt là có. Tận tâm với mọi đơn hàng.</p></div>' +
      '<section class="section prose"><p>Hàng Mỹ Chuẩn ra đời từ một mong muốn đơn giản: để mỗi gia đình Việt mua được hàng nhập chính hãng mà không phải lo thật hay giả.</p>' +
      "<p>Shop mang về vitamin, thực phẩm chức năng, đồ làm đẹp, thực phẩm, thời trang và đồ mẹ bé từ Mỹ, Canada, Nhật, Hàn. Mỗi món đều được chọn như chọn cho người nhà mình dùng.</p>" +
      "<p>Shop không chạy theo số lượng. Điều shop muốn là khách hiểu rõ sản phẩm, mua đúng thứ mình cần và muốn quay lại lần sau.</p></section>" +
      '<h2>3 nguyên tắc làm việc</h2><div class="principles" style="margin-bottom:var(--sec)">' + [
        ["01", "Thật từ nguồn hàng", "Chỉ bán hàng chính hãng, nguồn gốc rõ ràng, khách hỏi là có câu trả lời."],
        ["02", "Tư vấn trước, bán sau", "Hiểu nhu cầu của khách trước, không hợp thì nói thẳng là không hợp."],
        ["03", "Tận tâm với mọi đơn hàng", "Đơn lớn hay nhỏ cũng được chuẩn bị cẩn thận và theo dõi đến khi khách nhận."]
      ].map(function (x) { return '<div class="principle"><div class="n">' + x[0] + "</div><h3>" + x[1] + "</h3><p>" + x[2] + "</p></div>"; }).join("") + "</div></div>" +
      commitBar() +
      '<section class="section"><div class="container"><h2>Liên hệ</h2><ul class="contact-list">' +
      '<li><a href="' + CONTACT.tel + '">' + ic("phone") + "Gọi " + CONTACT.phone + "</a></li>" +
      '<li><a href="' + CONTACT.zalo + '" target="_blank" rel="noopener">' + ic("zalo") + "Zalo " + CONTACT.phone + "</a></li>" +
      '<li><a href="' + CONTACT.zaloGroup + '" target="_blank" rel="noopener">' + ic("users") + "Nhóm Zalo cộng đồng</a></li>" +
      '<li><a href="' + CONTACT.fanpage + '" target="_blank" rel="noopener">' + ic("fb") + "Fanpage Facebook</a></li>" +
      '<li><a href="' + CONTACT.tiktok + '" target="_blank" rel="noopener">' + ic("tiktok") + "TikTok @hangmychuan.1</a></li>" +
      '<li><a href="' + CONTACT.messenger + '" target="_blank" rel="noopener">' + ic("msg") + "Nhắn Messenger</a></li>" +
      "</ul></div></section>" + ctaBlock();
    return { title: "Giới thiệu – Hàng Mỹ Chuẩn", html: html, active: "gioi-thieu" };
  }

  function pageNotFound() {
    return { title: "Không tìm thấy – Hàng Mỹ Chuẩn", html: '<div class="container" style="padding:var(--sec) var(--gut)">' + emptyState("Không tìm thấy trang này") + '<p style="text-align:center;margin-top:20px"><a href="#/">Về trang chủ</a></p></div>' };
  }

  /* ---------- Router ---------- */
  var current = null;
  function route() {
    var h = location.hash.replace(/^#\/?/, "");
    var qi = h.indexOf("?");
    var path = qi >= 0 ? h.slice(0, qi) : h;
    var q = new URLSearchParams(qi >= 0 ? h.slice(qi + 1) : "");
    var parts = path.split("/").filter(Boolean).map(decodeURIComponent);
    var incomingRef = cleanRef(q.get("ref"));
    if (incomingRef) saveRef(incomingRef);
    var page;
    if (!parts.length) page = pageHome();
    else if (parts[0] === "danh-muc" && parts[1]) page = pageCategory(parts[1], q);
    else if (parts[0] === "san-pham" && parts[1]) page = pageProduct(parts[1]);
    else if (parts[0] === "tim-kiem") page = pageSearch(q);
    else if (parts[0] === "dai-ly") page = pageAffiliate(q);
    else if (parts[0] === "quan-ly") page = pageDashboard();
    else if (parts[0] === "gioi-thieu") page = pageAbout();
    else if (parts[0] === "giam-gia" || parts[0] === "tat-ca" || parts[0] === "co-san") page = pageFlat(parts[0], q);
    else page = pageNotFound();

    var samePath = current && current.path === path && keepScroll;
    var y = window.scrollY;
    current = { path: path, page: page };
    $("#main").innerHTML = page.html;
    document.title = page.title;
    $(".bb-zalo").setAttribute("data-order", page.product ? page.product.slug : "");
    document.querySelectorAll(".catnav a").forEach(function (a) {
      var on = a.getAttribute("data-nav") === (page.active || (parts.length ? "" : "home"));
      a.classList.toggle("active", on);
      if (on) a.setAttribute("aria-current", "page"); else a.removeAttribute("aria-current");
    });
    $("#q-desk").value = $("#q-mob").value = parts[0] === "tim-kiem" ? q.get("q") || "" : "";
    window.scrollTo(0, samePath ? y : 0);
    keepScroll = false;
    if (!samePath) { var h1 = $("#main h1"); if (h1 && location.hash) { h1.setAttribute("tabindex", "-1"); h1.focus({ preventScroll: true }); } }
    closeSuggest();
  }
  var keepScroll = false;

  /* ---------- Tìm kiếm + gợi ý ---------- */
  var sugIdx = -1;
  function closeSuggest() { document.querySelectorAll(".suggest").forEach(function (s) { s.remove(); }); sugIdx = -1; }
  function bindSearch(form) {
    var input = form.querySelector("input");
    var t;
    form.addEventListener("submit", function (e) {
      e.preventDefault();
      var active = form.querySelector(".suggest a.active");
      if (active) { location.hash = active.getAttribute("href"); return; }
      var v = input.value.trim();
      if (v) location.hash = link("tim-kiem?q=" + encodeURIComponent(v));
      input.blur();
    });
    input.addEventListener("input", function () {
      clearTimeout(t);
      t = setTimeout(function () {
        closeSuggest();
        var v = input.value.trim();
        if (v.length < 2) return;
        var res = searchList(v);
        var box = document.createElement("div");
        box.className = "suggest"; box.setAttribute("role", "listbox");
        box.innerHTML = res.slice(0, 6).map(function (p) {
          return '<a role="option" href="' + link("san-pham/" + p.slug) + '"><img src="' + p.img + '" alt=""><span class="s-name">' + esc(p.name) + '</span><span class="s-price">' + vnd(p.price) + "</span></a>";
        }).join("") + '<a class="s-all" href="' + link("tim-kiem?q=" + encodeURIComponent(v)) + '">' + (res.length ? "Xem tất cả " + res.length + " kết quả cho “" + esc(v) + "”" : "Không thấy? Xem gợi ý tìm kiếm") + "</a>";
        form.appendChild(box);
      }, 150);
    });
    input.addEventListener("keydown", function (e) {
      var items = form.querySelectorAll(".suggest a");
      if (!items.length) return;
      if (e.key === "ArrowDown" || e.key === "ArrowUp") {
        e.preventDefault();
        sugIdx = (sugIdx + (e.key === "ArrowDown" ? 1 : -1) + items.length) % items.length;
        items.forEach(function (a, i) { a.classList.toggle("active", i === sugIdx); });
      } else if (e.key === "Escape") closeSuggest();
    });
    input.addEventListener("focus", function () { document.body.classList.add("kb-open"); });
    input.addEventListener("blur", function () { setTimeout(function () { document.body.classList.remove("kb-open"); if (!form.contains(document.activeElement)) closeSuggest(); }, 200); });
  }

  /* ---------- Khởi động ---------- */
  function initChrome() {
    $("#catnav").innerHTML = GROUPS.map(function (g) { return '<li><a data-nav="' + g.slug + '" href="' + link("danh-muc/" + g.slug) + '">' + g.name + "</a></li>"; }).join("") +
      '<li><a class="instock" data-nav="co-san" href="' + link("co-san") + '">Hàng có sẵn</a></li>' +
      '<li><a class="sale" data-nav="giam-gia" href="' + link("giam-gia") + '">Đang giảm giá</a></li><li><a data-nav="dai-ly" href="' + link("dai-ly") + '">Đại lý</a></li><li><a data-nav="gioi-thieu" href="' + link("gioi-thieu") + '">Giới thiệu</a></li>';
    $("#ftr-cats").innerHTML = GROUPS.map(function (g) { return '<li><a href="' + link("danh-muc/" + g.slug) + '">' + g.full + "</a></li>"; }).join("") + '<li><a href="' + link("giam-gia") + '">Đang giảm giá</a></li>';
    document.querySelectorAll("[data-ic]").forEach(function (el) { el.insertAdjacentHTML("afterbegin", ic(el.getAttribute("data-ic"))); });
    $("#year").textContent = new Date().getFullYear();
    document.querySelectorAll("form.search").forEach(bindSearch);

    document.addEventListener("click", function (e) {
      var o = e.target.closest("[data-order]");
      if (o) { e.preventDefault(); orderZalo(BY_SLUG[o.getAttribute("data-order")]); return; }
      var c = e.target.closest("[data-copy]");
      if (c) { copyText(c.getAttribute("data-copy")).then(function () { toast("Đã chép số tài khoản"); }); return; }
      var aff = e.target.closest("[data-aff-copy]");
      if (aff) {
        var input = $("#aff-code"), code = cleanRef(input && input.value);
        if (!code) { toast("Chị nhập mã đại lý đã được cấp"); if (input) input.focus(); return; }
        saveRef(code);
        var url = location.origin + location.pathname + "#/dai-ly?ref=" + encodeURIComponent(code);
        $("#aff-link-result").textContent = url;
        copyText(url).then(function () { toast("Đã tạo và chép link giới thiệu"); });
        return;
      }
      var z = e.target.closest("[data-zoom]");
      if (z) { openZoom(z.querySelector("img").src); return; }
      if (e.target.closest("[data-keep-scroll]")) keepScroll = true;
      if (!e.target.closest(".search")) closeSuggest();
    });
    document.addEventListener("keydown", function (e) {
      if ((e.key === "Enter" || e.key === " ") && e.target.matches("[data-zoom]")) { e.preventDefault(); openZoom(e.target.querySelector("img").src); }
    });
    document.addEventListener("change", function (e) {
      if (e.target.matches("[data-calc-commission]")) { updateManageCalculators(); return; }
      if (!e.target.matches("[data-sort]")) return;
      var h = location.hash.replace(/^#\/?/, ""), qi = h.indexOf("?");
      var path = qi >= 0 ? h.slice(0, qi) : h;
      var q = new URLSearchParams(qi >= 0 ? h.slice(qi + 1) : "");
      if (e.target.value) q.set("sx", e.target.value); else q.delete("sx");
      q.delete("xem");
      keepScroll = true;
      location.hash = "#/" + path + (q.toString() ? "?" + q : "");
    });
    document.addEventListener("input", function (e) {
      if (e.target.matches("[data-calc-import],[data-calc-commission]")) updateManageCalculators();
      if (e.target.matches("[data-manage-search]")) {
        var term = norm(e.target.value).trim();
        document.querySelectorAll("[data-manage-row]").forEach(function (row) { row.hidden = term && row.getAttribute("data-manage-row").indexOf(term) < 0; });
      }
    });
    var hdr = $(".hdr");
    function onScroll() {
      hdr.classList.toggle("scrolled", window.scrollY > 40);
      document.documentElement.style.setProperty("--hdr-h", hdr.offsetHeight + "px");
    }
    window.addEventListener("scroll", onScroll, { passive: true });
    window.addEventListener("resize", onScroll);
    onScroll();
    window.addEventListener("hashchange", route);
    route();
  }
  function openZoom(src) {
    var lb = document.createElement("div");
    lb.className = "lightbox"; lb.setAttribute("role", "dialog"); lb.setAttribute("aria-label", "Ảnh phóng to");
    lb.innerHTML = '<img src="' + src + '" alt=""><button type="button" aria-label="Đóng">×</button>';
    function close() { lb.remove(); document.removeEventListener("keydown", onKey); }
    function onKey(e) { if (e.key === "Escape") close(); }
    lb.addEventListener("click", close);
    document.addEventListener("keydown", onKey);
    document.body.appendChild(lb);
    lb.querySelector("button").focus();
  }

  if (document.readyState === "loading") document.addEventListener("DOMContentLoaded", initChrome); else initChrome();
})();
