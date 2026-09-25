import Image from "next/image";
import Link from "next/link";
import {
  ArrowRight,
  ArrowUpRight,
  Users,
  ShieldCheck,
  UserCheck,
  Heart,
  UtensilsCrossed,
  Sofa,
  Trees,
  Coffee,
  Footprints,
  Quote,
} from "lucide-react";
import { SedlecGallery, ACTIVITY_ITEMS } from "./sedlec-gallery";
import { makeCopy, type CopyProps } from "@/features/inline-edit/copy";
import { RegionSlot } from "@/features/inline-edit/components/content-slot";

const wrap = "mx-auto max-w-[1320px] px-6 lg:px-10";

const P = "/images/sedlec";

const VALUES = [
  { icon: Users, title: "Propojujeme odbornosti", text: "Na péči se podle individuálních potřeb podílejí lékaři, zdravotní sestry, pracovníci přímé péče, rehabilitační pracovníci, ergoterapeut, sociální pracovníci a další kolegové. Společně hledáme řešení, které odpovídá potřebám konkrétního člověka." },
  { icon: ShieldCheck, title: "Chráníme důstojnost a soukromí", text: "Jednáme citlivě, diskrétně a s respektem. Každý člověk má právo být informován, vyjadřovat svá přání a podílet se na rozhodování o svém životě a poskytované péči." },
  { icon: UserCheck, title: "Přistupujeme ke každému individuálně", text: "Vnímáme zdravotní stav, osobnost, životní zkušenosti, zvyklosti i aktuální rozpoložení každého pacienta a klienta. Péči nastavujeme podle toho, co člověk skutečně potřebuje." },
  { icon: Heart, title: "Podporujeme vztahy s rodinou", text: "Rodina a blízcí mají v životě člověka nezastupitelné místo. Podporujeme vzájemný kontakt, otevřenou komunikaci a spolupráci mezi rodinou a naším týmem." },
];

const AMENITIES = [
  { icon: UtensilsCrossed, label: "Společné jídelny" },
  { icon: Coffee, label: "Vybavené kuchyňky" },
  { icon: Sofa, label: "Klubovna" },
  { icon: Trees, label: "Terasa a dvůr" },
  { icon: Trees, label: "Zahrada" },
  { icon: Users, label: "Prostory pro návštěvy" },
];

const ACTIVITIES = [
  "Kondiční cvičení", "Trénování paměti", "Zpívání pro radost", "Tvoření a výtvarné činnosti",
  "Společenské hry", "Vaření a pečení", "Canisterapie", "Kulturní programy", "Bohoslužby",
  "Setkání se žáky místní školy",
];

const VISIT_CARDS = [
  { icon: Footprints, title: "Na krátkou procházku", text: "Historická centra Sedlce a Prčice, místní náměstí, kostel sv. Jeronýma a klidné ulice města nabízejí možnost krátké procházky." },
  { icon: Coffee, title: "Na kávu nebo něco dobrého", text: "Na Vítkově náměstí můžete navštívit Kavárnu Ateliér. Další možností posezení je restaurace a pivovar Vítek." },
  { icon: Trees, title: "Na výlet po okolí", text: "Region Toulavy a Českého Meránu, Moninec, zřícenina hradu Borotín nebo zámek Vysoký Chlumec — ideální cíle pro delší návštěvu." },
];

const STORIES = [
  { q: "Po výměně kyčelního kloubu jsem měl obavy, zda budu ještě chodit stejně jako dříve. Díky rehabilitaci a podpoře personálu jsem postupně získal zpět sílu i sebevědomí. Dnes se opět věnuji běžným aktivitám a mohu být samostatný.", a: "Jiří, pacient" },
  { q: "Maminka se po hospitalizaci dostala do situace, kdy potřebovala odbornou následnou péči. Byli jsme překvapeni, jaký pokrok udělala během několika týdnů. Děkujeme za odbornost i lidský přístup celého týmu.", a: "Alena K., dcera pacientky" },
  { q: "Na rehabilitaci je krásné sledovat, jak se pacientům postupně vrací síla, samostatnost a chuť do života. Někdy jde o malé pokroky, ale právě ty bývají nejdůležitější.", a: "Petra, fyzioterapeutka" },
  { q: "Moderní zdravotní péče je důležitá, ale stejně důležité je pacientovi naslouchat, podpořit ho a dodat mu motivaci. Právě spojení odbornosti a lidského přístupu tvoří základ naší práce.", a: "Tým AHC Centra následné péče Sedlec-Prčice" },
];

