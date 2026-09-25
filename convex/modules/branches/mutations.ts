import { v } from "convex/values";
import { mutation } from "../../_generated/server";
import {
  requireSuperAdmin,
  requireBranchAccess,
} from "../../lib/permissions";
import { createAuditLog } from "../../lib/audit";

/**
 * Mutace nad pobočkami (centrální správa).
 *  - create / remove: jen super_admin (mění síť — počet poboček ovlivňuje celý web)
 *  - update / togglePublished: super_admin libovolnou, branch_manager jen svou (requireBranchAccess)
 */

const branchTypeValidator = v.union(
  v.literal("senior_centrum"),
  v.literal("hospital")
);

// Společná sada editovatelných polí (vše krom systémových timestampů).
const editableFields = {
  name: v.string(),
  short_name: v.string(),
  legal_name: v.optional(v.string()),
  branch_type: v.optional(branchTypeValidator),
  type_label: v.optional(v.string()),
  tagline: v.optional(v.string()),
  subtitle: v.optional(v.string()),
  description: v.string(),

  // Adresa
  street: v.string(),
  city: v.string(),
  zip: v.string(),
  region: v.string(),
  ico: v.optional(v.string()),

  // Mateřská organizace
  parent_org: v.optional(v.string()),

  // Kontakt
  phone: v.string(),
  phone_short: v.optional(v.string()),
  email: v.string(),
  facebook_url: v.optional(v.string()),
  instagram_url: v.optional(v.string()),

  // Office kontakt
  office_contact_name: v.optional(v.string()),
  office_contact_phone: v.optional(v.string()),
  office_contact_email: v.optional(v.string()),
  sesterna_phone: v.optional(v.string()),

  // Geo (pro mapu)
  lat: v.number(),
  lng: v.number(),

  // Vzdálenosti
  distance_city_1_label: v.optional(v.string()),
  distance_city_1_km: v.optional(v.number()),
  distance_city_2_label: v.optional(v.string()),
  distance_city_2_km: v.optional(v.number()),
  distance_city_3_label: v.optional(v.string()),
  distance_city_3_km: v.optional(v.number()),

  // Kapacita / statistiky
  bed_count: v.optional(v.number()),
  room_count: v.optional(v.number()),
  opening_year: v.optional(v.number()),

  // Branding
  cover_image: v.optional(v.string()),
  logo_url: v.optional(v.string()),

  is_published: v.boolean(),
} as const;

/** Vytvoří novou pobočku — jen super_admin. */
export const create = mutation({
  args: {
    slug: v.string(),
    ...editableFields,
  },
  handler: async (ctx, args) => {
    const profile = await requireSuperAdmin(ctx);

    // Unikátnost slugu
    const clash = await ctx.db
      .query("branches")
      .withIndex("by_slug", (q) => q.eq("slug", args.slug))
      .unique();
    if (clash) {
      throw new Error(`Pobočka se slugem „${args.slug}" už existuje.`);
    }

    const now = Date.now();
    const id = await ctx.db.insert("branches", {
      ...args,
      created_at: now,
      updated_at: now,
    });
    await createAuditLog(ctx, {
      user_id: profile.user_id,
      action: "branch.created",
      entity_type: "branch",
      entity_id: id,
      branch_id: id,
      after: args,
    });
    return id;
  },
});

/** Update pobočky — super_admin libovolnou, branch_manager jen svou. */
export const update = mutation({
  args: {
    id: v.id("branches"),
    slug: v.string(),
    ...editableFields,
  },
  handler: async (ctx, { id, ...patch }) => {
    const existing = await ctx.db.get(id);
    if (!existing) throw new Error("Pobočka nenalezena.");
    const profile = await requireBranchAccess(ctx, id);

    // Slug smí měnit jen super_admin (mění veřejnou URL / subdoménu)
    if (patch.slug !== existing.slug && profile.role !== "super_admin") {
      throw new Error("Změnu adresy (slug) může provést jen super-admin.");
    }
    if (patch.slug !== existing.slug) {
      const clash = await ctx.db
        .query("branches")
        .withIndex("by_slug", (q) => q.eq("slug", patch.slug))
        .unique();
      if (clash && clash._id !== id) {
        throw new Error(`Pobočka se slugem „${patch.slug}" už existuje.`);
      }
    }

    await ctx.db.patch(id, { ...patch, updated_at: Date.now() });
    await createAuditLog(ctx, {
      user_id: profile.user_id,
      action: "branch.updated",
      entity_type: "branch",
      entity_id: id,
      branch_id: id,
      before: existing,
      after: { ...existing, ...patch },
    });
    return id;
  },
});

