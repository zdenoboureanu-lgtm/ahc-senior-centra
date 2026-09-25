import Image from "next/image";
import Link from "next/link";
import { ArrowRight, ArrowUpRight, Check, Mail, Phone, Quote } from "lucide-react";
import { SectionNav } from "./section-nav";
import { iconForHeading } from "./block-icon";
import {
  ImageSlot,
  RegionSlot,
  TextSlot,
} from "@/features/inline-edit/components/content-slot";
import type { RegionEdit } from "@/features/inline-edit/components/editable-region";
import type { EditTarget } from "@/features/inline-edit/edit-mode-context";
import { makeCopy } from "@/features/inline-edit/copy";
import { EditableFile } from "@/features/inline-edit/components/editable-file";

export interface RichBlock {
  type: string;
  text?: string;
  heading?: string;
  author?: string;
  href?: string;
  label?: string;
  items?: { label: string; text?: string; url?: string; image?: string }[];
  bullets?: string[];
  /** Stabilní identita bloku — drží skrývání na místě i po vložení kopie. */
  uid?: string;
  /**
   * Pozice bloku v původním poli `branch_pages.blocks`. Vyplňuje ji volající,
   * který bloky před vykreslením filtruje (např. Dokumenty ukazují jen závěr)
   * — jinak by inline editor psal do špatného bloku.
   */
  sourceIndex?: number;
}

export interface RichPage {
  title?: string;
  eyebrow?: string;
  lead?: string;
  blocks: RichBlock[];
}

const wrap = "mx-auto max-w-[1320px] px-6 lg:px-10";
/** Šířka pro čtený text — bloky karet jdou přes celou šířku sekce. */
const prose = "mx-auto max-w-3xl";
/** Výška sekce. Stejná jako na Sedlci-Prčici, ať mají weby jeden rytmus. */
const band = "py-16 lg:py-20";

export interface RichImage {
  src: string;
  /** Popisek fotky (název zázemí nebo caption z galerie) — řídí párování se sekcí. */
  label?: string;
  /** Odkud fotka pochází — aby šla v režimu úprav vyměnit. */
  edit?: { table: string; id: string; field: string };
}

/**
 * Blok i s pořadím v původním poli. Index je adresa pro inline editor
 * (`blocks.3.text`), takže musí přežít roztřídění do sekcí.
 */
type IndexedBlock = RichBlock & { _i: number };

interface Section {
  heading?: string;
  /** Index nadpisového bloku v původním poli. */
  headingIndex?: number;
  /** Nadpisový blok — nosič identity celé sekce. */
  headingBlock?: IndexedBlock;
  blocks: IndexedBlock[];
}

/** Zkratka pro cíl editace uvnitř článkové podstránky. */
function path(pageId: string | undefined, p: string): EditTarget | undefined {
  return pageId ? { kind: "page", pageId, path: p } : undefined;
}

/** Typy bloků, u kterých kopie vytvoří viditelně samostatný prvek. */
const DUPLICABLE_BLOCKS = new Set(["feature", "quote", "tiles", "linklist", "cta"]);

/** Skrývání a duplikace bloků článku. */
interface Regions {
  /** Props pro `RegionSlot` u konkrétního bloku. */
  block: (b: IndexedBlock) => { edit?: RegionEdit; hidden: boolean };
  /** Props pro celou sekci (nadpis + vše pod ním). */
  section: (b?: IndexedBlock) => { edit?: RegionEdit; hidden: boolean };
}

function makeRegions(
  pageId: string | undefined,
  branchId: string | undefined,
  copy: Record<string, string>
): Regions {
  const at = (
    key: string,
    duplicate?: RegionEdit["duplicate"],
    remove?: RegionEdit["remove"]
  ) => ({
    edit: branchId ? { branchId, key, duplicate, remove } : undefined,
    hidden: copy[`hidden:${key}`] === "1",
  });
  // Klíč vážeme na `uid` bloku; pořadí je jen nouzová varianta pro stránky,
  // které ještě uid nemají.
  const idOf = (b: IndexedBlock) => b.uid ?? String(b._i);
  return {
    block: (b) =>
      at(
        `page:${pageId}:${idOf(b)}`,
        // Kopii nabízíme jen tam, kde vznikne samostatná karta. Kopie odstavce
        // nebo výčtu se slije do téhož bloku a vypadá to jen jako zdvojený text.
        pageId && DUPLICABLE_BLOCKS.has(b.type)
          ? { kind: "block", pageId, index: b._i }
          : undefined,
        pageId && b.uid ? { kind: "block", pageId, uid: b.uid } : undefined
      ),
    section: (b) =>
      b === undefined
        ? { edit: undefined, hidden: false }
        : at(`page:${pageId}:sekce:${idOf(b)}`),
  };
}

