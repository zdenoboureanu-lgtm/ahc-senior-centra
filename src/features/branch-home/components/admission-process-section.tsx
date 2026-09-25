import Link from "next/link";
import {
  ArrowRight,
  Download,
  Phone,
  FileText,
  Mail,
  ClipboardCheck,
  Stethoscope,
  ListChecks,
  HeartHandshake,
  Briefcase,
} from "lucide-react";
import type { LucideIcon } from "lucide-react";
import type { BranchAdmissionStep } from "@/convex/lib/types";

interface AdmissionProcessSectionProps {
  steps: BranchAdmissionStep[];
}

const STEP_ICONS: LucideIcon[] = [
  Phone,
  FileText,
  Mail,
  ClipboardCheck,
  Stethoscope,
  ListChecks,
  HeartHandshake,
  Briefcase,
];

export function AdmissionProcessSection({ steps }: AdmissionProcessSectionProps) {
  if (steps.length === 0) return null;

  return (
    <section className="relative mx-auto max-w-[1320px] px-6 py-24 lg:px-10 lg:py-32">
      {/* Decorative shape */}
      <div
        aria-hidden="true"
        className="pointer-events-none absolute -right-24 top-32 h-72 w-72 rounded-full bg-warm/8 blur-3xl animate-float-slow"
      />

      <div className="relative grid gap-14 lg:grid-cols-12 lg:gap-16">
        <div className="lg:col-span-4">
          <div className="lg:sticky lg:top-28">
            <div className="text-xs font-bold uppercase tracking-[0.22em] text-warm-dark">
              Jak začít
            </div>
            <h2 className="font-display mt-4 text-4xl text-foreground lg:text-5xl">
              Cesta k nám
              <br />
              <span className="text-brand">krok po kroku.</span>
            </h2>
            <p className="mt-6 text-base leading-relaxed text-muted-foreground">
              Vstup do našeho centra je transparentní a bez stresu. Provedeme
              vás každým krokem osobně.
            </p>
            <Link
              href="/zadost-o-prijeti"
              className="mt-8 inline-flex items-center gap-2 rounded-full bg-brand px-6 py-3 text-sm font-semibold text-brand-foreground shadow-md shadow-brand/15 transition-all hover:bg-brand-dark hover:shadow-lg"
            >
              <Download className="h-4 w-4" />
              Stáhnout dokumenty
            </Link>
          </div>
        </div>

        <ol className="relative lg:col-span-8">
          <div
            aria-hidden="true"
            className="absolute left-6 top-3 bottom-3 w-px bg-gradient-to-b from-warm/60 via-brand/30 to-transparent"
          />
          {steps.map((s) => {
            const Icon = STEP_ICONS[s.step_number - 1] ?? FileText;
            return (
              <li
                key={s._id}
                className="relative grid grid-cols-[3rem_1fr] gap-6 pb-10 last:pb-0 sm:gap-8"
              >
                <div className="flex items-start justify-center">
                  <div className="relative z-10 flex h-12 w-12 items-center justify-center rounded-full bg-background ring-2 ring-warm">
                    <Icon className="h-5 w-5 text-brand" strokeWidth={1.75} />
                  </div>
                </div>
                <div className="pt-2.5">
                  <div className="text-xs font-bold uppercase tracking-[0.22em] text-warm-dark">
                    Krok {String(s.step_number).padStart(2, "0")}
                  </div>
                  <h3 className="font-display mt-2 text-2xl text-foreground">
                    {s.title}
                  </h3>
                  <p className="mt-2 max-w-xl text-[15px] leading-relaxed text-muted-foreground">
                    {s.description}
                  </p>
                </div>
              </li>
            );
          })}

          <div className="relative grid grid-cols-[3rem_1fr] gap-6 sm:gap-8">
            <div />
            <Link
              href="/zadost-o-prijeti"
              className="inline-flex items-center gap-2 text-sm font-bold uppercase tracking-wider text-brand transition-all hover:gap-3"
            >
              Detailní postup pro žadatele
              <ArrowRight className="h-4 w-4" />
            </Link>
          </div>
        </ol>
      </div>
    </section>
  );
}
