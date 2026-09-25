import Link from "next/link";
import { ArrowRight, Mail, Phone } from "lucide-react";
import { iconForHeading } from "@/features/site/components/block-icon";
import {
  RegionSlot,
  TextSlot,
} from "@/features/inline-edit/components/content-slot";
import type { EditTarget } from "@/features/inline-edit/edit-mode-context";
import type { RichBlock } from "@/features/site/components/rich-content";
import { EditOnly } from "@/features/inline-edit/components/edit-only";

/**
 * Adresář kontaktů pobočky ve vzhledu Sedlce-Prčice.
 *
 * Obsah je v článku (`branch_pages`, stránka „kontakty"): nadpis uvozuje
 * pracoviště, `feature` je jeden kontakt a jeho text má podobu
 * „Telefon: … · E-mail: … · poznámka". Místo dlouhého článku z toho
 * skládáme malé karty s prokliknutelnými telefony a e-maily.
 */

const wrap = "mx-auto max-w-[1320px] px-6 lg:px-10";

interface Row {
  kind: "phone" | "email" | "note";
  value: string;
}

const EMAIL_RE = /[\w.+-]+@[\w-]+\.[\w.-]{2,}/g;
// Česká čísla se píšou po trojicích, volitelně s předvolbou. Mezery jsou
// povinné, jinak by se do výběru trefilo i IČO nebo číslo popisné.
const PHONE_RE = /(?:\+\d{3}[\s\u00a0]*)?\d{3}[\s\u00a0]+\d{3}[\s\u00a0]+\d{3}/g;

/**
 * Rozebere text kontaktu na telefony, e-maily a zbytek.
 *
 * Oddělovač se v obsahu od klienta liší — někde „·", jinde čárka —, takže
 * čísla a adresy hledáme v celém textu a teprve zbytek dělíme na poznámky.
 */
function parseRows(text: string): Row[] {
  const emails = text.match(EMAIL_RE) ?? [];
  // E-maily vyjmeme první, ať se z „…@…" nevytáhne kus jako telefon.
  let rest = emails.reduce((acc, e) => acc.replace(e, " "), text);
  const phones = rest.match(PHONE_RE) ?? [];
  rest = phones.reduce((acc, p) => acc.replace(p, " "), rest);

  const notes = rest
    .split(/\s*[·•|,;]\s*|\s{2,}/)
    .map((part) =>
      part
        .replace(
          /\b(hlavní|přímý|služební|pevná)?\s*(telefon|tel\.|mobil|e-?mail|ústředna|sesterna|linka)\b\s*:?/gi,
          ""
        )
        .replace(/^[\s:,;.–—-]+|[\s:,;.–—-]+$/g, "")
        .trim()
    )
    .filter((part) => part.length > 2);

  return [
    ...phones.map((value): Row => ({ kind: "phone", value: value.trim() })),
    ...emails.map((value): Row => ({ kind: "email", value })),
    ...notes.map((value): Row => ({ kind: "note", value })),
  ];
}

/** Rozdělí „Jméno — role" na dvě řádky karty. */
function splitName(heading: string): { name: string; role?: string } {
  const m = heading.split(/\s+[—–-]\s+/);
  return m.length > 1
    ? { name: m[0].trim(), role: m.slice(1).join(" — ").trim() }
    : { name: heading.trim() };
}

interface Group {
  heading?: string;
  headingIndex?: number;
  contacts: (RichBlock & { _i: number })[];
  notes: (RichBlock & { _i: number })[];
}

function toGroups(blocks: (RichBlock & { _i: number })[]): Group[] {
  const groups: Group[] = [];
  let current: Group = { contacts: [], notes: [] };
  for (const b of blocks) {
    if (b.type === "heading") {
      if (current.heading || current.contacts.length || current.notes.length)
        groups.push(current);
      current = { heading: b.text, headingIndex: b._i, contacts: [], notes: [] };
    } else if (b.type === "feature") {
      current.contacts.push(b);
    } else {
      current.notes.push(b);
    }
  }
  if (current.heading || current.contacts.length || current.notes.length)
    groups.push(current);
  return groups;
}

