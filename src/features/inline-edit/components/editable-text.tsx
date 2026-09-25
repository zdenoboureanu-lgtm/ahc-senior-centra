"use client";

import { useMemo, type ElementType } from "react";
import { useEditMode, type EditTarget } from "../edit-mode-context";

/** Značky, do kterých se text na webu vypisuje. */
export type TextTag =
  | "span"
  | "p"
  | "div"
  | "li"
  | "h1"
  | "h2"
  | "h3"
  | "h4"
  | "blockquote"
  | "figcaption"
  | "strong";

function escapeHtml(value: string): string {
  return value
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;");
}

/**
 * Text, který jde v režimu úprav přepsat přímo na stránce.
 *
 * Mimo režim úprav se vykreslí úplně stejně jako obyčejný text — veřejný web
 * se tím nemění. Obsah držíme jako čistý text: Enter i formátované vložení
 * blokujeme, ať se do databáze nedostane HTML.
 */
export function EditableText({
  target,
  value,
  as = "span",
  className,
}: {
  target: EditTarget;
  value: string;
  as?: TextTag;
  className?: string;
}) {
  const { enabled, stage } = useEditMode();
  const Tag = as as ElementType;
  // Obsah nastavujeme jen při změně hodnoty ze serveru — jinak by React
  // při každém překreslení přepsal to, co uživatel právě píše.
  const html = useMemo(() => ({ __html: escapeHtml(value) }), [value]);

  if (!enabled) return <Tag className={className}>{value}</Tag>;

  return (
    <Tag
      className={`${className ?? ""} ahc-editable`}
      contentEditable
      suppressContentEditableWarning
      spellCheck
      role="textbox"
      tabIndex={0}
      onInput={(e: React.FormEvent<HTMLElement>) =>
        stage(target, e.currentTarget.textContent ?? "")
      }
      onKeyDown={(e: React.KeyboardEvent<HTMLElement>) => {
        if (e.key === "Enter") e.preventDefault();
      }}
      onClick={(e: React.MouseEvent<HTMLElement>) => {
        // Editovatelný text bývá uvnitř odkazu (kachlice služeb) — klik má
        // v režimu úprav nastavit kurzor, ne odskočit na jinou stránku.
        e.preventDefault();
        e.stopPropagation();
      }}
      onPaste={(e: React.ClipboardEvent<HTMLElement>) => {
        e.preventDefault();
        const text = e.clipboardData
          .getData("text/plain")
          .replace(/\s+/g, " ")
          .trim();
        const selection = window.getSelection();
        if (!selection?.rangeCount) return;
        const range = selection.getRangeAt(0);
        range.deleteContents();
        range.insertNode(document.createTextNode(text));
        selection.collapseToEnd();
        stage(target, e.currentTarget.textContent ?? "");
      }}
      dangerouslySetInnerHTML={html}
    />
  );
}
