"use client";

import { useMemo, useState, useTransition } from "react";
import { useRouter } from "next/navigation";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Field, Input, Select } from "@/components/ui/form-controls";
import { Icon } from "@/components/icon";
import { CATEGORY_TYPES, JAR_CODES, JAR_DEFAULTS, type CategoryType, type JarCode } from "@/lib/enums";
import { createCategoryAction, toggleCategoryActiveAction } from "@/lib/actions/settings";

type Category = {
  id: string;
  type: string;
  name: string;
  group: string;
  isActive: boolean;
  icon: string;
};

export function CategoryManager({ categories }: { categories: Category[] }) {
  const router = useRouter();
  const [type, setType] = useState<CategoryType>("EXPENSE");
  const [showForm, setShowForm] = useState(false);
  const [name, setName] = useState("");
  const [group, setGroup] = useState("");
  const [defaultJar, setDefaultJar] = useState<JarCode>("NEC");
  const [pending, startTransition] = useTransition();

  const filtered = categories.filter((c) => c.type === type);
  const grouped = useMemo(() => {
    const map = new Map<string, Category[]>();
    for (const c of filtered) {
      if (!map.has(c.group)) map.set(c.group, []);
      map.get(c.group)!.push(c);
    }
    return Array.from(map.entries());
  }, [filtered]);

  function addCategory() {
    if (!name.trim() || !group.trim()) return;
    startTransition(async () => {
      await createCategoryAction({ type, name, group, defaultJar: type === "EXPENSE" ? defaultJar : undefined, icon: "Wallet" });
      router.refresh();
      setName("");
      setGroup("");
      setShowForm(false);
    });
  }

  function toggle(id: string, isActive: boolean) {
    startTransition(async () => {
      await toggleCategoryActiveAction(id, isActive);
      router.refresh();
    });
  }

  return (
    <Card>
      <CardHeader className="flex flex-row items-center justify-between">
        <CardTitle>Danh mục thu — chi</CardTitle>
        <Button size="sm" variant="outline" onClick={() => setShowForm((s) => !s)}>
          <Icon name="Plus" size={14} /> Thêm danh mục
        </Button>
      </CardHeader>
      <CardContent>
        <div className="mb-4 flex gap-2 rounded-xl bg-black/5 p-1 dark:bg-white/5">
          {CATEGORY_TYPES.map((t) => (
            <button
              key={t}
              onClick={() => setType(t)}
              className={`flex-1 rounded-lg py-1.5 text-sm font-medium ${
                type === t ? "bg-surface shadow-sm" : "text-muted"
              }`}
            >
              {t === "INCOME" ? "Thu nhập" : "Chi tiêu"}
            </button>
          ))}
        </div>

        {showForm ? (
          <div className="mb-4 space-y-3 rounded-xl border border-border p-3.5">
            <div className="grid grid-cols-2 gap-3">
              <Field label="Tên danh mục">
                <Input value={name} onChange={(e) => setName(e.target.value)} placeholder="VD: Học phí bơi" />
              </Field>
              <Field label="Nhóm">
                <Input value={group} onChange={(e) => setGroup(e.target.value)} placeholder="VD: Con cái" />
              </Field>
            </div>
            {type === "EXPENSE" ? (
              <Field label="Lọ mặc định">
                <Select value={defaultJar} onChange={(e) => setDefaultJar(e.target.value as JarCode)}>
                  {JAR_CODES.map((code) => (
                    <option key={code} value={code}>
                      {JAR_DEFAULTS[code].name}
                    </option>
                  ))}
                </Select>
              </Field>
            ) : null}
            <Button size="sm" onClick={addCategory} disabled={pending}>
              Lưu danh mục
            </Button>
          </div>
        ) : null}

        <div className="max-h-[480px] space-y-4 overflow-y-auto pr-1">
          {grouped.map(([groupName, cats]) => (
            <div key={groupName}>
              <p className="mb-1.5 text-xs font-semibold uppercase tracking-wide text-muted">{groupName}</p>
              <div className="space-y-1">
                {cats.map((c) => (
                  <div key={c.id} className="flex items-center justify-between rounded-lg px-2 py-1.5 hover:bg-black/5 dark:hover:bg-white/5">
                    <span className={`flex items-center gap-2 text-sm ${!c.isActive ? "text-muted line-through" : ""}`}>
                      <Icon name={c.icon} size={14} />
                      {c.name}
                    </span>
                    <button
                      onClick={() => toggle(c.id, !c.isActive)}
                      disabled={pending}
                      className={`rounded-full px-2.5 py-1 text-xs font-medium ${
                        c.isActive ? "bg-success-soft text-success" : "bg-black/5 text-muted dark:bg-white/10"
                      }`}
                    >
                      {c.isActive ? "Đang dùng" : "Đã ẩn"}
                    </button>
                  </div>
                ))}
              </div>
            </div>
          ))}
        </div>
      </CardContent>
    </Card>
  );
}
