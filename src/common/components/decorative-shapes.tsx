import { cn } from "@/lib/utils";

/**
 * Subtilní decorativní tvary pro pozadí sekcí — kruhy, polokruhy, organic blobs.
 * Vykreslené v `currentColor` s opacitou.
 */

interface ShapeProps {
  className?: string;
}

/** Velký jemný blob (warm color) — perfektní jako spodní vrstva sekce */
export function BlobShape({ className }: ShapeProps) {
  return (
    <div
      aria-hidden="true"
      className={cn(
        "pointer-events-none absolute rounded-full blur-3xl",
        className
      )}
    />
  );
}

/** Kruhový obrys (outline) — accent na okrajích karet/sekcí */
export function CircleOutline({ className }: ShapeProps) {
  return (
    <div
      aria-hidden="true"
      className={cn(
        "pointer-events-none absolute rounded-full border-[3px]",
        className
      )}
    />
  );
}

/** Tečkovaná čára / tečky (vertikální nebo horizontální) — ozdobné spojení */
export function DotLine({ className }: ShapeProps) {
  return (
    <svg
      aria-hidden="true"
      className={cn("pointer-events-none absolute", className)}
      width="100"
      height="8"
      viewBox="0 0 100 8"
      preserveAspectRatio="none"
    >
      <g fill="currentColor">
        {Array.from({ length: 16 }).map((_, i) => (
          <circle key={i} cx={3 + i * 6} cy={4} r={1.5} />
        ))}
      </g>
    </svg>
  );
}

/** Plus + decorativní (warm cross) */
export function CrossDot({ className }: ShapeProps) {
  return (
    <svg
      aria-hidden="true"
      className={cn("pointer-events-none absolute", className)}
      width="24"
      height="24"
      viewBox="0 0 24 24"
      fill="none"
    >
      <path
        d="M12 4v16M4 12h16"
        stroke="currentColor"
        strokeWidth="2.5"
        strokeLinecap="round"
      />
    </svg>
  );
}
