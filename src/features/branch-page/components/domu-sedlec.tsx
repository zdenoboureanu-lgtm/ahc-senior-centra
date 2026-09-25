import Image from "next/image";
import Link from "next/link";
import {
  ArrowRight, ArrowUpRight, Phone, Mail, Quote,
  Stethoscope, Home, Trees, HeartHandshake, ShieldCheck, UserCheck,
  ClipboardList, Contact as ContactIcon, FileText, Briefcase,
  BedDouble, MapPin,
} from "lucide-react";
import { ChatCtaSection } from "@/features/branch-home/components/chat-cta-section";
import { GrantsSection } from "@/features/branch-home/components/eu-grant-section";
import { SedlecGallery } from "./sedlec-gallery";
import type { Branch } from "@/convex/lib/types";
import type { BranchGrant } from "@/convex/lib/types";
import * as Icons from "lucide-react";
import type { LucideIcon } from "lucide-react";
import type { BranchStat } from "@/features/branch-home/components/stats-banner";
import { makeCopy, type CopyProps } from "@/features/inline-edit/copy";
import { RegionSlot } from "@/features/inline-edit/components/content-slot";

const MAP_URL = "https://www.google.com/maps?q=" + encodeURIComponent("AHC Centrum následné péče Sedlec-Prčice, Vítkovo náměstí 3, Sedlec-Prčice") + "&hl=cs&z=14&output=embed";

const wrap = "mx-auto max-w-[1320px] px-6 lg:px-10";
const P = "/images/sedlec";

const VALUES = [
  { icon: ShieldCheck, t: "Důstojnost a respekt", d: "Nasloucháme člověku, respektujeme jeho rozhodnutí a vnímáme jeho životní příběh." },
  { icon: Stethoscope, t: "Odbornost", d: "Propojujeme zdravotní, ošetřovatelskou, rehabilitační a sociální péči podle konkrétních potřeb." },
  { icon: UserCheck, t: "Podpora soběstačnosti", d: "Pomáháme tam, kde je pomoc potřeba, a podporujeme vše, co člověk stále dokáže sám." },
  { icon: HeartHandshake, t: "Blízkost rodiny", d: "Rodinu a blízké vnímáme jako důležitou součást života pacienta nebo klienta." },
];

const QUICKLINKS = [
  { icon: ClipboardList, t: "Žádost o přijetí", d: "Jaké dokumenty potřebujete a jak postupovat.", href: "/zadost-o-prijeti", primary: true },
  { icon: ContactIcon, t: "Kontakty", d: "Vedení, sociální pracovníci i jednotlivá pracoviště.", href: "/kontakt" },
  { icon: FileText, t: "Dokumenty", d: "Formuláře, žádosti a dokumenty na jednom místě.", href: "/dokumenty" },
  { icon: Briefcase, t: "Kariéra", d: "Hledáte práci, která má smysl? Poznejte naše týmy.", href: "/kariera" },
];

const ORIENTACE = [
  { icon: Stethoscope, t: "Následná lůžková péče", d: "Doléčení, ošetřovatelská péče a rehabilitace po hospitalizaci, operaci nebo úrazu." },
  { icon: Home, t: "Domov pro seniory", d: "Bezpečné a důstojné zázemí pro seniory, kteří potřebují pravidelnou pomoc." },
  { icon: Trees, t: "Sedlec-Prčice", d: "Klidné prostředí, odborný tým a péče s respektem k člověku i jeho rodině." },
];

const SLUZBY = [
  { t: "Potřebuji následnou lůžkovou péči", d: "Pomáháme pacientům, jejichž stav již nevyžaduje akutní léčbu, ale stále potřebují doléčení, ošetřovatelskou péči nebo rehabilitaci. Společně pracujeme na stabilizaci stavu, obnovení síly a soběstačnosti.", img: `${P}/pokoj-1.jpg` },
  { t: "Hledám domov pro blízkého", d: "Poskytujeme bezpečné zázemí seniorům od 65 let, kteří potřebují pravidelnou pomoc. Pomáháme při každodenních činnostech a podporujeme jejich schopnosti, zvyklosti, vztahy i možnost rozhodovat o vlastním životě.", img: `${P}/exterier-3.jpg` },
];

