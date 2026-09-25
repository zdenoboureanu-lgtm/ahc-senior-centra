import Image from "next/image";
import Link from "next/link";
import {
  ArrowRight, ArrowUp, ChevronDown, Phone, Mail, Mailbox, MapPin, Building2,
  Stethoscope, Home, HandHelping, CalendarCheck,
} from "lucide-react";
import {
  makeCopy,
  type CopyHelpers,
  type CopyProps,
} from "@/features/inline-edit/copy";
import { RegionSlot } from "@/features/inline-edit/components/content-slot";

const wrap = "mx-auto max-w-[1320px] px-6 lg:px-10";
const P = "/images/sedlec";
const MAP = "https://www.google.com/maps?q=" + encodeURIComponent("AHC Centrum následné péče Sedlec-Prčice, Vítkovo náměstí 3, Sedlec-Prčice") + "&hl=cs&z=16&output=embed";

function Accordion({
  c,
  ckey,
  title,
  children,
}: {
  c: CopyHelpers;
  ckey: string;
  title: string;
  children: React.ReactNode;
}) {
  return (
    <details className="group rounded-2xl border border-border bg-card p-5 [&_summary]:list-none">
      <summary className="flex cursor-pointer items-center justify-between gap-3">
        {c.t(`${ckey}.nadpis`, title, { as: "span", className: "font-display text-lg text-foreground" })}
        <ChevronDown className="h-5 w-5 shrink-0 text-brand transition-transform group-open:rotate-180" />
      </summary>
      <div className="mt-4 text-[15px] leading-relaxed text-muted-foreground">{children}</div>
    </details>
  );
}

function Bullets({ c, ckey, items }: { c: CopyHelpers; ckey: string; items: string[] }) {
  return (
    <ul className="grid gap-2">
      {items.map((it, i) => (
        <li key={it} className="flex items-start gap-2 text-foreground">
          <span className="mt-1.5 h-1.5 w-1.5 shrink-0 rounded-full bg-brand" />
          {c.t(`${ckey}.${i}`, it)}
        </li>
      ))}
    </ul>
  );
}

function DeliveryCards({ email }: { email: string }) {
  return (
    <div className="mt-4 grid gap-3 sm:grid-cols-3">
      {[
        { icon: Mail, t: "E-mailem", v: email, href: `mailto:${email}` },
        { icon: Building2, t: "Osobně", v: "Přijímací kancelář v přízemí nové budovy" },
        { icon: Mailbox, t: "Poštou", v: "Vítkovo náměstí 3, 257 91 Sedlec-Prčice" },
      ].map((d) => (
        <div key={d.t} className="rounded-xl border border-border bg-secondary/40 p-4">
          <d.icon className="h-5 w-5 text-brand" strokeWidth={1.75} />
          <div className="mt-2 text-[11px] font-bold uppercase tracking-wider text-muted-foreground">{d.t}</div>
          {d.href ? <a href={d.href} className="mt-0.5 block text-sm font-semibold text-foreground hover:text-brand">{d.v}</a> : <div className="mt-0.5 text-sm text-foreground">{d.v}</div>}
        </div>
      ))}
    </div>
  );
}

function ContactCard({
  c,
  ckey,
  name,
  role,
  phone,
  mobile,
  email,
  extra,
}: {
  c: CopyHelpers;
  ckey: string;
  name: string;
  role: string;
  phone: string;
  mobile: string;
  email: string;
  extra?: React.ReactNode;
}) {
  return (
    <div className="rounded-3xl bg-brand p-7 text-brand-foreground">
      {c.t(`${ckey}.eyebrow`, "Potřebujete poradit?", { as: "div", className: "text-[11px] font-bold uppercase tracking-[0.18em] text-warm" })}
      {c.t(`${ckey}.jmeno`, name, { as: "div", className: "font-display mt-2 text-2xl" })}
      {c.t(`${ckey}.role`, `${role} · Po–Pá 7:00–15:30`, { as: "div", className: "text-sm text-brand-foreground/80" })}
      <div className="mt-4 space-y-1.5 text-sm">
        <a href={`tel:${phone.replace(/\s/g, "")}`} className="flex items-center gap-2 font-semibold hover:text-warm"><Phone className="h-4 w-4" /> {phone}</a>
        <a href={`tel:${mobile.replace(/\s/g, "")}`} className="flex items-center gap-2 font-semibold hover:text-warm"><Phone className="h-4 w-4" /> {mobile}</a>
        <a href={`mailto:${email}`} className="flex items-center gap-2 font-semibold hover:text-warm"><Mail className="h-4 w-4" /> {email}</a>
      </div>
      <div className="mt-5 flex flex-wrap items-center gap-2">
        <a href={`tel:${phone.replace(/\s/g, "")}`} className="inline-flex items-center rounded-full bg-brand-foreground px-5 py-2.5 text-xs font-bold uppercase tracking-wider text-brand hover:bg-warm hover:text-warm-foreground">Zavolat</a>
        <a href={`mailto:${email}`} className="inline-flex items-center rounded-full border-2 border-brand-foreground/40 px-5 py-2.5 text-xs font-bold uppercase tracking-wider hover:border-warm hover:text-warm">Napsat e-mail</a>
        {extra}
      </div>
    </div>
  );
}

