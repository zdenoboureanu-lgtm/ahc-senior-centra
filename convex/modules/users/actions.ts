import { v } from "convex/values";
import { createAccount } from "@convex-dev/auth/server";
import { action } from "../../_generated/server";
import { api } from "../../_generated/api";

const roleValidator = v.union(
  v.literal("super_admin"),
  v.literal("branch_manager")
);

/**
 * Super_admin založí nový administrátorský účet (e-mail + heslo) a přiřadí roli.
 * Musí to být akce — createAccount interně volá ctx.runMutation("auth:store").
 */
export const createUser = action({
  args: {
    email: v.string(),
    password: v.string(),
    role: roleValidator,
    branchId: v.optional(v.id("branches")),
    name: v.optional(v.string()),
  },
  handler: async (ctx, { email, password, role, branchId, name }) => {
    // Ověření, že volající je super_admin (auth identita se propaguje do akce).
    const me = await ctx.runQuery(api.modules.users.queries.me, {});
    if (me?.profile?.role !== "super_admin") {
      throw new Error("Tato akce vyžaduje oprávnění super-admin.");
    }
    if (role === "branch_manager" && !branchId) {
      throw new Error("Lokální admin musí mít přiřazenou pobočku.");
    }
    if (password.length < 8) {
      throw new Error("Heslo musí mít alespoň 8 znaků.");
    }

    let userId;
    try {
      const { user } = await createAccount(ctx, {
        provider: "password",
        account: { id: email, secret: password },
        profile: { email },
      });
      userId = user._id;
    } catch (err) {
      const msg = err instanceof Error ? err.message : String(err);
      if (msg.toLowerCase().includes("already exists")) {
        throw new Error(`Účet s e-mailem ${email} už existuje.`);
      }
      throw new Error(`Účet se nepodařilo vytvořit: ${msg}`);
    }

    await ctx.runMutation(api.modules.users.mutations.setUserRole, {
      userId,
      role,
      branchId,
      name,
    });
    return { userId };
  },
});