const ZIVOT = [
  {
    img: `${P}/spolecna.jpg`,
    tag: "Každodenní život",
    title: "Jsme místo, kde se dál žije",
    desc: "Někdo se těší na společné zpívání, tvoření nebo pečení, jiný dává přednost knížce, rozhovoru nebo odpočinku. Pomáháme zachovat zájmy, vztahy a radost z obyčejných věcí.",
    href: "/o-nas",
    cta: "Podívejte se, jak se u nás žije",
  },
  {
    img: `${P}/pokoj-3.jpg`,
    tag: "Domov pro seniory",
    title: "Místo, které si mohou klienti přizpůsobit",
    desc: "Bezbariérové prostředí, dvoulůžkové pokoje s vlastním sociálním zařízením a společné prostory pro setkávání, aktivity i chvíle s rodinou.",
    href: "/o-nas",
    cta: "Poznat naše zařízení",
  },
];

const VZDALENOSTI = [
  { label: "Tábor", km: "27 km" },
  { label: "Benešov", km: "32 km" },
  { label: "Praha", km: "75 km" },
];

const PARTNERS = [
  { name: "Sestřička.cz", file: "sestricka.png", href: "https://www.sestricka.cz/" },
  { name: "Most k domovu", file: "mostkdomovu.png", href: "https://www.mostkdomovu.cz/" },
  { name: "SestřičkaSOS", file: "sestrickasos.png", href: "https://www.sestrickasos.cz/" },
  { name: "e-Sestřička", file: "e-sestricka.png", href: "https://www.e-sestricka.cz/" },
];

function resolveStatIcon(name?: string): LucideIcon {
  if (!name) return Icons.Sparkles;
  const found = (Icons as unknown as Record<string, LucideIcon | undefined>)[name];
  return found ?? Icons.Sparkles;
}

const DEFAULT_STATS = [
  { value: "54", label: "lůžek domova pro seniory", Icon: Home },
  { value: "27", label: "km od Tábora", Icon: MapPin },
  { value: "24", label: "hodin denně péče", Icon: Stethoscope },
  { value: "2", label: "druhy péče pod jednou střechou", Icon: BedDouble },
];

