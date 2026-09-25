import type { MutationCtx } from "../../_generated/server";
import type { Id } from "../../_generated/dataModel";

export interface CreateInquiryParams {
  branch_id: Id<"branches">;
  type: "admission" | "contact" | "career";
  name: string;
  email: string;
  phone?: string;
  message: string;
  related_position_id?: Id<"career_positions">;
}

export async function create(ctx: MutationCtx, params: CreateInquiryParams) {
  const now = Date.now();
  return await ctx.db.insert("inquiries", {
    ...params,
    is_resolved: false,
    created_at: now,
    updated_at: now,
  });
}