/** Cíl editace fotky — obrázky žijí mimo blok, ve vlastní tabulce. */
function imageTarget(
  enabled: boolean,
  edit?: RichImage["edit"]
): EditTarget | undefined {
  return enabled && edit
    ? { kind: "field", table: edit.table, id: edit.id, field: edit.field }
    : undefined;
}

/** Kotva sekce z nadpisu — pro přichycenou navigaci. */
export function anchorId(text?: string): string | undefined {
  if (!text) return undefined;
  return text
    .normalize("NFD")
    .replace(/\p{Diacritic}/gu, "")
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-+|-+$/g, "")
    .slice(0, 48) || undefined;
}

/** Hrubé téma textu — spojuje nadpis sekce s popiskem fotky. */
function topicOf(text?: string): string | null {
  if (!text) return null;
  const t = text
    .normalize("NFD")
    .replace(/\p{Diacritic}/gu, "")
    .toLowerCase();
  if (/pokoj|luzk|ubytov|bydl|soukrom|osobni veci|noc/.test(t)) return "pokoj";
  if (/koupel|hygien|sprch|wc|toalet/.test(t)) return "koupelna";
  if (/jidel|strav|kuchyn|jidlo|kantyn/.test(t)) return "jidelna";
  if (/zahrad|prirod|venk|teras|park|exterier|budov|okoli/.test(t)) return "venku";
  if (/spolecn|klubovn|salon|posezeni|setkav/.test(t)) return "spolecne";
  if (/ambulan|ordinac|rentgen|odberov|vysetr/.test(t)) return "ordinace";
  if (/rehabilitac|cvic|fyzioterap|telocvic/.test(t)) return "rehabilitace";
  if (/aktivit|tvor|program|zabav|kultur|zivot/.test(t)) return "aktivity";
  return null;
}

/** Rozdělí plochý seznam bloků na sekce — nadpis vždy zahajuje novou. */
function toSections(blocks: IndexedBlock[]): Section[] {
  const sections: Section[] = [];
  let current: Section = { blocks: [] };
  for (const b of blocks) {
    if (b.type === "heading") {
      if (current.heading || current.blocks.length > 0) sections.push(current);
      current = { heading: b.text, headingIndex: b._i, headingBlock: b, blocks: [] };
    } else {
      current.blocks.push(b);
    }
  }
  if (current.heading || current.blocks.length > 0) sections.push(current);
  return sections;
}

/** Seskupí po sobě jdoucí bloky stejného typu, aby šly vykreslit do mřížky. */
function toRuns(blocks: IndexedBlock[]): IndexedBlock[][] {
  const runs: IndexedBlock[][] = [];
  for (const b of blocks) {
    const last = runs[runs.length - 1];
    if (last && last[0].type === b.type) last.push(b);
    else runs.push([b]);
  }
  return runs;
}

/** Krátké odrážky (jedno dvě slova) vypadají líp jako štítky než jako seznam. */
function isTagList(bullets: string[]): boolean {
  if (bullets.length < 3) return false;
  const words = bullets.map((b) => b.trim().split(/\s+/).length);
  return words.every((w) => w <= 3);
}

function Paragraphs({
  blocks,
  editPageId,
  regions,
  narrow = true,
}: {
  blocks: IndexedBlock[];
  editPageId?: string;
  regions?: Regions;
  narrow?: boolean;
}) {
  return (
    <div className={narrow ? `${prose} space-y-4` : "space-y-4"}>
      {blocks.map((b) => (
        <RegionSlot key={b._i} {...(regions?.block(b) ?? {})}>
          <TextSlot
            as="p"
            target={path(editPageId, `blocks.${b._i}.text`)}
            value={b.text ?? ""}
            className="text-base leading-[1.8] text-muted-foreground"
          />
        </RegionSlot>
      ))}
    </div>
  );
}

/**
 * Karty hodnot — ikonka v zaobleném čtverci, nadpis, text.
 * Stejná karta jako „Hodnoty, podle kterých pečujeme" na Sedlci-Prčici.
 */
function Features({
  blocks,
  editPageId,
  regions,
}: {
  blocks: IndexedBlock[];
  editPageId?: string;
  regions?: Regions;
}) {
  const single = blocks.length === 1;
  return (
    <div className={single ? "mx-auto max-w-3xl" : "grid gap-5 sm:grid-cols-2"}>
      {blocks.map((b) => {
        const Icon = iconForHeading(b.heading);
        return (
          <RegionSlot key={b._i} {...(regions?.block(b) ?? {})}>
            <div className="h-full rounded-2xl border border-border bg-card p-6">
              <span className="flex h-12 w-12 items-center justify-center rounded-2xl bg-brand-light text-brand">
                <Icon className="h-6 w-6" strokeWidth={1.75} />
              </span>
              <TextSlot
                as="h3"
                target={path(editPageId, `blocks.${b._i}.heading`)}
                value={b.heading ?? ""}
                className="font-display mt-4 block text-lg text-foreground"
              />
              {b.text ? (
                <TextSlot
                  as="p"
                  target={path(editPageId, `blocks.${b._i}.text`)}
                  value={b.text}
                  className="mt-2 block text-[15px] leading-relaxed text-muted-foreground"
                />
              ) : null}
            </div>
          </RegionSlot>
        );
      })}
    </div>
  );
}

