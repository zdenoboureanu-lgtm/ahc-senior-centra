import Link from "next/link";
import { ArrowUpRight, Briefcase, MapPin } from "lucide-react";
import type { Doc } from "@/convex/_generated/dataModel";

const TYPE_LABELS = {
  full_time: "Plný úvazek",
  part_time: "Částečný úvazek",
  contract: "Dohoda",
  internship: "Stáž",
} as const;

interface PositionCardProps {
  position: Doc<"career_positions">;
  branch: Doc<"branches">;
  /** Pokud je `external`, odkazujeme na subdoménu pobočky */
  external?: boolean;
}

function isFresh(publishedAt: number): boolean {
  const days = (Date.now() - publishedAt) / (1000 * 60 * 60 * 24);
  return days < 14;
}

export function PositionCard({ position, branch, external }: PositionCardProps) {
  const href = external
    ? `https://${branch.slug}.ahc.cz/kariera/${position.slug}`
    : `/kariera/${position.slug}`;

  const salary =
    position.salary_from && position.salary_to
      ? `${position.salary_from.toLocaleString("cs-CZ")}–${position.salary_to.toLocaleString("cs-CZ")} Kč`
      : position.salary_from
        ? `od ${position.salary_from.toLocaleString("cs-CZ")} Kč`
        : null;

  const fresh = isFresh(position.published_at);

  return (
    <Link
      href={href}
      className="group relative flex h-full flex-col overflow-hidden rounded-2xl border border-border bg-card p-6 shadow-sm transition-all hover:-translate-y-1 hover:border-brand/40 hover:shadow-xl hover:shadow-brand/10"
    >
      {/* Decorativní gradient na hover */}
      <div
        aria-hidden="true"
        className="pointer-events-none absolute -right-12 -top-12 h-32 w-32 rounded-full bg-warm/15 opacity-0 transition-opacity duration-500 group-hover:opacity-100"
      />
      <div
        aria-hidden="true"
        className="pointer-events-none absolute -left-16 -bottom-16 h-32 w-32 rounded-full bg-brand-light/40 opacity-0 transition-opacity duration-500 group-hover:opacity-100"
      />

      <div className="relative flex items-start justify-between gap-3">
        <div className="flex h-12 w-12 shrink-0 items-center justify-center rounded-2xl bg-brand-light text-brand transition-all duration-300 group-hover:rotate-[-4deg] group-hover:bg-brand group-hover:text-brand-foreground">
          <Briefcase className="h-5 w-5" strokeWidth={1.75} />
        </div>
        <div className="flex flex-wrap items-center gap-1.5">
          {fresh ? (
            <span className="inline-flex items-center gap-1.5 rounded-full bg-warm/15 px-2.5 py-1 text-[10px] font-bold uppercase tracking-wider text-warm-dark">
              <span className="h-1.5 w-1.5 rounded-full bg-warm-dark" />
              Nová
            </span>
          ) : null}
          <span className="inline-flex items-center gap-1.5 rounded-full bg-emerald-500/10 px-2.5 py-1 text-[10px] font-bold uppercase tracking-wider text-emerald-700">
            <span className="h-1.5 w-1.5 rounded-full bg-emerald-500" />
            Otevřená
          </span>
        </div>
      </div>

      <h3 className="font-display relative mt-5 text-xl text-foreground group-hover:text-brand sm:text-[1.375rem]">
        {position.title}
      </h3>

      <ul className="relative mt-3 space-y-1.5 text-sm">
        <li className="flex items-center gap-2 text-muted-foreground">
          <Briefcase className="h-3.5 w-3.5 shrink-0 text-brand/70" strokeWidth={2} />
          <span>{TYPE_LABELS[position.employment_type]}</span>
        </li>
        <li className="flex items-center gap-2 text-muted-foreground">
          <MapPin className="h-3.5 w-3.5 shrink-0 text-brand/70" strokeWidth={2} />
          <span>
            AHC {branch.short_name} · {branch.city}
          </span>
        </li>
      </ul>

      {salary ? (
        <div className="relative mt-4 inline-flex w-fit rounded-full bg-brand-light px-3 py-1 text-[13px] font-bold text-brand-dark">
          {salary}
        </div>
      ) : null}

      <div className="relative mt-auto flex items-center justify-between gap-3 border-t border-border/60 pt-4 text-xs font-bold uppercase tracking-wider text-brand">
        <span>Detail pozice</span>
        <ArrowUpRight
          className="h-4 w-4 transition-transform group-hover:translate-x-0.5 group-hover:-translate-y-0.5"
          strokeWidth={2.25}
        />
      </div>
    </Link>
  );
}
