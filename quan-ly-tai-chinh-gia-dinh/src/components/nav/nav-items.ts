export type NavItem = { href: string; label: string; icon: string };

export const PRIMARY_NAV: NavItem[] = [
  { href: "/dashboard", label: "Tổng quan", icon: "LayoutDashboard" },
  { href: "/transactions", label: "Giao dịch", icon: "List" },
  { href: "/jars", label: "6 Chiếc lọ", icon: "PiggyBank" },
  { href: "/budgets", label: "Ngân sách", icon: "Target" },
];

export const SECONDARY_NAV: NavItem[] = [
  { href: "/accounts", label: "Tài khoản tiền", icon: "Wallet" },
  { href: "/members", label: "Thành viên", icon: "Users" },
  { href: "/reports", label: "Báo cáo", icon: "BarChart3" },
  { href: "/debts", label: "Nợ & Phải thu", icon: "Landmark" },
  { href: "/goals", label: "Mục tiêu tài chính", icon: "Flag" },
  { href: "/emergency-fund", label: "Quỹ dự phòng", icon: "ShieldCheck" },
  { href: "/recurring", label: "Giao dịch định kỳ", icon: "Repeat" },
  { href: "/audit-log", label: "Nhật ký chỉnh sửa", icon: "History" },
  { href: "/settings", label: "Cài đặt", icon: "Settings" },
];

export const ALL_NAV = [...PRIMARY_NAV, ...SECONDARY_NAV];
