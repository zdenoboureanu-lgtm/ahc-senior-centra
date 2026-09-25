import Image from "next/image";
import Link from "next/link";
import {
  ArrowRight, ChevronDown, Phone, Mail, HeartHandshake, UserCheck, Users,
  Sparkles, GraduationCap, Building2, Heart, Briefcase, CalendarDays, Send,
  MapPin, Stethoscope,
} from "lucide-react";
import * as Icons from "lucide-react";
import type { LucideIcon } from "lucide-react";
import { TeamioWidget } from "./teamio-widget";
import { makeCopy, type CopyHelpers, type CopyProps } from "@/features/inline-edit/copy";
import {
  RegionSlot,
  TextSlot,
} from "@/features/inline-edit/components/content-slot";
import type { EditTarget } from "@/features/inline-edit/edit-mode-context";
import type { Branch, BranchService } from "@/convex/lib/types";

/**
 * NEPOUŽÍVÁ SE. Kariéra běží na původní společné stránce
 * (`app/(public)/kariera/page.tsx` — CareerHero, WhyAhcSection a spol.).
 *
 * Tahle varianta překlápěla Kariéru do vizuálu Sedlce-Prčice a po nasazení
 * se od ní ustoupilo. Necháváme ji tu, kdyby se k ní někdo chtěl vrátit;
 * napojí se zpátky tím, že ji `kariera/page.tsx` zase zavolá.
 */

const wrap = "mx-auto max-w-[1320px] px-6 lg:px-10";
const CV_MAILTO = "mailto:kariera@ahc.cz?subject=";

const WHY = [
  { icon: Heart, t: "Práce má skutečný smysl", d: "Výsledkem může být stabilnější zdravotní stav, bezpečně zvládnutý den, větší soběstačnost nebo chvíle, kdy člověk ví, že na svou situaci není sám." },
  { icon: UserCheck, t: "Poznáváme člověka, nejen diagnózu", d: "Zajímají nás životní příběhy, zvyklosti, potřeby a přání pacientů i klientů." },
  { icon: HeartHandshake, t: "Propojujeme zdravotní a sociální péči", d: "Na jednom pracovišti spolupracují sestry, pracovníci v sociálních službách, rehabilitační i sociální pracovníci a další profese." },
  { icon: Sparkles, t: "Každý den je jiný", d: "Práce přináší pravidelný režim i situace, které vyžadují pozornost, samostatnost, empatii a praktická řešení." },
  { icon: GraduationCap, t: "Můžeme se profesně rozvíjet", d: "Podporujeme odborné vzdělávání, získávání zkušeností a profesní i osobní růst." },
  { icon: Building2, t: "Máme stabilní zázemí", d: "Jsme součástí skupiny AHC, která propojuje pobytové, zdravotní, sociální a terénní služby po celé ČR." },
];

const DUVODY = ["Smysluplnost práce", "Vztahy s pacienty a rodinami", "Podpora kolegů", "Spolupráce profesí", "Rozmanitost dne", "Odborný růst", "Stabilní zázemí", "Blízkost přírody"];

const VALUES = [
  { t: "Odbornost", d: "Pracujeme podle platných postupů, sdílíme zkušenosti a průběžně se vzděláváme." },
  { t: "Respekt", d: "Každého vnímáme jako jedinečnou osobnost s vlastními potřebami a životním příběhem." },
  { t: "Spolupráce", d: "Kvalitní péče nevzniká prací jednoho člověka. Informace sdílíme napříč profesemi." },
  { t: "Odpovědnost", d: "Naše práce ovlivňuje zdraví, bezpečí, důstojnost i důvěru pacientů a klientů." },
  { t: "Lidskost", d: "Odborná péče je samozřejmostí. Stejně důležité jsou trpělivost, empatie a způsob jednání." },
];

const PROFESSIONS = [
  "Všeobecné a praktické sestry", "Pracovníci v sociálních službách", "Sanitáři a ošetřovatelé",
  "Fyzioterapeuti a rehabilitační pracovníci", "Sociální pracovníci", "Aktivizační pracovníci",
  "Lékaři", "Pracovníci stravovacího provozu", "Úklid a prádelna",
  "Administrativní pracovníci", "Údržba a provoz", "Vedoucí jednotlivých úseků",
];

