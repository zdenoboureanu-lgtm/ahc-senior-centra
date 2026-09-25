import { mutation } from "./_generated/server";
import { v } from "convex/values";

/**
 * Import "content packu" pobočky — JSON vyrobený z obsahových dokumentů klienta
 * (tabulka „Weby AHC" → Obsah pro podstránky + scrape stávajících webů).
 *
 * Sémantika: branch_patch se merguje do branches; každá kolekce, kterou pack
 * obsahuje, se NAHRADÍ celá (delete + insert). Kolekce v packu chybějící se nemění.
 *
 * Použití: bunx convex run import_packs:importContentPack "$(cat pack-<slug>.json)"
 */

/** Odebere pole z branches záznamu (patch s undefined). */
export const unsetBranchFields = mutation({
  args: { slug: v.string(), fields: v.array(v.string()) },
  handler: async (ctx, { slug, fields }) => {
    const branch = await ctx.db
      .query("branches")
      .withIndex("by_slug", (q) => q.eq("slug", slug))
      .unique();
    if (!branch) throw new Error(`Pobočka '${slug}' nenalezena`);
    const patch: Record<string, undefined> = {};
    for (const f of fields) patch[f] = undefined;
    await ctx.db.patch(branch._id, patch as never);
    return { slug, unset: fields };
  },
});

/** Smaže novinky pobočky, jejichž titulek obsahuje daný text. */
export const deleteNewsByTitle = mutation({
  args: { slug: v.string(), title_contains: v.string() },
  handler: async (ctx, { slug, title_contains }) => {
    const branch = await ctx.db
      .query("branches")
      .withIndex("by_slug", (q) => q.eq("slug", slug))
      .unique();
    if (!branch) throw new Error(`Pobočka '${slug}' nenalezena`);
    const news = await ctx.db
      .query("branch_news")
      .withIndex("by_branch", (q) => q.eq("branch_id", branch._id))
      .collect();
    const deleted: string[] = [];
    for (const n of news) {
      if (n.title.includes(title_contains)) {
        await ctx.db.delete(n._id);
        deleted.push(n.title);
      }
    }
    return { slug, deleted };
  },
});

/** Smaže jednotky (oddělení/ambulance) pobočky dle názvu — pro odstranění šablonových fabulací. */
export const deleteUnitsByName = mutation({
  args: { slug: v.string(), names: v.array(v.string()) },
  handler: async (ctx, { slug, names }) => {
    const branch = await ctx.db
      .query("branches")
      .withIndex("by_slug", (q) => q.eq("slug", slug))
      .unique();
    if (!branch) throw new Error(`Pobočka '${slug}' nenalezena`);
    const units = await ctx.db
      .query("branch_units")
      .withIndex("by_branch", (q) => q.eq("branch_id", branch._id))
      .collect();
    const deleted: string[] = [];
    for (const u of units) {
      if (names.some((n) => u.name.includes(n))) {
        await ctx.db.delete(u._id);
        deleted.push(u.name);
      }
    }
    return { slug, deleted };
  },
});

const blockValidator = v.object({
  type: v.string(),
  text: v.optional(v.string()),
  heading: v.optional(v.string()),
  author: v.optional(v.string()),
  href: v.optional(v.string()),
  label: v.optional(v.string()),
  items: v.optional(
    v.array(
      v.object({
        label: v.string(),
        text: v.optional(v.string()),
        url: v.optional(v.string()),
        image: v.optional(v.string()),
      })
    )
  ),
  bullets: v.optional(v.array(v.string())),
});

const pageValidator = v.object({
  title: v.optional(v.string()),
  eyebrow: v.optional(v.string()),
  lead: v.optional(v.string()),
  blocks: v.array(blockValidator),
});

