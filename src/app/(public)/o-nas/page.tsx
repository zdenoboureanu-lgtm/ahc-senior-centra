import Image from "next/image";
import Link from "next/link";
import { ArrowRight, Check, Quote } from "lucide-react";
import { fetchQuery } from "convex/nextjs";
import { api } from "@/convex/_generated/api";
import { getBranchSlugFromHeaders } from "@/common/lib/branch";
import { canEditContent } from "@/common/lib/can-edit";
import { FacilitiesSection } from "@/features/branch-home/components/facilities-section";
import { TestimonialsSection } from "@/features/branch-home/components/testimonials-section";
import { RichContent } from "@/features/site/components/rich-content";
import { PhotoGallery } from "@/features/branch-page/components/sedlec-gallery";
import { AboutSedlec } from "@/features/branch-page/components/about-sedlec";
import { loadBranchPageContext } from "@/features/inline-edit/load-copy";
import { SEDLEC_TEMPLATE } from "@/common/lib/branch-template";
import type { CopyProps } from "@/features/inline-edit/copy";

// Pobočky s vlastním (bespoke) layoutem podstránky „O zařízení".
const BESPOKE_ABOUT: Record<string, (p: CopyProps) => React.ReactElement> = {
  [SEDLEC_TEMPLATE]: AboutSedlec,
};

