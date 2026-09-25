import Link from "next/link";
import { Phone, Mail, Stethoscope, Home, Users, Wallet } from "lucide-react";
import type { Id } from "@/convex/_generated/dataModel";
import {
  ContactLayout,
  mapUrlFor,
  type ContactPerson,
} from "@/features/contact/components/contact-layout";
import {
  makeCopy,
  type CopyHelpers,
  type CopyProps,
} from "@/features/inline-edit/copy";
import { RegionSlot } from "@/features/inline-edit/components/content-slot";

const wrap = "mx-auto max-w-[1320px] px-6 lg:px-10";

function Tel({ n }: { n: string }) {
  return <a href={`tel:${n.replace(/[\s–]/g, "")}`} className="font-semibold text-foreground hover:text-brand">{n}</a>;
}
function MailLink({ e }: { e: string }) {
  return <a href={`mailto:${e}`} className="font-semibold text-foreground hover:text-brand break-words">{e}</a>;
}

function MiniContact({
  c,
  ckey,
  icon: Icon,
  title,
  rows,
}: {
  c: CopyHelpers;
  ckey: string;
  icon: typeof Phone;
  title: string;
  rows: [string, string][];
}) {
  return (
    <div className="rounded-2xl border border-border bg-card p-5">
      <div className="flex items-center gap-2">
        <Icon className="h-5 w-5 text-brand" strokeWidth={1.75} />
        {c.t(`${ckey}.nadpis`, title, { as: "h4", className: "font-display text-base text-foreground" })}
      </div>
      <dl className="mt-3 space-y-1.5 text-sm">
        {rows.map(([k, v], i) => (
          <div key={k + v} className="flex justify-between gap-3">
            <dt className="text-muted-foreground">{c.t(`${ckey}.${i}.popis`, k)}</dt>
            <dd className="text-right"><Tel n={v} /></dd>
          </div>
        ))}
      </dl>
    </div>
  );
}

const ONP_ROWS: [string, string][] = [
  ["Vrchní sestra (l. 209)", "+420 724 154 981"],
  ["I. stanice ONP", "+420 317 701 951"],
  ["II. stanice ONP", "+420 317 701 384"],
  ["III. stanice ONP", "+420 317 701 621"],
];

const DPS_ROWS: [string, string][] = [
  ["Vrchní sestra (l. 242)", "+420 720 997 141"],
  ["Domov pro seniory", "+420 317 705 097"],
];

