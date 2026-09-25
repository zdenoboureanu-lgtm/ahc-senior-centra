import { AdminCareerFormView } from "@/features/admin/views/admin-career-form-view";
import type { Id } from "@/convex/_generated/dataModel";

export default async function AdminCareerEditPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;
  return <AdminCareerFormView mode="edit" positionId={id as Id<"career_positions">} />;
}
