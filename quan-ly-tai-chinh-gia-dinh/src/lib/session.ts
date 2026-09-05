import "server-only";
import { cookies } from "next/headers";
import { SignJWT, jwtVerify } from "jose";
import { redirect } from "next/navigation";
import { prisma } from "./prisma";
import type { MemberRole } from "./enums";

const SESSION_COOKIE = "family_finance_session";
const secretKey = new TextEncoder().encode(
  process.env.AUTH_SECRET ?? "dev-only-secret-change-in-production"
);

export type SessionPayload = {
  userId: string;
  familyId: string;
  memberId: string;
  role: MemberRole;
  name: string;
  email: string;
};

export async function createSession(payload: SessionPayload) {
  const token = await new SignJWT({ ...payload })
    .setProtectedHeader({ alg: "HS256" })
    .setIssuedAt()
    .setExpirationTime("30d")
    .sign(secretKey);

  const cookieStore = await cookies();
  cookieStore.set(SESSION_COOKIE, token, {
    httpOnly: true,
    secure: process.env.NODE_ENV === "production",
    sameSite: "lax",
    path: "/",
    maxAge: 60 * 60 * 24 * 30,
  });
}

export async function destroySession() {
  const cookieStore = await cookies();
  cookieStore.delete(SESSION_COOKIE);
}

export async function getSession(): Promise<SessionPayload | null> {
  const cookieStore = await cookies();
  const token = cookieStore.get(SESSION_COOKIE)?.value;
  if (!token) return null;
  try {
    const { payload } = await jwtVerify(token, secretKey);
    return payload as unknown as SessionPayload;
  } catch {
    return null;
  }
}

/** Dùng trong Server Component/Server Action: bắt buộc đăng nhập, trả về session.
 *  Nếu phiên còn hợp lệ về mặt chữ ký nhưng gia đình/thành viên đã bị xóa (VD: dữ liệu
 *  dev bị reset), hủy cookie và đưa về trang đăng nhập thay vì để lỗi 500 lan ra UI. */
export async function requireSession(): Promise<SessionPayload> {
  const session = await getSession();
  if (!session) redirect("/login");

  const member = await prisma.familyMember.findFirst({
    where: { id: session.memberId, familyId: session.familyId },
    select: { id: true },
  });
  if (!member) {
    // Server Component không được phép ghi cookie — chuyển qua Route Handler để hủy phiên.
    redirect("/api/session-cleanup");
  }

  return session;
}

/** Bắt buộc là Quản trị viên gia đình. */
export async function requireAdmin(): Promise<SessionPayload> {
  const session = await requireSession();
  if (session.role !== "ADMIN") redirect("/dashboard?error=forbidden");
  return session;
}

/** Lấy family hiện tại kèm settings, dùng cho các trang cần currency/format. */
export async function getCurrentFamily() {
  const session = await requireSession();
  const family = await prisma.family.findUniqueOrThrow({
    where: { id: session.familyId },
    include: { settings: true },
  });
  return { session, family };
}

export { SESSION_COOKIE };
