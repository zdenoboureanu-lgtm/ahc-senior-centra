import Image from "next/image";
import { makeCopy, type CopyProps } from "@/features/inline-edit/copy";
import { RegionSlot } from "@/features/inline-edit/components/content-slot";


const PHOTOS = [
  { src: "/images/team/team-1.jpg", alt: "Vánoční tým AHC" },
  { src: "/images/team/team-2.jpg", alt: "Selfie z vánoční oslavy" },
  { src: "/images/team/team-3.jpg", alt: "Společné večeře s klienty" },
];

export function CareerGallerySection({ copy, editBranchId }: CopyProps) {
  const c = makeCopy({ copy, editBranchId });
  return (
    <RegionSlot {...c.region("sekce.kariera.galerie")}>
    <section className="mx-auto max-w-[1320px] px-6 py-20 lg:px-10 lg:py-28">
      <div className="mx-auto max-w-3xl text-center">
        {c.t("kariera.galerie.eyebrow", "Fotogalerie", { as: "div", className: "text-[11px] font-bold uppercase tracking-[0.22em] text-warm-dark" })}
        {c.t("kariera.galerie.nadpis", "Život v AHC", { as: "h2", className: "font-display mt-3 text-4xl text-foreground sm:text-5xl" })}
        {c.t("kariera.galerie.text", "Pár momentek z našich pobočkových oslav, akcí a běžných dnů.", { as: "p", className: "mt-4 text-base text-muted-foreground" })}
      </div>

      <div className="mt-14 grid gap-5 sm:grid-cols-2 lg:grid-cols-3">
        {PHOTOS.map((p, i) => (
          <figure
            key={p.src}
            className="group relative overflow-hidden rounded-3xl bg-muted shadow-sm transition-shadow hover:shadow-lg"
            style={{ aspectRatio: i === 0 ? "4 / 5" : "3 / 4" }}
          >
            <Image
              src={c.s(`kariera.galerie.${i}.foto`, p.src)}
              alt={p.alt}
              fill
              quality={88}
              sizes="(min-width: 1024px) 33vw, (min-width: 640px) 50vw, 100vw"
              className="object-cover transition-transform duration-700 group-hover:scale-105"
            />
            <div className="pointer-events-none absolute inset-0 bg-gradient-to-t from-brand-dark/40 via-transparent" />
            {c.img(`kariera.galerie.${i}.foto`)}
          </figure>
        ))}
      </div>
    </section>
    </RegionSlot>
  );
}
