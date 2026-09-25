import { v } from "convex/values";
import { mutation } from "../../_generated/server";
import { requireSuperAdmin } from "../../lib/permissions";
import { createAuditLog } from "../../lib/audit";

const roleValidator = v.union(
  v.literal("super_admin"),
  v.literal("branch_manager")
);

/**
 * Nastaví / změní roli uživatele a (u branch_managera) přiřadí pobočku.
 * Upsert profilu. Jen super_admin.
 */
export const setUserRole = mutation({
  args: {
    userId: v.id("users"),
    role: roleValidator,
    branchId: v.optional(v.id("branches")),
    name: v.optional(v.string()),
  },
  handler: async (ctx, { userId, role, branchId, name }) => {
    const admin = await requireSuperAdmin(ctx);

    if (role === "branch_manager" && !branchId) {
      throw new Error("Lokální admin musí mít přiřazenou pobočku.");
    }
    // super_admin pobočku nepotřebuje
    const finalBranchId = role === "super_admin" ? undefined : branchId;

    const existing = await ctx.db
      .query("user_profiles")
      .withIndex("by_user", (q) => q.eq("user_id", userId))
      .unique();

    const now = Date.now();
    if (existing) {
      await ctx.db.patch(existing._id, {
        role,
        branch_id: finalBranchId,
        name: name ?? existing.name,
        updated_at: now,
      });
    } else {
      await ctx.db.insert("user_profiles", {
        user_id: userId,
        role,
        branch_id: finalBranchId,
        name,
        created_at: now,
        updated_at: now,
      });
    }
    await createAuditLog(ctx, {
      user_id: admin.user_id,
      action: "user.role_set",
      entity_type: "user_profile",
      entity_id: userId,
      branch_id: finalBranchId,
      after: { role, branch_id: finalBranchId },
    });
    return userId;
  },
});

/**
 * Odebere uživateli přístup do administrace (smaže profil, účet zůstává).
 * Jen super_admin; nelze odebrat sám sobě.
 */
export const revokeUser = mutation({
  args: { userId: v.id("users") },
  handler: async (ctx, { userId }) => {
    const admin = await requireSuperAdmin(ctx);
    if (admin.user_id === userId) {
      throw new Error("Nemůžete odebrat přístup sami sobě.");
    }
    const profile = await ctx.db
      .query("user_profiles")
      .withIndex("by_user", (q) => q.eq("user_id", userId))
      .unique();
    if (!profile) throw new Error("Uživatel nemá profil.");
    await ctx.db.delete(profile._id);
    await createAuditLog(ctx, {
      user_id: admin.user_id,
      action: "user.revoked",
      entity_type: "user_profile",
      entity_id: userId,
      before: { role: profile.role, branch_id: profile.branch_id },
    });
    return userId;
  },
});
