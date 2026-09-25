import { v } from "convex/values";
import { mutation } from "../../_generated/server";
import { requireBranchAccess } from "../../lib/permissions";
import { createAuditLog } from "../../lib/audit";

const employmentTypeValidator = v.union(
  v.literal("full_time"),
  v.literal("part_time"),
  v.literal("contract"),
  v.literal("internship")
);

/** Vytvoří novou pozici — branch_manager jen pro svou pobočku, super_admin pro libovolnou. */
export const create = mutation({
  args: {
    branch_id: v.id("branches"),
    title: v.string(),
    slug: v.string(),
    employment_type: employmentTypeValidator,
    description: v.string(),
    requirements: v.optional(v.string()),
    benefits: v.optional(v.string()),
    salary_from: v.optional(v.number()),
    salary_to: v.optional(v.number()),
    is_published: v.boolean(),
  },
  handler: async (ctx, args) => {
    const profile = await requireBranchAccess(ctx, args.branch_id);
    const now = Date.now();
    const id = await ctx.db.insert("career_positions", {
      ...args,
      published_at: now,
      created_at: now,
      updated_at: now,
    });
    await createAuditLog(ctx, {
      user_id: profile.user_id,
      action: "career.created",
      entity_type: "career_position",
      entity_id: id,
      branch_id: args.branch_id,
      after: args,
    });
    return id;
  },
});

/** Update pozice. */
export const update = mutation({
  args: {
    id: v.id("career_positions"),
    title: v.string(),
    slug: v.string(),
    employment_type: employmentTypeValidator,
    description: v.string(),
    requirements: v.optional(v.string()),
    benefits: v.optional(v.string()),
    salary_from: v.optional(v.number()),
    salary_to: v.optional(v.number()),
    is_published: v.boolean(),
  },
  handler: async (ctx, { id, ...patch }) => {
    const existing = await ctx.db.get(id);
    if (!existing) throw new Error("Pozice nenalezena.");
    const profile = await requireBranchAccess(ctx, existing.branch_id);
    await ctx.db.patch(id, { ...patch, updated_at: Date.now() });
    await createAuditLog(ctx, {
      user_id: profile.user_id,
      action: "career.updated",
      entity_type: "career_position",
      entity_id: id,
      branch_id: existing.branch_id,
      before: existing,
      after: { ...existing, ...patch },
    });
    return id;
  },
});

/** Smazání pozice. */
export const remove = mutation({
  args: { id: v.id("career_positions") },
  handler: async (ctx, { id }) => {
    const existing = await ctx.db.get(id);
    if (!existing) throw new Error("Pozice nenalezena.");
    const profile = await requireBranchAccess(ctx, existing.branch_id);
    await ctx.db.delete(id);
    await createAuditLog(ctx, {
      user_id: profile.user_id,
      action: "career.deleted",
      entity_type: "career_position",
      entity_id: id,
      branch_id: existing.branch_id,
      before: existing,
    });
  },
});

/** Toggle publish/draft. */
export const togglePublished = mutation({
  args: { id: v.id("career_positions") },
  handler: async (ctx, { id }) => {
    const existing = await ctx.db.get(id);
    if (!existing) throw new Error("Pozice nenalezena.");
    const profile = await requireBranchAccess(ctx, existing.branch_id);
    const next = !existing.is_published;
    await ctx.db.patch(id, {
      is_published: next,
      published_at: next ? Date.now() : existing.published_at,
      updated_at: Date.now(),
    });
    await createAuditLog(ctx, {
      user_id: profile.user_id,
      action: next ? "career.published" : "career.unpublished",
      entity_type: "career_position",
      entity_id: id,
      branch_id: existing.branch_id,
      before: { is_published: existing.is_published },
      after: { is_published: next },
    });
  },
});
