import Link from "next/link";
import * as Icons from "lucide-react";
import type { BranchUnit } from "@/convex/lib/types";
import {
  RegionSlot,
  TextSlot,
} from "@/features/inline-edit/components/content-slot";
import { makeCopy, type CopyProps } from "@/features/inline-edit/copy";

interface AmbulancesSectionProps extends CopyProps {
  units: BranchUnit[];
}

function getIcon(name?: string): Icons.LucideIcon {
  return (
    (Icons as unknown as Record<string, Icons.LucideIcon>)[name ?? "Stethoscope"] ??
    Icons.Stethoscope
  );
}

export function AmbulancesSection({
  units,
  copy,
  editBranchId,
}: AmbulancesSectionProps) {
  const c = makeCopy({ copy, editBranchId });
  const field = (id: string) =>
    editBranchId
      ? ({ kind: "field", table: "branch_units", id, field: "name" } as const)
      : undefined;
  const row = (id: string) => ({ kind: "row", table: "branch_units", id }) as const;

  const ambulance = units.filter((u) => u.category === "ambulance");
  const komplement = units.filter((u) => u.category === "komplement");
  if (ambulance.length === 0 && komplement.length === 0) return null;

  return (
    <section className="bg-secondary/40">
      <div className="mx-auto max-w-[1320px] px-6 py-16 lg:px-10 lg:py-20">
        <div className="mx-auto max-w-3xl text-center">
          {c.t("ambulance.eyebrow", "Odborné ambulance", {
            as: "div",
            className:
              "text-[11px] font-bold uppercase tracking-[0.22em] text-warm-dark",
          })}
          {c.t("ambulance.nadpis", "Specializovaná péče", {
            as: "h2",
            className:
              "font-display mt-3 block text-3xl text-foreground sm:text-4xl",
          })}
          {c.t(
            "ambulance.text",
            "Široká síť odborných ambulancí — kvalitní péče blízko domova, bez nutnosti dojíždět do velkých měst.",
            { as: "p", className: "mt-4 block text-base text-muted-foreground" }
          )}
        </div>

        {/* Ambulance — plné karty */}
        <ul className="mt-10 grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
          {ambulance.map((u) => {
            const Icon = getIcon(u.icon);
            const href = u.slug ? `/ambulance/${u.slug}` : "/ambulance";
            return (
              <li key={u._id}>
                <RegionSlot
                  className="h-full"
                  {...c.region(`row:branch_units:${u._id}`, row(u._id), row(u._id))}
                >
                  <Link
                    href={href}
                    className="group flex h-full items-center gap-4 rounded-2xl border border-border bg-card p-5 shadow-sm transition-all hover:-translate-y-1 hover:border-brand/40 hover:shadow-md"
                  >
                    <span className="flex h-12 w-12 shrink-0 items-center justify-center rounded-xl bg-brand-light text-brand transition-colors group-hover:bg-brand group-hover:text-brand-foreground">
                      <Icon className="h-5 w-5" strokeWidth={1.75} />
                    </span>
                    <TextSlot
                      target={field(u._id)}
                      value={u.name}
                      className="text-[15px] font-semibold leading-tight text-foreground group-hover:text-brand"
                    />
                  </Link>
                </RegionSlot>
              </li>
            );
          })}
        </ul>

        {/* Komplementy — pily */}
        {komplement.length > 0 ? (
          <div className="mt-10 flex flex-wrap items-center justify-center gap-3">
            {c.t("ambulance.komplement", "Dále nabízíme:", {
              as: "span",
              className:
                "text-[11px] font-bold uppercase tracking-[0.22em] text-muted-foreground",
            })}
            {komplement.map((u) => {
              const Icon = getIcon(u.icon);
              const href = u.slug ? `/ambulance/${u.slug}` : "/ambulance";
              return (
                <RegionSlot
                  key={u._id}
                  {...c.region(`row:branch_units:${u._id}`, row(u._id), row(u._id))}
                >
                  <Link
                    href={href}
                    className="inline-flex items-center gap-2 rounded-full border border-border bg-card px-4 py-2 text-sm font-semibold text-foreground transition-colors hover:border-brand hover:text-brand"
                  >
                    <Icon className="h-4 w-4 shrink-0 text-brand" strokeWidth={2} />
                    <TextSlot target={field(u._id)} value={u.name} />
                  </Link>
                </RegionSlot>
              );
            })}
          </div>
        ) : null}
      </div>
    </section>
  );
}
