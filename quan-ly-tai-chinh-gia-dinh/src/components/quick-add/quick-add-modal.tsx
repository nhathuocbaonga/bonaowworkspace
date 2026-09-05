"use client";

import { useEffect, useMemo, useState, useTransition } from "react";
import { Modal } from "@/components/ui/modal";
import { Button } from "@/components/ui/button";
import { Field, Input, Select, Textarea } from "@/components/ui/form-controls";
import { Icon } from "@/components/icon";
import { formatMoney, toDateInputValue } from "@/lib/format";
import { suggestJarAllocation } from "@/lib/jar-math";
import {
  NECESSITY_LABEL,
  NECESSITY_LEVELS,
  PAYMENT_METHODS,
  PAYMENT_METHOD_LABEL,
  MEMBER_ROLE_LABEL,
} from "@/lib/enums";
import { AmountInput } from "./amount-input";
import { getQuickAddRefDataAction } from "@/lib/actions/ref-data";
import { createExpenseAction, createIncomeAction } from "@/lib/actions/transactions";

type RefData = Awaited<ReturnType<typeof getQuickAddRefDataAction>>;

const EXPENSE_STEP_LABELS = ["Số tiền", "Danh mục", "Người liên quan", "Tài khoản & Lọ", "Xác nhận"];
const INCOME_STEP_LABELS = ["Số tiền", "Nguồn thu", "Phân bổ 6 lọ", "Xác nhận"];

export function QuickAddModal({
  open,
  onClose,
  initialType,
}: {
  open: boolean;
  onClose: () => void;
  initialType: "EXPENSE" | "INCOME";
}) {
  const [type, setType] = useState<"EXPENSE" | "INCOME">(initialType);
  const [step, setStep] = useState(0);
  const [data, setData] = useState<RefData | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState(false);
  const [pending, startTransition] = useTransition();

  // Component này được remount mỗi lần mở (xem key={openKey} ở QuickAddProvider),
  // nên chỉ cần tải dữ liệu tham chiếu một lần khi mount — không cần effect reset state.
  useEffect(() => {
    getQuickAddRefDataAction().then(setData);
  }, []);

  const stepLabels = type === "EXPENSE" ? EXPENSE_STEP_LABELS : INCOME_STEP_LABELS;

  function handleClose() {
    onClose();
    setTimeout(() => {
      setStep(0);
      setSuccess(false);
    }, 200);
  }

  if (!data) {
    return (
      <Modal open={open} onClose={handleClose} title="Thêm giao dịch">
        <div className="flex h-40 items-center justify-center text-muted text-sm">Đang tải...</div>
      </Modal>
    );
  }

  return (
    <Modal open={open} onClose={handleClose} title={success ? undefined : "Thêm giao dịch"} widthClassName="max-w-lg">
      {success ? (
        <SuccessView type={type} onClose={handleClose} onAddAnother={() => { setStep(0); setSuccess(false); }} />
      ) : (
        <>
          {step === 0 ? (
            <TypeSwitcher type={type} onChange={(t) => { setType(t); setStep(0); }} />
          ) : null}

          <StepIndicator labels={stepLabels} current={step} />

          {error ? (
            <div className="mb-4 flex items-center gap-2 rounded-xl bg-danger-soft px-3 py-2.5 text-sm text-danger">
              <Icon name="AlertTriangle" size={16} />
              {error}
            </div>
          ) : null}

          {type === "EXPENSE" ? (
            <ExpenseWizard
              data={data}
              step={step}
              setStep={setStep}
              pending={pending}
              onSubmit={(input) => {
                setError(null);
                startTransition(async () => {
                  try {
                    await createExpenseAction(input);
                    setSuccess(true);
                  } catch (e) {
                    setError(e instanceof Error ? e.message : "Có lỗi xảy ra");
                  }
                });
              }}
            />
          ) : (
            <IncomeWizard
              data={data}
              step={step}
              setStep={setStep}
              pending={pending}
              onSubmit={(input) => {
                setError(null);
                startTransition(async () => {
                  try {
                    await createIncomeAction(input);
                    setSuccess(true);
                  } catch (e) {
                    setError(e instanceof Error ? e.message : "Có lỗi xảy ra");
                  }
                });
              }}
            />
          )}
        </>
      )}
    </Modal>
  );
}