export default async function AboutPage() {
  const slug = await getBranchSlugFromHeaders();

  if (slug) {
    const ctx = await loadBranchPageContext(slug);
    const Bespoke = ctx.template ? BESPOKE_ABOUT[ctx.template] : undefined;
    if (Bespoke)
      return <Bespoke copy={ctx.copy} editBranchId={ctx.editBranchId} />;
  }
  const [data, pageContent, canEdit, siteCopy] = await Promise.all([
    slug
      ? fetchQuery(api.modules.branches.queries.getHomepage, { slug }).catch(
          () => null
        )
      : Promise.resolve(null),
    slug
      ? fetchQuery(api.modules.branches.queries.getBranchPage, {
          slug,
          page: "o-zarizeni",
        }).catch(() => null)
      : Promise.resolve(null),
    canEditContent(),
    slug
      ? fetchQuery(api.modules.content.queries.getCopy, { slug }).catch(
          () => ({}) as Record<string, string>
        )
      : Promise.resolve({} as Record<string, string>),
  ]);

  if (!data) {
    return (
      <div className="mx-auto max-w-3xl px-4 py-24 text-center">
        <h1 className="text-2xl font-bold">Pobočka nenalezena</h1>
      </div>
    );
  }

  const { branch, aboutFeatures, testimonials, facilities, team, gallery } = data;
  const isHospital = branch.branch_type === "hospital";
  // Na O nás dáme jiný záběr než na úvodce — jinak je stránka „ta samá".
  const heroImage = gallery[0]?.image_url ?? branch.cover_image;
  // Fotky do sekcí — zázemí i život v centru, bez té, která je v hlavičce.
  const articleImages = [
    ...facilities.map((f) => ({
      src: f.image_url,
      label: f.title,
      edit: { table: "branch_facilities", id: f._id, field: "image_url" },
    })),
    ...gallery.map((g) => ({
      src: g.image_url,
      label: g.caption,
      edit: { table: "branch_gallery", id: g._id, field: "image_url" },
    })),
  ].filter((im) => im.src && im.src !== branch.cover_image && im.src !== heroImage);
  // Kontakt do závěrečné výzvy — jako u Sedlce (sociální pracovnice + telefon/e-mail).
  const ctaContact = {
    name: branch.office_contact_name ?? undefined,
    role: branch.office_contact_name ? "Kontaktní osoba" : undefined,
    phone: branch.office_contact_phone ?? branch.phone,
    email: branch.office_contact_email ?? branch.email,
  };
  const director = team.find((m) => m.is_director) ?? team[0];

  // Fotogalerie na konci stránky — stejná jako na Sedlci-Prčici.
  const galleryItems = [
    ...gallery.map((g) => ({ src: g.image_url, label: g.caption || branch.short_name })),
    ...facilities.map((f) => ({ src: f.image_url, label: f.title })),
  ].filter((g) => g.src);

  const primaryAction = isHospital
    ? { label: "Kontakt", href: "/kontakt" }
    : { label: "Žádost o přijetí", href: "/zadost-o-prijeti" };

  if (pageContent && pageContent.blocks.length > 0) {
    return (
      <>
        <RichContent
          page={pageContent}
          images={articleImages}
          contact={ctaContact}
          hero={{
            eyebrow: pageContent.eyebrow ?? (isHospital ? "O zařízení" : "O nás"),
            title: pageContent.title ?? branch.name,
            lead: pageContent.lead ?? branch.subtitle ?? undefined,
            image: heroImage
              ? {
                  src: heroImage,
                  label: gallery[0]?.caption,
                  edit: gallery[0]
                    ? {
                        table: "branch_gallery",
                        id: gallery[0]._id,
                        field: "image_url",
                      }
                    : {
                        table: "branches",
                        id: branch._id,
                        field: "cover_image",
                      },
                }
              : undefined,
            actions:
              galleryItems.length > 0
                ? [primaryAction, { label: "Prohlédnout fotogalerii", href: "#galerie" }]
                : [primaryAction],
          }}
          editPageId={canEdit ? pageContent._id : undefined}
          editBranchId={canEdit ? branch._id : undefined}
          copy={siteCopy}
        />

        {galleryItems.length > 0 ? (
          <div id="galerie" className="scroll-mt-24">
            <PhotoGallery
              items={galleryItems.slice(0, 8)}
              subtitle="Fotogalerie"
              title={`Život u nás v ${branch.short_name}`}
              description="Každý den je jiný. Podívejte se, jak vypadá běžný život v našem centru."
              copyPrefix="onas.galerie"
              copy={siteCopy}
              editBranchId={canEdit ? branch._id : undefined}
            />
          </div>
        ) : null}

        <TestimonialsSection
          testimonials={testimonials}
          copy={siteCopy}
          editBranchId={canEdit ? branch._id : undefined}
        />
      </>
    );
  }

  // Pobočka zatím nemá článkový obsah — složíme stránku z databázových dat
  // ve stejné skladbě, jakou má Sedlec-Prčice.
  return (
    <>
      <section className="relative overflow-hidden bg-gradient-to-b from-brand-light/40 to-background">
        <div className="mx-auto grid max-w-[1320px] items-center gap-10 px-6 py-14 lg:grid-cols-2 lg:px-10 lg:py-20">
          <div>
            <div className="text-xs font-bold uppercase tracking-[0.22em] text-warm-dark">
              {isHospital ? "O zařízení" : "O nás"}
            </div>
            <h1 className="font-display mt-4 text-balance text-4xl leading-[1.1] text-foreground sm:text-5xl">
              {branch.name}
            </h1>
            <p className="mt-6 max-w-xl text-base leading-relaxed text-muted-foreground">
              {branch.subtitle ?? branch.description}
            </p>
            <Link
              href={primaryAction.href}
              className="mt-8 inline-flex w-fit items-center gap-2 rounded-full bg-brand px-7 py-3.5 text-sm font-semibold text-brand-foreground shadow-md shadow-brand/15 transition-colors hover:bg-brand-dark"
            >
              {primaryAction.label} <ArrowRight className="h-4 w-4" />
            </Link>
          </div>

          <div className="relative aspect-[4/3] overflow-hidden rounded-3xl bg-muted shadow-md lg:aspect-[5/4]">
            {heroImage ? (
              <Image
                src={heroImage}
                alt={branch.name}
                fill
                priority
                sizes="(min-width: 1024px) 50vw, 100vw"
                className="object-cover"
              />
            ) : null}
          </div>
        </div>
      </section>

      {/* Slovo ředitele */}
      {director ? (
        <section className="mx-auto max-w-[1320px] px-6 py-8 lg:px-10">
          <div className="grid gap-8 rounded-3xl bg-secondary/40 p-8 sm:p-10 lg:grid-cols-[auto_1fr] lg:items-center lg:gap-10 lg:p-12">
            <div className="relative mx-auto h-32 w-32 shrink-0 overflow-hidden rounded-full ring-4 ring-warm/40 sm:h-40 sm:w-40">
              {director.photo_url ? (
                <Image
                  src={director.photo_url}
                  alt={director.name}
                  fill
                  sizes="160px"
                  className="object-cover"
                />
              ) : (
                <div className="flex h-full w-full items-center justify-center bg-brand-light text-3xl font-bold text-brand">
                  {director.name.charAt(0)}
                </div>
              )}
            </div>

            <div className="relative">
              <Quote
                aria-hidden="true"
                className="mb-4 h-8 w-8 text-warm"
                strokeWidth={1.5}
              />
              <div className="text-[11px] font-bold uppercase tracking-[0.22em] text-warm-dark">
                Slovo {director.is_director ? "ředitelky" : director.role.toLowerCase()}
              </div>
              <blockquote className="font-display mt-3 text-xl leading-snug text-foreground sm:text-2xl">
                {director.bio ??
                  "Naším posláním je poskytovat péči, kterou si naši klienti zaslouží — s respektem, laskavostí a profesionálně."}
              </blockquote>
              <div className="mt-5 text-sm">
                <span className="font-bold text-foreground">{director.name}</span>
                <span className="text-muted-foreground"> — {director.role}</span>
              </div>
            </div>
          </div>
        </section>
      ) : null}

      {/* Čisté a nové prostředí */}
      {aboutFeatures.length > 0 ? (
        <section className="mx-auto max-w-[1320px] px-6 py-16 lg:px-10 lg:py-20">
          <div className="grid gap-10 lg:grid-cols-[1.1fr_1fr] lg:gap-14">
            <div className="flex flex-col justify-center">
              <h2 className="font-display text-3xl text-foreground sm:text-4xl">
                Čisté a nové prostředí
              </h2>
              <ul className="mt-8 space-y-4">
                {aboutFeatures.map((f) => (
                  <li key={f._id} className="flex gap-3">
                    <div className="mt-0.5 flex h-6 w-6 shrink-0 items-center justify-center rounded-full bg-brand text-brand-foreground">
                      <Check className="h-3.5 w-3.5" strokeWidth={2.5} />
                    </div>
                    <span className="text-sm leading-relaxed text-foreground sm:text-base">
                      {f.text}
                    </span>
                  </li>
                ))}
              </ul>
            </div>

            <div className="relative aspect-[4/3] overflow-hidden rounded-3xl bg-muted shadow-sm lg:aspect-[5/4]">
              {facilities[0]?.image_url ? (
                <Image
                  src={facilities[0].image_url}
                  alt={facilities[0].title}
                  fill
                  sizes="(min-width: 1024px) 45vw, 100vw"
                  className="object-cover"
                />
              ) : null}
            </div>
          </div>
        </section>
      ) : null}

      <FacilitiesSection facilities={facilities} />

      <div className="flex justify-center pb-8">
        <Link
          href={primaryAction.href}
          className="inline-flex items-center gap-2 rounded-full bg-brand px-6 py-3 text-sm font-bold uppercase tracking-wider text-brand-foreground transition-colors hover:bg-brand-dark"
        >
          {primaryAction.label} <ArrowRight className="h-4 w-4" />
        </Link>
      </div>

      <TestimonialsSection
        testimonials={testimonials}
        copy={siteCopy}
        editBranchId={canEdit ? branch._id : undefined}
      />
    </>
  );
}
