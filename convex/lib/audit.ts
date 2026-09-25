import type { Id } from "../_generated/dataModel";
import type { MutationCtx } from "../_generated/server";

interface AuditParams {
  user_id: Id<"users">;
  action: string;
  entity_type: string;
  entity_id: string;
  branch_id?: Id<"branches">;
  before?: unknown;
  after?: unknown;
}

export async function createAuditLog(ctx: MutationCtx, params: AuditParams) {
  await ctx.db.insert("audit_logs", {
    user_id: params.user_id,
    action: params.action,
    entity_type: params.entity_type,
    entity_id: params.entity_id,
    branch_id: params.branch_id,
    before:
      params.before !== undefined ? JSON.stringify(params.before) : undefined,
    after: params.after !== undefined ? JSON.stringify(params.after) : undefined,
    created_at: Date.now(),
  });
}
