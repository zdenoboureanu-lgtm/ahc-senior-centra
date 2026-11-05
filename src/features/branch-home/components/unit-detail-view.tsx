import Link from "next/link";
import * as Icons from "lucide-react";
import { ArrowRight, ArrowLeft, Phone, Mail, Clock, MapPin, User } from "lucide-react";
import type { Branch, BranchUnit } from "@/convex/lib/types";
import {
  RegionSlot,
  TextSlot,
} from "@/features/inline-edit/components/content-slot";
import { EditOnly } from "@/features/inline-edit/components/edit-only";
import { makeCopy, type CopyProps } from "@/features/inline-edit/copy";
import type { EditTarget } from "@/features/inline-edit/edit-mode-context";

interface Props extends CopyProps {
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

const wrap = "mx-auto max-w-[1320px] px-6 lg:px-10";

const CATEGORY_LABEL: Record<
  BranchUnit["category"],
  { label: string; eyebrow: string; backHref: string; backLabel: string }
> = {
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

export function UnitDetailView({
  branch,
  unit,
  related,
  copy,
  editBranchId,
}: Props) {
  const Icon = getIcon(unit.icon);
  const meta = CATEGORY_LABEL[unit.category];
  const c = makeCopy({ copy, editBranchId });

  /** Cíl editace pole jednotky — bez přihlášení je prázdný. */
  const field = (
    name: "name" | "description" | "body" | "lead_doctor" | "hours" | "phone" | "email"
  ): EditTarget | undefined =>
    editBranchId
      ? { kind: "field", table: "branch_units", id: unit._id, field: name }
      : undefined;

  /**
   * Text, který se dá doplnit. Prázdné pole vidí jen správce v režimu úprav —
   * návštěvníkovi se nic nevykreslí, takže na stránce nezůstane „Bude doplněno".
   */
  const fillable = (
    name: Parameters<typeof field>[0],
    value: string | undefined,
    placeholder: string,
    className: string,
    as: "p" | "div" | "h3" = "p"
  ) => {
    const target = field(name);
    if (value) return <TextSlot as={as} target={target} value={value} className={className} />;
    if (!target) return null;
    return (
      <EditOnly>
        <TextSlot as={as} target={target} value={placeholder} className={className} />
      </EditOnly>
    );
  };

  const phone = unit.phone ?? branch.phone;
  const email = unit.email ?? branch.email;

  return (
    <>
      {/* Hlavička */}
      <section className="relative overflow-hidden border-b border-border bg-gradient-to-b from-brand-light/40 to-background">
        <div
          aria-hidden="true"
          className="pointer-events-none absolute -right-32 top-0 h-96 w-96 rounded-full bg-warm-light/40 blur-3xl"
        />
        <div className={`relative ${wrap} py-14 lg:py-20`}>
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
              <TextSlot
                as="h1"
                target={field("name")}
                value={unit.name}
                className="font-display mt-6 block text-4xl leading-[1.1] text-foreground sm:text-5xl"
              />
              {fillable(
                "description",
                unit.description,
                "Doplnit krátký popis",
                "mt-5 block text-base leading-relaxed text-muted-foreground"
              )}
            </div>

            <div className="grid w-full gap-3 sm:grid-cols-2 lg:w-auto lg:max-w-sm lg:grid-cols-1">
              <a
                href={`tel:${phone.replace(/\s/g, "")}`}
                className="group flex items-center gap-3 rounded-2xl bg-brand p-4 text-brand-foreground shadow-md transition-transform hover:-translate-y-0.5"
              >
                <Phone className="h-5 w-5 shrink-0" strokeWidth={2} />
                <div className="min-w-0">
                  <div className="text-[10px] font-bold uppercase tracking-wider opacity-80">
                    Objednání / informace
                  </div>
                  <TextSlot
                    as="div"
                    target={field("phone")}
                    value={phone}
                    className="text-base font-semibold"
                  />
                </div>
              </a>
              <a
                href={`mailto:${email}`}
                className="group flex items-center gap-3 rounded-2xl border border-border bg-card p-4 text-foreground shadow-sm transition-transform hover:-translate-y-0.5"
              >
                <Mail className="h-5 w-5 shrink-0 text-brand" strokeWidth={2} />
                <div className="min-w-0">
                  <div className="text-[10px] font-bold uppercase tracking-wider text-muted-foreground">
                    E-mail
                  </div>
                  <TextSlot
                    as="div"
                    target={field("email")}
                    value={email}
                    className="break-words text-sm font-semibold"
                  />
                </div>
              </a>
            </div>
          </div>
        </div>
      </section>

      {/* Obsah */}
      <section className={`${wrap} py-16 lg:py-20`}>
        <div className="grid gap-10 lg:grid-cols-3">
          <div className="lg:col-span-2">
            {c.t(
              `oddeleni.detail.nadpis`,
              `O ${unit.category === "oddeleni" ? "oddělení" : "pracovišti"}`,
              {
                as: "h2",
                className: "font-display block text-3xl text-foreground sm:text-4xl",
              }
            )}
            {/* Dokud není delší text, ukážeme aspoň krátký popis — ale needitovatelně,
                ať se omylem nezaloží dvě rozcházející se verze téhož textu. */}
            {unit.body ? (
              <TextSlot
                as="p"
                target={field("body")}
                value={unit.body}
                className="mt-5 block whitespace-pre-line text-base leading-[1.8] text-muted-foreground"
              />
            ) : (
              <>
                {unit.description ? (
                  <p className="mt-5 text-base leading-[1.8] text-muted-foreground">
                    {unit.description}
                  </p>
                ) : null}
                {field("body") ? (
                  <EditOnly>
                    <TextSlot
                      as="p"
                      target={field("body")}
                      value="Doplnit podrobný text o oddělení — čím se zabývá, pro koho je určené, jak péče probíhá."
                      className="mt-5 block whitespace-pre-line text-base leading-[1.8] text-muted-foreground"
                    />
                  </EditOnly>
                ) : null}
              </>
            )}
          </div>

          <aside className="space-y-4">
            <div className="rounded-2xl border border-border bg-card p-6">
              <div className="text-[10px] font-bold uppercase tracking-[0.18em] text-warm-dark">
                Ordinační hodiny
              </div>
              <h3 className="font-display mt-2 flex items-center gap-2 text-lg text-foreground">
                <Clock className="h-4 w-4 shrink-0 text-brand" /> Provozní doba
              </h3>
              {fillable(
                "hours",
                unit.hours,
                "Doplnit ordinační hodiny",
                "mt-3 block whitespace-pre-line text-sm leading-relaxed text-muted-foreground"
              ) ?? (
                <p className="mt-3 text-sm leading-relaxed text-muted-foreground">
                  Aktuální ordinační hodiny vám rádi sdělíme telefonicky.
                </p>
              )}
            </div>

            {unit.lead_doctor || editBranchId ? (
              <div className="rounded-2xl border border-border bg-card p-6">
                <div className="text-[10px] font-bold uppercase tracking-[0.18em] text-warm-dark">
                  Vedoucí lékař
                </div>
                {fillable(
                  "lead_doctor",
                  unit.lead_doctor,
                  "Doplnit jméno",
                  "font-display mt-2 flex items-center gap-2 text-lg text-foreground",
                  "h3"
                )}
              </div>
            ) : null}

            <div className="rounded-2xl bg-brand p-6 text-brand-foreground">
              <div className="text-[10px] font-bold uppercase tracking-[0.18em] opacity-80">
                Najdete nás
              </div>
              <h3 className="font-display mt-2 flex items-center gap-2 text-lg">
                <MapPin className="h-4 w-4 shrink-0" />
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

      {/* Související pracoviště */}
      {related.length > 0 ? (
        <RegionSlot {...c.region("sekce.oddeleni.dalsi")}>
          <section className="border-t border-border bg-secondary/40">
            <div className={`${wrap} py-16 lg:py-20`}>
              <div className="flex items-end justify-between">
                <div>
                  <div className="text-[11px] font-bold uppercase tracking-[0.22em] text-warm-dark">
                    Další {meta.label.toLowerCase()}
                  </div>
                  {c.t("oddeleni.dalsi.nadpis", "Mohlo by vás zajímat", {
                    as: "h2",
                    className: "font-display mt-2 block text-3xl text-foreground sm:text-4xl",
                  })}
                </div>
                <Link
                  href={meta.backHref}
                  className="hidden items-center gap-1 text-xs font-bold uppercase tracking-wider text-brand hover:underline sm:inline-flex"
                >
                  {meta.backLabel} <ArrowRight className="h-3.5 w-3.5" />
                </Link>
              </div>

              <ul className="mt-8 grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
                {related.map((r) => {
                  const RIcon = getIcon(r.icon);
                  return (
                    <li key={r._id}>
                      <Link
                        href={`${meta.backHref}/${r.slug ?? ""}`}
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
        </RegionSlot>
      ) : null}
    </>
  );
}
