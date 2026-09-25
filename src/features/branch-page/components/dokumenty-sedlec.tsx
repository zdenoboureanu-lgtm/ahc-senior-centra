import { Stethoscope, Home } from "lucide-react";
import {
  DocumentsLayout,
  type DocGroup,
  type DocItem,
} from "@/features/documents/components/documents-layout";
import { makeCopy, type CopyHelpers, type CopyProps } from "@/features/inline-edit/copy";

interface Doc {
  title: string;
  desc: string;
  tag: string;
  href?: string;
}

const NP_DOCS: Doc[] = [
  { title: "Návrh na přijetí k hospitalizaci", desc: "Základní formulář pro posouzení možnosti přijetí pacienta na následnou lůžkovou péči.", tag: "Potřebné k žádosti", href: "/soubory/sedlec/np-navrh-na-prijeti.docx" },
  { title: "Souhlas se zpracováním osobních údajů", desc: "Souhlas je potřeba zaslat společně s návrhem na přijetí.", tag: "Potřebné k žádosti", href: "/soubory/sedlec/np-souhlas-zpracovani-udaju.docx" },
  { title: "Aktuální ceník", desc: "Přehled úhrad za doplňkové služby poskytované během pobytu.", tag: "Ceník", href: "/soubory/sedlec/np-cenik.docx" },
  { title: "Pravidla pro podávání stížností", desc: "Jak mohou pacienti a jejich blízcí podat podnět nebo stížnost a jak ji vyřizujeme.", tag: "Práva pacientů", href: "/soubory/sedlec/np-podavani-stiznosti.docx" },
  { title: "Seznam věcí potřebných k nástupu", desc: "Přehled osobních věcí, dokladů a vybavení, které je vhodné připravit před nástupem.", tag: "Před nástupem", href: "/soubory/sedlec/np-seznam-veci.docx" },
];

const DS_DOCS: Doc[] = [
  { title: "Žádost o poskytování sociální služby", desc: "Formulář, kterým zahájíte jednání o přijetí do domova pro seniory.", tag: "Potřebné k žádosti" },
  { title: "Posudek lékaře o zdravotním stavu žadatele", desc: "Dokument vyplňuje lékař. Termín doložení ověřte u sociální pracovnice.", tag: "Lékařský dokument" },
  { title: "Vzor smlouvy o poskytování sociální služby", desc: "Popisuje rozsah služby, práva a povinnosti klienta i poskytovatele.", tag: "K seznámení" },
  { title: "Domácí řád", desc: "Praktická pravidla společného života v domově.", tag: "Praktické informace" },
  { title: "Přehled úhrad", desc: "Aktuální přehled cen za ubytování, stravu a poskytované služby.", tag: "Ceník" },
  { title: "Pravidla pro podávání stížností", desc: "Každý klient má právo vyjádřit nespokojenost bez obavy o ovlivnění péče.", tag: "Práva klientů" },
  { title: "Co potřebujete k zahájení služby", desc: "Přehled dokumentů, věcí a informací potřebných před nástupem.", tag: "Před nástupem" },
];

/** Převede ručně psaný seznam na položky sdíleného layoutu. */
function toItems(docs: Doc[], c: CopyHelpers, prefix: string): DocItem[] {
  return docs.map((d, i) => ({
    key: `${prefix}-${i}`,
    region: c.region(`${prefix}.${i}`),
    tag: c.s(`${prefix}.${i}.stitek`, d.tag),
    title: c.s(`${prefix}.${i}.nadpis`, d.title),
    desc: c.s(`${prefix}.${i}.text`, d.desc),
    href: d.href,
    edit: {
      tag: c.target(`${prefix}.${i}.stitek`),
      title: c.target(`${prefix}.${i}.nadpis`),
      desc: c.target(`${prefix}.${i}.text`),
    },
  }));
}

