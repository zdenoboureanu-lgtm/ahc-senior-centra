"use client";

import { Copy, Eye, EyeOff, Loader2, Trash2 } from "lucide-react";
import { cn } from "@/lib/utils";
import {
  useEditMode,
  type DuplicateSource,
  type RemoveSource,
} from "../edit-mode-context";

export interface RegionEdit {
  branchId: string;
  /** Klíč viditelnosti — musí být v rámci pobočky jedinečný a stabilní. */
  key: string;
  /** Bez zdroje se prvek jen skrývá (ručně psané sekce nejde množit). */
  duplicate?: DuplicateSource;
  /** Mazání nabízíme jen tam, kde prvek žije v datech. */
  remove?: RemoveSource;
  /**
   * Skrývání se ukládá pod klíč. Položky uvnitř bloku se adresují pořadím,
   * a to se po vložení kopie posune — tam proto nabízíme jen kopii a mazání.
   */
  canHide?: boolean;
}

/**
 * Obal prvku, který jde v režimu úprav skrýt, zduplikovat nebo smazat.
 *
 * Mimo režim úprav se chová jako obyčejný fragment — skrytý prvek se prostě
 * nevykreslí, takže návštěvník dostane stejné HTML jako bez editoru.
 */
export function EditableRegion({
  edit,
  hidden,
  className,
  children,
}: {
  edit: RegionEdit;
  hidden: boolean;
  className?: string;
  children: React.ReactNode;
}) {
  const { enabled, saving, toggleHidden, duplicateRegion, removeRegion } =
    useEditMode();

  if (!enabled) return hidden ? null : <>{children}</>;

  const stop = (e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();
  };

  return (
    <div
      className={cn(
        "group/region relative",
        hidden &&
          "opacity-40 outline-2 outline-dashed outline-offset-4 outline-warm",
        className
      )}
    >
      {children}
      {/* Lišta sedí nad rohem prvku, ne na jeho textu. */}
      <div
        className={cn(
          "absolute -right-2 -top-3 z-40 flex gap-0.5 rounded-full border border-border bg-background p-1 shadow-lg transition-opacity",
          hidden
            ? "opacity-100"
            : "opacity-0 focus-within:opacity-100 group-hover/region:opacity-100"
        )}
      >
        {edit.canHide === false ? null : (
        <button
          type="button"
          disabled={saving}
          title={hidden ? "Zobrazit prvek" : "Skrýt prvek"}
          onClick={(e) => {
            stop(e);
            void toggleHidden(edit.branchId, edit.key, !hidden);
          }}
          className="inline-flex h-7 w-7 items-center justify-center rounded-full text-foreground hover:bg-secondary disabled:opacity-50"
        >
          {saving ? (
            <Loader2 className="h-3.5 w-3.5 animate-spin" />
          ) : hidden ? (
            <Eye className="h-3.5 w-3.5" />
          ) : (
            <EyeOff className="h-3.5 w-3.5" />
          )}
        </button>
        )}
        {edit.duplicate ? (
          <button
            type="button"
            disabled={saving}
            title="Vytvořit kopii"
            onClick={(e) => {
              stop(e);
              if (edit.duplicate) void duplicateRegion(edit.duplicate);
            }}
            className="inline-flex h-7 w-7 items-center justify-center rounded-full text-foreground hover:bg-secondary disabled:opacity-50"
          >
            <Copy className="h-3.5 w-3.5" />
          </button>
        ) : null}
        {edit.remove ? (
          <button
            type="button"
            disabled={saving}
            title="Smazat prvek"
            onClick={(e) => {
              stop(e);
              if (!edit.remove) return;
              if (!confirm("Opravdu smazat tenhle prvek? Akce je nevratná.")) return;
              void removeRegion(edit.remove);
            }}
            className="inline-flex h-7 w-7 items-center justify-center rounded-full text-destructive hover:bg-destructive/10 disabled:opacity-50"
          >
            <Trash2 className="h-3.5 w-3.5" />
          </button>
        ) : null}
      </div>
    </div>
  );
}
