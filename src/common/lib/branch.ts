import { headers } from "next/headers";

export async function getBranchSlugFromHeaders(): Promise<string | null> {
  const h = await headers();
  return h.get("x-ahc-branch");
}
