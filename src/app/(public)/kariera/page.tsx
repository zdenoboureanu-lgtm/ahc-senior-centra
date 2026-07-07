import Link from "next/link";
import { ArrowLeft } from "lucide-react";
import { RevealOnScroll } from "@/common/components/reveal-on-scroll";
import { CareerHero } from "@/features/career/components/career-hero";
import { WhyAhcSection } from "@/features/career/components/why-ahc-section";
import { TeamDaySection } from "@/features/career/components/team-day-section";
import { EmployeeStoriesSection } from "@/features/career/components/employee-stories-section";
import { CareerBenefitsSection } from "@/features/career/components/benefits-section";
import { AhcNumbersSection } from "@/features/career/components/ahc-numbers-section";
import { CareerGallerySection } from "@/features/career/components/career-gallery-section";
import { TeamioWidget } from "@/features/career/components/teamio-widget";
import { CareerContactSection } from "@/features/career/components/career-contact-section";
import { getBranchSlugFromHeaders } from "@/common/lib/branch";
const BESPOKE_KARIERA: Record<string, () => React.ReactElement> = {};

export default async function CareerPage({
  searchParams,
}: {
  searchParams: Promise<Record<string, string | string[] | undefined>>;
}) {
  const sp = await searchParams;
  // Capybara/Teamio detail pozice běží přes ?r=detail&id=… — pak zobrazíme
  // čistou samostatnou stránku jen s detailem (bez marketingových sekcí).
  const isDetail = sp?.r === "detail" || sp?.id !== undefined;

  // Bespoke kariéra (per pobočka) — jen pro plný výpis, ne pro detail pozice.
  if (!isDetail) {
    const slug = await getBranchSlugFromHeaders();
    const Bespoke = slug ? BESPOKE_KARIERA[slug] : undefined;
    if (Bespoke) return <Bespoke />;
  }

  if (isDetail) {
    return (
      <section className="mx-auto max-w-[1100px] px-6 py-12 lg:px-10 lg:py-16">
        <Link
          href="/kariera"
          className="inline-flex items-center gap-2 text-sm font-semibold text-brand hover:underline"
        >
          <ArrowLeft className="h-4 w-4" strokeWidth={2.25} />
          Zpět na volné pozice
        </Link>
        <div className="mt-8">
          <TeamioWidget />
        </div>
        <RevealOnScroll>
          <CareerContactSection />
        </RevealOnScroll>
      </section>
    );
  }

  return (
    <>
      <CareerHero />

      <RevealOnScroll>
        <WhyAhcSection />
      </RevealOnScroll>

      <RevealOnScroll>
        <TeamDaySection />
      </RevealOnScroll>

      <RevealOnScroll>
        <EmployeeStoriesSection />
      </RevealOnScroll>

      <RevealOnScroll>
        <CareerBenefitsSection />
      </RevealOnScroll>

      <RevealOnScroll>
        <AhcNumbersSection />
      </RevealOnScroll>

      <RevealOnScroll>
        <CareerGallerySection />
      </RevealOnScroll>

      {/* Volné pozice — živě z Teamia (LMC). Kotva pro hero CTA. */}
      <div id="volne-pozice" className="scroll-mt-24">
        <RevealOnScroll>
          <section className="mx-auto max-w-[1320px] px-6 pt-16 lg:px-10">
            <div className="mx-auto max-w-3xl text-center">
              <div className="text-[11px] font-bold uppercase tracking-[0.22em] text-warm-dark">
                Volné pozice
              </div>
              <h2 className="font-display mt-3 text-4xl text-foreground sm:text-5xl">
                Kam můžete nastoupit
              </h2>
              <p className="mt-4 text-base text-muted-foreground">
                Aktuální nabídka pozic napříč našimi pobočkami.
              </p>
            </div>
          </section>
        </RevealOnScroll>
        <div className="mt-10">
          <TeamioWidget />
        </div>
      </div>

      <RevealOnScroll>
        <CareerContactSection />
      </RevealOnScroll>
    </>
  );
}
