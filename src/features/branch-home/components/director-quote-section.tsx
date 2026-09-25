import Image from "next/image";
import type { BranchTeamMember } from "../../../../convex/lib/types";

interface DirectorQuoteSectionProps {
  director: BranchTeamMember | null;
}

export function DirectorQuoteSection({ director }: DirectorQuoteSectionProps) {
  if (!director) return null;

  return (
    <section className="mx-auto max-w-7xl px-4 py-16 sm:px-6 lg:px-8">
      <div className="overflow-hidden rounded-2xl border border-border bg-card shadow-sm">
        <div className="grid gap-8 p-8 md:grid-cols-[auto_1fr] md:items-center md:p-12">
          {director.photo_url ? (
            <div className="relative h-32 w-32 overflow-hidden rounded-full md:h-40 md:w-40">
              <Image
                src={director.photo_url}
                alt={director.name}
                fill
                sizes="160px"
                className="object-cover"
              />
            </div>
          ) : null}
          <div>
            <div className="text-xs font-semibold uppercase tracking-[0.18em] text-brand">
              Slovo ředitelky
            </div>
            <blockquote className="mt-3 text-xl font-medium text-foreground sm:text-2xl">
              „{director.bio ??
                "Naším posláním je poskytovat seniorům péči, kterou si zaslouží — s respektem, láskou a profesionálně."}"
            </blockquote>
            <div className="mt-4 text-sm">
              <span className="font-semibold text-foreground">
                {director.name}
              </span>
              <span className="text-muted-foreground"> — {director.role}</span>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
