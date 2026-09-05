import { Icon } from "@/components/icon";

export default function AuthLayout({ children }: { children: React.ReactNode }) {
  return (
    <div className="flex min-h-screen flex-col items-center justify-center bg-background px-4 py-10">
      <div className="mb-8 flex items-center gap-2.5">
        <div className="flex h-11 w-11 items-center justify-center rounded-2xl bg-brand text-brand-foreground">
          <Icon name="PiggyBank" size={24} />
        </div>
        <div>
          <p className="text-lg font-bold leading-tight">Sổ Thu Chi Gia Đình</p>
          <p className="text-xs text-muted leading-tight">Quản lý tài chính theo 6 chiếc lọ</p>
        </div>
      </div>
      <div className="w-full max-w-md">{children}</div>
    </div>
  );
}
