import { fetchQuery } from "convex/nextjs";
import { api } from "@/convex/_generated/api";
import { getBranchSlugFromHeaders } from "@/common/lib/branch";
import { PageHero } from "@/features/site/components/page-hero";
import { DepartmentsSection } from "@/features/branch-home/components/departments-section";
import { AmbulancesSection } from "@/features/branch-home/components/ambulances-section";

export default async function DepartmentsPage() {
  const slug = await getBranchSlugFromHeaders();
  const data = slug
    ? await fetchQuery(api.modules.branches.queries.getHomepage, { slug }).catch(
        () => null
      )
    : null;

  return (
    <>
      <PageHero
        eyebrow="Lůžková péče"
        title="Naše oddělení"
        description="Akutní i následná lůžková péče, jednodenní chirurgie a domácí zdravotní péče pod jednou střechou."
      />
      {data ? (
        <>
          <DepartmentsSection units={data.units} />
          <AmbulancesSection units={data.units} />
        </>
      ) : (
        <div className="mx-auto max-w-3xl px-6 py-16 text-center text-muted-foreground">
          Pobočka nenalezena.
        </div>
      )}
    </>
  );
}
