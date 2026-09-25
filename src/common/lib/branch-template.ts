/**
 * Vizuální šablona pobočky.
 *
 * Ručně psané stránky (Sedlec-Prčice) se dřív vybíraly podle slugu, takže
 * duplikát pobočky spadl na generický vzhled. Šablona proto žije na pobočce
 * — kopie ji zdědí a vypadá stejně jako originál.
 */
export const SEDLEC_TEMPLATE = "sedlec";

/** Pobočky založené dřív, než šablona existovala jako pole. */
const LEGACY_TEMPLATE: Record<string, string> = {
  "sedlec-prcice": SEDLEC_TEMPLATE,
};

export function templateOf(
  branch: { slug: string; template?: string | null } | null | undefined
): string | undefined {
  if (!branch) return undefined;
  return branch.template ?? LEGACY_TEMPLATE[branch.slug];
}
