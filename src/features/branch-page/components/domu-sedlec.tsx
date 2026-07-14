import Image from "next/image";
import Link from "next/link";
import {
  ArrowRight, ArrowUpRight, Phone, Mail, Quote,
  Stethoscope, Home, Trees, HeartHandshake, ShieldCheck, UserCheck, Users,
  ClipboardList, Contact as ContactIcon, FileText, Briefcase,
  BedDouble, MapPin, DoorOpen,
} from "lucide-react";
import { ChatCtaSection } from "@/features/branch-home/components/chat-cta-section";
import { BiographicalConceptSection } from "@/features/branch-home/components/biographical-concept-section";
import { GrantsSection } from "@/features/branch-home/components/eu-grant-section";
import type { Branch } from "@/convex/lib/types";
import type { BranchGrant } from "@/convex/lib/types";

const MAP_URL = "https://www.google.com/maps?q=" + encodeURIComponent("AHC Centrum následné péče Sedlec-Prčice, Vítkovo náměstí 3, Sedlec-Prčice") + "&hl=cs&z=14&output=embed";

const wrap = "mx-auto max-w-[1320px] px-6 lg:px-10";
const P = "/images/sedlec";

function Pic({ src, alt, className = "", rounded = "rounded-3xl" }: { src: string; alt: string; className?: string; rounded?: string }) {
  return <div className={`relative overflow-hidden bg-muted ${rounded} ${className}`}><Image src={src} alt={alt} fill sizes="(min-width:1024px) 50vw, 100vw" className="object-cover" /></div>;
}

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

