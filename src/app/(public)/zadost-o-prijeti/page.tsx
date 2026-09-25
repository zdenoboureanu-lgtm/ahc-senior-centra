import Link from "next/link";
import { ArrowRight } from "lucide-react";
import { fetchQuery } from "convex/nextjs";
import { api } from "@/convex/_generated/api";
import { getBranchSlugFromHeaders } from "@/common/lib/branch";
import { TestimonialsSection } from "@/features/branch-home/components/testimonials-section";
import { AdmissionStepsFlow } from "@/features/admission/components/admission-steps-flow";
import { PageHero } from "@/features/site/components/page-hero";
import { makeCopy } from "@/features/inline-edit/copy";
import { RegionSlot } from "@/features/inline-edit/components/content-slot";
import { ZadostSedlec } from "@/features/branch-page/components/zadost-sedlec";
import { loadBranchPageContext } from "@/features/inline-edit/load-copy";
import { SEDLEC_TEMPLATE } from "@/common/lib/branch-template";
import type { CopyProps } from "@/features/inline-edit/copy";

const BESPOKE_ZADOST: Record<string, (p: CopyProps) => React.ReactElement> = {
  [SEDLEC_TEMPLATE]: ZadostSedlec,
};

export default async function AdmissionPage() {
  const slug = await getBranchSlugFromHeaders();
  let copyProps: CopyProps = {};
  if (slug) {
    const ctx = await loadBranchPageContext(slug);
    const Bespoke = ctx.template ? BESPOKE_ZADOST[ctx.template] : undefined;
    if (Bespoke)
      return <Bespoke copy={ctx.copy} editBranchId={ctx.editBranchId} />;
    copyProps = { copy: ctx.copy, editBranchId: ctx.editBranchId };
  }
  const data = slug
    ? await fetchQuery(api.modules.branches.queries.getHomepage, { slug }).catch(
        () => null
      )
    : null;

  if (!data) {
    return (
      <div className="mx-auto max-w-3xl px-4 py-24 text-center">
        <h1 className="text-2xl font-bold">Pobočka nenalezena</h1>
      </div>
    );
  }

  const { admissionSteps, documents, testimonials } = data;
  const c = makeCopy(copyProps);

  return (
    <>
      <PageHero
        eyebrow={c.s("zadost.hero.eyebrow", "Žádost o přijetí")}
        title={c.s("zadost.hero.title", "S žádostí vás provedeme krok za krokem")}
        description={c.s(
          "zadost.hero.text",
          "Provedeme vás celým procesem od prvního kontaktu až po nástup. Nemusíte znát předem všechny pojmy ani formuláře — ozvěte se a poradíme."
        )}
        editTargets={{
          eyebrow: c.target("zadost.hero.eyebrow"),
          title: c.target("zadost.hero.title"),
          lead: c.target("zadost.hero.text"),
        }}
      />

      <RegionSlot {...c.region("sekce.zadost.kroky")}>
      <section className="mx-auto max-w-[1320px] px-6 py-14 lg:px-10 lg:py-16">
        <div className="relative">
          <AdmissionStepsFlow steps={admissionSteps} {...copyProps} />
        </div>

        <div className="mt-12 flex justify-center">
          <Link
            href="#dokumenty"
            className="inline-flex items-center gap-2 rounded-full bg-brand px-6 py-3 text-sm font-bold uppercase tracking-wider text-brand-foreground transition-colors hover:bg-brand-dark"
          >
            {c.t("zadost.kroky.cta", "Zažádat o přijetí")} <ArrowRight className="h-4 w-4" />
          </Link>
        </div>
      </section>
      </RegionSlot>

      {/* Dokumenty mají vlastní podstránku — tady jen odkaz, ať se výpis
          neopakuje dvakrát a lidi se v tom neztratí. */}
      {documents.length > 0 ? (
        <RegionSlot {...c.region("sekce.zadost.formulare")}>
        <section id="dokumenty" className="mx-auto max-w-[1320px] scroll-mt-24 px-6 pb-16 lg:px-10">
          <div className="mx-auto max-w-3xl rounded-3xl border border-border bg-card p-8 text-center sm:p-10">
            {c.t("zadost.formulare.nadpis", "Potřebujete formuláře?", { as: "h2", className: "font-display text-2xl text-foreground sm:text-3xl" })}
            {c.t("zadost.formulare.text", "Žádost, posudek lékaře, vzory smluv, domácí řád i přehled úhrad najdete pohromadě na stránce s dokumenty.", { as: "p", className: "mx-auto mt-3 block max-w-xl text-[15px] leading-relaxed text-muted-foreground" })}
            <Link
              href="/dokumenty"
              className="mt-6 inline-flex items-center gap-2 rounded-full bg-brand px-6 py-3 text-sm font-bold uppercase tracking-wider text-brand-foreground transition-colors hover:bg-brand-dark"
            >
              {c.t("zadost.formulare.cta", "Dokumenty ke stažení")} <ArrowRight className="h-4 w-4" />
            </Link>
          </div>
        </section>
        </RegionSlot>
      ) : null}

      <RegionSlot {...c.region("sekce.zadost.reference")}>
        <TestimonialsSection testimonials={testimonials} {...copyProps} />
      </RegionSlot>
    </>
  );
}
