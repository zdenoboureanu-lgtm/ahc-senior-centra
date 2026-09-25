import { fetchQuery } from "convex/nextjs";
import { isAuthenticatedNextjs } from "@convex-dev/auth/nextjs/server";
import { api } from "@/convex/_generated/api";
import { getBranchSlugFromHeaders } from "@/common/lib/branch";
import { SiteHeader } from "@/features/site/components/site-header";
import { SiteFooter } from "@/features/site/components/site-footer";
import { EditModeProvider } from "@/features/inline-edit/edit-mode-context";
import { EditBar } from "@/features/inline-edit/components/edit-bar";

export default async function PublicLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const slug = await getBranchSlugFromHeaders();
  const [branch, authed] = await Promise.all([
    slug
      ? fetchQuery(api.modules.branches.queries.getBySlug, { slug }).catch(
          () => null
        )
      : Promise.resolve(null),
    isAuthenticatedNextjs(),
  ]);

  return (
    <EditModeProvider active={authed} branchId={branch?._id ?? null}>
      <SiteHeader branch={branch} />
      <main className="flex-1">{children}</main>
      <SiteFooter branch={branch} />
      <EditBar />
    </EditModeProvider>
  );
}
