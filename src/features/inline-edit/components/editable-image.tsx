"use client";

import { useRef } from "react";
import { ImageUp, Loader2, Undo2 } from "lucide-react";
import { useEditMode, type EditTarget } from "../edit-mode-context";

/**
 * Překryv nad fotkou, který v režimu úprav nabídne výměnu souboru.
 * Vkládá se dovnitř existujícího `relative` rámečku, aby se layout nezměnil.
 */
export function EditableImage({
  target,
  label = "Vyměnit fotku",
}: {
  target: EditTarget;
  label?: string;
}) {
  const { enabled, saving, uploadImage, resetImage } = useEditMode();
  // Původní fotku má v kódu jen ručně psaná stránka — jen tam jde vrátit.
  const canReset = target.kind === "copy";
  const inputRef = useRef<HTMLInputElement>(null);

  if (!enabled) return null;

  return (
    <div className="absolute inset-0 z-40 flex items-center justify-center bg-foreground/50 opacity-0 transition-opacity hover:opacity-100 focus-within:opacity-100">
      <button
        type="button"
        disabled={saving}
        onClick={(e) => {
          // Fotka může být uvnitř odkazu — výběr souboru nesmí odnavigovat.
          e.preventDefault();
          e.stopPropagation();
          inputRef.current?.click();
        }}
        className="inline-flex items-center gap-2 rounded-full bg-background px-5 py-2.5 text-sm font-bold text-foreground shadow-lg disabled:opacity-60"
      >
        {saving ? (
          <Loader2 className="h-4 w-4 animate-spin" />
        ) : (
          <ImageUp className="h-4 w-4" />
        )}
        {label}
      </button>
      {canReset ? (
        <button
          type="button"
          disabled={saving}
          onClick={(e) => {
            e.preventDefault();
            e.stopPropagation();
            void resetImage(target);
          }}
          className="ml-2 inline-flex items-center gap-1.5 rounded-full border-2 border-background/70 px-4 py-2.5 text-sm font-bold text-background disabled:opacity-60"
        >
          <Undo2 className="h-4 w-4" />
          Vrátit původní
        </button>
      ) : null}
      <input
        ref={inputRef}
        type="file"
        accept="image/*"
        className="hidden"
        onChange={(e) => {
          const file = e.target.files?.[0];
          e.target.value = "";
          if (file) void uploadImage(target, file);
        }}
      />
    </div>
  );
}
