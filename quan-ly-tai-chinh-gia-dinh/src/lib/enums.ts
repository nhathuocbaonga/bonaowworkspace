// Các "enum" của ứng dụng — SQLite không hỗ trợ enum gốc Prisma nên định nghĩa
// union type + nhãn tiếng Việt ở đây, dùng chung cho UI, server action và Zod schema.

export const MEMBER_ROLES = ["ADMIN", "MEMBER", "CHILD"] as const;
export type MemberRole = (typeof MEMBER_ROLES)[number];
export const MEMBER_ROLE_LABEL: Record<MemberRole, string> = {
  ADMIN: "Quản trị viên",
  MEMBER: "Thành viên",
  CHILD: "Trẻ em",
};

export const ACCOUNT_TYPES = [
  "CASH",
  "BANK",
  "EWALLET",
  "CREDIT_CARD",
  "SAVINGS",
  "INVESTMENT",
  "GOLD",
] as const;
export type AccountType = (typeof ACCOUNT_TYPES)[number];
export const ACCOUNT_TYPE_LABEL: Record<AccountType, string> = {
  CASH: "Tiền mặt",
  BANK: "Tài khoản ngân hàng",
  EWALLET: "Ví điện tử",
  CREDIT_CARD: "Thẻ tín dụng",
  SAVINGS: "Sổ tiết kiệm",
  INVESTMENT: "Tài khoản đầu tư",
  GOLD: "Vàng",
};

export const CATEGORY_TYPES = ["INCOME", "EXPENSE"] as const;
export type CategoryType = (typeof CATEGORY_TYPES)[number];

export const JAR_CODES = ["NEC", "FFA", "LTSS", "EDU", "PLAY", "GIVE"] as const;
export type JarCode = (typeof JAR_CODES)[number];

export const JAR_DEFAULTS: Record<
  JarCode,
  { name: string; percentage: number; color: string; icon: string; desc: string }
> = {
  NEC: {
    name: "Chi tiêu thiết yếu",
    percentage: 55,
    color: "#ef4444",
    icon: "Home",
    desc: "Ăn ở, đi lại, hóa đơn hàng ngày",
  },
  FFA: {
    name: "Tự do tài chính",
    percentage: 10,
    color: "#f59e0b",
    icon: "TrendingUp",
    desc: "Đầu tư để tạo dòng tiền thụ động",
  },
  LTSS: {
    name: "Tiết kiệm dài hạn",
    percentage: 10,
    color: "#3b82f6",
    icon: "PiggyBank",
    desc: "Mục tiêu lớn: nhà, xe, học đại học...",
  },
  EDU: {
    name: "Giáo dục",
    percentage: 10,
    color: "#8b5cf6",
    icon: "GraduationCap",
    desc: "Học tập, phát triển bản thân",
  },
  PLAY: {
    name: "Hưởng thụ",
    percentage: 10,
    color: "#ec4899",
    icon: "PartyPopper",
    desc: "Giải trí, tự thưởng cho bản thân",
  },
  GIVE: {
    name: "Cho đi",
    percentage: 5,
    color: "#10b981",
    icon: "HeartHandshake",
    desc: "Từ thiện, biếu tặng người thân",
  },
};

export const TRANSACTION_TYPES = [
  "INCOME",
  "EXPENSE",
  "ACCOUNT_TRANSFER",
  "JAR_TRANSFER",
  "DEBT_BORROW",
  "DEBT_PRINCIPAL",
  "LOAN_OUT",
  "LOAN_COLLECT",
] as const;
export type TransactionType = (typeof TRANSACTION_TYPES)[number];
export const TRANSACTION_TYPE_LABEL: Record<TransactionType, string> = {
  INCOME: "Khoản thu",
  EXPENSE: "Khoản chi",
  ACCOUNT_TRANSFER: "Chuyển khoản giữa tài khoản",
  JAR_TRANSFER: "Chuyển tiền giữa lọ",
  DEBT_BORROW: "Nhận tiền vay",
  DEBT_PRINCIPAL: "Trả nợ gốc",
  LOAN_OUT: "Cho vay",
  LOAN_COLLECT: "Thu hồi nợ cho vay",
};

export const DEBT_SCHEDULES = ["MONTHLY", "QUARTERLY", "YEARLY", "ONE_TIME"] as const;
export type DebtSchedule = (typeof DEBT_SCHEDULES)[number];
export const DEBT_SCHEDULE_LABEL: Record<DebtSchedule, string> = {
  MONTHLY: "Hàng tháng",
  QUARTERLY: "Hàng quý",
  YEARLY: "Hàng năm",
  ONE_TIME: "Trả một lần",
};

export const DEBT_STATUSES = ["ACTIVE", "PAID_OFF"] as const;
export type DebtStatus = (typeof DEBT_STATUSES)[number];
export const DEBT_STATUS_LABEL: Record<DebtStatus, string> = {
  ACTIVE: "Đang vay",
  PAID_OFF: "Đã trả hết",
};

