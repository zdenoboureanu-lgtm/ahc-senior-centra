import {
  ClipboardList,
  FileSignature,
  Receipt,
  ScrollText,
  MessageSquareWarning,
  Files,
} from "lucide-react";
import type { LucideIcon } from "lucide-react";
import { fetchQuery } from "convex/nextjs";
import { api } from "@/convex/_generated/api";
import { getBranchSlugFromHeaders } from "@/common/lib/branch";
import { canEditContent } from "@/common/lib/can-edit";
import { RichContent } from "@/features/site/components/rich-content";
import {
  DocumentsLayout,
  type DocContact,
  type DocGroup,
  type Region,
} from "@/features/documents/components/documents-layout";
import { DokumentySedlec } from "@/features/branch-page/components/dokumenty-sedlec";
import { loadBranchPageContext } from "@/features/inline-edit/load-copy";
import { SEDLEC_TEMPLATE } from "@/common/lib/branch-template";
import type { CopyProps } from "@/features/inline-edit/copy";

const BESPOKE_DOKUMENTY: Record<string, (p: CopyProps) => React.ReactElement> = {
  [SEDLEC_TEMPLATE]: DokumentySedlec,
};

/** Kategorie dokumentů v pořadí, v jakém je návštěvník potřebuje. */
const CATEGORIES: {
  key: string;
  id: string;
  icon: LucideIcon;
  description: string;
  match: RegExp;
}[] = [
  {
    key: "Žádost o přijetí",
    id: "dokumenty-zadost",
    icon: ClipboardList,
    description:
      "Formuláře, které budete potřebovat při podání žádosti o poskytování služby.",
    match: /zadost|posudek|prijet|zajemc|postup/,
  },
  {
    key: "Smlouvy",
    id: "dokumenty-smlouvy",
    icon: FileSignature,
    description: "Vzory smluv o poskytování jednotlivých typů služby.",
    match: /smlouv/,
  },
  {
    key: "Úhrady a ceníky",
    id: "dokumenty-uhrady",
    icon: Receipt,
    description: "Aktuální přehledy úhrad za ubytování, stravu a péči.",
    match: /uhrad|cenik|platb|ceny/,
  },
  {
    key: "Pravidla a provoz",
    id: "dokumenty-pravidla",
    icon: ScrollText,
    description:
      "Domácí řád, seznam osobních věcí k nástupu a další provozní informace.",
    match: /domaci rad|rad|co si vzit|vybaveni|veci|provoz/,
  },
  {
    key: "Podněty a stížnosti",
    id: "dokumenty-stiznosti",
    icon: MessageSquareWarning,
    description:
      "Jak podat podnět, připomínku nebo stížnost a jak je vyřizujeme.",
    match: /stiznost|podnet|pripominka/,
  },
  {
    key: "Ostatní dokumenty",
    id: "dokumenty-ostatni",
    icon: Files,
    description: "Další dokumenty ke stažení.",
    match: /.^/, // nikdy nesedí — slouží jako koš
  },
];

/** Bez diakritiky a malými písmeny — pro porovnávání názvů. */
function normalize(text: string): string {
  return text
    .normalize("NFD")
    .replace(/\p{Diacritic}/gu, "")
    .toLowerCase();
}

/** Zařadí dokument do kategorie podle názvu. */
function categorize(title: string): string {
  const t = normalize(title);
  return CATEGORIES.find((c) => c.match.test(t))?.key ?? "Ostatní dokumenty";
}

