import { v } from "convex/values";
import { query } from "../../_generated/server";
import * as model from "./model";

export const getBySlug = query({
  args: { slug: v.string() },
  handler: async (ctx, { slug }) => model.getBranchBySlug(ctx, slug),
});

export const listPublished = query({
  args: {},
  handler: async (ctx) => model.listPublishedBranches(ctx),
});

/** Admin přehled — všechny pobočky včetně nepublikovaných. */
export const listAllForAdmin = query({
  args: {},
  handler: async (ctx) => model.listAllBranches(ctx),
});

/** Detail pobočky podle ID (pro admin formulář). */
export const getById = query({
  args: { id: v.id("branches") },
  handler: async (ctx, { id }) => model.getBranchById(ctx, id),
});

/** Agregované síťové statistiky (počet poboček, krajů, lůžek). */
export const getNetworkStats = query({
  args: {},
  handler: async (ctx) => model.getNetworkStats(ctx),
});

/** Článkový obsah podstránky (O zařízení, Služby…) pro danou pobočku. */
export const getBranchPage = query({
  args: { slug: v.string(), page: v.string() },
  handler: async (ctx, { slug, page }) => {
    const branch = await model.getBranchBySlug(ctx, slug);
    if (!branch) return null;
    return await ctx.db
      .query("branch_pages")
      .withIndex("by_branch_page", (q) =>
        q.eq("branch_id", branch._id).eq("page", page)
      )
      .unique();
  },
});

export const getHomepage = query({
  args: { slug: v.string() },
  handler: async (ctx, { slug }) => model.getBranchHomepage(ctx, slug),
});

export const getUnitBySlug = query({
  args: {
    branchSlug: v.string(),
    unitSlug: v.string(),
    category: v.optional(
      v.union(
        v.literal("oddeleni"),
        v.literal("ambulance"),
        v.literal("komplement")
      )
    ),
  },
  handler: async (ctx, { branchSlug, unitSlug, category }) => {
    const branch = await model.getBranchBySlug(ctx, branchSlug);
    if (!branch) return null;
    const units = await ctx.db
      .query("branch_units")
      .withIndex("by_branch", (q) => q.eq("branch_id", branch._id))
      .collect();
    const found = units.find(
      (u) => u.slug === unitSlug && (!category || u.category === category)
    );
    if (!found) return null;
    const related = units
      .filter((u) => u.category === found.category && u._id !== found._id)
      .sort((a, b) => a.order - b.order)
      .slice(0, 6);
    return { branch, unit: found, related };
  },
});

/** Sekce „V číslech" pro editaci v administraci. */
export const listStats = query({
  args: { branch_id: v.id("branches") },
  handler: async (ctx, { branch_id }) => {
    const rows = await ctx.db
      .query("branch_stats")
      .withIndex("by_branch", (q) => q.eq("branch_id", branch_id))
      .collect();
    return rows.sort((a, b) => a.order - b.order);
  },
});

/** Recenze / příběhy pobočky pro editaci v administraci. */
export const listTestimonials = query({
  args: { branch_id: v.id("branches") },
  handler: async (ctx, { branch_id }) => {
    return await ctx.db
      .query("branch_testimonials")
      .withIndex("by_branch", (q) => q.eq("branch_id", branch_id))
      .collect();
  },
});
