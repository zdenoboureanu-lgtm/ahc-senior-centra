import { fetchQuery } from "convex/nextjs";
import { api } from "@/convex/_generated/api";
import { getBranchSlugFromHeaders } from "@/common/lib/branch";
import { PageHero } from "@/features/site/components/page-hero";
import { DepartmentsSection } from "@/features/branch-home/components/departments-section";
import { AmbulancesSection } from "@/features/branch-home/components/ambulances-section";
import { loadBranchPageContext } from "@/features/inline-edit/load-copy";
import { makeCopy } from "@/features/inline-edit/copy";

export default async function AmbulancePage() {
  const slug = await getBranchSlugFromHeaders();
  const [data, ctx] = await Promise.all([
    slug
      ? fetchQuery(api.modules.branches.queries.getHomepage, { slug }).catch(
          () => null
        )
      : Promise.resolve(null),
    slug
      ? loadBranchPageContext(slug)
      : Promise.resolve({ copy: {}, editBranchId: undefined }),
  ]);
  const c = makeCopy(ctx);
  const edit = { copy: ctx.copy, editBranchId: ctx.editBranchId };

  return (
    <>
      <PageHero
        eyebrow={c.s("ambulance.hero.eyebrow", "Odborné ambulance")}
        title={c.s("ambulance.hero.title", "Specializovaná péče")}
        description={c.s("ambulance.hero.text", "Široká síť odborných ambulancí — kvalitní péče blízko domova, bez nutnosti dojíždět do velkých měst.")}
        editTargets={{
          eyebrow: c.target("ambulance.hero.eyebrow"),
          title: c.target("ambulance.hero.title"),
          lead: c.target("ambulance.hero.text"),
        }}
      />
      {data ? (
        <>
          <AmbulancesSection units={data.units} {...edit} />
          <DepartmentsSection units={data.units} {...edit} />
        </>
      ) : (
        <div className="mx-auto max-w-3xl px-6 py-16 text-center text-muted-foreground">
          Pobočka nenalezena.
        </div>
      )}
    </>
  );
}
