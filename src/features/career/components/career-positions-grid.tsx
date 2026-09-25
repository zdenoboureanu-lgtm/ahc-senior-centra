import Link from "next/link";
import type { CareerPosition } from "@/convex/lib/types";

const TYPE_LABELS = {
  full_time: "Plný úvazek",
  part_time: "Částečný úvazek",
  contract: "Dohoda",
  internship: "Stáž",
} as const;

interface CareerPositionsGridProps {
  positions: CareerPosition[];
  branchShortName: string;
}

export function CareerPositionsGrid({
  positions,
  branchShortName,
}: CareerPositionsGridProps) {
  if (positions.length === 0) {
    return (
      <p className="text-center text-muted-foreground">
        Aktuálně nejsou otevřené žádné pozice.
      </p>
    );
  }

  return (
    <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
      {positions.map((p) => (
        <Link
          key={p._id}
          href={`/kariera/${p.slug}`}
          className="group block rounded-2xl bg-card p-5 shadow-sm ring-1 ring-border/60 transition-shadow hover:shadow-md"
        >
          <div className="text-xs font-bold uppercase tracking-wider text-brand">
            AHC Senior centrum {branchShortName}
          </div>
          <h3 className="mt-2 text-base font-bold text-foreground group-hover:text-brand">
            {p.title}
          </h3>
          <div className="mt-3 flex flex-wrap items-center gap-2 text-xs text-muted-foreground">
            <span>{branchShortName}</span>
            <span>·</span>
            <span>{TYPE_LABELS[p.employment_type]}</span>
            <span>·</span>
            <span>AHC, a.s.</span>
          </div>
        </Link>
      ))}
    </div>
  );
}