const BENEFITS = [
  { icon: CalendarDays, t: "5 týdnů dovolené", d: "Více času na odpočinek, rodinu a načerpání sil." },
  { icon: GraduationCap, t: "Podpora vzdělávání", d: "Odborné kurzy, školení a možnosti rozvoje podle pozice." },
  { icon: Building2, t: "Stabilní zázemí", d: "Práce ve skupině AHC, která dlouhodobě působí v péči." },
  { icon: Users, t: "Zkušený tým", d: "Možnost učit se od kolegů z různých profesí a sdílet zkušenosti." },
  { icon: Sparkles, t: "Zaměstnanecké výhody", d: "Další benefity podle pozice, úvazku a aktuální nabídky." },
  { icon: HeartHandshake, t: "Podpora při péči o blízké", d: "Díky síti služeb AHC snáze získáte informace, pokud sami řešíte péči v rodině." },
];

const STORIES = [
  { role: "Zdravotní sestra v následné péči", h: "Důležité je všimnout si i malé změny", d: "O odborné péči, sledování zdravotního stavu a situacích, kdy rychlá reakce sestry ovlivnila další průběh léčby." },
  { role: "Pracovnice v sociálních službách", h: "Pomáhat neznamená udělat všechno za člověka", d: "O trpělivosti, každodenním kontaktu s klienty a podpoře činností, které člověk stále zvládne sám." },
  { role: "Fyzioterapeut", h: "I jeden bezpečný krok může být velkým úspěchem", d: "O rehabilitaci, motivaci a individuálních cílech pacientů po nemoci nebo delší hospitalizaci." },
  { role: "Pracovník provozu", h: "Kvalitní péče vzniká i mimo pokoje pacientů", d: "O člověku, jehož práce není vždy vidět, ale bez kterého by zařízení nemohlo každý den fungovat." },
];

const STEPS = [
  { n: "1", t: "Pošlete nám životopis", d: "Vyberte si konkrétní pozici nebo nám napište obecně, o jakou práci máte zájem." },
  { n: "2", t: "Ozveme se vám", d: "Pokud váš profil odpovídá pozici, spojí se s vámi personalistka nebo vedoucí úseku." },
  { n: "3", t: "Setkáme se osobně", d: "Představíme vám pracoviště, náplň, směny a tým. Zajímat nás bude i vaše zkušenost a očekávání." },
  { n: "4", t: "Domluvíme další postup", d: "Pokud si budeme vzájemně vyhovovat, dohodneme termín nástupu a praktické náležitosti." },
];

const FAQ: [string, string][] = [
  ["Mohu se ozvat, i když právě nevidím vhodnou pozici?", "Ano. Pošlete nám životopis a informaci, o jakou práci máte zájem."],
  ["Nabízíte plné i zkrácené úvazky?", "Možnosti se liší podle pozice a potřeby oddělení. Všechny varianty uvádíme v inzerátu."],
  ["Mohu se nejprve přijít podívat?", "U vybraných pozic je možné domluvit osobní setkání a představení pracoviště."],
  ["Jaké vzdělání potřebuji?", "Liší se podle pozice. Přesné podmínky najdete vždy v konkrétní pracovní nabídce."],
  ["Nabízíte odborné vzdělávání?", "Ano, podporujeme profesní rozvoj a vzdělávání podle pozice a potřeb pracoviště."],
  ["Kam mám poslat životopis?", "Personálnímu oddělení pobočky nebo na obecný kariérní kontakt kariera@ahc.cz."],
];

function Accordion({ c, ckey, title, children }: { c: CopyHelpers; ckey: string; title: string; children: React.ReactNode }) {
  return (
    <details className="group rounded-2xl border border-border bg-card p-5 [&_summary]:list-none">
      <summary className="flex cursor-pointer items-center justify-between gap-3">
        {c.t(`${ckey}.nadpis`, title, { as: "span", className: "font-display text-base text-foreground sm:text-lg" })}
        <ChevronDown className="h-5 w-5 shrink-0 text-brand transition-transform group-open:rotate-180" />
      </summary>
      <div className="mt-3 text-[15px] leading-relaxed text-muted-foreground">{children}</div>
    </details>
  );
}

function serviceIcon(name?: string): LucideIcon {
  if (!name) return Stethoscope;
  const found = (Icons as unknown as Record<string, LucideIcon | undefined>)[name];
  return found ?? Stethoscope;
}

