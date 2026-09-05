import type { CategoryType, JarCode, NecessityLevel } from "./enums";

export type DefaultCategory = {
  type: CategoryType;
  name: string;
  group: string;
  defaultJar?: JarCode;
  defaultNecessity?: NecessityLevel;
  icon?: string;
};

// Danh mục khởi tạo sẵn cho mỗi gia đình mới — có thể thêm/sửa/ẩn sau khi tạo (Cài đặt > Danh mục).
export const DEFAULT_CATEGORIES: DefaultCategory[] = [
  // ===== THU NHẬP =====
  { type: "INCOME", name: "Lương", group: "Thu nhập từ công việc", icon: "Briefcase" },
  { type: "INCOME", name: "Thưởng", group: "Thu nhập từ công việc", icon: "Gift" },
  { type: "INCOME", name: "Phụ cấp", group: "Thu nhập từ công việc", icon: "Briefcase" },
  { type: "INCOME", name: "Hoa hồng", group: "Thu nhập từ công việc", icon: "Briefcase" },
  { type: "INCOME", name: "Tiền làm thêm", group: "Thu nhập từ công việc", icon: "Briefcase" },
  { type: "INCOME", name: "Bán hàng online", group: "Thu nhập kinh doanh cá nhân", icon: "Store" },
  { type: "INCOME", name: "Tư vấn / Đào tạo", group: "Thu nhập kinh doanh cá nhân", icon: "Store" },
  { type: "INCOME", name: "Sản phẩm số / Cộng tác", group: "Thu nhập kinh doanh cá nhân", icon: "Store" },
  { type: "INCOME", name: "Lãi tiền gửi", group: "Thu nhập đầu tư", icon: "TrendingUp" },
  { type: "INCOME", name: "Cổ tức / Lãi đầu tư", group: "Thu nhập đầu tư", icon: "TrendingUp" },
  { type: "INCOME", name: "Thu nhập cho thuê", group: "Thu nhập đầu tư", icon: "TrendingUp" },
  { type: "INCOME", name: "Vợ/chồng đóng góp", group: "Thu nhập gia đình", icon: "Users" },
  { type: "INCOME", name: "Người thân hỗ trợ", group: "Thu nhập gia đình", icon: "Users" },
  { type: "INCOME", name: "Quà tặng / Tiền mừng", group: "Thu nhập khác", icon: "Gift" },
  { type: "INCOME", name: "Thu hồi công nợ", group: "Thu nhập khác", icon: "Gift" },
  { type: "INCOME", name: "Trúng thưởng / Thu nhập khác", group: "Thu nhập khác", icon: "Gift" },

  // ===== CHI TIÊU: NHÀ Ở (NEC) =====
  { type: "EXPENSE", name: "Thuê nhà / Trả góp nhà", group: "Nhà ở", defaultJar: "NEC", defaultNecessity: "BAT_BUOC", icon: "Home" },
  { type: "EXPENSE", name: "Phí chung cư / vệ sinh", group: "Nhà ở", defaultJar: "NEC", defaultNecessity: "CAN_THIET", icon: "Home" },
  { type: "EXPENSE", name: "Tiền điện", group: "Nhà ở", defaultJar: "NEC", defaultNecessity: "BAT_BUOC", icon: "Zap" },
  { type: "EXPENSE", name: "Tiền nước", group: "Nhà ở", defaultJar: "NEC", defaultNecessity: "BAT_BUOC", icon: "Droplet" },
  { type: "EXPENSE", name: "Tiền gas", group: "Nhà ở", defaultJar: "NEC", defaultNecessity: "BAT_BUOC", icon: "Flame" },
  { type: "EXPENSE", name: "Internet / Truyền hình", group: "Nhà ở", defaultJar: "NEC", defaultNecessity: "CAN_THIET", icon: "Wifi" },
  { type: "EXPENSE", name: "Sửa chữa / Nội thất / Đồ gia dụng", group: "Nhà ở", defaultJar: "NEC", defaultNecessity: "CO_THE_CAT_GIAM", icon: "Hammer" },
  { type: "EXPENSE", name: "Người giúp việc", group: "Nhà ở", defaultJar: "NEC", defaultNecessity: "CO_THE_CAT_GIAM", icon: "Home" },

  // ===== ĂN UỐNG =====
  { type: "EXPENSE", name: "Đi chợ / Siêu thị / Thực phẩm", group: "Ăn uống", defaultJar: "NEC", defaultNecessity: "BAT_BUOC", icon: "ShoppingCart" },
  { type: "EXPENSE", name: "Ăn sáng / Cà phê", group: "Ăn uống", defaultJar: "NEC", defaultNecessity: "CAN_THIET", icon: "Coffee" },
  { type: "EXPENSE", name: "Đồ ăn đặt ngoài", group: "Ăn uống", defaultJar: "PLAY", defaultNecessity: "CO_THE_CAT_GIAM", icon: "UtensilsCrossed" },
  { type: "EXPENSE", name: "Ăn nhà hàng", group: "Ăn uống", defaultJar: "PLAY", defaultNecessity: "CO_THE_CAT_GIAM", icon: "UtensilsCrossed" },
  { type: "EXPENSE", name: "Tiệc gia đình", group: "Ăn uống", defaultJar: "PLAY", defaultNecessity: "CO_THE_CAT_GIAM", icon: "UtensilsCrossed" },

  // ===== CON CÁI =====
  { type: "EXPENSE", name: "Học phí", group: "Con cái", defaultJar: "NEC", defaultNecessity: "BAT_BUOC", icon: "GraduationCap" },
  { type: "EXPENSE", name: "Học thêm / Năng khiếu", group: "Con cái", defaultJar: "EDU", defaultNecessity: "CAN_THIET", icon: "GraduationCap" },
  { type: "EXPENSE", name: "Ăn bán trú / Xe đưa đón", group: "Con cái", defaultJar: "NEC", defaultNecessity: "BAT_BUOC", icon: "Bus" },
  { type: "EXPENSE", name: "Sách vở / Đồ dùng / Đồng phục", group: "Con cái", defaultJar: "NEC", defaultNecessity: "CAN_THIET", icon: "BookOpen" },
  { type: "EXPENSE", name: "Quần áo / Giày dép cho con", group: "Con cái", defaultJar: "NEC", defaultNecessity: "CAN_THIET", icon: "Shirt" },
  { type: "EXPENSE", name: "Tiền tiêu vặt cho con", group: "Con cái", defaultJar: "PLAY", defaultNecessity: "CO_THE_CAT_GIAM", icon: "Wallet" },
  { type: "EXPENSE", name: "Khám bệnh / Thuốc cho con", group: "Con cái", defaultJar: "NEC", defaultNecessity: "BAT_BUOC", icon: "Stethoscope" },
  { type: "EXPENSE", name: "Du lịch / Vui chơi cho con", group: "Con cái", defaultJar: "PLAY", defaultNecessity: "CO_THE_CAT_GIAM", icon: "Plane" },
  { type: "EXPENSE", name: "Sinh nhật / Quà tặng con", group: "Con cái", defaultJar: "PLAY", defaultNecessity: "CO_THE_CAT_GIAM", icon: "Gift" },
  { type: "EXPENSE", name: "Quỹ học đại học / lập nghiệp", group: "Con cái", defaultJar: "LTSS", defaultNecessity: "CAN_THIET", icon: "PiggyBank" },

  // ===== SỨC KHỎE =====
  { type: "EXPENSE", name: "Khám bệnh / Thuốc", group: "Sức khỏe", defaultJar: "NEC", defaultNecessity: "BAT_BUOC", icon: "Stethoscope" },
  { type: "EXPENSE", name: "Nha khoa / Kính mắt", group: "Sức khỏe", defaultJar: "NEC", defaultNecessity: "CAN_THIET", icon: "Stethoscope" },
  { type: "EXPENSE", name: "Bảo hiểm y tế / sức khỏe", group: "Sức khỏe", defaultJar: "NEC", defaultNecessity: "BAT_BUOC", icon: "ShieldCheck" },
  { type: "EXPENSE", name: "Tập thể dục / Phòng tập / Yoga", group: "Sức khỏe", defaultJar: "PLAY", defaultNecessity: "CO_THE_CAT_GIAM", icon: "Dumbbell" },

  // ===== ĐI LẠI & PHƯƠNG TIỆN =====
  { type: "EXPENSE", name: "Xăng xe", group: "Đi lại và phương tiện", defaultJar: "NEC", defaultNecessity: "BAT_BUOC", icon: "Fuel" },
  { type: "EXPENSE", name: "Gửi xe / Taxi / Xe công nghệ", group: "Đi lại và phương tiện", defaultJar: "NEC", defaultNecessity: "CAN_THIET", icon: "Car" },
  { type: "EXPENSE", name: "Sửa xe / Bảo dưỡng / Đăng kiểm", group: "Đi lại và phương tiện", defaultJar: "NEC", defaultNecessity: "CAN_THIET", icon: "Wrench" },
  { type: "EXPENSE", name: "Bảo hiểm xe", group: "Đi lại và phương tiện", defaultJar: "NEC", defaultNecessity: "BAT_BUOC", icon: "ShieldCheck" },
  { type: "EXPENSE", name: "Trả góp xe", group: "Đi lại và phương tiện", defaultJar: "NEC", defaultNecessity: "BAT_BUOC", icon: "Car" },
  { type: "EXPENSE", name: "Vé máy bay / tàu (du lịch)", group: "Đi lại và phương tiện", defaultJar: "PLAY", defaultNecessity: "CO_THE_CAT_GIAM", icon: "Plane" },

  // ===== CHI TIÊU CÁ NHÂN VỢ =====
  { type: "EXPENSE", name: "Quần áo / Giày dép (vợ)", group: "Chi tiêu cá nhân của vợ", defaultJar: "PLAY", defaultNecessity: "CO_THE_CAT_GIAM", icon: "Shirt" },
  { type: "EXPENSE", name: "Mỹ phẩm / Chăm sóc da / Spa", group: "Chi tiêu cá nhân của vợ", defaultJar: "PLAY", defaultNecessity: "CO_THE_CAT_GIAM", icon: "Sparkles" },
  { type: "EXPENSE", name: "Phụ kiện / Nước hoa", group: "Chi tiêu cá nhân của vợ", defaultJar: "PLAY", defaultNecessity: "KHONG_CAN_THIET", icon: "Sparkles" },

  // ===== CHI TIÊU CÁ NHÂN CHỒNG =====
  { type: "EXPENSE", name: "Ăn uống / Cà phê cá nhân (chồng)", group: "Chi tiêu cá nhân của chồng", defaultJar: "PLAY", defaultNecessity: "CAN_THIET", icon: "Coffee" },
  { type: "EXPENSE", name: "Điện thoại / Công việc", group: "Chi tiêu cá nhân của chồng", defaultJar: "NEC", defaultNecessity: "CAN_THIET", icon: "Smartphone" },
  { type: "EXPENSE", name: "Quần áo / Giày dép (chồng)", group: "Chi tiêu cá nhân của chồng", defaultJar: "PLAY", defaultNecessity: "CO_THE_CAT_GIAM", icon: "Shirt" },
  { type: "EXPENSE", name: "Thể thao / Sở thích", group: "Chi tiêu cá nhân của chồng", defaultJar: "PLAY", defaultNecessity: "CO_THE_CAT_GIAM", icon: "Dumbbell" },

  // ===== GIÁO DỤC & PHÁT TRIỂN BẢN THÂN =====
  { type: "EXPENSE", name: "Sách", group: "Giáo dục và phát triển bản thân", defaultJar: "EDU", defaultNecessity: "CAN_THIET", icon: "BookOpen" },
  { type: "EXPENSE", name: "Khóa học / Coaching / Hội thảo", group: "Giáo dục và phát triển bản thân", defaultJar: "EDU", defaultNecessity: "CAN_THIET", icon: "GraduationCap" },
  { type: "EXPENSE", name: "Ngoại ngữ", group: "Giáo dục và phát triển bản thân", defaultJar: "EDU", defaultNecessity: "CAN_THIET", icon: "Languages" },
  { type: "EXPENSE", name: "Phần mềm / Công cụ học tập", group: "Giáo dục và phát triển bản thân", defaultJar: "EDU", defaultNecessity: "CO_THE_CAT_GIAM", icon: "Laptop" },

  // ===== HƯỞNG THỤ & GIẢI TRÍ =====
  { type: "EXPENSE", name: "Du lịch / Nghỉ dưỡng", group: "Hưởng thụ và giải trí", defaultJar: "PLAY", defaultNecessity: "CO_THE_CAT_GIAM", icon: "Plane" },
  { type: "EXPENSE", name: "Xem phim / Ca nhạc / Giải trí", group: "Hưởng thụ và giải trí", defaultJar: "PLAY", defaultNecessity: "CO_THE_CAT_GIAM", icon: "Film" },
  { type: "EXPENSE", name: "Mua sắm sở thích / Đồ công nghệ", group: "Hưởng thụ và giải trí", defaultJar: "PLAY", defaultNecessity: "KHONG_CAN_THIET", icon: "ShoppingBag" },
  { type: "EXPENSE", name: "Quà tự thưởng / Kỷ niệm", group: "Hưởng thụ và giải trí", defaultJar: "PLAY", defaultNecessity: "CO_THE_CAT_GIAM", icon: "Gift" },

  // ===== CHO ĐI & QUAN HỆ GIA ĐÌNH =====
  { type: "EXPENSE", name: "Biếu bố mẹ", group: "Cho đi và quan hệ gia đình", defaultJar: "GIVE", defaultNecessity: "CAN_THIET", icon: "HeartHandshake" },
  { type: "EXPENSE", name: "Hỗ trợ người thân", group: "Cho đi và quan hệ gia đình", defaultJar: "GIVE", defaultNecessity: "CAN_THIET", icon: "HeartHandshake" },
  { type: "EXPENSE", name: "Mừng cưới / Sinh nhật", group: "Cho đi và quan hệ gia đình", defaultJar: "GIVE", defaultNecessity: "CAN_THIET", icon: "Gift" },
  { type: "EXPENSE", name: "Ma chay / Giỗ chạp / Lễ Tết", group: "Cho đi và quan hệ gia đình", defaultJar: "GIVE", defaultNecessity: "BAT_BUOC", icon: "HeartHandshake" },
  { type: "EXPENSE", name: "Từ thiện / Công đức", group: "Cho đi và quan hệ gia đình", defaultJar: "GIVE", defaultNecessity: "CO_THE_CAT_GIAM", icon: "HeartHandshake" },

  // ===== ĐẦU TƯ & TỰ DO TÀI CHÍNH =====
  { type: "EXPENSE", name: "Gửi tiết kiệm đầu tư", group: "Đầu tư và tự do tài chính", defaultJar: "FFA", defaultNecessity: "BAT_BUOC", icon: "TrendingUp" },
  { type: "EXPENSE", name: "Mua cổ phiếu / Chứng chỉ quỹ", group: "Đầu tư và tự do tài chính", defaultJar: "FFA", defaultNecessity: "CAN_THIET", icon: "TrendingUp" },
  { type: "EXPENSE", name: "Mua vàng tích sản", group: "Đầu tư và tự do tài chính", defaultJar: "FFA", defaultNecessity: "CAN_THIET", icon: "Coins" },
  { type: "EXPENSE", name: "Đầu tư kinh doanh cá nhân", group: "Đầu tư và tự do tài chính", defaultJar: "FFA", defaultNecessity: "CO_THE_CAT_GIAM", icon: "TrendingUp" },

  // ===== TIẾT KIỆM DÀI HẠN =====
  { type: "EXPENSE", name: "Quỹ dự phòng", group: "Tiết kiệm dài hạn", defaultJar: "LTSS", defaultNecessity: "BAT_BUOC", icon: "PiggyBank" },
  { type: "EXPENSE", name: "Quỹ mua nhà / mua xe / sửa nhà", group: "Tiết kiệm dài hạn", defaultJar: "LTSS", defaultNecessity: "CAN_THIET", icon: "PiggyBank" },
  { type: "EXPENSE", name: "Quỹ du lịch lớn", group: "Tiết kiệm dài hạn", defaultJar: "LTSS", defaultNecessity: "CO_THE_CAT_GIAM", icon: "PiggyBank" },
  { type: "EXPENSE", name: "Quỹ nghỉ hưu", group: "Tiết kiệm dài hạn", defaultJar: "LTSS", defaultNecessity: "CAN_THIET", icon: "PiggyBank" },

  // ===== NỢ & NGHĨA VỤ TÀI CHÍNH =====
  { type: "EXPENSE", name: "Trả nợ gốc", group: "Nợ và nghĩa vụ tài chính", defaultJar: "NEC", defaultNecessity: "BAT_BUOC", icon: "Landmark" },
  { type: "EXPENSE", name: "Trả lãi ngân hàng", group: "Nợ và nghĩa vụ tài chính", defaultJar: "NEC", defaultNecessity: "BAT_BUOC", icon: "Landmark" },
  { type: "EXPENSE", name: "Trả góp nhà / xe / thiết bị", group: "Nợ và nghĩa vụ tài chính", defaultJar: "NEC", defaultNecessity: "BAT_BUOC", icon: "Landmark" },
  { type: "EXPENSE", name: "Phí ngân hàng / Phạt chậm trả", group: "Nợ và nghĩa vụ tài chính", defaultJar: "NEC", defaultNecessity: "CAN_THIET", icon: "Landmark" },

  // ===== CHI PHÍ KHÁC =====
  { type: "EXPENSE", name: "Phí dịch vụ / Thuế cá nhân", group: "Chi phí khác", defaultJar: "NEC", defaultNecessity: "CAN_THIET", icon: "Receipt" },
  { type: "EXPENSE", name: "Chi phí đột xuất / Chưa phân loại", group: "Chi phí khác", defaultJar: "NEC", defaultNecessity: "CAN_THIET", icon: "Receipt" },
];
