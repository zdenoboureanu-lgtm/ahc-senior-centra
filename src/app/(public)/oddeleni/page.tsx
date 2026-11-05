import { fetchQuery } from "convex/nextjs";
import { api } from "@/convex/_generated/api";
import { getBranchSlugFromHeaders } from "@/common/lib/branch";
import { PageHero } from "@/features/site/components/page-hero";
import { DepartmentsSection } from "@/features/branch-home/components/departments-section";
import { AmbulancesSection } from "@/features/branch-home/components/ambulances-section";
import { loadBranchPageContext } from "@/features/inline-edit/load-copy";
import { makeCopy } from "@/features/inline-edit/copy";

export default async function DepartmentsPage() {
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
        eyebrow={c.s("oddeleni.hero.eyebrow", "Lůžková péče")}
        title={c.s("oddeleni.hero.title", "Naše oddělení")}
        description={c.s("oddeleni.hero.text", "Akutní i následná lůžková péče, jednodenní chirurgie a domácí zdravotní péče pod jednou střechou.")}
        editTargets={{
          eyebrow: c.target("oddeleni.hero.eyebrow"),
          title: c.target("oddeleni.hero.title"),
          lead: c.target("oddeleni.hero.text"),
        }}
      />
      {data ? (
        <>
          <DepartmentsSection units={data.units} {...edit} />
          <AmbulancesSection units={data.units} {...edit} />
        </>
      ) : (
        <div className="mx-auto max-w-3xl px-6 py-16 text-center text-muted-foreground">
          Pobočka nenalezena.
        </div>
      )}
    </>
  );
}