export interface CareerLayoutProps extends CopyProps {
  branch: Branch;
  services: BranchService[];
  /** Fotky pobočky do hero a sekce o místě. */
  photos: string[];
  /** Kraj do předvoleného filtru pozic. */
  defaultRegion?: string;
}

export function CareerLayout({
  branch,
  services,
  photos,
  defaultRegion,
  copy,
  editBranchId,
}: CareerLayoutProps) {
  const c = makeCopy({ copy, editBranchId });
  /** Cíl editace pro text z databáze. */
  const field = (
    table: string,
    id: string,
    name: string
  ): EditTarget | undefined =>
    editBranchId ? { kind: "field", table, id, field: name } : undefined;
  const cvHref = CV_MAILTO + encodeURIComponent(`Životopis – ${branch.short_name}`);

  const pic = (key: string, src: string | undefined, alt: string, className = "") => {
    const resolved = c.s(key, src ?? "/images/_shared/care-hands.jpg");
    return (
      <div className={`relative overflow-hidden rounded-3xl bg-muted ${className}`}>
        <Image src={resolved} alt={alt} fill sizes="(min-width:1024px) 50vw, 100vw" className="object-cover" />
        {c.img(key)}
      </div>
    );
  };

  const distances = [
    { label: branch.distance_city_1_label, km: branch.distance_city_1_km },
    { label: branch.distance_city_2_label, km: branch.distance_city_2_km },
    { label: branch.distance_city_3_label, km: branch.distance_city_3_km },
  ].filter((d): d is { label: string; km: number } => Boolean(d.label && d.km));

  return (
    <>
      {/* 1. HERO */}
      <section className="relative overflow-hidden bg-gradient-to-b from-brand-light/40 to-background">
        <div className={`${wrap} grid items-center gap-10 py-14 lg:grid-cols-2 lg:py-20`}>
          <div>
            {c.t("kariera.hero.eyebrow", `Kariéra · ${branch.short_name}`, { as: "div", className: "text-xs font-bold uppercase tracking-[0.22em] text-warm-dark" })}
            <h1 className="font-display mt-4 text-4xl leading-[1.1] text-foreground sm:text-5xl">
              {c.t("kariera.hero.title", "Práce, ve které má odbornost i lidskost")}{" "}
              {c.t("kariera.hero.title-zvyraznene", "skutečný význam", { as: "span", className: "text-brand" })}
            </h1>
            {c.t("kariera.hero.text", "Pečujeme o lidi, kteří potřebují čas, podporu a bezpečné prostředí. Každý člen týmu ovlivňuje, jak se u nás lidé i jejich rodiny cítí. Hledáme kolegy, kteří chtějí spojit odbornost s respektem, empatií a opravdovým zájmem o člověka.", { as: "p", className: "mt-6 max-w-xl text-base leading-relaxed text-muted-foreground" })}
            <div className="mt-8 flex flex-wrap gap-3">
              <Link href="#pozice" className="inline-flex items-center gap-2 rounded-full bg-brand px-7 py-3.5 text-sm font-semibold text-brand-foreground shadow-md shadow-brand/15 hover:bg-brand-dark">{c.t("kariera.hero.cta1", "Zobrazit volné pozice")} <ArrowRight className="h-4 w-4" /></Link>
              <a href={cvHref} className="inline-flex items-center gap-2 rounded-full border border-border bg-background px-6 py-3.5 text-sm font-semibold text-foreground hover:border-brand hover:text-brand">{c.t("kariera.hero.cta2", "Poslat životopis")}</a>
            </div>
          </div>
          {pic("kariera.hero.foto", photos[0], `Práce v ${branch.name}`, "aspect-[4/3] shadow-lg lg:aspect-[5/4]")}
        </div>
      </section>

      {/* 2. PROČ U NÁS */}
      <RegionSlot {...c.region("sekce.kariera.proc")}>
<section className={`${wrap} py-16 lg:py-20`}>
        {c.t("kariera.proc.nadpis", "Proč pracovat právě u nás", { as: "h2", className: "font-display block text-center text-3xl text-foreground sm:text-4xl" })}
        <div className="mt-10 grid gap-5 sm:grid-cols-2 lg:grid-cols-3">
          {WHY.map((w, i) => (
            <RegionSlot key={w.t} {...c.region(`kariera.proc.${i}`)}>
            <div className="rounded-2xl border border-border bg-card p-6">
              <span className="flex h-11 w-11 items-center justify-center rounded-2xl bg-brand-light text-brand"><w.icon className="h-5 w-5" strokeWidth={1.75} /></span>
              {c.t(`kariera.proc.${i}.nadpis`, w.t, { as: "h3", className: "font-display mt-4 text-lg text-foreground" })}
              {c.t(`kariera.proc.${i}.text`, w.d, { as: "p", className: "mt-2 text-sm leading-relaxed text-muted-foreground" })}
            </div>
            </RegionSlot>
          ))}
        </div>
      </section>
</RegionSlot>

      {/* 3. PROČ ZŮSTÁVAJÍ */}
      <RegionSlot {...c.region("sekce.kariera.tym")}>
<section className="bg-brand text-brand-foreground">
        <div className={`${wrap} py-16 lg:py-20`}>
          {c.t("kariera.tym.nadpis", "Protože dobrý tým není samozřejmost", { as: "h2", className: "font-display text-3xl sm:text-4xl" })}
          {c.t("kariera.tym.text", "Lidé u nás nezůstávají jen kvůli pozici. Zůstávají kvůli kolegům, na které se mohou obrátit, kvůli práci, jejíž výsledky vidí v každodenním životě pacientů a klientů, i kvůli možnosti dál se učit a růst.", { as: "p", className: "mt-5 block max-w-2xl text-brand-foreground/85" })}
          <ul className="mt-8 grid gap-3 sm:grid-cols-2 lg:grid-cols-4">
            {DUVODY.map((d, i) => (
              <li key={d} className="flex items-center gap-2 rounded-xl bg-brand-foreground/10 px-4 py-3 text-sm font-medium"><span className="h-1.5 w-1.5 rounded-full bg-warm" />{c.t(`kariera.tym.duvod.${i}`, d)}</li>
            ))}
          </ul>
        </div>
      </section>
</RegionSlot>

      {/* 4. CESTY POMOCI — služby konkrétní pobočky */}
      {services.length > 0 ? (
        <RegionSlot {...c.region("sekce.kariera.cesty")}>
<section className={`${wrap} py-16 lg:py-20`}>
          {c.t("kariera.cesty.nadpis", "Jedno zařízení, více cest pomoci", { as: "h2", className: "font-display block text-center text-3xl text-foreground sm:text-4xl" })}
          <div className="mt-10 grid gap-6 md:grid-cols-2">
            {services.slice(0, 4).map((s) => {
              const Icon = serviceIcon(s.icon);
              return (
                <RegionSlot
                  key={s._id}
                  {...c.region(`row:branch_services:${s._id}`, { kind: "row", table: "branch_services", id: s._id }, { kind: "row", table: "branch_services", id: s._id })}
                >
                <div className="rounded-3xl border border-border bg-card p-7">
                  <div className="flex items-center gap-3">
                    <Icon className="h-7 w-7 shrink-0 text-brand" strokeWidth={1.75} />
                    <TextSlot
                      as="h3"
                      target={field("branch_services", s._id, "title")}
                      value={s.title}
                      className="font-display text-xl text-foreground"
                    />
                  </div>
                  {s.description ? (
                    <TextSlot
                      as="p"
                      target={field("branch_services", s._id, "description")}
                      value={s.description}
                      className="mt-3 text-[15px] leading-relaxed text-muted-foreground"
                    />
                  ) : null}
                </div>
                </RegionSlot>
              );
            })}
          </div>
        </section>
</RegionSlot>
      ) : null}

      {/* 5. KOHO POTKÁTE */}
      <RegionSlot {...c.region("sekce.kariera.profese")}>
<section className="bg-secondary/40">
        <div className={`${wrap} py-16`}>
          {c.t("kariera.profese.nadpis", "Koho můžete v našem týmu potkat", { as: "h2", className: "font-display text-2xl text-foreground sm:text-3xl" })}
          {c.t("kariera.profese.text", "Každá z těchto profesí má vliv na bezpečí, kvalitu péče i celkovou zkušenost člověka, který se na nás obrací.", { as: "p", className: "mt-2 block max-w-2xl text-sm text-muted-foreground" })}
          <ul className="mt-6 flex flex-wrap gap-2">
            {PROFESSIONS.map((pr, i) => <li key={pr} className="rounded-full border border-border bg-card px-4 py-2 text-sm font-medium text-foreground">{c.t(`kariera.profese.${i}`, pr)}</li>)}
          </ul>
        </div>
      </section>
</RegionSlot>

      {/* 6. HODNOTY */}
      <RegionSlot {...c.region("sekce.kariera.hodnoty")}>
<section className={`${wrap} py-16 lg:py-20`}>
        {c.t("kariera.hodnoty.nadpis", "Naše hodnoty v každodenní práci", { as: "h2", className: "font-display block text-center text-3xl text-foreground sm:text-4xl" })}
        <div className="mt-10 grid gap-5 sm:grid-cols-2 lg:grid-cols-5">
          {VALUES.map((v, i) => (
            <RegionSlot key={v.t} {...c.region(`kariera.hodnoty.${i}`)}>
            <div className="rounded-2xl border border-border bg-card p-5">
              <div className="font-display text-3xl text-brand/30">0{i + 1}</div>
              {c.t(`kariera.hodnoty.${i}.nadpis`, v.t, { as: "h3", className: "font-display mt-2 text-lg text-foreground" })}
              {c.t(`kariera.hodnoty.${i}.text`, v.d, { as: "p", className: "mt-2 text-sm leading-relaxed text-muted-foreground" })}
            </div>
            </RegionSlot>
          ))}
        </div>
      </section>
</RegionSlot>

      {/* 7. PŘÍBĚHY */}
      <RegionSlot {...c.region("sekce.kariera.pribehy")}>
<section className="bg-secondary/40">
        <div className={`${wrap} py-16`}>
          {c.t("kariera.pribehy.nadpis", "Příběhy našich zaměstnanců", { as: "h2", className: "font-display text-2xl text-foreground sm:text-3xl" })}
          <div className="mt-8 grid gap-5 sm:grid-cols-2">
            {STORIES.map((s, i) => (
              <RegionSlot key={s.role} {...c.region(`kariera.pribehy.${i}`)}>
              <div className="flex gap-4 rounded-2xl border border-border bg-card p-6">
                <span className="flex h-12 w-12 shrink-0 items-center justify-center rounded-full bg-brand-light text-brand"><Users className="h-5 w-5" strokeWidth={1.75} /></span>
                <div>
                  {c.t(`kariera.pribehy.${i}.role`, s.role, { as: "div", className: "text-[11px] font-bold uppercase tracking-wider text-warm-dark" })}
                  <h3 className="font-display mt-1 text-lg text-foreground">„{c.t(`kariera.pribehy.${i}.nadpis`, s.h)}“</h3>
                  {c.t(`kariera.pribehy.${i}.text`, s.d, { as: "p", className: "mt-1.5 text-sm leading-relaxed text-muted-foreground" })}
                </div>
              </div>
              </RegionSlot>
            ))}
          </div>
        </div>
      </section>
</RegionSlot>

      {/* 8. BENEFITY */}
      <RegionSlot {...c.region("sekce.kariera.benefity")}>
<section className={`${wrap} py-16 lg:py-20`}>
        {c.t("kariera.benefity.nadpis", "Co u nás mohou zaměstnanci ocenit", { as: "h2", className: "font-display block text-center text-3xl text-foreground sm:text-4xl" })}
        <div className="mt-10 grid gap-5 sm:grid-cols-2 lg:grid-cols-3">
          {BENEFITS.map((b, i) => (
            <RegionSlot key={b.t} {...c.region(`kariera.benefity.${i}`)}>
            <div className="rounded-2xl border border-border bg-card p-6">
              <span className="flex h-11 w-11 items-center justify-center rounded-2xl bg-warm-light text-warm-dark"><b.icon className="h-5 w-5" strokeWidth={1.75} /></span>
              {c.t(`kariera.benefity.${i}.nadpis`, b.t, { as: "h3", className: "font-display mt-4 text-lg text-foreground" })}
              {c.t(`kariera.benefity.${i}.text`, b.d, { as: "p", className: "mt-2 text-sm leading-relaxed text-muted-foreground" })}
            </div>
            </RegionSlot>
          ))}
        </div>
      </section>
</RegionSlot>

      {/* 9. KDE BUDETE PRACOVAT */}
      <RegionSlot {...c.region("sekce.kariera.mesto")}>
<section className="bg-secondary/40">
        <div className={`${wrap} grid items-center gap-10 py-16 lg:grid-cols-2`}>
          {pic("kariera.mesto.foto", photos[1] ?? photos[0], `${branch.city} a okolí`, "aspect-[4/3]")}
          <div>
            <div className="flex items-center gap-2 text-[11px] font-bold uppercase tracking-[0.18em] text-warm-dark"><MapPin className="h-4 w-4" /> {c.t("kariera.mesto.eyebrow", "Kde budete pracovat")}</div>
            {c.t("kariera.mesto.nadpis", branch.name, { as: "h2", className: "font-display mt-2 text-3xl text-foreground sm:text-4xl" })}
            {c.t("kariera.mesto.text", `Pracoviště najdete na adrese ${branch.street}, ${branch.zip} ${branch.city}.`, { as: "p", className: "mt-4 text-base leading-relaxed text-muted-foreground" })}
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
          </div>
        </div>
      </section>
</RegionSlot>

      {/* 10. VOLNÉ POZICE */}
      <section id="pozice" className="scroll-mt-24">
        <div className={`${wrap} pt-16`}>
          <div className="mx-auto max-w-3xl text-center">
            {c.t("kariera.pozice.eyebrow", "Volné pozice", { as: "div", className: "text-[11px] font-bold uppercase tracking-[0.22em] text-warm-dark" })}
            {c.t("kariera.pozice.nadpis", "Aktuálně otevřené pozice", { as: "h2", className: "font-display mt-3 block text-3xl text-foreground sm:text-4xl" })}
            {c.t("kariera.pozice.text", "Aktuální nabídka se průběžně mění. Vyberte pozici a reagujte přímo online.", { as: "p", className: "mt-4 block text-base text-muted-foreground" })}
          </div>
        </div>
        <div className="mt-8"><TeamioWidget defaultRegion={defaultRegion} /></div>
        <div className={`${wrap} pb-8`}>
          <div className="flex flex-col items-center gap-4 rounded-3xl bg-secondary/50 p-8 text-center sm:flex-row sm:justify-between sm:text-left">
            <p className="max-w-xl text-base text-foreground"><strong>{c.t("kariera.cv.tucne", "Nenašli jste vhodnou nabídku?")}</strong>{" "}{c.t("kariera.cv.text", "Pošlete nám životopis a krátkou zprávu o tom, jakou práci hledáte. Ozveme se vám, jakmile se objeví vhodná příležitost.")}</p>
            <a href={cvHref} className="inline-flex shrink-0 items-center gap-2 rounded-full bg-brand px-6 py-3 text-sm font-semibold text-brand-foreground hover:bg-brand-dark"><Send className="h-4 w-4" /> {c.t("kariera.cv.cta", "Poslat životopis")}</a>
          </div>
        </div>
      </section>

      {/* 11. VÝBĚROVÉ ŘÍZENÍ */}
      <RegionSlot {...c.region("sekce.kariera.kroky")}>
<section className={`${wrap} py-16`}>
        {c.t("kariera.kroky.nadpis", "Jak probíhá výběrové řízení", { as: "h2", className: "font-display block text-center text-3xl text-foreground sm:text-4xl" })}
        <div className="mt-10 grid gap-5 sm:grid-cols-2 lg:grid-cols-4">
          {STEPS.map((s, i) => (
            <RegionSlot key={s.n} {...c.region(`kariera.kroky.${i}`)}>
            <div className="rounded-2xl border border-border bg-card p-6">
              <span className="flex h-10 w-10 items-center justify-center rounded-full bg-brand font-display text-lg text-brand-foreground">{s.n}</span>
              {c.t(`kariera.kroky.${i}.nadpis`, s.t, { as: "h3", className: "font-display mt-4 text-lg text-foreground" })}
              {c.t(`kariera.kroky.${i}.text`, s.d, { as: "p", className: "mt-2 text-sm leading-relaxed text-muted-foreground" })}
            </div>
            </RegionSlot>
          ))}
        </div>
      </section>
</RegionSlot>

      {/* 12. FAQ */}
      <RegionSlot {...c.region("sekce.kariera.faq")}>
<section className="bg-secondary/40">
        <div className={`${wrap} py-16`}>
          {c.t("kariera.faq.nadpis", "Nejčastější otázky uchazečů", { as: "h2", className: "font-display block text-center text-3xl text-foreground sm:text-4xl" })}
          <div className="mx-auto mt-8 max-w-3xl space-y-3">
            {FAQ.map(([q, a], i) => (
              <RegionSlot key={q} {...c.region(`kariera.faq.${i}`)}>
              <Accordion c={c} ckey={`kariera.faq.${i}`} title={q}>
                {c.t(`kariera.faq.${i}.odpoved`, a, { as: "p" })}
              </Accordion>
              </RegionSlot>
            ))}
          </div>
        </div>
      </section>
</RegionSlot>

      {/* 13. KONTAKT */}
      <RegionSlot {...c.region("sekce.kariera.kontakt")}>
<section className={`${wrap} py-16`}>
        <div className="grid gap-6 lg:grid-cols-2">
          <div className="rounded-3xl bg-brand p-8 text-brand-foreground">
            {c.t("kariera.kontakt.eyebrow", "Kontakt pro uchazeče", { as: "div", className: "text-[11px] font-bold uppercase tracking-[0.18em] text-warm" })}
            {c.t("kariera.kontakt.nadpis", `Máte otázku k práci v ${branch.short_name}?`, { as: "h3", className: "font-display mt-2 text-2xl" })}
            {branch.office_contact_name ? (
              <>
                <TextSlot
                  as="div"
                  target={field("branches", branch._id, "office_contact_name")}
                  value={branch.office_contact_name}
                  className="mt-5 text-lg font-semibold"
                />
                {c.t("kariera.kontakt.role", "Kontakt na pobočku", { as: "div", className: "text-sm text-brand-foreground/80" })}
              </>
            ) : null}
            <div className="mt-4 space-y-1.5 text-sm">
              {(branch.office_contact_phone ?? branch.phone) ? (
                <a href={`tel:${(branch.office_contact_phone ?? branch.phone).replace(/\s/g, "")}`} className="flex items-center gap-2 font-semibold hover:text-warm"><Phone className="h-4 w-4" /> {branch.office_contact_phone ?? branch.phone}</a>
              ) : null}
              {(branch.office_contact_email ?? branch.email) ? (
                <a href={`mailto:${branch.office_contact_email ?? branch.email}`} className="flex items-center gap-2 font-semibold hover:text-warm"><Mail className="h-4 w-4" /> {branch.office_contact_email ?? branch.email}</a>
              ) : null}
              <a href="mailto:kariera@ahc.cz" className="flex items-center gap-2 font-semibold hover:text-warm"><Mail className="h-4 w-4" /> kariera@ahc.cz <span className="font-normal text-brand-foreground/70">(obecný kariérní kontakt AHC)</span></a>
            </div>
          </div>
          <div className="flex flex-col justify-center rounded-3xl border border-border bg-card p-8">
            <div className="flex items-center gap-2 text-[11px] font-bold uppercase tracking-[0.18em] text-warm-dark"><Briefcase className="h-4 w-4" /> {c.t("kariera.spontanni.eyebrow", "Nenašli jste svou pozici?")}</div>
            {c.t("kariera.spontanni.nadpis", "Přesto nám o sobě dejte vědět", { as: "h3", className: "font-display mt-2 text-2xl text-foreground" })}
            {c.t("kariera.spontanni.text", "Do zprávy uveďte, o jakou profesi máte zájem, jaký úvazek hledáte, jaké máte vzdělání a zkušenosti a kdy můžete nastoupit.", { as: "p", className: "mt-3 text-[15px] leading-relaxed text-muted-foreground" })}
            <div className="mt-6 flex flex-wrap gap-3">
              <Link href="#pozice" className="rounded-full border border-border px-5 py-3 text-sm font-semibold text-foreground hover:border-brand hover:text-brand">{c.t("kariera.spontanni.cta1", "Zobrazit volné pozice")}</Link>
              <a href={cvHref} className="inline-flex items-center gap-2 rounded-full bg-brand px-5 py-3 text-sm font-semibold text-brand-foreground hover:bg-brand-dark"><Send className="h-4 w-4" /> {c.t("kariera.spontanni.cta2", "Poslat životopis")}</a>
            </div>
          </div>
        </div>
      </section>
</RegionSlot>
    </>
  );
}
