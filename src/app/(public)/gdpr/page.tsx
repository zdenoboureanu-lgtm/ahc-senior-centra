import type { Metadata } from "next";
import { fetchQuery } from "convex/nextjs";
import { api } from "@/convex/_generated/api";
import { getBranchSlugFromHeaders } from "@/common/lib/branch";

export const metadata: Metadata = {
  title: "Zásady zpracování osobních údajů",
};

/**
 * Zásady zpracování osobních údajů — skupinový text AHC (převzatý ze starých
 * webů poboček 1:1), úvod personalizovaný právní identitou aktivní pobočky.
 */

const SPOLECNI_SPRAVCI_AHC = [
  "AHC a.s.",
  "AHC Centrum následné péče Sedlec-Prčice a.s.",
  "AHC Centrum následné péče Trutnov s.r.o.",
  "AHC Nemocnice Duchcov - ambulance s.r.o.",
  "AHC Nemocnice Duchcov s.r.o.",
  "AHC Odlehčovací centrum Vizovice z.ú.",
  "AHC Rehabilitační centrum Meziboří s.r.o.",
  "AHC Senior centrum Kolín s.r.o.",
  "AHC Senior centrum Malá Čermná s.r.o.",
  "AHC Senior centrum Meziboří s.r.o.",
  "AHC Senior centrum Nová Role s.r.o.",
  "AHC Senior centrum Nové Strašecí s.r.o.",
  "AHC Senior centrum Nový Bor a.s.",
  "AHC Senior centrum Pečičky o.p.s.",
  "AHC Senior centrum Příbram s.r.o.",
  "AHC Senior centrum Stříbro s.r.o.",
  "Institut zdravotních a sociálních věd, z. ú.",
  "Medispot a.s.",
  "Most k domovu s.r.o.",
  "PEČOVATELKA.CZ - domácí péče s.r.o.",
  "Podolská ordinace s.r.o.",
];

const SPOLECNI_SPRAVCI_SESTRICKA = [
  "SESTŘIČKA.CZ s.r.o.",
  "SESTŘIČKA.CZ - DOMÁCÍ PÉČE 02 s.r.o.",
  "SESTŘIČKA.CZ - DOMÁCÍ PÉČE 03 s.r.o.",
  "SESTŘIČKA.CZ - DOMÁCÍ PÉČE 04 s.r.o.",
  "SESTŘIČKA.CZ - DOMÁCÍ PÉČE 05 s.r.o.",
  "SESTŘIČKA.CZ - DOMÁCÍ PÉČE 06 s.r.o.",
  "SESTŘIČKA.CZ - DOMÁCÍ PÉČE 07 s.r.o.",
  "SESTŘIČKA.CZ - DOMÁCÍ PÉČE BRNO s.r.o.",
  "SESTŘIČKA.CZ - DOMÁCÍ PÉČE BRUNTÁL s.r.o.",
  "SESTŘIČKA.CZ - DOMÁCÍ PÉČE CHEB s.r.o.",
  "SESTŘIČKA.CZ - DOMÁCÍ PÉČE DOMAŽLICE s.r.o.",
  "SESTŘIČKA.CZ - DOMÁCÍ PÉČE FRÝDECKO s.r.o.",
  "SESTŘIČKA.CZ - DOMÁCÍ PÉČE KARLOVY VARY s.r.o.",
  "SESTŘIČKA.CZ - DOMÁCÍ PÉČE MOST s.r.o.",
  "SESTŘIČKA.CZ - DOMÁCÍ PÉČE ODRY s.r.o.",
  "SESTŘIČKA.CZ - DOMÁCÍ PÉČE OLOMOUC s.r.o.",
  "SESTŘIČKA.CZ - DOMÁCÍ PÉČE PLZEŇSKO s.r.o.",
  "SESTŘIČKA.CZ - DOMÁCÍ PÉČE PRAHA a.s.",
  "SESTŘIČKA.CZ - DOMÁCÍ PÉČE PŘÍBRAMSKO s.r.o.",
  "SESTŘIČKA.CZ - DOMÁCÍ PÉČE SVITAVSKO s.r.o.",
  "SESTŘIČKA.CZ - DOMÁCÍ PÉČE VESELÍ NAD MORAVOU s.r.o.",
  "SESTŘIČKA.CZ - DOMÁCÍ PÉČE ZLÍN s.r.o.",
  "SESTŘIČKA.CZ - DOMÁCÍ PÉČE ZNOJEMSKO s.r.o.",
  "SESTŘIČKA.CZ - DOMÁCÍ PÉČE ČESKOLIPSKO s.r.o.",
  "SESTŘIČKA.CZ - DOMÁCÍ PÉČE ŠTERNBERK s.r.o.",
  "SESTŘIČKA.CZ - DOMÁCÍ PÉČE ŠUMPERK s.r.o.",
  "Sestřička SOS, z.ú.",
];