function Back() {
  return (
    <div className={`${wrap} pb-4`}>
      <Link href="#vyber" className="inline-flex items-center gap-1.5 text-xs font-bold uppercase tracking-wider text-brand hover:gap-2.5"><ArrowUp className="h-3.5 w-3.5" /> Zpět na výběr služby</Link>
    </div>
  );
}

const FAQ = [
  ["Musím nejprve vyplnit všechny dokumenty?", "Ne. Klidně nás nejdříve kontaktujte. Sociální pracovnice vám řekne, které dokumenty budete potřebovat a jak postupovat."],
  ["Mohu žádost zaslat e-mailem?", "Ano. Dokumenty lze podle zvolené služby zaslat e-mailem, poštou nebo předat osobně."],
  ["Mohu si zařízení předem prohlédnout?", "Ano. Osobní návštěvu si můžete předem domluvit se sociální pracovnicí."],
  ["Co když nevím, kterou službu potřebujeme?", "Nevadí. Popište nám svou situaci a pomůžeme vám zorientovat se v možnostech."],
  ["Znamená podání žádosti automatické přijetí?", "Ne. U následné péče posuzujeme zdravotní indikaci. U domova pro seniory také vhodnost služby a aktuální kapacitu."],
];

const VYBER = [
  { href: "#nasledna-pece", t: "Potřebuji následnou lůžkovou péči", d: "Pro pacienta po hospitalizaci, operaci, úrazu nebo zhoršení stavu, který potřebuje odborné doléčení, ošetřovatelskou péči nebo rehabilitaci.", img: `${P}/pokoj-1.jpg`, btn: "Jak požádat o následnou péči" },
  { href: "#domov-pro-seniory", t: "Hledám domov pro sebe nebo blízkého", d: "Pro seniora od 65 let, který potřebuje pravidelnou či nepřetržitou pomoc a bezpečné pobytové zázemí.", img: `${P}/spolecna.jpg`, btn: "Jak požádat do domova" },
];

