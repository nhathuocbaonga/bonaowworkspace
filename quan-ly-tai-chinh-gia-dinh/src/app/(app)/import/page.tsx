"use client";

import { useRef, useState, useTransition } from "react";
import { useRouter } from "next/navigation";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Icon } from "@/components/icon";
import { parseCsv, csvRowsToObjects } from "@/lib/csv-parse";
import { importTransactionsAction, type ImportRow } from "@/lib/actions/import";

const REQUIRED_COLUMNS = ["Ngày", "Loại giao dịch", "Số tiền", "Danh mục", "Tài khoản"];

export default function ImportPage() {
  const router = useRouter();
  const fileInputRef = useRef<HTMLInputElement>(null);
  const [fileName, setFileName] = useState<string | null>(null);
  const [rows, setRows] = useState<Record<string, string>[]>([]);
  const [columnError, setColumnError] = useState<string | null>(null);
  const [result, setResult] = useState<Awaited<ReturnType<typeof importTransactionsAction>> | null>(null);
  const [pending, startTransition] = useTransition();

  function handleFile(file: File) {
    setFileName(file.name);
    setResult(null);
    setColumnError(null);
    const reader = new FileReader();
    reader.onload = () => {
      const text = String(reader.result ?? "");
      const parsedRows = csvRowsToObjects(parseCsv(text));
      if (parsedRows.length === 0) {
        setColumnError("File không có dữ liệu.");
        setRows([]);
        return;
      }
      const columns = Object.keys(parsedRows[0]);
      const missing = REQUIRED_COLUMNS.filter((c) => !columns.includes(c));
      if (missing.length > 0) {
        setColumnError(`File thiếu cột bắt buộc: ${missing.join(", ")}. Vui lòng dùng đúng file mẫu.`);
        setRows([]);
        return;
      }
      setRows(parsedRows);
    };
    reader.readAsText(file, "utf-8");
  }

  function confirmImport() {
    startTransition(async () => {
      const res = await importTransactionsAction(rows as unknown as ImportRow[]);
      setResult(res);
      router.refresh();
    });
  }

  return (
    <div className="mx-auto max-w-3xl space-y-5">
      <div>
        <h1 className="text-xl font-bold sm:text-2xl">Nhập giao dịch từ CSV</h1>
        <p className="text-sm text-muted">Nhập hàng loạt giao dịch thu/chi từ file CSV (mở được bằng Excel).</p>
      </div>

      <Card>
        <CardContent className="space-y-4 p-5">
          <a href="/api/export/import-template" className="inline-flex items-center gap-2 text-sm font-medium text-brand hover:underline">
            <Icon name="ArrowLeftRight" size={14} /> Tải file mẫu CSV
          </a>

          <div>
            <input
              ref={fileInputRef}
              type="file"
              accept=".csv,text/csv"
              className="hidden"
              onChange={(e) => {
                const file = e.target.files?.[0];
                if (file) handleFile(file);
              }}
            />
            <button
              onClick={() => fileInputRef.current?.click()}
              className="flex w-full flex-col items-center gap-2 rounded-2xl border-2 border-dashed border-border py-8 text-sm text-muted hover:border-brand hover:text-brand"
            >
              <Icon name="Plus" size={24} />
              {fileName ? `Đã chọn: ${fileName}` : "Chọn file CSV để tải lên"}
            </button>
          </div>

          {columnError ? (
            <div className="flex items-center gap-2 rounded-xl bg-danger-soft px-3 py-2.5 text-sm text-danger">
              <Icon name="AlertTriangle" size={16} />
              {columnError}
            </div>
          ) : null}

          {rows.length > 0 && !result ? (
            <>
              <p className="text-sm">
                Xem trước <strong>{Math.min(10, rows.length)}</strong> / {rows.length} dòng:
              </p>
              <div className="overflow-x-auto rounded-xl border border-border">
                <table className="w-full text-left text-xs">
                  <thead className="bg-black/5 dark:bg-white/5">
                    <tr>
                      {Object.keys(rows[0]).map((col) => (
                        <th key={col} className="whitespace-nowrap px-2.5 py-2 font-semibold">
                          {col}
                        </th>
                      ))}
                    </tr>
                  </thead>
                  <tbody>
                    {rows.slice(0, 10).map((r, i) => (
                      <tr key={i} className="border-t border-border">
                        {Object.values(r).map((v, j) => (
                          <td key={j} className="whitespace-nowrap px-2.5 py-2">
                            {v}
                          </td>
                        ))}
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
              <Button onClick={confirmImport} disabled={pending}>
                {pending ? "Đang nhập..." : `Xác nhận nhập ${rows.length} giao dịch`}
              </Button>
            </>
          ) : null}

          {result ? (
            <div className="space-y-3">
              <div className="flex items-center gap-2 rounded-xl bg-success-soft px-3 py-2.5 text-sm text-success">
                <Icon name="CheckCircle2" size={16} />
                Đã nhập thành công {result.imported}/{result.total} giao dịch.
              </div>
              {result.results.some((r) => r.status === "SKIPPED") ? (
                <div>
                  <p className="mb-2 text-sm font-medium">Các dòng bị bỏ qua:</p>
                  <div className="space-y-1 text-xs text-muted">
                    {result.results
                      .filter((r) => r.status === "SKIPPED")
                      .map((r) => (
                        <p key={r.row}>
                          Dòng {r.row}: {r.reason}
                        </p>
                      ))}
                  </div>
                </div>
              ) : null}
              <Button
                variant="outline"
                onClick={() => {
                  setRows([]);
                  setResult(null);
                  setFileName(null);
                  if (fileInputRef.current) fileInputRef.current.value = "";
                }}
              >
                Nhập file khác
              </Button>
            </div>
          ) : null}
        </CardContent>
      </Card>
    </div>
  );
}
