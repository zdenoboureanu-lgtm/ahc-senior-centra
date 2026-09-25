import Image from "next/image";

// Loga partnerů — klient chce zobrazovat jen tyto čtyři (stejně jako Sedlec-Prčice).
// Soubory: public/images/loga.
const PARTNERS = [
  { name: "Sestřička.cz", file: "sestricka.png", href: "https://www.sestricka.cz/" },
  { name: "Most k domovu", file: "mostkdomovu.png", href: "https://www.mostkdomovu.cz/" },
  { name: "SestřičkaSOS", file: "sestrickasos.png", href: "https://www.sestrickasos.cz/" },
  { name: "e-Sestřička", file: "e-sestricka.png", href: "https://www.e-sestricka.cz/" },
];

export function PartnersSection() {
  return (
    <section className="mx-auto max-w-[1320px] px-6 py-20 lg:px-10">
      <div className="text-center">
        <div className="text-[11px] font-bold uppercase tracking-[0.22em] text-muted-foreground">
          Spolupracujeme s
        </div>
      </div>

      <ul className="mt-8 flex flex-wrap items-center justify-center gap-4">
        {PARTNERS.map((p) => (
          <li key={p.file} title={p.name}>
            <a
              href={p.href}
              target="_blank"
              rel="noopener noreferrer"
              className="flex h-20 w-40 items-center justify-center rounded-2xl border border-border bg-card px-5 transition-all hover:border-brand/30 hover:shadow-md"
            >
              <div className="relative h-10 w-full">
                <Image
                  src={`/images/loga/${p.file}`}
                  alt={p.name}
                  fill
                  sizes="160px"
                  className="object-contain opacity-70 transition-opacity hover:opacity-100"
                />
              </div>
            </a>
          </li>
        ))}
      </ul>
    </section>
  );
}