/**
 * Výčet ve vzhledu Sedlce: buď štítky (krátké položky), nebo odrážky
 * s kolečkem a fajfkou. Žádná velká ohraničená karta — text má dýchat.
 * `lead` je uvozovací věta z předchozího odstavce („Zajímá nás:").
 */
function Bullets({
  blocks,
  lead,
  editPageId,
  regions,
  columns = true,
}: {
  blocks: IndexedBlock[];
  lead?: IndexedBlock;
  editPageId?: string;
  regions?: Regions;
  /** Ve dvou sloupcích; vedle fotky se vypíná, aby se text nelámal. */
  columns?: boolean;
}) {
  const items = blocks.flatMap((b) =>
    (b.bullets ?? []).map((text, j) => ({
      text,
      key: `${b._i}-${j}`,
      path: `blocks.${b._i}.bullets.${j}`,
    }))
  );
  if (items.length === 0) return null;
  const tags = isTagList(items.map((i) => i.text));
  const leadEl = lead?.text ? (
    <TextSlot
      as="p"
      target={path(editPageId, `blocks.${lead._i}.text`)}
      value={lead.text}
      className="font-display mb-5 block text-lg text-foreground"
    />
  ) : null;

  return (
    <RegionSlot {...(regions?.block(blocks[0]) ?? {})}>
      <div className={columns ? "mx-auto max-w-4xl" : undefined}>
        {leadEl}
        {tags ? (
          <ul className="flex flex-wrap gap-2">
            {items.map((it) => (
              <li
                key={it.key}
                className="rounded-full bg-brand-light px-3 py-1.5 text-xs font-semibold text-brand"
              >
                <TextSlot target={path(editPageId, it.path)} value={it.text} />
              </li>
            ))}
          </ul>
        ) : (
          <ul
            className={
              columns && items.length > 4
                ? "grid gap-x-10 gap-y-4 sm:grid-cols-2"
                : "space-y-4"
            }
          >
            {items.map((it) => (
              <li key={it.key} className="flex gap-3">
                <span className="mt-0.5 flex h-6 w-6 shrink-0 items-center justify-center rounded-full bg-brand text-brand-foreground">
                  <Check className="h-3.5 w-3.5" strokeWidth={2.5} />
                </span>
                <TextSlot
                  as="span"
                  target={path(editPageId, it.path)}
                  value={it.text}
                  className="text-[15px] leading-relaxed text-foreground sm:text-base"
                />
              </li>
            ))}
          </ul>
        )}
      </div>
    </RegionSlot>
  );
}

/** Citace ve vzhledu sekce „Příběhy" na Sedlci-Prčici. */
function Quotes({
  blocks,
  editPageId,
  regions,
}: {
  blocks: IndexedBlock[];
  editPageId?: string;
  regions?: Regions;
}) {
  const single = blocks.length === 1;
  return (
    <div className={single ? "mx-auto max-w-3xl" : "grid gap-5 md:grid-cols-2"}>
      {blocks.map((b) => (
        <RegionSlot key={b._i} {...(regions?.block(b) ?? {})}>
          <figure className="h-full rounded-2xl bg-card p-6 ring-1 ring-border">
            <Quote className="h-6 w-6 text-warm" strokeWidth={1.5} />
            <blockquote className="mt-3 text-[15px] leading-relaxed text-foreground">
              „
              <TextSlot
                target={path(editPageId, `blocks.${b._i}.text`)}
                value={b.text ?? ""}
              />
              “
            </blockquote>
            {b.author ? (
              <TextSlot
                as="figcaption"
                target={path(editPageId, `blocks.${b._i}.author`)}
                value={b.author}
                className="mt-3 block text-sm font-semibold text-muted-foreground"
              />
            ) : null}
          </figure>
        </RegionSlot>
      ))}
    </div>
  );
}

/**
 * Rozcestník hlavních služeb — velké kachlice s fotkou, jako má Sedlec-Prčice.
 * Návštěvník si vybere podle situace, kterou zrovna řeší.
 */
