import { getAuthUserId } from "@convex-dev/auth/server";
import type { Id } from "../_generated/dataModel";
import type { MutationCtx, QueryCtx } from "../_generated/server";

export class AuthError extends Error {
  constructor(message: string) {
    super(message);
    this.name = "AuthError";
  }
}

/** Vrátí userId aktuálního uživatele, nebo vyhodí. */
export async function requireAuth(
  ctx: QueryCtx | MutationCtx
): Promise<Id<"users">> {
  const userId = await getAuthUserId(ctx);
  if (!userId) {
    throw new AuthError("Pro tuto operaci je nutné se přihlásit.");
  }
  return userId;
}

/** Vrátí profil aktuálního uživatele (s rolí + branch_id). */
export async function requireProfile(ctx: QueryCtx | MutationCtx) {
  const userId = await requireAuth(ctx);
  const profile = await ctx.db
    .query("user_profiles")
    .withIndex("by_user", (q) => q.eq("user_id", userId))
    .unique();
  if (!profile) {
    throw new AuthError(
      "Účet nemá přiřazený profil. Kontaktujte administrátora."
    );
  }
  return profile;
}

/** Vyžádá si super_admin roli. */
export async function requireSuperAdmin(ctx: QueryCtx | MutationCtx) {
  const profile = await requireProfile(ctx);
  if (profile.role !== "super_admin") {
    throw new AuthError("Tato akce vyžaduje oprávnění super-admin.");
  }
  return profile;
}

/**
 * Vyžádá přístup k dané pobočce:
 *  - super_admin: má přístup ke všem pobočkám
 *  - branch_manager: jen ke své vlastní (profile.branch_id === branchId)
 */
export async function requireBranchAccess(
  ctx: QueryCtx | MutationCtx,
  branchId: Id<"branches">
) {
  const profile = await requireProfile(ctx);
  if (profile.role === "super_admin") return profile;
  if (profile.branch_id !== branchId) {
    throw new AuthError(
      "Nemáte oprávnění upravovat data této pobočky."
    );
  }
  return profile;
}
