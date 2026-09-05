"use client";

import { useState, useTransition } from "react";
import { useRouter } from "next/navigation";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Field, Input, Select } from "@/components/ui/form-controls";
import { JAR_MODES, JAR_MODE_LABEL, type JarMode } from "@/lib/enums";
import { updateFamilySettingsAction } from "@/lib/actions/settings";

const CURRENCIES = ["VND", "USD", "EUR"];

export function FamilySettingsForm({
  familyName,
  currency,
  jarMode,
}: {
  familyName: string;
  currency: string;
  jarMode: string;
}) {
  const router = useRouter();
  const [name, setName] = useState(familyName);
  const [curr, setCurr] = useState(currency);
  const [mode, setMode] = useState<JarMode>(jarMode as JarMode);
  const [saved, setSaved] = useState(false);
  const [pending, startTransition] = useTransition();

  function save() {
    setSaved(false);
    startTransition(async () => {
      await updateFamilySettingsAction({ name, currency: curr, jarMode: mode });
      router.refresh();
      setSaved(true);
    });
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle>Thông tin gia đình</CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        <Field label="Tên gia đình">
          <Input value={name} onChange={(e) => setName(e.target.value)} />
        </Field>
        <Field label="Loại tiền tệ">
          <Select value={curr} onChange={(e) => setCurr(e.target.value)}>
            {CURRENCIES.map((c) => (
              <option key={c} value={c}>
                {c}
              </option>
            ))}
          </Select>
        </Field>
        <Field label="Chế độ phân bổ 6 lọ" hint="Áp dụng khi thêm khoản thu nhập mới">
          <Select value={mode} onChange={(e) => setMode(e.target.value as JarMode)}>
            {JAR_MODES.map((m) => (
              <option key={m} value={m}>
                {JAR_MODE_LABEL[m]}
              </option>
            ))}
          </Select>
        </Field>
        <div className="flex items-center gap-3">
          <Button onClick={save} disabled={pending}>
            {pending ? "Đang lưu..." : "Lưu thay đổi"}
          </Button>
          {saved ? <span className="text-sm text-success">Đã lưu!</span> : null}
        </div>
      </CardContent>
    </Card>
  );
}
