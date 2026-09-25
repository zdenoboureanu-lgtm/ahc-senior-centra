"use client";

import Link from "next/link";
import { useState } from "react";
import { useAction, useMutation, useQuery } from "convex/react";
import {
  ShieldCheck,
  Trash2,
  UserPlus,
  Save,
  Mail,
} from "lucide-react";
import { toast } from "sonner";
import { api } from "@/convex/_generated/api";
import type { Id } from "@/convex/_generated/dataModel";
import { cn } from "@/lib/utils";

type Role = "super_admin" | "branch_manager";

interface BranchOpt {
  _id: Id<"branches">;
  short_name: string;
}

interface UserRowData {
  userId: Id<"users">;
  email: string | null;
  name: string | null;
  role: Role | null;
  branchId: Id<"branches"> | null;
  branchName: string | null;
}

const fieldBase =
  "w-full rounded-xl border border-border bg-secondary/40 px-4 py-2.5 text-sm text-foreground placeholder:text-muted-foreground/60 focus:border-brand focus:bg-background focus:outline-none focus:ring-2 focus:ring-brand/20";
const labelBase =
  "mb-1.5 block text-xs font-bold uppercase tracking-wider text-foreground/70";

function UserRow({
  u,
  branches,
  meUserId,
}: {
  u: UserRowData;
  branches: BranchOpt[];
  meUserId: Id<"users"> | null;
}) {
  const setUserRole = useMutation(api.modules.users.mutations.setUserRole);
  const revokeUser = useMutation(api.modules.users.mutations.revokeUser);
  const [role, setRole] = useState<Role>(u.role ?? "branch_manager");
  const [branchId, setBranchId] = useState<Id<"branches"> | "">(
    u.branchId ?? ""
  );
  const [busy, setBusy] = useState(false);

  const dirty =
    role !== (u.role ?? "branch_manager") ||
    (branchId || null) !== (u.branchId ?? null);

  async function save() {
    if (role === "branch_manager" && !branchId) {
      toast.error("Vyberte pobočku pro lokálního admina.");
      return;
    }
    setBusy(true);
    try {
      await setUserRole({
        userId: u.userId,
        role,
        branchId:
          role === "branch_manager" && branchId
            ? (branchId as Id<"branches">)
            : undefined,
        name: u.name ?? undefined,
      });
      toast.success("Uloženo.");
    } catch (err) {
      toast.error(err instanceof Error ? err.message : "Chyba.");
    } finally {
      setBusy(false);
    }
  }

  async function revoke() {
    if (!confirm(`Odebrat přístup uživateli ${u.email}?`)) return;
    setBusy(true);
    try {
      await revokeUser({ userId: u.userId });
      toast.success("Přístup odebrán.");
    } catch (err) {
      toast.error(err instanceof Error ? err.message : "Chyba.");
    } finally {
      setBusy(false);
    }
  }

  const isSelf = meUserId === u.userId;

  return (
    <li className="flex flex-col gap-4 rounded-2xl border border-border bg-card p-5 lg:flex-row lg:items-center lg:justify-between">
      <div className="min-w-0 flex-1">
        <div className="flex items-center gap-2">
          <span className="font-display text-base text-foreground">
            {u.name ?? u.email ?? "—"}
          </span>
          {u.role === null ? (
            <span className="rounded-full bg-warm/15 px-2 py-0.5 text-[10px] font-bold uppercase tracking-wider text-warm-dark">
              Bez role
            </span>
          ) : null}
          {isSelf ? (
            <span className="rounded-full bg-brand-light px-2 py-0.5 text-[10px] font-bold uppercase tracking-wider text-brand">
              To jste vy
            </span>
          ) : null}
        </div>
        <div className="mt-0.5 flex items-center gap-1.5 text-xs text-muted-foreground">
          <Mail className="h-3 w-3" strokeWidth={2} />
          {u.email ?? "—"}
        </div>
      </div>

      <div className="flex flex-col items-stretch gap-2 sm:flex-row sm:items-center">
        <select
          value={role}
          onChange={(e) => setRole(e.target.value as Role)}
          className={cn(fieldBase, "sm:w-44")}
        >
          <option value="super_admin">Super admin</option>
          <option value="branch_manager">Lokální admin</option>
        </select>
        <select
          value={branchId}
          onChange={(e) =>
            setBranchId(e.target.value as Id<"branches"> | "")
          }
          disabled={role === "super_admin"}
          className={cn(fieldBase, "sm:w-44 disabled:opacity-50")}
        >
          <option value="">— pobočka —</option>
          {branches.map((b) => (
            <option key={b._id} value={b._id}>
              {b.short_name}
            </option>
          ))}
        </select>
        <button
          type="button"
          onClick={save}
          disabled={busy || !dirty}
          className="inline-flex items-center justify-center gap-1.5 rounded-full bg-brand px-4 py-2 text-xs font-semibold text-brand-foreground hover:bg-brand-dark disabled:opacity-40"
        >
          <Save className="h-3.5 w-3.5" strokeWidth={2} />
          Uložit
        </button>
        <button
          type="button"
          onClick={revoke}
          disabled={busy || isSelf || u.role === null}
          title={isSelf ? "Nelze odebrat sám sobě" : "Odebrat přístup"}
          className="inline-flex items-center justify-center gap-1.5 rounded-full border border-border px-3 py-2 text-xs font-semibold text-destructive hover:border-destructive disabled:opacity-30"
        >
          <Trash2 className="h-3.5 w-3.5" strokeWidth={2} />
        </button>
      </div>
    </li>
  );
}

