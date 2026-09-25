import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from "@/components/ui/accordion";
import { SectionHeading } from "@/features/site/components/section-heading";
import type { BranchFaq } from "../../../../convex/lib/types";

interface FaqSectionProps {
  faq: BranchFaq[];
}

export function FaqSection({ faq }: FaqSectionProps) {
  if (faq.length === 0) return null;

  return (
    <section className="bg-secondary/40">
      <div className="mx-auto max-w-3xl px-4 py-16 sm:px-6 lg:px-8">
        <SectionHeading
          eyebrow="FAQ"
          title="Nejčastější dotazy"
          align="center"
        />
        <Accordion type="single" collapsible className="mt-8">
          {faq.map((f) => (
            <AccordionItem key={f._id} value={f._id}>
              <AccordionTrigger className="text-left text-base font-semibold">
                {f.question}
              </AccordionTrigger>
              <AccordionContent className="text-sm text-muted-foreground">
                {f.answer}
              </AccordionContent>
            </AccordionItem>
          ))}
        </Accordion>
      </div>
    </section>
  );
}
