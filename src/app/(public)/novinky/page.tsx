import Link from "next/link";
import Image from "next/image";
import { format } from "date-fns";
import { cs } from "date-fns/locale";
import { fetchQuery } from "convex/nextjs";
import { api } from "@/convex/_generated/api";
import { getBranchSlugFromHeaders } from "@/common/lib/branch";
import { PageHero } from "@/features/site/components/page-hero";

export default async function NewsListPage() {
  const slug = await getBranchSlugFromHeaders();
  if (!slug) {
    return (
      <PageHero
        eyebrow="Novinky"
        title="Novinky z našich poboček"
        description="Vyberte konkrétní pobočku, kde si přečtete její novinky."
      />
    );
  }

  const branch = await fetchQuery(api.modules.branches.queries.getBySlug, {
    slug,
  }).catch(() => null);
  if (!branch) {
    return (
      <PageHero eyebrow="Novinky" title="Pobočka nenalezena" />
    );
  }
  const news = await fetchQuery(api.modules.news.queries.listForBranch, {
    branchId: branch._id,
  }).catch(() => []);

  return (
    <>
      <PageHero
        eyebrow="Novinky"
        title="Co nového u nás"
        description={`Aktuality z ${branch.name}.`}
      />
      <section className="mx-auto max-w-5xl px-4 py-16 sm:px-6 lg:px-8">
        {news.length === 0 ? (
          <p className="text-muted-foreground">Žádné novinky k zobrazení.</p>
        ) : (
          <ul className="space-y-6">
            {news.map((n) => (
              <li
                key={n._id}
                className="grid gap-5 rounded-xl border border-border bg-card p-5 sm:grid-cols-[200px_1fr]"
              >
                {n.cover_image ? (
                  <div className="relative aspect-[4/3] overflow-hidden rounded-md">
                    <Image
                      src={n.cover_image}
                      alt={n.title}
                      fill
                      sizes="200px"
                      className="object-cover"
                    />
                  </div>
                ) : null}
                <div>
                  <div className="text-xs uppercase tracking-wider text-muted-foreground">
                    {format(new Date(n.published_at), "d. MMMM yyyy", {
                      locale: cs,
                    })}
                  </div>
                  <Link
                    href={`/novinky/${n.slug}`}
                    className="mt-1 block text-xl font-semibold text-foreground hover:text-brand"
                  >
                    {n.title}
                  </Link>
                  <p className="mt-2 text-sm text-muted-foreground">
                    {n.excerpt}
                  </p>
                </div>
              </li>
            ))}
          </ul>
        )}
      </section>
    </>
  );
}
