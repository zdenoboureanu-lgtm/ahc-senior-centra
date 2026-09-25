import Image from "next/image";
import Link from "next/link";
import {
  ArrowRight, ArrowUpRight, Phone, Mail, Quote,
  Stethoscope, ClipboardList, Contact as ContactIcon, FileText, Briefcase,
  Sparkles,
} from "lucide-react";
import * as Icons from "lucide-react";
import type { LucideIcon } from "lucide-react";
import { ChatCtaSection } from "./chat-cta-section";
import { GrantsSection } from "./eu-grant-section";
import { SedlecGallery } from "@/features/branch-page/components/sedlec-gallery";
import { iconForHeading } from "@/features/site/components/block-icon";
import { EditOnly } from "@/features/inline-edit/components/edit-only";
import { mapUrlFor } from "@/features/contact/components/contact-layout";
import { makeCopy, type CopyProps } from "@/features/inline-edit/copy";
import {
  RegionSlot,
  TextSlot,
} from "@/features/inline-edit/components/content-slot";
import type { EditTarget } from "@/features/inline-edit/edit-mode-context";
import type {
  Branch,
  BranchAboutFeature,
  BranchFacility,
  BranchGalleryItem,
  BranchGrant,
  BranchHighlight,
  BranchService,
  BranchStatRow,
  BranchTestimonial,
  BranchUnit,
} from "@/convex/lib/types";

/**
 * Úvodní stránka pobočky v jednotném vizuálu sítě (převzatém ze Sedlce-Prčice).
 *
 * Skladba sekcí je všude stejná; obsah, fotky a čísla si každá pobočka nese
 * ve svých datech. Sekce, ke které pobočka data nemá, se prostě nevykreslí.
 */

const wrap = "mx-auto max-w-[1320px] px-6 lg:px-10";
const FALLBACK_PHOTO = "/images/_shared/care-hands.jpg";

const QUICKLINKS = [
  { icon: ClipboardList, t: "Žádost o přijetí", d: "Jaké dokumenty potřebujete a jak postupovat.", href: "/zadost-o-prijeti", primary: true },
  { icon: ContactIcon, t: "Kontakty", d: "Vedení, sociální pracovníci i jednotlivá pracoviště.", href: "/kontakt" },
  { icon: FileText, t: "Dokumenty", d: "Formuláře, žádosti a dokumenty na jednom místě.", href: "/dokumenty" },
  { icon: Briefcase, t: "Kariéra", d: "Hledáte práci, která má smysl? Poznejte naše týmy.", href: "/kariera" },
];

const PARTNERS = [
  { name: "Sestřička.cz", file: "sestricka.png", href: "https://www.sestricka.cz/" },
  { name: "Most k domovu", file: "mostkdomovu.png", href: "https://www.mostkdomovu.cz/" },
  { name: "SestřičkaSOS", file: "sestrickasos.png", href: "https://www.sestrickasos.cz/" },
  { name: "e-Sestřička", file: "e-sestricka.png", href: "https://www.e-sestricka.cz/" },
];

function icon(name?: string): LucideIcon {
  if (!name) return Sparkles;
  const found = (Icons as unknown as Record<string, LucideIcon | undefined>)[name];
  return found ?? Sparkles;
}

export interface HomeLayoutProps extends CopyProps {
  branch: Branch;
  highlights: BranchHighlight[];
  services: BranchService[];
  aboutFeatures: BranchAboutFeature[];
  facilities: BranchFacility[];
  gallery: BranchGalleryItem[];
  testimonials: BranchTestimonial[];
  stats: BranchStatRow[];
  grants: BranchGrant[];
  units: BranchUnit[];
}

