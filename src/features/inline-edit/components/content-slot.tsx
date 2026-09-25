import type { ElementType } from "react";
import { EditableText, type TextTag } from "./editable-text";
import { EditableImage } from "./editable-image";
import { EditableRegion, type RegionEdit } from "./editable-region";
import type { EditTarget } from "../edit-mode-context";

/**
 * Text, který se pro návštěvníka vykreslí jako obyčejná značka a pro
 * přihlášeného správce jako přepisovatelné pole.
 *
 * Bez `target` se klientská komponenta vůbec nenačte — veřejný web tak zůstává
 * čistě serverový. Volající proto `target` předává jen tehdy, když má
 * přihlášený uživatel právo obsah měnit.
 */
export function TextSlot({
  target,
  value,
  as = "span",
  className,
}: {
  target?: EditTarget;
  value: string;
  as?: TextTag;
  className?: string;
}) {
  if (!target) {
    const Tag = as as ElementType;
    return <Tag className={className}>{value}</Tag>;
  }
  return (
    <EditableText target={target} value={value} as={as} className={className} />
  );
}

/** Překryv pro výměnu fotky. Bez `target` se nevykreslí nic. */
export function ImageSlot({
  target,
  label,
}: {
  target?: EditTarget;
  label?: string;
}) {
  if (!target) return null;
  return <EditableImage target={target} label={label} />;
}

/**
 * Prvek, který jde v režimu úprav skrýt (a podle zdroje i zduplikovat).
 * Bez `edit` se skrytý prvek jen nevykreslí — návštěvník o editoru neví.
 */
export function RegionSlot({
  edit,
  hidden = false,
  className,
  children,
}: {
  edit?: RegionEdit;
  hidden?: boolean;
  className?: string;
  children: React.ReactNode;
}) {
  if (!edit) return hidden ? null : <>{children}</>;
  return (
    <EditableRegion edit={edit} hidden={hidden} className={className}>
      {children}
    </EditableRegion>
  );
}
