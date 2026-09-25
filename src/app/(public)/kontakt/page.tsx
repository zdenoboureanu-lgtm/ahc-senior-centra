import { fetchQuery } from "convex/nextjs";
import { api } from "@/convex/_generated/api";
import { getBranchSlugFromHeaders } from "@/common/lib/branch";
import { canEditContent } from "@/common/lib/can-edit";
import { FaqSection } from "@/features/contact/components/faq-section";
import { TestimonialsSection } from "@/features/branch-home/components/testimonials-section";
import { ContactDirectory } from "@/features/contact/components/contact-directory";
import {
  ContactLayout,
  mapUrlFor,
  type ContactPerson,
} from "@/features/contact/components/contact-layout";
import { KontaktSedlec } from "@/features/branch-page/components/kontakt-sedlec";
import { loadBranchPageContext } from "@/features/inline-edit/load-copy";
import { SEDLEC_TEMPLATE } from "@/common/lib/branch-template";

/** Bez diakritiky a malými písmeny — pro porovnávání rolí. */
function normalize(text: string): string {
  return text
    .normalize("NFD")
    .replace(/\p{Diacritic}/gu, "")
    .toLowerCase();
}

export default async function ContactPage() {
  const slug = await getBranchSlugFromHeaders();

  if (slug) {
    const ctx = await loadBranchPageContext(slug);
    if (ctx.template === SEDLEC_TEMPLATE) {
      const b = await fetchQuery(api.modules.branches.queries.getBySlug, {
        slug,
      }).catch(() => null);
      if (b)
        return (
          <KontaktSedlec
            branchId={b._id}
            copy={ctx.copy}
            editBranchId={ctx.editBranchId}
          />
        );
    }
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
          page: "kontakty",
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
        <h1 className="text-2xl font-bold">Pobočka nenalezena</h1>
      </div>
    );
  }

  const { branch, team, faq, testimonials } = data;
  const editProps = {
    copy: siteCopy,
    editBranchId: canEdit ? branch._id : undefined,
  };

  /** Cíl editace pole člena týmu. */
  const teamField = (id: string, field: string) =>
    ({ kind: "field", table: "branch_team", id, field }) as const;
  // Kontaktní osoby jsou na stránce jen jednou — jeden blok pro celý tým.
  // Sociální pracovnice dáváme dopředu, ostatní za ně.
  const sortedTeam = [...team].sort((a, b) => {
    const rank = (m: (typeof team)[number]) =>
      /socialn/.test(normalize(m.role)) ? 0 : 1;
    return rank(a) - rank(b);
  });
  const people: ContactPerson[] =
    sortedTeam.length > 0
      ? sortedTeam.map((m) => ({
          key: m._id,
          lead: m.role,
          name: m.name,
          email: m.email ?? branch.email,
          phone: m.phone ?? branch.phone,
          note: m.bio ?? undefined,
          edit: canEdit
            ? {
                lead: teamField(m._id, "role"),
                name: teamField(m._id, "name"),
                note: teamField(m._id, "bio"),
                // Bez vlastního kontaktu se ukazuje ten na pobočku; přepsáním
                // se rovnou stane kontaktem té osoby.
                email: teamField(m._id, "email"),
                phone: teamField(m._id, "phone"),
              }
            : undefined,
          region: canEdit
            ? {
                edit: {
                  branchId: branch._id,
                  key: `row:branch_team:${m._id}`,
                  duplicate: { kind: "row", table: "branch_team", id: m._id },
                  remove: { kind: "row", table: "branch_team", id: m._id },
                },
                hidden: siteCopy[`hidden:row:branch_team:${m._id}`] === "1",
              }
            : { hidden: siteCopy[`hidden:row:branch_team:${m._id}`] === "1" },
        }))
      : [
          {
            key: "office",
            lead: branch.office_contact_name
              ? "Přijímací kancelář"
              : "Kontakt na pobočku",
            name: branch.office_contact_name ?? branch.name,
            email: branch.office_contact_email ?? branch.email,
            phone: branch.office_contact_phone ?? branch.phone,
          },
        ];

  // IČO a sídlo — každý řádek zvlášť, ať jde na webu přepsat jednotlivě.
  const branchField = (field: string) =>
    ({ kind: "field", table: "branches", id: branch._id, field }) as const;
  const identifierRows = [
    branch.ico ? { text: `IČO: ${branch.ico}`, field: "ico" } : null,
    branch.legal_address
      ? { text: `Sídlo: ${branch.legal_address}`, field: "legal_address" }
      : null,
  ].filter((x): x is { text: string; field: string } => Boolean(x));
  const identifiers = identifierRows.map((r) => r.text);
  const identifierEdits = canEdit
    ? identifierRows.map((r) => branchField(r.field))
    : undefined;

  // Menší pobočky mají sesternu na stejném čísle jako ústřednu — pak stačí jedno.
  const phoneFields = [
    { value: branch.phone, field: "phone" },
    { value: branch.sesterna_phone, field: "sesterna_phone" },
  ].filter(
    (p, i, all): p is { value: string; field: string } =>
      Boolean(p.value) && all.findIndex((o) => o.value === p.value) === i
  );
  const phones = phoneFields.map((p) => p.value);

  return (
    <ContactLayout
      copy={siteCopy}
      editBranchId={canEdit ? branch._id : undefined}
      branchId={branch._id}
      hero={{
        eyebrow: pageContent?.eyebrow ?? "Kontakty",
        title: pageContent?.title ?? "Nejste si jistí, kde začít? Ozvěte se nám.",
        lead:
          pageContent?.lead ??
          "Výběr vhodné péče může přinášet mnoho otázek. Nemusíte se v nich orientovat sami. Zavolejte nebo napište — vyslechneme vaši situaci, vysvětlíme možnosti a poradíme s dalším postupem.",
        edit:
          canEdit && pageContent
            ? {
                eyebrow: { kind: "page", pageId: pageContent._id, path: "eyebrow" },
                title: { kind: "page", pageId: pageContent._id, path: "title" },
                lead: { kind: "page", pageId: pageContent._id, path: "lead" },
              }
            : undefined,
      }}
      org={{
        name: branch.legal_name ?? branch.name,
        addressLines: [
          branch.street,
          `${branch.zip} ${branch.city}`,
          "Česká republika",
        ],
        identifiers,
        identifierEdits,
        phoneLabel: phones.length > 1 ? "Telefon a sesterna" : "Telefon",
        phones,
        email: branch.email,
        mapUrl: mapUrlFor(
          `${branch.name}, ${branch.street}, ${branch.zip} ${branch.city}`
        ),
        edit: canEdit
          ? {
              name: branchField("legal_name"),
              addressLines: [
                branchField("street"),
                undefined, // PSČ a město patří k sobě — mění se v administraci
                undefined,
              ],
              phones: phoneFields.map((p) => branchField(p.field)),
              email: branchField("email"),
            }
          : undefined,
      }}
      people={people}
      after={
        <>
          <FaqSection faq={faq} {...editProps} />
          <TestimonialsSection testimonials={testimonials} {...editProps} />
        </>
      }
    >
      {/* Plný adresář kontaktů pobočky (1:1 obsah od klienta) — v kartách
          jako na Sedlci-Prčici, s prokliknutelnými telefony a e-maily. */}
      {pageContent && pageContent.blocks.length > 0 ? (
        <ContactDirectory
          blocks={pageContent.blocks}
          hidePeople
          skip={[branch.name, branch.legal_name ?? branch.name]}
          editPageId={canEdit ? pageContent._id : undefined}
          editBranchId={canEdit ? branch._id : undefined}
          copy={siteCopy}
        />
      ) : null}
    </ContactLayout>
  );
}
