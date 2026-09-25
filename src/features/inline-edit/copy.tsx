import type { ReactElement } from "react";
import { ImageSlot, TextSlot } from "./components/content-slot";
import type {
  DuplicateSource,
  EditTarget,
  RemoveSource,
} from "./edit-mode-context";
import type { RegionEdit } from "./components/editable-region";
import type { TextTag } from "./components/editable-text";

/**
 * Přepisy textů a fotek pro ručně psané stránky (Sedlec-Prčice).
 *
 * Obsah těch stránek je napsaný přímo v JSX. Aby si ho klient mohl upravovat
 * bez přepisování celého webu do databáze, drží databáze jen přepsané kousky
 * pod klíčem; co v ní není, se vezme z kódu. Stránka tak vypadá pořád stejně
 * a mění se až tím, co klient v editoru opravdu přepíše.
 */
export type CopyMap = Record<string, string>;

export interface CopyProps {
  /** Přepsané texty a fotky z databáze. */
  copy?: CopyMap;
  /** ID pobočky — vyplněné jen pro přihlášeného správce, zapíná editaci. */
  editBranchId?: string;
}

export interface CopyHelpers {
  /** Text jako element; v režimu úprav přepisovatelný. */
  t: (
    key: string,
    fallback: string,
    options?: { as?: TextTag; className?: string }
  ) => ReactElement;
  /** Holá hodnota — pro alt, aria-label a další místa, kde element nejde použít. */
  s: (key: string, fallback: string) => string;
  /** Překryv pro výměnu fotky. Patří dovnitř `relative` rámečku obrázku. */
  img: (key: string) => ReactElement | null;
  /** Holý cíl editace — pro komponenty, které si text vykreslují samy. */
  target: (key: string) => EditTarget | undefined;
  /** Je prvek skrytý? */
  hidden: (key: string) => boolean;
  /** Props pro `RegionSlot` — skrývání a volitelně duplikace prvku. */
  region: (
    key: string,
    duplicate?: DuplicateSource,
    remove?: RemoveSource
  ) => { edit?: RegionEdit; hidden: boolean };
}

export function makeCopy({ copy = {}, editBranchId }: CopyProps): CopyHelpers {
  const target = (key: string) =>
    editBranchId
      ? ({ kind: "copy", branchId: editBranchId, key } as const)
      : undefined;

  return {
    t: (key, fallback, options) => (
      <TextSlot
        target={target(key)}
        value={copy[key] ?? fallback}
        as={options?.as}
        className={options?.className}
      />
    ),
    s: (key, fallback) => copy[key] ?? fallback,
    img: (key) => <ImageSlot target={target(key)} />,
    target,
    hidden: (key) => copy[`hidden:${key}`] === "1",
    region: (key, duplicate, remove) => ({
      edit: editBranchId
        ? { branchId: editBranchId, key, duplicate, remove }
        : undefined,
      hidden: copy[`hidden:${key}`] === "1",
    }),
  };
}
