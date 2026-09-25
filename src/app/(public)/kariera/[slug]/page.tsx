import Link from "next/link";
import { notFound } from "next/navigation";
import {
  ArrowLeft,
  Briefcase,
  MapPin,
  Mail,
  Phone,
  Clock,
  CheckCircle2,
  Sparkles,
  Send,
} from "lucide-react";
import { fetchQuery } from "convex/nextjs";
import { api } from "@/convex/_generated/api";
import { getBranchSlugFromHeaders } from "@/common/lib/branch";

const TYPE_LABELS = {
  full_time: "Plný úvazek",
  part_time: "Částečný úvazek",
  contract: "Dohoda o pracovní činnosti",
  internship: "Stáž",
} as const;

interface PageProps {
  params: Promise<{ slug: string }>;
}

export default async function PositionDetailPage({ params }: PageProps) {
  const { slug: positionSlug } = await params;
  const branchSlug = await getBranchSlugFromHeaders();
  if (!branchSlug) notFound();

  const branchData = await fetchQuery(
    api.modules.branches.queries.getHomepage,
    { slug: branchSlug }
  ).catch(() => null);
  if (!branchData) notFound();

  const branch = branchData.branch;

  const position = await fetchQuery(api.modules.careers.queries.getBySlug, {
    branchId: branch._id,
    slug: positionSlug,
  }).catch(() => null);

  if (!position) notFound();

  // Příbuzné pozice (jiné než tato, stejná pobočka)
  const related = (
    await fetchQuery(api.modules.careers.queries.listForBranch, {
      branchId: branch._id,
    }).catch(() => [])
  ).filter((p) => p._id !== position._id).slice(0, 3);

  const salary =
    position.salary_from && position.salary_to
      ? `${position.salary_from.toLocaleString("cs-CZ")}–${position.salary_to.toLocaleString("cs-CZ")} Kč`
      : position.salary_from
        ? `od ${position.salary_from.toLocaleString("cs-CZ")} Kč`
        : null;

  const benefitLines = (position.benefits ?? "").split("\n").map((s) => s.trim()).filter(Boolean);
  const requirementLines = (position.requirements ?? "").split("\n").map((s) => s.trim()).filter(Boolean);

  return (
    <>
      {/* ─── HERO ──────────────────────────────────────────────────── */}
      <section className="relative overflow-hidden border-b border-border/40 bg-gradient-to-br from-brand-light/40 via-background to-warm/5">
        <div
          aria-hidden="true"
          className="pointer-events-none absolute -right-32 -top-32 h-96 w-96 rounded-full bg-warm/15 blur-3xl animate-pulse-blob"
        />
        <div
          aria-hidden="true"
          className="pointer-events-none absolute -bottom-32 -left-32 h-96 w-96 rounded-full bg-brand-light/40 blur-3xl animate-float-slow"
        />

        <div className="relative mx-auto max-w-5xl px-6 py-12 lg:px-10 lg:py-16">
          <Link
            href="/kariera"
            className="inline-flex items-center gap-2 text-sm font-semibold text-brand hover:underline"
          >
            <ArrowLeft className="h-4 w-4" strokeWidth={2.25} />
            Všechny pozice
          </Link>

          <div className="mt-8 flex flex-col gap-6 lg:flex-row lg:items-start lg:justify-between">
            <div className="flex-1">
              <div className="flex flex-wrap items-center gap-2">
                <span className="inline-flex items-center gap-1.5 rounded-full bg-emerald-500/10 px-3 py-1 text-[10px] font-bold uppercase tracking-wider text-emerald-700">
                  <span className="h-1.5 w-1.5 rounded-full bg-emerald-500" />
                  Otevřená pozice
                </span>
                <span className="inline-flex items-center gap-1.5 rounded-full bg-brand-light px-3 py-1 text-[10px] font-bold uppercase tracking-wider text-brand">
                  <Briefcase className="h-3 w-3" strokeWidth={2.25} />
                  {TYPE_LABELS[position.employment_type]}
                </span>
              </div>
              <h1 className="font-display mt-5 text-4xl text-foreground sm:text-5xl">
                {position.title}
              </h1>
              <div className="mt-4 flex flex-wrap items-center gap-x-5 gap-y-2 text-sm text-muted-foreground">
                <span className="inline-flex items-center gap-2">
                  <MapPin className="h-4 w-4 text-brand" strokeWidth={2} />
                  AHC Senior centrum {branch.short_name}, {branch.city}
                </span>
                <span className="inline-flex items-center gap-2">
                  <Clock className="h-4 w-4 text-brand" strokeWidth={2} />
                  Nástup ihned / dle dohody
                </span>
              </div>
              {salary ? (
                <div className="mt-6 inline-flex items-center rounded-2xl bg-warm/20 px-4 py-2 text-base font-bold text-brand-dark">
                  Mzda {salary}
                </div>
              ) : null}
            </div>

            {/* Apply panel */}
            <div className="lg:w-[320px] lg:shrink-0">
              <div className="rounded-2xl border border-border/60 bg-card p-6 shadow-md">
                <div className="text-[11px] font-bold uppercase tracking-[0.22em] text-warm-dark">
                  Mám zájem
                </div>
                <p className="mt-2 text-sm text-muted-foreground">
                  Pošlete životopis nebo nám zavolejte — ozveme se vám zpět
                  zpravidla do 24 hodin.
                </p>
                <div className="mt-5 flex flex-col gap-2">
                  <a
                    href={`mailto:${branch.email}?subject=Reakce na pozici: ${encodeURIComponent(position.title)}`}
                    className="inline-flex items-center justify-center gap-2 rounded-full bg-brand px-5 py-3 text-sm font-semibold text-brand-foreground shadow-md shadow-brand/15 transition-all hover:bg-brand-dark hover:shadow-lg"
                  >
                    <Send className="h-4 w-4" strokeWidth={2} />
                    Reagovat na pozici
                  </a>
                  <a
                    href={`tel:${branch.phone.replace(/\s/g, "")}`}
                    className="inline-flex items-center justify-center gap-2 rounded-full border border-border bg-background px-5 py-3 text-sm font-semibold text-foreground hover:border-brand hover:text-brand"
                  >
                    <Phone className="h-4 w-4 text-brand" strokeWidth={2} />
                    {branch.phone}
                  </a>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* ─── OBSAH ─────────────────────────────────────────────────── */}
      <section className="mx-auto max-w-5xl px-6 py-16 lg:px-10 lg:py-20">
        <div className="grid gap-12 lg:grid-cols-3 lg:gap-16">
          <div className="lg:col-span-2">
            <h2 className="font-display text-2xl text-foreground sm:text-3xl">
              O pozici
            </h2>
            <div className="mt-6 text-base leading-[1.75] text-muted-foreground whitespace-pre-wrap">
              {position.description}
            </div>

            {requirementLines.length > 0 ? (
              <div className="mt-12">
                <h2 className="font-display text-2xl text-foreground sm:text-3xl">
                  Co od vás potřebujeme
                </h2>
                <ul className="mt-6 space-y-3">
                  {requirementLines.map((line, i) => (
                    <li key={i} className="flex items-start gap-3">
                      <CheckCircle2
                        className="mt-0.5 h-5 w-5 shrink-0 text-brand"
                        strokeWidth={2}
                      />
                      <span className="text-base leading-relaxed text-foreground">
                        {line}
                      </span>
                    </li>
                  ))}
                </ul>
              </div>
            ) : null}

            {benefitLines.length > 0 ? (
              <div className="mt-12">
                <h2 className="font-display text-2xl text-foreground sm:text-3xl">
                  Co nabízíme
                </h2>
                <ul className="mt-6 grid gap-3 sm:grid-cols-2">
                  {benefitLines.map((line, i) => (
                    <li
                      key={i}
                      className="flex items-start gap-3 rounded-2xl border border-border/60 bg-card p-4"
                    >
                      <Sparkles
                        className="mt-0.5 h-4 w-4 shrink-0 text-warm-dark"
                        strokeWidth={2}
                      />
                      <span className="text-sm leading-relaxed text-foreground">
                        {line}
                      </span>
                    </li>
                  ))}
                </ul>
              </div>
            ) : null}

            {/* CTA na konci */}
            <div className="mt-14 rounded-3xl bg-gradient-to-br from-brand to-brand-dark p-8 text-brand-foreground shadow-xl shadow-brand/20 sm:p-10">
              <h3 className="font-display text-2xl sm:text-3xl">
                Zaujala vás tato pozice?
              </h3>
              <p className="mt-3 max-w-md text-brand-foreground/85">
                Napište nám životopis a pár vět o sobě — těšíme se na vás.
              </p>
              <div className="mt-6 flex flex-wrap gap-3">
                <a
                  href={`mailto:${branch.email}?subject=Reakce na pozici: ${encodeURIComponent(position.title)}`}
                  className="inline-flex items-center gap-2 rounded-full bg-brand-foreground px-5 py-3 text-sm font-semibold text-brand transition-colors hover:bg-warm hover:text-warm-foreground"
                >
                  <Mail className="h-4 w-4" strokeWidth={2} />
                  {branch.email}
                </a>
                <a
                  href={`tel:${branch.phone.replace(/\s/g, "")}`}
                  className="inline-flex items-center gap-2 rounded-full border-2 border-brand-foreground/40 px-5 py-3 text-sm font-semibold text-brand-foreground hover:border-warm hover:text-warm"
                >
                  <Phone className="h-4 w-4" strokeWidth={2} />
                  {branch.phone}
                </a>
              </div>
            </div>
          </div>

          {/* Sidebar */}
          <aside className="space-y-6 lg:sticky lg:top-24 lg:self-start">
            <div className="rounded-2xl border border-border/60 bg-card p-6">
              <div className="text-[11px] font-bold uppercase tracking-[0.22em] text-warm-dark">
                Detaily pozice
              </div>
              <dl className="mt-5 space-y-4 text-sm">
                <div>
                  <dt className="text-xs uppercase tracking-wider text-muted-foreground">
                    Lokalita
                  </dt>
                  <dd className="mt-1 font-semibold text-foreground">
                    {branch.city}, {branch.region}
                  </dd>
                </div>
                <div>
                  <dt className="text-xs uppercase tracking-wider text-muted-foreground">
                    Úvazek
                  </dt>
                  <dd className="mt-1 font-semibold text-foreground">
                    {TYPE_LABELS[position.employment_type]}
                  </dd>
                </div>
                {salary ? (
                  <div>
                    <dt className="text-xs uppercase tracking-wider text-muted-foreground">
                      Mzda
                    </dt>
                    <dd className="mt-1 font-semibold text-foreground">
                      {salary}
                    </dd>
                  </div>
                ) : null}
                <div>
                  <dt className="text-xs uppercase tracking-wider text-muted-foreground">
                    Zaměstnavatel
                  </dt>
                  <dd className="mt-1 font-semibold text-foreground">
                    {branch.legal_name ?? `AHC Senior centrum ${branch.short_name}`}
                  </dd>
                </div>
              </dl>
            </div>
          </aside>
        </div>
      </section>

      {/* ─── PŘÍBUZNÉ POZICE ───────────────────────────────────────── */}
      {related.length > 0 ? (
        <section className="border-t border-border/40 bg-secondary/30">
          <div className="mx-auto max-w-5xl px-6 py-16 lg:px-10 lg:py-20">
            <div className="text-[11px] font-bold uppercase tracking-[0.22em] text-warm-dark">
              Další pozice u nás
            </div>
            <h2 className="font-display mt-2 text-2xl text-foreground sm:text-3xl">
              Možná vás zaujme i…
            </h2>
            <ul className="mt-8 grid gap-5 sm:grid-cols-2 lg:grid-cols-3">
              {related.map((p) => (
                <li key={p._id}>
                  <Link
                    href={`/kariera/${p.slug}`}
                    className="group flex h-full flex-col rounded-2xl border border-border bg-card p-6 transition-all hover:-translate-y-1 hover:border-brand/40 hover:shadow-md"
                  >
                    <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-brand-light text-brand transition-colors group-hover:bg-brand group-hover:text-brand-foreground">
                      <Briefcase className="h-4 w-4" strokeWidth={2} />
                    </div>
                    <h3 className="font-display mt-4 text-lg text-foreground group-hover:text-brand">
                      {p.title}
                    </h3>
                    <div className="mt-1 text-xs text-muted-foreground">
                      {TYPE_LABELS[p.employment_type]} · {branch.city}
                    </div>
                  </Link>
                </li>
              ))}
            </ul>
          </div>
        </section>
      ) : null}
    </>
  );
}
