"use client";

import { useActionState } from "react";
import Link from "next/link";
import { loginAction, type FormState } from "@/lib/actions/auth";
import { Card, CardContent } from "@/components/ui/card";
import { Field, Input } from "@/components/ui/form-controls";
import { Button } from "@/components/ui/button";
import { Icon } from "@/components/icon";

export default function LoginPage() {
  const [state, formAction, pending] = useActionState<FormState, FormData>(loginAction, null);

  return (
    <Card>
      <CardContent className="p-6">
        <h1 className="mb-1 text-xl font-bold">Đăng nhập</h1>
        <p className="mb-6 text-sm text-muted">Chào mừng bạn quay lại quản lý tài chính gia đình.</p>

        <form action={formAction} className="space-y-4">
          <Field label="Email" htmlFor="email">
            <Input id="email" name="email" type="email" placeholder="ban@vidu.com" required autoFocus />
          </Field>
          <Field label="Mật khẩu" htmlFor="password">
            <Input id="password" name="password" type="password" placeholder="••••••••" required />
          </Field>

          {state?.error ? (
            <div className="flex items-center gap-2 rounded-xl bg-danger-soft px-3 py-2.5 text-sm text-danger">
              <Icon name="AlertTriangle" size={16} />
              {state.error}
            </div>
          ) : null}

          <Button type="submit" className="w-full" disabled={pending}>
            {pending ? "Đang đăng nhập..." : "Đăng nhập"}
          </Button>
        </form>

        <p className="mt-5 text-center text-sm text-muted">
          Chưa có tài khoản gia đình?{" "}
          <Link href="/register" className="font-medium text-brand hover:underline">
            Đăng ký ngay
          </Link>
        </p>
      </CardContent>
    </Card>
  );
}
