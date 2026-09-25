import { v } from "convex/values";
import { mutation } from "../../_generated/server";
import * as model from "./model";

export const create = mutation({
  args: {
    branch_id: v.id("branches"),
    type: v.union(
      v.literal("admission"),
      v.literal("contact"),
      v.literal("career")
    ),
    name: v.string(),
    email: v.string(),
    phone: v.optional(v.string()),
    message: v.string(),
    related_position_id: v.optional(v.id("career_positions")),
  },
  handler: async (ctx, args) => model.create(ctx, args),
});