function Tiles({
  blocks,
  editPageId,
}: {
  blocks: IndexedBlock[];
  editPageId?: string;
}) {
  const items = blocks.flatMap((b) =>
    (b.items ?? []).map((it, j) => ({
      ...it,
      key: `${b._i}-${j}`,
      base: `blocks.${b._i}.items.${j}`,
    }))
  );
  if (items.length === 0) return null;
  return (
    <div
      className={
        items.length === 1 ? "mx-auto max-w-2xl" : "grid gap-6 md:grid-cols-2"
      }
    >
      {items.map((it) => {
        const inner = (
          <>
            {it.image ? (
              <div className="relative aspect-[16/9] bg-muted">
                <Image
                  src={it.image}
                  alt={it.label}
                  fill
                  sizes="(min-width:1024px) 45vw, 100vw"
                  className="object-cover"
                />
                <ImageSlot target={path(editPageId, `${it.base}.image`)} />
              </div>
            ) : null}
            <div className="p-7">
              <TextSlot
                as="h2"
                target={path(editPageId, `${it.base}.label`)}
                value={it.label}
                className="font-display block text-xl text-foreground group-hover:text-brand"
              />
              {it.text ? (
                <TextSlot
                  as="p"
                  target={path(editPageId, `${it.base}.text`)}
                  value={it.text}
                  className="mt-2 block text-[15px] leading-relaxed text-muted-foreground"
                />
              ) : null}
              {it.url ? (
                <span className="mt-4 inline-flex items-center gap-1.5 text-xs font-bold uppercase tracking-wider text-brand">
                  Více o službě <ArrowRight className="h-3.5 w-3.5" />
                </span>
              ) : null}
            </div>
          </>
        );
        const cls =
          "group block h-full overflow-hidden rounded-3xl border border-border bg-card transition-all hover:-translate-y-1 hover:border-brand/40 hover:shadow-lg";
        return it.url ? (
          <Link key={it.key} href={it.url} className={cls}>
            {inner}
          </Link>
        ) : (
          <div key={it.key} className={cls}>
            {inner}
          </div>
        );
      })}
    </div>
  );
}

/** Tipy na okolí — malé karty s ikonkou, jako „Když přijedete na návštěvu". */
function LinkList({
  blocks,
  editPageId,
  editBranchId,
}: {
  blocks: IndexedBlock[];
  editPageId?: string;
  editBranchId?: string;
}) {
  const items = blocks.flatMap((b) =>
    (b.items ?? []).map((it, j) => ({
      ...it,
      key: `${b._i}-${j}`,
      base: `blocks.${b._i}.items.${j}`,
      blockIndex: b._i,
      itemIndex: j,
    }))
  );
  if (items.length === 0) return null;
  return (
    <ul className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
      {items.map((it) => {
        const Icon = iconForHeading(it.label);
        const inner = (
          <div className="group flex h-full flex-col rounded-2xl border border-border bg-card p-5">
            <div className="flex items-start justify-between gap-2">
              <Icon className="h-5 w-5 shrink-0 text-brand" strokeWidth={1.75} />
              {it.url ? (
                <ArrowUpRight className="h-4 w-4 shrink-0 text-brand/70" />
              ) : null}
            </div>
            <TextSlot
              as="h4"
              target={path(editPageId, `${it.base}.label`)}
              value={it.label}
              className="font-display mt-3 block text-base text-foreground group-hover:text-brand"
            />
            {it.text ? (
              <TextSlot
                as="p"
                target={path(editPageId, `${it.base}.text`)}
                value={it.text}
                className="mt-1.5 block text-sm leading-relaxed text-muted-foreground"
              />
            ) : null}
            {/* Odkazy na dokumenty (žádost, ceník…) jdou přepsat nahráním
                nového souboru — stejně jako se mění fotka. */}
            <EditableFile
              target={path(editPageId, `${it.base}.url`)}
              label={it.url ? "Nahrát nový soubor" : "Nahrát soubor"}
            />
          </div>
        );
        const source = editPageId
          ? ({
              kind: "item",
              pageId: editPageId,
              index: it.blockIndex,
              itemIndex: it.itemIndex,
            } as const)
          : undefined;
        return (
          <li key={it.key}>
            <RegionSlot
              className="h-full"
              hidden={false}
              edit={
                editBranchId && editPageId
                  ? {
                      branchId: editBranchId,
                      key: `item:${it.base}`,
                      duplicate: source,
                      remove: source,
                      canHide: false,
                    }
                  : undefined
              }
            >
              {it.url ? (
                <a
                  href={it.url}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="block h-full"
                >
                  {inner}
                </a>
              ) : (
                inner
              )}
            </RegionSlot>
          </li>
        );
      })}
    </ul>
  );
}

export interface RichContact {
  name?: string;
  role?: string;
  hours?: string;
  phone?: string;
  email?: string;
}

