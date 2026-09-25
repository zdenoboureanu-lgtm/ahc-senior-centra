"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { cn } from "@/lib/utils";

const SECTIONS = [
  { id: "nasledna-pece", label: "Následná péče" },
  { id: "domov-pro-seniory", label: "Domov pro seniory" },
];

export function ServicesStickyNav() {
  const [active, setActive] = useState("nasledna-pece");

  useEffect(() => {
    const observers: IntersectionObserver[] = [];

    SECTIONS.forEach(({ id }) => {
      const el = document.getElementById(id);
      if (!el) return;
      const obs = new IntersectionObserver(
        ([entry]) => {
          if (entry.isIntersecting) setActive(id);
        },
        { rootMargin: "-30% 0px -60% 0px", threshold: 0 }
      );
      obs.observe(el);
      observers.push(obs);
    });

    return () => observers.forEach((o) => o.disconnect());
  }, []);

  return (
    <div className="sticky top-[76px] z-30 border-b border-border bg-background/95 shadow-sm backdrop-blur-xl">
      <div className="mx-auto flex max-w-[1320px] items-center gap-2 overflow-x-auto px-6 py-2.5 scrollbar-hide lg:px-10">
        {SECTIONS.map(({ id, label }) => (
          <Link
            key={id}
            href={`#${id}`}
            className={cn(
              "inline-flex shrink-0 items-center whitespace-nowrap rounded-full px-4 py-1.5 text-sm font-semibold transition-colors",
              active === id
                ? "bg-brand text-brand-foreground"
                : "border border-border bg-card text-foreground hover:border-brand hover:text-brand"
            )}
          >
            {label}
          </Link>
        ))}
      </div>
    </div>
  );
}
