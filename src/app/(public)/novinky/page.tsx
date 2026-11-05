import Link from "next/link";
import Image from "next/image";
import { ArrowRight } from "lucide-react";
import { format } from "date-fns";
import { cs } from "date-fns/locale";
import { fetchQuery } from "convex/nextjs";
import { api } from "@/convex/_generated/api";
import { getBranchSlugFromHeaders } from "@/common/lib/branch";
import { PageHero } from "@/features/site/components/page-hero";
import { loadBranchPageContext } from "@/features/inline-edit/load-copy";
import { makeCopy } from "@/features/inline-edit/copy";
import {
  RegionSlot,
  TextSlot,
} from "@/features/inline-edit/components/content-slot";

const wrap = "mx-auto max-w-[1320px] px-6 lg:px-10";

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
    return <PageHero eyebrow="Novinky" title="Pobočka nenalezena" />;
  }

  const [news, ctx] = await Promise.all([
    fetchQuery(api.modules.news.queries.listForBranch, {
      branchId: branch._id,
    }).catch(() => []),
    loadBranchPageContext(slug),
  ]);
  const c = makeCopy(ctx);

  /** Titulek a perex jdou opravit i tady; zbytek článku patří do administrace. */
  const field = (id: string, name: "title" | "excerpt") =>
    ctx.editBranchId
      ? ({ kind: "field", table: "branch_news", id, field: name } as const)
      : undefined;

  return (
    <>
      <PageHero
        eyebrow={c.s("novinky.hero.eyebrow", "Novinky")}
        title={c.s("novinky.hero.title", "Co nového u nás")}
        description={c.s("novinky.hero.text", `Aktuality z ${branch.name}.`)}
        editTargets={{
          eyebrow: c.target("novinky.hero.eyebrow"),
          title: c.target("novinky.hero.title"),
          lead: c.target("novinky.hero.text"),
        }}
      />

      <section className={`${wrap} py-16 lg:py-20`}>
        {news.length === 0 ? (
          <p className="text-muted-foreground">
            {c.s("novinky.prazdne", "Žádné novinky k zobrazení.")}
          </p>
        ) : (
          <ul className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
            {news.map((n) => (
              <li key={n._id}>
                <RegionSlot
                  className="h-full"
                  {...c.region(`row:branch_news:${n._id}`)}
                >
                  <article className="group flex h-full flex-col overflow-hidden rounded-3xl border border-border bg-card transition-all hover:-translate-y-1 hover:border-brand/40 hover:shadow-lg">
                    {n.cover_image ? (
                      <div className="relative aspect-[16/9] bg-muted">
                        <Image
                          src={n.cover_image}
                          alt={n.title}
                          fill
                          sizes="(min-width:1024px) 30vw, 100vw"
                          className="object-cover"
                        />
                      </div>
                    ) : null}
                    <div className="flex flex-1 flex-col p-7">
                      <div className="text-[11px] font-bold uppercase tracking-[0.18em] text-warm-dark">
                        {format(new Date(n.published_at), "d. MMMM yyyy", {
                          locale: cs,
                        })}
                      </div>
                      <TextSlot
                        as="h2"
                        target={field(n._id, "title")}
                        value={n.title}
                        className="font-display mt-2 block text-xl text-foreground group-hover:text-brand"
                      />
                      {n.excerpt ? (
                        <TextSlot
                          as="p"
                          target={field(n._id, "excerpt")}
                          value={n.excerpt}
                          className="mt-2 block flex-1 text-[15px] leading-relaxed text-muted-foreground"
                        />
                      ) : (
                        <div className="flex-1" />
                      )}
                      <Link
                        href={`/novinky/${n.slug}`}
                        className="mt-5 inline-flex items-center gap-1.5 text-xs font-bold uppercase tracking-wider text-brand hover:gap-2.5"
                      >
                        {c.s("novinky.cist", "Číst dál")}{" "}
                        <ArrowRight className="h-3.5 w-3.5" />
                      </Link>
                    </div>
                  </article>
                </RegionSlot>
              </li>
            ))}
          </ul>
        )}
      </section>
    </>
  );
}
