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

const wrap = "mx-auto max-w-[1320px] px-6 lg:px-10";
const P = "/images/sedlec";

function Pic({
  src,
  alt,
  className = "",
  rounded = "rounded-3xl",
}: {
  src: string;
  alt: string;
  className?: string;
  rounded?: string;
}) {
  return (
    <div className={`relative overflow-hidden bg-muted ${rounded} ${className}`}>
      <Image src={src} alt={alt} fill sizes="(min-width:1024px) 50vw, 100vw" className="object-cover" />
    </div>
  );
}

function Badge({ children }: { children: React.ReactNode }) {
  return (
    <span className="inline-flex items-center rounded-full bg-brand-light px-3 py-1 text-xs font-semibold text-brand">
      {children}
    </span>
  );
}

function Accordion({
  title,
  lead,
  items,
}: {
  title: string;
  lead?: string;
  items: string[];
}) {
  return (
    <details className="group rounded-2xl border border-border bg-card p-5 [&_summary]:list-none">
      <summary className="flex cursor-pointer items-center justify-between gap-3">
        <span>
          <span className="font-display text-lg text-foreground">{title}</span>
          {lead ? (
            <span className="mt-1 block text-sm text-muted-foreground">
              {lead}
            </span>
          ) : null}
        </span>
        <ChevronDown className="h-5 w-5 shrink-0 text-brand transition-transform group-open:rotate-180" />
      </summary>
      <ul className="mt-4 grid gap-2 sm:grid-cols-2">
        {items.map((it) => (
          <li key={it} className="flex items-start gap-2 text-sm text-foreground">
            <span className="mt-1.5 h-1.5 w-1.5 shrink-0 rounded-full bg-brand" />
            {it}
          </li>
        ))}
      </ul>
    </details>
  );
}

