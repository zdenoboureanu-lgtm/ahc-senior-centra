import { fetchQuery } from "convex/nextjs";
import { api } from "@/convex/_generated/api";
import { canEditContent } from "@/common/lib/can-edit";
import { templateOf } from "@/common/lib/branch-template";
import type { CopyProps } from "./copy";

export interface BranchPageContext extends CopyProps {
  /** Vizuální šablona pobočky — řídí, jestli se vykreslí ručně psané stránky. */
  template?: string;
}

/**
 * Společný kontext podstránky pobočky: která šablona, přepsané texty a jestli
 * je přihlášený správce. `editBranchId` vyplníme jen jemu — návštěvník tak
 * dostane čistě serverové HTML bez editoru.
 */
export async function loadBranchPageContext(
  slug: string
): Promise<BranchPageContext> {
  const [copy, branch, canEdit] = await Promise.all([
    fetchQuery(api.modules.content.queries.getCopy, { slug }).catch(
      () => ({}) as Record<string, string>
    ),
    fetchQuery(api.modules.branches.queries.getBySlug, { slug }).catch(
      () => null
    ),
    canEditContent(),
  ]);
  return {
    copy,
    template: templateOf(branch),
    editBranchId: canEdit && branch ? branch._id : undefined,
  };
}