/** Přepne publikaci pobočky (ovlivňuje síťové počty) — jen super_admin. */
export const togglePublished = mutation({
  args: { id: v.id("branches") },
  handler: async (ctx, { id }) => {
    const existing = await ctx.db.get(id);
    if (!existing) throw new Error("Pobočka nenalezena.");
    const profile = await requireSuperAdmin(ctx);
    const next = !existing.is_published;
    await ctx.db.patch(id, { is_published: next, updated_at: Date.now() });
    await createAuditLog(ctx, {
      user_id: profile.user_id,
      action: next ? "branch.published" : "branch.unpublished",
      entity_type: "branch",
      entity_id: id,
      branch_id: id,
      before: { is_published: existing.is_published },
      after: { is_published: next },
    });
    return next;
  },
});

/**
 * Smaže pobočku i všechen její obsah — jen super_admin.
 *
 * Maže se kaskádou schválně: od zavedení duplikace vzniká víc rozpracovaných
 * kopií, které se zase ruší, a osiřelé řádky by se v databázi jen hromadily.
 * Akce je nevratná, UI se proto ptá na potvrzení.
 */
export const remove = mutation({
  args: { id: v.id("branches") },
  handler: async (ctx, { id }) => {
    const existing = await ctx.db.get(id);
    if (!existing) throw new Error("Pobočka nenalezena.");
    const profile = await requireSuperAdmin(ctx);

    for (const row of await ctx.db
      .query("branch_units")
      .withIndex("by_branch", (q) => q.eq("branch_id", id))
      .collect())
      await ctx.db.delete(row._id);
    for (const row of await ctx.db
      .query("branch_services")
      .withIndex("by_branch", (q) => q.eq("branch_id", id))
      .collect())
      await ctx.db.delete(row._id);
    for (const row of await ctx.db
      .query("branch_facilities")
      .withIndex("by_branch", (q) => q.eq("branch_id", id))
      .collect())
      await ctx.db.delete(row._id);
    for (const row of await ctx.db
      .query("branch_team")
      .withIndex("by_branch", (q) => q.eq("branch_id", id))
      .collect())
      await ctx.db.delete(row._id);
    for (const row of await ctx.db
      .query("branch_about_features")
      .withIndex("by_branch", (q) => q.eq("branch_id", id))
      .collect())
      await ctx.db.delete(row._id);
    for (const row of await ctx.db
      .query("branch_highlights")
      .withIndex("by_branch", (q) => q.eq("branch_id", id))
      .collect())
      await ctx.db.delete(row._id);
    for (const row of await ctx.db
      .query("branch_stats")
      .withIndex("by_branch", (q) => q.eq("branch_id", id))
      .collect())
      await ctx.db.delete(row._id);
    for (const row of await ctx.db
      .query("branch_admission_steps")
      .withIndex("by_branch", (q) => q.eq("branch_id", id))
      .collect())
      await ctx.db.delete(row._id);
    for (const row of await ctx.db
      .query("branch_grants")
      .withIndex("by_branch", (q) => q.eq("branch_id", id))
      .collect())
      await ctx.db.delete(row._id);
    for (const row of await ctx.db
      .query("branch_career_perks")
      .withIndex("by_branch", (q) => q.eq("branch_id", id))
      .collect())
      await ctx.db.delete(row._id);
    for (const row of await ctx.db
      .query("branch_testimonials")
      .withIndex("by_branch", (q) => q.eq("branch_id", id))
      .collect())
      await ctx.db.delete(row._id);
    for (const row of await ctx.db
      .query("branch_faq")
      .withIndex("by_branch", (q) => q.eq("branch_id", id))
      .collect())
      await ctx.db.delete(row._id);
    for (const row of await ctx.db
      .query("branch_pages")
      .withIndex("by_branch", (q) => q.eq("branch_id", id))
      .collect())
      await ctx.db.delete(row._id);
    for (const row of await ctx.db
      .query("branch_alerts")
      .withIndex("by_branch", (q) => q.eq("branch_id", id))
      .collect())
      await ctx.db.delete(row._id);
    for (const row of await ctx.db
      .query("branch_gallery")
      .withIndex("by_branch", (q) => q.eq("branch_id", id))
      .collect())
      await ctx.db.delete(row._id);
    for (const row of await ctx.db
      .query("branch_documents")
      .withIndex("by_branch", (q) => q.eq("branch_id", id))
      .collect())
      await ctx.db.delete(row._id);
    for (const row of await ctx.db
      .query("branch_hours")
      .withIndex("by_branch", (q) => q.eq("branch_id", id))
      .collect())
      await ctx.db.delete(row._id);
    for (const row of await ctx.db
      .query("branch_news")
      .withIndex("by_branch", (q) => q.eq("branch_id", id))
      .collect())
      await ctx.db.delete(row._id);
    for (const row of await ctx.db
      .query("career_positions")
      .withIndex("by_branch", (q) => q.eq("branch_id", id))
      .collect())
      await ctx.db.delete(row._id);
    for (const row of await ctx.db
      .query("inquiries")
      .withIndex("by_branch", (q) => q.eq("branch_id", id))
      .collect())
      await ctx.db.delete(row._id);

    await ctx.db.delete(id);
    await createAuditLog(ctx, {
      user_id: profile.user_id,
      action: "branch.deleted",
      entity_type: "branch",
      entity_id: id,
      branch_id: id,
      before: existing,
    });
    return id;
  },
});

