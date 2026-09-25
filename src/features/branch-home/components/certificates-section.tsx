const CERTIFICATES = [
  { year: "2024", label: "Nejlepší nemocnice Ústeckého kraje" },
  { year: "2023", label: "Nejlepší nemocnice Ústeckého kraje" },
  { year: "2022", label: "Spokojenost pacientů" },
  { year: "2021", label: "Bezpečná nemocnice" },
];

interface CertBadgeProps {
  year: string;
}

/** Vlastní medaile — kruh s rokem uprostřed + stuhy dole. */
function CertBadge({ year }: CertBadgeProps) {
  return (
    <svg
      viewBox="0 0 64 80"
      className="h-20 w-16"
      role="img"
      aria-label={`Ocenění ${year}`}
    >
      {/* Stuhy */}
      <path
        d="M22 46 L22 75 L27 70 L32 75 L32 46 Z"
        fill="hsl(var(--warm) / 0.85)"
      />
      <path
        d="M32 46 L32 75 L37 70 L42 75 L42 46 Z"
        fill="hsl(var(--warm-dark) / 0.95)"
      />
      {/* Kruh medaile */}
      <circle cx="32" cy="26" r="22" fill="hsl(var(--warm))" />
      <circle
        cx="32"
        cy="26"
        r="22"
        fill="none"
        stroke="hsl(var(--warm-dark))"
        strokeWidth="1.5"
      />
      <circle
        cx="32"
        cy="26"
        r="17"
        fill="none"
        stroke="hsl(var(--warm-dark) / 0.5)"
        strokeWidth="0.8"
        strokeDasharray="2 2"
      />
      {/* Rok */}
      <text
        x="32"
        y="31"
        textAnchor="middle"
        fontSize="11"
        fontWeight="800"
        fill="hsl(var(--brand-foreground))"
        fontFamily="var(--font-sans)"
        letterSpacing="0.5"
      >
        {year}
      </text>
    </svg>
  );
}

export function CertificatesSection() {
  return (
    <section className="mx-auto max-w-[1320px] px-6 py-20 lg:px-10 lg:py-24">
      <div className="grid gap-12 lg:grid-cols-[1fr_1.3fr] lg:items-center lg:gap-16">
        <div>
          <div className="text-[11px] font-bold uppercase tracking-[0.22em] text-warm-dark">
            Ocenění a kvalita
          </div>
          <h2 className="font-display mt-3 text-4xl text-foreground sm:text-5xl">
            Nejlepší nemocnice
            <br />
            <span className="text-brand">Ústeckého kraje</span>
          </h2>
          <p className="mt-5 max-w-md text-base leading-relaxed text-muted-foreground">
            Úroveň kvality našich služeb i přístup k pacientům neustále
            zvyšujeme. Prohlédněte si naše certifikáty a ocenění.
          </p>
        </div>

        <ul className="grid grid-cols-2 gap-5 sm:grid-cols-4">
          {CERTIFICATES.map((c) => (
            <li
              key={`${c.year}-${c.label}`}
              className="group flex flex-col items-center rounded-2xl border border-border bg-card p-5 text-center shadow-sm transition-all hover:-translate-y-1 hover:shadow-md"
            >
              <CertBadge year={c.year} />
              <span className="mt-3 text-xs font-semibold leading-tight text-foreground">
                {c.label}
              </span>
            </li>
          ))}
        </ul>
      </div>
    </section>
  );
}
