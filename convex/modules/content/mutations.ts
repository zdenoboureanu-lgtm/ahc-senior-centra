import { v } from "convex/values";
import { mutation } from "../../_generated/server";
import type { Doc, Id, TableNames } from "../../_generated/dataModel";
import { requireBranchAccess, requireProfile } from "../../lib/permissions";
import { createAuditLog } from "../../lib/audit";

/**
 * Inline editace obsahu přímo na webu.
 *
 * Klient si po přihlášení zapne režim úprav na veřejné stránce, přepíše text
 * nebo vymění fotku a uloží. Struktura stránky se nemění — mutace umí sáhnout
 * jen na pole z whitelistu níž, takže se přes „editor" nedá rozbít schéma
 * ani přepsat cizí pobočka.
 */

/** Textová pole, která smí inline editor přepsat. */
const EDITABLE_TEXT: Partial<Record<TableNames, readonly string[]>> = {
  branches: [
    "name",
    "short_name",
    "legal_name",
    "tagline",
    "subtitle",
    "description",
    "type_label",
    "phone",
    "phone_short",
    "email",
    "street",
    "city",
    "zip",
    "office_contact_name",
    "office_contact_phone",
    "office_contact_email",
    "sesterna_phone",
    "ico",
    "legal_address",
  ],
  branch_services: ["title", "description"],
  branch_highlights: ["title", "description"],
  branch_stats: ["value", "label"],
  branch_facilities: ["title"],
  branch_gallery: ["caption"],
  branch_about_features: ["title", "text"],
  branch_testimonials: ["author_name", "author_role", "content"],
  branch_faq: ["question", "answer"],
  branch_team: ["name", "role", "bio", "email", "phone"],
  branch_documents: ["title", "description"],
  branch_units: ["name", "description"],
  branch_career_perks: ["title", "description"],
  branch_admission_steps: ["title", "description"],
} as const;

/** Obrázková pole — mění se nahráním nového souboru, ne psaním. */
const EDITABLE_IMAGE: Partial<Record<TableNames, readonly string[]>> = {
  branches: ["cover_image", "logo_url"],
  branch_facilities: ["image_url"],
  branch_gallery: ["image_url"],
  branch_team: ["photo_url"],
} as const;

/** Soubory ke stažení — mění se nahráním nového dokumentu. */
const EDITABLE_FILE: Partial<Record<TableNames, readonly string[]>> = {
  branch_documents: ["file_url"],
} as const;

function assertEditable(table: string, field: string): TableNames {
  const name = table as TableNames;
  const allowed = [
    ...(EDITABLE_TEXT[name] ?? []),
    ...(EDITABLE_IMAGE[name] ?? []),
    ...(EDITABLE_FILE[name] ?? []),
  ];
  if (!allowed.includes(field)) {
    throw new Error(`Pole „${table}.${field}" není možné upravovat na webu.`);
  }
  return name;
}

/** Ke které pobočce řádek patří — kvůli oprávnění branch_managera. */
async function branchOf(
  ctx: { db: { get: (id: Id<TableNames>) => Promise<unknown> } },
  table: TableNames,
  id: Id<TableNames>
): Promise<Id<"branches">> {
  if (table === "branches") return id as Id<"branches">;
  const doc = (await ctx.db.get(id)) as { branch_id?: Id<"branches"> } | null;
  if (!doc?.branch_id) throw new Error("Záznam nenalezen.");
  return doc.branch_id;
}

/**
 * Přepíše jedno textové (nebo obrázkové) pole jednoho záznamu.
 * Vrací uloženou hodnotu, ať si klient v UI potvrdí, co se opravdu zapsalo.
 */
export const setField = mutation({
  args: {
    table: v.string(),
    id: v.string(),
    field: v.string(),
    value: v.string(),
  },
  handler: async (ctx, { table, id, field, value }) => {
    const name = assertEditable(table, field);
    const docId = ctx.db.normalizeId(name, id);
    if (!docId) throw new Error("Neplatné ID záznamu.");

    const branch_id = await branchOf(ctx, name, docId);
    const profile = await requireBranchAccess(ctx, branch_id);

    const clean = value.trim();
    await ctx.db.patch(docId, {
      [field]: clean,
      updated_at: Date.now(),
    } as never);

    await createAuditLog(ctx, {
      user_id: profile.user_id,
      action: "content.field_updated",
      entity_type: table,
      entity_id: docId,
      branch_id,
      after: { field, value: clean },
    });
    return clean;
  },
});

