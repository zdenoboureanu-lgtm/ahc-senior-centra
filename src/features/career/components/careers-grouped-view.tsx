"use client";

import { useMemo, useState } from "react";
import { Briefcase, MapPin, Building2, Filter } from "lucide-react";
import { cn } from "@/lib/utils";
import type { Doc } from "@/convex/_generated/dataModel";
import { PositionCard } from "./position-card";

interface CareersGroupedData {
  ownBranch: {
    branch: Doc<"branches">;
    positions: Doc<"career_positions">[];
  } | null;
  otherRegions: {
    region: string;
    branches: {
      branch: Doc<"branches">;
      positions: Doc<"career_positions">[];
    }[];
  }[];
  totalCount: number;
}

interface CareersGroupedViewProps {
  data: CareersGroupedData;
  ownBranchEmail: string | null;
}

export function CareersGroupedView({
  data,
  ownBranchEmail,
}: CareersGroupedViewProps) {
  const allRegions = useMemo(() => {
    const set = new Set<string>();
    if (data.ownBranch) set.add(data.ownBranch.branch.region);
    data.otherRegions.forEach((r) => set.add(r.region));
    return Array.from(set).sort((a, b) => a.localeCompare(b, "cs"));
  }, [data]);

  // Filter: prázdné = vše
  const [activeRegions, setActiveRegions] = useState<Set<string>>(new Set());
  const toggleRegion = (r: string) => {
    setActiveRegions((prev) => {
      const next = new Set(prev);
      if (next.has(r)) next.delete(r);
      else next.add(r);
      return next;
    });
  };
  const showAll = activeRegions.size === 0;
  const matches = (r: string) => showAll || activeRegions.has(r);

  // Vlastní pobočka je vždy nahoře, filtr na ni neaplikujeme.
  const otherVisible = data.otherRegions.filter((r) => matches(r.region));

  // Filtr nabízíme jen z krajů ostatních poboček (vlastní pobočka je separátní)
  const filterRegions = useMemo(() => {
    const set = new Set<string>();
    data.otherRegions.forEach((r) => set.add(r.region));
    return Array.from(set).sort((a, b) => a.localeCompare(b, "cs"));
  }, [data]);
  void allRegions; // ponecháno pro budoucí use

  return (
    <section className="mx-auto max-w-[1320px] px-6 py-12 lg:px-10 lg:py-16">
      {/* 1) Vlastní pobočka — vždy nahoře, bez filtru */}
      {data.ownBranch ? (
        <BranchBlock
          branch={data.ownBranch.branch}
          positions={data.ownBranch.positions}
          highlight
          ctaEmail={ownBranchEmail}
        />
      ) : null}

      {/* 2) Ostatní pobočky — s filtrem nad nimi */}
      {data.otherRegions.length > 0 ? (
        <div className={cn(data.ownBranch && "mt-20")}>
          <div className="mb-6 flex flex-col gap-3 sm:flex-row sm:items-end sm:justify-between sm:gap-6">
            <div>
              <div className="text-[11px] font-bold uppercase tracking-[0.22em] text-warm-dark">
                Naše další centra
              </div>
              <h2 className="font-display mt-2 text-2xl text-foreground sm:text-3xl">
                Pozice v ostatních pobočkách
              </h2>
            </div>
          </div>

          {/* Filter chips */}
          {filterRegions.length > 1 ? (
            <div className="mb-10 flex flex-col items-start gap-3 sm:flex-row sm:items-center sm:gap-5">
              <div className="flex shrink-0 items-center gap-2 text-[11px] font-bold uppercase tracking-[0.22em] text-warm-dark">
                <Filter className="h-3.5 w-3.5" strokeWidth={2.25} />
                Filtr podle kraje
              </div>
              <div className="flex flex-wrap gap-2">
                <button
                  type="button"
                  onClick={() => setActiveRegions(new Set())}
                  className={cn(
                    "rounded-full px-4 py-1.5 text-sm font-semibold transition-colors",
                    showAll
                      ? "bg-brand text-brand-foreground"
                      : "bg-brand-light text-brand hover:bg-brand/15"
                  )}
                >
                  Všechny kraje
                </button>
                {filterRegions.map((r) => (
                  <button
                    key={r}
                    type="button"
                    onClick={() => toggleRegion(r)}
                    className={cn(
                      "rounded-full px-4 py-1.5 text-sm font-semibold transition-colors",
                      activeRegions.has(r)
                        ? "bg-brand text-brand-foreground"
                        : "bg-brand-light text-brand hover:bg-brand/15"
                    )}
                  >
                    {r}
                  </button>
                ))}
              </div>
            </div>
          ) : null}

          {otherVisible.length > 0 ? (
            <div className="space-y-12">
              {otherVisible.map((r) => (
                <RegionBlock key={r.region} region={r.region} branches={r.branches} />
              ))}
            </div>
          ) : (
            <div className="rounded-3xl border border-dashed border-border bg-card p-10 text-center">
              <p className="text-sm text-muted-foreground">
                V tomto filtru nejsou aktuálně žádné pozice. Zkuste vybrat
                jiný kraj nebo zvolte „Všechny kraje".
              </p>
            </div>
          )}
        </div>
      ) : null}

      {!data.ownBranch && data.otherRegions.length === 0 ? (
        <div className="rounded-3xl border border-dashed border-border bg-card p-12 text-center">
          <p className="text-base text-muted-foreground">
            Aktuálně nejsou otevřené žádné pozice.
          </p>
        </div>
      ) : null}
    </section>
  );
}

