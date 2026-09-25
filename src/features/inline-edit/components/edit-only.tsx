"use client";

import { useEditMode } from "../edit-mode-context";

/**
 * Obsah jen pro zapnutý režim úprav.
 *
 * Používá se tam, kde se text na webu vykresluje rozebraný (telefony a
 * e-maily jako odkazy), ale upravovat se musí jako jeden řádek. Návštěvník
 * ani přihlášený správce s vypnutým režimem nic navíc nevidí.
 */
export function EditOnly({ children }: { children: React.ReactNode }) {
  const { enabled } = useEditMode();
  if (!enabled) return null;
  return <>{children}</>;
}
