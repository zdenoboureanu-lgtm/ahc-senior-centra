import { MapPin, Phone, Mail } from "lucide-react";
import type { Branch } from "@/convex/lib/types";

interface LocationStatsSectionProps {
  branch: Branch;
}

const GENITIVE_MAP: Record<string, string> = {
  Plzeň: "Plzně",
  Praha: "Prahy",
  Brno: "Brna",
  "Karlovy Vary": "Karlových Varů",
  Stříbro: "Stříbra",
  Přepychy: "Přepych",
};

function toGenitive(name: string): string {
  return GENITIVE_MAP[name] ?? name;
}

export function LocationStatsSection({ branch }: LocationStatsSectionProps) {
  const distances = [
    branch.distance_city_1_km && branch.distance_city_1_label
      ? { km: branch.distance_city_1_km, label: branch.distance_city_1_label }
      : null,
    branch.distance_city_2_km && branch.distance_city_2_label
      ? { km: branch.distance_city_2_km, label: branch.distance_city_2_label }
      : null,
    branch.distance_city_3_km && branch.distance_city_3_label
      ? { km: branch.distance_city_3_km, label: branch.distance_city_3_label }
      : null,
  ].filter((d): d is { km: number; label: string } => d !== null);

  // Místo pouhých souřadnic použijeme textový dotaz „{name} {ulice} {město}",
  // aby Google na mapě umístil oficiální PIN zařízení (ne jen šedý marker).
  const mapQuery = encodeURIComponent(
    `${branch.name}, ${branch.street}, ${branch.city}`
  );
  const mapSrc = `https://www.google.com/maps?q=${mapQuery}&hl=cs&z=16&output=embed`;

  return (
    <section className="relative mx-auto max-w-[1320px] px-6 py-24 lg:px-10 lg:py-32">
      {/* Decorative shape */}
      <div
        aria-hidden="true"
        className="pointer-events-none absolute -left-32 top-1/4 h-80 w-80 rounded-full bg-brand-light/40 blur-3xl animate-float-slow"
      />

      <div className="relative grid gap-12 lg:grid-cols-12 lg:gap-16">
        <div className="lg:col-span-4">
          <div className="text-xs font-bold uppercase tracking-[0.22em] text-warm-dark">
            Najdete nás
          </div>
          <h2 className="font-display mt-4 text-4xl text-foreground lg:text-5xl">
            {branch.city}
            <br />
            <span className="text-brand">na dosah ruky.</span>
          </h2>
          <p className="mt-6 text-base leading-relaxed text-muted-foreground">
            Naše centrum se nachází na strategickém místě, s výbornou
            dostupností a vlastním parkovištěm.
          </p>

          <ul className="mt-10 space-y-5">
            <li className="flex items-start gap-4">
              <MapPin
                className="mt-1 h-5 w-5 shrink-0 text-brand"
                strokeWidth={1.75}
              />
              <div className="text-sm leading-relaxed">
                <div className="font-semibold text-foreground">
                  {branch.street}
                </div>
                <div className="text-muted-foreground">
                  {branch.zip} {branch.city}
                </div>
              </div>
            </li>
            <li className="flex items-start gap-4">
              <Phone
                className="mt-1 h-5 w-5 shrink-0 text-brand"
                strokeWidth={1.75}
              />
              <a
                href={`tel:${branch.phone.replace(/\s/g, "")}`}
                className="text-sm font-semibold text-foreground hover:text-brand"
              >
                {branch.phone}
              </a>
            </li>
            <li className="flex items-start gap-4">
              <Mail
                className="mt-1 h-5 w-5 shrink-0 text-brand"
                strokeWidth={1.75}
              />
              <a
                href={`mailto:${branch.email}`}
                className="text-sm font-semibold text-foreground hover:text-brand"
              >
                {branch.email}
              </a>
            </li>
          </ul>

          {distances.length > 0 ? (
            <ul className="mt-10 grid grid-cols-3 gap-4 border-t border-border pt-8">
              {distances.map((d) => (
                <li key={d.label}>
                  <div className="font-display text-3xl text-brand">
                    {d.km}
                    <span className="text-base text-muted-foreground"> km</span>
                  </div>
                  <div className="mt-1 text-[10px] font-bold uppercase tracking-[0.18em] text-muted-foreground">
                    od {toGenitive(d.label)}
                  </div>
                </li>
              ))}
            </ul>
          ) : null}
        </div>

        <div className="relative overflow-hidden rounded-[2rem] shadow-md ring-1 ring-border lg:col-span-8">
          <iframe
            title={`Mapa ${branch.name}`}
            src={mapSrc}
            className="h-full min-h-[480px] w-full border-0"
            loading="lazy"
            referrerPolicy="no-referrer-when-downgrade"
          />
        </div>
      </div>
    </section>
  );
}
