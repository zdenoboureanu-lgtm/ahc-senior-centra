import Image from "next/image";
import Link from "next/link";
import { ArrowRight } from "lucide-react";

const IMAGE = "/images/biographical.png";

export function BiographicalConceptSection() {
  return (
    <section className="relative overflow-hidden">
      {/* Decorative blob */}
      <div
        aria-hidden="true"
        className="pointer-events-none absolute -left-32 bottom-0 h-96 w-96 rounded-full bg-brand-light/30 blur-3xl animate-float-slow"
      />
      <div className="relative mx-auto max-w-[1320px] px-6 py-24 lg:px-10 lg:py-32">
        <div className="grid gap-12 lg:grid-cols-12 lg:gap-16">
          <div className="relative lg:col-span-7">
            {/* Decorative warm circle */}
            <div
              aria-hidden="true"
              className="pointer-events-none absolute -right-8 -top-8 h-40 w-40 rounded-full bg-warm/15 animate-float-medium"
            />
            <div className="relative aspect-[5/4] overflow-hidden rounded-[2rem] bg-muted shadow-md">
              <Image
                src={IMAGE}
                alt="Personalizovaná péče"
                fill
                quality={100}
                sizes="(min-width: 1280px) 800px, (min-width: 1024px) 65vw, 100vw"
                className="object-cover"
                style={{ objectPosition: "center 30%" }}
              />
              <div className="pointer-events-none absolute inset-0 bg-gradient-to-tr from-brand-dark/20 via-transparent" />
              <div className="absolute inset-x-8 bottom-8 hidden rounded-2xl bg-card/95 p-6 shadow-xl backdrop-blur-sm sm:block">
                <p className="font-display text-xl text-foreground lg:text-2xl">
                  Poznáváme životní příběh každého klienta.
                </p>
                <p className="mt-2 text-sm text-muted-foreground">
                  Péče podle biografické koncepce
                </p>
              </div>
            </div>
          </div>

          <div className="flex flex-col justify-center lg:col-span-5">
            <div className="text-xs font-bold uppercase tracking-[0.22em] text-warm-dark">
              Náš přístup
            </div>
            <h2 className="font-display mt-4 text-4xl text-foreground lg:text-[3rem]">
              Biografický
              <br />
              <span className="text-brand">koncept péče</span>
            </h2>
            <p className="mt-6 text-base leading-[1.8] text-muted-foreground">
              Každému klientovi připravíme plán na míru. Vycházíme z jeho
              životního příběhu, respektujeme jeho potřeby, možnosti a přání.
            </p>
            <p className="mt-4 text-base leading-[1.8] text-muted-foreground">
              Není to jen péče — je to{" "}
              <strong className="font-bold text-foreground">pokračování</strong>{" "}
              jeho života v důstojném prostředí.
            </p>

            <Link
              href="/sluzby"
              className="group mt-10 inline-flex w-fit items-center gap-2 rounded-full bg-brand px-6 py-3 text-sm font-semibold text-brand-foreground shadow-md shadow-brand/15 transition-all hover:bg-brand-dark hover:shadow-lg"
            >
              Více o našich službách
              <ArrowRight className="h-4 w-4 transition-transform group-hover:translate-x-0.5" />
            </Link>
          </div>
        </div>
      </div>
    </section>
  );
}
