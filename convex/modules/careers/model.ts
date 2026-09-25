import type { QueryCtx } from "../../_generated/server";
import type { Doc, Id } from "../../_generated/dataModel";

export async function listForBranch(ctx: QueryCtx, branchId: Id<"branches">) {
  const positions = await ctx.db
    .query("career_positions")
    .withIndex("by_branch", (q) => q.eq("branch_id", branchId))
    .collect();
  return positions.filter((p) => p.is_published).sort((a, b) => b.published_at - a.published_at);
}

/** Pro admin — vrátí všechny pozice (i nepublished). */
export async function listForBranchAdmin(
  ctx: QueryCtx,
  branchId: Id<"branches">
) {
  return await ctx.db
    .query("career_positions")
    .withIndex("by_branch", (q) => q.eq("branch_id", branchId))
    .order("desc")
    .collect();
}

export async function getById(ctx: QueryCtx, id: Id<"career_positions">) {
  return await ctx.db.get(id);
}

export interface CareersGrouped {
  ownBranch: {
    branch: Doc<"branches">;
    positions: Doc<"career_positions">[];
  } | null;
  otherRegions: {
    region: string;
    branches: {
      branch: Doc<"branches">;
      positions: Doc<"career_positions">[];
    }[];
  }[];
  totalCount: number;
}

/**
 * Vrátí kariéry seskupené:
 *  - vlastní pobočka (pokud `slug` daná)
 *  - ostatní pobočky seskupené podle kraje (region)
 * V každé sekci jen published pozice, řazené od nejnovějších.
 */
export async function listGroupedBySlug(
  ctx: QueryCtx,
  slug: string | null
): Promise<CareersGrouped> {
  const [allBranches, allPositions] = await Promise.all([
    ctx.db
      .query("branches")
      .withIndex("by_published", (q) => q.eq("is_published", true))
      .collect(),
    ctx.db
      .query("career_positions")
      .withIndex("by_published", (q) => q.eq("is_published", true))
      .order("desc")
      .collect(),
  ]);

  const own = slug ? allBranches.find((b) => b.slug === slug) ?? null : null;
  const others = allBranches.filter((b) => b._id !== own?._id);

  // Group positions by branchId
  const positionsByBranch = new Map<string, Doc<"career_positions">[]>();
  for (const p of allPositions) {
    const arr = positionsByBranch.get(p.branch_id) ?? [];
    arr.push(p);
    positionsByBranch.set(p.branch_id, arr);
  }

  const ownBranch = own
    ? { branch: own, positions: positionsByBranch.get(own._id) ?? [] }
    : null;

  // Group ostatní by region
  const byRegion = new Map<
    string,
    { branch: Doc<"branches">; positions: Doc<"career_positions">[] }[]
  >();
  for (const b of others) {
    const positions = positionsByBranch.get(b._id) ?? [];
    if (positions.length === 0) continue;
    const arr = byRegion.get(b.region) ?? [];
    arr.push({ branch: b, positions });
    byRegion.set(b.region, arr);
  }
  const otherRegions = Array.from(byRegion.entries())
    .sort((a, b) => a[0].localeCompare(b[0], "cs"))
    .map(([region, branches]) => ({ region, branches }));

  const totalCount =
    (ownBranch?.positions.length ?? 0) +
    otherRegions.reduce(
      (sum, r) => sum + r.branches.reduce((s, b) => s + b.positions.length, 0),
      0
    );

  return { ownBranch, otherRegions, totalCount };
}

export async function listAllPublished(ctx: QueryCtx) {
  return await ctx.db
    .query("career_positions")
    .withIndex("by_published", (q) => q.eq("is_published", true))
    .order("desc")
    .collect();
}

export async function getBySlug(
  ctx: QueryCtx,
  branchId: Id<"branches">,
  slug: string
) {
  return await ctx.db
    .query("career_positions")
    .withIndex("by_branch_slug", (q) =>
      q.eq("branch_id", branchId).eq("slug", slug)
    )
    .unique();
}