/** Bespoke domovská stránka pro Sedlec-Prčice dle obsahové specifikace. */
export function DomuSedlec({
  branch,
  grants,
  stats,
  copy,
  editBranchId,
}: {
  branch: Branch | null;
  grants: BranchGrant[];
  stats?: BranchStat[];
} & CopyProps) {
  const c = makeCopy({ copy, editBranchId });
  const facebookUrl = branch?.facebook_url;
  const fbUrl = facebookUrl ?? "https://www.facebook.com/ahcsedlecprcice";
  // Sekce „V číslech" se řídí administrací; bez ní zůstávají doložené výchozí údaje.
  const statItems =
    stats && stats.length > 0
      ? stats.map((s) => ({ value: s.value, label: s.label, Icon: resolveStatIcon(s.icon) }))
      : DEFAULT_STATS;

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

  return (
    <>
      {/* 1. HERO */}
      <section className="relative overflow-hidden bg-gradient-to-b from-brand-light/40 to-background">
        <div className={`${wrap} grid items-center gap-10 py-14 lg:grid-cols-2 lg:py-20`}>
          <div>
            <div className="flex items-center gap-3 text-xs font-bold uppercase tracking-[0.22em] text-brand">
              <span className="h-px w-10 bg-warm" /> {c.t("domu.hero.eyebrow", "Sedlec-Prčice")}
              <span className="text-muted-foreground/50">·</span>
              {c.t("domu.hero.eyebrow2", "Centrum následné péče", { as: "span", className: "text-muted-foreground" })}
            </div>
            <h1 className="font-display mt-5 text-4xl leading-[1.08] text-foreground sm:text-5xl lg:text-[3.4rem]">
              {c.t("domu.hero.title", "Péče, ve které je člověk")}{" "}
              {c.t("domu.hero.title-zvyraznene", "vždy na prvním místě", { as: "span", className: "text-brand" })}
            </h1>
            {c.t(
              "domu.hero.text",
              "Poskytujeme odbornou zdravotní a sociální péči lidem, kteří potřebují čas, podporu a bezpečné prostředí. Pomáháme pacientům při doléčení a návratu k soběstačnosti a seniorům vytváříme místo, kde mohou prožívat každý den důstojně.",
              { as: "p", className: "mt-6 max-w-xl text-lg leading-[1.7] text-muted-foreground" }
            )}
            <div className="mt-8 flex flex-wrap gap-3">
              <Link href="/zadost-o-prijeti" className="inline-flex items-center gap-2 rounded-full bg-brand px-7 py-3.5 text-sm font-semibold text-brand-foreground shadow-md shadow-brand/15 transition-colors hover:bg-brand-dark">
                {c.t("domu.hero.cta1", "Jak požádat o přijetí")} <ArrowRight className="h-4 w-4" />
              </Link>
              <Link href="/sluzby" className="inline-flex items-center gap-2 rounded-full border border-border bg-background px-6 py-3.5 text-sm font-semibold text-foreground hover:border-brand hover:text-brand">{c.t("domu.hero.cta2", "Poznat naše služby")}</Link>
              <Link href="/kontakt" className="inline-flex items-center gap-2 rounded-full px-5 py-3.5 text-sm font-semibold text-foreground/70 hover:text-brand">{c.t("domu.hero.cta3", "Kontaktovat nás")}</Link>
            </div>
          </div>
          {pic("domu.hero.foto", `${P}/budova.jpg`, "AHC Centrum následné péče Sedlec-Prčice", "aspect-[4/3] shadow-lg lg:aspect-[5/4]")}
        </div>
      </section>

      {/* 2. RYCHLÁ ORIENTACE */}
      <RegionSlot {...c.region("sekce.domu.orientace")}>
<section className={`${wrap} pb-4`}>
        <div className="grid gap-4 rounded-3xl border border-border bg-card p-6 sm:grid-cols-3">
          {ORIENTACE.map((o, i) => (
            <RegionSlot key={o.t} {...c.region(`domu.orientace.${i}`)}>
            <div className="flex items-start gap-3">
              <o.icon className="mt-0.5 h-6 w-6 shrink-0 text-brand" strokeWidth={1.75} />
              <div>
                {c.t(`domu.orientace.${i}.nadpis`, o.t, { as: "div", className: "font-display text-base text-foreground" })}
                {c.t(`domu.orientace.${i}.text`, o.d, { as: "p", className: "mt-1 text-sm leading-relaxed text-muted-foreground" })}
              </div>
            </div>
            </RegionSlot>
          ))}
        </div>
      </section>
</RegionSlot>

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
        {pic("domu.rozhodnuti.foto", `${P}/exterier-1.jpg`, "Podpora a bezpečí", "aspect-[4/3]")}
      </section>
</RegionSlot>

      {/* 4. VYBERTE SLUŽBU */}
      <RegionSlot {...c.region("sekce.domu.sluzby")}>
<section className="bg-secondary/40">
        <div className={`${wrap} py-16 lg:py-20`}>
          {c.t("domu.sluzby.nadpis", "Vyberte službu podle své situace", { as: "h2", className: "font-display block text-center text-3xl text-foreground sm:text-4xl" })}
          <div className="mt-10 grid gap-6 md:grid-cols-2">
            {SLUZBY.map((s, i) => (
              <RegionSlot key={s.t} {...c.region(`domu.sluzby.${i}`)}>
              <div className="overflow-hidden rounded-3xl border border-border bg-card">
                {pic(`domu.sluzby.${i}.foto`, s.img, s.t, "aspect-[16/9]", "rounded-none")}
                <div className="p-7">
                  {c.t(`domu.sluzby.${i}.nadpis`, s.t, { as: "h3", className: "font-display text-xl text-foreground sm:text-2xl" })}
                  {c.t(`domu.sluzby.${i}.text`, s.d, { as: "p", className: "mt-2 text-[15px] leading-relaxed text-muted-foreground" })}
                  <div className="mt-5 flex flex-wrap gap-2">
                    <Link href="/sluzby" className="rounded-full bg-brand px-5 py-2.5 text-xs font-bold uppercase tracking-wider text-brand-foreground hover:bg-brand-dark">Více o službě</Link>
                    <Link href="/zadost-o-prijeti" className="rounded-full border border-border px-5 py-2.5 text-xs font-bold uppercase tracking-wider text-foreground hover:border-brand hover:text-brand">Jak požádat</Link>
                  </div>
                </div>
              </div>
              </RegionSlot>
            ))}
          </div>
        </div>
      </section>
</RegionSlot>

      {/* 5. NA ČEM NÁM ZÁLEŽÍ */}
      <RegionSlot {...c.region("sekce.domu.hodnoty")}>
<section className={`${wrap} py-16 lg:py-20`}>
        {c.t("domu.hodnoty.nadpis", "Na čem nám záleží", { as: "h2", className: "font-display block text-center text-3xl text-foreground sm:text-4xl" })}
        <div className="mt-10 grid gap-5 sm:grid-cols-2 lg:grid-cols-4">
          {VALUES.map((v, i) => (
            <RegionSlot key={v.t} {...c.region(`domu.hodnoty.${i}`)}>
            <div className="rounded-2xl border border-border bg-card p-6">
              <span className="flex h-11 w-11 items-center justify-center rounded-2xl bg-brand-light text-brand"><v.icon className="h-5 w-5" strokeWidth={1.75} /></span>
              {c.t(`domu.hodnoty.${i}.nadpis`, v.t, { as: "h3", className: "font-display mt-4 text-lg text-foreground" })}
              {c.t(`domu.hodnoty.${i}.text`, v.d, { as: "p", className: "mt-2 text-sm leading-relaxed text-muted-foreground" })}
            </div>
            </RegionSlot>
          ))}
        </div>
        <div className="mt-8 text-center">
          <Link href="/o-nas" className="inline-flex items-center gap-1.5 text-sm font-bold uppercase tracking-wider text-brand hover:gap-2.5">{c.t("domu.hodnoty.cta", "Více o našem přístupu")} <ArrowRight className="h-4 w-4" /></Link>
        </div>
      </section>
</RegionSlot>

      {/* 6. ŽIVOT U NÁS */}
      <RegionSlot {...c.region("sekce.domu.zivot")}>
<section className="bg-secondary/40">
        <div className={`${wrap} py-16 lg:py-20`}>
          <div className="text-center">
            {c.t("domu.zivot.nadpis", "Život, který má každý den svůj rytmus", { as: "h2", className: "font-display text-3xl text-foreground sm:text-4xl" })}
            {c.t(
              "domu.zivot.text",
              "Každý den může vypadat jinak. Někdo začíná rehabilitačním cvičením, jiný si rád v klidu vypije ranní kávu. Aktivity nejsou povinností — jsou nabídkou, jak si zachovat zájmy, schopnosti a radost z obyčejných věcí.",
              { as: "p", className: "mx-auto mt-4 block max-w-2xl text-base leading-relaxed text-muted-foreground" }
            )}
          </div>
          <div className="mt-10 grid gap-5 lg:grid-cols-2">
            {ZIVOT.map((z, i) => (
              <RegionSlot key={z.title} {...c.region(`domu.zivot.${i}`)}>
              <div className="group relative overflow-hidden rounded-3xl">
                {pic(`domu.zivot.${i}.foto`, z.img, z.title, "aspect-[4/3] transition-transform duration-500 group-hover:scale-[1.03]", "rounded-none", false)}
                <div className="pointer-events-none absolute inset-0 bg-gradient-to-t from-brand-dark via-brand-dark/65 to-brand-dark/5" />
                {c.img(`domu.zivot.${i}.foto`)}
                <div className="absolute bottom-0 left-0 right-0 z-30 p-7 sm:p-8">
                  {c.t(`domu.zivot.${i}.stitek`, z.tag, { as: "div", className: "text-[10px] font-bold uppercase tracking-[0.2em] text-warm" })}
                  {c.t(`domu.zivot.${i}.nadpis`, z.title, { as: "h3", className: "font-display mt-2 text-xl text-white sm:text-2xl" })}
                  {c.t(`domu.zivot.${i}.text`, z.desc, { as: "p", className: "mt-2 text-sm leading-relaxed text-white/80" })}
                  <Link href={z.href} className="mt-5 inline-flex items-center gap-2 rounded-full bg-white/15 px-5 py-2.5 text-xs font-bold uppercase tracking-wider text-white backdrop-blur-sm transition-colors hover:bg-white/25">
                    {c.t(`domu.zivot.${i}.cta`, z.cta)} <ArrowRight className="h-3.5 w-3.5" />
                  </Link>
                </div>
              </div>
              </RegionSlot>
            ))}
          </div>
        </div>
      </section>
</RegionSlot>

      {/* 8. PŘÍBĚH */}
      <RegionSlot {...c.region("sekce.domu.pribeh")}>
<section className={`${wrap} py-16`}>
        <figure className="mx-auto max-w-3xl rounded-3xl bg-card p-8 text-center ring-1 ring-border sm:p-12">
          <Quote className="mx-auto h-8 w-8 text-warm" strokeWidth={1.5} />
          {c.t("domu.pribeh.citat", "„Viděli jsme pokrok každý týden.“", { as: "blockquote", className: "font-display mt-4 block text-2xl leading-snug text-foreground sm:text-3xl" })}
          {c.t("domu.pribeh.text", "Maminka po hospitalizaci potřebovala odbornou následnou péči. Byli jsme překvapeni, jaký pokrok udělala během několika týdnů. Děkujeme za odbornost i lidský přístup celého týmu.", { as: "p", className: "mx-auto mt-4 block max-w-xl text-base leading-relaxed text-muted-foreground" })}
          {c.t("domu.pribeh.autor", "— Alena K., dcera pacientky", { as: "figcaption", className: "mt-4 text-sm font-semibold text-muted-foreground" })}
          <Link href="/o-nas#pribehy" className="mt-6 inline-flex items-center gap-1.5 text-xs font-bold uppercase tracking-wider text-brand hover:gap-2.5">Poznat další příběhy <ArrowRight className="h-3.5 w-3.5" /></Link>
        </figure>
      </section>
</RegionSlot>

      {/* FOTOGALERIE — FACILITIES STYLE */}
      <SedlecGallery copy={copy} editBranchId={editBranchId} />

      {/* NAŠE CENTRUM V KOSTCE */}
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
            {statItems.map((s) => {
              const Icon = s.Icon;
              return (
                <li key={`${s.label}-${s.value}`} className="group flex flex-col items-center text-center">
                  <span className="mb-6 flex h-14 w-14 items-center justify-center rounded-2xl bg-brand-foreground/10 text-warm transition-all group-hover:bg-warm group-hover:text-warm-foreground">
                    <Icon className="h-6 w-6" strokeWidth={1.75} />
                  </span>
                  <div className="font-display text-5xl text-brand-foreground sm:text-6xl lg:text-7xl">{s.value}</div>
                  <div className="mt-3 max-w-[14ch] text-[11px] font-bold uppercase tracking-[0.22em] text-brand-foreground/70">{s.label}</div>
                </li>
              );
            })}
          </ul>
        </div>
      </section>
</RegionSlot>

      {/* MAPA A VZDÁLENOSTI */}
      <RegionSlot {...c.region("sekce.domu.mapa")}>
<section className={`${wrap} py-16 lg:py-20`}>
        <div className="grid gap-8 lg:grid-cols-[1fr_1.6fr]">
          <div>
            <div className="text-[11px] font-bold uppercase tracking-[0.22em] text-warm-dark">Kde nás najdete</div>
            {c.t("domu.mapa.nadpis", "Sedlec-Prčice", { as: "h2", className: "font-display mt-3 text-2xl text-foreground sm:text-3xl" })}
            <p className="mt-3 text-sm leading-relaxed text-muted-foreground">
              {c.t("domu.mapa.ulice", "Vítkovo náměstí 3")}
              <br />
              {c.t("domu.mapa.obec", "257 91 Sedlec-Prčice")}
            </p>
            <div className="mt-6 space-y-3">
              {VZDALENOSTI.map((d, i) => (
                <div key={d.label} className="flex items-center justify-between rounded-xl border border-border bg-card px-5 py-3">
                  {c.t(`domu.mapa.vzdalenost.${i}.mesto`, d.label, { as: "span", className: "text-sm font-medium text-foreground" })}
                  {c.t(`domu.mapa.vzdalenost.${i}.km`, d.km, { as: "span", className: "font-display text-lg text-brand" })}
                </div>
              ))}
            </div>
            <Link href="/kontakt" className="mt-6 inline-flex items-center gap-2 rounded-full bg-brand px-6 py-3 text-sm font-semibold text-brand-foreground hover:bg-brand-dark">
              Naplánovat návštěvu
            </Link>
          </div>
          <div className="overflow-hidden rounded-3xl ring-1 ring-border">
            <iframe
              title="Mapa Sedlec-Prčice"
              src={MAP_URL}
              className="h-full min-h-[340px] w-full border-0"
              loading="lazy"
              referrerPolicy="no-referrer-when-downgrade"
            />
          </div>
        </div>
      </section>
</RegionSlot>

      {/* AI CHAT */}
      <ChatCtaSection />

      {/* ŽIVOT V CENTRU KAŽDÝ DEN */}
      <RegionSlot {...c.region("sekce.domu.facebook")}>
<section className={`${wrap} py-16 lg:py-20`}>
        <div className="grid items-center gap-12 lg:grid-cols-2 lg:gap-16">
          {/* Fotogrid */}
          <div className="grid grid-cols-3 grid-rows-2 gap-2">
            {["fb-01", "fb-02", "fb-03", "fb-04", "fb-05"].map((g) => (
              <div key={g} className="relative aspect-square overflow-hidden rounded-xl bg-muted">
                <Image src={c.s(`domu.fb.${g}`, `${P}/${g}.jpg`)} alt="Život v AHC Centru Sedlec-Prčice" fill sizes="30vw" className="object-cover" />
                {c.img(`domu.fb.${g}`)}
              </div>
            ))}
            <a href={fbUrl} target="_blank" rel="noopener noreferrer" className="relative aspect-square overflow-hidden rounded-xl bg-muted">
              <Image src={c.s("domu.fb.fb-06", `${P}/fb-06.jpg`)} alt="Aktivity v centru" fill sizes="30vw" className="object-cover brightness-50" />
              <div className="absolute inset-0 flex items-center justify-center">
                <span className="font-display text-2xl font-bold text-white">+více</span>
              </div>
              {c.img("domu.fb.fb-06")}
            </a>
          </div>

          {/* Text */}
          <div>
            <div className="text-[11px] font-bold uppercase tracking-[0.22em] text-warm-dark">Aktuality</div>
            {c.t("domu.fb.nadpis", "Život v centru každý den.", { as: "h2", className: "font-display mt-3 text-3xl text-foreground sm:text-4xl" })}
            {c.t(
              "domu.fb.text",
              "Tvoření, zpívání, společné výlety i klidné chvíle — každý den u nás přináší něco nového. Sledujte nás na Facebooku a buďte v obraze o akcích, novinkách i každodenním dění.",
              { as: "p", className: "mt-4 text-base leading-relaxed text-muted-foreground" }
            )}
            <a
              href={fbUrl}
              target="_blank"
              rel="noopener noreferrer"
              className="mt-6 inline-flex items-center gap-2 rounded-full bg-brand px-7 py-3.5 text-sm font-semibold text-brand-foreground shadow-md shadow-brand/20 hover:bg-brand-dark"
            >
              {c.t("domu.fb.cta", "Sledujte dění v našem domově na Facebooku")} <ArrowUpRight className="h-4 w-4 shrink-0" />
            </a>
          </div>
        </div>
      </section>
</RegionSlot>

      {/* 9. KONVERZE */}
      <RegionSlot {...c.region("sekce.domu.konverze")}>
<section className="bg-secondary/40">
        <div className={`${wrap} py-16`}>
          <div className="grid items-center gap-8 rounded-[2rem] bg-brand p-8 text-brand-foreground sm:p-12 lg:grid-cols-2">
            <div>
              {c.t("domu.konverze.nadpis", "Nejste si jistí, která služba je pro vás vhodná?", { as: "h2", className: "font-display text-3xl sm:text-4xl" })}
              {c.t("domu.konverze.text", "Nemusíte sami rozhodovat. Zavolejte nebo napište našim sociálním pracovnicím — vyslechnou vás, vysvětlí možnosti a poradí, jak dál.", { as: "p", className: "mt-4 block max-w-md text-brand-foreground/85" })}
              <div className="mt-6 flex flex-wrap gap-3">
                <Link href="/zadost-o-prijeti" className="rounded-full bg-brand-foreground px-6 py-3 text-sm font-bold uppercase tracking-wider text-brand hover:bg-warm hover:text-warm-foreground">Jak probíhá přijetí</Link>
                <Link href="/kontakt" className="rounded-full border-2 border-brand-foreground/40 px-6 py-3 text-sm font-bold uppercase tracking-wider hover:border-warm hover:text-warm">Kontaktovat</Link>
              </div>
            </div>
            <div className="rounded-2xl bg-brand-foreground/10 p-6 ring-1 ring-brand-foreground/20">
              {c.t("domu.konverze.role", "Sociální pracovnice", { as: "div", className: "text-[11px] font-bold uppercase tracking-[0.18em] text-warm" })}
              {c.t("domu.konverze.jmeno", "Veronika Pištěková", { as: "div", className: "font-display mt-2 text-xl" })}
              {c.t("domu.konverze.hodiny", "Po–Pá 7:00–15:30", { as: "div", className: "text-sm text-brand-foreground/80" })}
              <div className="mt-4 space-y-1.5 text-sm">
                <a href="tel:+420702078993" className="flex items-center gap-2 font-semibold hover:text-warm"><Phone className="h-4 w-4" /> +420 702 078 993</a>
                <a href="mailto:veronika.pistekova@ahc.cz" className="flex items-center gap-2 font-semibold hover:text-warm"><Mail className="h-4 w-4" /> veronika.pistekova@ahc.cz</a>
              </div>
            </div>
          </div>
        </div>
      </section>
</RegionSlot>

      {/* 10. RYCHLÉ ODKAZY */}
      <RegionSlot {...c.region("sekce.domu.odkazy")}>
<section className={`${wrap} py-16`}>
        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
          {QUICKLINKS.map((q, i) => (
            <RegionSlot key={q.t} className="h-full" {...c.region(`domu.odkazy.${i}`)}>
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

      {/* DOTACE */}
      {grants.length > 0 ? <GrantsSection grants={grants} /> : null}

      {/* SPOLUPRACUJEME */}
      <RegionSlot {...c.region("sekce.domu.partneri")}>
<section className={`${wrap} py-12`}>
        <div className="text-center">
          <div className="text-[11px] font-bold uppercase tracking-[0.22em] text-muted-foreground">Spolupracujeme s</div>
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

      {/* 11. ZÁVĚREČNÁ VÝZVA */}
      <RegionSlot {...c.region("sekce.domu.zaver")}>
<section className={`${wrap} pb-20`}>
        <div className="relative overflow-hidden rounded-[2.5rem] bg-gradient-to-br from-brand-dark via-brand to-brand-dark px-8 py-20 text-center text-brand-foreground sm:px-14">
          <div aria-hidden="true" className="pointer-events-none absolute -left-32 -top-32 h-96 w-96 rounded-full bg-warm/15 blur-3xl" />
          <div aria-hidden="true" className="pointer-events-none absolute -bottom-32 -right-32 h-96 w-96 rounded-full bg-brand-foreground/10 blur-3xl" />
          <div className="relative">
            {c.t("domu.zaver.eyebrow", "Připraveni pomoci", { as: "div", className: "text-[11px] font-bold uppercase tracking-[0.22em] text-warm" })}
            {c.t("domu.zaver.nadpis", "Jsme připraveni pomoci", { as: "h2", className: "font-display mx-auto mt-4 block max-w-2xl text-3xl leading-tight text-brand-foreground sm:text-4xl" })}
            {c.t("domu.zaver.text", "Ať už hledáte následnou péči pro sebe, domov pro blízkého, nebo se potřebujete nejprve poradit, ozvěte se nám. Rádi vám představíme možnosti péče a pomůžeme s dalším postupem.", { as: "p", className: "mx-auto mt-4 block max-w-xl text-brand-foreground/85" })}
            <div className="mt-8 flex flex-wrap justify-center gap-3">
              <Link href="/zadost-o-prijeti" className="rounded-full bg-brand-foreground px-6 py-3 text-sm font-bold uppercase tracking-wider text-brand transition-colors hover:bg-warm hover:text-warm-foreground">Jak požádat o přijetí</Link>
              <Link href="/kontakt" className="inline-flex items-center gap-2 rounded-full border-2 border-brand-foreground/40 px-6 py-3 text-sm font-bold uppercase tracking-wider text-brand-foreground transition-colors hover:border-warm hover:text-warm">Kontaktovat nás <ArrowUpRight className="h-4 w-4" /></Link>
            </div>
          </div>
        </div>
      </section>
</RegionSlot>
    </>
  );
}
