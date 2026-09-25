import {
  ShieldCheck,
  Sparkles,
  HandHeart,
  TrendingUp,
  Clock4,
} from "lucide-react";
import type { LucideIcon } from "lucide-react";
import { makeCopy, type CopyProps } from "@/features/inline-edit/copy";
import { RegionSlot } from "@/features/inline-edit/components/content-slot";


interface BenefitGroup {
  icon: LucideIcon;
  title: string;
  tagline: string;
  items: string[];
}

const GROUPS: BenefitGroup[] = [
  {
    icon: ShieldCheck,
    title: "Stabilita",
    tagline: "Pevné zázemí, na které se dá spolehnout.",
    items: ["silné zázemí", "dlouhodobá jistota", "férové podmínky"],
  },
  {
    icon: Sparkles,
    title: "Smysluplná práce",
    tagline: "Vaše práce má reálný dopad na lidské životy.",
    items: ["reálný dopad na život lidí", "vztahy s klienty", "lidskost v péči"],
  },
  {
    icon: HandHeart,
    title: "Podpora týmů",
    tagline: "Nikdy nejste na nic sami — kolegové stojí za vámi.",
    items: ["zaučení", "pomoc kolegů", "otevřená komunikace"],
  },
  {
    icon: TrendingUp,
    title: "Rozvoj",
    tagline: "Investujeme do vzdělávání a kariérního růstu.",
    items: ["odborná školení", "možnost růstu", "vzdělávání"],
  },
  {
    icon: Clock4,
    title: "Flexibilita",
    tagline: "Úvazek a směny šité na míru vašemu životu.",
    items: [
      "různé typy úvazků",
      "možnost přizpůsobení směn",
      "více typů zařízení a služeb",
    ],
  },
];

export function CareerBenefitsSection({ copy, editBranchId }: CopyProps) {
  const c = makeCopy({ copy, editBranchId });
  return (
    <RegionSlot {...c.region("sekce.kariera.benefity")}>
    <section className="mx-auto max-w-[1320px] px-6 py-20 lg:px-10 lg:py-28">
      <div className="mx-auto max-w-3xl text-center">
        {c.t("kariera.benefity.eyebrow", "Benefity", { as: "div", className: "text-[11px] font-bold uppercase tracking-[0.22em] text-warm-dark" })}
        {c.t("kariera.benefity.nadpis", "Co u nás zaměstnanci oceňují nejvíc", { as: "h2", className: "font-display mt-3 text-4xl text-foreground sm:text-5xl" })}
      </div>

      <ul className="mx-auto mt-14 max-w-4xl divide-y divide-border/60 rounded-3xl border border-border bg-card shadow-sm">
        {GROUPS.map((g, i) => (
          <li
            key={g.title}
            className="group grid grid-cols-[auto_1fr] items-start gap-5 p-6 transition-colors hover:bg-secondary/30 sm:gap-7 sm:p-8"
          >
            {/* Icon column */}
            <div className="relative">
              <span className="flex h-14 w-14 items-center justify-center rounded-2xl bg-brand-light text-brand transition-all duration-300 group-hover:bg-brand group-hover:text-brand-foreground sm:h-16 sm:w-16">
                <g.icon className="h-6 w-6 sm:h-7 sm:w-7" strokeWidth={1.75} />
              </span>
              <span className="absolute -top-2 -right-1 rounded-full bg-warm/15 px-2 py-0.5 text-[10px] font-bold tracking-wider text-warm-dark">
                0{i + 1}
              </span>
            </div>

            {/* Content column */}
            <div className="min-w-0">
              <div className="flex flex-col gap-1 sm:flex-row sm:items-baseline sm:gap-4">
                {c.t(`kariera.benefity.${i}.nadpis`, g.title, { as: "h3", className: "font-display text-2xl text-foreground sm:text-[1.625rem]" })}
                {c.t(`kariera.benefity.${i}.text`, g.tagline, { as: "p", className: "text-sm text-muted-foreground sm:text-[15px]" })}
              </div>
              <ul className="mt-4 flex flex-wrap gap-2">
                {g.items.map((it, j) => (
                  <li
                    key={it}
                    className="rounded-full bg-brand-light/60 px-3 py-1 text-xs font-semibold text-brand-dark"
                  >
                    {c.t(`kariera.benefity.${i}.polozka.${j}`, it)}
                  </li>
                ))}
              </ul>
            </div>
          </li>
        ))}
      </ul>
    </section>
    </RegionSlot>
  );
}