const FORMY = [
  { t: "Následná lůžková péče", d: "Pomáháme pacientům při doléčení, rehabilitaci, stabilizaci zdravotního stavu a návratu k nejvyšší možné míře soběstačnosti.", img: `${P}/pokoj-1.jpg` },
  { t: "Domov pro seniory", d: "Vytváříme bezpečné a důstojné zázemí seniorům, kteří již potřebují pravidelnou nebo nepřetržitou podporu.", img: `${P}/spolecna.jpg` },
];

const CILE = [
  { t: "Každý pokrok je důležitý", d: "Cesta k uzdravení bývá složena z mnoha malých kroků — někdy jde o první samostatnou chůzi po operaci, jindy o návrat běžných činností nebo znovuzískání jistoty a sebedůvěry. Podporujeme fyzickou kondici, psychickou pohodu i motivaci pokračovat.", img: `${P}/koupelna-2.jpg` },
  { t: "Každý den může mít svou hodnotu", d: "U klientů domova nemusí být cílem návrat k dřívějšímu životu. Důležité může být zachování schopností, oblíbených zvyků a kontaktu s rodinou. Vytváříme prostor pro obyčejné okamžiky, které mají velkou hodnotu.", img: `${P}/exterier-1.jpg` },
];

/** Bespoke podstránka „O zařízení" pro Sedlec-Prčice dle obsahové specifikace. */
export function AboutSedlec({ copy, editBranchId }: CopyProps) {
  const c = makeCopy({ copy, editBranchId });

  /** Obrázek vyplňující zaoblený kontejner; v režimu úprav jde vyměnit. */
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
      {/* 1. HERO */}
      <section className="relative overflow-hidden bg-gradient-to-b from-brand-light/40 to-background">
        <div className={`${wrap} grid items-center gap-10 py-14 lg:grid-cols-2 lg:py-20`}>
          <div>
            {c.t("onas.hero.eyebrow", "O zařízení", { as: "div", className: "text-xs font-bold uppercase tracking-[0.22em] text-warm-dark" })}
            <h1 className="font-display mt-4 text-4xl leading-[1.1] text-foreground sm:text-5xl">
              {c.t("onas.hero.title", "Nejsme jen místo, kde se pečuje.")}
              <br />
              {c.t("onas.hero.title-zvyraznene", "Jsme místo, kde se dál žije.", { as: "span", className: "text-brand" })}
            </h1>
            <div className="mt-6 space-y-4 text-base leading-relaxed text-muted-foreground">
              {c.t("onas.hero.text1", "Zdraví patří k nejcennějším věcem v životě. Po nemoci, operaci nebo náročné hospitalizaci však často přichází období, kdy člověk potřebuje více času, odborné podpory a rehabilitace, aby se mohl vrátit k běžnému životu.", { as: "p" })}
              {c.t("onas.hero.text2", "V AHC Centru následné péče Sedlec-Prčice poskytujeme následnou lůžkovou péči pacientům, kteří již nepotřebují akutní nemocniční léčbu, a zároveň vytváříme bezpečné a důstojné zázemí seniorům, kteří potřebují pravidelnou podporu při každodenních činnostech.", { as: "p" })}
              {c.t("onas.hero.text3", "Spojujeme odbornost, zkušenosti a moderní postupy s lidskostí, respektem a pochopením pro potřeby každého pacienta i klienta.", { as: "p" })}
            </div>
            <div className="mt-8 flex flex-wrap gap-3">
              <Link href="#formy-pece" className="inline-flex items-center gap-2 rounded-full bg-brand px-6 py-3 text-sm font-semibold text-brand-foreground transition-colors hover:bg-brand-dark">
                Naše formy péče <ArrowRight className="h-4 w-4" />
              </Link>
              <Link href="#galerie" className="inline-flex items-center gap-2 rounded-full border border-border bg-background px-6 py-3 text-sm font-semibold text-foreground hover:border-brand hover:text-brand">
                Prohlédnout fotogalerii
              </Link>
            </div>
          </div>
          {pic("onas.hero.foto", `${P}/hero.jpg`, "Společné prostory AHC Centra následné péče Sedlec-Prčice", "aspect-[4/3] shadow-md lg:aspect-[5/4]")}
        </div>
      </section>

      {/* 2. DVĚ FORMY PÉČE */}
      <RegionSlot {...c.region("sekce.onas.formy")}>
<section id="formy-pece" className={`${wrap} py-16 lg:py-20 scroll-mt-24`}>
        {c.t("onas.formy.nadpis", "Pod jednou střechou propojujeme dvě formy péče", { as: "h2", className: "font-display block text-center text-3xl text-foreground sm:text-4xl" })}
        <div className="mt-10 grid gap-6 md:grid-cols-2">
          {FORMY.map((f, i) => (
            <RegionSlot key={f.t} {...c.region(`onas.formy.${i}`)}>
            <div className="overflow-hidden rounded-3xl border border-border bg-card">
              {pic(`onas.formy.${i}.foto`, f.img, f.t, "aspect-[16/9]", "rounded-none")}
              <div className="p-7">
                {c.t(`onas.formy.${i}.nadpis`, f.t, { as: "h3", className: "font-display text-xl text-foreground" })}
                {c.t(`onas.formy.${i}.text`, f.d, { as: "p", className: "mt-2 text-[15px] leading-relaxed text-muted-foreground" })}
                <Link href="/sluzby" className="mt-4 inline-flex items-center gap-1.5 text-xs font-bold uppercase tracking-wider text-brand hover:gap-2.5">
                  Více o službě <ArrowRight className="h-3.5 w-3.5" />
                </Link>
              </div>
            </div>
            </RegionSlot>
          ))}
        </div>
      </section>
</RegionSlot>

      {/* 3. PÉČE Z KONKRÉTNÍHO ČLOVĚKA */}
      <RegionSlot {...c.region("sekce.onas.individualne")}>
<section className="bg-secondary/40">
        <div className={`${wrap} grid items-center gap-10 py-16 lg:grid-cols-[1.2fr_1fr] lg:py-20`}>
          <div>
            {c.t("onas.individualne.nadpis", "Každý člověk potřebuje něco jiného", { as: "h2", className: "font-display text-3xl text-foreground sm:text-4xl" })}
            <div className="mt-5 space-y-4 text-base leading-relaxed text-muted-foreground">
              {c.t("onas.individualne.text1", "Víme, že dva lidé se stejnou diagnózou nemusí potřebovat stejnou pomoc. Jeden chce znovu zvládnout chůzi, druhý se potřebuje naučit bezpečně používat kompenzační pomůcku. Někdo vyhledává společnost a aktivity, jiný potřebuje především klid, soukromí a dostatek času.", { as: "p" })}
              {c.t("onas.individualne.text2", "Proto péči nepřizpůsobujeme pouze zdravotnímu stavu. Zohledňujeme také možnosti, přání, zvyklosti, životní zkušenosti a osobní cíle každého člověka.", { as: "p" })}
            </div>
            {c.t("onas.individualne.citat", "Pomáháme tam, kde je pomoc potřeba. Současně podporujeme vše, co člověk stále dokáže sám.", { as: "blockquote", className: "mt-6 block border-l-4 border-warm pl-5 font-display text-xl leading-snug text-foreground" })}
          </div>
          {pic("onas.individualne.foto", `${P}/pokoj-3.jpg`, "Pokoj v domově pro seniory", "aspect-[3/4]")}
        </div>
      </section>
</RegionSlot>

      {/* 4. HODNOTY */}
      <RegionSlot {...c.region("sekce.onas.hodnoty")}>
<section className={`${wrap} py-16 lg:py-20`}>
        {c.t("onas.hodnoty.nadpis", "Hodnoty, podle kterých pečujeme", { as: "h2", className: "font-display block text-center text-3xl text-foreground sm:text-4xl" })}
        <div className="mt-10 grid gap-5 sm:grid-cols-2">
          {VALUES.map((v, i) => (
            <RegionSlot key={v.title} {...c.region(`onas.hodnoty.${i}`)}>
            <div className="rounded-2xl border border-border bg-card p-6">
              <span className="flex h-12 w-12 items-center justify-center rounded-2xl bg-brand-light text-brand">
                <v.icon className="h-6 w-6" strokeWidth={1.75} />
              </span>
              {c.t(`onas.hodnoty.${i}.nadpis`, v.title, { as: "h3", className: "font-display mt-4 text-lg text-foreground" })}
              {c.t(`onas.hodnoty.${i}.text`, v.text, { as: "p", className: "mt-2 text-[15px] leading-relaxed text-muted-foreground" })}
            </div>
            </RegionSlot>
          ))}
        </div>
      </section>
</RegionSlot>

      {/* 5. KAŽDÝ ČLOVĚK MÁ JINÝ CÍL */}
      <RegionSlot {...c.region("sekce.onas.cile")}>
<section className={`${wrap} pb-16 lg:pb-20`}>
        <div className="grid gap-6 lg:grid-cols-2">
          {CILE.map((k, i) => (
            <RegionSlot key={k.t} {...c.region(`onas.cile.${i}`)}>
            <div className="overflow-hidden rounded-3xl border border-border bg-card">
              {pic(`onas.cile.${i}.foto`, k.img, k.t, "aspect-[16/10]", "rounded-none")}
              <div className="p-7">
                {c.t(`onas.cile.${i}.nadpis`, k.t, { as: "h3", className: "font-display text-xl text-foreground" })}
                {c.t(`onas.cile.${i}.text`, k.d, { as: "p", className: "mt-2 text-[15px] leading-relaxed text-muted-foreground" })}
              </div>
            </div>
            </RegionSlot>
          ))}
        </div>
      </section>
</RegionSlot>

      {/* 6. POKOJE A ZÁZEMÍ */}
      <RegionSlot {...c.region("sekce.onas.zazemi")}>
<section className="bg-secondary/40">
        <div className={`${wrap} grid items-center gap-10 py-16 lg:grid-cols-[1.4fr_1fr] lg:py-20`}>
          <div className="grid grid-cols-2 gap-4">
            {pic("onas.zazemi.foto1", `${P}/exterier-2.jpg`, "Zázemí zařízení", "col-span-2 aspect-[16/10]")}
            {pic("onas.zazemi.foto2", `${P}/pokoj-2.jpg`, "Pokoj", "aspect-square")}
            {pic("onas.zazemi.foto3", `${P}/koupelna.jpg`, "Koupelna", "aspect-square")}
          </div>
          <div>
            {c.t("onas.zazemi.eyebrow", "Domov pro seniory", { as: "div", className: "text-[11px] font-bold uppercase tracking-[0.18em] text-warm-dark" })}
            {c.t("onas.zazemi.nadpis", "Prostor, který si mohou klienti přizpůsobit", { as: "h2", className: "font-display mt-2 text-3xl text-foreground sm:text-4xl" })}
            {c.t(
              "onas.zazemi.text",
              "Ubytování v bezbariérovém objektu, ve dvoulůžkových pokojích s vlastní koupelnou. Pokoje mají elektricky polohovatelná lůžka, noční stolky, stůl, křesla, lednici, televizi, internet i uzamykatelné úložné prostory. Klienti si je mohou doplnit vlastními fotografiemi, obrázky či květinami.",
              { as: "p", className: "mt-4 text-base leading-relaxed text-muted-foreground" }
            )}
            <ul className="mt-6 grid grid-cols-2 gap-3">
              {AMENITIES.map((a, i) => (
                <li key={a.label} className="flex items-center gap-2 text-sm text-foreground">
                  <a.icon className="h-4 w-4 shrink-0 text-brand" strokeWidth={2} />
                  {c.t(`onas.zazemi.vybaveni.${i}`, a.label)}
                </li>
              ))}
            </ul>
          </div>
        </div>
      </section>
</RegionSlot>

      {/* 7. ŽIVOT NENÍ JEN O PÉČI */}
      <RegionSlot {...c.region("sekce.onas.zivot")}>
<section className={`${wrap} py-16 lg:py-20`}>
        <div className="grid gap-6 lg:grid-cols-2">
          {pic("onas.zivot.foto", `${P}/hero.jpg`, "Život v domově", "aspect-square")}
          <div className="flex flex-col justify-center">
            {c.t("onas.zivot.nadpis", "Každodennost tvoří chvíle, na které se můžeme těšit", { as: "h2", className: "font-display text-3xl text-foreground sm:text-4xl" })}
            {c.t(
              "onas.zivot.text",
              "Život v zařízení není složený jen z ošetřování, léků a režimu. Důležitou součástí dne jsou rozhovory, pohyb, zájmy, setkávání i obyčejné drobnosti. Klientům nabízíme společné i individuální aktivity — každý se zapojí podle své chuti a možností.",
              { as: "p", className: "mt-4 text-base leading-relaxed text-muted-foreground" }
            )}
            <ul className="mt-6 flex flex-wrap gap-2">
              {ACTIVITIES.map((a, i) => (
                <li key={a} className="rounded-full bg-brand-light px-3 py-1.5 text-xs font-semibold text-brand">
                  {c.t(`onas.zivot.aktivita.${i}`, a)}
                </li>
              ))}
            </ul>
          </div>
        </div>
      </section>
</RegionSlot>

      {/* 8. RODINA */}
      <RegionSlot {...c.region("sekce.onas.rodina")}>
<section className="bg-secondary/40">
        <div className={`${wrap} py-16 lg:py-20`}>
          <div className="grid items-center gap-10 lg:grid-cols-2">
            <div>
              {c.t("onas.rodina.nadpis", "Blízcí jsou součástí naší rodiny", { as: "h2", className: "font-display text-3xl text-foreground sm:text-4xl" })}
              <div className="mt-5 space-y-4 text-base leading-relaxed text-muted-foreground">
                {c.t("onas.rodina.text1", "Víme, že přijetím do zařízení rodinné vztahy nekončí. Naopak chceme vytvářet podmínky, aby pacienti a klienti mohli zůstávat se svými blízkými v pravidelném kontaktu.", { as: "p" })}
                {c.t("onas.rodina.text2", "Rodiny mohou trávit čas ve společných prostorách, na zahradě nebo v klubovně a obracet se na náš tým s otázkami týkajícími se péče. Otevřená a respektující komunikace je pro nás součástí důvěry.", { as: "p" })}
              </div>
            </div>
            {pic("onas.rodina.foto", `${P}/exterier-3.jpg`, "Areál a okolí zařízení", "aspect-[4/3]")}
          </div>
          <div className="mt-10">
            {c.t("onas.navsteva.nadpis", "Když přijedete na návštěvu", { as: "h3", className: "font-display text-xl text-foreground" })}
            <div className="mt-5 grid gap-4 sm:grid-cols-3">
              {VISIT_CARDS.map((v, i) => (
                <RegionSlot key={v.title} {...c.region(`onas.navsteva.${i}`)}>
                <div className="rounded-2xl border border-border bg-card p-5">
                  <v.icon className="h-5 w-5 text-brand" strokeWidth={1.75} />
                  {c.t(`onas.navsteva.${i}.nadpis`, v.title, { as: "h4", className: "font-display mt-3 text-base text-foreground" })}
                  {c.t(`onas.navsteva.${i}.text`, v.text, { as: "p", className: "mt-1.5 text-sm leading-relaxed text-muted-foreground" })}
                </div>
                </RegionSlot>
              ))}
            </div>
          </div>
        </div>
      </section>
</RegionSlot>

      {/* 9. FOTOGALERIE */}
      <div id="galerie" className="scroll-mt-24">
        <SedlecGallery
          items={ACTIVITY_ITEMS}
          subtitle="Fotogalerie"
          title="Život u nás v Sedlci-Prčici"
          description="Každý den je jiný. Podívejte se, jak vypadá běžný život v AHC Centru následné péče Sedlec-Prčice."
          copyPrefix="onas.galerie"
          copy={copy}
          editBranchId={editBranchId}
        />
      </div>

      {/* 10. PŘÍBĚHY */}
      <RegionSlot {...c.region("sekce.onas.pribehy")}>
<section id="pribehy" className="scroll-mt-24 bg-secondary/40">
        <div className={`${wrap} py-16 lg:py-20`}>
          {c.t("onas.pribehy.nadpis", "Příběhy, které dávají naší práci smysl", { as: "h2", className: "font-display block text-center text-3xl text-foreground sm:text-4xl" })}
          <div className="mt-10 grid gap-5 md:grid-cols-2">
            {STORIES.map((s, i) => (
              <RegionSlot key={s.a} {...c.region(`onas.pribehy.${i}`)}>
              <figure className="rounded-2xl bg-card p-6 ring-1 ring-border">
                <Quote className="h-6 w-6 text-warm" strokeWidth={1.5} />
                <blockquote className="mt-3 text-[15px] leading-relaxed text-foreground">
                  „{c.t(`onas.pribehy.${i}.citat`, s.q)}"
                </blockquote>
                <figcaption className="mt-3 text-sm font-semibold text-muted-foreground">
                  — {c.t(`onas.pribehy.${i}.autor`, s.a)}
                </figcaption>
              </figure>
              </RegionSlot>
            ))}
          </div>
        </div>
      </section>
</RegionSlot>

      {/* 11. SOUČÁST AHC + 12. CTA */}
      <RegionSlot {...c.region("sekce.onas.zaver")}>
<section className={`${wrap} py-16 lg:py-20`}>
        <div className="overflow-hidden rounded-[2.5rem] bg-gradient-to-br from-brand-dark via-brand to-brand-dark p-10 text-center text-brand-foreground sm:p-14">
          {c.t("onas.zaver.eyebrow", "Jsme součástí skupiny AHC", { as: "div", className: "text-[11px] font-bold uppercase tracking-[0.22em] text-warm" })}
          {c.t("onas.zaver.nadpis", "Přijeďte se přesvědčit osobně", { as: "h2", className: "font-display mx-auto mt-4 block max-w-2xl text-3xl leading-tight sm:text-4xl" })}
          {c.t(
            "onas.zaver.text",
            "Díky zázemí skupiny AHC sdílíme odborné zkušenosti a rozvíjíme kvalitu péče. Rádi vám zařízení ukážeme, seznámíme vás s možnostmi péče a zodpovíme vaše otázky.",
            { as: "p", className: "mx-auto mt-4 block max-w-xl text-brand-foreground/85" }
          )}
          <div className="mt-8 flex flex-wrap justify-center gap-3">
            <Link href="/kontakt" className="inline-flex items-center gap-2 rounded-full bg-brand-foreground px-6 py-3 text-sm font-bold uppercase tracking-wider text-brand transition-colors hover:bg-warm hover:text-warm-foreground">
              Domluvit nezávaznou návštěvu <ArrowUpRight className="h-4 w-4" />
            </Link>
            <Link href="/sluzby" className="inline-flex items-center gap-2 rounded-full border-2 border-brand-foreground/40 px-6 py-3 text-sm font-bold uppercase tracking-wider text-brand-foreground hover:border-warm hover:text-warm">
              Poznat naše služby
            </Link>
          </div>
        </div>
      </section>
</RegionSlot>
    </>
  );
}
