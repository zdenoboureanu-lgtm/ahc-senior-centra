import { isAuthenticatedNextjs } from "@convex-dev/auth/nextjs/server";

/**
 * Má se stránka vykreslit s inline editorem?
 *
 * Rozhodujeme se na serveru schválně: nepřihlášený návštěvník tak dostane
 * úplně stejné HTML jako dřív, bez jediné klientské komponenty navíc.
 * Skutečné oprávnění k dané pobočce hlídají mutace v Convexu.
 */
export async function canEditContent(): Promise<boolean> {
  return await isAuthenticatedNextjs();
}
