import "server-only";
import { prisma } from "@/lib/prisma";

const CODE_CHARS = "ABCDEFGHJKLMNPQRSTUVWXYZ23456789"; // bỏ ký tự dễ nhầm (0/O, 1/I)

function randomCode(length = 6) {
  let code = "";
  for (let i = 0; i < length; i++) {
    code += CODE_CHARS[Math.floor(Math.random() * CODE_CHARS.length)];
  }
  return code;
}

export async function createLinkCode(familyId: string, memberId: string): Promise<string> {
  await prisma.telegramLinkCode.deleteMany({ where: { familyId, memberId } });
  const code = randomCode();
  await prisma.telegramLinkCode.create({
    data: { code, familyId, memberId, expiresAt: new Date(Date.now() + 10 * 60 * 1000) },
  });
  return code;
}

export async function consumeLinkCode(
  rawCode: string,
  chatId: string
): Promise<{ ok: true; memberName: string } | { ok: false; message: string }> {
  const code = rawCode.trim().toUpperCase();
  const record = await prisma.telegramLinkCode.findUnique({ where: { code } });
  if (!record || record.expiresAt < new Date()) {
    return { ok: false, message: "Mã liên kết không đúng hoặc đã hết hạn. Vào app > Cài đặt > Liên kết Telegram để lấy mã mới." };
  }

  const member = await prisma.familyMember.findUnique({ where: { id: record.memberId } });
  if (!member) return { ok: false, message: "Không tìm thấy thành viên tương ứng." };

  await prisma.$transaction([
    prisma.telegramLink.upsert({
      where: { chatId },
      update: { familyId: record.familyId, memberId: record.memberId },
      create: { familyId: record.familyId, memberId: record.memberId, chatId },
    }),
    prisma.telegramLinkCode.delete({ where: { code } }),
  ]);

  return { ok: true, memberName: member.name };
}

export async function getLinkedMember(chatId: string) {
  return prisma.telegramLink.findUnique({ where: { chatId } });
}