function BranchBlock({
  branch,
  positions,
  highlight,
  ctaEmail,
}: {
  branch: Doc<"branches">;
  positions: Doc<"career_positions">[];
  highlight?: boolean;
  ctaEmail?: string | null;
}) {
  return (
    <div>
      <div className="flex flex-col gap-2 sm:flex-row sm:items-end sm:justify-between sm:gap-6">
        <div>
          {highlight ? (
            <div className="text-[11px] font-bold uppercase tracking-[0.22em] text-warm-dark">
              Naše pobočka
            </div>
          ) : (
            <div className="inline-flex items-center gap-2 text-[11px] font-bold uppercase tracking-[0.22em] text-muted-foreground">
              <MapPin className="h-3.5 w-3.5" strokeWidth={2.25} />
              {branch.city} · {branch.region}
            </div>
          )}
          <h2 className="font-display mt-2 text-2xl text-foreground sm:text-3xl">
            AHC Senior centrum {branch.short_name}
          </h2>
        </div>
        <div className="text-sm text-muted-foreground">
          {positions.length === 0
            ? "Aktuálně nehledáme — pošlete životopis"
            : `${positions.length} ${positions.length === 1 ? "otevřená pozice" : positions.length < 5 ? "otevřené pozice" : "otevřených pozic"}`}
        </div>
      </div>

      {positions.length === 0 ? (
        <div className="mt-6 rounded-3xl border border-dashed border-border bg-card p-10 text-center">
          <div className="mx-auto flex h-14 w-14 items-center justify-center rounded-2xl bg-brand-light">
            <Briefcase className="h-6 w-6 text-brand" strokeWidth={1.5} />
          </div>
          <h3 className="font-display mt-5 text-xl text-foreground">
            Pošlete nám životopis dopředu
          </h3>
          <p className="mx-auto mt-2 max-w-md text-sm leading-relaxed text-muted-foreground">
            Aktuálně nehledáme, ale uvítáme zájemce do evidence. Napište nám
            na{" "}
            <a
              href={`mailto:${ctaEmail ?? branch.email}`}
              className="font-semibold text-brand hover:underline"
            >
              {ctaEmail ?? branch.email}
            </a>
            .
          </p>
        </div>
      ) : (
        <ul className="mt-6 grid gap-5 sm:grid-cols-2 lg:grid-cols-3">
          {positions.map((p) => (
            <li key={p._id}>
              <PositionCard position={p} branch={branch} />
            </li>
          ))}
        </ul>
      )}
    </div>
  );
}

function RegionBlock({
  region,
  branches,
}: {
  region: string;
  branches: { branch: Doc<"branches">; positions: Doc<"career_positions">[] }[];
}) {
  const total = branches.reduce((s, b) => s + b.positions.length, 0);
  return (
    <div>
      <div className="flex items-center gap-3">
        <div className="flex h-9 w-9 items-center justify-center rounded-xl bg-brand-light text-brand">
          <Building2 className="h-4 w-4" strokeWidth={2} />
        </div>
        <div>
          <div className="text-[11px] font-bold uppercase tracking-[0.22em] text-warm-dark">
            Kraj
          </div>
          <div className="font-display text-xl text-foreground">{region}</div>
        </div>
        <span className="ml-auto text-xs font-semibold uppercase tracking-wider text-muted-foreground">
          {total} {total === 1 ? "pozice" : total < 5 ? "pozice" : "pozic"}
        </span>
      </div>

      <div className="mt-5 space-y-6">
        {branches.map(({ branch, positions }) => (
          <div key={branch._id}>
            <div className="flex items-center gap-2 text-sm">
              <MapPin className="h-3.5 w-3.5 text-brand" strokeWidth={2.25} />
              <a
                href={`https://${branch.slug}.ahc.cz`}
                className="font-semibold text-foreground hover:text-brand"
              >
                AHC Senior centrum {branch.short_name}
              </a>
              <span className="text-muted-foreground">· {branch.city}</span>
            </div>
            <ul className="mt-3 grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
              {positions.map((p) => (
                <li key={p._id}>
                  <PositionCard position={p} branch={branch} external />
                </li>
              ))}
            </ul>
          </div>
        ))}
      </div>
    </div>
  );
}

