"use client";

import { useMemo, useState, useTransition } from "react";
import { useRouter } from "next/navigation";
import { Modal } from "@/components/ui/modal";
import { Button } from "@/components/ui/button";
import { Icon } from "@/components/icon";
import { updateJarPercentagesAction } from "@/lib/actions/jars";

type Jar = { id: string; name: string; icon: string; percentage: number };

export function JarPercentagesModal({
  open,
  onClose,
  jars,
}: {
  open: boolean;
  onClose: () => void;
  jars: Jar[];
}) {
  const router = useRouter();
  const [values, setValues] = useState<Record<string, number>>(() =>
    Object.fromEntries(jars.map((j) => [j.id, j.percentage]))
  );
  const [error, setError] = useState<string | null>(null);
  const [pending, startTransition] = useTransition();

  const total = useMemo(
    () => Math.round(Object.values(values).reduce((s, v) => s + v, 0) * 100) / 100,
    [values]
  );
  const isValid = Math.abs(total - 100) < 0.01;

  function submit() {
    if (!isValid) {
      setError(`Tổng tỷ lệ phải bằng 100%. Hiện tại: ${total}%`);
      return;
    }
    setError(null);
    startTransition(async () => {
      try {
        await updateJarPercentagesAction(jars.map((j) => ({ id: j.id, percentage: values[j.id] })));
        router.refresh();
        onClose();
      } catch (e) {
        setError(e instanceof Error ? e.message : "Có lỗi xảy ra");
      }
    });
  }

  return (
    <Modal open={open} onClose={onClose} title="Điều chỉnh tỷ lệ 6 chiếc lọ">
      <div className="space-y-3">
        {jars.map((jar) => (
          <div key={jar.id} className="flex items-center gap-3">
            <Icon name={jar.icon} size={18} className="shrink-0" />
            <span className="flex-1 text-sm font-medium">{jar.name}</span>
            <input
              type="number"
              min={0}
              max={100}
              step={0.5}
              value={values[jar.id]}
              onChange={(e) =>
                setValues((prev) => ({ ...prev, [jar.id]: Number(e.target.value) || 0 }))
              }
              className="w-20 rounded-lg border border-border bg-transparent px-2 py-1.5 text-right text-sm font-semibold"
            />
            <span className="text-sm text-muted">%</span>
          </div>
        ))}

        <div
          className={`flex items-center justify-between rounded-xl px-3.5 py-2.5 text-sm font-semibold ${
            isValid ? "bg-success-soft text-success" : "bg-danger-soft text-danger"
          }`}
        >
          <span>Tổng cộng</span>
          <span>{total}%</span>
        </div>

        {error ? <p className="text-sm text-danger">{error}</p> : null}
        <p className="text-xs text-muted">
          Tỷ lệ mới sẽ áp dụng cho các khoản thu nhập được thêm sau này (không ảnh hưởng số dư đã phân bổ trước đó).
        </p>

        <Button className="w-full" onClick={submit} disabled={pending || !isValid}>
          {pending ? "Đang lưu..." : "Lưu tỷ lệ"}
        </Button>
      </div>
    </Modal>
  );
}
