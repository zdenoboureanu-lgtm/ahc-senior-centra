import Link from "next/link";
import Image from "next/image";
import { ArrowRight, Phone, Mail } from "lucide-react";
import { FacebookIcon } from "@/common/components/social-icons";
import type { Branch } from "@/convex/lib/types";
import {
  ImageSlot,
  TextSlot,
} from "@/features/inline-edit/components/content-slot";

interface HeroSectionProps {
  branch: Branch;
  /** Přihlášený správce může podnadpis přepsat a fotku vyměnit přímo tady. */
  canEdit?: boolean;
}

export function HeroSection({ branch, canEdit = false }: HeroSectionProps) {
  return (
    <section className="relative overflow-hidden">
      {/* Decorative background */}
      <div
        aria-hidden="true"
        className="pointer-events-none absolute inset-x-0 top-0 -z-10 h-[80%] bg-gradient-to-br from-warm/8 via-background to-brand-light/30"
      />
      <div
        aria-hidden="true"
        className="pointer-events-none absolute -right-40 top-20 -z-10 h-[420px] w-[420px] rounded-full bg-warm/15 blur-3xl animate-pulse-blob"
      />
      <div
        aria-hidden="true"
        className="pointer-events-none absolute left-1/4 top-1/3 -z-10 h-64 w-64 rounded-full bg-brand-light/30 blur-3xl animate-float-slow"
      />

      <div className="mx-auto grid max-w-[1320px] gap-12 px-6 pb-24 pt-12 lg:grid-cols-12 lg:gap-12 lg:px-10 lg:pb-32 lg:pt-20">
        <div className="flex animate-fade-up flex-col justify-center lg:col-span-6">
          <div className="flex items-center gap-3 text-xs font-bold uppercase tracking-[0.22em] text-brand">
            <span className="h-px w-10 bg-warm" />
            <span>{branch.short_name}</span>
            <span className="text-muted-foreground/50">·</span>
            <span className="text-muted-foreground">
              {branch.type_label ?? "Senior centrum"}
            </span>
          </div>

          <h1 className="font-display mt-7 text-[clamp(2.25rem,4.5vw,4rem)] leading-[1.05] text-foreground">
            {(() => {
              const raw = branch.tagline ?? "Péče\n*s respektem*\nke stáří";
              const hasMarker = /\*[^*]+\*/.test(raw);
              const lines = raw.split("\n");
              return lines.map((line, i, arr) => {
                // Pokud má tagline marker(y) `*...*` → zvýrazni jen takto označený text.
                if (hasMarker) {
                  const parts = line.split(/(\*[^*]+\*)/g).filter(Boolean);
                  return (
                    <span key={i} className="block">
                      {parts.map((p, j) =>
                        p.startsWith("*") && p.endsWith("*") ? (
                          <span key={j} className="text-brand">
                            {p.slice(1, -1)}
                          </span>
                        ) : (
                          <span key={j}>{p}</span>
                        )
                      )}
                    </span>
                  );
                }
                // Fallback: poslední řádek brand.
                return (
                  <span
                    key={i}
                    className={
                      i === arr.length - 1 ? "block text-brand" : "block"
                    }
                  >
                    {line}
                  </span>
                );
              });
            })()}
          </h1>

          {branch.subtitle ? (
            <TextSlot
              as="p"
              target={
                canEdit
                  ? {
                      kind: "field",
                      table: "branches",
                      id: branch._id,
                      field: "subtitle",
                    }
                  : undefined
              }
              value={branch.subtitle}
              className="mt-7 max-w-xl text-lg leading-[1.7] text-muted-foreground"
            />
          ) : null}

          <div className="mt-10 flex flex-wrap items-center gap-4">
            <Link
              href={branch.branch_type === "hospital" ? "/kontakt" : "/zadost-o-prijeti"}
              className="group inline-flex items-center gap-3 rounded-full bg-brand px-7 py-4 text-sm font-semibold text-brand-foreground shadow-lg shadow-brand/15 transition-all hover:bg-brand-dark hover:shadow-xl hover:shadow-brand/25"
            >
              {branch.branch_type === "hospital"
                ? "Rychlý kontakt"
                : "Žádost o přijetí"}
              <ArrowRight className="h-4 w-4 transition-transform group-hover:translate-x-0.5" />
            </Link>

            <a
              href={`tel:${branch.phone.replace(/\s/g, "")}`}
              className="group inline-flex items-center gap-2.5 text-sm font-semibold text-foreground"
              aria-label={`Telefon: ${branch.phone}`}
            >
              <span className="flex h-11 w-11 items-center justify-center rounded-full border border-border bg-background transition-all group-hover:border-brand group-hover:bg-brand-light">
                <Phone className="h-4 w-4 text-brand" strokeWidth={2.25} />
              </span>
              <span className="border-b border-transparent transition-colors group-hover:border-brand group-hover:text-brand">
                {branch.phone}
              </span>
            </a>

            <a
              href={`mailto:${branch.email}`}
              className="group inline-flex items-center gap-2.5 text-sm font-semibold text-foreground"
              aria-label={`E-mail: ${branch.email}`}
            >
              <span className="flex h-11 w-11 items-center justify-center rounded-full border border-border bg-background transition-all group-hover:border-brand group-hover:bg-brand-light">
                <Mail className="h-4 w-4 text-brand" strokeWidth={2.25} />
              </span>
              <span className="border-b border-transparent transition-colors group-hover:border-brand group-hover:text-brand">
                {branch.email}
              </span>
            </a>

            {branch.facebook_url ? (
              <a
                href={branch.facebook_url}
                target="_blank"
                rel="noopener noreferrer"
                className="group inline-flex items-center gap-2.5 text-sm font-semibold text-foreground"
                aria-label="Facebook"
              >
                <span className="flex h-11 w-11 items-center justify-center rounded-full border border-border bg-background transition-all group-hover:border-brand group-hover:bg-brand-light">
                  <FacebookIcon className="h-4 w-4 text-brand" />
                </span>
                <span className="border-b border-transparent transition-colors group-hover:border-brand group-hover:text-brand">
                  Náš Facebook
                </span>
              </a>
            ) : null}
          </div>
        </div>

        {/* Pravá fotka — širší ratio */}
        <div className="relative animate-fade-up lg:col-span-6" style={{ animationDelay: "120ms" }}>
          <div className="relative aspect-[5/4] overflow-hidden rounded-[2rem] bg-muted shadow-2xl shadow-brand/15">
            {branch.cover_image ? (
              <Image
                src={branch.cover_image}
                alt={branch.name}
                fill
                priority
                quality={92}
                sizes="(min-width: 1280px) 660px, (min-width: 1024px) 50vw, 100vw"
                className="object-cover"
              />
            ) : null}
            <ImageSlot
              target={
                canEdit
                  ? {
                      kind: "field",
                      table: "branches",
                      id: branch._id,
                      field: "cover_image",
                    }
                  : undefined
              }
              label="Vyměnit titulní fotku"
            />
          </div>
        </div>
      </div>
    </section>
  );
}