/**
 * Závěrečná výzva — barevný panel na střed, jako „Přijeďte se přesvědčit
 * osobně" na Sedlci-Prčici. Kontakt se přidá jako karta uvnitř panelu.
 */
function Cta({
  block,
  heading,
  headingIndex,
  contact,
  eyebrow,
  editPageId,
}: {
  block: IndexedBlock;
  heading?: string;
  headingIndex?: number;
  contact?: RichContact;
  /** Oranžová řádka nad nadpisem — jako „Jsme součástí skupiny AHC". */
  eyebrow?: React.ReactNode;
  editPageId?: string;
}) {
  const hasContact = Boolean(contact?.phone || contact?.email);
  // Telefon a e-mail patří do karty — z textu je odstraníme, ať tam nejsou dvakrát.
  const text = hasContact
    ? (block.text ?? "")
        .replace(/(Telefon|Tel\.|Ústředna|Přijímací kancelář|Sociální oddělení)\s*:?\s*\+?[\d\s+]{9,}/gi, "")
        .replace(/E-?mail\s*:?\s*[\w.@+-]+/gi, "")
        .replace(/\s*[·|•]\s*/g, " ")
        .replace(/\s{2,}/g, " ")
        .trim()
        .replace(/^[,;.·]+|[,;·]+$/g, "")
        .trim()
    : block.text;
  return (
    <div className="overflow-hidden rounded-[2.5rem] bg-gradient-to-br from-brand-dark via-brand to-brand-dark p-10 text-center text-brand-foreground sm:p-14">
      {eyebrow}
      {heading ? (
        <TextSlot
          as="h2"
          target={
            headingIndex !== undefined
              ? path(editPageId, `blocks.${headingIndex}.text`)
              : undefined
          }
          value={heading}
          className="font-display mx-auto block max-w-2xl text-3xl leading-tight sm:text-4xl"
        />
      ) : null}
      {text ? (
        <TextSlot
          as="p"
          target={path(editPageId, `blocks.${block._i}.text`)}
          value={text}
          className="mx-auto mt-4 block max-w-xl text-brand-foreground/85"
        />
      ) : null}

      {hasContact ? (
        <div className="mx-auto mt-8 flex max-w-xl flex-wrap items-center justify-center gap-x-6 gap-y-2 rounded-2xl bg-brand-foreground/10 p-5 text-sm ring-1 ring-brand-foreground/20">
          {contact?.name ? (
            <span className="font-display text-base">{contact.name}</span>
          ) : null}
          {contact?.phone ? (
            <a
              href={`tel:${contact.phone.replace(/\s/g, "")}`}
              className="flex items-center gap-2 font-semibold hover:text-warm"
            >
              <Phone className="h-4 w-4" /> {contact.phone}
            </a>
          ) : null}
          {contact?.email ? (
            <a
              href={`mailto:${contact.email}`}
              className="flex items-center gap-2 font-semibold hover:text-warm"
            >
              <Mail className="h-4 w-4" /> {contact.email}
            </a>
          ) : null}
        </div>
      ) : null}

      <div className="mt-8 flex flex-wrap justify-center gap-3">
        <Link
          href={block.href ?? "/kontakt"}
          className="inline-flex items-center gap-2 rounded-full bg-brand-foreground px-6 py-3 text-sm font-bold uppercase tracking-wider text-brand transition-colors hover:bg-warm hover:text-warm-foreground"
        >
          {block.label ?? "Kontakt"} <ArrowUpRight className="h-4 w-4" />
        </Link>
        <Link
          href="/kontakt"
          className="inline-flex items-center gap-2 rounded-full border-2 border-brand-foreground/40 px-6 py-3 text-sm font-bold uppercase tracking-wider hover:border-warm hover:text-warm"
        >
          Kontaktovat
        </Link>
      </div>
    </div>
  );
}

/** Hlavička článkové podstránky ve skladbě Sedlce: text vlevo, fotka vpravo. */
export interface RichHero {
  eyebrow?: string;
  title?: string;
  lead?: string;
  image?: RichImage;
  /** Tlačítka pod textem. První je plné, druhé obtažené. */
  actions?: { label: string; href: string }[];
}

/** Jedna řádka nadpisu hlavičky i s adresou pro inline editor. */
interface HeroLine {
  value: string;
  target?: EditTarget;
}

/**
 * Generický renderer článkového obsahu podstránek (branch_pages).
 * Obsah od klienta překlápíme 1:1; vzhled kopíruje Sedlec-Prčici — dělená
 * hlavička, sekce se střídavým pozadím, fotka vedle textu, odrážky s fajfkou,
 * karty hodnot a barevný panel na konci.
 */
