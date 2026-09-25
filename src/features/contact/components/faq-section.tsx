import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from "@/components/ui/accordion";
import type { BranchFaq } from "@/convex/lib/types";
import { makeCopy, type CopyProps } from "@/features/inline-edit/copy";
import {
  RegionSlot,
  TextSlot,
} from "@/features/inline-edit/components/content-slot";

interface FaqSectionProps extends CopyProps {
  faq: BranchFaq[];
}

export function FaqSection({ faq, copy, editBranchId }: FaqSectionProps) {
  const c = makeCopy({ copy, editBranchId });
  const field = (id: string, name: "question" | "answer") =>
    editBranchId
      ? ({ kind: "field", table: "branch_faq", id, field: name } as const)
      : undefined;
  const row = (id: string) => ({ kind: "row", table: "branch_faq", id }) as const;

  if (faq.length === 0) return null;

  return (
    <section className="mx-auto max-w-4xl px-4 py-16 sm:px-6 lg:px-8">
      {c.t("faq.nadpis", "Nejčastější dotazy", {
        as: "h2",
        className:
          "font-display block text-center text-3xl text-foreground sm:text-4xl",
      })}
      <Accordion type="single" collapsible className="mt-8 space-y-3">
        {faq.map((f) => (
          <RegionSlot
            key={f._id}
            {...c.region(`row:branch_faq:${f._id}`, row(f._id), row(f._id))}
          >
          <AccordionItem
            value={f._id}
            className="rounded-2xl border-0 bg-secondary/40 px-6 data-[state=open]:bg-secondary"
          >
            <AccordionTrigger className="py-4 text-left text-base font-semibold text-foreground hover:no-underline">
              <TextSlot target={field(f._id, "question")} value={f.question} />
            </AccordionTrigger>
            <AccordionContent className="text-sm leading-relaxed text-muted-foreground">
              <TextSlot target={field(f._id, "answer")} value={f.answer} />
            </AccordionContent>
          </AccordionItem>
          </RegionSlot>
        ))}
      </Accordion>
    </section>
  );
}
