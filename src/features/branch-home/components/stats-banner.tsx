import * as Icons from "lucide-react";
import { BedDouble, DoorOpen, MapPin, CalendarHeart } from "lucide-react";
import type { LucideIcon } from "lucide-react";
import type { Branch } from "@/convex/lib/types";

export interface BranchStat {
  value: string;
  label: string;
  icon?: string;
}

interface StatsBannerProps {
  branch: Branch;
  /** Ručně nastavené údaje z administrace. Mají přednost před odvozenými. */
  stats?: BranchStat[];
}

const GENITIVE_MAP: Record<string, string> = {
  Plzeň: "Plzně",
  Praha: "Prahy",
  Brno: "Brna",
  "Karlovy Vary": "Karlových Varů",
  Stříbro: "Stříbra",
  Přepychy: "Přepych",
  Příbram: "Příbrami",
  Tábor: "Tábora",
  Kolín: "Kolína",
  Trutnov: "Trutnova",
  Duchcov: "Duchcova",
  Most: "Mostu",
  Teplice: "Teplic",
  Louny: "Loun",
  Rakovník: "Rakovníka",
  Hronov: "Hronova",
  Náchod: "Náchoda",
  Zlín: "Zlína",
  Liberec: "Liberce",
};

function toGenitive(name: string): string {
  return GENITIVE_MAP[name] ?? name;
}

/** Lucide ikona podle názvu z administrace; fallback na neutrální tečku. */
function resolveIcon(name?: string): LucideIcon {
  if (!name) return Icons.Sparkles;
  // Lucide ikony jsou forwardRef objekty, ne funkce — stačí kontrola na existenci.
  const found = (Icons as unknown as Record<string, LucideIcon | undefined>)[name];
  return found ?? Icons.Sparkles;
}

/** Fallback, dokud pobočka nemá sekci nastavenou v administraci. */
function derivedStats(branch: Branch): Array<BranchStat & { Icon: LucideIcon }> {
  return [
    branch.bed_count
      ? { value: String(branch.bed_count), label: "Lůžek", Icon: BedDouble }
      : null,
    branch.room_count
      ? { value: String(branch.room_count), label: "Pokojů", Icon: DoorOpen }
      : null,
    branch.distance_city_1_km && branch.distance_city_1_label
      ? {
          value: String(branch.distance_city_1_km),
          label: `Km od ${toGenitive(branch.distance_city_1_label)}`,
          Icon: MapPin,
        }
      : null,
    branch.opening_year
      ? {
          value: String(new Date().getFullYear() - branch.opening_year),
          label: "Let s vámi",
          Icon: CalendarHeart,
        }
      : null,
  ].filter((s): s is BranchStat & { Icon: LucideIcon } => s !== null);
}

export function StatsBanner({ branch, stats }: StatsBannerProps) {
  const resolved =
    stats && stats.length > 0
      ? stats.map((s) => ({ ...s, Icon: resolveIcon(s.icon) }))
      : derivedStats(branch);

  if (resolved.length === 0) return null;

  return (
    <section className="relative overflow-hidden bg-brand py-20 text-brand-foreground lg:py-24">
      {/* Decorativní rytmus */}
      <div
        aria-hidden="true"
        className="pointer-events-none absolute -left-32 -top-32 h-96 w-96 rounded-full bg-warm/15 blur-3xl animate-pulse-blob"
      />
      <div
        aria-hidden="true"
        className="pointer-events-none absolute -right-32 -bottom-32 h-96 w-96 rounded-full bg-brand-foreground/10 blur-3xl animate-float-slow"
      />
      <div
        aria-hidden="true"
        className="pointer-events-none absolute inset-0 bg-[radial-gradient(circle_at_50%_0%,hsl(var(--brand-foreground)/0.08),transparent_60%)]"
      />

      <div className="relative mx-auto max-w-[1320px] px-6 lg:px-10">
        <div className="text-center">
          <div className="text-[11px] font-bold uppercase tracking-[0.22em] text-warm">
            V číslech
          </div>
          <h2 className="font-display mt-3 text-3xl text-brand-foreground sm:text-4xl">
            Naše centrum v kostce
          </h2>
        </div>

        <ul
          className="mx-auto mt-14 grid w-full max-w-5xl grid-cols-2 gap-x-6 gap-y-12"
          style={{
            gridTemplateColumns: `repeat(${Math.min(resolved.length, 4)}, minmax(0, 1fr))`,
          }}
        >
          {resolved.map((s) => {
            const Icon = s.Icon;
            return (
              <li
                key={`${s.label}-${s.value}`}
                className="group flex flex-col items-center text-center"
              >
                <span className="mb-6 flex h-14 w-14 items-center justify-center rounded-2xl bg-brand-foreground/10 text-warm transition-all group-hover:bg-warm group-hover:text-warm-foreground">
                  <Icon className="h-6 w-6" strokeWidth={1.75} />
                </span>
                <div className="font-display text-5xl text-brand-foreground sm:text-6xl lg:text-7xl">
                  {s.value}
                </div>
                <div className="mt-3 max-w-[14ch] text-[11px] font-bold uppercase tracking-[0.22em] text-brand-foreground/70">
                  {s.label}
                </div>
              </li>
            );
          })}
        </ul>
      </div>
    </section>
  );
}
