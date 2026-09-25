import Link from "next/link";
import {
  Stethoscope,
  Clock,
  Phone,
  ArrowUpRight,
  Building2,
  FileText,
  HeartPulse,
} from "lucide-react";
import type { LucideIcon } from "lucide-react";
import type { Branch } from "@/convex/lib/types";

interface QuickAccessTile {
  icon: LucideIcon;
  label: string;
  description: string;
  href: string;
  primary?: boolean;
}

interface Props {
  branch: Branch;
}

/**
 * 3 hlavní rozcestníky hned pod hero — to, co lidé na nemocničním webu hledají
 * nejvíc (inspirováno fnhk.cz a podobnými nemocničními weby).
 */
export function HospitalQuickAccess({ branch }: Props) {
  const tiles: QuickAccessTile[] = [
    {
      icon: Stethoscope,
      label: "Ambulance a oddělení",
      description:
        "Najděte si svého lékaře, ordinační hodiny a kontakt na ambulanci.",
      href: "/ambulance",
      primary: true,
    },
    {
      icon: Phone,
      label: "Spojte se s námi",
      description: `Recepce, kontaktní formulář a tým — ${branch.phone_short ?? branch.phone}.`,
      href: "/kontakt",
    },
    {
      icon: FileText,
      label: "Pro pacienty",
      description: "Co si vzít s sebou, ceníky, formuláře a praktické informace.",
      href: "/o-nas",
    },
  ];

  return (
    <section className="relative -mt-6 mx-auto max-w-[1320px] px-6 pb-10 lg:-mt-12 lg:px-10 lg:pb-16">
      <ul className="grid gap-4 sm:grid-cols-3 lg:gap-6">
        {tiles.map((t) => {
          return (
            <li key={t.label}>
              <Link
                href={t.href}
                className={[
                  "group relative flex h-full flex-col rounded-3xl border p-6 shadow-sm transition-all hover:-translate-y-1 hover:shadow-lg sm:p-7",
                  t.primary
                    ? "border-transparent bg-brand text-brand-foreground hover:shadow-brand/25"
                    : "border-border bg-card text-foreground hover:border-brand/40",
                ].join(" ")}
              >
                <span
                  className={[
                    "flex h-12 w-12 items-center justify-center rounded-2xl transition-colors",
                    t.primary
                      ? "bg-warm-light/20 text-warm"
                      : "bg-warm-light text-warm-dark group-hover:bg-warm group-hover:text-warm-foreground",
                  ].join(" ")}
                >
                  <t.icon className="h-5 w-5" strokeWidth={1.75} />
                </span>
                <h3
                  className={[
                    "font-display mt-5 text-xl leading-tight sm:text-2xl",
                    t.primary ? "text-brand-foreground" : "text-foreground",
                  ].join(" ")}
                >
                  {t.label}
                </h3>
                <p
                  className={[
                    "mt-2 text-[14px] leading-relaxed",
                    t.primary
                      ? "text-brand-foreground/85"
                      : "text-muted-foreground",
                  ].join(" ")}
                >
                  {t.description}
                </p>
                <ArrowUpRight
                  aria-hidden="true"
                  className={[
                    "absolute right-5 top-5 h-5 w-5 transition-transform group-hover:translate-x-0.5 group-hover:-translate-y-0.5",
                    t.primary ? "text-brand-foreground/70" : "text-brand/70",
                  ].join(" ")}
                  strokeWidth={2}
                />
              </Link>
            </li>
          );
        })}
      </ul>
    </section>
  );
}

// Suppress unused imports (alternative icon palette pro budoucí editaci)
void Clock;
void Building2;
void HeartPulse;
