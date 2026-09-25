import { v } from "convex/values";
import { query } from "../../_generated/server";
import * as branchModel from "../branches/model";

/**
 * Přepsané texty a fotky ručně psaných stránek pobočky.
 * Vrací mapu klíč → hodnota; co v ní není, se vezme z kódu.
 */
export const getCopy = query({
  args: { slug: v.string() },
  handler: async (ctx, { slug }) => {
    const branch = await branchModel.getBranchBySlug(ctx, slug);
    if (!branch) return {};
    const rows = await ctx.db
      .query("branch_copy")
      .withIndex("by_branch", (q) => q.eq("branch_id", branch._id))
      .collect();
    return Object.fromEntries(rows.map((r) => [r.key, r.value]));
  },
});