/** Bespoke domovská stránka pro Sedlec-Prčice dle obsahové specifikace. */
export function DomuSedlec({ branch, grants }: { branch: Branch | null; grants: BranchGrant[] }) {
  const facebookUrl = branch?.facebook_url;
  return (
    <>
      {/* 1. HERO */}
      <section className="relative overflow-hidden bg-gradient-to-b from-brand-light/40 to-background">
        <div className={`${wrap} grid items-center gap-10 py-14 lg:grid-cols-2 lg:py-20`}>
          <div>
            <div className="flex items-center gap-3 text-xs font-bold uppercase tracking-[0.22em] text-brand">
              <span className="h-px w-10 bg-warm" /> Sedlec-Prčice
              <span className="text-muted-foreground/50">·</span>
              <span className="text-muted-foreground">Centrum následné péče</span>
            </div>
            <h1 className="font-display mt-5 text-4xl leading-[1.08] text-foreground sm:text-5xl lg:text-[3.4rem]">
              Péče, ve které je člověk <span className="text-brand">vždy na prvním místě</span>
            </h1>
            <p className="mt-6 max-w-xl text-lg leading-[1.7] text-muted-foreground">
              Poskytujeme odbornou zdravotní a sociální péči lidem, kteří potřebují čas, podporu a bezpečné prostředí. Pomáháme pacientům při doléčení a návratu k soběstačnosti a seniorům vytváříme místo, kde mohou prožívat každý den důstojně.
            </p>
            <div className="mt-8 flex flex-wrap gap-3">
              <Link href="/zadost-o-prijeti" className="inline-flex items-center gap-2 rounded-full bg-brand px-7 py-3.5 text-sm font-semibold text-brand-foreground shadow-md shadow-brand/15 transition-colors hover:bg-brand-dark">
                Jak požádat o přijetí <ArrowRight className="h-4 w-4" />
              </Link>
              <Link href="/sluzby" className="inline-flex items-center gap-2 rounded-full border border-border bg-background px-6 py-3.5 text-sm font-semibold text-foreground hover:border-brand hover:text-brand">Poznat naše služby</Link>
              <Link href="/kontakt" className="inline-flex items-center gap-2 rounded-full px-5 py-3.5 text-sm font-semibold text-foreground/70 hover:text-brand">Kontaktovat nás</Link>
            </div>
          </div>
          <Pic src={`${P}/budova.jpg`} alt="AHC Centrum následné péče Sedlec-Prčice" className="aspect-[4/3] shadow-lg lg:aspect-[5/4]" />
        </div>
      </section>

      {/* 2. RYCHLÁ ORIENTACE */}
      <section className={`${wrap} pb-4`}>
        <div className="grid gap-4 rounded-3xl border border-border bg-card p-6 sm:grid-cols-3">
          {[
            { icon: Stethoscope, t: "Následná lůžková péče", d: "Doléčení, ošetřovatelská péče a rehabilitace po hospitalizaci, operaci nebo úrazu." },
            { icon: Home, t: "Domov pro seniory", d: "Bezpečné a důstojné zázemí pro seniory, kteří potřebují pravidelnou pomoc." },
            { icon: Trees, t: "Sedlec-Prčice", d: "Klidné prostředí, odborný tým a péče s respektem k člověku i jeho rodině." },
          ].map((c) => (
            <div key={c.t} className="flex items-start gap-3">
              <c.icon className="mt-0.5 h-6 w-6 shrink-0 text-brand" strokeWidth={1.75} />
              <div><div className="font-display text-base text-foreground">{c.t}</div><p className="mt-1 text-sm leading-relaxed text-muted-foreground">{c.d}</p></div>
            </div>
          ))}
        </div>
      </section>

      {/* 3. NEMUSÍTE BÝT SAMI */}
      <section className={`${wrap} grid items-center gap-10 py-16 lg:grid-cols-[1.1fr_1fr] lg:py-20`}>
        <div>
          <h2 className="font-display text-3xl text-foreground sm:text-4xl">Najít správnou péči není jednoduché rozhodnutí</h2>
          <div className="mt-5 space-y-4 text-base leading-relaxed text-muted-foreground">
            <p>Často přichází ve chvíli, kdy se zdravotní stav změnil rychleji, než rodina očekávala. Jindy se postupně ukazuje, že domácí prostředí již nedokáže nabídnout všechnu potřebnou podporu.</p>
            <p>V takové situaci nemusíte znát všechny odborné pojmy ani předem vědět, která služba je správná. Vyslechneme vaši situaci, vysvětlíme možnosti a pomůžeme vám zorientovat se v dalším postupu.</p>
          </div>
          <blockquote className="mt-6 border-l-4 border-warm pl-5 font-display text-xl leading-snug text-foreground">
            Protože dobrá péče nezačíná u diagnózy. Začíná u člověka.
          </blockquote>
          <Link href="/kontakt" className="mt-6 inline-flex items-center gap-2 rounded-full bg-brand px-6 py-3 text-sm font-semibold text-brand-foreground hover:bg-brand-dark">Poradit se o možnostech péče</Link>
        </div>
        <Pic src={`${P}/exterier-1.jpg`} alt="Podpora a bezpečí" className="aspect-[4/3]" />
      </section>

      {/* 4. VYBERTE SLUŽBU */}
      <section className="bg-secondary/40">
        <div className={`${wrap} py-16 lg:py-20`}>
          <h2 className="font-display text-center text-3xl text-foreground sm:text-4xl">Vyberte službu podle své situace</h2>
          <div className="mt-10 grid gap-6 md:grid-cols-2">
            {[
              { t: "Potřebuji následnou lůžkovou péči", d: "Pomáháme pacientům, jejichž stav již nevyžaduje akutní léčbu, ale stále potřebují doléčení, ošetřovatelskou péči nebo rehabilitaci. Společně pracujeme na stabilizaci stavu, obnovení síly a soběstačnosti.", img: `${P}/pokoj-1.jpg` },
              { t: "Hledám domov pro blízkého", d: "Poskytujeme bezpečné zázemí seniorům od 65 let, kteří potřebují pravidelnou pomoc. Pomáháme při každodenních činnostech a podporujeme jejich schopnosti, zvyklosti, vztahy i možnost rozhodovat o vlastním životě.", img: `${P}/exterier-3.jpg` },
            ].map((c) => (
              <div key={c.t} className="overflow-hidden rounded-3xl border border-border bg-card">
                <Pic src={c.img} alt={c.t} rounded="rounded-none" className="aspect-[16/9]" />
                <div className="p-7">
                  <h3 className="font-display text-xl text-foreground sm:text-2xl">{c.t}</h3>
                  <p className="mt-2 text-[15px] leading-relaxed text-muted-foreground">{c.d}</p>
                  <div className="mt-5 flex flex-wrap gap-2">
                    <Link href="/sluzby" className="rounded-full bg-brand px-5 py-2.5 text-xs font-bold uppercase tracking-wider text-brand-foreground hover:bg-brand-dark">Více o službě</Link>
                    <Link href="/zadost-o-prijeti" className="rounded-full border border-border px-5 py-2.5 text-xs font-bold uppercase tracking-wider text-foreground hover:border-brand hover:text-brand">Jak požádat</Link>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* 5. NA ČEM NÁM ZÁLEŽÍ */}
      <section className={`${wrap} py-16 lg:py-20`}>
        <h2 className="font-display text-center text-3xl text-foreground sm:text-4xl">Na čem nám záleží</h2>
        <div className="mt-10 grid gap-5 sm:grid-cols-2 lg:grid-cols-4">
          {VALUES.map((v) => (
            <div key={v.t} className="rounded-2xl border border-border bg-card p-6">
              <span className="flex h-11 w-11 items-center justify-center rounded-2xl bg-brand-light text-brand"><v.icon className="h-5 w-5" strokeWidth={1.75} /></span>
              <h3 className="font-display mt-4 text-lg text-foreground">{v.t}</h3>
              <p className="mt-2 text-sm leading-relaxed text-muted-foreground">{v.d}</p>
            </div>
          ))}
        </div>
        <div className="mt-8 text-center">
          <Link href="/o-nas" className="inline-flex items-center gap-1.5 text-sm font-bold uppercase tracking-wider text-brand hover:gap-2.5">Více o našem přístupu <ArrowRight className="h-4 w-4" /></Link>
        </div>
      </section>

      {/* 6. ŽIVOT U NÁS */}
      <section className="bg-secondary/40">
        <div className={`${wrap} py-16 lg:py-20`}>
          <div className="text-center">
            <h2 className="font-display text-3xl text-foreground sm:text-4xl">Život, který má každý den svůj rytmus</h2>
            <p className="mx-auto mt-4 max-w-2xl text-base leading-relaxed text-muted-foreground">
              Každý den může vypadat jinak. Někdo začíná rehabilitačním cvičením, jiný si rád v klidu vypije ranní kávu. Aktivity nejsou povinností — jsou nabídkou, jak si zachovat zájmy, schopnosti a radost z obyčejných věcí.
            </p>
          </div>
          <div className="mt-10 grid gap-5 lg:grid-cols-2">
            {[
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
            ].map((c) => (
              <div key={c.title} className="group relative overflow-hidden rounded-3xl">
                <Pic src={c.img} alt={c.title} rounded="rounded-none" className="aspect-[4/3] transition-transform duration-500 group-hover:scale-[1.03]" />
                <div className="absolute inset-0 bg-gradient-to-t from-brand-dark via-brand-dark/65 to-brand-dark/5" />
                <div className="absolute bottom-0 left-0 right-0 p-7 sm:p-8">
                  <div className="text-[10px] font-bold uppercase tracking-[0.2em] text-warm">{c.tag}</div>
                  <h3 className="font-display mt-2 text-xl text-white sm:text-2xl">{c.title}</h3>
                  <p className="mt-2 text-sm leading-relaxed text-white/80">{c.desc}</p>
                  <Link href={c.href} className="mt-5 inline-flex items-center gap-2 rounded-full bg-white/15 px-5 py-2.5 text-xs font-bold uppercase tracking-wider text-white backdrop-blur-sm transition-colors hover:bg-white/25">
                    {c.cta} <ArrowRight className="h-3.5 w-3.5" />
                  </Link>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* 8. PŘÍBĚH */}
      <section className={`${wrap} py-16`}>
        <figure className="mx-auto max-w-3xl rounded-3xl bg-card p-8 text-center ring-1 ring-border sm:p-12">
          <Quote className="mx-auto h-8 w-8 text-warm" strokeWidth={1.5} />
          <blockquote className="font-display mt-4 text-2xl leading-snug text-foreground sm:text-3xl">„Viděli jsme pokrok každý týden."</blockquote>
          <p className="mx-auto mt-4 max-w-xl text-base leading-relaxed text-muted-foreground">Maminka po hospitalizaci potřebovala odbornou následnou péči. Byli jsme překvapeni, jaký pokrok udělala během několika týdnů. Děkujeme za odbornost i lidský přístup celého týmu.</p>
          <figcaption className="mt-4 text-sm font-semibold text-muted-foreground">— Alena K., dcera pacientky</figcaption>
          <Link href="/o-nas" className="mt-6 inline-flex items-center gap-1.5 text-xs font-bold uppercase tracking-wider text-brand hover:gap-2.5">Poznat další příběhy <ArrowRight className="h-3.5 w-3.5" /></Link>
        </figure>
      </section>

      {/* A TAK SI TADY ŽIJEME */}
      <section className="py-16 lg:py-20">
        <div className={wrap}>
          <div className="text-center">
            <div className="text-[11px] font-bold uppercase tracking-[0.22em] text-warm-dark">Fotogalerie</div>
            <h2 className="font-display mt-3 text-3xl text-foreground sm:text-4xl">A tak si tady žijeme</h2>
            <p className="mx-auto mt-4 max-w-xl text-base text-muted-foreground">Každý den je jiný. Podívejte se, jak vypadá běžný život v AHC Centru následné péče Sedlec-Prčice.</p>
          </div>
        </div>
        <div className="scrollbar-hide mt-10 flex snap-x snap-mandatory gap-4 overflow-x-auto px-6 pb-4 lg:px-10">
          {["g-21", "g-13", "g-30", "g-07", "g-16", "g-01", "g-50", "g-04"].map((g) => (
            <div key={g} className="relative aspect-square shrink-0 basis-[78%] snap-start overflow-hidden rounded-2xl bg-muted sm:basis-[48%] lg:basis-[280px]">
              <Image src={`${P}/${g}.jpg`} alt="Život v AHC Centru Sedlec-Prčice" fill sizes="(min-width:1024px) 280px, (min-width:640px) 48vw, 78vw" className="object-cover" />
            </div>
          ))}
        </div>
        <div className={`${wrap} mt-8 text-center`}>
          <Link href="/o-nas" className="inline-flex items-center gap-1.5 text-sm font-bold uppercase tracking-wider text-brand hover:gap-2.5">
            Poznat nás blíže <ArrowRight className="h-4 w-4" />
          </Link>
        </div>
      </section>

      {/* NAŠE CENTRUM V KOSTCE */}
      <section className="relative overflow-hidden bg-brand py-20 text-brand-foreground lg:py-24">
        <div aria-hidden="true" className="pointer-events-none absolute -left-32 -top-32 h-96 w-96 rounded-full bg-warm/15 blur-3xl" />
        <div aria-hidden="true" className="pointer-events-none absolute -bottom-32 -right-32 h-96 w-96 rounded-full bg-brand-foreground/10 blur-3xl" />
        <div className={`relative ${wrap}`}>
          <div className="text-center">
            <div className="text-[11px] font-bold uppercase tracking-[0.22em] text-warm">V číslech</div>
            <h2 className="font-display mt-3 text-3xl text-brand-foreground sm:text-4xl">Naše centrum v kostce</h2>
          </div>
          <ul className="mx-auto mt-14 grid w-full max-w-5xl grid-cols-2 gap-x-6 gap-y-12 lg:grid-cols-4">
            {[
              { value: 157, unit: "lůžek celkem", icon: BedDouble },
              { value: 27, unit: "km od Tábora", icon: MapPin },
              { value: 54, unit: "lůžek DS", icon: Home },
              { value: 103, unit: "lůžek NP", icon: Stethoscope },
            ].map((s) => {
              const Icon = s.icon;
              return (
                <li key={s.unit} className="group flex flex-col items-center text-center">
                  <span className="mb-6 flex h-14 w-14 items-center justify-center rounded-2xl bg-brand-foreground/10 text-warm transition-all group-hover:bg-warm group-hover:text-warm-foreground">
                    <Icon className="h-6 w-6" strokeWidth={1.75} />
                  </span>
                  <div className="font-display text-6xl text-brand-foreground lg:text-7xl">{s.value}</div>
                  <div className="mt-3 max-w-[10ch] text-[11px] font-bold uppercase tracking-[0.22em] text-brand-foreground/70">{s.unit}</div>
                </li>
              );
            })}
          </ul>
        </div>
      </section>

      {/* MAPA A VZDÁLENOSTI */}
      <section className={`${wrap} py-16 lg:py-20`}>
        <div className="grid gap-8 lg:grid-cols-[1fr_1.6fr]">
          <div>
            <div className="text-[11px] font-bold uppercase tracking-[0.22em] text-warm-dark">Kde nás najdete</div>
            <h2 className="font-display mt-3 text-2xl text-foreground sm:text-3xl">Sedlec-Prčice</h2>
            <p className="mt-3 text-sm leading-relaxed text-muted-foreground">
              Vítkovo náměstí 3<br />257 91 Sedlec-Prčice
            </p>
            <div className="mt-6 space-y-3">
              {[
                { label: "Tábor", km: 27 },
                { label: "Benešov", km: 32 },
                { label: "Praha", km: 75 },
              ].map((d) => (
                <div key={d.label} className="flex items-center justify-between rounded-xl border border-border bg-card px-5 py-3">
                  <span className="text-sm font-medium text-foreground">{d.label}</span>
                  <span className="font-display text-lg text-brand">{d.km} km</span>
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

      {/* BIOGRAFICKÝ KONCEPT / ŽIVOT V CENTRU */}
      <BiographicalConceptSection />

      {/* AI CHAT */}
      <ChatCtaSection />

      {/* CO NOVÉHO U NÁS — FACEBOOK */}
      {facebookUrl && (
        <section className={`${wrap} py-16 lg:py-20`}>
          <div className="flex flex-col items-center gap-12 lg:flex-row lg:gap-16">
            {/* 3D Facebook mockup */}
            <div className="shrink-0" style={{ perspective: "1200px" }}>
              <div
                className="w-72 overflow-hidden rounded-2xl bg-white shadow-[0_30px_80px_-10px_rgba(0,0,0,0.18)]"
                style={{ transform: "rotateY(-10deg) rotateX(4deg)" }}
              >
                <div className="px-4 pt-4">
                  <div className="flex items-center gap-2.5">
                    <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full bg-brand text-xs font-bold text-white">AHC</div>
                    <div>
                      <div className="text-sm font-semibold text-gray-900">AHC.cz</div>
                      <div className="text-[11px] text-gray-500">2. duben v 16:07 · 🌐</div>
                    </div>
                    <span className="ml-auto text-gray-400">···</span>
                  </div>
                  <p className="mt-2.5 text-sm text-gray-800">🐣 Velikonoce, které spojují generace <span className="cursor-pointer text-blue-600">Zobrazit více</span></p>
                </div>
                <div className="mt-2.5 grid grid-cols-2 gap-px bg-gray-200">
                  <div className="relative col-span-1 row-span-2" style={{ aspectRatio: "1" }}>
                    <Image src={`${P}/pokoj-2.jpg`} alt="Fotka ze sociálních sítí AHC" fill sizes="144px" className="object-cover" />
                  </div>
                  <div className="relative" style={{ aspectRatio: "1" }}>
                    <Image src={`${P}/exterier-2.jpg`} alt="Fotka ze sociálních sítí AHC" fill sizes="100px" className="object-cover" />
                  </div>
                  <div className="relative" style={{ aspectRatio: "1" }}>
                    <Image src={`${P}/koupelna-2.jpg`} alt="Fotka ze sociálních sítí AHC" fill sizes="100px" className="object-cover" />
                  </div>
                </div>
                <div className="flex gap-4 border-t border-gray-100 px-4 py-2.5 text-xs font-medium text-gray-600">
                  <span className="flex items-center gap-1.5">👍 To se mi líbí</span>
                  <span className="flex items-center gap-1.5">💬 Komentář</span>
                </div>
              </div>
            </div>

            {/* Text */}
            <div className="max-w-md">
              <div className="text-[11px] font-bold uppercase tracking-[0.22em] text-warm-dark">Aktuality</div>
              <h2 className="font-display mt-3 text-3xl text-foreground sm:text-4xl">Co nového u nás?</h2>
              <p className="mt-4 text-base leading-relaxed text-muted-foreground">
                Všechny novinky, aktuality a zprávy o dění dáváme na náš Facebook, takže sledujte, aby vám nic neuteklo!
              </p>
              <a
                href={facebookUrl}
                target="_blank"
                rel="noopener noreferrer"
                className="mt-6 inline-flex items-center gap-2 rounded-full bg-brand px-6 py-3 text-sm font-semibold text-brand-foreground hover:bg-brand-dark"
              >
                Náš Facebook <ArrowUpRight className="h-4 w-4" />
              </a>
            </div>
          </div>
        </section>
      )}

      {/* 9. KONVERZE */}
      <section className="bg-secondary/40">
        <div className={`${wrap} py-16`}>
          <div className="grid items-center gap-8 rounded-[2rem] bg-brand p-8 text-brand-foreground sm:p-12 lg:grid-cols-2">
            <div>
              <h2 className="font-display text-3xl sm:text-4xl">Nejste si jistí, která služba je pro vás vhodná?</h2>
              <p className="mt-4 max-w-md text-brand-foreground/85">Nemusíte sami rozhodovat. Zavolejte nebo napište našim sociálním pracovnicím — vyslechnou vás, vysvětlí možnosti a poradí, jak dál.</p>
              <div className="mt-6 flex flex-wrap gap-3">
                <Link href="/zadost-o-prijeti" className="rounded-full bg-brand-foreground px-6 py-3 text-sm font-bold uppercase tracking-wider text-brand hover:bg-warm hover:text-warm-foreground">Jak probíhá přijetí</Link>
                <Link href="/kontakt" className="rounded-full border-2 border-brand-foreground/40 px-6 py-3 text-sm font-bold uppercase tracking-wider hover:border-warm hover:text-warm">Kontaktovat</Link>
              </div>
            </div>
            <div className="rounded-2xl bg-brand-foreground/10 p-6 ring-1 ring-brand-foreground/20">
              <div className="text-[11px] font-bold uppercase tracking-[0.18em] text-warm">Sociální pracovnice</div>
              <div className="font-display mt-2 text-xl">Veronika Pištěková</div>
              <div className="text-sm text-brand-foreground/80">Po–Pá 7:00–15:30</div>
              <div className="mt-4 space-y-1.5 text-sm">
                <a href="tel:+420702078993" className="flex items-center gap-2 font-semibold hover:text-warm"><Phone className="h-4 w-4" /> +420 702 078 993</a>
                <a href="mailto:veronika.pistekova@ahc.cz" className="flex items-center gap-2 font-semibold hover:text-warm"><Mail className="h-4 w-4" /> veronika.pistekova@ahc.cz</a>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* 10. RYCHLÉ ODKAZY */}
      <section className={`${wrap} py-16`}>
        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
          {QUICKLINKS.map((c) => (
            <Link key={c.t} href={c.href} className={`group rounded-2xl border p-5 transition-all hover:-translate-y-1 hover:shadow-md ${c.primary ? "border-transparent bg-brand text-brand-foreground" : "border-border bg-card hover:border-brand"}`}>
              <c.icon className={`h-6 w-6 ${c.primary ? "text-brand-foreground" : "text-brand"}`} strokeWidth={1.75} />
              <h3 className={`font-display mt-3 text-lg ${c.primary ? "text-brand-foreground" : "text-foreground"}`}>{c.t}</h3>
              <p className={`mt-1.5 text-sm leading-relaxed ${c.primary ? "text-brand-foreground/85" : "text-muted-foreground"}`}>{c.d}</p>
            </Link>
          ))}
        </div>
      </section>

      {/* DOTACE */}
      {grants.length > 0 ? <GrantsSection grants={grants} /> : null}

      {/* SPOLUPRACUJEME */}
      <section className={`${wrap} py-12`}>
        <div className="text-center">
          <div className="text-[11px] font-bold uppercase tracking-[0.22em] text-muted-foreground">Spolupracujeme s</div>
        </div>
        <div className="mt-8 flex flex-wrap items-center justify-center gap-4 sm:gap-6">
          {[
            { name: "Sestřička.cz", file: "sestricka.png", href: "https://www.sestricka.cz/" },
            { name: "Most k domovu", file: "mostkdomovu.png", href: "https://www.mostkdomovu.cz/" },
            { name: "SestřičkaSOS", file: "sestrickasos.png", href: "https://www.sestrickasos.cz/" },
            { name: "e-Sestřička", file: "e-sestricka.png", href: "https://www.e-sestricka.cz/" },
          ].map((p) => (
            <a key={p.file} href={p.href} target="_blank" rel="noopener noreferrer"
               className="flex h-20 w-40 items-center justify-center rounded-2xl border border-border bg-card px-5 transition-all hover:border-brand/30 hover:shadow-md">
              <div className="relative h-10 w-full">
                <Image src={`/images/loga/${p.file}`} alt={p.name} fill sizes="160px" className="object-contain opacity-70 transition-opacity hover:opacity-100" />
              </div>
            </a>
          ))}
        </div>
      </section>

      {/* 11. ZÁVĚREČNÁ VÝZVA */}
      <section className={`${wrap} pb-20`}>
        <div className="relative overflow-hidden rounded-[2.5rem] bg-gradient-to-br from-brand-dark via-brand to-brand-dark px-8 py-20 text-center text-brand-foreground sm:px-14">
          <div aria-hidden="true" className="pointer-events-none absolute -left-32 -top-32 h-96 w-96 rounded-full bg-warm/15 blur-3xl" />
          <div aria-hidden="true" className="pointer-events-none absolute -bottom-32 -right-32 h-96 w-96 rounded-full bg-brand-foreground/10 blur-3xl" />
          <div className="relative">
            <div className="text-[11px] font-bold uppercase tracking-[0.22em] text-warm">Připraveni pomoci</div>
            <h2 className="font-display mx-auto mt-4 max-w-2xl text-3xl leading-tight text-brand-foreground sm:text-4xl">Jsme připraveni pomoci</h2>
            <p className="mx-auto mt-4 max-w-xl text-brand-foreground/85">Ať už hledáte následnou péči pro sebe, domov pro blízkého, nebo se potřebujete nejprve poradit, ozvěte se nám. Rádi vám představíme možnosti péče a pomůžeme s dalším postupem.</p>
            <div className="mt-8 flex flex-wrap justify-center gap-3">
              <Link href="/zadost-o-prijeti" className="rounded-full bg-brand-foreground px-6 py-3 text-sm font-bold uppercase tracking-wider text-brand transition-colors hover:bg-warm hover:text-warm-foreground">Jak požádat o přijetí</Link>
              <Link href="/kontakt" className="inline-flex items-center gap-2 rounded-full border-2 border-brand-foreground/40 px-6 py-3 text-sm font-bold uppercase tracking-wider text-brand-foreground transition-colors hover:border-warm hover:text-warm">Kontaktovat nás <ArrowUpRight className="h-4 w-4" /></Link>
            </div>
          </div>
        </div>
      </section>
    </>
  );
}
