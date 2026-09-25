import Image from "next/image";
import { ArrowRight } from "lucide-react";
import { FacebookIcon } from "@/common/components/social-icons";
import type { Branch } from "@/convex/lib/types";

interface NewsSectionProps {
  branch: Branch;
}

const IMAGE = "/images/news-aktuality.png";

export function NewsSection({ branch }: NewsSectionProps) {
  return (
    <section className="relative bg-secondary/40">
      <div
        aria-hidden="true"
        className="pointer-events-none absolute -left-24 bottom-12 h-72 w-72 rounded-full bg-brand-light/40 blur-3xl animate-pulse-blob"
      />
      <div
        aria-hidden="true"
        className="pointer-events-none absolute -right-16 top-12 h-64 w-64 rounded-full bg-warm/15 blur-3xl animate-float-slow"
      />

      <div className="relative mx-auto max-w-5xl px-6 py-20 lg:px-10 lg:py-28">
        <div className="grid items-center gap-12 lg:grid-cols-12 lg:gap-14">
          <div className="relative mx-auto aspect-[984/822] w-full max-w-md overflow-hidden rounded-[2rem] bg-muted shadow-md lg:col-span-5 lg:mx-0 lg:max-w-none">
            <Image
              src={IMAGE}
              alt="Život v centru"
              fill
              quality={92}
              sizes="(min-width: 1024px) 480px, 100vw"
              className="object-cover"
            />
            <div className="pointer-events-none absolute inset-0 bg-gradient-to-tr from-brand-dark/40 via-transparent" />
          </div>

          <div className="lg:col-span-7">
            <div className="text-xs font-bold uppercase tracking-[0.22em] text-warm-dark">
              Aktuality
            </div>
            <h2 className="font-display mt-4 text-4xl text-foreground lg:text-[3rem]">
              Život v centru
              <br />
              <span className="text-brand">každý den.</span>
            </h2>
            <p className="mt-6 max-w-md text-base leading-[1.8] text-muted-foreground">
              Den otevřených dveří, koncerty, oslavy narozenin, výlety.
              {branch.facebook_url
                ? " Veškeré dění z našeho centra najdete živě na našem Facebooku."
                : " Sledujte, čím žije naše centrum."}
            </p>

            {branch.facebook_url ? (
              <a
                href={branch.facebook_url}
                target="_blank"
                rel="noopener noreferrer"
                className="group mt-10 inline-flex w-fit items-center gap-3 rounded-full bg-brand px-6 py-3.5 text-sm font-semibold text-brand-foreground shadow-md shadow-brand/15 transition-all hover:bg-brand-dark hover:shadow-lg"
              >
                <FacebookIcon className="h-4 w-4" />
                Sledovat náš Facebook
                <ArrowRight className="h-4 w-4 transition-transform group-hover:translate-x-0.5" />
              </a>
            ) : null}
          </div>
        </div>
      </div>
    </section>
  );
}