function SuccessView({
  type,
  onClose,
  onAddAnother,
}: {
  type: "EXPENSE" | "INCOME";
  onClose: () => void;
  onAddAnother: () => void;
}) {
  return (
    <div className="flex flex-col items-center py-6 text-center">
      <div className="mb-4 flex h-16 w-16 items-center justify-center rounded-full bg-success-soft text-success">
        <Icon name="CheckCircle2" size={32} />
      </div>
      <h3 className="mb-1 text-lg font-semibold">
        Đã lưu {type === "EXPENSE" ? "khoản chi" : "khoản thu"}!
      </h3>
      <p className="mb-6 text-sm text-muted">Số dư tài khoản và lọ đã được cập nhật.</p>
      <div className="flex w-full gap-2">
        <Button variant="outline" className="flex-1" onClick={onAddAnother}>
          Thêm giao dịch khác
        </Button>
        <Button className="flex-1" onClick={onClose}>
          Xong
        </Button>
      </div>
    </div>
  );
}

function TypeSwitcher({
  type,
  onChange,
}: {
  type: "EXPENSE" | "INCOME";
  onChange: (t: "EXPENSE" | "INCOME") => void;
}) {
  return (
    <div className="mb-4 grid grid-cols-2 gap-2 rounded-xl bg-black/5 p-1 dark:bg-white/5">
      <button
        onClick={() => onChange("EXPENSE")}
        className={`rounded-lg py-2 text-sm font-semibold transition-colors ${
          type === "EXPENSE" ? "bg-surface shadow-sm text-danger" : "text-muted"
        }`}
      >
        Khoản chi
      </button>
      <button
        onClick={() => onChange("INCOME")}
        className={`rounded-lg py-2 text-sm font-semibold transition-colors ${
          type === "INCOME" ? "bg-surface shadow-sm text-success" : "text-muted"
        }`}
      >
        Khoản thu
      </button>
    </div>
  );
}

function StepIndicator({ labels, current }: { labels: string[]; current: number }) {
  return (
    <div className="mb-5 flex items-center gap-1">
      {labels.map((label, i) => (
        <div key={label} className="flex flex-1 items-center gap-1">
          <div
            className={`h-1.5 flex-1 rounded-full ${i <= current ? "bg-brand" : "bg-black/10 dark:bg-white/10"}`}
          />
        </div>
      ))}
    </div>
  );
}

function StepNav({
  step,
  totalSteps,
  onBack,
  onNext,
  canNext,
  pending,
  nextLabel,
}: {
  step: number;
  totalSteps: number;
  onBack: () => void;
  onNext: () => void;
  canNext: boolean;
  pending?: boolean;
  nextLabel?: string;
}) {
  return (
    <div className="mt-6 flex gap-2">
      {step > 0 ? (
        <Button variant="outline" onClick={onBack} disabled={pending}>
          <Icon name="ChevronLeft" size={16} />
          Quay lại
        </Button>
      ) : null}
      <Button className="flex-1" onClick={onNext} disabled={!canNext || pending}>
        {pending ? "Đang lưu..." : nextLabel ?? (step === totalSteps - 1 ? "Lưu giao dịch" : "Tiếp tục")}
        {step < totalSteps - 1 && !pending ? <Icon name="ChevronRight" size={16} /> : null}
      </Button>
    </div>
  );
}

// ============================= KHOẢN CHI =============================

