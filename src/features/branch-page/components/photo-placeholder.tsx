import { ImageIcon } from "lucide-react";

/**
 * Placeholder na fotku — dokud klient nedodá fotografie. Rovnou popisuje,
 * jaká fotka na dané místo patří (dle obsahové specifikace), ať se snadno doplní.
 */
export function PhotoPlaceholder({
  hint,
  className = "",
  rounded = "rounded-3xl",
}: {
  hint: string;
  className?: string;
  rounded?: string;
}) {
  return (
    <div
      className={`flex flex-col items-center justify-center gap-2 border border-dashed border-brand/30 bg-brand-light/40 p-6 text-center ${rounded} ${className}`}
    >
      <ImageIcon className="h-7 w-7 text-brand/50" strokeWidth={1.5} />
      <span className="max-w-[22rem] text-xs font-medium leading-snug text-brand/70">
        {hint}
      </span>
    </div>
  );
}
