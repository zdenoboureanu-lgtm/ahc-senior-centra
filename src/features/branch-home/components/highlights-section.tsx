import Image from "next/image";
import Link from "next/link";
import * as Icons from "lucide-react";
import { ArrowRight } from "lucide-react";
import type { Branch, BranchHighlight } from "@/convex/lib/types";
import { TextSlot } from "@/features/inline-edit/components/content-slot";
import type { EditTarget } from "@/features/inline-edit/edit-mode-context";

interface HighlightsSectionProps {
  highlights: BranchHighlight[];
  branch: Branch;
  /** Zapne přepisování textů v kartách pro přihlášeného správce. */
  canEdit?: boolean;
}

const SENIOR_IMAGE = "/images/services.png";
const HOSPITAL_IMAGE = "/images/duchcov-aerial.jpg";

interface SectionCopy {
  eyebrow: string;
  title: string;
  intro: string;
  lastCta?: { label: string; href: string };
}

const COPY: Record<"hospital" | "senior_centrum", SectionCopy> = {
  senior_centrum: {
    eyebrow: "Vše o nás",
    title: "Domov, ne instituce.",
    intro:
      "Naše péče stojí na třech pilířích — pohodlí, blízkosti a transparentnosti.",
    lastCta: { label: "Žádost o přijetí", href: "/zadost-o-prijeti" },
  },
  hospital: {
    eyebrow: "Naše nemocnice",
    title: "Komplexní péče blízko domova.",
    intro:
      "Odborná zdravotní péče s lidským přístupem — a tradice, na kterou navazujeme.",
    lastCta: { label: "Najít ambulanci", href: "/ambulance" },
  },
};

export function HighlightsSection({
  highlights,
  branch,
  canEdit = false,
}: HighlightsSectionProps) {
  if (highlights.length === 0) return null;

  const target = (id: string, field: string): EditTarget | undefined =>
    canEdit ? { kind: "field", table: "branch_highlights", id, field } : undefined;

  const isHospital = branch.branch_type === "hospital";
  const copy = isHospital ? COPY.hospital : COPY.senior_centrum;
  // Foto musí patřit dané pobočce — pro nemocnice použijeme jejich vlastní
  // cover (ne natvrdo Duchcov). Senior centra mají generický motiv péče.
  const image = isHospital
    ? (branch.cover_image ?? HOSPITAL_IMAGE)
    : SENIOR_IMAGE;

  return (
    <section className="relative border-y border-border/40 bg-card">
      <div
        aria-hidden="true"
        className="pointer-events-none absolute -left-32 top-1/3 h-80 w-80 rounded-full bg-warm/10 blur-3xl animate-pulse-blob"
      />

      <div className="relative mx-auto max-w-[1320px] px-6 py-20 lg:px-10 lg:py-28">
        <div className="grid gap-12 lg:grid-cols-12 lg:gap-14">
          {/* Levá: foto přes celou výšku */}
          <div className="lg:col-span-5">
            <div className="relative h-full min-h-[420px] overflow-hidden rounded-[2rem] bg-muted shadow-md lg:sticky lg:top-28 lg:min-h-[600px]">
              <Image
                src={image}
                alt={branch.name}
                fill
                quality={92}
                sizes="(min-width: 1024px) 42vw, 100vw"
                className="object-cover"
              />
            </div>
          </div>

          {/* Pravá: header + 3 highlight karty */}
          <div className="lg:col-span-7">
            <div className="text-xs font-bold uppercase tracking-[0.22em] text-warm-dark">
              {copy.eyebrow}
            </div>
            <h2 className="font-display mt-4 text-4xl text-foreground lg:text-[2.75rem] lg:leading-tight">
              {copy.title}
            </h2>
            <p className="mt-5 max-w-xl text-base leading-relaxed text-muted-foreground">
              {copy.intro}
            </p>

            <ul className="mt-10 space-y-5">
              {highlights.map((h, i) => {
                const Icon =
                  (Icons as unknown as Record<string, Icons.LucideIcon>)[
                    h.icon ?? "Sparkles"
                  ] ?? Icons.Sparkles;
                const isLast = i === highlights.length - 1;
                return (
                  <li
                    key={h._id}
                    className="group rounded-2xl border border-border/60 bg-background p-6 transition-all hover:border-brand/40 hover:shadow-md sm:p-7"
                  >
                    <div className="flex items-start gap-5">
                      <span className="flex h-12 w-12 shrink-0 items-center justify-center rounded-2xl bg-brand-light text-brand transition-colors group-hover:bg-brand group-hover:text-brand-foreground">
                        <Icon className="h-5 w-5" strokeWidth={1.75} />
                      </span>
                      <div className="flex-1">
                        <div className="flex items-center gap-3">
                          <span className="text-xs font-bold tracking-[0.18em] text-warm-dark">
                            0{i + 1}
                          </span>
                          <TextSlot
                            as="h3"
                            target={target(h._id, "title")}
                            value={h.title}
                            className="font-display text-xl text-foreground sm:text-2xl"
                          />
                        </div>
                        <TextSlot
                          as="p"
                          target={target(h._id, "description")}
                          value={h.description}
                          className="mt-2 text-[15px] leading-relaxed text-muted-foreground"
                        />
                        {isLast && copy.lastCta ? (
                          <Link
                            href={copy.lastCta.href}
                            className="mt-4 inline-flex items-center gap-2 text-xs font-bold uppercase tracking-wider text-brand transition-all hover:gap-3"
                          >
                            {copy.lastCta.label}
                            <ArrowRight className="h-3.5 w-3.5" />
                          </Link>
                        ) : null}
                      </div>
                    </div>
                  </li>
                );
              })}
            </ul>
          </div>
        </div>
      </div>
    </section>
  );
}
