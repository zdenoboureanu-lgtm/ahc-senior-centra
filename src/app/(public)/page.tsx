import { getBranchSlugFromHeaders } from "@/common/lib/branch";
import { BranchHomeView } from "@/features/branch-home/views/branch-home-view";
import { GlobalHomeView } from "@/features/site/views/global-home-view";
import { DomuSedlec } from "@/features/branch-page/components/domu-sedlec";
import { fetchQuery } from "convex/nextjs";
import { api } from "@/convex/_generated/api";

export default async function HomePage() {
  const slug = await getBranchSlugFromHeaders();

  if (slug === "sedlec-prcice") {
    const data = await fetchQuery(api.modules.branches.queries.getHomepage, { slug }).catch(() => null);
    return <DomuSedlec branch={data?.branch ?? null} grants={data?.grants ?? []} />;
  }

  if (slug) return <BranchHomeView slug={slug} />;
  return <GlobalHomeView />;
}
