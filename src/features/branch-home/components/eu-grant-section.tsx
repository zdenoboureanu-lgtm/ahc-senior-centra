"use client";

import { useState } from "react";
import {
  ChevronDown,
  ChevronUp,
  Award,
  FileText,
  Download,
} from "lucide-react";
import { cn } from "@/lib/utils";
import type { BranchGrant } from "@/convex/lib/types";

interface GrantsSectionProps {
  grants: BranchGrant[];
}

/** Vlajka EU jako SVG — žluté hvězdy v kruhu na modrém pozadí */
function EuFlag({ className }: { className?: string }) {
  return (
    <svg
      viewBox="0 0 60 40"
      className={className}
      role="img"
      aria-label="Vlajka Evropské unie"
    >
      <rect width="60" height="40" rx="4" fill="#003399" />
      <g fill="#FFCC00">
        {Array.from({ length: 12 }).map((_, i) => {
          const angle = (i / 12) * Math.PI * 2 - Math.PI / 2;
          const cx = 30 + Math.cos(angle) * 10;
          const cy = 20 + Math.sin(angle) * 10;
          return <circle key={i} cx={cx} cy={cy} r={1.6} />;
        })}
      </g>
    </svg>
  );
}

function FunderLogo({ grant }: { grant: BranchGrant }) {
  if (grant.funder_short === "EU") return <EuFlag className="h-12 w-16" />;
  return (
    <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-brand text-brand-foreground font-bold tracking-tight">
      {grant.funder_short}
    </div>
  );
}

export function GrantsSection({ grants }: GrantsSectionProps) {
  if (grants.length === 0) return null;

  return (
    <section className="border-y border-border/40 bg-secondary/30">
      <div className="mx-auto max-w-[1320px] px-6 py-16 lg:px-10 lg:py-20">
        <div className="mx-auto max-w-3xl text-center">
          <div className="text-[11px] font-bold uppercase tracking-[0.22em] text-warm-dark">
            Povinná publicita
          </div>
          <h2 className="font-display mt-3 text-3xl text-foreground sm:text-4xl">
            Dotace a podpora
          </h2>
          <p className="mt-4 text-base text-muted-foreground">
            Naše centrum je spolufinancováno z veřejných zdrojů. Níže najdete
            všechny relevantní dokumenty a informace.
          </p>
        </div>

        <ul className="mx-auto mt-12 max-w-4xl space-y-4">
          {grants.map((g) => (
            <GrantCard key={g._id} grant={g} />
          ))}
        </ul>
      </div>
    </section>
  );
}

function GrantCard({ grant }: { grant: BranchGrant }) {
  const [open, setOpen] = useState(false);
  return (
    <li className="overflow-hidden rounded-2xl border border-border/60 bg-card shadow-sm transition-shadow hover:shadow-md">
      <button
        type="button"
        onClick={() => setOpen(!open)}
        className="flex w-full items-center gap-5 p-5 text-left sm:p-6"
        aria-expanded={open}
      >
        <FunderLogo grant={grant} />
        <div className="flex-1 min-w-0">
          <div className="text-[11px] font-bold uppercase tracking-[0.22em] text-warm-dark">
            Spolufinancováno
          </div>
          <div className="font-display mt-1 text-lg text-foreground sm:text-xl">
            {grant.funder}
          </div>
          {grant.project_name ? (
            <div className="mt-1 text-sm text-muted-foreground">
              {grant.project_name}
            </div>
          ) : null}
        </div>
        <div className="flex shrink-0 items-center gap-2 text-xs font-semibold uppercase tracking-wider text-brand">
          <span className="hidden sm:inline">
            {open ? "Skrýt" : "Detail"}
          </span>
          {open ? (
            <ChevronUp className="h-5 w-5" strokeWidth={2} />
          ) : (
            <ChevronDown className="h-5 w-5" strokeWidth={2} />
          )}
        </div>
      </button>

      <div
        className={cn(
          "grid overflow-hidden transition-all duration-300 ease-out",
          open ? "grid-rows-[1fr] opacity-100" : "grid-rows-[0fr] opacity-0"
        )}
      >
        <div className="min-h-0">
          <div className="border-t border-border/60 px-5 py-5 sm:px-6 sm:py-6">
            <div className="grid gap-6 sm:grid-cols-2">
              <div className="space-y-3 text-sm">
                {grant.amount ? (
                  <div className="flex items-center gap-3">
                    <Award className="h-4 w-4 shrink-0 text-warm-dark" />
                    <div>
                      <span className="text-muted-foreground">Výše dotace: </span>
                      <strong className="text-foreground">
                        {grant.amount.toLocaleString("cs-CZ")} Kč
                      </strong>
                    </div>
                  </div>
                ) : null}
                {grant.program ? (
                  <div className="text-muted-foreground">
                    <span className="font-semibold text-foreground">Program: </span>
                    {grant.program}
                  </div>
                ) : null}
                {grant.year_until ? (
                  <div className="text-muted-foreground">
                    <span className="font-semibold text-foreground">Doba trvání: </span>
                    do roku {grant.year_until}
                  </div>
                ) : null}
                {grant.description ? (
                  <p className="leading-relaxed text-muted-foreground">
                    {grant.description}
                  </p>
                ) : null}
              </div>

              {grant.docs && grant.docs.length > 0 ? (
                <div>
                  <div className="text-[11px] font-bold uppercase tracking-[0.22em] text-warm-dark">
                    Dokumenty
                  </div>
                  <ul className="mt-3 space-y-2">
                    {grant.docs.map((d) => (
                      <li key={d.title}>
                        <a
                          href={d.file_url}
                          className="group flex items-center gap-3 rounded-xl border border-border bg-background p-3 transition-all hover:border-brand/40 hover:bg-brand-light"
                        >
                          <FileText className="h-4 w-4 shrink-0 text-brand" />
                          <div className="flex-1 min-w-0 text-sm">
                            <div className="font-semibold text-foreground group-hover:text-brand">
                              {d.title}
                            </div>
                            {d.size_kb ? (
                              <div className="text-xs text-muted-foreground">
                                PDF · {d.size_kb} kB
                              </div>
                            ) : null}
                          </div>
                          <Download className="h-4 w-4 shrink-0 text-muted-foreground group-hover:text-brand" />
                        </a>
                      </li>
                    ))}
                  </ul>
                </div>
              ) : null}
            </div>
          </div>
        </div>
      </div>
    </li>
  );
}
