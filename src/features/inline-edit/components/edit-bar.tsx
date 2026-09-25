"use client";

import Link from "next/link";
import { Check, Loader2, Pencil, Settings, X } from "lucide-react";
import { useEditMode } from "../edit-mode-context";

/** České skloňování počtu změn — „1 změna", „3 změny", „5 změn". */
function pendingLabel(count: number): string {
  if (count === 1) return "1 neuložená změna";
  if (count >= 2 && count <= 4) return `${count} neuložené změny`;
  return `${count} neuložených změn`;
}

/**
 * Plovoucí lišta editoru. Vidí ji jen přihlášený správce dané pobočky.
 * Zapíná režim úprav, ukazuje počet nepotvrzených změn a ukládá je.
 */
export function EditBar() {
  const { canEdit, enabled, setEnabled, pendingCount, saving, save, discard } =
    useEditMode();

  if (!canEdit) return null;

  return (
    <div className="fixed inset-x-0 bottom-5 z-[60] flex justify-center px-4 print:hidden">
      <div className="flex items-center gap-2 rounded-full border border-border bg-background/95 p-2 pl-4 shadow-xl backdrop-blur-xl">
        {enabled ? (
          <>
            <span className="text-sm font-semibold text-foreground">
              {pendingCount === 0
                ? "Klikni do textu a přepiš ho"
                : pendingLabel(pendingCount)}
            </span>
            <button
              type="button"
              onClick={() => void save()}
              disabled={saving || pendingCount === 0}
              className="inline-flex items-center gap-1.5 rounded-full bg-brand px-4 py-2 text-sm font-bold text-brand-foreground transition-colors hover:bg-brand-dark disabled:opacity-50"
            >
              {saving ? (
                <Loader2 className="h-4 w-4 animate-spin" />
              ) : (
                <Check className="h-4 w-4" />
              )}
              Uložit
            </button>
            <button
              type="button"
              onClick={() => {
                discard();
                setEnabled(false);
              }}
              disabled={saving}
              className="inline-flex items-center gap-1.5 rounded-full border border-border px-4 py-2 text-sm font-semibold text-foreground transition-colors hover:border-brand hover:text-brand disabled:opacity-50"
            >
              <X className="h-4 w-4" />
              Zavřít
            </button>
          </>
        ) : (
          <>
            <span className="text-sm font-semibold text-muted-foreground">
              Režim správce
            </span>
            <button
              type="button"
              onClick={() => setEnabled(true)}
              className="inline-flex items-center gap-1.5 rounded-full bg-brand px-4 py-2 text-sm font-bold text-brand-foreground transition-colors hover:bg-brand-dark"
            >
              <Pencil className="h-4 w-4" />
              Upravit obsah
            </button>
            <Link
              href="/admin"
              className="inline-flex items-center gap-1.5 rounded-full border border-border px-4 py-2 text-sm font-semibold text-foreground transition-colors hover:border-brand hover:text-brand"
            >
              <Settings className="h-4 w-4" />
              Administrace
            </Link>
          </>
        )}
      </div>
    </div>
  );
}
