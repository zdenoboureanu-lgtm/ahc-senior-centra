"use client";

import Link from "next/link";
import { useState } from "react";
import { useMutation, useQuery } from "convex/react";
import {
  ArrowRight,
  Briefcase,
  Eye,
  EyeOff,
  Pencil,
  Plus,
  Trash2,
} from "lucide-react";
import { toast } from "sonner";
import { api } from "@/convex/_generated/api";
import type { Id } from "@/convex/_generated/dataModel";
import { cn } from "@/lib/utils";

const TYPE_LABELS = {
  full_time: "Plný úvazek",
  part_time: "Částečný úvazek",
  contract: "Dohoda",
  internship: "Stáž",
} as const;

export function AdminCareerListView() {
  const me = useQuery(api.modules.users.queries.me);
  const isSuperAdmin = me?.profile?.role === "super_admin";

  // Super_admin si pobočku volí (nebo "all" = všechny); branch_manager má svou.
  const allBranches = useQuery(
    api.modules.branches.queries.listAllForAdmin,
    isSuperAdmin ? {} : "skip"
  );
  // Default pro super_admina = "all" (všechny pobočky).
  const [selected, setSelected] = useState<Id<"branches"> | "all">("all");
  const showAll = isSuperAdmin && selected === "all";

  const ownBranchId = me?.branch?._id ?? me?.profile?.branch_id ?? null;
  const branchId: Id<"branches"> | null = isSuperAdmin
    ? selected === "all"
      ? null
      : selected
    : ownBranchId;

  const positionsForBranch = useQuery(
    api.modules.careers.queries.listForBranchAdmin,
    branchId ? { branchId } : "skip"
  );
  const positionsAll = useQuery(
    api.modules.careers.queries.listAllForAdmin,
    showAll ? {} : "skip"
  );
  const positions = showAll ? positionsAll : positionsForBranch;

  const toggle = useMutation(api.modules.careers.mutations.togglePublished);
  const remove = useMutation(api.modules.careers.mutations.remove);

  const [busyId, setBusyId] = useState<string | null>(null);

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

  if (!branchId && !isSuperAdmin) {
    return (
      <div className="p-8 text-sm text-muted-foreground">
        Účet nemá přiřazenou pobočku.
      </div>
    );
  }

  const activeBranch =
    allBranches?.find((b) => b._id === branchId) ?? me.branch ?? null;

  async function handleToggle(id: Id<"career_positions">) {
    setBusyId(id);
    try {
      await toggle({ id });
      toast.success("Stav publikace změněn.");
    } catch (err) {
      toast.error(err instanceof Error ? err.message : "Chyba.");
    } finally {
      setBusyId(null);
    }
  }

  async function handleDelete(id: Id<"career_positions">, title: string) {
    if (!confirm(`Opravdu smazat pozici „${title}"? Akce je nevratná.`)) return;
    setBusyId(id);
    try {
      await remove({ id });
      toast.success("Pozice smazána.");
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
            Kariéra · {showAll ? "Všechny pobočky" : (activeBranch?.short_name ?? "")}
          </div>
          <h1 className="font-display mt-2 text-3xl text-foreground sm:text-4xl">
            Otevřené pozice
          </h1>
          <p className="mt-2 text-sm text-muted-foreground">
            {isSuperAdmin
              ? "Vyberte pobočku a spravujte její inzeráty napříč celou sítí."
              : "Spravujte inzeráty vaší pobočky. Publikované pozice se zobrazují na veřejném webu i v globální nabídce."}
          </p>
        </div>
        <div className="flex flex-col items-stretch gap-3 sm:flex-row sm:items-end">
          {isSuperAdmin && allBranches && allBranches.length > 0 ? (
            <select
              value={selected}
              onChange={(e) =>
                setSelected(
                  e.target.value === "all"
                    ? "all"
                    : (e.target.value as Id<"branches">)
                )
              }
              className="rounded-full border border-border bg-card px-4 py-2.5 text-sm font-semibold text-foreground focus:border-brand focus:outline-none focus:ring-2 focus:ring-brand/20"
            >
              <option value="all">Všechny pobočky</option>
              {allBranches.map((b) => (
                <option key={b._id} value={b._id}>
                  {b.short_name}
                </option>
              ))}
            </select>
          ) : null}
          <Link
            href={
              branchId
                ? `/admin/kariera/nova?branchId=${branchId}`
                : "/admin/kariera/nova"
            }
            className="group inline-flex items-center justify-center gap-2 rounded-full bg-brand px-6 py-3 text-sm font-semibold text-brand-foreground shadow-md shadow-brand/15 transition-all hover:bg-brand-dark hover:shadow-lg"
          >
            <Plus className="h-4 w-4" strokeWidth={2.25} />
            Nová pozice
          </Link>
        </div>
      </div>

      <div className="mt-10">
        {positions === undefined ? (
          <div className="text-sm text-muted-foreground">Načítám pozice…</div>
        ) : positions.length === 0 ? (
          <div className="rounded-3xl border border-dashed border-border bg-card p-10 text-center">
            <Briefcase className="mx-auto h-7 w-7 text-muted-foreground" strokeWidth={1.5} />
            <h2 className="font-display mt-4 text-xl text-foreground">
              Zatím žádné pozice
            </h2>
            <p className="mt-2 text-sm text-muted-foreground">
              Vytvořte první inzerát kliknutím na „Nová pozice".
            </p>
          </div>
        ) : (
          <ul className="space-y-3">
            {positions.map((p) => (
              <li
                key={p._id}
                className="flex flex-col gap-4 rounded-2xl border border-border bg-card p-5 transition-shadow hover:shadow-md sm:flex-row sm:items-center sm:justify-between"
              >
                <div className="min-w-0 flex-1">
                  <div className="flex items-center gap-2">
                    <h3 className="font-display text-lg text-foreground">
                      {p.title}
                    </h3>
                    <span
                      className={cn(
                        "inline-flex items-center gap-1.5 rounded-full px-2.5 py-0.5 text-[10px] font-bold uppercase tracking-wider",
                        p.is_published
                          ? "bg-emerald-500/10 text-emerald-700"
                          : "bg-warm/15 text-warm-dark"
                      )}
                    >
                      <span
                        className={cn(
                          "h-1.5 w-1.5 rounded-full",
                          p.is_published ? "bg-emerald-500" : "bg-warm-dark"
                        )}
                      />
                      {p.is_published ? "Publikováno" : "Koncept"}
                    </span>
                    {showAll && "branchName" in p ? (
                      <span className="rounded-full bg-brand-light px-2.5 py-0.5 text-[10px] font-bold uppercase tracking-wider text-brand">
                        {(p as { branchName?: string }).branchName}
                      </span>
                    ) : null}
                  </div>
                  <div className="mt-1 flex flex-wrap items-center gap-x-3 gap-y-1 text-xs text-muted-foreground">
                    <span>{TYPE_LABELS[p.employment_type]}</span>
                    {p.salary_from ? (
                      <>
                        <span>·</span>
                        <span>
                          od {p.salary_from.toLocaleString("cs-CZ")} Kč
                        </span>
                      </>
                    ) : null}
                    <span>·</span>
                    <span>
                      Upraveno{" "}
                      {new Date(p.updated_at).toLocaleDateString("cs-CZ")}
                    </span>
                  </div>
                </div>

                <div className="flex flex-wrap items-center gap-2">
                  <button
                    type="button"
                    onClick={() => handleToggle(p._id)}
                    disabled={busyId === p._id}
                    className="inline-flex items-center gap-1.5 rounded-full border border-border px-3 py-1.5 text-xs font-semibold text-foreground hover:border-brand hover:text-brand disabled:opacity-50"
                  >
                    {p.is_published ? (
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
                  <Link
                    href={`/admin/kariera/${p._id}`}
                    className="inline-flex items-center gap-1.5 rounded-full bg-brand-light px-3 py-1.5 text-xs font-semibold text-brand hover:bg-brand hover:text-brand-foreground"
                  >
                    <Pencil className="h-3.5 w-3.5" strokeWidth={2} />
                    Upravit
                  </Link>
                  <button
                    type="button"
                    onClick={() => handleDelete(p._id, p.title)}
                    disabled={busyId === p._id}
                    className="inline-flex items-center gap-1.5 rounded-full border border-border px-3 py-1.5 text-xs font-semibold text-destructive hover:border-destructive disabled:opacity-50"
                  >
                    <Trash2 className="h-3.5 w-3.5" strokeWidth={2} />
                    Smazat
                  </button>
                </div>
              </li>
            ))}
          </ul>
        )}
      </div>

      <div className="mt-10 rounded-2xl border border-border bg-card p-5 text-sm text-muted-foreground">
        Publikované pozice najdete na{" "}
        <Link href="/kariera" className="font-semibold text-brand hover:underline">
          /kariera
        </Link>
        <ArrowRight className="ml-1 inline h-3.5 w-3.5" />
      </div>
    </div>
  );
}