// ── Článkové podstránky (branch_pages) ────────────────────────────────────

type PageBlock = Doc<"branch_pages">["blocks"][number];

/** Krátké náhodné id bloku — stačí na rozlišení v rámci jedné podstránky. */
function newUid(): string {
  return Math.random().toString(36).slice(2, 10);
}

/** Doplní chybějící `uid`; vrací bloky a jestli se něco změnilo. */
function withUids(blocks: PageBlock[]): { blocks: PageBlock[]; changed: boolean } {
  let changed = false;
  const next = blocks.map((b) => {
    if (b.uid) return b;
    changed = true;
    return { ...b, uid: newUid() };
  });
  return { blocks: next, changed };
}

/** Textová pole bloku, na která smí editor sáhnout. */
const BLOCK_FIELDS = ["text", "heading", "author", "label", "href"] as const;
/** Textová pole položky uvnitř bloku (kachlice, odkazy). */
const ITEM_FIELDS = ["label", "text", "url", "image"] as const;

/**
 * Zapíše hodnotu do bloku podle cesty. Podporované cesty:
 *  `blocks.3.text`, `blocks.3.bullets.1`, `blocks.3.items.0.label`.
 */
function applyBlockPath(
  blocks: PageBlock[],
  path: string,
  value: string
): PageBlock[] {
  const next = blocks.map((b) => ({ ...b }));

  const field = path.match(/^blocks\.(\d+)\.([a-z]+)$/);
  if (field) {
    const [, idxRaw, key] = field;
    const idx = Number(idxRaw);
    const block = next[idx];
    if (!block) throw new Error("Blok neexistuje.");
    if (!(BLOCK_FIELDS as readonly string[]).includes(key)) {
      throw new Error(`Pole bloku „${key}" není možné upravovat.`);
    }
    return next.map((b, i) => (i === idx ? { ...b, [key]: value } : b));
  }

  const bullet = path.match(/^blocks\.(\d+)\.bullets\.(\d+)$/);
  if (bullet) {
    const [, idxRaw, posRaw] = bullet;
    const idx = Number(idxRaw);
    const pos = Number(posRaw);
    const block = next[idx];
    if (!block?.bullets?.[pos]) throw new Error("Odrážka neexistuje.");
    const bullets = block.bullets.map((b, i) => (i === pos ? value : b));
    return next.map((b, i) => (i === idx ? { ...b, bullets } : b));
  }

  const item = path.match(/^blocks\.(\d+)\.items\.(\d+)\.([a-z]+)$/);
  if (item) {
    const [, idxRaw, posRaw, key] = item;
    const idx = Number(idxRaw);
    const pos = Number(posRaw);
    const block = next[idx];
    if (!block?.items?.[pos]) throw new Error("Položka neexistuje.");
    if (!(ITEM_FIELDS as readonly string[]).includes(key)) {
      throw new Error(`Pole položky „${key}" není možné upravovat.`);
    }
    const items = block.items.map((it, i) =>
      i === pos ? { ...it, [key]: value } : it
    );
    return next.map((b, i) => (i === idx ? { ...b, items } : b));
  }

  throw new Error(`Neznámá cesta „${path}".`);
}

/**
 * Přepíše text v článkové podstránce — hlavičku stránky nebo konkrétní blok.
 * Bloky se nepřidávají ani nepřesouvají, jen se mění jejich obsah.
 */
export const setPageField = mutation({
  args: {
    page_id: v.id("branch_pages"),
    path: v.string(),
    value: v.string(),
  },
  handler: async (ctx, { page_id, path, value }) => {
    const page = await ctx.db.get(page_id);
    if (!page) throw new Error("Podstránka nenalezena.");
    const profile = await requireBranchAccess(ctx, page.branch_id);

    const clean = value.trim();
    const now = Date.now();

    if (path === "title" || path === "eyebrow" || path === "lead") {
      await ctx.db.patch(page_id, { [path]: clean, updated_at: now } as never);
    } else {
      await ctx.db.patch(page_id, {
        blocks: applyBlockPath(page.blocks, path, clean),
        updated_at: now,
      });
    }

    await createAuditLog(ctx, {
      user_id: profile.user_id,
      action: "content.page_updated",
      entity_type: "branch_pages",
      entity_id: page_id,
      branch_id: page.branch_id,
      after: { page: page.page, path, value: clean },
    });
    return clean;
  },
});