/** Podstránka „Kontakty" pro Sedlec-Prčice — ve sdíleném layoutu sítě. */
export function KontaktSedlec({
  branchId,
  copy,
  editBranchId,
}: { branchId: Id<"branches"> } & CopyProps) {
  const c = makeCopy({ copy, editBranchId });

  const people: ContactPerson[] = [
    {
      key: "np",
      lead: c.s("kontakt.pracovnice.0.lead", "Zajímá vás následná lůžková péče?"),
      name: c.s("kontakt.pracovnice.0.jmeno", "Veronika Pištěková"),
      role: c.s("kontakt.pracovnice.0.role", "Sociální pracovnice · Po–Pá 7:00–15:30"),
      email: "veronika.pistekova@ahc.cz",
      phone: "+420 317 729 647",
      mobile: "+420 702 078 993",
      note: c.s(
        "kontakt.pracovnice.0.poznamka",
        "Veronika vám poradí s možností přijetí, potřebnými dokumenty, průběhem nástupu i praktickými otázkami spojenými s pobytem."
      ),
      edit: {
        lead: c.target("kontakt.pracovnice.0.lead"),
        name: c.target("kontakt.pracovnice.0.jmeno"),
        role: c.target("kontakt.pracovnice.0.role"),
        note: c.target("kontakt.pracovnice.0.poznamka"),
      },
    },
    {
      key: "dps",
      lead: c.s("kontakt.pracovnice.1.lead", "Hledáte domov pro seniory?"),
      name: c.s("kontakt.pracovnice.1.jmeno", "Markéta Mašková"),
      role: c.s("kontakt.pracovnice.1.role", "Sociální pracovnice · Po–Pá 7:00–15:30"),
      email: "marketa.maskova@ahc.cz",
      phone: "+420 317 729 647",
      mobile: "+420 720 840 462",
      note: c.s(
        "kontakt.pracovnice.1.poznamka",
        "Markéta s vámi probere situaci vašeho blízkého, vysvětlí podmínky přijetí a pomůže vám s žádostí i dalšími kroky."
      ),
      edit: {
        lead: c.target("kontakt.pracovnice.1.lead"),
        name: c.target("kontakt.pracovnice.1.jmeno"),
        role: c.target("kontakt.pracovnice.1.role"),
        note: c.target("kontakt.pracovnice.1.poznamka"),
      },
    },
  ];

  return (
    <ContactLayout
      copy={copy}
      editBranchId={editBranchId}
      branchId={branchId}
      hero={{
        eyebrow: c.s("kontakt.hero.eyebrow", "Kontakty"),
        title: c.s("kontakt.hero.title", "Nejste si jistí, kde začít? Ozvěte se nám."),
        lead: c.s(
          "kontakt.hero.text",
          "Výběr vhodné péče může přinášet mnoho otázek. Nemusíte se v nich orientovat sami. Zavolejte nebo napište našim sociálním pracovnicím — vyslechnou vaši situaci, vysvětlí možnosti a poradí s dalším postupem."
        ),
        edit: {
          eyebrow: c.target("kontakt.hero.eyebrow"),
          title: c.target("kontakt.hero.title"),
          lead: c.target("kontakt.hero.text"),
        },
      }}
      org={{
        name: c.s("kontakt.org.nazev", "AHC Centrum následné péče Sedlec-Prčice a.s."),
        addressLines: [
          c.s("kontakt.org.ulice", "Vítkovo náměstí 3"),
          c.s("kontakt.org.obec", "257 91 Sedlec-Prčice"),
          c.s("kontakt.org.zeme", "Česká republika"),
        ],
        identifiers: [
          "IČO: 25579282 · DIČ: CZ699007330",
          "Datová schránka: 8fcd9br",
        ],
        phoneLabel: "Ústředna",
        phones: ["+420 317 834 311", "+420 317 834 312"],
        phoneNote: "Fax: +420 317 834 553",
        mapUrl: mapUrlFor(
          "AHC Centrum následné péče Sedlec-Prčice, Vítkovo náměstí 3, Sedlec-Prčice"
        ),
        edit: { name: c.target("kontakt.org.nazev") },
      }}
      people={people}
      peopleTitle={c.s("kontakt.pracovnice.nadpis", "Sociální pracovnice")}
    >
      {/* Přímé kontakty na jednotlivá pracoviště */}
      <section className={`${wrap} py-14`}>
        <div className="grid gap-5 md:grid-cols-2 lg:grid-cols-3">
          <RegionSlot {...c.region("kontakt.primy.onp")}>
            <MiniContact c={c} ckey="kontakt.primy.onp" icon={Stethoscope} title="Oddělení následné péče (ONP)" rows={ONP_ROWS} />
          </RegionSlot>
          <RegionSlot {...c.region("kontakt.primy.dps")}>
            <MiniContact c={c} ckey="kontakt.primy.dps" icon={Home} title="Domov pro seniory" rows={DPS_ROWS} />
          </RegionSlot>
          <div className="space-y-5">
            <RegionSlot {...c.region("kontakt.primy.personalni")}>
              <div className="rounded-2xl border border-border bg-card p-5">
                <div className="flex items-center gap-2">
                  <Users className="h-5 w-5 text-brand" strokeWidth={1.75} />
                  {c.t("kontakt.primy.personalni.nadpis", "Personální oddělení", { as: "h4", className: "font-display text-base text-foreground" })}
                </div>
                <div className="mt-3 text-sm">
                  {c.t("kontakt.primy.personalni.jmeno", "Jaroslava Táboříková", { as: "div", className: "font-semibold text-foreground" })}
                  <div className="mt-1 flex items-center gap-2"><Mail className="h-4 w-4 text-brand" /><MailLink e="jaroslava.taborikova@ahc.cz" /></div>
                  <div className="mt-1 flex items-center gap-2"><Phone className="h-4 w-4 text-brand" /><Tel n="+420 317 701 125" /></div>
                </div>
                <Link href="/kariera" className="mt-3 inline-flex items-center gap-1.5 text-xs font-bold uppercase tracking-wider text-brand hover:gap-2.5">Prohlédnout volné pozice →</Link>
              </div>
            </RegionSlot>
            <RegionSlot {...c.region("kontakt.primy.depozit")}>
              <div className="rounded-2xl border border-border bg-card p-5">
                <div className="flex items-center gap-2">
                  <Wallet className="h-5 w-5 text-brand" strokeWidth={1.75} />
                  {c.t("kontakt.primy.depozit.nadpis", "Depozitní pokladna", { as: "h4", className: "font-display text-base text-foreground" })}
                </div>
                <div className="mt-3 space-y-1 text-sm text-muted-foreground">
                  {c.t("kontakt.primy.depozit.hodiny", "Po–Pá 7:00–15:00", { as: "div" })}
                  <div className="flex items-center gap-2"><Phone className="h-4 w-4 text-brand" /><Tel n="+420 317 729 647" /> <span>(l. 210 / 204)</span></div>
                  {c.t("kontakt.primy.depozit.ucet", "Účet: 0322086329/0800 (Česká spořitelna)", { as: "div" })}
                </div>
              </div>
            </RegionSlot>
          </div>
        </div>
      </section>
    </ContactLayout>
  );
}