function ContactCard({
  role,
  name,
  hours,
  phone,
  mobile,
  email,
}: {
  role: string;
  name: string;
  hours: string;
  phone: string;
  mobile: string;
  email: string;
}) {
  return (
    <div className="rounded-2xl border border-border bg-card p-6">
      <div className="text-[11px] font-bold uppercase tracking-[0.18em] text-warm-dark">
        {role}
      </div>
      <div className="font-display mt-2 text-xl text-foreground">{name}</div>
      <div className="mt-1 text-sm text-muted-foreground">{hours}</div>
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
export function ServicesSedlec() {
  return (
    <>
      {/* 1. ÚVOD + VÝBĚR SLUŽBY */}
      <section id="vyber-sluzby" className="scroll-mt-24 bg-gradient-to-b from-brand-light/40 to-background">
        <div className={`${wrap} py-14 lg:py-16`}>
          <div className="mx-auto max-w-3xl text-center">
            <div className="text-xs font-bold uppercase tracking-[0.22em] text-warm-dark">Služby</div>
            <h1 className="font-display mt-3 text-4xl text-foreground sm:text-5xl">
              Správná péče začíná porozuměním tomu, co právě potřebujete
            </h1>
            <p className="mt-5 text-base leading-relaxed text-muted-foreground">
              V AHC Centru následné péče Sedlec-Prčice poskytujeme dvě hlavní služby. Vyberte možnost, která nejlépe vystihuje potřeby vás nebo vašeho blízkého.
            </p>
          </div>
          <div className="mt-10 grid gap-5 md:grid-cols-2">
            {[
              { href: "#nasledna-pece", t: "Potřebuji následnou lůžkovou péči", d: "Pro pacienty po hospitalizaci, operaci, úrazu nebo zhoršení zdravotního stavu, kteří potřebují odborné doléčení, ošetřovatelskou péči nebo rehabilitaci.", btn: "Zjistit více o následné péči", img: `${P}/pokoj-1.jpg` },
              { href: "#domov-pro-seniory", t: "Hledám domov pro blízkého", d: "Pro seniory od 65 let, kteří potřebují pravidelnou či nepřetržitou pomoc a bezpečné pobytové zázemí.", btn: "Zjistit více o domově pro seniory", img: `${P}/spolecna.jpg` },
            ].map((c) => (
              <Link key={c.href} href={c.href} className="group overflow-hidden rounded-3xl border border-border bg-card transition-all hover:-translate-y-1 hover:border-brand/40 hover:shadow-lg">
                <Pic src={c.img} alt={c.t} rounded="rounded-none" className="aspect-[16/9]" />
                <div className="p-7">
                  <h2 className="font-display text-xl text-foreground sm:text-2xl group-hover:text-brand">{c.t}</h2>
                  <p className="mt-2 text-[15px] leading-relaxed text-muted-foreground">{c.d}</p>
                  <span className="mt-4 inline-flex items-center gap-1.5 text-xs font-bold uppercase tracking-wider text-brand">
                    {c.btn} <ArrowRight className="h-3.5 w-3.5" />
                  </span>
                </div>
              </Link>
            ))}
          </div>
        </div>
      </section>

      {/* 2. STICKY NAVIGACE */}
      <ServicesStickyNav />

      {/* 3. NEJSTE SI JISTÍ */}
      <section className={`${wrap} py-10`}>
        <div className="flex flex-col items-center gap-4 rounded-3xl bg-secondary/50 p-8 text-center sm:flex-row sm:justify-between sm:text-left">
          <div className="flex items-center gap-4">
            <UserCheck className="hidden h-8 w-8 shrink-0 text-warm sm:block" strokeWidth={1.5} />
            <p className="max-w-xl text-base text-foreground">
              <strong>Nemusíte se v jednotlivých typech péče orientovat sami.</strong> Popište nám svou situaci a naše sociální pracovnice vám poradí, jaký postup by mohl být vhodný.
            </p>
          </div>
          <Link href="/kontakt" className="inline-flex shrink-0 items-center gap-2 rounded-full bg-brand px-6 py-3 text-sm font-semibold text-brand-foreground hover:bg-brand-dark">
            Poradit se se sociální pracovnicí
          </Link>
        </div>
      </section>

      {/* ===== NÁSLEDNÁ LŮŽKOVÁ PÉČE ===== */}
      <section id="nasledna-pece" className="scroll-mt-32 bg-secondary/30">
        <div className={`${wrap} grid items-center gap-10 py-16 lg:grid-cols-2`}>
          <Pic src={`${P}/koupelna-2.jpg`} alt="Zázemí následné péče" className="aspect-[4/3]" />
          <div>
            <div className="text-[11px] font-bold uppercase tracking-[0.18em] text-warm-dark">Následná lůžková péče</div>
            <h2 className="font-display mt-2 text-3xl text-foreground sm:text-4xl">Čas na doléčení, rehabilitaci a návrat k větší soběstačnosti</h2>
            <div className="mt-4 flex flex-wrap gap-2">
              <Badge>Nepřetržitá péče</Badge><Badge>Odborné doléčení</Badge><Badge>Rehabilitace</Badge>
            </div>
            <div className="mt-5 space-y-3 text-base leading-relaxed text-muted-foreground">
              <p>Následnou lůžkovou péči poskytujeme pacientům, jejichž zdravotní stav byl po akutním onemocnění, operaci, úrazu nebo zhoršení chronické nemoci stabilizován, ale stále vyžaduje odborné doléčení, pravidelnou ošetřovatelskou péči nebo léčebnou rehabilitaci.</p>
              <p>Péči zajišťujeme nepřetržitě. Každému pacientovi nastavujeme podporu podle jeho aktuálního stavu, možností a cílů.</p>
            </div>
          </div>
        </div>
        <div className={`${wrap} pb-16`}>
          <h3 className="font-display text-2xl text-foreground">Naším cílem je</h3>
          <ul className="mt-6 grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
            {GOALS.map((g) => (
              <li key={g.t} className="flex items-start gap-3 rounded-2xl border border-border bg-card p-5">
                <span className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-brand-light text-brand">
                  <g.icon className="h-5 w-5" strokeWidth={1.75} />
                </span>
                <span className="text-[15px] font-medium text-foreground">{g.t}</span>
              </li>
            ))}
          </ul>
        </div>
      </section>

      {/* 5. PÉČI PROPOJUJEME */}
      <section className={`${wrap} py-16`}>
        <h3 className="font-display text-2xl text-foreground sm:text-3xl">Péči propojujeme podle potřeb pacienta</h3>
        <div className="mt-8 space-y-4">
          <div className="rounded-2xl border border-border bg-card p-6">
            <div className="flex items-center gap-3">
              <Stethoscope className="h-6 w-6 text-brand" strokeWidth={1.75} />
              <h4 className="font-display text-lg text-foreground">Zdravotní a ošetřovatelská péče</h4>
            </div>
            <p className="mt-3 text-[15px] leading-relaxed text-muted-foreground">Sledujeme zdravotní stav pacienta, plníme ordinace lékaře a zajišťujeme potřebné zdravotní a ošetřovatelské úkony. Pomáháme také při osobní hygieně, pohybu a dalších každodenních činnostech.</p>
            <div className="mt-4">
              <Accordion title="Co může péče podle zdravotního stavu zahrnovat" items={["Podávání léků a dohled nad užíváním", "Sledování zdravotního stavu a fyziologických funkcí", "Aplikace injekcí", "Odběry krve", "Převazy a ošetřování ran", "Měření glykémie", "Cévkování", "Aplikace obkladů, zábalů a mastí", "Inhalace a dechová cvičení", "Výměna inkontinenčních pomůcek", "Pomoc při osobní hygieně", "Zajištění první pomoci", "Objednání a zajištění odborných vyšetření"]} />
            </div>
          </div>
          <div className="grid gap-4 md:grid-cols-2">
            <div className="rounded-2xl border border-border bg-card p-6">
              <div className="flex items-center gap-3">
                <Activity className="h-6 w-6 text-brand" strokeWidth={1.75} />
                <h4 className="font-display text-lg text-foreground">Rehabilitace a podpora soběstačnosti</h4>
              </div>
              <p className="mt-3 text-[15px] leading-relaxed text-muted-foreground">Rehabilitaci přizpůsobujeme stavu a možnostem pacienta — fyzioterapie, ergoterapie, individuální cvičení, nácvik běžných činností a práce s kompenzačními pomůckami. Někdy je cílem samostatná chůze, jindy bezpečné posazení či oblékání. Každý pokrok má význam.</p>
            </div>
            <div className="rounded-2xl border border-border bg-card p-6">
              <div className="flex items-center gap-3">
                <HandHelping className="h-6 w-6 text-brand" strokeWidth={1.75} />
                <h4 className="font-display text-lg text-foreground">Podpora pacienta a jeho rodiny</h4>
              </div>
              <p className="mt-3 text-[15px] leading-relaxed text-muted-foreground">Pomáháme pacientům i blízkým orientovat se v další péči, návratu domů nebo přechodu do jiného prostředí. Poskytujeme základní sociální poradenství a pomáháme i s žádostí do pobytové sociální služby.</p>
            </div>
          </div>
        </div>

        {/* 6. DOPLŇKOVÉ SLUŽBY */}
        <div className="mt-6">
          <Accordion title="Doplňkové služby následné péče" lead="Služby, které zpříjemní pobyt nebo usnadní praktické záležitosti." items={["Nákupní služba k lůžku", "Zapůjčení rehabilitačních pomůcek", "Doprovod na kontrolní vyšetření", "Návštěva kadeřníka nebo pedikúry", "Zapůjčení knih", "Kontakt s rodinou (telefonický i písemný)", "Účast na kulturních a společenských akcích", "Účast na bohoslužbách", "Vedení individuálního účtu v depozitní pokladně"]} />
        </div>

        {/* 7. PÉČE V ZÁVĚRU ŽIVOTA */}
        <div className="mt-6 rounded-2xl border border-warm/30 bg-warm-light/40 p-6">
          <div className="flex items-center gap-3">
            <Heart className="h-6 w-6 text-warm-dark" strokeWidth={1.75} />
            <h4 className="font-display text-lg text-foreground">Péče v závěru života</h4>
          </div>
          <p className="mt-3 text-[15px] leading-relaxed text-foreground/80">Nevyléčitelně nemocným pacientům poskytujeme citlivou a důstojnou péči zaměřenou na zmírnění obtíží a zachování co největšího komfortu. Vnímáme také potřeby rodiny a blízkých a snažíme se jim poskytnout potřebné informace a podporu.</p>
        </div>

        {/* 8. KONVERZE + 9. KONTAKT + 10. ÚHRADY */}
        <div className="mt-8 grid gap-5 lg:grid-cols-2">
          <div className="flex flex-col justify-center rounded-3xl bg-brand p-8 text-brand-foreground">
            <h4 className="font-display text-2xl">Chcete požádat o přijetí na následnou péči?</h4>
            <p className="mt-3 text-brand-foreground/85">Pacienty přijímáme na základě doporučení lékaře nebo překladem z nemocnice. Kompletní postup a dokumenty najdete na podstránce Žádost o přijetí.</p>
            <div className="mt-6 flex flex-wrap gap-3">
              <Link href="/zadost-o-prijeti#nasledna-pece" className="inline-flex items-center gap-2 rounded-full bg-brand-foreground px-5 py-3 text-sm font-bold uppercase tracking-wider text-brand hover:bg-warm hover:text-warm-foreground">Jak požádat</Link>
              <Link href="/kontakt" className="inline-flex items-center gap-2 rounded-full border-2 border-brand-foreground/40 px-5 py-3 text-sm font-bold uppercase tracking-wider hover:border-warm hover:text-warm">Kontaktovat</Link>
            </div>
          </div>
          <ContactCard role="Sociální pracovnice — následná péče" name="Veronika Pištěková" hours="Pondělí–pátek, 7.00–15.30" phone="+420 317 729 647" mobile="+420 702 078 993" email="veronika.pistekova@ahc.cz" />
        </div>
        <div className="mt-6 rounded-2xl border border-border bg-card p-6">
          <div className="flex items-center gap-3">
            <Receipt className="h-6 w-6 text-brand" strokeWidth={1.75} />
            <h4 className="font-display text-lg text-foreground">Úhrady a ceník</h4>
          </div>
          <p className="mt-3 text-[15px] leading-relaxed text-muted-foreground">Zdravotní péči poskytujeme podle pravidel veřejného zdravotního pojištění. Doplňkové služby jsou hrazeny podle aktuálního ceníku — úplné informace vám před nástupem poskytne sociální pracovnice.</p>
          <Link href="/dokumenty" className="mt-4 inline-flex items-center gap-1.5 text-xs font-bold uppercase tracking-wider text-brand hover:gap-2.5">Zobrazit aktuální ceník <ArrowRight className="h-3.5 w-3.5" /></Link>
        </div>
      </section>
      <BackToChoice />

      {/* ===== DOMOV PRO SENIORY ===== */}
      <section id="domov-pro-seniory" className="scroll-mt-32 bg-secondary/30">
        <div className={`${wrap} grid items-center gap-10 py-16 lg:grid-cols-2`}>
          <div>
            <div className="text-[11px] font-bold uppercase tracking-[0.18em] text-warm-dark">Domov pro seniory</div>
            <h2 className="font-display mt-2 text-3xl text-foreground sm:text-4xl">Bezpečné zázemí pro život s potřebnou podporou</h2>
            <div className="mt-4 flex flex-wrap gap-2">
              <Badge>Pro seniory od 65 let</Badge><Badge>54 lůžek</Badge><Badge>Bezbariérové prostředí</Badge>
            </div>
            <div className="mt-5 space-y-3 text-base leading-relaxed text-muted-foreground">
              <p>Domov pro seniory je určen lidem od 65 let, kteří kvůli věku, zdravotnímu stavu nebo životní situaci potřebují pravidelnou a nepřetržitou pomoc jiné osoby.</p>
              <p>Poskytujeme ubytování, stravování, pomoc při každodenních činnostech, zdravotní a ošetřovatelskou péči, sociální podporu i aktivizační program. Vytváříme prostředí, ve kterém se klienti cítí bezpečně a mohou žít co nejvíce podle svých zvyklostí.</p>
            </div>
          </div>
          <Pic src={`${P}/spolecna.jpg`} alt="Domov pro seniory — společné prostory" className="aspect-[4/3]" />
        </div>
        {/* 12. POMÁHÁME V KAŽDODENNÍM ŽIVOTĚ */}
        <div className={`${wrap} pb-16`}>
          <h3 className="font-display text-2xl text-foreground">Pomáháme v každodenním životě</h3>
          <p className="mt-2 text-sm text-muted-foreground">Míru pomoci přizpůsobujeme schopnostem a potřebám klienta — podporujeme vše, co stále zvládá sám.</p>
          <ul className="mt-6 grid grid-cols-2 gap-3 sm:grid-cols-4">
            {HELP.map((h) => (
              <li key={h} className="flex items-center gap-2 rounded-xl border border-border bg-card p-3 text-sm text-foreground">
                <span className="h-1.5 w-1.5 shrink-0 rounded-full bg-brand" /> {h}
              </li>
            ))}
          </ul>
        </div>
      </section>

      {/* 13. CO VŠE SLUŽBA ZAHRNUJE */}
      <section className={`${wrap} py-16`}>
        <h3 className="font-display text-2xl text-foreground sm:text-3xl">Co vše služba zahrnuje</h3>
        <div className="mt-8 space-y-4">
          <Accordion title="Zdravotní a ošetřovatelská péče" lead="Lékař dochází ve všední dny, v noci a o víkendech zajišťuje péči službu konající personál." items={["Podávání léků a dohled nad užíváním", "Sledování zdravotního stavu", "Převazy, injekce a odběry", "Měření glykémie", "Ošetřování ran", "Pomoc při hygieně", "Objednávání léků a pomůcek", "Zajištění odborných vyšetření", "Zvýšená péče v období nemoci"]} />
          <Accordion title="Ubytování a společné prostory" lead="Dvoulůžkové pokoje s vlastním sociálním zařízením, celá budova bezbariérová." items={["Polohovatelná lůžka, noční stolky, stůl, křesla", "Lednice, televize, internet, uzamykatelné úložné prostory", "Společné jídelny a vybavené kuchyňky", "Klubovna pro aktivity i návštěvy", "Centrální koupelny", "Terasa, dvůr a zahrada", "Vlastní kaple"]} />
          <Accordion title="Stravování" lead="Celodenní strava včetně dietní podle doporučení lékaře." items={["Snídaně, oběd, večeře", "Dopolední a odpolední svačiny dle dohody", "Dietní stravování (diabetická, žaludeční, žlučníková)", "Podávání v jídelně i na pokoji", "Teplé a studené nápoje po celý den", "Jídelníček sestavuje nutriční terapeutka"]} />
          <Accordion title="Aktivity a volný čas" lead="Nabídku přizpůsobujeme zájmům a možnostem klientů." items={["Kondiční cvičení a nácvik soběstačnosti", "Individuální rehabilitace", "Trénování paměti", "Společné zpívání", "Výtvarné činnosti", "Vaření a pečení", "Společenské hry", "Canisterapie", "Kulturní a společenské akce", "Setkání s místní školou", "Bohoslužby a mše"]} />
          <Accordion title="Sociální podpora" lead="Pomoc s nástupem, příspěvkem na péči i kontaktem s úřady." items={["Plánování služby a nástup do zařízení", "Žádost o příspěvek na péči", "Kontakt s úřady a vyřizování osobních záležitostí", "Uplatňování práv klienta", "Podpora kontaktu s rodinou"]} />
          <Accordion title="Důchod a depozitní pokladna" lead="Dobrovolná a bezpečná správa finančních prostředků." items={["Důchod lze přijímat na účet, Českou poštou i jinak", "Z depozitu lze hradit léky, nákupy nebo faktury", "Vždy se souhlasem klienta nebo zákonného zástupce"]} />
        </div>

        {/* 15. KONVERZE + 16. KONTAKT */}
        <div className="mt-8 grid gap-5 lg:grid-cols-2">
          <div className="flex flex-col justify-center rounded-3xl bg-brand p-8 text-brand-foreground">
            <h4 className="font-display text-2xl">Chcete požádat o přijetí do domova pro seniory?</h4>
            <p className="mt-3 text-brand-foreground/85">Stačí vyplnit žádost a doložit dokumenty. Kompletní postup, formuláře i pokyny k nástupu najdete na podstránce Žádost o přijetí.</p>
            <div className="mt-6 flex flex-wrap gap-3">
              <Link href="/zadost-o-prijeti#domov-pro-seniory" className="inline-flex items-center gap-2 rounded-full bg-brand-foreground px-5 py-3 text-sm font-bold uppercase tracking-wider text-brand hover:bg-warm hover:text-warm-foreground">Jak požádat</Link>
              <Link href="/kontakt" className="inline-flex items-center gap-2 rounded-full border-2 border-brand-foreground/40 px-5 py-3 text-sm font-bold uppercase tracking-wider hover:border-warm hover:text-warm">Domluvit prohlídku</Link>
            </div>
          </div>
          <ContactCard role="Sociální pracovnice — domov pro seniory" name="Markéta Mašková" hours="Pondělí–pátek, 7.00–15.30" phone="+420 317 729 647" mobile="+420 720 840 462" email="marketa.maskova@ahc.cz" />
        </div>
      </section>
      <BackToChoice />

      {/* 17. PRAKTICKÉ ODKAZY */}
      <section className={`${wrap} pb-16`}>
        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
          {[
            { icon: ClipboardList, t: "Žádost o přijetí", d: "Postupy pro obě služby, dokumenty a pokyny k nástupu.", href: "/zadost-o-prijeti", primary: true },
            { icon: FileText, t: "Dokumenty", d: "Žádosti, lékařské zprávy, souhlasy a formuláře.", href: "/dokumenty" },
            { icon: Receipt, t: "Ceníky", d: "Aktuální informace o úhradách a službách.", href: "/dokumenty" },
            { icon: ContactIcon, t: "Kontakty", d: "Sociální pracovnice a jednotlivá pracoviště.", href: "/kontakt" },
          ].map((c) => (
            <Link key={c.t} href={c.href} className={`group rounded-2xl border p-5 transition-all hover:-translate-y-1 hover:shadow-md ${c.primary ? "border-transparent bg-brand text-brand-foreground" : "border-border bg-card"}`}>
              <c.icon className={`h-6 w-6 ${c.primary ? "text-brand-foreground" : "text-brand"}`} strokeWidth={1.75} />
              <h4 className={`font-display mt-3 text-lg ${c.primary ? "text-brand-foreground" : "text-foreground"}`}>{c.t}</h4>
              <p className={`mt-1.5 text-sm leading-relaxed ${c.primary ? "text-brand-foreground/85" : "text-muted-foreground"}`}>{c.d}</p>
            </Link>
          ))}
        </div>
      </section>

      {/* 18. ZÁVĚREČNÁ VÝZVA */}
      <section className={`${wrap} pb-20`}>
        <div className="overflow-hidden rounded-[2.5rem] bg-gradient-to-br from-brand-dark via-brand to-brand-dark p-10 text-center text-brand-foreground sm:p-14">
          <h2 className="font-display mx-auto max-w-2xl text-3xl leading-tight sm:text-4xl">Nevíte, která služba odpovídá vaší situaci?</h2>
          <p className="mx-auto mt-4 max-w-xl text-brand-foreground/85">Nemusíte se rozhodovat sami. Ozvěte se nám, popište svou situaci a společně projdeme možnosti vhodné pro vás nebo vašeho blízkého.</p>
          <div className="mt-8 flex flex-wrap justify-center gap-3">
            <Link href="/zadost-o-prijeti" className="inline-flex items-center gap-2 rounded-full bg-brand-foreground px-6 py-3 text-sm font-bold uppercase tracking-wider text-brand hover:bg-warm hover:text-warm-foreground">Jak požádat o přijetí</Link>
            <Link href="/kontakt" className="inline-flex items-center gap-2 rounded-full border-2 border-brand-foreground/40 px-6 py-3 text-sm font-bold uppercase tracking-wider hover:border-warm hover:text-warm">Kontaktovat nás</Link>
          </div>
        </div>
      </section>
    </>
  );
}
