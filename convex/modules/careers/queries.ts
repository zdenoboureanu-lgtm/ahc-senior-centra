import { v } from "convex/values";
import { query } from "../../_generated/server";
import * as model from "./model";

export const listForBranch = query({
  args: { branchId: v.id("branches") },
  handler: async (ctx, { branchId }) => model.listForBranch(ctx, branchId),
});

export const listAllPublished = query({
  args: {},
  handler: async (ctx) => model.listAllPublished(ctx),
});

export const listGroupedBySlug = query({
  args: { slug: v.union(v.string(), v.null()) },
  handler: async (ctx, { slug }) => model.listGroupedBySlug(ctx, slug),
});

/** Admin: všechny pozice vlastní pobočky (i nepublished) */
export const listForBranchAdmin = query({
  args: { branchId: v.id("branches") },
  handler: async (ctx, { branchId }) =>
    model.listForBranchAdmin(ctx, branchId),
});

/** Admin: VŠECHNY pozice napříč všemi pobočkami (i nepublished) + název pobočky. */
export const listAllForAdmin = query({
  args: {},
  handler: async (ctx) => {
    const positions = await ctx.db
      .query("career_positions")
      .order("desc")
      .collect();
    const result = [];
    for (const p of positions) {
      const branch = await ctx.db.get(p.branch_id);
      result.push({ ...p, branchName: branch?.short_name ?? "—" });
    }
    return result;
  },
});

export const getById = query({
  args: { id: v.id("career_positions") },
  handler: async (ctx, { id }) => model.getById(ctx, id),
});

export const getBySlug = query({
  args: { branchId: v.id("branches"), slug: v.string() },
  handler: async (ctx, { branchId, slug }) =>
    model.getBySlug(ctx, branchId, slug),
});
