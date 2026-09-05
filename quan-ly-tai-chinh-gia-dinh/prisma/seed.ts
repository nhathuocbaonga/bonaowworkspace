import { PrismaClient } from "@prisma/client";
import bcrypt from "bcryptjs";
import { setupDefaultFamilyData } from "../src/lib/family-setup";
import { suggestJarAllocation } from "../src/lib/jar-math";

const prisma = new PrismaClient();

const DEMO_EMAIL = "demo@giadinh.vn";
const DEMO_PASSWORD = "demo123456";

function dayOf(monthsAgoFromToday: number, day: number) {
  const now = new Date();
  const d = new Date(now.getFullYear(), now.getMonth() - monthsAgoFromToday, day);
  // Không tạo giao dịch ở tương lai nếu đang seed vào đầu tháng hiện tại.
  if (d > now) d.setDate(Math.min(day, now.getDate()));
  return d;
}

async function main() {
  const existing = await prisma.user.findUnique({ where: { email: DEMO_EMAIL } });
  if (existing) {
    console.log("Dữ liệu mẫu đã tồn tại, bỏ qua seed. (Xóa dev.db nếu muốn seed lại từ đầu.)");
    return;
  }

  console.log("Đang tạo gia đình mẫu...");

  const family = await prisma.family.create({ data: { name: "Gia đình Nguyễn", currency: "VND" } });

  await prisma.$transaction(async (tx) => {
    await setupDefaultFamilyData(tx, family.id);
  });

  const passwordHash = await bcrypt.hash(DEMO_PASSWORD, 10);
  const user = await prisma.user.create({
    data: { email: DEMO_EMAIL, passwordHash, name: "Nguyễn Thị Lan", familyId: family.id },
  });

  const wife = await prisma.familyMember.create({
    data: { familyId: family.id, userId: user.id, name: "Nguyễn Thị Lan", role: "ADMIN", avatarColor: "#ec4899" },
  });
  const husband = await prisma.familyMember.create({
    data: { familyId: family.id, name: "Nguyễn Văn Minh", role: "MEMBER", avatarColor: "#3b82f6" },
  });
  const kid1 = await prisma.familyMember.create({
    data: { familyId: family.id, name: "Nguyễn Bảo An", role: "CHILD", avatarColor: "#f59e0b" },
  });
  const kid2 = await prisma.familyMember.create({
    data: { familyId: family.id, name: "Nguyễn Bảo Châu", role: "CHILD", avatarColor: "#10b981" },
  });

  console.log("Đang tạo tài khoản tiền...");

  const cash = await prisma.account.create({
    data: { familyId: family.id, name: "Tiền mặt", type: "CASH", openingBalance: 2000000 },
  });
  const wifeBank = await prisma.account.create({
    data: {
      familyId: family.id,
      name: "Vietcombank - Vợ",
      type: "BANK",
      ownerMemberId: wife.id,
      openingBalance: 15000000,
    },
  });
  const husbandBank = await prisma.account.create({
    data: {
      familyId: family.id,
      name: "Techcombank - Chồng",
      type: "BANK",
      ownerMemberId: husband.id,
      openingBalance: 8000000,
    },
  });
  const ewallet = await prisma.account.create({
    data: { familyId: family.id, name: "Momo", type: "EWALLET", openingBalance: 500000 },
  });
  const savings = await prisma.account.create({
    data: { familyId: family.id, name: "Sổ tiết kiệm gia đình", type: "SAVINGS", openingBalance: 50000000 },
  });

  const jars = await prisma.jar.findMany({ where: { familyId: family.id } });
  const categories = await prisma.category.findMany({ where: { familyId: family.id } });
  const cat = (name: string) => {
    const found = categories.find((c) => c.name === name);
    if (!found) throw new Error(`Không tìm thấy danh mục mẫu: ${name}`);
    return found;
  };
  const jar = (code: string) => jars.find((j) => j.code === code)!;

  console.log("Đang tạo giao dịch mẫu 3 tháng gần nhất...");

  async function addIncome(opts: {
    monthsAgo: number;
    day: number;
    amount: number;
    categoryName: string;
    accountId: string;
    payerMemberId: string;
  }) {
    const allocations = suggestJarAllocation(opts.amount, jars);
    await prisma.transaction.create({
      data: {
        familyId: family.id,
        type: "INCOME",
        amount: opts.amount,
        date: dayOf(opts.monthsAgo, opts.day),
        categoryId: cat(opts.categoryName).id,
        accountId: opts.accountId,
        createdByMemberId: wife.id,
        payerMemberId: opts.payerMemberId,
        incomeKind: "FIXED",
        recurrenceKind: "RECURRING",
        jarAllocations: { create: allocations.map((a) => ({ jarId: a.jarId, amount: a.amount, percentage: a.percentage })) },
      },
    });
  }

  async function addExpense(opts: {
    monthsAgo: number;
    day: number;
    amount: number;
    categoryName: string;
    accountId: string;
    payerMemberId: string;
    beneficiaryIds?: string[];
    isShared?: boolean;
    note?: string;
  }) {
    const category = cat(opts.categoryName);
    const jarId = category.defaultJar ? jar(category.defaultJar).id : jar("NEC").id;
    await prisma.transaction.create({
      data: {
        familyId: family.id,
        type: "EXPENSE",
        amount: opts.amount,
        date: dayOf(opts.monthsAgo, opts.day),
        categoryId: category.id,
        accountId: opts.accountId,
        jarId,
        createdByMemberId: wife.id,
        payerMemberId: opts.payerMemberId,
        necessity: category.defaultNecessity ?? "CAN_THIET",
        isShared: opts.isShared ?? false,
        note: opts.note,
        beneficiaries: opts.beneficiaryIds
          ? { create: opts.beneficiaryIds.map((id) => ({ memberId: id })) }
          : undefined,
      },
    });
  }

  for (const monthsAgo of [2, 1, 0]) {
    await addIncome({ monthsAgo, day: 5, amount: 22000000, categoryName: "Lương", accountId: husbandBank.id, payerMemberId: husband.id });
    await addIncome({ monthsAgo, day: 5, amount: 18000000, categoryName: "Lương", accountId: wifeBank.id, payerMemberId: wife.id });

    await addExpense({ monthsAgo, day: 3, amount: 3200000, categoryName: "Học phí", accountId: wifeBank.id, payerMemberId: wife.id, beneficiaryIds: [kid1.id], isShared: false });
    await addExpense({ monthsAgo, day: 3, amount: 2800000, categoryName: "Học phí", accountId: wifeBank.id, payerMemberId: wife.id, beneficiaryIds: [kid2.id], isShared: false });

    await addExpense({ monthsAgo, day: 2, amount: 350000, categoryName: "Đi chợ / Siêu thị / Thực phẩm", accountId: cash.id, payerMemberId: wife.id, isShared: true });
    await addExpense({ monthsAgo, day: 6, amount: 420000, categoryName: "Đi chợ / Siêu thị / Thực phẩm", accountId: cash.id, payerMemberId: wife.id, isShared: true });
    await addExpense({ monthsAgo, day: 10, amount: 280000, categoryName: "Đi chợ / Siêu thị / Thực phẩm", accountId: cash.id, payerMemberId: wife.id, isShared: true });
    await addExpense({ monthsAgo, day: 15, amount: 390000, categoryName: "Đi chợ / Siêu thị / Thực phẩm", accountId: cash.id, payerMemberId: wife.id, isShared: true });
    await addExpense({ monthsAgo, day: 20, amount: 310000, categoryName: "Đi chợ / Siêu thị / Thực phẩm", accountId: cash.id, payerMemberId: wife.id, isShared: true });

    await addExpense({ monthsAgo, day: 7, amount: 850000, categoryName: "Tiền điện", accountId: wifeBank.id, payerMemberId: wife.id, isShared: true });
    await addExpense({ monthsAgo, day: 7, amount: 180000, categoryName: "Tiền nước", accountId: wifeBank.id, payerMemberId: wife.id, isShared: true });
    await addExpense({ monthsAgo, day: 8, amount: 220000, categoryName: "Internet / Truyền hình", accountId: wifeBank.id, payerMemberId: wife.id, isShared: true });

    await addExpense({ monthsAgo, day: 12, amount: 450000, categoryName: "Khám bệnh / Thuốc", accountId: cash.id, payerMemberId: husband.id, beneficiaryIds: [kid1.id] });
    await addExpense({ monthsAgo, day: 18, amount: 1200000, categoryName: "Xăng xe", accountId: ewallet.id, payerMemberId: husband.id, isShared: true });
    await addExpense({ monthsAgo, day: 14, amount: 1500000, categoryName: "Học thêm / Năng khiếu", accountId: wifeBank.id, payerMemberId: wife.id, beneficiaryIds: [kid1.id, kid2.id] });
    await addExpense({ monthsAgo, day: 16, amount: 320000, categoryName: "Sách", accountId: cash.id, payerMemberId: wife.id, beneficiaryIds: [kid1.id] });
    await addExpense({ monthsAgo, day: 22, amount: 500000, categoryName: "Từ thiện / Công đức", accountId: wifeBank.id, payerMemberId: wife.id, isShared: true });
    await addExpense({ monthsAgo, day: 25, amount: 2500000, categoryName: "Trả nợ gốc", accountId: husbandBank.id, payerMemberId: husband.id, isShared: true, note: "Trả góp mua xe máy" });

    // Chuyển tiền gửi tiết kiệm — không tính là chi phí (chuyển giữa tài khoản)
    await prisma.transaction.create({
      data: {
        familyId: family.id,
        type: "ACCOUNT_TRANSFER",
        amount: 5000000,
        date: dayOf(monthsAgo, 6),
        accountId: wifeBank.id,
        toAccountId: savings.id,
        createdByMemberId: wife.id,
        note: "Gửi tiết kiệm hàng tháng",
      },
    });
  }

  // Một lần du lịch hè (tháng trước) + chuyển tiền giữa lọ minh họa tính năng
  await addExpense({ monthsAgo: 1, day: 28, amount: 6500000, categoryName: "Du lịch / Nghỉ dưỡng", accountId: wifeBank.id, payerMemberId: wife.id, isShared: true, note: "Du lịch hè Đà Lạt" });

  await prisma.transaction.create({
    data: {
      familyId: family.id,
      type: "JAR_TRANSFER",
      amount: 500000,
      date: dayOf(0, 9),
      jarId: jar("PLAY").id,
      toJarId: jar("LTSS").id,
      createdByMemberId: wife.id,
      note: "Chuyển bớt từ Hưởng thụ sang Tiết kiệm dài hạn",
    },
  });

  // Ngân sách mẫu cho tháng hiện tại
  const now = new Date();
  await prisma.budget.createMany({
    data: [
      { familyId: family.id, month: now.getMonth() + 1, year: now.getFullYear(), scope: "CATEGORY", categoryId: cat("Đi chợ / Siêu thị / Thực phẩm").id, amount: 8000000 },
      { familyId: family.id, month: now.getMonth() + 1, year: now.getFullYear(), scope: "JAR", jarId: jar("PLAY").id, amount: 3000000 },
      { familyId: family.id, month: now.getMonth() + 1, year: now.getFullYear(), scope: "MEMBER", memberId: kid1.id, amount: 6000000 },
      { familyId: family.id, month: now.getMonth() + 1, year: now.getFullYear(), scope: "JAR", jarId: jar("GIVE").id, amount: 1500000 },
    ],
  });

  console.log("Đang tạo dữ liệu Nợ, Mục tiêu, Định kỳ (Giai đoạn 2)...");

  // --- Khoản nợ đang vay ---
  const debt = await prisma.debt.create({
    data: {
      familyId: family.id,
      name: "Vay mua xe máy",
      lender: "Ngân hàng Techcombank",
      borrowerMemberId: husband.id,
      responsibleMemberId: husband.id,
      principalAmount: 60000000,
      interestRate: 8.5,
      startDate: dayOf(6, 1),
      dueDate: dayOf(-18, 1),
      paymentSchedule: "MONTHLY",
      installmentAmount: 2500000,
      nextPaymentDate: new Date(now.getTime() + 4 * 24 * 60 * 60 * 1000),
      purpose: "Mua xe máy đi làm",
      status: "ACTIVE",
    },
  });
  await prisma.transaction.create({
    data: {
      familyId: family.id,
      type: "DEBT_PRINCIPAL",
      amount: 7500000,
      date: dayOf(2, 25),
      accountId: husbandBank.id,
      createdByMemberId: husband.id,
      debtId: debt.id,
      note: "Trả nợ gốc: Vay mua xe máy",
    },
  });

  // --- Khoản cho vay (phải thu) ---
  const receivable = await prisma.receivable.create({
    data: {
      familyId: family.id,
      borrowerName: "Anh Tuấn (bạn thân)",
      lentByMemberId: husband.id,
      amount: 10000000,
      lentDate: dayOf(1, 10),
      dueDate: new Date(now.getTime() + 5 * 24 * 60 * 60 * 1000),
      status: "PARTIALLY_COLLECTED",
    },
  });
  await prisma.transaction.create({
    data: {
      familyId: family.id,
      type: "LOAN_OUT",
      amount: 10000000,
      date: dayOf(1, 10),
      accountId: husbandBank.id,
      createdByMemberId: husband.id,
      receivableId: receivable.id,
      note: "Cho Anh Tuấn (bạn thân) vay",
    },
  });
  await prisma.transaction.create({
    data: {
      familyId: family.id,
      type: "LOAN_COLLECT",
      amount: 4000000,
      date: dayOf(0, 5),
      accountId: husbandBank.id,
      createdByMemberId: husband.id,
      receivableId: receivable.id,
      note: "Thu hồi một phần từ Anh Tuấn (bạn thân)",
    },
  });

  // --- Mục tiêu tài chính ---
  await prisma.savingsGoal.create({
    data: {
      familyId: family.id,
      name: "Mua ô tô gia đình",
      targetAmount: 600000000,
      currentAmount: 85000000,
      startDate: dayOf(6, 1),
      targetDate: new Date(now.getFullYear() + 2, now.getMonth(), 1),
      note: "Xe 7 chỗ cho cả gia đình đi du lịch",
    },
  });

  // --- Quỹ dự phòng ---
  const emergencyFund = await prisma.savingsGoal.create({
    data: {
      familyId: family.id,
      name: "Quỹ dự phòng gia đình",
      targetAmount: 100000000,
      currentAmount: 35000000,
      isEmergencyFund: true,
      note: "Đệm tài chính 6 tháng chi phí thiết yếu",
    },
  });
  await prisma.goalContribution.create({
    data: { goalId: emergencyFund.id, amount: 35000000, note: "Số dư ban đầu khi bắt đầu dùng ứng dụng" },
  });

  // --- Giao dịch định kỳ ---
  await prisma.recurringRule.create({
    data: {
      familyId: family.id,
      name: "Tiền điện hàng tháng",
      type: "EXPENSE",
      amount: 850000,
      categoryId: cat("Tiền điện").id,
      accountId: wifeBank.id,
      jarId: jar("NEC").id,
      payerMemberId: wife.id,
      isShared: true,
      necessity: "BAT_BUOC",
      frequency: "MONTHLY",
      startDate: dayOf(3, 7),
      nextRunDate: new Date(now.getTime() - 2 * 24 * 60 * 60 * 1000),
      note: "Hóa đơn điện EVN",
    },
  });
  await prisma.recurringRule.create({
    data: {
      familyId: family.id,
      name: "Lương chồng",
      type: "INCOME",
      amount: 22000000,
      categoryId: cat("Lương").id,
      accountId: husbandBank.id,
      payerMemberId: husband.id,
      frequency: "MONTHLY",
      startDate: dayOf(3, 5),
      nextRunDate: new Date(now.getFullYear(), now.getMonth() + 1, 5),
      note: "Lương chuyển khoản hàng tháng",
    },
  });

  console.log("✅ Seed hoàn tất!");
  console.log(`   Đăng nhập demo: ${DEMO_EMAIL} / ${DEMO_PASSWORD}`);
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
