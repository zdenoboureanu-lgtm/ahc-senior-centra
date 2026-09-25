import { v } from "convex/values";
import { query } from "../../_generated/server";
import * as model from "./model";

export const listForBranch = query({
  args: { branchId: v.id("branches") },
  handler: async (ctx, { branchId }) => model.listForBranch(ctx, branchId),
});

export const getBySlug = query({
  args: { branchId: v.id("branches"), slug: v.string() },
  handler: async (ctx, { branchId, slug }) =>
    model.getBySlug(ctx, branchId, slug),
});