export function RichContent({
  page,
  images = [],
  contact,
  navSections,
  hero,
  editPageId,
  editBranchId,
  copy = {},
}: {
  page: RichPage;
  /** Fotky pobočky i s popiskem — prokládají se do textových sekcí. */
  images?: RichImage[];
  /** Kontakt do závěrečné výzvy (jako u Sedlce). */
  contact?: RichContact;
  /** Kotvy do přichycené navigace — {label} musí odpovídat nadpisu sekce. */
  navSections?: string[];
  /** Dělená hlavička stránky. Spotřebuje úvodní odstavce článku. */
  hero?: RichHero;
  /** ID podstránky — přítomné jen pro přihlášeného správce, zapíná editor. */
  editPageId?: string;
  /** ID pobočky — potřebné pro skrývání a duplikaci bloků. */
  editBranchId?: string;
  /** Přepisy a viditelnost prvků pobočky. */
  copy?: Record<string, string>;
}) {
  const c = makeCopy({ copy, editBranchId });
  const regions = makeRegions(editPageId, editBranchId, copy);
  const indexed: IndexedBlock[] = page.blocks.map((b, i) => ({
    ...b,
    _i: b.sourceIndex ?? i,
  }));
  const all = toSections(indexed);
  // Nadpis stránky už je v hero — neopakovat ho hned pod ním.
  const norm = (t?: string) => (t ?? "").trim().toLowerCase();
  let sections =
    all[0] && norm(all[0].heading) === norm(page.title)
      ? [
          { ...all[0], heading: undefined, headingIndex: undefined, headingBlock: undefined },
          ...all.slice(1),
        ]
      : all;

  // Úvodní odstavce patří do hlavičky — tam, kde je na Sedlci text vedle fotky.
  let heroParagraphs: IndexedBlock[] = [];
  let heroLines: HeroLine[] = [];
  let heroLead: string | undefined;
  if (hero) {
    const first = sections[0];
    const leading: IndexedBlock[] = [];
    if (first) {
      for (const b of first.blocks) {
        if (b.type !== "paragraph" || leading.length >= 3) break;
        leading.push(b);
      }
    }
    heroParagraphs = leading;

    const titleLine: HeroLine = {
      value: hero.title ?? "",
      target: path(editPageId, "title"),
    };
    // Nadpis první sekce bývá skutečný podtitul stránky. Povýšíme ho do
    // hlavičky, ať se hned pod ní neopakuje.
    const promoted =
      first?.heading && norm(first.heading) !== norm(hero.title)
        ? {
            value: first.heading,
            target:
              first.headingIndex !== undefined
                ? path(editPageId, `blocks.${first.headingIndex}.text`)
                : undefined,
          }
        : undefined;
    // „O zařízení" nebo „Naše služby" je jen štítek — ten patří do očka nad
    // nadpisem, ne do nadpisu samotného.
    const titleIsLabel =
      !hero.title ||
      norm(hero.title) === norm(hero.eyebrow) ||
      hero.title.trim().split(/\s+/).length <= 2;

    // Dvě řádky fungují jen u krátkých vět. Dlouhý nadpis necháme v těle
    // stránky, jinak z hlavičky vznikne šest řádek textu.
    const fitsTwoLines =
      promoted &&
      (hero.title ?? "").length + promoted.value.length <= 90;
    let consumeHeading = true;
    if (promoted && titleIsLabel) heroLines = [promoted];
    else if (fitsTwoLines) heroLines = [titleLine, promoted!];
    else {
      heroLines = [titleLine];
      consumeHeading = false;
    }

    heroLead = heroLines.some((l) => norm(l.value) === norm(hero.lead))
      ? undefined
      : hero.lead;

    if (first) {
      // Když nadpis zůstává v těle stránky, musí pod ním něco zbýt —
      // osamocený nadpis uprostřed stránky vypadá jako chyba.
      if (!consumeHeading && leading.length >= first.blocks.length) {
        heroParagraphs = leading.slice(0, Math.max(0, first.blocks.length - 1));
      }
      const rest = first.blocks.slice(heroParagraphs.length);
      const kept = consumeHeading
        ? { heading: undefined, headingIndex: undefined, headingBlock: undefined }
        : {};
      sections =
        rest.length > 0
          ? [{ ...first, ...kept, blocks: rest }, ...sections.slice(1)]
          : sections.slice(1);
    }
  }

  const navItems = (navSections ?? [])
    .map((label) => ({ id: anchorId(label)!, label }))
    .filter((n) => n.id && sections.some((sec) => anchorId(sec.heading) === n.id));

  // Fotku dostávají textové sekce — odstavce i výčty, ne mřížky karet.
  // Střídáme strany, ať má stránka rytmus jako Sedlec.
  const pool = images.filter((im) => im.src);
  const heroPhoto = hero ? (hero.image ?? pool.shift()) : undefined;
  const photoTargets = sections
    .map((sec, i) => ({ i, sec }))
    .filter(
      ({ sec }) =>
        sec.heading &&
        sec.blocks.length > 0 &&
        sec.blocks.every((b) => b.type === "paragraph" || b.type === "list")
    )
    .slice(0, pool.length);

  // Ke každé sekci hledáme tematicky nejbližší fotku (pokoj k „Soukromí",
  // zahradu k „Prostředí"). Bez shody bereme první nepoužitou.
  const photoBySection = new Map<
    number,
    { src: string; flip: boolean; edit?: RichImage["edit"] }
  >();
  photoTargets.forEach(({ i, sec }, n) => {
    const wanted = topicOf(sec.heading);
    let idx = wanted ? pool.findIndex((im) => topicOf(im.label) === wanted) : -1;
    if (idx < 0) idx = 0;
    const picked = pool.splice(idx, 1)[0];
    if (picked)
      photoBySection.set(i, {
        src: picked.src,
        flip: n % 2 === 1,
        edit: picked.edit,
      });
  });

  /** Bloky sekce vykreslené do Sedlecových vzorů. */
  const renderRuns = (section: Section, narrowText: boolean) => {
    const runs = toRuns(section.blocks);
    return runs.map((run, ri) => {
      // Uvozovací věta („Zajímá nás:") patří k navazujícímu výčtu — jinak se
      // ztratí mezi odstavcem a seznamem.
      const nextIsList = runs[ri + 1]?.[0].type === "list";
      const lastBlock = run[run.length - 1];
      const lastText = lastBlock?.text?.trim() ?? "";
      const leadsIntoList =
        nextIsList && run[0].type === "paragraph" && lastText.endsWith(":");
      const prevRun = runs[ri - 1];
      const prevLastBlock = prevRun?.[prevRun.length - 1];
      const prevLast = prevLastBlock?.text?.trim() ?? "";
      const inheritedLead =
        run[0].type === "list" &&
        prevRun?.[0].type === "paragraph" &&
        prevLast.endsWith(":")
          ? prevLastBlock
          : undefined;

      switch (run[0].type) {
        case "paragraph":
          return (
            <Paragraphs
              key={ri}
              blocks={leadsIntoList ? run.slice(0, -1) : run}
              editPageId={editPageId}
              regions={regions}
              narrow={narrowText}
            />
          );
        case "feature":
          return (
            <Features
              key={ri}
              blocks={run}
              editPageId={editPageId}
              regions={regions}
            />
          );
        case "list":
          return (
            <Bullets
              key={ri}
              blocks={run}
              lead={inheritedLead}
              editPageId={editPageId}
              regions={regions}
              columns={narrowText}
            />
          );
        case "quote":
          return (
            <Quotes
              key={ri}
              blocks={run}
              editPageId={editPageId}
              regions={regions}
            />
          );
        case "tiles":
          return <Tiles key={ri} blocks={run} editPageId={editPageId} />;
        case "linklist":
          return (
            <LinkList
              key={ri}
              blocks={run}
              editPageId={editPageId}
              editBranchId={editBranchId}
            />
          );
        case "cta":
          return (
            <div key={ri} className="space-y-5">
              {run.map((b, i) => (
                <RegionSlot key={b._i} {...regions.block(b)}>
                  <Cta
                    block={b}
                    heading={i === 0 ? section.heading : undefined}
                    headingIndex={i === 0 ? section.headingIndex : undefined}
                    contact={contact}
                    eyebrow={c.t("zaver.eyebrow", "Jsme součástí skupiny AHC", {
                      as: "div",
                      className:
                        "text-[11px] font-bold uppercase tracking-[0.22em] text-warm",
                    })}
                    editPageId={editPageId}
                  />
                </RegionSlot>
              ))}
            </div>
          );
        default:
          return null;
      }
    });
  };

  return (
    <div className="pb-4">
      {hero ? (
        <section className="relative overflow-hidden bg-gradient-to-b from-brand-light/40 to-background">
          <div
            className={`${wrap} grid items-center gap-10 py-14 lg:grid-cols-2 lg:py-20`}
          >
            <div>
              {hero.eyebrow ? (
                <div className="text-xs font-bold uppercase tracking-[0.22em] text-warm-dark">
                  {hero.eyebrow}
                </div>
              ) : null}
              <h1 className="font-display mt-4 text-balance text-4xl leading-[1.1] text-foreground sm:text-5xl">
                {heroLines.map((line, i) => (
                  <span key={i}>
                    {i > 0 ? <br /> : null}
                    <TextSlot
                      as="span"
                      target={line.target}
                      value={line.value}
                      className={i === heroLines.length - 1 && heroLines.length > 1 ? "text-brand" : undefined}
                    />
                  </span>
                ))}
              </h1>
              <div className="mt-6 space-y-4 text-base leading-relaxed text-muted-foreground">
                {heroLead ? (
                  <TextSlot
                    as="p"
                    target={path(editPageId, "lead")}
                    value={heroLead}
                  />
                ) : null}
                {heroParagraphs.map((b) => (
                  <RegionSlot key={b._i} {...regions.block(b)}>
                    <TextSlot
                      as="p"
                      target={path(editPageId, `blocks.${b._i}.text`)}
                      value={b.text ?? ""}
                    />
                  </RegionSlot>
                ))}
              </div>
              {hero.actions && hero.actions.length > 0 ? (
                <div className="mt-8 flex flex-wrap gap-3">
                  {hero.actions.map((a, i) => (
                    <Link
                      key={a.href + a.label}
                      href={a.href}
                      className={
                        i === 0
                          ? "inline-flex items-center gap-2 rounded-full bg-brand px-6 py-3 text-sm font-semibold text-brand-foreground transition-colors hover:bg-brand-dark"
                          : "inline-flex items-center gap-2 rounded-full border border-border bg-background px-6 py-3 text-sm font-semibold text-foreground hover:border-brand hover:text-brand"
                      }
                    >
                      {a.label}
                      {i === 0 ? <ArrowRight className="h-4 w-4" /> : null}
                    </Link>
                  ))}
                </div>
              ) : null}
            </div>

            {heroPhoto?.src ? (
              <div className="relative aspect-[4/3] overflow-hidden rounded-3xl bg-muted shadow-md lg:aspect-[5/4]">
                <Image
                  src={heroPhoto.src}
                  alt={heroLines[0]?.value ?? ""}
                  fill
                  priority
                  sizes="(min-width:1024px) 50vw, 100vw"
                  className="object-cover"
                />
                <ImageSlot
                  target={imageTarget(Boolean(editPageId), heroPhoto.edit)}
                />
              </div>
            ) : null}
          </div>
        </section>
      ) : null}

      {sections.map((section, si) => {
        const tinted = si % 2 === 1;
        const navHere =
          si === 0 && navItems.length > 1 ? (
            <SectionNav key="nav" sections={navItems} />
          ) : null;
        const photo = photoBySection.get(si);
        const headingTarget =
          section.headingIndex !== undefined
            ? path(editPageId, `blocks.${section.headingIndex}.text`)
            : undefined;

        // Textová sekce s fotkou: nadpis, odstavce a odrážky vlevo, fotka vedle.
        if (photo?.src) {
          return (
            <div key={si}>
              <RegionSlot {...regions.section(section.headingBlock)}>
                <section
                  id={anchorId(section.heading)}
                  className={`scroll-mt-32 ${tinted ? "bg-secondary/40" : ""}`}
                >
                  <div
                    className={`${wrap} grid items-center gap-10 ${band} lg:grid-cols-2 lg:gap-14`}
                  >
                    <div className={photo.flip ? "lg:order-2" : undefined}>
                      {section.heading ? (
                        <TextSlot
                          as="h2"
                          target={headingTarget}
                          value={section.heading}
                          className="font-display block text-balance text-3xl text-foreground sm:text-4xl"
                        />
                      ) : null}
                      <div className="mt-5 space-y-6">
                        {renderRuns(section, false)}
                      </div>
                    </div>
                    <div
                      className={`relative aspect-[4/3] overflow-hidden rounded-3xl bg-muted shadow-sm lg:aspect-[5/4] ${
                        photo.flip ? "lg:order-1" : ""
                      }`}
                    >
                      <Image
                        src={photo.src}
                        alt={section.heading ?? ""}
                        fill
                        sizes="(min-width:1024px) 45vw, 100vw"
                        className="object-cover"
                      />
                      <ImageSlot
                        target={imageTarget(Boolean(editPageId), photo.edit)}
                      />
                    </div>
                  </div>
                </section>
              </RegionSlot>
              {navHere}
            </div>
          );
        }

        return (
          <div key={si}>
            <RegionSlot {...regions.section(section.headingBlock)}>
              <section
                id={anchorId(section.heading)}
                className={`scroll-mt-32 ${tinted ? "bg-secondary/40" : ""}`}
              >
                <div className={`${wrap} ${band}`}>
                  {section.heading ? (
                    <TextSlot
                      as="h2"
                      target={headingTarget}
                      value={section.heading}
                      className="font-display mx-auto block max-w-3xl text-balance text-center text-3xl text-foreground sm:text-4xl"
                    />
                  ) : null}

                  <div className={section.heading ? "mt-10 space-y-8" : "space-y-8"}>
                    {renderRuns(section, true)}
                  </div>
                </div>
              </section>
            </RegionSlot>
            {navHere}
          </div>
        );
      })}
    </div>
  );
}