export const RECEIVABLE_STATUSES = [
  "OUTSTANDING",
  "PARTIALLY_COLLECTED",
  "COLLECTED",
  "WRITTEN_OFF",
] as const;
export type ReceivableStatus = (typeof RECEIVABLE_STATUSES)[number];
export const RECEIVABLE_STATUS_LABEL: Record<ReceivableStatus, string> = {
  OUTSTANDING: "Chưa thu hồi",
  PARTIALLY_COLLECTED: "Thu hồi một phần",
  COLLECTED: "Đã thu hồi hết",
  WRITTEN_OFF: "Xóa nợ",
};

export const GOAL_STATUSES = ["ACTIVE", "COMPLETED", "CANCELLED"] as const;
export type GoalStatus = (typeof GOAL_STATUSES)[number];
export const GOAL_STATUS_LABEL: Record<GoalStatus, string> = {
  ACTIVE: "Đang thực hiện",
  COMPLETED: "Đã hoàn thành",
  CANCELLED: "Đã hủy",
};

export const RECURRING_FREQUENCIES = ["DAILY", "WEEKLY", "MONTHLY", "QUARTERLY", "YEARLY"] as const;
export type RecurringFrequency = (typeof RECURRING_FREQUENCIES)[number];
export const RECURRING_FREQUENCY_LABEL: Record<RecurringFrequency, string> = {
  DAILY: "Hàng ngày",
  WEEKLY: "Hàng tuần",
  MONTHLY: "Hàng tháng",
  QUARTERLY: "Hàng quý",
  YEARLY: "Hàng năm",
};

export const AUDIT_ACTIONS = ["CREATE", "UPDATE", "DELETE", "RESTORE"] as const;
export type AuditAction = (typeof AUDIT_ACTIONS)[number];
export const AUDIT_ACTION_LABEL: Record<AuditAction, string> = {
  CREATE: "Tạo mới",
  UPDATE: "Chỉnh sửa",
  DELETE: "Xóa",
  RESTORE: "Khôi phục",
};

export const PAYMENT_METHODS = ["TIEN_MAT", "CHUYEN_KHOAN", "THE", "VI_DIEN_TU", "KHAC"] as const;
export type PaymentMethod = (typeof PAYMENT_METHODS)[number];
export const PAYMENT_METHOD_LABEL: Record<PaymentMethod, string> = {
  TIEN_MAT: "Tiền mặt",
  CHUYEN_KHOAN: "Chuyển khoản",
  THE: "Quẹt thẻ",
  VI_DIEN_TU: "Ví điện tử",
  KHAC: "Khác",
};

export const NECESSITY_LEVELS = [
  "BAT_BUOC",
  "CAN_THIET",
  "CO_THE_CAT_GIAM",
  "KHONG_CAN_THIET",
] as const;
export type NecessityLevel = (typeof NECESSITY_LEVELS)[number];
export const NECESSITY_LABEL: Record<NecessityLevel, string> = {
  BAT_BUOC: "Bắt buộc",
  CAN_THIET: "Cần thiết",
  CO_THE_CAT_GIAM: "Có thể cắt giảm",
  KHONG_CAN_THIET: "Không cần thiết",
};

export const PAYMENT_STATUSES = [
  "DA_THANH_TOAN",
  "CHUA_THANH_TOAN",
  "CHO_HOAN_TIEN",
  "DA_HOAN_TIEN",
] as const;
export type PaymentStatus = (typeof PAYMENT_STATUSES)[number];
export const PAYMENT_STATUS_LABEL: Record<PaymentStatus, string> = {
  DA_THANH_TOAN: "Đã thanh toán",
  CHUA_THANH_TOAN: "Chưa thanh toán",
  CHO_HOAN_TIEN: "Đang chờ hoàn tiền",
  DA_HOAN_TIEN: "Đã được hoàn tiền",
};

export const BUDGET_SCOPES = ["CATEGORY", "MEMBER", "JAR"] as const;
export type BudgetScope = (typeof BUDGET_SCOPES)[number];
export const BUDGET_SCOPE_LABEL: Record<BudgetScope, string> = {
  CATEGORY: "Theo danh mục",
  MEMBER: "Theo thành viên",
  JAR: "Theo lọ",
};

export const JAR_MODES = ["AUTO", "MANUAL", "AUTO_ADJUSTABLE"] as const;
export type JarMode = (typeof JAR_MODES)[number];
export const JAR_MODE_LABEL: Record<JarMode, string> = {
  AUTO: "Phân bổ tự động theo tỷ lệ",
  MANUAL: "Phân bổ thủ công",
  AUTO_ADJUSTABLE: "Tự động nhưng cho phép điều chỉnh",
};
