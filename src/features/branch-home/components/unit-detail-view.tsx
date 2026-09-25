import Link from "next/link";
import * as Icons from "lucide-react";
import {
  ArrowRight,
  ArrowLeft,
  Phone,
  Mail,
  Clock,
  MapPin,
  User,
} from "lucide-react";
import type { Branch, BranchUnit } from "@/convex/lib/types";

interface Props {
  branch: Branch;
  unit: BranchUnit;
  related: BranchUnit[];
}

function getIcon(name?: string): Icons.LucideIcon {
  return (
    (Icons as unknown as Record<string, Icons.LucideIcon>)[name ?? "Stethoscope"] ??
    Icons.Stethoscope
  );
}

const CATEGORY_LABEL: Record<BranchUnit["category"], { label: string; eyebrow: string; backHref: string; backLabel: string }> = {
  oddeleni: {
    label: "Oddělení",
    eyebrow: "Lůžková péče",
    backHref: "/oddeleni",
    backLabel: "Všechna oddělení",
  },
  ambulance: {
    label: "Ambulance",
    eyebrow: "Odborná ambulance",
    backHref: "/ambulance",
    backLabel: "Všechny ambulance",
  },
  komplement: {
    label: "Komplement",
    eyebrow: "Doplňková péče",
    backHref: "/ambulance",
    backLabel: "Zpět",
  },
};

