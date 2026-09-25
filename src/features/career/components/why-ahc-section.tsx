import {
  HeartHandshake,
  ShieldCheck,
  Sparkles,
  Users,
  TrendingUp,
} from "lucide-react";
import type { LucideIcon } from "lucide-react";
import { cn } from "@/lib/utils";
import { makeCopy, type CopyProps } from "@/features/inline-edit/copy";
import { RegionSlot } from "@/features/inline-edit/components/content-slot";


interface Reason {
  icon: LucideIcon;
  title: string;
  text: string;
}

const REASONS: Reason[] = [
  {
    icon: HeartHandshake,
    title: "Nejsme anonymní korporát",
    text: "Za každým naším zařízením stojí lidé, kteří péči opravdu rozumí. Zakládáme si na lidském přístupu, podpoře týmů a prostředí, kde se dá dlouhodobě dobře pracovat.",
  },
  {
    icon: ShieldCheck,
    title: "Stabilita a jistota",
    text: "AHC dnes provozuje síť zdravotních a sociálních zařízení po celé České republice a je součástí silné skupiny se stabilním zázemím.",
  },
  {
    icon: Sparkles,
    title: "Péče, která dává smysl",
    text: "Nejde jen o výkony a směny. Každý den pomáháme lidem zvládat těžké životní situace důstojně, bezpečně a s respektem.",
  },
  {
    icon: Users,
    title: "Tým, kde si lidé pomáhají",
    text: "Víme, že zdravotnictví není jednoduché. O to důležitější je mít kolem sebe kolegy, na které je spoleh.",
  },
  {
    icon: TrendingUp,
    title: "Možnost růstu",
    text: "Podporujeme vzdělávání, odborný rozvoj i profesní posun napříč našimi zařízeními.",
  },
];

export function WhyAhcSection({ copy, editBranchId }: CopyProps) {
  const c = makeCopy({ copy, editBranchId });
  return (
    <RegionSlot {...c.region("sekce.kariera.proc")}>
    <section className="border-y border-border/40 bg-secondary/30">
      <div className="mx-auto max-w-[1320px] px-6 py-20 lg:px-10 lg:py-28">
        <div className="mx-auto max-w-3xl text-center">
          {c.t("kariera.proc.eyebrow", "Proč AHC", { as: "div", className: "text-[11px] font-bold uppercase tracking-[0.22em] text-warm-dark" })}
          {c.t("kariera.proc.nadpis", "Proč lidé zůstávají v AHC", { as: "h2", className: "font-display mt-3 text-4xl text-foreground sm:text-5xl" })}
        </div>

        <ol className="mx-auto mt-14 grid max-w-6xl gap-6 sm:grid-cols-2 lg:grid-cols-6">
          {REASONS.map((r, i) => (
            <RegionSlot key={r.title} className="lg:col-span-2" {...c.region(`kariera.proc.${i}`)}>
            <li
              className={cn(
                "group relative flex flex-col rounded-3xl border border-border bg-card p-7 shadow-sm transition-all hover:-translate-y-1 hover:border-brand/30 hover:shadow-lg lg:col-span-2",
                // Spodní řada (4. + 5.) vycentrovaná
                i === 3 && "lg:col-start-2",
                i === 4 && "lg:col-start-4"
              )}
            >
              <div className="flex items-center justify-between">
                <span className="font-display text-3xl text-warm">
                  {String(i + 1).padStart(2, "0")}
                </span>
                <span className="flex h-12 w-12 items-center justify-center rounded-2xl bg-brand-light text-brand transition-colors group-hover:bg-brand group-hover:text-brand-foreground">
                  <r.icon className="h-5 w-5" strokeWidth={1.75} />
                </span>
              </div>
              {c.t(`kariera.proc.${i}.nadpis`, r.title, { as: "h3", className: "font-display mt-6 text-xl text-foreground sm:text-2xl" })}
              {c.t(`kariera.proc.${i}.text`, r.text, { as: "p", className: "mt-3 text-[15px] leading-relaxed text-muted-foreground" })}
            </li>
            </RegionSlot>
          ))}
        </ol>
      </div>
    </section>
    </RegionSlot>
  );
}
