import Link from "next/link";
import { ServicesStickyNav } from "./services-sticky-nav";
import {
  ArrowRight,
  ArrowUp,
  ChevronDown,
  Phone,
  Mail,
  HeartPulse,
  Activity,
  HandHelping,
  Stethoscope,
  Heart,
  Home,
  FileText,
  Receipt,
  Contact as ContactIcon,
  ClipboardList,
  UserCheck,
} from "lucide-react";
import Image from "next/image";
import {
  makeCopy,
  type CopyHelpers,
  type CopyProps,
} from "@/features/inline-edit/copy";
import { RegionSlot } from "@/features/inline-edit/components/content-slot";

const wrap = "mx-auto max-w-[1320px] px-6 lg:px-10";
const P = "/images/sedlec";

function Badge({ children }: { children: React.ReactNode }) {
  return (
    <span className="inline-flex items-center rounded-full bg-brand-light px-3 py-1 text-xs font-semibold text-brand">
      {children}
    </span>
  );
}

function Accordion({
  c,
  ckey,
  title,
  lead,
  items,
}: {
  c: CopyHelpers;
  /** Prefix klíčů pro editaci — musí být na stránce jedinečný. */
  ckey: string;
  title: string;
  lead?: string;
  items: string[];
}) {
  return (
    <details className="group rounded-2xl border border-border bg-card p-5 [&_summary]:list-none">
      <summary className="flex cursor-pointer items-center justify-between gap-3">
        <span>
          {c.t(`${ckey}.nadpis`, title, {
            as: "span",
            className: "font-display text-lg text-foreground",
          })}
          {lead
            ? c.t(`${ckey}.lead`, lead, {
                as: "span",
                className: "mt-1 block text-sm text-muted-foreground",
              })
            : null}
        </span>
        <ChevronDown className="h-5 w-5 shrink-0 text-brand transition-transform group-open:rotate-180" />
      </summary>
      <ul className="mt-4 grid gap-2 sm:grid-cols-2">
        {items.map((it, i) => (
          <li key={it} className="flex items-start gap-2 text-sm text-foreground">
            <span className="mt-1.5 h-1.5 w-1.5 shrink-0 rounded-full bg-brand" />
            {c.t(`${ckey}.polozka.${i}`, it)}
          </li>
        ))}
      </ul>
    </details>
  );
}

function ContactCard({
  c,
  ckey,
  role,
  name,
  hours,
  phone,
  mobile,
  email,
}: {
  c: CopyHelpers;
  ckey: string;
  role: string;
  name: string;
  hours: string;
  phone: string;
  mobile: string;
  email: string;
}) {
  return (
    <div className="rounded-2xl border border-border bg-card p-6">
      {c.t(`${ckey}.role`, role, {
        as: "div",
        className: "text-[11px] font-bold uppercase tracking-[0.18em] text-warm-dark",
      })}
      {c.t(`${ckey}.jmeno`, name, {
        as: "div",
        className: "font-display mt-2 text-xl text-foreground",
      })}
      {c.t(`${ckey}.hodiny`, hours, {
        as: "div",
        className: "mt-1 text-sm text-muted-foreground",
      })}
      <div className="mt-4 space-y-2 text-sm">
        <a href={`tel:${phone.replace(/\s/g, "")}`} className="flex items-center gap-2 font-semibold text-foreground hover:text-brand">
          <Phone className="h-4 w-4 text-brand" strokeWidth={2} /> {phone}
        </a>
        <a href={`tel:${mobile.replace(/\s/g, "")}`} className="flex items-center gap-2 font-semibold text-foreground hover:text-brand">
          <Phone className="h-4 w-4 text-brand" strokeWidth={2} /> {mobile}
        </a>
        <a href={`mailto:${email}`} className="flex items-center gap-2 font-semibold text-foreground hover:text-brand">
          <Mail className="h-4 w-4 text-brand" strokeWidth={2} /> {email}
        </a>
      </div>
    </div>
  );
}

