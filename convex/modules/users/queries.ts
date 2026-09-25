import { query } from "../../_generated/server";
import { getAuthUserId } from "@convex-dev/auth/server";
import { requireSuperAdmin } from "../../lib/permissions";

/** Vrátí profil aktuálně přihlášeného uživatele (nebo null). */
export const me = query({
  args: {},
  handler: async (ctx) => {
    const userId = await getAuthUserId(ctx);
    if (!userId) return null;
    const user = await ctx.db.get(userId);
    if (!user) return null;
    const profile = await ctx.db
      .query("user_profiles")
      .withIndex("by_user", (q) => q.eq("user_id", userId))
      .unique();
    const branch =
      profile?.branch_id !== undefined
        ? await ctx.db.get(profile.branch_id)
        : null;
    return {
      userId,
      email: user.email ?? null,
      profile,
      branch,
    };
  },
});

/** Seznam všech uživatelů s rolí a pobočkou — jen super_admin. */
export const listUsers = query({
  args: {},
  handler: async (ctx) => {
    await requireSuperAdmin(ctx);
    const users = await ctx.db.query("users").collect();
    const result = [];
    for (const u of users) {
      const profile = await ctx.db
        .query("user_profiles")
        .withIndex("by_user", (q) => q.eq("user_id", u._id))
        .unique();
      const branch =
        profile?.branch_id !== undefined
          ? await ctx.db.get(profile.branch_id)
          : null;
      result.push({
        userId: u._id,
        email: u.email ?? null,
        name: profile?.name ?? u.name ?? null,
        role: profile?.role ?? null,
        branchId: profile?.branch_id ?? null,
        branchName: branch?.short_name ?? null,
        createdAt: u._creationTime,
      });
    }
    return result.sort((a, b) => b.createdAt - a.createdAt);
  },
});