/** Bespoke podstránka „Dokumenty" pro Sedlec-Prčice dle obsahové specifikace. */
export function DokumentySedlec({ copy, editBranchId }: CopyProps) {
  const c = makeCopy({ copy, editBranchId });

  const groups: DocGroup[] = [
    {
      id: "dokumenty-nasledna-pece",
      icon: Stethoscope,
      title: c.s("dokumenty.np.nadpis", "Dokumenty pro následnou lůžkovou péči"),
      lead: c.s("dokumenty.rozcestnik.0.text", "Formuláře k přijetí, informace před nástupem a ceník."),
      items: toItems(NP_DOCS, c, "dokumenty.np"),
      region: c.region("dokumenty.np"),
      edit: {
        title: c.target("dokumenty.np.nadpis"),
        lead: c.target("dokumenty.rozcestnik.0.text"),
      },
    },
    {
      id: "dokumenty-domov-pro-seniory",
      icon: Home,
      title: c.s("dokumenty.dps.nadpis", "Dokumenty pro domov pro seniory"),
      lead: c.s("dokumenty.rozcestnik.1.text", "Žádost, posudek, smlouva, pravidla domova a další."),
      items: toItems(DS_DOCS, c, "dokumenty.dps"),
      region: c.region("dokumenty.dps"),
      edit: {
        title: c.target("dokumenty.dps.nadpis"),
        lead: c.target("dokumenty.rozcestnik.1.text"),
      },
    },
  ];

  return (
    <DocumentsLayout
      copy={copy}
      editBranchId={editBranchId}
      hero={{
        title: c.s("dokumenty.hero.title", "Vše důležité přehledně a bez zbytečného hledání"),
        lead: c.s(
          "dokumenty.hero.text",
          "Najdete zde formuláře a praktické dokumenty potřebné k přijetí na následnou lůžkovou péči nebo do domova pro seniory. Nejste si jistí, který dokument potřebujete? Obraťte se na naši sociální pracovnici."
        ),
        edit: {
          title: c.target("dokumenty.hero.title"),
          lead: c.target("dokumenty.hero.text"),
        },
      }}
      groups={groups}
      contacts={[
        {
          key: "np",
          lead: c.s("dokumenty.pomoc.0.lead", "Následná lůžková péče"),
          name: c.s("dokumenty.pomoc.0.jmeno", "Veronika Pištěková"),
          role: c.s("dokumenty.pomoc.0.role", "Sociální pracovnice · Po–Pá 7:00–15:30"),
          email: "veronika.pistekova@ahc.cz",
          phone: "+420 317 729 647",
          mobile: "+420 702 078 993",
          edit: {
            lead: c.target("dokumenty.pomoc.0.lead"),
            name: c.target("dokumenty.pomoc.0.jmeno"),
            role: c.target("dokumenty.pomoc.0.role"),
          },
        },
        {
          key: "dps",
          lead: c.s("dokumenty.pomoc.1.lead", "Domov pro seniory"),
          name: c.s("dokumenty.pomoc.1.jmeno", "Markéta Mašková"),
          role: c.s("dokumenty.pomoc.1.role", "Sociální pracovnice · Po–Pá 7:00–15:30"),
          email: "marketa.maskova@ahc.cz",
          phone: "+420 317 729 647",
          mobile: "+420 720 840 462",
          edit: {
            lead: c.target("dokumenty.pomoc.1.lead"),
            name: c.target("dokumenty.pomoc.1.jmeno"),
            role: c.target("dokumenty.pomoc.1.role"),
          },
        },
      ]}
      assurance={{
        strong: c.s("dokumenty.ujisteni.tucne", "Nejste si jistí, co stáhnout?"),
        text: c.s(
          "dokumenty.ujisteni.text",
          "Nemusíte předem vědět, které dokumenty budete potřebovat. Ozvěte se nám a řekneme vám, které formuláře připravit a jak postupovat."
        ),
        cta: { label: "Jak požádat o přijetí", href: "/zadost-o-prijeti" },
        edit: {
          strong: c.target("dokumenty.ujisteni.tucne"),
          text: c.target("dokumenty.ujisteni.text"),
        },
      }}
      grant={{
        eyebrow: c.s("dokumenty.eu.eyebrow", "Spolufinancováno EU"),
        title: c.s("dokumenty.eu.nadpis", "Rozvoj kvality sociálních služeb"),
        text: c.s(
          "dokumenty.eu.text",
          "Projekt „Trvalý rozvoj kvality v pobytových zařízeních sociálních služeb skupiny AHC\" (1. 4. 2020 – 31. 3. 2022)."
        ),
        rows: [
          ["Registrační číslo", "CZ.03.2.63/0.0/0.0/19_098/0015332"],
          ["Celkové náklady", "5 215 825 Kč"],
          ["Dotace", "4 433 451,25 Kč"],
        ],
        edit: {
          eyebrow: c.target("dokumenty.eu.eyebrow"),
          title: c.target("dokumenty.eu.nadpis"),
          text: c.target("dokumenty.eu.text"),
        },
      }}
      legalLinks={[
        { label: "Zásady zpracování osobních údajů", href: "/gdpr" },
        { label: "Informace o používání cookies", href: "/gdpr" },
      ]}
      links={[
        { title: "Žádost o přijetí", desc: "Přehledný postup pro obě služby.", href: "/zadost-o-prijeti" },
        { title: "Služby", desc: "Jakou péči poskytujeme a pro koho.", href: "/sluzby" },
        { title: "Kontakty", desc: "Sociální pracovnice a pracoviště.", href: "/kontakt" },
      ]}
    />
  );
}
