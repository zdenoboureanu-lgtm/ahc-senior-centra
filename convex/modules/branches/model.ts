import type { QueryCtx } from "../../_generated/server";

export async function getBranchBySlug(ctx: QueryCtx, slug: string) {
  return await ctx.db
    .query("branches")
    .withIndex("by_slug", (q) => q.eq("slug", slug))
    .unique();
}

export async function listPublishedBranches(ctx: QueryCtx) {
  return await ctx.db
    .query("branches")
    .withIndex("by_published", (q) => q.eq("is_published", true))
    .collect();
}

/** Všechny pobočky (i nepublikované) — pro admin přehled. Řazeno dle názvu. */
export async function listAllBranches(ctx: QueryCtx) {
  const all = await ctx.db.query("branches").collect();
  return all.sort((a, b) => a.name.localeCompare(b.name, "cs"));
}

export async function getBranchById(
  ctx: QueryCtx,
  id: import("../../_generated/dataModel").Id<"branches">
) {
  return await ctx.db.get(id);
}

/**
 * Agregované síťové statistiky napříč publikovanými pobočkami.
 * Zdroj pravdy pro „X poboček", „Y krajů", „Z lůžek" kdekoli na webech.
 */
export async function getNetworkStats(ctx: QueryCtx) {
  const branches = await listPublishedBranches(ctx);
  const regions = new Set(branches.map((b) => b.region).filter(Boolean));
  const totalBeds = branches.reduce(
    (sum, b) => sum + (b.bed_count ?? b.stat_beds ?? 0),
    0
  );
  const hospitals = branches.filter(
    (b) => b.branch_type === "hospital"
  ).length;
  const seniorCentra = branches.filter(
    (b) => b.branch_type === "senior_centrum"
  ).length;
  return {
    branchCount: branches.length,
    regionCount: regions.size,
    totalBeds,
    hospitals,
    seniorCentra,
  };
}

export async function getBranchHomepage(ctx: QueryCtx, slug: string) {
  const branch = await getBranchBySlug(ctx, slug);
  if (!branch) return null;

  const [
    services,
    facilities,
    team,
    testimonials,
    faq,
    news,
    gallery,
    hours,
    documents,
    aboutFeatures,
    highlights,
    stats,
    admissionSteps,
    careerPerks,
    grants,
    units,
    alerts,
    otherBranches,
  ] = await Promise.all([
    ctx.db.query("branch_services").withIndex("by_branch", (q) => q.eq("branch_id", branch._id)).collect(),
    ctx.db.query("branch_facilities").withIndex("by_branch", (q) => q.eq("branch_id", branch._id)).collect(),
    ctx.db.query("branch_team").withIndex("by_branch", (q) => q.eq("branch_id", branch._id)).collect(),
    ctx.db.query("branch_testimonials").withIndex("by_branch", (q) => q.eq("branch_id", branch._id)).collect(),
    ctx.db.query("branch_faq").withIndex("by_branch", (q) => q.eq("branch_id", branch._id)).collect(),
    ctx.db.query("branch_news").withIndex("by_published_at", (q) => q.eq("branch_id", branch._id).eq("is_published", true)).order("desc").take(6),
    ctx.db.query("branch_gallery").withIndex("by_branch", (q) => q.eq("branch_id", branch._id)).collect(),
    ctx.db.query("branch_hours").withIndex("by_branch", (q) => q.eq("branch_id", branch._id)).collect(),
    ctx.db.query("branch_documents").withIndex("by_branch", (q) => q.eq("branch_id", branch._id)).collect(),
    ctx.db.query("branch_about_features").withIndex("by_branch", (q) => q.eq("branch_id", branch._id)).collect(),
    ctx.db.query("branch_highlights").withIndex("by_branch", (q) => q.eq("branch_id", branch._id)).collect(),
    ctx.db.query("branch_stats").withIndex("by_branch", (q) => q.eq("branch_id", branch._id)).collect(),
    ctx.db.query("branch_admission_steps").withIndex("by_branch", (q) => q.eq("branch_id", branch._id)).collect(),
    ctx.db.query("branch_career_perks").withIndex("by_branch", (q) => q.eq("branch_id", branch._id)).collect(),
    ctx.db.query("branch_grants").withIndex("by_branch", (q) => q.eq("branch_id", branch._id)).collect(),
    ctx.db.query("branch_units").withIndex("by_branch", (q) => q.eq("branch_id", branch._id)).collect(),
    ctx.db.query("branch_alerts").withIndex("by_branch_active", (q) => q.eq("branch_id", branch._id).eq("is_active", true)).collect(),
    listPublishedBranches(ctx),
  ]);

  return {
    branch,
    services: services.sort((a, b) => a.order - b.order),
    facilities: facilities.sort((a, b) => a.order - b.order),
    team: team.sort((a, b) => a.order - b.order),
    testimonials,
    faq: faq.sort((a, b) => a.order - b.order),
    news,
    gallery: gallery.sort((a, b) => a.order - b.order),
    hours: hours.sort((a, b) => a.order - b.order),
    documents: documents.sort((a, b) => a.order - b.order),
    aboutFeatures: aboutFeatures.sort((a, b) => a.order - b.order),
    highlights: highlights.sort((a, b) => a.order - b.order),
    stats: stats.sort((a, b) => a.order - b.order),
    admissionSteps: admissionSteps.sort((a, b) => a.step_number - b.step_number),
    careerPerks: careerPerks.sort((a, b) => a.order - b.order),
    grants: grants.sort((a, b) => a.order - b.order),
    units: units.sort((a, b) => a.order - b.order),
    alerts: alerts.sort((a, b) => a.order - b.order),
    otherBranches: otherBranches.filter((b) => b._id !== branch._id),
  };
}