export default async function GdprPage() {
  const slug = await getBranchSlugFromHeaders();
  const data = slug
    ? await fetchQuery(api.modules.branches.queries.getHomepage, { slug }).catch(
        () => null
      )
    : null;
  const branch = data?.branch ?? null;

  return (
    <article className="mx-auto max-w-3xl px-6 py-16 lg:py-20">
      <div className="text-[11px] font-bold uppercase tracking-[0.22em] text-warm-dark">
        Ochrana osobních údajů
      </div>
      <h1 className="font-display mt-3 text-4xl text-foreground sm:text-5xl">
        Zásady zpracování osobních údajů
      </h1>

      <div className="prose-ahc mt-8 space-y-5 text-base leading-relaxed text-muted-foreground">
        {branch?.legal_name ? (
          <p>
            Společnost <strong>{branch.legal_name}</strong>
            {branch.ico ? <>, IČO: {branch.ico}</> : null}
            {branch.legal_address ? (
              <>, se sídlem {branch.legal_address}</>
            ) : null}
            , je součástí skupiny AHC. Jsme předním českým nestátním
            poskytovatelem terénní i lůžkové zdravotní a sociální péče a při
            naší činnosti klademe velký důraz na ochranu osobních údajů.
          </p>
        ) : (
          <p>
            Skupina AHC je předním českým nestátním poskytovatelem terénní i
            lůžkové zdravotní a sociální péče a při své činnosti klade velký
            důraz na ochranu osobních údajů.
          </p>
        )}

        <p>
          Prostřednictvím těchto zásad vám poskytujeme informace o tom, jak
          zpracováváme vaše osobní údaje v souladu s Nařízením Evropského
          parlamentu a Rady (EU) 2016/679 ze dne 27. dubna 2016 (dále jen
          „GDPR") a zákonem č. 110/2019 Sb., o zpracování osobních údajů,
          v platném znění.
        </p>

        <p>
          Ochranu vašich osobních údajů bereme velmi vážně. Tento dokument vám
          přehledně vysvětluje:
        </p>
        <ul className="list-disc space-y-1 pl-6">
          <li>jaké osobní údaje zpracováváme,</li>
          <li>za jakým účelem a na jakém právním základě,</li>
          <li>jak zajišťujeme jejich bezpečnost,</li>
          <li>
            jaká jsou vaše práva v oblasti zpracování osobních údajů a jak je
            můžete uplatnit.
          </li>
        </ul>
        <p>
          Rozsah zpracovávaných osobních údajů se liší v závislosti na tom, zda
          pouze navštěvujete naše webové stránky, přihlásili jste se k odběru
          newsletteru, nebo jste našimi klienty.
        </p>

        <h2 className="font-display pt-4 text-2xl text-foreground">
          Kdo je správcem osobních údajů?
        </h2>
        <p>
          Správci osobních údajů jsou společnosti tvořící skupinu AHC, která
          sdružuje větší množství firem působících v oblasti zdravotních a
          sociálních služeb. Abychom zajistili co nejvyšší kvalitu a dostupnost
          služeb, některé činnosti realizujeme centrálně prostřednictvím
          společnosti AHC a.s., IČO 07443994, se sídlem Týnská 632/10, 110 00
          Praha 1, zapsané v obchodním rejstříku vedeném Městským soudem
          v Praze, spis. zn. B28616. Ta zajišťuje například finanční řízení,
          personální řízení, metodické řízení a compliance, zprostředkovává
          právní služby, centrální nákup, dotační poradenství, správu smluvních
          vztahů se zdravotními pojišťovnami, poskytování IT služeb a další
          činnosti nezbytné pro efektivní fungování celé skupiny.
        </p>
        <p>
          V rámci skupiny AHC některé osobní údaje zpracováváme v režimu
          společného správcovství. To znamená, že účel i prostředky zpracování
          osobních údajů určují společně různé společnosti ve skupině. Mezi
          tyto společnosti patří:
        </p>

        <div className="grid gap-6 rounded-2xl bg-secondary/40 p-6 sm:grid-cols-2">
          <ul className="space-y-1 text-sm">
            {SPOLECNI_SPRAVCI_AHC.map((s) => (
              <li key={s}>{s}</li>
            ))}
          </ul>
          <ul className="space-y-1 text-sm">
            {SPOLECNI_SPRAVCI_SESTRICKA.map((s) => (
              <li key={s}>{s}</li>
            ))}
          </ul>
        </div>

        <p>
          Uvedené společnosti vystupují jako společní správci a vzájemně si ve
          smlouvě stanovily odpovědnosti a povinnosti. Svá práva můžete
          uplatnit u kteréhokoliv ze společných správců.
        </p>
        <p>
          Na základě legislativních požadavků musíme uvádět všechny
          společnosti, které jsou stranou smlouvy o společném správcovství.
          Ujišťujeme vás však, že k předání vašich údajů do všech společností
          nebude v žádném případě docházet. Osobní údaje klientů předáváme
          pouze tehdy, pokud je to nezbytné a v souladu s oprávněnými zájmy
          klienta. Typickým příkladem je situace, kdy klient využívá naši
          terénní sociální službu a dojde ke zhoršení jeho zdravotního stavu.
          Pokud klient projeví zájem o přestěhování do jednoho z našich
          lůžkových zařízení, předáme jeho osobní údaje v nezbytném rozsahu za
          účelem zajištění plynulého a kvalitního poskytování navazující péče.
          Zpracování osobních údajů vždy probíhá s vědomím klienta a nikdy
          nedochází k jejich předávání bezdůvodně nebo nad rámec účelu, pro
          který byly shromážděny.
        </p>
        <p>
          Podrobné informace naleznete v úplných{" "}
          <a
            href="https://www.ahc.cz/zasady-zpracovani-osobnich-udaju"
            target="_blank"
            rel="noopener noreferrer"
            className="font-semibold text-brand underline underline-offset-4 hover:text-brand-dark"
          >
            Zásadách zpracování osobních údajů skupiny AHC
          </a>
          .
        </p>
      </div>
    </article>
  );
}
