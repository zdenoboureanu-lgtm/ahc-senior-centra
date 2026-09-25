"use client";

import { useRef } from "react";
import { FileUp, Loader2 } from "lucide-react";
import { useEditMode, type EditTarget } from "../edit-mode-context";

/**
 * Tlačítko pro nahrání souboru ke stažení (žádost, ceník, domácí řád).
 *
 * Vykreslí se jen v režimu úprav, takže návštěvník o něm neví. Nahraný
 * soubor se uloží do úložiště a jeho adresa se zapíše do karty dokumentu —
 * stejně jako se mění fotka.
 */
export function EditableFile({
  target,
  label = "Nahrát nový soubor",
}: {
  target?: EditTarget;
  label?: string;
}) {
  const { enabled, saving, uploadFile } = useEditMode();
  const inputRef = useRef<HTMLInputElement>(null);

  if (!target || !enabled) return null;

  return (
    <div className="relative z-40 mt-3">
      <button
        type="button"
        disabled={saving}
        onClick={(e) => {
          // Karta dokumentu je odkaz — výběr souboru nesmí odnavigovat.
          e.preventDefault();
          e.stopPropagation();
          inputRef.current?.click();
        }}
        className="inline-flex items-center gap-1.5 rounded-full border border-brand/40 bg-background px-3 py-1.5 text-xs font-bold text-brand shadow-sm transition-colors hover:bg-brand hover:text-brand-foreground disabled:opacity-60"
      >
        {saving ? (
          <Loader2 className="h-3.5 w-3.5 animate-spin" />
        ) : (
          <FileUp className="h-3.5 w-3.5" />
        )}
        {label}
      </button>
      <input
        ref={inputRef}
        type="file"
        accept=".pdf,.doc,.docx,.xls,.xlsx,.odt,.ods,.rtf,.txt,image/*,application/pdf"
        className="hidden"
        onChange={(e) => {
          const file = e.target.files?.[0];
          e.target.value = "";
          if (file) void uploadFile(target, file);
        }}
      />
    </div>
  );
}
