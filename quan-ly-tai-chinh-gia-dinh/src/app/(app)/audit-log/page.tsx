import Link from "next/link";
import { requireSession } from "@/lib/session";
import { prisma } from "@/lib/prisma";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Icon } from "@/components/icon";
import { formatDateTime } from "@/lib/format";
import { AUDIT_ACTION_LABEL, type AuditAction } from "@/lib/enums";

const PAGE_SIZE = 30;

const ACTION_ICON: Record<AuditAction, string> = {
  CREATE: "Plus",
  UPDATE: "Pencil",
  DELETE: "Trash2",
  RESTORE: "ArrowLeftRight",
};

const ACTION_TONE: Record<AuditAction, "success" | "brand" | "danger" | "warning"> = {
  CREATE: "success",
  UPDATE: "brand",
  DELETE: "danger",
  RESTORE: "warning",
};

export default async function AuditLogPage({
  searchParams,
}: {
  searchParams: Promise<{ page?: string }>;
}) {
  const session = await requireSession();
  const params = await searchParams;
  const page = Math.max(1, Number(params.page) || 1);

  const [logs, total] = await Promise.all([
    prisma.auditLog.findMany({
      where: { familyId: session.familyId },
      include: { member: true },
      orderBy: { createdAt: "desc" },
      skip: (page - 1) * PAGE_SIZE,
      take: PAGE_SIZE,
    }),
    prisma.auditLog.count({ where: { familyId: session.familyId } }),
  ]);

  const totalPages = Math.max(1, Math.ceil(total / PAGE_SIZE));

  return (
    <div className="mx-auto max-w-2xl space-y-5">
      <div>
        <h1 className="text-xl font-bold sm:text-2xl">Nhật ký chỉnh sửa</h1>
        <p className="text-sm text-muted">{total} hoạt động — minh bạch mọi thay đổi dữ liệu</p>
      </div>

      <Card>
        <CardContent className="divide-y divide-border p-0">
          {logs.length === 0 ? (
            <p className="py-10 text-center text-sm text-muted">Chưa có hoạt động nào được ghi lại.</p>
          ) : (
            logs.map((log) => {
              const action = log.action as AuditAction;
              return (
                <div key={log.id} className="flex items-start gap-3 p-4">
                  <div
                    className={`flex h-9 w-9 shrink-0 items-center justify-center rounded-full ${
                      action === "DELETE"
                        ? "bg-danger-soft text-danger"
                        : action === "CREATE"
                          ? "bg-success-soft text-success"
                          : action === "RESTORE"
                            ? "bg-warning-soft text-warning"
                            : "bg-brand-soft text-brand"
                    }`}
                  >
                    <Icon name={ACTION_ICON[action]} size={16} />
                  </div>
                  <div className="min-w-0 flex-1">
                    <p className="text-sm">{log.summary}</p>
                    <p className="text-xs text-muted">
                      {log.member?.name ?? "Không rõ"} · {formatDateTime(log.createdAt)}
                    </p>
                  </div>
                  <Badge tone={ACTION_TONE[action]}>{AUDIT_ACTION_LABEL[action]}</Badge>
                </div>
              );
            })
          )}
        </CardContent>
      </Card>

      {totalPages > 1 ? (
        <div className="flex items-center justify-center gap-2">
          {Array.from({ length: totalPages }, (_, i) => i + 1).map((p) => (
            <Link
              key={p}
              href={`/audit-log?page=${p}`}
              className={`flex h-8 w-8 items-center justify-center rounded-lg text-sm ${
                p === page ? "bg-brand text-brand-foreground" : "text-muted hover:bg-black/5 dark:hover:bg-white/10"
              }`}
            >
              {p}
            </Link>
          ))}
        </div>
      ) : null}
    </div>
  );
}
