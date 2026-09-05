import { NextResponse } from "next/server";
import { destroySession } from "@/lib/session";

// Route Handler (không phải Server Component) nên được phép xóa cookie —
// dùng khi phiên đăng nhập còn hợp lệ về chữ ký nhưng gia đình/thành viên đã bị xóa.
export async function GET(request: Request) {
  await destroySession();
  return NextResponse.redirect(new URL("/login", request.url));
}