const GOALS = [
  { icon: HeartPulse, t: "Stabilizovat nebo zlepšit zdravotní stav" },
  { icon: Activity, t: "Podpořit návrat fyzických a psychických funkcí" },
  { icon: HandHelping, t: "Obnovit nebo co nejdéle zachovat soběstačnost" },
  { icon: Heart, t: "Zmírnit následky nemoci" },
  { icon: Stethoscope, t: "Předcházet dalšímu zhoršování stavu" },
  { icon: Home, t: "Připravit na návrat domů nebo do vhodného prostředí" },
];

const HELP = [
  "Vstávání, přesuny a pohyb",
  "Oblékání a svlékání",
  "Stravování",
  "Osobní hygiena",
  "Péče o vlasy, zuby a nehty",
  "Používání toalety",
  "Výměna inkontinenčních pomůcek",
  "Orientace v režimu a osobní záležitosti",
];

const VYBER = [
  { href: "#nasledna-pece", t: "Potřebuji následnou lůžkovou péči", d: "Pro pacienty po hospitalizaci, operaci, úrazu nebo zhoršení zdravotního stavu, kteří potřebují odborné doléčení, ošetřovatelskou péči nebo rehabilitaci.", btn: "Zjistit více o následné péči", img: `${P}/pokoj-1.jpg` },
  { href: "#domov-pro-seniory", t: "Hledám domov pro blízkého", d: "Pro seniory od 65 let, kteří potřebují pravidelnou či nepřetržitou pomoc a bezpečné pobytové zázemí.", btn: "Zjistit více o domově pro seniory", img: `${P}/spolecna.jpg` },
];

const ODKAZY = [
  { icon: ClipboardList, t: "Žádost o přijetí", d: "Postupy pro obě služby, dokumenty a pokyny k nástupu.", href: "/zadost-o-prijeti", primary: true },
  { icon: FileText, t: "Dokumenty", d: "Žádosti, lékařské zprávy, souhlasy a formuláře.", href: "/dokumenty" },
  { icon: Receipt, t: "Ceníky", d: "Aktuální informace o úhradách a službách.", href: "/dokumenty" },
  { icon: ContactIcon, t: "Kontakty", d: "Sociální pracovnice a jednotlivá pracoviště.", href: "/kontakt" },
];

function BackToChoice() {
  return (
    <div className={`${wrap} pb-4`}>
      <Link href="#vyber-sluzby" className="inline-flex items-center gap-1.5 text-xs font-bold uppercase tracking-wider text-brand hover:gap-2.5">
        <ArrowUp className="h-3.5 w-3.5" /> Zpět na výběr služby
      </Link>
    </div>
  );
}

