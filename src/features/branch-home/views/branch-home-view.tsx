import { fetchQuery } from "convex/nextjs";
import { api } from "@/convex/_generated/api";
import { HomeLayout } from "../components/home-layout";
import { loadBranchPageContext } from "@/features/inline-edit/load-copy";

interface BranchHomeViewProps {
  slug: string;
}

/**
 * Úvodní stránka pobočky. Skladbu i vzhled drží `HomeLayout` — společný pro
 * celou síť — a plní se daty konkrétní pobočky.
 */
export async function BranchHomeView({ slug }: BranchHomeViewProps) {
  const [data, ctx] = await Promise.all([
    fetchQuery(api.modules.branches.queries.getHomepage, { slug }).catch(
      () => null
    ),
    loadBranchPageContext(slug),
  ]);

  if (!data) {
    return (
      <div className="mx-auto max-w-3xl px-4 py-24 text-center">
        <h1 className="font-display text-3xl">Pobočka nenalezena</h1>
        <p className="mt-4 text-muted-foreground">
          Pobočka <code className="rounded bg-muted px-1">{slug}</code> v
          databázi neexistuje.
        </p>
      </div>
    );
  }

  return (
    <HomeLayout
      branch={data.branch}
      highlights={data.highlights}
      services={data.services}
      aboutFeatures={data.aboutFeatures}
      facilities={data.facilities}
      gallery={data.gallery}
      testimonials={data.testimonials}
      stats={data.stats}
      grants={data.grants}
      units={data.units}
      copy={ctx.copy}
      editBranchId={ctx.editBranchId}
    />
  );
}
