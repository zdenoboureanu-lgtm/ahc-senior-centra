import { Quote } from "lucide-react";
import type { BranchTestimonial } from "@/convex/lib/types";
import { makeCopy, type CopyProps } from "@/features/inline-edit/copy";
import {
  RegionSlot,
  TextSlot,
} from "@/features/inline-edit/components/content-slot";

interface TestimonialsSectionProps extends CopyProps {
  testimonials: BranchTestimonial[];
}

export function TestimonialsSection({
  testimonials,
  copy,
  editBranchId,
}: TestimonialsSectionProps) {
  const c = makeCopy({ copy, editBranchId });
  // Reference jsou v databázi — přepisujeme přímo záznam pobočky.
  const field = (id: string, name: "content" | "author_name" | "author_role") =>
    editBranchId
      ? ({ kind: "field", table: "branch_testimonials", id, field: name } as const)
      : undefined;
  const row = (id: string) => ({ kind: "row", table: "branch_testimonials", id }) as const;

  if (testimonials.length === 0) return null;

  return (
    <section className="relative mx-auto max-w-[1320px] px-6 py-24 lg:px-10 lg:py-32">
      <div
        aria-hidden="true"
        className="pointer-events-none absolute right-12 bottom-32 h-72 w-72 rounded-full bg-warm/10 blur-3xl animate-pulse-blob"
      />
      <div
        aria-hidden="true"
        className="pointer-events-none absolute -left-20 top-32 h-64 w-64 rounded-full bg-brand-light/40 blur-3xl animate-float-slow"
      />

      <div className="relative mx-auto max-w-3xl text-center">
        {c.t("reference.eyebrow", "Reference", {
          as: "div",
          className:
            "text-xs font-bold uppercase tracking-[0.22em] text-warm-dark",
        })}
        {c.t("reference.nadpis", "Blízcí jsou součástí naší rodiny", {
          as: "h2",
          className:
            "font-display mt-4 block text-4xl text-foreground lg:text-5xl",
        })}
        {c.t(
          "reference.text",
          "Naše péče se nejlépe popisuje slovy těch, kdo nám svěřili své blízké.",
          { as: "p", className: "mt-4 block text-base text-muted-foreground" }
        )}
      </div>

      <ul className="mx-auto mt-14 grid max-w-6xl gap-6 md:grid-cols-2 lg:grid-cols-3">
        {testimonials.slice(0, 6).map((t) => (
          <RegionSlot
            key={t._id}
            {...c.region(`row:branch_testimonials:${t._id}`, row(t._id), row(t._id))}
          >
          <li>
            <figure className="flex h-full flex-col rounded-[1.5rem] bg-card p-7 shadow-sm ring-1 ring-border/40 transition-shadow hover:shadow-md">
              <Quote
                className="h-7 w-7 text-warm"
                strokeWidth={1.25}
                aria-hidden="true"
              />
              <blockquote className="mt-5 flex-1 text-[15px] leading-relaxed text-foreground">
                „
                <TextSlot
                  target={field(t._id, "content")}
                  value={t.content}
                />
                “
              </blockquote>
              <figcaption className="mt-6 border-t border-border/60 pt-4 text-sm">
                <TextSlot
                  as="div"
                  target={field(t._id, "author_name")}
                  value={t.author_name}
                  className="font-semibold text-foreground"
                />
                {t.author_role ? (
                  <TextSlot
                    as="div"
                    target={field(t._id, "author_role")}
                    value={t.author_role}
                    className="mt-0.5 block text-xs uppercase tracking-[0.18em] text-muted-foreground"
                  />
                ) : null}
              </figcaption>
            </figure>
          </li>
          </RegionSlot>
        ))}
      </ul>
    </section>
  );
}