export const importContentPack = mutation({
  args: {
    slug: v.string(),
    branch_patch: v.optional(v.record(v.string(), v.any())),
    highlights: v.optional(
      v.array(v.object({ title: v.string(), description: v.string(), icon: v.optional(v.string()) }))
    ),
    services: v.optional(
      v.array(v.object({ title: v.string(), description: v.optional(v.string()), icon: v.string() }))
    ),
    about_features: v.optional(v.array(v.string())),
    admission_steps: v.optional(
      v.array(v.object({ step_number: v.number(), title: v.string(), description: v.string() }))
    ),
    faq: v.optional(v.array(v.object({ question: v.string(), answer: v.string() }))),
    testimonials: v.optional(
      v.array(
        v.object({
          author_name: v.string(),
          author_role: v.optional(v.string()),
          content: v.string(),
          rating: v.optional(v.number()),
        })
      )
    ),
    team: v.optional(
      v.array(
        v.object({
          name: v.string(),
          role: v.string(),
          bio: v.optional(v.string()),
          email: v.optional(v.string()),
          phone: v.optional(v.string()),
          photo_url: v.optional(v.string()),
          is_director: v.optional(v.boolean()),
        })
      )
    ),
    hours: v.optional(
      v.array(
        v.object({
          label: v.string(),
          day_from: v.number(),
          day_to: v.number(),
          time_from: v.string(),
          time_to: v.string(),
          note: v.optional(v.string()),
        })
      )
    ),
    career_perks: v.optional(
      v.array(v.object({ title: v.string(), description: v.string(), icon: v.optional(v.string()) }))
    ),
    pages: v.optional(v.record(v.string(), pageValidator)),
    documents: v.optional(
      v.array(
        v.object({
          title: v.string(),
          description: v.optional(v.string()),
          drive_id: v.optional(v.string()),
          filename: v.string(),
          file_size: v.optional(v.number()),
        })
      )
    ),
    gallery: v.optional(
      v.array(v.object({ image_url: v.string(), caption: v.optional(v.string()) }))
    ),
    facilities: v.optional(
      v.array(v.object({ title: v.string(), image_url: v.optional(v.string()) }))
    ),
    // Fáze B metadata — ignorováno při importu
    gallery_captions: v.optional(v.array(v.string())),
  },
  handler: async (ctx, pack) => {
    const now = Date.now();
    const summary: Record<string, number> = {};

    let branch = await ctx.db
      .query("branches")
      .withIndex("by_slug", (q) => q.eq("slug", pack.slug))
      .unique();

    if (!branch) {
      if (!pack.branch_patch?.name) {
        throw new Error(
          `Pobočka '${pack.slug}' v DB není a branch_patch neobsahuje kompletní data (name…). Nejdřív spusť základní seed.`
        );
      }
      const id = await ctx.db.insert("branches", {
        ...(pack.branch_patch as object),
        slug: pack.slug,
        created_at: now,
        updated_at: now,
      } as never);
      branch = await ctx.db.get(id);
      summary.branch_created = 1;
    } else if (pack.branch_patch && Object.keys(pack.branch_patch).length > 0) {
      await ctx.db.patch(branch._id, {
        ...(pack.branch_patch as object),
        updated_at: now,
      } as never);
      summary.branch_patched = Object.keys(pack.branch_patch).length;
    }
    if (!branch) throw new Error("insert branch selhal");
    const branchId = branch._id;

    const replaceAll = async (
      table:
        | "branch_highlights"
        | "branch_services"
        | "branch_about_features"
        | "branch_admission_steps"
        | "branch_faq"
        | "branch_team"
        | "branch_hours"
        | "branch_career_perks"
        | "branch_documents"
        | "branch_gallery"
        | "branch_facilities",
      rows: Array<Record<string, unknown>> | undefined
    ) => {
      if (!rows) return;
      const existing = await ctx.db
        .query(table)
        .withIndex("by_branch", (q) => q.eq("branch_id", branchId))
        .collect();
      for (const r of existing) await ctx.db.delete(r._id);
      let order = 0;
      for (const row of rows) {
        await ctx.db.insert(table, {
          ...(row as object),
          branch_id: branchId,
          order: order++,
          created_at: now,
          updated_at: now,
        } as never);
      }
      summary[table] = rows.length;
    };

    await replaceAll("branch_highlights", pack.highlights);
    await replaceAll("branch_services", pack.services);
    await replaceAll(
      "branch_about_features",
      pack.about_features?.map((text) => ({ text }))
    );
    await replaceAll("branch_faq", pack.faq);
    await replaceAll("branch_team", pack.team);

    // testimonials nemají order
    if (pack.testimonials) {
      const existing = await ctx.db
        .query("branch_testimonials")
        .withIndex("by_branch", (q) => q.eq("branch_id", branchId))
        .collect();
      for (const r of existing) await ctx.db.delete(r._id);
      for (const t of pack.testimonials) {
        await ctx.db.insert("branch_testimonials", {
          branch_id: branchId,
          author_name: t.author_name,
          author_role: t.author_role,
          content: t.content,
          rating: t.rating,
          created_at: now,
          updated_at: now,
        });
      }
      summary.branch_testimonials = pack.testimonials.length;
    }
    await replaceAll("branch_hours", pack.hours);
    await replaceAll("branch_career_perks", pack.career_perks);
    await replaceAll("branch_gallery", pack.gallery);
    await replaceAll(
      "branch_facilities",
      pack.facilities
        ?.filter((f) => f.image_url)
        .map((f) => ({ title: f.title, image_url: f.image_url }))
    );
    await replaceAll(
      "branch_documents",
      pack.documents?.map((d) => ({
        title: d.title,
        description: d.description,
        file_url: `/documents/${pack.slug}/${d.filename}`,
        file_size: d.file_size,
      }))
    );

    // admission_steps nemá order — má step_number
    if (pack.admission_steps) {
      const existing = await ctx.db
        .query("branch_admission_steps")
        .withIndex("by_branch", (q) => q.eq("branch_id", branchId))
        .collect();
      for (const r of existing) await ctx.db.delete(r._id);
      for (const s of pack.admission_steps) {
        await ctx.db.insert("branch_admission_steps", {
          branch_id: branchId,
          step_number: s.step_number,
          title: s.title,
          description: s.description,
          created_at: now,
          updated_at: now,
        });
      }
      summary.branch_admission_steps = pack.admission_steps.length;
    }

    if (pack.pages) {
      for (const [page, content] of Object.entries(pack.pages)) {
        const existing = await ctx.db
          .query("branch_pages")
          .withIndex("by_branch_page", (q) =>
            q.eq("branch_id", branchId).eq("page", page)
          )
          .collect();
        for (const r of existing) await ctx.db.delete(r._id);
        await ctx.db.insert("branch_pages", {
          branch_id: branchId,
          page,
          title: content.title,
          eyebrow: content.eyebrow,
          lead: content.lead,
          blocks: content.blocks,
          updated_at: now,
        });
        summary[`page:${page}`] = content.blocks.length;
      }
    }

    return { slug: pack.slug, summary };
  },
});