function ExpenseWizard({
  data,
  step,
  setStep,
  pending,
  onSubmit,
}: {
  data: RefData;
  step: number;
  setStep: (s: number) => void;
  pending: boolean;
  onSubmit: (input: Parameters<typeof createExpenseAction>[0]) => void;
}) {
  const defaultAccount = data.accounts[0]?.id ?? "";
  const [amount, setAmount] = useState(0);
  const [date, setDate] = useState(toDateInputValue(new Date()));
  const [categoryId, setCategoryId] = useState("");
  const [isShared, setIsShared] = useState(false);
  const [beneficiaryIds, setBeneficiaryIds] = useState<string[]>(
    data.session.memberId ? [data.session.memberId] : []
  );
  const [payerMemberId, setPayerMemberId] = useState(data.session.memberId);
  const [accountId, setAccountId] = useState(defaultAccount);
  const [jarId, setJarId] = useState("");
  const [necessity, setNecessity] = useState<string>("CAN_THIET");
  const [paymentMethod, setPaymentMethod] = useState("TIEN_MAT");
  const [isFixed, setIsFixed] = useState(false);
  const [note, setNote] = useState("");

  const selectedCategory = data.expenseCategories.find((c) => c.id === categoryId);

  function selectCategory(c: RefData["expenseCategories"][number]) {
    setCategoryId(c.id);
    if (c.defaultJar) {
      const jar = data.jars.find((j) => j.code === c.defaultJar);
      if (jar) setJarId(jar.id);
    }
    if (c.defaultNecessity) setNecessity(c.defaultNecessity);
  }

  const groupedCategories = useMemo(() => {
    const groups = new Map<string, typeof data.expenseCategories>();
    for (const c of data.expenseCategories) {
      if (!groups.has(c.group)) groups.set(c.group, []);
      groups.get(c.group)!.push(c);
    }
    return Array.from(groups.entries());
  }, [data.expenseCategories]); // eslint-disable-line react-hooks/exhaustive-deps -- data ổn định trong suốt vòng đời modal

  const canNextByStep = [
    amount > 0 && !!date,
    !!categoryId,
    !!payerMemberId,
    !!accountId && !!jarId,
    true,
  ];

  function handleNext() {
    if (step < 4) {
      setStep(step + 1);
      return;
    }
    onSubmit({
      amount,
      date,
      categoryId,
      accountId,
      jarId,
      payerMemberId,
      beneficiaryMemberIds: isShared ? data.members.map((m) => m.id) : beneficiaryIds,
      isShared,
      paymentMethod,
      necessity,
      note,
      isFixed,
    });
  }

  return (
    <div>
      {step === 0 ? (
        <div className="space-y-4">
          <AmountInput value={amount} onChange={setAmount} autoFocus />
          <Field label="Ngày chi" htmlFor="exp-date">
            <Input id="exp-date" type="date" value={date} onChange={(e) => setDate(e.target.value)} />
          </Field>
        </div>
      ) : null}

      {step === 1 ? (
        <div className="max-h-80 space-y-4 overflow-y-auto pr-1">
          {groupedCategories.map(([group, cats]) => (
            <div key={group}>
              <p className="mb-1.5 text-xs font-semibold uppercase tracking-wide text-muted">{group}</p>
              <div className="grid grid-cols-2 gap-2">
                {cats.map((c) => (
                  <button
                    key={c.id}
                    onClick={() => selectCategory(c)}
                    className={`flex items-center gap-2 rounded-xl border px-3 py-2.5 text-left text-sm transition-colors ${
                      categoryId === c.id
                        ? "border-brand bg-brand-soft text-brand"
                        : "border-border hover:bg-black/5 dark:hover:bg-white/5"
                    }`}
                  >
                    <Icon name={c.icon} size={16} />
                    <span className="truncate">{c.name}</span>
                  </button>
                ))}
              </div>
            </div>
          ))}
        </div>
      ) : null}

      {step === 2 ? (
        <div className="space-y-4">
          <Field label="Người chi" htmlFor="payer">
            <Select id="payer" value={payerMemberId} onChange={(e) => setPayerMemberId(e.target.value)}>
              {data.members.map((m) => (
                <option key={m.id} value={m.id}>
                  {m.name} · {MEMBER_ROLE_LABEL[m.role as keyof typeof MEMBER_ROLE_LABEL]}
                </option>
              ))}
            </Select>
          </Field>

          <div>
            <label className="flex cursor-pointer items-center justify-between rounded-xl border border-border px-3.5 py-3">
              <span className="text-sm font-medium">Chi chung cả gia đình</span>
              <input
                type="checkbox"
                checked={isShared}
                onChange={(e) => setIsShared(e.target.checked)}
                className="h-5 w-5 accent-[var(--brand)]"
              />
            </label>
          </div>

          {!isShared ? (
            <Field label="Chi cho ai (có thể chọn nhiều)">
              <div className="flex flex-wrap gap-2">
                {data.members.map((m) => {
                  const selected = beneficiaryIds.includes(m.id);
                  return (
                    <button
                      key={m.id}
                      onClick={() =>
                        setBeneficiaryIds((prev) =>
                          selected ? prev.filter((id) => id !== m.id) : [...prev, m.id]
                        )
                      }
                      className={`rounded-full border px-3 py-1.5 text-sm ${
                        selected ? "border-brand bg-brand-soft text-brand" : "border-border text-muted"
                      }`}
                    >
                      {m.name}
                    </button>
                  );
                })}
              </div>
            </Field>
          ) : null}
        </div>
      ) : null}

      {step === 3 ? (
        <div className="space-y-4">
          <Field label="Tài khoản thanh toán" htmlFor="account">
            <Select id="account" value={accountId} onChange={(e) => setAccountId(e.target.value)}>
              {data.accounts.map((a) => (
                <option key={a.id} value={a.id}>
                  {a.name}
                </option>
              ))}
            </Select>
          </Field>

          <Field label="Chiếc lọ sử dụng">
            <div className="grid grid-cols-3 gap-2">
              {data.jars.map((j) => (
                <button
                  key={j.id}
                  onClick={() => setJarId(j.id)}
                  className={`rounded-xl border px-2 py-2 text-center text-xs font-medium transition-colors ${
                    jarId === j.id ? "border-brand bg-brand-soft text-brand" : "border-border text-muted"
                  }`}
                >
                  <Icon name={j.icon} size={16} className="mx-auto mb-1" />
                  {j.name}
                </button>
              ))}
            </div>
          </Field>

          <details className="rounded-xl border border-border px-3.5 py-2.5 open:pb-3.5">
            <summary className="cursor-pointer text-sm font-medium text-muted">Tùy chọn nâng cao</summary>
            <div className="mt-3 space-y-3">
              <Field label="Mức độ cần thiết">
                <Select value={necessity} onChange={(e) => setNecessity(e.target.value)}>
                  {NECESSITY_LEVELS.map((n) => (
                    <option key={n} value={n}>
                      {NECESSITY_LABEL[n]}
                    </option>
                  ))}
                </Select>
              </Field>
              <Field label="Hình thức thanh toán">
                <Select value={paymentMethod} onChange={(e) => setPaymentMethod(e.target.value)}>
                  {PAYMENT_METHODS.map((p) => (
                    <option key={p} value={p}>
                      {PAYMENT_METHOD_LABEL[p]}
                    </option>
                  ))}
                </Select>
              </Field>
              <label className="flex cursor-pointer items-center justify-between">
                <span className="text-sm">Chi phí cố định hàng tháng</span>
                <input
                  type="checkbox"
                  checked={isFixed}
                  onChange={(e) => setIsFixed(e.target.checked)}
                  className="h-5 w-5 accent-[var(--brand)]"
                />
              </label>
              <Field label="Ghi chú">
                <Textarea value={note} onChange={(e) => setNote(e.target.value)} placeholder="Không bắt buộc" />
              </Field>
            </div>
          </details>
        </div>
      ) : null}

      {step === 4 ? (
        <ReviewExpense
          amount={amount}
          date={date}
          category={selectedCategory?.name ?? ""}
          account={data.accounts.find((a) => a.id === accountId)?.name ?? ""}
          jar={data.jars.find((j) => j.id === jarId)?.name ?? ""}
          payer={data.members.find((m) => m.id === payerMemberId)?.name ?? ""}
          beneficiary={isShared ? "Cả gia đình" : data.members.filter((m) => beneficiaryIds.includes(m.id)).map((m) => m.name).join(", ") || "—"}
          necessity={NECESSITY_LABEL[necessity as keyof typeof NECESSITY_LABEL]}
        />
      ) : null}

      <StepNav
        step={step}
        totalSteps={5}
        onBack={() => setStep(step - 1)}
        onNext={handleNext}
        canNext={canNextByStep[step]}
        pending={pending}
      />
    </div>
  );
}

