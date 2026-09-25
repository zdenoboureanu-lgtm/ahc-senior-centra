import { getBranchSlugFromHeaders } from "@/common/lib/branch";
import { BranchHomeView } from "@/features/branch-home/views/branch-home-view";
import { GlobalHomeView } from "@/features/site/views/global-home-view";
import { DomuSedlec } from "@/features/branch-page/components/domu-sedlec";
import { fetchQuery } from "convex/nextjs";
import { api } from "@/convex/_generated/api";
import { loadBranchPageContext } from "@/features/inline-edit/load-copy";
import { SEDLEC_TEMPLATE } from "@/common/lib/branch-template";

export default async function HomePage() {
  const slug = await getBranchSlugFromHeaders();

  if (slug) {
    const ctx = await loadBranchPageContext(slug);
    if (ctx.template === SEDLEC_TEMPLATE) {
      const data = await fetchQuery(
        api.modules.branches.queries.getHomepage,
        { slug }
      ).catch(() => null);
      return (
        <DomuSedlec
          branch={data?.branch ?? null}
          grants={data?.grants ?? []}
          stats={data?.stats}
          copy={ctx.copy}
          editBranchId={ctx.editBranchId}
        />
      );
    }
    return <BranchHomeView slug={slug} />;
  }
  return <GlobalHomeView />;
}
