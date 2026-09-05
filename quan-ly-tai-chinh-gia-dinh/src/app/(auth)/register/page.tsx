"use client";

import { useActionState } from "react";
import Link from "next/link";
import { registerFamilyAction, type FormState } from "@/lib/actions/auth";
import { Card, CardContent } from "@/components/ui/card";
import { Field, Input } from "@/components/ui/form-controls";
import { Button } from "@/components/ui/button";

export default function RegisterPage() {
  const [state, formAction, pending] = useActionState<FormState, FormData>(
    registerFamilyAction,
    null
  );

  return (
    <Card>
      <CardContent className="p-6">
        <h1 className="mb-1 text-xl font-bold">Đăng ký gia đình</h1>
        <p className="mb-6 text-sm text-muted">
          Tạo không gian tài chính riêng cho gia đình bạn. Bạn sẽ là Quản trị viên.
        </p>

        <form action={formAction} className="space-y-4">
          <Field label="Tên gia đình" htmlFor="familyName" error={state?.fieldErrors?.familyName}>
            <Input id="familyName" name="familyName" placeholder="Gia đình Nguyễn" required />
          </Field>
          <Field label="Tên của bạn" htmlFor="adminName" error={state?.fieldErrors?.adminName}>
            <Input id="adminName" name="adminName" placeholder="Nguyễn Văn A" required />
          </Field>
          <Field label="Email" htmlFor="email" error={state?.fieldErrors?.email}>
            <Input id="email" name="email" type="email" placeholder="ban@vidu.com" required />
          </Field>
          <Field label="Mật khẩu" htmlFor="password" error={state?.fieldErrors?.password}>
            <Input id="password" name="password" type="password" placeholder="Ít nhất 6 ký tự" required />
          </Field>
          <Field
            label="Xác nhận mật khẩu"
            htmlFor="confirmPassword"
            error={state?.fieldErrors?.confirmPassword}
          >
            <Input id="confirmPassword" name="confirmPassword" type="password" required />
          </Field>

          <Button type="submit" className="w-full" disabled={pending}>
            {pending ? "Đang tạo gia đình..." : "Tạo gia đình & bắt đầu"}
          </Button>
        </form>

        <p className="mt-5 text-center text-sm text-muted">
          Đã có tài khoản?{" "}
          <Link href="/login" className="font-medium text-brand hover:underline">
            Đăng nhập
          </Link>
        </p>
      </CardContent>
    </Card>
  );
}