function ReviewExpense(props: {
  amount: number;
  date: string;
  category: string;
  account: string;
  jar: string;
  payer: string;
  beneficiary: string;
  necessity: string;
}) {
  return (
    <div className="space-y-3">
      <div className="rounded-2xl bg-danger-soft px-4 py-4 text-center">
        <p className="text-xs text-muted">Số tiền chi</p>
        <p className="text-2xl font-bold text-danger">{formatMoney(props.amount)}</p>
      </div>
      <dl className="space-y-2 rounded-xl border border-border p-3.5 text-sm">
        <Row label="Danh mục" value={props.category} />
        <Row label="Tài khoản" value={props.account} />
        <Row label="Chiếc lọ" value={props.jar} />
        <Row label="Người chi" value={props.payer} />
        <Row label="Chi cho" value={props.beneficiary} />
        <Row label="Mức độ" value={props.necessity} />
      </dl>
    </div>
  );
}

function Row({ label, value }: { label: string; value: string }) {
  return (
    <div className="flex justify-between gap-3">
      <dt className="text-muted">{label}</dt>
      <dd className="text-right font-medium">{value}</dd>
    </div>
  );
}

// ============================= KHOẢN THU =============================

function IncomeWizard({
  data,
  step,
  setStep,
  pending,
  onSubmit,
}: {
  data: RefData;
  step: number;
  setStep: (s: number) => void;
  pending: boolean;
  onSubmit: (input: Parameters<typeof createIncomeAction>[0]) => void;
}) {
  const [amount, setAmount] = useState(0);
  const [date, setDate] = useState(toDateInputValue(new Date()));
  const [categoryId, setCategoryId] = useState(data.incomeCategories[0]?.id ?? "");
  const [accountId, setAccountId] = useState(data.accounts[0]?.id ?? "");
  const [payerMemberId, setPayerMemberId] = useState(data.session.memberId);
  const [note, setNote] = useState("");
  const [mode, setMode] = useState<"AUTO" | "MANUAL">("AUTO");
  const [allocations, setAllocations] = useState<{ jarId: string; code: string; amount: number; percentage: number }[]>(
    []
  );

  function handleAmountChange(next: number) {
    setAmount(next);
    if (mode === "AUTO") setAllocations(suggestJarAllocation(next, data.jars));
  }

  function handleModeChange(next: "AUTO" | "MANUAL") {
    setMode(next);
    if (next === "AUTO") setAllocations(suggestJarAllocation(amount, data.jars));
  }

  const allocatedSum = allocations.reduce((s, a) => s + a.amount, 0);
  const isFullyAllocated = Math.abs(allocatedSum - amount) < 1;

  const canNextByStep = [amount > 0 && !!date, !!categoryId && !!accountId && !!payerMemberId, isFullyAllocated, true];

  function handleNext() {
    if (step < 3) {
      setStep(step + 1);
      return;
    }
    onSubmit({
      amount,
      date,
      categoryId,
      accountId,
      payerMemberId,
      incomeKind: "VARIABLE",
      recurrenceKind: "ONE_TIME",
      note,
      allocations: allocations.map((a) => ({ jarId: a.jarId, amount: a.amount, percentage: a.percentage })),
    });
  }

  const groupedCategories = useMemo(() => {
    const groups = new Map<string, typeof data.incomeCategories>();
    for (const c of data.incomeCategories) {
      if (!groups.has(c.group)) groups.set(c.group, []);
      groups.get(c.group)!.push(c);
    }
    return Array.from(groups.entries());
  }, [data.incomeCategories]); // eslint-disable-line react-hooks/exhaustive-deps -- data ổn định trong suốt vòng đời modal

  return (
    <div>
      {step === 0 ? (
        <div className="space-y-4">
          <AmountInput value={amount} onChange={handleAmountChange} autoFocus />
          <Field label="Ngày nhận" htmlFor="inc-date">
            <Input id="inc-date" type="date" value={date} onChange={(e) => setDate(e.target.value)} />
          </Field>
        </div>
      ) : null}

      {step === 1 ? (
        <div className="space-y-4">
          <Field label="Nguồn thu">
            <div className="max-h-56 space-y-3 overflow-y-auto pr-1">
              {groupedCategories.map(([group, cats]) => (
                <div key={group}>
                  <p className="mb-1.5 text-xs font-semibold uppercase tracking-wide text-muted">{group}</p>
                  <div className="grid grid-cols-2 gap-2">
                    {cats.map((c) => (
                      <button
                        key={c.id}
                        onClick={() => setCategoryId(c.id)}
                        className={`flex items-center gap-2 rounded-xl border px-3 py-2 text-left text-sm ${
                          categoryId === c.id
                            ? "border-brand bg-brand-soft text-brand"
                            : "border-border hover:bg-black/5 dark:hover:bg-white/5"
                        }`}
                      >
                        <Icon name={c.icon} size={16} />
                        <span className="truncate">{c.name}</span>
                      </button>
                    ))}
                  </div>
                </div>
              ))}
            </div>
          </Field>
          <Field label="Người tạo ra thu nhập" htmlFor="earner">
            <Select id="earner" value={payerMemberId} onChange={(e) => setPayerMemberId(e.target.value)}>
              {data.members.map((m) => (
                <option key={m.id} value={m.id}>
                  {m.name}
                </option>
              ))}
            </Select>
          </Field>
          <Field label="Tài khoản nhận tiền" htmlFor="rcv-account">
            <Select id="rcv-account" value={accountId} onChange={(e) => setAccountId(e.target.value)}>
              {data.accounts.map((a) => (
                <option key={a.id} value={a.id}>
                  {a.name}
                </option>
              ))}
            </Select>
          </Field>
        </div>
      ) : null}

      {step === 2 ? (
        <div className="space-y-3">
          <div className="flex items-center justify-between">
            <p className="text-sm font-medium">Phân bổ vào 6 chiếc lọ</p>
            <div className="flex gap-1 rounded-lg bg-black/5 p-0.5 text-xs dark:bg-white/5">
              <button
                onClick={() => handleModeChange("AUTO")}
                className={`rounded-md px-2 py-1 ${mode === "AUTO" ? "bg-surface shadow-sm font-semibold" : "text-muted"}`}
              >
                Tự động
              </button>
              <button
                onClick={() => handleModeChange("MANUAL")}
                className={`rounded-md px-2 py-1 ${mode === "MANUAL" ? "bg-surface shadow-sm font-semibold" : "text-muted"}`}
              >
                Thủ công
              </button>
            </div>
          </div>

          <div className="space-y-2">
            {allocations.map((a, idx) => {
              const jar = data.jars.find((j) => j.id === a.jarId);
              if (!jar) return null;
              return (
                <div key={a.jarId} className="flex items-center gap-3 rounded-xl border border-border px-3 py-2.5">
                  <Icon name={jar.icon} size={18} />
                  <div className="flex-1">
                    <p className="text-sm font-medium">{jar.name}</p>
                    <p className="text-xs text-muted">{jar.percentage}%</p>
                  </div>
                  <input
                    type="text"
                    inputMode="numeric"
                    disabled={mode === "AUTO"}
                    value={new Intl.NumberFormat("vi-VN").format(a.amount)}
                    onChange={(e) => {
                      const v = Number(e.target.value.replace(/\D/g, "")) || 0;
                      setAllocations((prev) =>
                        prev.map((p, i) => (i === idx ? { ...p, amount: v, percentage: amount > 0 ? (v / amount) * 100 : 0 } : p))
                      );
                    }}
                    className="w-28 rounded-lg border border-border bg-transparent px-2 py-1 text-right text-sm font-semibold disabled:opacity-60"
                  />
                </div>
              );
            })}
          </div>

          <div
            className={`rounded-xl px-3.5 py-2.5 text-sm ${
              isFullyAllocated ? "bg-success-soft text-success" : "bg-warning-soft text-warning"
            }`}
          >
            Đã phân bổ {formatMoney(allocatedSum)} / {formatMoney(amount)}
            {!isFullyAllocated ? " — cần phân bổ đủ 100% số tiền thu nhập" : " — đủ 100%"}
          </div>

          <Field label="Ghi chú">
            <Textarea value={note} onChange={(e) => setNote(e.target.value)} placeholder="Không bắt buộc" />
          </Field>
        </div>
      ) : null}

      {step === 3 ? (
        <div className="space-y-3">
          <div className="rounded-2xl bg-success-soft px-4 py-4 text-center">
            <p className="text-xs text-muted">Số tiền thu</p>
            <p className="text-2xl font-bold text-success">{formatMoney(amount)}</p>
          </div>
          <dl className="space-y-2 rounded-xl border border-border p-3.5 text-sm">
            <Row label="Nguồn thu" value={data.incomeCategories.find((c) => c.id === categoryId)?.name ?? ""} />
            <Row label="Tài khoản nhận" value={data.accounts.find((a) => a.id === accountId)?.name ?? ""} />
            <Row label="Người tạo thu nhập" value={data.members.find((m) => m.id === payerMemberId)?.name ?? ""} />
          </dl>
          <div className="space-y-1.5">
            {allocations.map((a) => {
              const jar = data.jars.find((j) => j.id === a.jarId);
              if (!jar || a.amount <= 0) return null;
              return (
                <div key={a.jarId} className="flex items-center justify-between text-sm">
                  <span className="flex items-center gap-1.5 text-muted">
                    <Icon name={jar.icon} size={14} /> {jar.name}
                  </span>
                  <span className="font-medium">{formatMoney(a.amount)}</span>
                </div>
              );
            })}
          </div>
        </div>
      ) : null}

      <StepNav
        step={step}
        totalSteps={4}
        onBack={() => setStep(step - 1)}
        onNext={handleNext}
        canNext={canNextByStep[step]}
        pending={pending}
        nextLabel={step === 3 ? "Lưu khoản thu" : undefined}
      />
    </div>
  );
}
