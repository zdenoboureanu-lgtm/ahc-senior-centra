import Link from "next/link";
import * as Icons from "lucide-react";
import { ArrowRight } from "lucide-react";
import type { BranchUnit } from "@/convex/lib/types";

interface DepartmentsSectionProps {
  units: BranchUnit[];
}

function getIcon(name?: string): Icons.LucideIcon {
  return (
    (Icons as unknown as Record<string, Icons.LucideIcon>)[name ?? "Activity"] ??
    Icons.Activity
  );
}

export function DepartmentsSection({ units }: DepartmentsSectionProps) {
  const oddeleni = units.filter((u) => u.category === "oddeleni");
  if (oddeleni.length === 0) return null;

  return (
    <section className="relative border-y border-border/40 bg-card">
      <div
        aria-hidden="true"
        className="pointer-events-none absolute -left-32 top-1/3 h-80 w-80 rounded-full bg-brand-light/40 blur-3xl animate-pulse-blob"
      />
      <div className="relative mx-auto max-w-[1320px] px-6 py-20 lg:px-10 lg:py-28">
        <div className="mx-auto max-w-3xl text-center">
          <div className="text-[11px] font-bold uppercase tracking-[0.22em] text-warm-dark">
            Lůžková péče
          </div>
          <h2 className="font-display mt-3 text-4xl text-foreground sm:text-5xl">
            Naše oddělení
          </h2>
          <p className="mt-4 text-base text-muted-foreground">
            Přehled oddělení a pracovišť našeho zařízení.
          </p>
        </div>

        <div className="mt-14 grid gap-5 sm:grid-cols-2 lg:grid-cols-3">
          {oddeleni.map((u) => {
            const Icon = getIcon(u.icon);
            const href = u.slug ? `/oddeleni/${u.slug}` : "/oddeleni";
            return (
              <Link
                key={u._id}
                href={href}
                className="group flex flex-col rounded-3xl border border-border bg-background p-7 shadow-sm transition-all hover:-translate-y-1 hover:border-brand/30 hover:shadow-lg"
              >
                <span className="flex h-14 w-14 items-center justify-center rounded-2xl bg-brand-light text-brand transition-colors group-hover:bg-brand group-hover:text-brand-foreground">
                  <Icon className="h-6 w-6" strokeWidth={1.75} />
                </span>
                <h3 className="font-display mt-5 text-xl text-foreground sm:text-2xl group-hover:text-brand">
                  {u.name}
                </h3>
                {u.description ? (
                  <p className="mt-2 text-[15px] leading-relaxed text-muted-foreground">
                    {u.description}
                  </p>
                ) : null}
                <div className="mt-auto flex items-center gap-1 pt-5 text-xs font-bold uppercase tracking-wider text-brand opacity-60 transition-opacity group-hover:opacity-100">
                  Více informací <ArrowRight className="h-3.5 w-3.5" />
                </div>
              </Link>
            );
          })}
        </div>
      </div>
    </section>
  );
}
