import {
  Building2,
  Users,
  Stethoscope,
  Network,
  HeartPulse,
} from "lucide-react";
import type { LucideIcon } from "lucide-react";
import { makeCopy, type CopyProps } from "@/features/inline-edit/copy";
import { RegionSlot } from "@/features/inline-edit/components/content-slot";


interface Stat {
  icon: LucideIcon;
  value: string;
  label: string;
}

const STATS: Stat[] = [
  { icon: Building2, value: "16", label: "zařízení po celé ČR" },
  { icon: Users, value: "tisíce", label: "klientů ročně" },
  { icon: Stethoscope, value: "desítky", label: "odborností" },
  { icon: Network, value: "Ambeat Group", label: "silná skupina za námi" },
  {
    icon: HeartPulse,
    value: "Zdravotní + sociální",
    label: "propojená péče",
  },
];

export function AhcNumbersSection({ copy, editBranchId }: CopyProps) {
  const c = makeCopy({ copy, editBranchId });
  return (
    <RegionSlot {...c.region("sekce.kariera.cisla")}>
    <section className="relative overflow-hidden bg-brand py-20 text-brand-foreground lg:py-28">
      <div
        aria-hidden="true"
        className="pointer-events-none absolute -left-32 -top-32 h-96 w-96 rounded-full bg-warm/15 blur-3xl animate-pulse-blob"
      />
      <div
        aria-hidden="true"
        className="pointer-events-none absolute -right-32 -bottom-32 h-96 w-96 rounded-full bg-brand-foreground/10 blur-3xl animate-float-slow"
      />

      <div className="relative mx-auto max-w-[1320px] px-6 lg:px-10">
        <div className="mx-auto max-w-3xl text-center">
          {c.t("kariera.cisla.eyebrow", "AHC v číslech", { as: "div", className: "text-[11px] font-bold uppercase tracking-[0.22em] text-warm" })}
          {c.t("kariera.cisla.nadpis", "Síla, na kterou se můžete spolehnout", { as: "h2", className: "font-display mt-3 text-4xl text-brand-foreground sm:text-5xl" })}
        </div>

        <ul className="mx-auto mt-14 grid max-w-6xl gap-6 sm:grid-cols-2 lg:grid-cols-5">
          {STATS.map((s, i) => (
            <RegionSlot key={s.label} {...c.region(`kariera.cisla.${i}`)}>
            <li className="group flex flex-col items-center text-center">
              <span className="mb-5 flex h-14 w-14 items-center justify-center rounded-2xl bg-brand-foreground/10 text-warm transition-colors group-hover:bg-warm group-hover:text-warm-foreground">
                <s.icon className="h-6 w-6" strokeWidth={1.75} />
              </span>
              {c.t(`kariera.cisla.${i}.hodnota`, s.value, { as: "div", className: "font-display text-3xl leading-tight text-brand-foreground sm:text-4xl" })}
              {c.t(`kariera.cisla.${i}.popis`, s.label, { as: "div", className: "mt-2 max-w-[18ch] text-[12px] font-semibold uppercase tracking-wider text-brand-foreground/70" })}
            </li>
            </RegionSlot>
          ))}
        </ul>
      </div>
    </section>
    </RegionSlot>
  );
}