function ContactCard({
  block,
  editPageId,
  region,
}: {
  block: RichBlock & { _i: number };
  editPageId?: string;
  region: { edit?: React.ComponentProps<typeof RegionSlot>["edit"]; hidden: boolean };
}) {
  const { name, role } = splitName(block.heading ?? "");
  const rows = parseRows(block.text ?? "");
  const Icon = iconForHeading(block.heading);
  const target = (p: string): EditTarget | undefined =>
    editPageId ? { kind: "page", pageId: editPageId, path: p } : undefined;

  return (
    <RegionSlot className="h-full" {...region}>
      <div className="h-full rounded-2xl border border-border bg-card p-5">
        <div className="flex items-center gap-2">
          <Icon className="h-5 w-5 shrink-0 text-brand" strokeWidth={1.75} />
          <TextSlot
            as="h4"
            target={target(`blocks.${block._i}.heading`)}
            value={name}
            className="font-display text-base text-foreground"
          />
        </div>
        {role ? (
          <div className="mt-1 text-[11px] font-bold uppercase tracking-[0.18em] text-warm-dark">
            {role}
          </div>
        ) : null}
        <div className="mt-3 space-y-1.5 text-sm">
          {rows.map((r, i) =>
            r.kind === "phone" ? (
              <div key={i} className="flex items-center gap-2">
                <Phone className="h-4 w-4 shrink-0 text-brand" />
                <a
                  href={`tel:${r.value.replace(/\s/g, "")}`}
                  className="font-semibold text-foreground hover:text-brand"
                >
                  {r.value}
                </a>
              </div>
            ) : r.kind === "email" ? (
              <div key={i} className="flex items-center gap-2">
                <Mail className="h-4 w-4 shrink-0 text-brand" />
                <a
                  href={`mailto:${r.value}`}
                  className="break-all font-semibold text-foreground hover:text-brand"
                >
                  {r.value}
                </a>
              </div>
            ) : (
              <p key={i} className="leading-relaxed text-muted-foreground">
                {r.value}
              </p>
            )
          )}
        </div>
        {/* Zdrojový řádek — telefony a e-maily se na stránce vykreslují jako
            odkazy, ale upravují se tady jako jeden text. Vidí ho jen správce
            se zapnutým režimem úprav. */}
        {editPageId ? (
          <EditOnly>
            <div className="mt-3 border-t border-dashed border-border pt-2">
              <div className="text-[10px] font-bold uppercase tracking-wider text-muted-foreground">
                Kontaktní údaje
              </div>
              <TextSlot
                as="p"
                target={target(`blocks.${block._i}.text`)}
                value={block.text ?? ""}
                className="mt-1 block text-xs leading-relaxed text-muted-foreground"
              />
            </div>
          </EditOnly>
        ) : null}
      </div>
    </RegionSlot>
  );
}

/** Bez diakritiky a malými písmeny — pro porovnávání nadpisů. */
function norm(text: string): string {
  return text
    .normalize("NFD")
    .replace(/\p{Diacritic}/gu, "")
    .trim()
    .toLowerCase();
}

