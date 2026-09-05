"use server";

import { z } from "zod";
import bcrypt from "bcryptjs";
import { revalidatePath } from "next/cache";
import { prisma } from "@/lib/prisma";
import { requireAdmin } from "@/lib/session";
import { MEMBER_ROLES } from "@/lib/enums";
import { writeAuditLog } from "@/lib/audit";

const memberSchema = z.object({
  name: z.string().min(1, "Vui lòng nhập tên"),
  role: z.enum(MEMBER_ROLES),
  avatarColor: z.string().default("#6366f1"),
  email: z.string().email().optional().or(z.literal("")),
  password: z.string().optional().or(z.literal("")),
});
export type MemberInput = z.infer<typeof memberSchema>;

const AVATAR_COLORS = ["#6d5ef7", "#ec4899", "#f59e0b", "#10b981", "#3b82f6", "#ef4444"];

export async function createMemberAction(input: MemberInput) {
  const session = await requireAdmin();
  const parsed = memberSchema.parse(input);

  let userId: string | undefined;
  if (parsed.email && parsed.password) {
    const existing = await prisma.user.findUnique({ where: { email: parsed.email } });
    if (existing) throw new Error("Email này đã được sử dụng");
    if (parsed.password.length < 6) throw new Error("Mật khẩu phải có ít nhất 6 ký tự");
    const passwordHash = await bcrypt.hash(parsed.password, 10);
    const user = await prisma.user.create({
      data: { email: parsed.email, passwordHash, name: parsed.name, familyId: session.familyId },
    });
    userId = user.id;
  }

  const member = await prisma.familyMember.create({
    data: {
      familyId: session.familyId,
      userId,
      name: parsed.name,
      role: parsed.role,
      avatarColor: parsed.avatarColor || AVATAR_COLORS[Math.floor(Math.random() * AVATAR_COLORS.length)],
    },
  });

  await writeAuditLog({
    familyId: session.familyId,
    memberId: session.memberId,
    entityType: "MEMBER",
    entityId: member.id,
    action: "CREATE",
    summary: `Thêm thành viên "${parsed.name}"`,
  });

  revalidatePath("/members");
}

export async function updateMemberAction(id: string, input: Pick<MemberInput, "name" | "role" | "avatarColor">) {
  const session = await requireAdmin();
  const parsed = memberSchema.pick({ name: true, role: true, avatarColor: true }).parse(input);

  if (input.role !== "ADMIN") {
    const admins = await prisma.familyMember.count({
      where: { familyId: session.familyId, role: "ADMIN", isActive: true, id: { not: id } },
    });
    if (admins === 0) throw new Error("Gia đình phải có ít nhất một Quản trị viên");
  }

  await prisma.familyMember.update({
    where: { id, familyId: session.familyId },
    data: { name: parsed.name, role: parsed.role, avatarColor: parsed.avatarColor },
  });
  revalidatePath("/members");
}

export async function deactivateMemberAction(id: string) {
  const session = await requireAdmin();
  const member = await prisma.familyMember.findFirst({ where: { id, familyId: session.familyId } });
  if (!member) throw new Error("Không tìm thấy thành viên");

  if (member.role === "ADMIN") {
    const otherAdmins = await prisma.familyMember.count({
      where: { familyId: session.familyId, role: "ADMIN", isActive: true, id: { not: id } },
    });
    if (otherAdmins === 0) throw new Error("Gia đình phải có ít nhất một Quản trị viên đang hoạt động");
  }

  await prisma.familyMember.update({ where: { id }, data: { isActive: false } });

  await writeAuditLog({
    familyId: session.familyId,
    memberId: session.memberId,
    entityType: "MEMBER",
    entityId: id,
    action: "DELETE",
    summary: `Ẩn thành viên "${member.name}"`,
  });

  revalidatePath("/members");
}