/** Bespoke podstránka „Služby" pro Sedlec-Prčice dle obsahové specifikace. */
export function ServicesSedlec({ copy, editBranchId }: CopyProps) {
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
      {/* 1. ÚVOD + VÝBĚR SLUŽBY */}
      <section id="vyber-sluzby" className="scroll-mt-24 bg-gradient-to-b from-brand-light/40 to-background">
        <div className={`${wrap} py-14 lg:py-16`}>
          <div className="mx-auto max-w-3xl text-center">
            {c.t("sluzby.hero.eyebrow", "Služby", { as: "div", className: "text-xs font-bold uppercase tracking-[0.22em] text-warm-dark" })}
            {c.t("sluzby.hero.title", "Správná péče začíná porozuměním tomu, co právě potřebujete", { as: "h1", className: "font-display mt-3 block text-4xl text-foreground sm:text-5xl" })}
            {c.t("sluzby.hero.text", "V AHC Centru následné péče Sedlec-Prčice poskytujeme dvě hlavní služby. Vyberte možnost, která nejlépe vystihuje potřeby vás nebo vašeho blízkého.", { as: "p", className: "mt-5 block text-base leading-relaxed text-muted-foreground" })}
          </div>
          <div className="mt-10 grid gap-5 md:grid-cols-2">
            {VYBER.map((v, i) => (
              <RegionSlot key={v.href} className="h-full" {...c.region(`sluzby.vyber.${i}`)}>
              <Link href={v.href} className="group block h-full overflow-hidden rounded-3xl border border-border bg-card transition-all hover:-translate-y-1 hover:border-brand/40 hover:shadow-lg">
                {pic(`sluzby.vyber.${i}.foto`, v.img, v.t, "aspect-[16/9]", "rounded-none")}
                <div className="p-7">
                  {c.t(`sluzby.vyber.${i}.nadpis`, v.t, { as: "h2", className: "font-display text-xl text-foreground sm:text-2xl group-hover:text-brand" })}
                  {c.t(`sluzby.vyber.${i}.text`, v.d, { as: "p", className: "mt-2 text-[15px] leading-relaxed text-muted-foreground" })}
                  <span className="mt-4 inline-flex items-center gap-1.5 text-xs font-bold uppercase tracking-wider text-brand">
                    {c.t(`sluzby.vyber.${i}.tlacitko`, v.btn)} <ArrowRight className="h-3.5 w-3.5" />
                  </span>
                </div>
              </Link>
              </RegionSlot>
            ))}
          </div>
        </div>
      </section>

      {/* 2. STICKY NAVIGACE */}
      <ServicesStickyNav />

      {/* 3. NEJSTE SI JISTÍ */}
      <RegionSlot {...c.region("sekce.sluzby.pomoc")}>
<section className={`${wrap} py-10`}>
        <div className="flex flex-col items-center gap-4 rounded-3xl bg-secondary/50 p-8 text-center sm:flex-row sm:justify-between sm:text-left">
          <div className="flex items-center gap-4">
            <UserCheck className="hidden h-8 w-8 shrink-0 text-warm sm:block" strokeWidth={1.5} />
            <p className="max-w-xl text-base text-foreground">
              <strong>{c.t("sluzby.pomoc.tucne", "Nemusíte se v jednotlivých typech péče orientovat sami.")}</strong>{" "}
              {c.t("sluzby.pomoc.text", "Popište nám svou situaci a naše sociální pracovnice vám poradí, jaký postup by mohl být vhodný.")}
            </p>
          </div>
          <Link href="/kontakt" className="inline-flex shrink-0 items-center gap-2 rounded-full bg-brand px-6 py-3 text-sm font-semibold text-brand-foreground hover:bg-brand-dark">
            Poradit se se sociální pracovnicí
          </Link>
        </div>
      </section>
</RegionSlot>

      {/* ===== NÁSLEDNÁ LŮŽKOVÁ PÉČE ===== */}
      <section id="nasledna-pece" className="scroll-mt-32 bg-secondary/30">
        <div className={`${wrap} grid items-center gap-10 py-16 lg:grid-cols-2`}>
          {pic("sluzby.np.foto", `${P}/koupelna-2.jpg`, "Zázemí následné péče", "aspect-[4/3]")}
          <div>
            {c.t("sluzby.np.eyebrow", "Následná lůžková péče", { as: "div", className: "text-[11px] font-bold uppercase tracking-[0.18em] text-warm-dark" })}
            {c.t("sluzby.np.nadpis", "Čas na doléčení, rehabilitaci a návrat k větší soběstačnosti", { as: "h2", className: "font-display mt-2 text-3xl text-foreground sm:text-4xl" })}
            <div className="mt-4 flex flex-wrap gap-2">
              <Badge>{c.t("sluzby.np.stitek.0", "Nepřetržitá péče")}</Badge>
              <Badge>{c.t("sluzby.np.stitek.1", "Odborné doléčení")}</Badge>
              <Badge>{c.t("sluzby.np.stitek.2", "Rehabilitace")}</Badge>
            </div>
            <div className="mt-5 space-y-3 text-base leading-relaxed text-muted-foreground">
              {c.t("sluzby.np.text1", "Následnou lůžkovou péči poskytujeme pacientům, jejichž zdravotní stav byl po akutním onemocnění, operaci, úrazu nebo zhoršení chronické nemoci stabilizován, ale stále vyžaduje odborné doléčení, pravidelnou ošetřovatelskou péči nebo léčebnou rehabilitaci.", { as: "p" })}
              {c.t("sluzby.np.text2", "Péči zajišťujeme nepřetržitě. Každému pacientovi nastavujeme podporu podle jeho aktuálního stavu, možností a cílů.", { as: "p" })}
            </div>
          </div>
        </div>
        <div className={`${wrap} pb-16`}>
          {c.t("sluzby.cile.nadpis", "Naším cílem je", { as: "h3", className: "font-display text-2xl text-foreground" })}
          <ul className="mt-6 grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
            {GOALS.map((g, i) => (
              <RegionSlot key={g.t} {...c.region(`sluzby.cile.${i}`)}>
              <li className="flex items-start gap-3 rounded-2xl border border-border bg-card p-5">
                <span className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-brand-light text-brand">
                  <g.icon className="h-5 w-5" strokeWidth={1.75} />
                </span>
                {c.t(`sluzby.cile.${i}`, g.t, { as: "span", className: "text-[15px] font-medium text-foreground" })}
              </li>
              </RegionSlot>
            ))}
          </ul>
        </div>
      </section>

      {/* 5. PÉČI PROPOJUJEME */}
      <RegionSlot {...c.region("sekce.sluzby.propojeni")}>
<section className={`${wrap} py-16`}>
        {c.t("sluzby.propojeni.nadpis", "Péči propojujeme podle potřeb pacienta", { as: "h3", className: "font-display text-2xl text-foreground sm:text-3xl" })}
        <div className="mt-8 space-y-4">
          <div className="rounded-2xl border border-border bg-card p-6">
            <div className="flex items-center gap-3">
              <Stethoscope className="h-6 w-6 text-brand" strokeWidth={1.75} />
              {c.t("sluzby.zdravotni.nadpis", "Zdravotní a ošetřovatelská péče", { as: "h4", className: "font-display text-lg text-foreground" })}
            </div>
            {c.t("sluzby.zdravotni.text", "Sledujeme zdravotní stav pacienta, plníme ordinace lékaře a zajišťujeme potřebné zdravotní a ošetřovatelské úkony. Pomáháme také při osobní hygieně, pohybu a dalších každodenních činnostech.", { as: "p", className: "mt-3 text-[15px] leading-relaxed text-muted-foreground" })}
            <div className="mt-4">
              <Accordion c={c} ckey="sluzby.zdravotni.seznam" title="Co může péče podle zdravotního stavu zahrnovat" items={["Podávání léků a dohled nad užíváním", "Sledování zdravotního stavu a fyziologických funkcí", "Aplikace injekcí", "Odběry krve", "Převazy a ošetřování ran", "Měření glykémie", "Cévkování", "Aplikace obkladů, zábalů a mastí", "Inhalace a dechová cvičení", "Výměna inkontinenčních pomůcek", "Pomoc při osobní hygieně", "Zajištění první pomoci", "Objednání a zajištění odborných vyšetření"]} />
            </div>
          </div>
          <div className="grid gap-4 md:grid-cols-2">
            <div className="rounded-2xl border border-border bg-card p-6">
              <div className="flex items-center gap-3">
                <Activity className="h-6 w-6 text-brand" strokeWidth={1.75} />
                {c.t("sluzby.rehabilitace.nadpis", "Rehabilitace a podpora soběstačnosti", { as: "h4", className: "font-display text-lg text-foreground" })}
              </div>
              {c.t("sluzby.rehabilitace.text", "Rehabilitaci přizpůsobujeme stavu a možnostem pacienta — fyzioterapie, ergoterapie, individuální cvičení, nácvik běžných činností a práce s kompenzačními pomůckami. Někdy je cílem samostatná chůze, jindy bezpečné posazení či oblékání. Každý pokrok má význam.", { as: "p", className: "mt-3 text-[15px] leading-relaxed text-muted-foreground" })}
            </div>
            <div className="rounded-2xl border border-border bg-card p-6">
              <div className="flex items-center gap-3">
                <HandHelping className="h-6 w-6 text-brand" strokeWidth={1.75} />
                {c.t("sluzby.podpora.nadpis", "Podpora pacienta a jeho rodiny", { as: "h4", className: "font-display text-lg text-foreground" })}
              </div>
              {c.t("sluzby.podpora.text", "Pomáháme pacientům i blízkým orientovat se v další péči, návratu domů nebo přechodu do jiného prostředí. Poskytujeme základní sociální poradenství a pomáháme i s žádostí do pobytové sociální služby.", { as: "p", className: "mt-3 text-[15px] leading-relaxed text-muted-foreground" })}
            </div>
          </div>
        </div>

        {/* 6. DOPLŇKOVÉ SLUŽBY */}
        <div className="mt-6">
          <Accordion c={c} ckey="sluzby.doplnkove" title="Doplňkové služby následné péče" lead="Služby, které zpříjemní pobyt nebo usnadní praktické záležitosti." items={["Nákupní služba k lůžku", "Zapůjčení rehabilitačních pomůcek", "Doprovod na kontrolní vyšetření", "Návštěva kadeřníka nebo pedikúry", "Zapůjčení knih", "Kontakt s rodinou (telefonický i písemný)", "Účast na kulturních a společenských akcích", "Účast na bohoslužbách", "Vedení individuálního účtu v depozitní pokladně"]} />
        </div>

        {/* 7. PÉČE V ZÁVĚRU ŽIVOTA */}
        <div className="mt-6 rounded-2xl border border-warm/30 bg-warm-light/40 p-6">
          <div className="flex items-center gap-3">
            <Heart className="h-6 w-6 text-warm-dark" strokeWidth={1.75} />
            {c.t("sluzby.zaver-zivota.nadpis", "Péče v závěru života", { as: "h4", className: "font-display text-lg text-foreground" })}
          </div>
          {c.t("sluzby.zaver-zivota.text", "Nevyléčitelně nemocným pacientům poskytujeme citlivou a důstojnou péči zaměřenou na zmírnění obtíží a zachování co největšího komfortu. Vnímáme také potřeby rodiny a blízkých a snažíme se jim poskytnout potřebné informace a podporu.", { as: "p", className: "mt-3 text-[15px] leading-relaxed text-foreground/80" })}
        </div>

        {/* 8. KONVERZE + 9. KONTAKT + 10. ÚHRADY */}
        <div className="mt-8 grid gap-5 lg:grid-cols-2">
          <div className="flex flex-col justify-center rounded-3xl bg-brand p-8 text-brand-foreground">
            {c.t("sluzby.np.cta.nadpis", "Chcete požádat o přijetí na následnou péči?", { as: "h4", className: "font-display text-2xl" })}
            {c.t("sluzby.np.cta.text", "Pacienty přijímáme na základě doporučení lékaře nebo překladem z nemocnice. Kompletní postup a dokumenty najdete na podstránce Žádost o přijetí.", { as: "p", className: "mt-3 text-brand-foreground/85" })}
            <div className="mt-6 flex flex-wrap gap-3">
              <Link href="/zadost-o-prijeti#nasledna-pece" className="inline-flex items-center gap-2 rounded-full bg-brand-foreground px-5 py-3 text-sm font-bold uppercase tracking-wider text-brand hover:bg-warm hover:text-warm-foreground">Jak požádat</Link>
              <Link href="/kontakt" className="inline-flex items-center gap-2 rounded-full border-2 border-brand-foreground/40 px-5 py-3 text-sm font-bold uppercase tracking-wider hover:border-warm hover:text-warm">Kontaktovat</Link>
            </div>
          </div>
          <ContactCard c={c} ckey="sluzby.np.kontakt" role="Sociální pracovnice — následná péče" name="Veronika Pištěková" hours="Pondělí–pátek, 7.00–15.30" phone="+420 317 729 647" mobile="+420 702 078 993" email="veronika.pistekova@ahc.cz" />
        </div>
        <div className="mt-6 rounded-2xl border border-border bg-card p-6">
          <div className="flex items-center gap-3">
            <Receipt className="h-6 w-6 text-brand" strokeWidth={1.75} />
            {c.t("sluzby.uhrady.nadpis", "Úhrady a ceník", { as: "h4", className: "font-display text-lg text-foreground" })}
          </div>
          {c.t("sluzby.uhrady.text", "Zdravotní péči poskytujeme podle pravidel veřejného zdravotního pojištění. Doplňkové služby jsou hrazeny podle aktuálního ceníku — úplné informace vám před nástupem poskytne sociální pracovnice.", { as: "p", className: "mt-3 text-[15px] leading-relaxed text-muted-foreground" })}
          <Link href="/dokumenty" className="mt-4 inline-flex items-center gap-1.5 text-xs font-bold uppercase tracking-wider text-brand hover:gap-2.5">Zobrazit aktuální ceník <ArrowRight className="h-3.5 w-3.5" /></Link>
        </div>
      </section>
</RegionSlot>
      <BackToChoice />

      {/* ===== DOMOV PRO SENIORY ===== */}
      <section id="domov-pro-seniory" className="scroll-mt-32 bg-secondary/30">
        <div className={`${wrap} grid items-center gap-10 py-16 lg:grid-cols-2`}>
          <div>
            {c.t("sluzby.dps.eyebrow", "Domov pro seniory", { as: "div", className: "text-[11px] font-bold uppercase tracking-[0.18em] text-warm-dark" })}
            {c.t("sluzby.dps.nadpis", "Bezpečné zázemí pro život s potřebnou podporou", { as: "h2", className: "font-display mt-2 text-3xl text-foreground sm:text-4xl" })}
            <div className="mt-4 flex flex-wrap gap-2">
              <Badge>{c.t("sluzby.dps.stitek.0", "Pro seniory od 65 let")}</Badge>
              <Badge>{c.t("sluzby.dps.stitek.1", "54 lůžek")}</Badge>
              <Badge>{c.t("sluzby.dps.stitek.2", "Bezbariérové prostředí")}</Badge>
            </div>
            <div className="mt-5 space-y-3 text-base leading-relaxed text-muted-foreground">
              {c.t("sluzby.dps.text1", "Domov pro seniory je určen lidem od 65 let, kteří kvůli věku, zdravotnímu stavu nebo životní situaci potřebují pravidelnou a nepřetržitou pomoc jiné osoby.", { as: "p" })}
              {c.t("sluzby.dps.text2", "Poskytujeme ubytování, stravování, pomoc při každodenních činnostech, zdravotní a ošetřovatelskou péči, sociální podporu i aktivizační program. Vytváříme prostředí, ve kterém se klienti cítí bezpečně a mohou žít co nejvíce podle svých zvyklostí.", { as: "p" })}
            </div>
          </div>
          {pic("sluzby.dps.foto", `${P}/spolecna.jpg`, "Domov pro seniory — společné prostory", "aspect-[4/3]")}
        </div>
        {/* 12. POMÁHÁME V KAŽDODENNÍM ŽIVOTĚ */}
        <div className={`${wrap} pb-16`}>
          {c.t("sluzby.pomoc-den.nadpis", "Pomáháme v každodenním životě", { as: "h3", className: "font-display text-2xl text-foreground" })}
          {c.t("sluzby.pomoc-den.text", "Míru pomoci přizpůsobujeme schopnostem a potřebám klienta — podporujeme vše, co stále zvládá sám.", { as: "p", className: "mt-2 text-sm text-muted-foreground" })}
          <ul className="mt-6 grid grid-cols-2 gap-3 sm:grid-cols-4">
            {HELP.map((h, i) => (
              <li key={h} className="flex items-center gap-2 rounded-xl border border-border bg-card p-3 text-sm text-foreground">
                <span className="h-1.5 w-1.5 shrink-0 rounded-full bg-brand" /> {c.t(`sluzby.pomoc-den.${i}`, h)}
              </li>
            ))}
          </ul>
        </div>
      </section>

      {/* 13. CO VŠE SLUŽBA ZAHRNUJE */}
      <RegionSlot {...c.region("sekce.sluzby.zahrnuje")}>
<section className={`${wrap} py-16`}>
        {c.t("sluzby.zahrnuje.nadpis", "Co vše služba zahrnuje", { as: "h3", className: "font-display text-2xl text-foreground sm:text-3xl" })}
        <div className="mt-8 space-y-4">
          <Accordion c={c} ckey="sluzby.zahrnuje.0" title="Zdravotní a ošetřovatelská péče" lead="Lékař dochází ve všední dny, v noci a o víkendech zajišťuje péči službu konající personál." items={["Podávání léků a dohled nad užíváním", "Sledování zdravotního stavu", "Převazy, injekce a odběry", "Měření glykémie", "Ošetřování ran", "Pomoc při hygieně", "Objednávání léků a pomůcek", "Zajištění odborných vyšetření", "Zvýšená péče v období nemoci"]} />
          <Accordion c={c} ckey="sluzby.zahrnuje.1" title="Ubytování a společné prostory" lead="Dvoulůžkové pokoje s vlastním sociálním zařízením, celá budova bezbariérová." items={["Polohovatelná lůžka, noční stolky, stůl, křesla", "Lednice, televize, internet, uzamykatelné úložné prostory", "Společné jídelny a vybavené kuchyňky", "Klubovna pro aktivity i návštěvy", "Centrální koupelny", "Terasa, dvůr a zahrada", "Vlastní kaple"]} />
          <Accordion c={c} ckey="sluzby.zahrnuje.2" title="Stravování" lead="Celodenní strava včetně dietní podle doporučení lékaře." items={["Snídaně, oběd, večeře", "Dopolední a odpolední svačiny dle dohody", "Dietní stravování (diabetická, žaludeční, žlučníková)", "Podávání v jídelně i na pokoji", "Teplé a studené nápoje po celý den", "Jídelníček sestavuje nutriční terapeutka"]} />
          <Accordion c={c} ckey="sluzby.zahrnuje.3" title="Aktivity a volný čas" lead="Nabídku přizpůsobujeme zájmům a možnostem klientů." items={["Kondiční cvičení a nácvik soběstačnosti", "Individuální rehabilitace", "Trénování paměti", "Společné zpívání", "Výtvarné činnosti", "Vaření a pečení", "Společenské hry", "Canisterapie", "Kulturní a společenské akce", "Setkání s místní školou", "Bohoslužby a mše"]} />
          <Accordion c={c} ckey="sluzby.zahrnuje.4" title="Sociální podpora" lead="Pomoc s nástupem, příspěvkem na péči i kontaktem s úřady." items={["Plánování služby a nástup do zařízení", "Žádost o příspěvek na péči", "Kontakt s úřady a vyřizování osobních záležitostí", "Uplatňování práv klienta", "Podpora kontaktu s rodinou"]} />
          <Accordion c={c} ckey="sluzby.zahrnuje.5" title="Důchod a depozitní pokladna" lead="Dobrovolná a bezpečná správa finančních prostředků." items={["Důchod lze přijímat na účet, Českou poštou i jinak", "Z depozitu lze hradit léky, nákupy nebo faktury", "Vždy se souhlasem klienta nebo zákonného zástupce"]} />
        </div>

        {/* 15. KONVERZE + 16. KONTAKT */}
        <div className="mt-8 grid gap-5 lg:grid-cols-2">
          <div className="flex flex-col justify-center rounded-3xl bg-brand p-8 text-brand-foreground">
            {c.t("sluzby.dps.cta.nadpis", "Chcete požádat o přijetí do domova pro seniory?", { as: "h4", className: "font-display text-2xl" })}
            {c.t("sluzby.dps.cta.text", "Stačí vyplnit žádost a doložit dokumenty. Kompletní postup, formuláře i pokyny k nástupu najdete na podstránce Žádost o přijetí.", { as: "p", className: "mt-3 text-brand-foreground/85" })}
            <div className="mt-6 flex flex-wrap gap-3">
              <Link href="/zadost-o-prijeti#domov-pro-seniory" className="inline-flex items-center gap-2 rounded-full bg-brand-foreground px-5 py-3 text-sm font-bold uppercase tracking-wider text-brand hover:bg-warm hover:text-warm-foreground">Jak požádat</Link>
              <Link href="/kontakt" className="inline-flex items-center gap-2 rounded-full border-2 border-brand-foreground/40 px-5 py-3 text-sm font-bold uppercase tracking-wider hover:border-warm hover:text-warm">Domluvit prohlídku</Link>
            </div>
          </div>
          <ContactCard c={c} ckey="sluzby.dps.kontakt" role="Sociální pracovnice — domov pro seniory" name="Markéta Mašková" hours="Pondělí–pátek, 7.00–15.30" phone="+420 317 729 647" mobile="+420 720 840 462" email="marketa.maskova@ahc.cz" />
        </div>
      </section>
</RegionSlot>
      <BackToChoice />

      {/* 17. PRAKTICKÉ ODKAZY */}
      <RegionSlot {...c.region("sekce.sluzby.odkazy")}>
<section className={`${wrap} pb-16`}>
        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
          {ODKAZY.map((o, i) => (
            <RegionSlot key={o.t} className="h-full" {...c.region(`sluzby.odkazy.${i}`)}>
            <Link href={o.href} className={`group block h-full rounded-2xl border p-5 transition-all hover:-translate-y-1 hover:shadow-md ${o.primary ? "border-transparent bg-brand text-brand-foreground" : "border-border bg-card"}`}>
              <o.icon className={`h-6 w-6 ${o.primary ? "text-brand-foreground" : "text-brand"}`} strokeWidth={1.75} />
              {c.t(`sluzby.odkazy.${i}.nadpis`, o.t, { as: "h4", className: `font-display mt-3 text-lg ${o.primary ? "text-brand-foreground" : "text-foreground"}` })}
              {c.t(`sluzby.odkazy.${i}.text`, o.d, { as: "p", className: `mt-1.5 text-sm leading-relaxed ${o.primary ? "text-brand-foreground/85" : "text-muted-foreground"}` })}
            </Link>
            </RegionSlot>
          ))}
        </div>
      </section>
</RegionSlot>

      {/* 18. ZÁVĚREČNÁ VÝZVA */}
      <RegionSlot {...c.region("sekce.sluzby.zaver")}>
<section className={`${wrap} pb-20`}>
        <div className="overflow-hidden rounded-[2.5rem] bg-gradient-to-br from-brand-dark via-brand to-brand-dark p-10 text-center text-brand-foreground sm:p-14">
          {c.t("sluzby.zaver.nadpis", "Nevíte, která služba odpovídá vaší situaci?", { as: "h2", className: "font-display mx-auto block max-w-2xl text-3xl leading-tight sm:text-4xl" })}
          {c.t("sluzby.zaver.text", "Nemusíte se rozhodovat sami. Ozvěte se nám, popište svou situaci a společně projdeme možnosti vhodné pro vás nebo vašeho blízkého.", { as: "p", className: "mx-auto mt-4 block max-w-xl text-brand-foreground/85" })}
          <div className="mt-8 flex flex-wrap justify-center gap-3">
            <Link href="/zadost-o-prijeti" className="inline-flex items-center gap-2 rounded-full bg-brand-foreground px-6 py-3 text-sm font-bold uppercase tracking-wider text-brand hover:bg-warm hover:text-warm-foreground">Jak požádat o přijetí</Link>
            <Link href="/kontakt" className="inline-flex items-center gap-2 rounded-full border-2 border-brand-foreground/40 px-6 py-3 text-sm font-bold uppercase tracking-wider hover:border-warm hover:text-warm">Kontaktovat nás</Link>
          </div>
        </div>
      </section>
</RegionSlot>
    </>
  );
}