export function ContactDirectory({
  blocks,
  skip = [],
  hidePeople = false,
  editPageId,
  editBranchId,
  copy = {},
}: {
  blocks: RichBlock[];
  /** Nadpisy, které už ukazuje karta organizace — ať tam nejsou dvakrát. */
  skip?: string[];
  /**
   * Vynechá karty osob. Kontaktní osoby má stránka nahoře ve vlastním bloku
   * a klient si je tam plní sám — adresář pak ukazuje jen zbylé informace.
   */
  hidePeople?: boolean;
  editPageId?: string;
  editBranchId?: string;
  copy?: Record<string, string>;
}) {
  const skipped = new Set(skip.map(norm));
  const indexed = blocks
    .map((b, i) => ({ ...b, _i: b.sourceIndex ?? i }))
    .filter(
      (b) =>
        b.type !== "feature" ||
        (!hidePeople && !skipped.has(norm(b.heading ?? "")))
    );
  // Nadpis bez obsahu („Vedení zařízení" po vynechání osob) na stránce nemá co dělat.
  const groups = toGroups(indexed).filter(
    (g) => g.contacts.length > 0 || g.notes.length > 0
  );
  if (groups.length === 0) return null;

  const region = (b: RichBlock & { _i: number }) => {
    const key = `page:${editPageId}:${b.uid ?? b._i}`;
    return {
      edit: editBranchId
        ? {
            branchId: editBranchId,
            key,
            duplicate:
              editPageId && b.type === "feature"
                ? ({ kind: "block", pageId: editPageId, index: b._i } as const)
                : undefined,
            remove:
              editPageId && b.uid
                ? ({ kind: "block", pageId: editPageId, uid: b.uid } as const)
                : undefined,
          }
        : undefined,
      hidden: copy[`hidden:${key}`] === "1",
    };
  };
  const target = (p: string): EditTarget | undefined =>
    editPageId ? { kind: "page", pageId: editPageId, path: p } : undefined;

  // Skupiny bez kontaktní karty jsou krátké informace („Adresa místa
  // poskytování", „Provozovatel"). Sedlec je má jako malé kartičky vedle
  // sebe, ne jako velké nadpisy přes celou šířku — držíme to stejně.
  const isInfo = (g: Group) => g.contacts.length === 0 && g.notes.length > 0;

  const rows: { info?: Group[]; group?: Group }[] = [];
  for (const g of groups) {
    const last = rows[rows.length - 1];
    if (isInfo(g)) {
      if (last?.info) last.info.push(g);
      else rows.push({ info: [g] });
    } else {
      rows.push({ group: g });
    }
  }

  return (
    <section className={`${wrap} py-14`}>
      <div className="space-y-12">
        {rows.map((row, ri) =>
          row.info ? (
            <div key={ri} className="grid gap-5 md:grid-cols-2 lg:grid-cols-3">
              {row.info.map((g) => {
                const Icon = iconForHeading(g.heading);
                return (
                  <div
                    key={g.headingIndex ?? g.heading}
                    className="h-full rounded-2xl border border-border bg-card p-5"
                  >
                    <div className="flex items-center gap-2">
                      <Icon
                        className="h-5 w-5 shrink-0 text-brand"
                        strokeWidth={1.75}
                      />
                      {g.heading ? (
                        <TextSlot
                          as="h3"
                          target={
                            g.headingIndex !== undefined
                              ? target(`blocks.${g.headingIndex}.text`)
                              : undefined
                          }
                          value={g.heading}
                          className="font-display text-base text-foreground"
                        />
                      ) : null}
                    </div>
                    <div className="mt-2 space-y-2">
                      {g.notes.map((b) => <Notes key={b._i} block={b} small />)}
                    </div>
                  </div>
                );
              })}
            </div>
          ) : (
            <Section key={ri} g={row.group!} />
          )
        )}
      </div>
    </section>
  );

  /** Doplňující obsah skupiny — odstavec, výčet nebo tlačítko. */
  function Notes({
    block: b,
    small = false,
  }: {
    block: RichBlock & { _i: number };
    small?: boolean;
  }) {
    if (b.type === "list") {
      return (
        <ul className="flex flex-wrap gap-2">
          {(b.bullets ?? []).map((t, j) => (
            <li
              key={j}
              className="rounded-full bg-brand-light px-3 py-1.5 text-xs font-semibold text-brand"
            >
              <TextSlot target={target(`blocks.${b._i}.bullets.${j}`)} value={t} />
            </li>
          ))}
        </ul>
      );
    }
    if (b.type === "cta") {
      return (
        <RegionSlot {...region(b)}>
          <Link
            href={b.href ?? "/zadost-o-prijeti"}
            className={
              small
                ? "inline-flex items-center gap-1.5 text-xs font-bold uppercase tracking-wider text-brand hover:gap-2.5"
                : "inline-flex items-center gap-2 rounded-full bg-brand px-6 py-3 text-sm font-semibold text-brand-foreground transition-colors hover:bg-brand-dark"
            }
          >
            {b.label ?? "Žádost o přijetí"} <ArrowRight className="h-4 w-4" />
          </Link>
        </RegionSlot>
      );
    }
    if (b.type !== "paragraph") return null;
    return (
      <RegionSlot {...region(b)}>
        <TextSlot
          as="p"
          target={target(`blocks.${b._i}.text`)}
          value={b.text ?? ""}
          className={
            small
              ? "text-sm leading-relaxed text-muted-foreground"
              : "text-[15px] leading-relaxed text-muted-foreground"
          }
        />
      </RegionSlot>
    );
  }

  function Section({ g }: { g: Group }) {
    return (
          <div>
            {g.heading ? (
              <TextSlot
                as="h2"
                target={
                  g.headingIndex !== undefined
                    ? target(`blocks.${g.headingIndex}.text`)
                    : undefined
                }
                value={g.heading}
                className="font-display mb-5 block text-xl text-foreground sm:text-2xl"
              />
            ) : null}

            {g.contacts.length > 0 ? (
              <div className="grid gap-5 md:grid-cols-2 lg:grid-cols-3">
                {g.contacts.map((b) => (
                  <ContactCard
                    key={b._i}
                    block={b}
                    editPageId={editPageId}
                    region={region(b)}
                  />
                ))}
              </div>
            ) : null}

            {g.notes.length > 0 ? (
              <div
                className={`${g.contacts.length > 0 ? "mt-6" : ""} max-w-3xl space-y-3`}
              >
                {g.notes.map((b) => <Notes key={b._i} block={b} />)}
              </div>
            ) : null}
          </div>
    );
  }
}
