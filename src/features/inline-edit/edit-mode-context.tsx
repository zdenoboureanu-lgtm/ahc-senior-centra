"use client";

import {
  createContext,
  useCallback,
  useContext,
  useMemo,
  useState,
  type ReactNode,
} from "react";
import { useRouter } from "next/navigation";
import { useMutation, useQuery } from "convex/react";
import { toast } from "sonner";
import { api } from "@/convex/_generated/api";
import type { Id } from "@/convex/_generated/dataModel";

/**
 * Režim úprav přímo na veřejném webu.
 *
 * Texty se sbírají do fronty a odesílají až po kliknutí na „Uložit" —
 * klient tak může projít celou stránku a teprve pak změny potvrdit.
 * Fotky se ukládají hned při výběru souboru (jinak by nebylo co ukázat).
 */

/** Kam se hodnota zapíše. */
export type EditTarget =
  | { kind: "field"; table: string; id: string; field: string }
  | { kind: "page"; pageId: string; path: string }
  | { kind: "copy"; branchId: string; key: string };

/** Odkud se má vzít kopie prvku. */
export type DuplicateSource =
  | { kind: "block"; pageId: string; index: number }
  | { kind: "item"; pageId: string; index: number; itemIndex: number }
  | { kind: "row"; table: string; id: string };

/** Co se má smazat. Bloky adresujeme přes `uid`, ne přes pořadí. */
export type RemoveSource =
  | { kind: "block"; pageId: string; uid: string }
  | { kind: "item"; pageId: string; index: number; itemIndex: number }
  | { kind: "row"; table: string; id: string };

export function targetKey(t: EditTarget): string {
  if (t.kind === "field") return `field:${t.table}:${t.id}:${t.field}`;
  if (t.kind === "page") return `page:${t.pageId}:${t.path}`;
  return `copy:${t.branchId}:${t.key}`;
}

interface EditModeValue {
  /** Uživatel má právo tuhle pobočku upravovat. */
  canEdit: boolean;
  /** Režim úprav je právě zapnutý. */
  enabled: boolean;
  setEnabled: (on: boolean) => void;
  /** Zapíše změnu do fronty (neukládá). */
  stage: (target: EditTarget, value: string) => void;
  pendingCount: number;
  saving: boolean;
  save: () => Promise<void>;
  discard: () => void;
  /** Nahraje soubor a rovnou ho zapíše do cílového pole. */
  uploadImage: (target: EditTarget, file: File) => Promise<void>;
  /** Nahradí soubor ke stažení novým dokumentem. */
  uploadFile: (target: EditTarget, file: File) => Promise<void>;
  /** Zruší přepis a vrátí původní fotku z kódu (jen ručně psané stránky). */
  resetImage: (target: EditTarget) => Promise<void>;
  /** Skryje nebo odkryje prvek stránky. */
  toggleHidden: (branchId: string, key: string, hidden: boolean) => Promise<void>;
  /** Vytvoří kopii prvku hned za originálem. */
  duplicateRegion: (source: DuplicateSource) => Promise<void>;
  /** Nevratně smaže prvek — nabízíme jen tam, kde jde o data, ne o kód. */
  removeRegion: (source: RemoveSource) => Promise<void>;
}

const EditModeContext = createContext<EditModeValue | null>(null);

const IDLE: EditModeValue = {
  canEdit: false,
  enabled: false,
  setEnabled: () => {},
  stage: () => {},
  pendingCount: 0,
  saving: false,
  save: async () => {},
  discard: () => {},
  uploadImage: async () => {},
  uploadFile: async () => {},
  resetImage: async () => {},
  toggleHidden: async () => {},
  duplicateRegion: async () => {},
  removeRegion: async () => {},
};

export function useEditMode(): EditModeValue {
  return useContext(EditModeContext) ?? IDLE;
}

/**
 * `active` rozhoduje, jestli se editor vůbec zapojí. Nepřihlášený návštěvník
 * tak nestahuje ani řádek kódu navíc — provider se pro něj chová jako fragment.
 */