export function HomeLayout({
  branch,
  highlights,
  services,
  aboutFeatures,
  facilities,
  gallery,
  testimonials,
  stats,
  grants,
  units,
  copy,
  editBranchId,
}: HomeLayoutProps) {
  const c = makeCopy({ copy, editBranchId });

  /** Cíl editace pro text, který přichází z databáze. */
  const field = (
    table: string,
    id: string,
    name: string
  ): EditTarget | undefined =>
    editBranchId ? { kind: "field", table, id, field: name } : undefined;

  const photos = [
    ...facilities.map((f) => ({ src: f.image_url, label: f.title })),
    ...gallery.map((g) => ({ src: g.image_url, label: g.caption ?? "" })),
  ].filter((p) => p.src);
  const photoAt = (i: number) => photos[i]?.src ?? branch.cover_image ?? FALLBACK_PHOTO;

  /** Fotka i s možností výměny — původní soubor je jen výchozí hodnota. */
  const pic = (
    key: string,
    src: string,
    alt: string,
    className = "",
    rounded = "rounded-3xl",
    // Karty se zvětšující se fotkou si překryv vykreslí samy — transformace
    // by ho jinak uzavřela pod tmavý přechod a nešel by na něj najet.
    withOverlay = true
  ) => (
    <div className={`relative overflow-hidden bg-muted ${rounded} ${className}`}>
      <Image src={c.s(key, src)} alt={alt} fill sizes="(min-width:1024px) 50vw, 100vw" className="object-cover" />
      {withOverlay ? c.img(key) : null}
    </div>
  );

  const distances = [
    { label: branch.distance_city_1_label, km: branch.distance_city_1_km },
    { label: branch.distance_city_2_label, km: branch.distance_city_2_km },
    { label: branch.distance_city_3_label, km: branch.distance_city_3_km },
  ].filter((d): d is { label: string; km: number } => Boolean(d.label && d.km));

  const story = testimonials[0];
  const fbUrl = branch.facebook_url;
  const orientace = highlights.slice(0, 3);
  const values = aboutFeatures.slice(0, 4);
  const mainServices = services.slice(0, 2);
  const lifeCards = facilities.slice(0, 2);
  const isHospital = branch.branch_type === "hospital";
  const departments = units.filter((u) => u.category === "oddeleni").slice(0, 6);
  const ambulances = units.filter((u) => u.category === "ambulance").slice(0, 6);

  return (
    <>
      {/* 1. HERO */}
      <section className="relative overflow-hidden bg-gradient-to-b from-brand-light/40 to-background">
        <div className={`${wrap} grid items-center gap-10 py-14 lg:grid-cols-2 lg:py-20`}>
          <div>
            <div className="flex items-center gap-3 text-xs font-bold uppercase tracking-[0.22em] text-brand">
              <span className="h-px w-10 bg-warm" /> {c.t("domu.hero.eyebrow", branch.short_name)}
              <span className="text-muted-foreground/50">·</span>
              {c.t("domu.hero.eyebrow2", branch.type_label ?? "Senior centrum", { as: "span", className: "text-muted-foreground" })}
            </div>
            <h1 className="font-display mt-5 text-4xl leading-[1.08] text-foreground sm:text-5xl lg:text-[3.4rem]">
              {c.t("domu.hero.title", (branch.tagline ?? branch.name).replace(/\*/g, "").replace(/\n/g, " "))}
            </h1>
            {c.t("domu.hero.text", branch.subtitle ?? branch.description, {
              as: "p",
              className: "mt-6 max-w-xl text-lg leading-[1.7] text-muted-foreground",
            })}
            <div className="mt-8 flex flex-wrap gap-3">
              <Link href={isHospital ? "/kontakt" : "/zadost-o-prijeti"} className="inline-flex items-center gap-2 rounded-full bg-brand px-7 py-3.5 text-sm font-semibold text-brand-foreground shadow-md shadow-brand/15 transition-colors hover:bg-brand-dark">
                {c.t("domu.hero.cta1", isHospital ? "Rychlý kontakt" : "Jak požádat o přijetí")} <ArrowRight className="h-4 w-4" />
              </Link>
              <Link href="/sluzby" className="inline-flex items-center gap-2 rounded-full border border-border bg-background px-6 py-3.5 text-sm font-semibold text-foreground hover:border-brand hover:text-brand">{c.t("domu.hero.cta2", "Poznat naše služby")}</Link>
              <Link href="/kontakt" className="inline-flex items-center gap-2 rounded-full px-5 py-3.5 text-sm font-semibold text-foreground/70 hover:text-brand">{c.t("domu.hero.cta3", "Kontaktovat nás")}</Link>
            </div>
          </div>
          {pic("domu.hero.foto", branch.cover_image ?? FALLBACK_PHOTO, branch.name, "aspect-[4/3] shadow-lg lg:aspect-[5/4]")}
        </div>
      </section>

      {/* 2. RYCHLÁ ORIENTACE */}
      {orientace.length > 0 ? (
        <RegionSlot {...c.region("sekce.domu.orientace")}>
<section className={`${wrap} pb-4`}>
          <div className="grid gap-4 rounded-3xl border border-border bg-card p-6 sm:grid-cols-3">
            {orientace.map((o) => {
              const Icon = icon(o.icon);
              return (
                <RegionSlot key={o._id} {...c.region(`row:branch_highlights:${o._id}`, { kind: "row", table: "branch_highlights", id: o._id }, { kind: "row", table: "branch_highlights", id: o._id })}>
                  <div className="flex items-start gap-3">
                    <Icon className="mt-0.5 h-6 w-6 shrink-0 text-brand" strokeWidth={1.75} />
                    <div>
                      <TextSlot
                        as="div"
                        target={field("branch_highlights", o._id, "title")}
                        value={o.title}
                        className="font-display text-base text-foreground"
                      />
                      <TextSlot
                        as="p"
                        target={field("branch_highlights", o._id, "description")}
                        value={o.description}
                        className="mt-1 text-sm leading-relaxed text-muted-foreground"
                      />
                    </div>
                  </div>
                </RegionSlot>
              );
            })}
          </div>
        </section>
</RegionSlot>
      ) : null}

      {/* 3. NEMUSÍTE BÝT SAMI */}
      <RegionSlot {...c.region("sekce.domu.rozhodnuti")}>
<section className={`${wrap} grid items-center gap-10 py-16 lg:grid-cols-[1.1fr_1fr] lg:py-20`}>
        <div>
          {c.t("domu.rozhodnuti.nadpis", "Najít správnou péči není jednoduché rozhodnutí", { as: "h2", className: "font-display text-3xl text-foreground sm:text-4xl" })}
          <div className="mt-5 space-y-4 text-base leading-relaxed text-muted-foreground">
            {c.t("domu.rozhodnuti.text1", "Často přichází ve chvíli, kdy se zdravotní stav změnil rychleji, než rodina očekávala. Jindy se postupně ukazuje, že domácí prostředí již nedokáže nabídnout všechnu potřebnou podporu.", { as: "p" })}
            {c.t("domu.rozhodnuti.text2", "V takové situaci nemusíte znát všechny odborné pojmy ani předem vědět, která služba je správná. Vyslechneme vaši situaci, vysvětlíme možnosti a pomůžeme vám zorientovat se v dalším postupu.", { as: "p" })}
          </div>
          {c.t("domu.rozhodnuti.citat", "Protože dobrá péče nezačíná u diagnózy. Začíná u člověka.", { as: "blockquote", className: "mt-6 block border-l-4 border-warm pl-5 font-display text-xl leading-snug text-foreground" })}
          <Link href="/kontakt" className="mt-6 inline-flex items-center gap-2 rounded-full bg-brand px-6 py-3 text-sm font-semibold text-brand-foreground hover:bg-brand-dark">{c.t("domu.rozhodnuti.cta", "Poradit se o možnostech péče")}</Link>
        </div>
        {pic("domu.rozhodnuti.foto", photoAt(0), "Podpora a bezpečí", "aspect-[4/3]")}
      </section>
</RegionSlot>

      {/* 4. VYBERTE SLUŽBU */}
      {mainServices.length > 0 ? (
        <RegionSlot {...c.region("sekce.domu.sluzby")}>
<section className="bg-secondary/40">
          <div className={`${wrap} py-16 lg:py-20`}>
            {c.t("domu.sluzby.nadpis", "Vyberte službu podle své situace", { as: "h2", className: "font-display block text-center text-3xl text-foreground sm:text-4xl" })}
            <div className={`mt-10 grid gap-6 ${mainServices.length > 1 ? "md:grid-cols-2" : "mx-auto max-w-2xl"}`}>
              {mainServices.map((s, i) => (
                <RegionSlot key={s._id} {...c.region(`row:branch_services:${s._id}`, { kind: "row", table: "branch_services", id: s._id }, { kind: "row", table: "branch_services", id: s._id })}>
                  <div className="overflow-hidden rounded-3xl border border-border bg-card">
                    {pic(`domu.sluzby.${i}.foto`, photoAt(i + 1), s.title, "aspect-[16/9]", "rounded-none")}
                    <div className="p-7">
                      <TextSlot
                        as="h3"
                        target={field("branch_services", s._id, "title")}
                        value={s.title}
                        className="font-display text-xl text-foreground sm:text-2xl"
                      />
                      {s.description ? (
                        <TextSlot
                          as="p"
                          target={field("branch_services", s._id, "description")}
                          value={s.description}
                          className="mt-2 text-[15px] leading-relaxed text-muted-foreground"
                        />
                      ) : null}
                      <div className="mt-5 flex flex-wrap gap-2">
                        <Link href="/sluzby" className="rounded-full bg-brand px-5 py-2.5 text-xs font-bold uppercase tracking-wider text-brand-foreground hover:bg-brand-dark">{c.t(`domu.sluzby.${i}.cta1`, "Více o službě")}</Link>
                        <Link href="/zadost-o-prijeti" className="rounded-full border border-border px-5 py-2.5 text-xs font-bold uppercase tracking-wider text-foreground hover:border-brand hover:text-brand">{c.t(`domu.sluzby.${i}.cta2`, "Jak požádat")}</Link>
                      </div>
                    </div>
                  </div>
                </RegionSlot>
              ))}
            </div>
          </div>
        </section>
</RegionSlot>
      ) : null}

      {/* 4b. ODDĚLENÍ A AMBULANCE — jen nemocnice */}
      {isHospital && (departments.length > 0 || ambulances.length > 0) ? (
        <RegionSlot {...c.region("sekce.domu.oddeleni")}>
<section className={`${wrap} py-16 lg:py-20`}>
          {c.t("domu.oddeleni.nadpis", "Oddělení a ambulance", { as: "h2", className: "font-display block text-center text-3xl text-foreground sm:text-4xl" })}
          <div className="mt-10 grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
            {[...departments, ...ambulances].map((u) => {
              const Icon = icon(u.icon);
              return (
                <RegionSlot key={u._id} {...c.region(`row:branch_units:${u._id}`, { kind: "row", table: "branch_units", id: u._id }, { kind: "row", table: "branch_units", id: u._id })}>
                  <Link
                    href={`/${u.category === "ambulance" ? "ambulance" : "oddeleni"}${u.slug ? `/${u.slug}` : ""}`}
                    className="group block h-full rounded-2xl border border-border bg-card p-6 transition-all hover:-translate-y-1 hover:border-brand/40 hover:shadow-md"
                  >
                    <Icon className="h-6 w-6 text-brand" strokeWidth={1.75} />
                    <TextSlot
                      as="h3"
                      target={field("branch_units", u._id, "name")}
                      value={u.name}
                      className="font-display mt-3 text-lg text-foreground group-hover:text-brand"
                    />
                    {u.description ? (
                      <TextSlot
                        as="p"
                        target={field("branch_units", u._id, "description")}
                        value={u.description}
                        className="mt-1.5 text-sm leading-relaxed text-muted-foreground"
                      />
                    ) : null}
                  </Link>
                </RegionSlot>
              );
            })}
          </div>
        </section>
</RegionSlot>
      ) : null}

      {/* 5. NA ČEM NÁM ZÁLEŽÍ */}
      {values.length > 0 ? (
        <RegionSlot {...c.region("sekce.domu.hodnoty")}>
<section className={`${wrap} py-16 lg:py-20`}>
          {c.t("domu.hodnoty.nadpis", "Na čem nám záleží", { as: "h2", className: "font-display block text-center text-3xl text-foreground sm:text-4xl" })}
          <div className="mt-10 grid gap-5 sm:grid-cols-2 lg:grid-cols-4">
            {values.map((v) => {
              // Ikonu odvodíme z nadpisu, ať karty nevypadají všechny stejně.
              const Icon = v.title ? iconForHeading(v.title) : Sparkles;
              const titleTarget = field("branch_about_features", v._id, "title");
              return (
              <RegionSlot key={v._id} {...c.region(`row:branch_about_features:${v._id}`, { kind: "row", table: "branch_about_features", id: v._id }, { kind: "row", table: "branch_about_features", id: v._id })}>
                <div className="h-full rounded-2xl border border-border bg-card p-6">
                  <span className="flex h-11 w-11 items-center justify-center rounded-2xl bg-brand-light text-brand"><Icon className="h-5 w-5" strokeWidth={1.75} /></span>
                  {v.title ? (
                    <TextSlot
                      as="h3"
                      target={titleTarget}
                      value={v.title}
                      className="font-display mt-4 block text-lg text-foreground"
                    />
                  ) : titleTarget ? (
                    // Karta zatím nadpis nemá — správce ho může doplnit,
                    // návštěvník o prázdném poli neví.
                    <EditOnly>
                      <TextSlot
                        as="h3"
                        target={titleTarget}
                        value="Doplnit nadpis"
                        className="font-display mt-4 block text-lg text-muted-foreground"
                      />
                    </EditOnly>
                  ) : null}
                  <TextSlot
                    as="p"
                    target={field("branch_about_features", v._id, "text")}
                    value={v.text}
                    className={`${v.title ? "mt-2" : "mt-4"} block text-sm leading-relaxed text-muted-foreground`}
                  />
                </div>
              </RegionSlot>
              );
            })}
          </div>
          <div className="mt-8 text-center">
            <Link href="/o-nas" className="inline-flex items-center gap-1.5 text-sm font-bold uppercase tracking-wider text-brand hover:gap-2.5">{c.t("domu.hodnoty.cta", "Více o našem přístupu")} <ArrowRight className="h-4 w-4" /></Link>
          </div>
        </section>
</RegionSlot>
      ) : null}

      {/* 6. ŽIVOT U NÁS */}
      {lifeCards.length > 0 ? (
        <RegionSlot {...c.region("sekce.domu.zivot")}>
<section className="bg-secondary/40">
          <div className={`${wrap} py-16 lg:py-20`}>
            <div className="text-center">
              {c.t("domu.zivot.nadpis", "Život, který má každý den svůj rytmus", { as: "h2", className: "font-display text-3xl text-foreground sm:text-4xl" })}
              {c.t("domu.zivot.text", "Každý den může vypadat jinak. Aktivity nejsou povinností — jsou nabídkou, jak si zachovat zájmy, schopnosti a radost z obyčejných věcí.", { as: "p", className: "mx-auto mt-4 block max-w-2xl text-base leading-relaxed text-muted-foreground" })}
            </div>
            <div className={`mt-10 grid gap-5 ${lifeCards.length > 1 ? "lg:grid-cols-2" : "mx-auto max-w-2xl"}`}>
              {lifeCards.map((f, i) => (
                <RegionSlot key={f._id} {...c.region(`row:branch_facilities:${f._id}`, { kind: "row", table: "branch_facilities", id: f._id }, { kind: "row", table: "branch_facilities", id: f._id })}>
                  <div className="group relative overflow-hidden rounded-3xl">
                    {pic(`domu.zivot.${i}.foto`, f.image_url, f.title, "aspect-[4/3] transition-transform duration-500 group-hover:scale-[1.03]", "rounded-none", false)}
                    <div className="pointer-events-none absolute inset-0 bg-gradient-to-t from-brand-dark via-brand-dark/65 to-brand-dark/5" />
                    {c.img(`domu.zivot.${i}.foto`)}
                    <div className="absolute bottom-0 left-0 right-0 z-50 p-7 sm:p-8">
                      {c.t(`domu.zivot.${i}.stitek`, "Život u nás", { as: "div", className: "text-[10px] font-bold uppercase tracking-[0.2em] text-warm" })}
                      <TextSlot
                        as="h3"
                        target={field("branch_facilities", f._id, "title")}
                        value={f.title}
                        className="font-display mt-2 text-xl text-white sm:text-2xl"
                      />
                      <Link href="/o-nas" className="mt-5 inline-flex items-center gap-2 rounded-full bg-white/15 px-5 py-2.5 text-xs font-bold uppercase tracking-wider text-white backdrop-blur-sm transition-colors hover:bg-white/25">
                        {c.t(`domu.zivot.${i}.cta`, "Poznat naše zařízení")} <ArrowRight className="h-3.5 w-3.5" />
                      </Link>
                    </div>
                  </div>
                </RegionSlot>
              ))}
            </div>
          </div>
        </section>
</RegionSlot>
      ) : null}

      {/* 7. PŘÍBĚH */}
      {story ? (
        <RegionSlot {...c.region("sekce.domu.pribeh")}>
<section className={`${wrap} py-16`}>
          <RegionSlot {...c.region(`row:branch_testimonials:${story._id}`)}>
            <figure className="mx-auto max-w-3xl rounded-3xl bg-card p-8 text-center ring-1 ring-border sm:p-12">
              <Quote className="mx-auto h-8 w-8 text-warm" strokeWidth={1.5} />
              <blockquote className="font-display mt-4 text-2xl leading-snug text-foreground sm:text-3xl">
                „
                <TextSlot
                  target={field("branch_testimonials", story._id, "content")}
                  value={story.content}
                />
                “
              </blockquote>
              <figcaption className="mt-4 text-sm font-semibold text-muted-foreground">
                —{" "}
                <TextSlot
                  target={field("branch_testimonials", story._id, "author_name")}
                  value={story.author_name}
                />
                {story.author_role ? (
                  <>
                    ,{" "}
                    <TextSlot
                      target={field("branch_testimonials", story._id, "author_role")}
                      value={story.author_role}
                    />
                  </>
                ) : null}
              </figcaption>
              <Link href="/o-nas#pribehy" className="mt-6 inline-flex items-center gap-1.5 text-xs font-bold uppercase tracking-wider text-brand hover:gap-2.5">{c.t("domu.pribeh.cta", "Poznat další příběhy")} <ArrowRight className="h-3.5 w-3.5" /></Link>
            </figure>
          </RegionSlot>
        </section>
</RegionSlot>
      ) : null}

      {/* 8. FOTOGALERIE */}
      {photos.length > 0 ? (
        <SedlecGallery
          items={photos.slice(0, 8).map((p) => ({ src: p.src, label: p.label || branch.short_name }))}
          copyPrefix="domu.galerie"
          copy={copy}
          editBranchId={editBranchId}
        />
      ) : null}

      {/* 9. V ČÍSLECH */}
      {stats.length > 0 ? (
        <RegionSlot {...c.region("sekce.domu.cisla")}>
<section className="relative overflow-hidden bg-brand py-20 text-brand-foreground lg:py-24">
          <div aria-hidden="true" className="pointer-events-none absolute -left-32 -top-32 h-96 w-96 rounded-full bg-warm/15 blur-3xl" />
          <div aria-hidden="true" className="pointer-events-none absolute -bottom-32 -right-32 h-96 w-96 rounded-full bg-brand-foreground/10 blur-3xl" />
          <div className={`relative ${wrap}`}>
            <div className="text-center">
              {c.t("domu.cisla.eyebrow", "V číslech", { as: "div", className: "text-[11px] font-bold uppercase tracking-[0.22em] text-warm" })}
              {c.t("domu.cisla.nadpis", "Naše centrum v kostce", { as: "h2", className: "font-display mt-3 text-3xl text-brand-foreground sm:text-4xl" })}
            </div>
            <ul className="mx-auto mt-14 grid w-full max-w-5xl grid-cols-2 gap-x-6 gap-y-12 lg:grid-cols-4">
              {stats.map((s) => {
                const Icon = icon(s.icon);
                return (
                  <li key={`${s.label}-${s.value}`} className="group flex flex-col items-center text-center">
                    <span className="mb-6 flex h-14 w-14 items-center justify-center rounded-2xl bg-brand-foreground/10 text-warm transition-all group-hover:bg-warm group-hover:text-warm-foreground">
                      <Icon className="h-6 w-6" strokeWidth={1.75} />
                    </span>
                    <TextSlot
                      as="div"
                      target={field("branch_stats", s._id, "value")}
                      value={s.value}
                      className="font-display text-5xl text-brand-foreground sm:text-6xl lg:text-7xl"
                    />
                    <TextSlot
                      as="div"
                      target={field("branch_stats", s._id, "label")}
                      value={s.label}
                      className="mt-3 max-w-[14ch] text-[11px] font-bold uppercase tracking-[0.22em] text-brand-foreground/70"
                    />
                  </li>
                );
              })}
            </ul>
          </div>
        </section>
</RegionSlot>
      ) : null}

      {/* 10. MAPA A VZDÁLENOSTI */}
      <RegionSlot {...c.region("sekce.domu.mapa")}>
<section className={`${wrap} py-16 lg:py-20`}>
        <div className="grid gap-8 lg:grid-cols-[1fr_1.6fr]">
          <div>
            {c.t("domu.mapa.eyebrow", "Kde nás najdete", { as: "div", className: "text-[11px] font-bold uppercase tracking-[0.22em] text-warm-dark" })}
            {c.t("domu.mapa.nadpis", branch.city, { as: "h2", className: "font-display mt-3 text-2xl text-foreground sm:text-3xl" })}
            <p className="mt-3 text-sm leading-relaxed text-muted-foreground">
              {c.t("domu.mapa.ulice", branch.street)}
              <br />
              {c.t("domu.mapa.obec", `${branch.zip} ${branch.city}`)}
            </p>
            {distances.length > 0 ? (
              <div className="mt-6 space-y-3">
                {distances.map((d) => (
                  <div key={d.label} className="flex items-center justify-between rounded-xl border border-border bg-card px-5 py-3">
                    <span className="text-sm font-medium text-foreground">{d.label}</span>
                    <span className="font-display text-lg text-brand">{d.km} km</span>
                  </div>
                ))}
              </div>
            ) : null}
            <Link href="/kontakt" className="mt-6 inline-flex items-center gap-2 rounded-full bg-brand px-6 py-3 text-sm font-semibold text-brand-foreground hover:bg-brand-dark">
              {c.t("domu.mapa.cta", "Naplánovat návštěvu")}
            </Link>
          </div>
          <div className="overflow-hidden rounded-3xl ring-1 ring-border">
            <iframe
              title={`Mapa — ${branch.name}`}
              src={mapUrlFor(`${branch.name}, ${branch.street}, ${branch.zip} ${branch.city}`)}
              className="h-full min-h-[340px] w-full border-0"
              loading="lazy"
              referrerPolicy="no-referrer-when-downgrade"
            />
          </div>
        </div>
      </section>
</RegionSlot>

      {/* 11. AI CHAT */}
      <ChatCtaSection />

      {/* 12. ŽIVOT V CENTRU KAŽDÝ DEN (Facebook) */}
      {fbUrl && photos.length >= 6 ? (
        <RegionSlot {...c.region("sekce.domu.facebook")}>
<section className={`${wrap} py-16 lg:py-20`}>
          <div className="grid items-center gap-12 lg:grid-cols-2 lg:gap-16">
            <div className="grid grid-cols-3 grid-rows-2 gap-2">
              {photos.slice(0, 5).map((p, i) => (
                <div key={p.src + i} className="relative aspect-square overflow-hidden rounded-xl bg-muted">
                  <Image src={c.s(`domu.fb.${i}`, p.src)} alt={`Život v ${branch.short_name}`} fill sizes="30vw" className="object-cover" />
                  {c.img(`domu.fb.${i}`)}
                </div>
              ))}
              <a href={fbUrl} target="_blank" rel="noopener noreferrer" className="relative aspect-square overflow-hidden rounded-xl bg-muted">
                <Image src={c.s("domu.fb.5", photos[5].src)} alt="Aktivity v centru" fill sizes="30vw" className="object-cover brightness-50" />
                <div className="absolute inset-0 flex items-center justify-center">
                  <span className="font-display text-2xl font-bold text-white">+více</span>
                </div>
                {c.img("domu.fb.5")}
              </a>
            </div>
            <div>
              {c.t("domu.fb.eyebrow", "Aktuality", { as: "div", className: "text-[11px] font-bold uppercase tracking-[0.22em] text-warm-dark" })}
              {c.t("domu.fb.nadpis", "Život v centru každý den.", { as: "h2", className: "font-display mt-3 text-3xl text-foreground sm:text-4xl" })}
              {c.t("domu.fb.text", "Tvoření, zpívání, společné výlety i klidné chvíle — každý den u nás přináší něco nového. Sledujte nás na Facebooku a buďte v obraze o akcích, novinkách i každodenním dění.", { as: "p", className: "mt-4 text-base leading-relaxed text-muted-foreground" })}
              <a href={fbUrl} target="_blank" rel="noopener noreferrer" className="mt-6 inline-flex items-center gap-2 rounded-full bg-brand px-7 py-3.5 text-sm font-semibold text-brand-foreground shadow-md shadow-brand/20 hover:bg-brand-dark">
                {c.t("domu.fb.cta", "Sledujte dění v našem domově na Facebooku")} <ArrowUpRight className="h-4 w-4 shrink-0" />
              </a>
            </div>
          </div>
        </section>
</RegionSlot>
      ) : null}

      {/* 13. KONVERZE */}
      <RegionSlot {...c.region("sekce.domu.konverze")}>
<section className="bg-secondary/40">
        <div className={`${wrap} py-16`}>
          <div className="grid items-center gap-8 rounded-[2rem] bg-brand p-8 text-brand-foreground sm:p-12 lg:grid-cols-2">
            <div>
              {c.t("domu.konverze.nadpis", "Nejste si jistí, která služba je pro vás vhodná?", { as: "h2", className: "font-display text-3xl sm:text-4xl" })}
              {c.t("domu.konverze.text", "Nemusíte sami rozhodovat. Zavolejte nebo napište — vyslechneme vás, vysvětlíme možnosti a poradíme, jak dál.", { as: "p", className: "mt-4 block max-w-md text-brand-foreground/85" })}
              <div className="mt-6 flex flex-wrap gap-3">
                <Link href="/zadost-o-prijeti" className="rounded-full bg-brand-foreground px-6 py-3 text-sm font-bold uppercase tracking-wider text-brand hover:bg-warm hover:text-warm-foreground">{c.t("domu.konverze.cta1", "Jak probíhá přijetí")}</Link>
                <Link href="/kontakt" className="rounded-full border-2 border-brand-foreground/40 px-6 py-3 text-sm font-bold uppercase tracking-wider hover:border-warm hover:text-warm">{c.t("domu.konverze.cta2", "Kontaktovat")}</Link>
              </div>
            </div>
            <div className="rounded-2xl bg-brand-foreground/10 p-6 ring-1 ring-brand-foreground/20">
              {c.t("domu.konverze.role", branch.office_contact_name ? "Kontaktní osoba" : "Kontakt na pobočku", { as: "div", className: "text-[11px] font-bold uppercase tracking-[0.18em] text-warm" })}
              {c.t("domu.konverze.jmeno", branch.office_contact_name ?? branch.name, { as: "div", className: "font-display mt-2 text-xl" })}
              <div className="mt-4 space-y-1.5 text-sm">
                <a href={`tel:${(branch.office_contact_phone ?? branch.phone).replace(/\s/g, "")}`} className="flex items-center gap-2 font-semibold hover:text-warm"><Phone className="h-4 w-4" /> {branch.office_contact_phone ?? branch.phone}</a>
                <a href={`mailto:${branch.office_contact_email ?? branch.email}`} className="flex items-center gap-2 font-semibold hover:text-warm"><Mail className="h-4 w-4" /> {branch.office_contact_email ?? branch.email}</a>
              </div>
            </div>
          </div>
        </div>
      </section>
</RegionSlot>

      {/* 14. RYCHLÉ ODKAZY */}
      <RegionSlot {...c.region("sekce.domu.odkazy")}>
<section className={`${wrap} py-16`}>
        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
          {QUICKLINKS.map((q, i) => (
            <RegionSlot key={q.t} {...c.region(`domu.odkazy.${i}`)}>
              <Link href={q.href} className={`group block h-full rounded-2xl border p-5 transition-all hover:-translate-y-1 hover:shadow-md ${q.primary ? "border-transparent bg-brand text-brand-foreground" : "border-border bg-card hover:border-brand"}`}>
                <q.icon className={`h-6 w-6 ${q.primary ? "text-brand-foreground" : "text-brand"}`} strokeWidth={1.75} />
                {c.t(`domu.odkazy.${i}.nadpis`, q.t, { as: "h3", className: `font-display mt-3 text-lg ${q.primary ? "text-brand-foreground" : "text-foreground"}` })}
                {c.t(`domu.odkazy.${i}.text`, q.d, { as: "p", className: `mt-1.5 text-sm leading-relaxed ${q.primary ? "text-brand-foreground/85" : "text-muted-foreground"}` })}
              </Link>
            </RegionSlot>
          ))}
        </div>
      </section>
</RegionSlot>

      {/* 15. DOTACE */}
      {grants.length > 0 ? <GrantsSection grants={grants} /> : null}

      {/* 16. SPOLUPRACUJEME */}
      <RegionSlot {...c.region("sekce.domu.partneri")}>
<section className={`${wrap} py-12`}>
        <div className="text-center">
          {c.t("domu.partneri.nadpis", "Spolupracujeme s", { as: "div", className: "text-[11px] font-bold uppercase tracking-[0.22em] text-muted-foreground" })}
        </div>
        <div className="mt-8 flex flex-wrap items-center justify-center gap-4 sm:gap-6">
          {PARTNERS.map((p) => (
            <a key={p.file} href={p.href} target="_blank" rel="noopener noreferrer"
               className="flex h-20 w-40 items-center justify-center rounded-2xl border border-border bg-card px-5 transition-all hover:border-brand/30 hover:shadow-md">
              <div className="relative h-10 w-full">
                <Image src={`/images/loga/${p.file}`} alt={p.name} fill sizes="160px" className="object-contain opacity-70 transition-opacity hover:opacity-100" />
              </div>
            </a>
          ))}
        </div>
      </section>
</RegionSlot>

      {/* 17. ZÁVĚREČNÁ VÝZVA */}
      <RegionSlot {...c.region("sekce.domu.zaver")}>
<section className={`${wrap} pb-20`}>
        <div className="relative overflow-hidden rounded-[2.5rem] bg-gradient-to-br from-brand-dark via-brand to-brand-dark px-8 py-20 text-center text-brand-foreground sm:px-14">
          <div aria-hidden="true" className="pointer-events-none absolute -left-32 -top-32 h-96 w-96 rounded-full bg-warm/15 blur-3xl" />
          <div aria-hidden="true" className="pointer-events-none absolute -bottom-32 -right-32 h-96 w-96 rounded-full bg-brand-foreground/10 blur-3xl" />
          <div className="relative">
            {c.t("domu.zaver.eyebrow", "Připraveni pomoci", { as: "div", className: "text-[11px] font-bold uppercase tracking-[0.22em] text-warm" })}
            {c.t("domu.zaver.nadpis", "Jsme připraveni pomoci", { as: "h2", className: "font-display mx-auto mt-4 block max-w-2xl text-3xl leading-tight text-brand-foreground sm:text-4xl" })}
            {c.t("domu.zaver.text", "Ať už hledáte péči pro sebe, pro blízkého, nebo se potřebujete nejprve poradit, ozvěte se nám. Rádi vám představíme možnosti péče a pomůžeme s dalším postupem.", { as: "p", className: "mx-auto mt-4 block max-w-xl text-brand-foreground/85" })}
            <div className="mt-8 flex flex-wrap justify-center gap-3">
              <Link href="/zadost-o-prijeti" className="rounded-full bg-brand-foreground px-6 py-3 text-sm font-bold uppercase tracking-wider text-brand transition-colors hover:bg-warm hover:text-warm-foreground">{c.t("domu.zaver.cta1", "Jak požádat o přijetí")}</Link>
              <Link href="/kontakt" className="inline-flex items-center gap-2 rounded-full border-2 border-brand-foreground/40 px-6 py-3 text-sm font-bold uppercase tracking-wider text-brand-foreground transition-colors hover:border-warm hover:text-warm">{c.t("domu.zaver.cta2", "Kontaktovat nás")} <ArrowUpRight className="h-4 w-4" /></Link>
            </div>
          </div>
        </div>
      </section>
</RegionSlot>
    </>
  );
}
