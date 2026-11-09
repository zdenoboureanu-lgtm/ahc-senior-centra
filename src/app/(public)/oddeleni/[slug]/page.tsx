import { notFound } from "next/navigation";
import { fetchQuery } from "convex/nextjs";
import { api } from "@/convex/_generated/api";
import { getBranchSlugFromHeaders } from "@/common/lib/branch";
import { UnitDetailView } from "@/features/branch-home/components/unit-detail-view";
import { loadBranchPageContext } from "@/features/inline-edit/load-copy";
import { canEditContent } from "@/common/lib/can-edit";

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

  // Texty jednotky držíme jako článkovou podstránku `unit:<slug>`.
  const [ctx, unitPage, canEdit] = await Promise.all([
    loadBranchPageContext(branchSlug),
    fetchQuery(api.modules.branches.queries.getBranchPage, {
      slug: branchSlug,
      page: `unit:${unitSlug}`,
    }).catch(() => null),
    canEditContent(),
  ]);

  return (
    <UnitDetailView
      branch={data.branch}
      unit={data.unit}
      related={data.related}
      page={unitPage}
      editPageId={canEdit && unitPage ? unitPage._id : undefined}
      copy={ctx.copy}
      editBranchId={ctx.editBranchId}
    />
  );
}