// ── Nahrávání fotek ───────────────────────────────────────────────────────

/** Jednorázová URL pro upload souboru do Convex storage. */
export const generateUploadUrl = mutation({
  args: {},
  handler: async (ctx) => {
    await requireProfile(ctx);
    return await ctx.storage.generateUploadUrl();
  },
});

/**
 * Ze `storageId` nahraného souboru udělá veřejnou URL, kterou pak editor
 * zapíše do obrázkového pole. Rozdělené na dva kroky schválně — stejná URL
 * jde použít pro fotku v galerii i pro obrázek v kachlici na podstránce.
 */
export const resolveUploadUrl = mutation({
  args: { storage_id: v.id("_storage") },
  handler: async (ctx, { storage_id }) => {
    await requireProfile(ctx);
    const url = await ctx.storage.getUrl(storage_id);
    if (!url) throw new Error("Nahraný soubor se nepodařilo načíst.");
    return url;
  },
});

// ── Ručně psané stránky (Sedlec-Prčice) ───────────────────────────────────

/**
 * Uloží přepis jednoho textu nebo fotky na ručně psané stránce.
 *
 * Obsah těchto stránek je v kódu; databáze drží jen to, co klient přepsal.
 * Prázdná hodnota přepis zase zruší a vrátí původní text z kódu — díky tomu
 * se nedá stránka omylem „vyprázdnit".
 */
export const setCopy = mutation({
  args: {
    branch_id: v.id("branches"),
    key: v.string(),
    value: v.string(),
  },
  handler: async (ctx, { branch_id, key, value }) => {
    const branch = await ctx.db.get(branch_id);
    if (!branch) throw new Error("Pobočka nenalezena.");
    const profile = await requireBranchAccess(ctx, branch_id);

    const clean = value.trim();
    const existing = await ctx.db
      .query("branch_copy")
      .withIndex("by_branch_key", (q) =>
        q.eq("branch_id", branch_id).eq("key", key)
      )
      .unique();

    if (!clean) {
      if (existing) await ctx.db.delete(existing._id);
    } else if (existing) {
      await ctx.db.patch(existing._id, { value: clean, updated_at: Date.now() });
    } else {
      await ctx.db.insert("branch_copy", {
        branch_id,
        key,
        value: clean,
        updated_at: Date.now(),
      });
    }

    await createAuditLog(ctx, {
      user_id: profile.user_id,
      action: "content.copy_updated",
      entity_type: "branch_copy",
      entity_id: key,
      branch_id,
      before: { value: existing?.value },
      after: { key, value: clean },
    });
    return clean;
  },
});

// ── Skrývání a duplikace prvků ────────────────────────────────────────────

/**
 * Skryje nebo zase odkryje prvek stránky.
 *
 * Viditelnost držíme ve stejné tabulce jako přepisy textů — nepotřebuje to
 * zásah do schématu a funguje to stejně pro ručně psané stránky, bloky
 * článků i řádky z databáze.
 */
export const setHidden = mutation({
  args: {
    branch_id: v.id("branches"),
    key: v.string(),
    hidden: v.boolean(),
  },
  handler: async (ctx, { branch_id, key, hidden }) => {
    const branch = await ctx.db.get(branch_id);
    if (!branch) throw new Error("Pobočka nenalezena.");
    const profile = await requireBranchAccess(ctx, branch_id);

    const copyKey = `hidden:${key}`;
    const existing = await ctx.db
      .query("branch_copy")
      .withIndex("by_branch_key", (q) =>
        q.eq("branch_id", branch_id).eq("key", copyKey)
      )
      .unique();

    if (hidden && !existing) {
      await ctx.db.insert("branch_copy", {
        branch_id,
        key: copyKey,
        value: "1",
        updated_at: Date.now(),
      });
    } else if (!hidden && existing) {
      await ctx.db.delete(existing._id);
    }

    await createAuditLog(ctx, {
      user_id: profile.user_id,
      action: hidden ? "content.hidden" : "content.shown",
      entity_type: "branch_copy",
      entity_id: copyKey,
      branch_id,
      after: { key, hidden },
    });
    return hidden;
  },
});

