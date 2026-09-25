import Link from "next/link";
import { ArrowRight, Phone } from "lucide-react";
import type { Branch } from "@/convex/lib/types";

interface AdmissionCtaSectionProps {
  branch: Branch;
}

export function AdmissionCtaSection({ branch }: AdmissionCtaSectionProps) {
  return (
    <section className="mx-auto max-w-[1320px] px-6 py-16 lg:px-10 lg:py-24">
      <div className="relative overflow-hidden rounded-[2.5rem] bg-gradient-to-br from-brand to-brand-dark p-10 text-brand-foreground shadow-2xl shadow-brand/20 sm:p-14 lg:p-16">
        <div
          aria-hidden="true"
          className="pointer-events-none absolute -right-20 -top-20 h-72 w-72 rounded-full bg-warm/25 blur-3xl animate-pulse-blob"
        />
        <div
          aria-hidden="true"
          className="pointer-events-none absolute -bottom-24 -left-12 h-72 w-72 rounded-full bg-brand-foreground/10 blur-3xl animate-float-slow"
        />

        <div className="relative grid items-center gap-10 lg:grid-cols-[1.6fr_1fr] lg:gap-16">
          <div>
            <div className="text-[11px] font-bold uppercase tracking-[0.22em] text-warm">
              Začněte dnes
            </div>
            <h2 className="font-display mt-4 text-3xl leading-[1.1] sm:text-4xl lg:text-[2.75rem]">
              Hledáte pro své blízké
              <br />
              <span className="text-warm">klid a důstojnou péči?</span>
            </h2>
            <p className="mt-6 max-w-xl text-base leading-[1.8] text-brand-foreground/85">
              Provedeme vás procesem přijetí osobně. Zavolejte nám nebo
              vyplňte žádost — ozveme se vám do 24 hodin.
            </p>
          </div>

          <div className="flex flex-col gap-3">
            <Link
              href="/zadost-o-prijeti"
              className="group inline-flex items-center justify-center gap-3 rounded-full bg-brand-foreground px-7 py-4 text-sm font-bold uppercase tracking-wider text-brand shadow-lg transition-all hover:scale-[1.02] hover:bg-warm hover:text-warm-foreground"
            >
              Žádost o přijetí
              <ArrowRight className="h-4 w-4 transition-transform group-hover:translate-x-0.5" />
            </Link>
            <a
              href={`tel:${branch.phone.replace(/\s/g, "")}`}
              className="inline-flex items-center justify-center gap-3 rounded-full border-2 border-brand-foreground/40 px-7 py-3.5 text-sm font-semibold text-brand-foreground transition-all hover:border-warm hover:text-warm"
            >
              <Phone className="h-4 w-4" strokeWidth={2.25} />
              {branch.phone}
            </a>
          </div>
        </div>
      </div>
    </section>
  );
}