export function UnitDetailView({ branch, unit, related }: Props) {
  const Icon = getIcon(unit.icon);
  const meta = CATEGORY_LABEL[unit.category];

  return (
    <>
      {/* Hero / Header */}
      <section className="relative overflow-hidden border-b border-border bg-gradient-to-b from-brand-light/40 to-background">
        <div
          aria-hidden="true"
          className="pointer-events-none absolute -right-32 top-0 h-96 w-96 rounded-full bg-warm-light/40 blur-3xl"
        />
        <div className="relative mx-auto max-w-[1320px] px-6 py-14 lg:px-10 lg:py-20">
          <Link
            href={meta.backHref}
            className="inline-flex items-center gap-2 text-xs font-bold uppercase tracking-wider text-muted-foreground hover:text-brand"
          >
            <ArrowLeft className="h-3.5 w-3.5" />
            {meta.backLabel}
          </Link>

          <div className="mt-6 flex flex-col gap-8 lg:flex-row lg:items-end lg:justify-between">
            <div className="max-w-2xl">
              <div className="flex items-center gap-3">
                <span className="flex h-14 w-14 items-center justify-center rounded-2xl bg-brand text-brand-foreground shadow-md">
                  <Icon className="h-7 w-7" strokeWidth={1.75} />
                </span>
                <span className="rounded-full bg-warm-light px-3 py-1 text-[11px] font-bold uppercase tracking-[0.18em] text-warm-dark">
                  {meta.eyebrow}
                </span>
              </div>
              <h1 className="font-display mt-6 text-4xl leading-tight text-foreground sm:text-5xl lg:text-6xl">
                {unit.name}
              </h1>
              {unit.description ? (
                <p className="mt-5 text-lg leading-relaxed text-muted-foreground">
                  {unit.description}
                </p>
              ) : null}
            </div>

            <div className="grid w-full gap-3 sm:grid-cols-2 lg:w-auto lg:max-w-sm lg:grid-cols-1">
              <a
                href={`tel:${branch.phone.replace(/\s/g, "")}`}
                className="group flex items-center gap-3 rounded-2xl bg-brand p-4 text-brand-foreground shadow-md transition-transform hover:-translate-y-0.5"
              >
                <Phone className="h-5 w-5" strokeWidth={2} />
                <div>
                  <div className="text-[10px] font-bold uppercase tracking-wider opacity-80">
                    Objednání / informace
                  </div>
                  <div className="text-base font-semibold">{branch.phone}</div>
                </div>
              </a>
              <a
                href={`mailto:${branch.email}`}
                className="group flex items-center gap-3 rounded-2xl border border-border bg-card p-4 text-foreground shadow-sm transition-transform hover:-translate-y-0.5"
              >
                <Mail className="h-5 w-5 text-brand" strokeWidth={2} />
                <div>
                  <div className="text-[10px] font-bold uppercase tracking-wider text-muted-foreground">
                    E-mail
                  </div>
                  <div className="text-sm font-semibold">{branch.email}</div>
                </div>
              </a>
            </div>
          </div>
        </div>
      </section>

      {/* Info bloky */}
      <section className="mx-auto max-w-[1320px] px-6 py-16 lg:px-10 lg:py-20">
        <div className="grid gap-10 lg:grid-cols-3">
          {/* Hlavní obsah */}
          <div className="lg:col-span-2">
            <div className="prose prose-neutral max-w-none">
              <h2 className="font-display text-2xl text-foreground sm:text-3xl">
                O {meta.label.toLowerCase() === "oddělení" ? "oddělení" : "ambulanci"}
              </h2>
              <p className="mt-4 text-base leading-relaxed text-muted-foreground">
                {unit.description ??
                  `${unit.name} v ${branch.name} poskytuje péči pacientům z celého regionu. Pro objednání nebo více informací nás kontaktujte na telefonu níže.`}
              </p>

              <h3 className="font-display mt-10 text-xl text-foreground">
                Co u nás najdete
              </h3>
              <ul className="mt-4 grid gap-3 sm:grid-cols-2">
                {[
                  "Zkušený zdravotnický tým",
                  "Moderní vybavení",
                  "Příjemné prostředí",
                  "Krátké objednací doby",
                ].map((b) => (
                  <li
                    key={b}
                    className="flex items-start gap-2 rounded-xl border border-border bg-card p-3 text-sm text-foreground"
                  >
                    <span className="mt-1 h-2 w-2 shrink-0 rounded-full bg-brand" />
                    {b}
                  </li>
                ))}
              </ul>
            </div>
          </div>

          {/* Sidebar */}
          <aside className="space-y-4">
            <div className="rounded-2xl border border-border bg-card p-6">
              <div className="text-[10px] font-bold uppercase tracking-[0.18em] text-warm-dark">
                Ordinační hodiny
              </div>
              <h3 className="font-display mt-2 text-lg text-foreground">
                Provozní doba
              </h3>
              <p className="mt-3 text-sm leading-relaxed text-muted-foreground">
                <Clock className="mr-1 inline h-3.5 w-3.5" /> Aktuální ordinační
                a provozní hodiny vám rádi sdělíme telefonicky — objednání a
                informace na čísle uvedeném níže.
              </p>
            </div>

            <div className="rounded-2xl border border-border bg-card p-6">
              <div className="text-[10px] font-bold uppercase tracking-[0.18em] text-warm-dark">
                Vedoucí lékař
              </div>
              <h3 className="font-display mt-2 text-lg text-foreground">
                <User className="mr-2 inline h-4 w-4 text-brand" />
                Bude doplněno
              </h3>
              <p className="mt-2 text-sm text-muted-foreground">
                Pro detailní informace o personálu se prosím obraťte na recepci.
              </p>
            </div>

            <div className="rounded-2xl bg-brand p-6 text-brand-foreground">
              <div className="text-[10px] font-bold uppercase tracking-[0.18em] opacity-80">
                Najdete nás
              </div>
              <h3 className="font-display mt-2 text-lg">
                <MapPin className="mr-2 inline h-4 w-4" />
                {branch.name}
              </h3>
              <p className="mt-2 text-sm opacity-90">
                {branch.street}
                <br />
                {branch.zip} {branch.city}
              </p>
              <Link
                href="/kontakt"
                className="mt-4 inline-flex items-center gap-1 text-xs font-bold uppercase tracking-wider underline-offset-4 hover:underline"
              >
                Kontakt a mapa <ArrowRight className="h-3.5 w-3.5" />
              </Link>
            </div>
          </aside>
        </div>
      </section>

      {/* Související jednotky */}
      {related.length > 0 ? (
        <section className="border-t border-border bg-secondary/40">
          <div className="mx-auto max-w-[1320px] px-6 py-16 lg:px-10 lg:py-20">
            <div className="flex items-end justify-between">
              <div>
                <div className="text-[11px] font-bold uppercase tracking-[0.22em] text-warm-dark">
                  Další {meta.label.toLowerCase()}
                </div>
                <h2 className="font-display mt-2 text-3xl text-foreground">
                  Mohlo by vás zajímat
                </h2>
              </div>
              <Link
                href={meta.backHref}
                className="hidden text-xs font-bold uppercase tracking-wider text-brand hover:underline sm:inline-flex items-center gap-1"
              >
                {meta.backLabel} <ArrowRight className="h-3.5 w-3.5" />
              </Link>
            </div>

            <ul className="mt-8 grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
              {related.map((r) => {
                const RIcon = getIcon(r.icon);
                const href = `${meta.backHref}/${r.slug ?? ""}`;
                return (
                  <li key={r._id}>
                    <Link
                      href={href}
                      className="group flex h-full items-start gap-4 rounded-2xl border border-border bg-card p-5 shadow-sm transition-all hover:-translate-y-1 hover:border-brand/40 hover:shadow-md"
                    >
                      <span className="flex h-11 w-11 shrink-0 items-center justify-center rounded-xl bg-brand-light text-brand transition-colors group-hover:bg-brand group-hover:text-brand-foreground">
                        <RIcon className="h-5 w-5" strokeWidth={1.75} />
                      </span>
                      <div className="min-w-0">
                        <div className="font-semibold text-foreground group-hover:text-brand">
                          {r.name}
                        </div>
                        {r.description ? (
                          <p className="mt-1 line-clamp-2 text-sm text-muted-foreground">
                            {r.description}
                          </p>
                        ) : null}
                      </div>
                    </Link>
                  </li>
                );
              })}
            </ul>
          </div>
        </section>
      ) : null}
    </>
  );
}