/** Bespoke podstránka „Žádost o přijetí" pro Sedlec-Prčice. */
export function ZadostSedlec({ copy, editBranchId }: CopyProps) {
  const c = makeCopy({ copy, editBranchId });

  const pic = (
    key: string,
    src: string,
    alt: string,
    className = "",
    rounded = "rounded-3xl"
  ) => (
    <div className={`relative overflow-hidden bg-muted ${rounded} ${className}`}>
      <Image src={c.s(key, src)} alt={alt} fill sizes="(min-width:1024px) 50vw, 100vw" className="object-cover" />
      {c.img(key)}
    </div>
  );

  return (
    <>
      {/* 1. ROZCESTNÍK */}
      <section id="vyber" className="scroll-mt-24 bg-gradient-to-b from-brand-light/40 to-background">
        <div className={`${wrap} py-12 lg:py-16`}>
          <div className="mx-auto max-w-3xl text-center">
            {c.t("zadost.hero.eyebrow", "Žádost o přijetí", { as: "div", className: "text-xs font-bold uppercase tracking-[0.22em] text-warm-dark" })}
            {c.t("zadost.hero.title", "S žádostí vás provedeme krok za krokem", { as: "h1", className: "font-display mt-3 block text-4xl text-foreground sm:text-5xl" })}
            {c.t("zadost.hero.text", "Vyřizování péče a dokumentů přichází často v náročném období — proto na to nemusíte být sami. Naše sociální pracovnice vám vysvětlí postup, pomohou s dokumenty a odpoví na otázky. Nejprve si vyberte službu.", { as: "p", className: "mt-5 block text-base leading-relaxed text-muted-foreground" })}
          </div>
          <div className="mt-8 grid gap-5 md:grid-cols-2">
            {VYBER.map((v, i) => (
              <RegionSlot key={v.href} className="h-full" {...c.region(`zadost.vyber.${i}`)}>
              <Link href={v.href} className="group block h-full overflow-hidden rounded-3xl border border-border bg-card transition-all hover:-translate-y-1 hover:border-brand/40 hover:shadow-lg">
                {pic(`zadost.vyber.${i}.foto`, v.img, v.t, "aspect-[16/9]", "rounded-none")}
                <div className="p-7">
                  {c.t(`zadost.vyber.${i}.nadpis`, v.t, { as: "h2", className: "font-display text-xl text-foreground sm:text-2xl group-hover:text-brand" })}
                  {c.t(`zadost.vyber.${i}.text`, v.d, { as: "p", className: "mt-2 text-[15px] leading-relaxed text-muted-foreground" })}
                  <span className="mt-4 inline-flex items-center gap-1.5 text-xs font-bold uppercase tracking-wider text-brand">{c.t(`zadost.vyber.${i}.tlacitko`, v.btn)} <ArrowRight className="h-3.5 w-3.5" /></span>
                </div>
              </Link>
              </RegionSlot>
            ))}
          </div>
        </div>
      </section>

      {/* 2. UJIŠTĚNÍ */}
      <RegionSlot {...c.region("sekce.zadost.ujisteni")}>
<section className={`${wrap} py-10`}>
        <div className="flex flex-col items-center gap-4 rounded-3xl bg-secondary/50 p-8 text-center sm:flex-row sm:justify-between sm:text-left">
          <div className="flex items-center gap-4">
            <HandHelping className="hidden h-8 w-8 shrink-0 text-warm sm:block" strokeWidth={1.5} />
            <p className="max-w-xl text-base text-foreground">
              <strong>{c.t("zadost.ujisteni.tucne", "Nemusíte mít všechno vyřešené předem.")}</strong>{" "}
              {c.t("zadost.ujisteni.text", "Nevíte, který formulář potřebujete nebo jaký typ péče je vhodný? Ozvěte se nám — vyslechneme vaši situaci a vysvětlíme, co bude potřeba.")}
            </p>
          </div>
          <Link href="/kontakt" className="inline-flex shrink-0 items-center gap-2 rounded-full bg-brand px-6 py-3 text-sm font-semibold text-brand-foreground hover:bg-brand-dark">Poradit se se sociální pracovnicí</Link>
        </div>
      </section>
</RegionSlot>

      {/* sticky nav */}
      <div className="sticky top-[76px] z-30 border-y border-border bg-background/95 backdrop-blur-xl">
        <div className={`${wrap} flex gap-6 py-3 text-sm font-semibold`}>
          <Link href="#nasledna-pece" className="text-foreground/70 hover:text-brand">Následná lůžková péče</Link>
          <Link href="#domov-pro-seniory" className="text-foreground/70 hover:text-brand">Domov pro seniory</Link>
        </div>
      </div>

      {/* ===== NÁSLEDNÁ PÉČE ===== */}
      <section id="nasledna-pece" className="scroll-mt-32 bg-secondary/30">
        <div className={`${wrap} grid items-center gap-10 py-14 lg:grid-cols-2`}>
          {pic("zadost.np.foto", `${P}/koupelna-2.jpg`, "Zázemí následné péče", "aspect-[4/3]")}
          <div>
            <div className="flex items-center gap-2 text-[11px] font-bold uppercase tracking-[0.18em] text-warm-dark"><Stethoscope className="h-4 w-4" /> {c.t("zadost.np.eyebrow", "Následná lůžková péče")}</div>
            {c.t("zadost.np.nadpis", "Když akutní léčba skončila, ale zotavení ještě pokračuje", { as: "h2", className: "font-display mt-2 text-3xl text-foreground sm:text-4xl" })}
            {c.t("zadost.np.text", "Přijímáme pacienty, kteří již nepotřebují akutní nemocniční léčbu, ale stále potřebují odborné doléčení, ošetřovatelskou péči nebo rehabilitaci. Pacient může přijít na doporučení lékaře nebo překladem z nemocnice. O vhodnosti přijetí rozhoduje vedoucí lékař.", { as: "p", className: "mt-4 text-base leading-relaxed text-muted-foreground" })}
            <div className="mt-6 flex flex-wrap gap-3">
              <Link href="/dokumenty" className="inline-flex items-center gap-2 rounded-full bg-brand px-5 py-3 text-sm font-semibold text-brand-foreground hover:bg-brand-dark">Stáhnout dokumenty</Link>
              <Link href="/kontakt" className="inline-flex items-center gap-2 rounded-full border border-border px-5 py-3 text-sm font-semibold text-foreground hover:border-brand hover:text-brand">Kontaktovat pracovnici</Link>
            </div>
          </div>
        </div>
        <div className={`${wrap} space-y-3 pb-14`}>
          <Accordion c={c} ckey="zadost.np.posouzeni" title="Co potřebujeme k posouzení žádosti?">
            {c.t("zadost.np.posouzeni.uvod", "Pro posouzení možnosti přijetí potřebujeme:", { as: "p", className: "mb-3" })}
            <Bullets c={c} ckey="zadost.np.posouzeni.polozka" items={["Návrh na přijetí k hospitalizaci", "Aktuální lékařskou zprávu", "Podepsaný souhlas se zpracováním osobních údajů"]} />
            {c.t("zadost.np.posouzeni.zaver", "Nemusíte si být jistí, zda máte vše správně — sociální pracovnice s vámi dokumenty ráda projde.", { as: "p", className: "mt-3" })}
          </Accordion>
          <Accordion c={c} ckey="zadost.np.doruceni" title="Jak nám dokumenty doručit?"><DeliveryCards email="veronika.pistekova@ahc.cz" /></Accordion>
          <Accordion c={c} ckey="zadost.np.potom" title="Co se bude dít potom?">
            {c.t("zadost.np.potom.uvod", "Vedoucí lékař posoudí zdravotní dokumentaci. Poté se vám ozve sociální pracovnice a projde s vámi:", { as: "p", className: "mb-3" })}
            <Bullets c={c} ckey="zadost.np.potom.polozka" items={["Další postup", "Možný termín nástupu", "Potřebné osobní věci", "Praktické informace k pobytu", "Případné úhrady za doplňkové služby"]} />
          </Accordion>
          <Accordion c={c} ckey="zadost.np.pripravit" title="Co připravit před nástupem?">
            {c.t("zadost.np.pripravit.uvod", "Přesný seznam se může lišit podle zdravotního stavu. Sociální pracovnice upřesní zejména:", { as: "p", className: "mb-3" })}
            <Bullets c={c} ckey="zadost.np.pripravit.polozka" items={["Jaké osobní věci přinést", "Jakou zdravotní dokumentaci připravit", "Které léky a kompenzační pomůcky pacient potřebuje", "Další praktické informace k pobytu"]} />
          </Accordion>
        </div>
        <div className={`${wrap} pb-14`}>
          <ContactCard c={c} ckey="zadost.np.kontakt" name="Veronika Pištěková" role="Sociální pracovnice — následná péče" phone="+420 317 729 647" mobile="+420 702 078 993" email="veronika.pistekova@ahc.cz" />
        </div>
      </section>
      <Back />

      {/* ===== DOMOV PRO SENIORY ===== */}
      <section id="domov-pro-seniory" className="scroll-mt-32 bg-secondary/30">
        <div className={`${wrap} grid items-center gap-10 py-14 lg:grid-cols-2`}>
          <div>
            <div className="flex items-center gap-2 text-[11px] font-bold uppercase tracking-[0.18em] text-warm-dark"><Home className="h-4 w-4" /> {c.t("zadost.dps.eyebrow", "Domov pro seniory")}</div>
            {c.t("zadost.dps.nadpis", "První krok nemusí být vyplňování formulářů", { as: "h2", className: "font-display mt-2 text-3xl text-foreground sm:text-4xl" })}
            {c.t("zadost.dps.text", "Domov je určen lidem od 65 let, kteří potřebují pravidelnou nebo nepřetržitou pomoc. Nejprve doporučujeme zavolat nebo napsat sociální pracovnici — společně proberete situaci žadatele i to, zda je služba vhodná. Rádi vám nabídneme i osobní prohlídku.", { as: "p", className: "mt-4 text-base leading-relaxed text-muted-foreground" })}
            <div className="mt-6 flex flex-wrap gap-3">
              <Link href="/kontakt" className="inline-flex items-center gap-2 rounded-full bg-brand px-5 py-3 text-sm font-semibold text-brand-foreground hover:bg-brand-dark">Kontaktovat pracovnici</Link>
              <Link href="/dokumenty" className="inline-flex items-center gap-2 rounded-full border border-border px-5 py-3 text-sm font-semibold text-foreground hover:border-brand hover:text-brand">Stáhnout žádost</Link>
            </div>
          </div>
          {pic("zadost.dps.foto", `${P}/spolecna.jpg`, "Domov pro seniory", "aspect-[4/3]")}
        </div>
        <div className={`${wrap} space-y-3 pb-14`}>
          <Accordion c={c} ckey="zadost.dps.zacatek" title="Jak začít?">
            {c.t("zadost.dps.zacatek.text", "Nejjednodušší je nejprve kontaktovat sociální pracovnici. Vyslechne vaši situaci, vysvětlí podmínky služby a poradí, které dokumenty připravit. Poté můžete vyplnit Žádost o poskytování sociální služby.", { as: "p" })}
          </Accordion>
          <Accordion c={c} ckey="zadost.dps.dokumenty" title="Jaké dokumenty budeme potřebovat?">
            {c.t("zadost.dps.dokumenty.text", "Základem je vyplněná Žádost o poskytování sociální služby. Pro posouzení zdravotního stavu může být potřeba také lékařský posudek — termín doložení upřesní sociální pracovnice. Nemusíte předem vyplňovat všechny dokumenty, nejprve se poraďte.", { as: "p" })}
          </Accordion>
          <Accordion c={c} ckey="zadost.dps.doruceni" title="Jak nám žádost doručit?"><DeliveryCards email="marketa.maskova@ahc.cz" /></Accordion>
          <Accordion c={c} ckey="zadost.dps.potom" title="Co se bude dít po podání žádosti?">
            {c.t("zadost.dps.potom.uvod", "Nejprve posoudíme, zda služba odpovídá potřebám žadatele. Při volné kapacitě s vámi sociální pracovnice domluví sociální šetření. Před nástupem společně projdeme:", { as: "p", className: "mb-3" })}
            <Bullets c={c} ckey="zadost.dps.potom.polozka" items={["Smlouvu o poskytování služby", "Úhrady", "Praktické informace", "Potřebné osobní věci", "Termín a průběh nástupu"]} />
          </Accordion>
          <Accordion c={c} ckey="zadost.dps.prijeti" title="Znamená podání žádosti okamžité přijetí?">
            {c.t("zadost.dps.prijeti.text", "Ne. Podání žádosti samo o sobě neznamená automatické přijetí. Posuzujeme vhodnost služby a volnou kapacitu. O dalším postupu vás bude sociální pracovnice průběžně informovat.", { as: "p" })}
          </Accordion>
        </div>
        {/* prohlídka */}
        <div className={`${wrap} pb-14`}>
          <div className="grid items-center gap-8 rounded-3xl border border-border bg-card p-2 lg:grid-cols-2">
            {pic("zadost.prohlidka.foto", `${P}/pokoj-2.jpg`, "Pokoj v domově", "aspect-[16/10]", "rounded-[1.4rem]")}
            <div className="p-6">
              <div className="flex items-center gap-2 text-[11px] font-bold uppercase tracking-[0.18em] text-warm-dark"><CalendarCheck className="h-4 w-4" /> {c.t("zadost.prohlidka.eyebrow", "Osobní prohlídka")}</div>
              {c.t("zadost.prohlidka.nadpis", "Přijeďte se k nám podívat", { as: "h3", className: "font-display mt-2 text-2xl text-foreground" })}
              {c.t("zadost.prohlidka.text", "O budoucím domově se těžko rozhoduje jen podle textu. Rádi vám ukážeme pokoje i společné prostory, představíme každodenní život v domově a zodpovíme vaše otázky.", { as: "p", className: "mt-3 text-[15px] leading-relaxed text-muted-foreground" })}
              <Link href="/kontakt" className="mt-5 inline-flex items-center gap-2 rounded-full bg-brand px-5 py-3 text-sm font-semibold text-brand-foreground hover:bg-brand-dark">Domluvit prohlídku domova</Link>
            </div>
          </div>
        </div>
        <div className={`${wrap} pb-14`}>
          <ContactCard c={c} ckey="zadost.dps.kontakt" name="Markéta Mašková" role="Sociální pracovnice — domov pro seniory" phone="+420 317 729 647" mobile="+420 720 840 462" email="marketa.maskova@ahc.cz" />
        </div>
      </section>
      <Back />

      {/* FAQ */}
      <RegionSlot {...c.region("sekce.zadost.faq")}>
<section className={`${wrap} py-14`}>
        {c.t("zadost.faq.nadpis", "Nejčastější otázky", { as: "h2", className: "font-display block text-center text-3xl text-foreground sm:text-4xl" })}
        <div className="mx-auto mt-8 max-w-3xl space-y-3">
          {FAQ.map(([q, a], i) => (
            <RegionSlot key={q} {...c.region(`zadost.faq.${i}`)}>
            <Accordion c={c} ckey={`zadost.faq.${i}`} title={q}>
              {c.t(`zadost.faq.${i}.odpoved`, a, { as: "p" })}
            </Accordion>
            </RegionSlot>
          ))}
        </div>
      </section>
</RegionSlot>

      {/* adresa + mapa */}
      <RegionSlot {...c.region("sekce.zadost.adresa")}>
<section className="bg-secondary/40">
        <div className={`${wrap} grid items-center gap-8 py-14 lg:grid-cols-2`}>
          <div className="rounded-2xl border border-border bg-card p-6">
            <div className="flex items-center gap-2">
              <MapPin className="h-5 w-5 text-brand" />
              {c.t("zadost.adresa.nadpis", "Kam doručit dokumenty osobně nebo poštou", { as: "h3", className: "font-display text-lg text-foreground" })}
            </div>
            <div className="mt-4 text-foreground">
              {c.t("zadost.adresa.nazev", "AHC Centrum následné péče Sedlec-Prčice a.s.")}
              <br />
              {c.t("zadost.adresa.ulice", "Vítkovo náměstí 3")}
              <br />
              {c.t("zadost.adresa.obec", "257 91 Sedlec-Prčice")}
            </div>
            {c.t("zadost.adresa.poznamka", "Přijímací kancelář: nová budova, přízemí", { as: "div", className: "mt-3 text-sm text-muted-foreground" })}
          </div>
          <div className="overflow-hidden rounded-2xl ring-1 ring-border">
            <iframe title="Mapa Sedlec-Prčice" src={MAP} className="h-full min-h-[300px] w-full border-0" loading="lazy" referrerPolicy="no-referrer-when-downgrade" />
          </div>
        </div>
      </section>
</RegionSlot>

      {/* závěr */}
      <RegionSlot {...c.region("sekce.zadost.zaver")}>
<section className={`${wrap} py-16`}>
        <div className="overflow-hidden rounded-[2.5rem] bg-gradient-to-br from-brand-dark via-brand to-brand-dark p-10 text-center text-brand-foreground sm:p-14">
          {c.t("zadost.zaver.nadpis", "Nejste na to sami", { as: "h2", className: "font-display mx-auto block max-w-2xl text-3xl leading-tight sm:text-4xl" })}
          {c.t("zadost.zaver.text", "Nemusíte znát všechny podmínky, formuláře ani přesný postup. Ozvěte se nám — společně projdeme vaši situaci a pomůžeme vám s žádostí i přípravou na nástup.", { as: "p", className: "mx-auto mt-4 block max-w-xl text-brand-foreground/85" })}
          <div className="mt-8 flex flex-wrap justify-center gap-3">
            <Link href="/kontakt" className="inline-flex items-center gap-2 rounded-full bg-brand-foreground px-6 py-3 text-sm font-bold uppercase tracking-wider text-brand hover:bg-warm hover:text-warm-foreground">Kontaktovat sociální pracovnici</Link>
          </div>
        </div>
      </section>
</RegionSlot>
    </>
  );
}
