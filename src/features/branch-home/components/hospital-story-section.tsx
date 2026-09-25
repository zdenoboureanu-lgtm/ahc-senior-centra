import Image from "next/image";
import Link from "next/link";
import { ArrowRight } from "lucide-react";
import type { Branch } from "@/convex/lib/types";

const FALLBACK_IMAGE =
  "https://images.unsplash.com/photo-1551076805-e1869033e561?w=1400&q=80";

interface Props {
  branch: Branch;
}

export function HospitalStorySection({ branch }: Props) {
  const years = branch.opening_year
    ? new Date().getFullYear() - branch.opening_year
    : null;
  const image = branch.cover_image ?? FALLBACK_IMAGE;

  return (
    <section className="mx-auto max-w-[1320px] px-6 py-16 lg:px-10 lg:py-24">
      <div className="relative overflow-hidden rounded-[2.5rem] bg-gradient-to-br from-brand-dark via-brand to-brand-dark text-brand-foreground shadow-2xl shadow-brand/25">
        <div
          aria-hidden="true"
          className="pointer-events-none absolute -right-20 -top-20 h-72 w-72 rounded-full bg-warm/25 blur-3xl animate-pulse-blob"
        />
        <div className="grid items-stretch gap-0 lg:grid-cols-[1.2fr_1fr]">
          <div className="relative z-10 flex flex-col justify-center p-10 sm:p-14 lg:p-16">
            <div className="text-[11px] font-bold uppercase tracking-[0.22em] text-warm">
              {years ? "Zařízení s historií" : "O našem zařízení"}
            </div>
            <h2 className="font-display mt-5 text-4xl leading-[1.05] sm:text-5xl lg:text-[3.25rem]">
              {years ? (
                <>
                  Staráme se o vás
                  <br />
                  <span className="text-warm">více než {years} let.</span>
                </>
              ) : (
                <>
                  Péče s respektem
                  <br />
                  <span className="text-warm">a lidským přístupem.</span>
                </>
              )}
            </h2>
            <p className="mt-6 max-w-lg text-base leading-[1.7] text-brand-foreground/85 sm:text-lg">
              {branch.name}
              {years
                ? ` slouží pacientům z celého regionu už přes ${years} let. Na dlouholetou tradici navazujeme `
                : " navazuje na ověřené postupy "}
              moderní medicínou, kvalitním vybavením a především lidským
              přístupem.
            </p>
            <Link
              href="/o-nas"
              className="group mt-10 inline-flex w-fit items-center gap-3 rounded-full bg-brand-foreground px-7 py-4 text-sm font-bold uppercase tracking-wider text-brand transition-all hover:scale-[1.02] hover:bg-warm hover:text-warm-foreground"
            >
              Více o zařízení
              <ArrowRight className="h-4 w-4 transition-transform group-hover:translate-x-0.5" />
            </Link>
          </div>

          <div className="relative min-h-[280px] lg:min-h-full">
            <Image
              src={image}
              alt={branch.name}
              fill
              quality={88}
              sizes="(min-width: 1024px) 40vw, 100vw"
              className="object-cover"
            />
            <div className="pointer-events-none absolute inset-0 bg-gradient-to-r from-brand-dark/60 via-transparent lg:from-brand-dark/40" />
          </div>
        </div>
      </div>
    </section>
  );
}
