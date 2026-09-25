"use client";

import Image from "next/image";
import { useState } from "react";
import { ChevronLeft, ChevronRight } from "lucide-react";
import { cn } from "@/lib/utils";
import { makeCopy, type CopyProps } from "@/features/inline-edit/copy";
import { RegionSlot } from "@/features/inline-edit/components/content-slot";

interface Story {
  photo: string;
  role: string;
  hook: string;
  body: string[];
  author: string;
  authorRole: string;
}

const STORIES: Story[] = [
  {
    photo: "/images/team/story-1.jpg",
    role: "Všeobecná sestra",
    hook: "Po 12 letech v nemocnici jsem chtěla odejít ze zdravotnictví.",
    body: [
      "Měla jsem pocit, že už nemůžu dál. Přetížení, stres, neustálý tlak.",
      "Do AHC jsem šla původně jen „zkusit něco jiného“.",
      "Nakonec jsem zjistila, že zdravotnictví může fungovat i lidsky.",
      "Dnes tu pracuji čtvrtým rokem. Ne proto, že by ta práce byla jednoduchá. Ale protože na ni nejsem sama.",
    ],
    author: "Jana",
    authorRole: "Všeobecná sestra",
  },
  {
    photo: "/images/team/story-2.jpg",
    role: "Fyzioterapeutka",
    hook: "Tady mám pocit, že moje práce opravdu něco mění.",
    body: [
      "Nejde jen o rehabilitaci. Jde o to vracet lidem samostatnost, jistotu a někdy i chuť fungovat dál.",
      "Na AHC mě baví, že člověk není jen „číslo do směny“.",
    ],
    author: "Eva",
    authorRole: "Fyzioterapeutka",
  },
  {
    photo: "/images/team/story-3.jpg",
    role: "Praktická sestra",
    hook: "Bála jsem se, že jako absolventka budu všem spíš na obtíž.",
    body: [
      "Místo toho jsem dostala podporu, mentoring a kolegy, kteří mi pomohli zvládnout začátky.",
      "To bylo pro mě úplně klíčové.",
    ],
    author: "Tereza",
    authorRole: "Praktická sestra",
  },
];

export function EmployeeStoriesSection({ copy, editBranchId }: CopyProps) {
  const c = makeCopy({ copy, editBranchId });
  const [index, setIndex] = useState(0);
  const total = STORIES.length;

  const goPrev = () => setIndex((i) => (i - 1 + total) % total);
  const goNext = () => setIndex((i) => (i + 1) % total);
  const current = STORIES[index];

  return (
    <section className="border-y border-border/40 bg-secondary/30">
      <div className="mx-auto max-w-[1320px] px-6 py-20 lg:px-10 lg:py-28">
        <div className="mx-auto max-w-3xl text-center">
          <div className="text-[11px] font-bold uppercase tracking-[0.22em] text-warm-dark">
            Zaměstnanecké příběhy
          </div>
          <h2 className="font-display mt-3 text-4xl text-foreground sm:text-5xl">
            Naši lidé, jejich cesty
          </h2>
        </div>

        <div className="mx-auto mt-14 max-w-5xl">
          {/* Slide — foto vlevo, text vpravo */}
          <article
            key={current.author}
            className="grid animate-fade-up overflow-hidden rounded-3xl border border-border bg-card shadow-md lg:grid-cols-[1fr_1.4fr]"
          >
            <div className="relative aspect-[4/5] w-full lg:aspect-auto lg:min-h-[520px]">
              <Image
                src={current.photo}
                alt={`${current.author} – ${current.authorRole}`}
                fill
                quality={92}
                sizes="(min-width: 1024px) 40vw, 100vw"
                className="object-cover"
                priority
              />
              {/* Štítek na fotce */}
              <div className="absolute bottom-5 left-5 inline-flex items-center gap-2 rounded-full bg-card/95 px-3 py-1.5 text-[10px] font-bold uppercase tracking-[0.22em] text-warm-dark shadow-sm backdrop-blur">
                <span className="h-1.5 w-1.5 rounded-full bg-warm-dark" />
                Příběh {index + 1} z {total}
              </div>
            </div>

            <div className="flex flex-col justify-center p-8 sm:p-10 lg:p-12">
              {c.t(`kariera.pribehy.${index}.role`, current.role, { as: "div", className: "text-[11px] font-bold uppercase tracking-[0.22em] text-warm-dark" })}
              <blockquote className="font-display mt-4 text-2xl leading-snug text-foreground sm:text-[1.75rem]">
                „{c.t(`kariera.pribehy.${index}.hook`, current.hook)}“
              </blockquote>
              <div className="mt-5 space-y-3 text-[15px] leading-[1.75] text-muted-foreground">
                {current.body.map((p, idx) => (
                  <div key={idx}>
                    {c.t(`kariera.pribehy.${index}.odstavec.${idx}`, p, { as: "p" })}
                  </div>
                ))}
              </div>
              <div className="mt-7 border-t border-border/60 pt-4 text-sm">
                {c.t(`kariera.pribehy.${index}.jmeno`, current.author, { as: "span", className: "font-bold text-foreground" })}
                <span className="text-muted-foreground">
                  {" — "}
                  {current.authorRole}
                </span>
              </div>
            </div>
          </article>

          {/* Controls */}
          <div className="mt-8 flex items-center justify-center gap-4">
            <button
              type="button"
              onClick={goPrev}
              aria-label="Předchozí příběh"
              className="flex h-11 w-11 items-center justify-center rounded-full border border-border bg-background text-foreground transition-all hover:border-brand hover:bg-brand hover:text-brand-foreground"
            >
              <ChevronLeft className="h-5 w-5" strokeWidth={2} />
            </button>

            <div className="flex items-center gap-2">
              {STORIES.map((s, i) => (
                <button
                  key={s.author}
                  type="button"
                  onClick={() => setIndex(i)}
                  aria-label={`Příběh ${i + 1}: ${s.author}`}
                  className={cn(
                    "h-2 rounded-full transition-all",
                    i === index
                      ? "w-8 bg-brand"
                      : "w-2 bg-border hover:bg-brand/40"
                  )}
                />
              ))}
            </div>

            <button
              type="button"
              onClick={goNext}
              aria-label="Další příběh"
              className="flex h-11 w-11 items-center justify-center rounded-full border border-border bg-background text-foreground transition-all hover:border-brand hover:bg-brand hover:text-brand-foreground"
            >
              <ChevronRight className="h-5 w-5" strokeWidth={2} />
            </button>
          </div>
        </div>
      </div>
    </section>
  );
}