/** Zduplikuje blok článkové podstránky a vloží kopii hned za originál. */
export const duplicateBlock = mutation({
  args: { page_id: v.id("branch_pages"), index: v.number() },
  handler: async (ctx, { page_id, index }) => {
    const page = await ctx.db.get(page_id);
    if (!page) throw new Error("Podstránka nenalezena.");
    const profile = await requireBranchAccess(ctx, page.branch_id);

    const base = withUids(page.blocks).blocks;
    const source = base[index];
    if (!source) throw new Error("Blok neexistuje.");

    const blocks = [
      ...base.slice(0, index + 1),
      { ...source, uid: newUid() },
      ...base.slice(index + 1),
    ];
    await ctx.db.patch(page_id, { blocks, updated_at: Date.now() });

    await createAuditLog(ctx, {
      user_id: profile.user_id,
      action: "content.block_duplicated",
      entity_type: "branch_pages",
      entity_id: page_id,
      branch_id: page.branch_id,
      after: { page: page.page, index },
    });
    return blocks.length;
  },
});

/**
 * Zkopíruje jednu položku uvnitř bloku (kachlici rozcestníku, odkaz na
 * dokument) hned za originál. Kopie se pak jen přejmenuje a nahraje se k ní
 * nový soubor — takhle jde na webu přidat další dokument.
 */
export const duplicateItem = mutation({
  args: {
    page_id: v.id("branch_pages"),
    index: v.number(),
    item_index: v.number(),
  },
  handler: async (ctx, { page_id, index, item_index }) => {
    const page = await ctx.db.get(page_id);
    if (!page) throw new Error("Podstránka nenalezena.");
    const profile = await requireBranchAccess(ctx, page.branch_id);

    const base = withUids(page.blocks).blocks;
    const block = base[index];
    const items = block?.items;
    const source = items?.[item_index];
    if (!items || !source) throw new Error("Položka neexistuje.");

    const nextItems = [
      ...items.slice(0, item_index + 1),
      { ...source },
      ...items.slice(item_index + 1),
    ];
    const blocks = base.map((b, i) =>
      i === index ? { ...b, items: nextItems } : b
    );
    await ctx.db.patch(page_id, { blocks, updated_at: Date.now() });

    await createAuditLog(ctx, {
      user_id: profile.user_id,
      action: "content.item_duplicated",
      entity_type: "branch_pages",
      entity_id: page_id,
      branch_id: page.branch_id,
      after: { page: page.page, index, item_index },
    });
    return nextItems.length;
  },
});

/** Smaže jednu položku uvnitř bloku — protějšek `duplicateItem`. */
export const deleteItem = mutation({
  args: {
    page_id: v.id("branch_pages"),
    index: v.number(),
    item_index: v.number(),
  },
  handler: async (ctx, { page_id, index, item_index }) => {
    const page = await ctx.db.get(page_id);
    if (!page) throw new Error("Podstránka nenalezena.");
    const profile = await requireBranchAccess(ctx, page.branch_id);

    const base = withUids(page.blocks).blocks;
    const block = base[index];
    const items = block?.items;
    const removed = items?.[item_index];
    if (!items || !removed) throw new Error("Položka neexistuje.");

    const blocks = base.map((b, i) =>
      i === index
        ? { ...b, items: items.filter((_, j) => j !== item_index) }
        : b
    );
    await ctx.db.patch(page_id, { blocks, updated_at: Date.now() });

    await createAuditLog(ctx, {
      user_id: profile.user_id,
      action: "content.item_deleted",
      entity_type: "branch_pages",
      entity_id: page_id,
      branch_id: page.branch_id,
      before: { page: page.page, index, item: removed },
    });
    return item_index;
  },
});

/** Tabulky, jejichž řádky smí editor kopírovat. */
const DUPLICABLE: readonly TableNames[] = [
  "branch_services",
  "branch_facilities",
  "branch_gallery",
  "branch_documents",
  "branch_highlights",
  "branch_testimonials",
  "branch_faq",
  "branch_team",
  "branch_about_features",
  "branch_career_perks",
  "branch_units",
] as const;

