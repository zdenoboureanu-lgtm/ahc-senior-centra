import { notFound } from "next/navigation";
import { fetchQuery } from "convex/nextjs";
import { api } from "@/convex/_generated/api";
import { getBranchSlugFromHeaders } from "@/common/lib/branch";
import { UnitDetailView } from "@/features/branch-home/components/unit-detail-view";
import { loadBranchPageContext } from "@/features/inline-edit/load-copy";

interface PageProps {
  params: Promise<{ slug: string }>;
}

export default async function AmbulanceDetailPage({ params }: PageProps) {
  const { slug: unitSlug } = await params;
  const branchSlug = await getBranchSlugFromHeaders();
  if (!branchSlug) notFound();

  // Zkusíme ambulance, případně komplement (Lékárna, Doprava — sdílí URL)
  const data =
    (await fetchQuery(api.modules.branches.queries.getUnitBySlug, {
      branchSlug,
      unitSlug,
      category: "ambulance",
    }).catch(() => null)) ??
    (await fetchQuery(api.modules.branches.queries.getUnitBySlug, {
      branchSlug,
      unitSlug,
      category: "komplement",
    }).catch(() => null));

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