export function EditModeProvider({
  active,
  branchId,
  children,
}: {
  active: boolean;
  /** Pobočka, jejíž web se právě zobrazuje (null = globální rozcestník). */
  branchId: string | null;
  children: ReactNode;
}) {
  if (!active) return <>{children}</>;
  return (
    <EditModeRuntime branchId={branchId}>{children}</EditModeRuntime>
  );
}

function EditModeRuntime({
  branchId,
  children,
}: {
  branchId: string | null;
  children: ReactNode;
}) {
  const router = useRouter();
  const me = useQuery(api.modules.users.queries.me, {});
  const setField = useMutation(api.modules.content.mutations.setField);
  const setPageField = useMutation(api.modules.content.mutations.setPageField);
  const setCopy = useMutation(api.modules.content.mutations.setCopy);
  const setHiddenMutation = useMutation(api.modules.content.mutations.setHidden);
  const duplicateBlock = useMutation(
    api.modules.content.mutations.duplicateBlock
  );
  const duplicateRow = useMutation(api.modules.content.mutations.duplicateRow);
  const deleteBlock = useMutation(api.modules.content.mutations.deleteBlock);
  const deleteRow = useMutation(api.modules.content.mutations.deleteRow);
  const duplicateItem = useMutation(
    api.modules.content.mutations.duplicateItem
  );
  const deleteItem = useMutation(api.modules.content.mutations.deleteItem);
  const generateUploadUrl = useMutation(
    api.modules.content.mutations.generateUploadUrl
  );
  const resolveUploadUrl = useMutation(
    api.modules.content.mutations.resolveUploadUrl
  );

  const [enabled, setEnabled] = useState(false);
  const [saving, setSaving] = useState(false);
  const [pending, setPending] = useState<Map<string, { target: EditTarget; value: string }>>(
    new Map()
  );

  const role = me?.profile?.role;
  const canEdit =
    Boolean(branchId) &&
    (role === "super_admin" ||
      (role === "branch_manager" && me?.profile?.branch_id === branchId));

  const stage = useCallback((target: EditTarget, value: string) => {
    setPending((prev) => {
      const next = new Map(prev);
      next.set(targetKey(target), { target, value });
      return next;
    });
  }, []);

  const discard = useCallback(() => {
    setPending(new Map());
    router.refresh();
  }, [router]);

  const write = useCallback(
    async (target: EditTarget, value: string) => {
      if (target.kind === "field") {
        await setField({
          table: target.table,
          id: target.id,
          field: target.field,
          value,
        });
      } else if (target.kind === "page") {
        await setPageField({
          page_id: target.pageId as Id<"branch_pages">,
          path: target.path,
          value,
        });
      } else {
        await setCopy({
          branch_id: target.branchId as Id<"branches">,
          key: target.key,
          value,
        });
      }
    },
    [setField, setPageField, setCopy]
  );

  const save = useCallback(async () => {
    if (pending.size === 0) return;
    setSaving(true);
    try {
      for (const { target, value } of pending.values()) {
        await write(target, value);
      }
      const count = pending.size;
      setPending(new Map());
      router.refresh();
      toast.success(
        count === 1 ? "Změna uložena." : `Uloženo ${count} změn.`
      );
    } catch (error) {
      toast.error(
        error instanceof Error ? error.message : "Uložení se nepovedlo."
      );
    } finally {
      setSaving(false);
    }
  }, [pending, write, router]);

  const uploadTo = useCallback(
    async (target: EditTarget, file: File, done: string, failed: string) => {
      setSaving(true);
      try {
        const uploadUrl = await generateUploadUrl({});
        const res = await fetch(uploadUrl, {
          method: "POST",
          headers: { "Content-Type": file.type },
          body: file,
        });
        if (!res.ok) throw new Error("Nahrání souboru selhalo.");
        const { storageId } = (await res.json()) as { storageId: string };
        const url = await resolveUploadUrl({
          storage_id: storageId as Id<"_storage">,
        });
        await write(target, url);
        router.refresh();
        toast.success(done);
      } catch (error) {
        toast.error(error instanceof Error ? error.message : failed);
      } finally {
        setSaving(false);
      }
    },
    [generateUploadUrl, resolveUploadUrl, write, router]
  );

  const uploadImage = useCallback(
    (target: EditTarget, file: File) =>
      uploadTo(target, file, "Fotka vyměněna.", "Fotku se nepovedlo nahrát."),
    [uploadTo]
  );

  /** Soubor ke stažení (žádost, ceník, domácí řád). */
  const uploadFile = useCallback(
    (target: EditTarget, file: File) =>
      uploadTo(
        target,
        file,
        "Dokument nahrán.",
        "Dokument se nepovedlo nahrát."
      ),
    [uploadTo]
  );

  const resetImage = useCallback(
    async (target: EditTarget) => {
      setSaving(true);
      try {
        await write(target, "");
        router.refresh();
        toast.success("Vrácena původní fotka.");
      } catch (error) {
        toast.error(
          error instanceof Error ? error.message : "Vrácení se nepovedlo."
        );
      } finally {
        setSaving(false);
      }
    },
    [write, router]
  );

  const toggleHidden = useCallback(
    async (branchId: string, key: string, hidden: boolean) => {
      setSaving(true);
      try {
        await setHiddenMutation({
          branch_id: branchId as Id<"branches">,
          key,
          hidden,
        });
        router.refresh();
        toast.success(hidden ? "Prvek skrytý." : "Prvek zobrazený.");
      } catch (error) {
        toast.error(
          error instanceof Error ? error.message : "Změna se nepovedla."
        );
      } finally {
        setSaving(false);
      }
    },
    [setHiddenMutation, router]
  );

  const duplicateRegion = useCallback(
    async (source: DuplicateSource) => {
      setSaving(true);
      try {
        if (source.kind === "block") {
          await duplicateBlock({
            page_id: source.pageId as Id<"branch_pages">,
            index: source.index,
          });
        } else if (source.kind === "item") {
          await duplicateItem({
            page_id: source.pageId as Id<"branch_pages">,
            index: source.index,
            item_index: source.itemIndex,
          });
        } else {
          await duplicateRow({ table: source.table, id: source.id });
        }
        router.refresh();
        toast.success("Kopie vytvořena.");
      } catch (error) {
        toast.error(
          error instanceof Error ? error.message : "Duplikace se nepovedla."
        );
      } finally {
        setSaving(false);
      }
    },
    [duplicateBlock, duplicateItem, duplicateRow, router]
  );

  const removeRegion = useCallback(
    async (source: RemoveSource) => {
      setSaving(true);
      try {
        if (source.kind === "block") {
          await deleteBlock({
            page_id: source.pageId as Id<"branch_pages">,
            uid: source.uid,
          });
        } else if (source.kind === "item") {
          await deleteItem({
            page_id: source.pageId as Id<"branch_pages">,
            index: source.index,
            item_index: source.itemIndex,
          });
        } else {
          await deleteRow({ table: source.table, id: source.id });
        }
        router.refresh();
        toast.success("Prvek smazán.");
      } catch (error) {
        toast.error(
          error instanceof Error ? error.message : "Smazání se nepovedlo."
        );
      } finally {
        setSaving(false);
      }
    },
    [deleteBlock, deleteItem, deleteRow, router]
  );

  const value = useMemo<EditModeValue>(
    () => ({
      canEdit,
      enabled: canEdit && enabled,
      setEnabled,
      stage,
      pendingCount: pending.size,
      saving,
      save,
      discard,
      uploadImage,
      uploadFile,
      resetImage,
      toggleHidden,
      duplicateRegion,
      removeRegion,
    }),
    [
      canEdit,
      enabled,
      stage,
      pending.size,
      saving,
      save,
      discard,
      uploadImage,
      uploadFile,
      resetImage,
      toggleHidden,
      duplicateRegion,
      removeRegion,
    ]
  );

  return (
    <EditModeContext.Provider value={value}>{children}</EditModeContext.Provider>
  );
}
