import { redirect } from "next/navigation";
import { isAuthenticatedNextjs } from "@convex-dev/auth/nextjs/server";
import { AdminShell } from "@/features/admin/components/admin-shell";

export default async function AdminLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const authed = await isAuthenticatedNextjs();
  if (!authed) redirect("/admin/login");
  return <AdminShell>{children}</AdminShell>;
}
