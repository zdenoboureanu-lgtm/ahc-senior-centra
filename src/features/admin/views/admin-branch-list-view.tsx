"use client";

import Link from "next/link";
import { useState } from "react";
import { useMutation, useQuery } from "convex/react";
import {
  Building2,
  Copy,
  ExternalLink,
  Eye,
  EyeOff,
  MapPin,
  Pencil,
  Trash2,
} from "lucide-react";
import { toast } from "sonner";
import { api } from "@/convex/_generated/api";
import type { Id } from "@/convex/_generated/dataModel";
import { cn } from "@/lib/utils";
import { DuplicateBranchDialog } from "../components/duplicate-branch-dialog";

export function AdminBranchListView() {
  const me = useQuery(api.modules.users.queries.me);
  const isSuperAdmin = me?.profile?.role === "super_admin";

  // Super_admin vidí všechny; branch_manager jen svou (z me.branch).
  const allBranches = useQuery(
    api.modules.branches.queries.listAllForAdmin,
    isSuperAdmin ? {} : "skip"
  );

  const toggle = useMutation(api.modules.branches.mutations.togglePublished);
  const remove = useMutation(api.modules.branches.mutations.remove);
  const [busyId, setBusyId] = useState<string | null>(null);
  // Pobočka, ze které se právě dělá kopie (null = dialog zavřený).
  const [duplicating, setDuplicating] = useState<{
    _id: Id<"branches">;
    name: string;
    short_name: string;
    slug: string;
  } | null>(null);

  if (me === undefined) {
    return <div className="p-8 text-sm text-muted-foreground">Načítám…</div>;
  }
  if (!me?.profile) {
    return (
      <div className="p-8 text-sm text-muted-foreground">
        Účet nemá přiřazenou roli. Vraťte se na{" "}
        <Link href="/admin" className="text-brand underline">
          přehled
        </Link>
        .
      </div>
    );
  }

  // Seznam k zobrazení
  const branches = isSuperAdmin
    ? allBranches
    : me.branch
      ? [me.branch]
      : [];

  async function handleToggle(id: Id<"branches">) {
    setBusyId(id);
    try {
      const next = await toggle({ id });
      toast.success(next ? "Pobočka publikována." : "Pobočka skryta.");
    } catch (err) {
      toast.error(err instanceof Error ? err.message : "Chyba.");
    } finally {
      setBusyId(null);
    }
  }

  async function handleDelete(id: Id<"branches">, name: string) {
    if (
      !confirm(
        `Opravdu smazat pobočku „${name}"? Smaže se i všechen její obsah — podstránky, služby, fotky, dokumenty, novinky i inzeráty kariéry. Akce je nevratná.`
      )
    )
      return;
    setBusyId(id);
    try {
      await remove({ id });
      toast.success("Pobočka smazána.");
    } catch (err) {
      toast.error(err instanceof Error ? err.message : "Chyba.");
    } finally {
      setBusyId(null);
    }
  }

  return (
    <div className="mx-auto max-w-5xl px-6 py-12 lg:px-10 lg:py-16">
      <div className="flex flex-col gap-4 sm:flex-row sm:items-end sm:justify-between">
        <div>
          <div className="text-[11px] font-bold uppercase tracking-[0.22em] text-warm-dark">
            Síť AHC
          </div>
          <h1 className="font-display mt-2 text-3xl text-foreground sm:text-4xl">
            Pobočky
            {isSuperAdmin && branches ? (
              <span className="ml-3 align-middle text-xl font-semibold text-brand">
                ({branches.length})
              </span>
            ) : null}
          </h1>
          <p className="mt-2 text-sm text-muted-foreground">
            {isSuperAdmin
              ? `Centrální správa všech poboček. Celkem ${branches?.length ?? 0} ${
                  branches?.length === 1
                    ? "pobočka"
                    : (branches?.length ?? 0) >= 2 && (branches?.length ?? 0) <= 4
                      ? "pobočky"
                      : "poboček"
                } v síti.`
              : "Správa údajů a kontaktů vaší pobočky."}
          </p>
        </div>
      </div>

      <div className="mt-10">
        {branches === undefined ? (
          <div className="text-sm text-muted-foreground">Načítám pobočky…</div>
        ) : branches.length === 0 ? (
          <div className="rounded-3xl border border-dashed border-border bg-card p-10 text-center">
            <Building2
              className="mx-auto h-7 w-7 text-muted-foreground"
              strokeWidth={1.5}
            />
            <h2 className="font-display mt-4 text-xl text-foreground">
              Zatím žádné pobočky
            </h2>
            <p className="mt-2 text-sm text-muted-foreground">
              {isSuperAdmin
                ? "Vytvořte první pobočku kliknutím na „Nová pobočka”."
                : "K vašemu účtu zatím není přiřazena žádná pobočka."}
            </p>
          </div>
        ) : (
          <ul className="space-y-3">
            {branches.map((b) => (
              <li
                key={b._id}
                className="flex flex-col gap-4 rounded-2xl border border-border bg-card p-5 transition-shadow hover:shadow-md sm:flex-row sm:items-center sm:justify-between"
              >
                <div className="min-w-0 flex-1">
                  <div className="flex flex-wrap items-center gap-2">
                    <h3 className="font-display text-lg text-foreground">
                      {b.name}
                    </h3>
                    <span
                      className={cn(
                        "inline-flex items-center gap-1.5 rounded-full px-2.5 py-0.5 text-[10px] font-bold uppercase tracking-wider",
                        b.is_published
                          ? "bg-emerald-500/10 text-emerald-700"
                          : "bg-warm/15 text-warm-dark"
                      )}
                    >
                      <span
                        className={cn(
                          "h-1.5 w-1.5 rounded-full",
                          b.is_published ? "bg-emerald-500" : "bg-warm-dark"
                        )}
                      />
                      {b.is_published ? "Publikováno" : "Skryto"}
                    </span>
                  </div>
                  <div className="mt-1 flex flex-wrap items-center gap-x-3 gap-y-1 text-xs text-muted-foreground">
                    <span className="inline-flex items-center gap-1">
                      <MapPin className="h-3 w-3" strokeWidth={2} />
                      {b.city}, {b.region}
                    </span>
                    <span>·</span>
                    <span className="font-mono">{b.slug}.ahc.cz</span>
                    {b.bed_count ? (
                      <>
                        <span>·</span>
                        <span>{b.bed_count} lůžek</span>
                      </>
                    ) : null}
                  </div>
                </div>

                <div className="flex flex-wrap items-center gap-2">
                  {isSuperAdmin ? (
                    <button
                      type="button"
                      onClick={() => handleToggle(b._id)}
                      disabled={busyId === b._id}
                      className="inline-flex items-center gap-1.5 rounded-full border border-border px-3 py-1.5 text-xs font-semibold text-foreground hover:border-brand hover:text-brand disabled:opacity-50"
                    >
                      {b.is_published ? (
                        <>
                          <EyeOff className="h-3.5 w-3.5" strokeWidth={2} />
                          Skrýt
                        </>
                      ) : (
                        <>
                          <Eye className="h-3.5 w-3.5" strokeWidth={2} />
                          Publikovat
                        </>
                      )}
                    </button>
                  ) : null}
                  <a
                    href={`/?branch=${b.slug}`}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="inline-flex items-center gap-1.5 rounded-full border border-border px-3 py-1.5 text-xs font-semibold text-foreground hover:border-brand hover:text-brand"
                  >
                    <ExternalLink className="h-3.5 w-3.5" strokeWidth={2} />
                    Zobrazit
                  </a>
                  <Link
                    href={`/admin/pobocky/${b._id}`}
                    className="inline-flex items-center gap-1.5 rounded-full bg-brand-light px-3 py-1.5 text-xs font-semibold text-brand hover:bg-brand hover:text-brand-foreground"
                  >
                    <Pencil className="h-3.5 w-3.5" strokeWidth={2} />
                    Upravit
                  </Link>
                  {isSuperAdmin ? (
                    <button
                      type="button"
                      onClick={() =>
                        setDuplicating({
                          _id: b._id,
                          name: b.name,
                          short_name: b.short_name,
                          slug: b.slug,
                        })
                      }
                      className="inline-flex items-center gap-1.5 rounded-full border border-border px-3 py-1.5 text-xs font-semibold text-foreground hover:border-brand hover:text-brand"
                    >
                      <Copy className="h-3.5 w-3.5" strokeWidth={2} />
                      Duplikovat
                    </button>
                  ) : null}
                  {isSuperAdmin ? (
                    <button
                      type="button"
                      onClick={() => handleDelete(b._id, b.name)}
                      disabled={busyId === b._id}
                      className="inline-flex items-center gap-1.5 rounded-full border border-border px-3 py-1.5 text-xs font-semibold text-destructive hover:border-destructive disabled:opacity-50"
                    >
                      <Trash2 className="h-3.5 w-3.5" strokeWidth={2} />
                      Smazat
                    </button>
                  ) : null}
                </div>
              </li>
            ))}
          </ul>
        )}
      </div>

      {duplicating ? (
        <DuplicateBranchDialog
          source={duplicating}
          open
          onOpenChange={(open) => {
            if (!open) setDuplicating(null);
          }}
        />
      ) : null}
    </div>
  );
}
