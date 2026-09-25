"use client";

import Image from "next/image";
import { useEffect, useRef, useState } from "react";
import { ChevronLeft, ChevronRight } from "lucide-react";
import { cn } from "@/lib/utils";
import type { BranchFacility } from "@/convex/lib/types";
import { EditableText } from "@/features/inline-edit/components/editable-text";
import { EditableImage } from "@/features/inline-edit/components/editable-image";

interface FacilitiesSectionProps {
  facilities: BranchFacility[];
}

export function FacilitiesSection({ facilities }: FacilitiesSectionProps) {
  const scrollerRef = useRef<HTMLUListElement>(null);
  const [scrollState, setScrollState] = useState({ left: 0, max: 1 });

  const measure = () => {
    const el = scrollerRef.current;
    if (!el) return;
    setScrollState({
      left: el.scrollLeft,
      max: Math.max(0, el.scrollWidth - el.clientWidth),
    });
  };

  useEffect(() => {
    measure();
    const el = scrollerRef.current;
    if (!el) return;
    const ro = new ResizeObserver(() => measure());
    ro.observe(el);
    window.addEventListener("resize", measure);
    return () => {
      ro.disconnect();
      window.removeEventListener("resize", measure);
    };
  }, []);

  if (facilities.length === 0) return null;

  const scrollBy = (dir: 1 | -1) => {
    const el = scrollerRef.current;
    if (!el) return;
    const card = el.querySelector("li");
    const step = card ? (card as HTMLElement).offsetWidth + 20 : 320;
    el.scrollBy({ left: step * dir, behavior: "smooth" });
  };

  const canScrollLeft = scrollState.left > 8;
  const canScrollRight = scrollState.left < scrollState.max - 8;

  return (
    <section className="relative bg-secondary/40">
      <div
        aria-hidden="true"
        className="pointer-events-none absolute -left-16 bottom-24 h-72 w-72 rounded-full bg-brand-light/40 blur-3xl animate-pulse-blob"
      />

      <div className="relative mx-auto max-w-[1320px] px-6 py-24 lg:px-10 lg:py-32">
        <div className="flex flex-col gap-6 sm:flex-row sm:items-end sm:justify-between">
          <div className="max-w-2xl">
            <div className="text-xs font-bold uppercase tracking-[0.22em] text-warm-dark">
              Zázemí
            </div>
            <h2 className="font-display mt-4 text-4xl text-foreground lg:text-5xl">
              Jak to u nás vypadá
            </h2>
            <p className="mt-4 text-base text-muted-foreground sm:text-lg">
              Pohodlné pokoje, společenské prostory a zahrada — vše promyšlené
              pro klidný a důstojný život.
            </p>
          </div>

          {/* Carousel nav buttons */}
          <div className="flex gap-2">
            <button
              type="button"
              onClick={() => scrollBy(-1)}
              disabled={!canScrollLeft}
              aria-label="Předchozí"
              className={cn(
                "flex h-12 w-12 items-center justify-center rounded-full border border-border bg-background text-foreground transition-all",
                canScrollLeft
                  ? "hover:border-brand hover:bg-brand hover:text-brand-foreground"
                  : "cursor-not-allowed opacity-40"
              )}
            >
              <ChevronLeft className="h-5 w-5" strokeWidth={2} />
            </button>
            <button
              type="button"
              onClick={() => scrollBy(1)}
              disabled={!canScrollRight}
              aria-label="Další"
              className={cn(
                "flex h-12 w-12 items-center justify-center rounded-full border border-border bg-background text-foreground transition-all",
                canScrollRight
                  ? "hover:border-brand hover:bg-brand hover:text-brand-foreground"
                  : "cursor-not-allowed opacity-40"
              )}
            >
              <ChevronRight className="h-5 w-5" strokeWidth={2} />
            </button>
          </div>
        </div>

        <div className="relative -mx-6 mt-12 lg:-mx-10">
          {/* Fade gradient na pravém okraji — naznačuje, že je tam další obsah */}
          {canScrollRight ? (
            <div
              aria-hidden="true"
              className="pointer-events-none absolute right-0 top-0 z-10 h-full w-24 bg-gradient-to-l from-secondary/80 to-transparent"
            />
          ) : null}
          {canScrollLeft ? (
            <div
              aria-hidden="true"
              className="pointer-events-none absolute left-0 top-0 z-10 h-full w-12 bg-gradient-to-r from-secondary/80 to-transparent"
            />
          ) : null}

          <ul
            ref={scrollerRef}
            onScroll={measure}
            className="scrollbar-hide flex snap-x snap-mandatory gap-5 overflow-x-auto px-6 pb-4 lg:px-10"
            aria-roledescription="carousel"
          >
            {facilities.map((f) => (
              <li
                key={f._id}
                className="shrink-0 grow-0 basis-[78%] snap-start sm:basis-[48%] lg:basis-[300px]"
                aria-roledescription="slide"
              >
                <figure className="group relative aspect-[4/5] overflow-hidden rounded-2xl bg-muted shadow-sm transition-shadow hover:shadow-lg">
                  <Image
                    src={f.image_url}
                    alt={f.title}
                    fill
                    sizes="(min-width: 1024px) 22vw, 78vw"
                    className="object-cover transition-transform duration-700 group-hover:scale-105"
                  />
                  <div className="pointer-events-none absolute inset-0 bg-gradient-to-t from-brand-dark/85 via-brand-dark/15 to-transparent" />
                  <EditableImage
                    target={{
                      kind: "field",
                      table: "branch_facilities",
                      id: f._id,
                      field: "image_url",
                    }}
                  />
                  <figcaption className="absolute inset-x-0 bottom-0 z-30 p-5">
                    <EditableText
                      as="div"
                      target={{
                        kind: "field",
                        table: "branch_facilities",
                        id: f._id,
                        field: "title",
                      }}
                      value={f.title}
                      className="font-display text-xl text-brand-foreground"
                    />
                  </figcaption>
                </figure>
              </li>
            ))}
          </ul>
        </div>
      </div>
    </section>
  );
}