/** Hromadné předvyplnění sekce „V číslech" (bez auth — spouští se z CLI při migraci). */
export const importStats = mutation({
  args: {
    slug: v.string(),
    stats: v.array(
      v.object({
        value: v.string(),
        label: v.string(),
        icon: v.optional(v.string()),
      })
    ),
  },
  handler: async (ctx, { slug, stats }) => {
    const branch = await ctx.db
      .query("branches")
      .withIndex("by_slug", (q) => q.eq("slug", slug))
      .unique();
    if (!branch) throw new Error(`Pobočka '${slug}' nenalezena`);

    const existing = await ctx.db
      .query("branch_stats")
      .withIndex("by_branch", (q) => q.eq("branch_id", branch._id))
      .collect();
    for (const r of existing) await ctx.db.delete(r._id);

    const now = Date.now();
    let order = 0;
    for (const s of stats) {
      await ctx.db.insert("branch_stats", {
        branch_id: branch._id,
        value: s.value,
        label: s.label,
        icon: s.icon,
        order: order++,
        created_at: now,
        updated_at: now,
      });
    }
    return { slug, count: order };
  },
});

/**
 * Doplní blokům článkových podstránek stabilní `uid` a přepíše na něj
 * stávající značky skrytí (dřív se vázaly na pořadí bloku, takže po vložení
 * kopie „ujely" na souseda).
 *
 *  bunx convex run import_packs:backfillBlockUids --prod
 */
export const backfillBlockUids = mutation({
  args: {},
  handler: async (ctx) => {
    const pages = await ctx.db.query("branch_pages").collect();
    let pagesTouched = 0;
    let markersMoved = 0;

    for (const page of pages) {
      const needsUid = page.blocks.some((b) => !b.uid);
      const blocks = page.blocks.map((b) =>
        b.uid ? b : { ...b, uid: Math.random().toString(36).slice(2, 10) }
      );
      if (needsUid) {
        await ctx.db.patch(page._id, { blocks, updated_at: Date.now() });
        pagesTouched++;
      }

      // Značky skrytí: `hidden:page:<pageId>:<index>` → `…:<uid>`
      const rows = await ctx.db
        .query("branch_copy")
        .withIndex("by_branch", (q) => q.eq("branch_id", page.branch_id))
        .collect();
      for (const row of rows) {
        const m = row.key.match(
          new RegExp(`^hidden:page:${page._id}:(sekce:)?(\\\\d+)$`)
        );
        if (!m) continue;
        const uid = blocks[Number(m[2])]?.uid;
        if (!uid) continue;
        await ctx.db.patch(row._id, {
          key: `hidden:page:${page._id}:${m[1] ?? ""}${uid}`,
          updated_at: Date.now(),
        });
        markersMoved++;
      }
    }
    return { pages: pages.length, pagesTouched, markersMoved };
  },
});
