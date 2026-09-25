import Image from "next/image";
import Link from "next/link";
import { ArrowRight, Briefcase, Heart, Mail } from "lucide-react";
import { makeCopy, type CopyProps } from "@/features/inline-edit/copy";
import { RegionSlot } from "@/features/inline-edit/components/content-slot";


const HERO_IMAGE = "/images/team/team-1.jpg";

export function CareerHero({ copy, editBranchId }: CopyProps) {
  const c = makeCopy({ copy, editBranchId });
  return (
    <section className="relative overflow-hidden">
      <div
        aria-hidden="true"
        className="pointer-events-none absolute inset-x-0 top-0 -z-10 h-[80%] bg-gradient-to-br from-brand-light/40 via-background to-warm/5"
      />
      <div
        aria-hidden="true"
        className="pointer-events-none absolute -right-32 top-10 -z-10 h-[420px] w-[420px] rounded-full bg-warm/15 blur-3xl animate-pulse-blob"
      />
      <div
        aria-hidden="true"
        className="pointer-events-none absolute -left-32 bottom-0 -z-10 h-72 w-72 rounded-full bg-brand-light/40 blur-3xl animate-float-slow"
      />

      <div className="mx-auto grid max-w-[1320px] gap-12 px-6 py-14 lg:grid-cols-12 lg:gap-14 lg:px-10 lg:py-20">
        <div className="flex animate-fade-up flex-col justify-center lg:col-span-7">
          <div className="flex items-center gap-3 text-xs font-bold uppercase tracking-[0.22em] text-brand">
            <span className="h-px w-10 bg-warm" />
            {c.t("kariera.hero.eyebrow", "Kariéra v AHC")}
          </div>

          <h1 className="font-display mt-7 text-[clamp(2.5rem,5vw,4.5rem)] leading-[1.02] text-foreground">
            {c.t("kariera.hero.title", "Práce, která má smysl.")}
            <br />
            {c.t("kariera.hero.title2", "A prostředí, kde na to nejste sami.", {
              as: "span",
              className: "text-brand",
            })}
          </h1>

          {c.t(
            "kariera.hero.text",
            "V našich nemocnicích, senior centrech i domácí péči každý den pomáháme tisícům klientů po celé České republice. A víme, že kvalitní péče vzniká jen tam, kde mají podporu i samotní zaměstnanci.",
            { as: "p", className: "mt-7 max-w-xl text-lg leading-[1.7] text-muted-foreground" }
          )}

          <div className="mt-10 flex flex-wrap gap-3">
            <Link
              href="#volne-pozice"
              className="group inline-flex items-center gap-3 rounded-full bg-brand px-7 py-4 text-sm font-semibold text-brand-foreground shadow-lg shadow-brand/15 transition-all hover:bg-brand-dark hover:shadow-xl"
            >
              <Briefcase className="h-4 w-4" strokeWidth={2} />
              {c.t("kariera.hero.cta1", "Zobrazit volné pozice")}
              <ArrowRight className="h-4 w-4 transition-transform group-hover:translate-x-0.5" />
            </Link>
            <Link
              href="#tymy"
              className="inline-flex items-center gap-2 rounded-full border border-border bg-background px-6 py-4 text-sm font-semibold text-foreground transition-colors hover:border-brand hover:text-brand"
            >
              <Heart className="h-4 w-4 text-brand" strokeWidth={2.25} />
              {c.t("kariera.hero.cta2", "Poznat naše týmy")}
            </Link>
            <a
              href="#kontakt"
              className="inline-flex items-center gap-2 border-b-2 border-warm pb-1 text-sm font-semibold text-foreground hover:text-brand"
            >
              <Mail className="h-4 w-4 text-brand" strokeWidth={2.25} />
              {c.t("kariera.hero.cta3", "Ozvat se nezávazně")}
            </a>
          </div>
        </div>

        <div
          className="relative animate-fade-up lg:col-span-5"
          style={{ animationDelay: "120ms" }}
        >
          <div className="relative aspect-[4/5] overflow-hidden rounded-[2rem] bg-muted shadow-2xl shadow-brand/15">
            <Image
              src={c.s("kariera.hero.foto", HERO_IMAGE)}
              alt="Tým AHC"
              fill
              priority
              quality={92}
              sizes="(min-width: 1024px) 40vw, 100vw"
              className="object-cover"
            />
            <div className="pointer-events-none absolute inset-0 bg-gradient-to-tr from-brand-dark/25 via-transparent" />
            {c.img("kariera.hero.foto")}
          </div>
        </div>
      </div>
    </section>
  );
}
