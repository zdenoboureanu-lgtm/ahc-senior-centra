"use client";

import Image from "next/image";
import { useEffect, useRef, useState } from "react";
import { ChevronLeft, ChevronRight } from "lucide-react";
import { cn } from "@/lib/utils";

const P = "/images/sedlec";

interface GalleryItem { src: string; label: string }

const FACILITY_ITEMS: GalleryItem[] = [
  { src: `${P}/pokoj-1.jpg`, label: "Dvoulůžkový pokoj" },
  { src: `${P}/koupelna.jpg`, label: "Koupelna" },
  { src: `${P}/koupelna-2.jpg`, label: "Rehabilitační zázemí" },
  { src: `${P}/pokoj-2.jpg`, label: "Vybavený pokoj" },
  { src: `${P}/exterier-1.jpg`, label: "Zahrada a terasa" },
  { src: `${P}/exterier-2.jpg`, label: "Areál centra" },
  { src: `${P}/pokoj-3.jpg`, label: "Odpočinkový prostor" },
  { src: `${P}/exterier-3.jpg`, label: "Vstup do centra" },
];

export const ACTIVITY_ITEMS: GalleryItem[] = [
  { src: `${P}/g-30.jpg`, label: "Aktivizační program" },
  { src: `${P}/g-13.jpg`, label: "Tvoření a výtvarné činnosti" },
  { src: `${P}/g-16.jpg`, label: "Kondiční cvičení" },
  { src: `${P}/g-07.jpg`, label: "Canisterapie" },
  { src: `${P}/g-21.jpg`, label: "Každodenní život" },
  { src: `${P}/g-01.jpg`, label: "Kulturní program" },
  { src: `${P}/g-50.jpg`, label: "Společenské aktivity" },
  { src: `${P}/g-04.jpg`, label: "Slavnostní chvíle" },
];

const wrap = "mx-auto max-w-[1320px] px-6 lg:px-10";

interface SedlecGalleryProps {
  items?: GalleryItem[];
  subtitle?: string;
  title?: string;
  description?: string;
}

export function SedlecGallery({
  items = FACILITY_ITEMS,
  subtitle = "Zázemí",
  title = "Jak to u nás vypadá",
  description = "Pohodlné pokoje, společenské prostory a zahrada — vše promyšlené pro klidný a důstojný život.",
}: SedlecGalleryProps) {
  const scrollerRef = useRef<HTMLUListElement>(null);
  const [scrollState, setScrollState] = useState({ left: 0, max: 1 });

  const measure = () => {
    const el = scrollerRef.current;
    if (!el) return;
    setScrollState({ left: el.scrollLeft, max: Math.max(0, el.scrollWidth - el.clientWidth) });
  };

  useEffect(() => {
    measure();
    const el = scrollerRef.current;
    if (!el) return;
    const ro = new ResizeObserver(() => measure());
    ro.observe(el);
    window.addEventListener("resize", measure);
    return () => { ro.disconnect(); window.removeEventListener("resize", measure); };
  }, []);

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
      <div aria-hidden="true" className="pointer-events-none absolute -left-16 bottom-24 h-72 w-72 rounded-full bg-brand-light/40 blur-3xl" />
      <div className={`relative ${wrap} py-16 lg:py-20`}>
        <div className="flex flex-col gap-6 sm:flex-row sm:items-end sm:justify-between">
          <div className="max-w-2xl">
            <div className="text-xs font-bold uppercase tracking-[0.22em] text-warm-dark">{subtitle}</div>
            <h2 className="font-display mt-4 text-4xl text-foreground lg:text-5xl">{title}</h2>
            <p className="mt-4 text-base text-muted-foreground sm:text-lg">{description}</p>
          </div>
          <div className="flex gap-2">
            <button
              type="button"
              onClick={() => scrollBy(-1)}
              disabled={!canScrollLeft}
              aria-label="Předchozí"
              className={cn(
                "flex h-12 w-12 items-center justify-center rounded-full border border-border bg-background text-foreground transition-all",
                canScrollLeft ? "hover:border-brand hover:bg-brand hover:text-brand-foreground" : "cursor-not-allowed opacity-40"
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
                canScrollRight ? "hover:border-brand hover:bg-brand hover:text-brand-foreground" : "cursor-not-allowed opacity-40"
              )}
            >
              <ChevronRight className="h-5 w-5" strokeWidth={2} />
            </button>
          </div>
        </div>

        <div className="relative -mx-6 mt-12 lg:-mx-10">
          {canScrollRight && (
            <div aria-hidden="true" className="pointer-events-none absolute right-0 top-0 z-10 h-full w-24 bg-gradient-to-l from-secondary/80 to-transparent" />
          )}
          {canScrollLeft && (
            <div aria-hidden="true" className="pointer-events-none absolute left-0 top-0 z-10 h-full w-12 bg-gradient-to-r from-secondary/80 to-transparent" />
          )}
          <ul
            ref={scrollerRef}
            onScroll={measure}
            className="scrollbar-hide flex snap-x snap-mandatory gap-5 overflow-x-auto px-6 pb-4 lg:px-10"
            aria-roledescription="carousel"
          >
            {items.map((item) => (
              <li
                key={item.src}
                className="shrink-0 grow-0 basis-[78%] snap-start sm:basis-[48%] lg:basis-[300px]"
                aria-roledescription="slide"
              >
                <figure className="group relative aspect-[4/5] overflow-hidden rounded-2xl bg-muted shadow-sm transition-shadow hover:shadow-lg">
                  <Image
                    src={item.src}
                    alt={item.label}
                    fill
                    sizes="(min-width:1024px) 22vw, 78vw"
                    className="object-cover transition-transform duration-700 group-hover:scale-105"
                  />
                  <div className="pointer-events-none absolute inset-0 bg-gradient-to-t from-brand-dark/85 via-brand-dark/15 to-transparent" />
                  <figcaption className="absolute inset-x-0 bottom-0 p-5">
                    <div className="font-display text-xl text-brand-foreground">{item.label}</div>
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
