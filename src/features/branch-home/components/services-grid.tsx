import * as Icons from "lucide-react";
import { SectionHeading } from "@/features/site/components/section-heading";
import type { BranchService } from "../../../../convex/lib/types";
import { cn } from "@/lib/utils";

interface ServicesGridProps {
  services: BranchService[];
}

export function ServicesGrid({ services }: ServicesGridProps) {
  if (services.length === 0) return null;

  return (
    <section className="mx-auto max-w-7xl px-4 py-16 sm:px-6 lg:px-8">
      <SectionHeading
        eyebrow="Naše služby"
        title="Co u nás najdete"
        description="Komplexní spektrum služeb šitých na míru potřebám seniorů."
        align="center"
      />
      <div className="mt-10 grid grid-cols-2 gap-3 sm:grid-cols-3 sm:gap-4 lg:grid-cols-4">
        {services.map((s) => {
          const Icon =
            (Icons as unknown as Record<string, Icons.LucideIcon>)[s.icon] ??
            Icons.Sparkles;
          return (
            <div
              key={s._id}
              className={cn(
                "group flex flex-col items-center gap-3 rounded-xl border border-border bg-card p-5 text-center",
                "transition-all hover:border-brand hover:shadow-md"
              )}
            >
              <div className="flex h-12 w-12 items-center justify-center rounded-full bg-brand-light text-brand transition-colors group-hover:bg-brand group-hover:text-brand-foreground">
                <Icon className="h-6 w-6" />
              </div>
              <div className="text-sm font-semibold text-foreground">
                {s.title}
              </div>
            </div>
          );
        })}
      </div>
    </section>
  );
}
