import type { QueryCtx } from "../../_generated/server";
import type { Id } from "../../_generated/dataModel";

export async function listForBranch(ctx: QueryCtx, branchId: Id<"branches">) {
  return await ctx.db
    .query("branch_news")
    .withIndex("by_published_at", (q) =>
      q.eq("branch_id", branchId).eq("is_published", true)
    )
    .order("desc")
    .collect();
}

export async function getBySlug(
  ctx: QueryCtx,
  branchId: Id<"branches">,
  slug: string
) {
  return await ctx.db
    .query("branch_news")
    .withIndex("by_branch_slug", (q) =>
      q.eq("branch_id", branchId).eq("slug", slug)
    )
    .unique();
}
