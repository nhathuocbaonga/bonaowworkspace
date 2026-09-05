import "server-only";
import { prisma } from "./prisma";
import type { AuditAction } from "./enums";

export async function writeAuditLog(entry: {
  familyId: string;
  memberId: string | null;
  entityType: string;
  entityId: string;
  action: AuditAction;
  summary: string;
  detail?: string;
}) {
  await prisma.auditLog.create({
    data: {
      familyId: entry.familyId,
      memberId: entry.memberId,
      entityType: entry.entityType,
      entityId: entry.entityId,
      action: entry.action,
      summary: entry.summary,
      detail: entry.detail,
    },
  });
}