export function AdminUsersView() {
  const me = useQuery(api.modules.users.queries.me);
  const isSuperAdmin = me?.profile?.role === "super_admin";

  const users = useQuery(
    api.modules.users.queries.listUsers,
    isSuperAdmin ? {} : "skip"
  );
  const branches = useQuery(
    api.modules.branches.queries.listAllForAdmin,
    isSuperAdmin ? {} : "skip"
  );
  const createUser = useAction(api.modules.users.actions.createUser);

  // Nový uživatel form
  const [email, setEmail] = useState("");
  const [name, setName] = useState("");
  const [password, setPassword] = useState("");
  const [role, setRole] = useState<Role>("branch_manager");
  const [branchId, setBranchId] = useState<Id<"branches"> | "">("");
  const [creating, setCreating] = useState(false);

  if (me === undefined) {
    return <div className="p-8 text-sm text-muted-foreground">Načítám…</div>;
  }
  if (!isSuperAdmin) {
    return (
      <div className="p-8 text-sm text-muted-foreground">
        Správa uživatelů je dostupná jen super-adminovi.{" "}
        <Link href="/admin/pobocky" className="text-brand underline">
          Zpět
        </Link>
      </div>
    );
  }

  async function handleCreate(e: React.FormEvent) {
    e.preventDefault();
    if (role === "branch_manager" && !branchId) {
      toast.error("Vyberte pobočku pro lokálního admina.");
      return;
    }
    setCreating(true);
    try {
      await createUser({
        email: email.trim(),
        password,
        role,
        branchId:
          role === "branch_manager" && branchId
            ? (branchId as Id<"branches">)
            : undefined,
        name: name.trim() || undefined,
      });
      toast.success("Uživatel vytvořen.");
      setEmail("");
      setName("");
      setPassword("");
      setBranchId("");
    } catch (err) {
      toast.error(err instanceof Error ? err.message : "Chyba.");
    } finally {
      setCreating(false);
    }
  }

  return (
    <div className="mx-auto max-w-5xl px-6 py-12 lg:px-10 lg:py-16">
      <div className="text-[11px] font-bold uppercase tracking-[0.22em] text-warm-dark">
        Administrace
      </div>
      <h1 className="font-display mt-2 text-3xl text-foreground sm:text-4xl">
        Uživatelé
      </h1>
      <p className="mt-2 text-sm text-muted-foreground">
        Vytvářejte super-adminy i lokální adminy. Lokálnímu adminovi přiřaďte
        pobočku, kterou bude spravovat.
      </p>

      {/* Nový uživatel */}
      <form
        onSubmit={handleCreate}
        className="mt-8 rounded-2xl border border-border bg-card p-6"
      >
        <div className="flex items-center gap-2 text-sm font-bold text-foreground">
          <UserPlus className="h-4 w-4 text-brand" strokeWidth={2} />
          Nový uživatel
        </div>
        <div className="mt-5 grid gap-4 sm:grid-cols-2">
          <div>
            <label className={labelBase}>E-mail</label>
            <input
              type="email"
              required
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              placeholder="jmeno@ahc.cz"
              className={fieldBase}
            />
          </div>
          <div>
            <label className={labelBase}>Jméno</label>
            <input
              value={name}
              onChange={(e) => setName(e.target.value)}
              placeholder="Jan Novák"
              className={fieldBase}
            />
          </div>
          <div>
            <label className={labelBase}>Heslo (min. 8 znaků)</label>
            <input
              type="text"
              required
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              placeholder="dočasné heslo"
              className={fieldBase}
            />
          </div>
          <div>
            <label className={labelBase}>Role</label>
            <select
              value={role}
              onChange={(e) => setRole(e.target.value as Role)}
              className={fieldBase}
            >
              <option value="super_admin">Super admin</option>
              <option value="branch_manager">Lokální admin</option>
            </select>
          </div>
          {role === "branch_manager" ? (
            <div className="sm:col-span-2">
              <label className={labelBase}>Pobočka</label>
              <select
                value={branchId}
                onChange={(e) =>
                  setBranchId(e.target.value as Id<"branches"> | "")
                }
                className={fieldBase}
              >
                <option value="">— vyberte pobočku —</option>
                {(branches ?? []).map((b) => (
                  <option key={b._id} value={b._id}>
                    {b.short_name}
                  </option>
                ))}
              </select>
            </div>
          ) : null}
        </div>
        <div className="mt-5 flex justify-end">
          <button
            type="submit"
            disabled={creating}
            className="inline-flex items-center gap-2 rounded-full bg-brand px-6 py-3 text-sm font-semibold text-brand-foreground shadow-md shadow-brand/15 hover:bg-brand-dark disabled:opacity-60"
          >
            <UserPlus className="h-4 w-4" strokeWidth={2} />
            {creating ? "Vytvářím…" : "Vytvořit uživatele"}
          </button>
        </div>
      </form>

      {/* Seznam */}
      <div className="mt-10 flex items-center gap-2">
        <ShieldCheck className="h-4 w-4 text-brand" strokeWidth={2} />
        <h2 className="font-display text-xl text-foreground">
          Stávající uživatelé
        </h2>
      </div>
      <ul className="mt-4 space-y-3">
        {users === undefined ? (
          <div className="text-sm text-muted-foreground">Načítám…</div>
        ) : users.length === 0 ? (
          <div className="text-sm text-muted-foreground">
            Zatím žádní uživatelé.
          </div>
        ) : (
          users.map((u) => (
            <UserRow
              key={u.userId}
              u={u as UserRowData}
              branches={(branches ?? []) as BranchOpt[]}
              meUserId={me?.userId ?? null}
            />
          ))
        )}
      </ul>
    </div>
  );
}
