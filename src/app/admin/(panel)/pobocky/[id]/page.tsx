import { AdminBranchFormView } from "@/features/admin/views/admin-branch-form-view";
import type { Id } from "@/convex/_generated/dataModel";

export default async function AdminBranchEditPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;
  return <AdminBranchFormView mode="edit" branchId={id as Id<"branches">} />;
}