/**
 * Uloží celou sekci „V číslech" pro pobočku (nahradí stávající řádky).
 * Hodnota i popisek jsou volný text — klient si tak pohlídá jednotky
 * („24/7") i skloňování („km od Příbrami").
 */
export const saveStats = mutation({
  args: {
    branch_id: v.id("branches"),
    stats: v.array(
      v.object({
        value: v.string(),
        label: v.string(),
        icon: v.optional(v.string()),
      })
    ),
  },
  handler: async (ctx, { branch_id, stats }) => {
    const branch = await ctx.db.get(branch_id);
    if (!branch) throw new Error("Pobočka nenalezena.");
    const profile = await requireBranchAccess(ctx, branch_id);

    const existing = await ctx.db
      .query("branch_stats")
      .withIndex("by_branch", (q) => q.eq("branch_id", branch_id))
      .collect();
    for (const row of existing) await ctx.db.delete(row._id);

    const now = Date.now();
    let order = 0;
    for (const s of stats) {
      if (!s.value.trim() || !s.label.trim()) continue;
      await ctx.db.insert("branch_stats", {
        branch_id,
        value: s.value.trim(),
        label: s.label.trim(),
        icon: s.icon?.trim() || undefined,
        order: order++,
        created_at: now,
        updated_at: now,
      });
    }

    await createAuditLog(ctx, {
      user_id: profile.user_id,
      action: "branch.stats_updated",
      entity_type: "branch",
      entity_id: branch_id,
      branch_id,
      before: existing.map((r) => ({ value: r.value, label: r.label, icon: r.icon })),
      after: stats,
    });
    return order;
  },
});

/**
 * Uloží recenze / příběhy pobočky (nahradí stávající).
 * Klient je chce mít u každého zařízení jiné a spravovat si je sám.
 */
