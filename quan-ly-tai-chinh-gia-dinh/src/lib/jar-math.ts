// Hàm thuần (không phụ thuộc server) — dùng được cả ở Client Component lẫn Server.

/** Đề xuất phân bổ 1 khoản thu nhập vào 6 lọ theo tỷ lệ — làm tròn nghìn đồng,
 *  phần dư do làm tròn được gộp vào lọ Thiết yếu (NEC) để tổng luôn khớp chính xác số tiền gốc. */
export function suggestJarAllocation(
  amount: number,
  jars: { id: string; code: string; percentage: number }[]
) {
  const rounded = jars.map((jar) => ({
    jarId: jar.id,
    code: jar.code,
    percentage: jar.percentage,
    amount: Math.round((amount * jar.percentage) / 100 / 1000) * 1000,
  }));
  const sum = rounded.reduce((s, r) => s + r.amount, 0);
  const diff = Math.round(amount - sum);
  if (diff !== 0) {
    const necIndex = rounded.findIndex((r) => r.code === "NEC");
    const targetIndex = necIndex >= 0 ? necIndex : 0;
    rounded[targetIndex].amount += diff;
  }
  return rounded;
}

export function sumPercentage(jars: { percentage: number }[]) {
  return Math.round(jars.reduce((s, j) => s + j.percentage, 0) * 100) / 100;
}