/** Zkopíruje řádek pobočky (kartu, fotku, dokument…) hned za originál. */
export const duplicateRow = mutation({
  args: { table: v.string(), id: v.string() },
  handler: async (ctx, { table, id }) => {
    const name = table as TableNames;
    if (!DUPLICABLE.includes(name)) {
      throw new Error(`Položky „${table}" není možné duplikovat.`);
    }
    const docId = ctx.db.normalizeId(name, id);
    if (!docId) throw new Error("Neplatné ID záznamu.");

    const row = (await ctx.db.get(docId)) as
      | (Record<string, unknown> & { branch_id?: Id<"branches">; order?: number })
      | null;
    if (!row?.branch_id) throw new Error("Záznam nenalezen.");

    const profile = await requireBranchAccess(ctx, row.branch_id);

    const { _id: _dropId, _creationTime: _dropCreated, ...data } = row as Record<
      string,
      unknown
    > & { _id: unknown; _creationTime: number };
    // Kopie patří hned za originál. Nestačí „+ 0.5" — druhá kopie téhož
    // řádku by dostala stejné pořadí jako ta první a karty by se překryly.
    // Hledáme proto nejbližší volné místo mezi originálem a dalším řádkem.
    const sourceOrder = typeof row.order === "number" ? row.order : 0;
    const siblings = (await ctx.db
      .query(name)
      // Všechny obsahové tabulky mají `branch_id`, generický typ to ale neví.
      .filter((q) => q.eq(q.field("branch_id" as never), row.branch_id))
      .collect()) as { order?: number }[];
    const nextOrder = siblings
      .map((r) => (typeof r.order === "number" ? r.order : 0))
      .filter((o) => o > sourceOrder)
      .sort((a, b) => a - b)[0];
    const order =
      nextOrder === undefined
        ? sourceOrder + 1
        : (sourceOrder + nextOrder) / 2;

    const now = Date.now();
    const copyId = await ctx.db.insert(name, {
      ...data,
      order,
      created_at: now,
      updated_at: now,
    } as never);

    await createAuditLog(ctx, {
      user_id: profile.user_id,
      action: "content.row_duplicated",
      entity_type: table,
      entity_id: copyId,
      branch_id: row.branch_id,
      after: { table, source: docId },
    });
    return copyId;
  },
});


/** Smaže blok článkové podstránky. Používá se hlavně na nechtěné kopie. */
export const deleteBlock = mutation({
  args: { page_id: v.id("branch_pages"), uid: v.string() },
  handler: async (ctx, { page_id, uid }) => {
    const page = await ctx.db.get(page_id);
    if (!page) throw new Error("Podstránka nenalezena.");
    const profile = await requireBranchAccess(ctx, page.branch_id);

    const base = withUids(page.blocks).blocks;
    const removed = base.find((b) => b.uid === uid);
    if (!removed) throw new Error("Blok neexistuje.");
    if (base.length <= 1) throw new Error("Poslední blok stránky nejde smazat.");

    await ctx.db.patch(page_id, {
      blocks: base.filter((b) => b.uid !== uid),
      updated_at: Date.now(),
    });

    await createAuditLog(ctx, {
      user_id: profile.user_id,
      action: "content.block_deleted",
      entity_type: "branch_pages",
      entity_id: page_id,
      branch_id: page.branch_id,
      before: { page: page.page, block: removed },
    });
    return uid;
  },
});

/** Smaže řádek pobočky (kartu, fotku, dokument…) — protějšek duplikace. */
export const deleteRow = mutation({
  args: { table: v.string(), id: v.string() },
  handler: async (ctx, { table, id }) => {
    const name = table as TableNames;
    if (!DUPLICABLE.includes(name)) {
      throw new Error(`Položky „${table}" není možné mazat.`);
    }
    const docId = ctx.db.normalizeId(name, id);
    if (!docId) throw new Error("Neplatné ID záznamu.");

    const row = (await ctx.db.get(docId)) as
      | (Record<string, unknown> & { branch_id?: Id<"branches"> })
      | null;
    if (!row?.branch_id) throw new Error("Záznam nenalezen.");
    const profile = await requireBranchAccess(ctx, row.branch_id);

    await ctx.db.delete(docId);

    await createAuditLog(ctx, {
      user_id: profile.user_id,
      action: "content.row_deleted",
      entity_type: table,
      entity_id: docId,
      branch_id: row.branch_id,
      before: row,
    });
    return docId;
  },
});