export const saveTestimonials = mutation({
  args: {
    branch_id: v.id("branches"),
    testimonials: v.array(
      v.object({
        author_name: v.string(),
        author_role: v.optional(v.string()),
        content: v.string(),
      })
    ),
  },
  handler: async (ctx, { branch_id, testimonials }) => {
    const branch = await ctx.db.get(branch_id);
    if (!branch) throw new Error("Pobočka nenalezena.");
    const profile = await requireBranchAccess(ctx, branch_id);

    const existing = await ctx.db
      .query("branch_testimonials")
      .withIndex("by_branch", (q) => q.eq("branch_id", branch_id))
      .collect();
    for (const row of existing) await ctx.db.delete(row._id);

    const now = Date.now();
    let count = 0;
    for (const t of testimonials) {
      if (!t.author_name.trim() || !t.content.trim()) continue;
      await ctx.db.insert("branch_testimonials", {
        branch_id,
        author_name: t.author_name.trim(),
        author_role: t.author_role?.trim() || undefined,
        content: t.content.trim(),
        created_at: now,
        updated_at: now,
      });
      count++;
    }

    await createAuditLog(ctx, {
      user_id: profile.user_id,
      action: "branch.testimonials_updated",
      entity_type: "branch",
      entity_id: branch_id,
      branch_id,
      before: existing.map((r) => ({ author_name: r.author_name, content: r.content })),
      after: testimonials,
    });
    return count;
  },
});

/**
 * Duplikuje celou pobočku (web) pod novým slugem — jen super_admin.
 *
 * Kopíruje veškerý obsah webu: podstránky, služby, zázemí, tým, galerii,
 * dokumenty, statistiky, hodiny… Nekopíruje aktuality, inzeráty kariéry ani
 * došlé poptávky — ty patří konkrétnímu zařízení, ne šabloně.
 *
 * Nová pobočka vzniká vždy nepublikovaná, ať se rozpracovaná kopie
 * neobjeví na veřejné doméně dřív, než ji klient dopíše.
 */
