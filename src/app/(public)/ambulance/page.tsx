import { fetchQuery } from "convex/nextjs";
import { api } from "@/convex/_generated/api";
import { getBranchSlugFromHeaders } from "@/common/lib/branch";
import { PageHero } from "@/features/site/components/page-hero";
import { AmbulancesSection } from "@/features/branch-home/components/ambulances-section";
import { DepartmentsSection } from "@/features/branch-home/components/departments-section";

export default async function AmbulancePage() {
  const slug = await getBranchSlugFromHeaders();
  const data = slug
    ? await fetchQuery(api.modules.branches.queries.getHomepage, { slug }).catch(
        () => null
      )
    : null;

  return (
    <>
      <PageHero
        eyebrow="Odborné ambulance"
        title="Specializovaná péče"
        description="Široká síť odborných ambulancí — kvalitní péče blízko domova, bez nutnosti dojíždět do velkých měst."
      />
      {data ? (
        <>
          <AmbulancesSection units={data.units} />
          <DepartmentsSection units={data.units} />
        </>
      ) : (
        <div className="mx-auto max-w-3xl px-6 py-16 text-center text-muted-foreground">
          Pobočka nenalezena.
        </div>
      )}
    </>
  );
}
