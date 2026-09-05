"use server";

import { z } from "zod";
import bcrypt from "bcryptjs";
import { redirect } from "next/navigation";
import { prisma } from "@/lib/prisma";
import { createSession, destroySession } from "@/lib/session";
import { setupDefaultFamilyData } from "@/lib/family-setup";

const registerSchema = z
  .object({
    familyName: z.string().min(2, "Tên gia đình phải có ít nhất 2 ký tự"),
    adminName: z.string().min(2, "Tên phải có ít nhất 2 ký tự"),
    email: z.string().email("Email không hợp lệ"),
    password: z.string().min(6, "Mật khẩu phải có ít nhất 6 ký tự"),
    confirmPassword: z.string(),
  })
  .refine((data) => data.password === data.confirmPassword, {
    message: "Mật khẩu xác nhận không khớp",
    path: ["confirmPassword"],
  });

export type FormState = { error?: string; fieldErrors?: Record<string, string> } | null;

export async function registerFamilyAction(
  _prevState: FormState,
  formData: FormData
): Promise<FormState> {
  const raw = {
    familyName: String(formData.get("familyName") ?? ""),
    adminName: String(formData.get("adminName") ?? ""),
    email: String(formData.get("email") ?? "")
      .trim()
      .toLowerCase(),
    password: String(formData.get("password") ?? ""),
    confirmPassword: String(formData.get("confirmPassword") ?? ""),
  };

  const parsed = registerSchema.safeParse(raw);
  if (!parsed.success) {
    const fieldErrors: Record<string, string> = {};
    for (const issue of parsed.error.issues) {
      fieldErrors[String(issue.path[0])] = issue.message;
    }
    return { fieldErrors };
  }

  const existing = await prisma.user.findUnique({ where: { email: raw.email } });
  if (existing) {
    return { fieldErrors: { email: "Email này đã được đăng ký" } };
  }

  const passwordHash = await bcrypt.hash(raw.password, 10);

  const result = await prisma.$transaction(async (tx) => {
    const family = await tx.family.create({
      data: { name: raw.familyName, currency: "VND" },
    });

    const user = await tx.user.create({
      data: {
        email: raw.email,
        passwordHash,
        name: raw.adminName,
        familyId: family.id,
      },
    });

    const member = await tx.familyMember.create({
      data: {
        familyId: family.id,
        userId: user.id,
        name: raw.adminName,
        role: "ADMIN",
        avatarColor: "#6366f1",
      },
    });

    // Tài khoản tiền mặt mặc định
    await tx.account.create({
      data: {
        familyId: family.id,
        name: "Tiền mặt",
        type: "CASH",
        ownerMemberId: member.id,
        openingBalance: 0,
      },
    });

    // 6 chiếc lọ mặc định + danh mục thu/chi + settings
    await setupDefaultFamilyData(tx, family.id);

    return { user, member, family };
  });

  await createSession({
    userId: result.user.id,
    familyId: result.family.id,
    memberId: result.member.id,
    role: "ADMIN",
    name: result.user.name,
    email: result.user.email,
  });

  redirect("/dashboard");
}

const loginSchema = z.object({
  email: z.string().email("Email không hợp lệ"),
  password: z.string().min(1, "Vui lòng nhập mật khẩu"),
});

export async function loginAction(_prevState: FormState, formData: FormData): Promise<FormState> {
  const raw = {
    email: String(formData.get("email") ?? "")
      .trim()
      .toLowerCase(),
    password: String(formData.get("password") ?? ""),
  };

  const parsed = loginSchema.safeParse(raw);
  if (!parsed.success) {
    return { error: "Vui lòng nhập đầy đủ email và mật khẩu" };
  }

  const user = await prisma.user.findUnique({
    where: { email: raw.email },
    include: { memberProfile: true },
  });

  if (!user || !user.memberProfile) {
    return { error: "Email hoặc mật khẩu không đúng" };
  }

  const valid = await bcrypt.compare(raw.password, user.passwordHash);
  if (!valid) {
    return { error: "Email hoặc mật khẩu không đúng" };
  }

  await createSession({
    userId: user.id,
    familyId: user.familyId,
    memberId: user.memberProfile.id,
    role: user.memberProfile.role as "ADMIN" | "MEMBER" | "CHILD",
    name: user.name,
    email: user.email,
  });

  redirect("/dashboard");
}

export async function logoutAction() {
  await destroySession();
  redirect("/login");
}