export const duplicate = mutation({
  args: {
    source_id: v.id("branches"),
    slug: v.string(),
    name: v.string(),
    short_name: v.string(),
  },
  handler: async (ctx, { source_id, slug, name, short_name }) => {
    const profile = await requireSuperAdmin(ctx);

    const source = await ctx.db.get(source_id);
    if (!source) throw new Error("Zdrojová pobočka nenalezena.");

    const cleanSlug = slug.trim().toLowerCase();
    if (!/^[a-z0-9]+(-[a-z0-9]+)*$/.test(cleanSlug)) {
      throw new Error(
        "Adresa (slug) smí obsahovat jen malá písmena bez diakritiky, číslice a pomlčky."
      );
    }
    const clash = await ctx.db
      .query("branches")
      .withIndex("by_slug", (q) => q.eq("slug", cleanSlug))
      .unique();
    if (clash) {
      throw new Error(`Pobočka s adresou „${cleanSlug}" už existuje.`);
    }

    const now = Date.now();
    const { _id: _dropId, _creationTime: _dropCreated, ...rest } = source;
    const target_id = await ctx.db.insert("branches", {
      ...rest,
      slug: cleanSlug,
      name: name.trim() || source.name,
      short_name: short_name.trim() || source.short_name,
      is_published: false,
      created_at: now,
      updated_at: now,
    });

    /** Přepíše vazbu na novou pobočku a vloží kopii řádku. */
    const cloneRows = async <T extends { _id: unknown; _creationTime: number }>(
      rows: T[],
      insert: (doc: never) => Promise<unknown>
    ) => {
      for (const row of rows) {
        const { _id: _rowId, _creationTime: _rowCreated, ...data } = row;
        await insert({ ...data, branch_id: target_id } as never);
      }
    };

    await cloneRows(
      await ctx.db
        .query("branch_units")
        .withIndex("by_branch", (q) => q.eq("branch_id", source_id))
        .collect(),
      (doc) => ctx.db.insert("branch_units", doc)
    );
    await cloneRows(
      await ctx.db
        .query("branch_services")
        .withIndex("by_branch", (q) => q.eq("branch_id", source_id))
        .collect(),
      (doc) => ctx.db.insert("branch_services", doc)
    );
    await cloneRows(
      await ctx.db
        .query("branch_facilities")
        .withIndex("by_branch", (q) => q.eq("branch_id", source_id))
        .collect(),
      (doc) => ctx.db.insert("branch_facilities", doc)
    );
    await cloneRows(
      await ctx.db
        .query("branch_team")
        .withIndex("by_branch", (q) => q.eq("branch_id", source_id))
        .collect(),
      (doc) => ctx.db.insert("branch_team", doc)
    );
    await cloneRows(
      await ctx.db
        .query("branch_about_features")
        .withIndex("by_branch", (q) => q.eq("branch_id", source_id))
        .collect(),
      (doc) => ctx.db.insert("branch_about_features", doc)
    );
    await cloneRows(
      await ctx.db
        .query("branch_highlights")
        .withIndex("by_branch", (q) => q.eq("branch_id", source_id))
        .collect(),
      (doc) => ctx.db.insert("branch_highlights", doc)
    );
    await cloneRows(
      await ctx.db
        .query("branch_stats")
        .withIndex("by_branch", (q) => q.eq("branch_id", source_id))
        .collect(),
      (doc) => ctx.db.insert("branch_stats", doc)
    );
    await cloneRows(
      await ctx.db
        .query("branch_admission_steps")
        .withIndex("by_branch", (q) => q.eq("branch_id", source_id))
        .collect(),
      (doc) => ctx.db.insert("branch_admission_steps", doc)
    );
    await cloneRows(
      await ctx.db
        .query("branch_grants")
        .withIndex("by_branch", (q) => q.eq("branch_id", source_id))
        .collect(),
      (doc) => ctx.db.insert("branch_grants", doc)
    );
    await cloneRows(
      await ctx.db
        .query("branch_career_perks")
        .withIndex("by_branch", (q) => q.eq("branch_id", source_id))
        .collect(),
      (doc) => ctx.db.insert("branch_career_perks", doc)
    );
    await cloneRows(
      await ctx.db
        .query("branch_testimonials")
        .withIndex("by_branch", (q) => q.eq("branch_id", source_id))
        .collect(),
      (doc) => ctx.db.insert("branch_testimonials", doc)
    );
    await cloneRows(
      await ctx.db
        .query("branch_faq")
        .withIndex("by_branch", (q) => q.eq("branch_id", source_id))
        .collect(),
      (doc) => ctx.db.insert("branch_faq", doc)
    );
    await cloneRows(
      await ctx.db
        .query("branch_pages")
        .withIndex("by_branch", (q) => q.eq("branch_id", source_id))
        .collect(),
      (doc) => ctx.db.insert("branch_pages", doc)
    );
    await cloneRows(
      await ctx.db
        .query("branch_alerts")
        .withIndex("by_branch", (q) => q.eq("branch_id", source_id))
        .collect(),
      (doc) => ctx.db.insert("branch_alerts", doc)
    );
    await cloneRows(
      await ctx.db
        .query("branch_gallery")
        .withIndex("by_branch", (q) => q.eq("branch_id", source_id))
        .collect(),
      (doc) => ctx.db.insert("branch_gallery", doc)
    );
    await cloneRows(
      await ctx.db
        .query("branch_documents")
        .withIndex("by_branch", (q) => q.eq("branch_id", source_id))
        .collect(),
      (doc) => ctx.db.insert("branch_documents", doc)
    );
    await cloneRows(
      await ctx.db
        .query("branch_hours")
        .withIndex("by_branch", (q) => q.eq("branch_id", source_id))
        .collect(),
      (doc) => ctx.db.insert("branch_hours", doc)
    );

    await createAuditLog(ctx, {
      user_id: profile.user_id,
      action: "branch.duplicated",
      entity_type: "branch",
      entity_id: target_id,
      branch_id: target_id,
      before: { source_slug: source.slug },
      after: { slug: cleanSlug, name, short_name },
    });

    return target_id;
  },
});
