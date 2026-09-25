import Image from "next/image";
import * as Icons from "lucide-react";
import type { BranchCareerPerk } from "@/convex/lib/types";

interface CareerPerksSectionProps {
  perks: BranchCareerPerk[];
}

const IMAGE =
  "https://images.unsplash.com/photo-1576091160550-2173dba999ef?w=1200&q=80";

export function CareerPerksSection({ perks }: CareerPerksSectionProps) {
  if (perks.length === 0) return null;

  return (
    <section className="bg-secondary/40">
      <div className="mx-auto grid max-w-7xl gap-8 px-4 py-16 sm:px-6 lg:grid-cols-[1fr_1.4fr] lg:gap-12 lg:px-8">
        <div className="relative aspect-[4/5] overflow-hidden rounded-3xl shadow-sm">
          <Image
            src={IMAGE}
            alt="Sestra a klient"
            fill
            sizes="(min-width: 1024px) 40vw, 100vw"
            className="object-cover"
          />
        </div>

        <div className="flex flex-col justify-center">
          <div className="text-xs font-bold uppercase tracking-[0.18em] text-brand">
            Výhody
          </div>
          <h2 className="mt-3 text-3xl font-bold tracking-tight text-foreground sm:text-4xl">
            Proč pracovat u nás?
          </h2>

          <div className="mt-8 grid gap-5 sm:grid-cols-3">
            {perks.map((p) => {
              const Icon =
                (Icons as unknown as Record<string, Icons.LucideIcon>)[
                  p.icon ?? "Sparkles"
                ] ?? Icons.Sparkles;
              return (
                <div
                  key={p._id}
                  className="rounded-2xl bg-card p-5 shadow-sm ring-1 ring-border/60"
                >
                  <div className="flex h-10 w-10 items-center justify-center rounded-full bg-brand-light text-brand">
                    <Icon className="h-5 w-5" />
                  </div>
                  <h3 className="mt-4 text-base font-bold text-foreground">
                    {p.title}
                  </h3>
                  <p className="mt-2 text-sm leading-relaxed text-muted-foreground">
                    {p.description}
                  </p>
                </div>
              );
            })}
          </div>
        </div>
      </div>
    </section>
  );
}