export default async function DocumentsPage() {
  const slug = await getBranchSlugFromHeaders();

  if (slug) {
    const ctx = await loadBranchPageContext(slug);
    const Bespoke = ctx.template ? BESPOKE_DOKUMENTY[ctx.template] : undefined;
    if (Bespoke)
      return <Bespoke copy={ctx.copy} editBranchId={ctx.editBranchId} />;
  }

  const [data, pageContent, canEdit, siteCopy] = await Promise.all([
    slug
      ? fetchQuery(api.modules.branches.queries.getHomepage, { slug }).catch(
          () => null
        )
      : Promise.resolve(null),
    slug
      ? fetchQuery(api.modules.branches.queries.getBranchPage, {
          slug,
          page: "dokumenty",
        }).catch(() => null)
      : Promise.resolve(null),
    canEditContent(),
    slug
      ? fetchQuery(api.modules.content.queries.getCopy, { slug }).catch(
          () => ({}) as Record<string, string>
        )
      : Promise.resolve({} as Record<string, string>),
  ]);

  if (!data) {
    return (
      <div className="mx-auto max-w-3xl px-4 py-24 text-center">
        <h1 className="font-display text-3xl">Pobočka nenalezena</h1>
      </div>
    );
  }

  const { branch, documents, team } = data;

  /** Skrývání (a u řádků i duplikace) prvků stránky. */
  const region = (
    key: string,
    row?: { table: string; id: string }
  ): Region => ({
    edit: canEdit
      ? {
          branchId: branch._id,
          key,
          duplicate: row ? { kind: "row", ...row } : undefined,
          remove: row ? { kind: "row", ...row } : undefined,
        }
      : undefined,
    hidden: siteCopy[`hidden:${key}`] === "1",
  });

  // Dokumenty do stejných kachlí, jaké má Sedlec — rozdíl je jen ve zdroji dat.
  const groups: DocGroup[] = CATEGORIES.map((cat) => ({
    id: cat.id,
    icon: cat.icon,
    title: cat.key,
    lead: cat.description,
    region: region(`dokumenty:skupina:${cat.id}`),
    items: documents
      .filter((d) => categorize(d.title) === cat.key)
      .map((d) => ({
        key: d._id,
        tag: cat.key,
        title: d.title,
        desc: d.description ?? undefined,
        href: d.file_url,
        region: region(`row:branch_documents:${d._id}`, {
          table: "branch_documents",
          id: d._id,
        }),
        edit: canEdit
          ? {
              title: {
                kind: "field" as const,
                table: "branch_documents",
                id: d._id,
                field: "title",
              },
              desc: {
                kind: "field" as const,
                table: "branch_documents",
                id: d._id,
                field: "description",
              },
              file: {
                kind: "field" as const,
                table: "branch_documents",
                id: d._id,
                field: "file_url",
              },
            }
          : undefined,
      })),
  }));

  // Kontakt na sociální pracovnice — stejná karta jako u Sedlce. Bereme je
  // z týmu pobočky, jinak padáme na kancelářský kontakt.
  const socialWorkers = team.filter((m) => /socialn/.test(normalize(m.role)));
  const contacts: DocContact[] = (
    socialWorkers.length > 0
      ? socialWorkers.slice(0, 2).map((m) => ({
          key: m._id,
          lead: m.role,
          name: m.name,
          role: undefined,
          email: m.email ?? branch.email,
          phone: m.phone ?? branch.phone,
          edit: canEdit
            ? {
                name: {
                  kind: "field" as const,
                  table: "branch_team",
                  id: m._id,
                  field: "name",
                },
                lead: {
                  kind: "field" as const,
                  table: "branch_team",
                  id: m._id,
                  field: "role",
                },
              }
            : undefined,
        }))
      : [
          {
            // Bez jmenovitého kontaktu ukážeme aspoň spojení na pobočku —
            // karta „Potřebujete pomoci s dokumenty?" má být všude.
            key: "office",
            lead: branch.office_contact_name
              ? "Přijímací kancelář"
              : "Kontakt na pobočku",
            name: branch.office_contact_name ?? branch.name,
            email: branch.office_contact_email ?? branch.email,
            phone: branch.office_contact_phone ?? branch.phone,
          },
        ]
  ) satisfies DocContact[];

  const hasFiles = documents.length > 0;

  // Bez souborů by stránka zela prázdnotou — pak ukážeme celý článek pobočky.
  const blocks = (pageContent?.blocks ?? []).map((b, i) => ({
    ...b,
    sourceIndex: i,
  }));
  const article =
    !hasFiles && pageContent && blocks.length > 0 ? (
      <div className="pb-4">
        <RichContent
          page={{ ...pageContent, blocks }}
          contact={{
            name: branch.office_contact_name ?? undefined,
            role: branch.office_contact_name ? "Kontaktní osoba" : undefined,
            phone: branch.office_contact_phone ?? branch.phone,
            email: branch.office_contact_email ?? branch.email,
          }}
          editPageId={canEdit ? pageContent._id : undefined}
            editBranchId={canEdit ? data.branch._id : undefined}
            copy={siteCopy}
        />
      </div>
    ) : null;

  return (
    <DocumentsLayout
      copy={siteCopy}
      editBranchId={canEdit ? branch._id : undefined}
      hero={{
        title: pageContent?.title ?? "Vše důležité přehledně a bez zbytečného hledání",
        lead:
          pageContent?.lead ??
          "Žádosti, ceníky, domácí řád a další dokumenty na jednom místě. Nejste si jistí, který potřebujete? Ozvěte se nám.",
        edit:
          canEdit && pageContent
            ? {
                title: { kind: "page", pageId: pageContent._id, path: "title" },
                lead: { kind: "page", pageId: pageContent._id, path: "lead" },
              }
            : undefined,
      }}
      groups={groups}
      contacts={contacts}
      assurance={{
        strong: "Nejste si jistí, co stáhnout?",
        text: "Nemusíte předem vědět, které dokumenty budete potřebovat. Ozvěte se nám a řekneme vám, které formuláře připravit a jak postupovat.",
        cta: { label: "Jak požádat o přijetí", href: "/zadost-o-prijeti" },
      }}
      legalLinks={[
        { label: "Zásady zpracování osobních údajů", href: "/gdpr" },
        { label: "Informace o používání cookies", href: "/gdpr" },
      ]}
      links={[
        {
          title: "Žádost o přijetí",
          desc: "Přehledný postup a co všechno doložit.",
          href: "/zadost-o-prijeti",
        },
        {
          title: "Služby",
          desc: "Jakou péči poskytujeme a pro koho.",
          href: "/sluzby",
        },
        {
          title: "Kontakty",
          desc: "Sociální pracovnice a jednotlivá pracoviště.",
          href: "/kontakt",
        },
      ]}
    >
      {article}
    </DocumentsLayout>
  );
}
