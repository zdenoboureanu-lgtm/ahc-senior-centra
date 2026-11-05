import Link from "next/link";
import * as Icons from "lucide-react";
import { ArrowRight } from "lucide-react";
import type { BranchUnit } from "@/convex/lib/types";
import {
  RegionSlot,
  TextSlot,
} from "@/features/inline-edit/components/content-slot";
import { makeCopy, type CopyProps } from "@/features/inline-edit/copy";

interface DepartmentsSectionProps extends CopyProps {
  units: BranchUnit[];
}

function getIcon(name?: string): Icons.LucideIcon {
  return (
    (Icons as unknown as Record<string, Icons.LucideIcon>)[name ?? "Activity"] ??
    Icons.Activity
  );
}

export function DepartmentsSection({
  units,
  copy,
  editBranchId,
}: DepartmentsSectionProps) {
  const c = makeCopy({ copy, editBranchId });
  const field = (id: string, name: "name" | "description") =>
    editBranchId
      ? ({ kind: "field", table: "branch_units", id, field: name } as const)
      : undefined;
  const row = (id: string) => ({ kind: "row", table: "branch_units", id }) as const;

  const oddeleni = units.filter((u) => u.category === "oddeleni");
  if (oddeleni.length === 0) return null;

  return (
    <section className="relative border-y border-border/40 bg-card">
      <div
        aria-hidden="true"
        className="pointer-events-none absolute -left-32 top-1/3 h-80 w-80 rounded-full bg-brand-light/40 blur-3xl animate-pulse-blob"
      />
      <div className="relative mx-auto max-w-[1320px] px-6 py-16 lg:px-10 lg:py-20">
        <div className="mx-auto max-w-3xl text-center">
          {c.t("oddeleni.eyebrow", "Lůžková péče", {
            as: "div",
            className:
              "text-[11px] font-bold uppercase tracking-[0.22em] text-warm-dark",
          })}
          {c.t("oddeleni.nadpis", "Naše oddělení", {
            as: "h2",
            className:
              "font-display mt-3 block text-3xl text-foreground sm:text-4xl",
          })}
          {c.t("oddeleni.text", "Přehled oddělení a pracovišť našeho zařízení.", {
            as: "p",
            className: "mt-4 block text-base text-muted-foreground",
          })}
        </div>

        <div className="mt-10 grid gap-5 sm:grid-cols-2 lg:grid-cols-3">
          {oddeleni.map((u) => {
            const Icon = getIcon(u.icon);
            const href = u.slug ? `/oddeleni/${u.slug}` : "/oddeleni";
            return (
              <RegionSlot
                key={u._id}
                className="h-full"
                {...c.region(`row:branch_units:${u._id}`, row(u._id), row(u._id))}
              >
              <Link
                href={href}
                className="group flex h-full flex-col rounded-3xl border border-border bg-background p-7 shadow-sm transition-all hover:-translate-y-1 hover:border-brand/30 hover:shadow-lg"
              >
                <span className="flex h-14 w-14 items-center justify-center rounded-2xl bg-brand-light text-brand transition-colors group-hover:bg-brand group-hover:text-brand-foreground">
                  <Icon className="h-6 w-6" strokeWidth={1.75} />
                </span>
                <TextSlot
                  as="h3"
                  target={field(u._id, "name")}
                  value={u.name}
                  className="font-display mt-5 block text-xl text-foreground group-hover:text-brand sm:text-2xl"
                />
                {u.description ? (
                  <TextSlot
                    as="p"
                    target={field(u._id, "description")}
                    value={u.description}
                    className="mt-2 block text-[15px] leading-relaxed text-muted-foreground"
                  />
                ) : null}
                <div className="mt-auto flex items-center gap-1 pt-5 text-xs font-bold uppercase tracking-wider text-brand opacity-60 transition-opacity group-hover:opacity-100">
                  Více informací <ArrowRight className="h-3.5 w-3.5" />
                </div>
              </Link>
              </RegionSlot>
            );
          })}
        </div>
      </div>
    </section>
  );
}
