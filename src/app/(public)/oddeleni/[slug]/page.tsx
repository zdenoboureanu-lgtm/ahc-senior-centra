import { notFound } from "next/navigation";
import { fetchQuery } from "convex/nextjs";
import { api } from "@/convex/_generated/api";
import { getBranchSlugFromHeaders } from "@/common/lib/branch";
import { UnitDetailView } from "@/features/branch-home/components/unit-detail-view";
import { loadBranchPageContext } from "@/features/inline-edit/load-copy";

interface PageProps {
  params: Promise<{ slug: string }>;
}

export default async function OddeleniDetailPage({ params }: PageProps) {
  const { slug: unitSlug } = await params;
  const branchSlug = await getBranchSlugFromHeaders();
  if (!branchSlug) notFound();

  const data = await fetchQuery(api.modules.branches.queries.getUnitBySlug, {
    branchSlug,
    unitSlug,
    category: "oddeleni",
  }).catch(() => null);

  if (!data) notFound();

  const ctx = await loadBranchPageContext(branchSlug);

  return (
    <UnitDetailView
      branch={data.branch}
      unit={data.unit}
      related={data.related}
      copy={ctx.copy}
      editBranchId={ctx.editBranchId}
    />
  );
}
