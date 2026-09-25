"use client";

import { useState } from "react";
import { cn } from "@/lib/utils";

interface CareerCityFilterProps {
  cities: string[];
  selected: string;
}

export function CareerCityFilter({ cities, selected }: CareerCityFilterProps) {
  const [active, setActive] = useState(selected);
  const all = [...cities, "Všechna města"];

  return (
    <div className="flex flex-wrap justify-center gap-2">
      {all.map((c) => (
        <button
          key={c}
          type="button"
          onClick={() => setActive(c)}
          className={cn(
            "rounded-full px-5 py-2 text-sm font-semibold transition-colors",
            active === c
              ? "bg-brand text-brand-foreground"
              : "bg-brand-light text-brand hover:bg-brand hover:text-brand-foreground"
          )}
        >
          {c}
        </button>
      ))}
    </div>
  );
}
