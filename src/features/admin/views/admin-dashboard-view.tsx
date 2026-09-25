"use client";

import Link from "next/link";
import { useQuery } from "convex/react";
import { ArrowRight, Briefcase, MapPin, Shield } from "lucide-react";
import { api } from "@/convex/_generated/api";

export function AdminDashboardView() {
  const me = useQuery(api.modules.users.queries.me);

  if (me === undefined) {
    return (
      <div className="p-8 text-sm text-muted-foreground">Načítám profil…</div>
    );
  }

  if (!me?.profile) {
    return (
      <div className="mx-auto max-w-2xl px-6 py-16">
        <div className="rounded-3xl border border-warm/30 bg-warm/10 p-8">
          <Shield className="h-7 w-7 text-warm-dark" strokeWidth={1.75} />
          <h1 className="font-display mt-4 text-2xl text-foreground">
            Účet čeká na přiřazení role
          </h1>
          <p className="mt-3 text-sm leading-relaxed text-muted-foreground">
            Účet byl vytvořen ({me?.email}), ale ještě nemáte přiřazenou roli
            (super-admin / správce pobočky). Kontaktujte prosím administrátora,
            který vám roli přiřadí.
          </p>
          <p className="mt-4 text-xs text-muted-foreground/70">
            Admin příkaz:{" "}
            <code className="rounded bg-card px-2 py-0.5 text-foreground">
              {`bunx convex run --prod seed:assignRole '{ "email": "${me?.email}", "role": "branch_manager", "branchSlug": "stribro" }'`}
            </code>
          </p>
        </div>
      </div>
    );
  }

  const role = me.profile.role;
  const branchName = me.branch?.short_name;

  return (
    <div className="mx-auto max-w-5xl px-6 py-12 lg:px-10 lg:py-16">
      <div className="text-[11px] font-bold uppercase tracking-[0.22em] text-warm-dark">
        Vítejte zpět
      </div>
      <h1 className="font-display mt-2 text-4xl text-foreground sm:text-5xl">
        {me.profile.name ?? me.email}
      </h1>
      <p className="mt-3 text-base text-muted-foreground">
        {role === "super_admin"
          ? "Spravujete obsah napříč všemi pobočkami."
          : `Spravujete obsah pobočky ${branchName ?? "(bez pobočky)"}.`}
      </p>

      <div className="mt-10 grid gap-5 sm:grid-cols-2 lg:grid-cols-3">
        <Link
          href="/admin/kariera"
          className="group rounded-3xl border border-border bg-card p-6 shadow-sm transition-all hover:-translate-y-1 hover:border-brand/40 hover:shadow-lg"
        >
          <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-brand-light text-brand transition-colors group-hover:bg-brand group-hover:text-brand-foreground">
            <Briefcase className="h-5 w-5" strokeWidth={1.75} />
          </div>
          <h3 className="font-display mt-5 text-xl text-foreground">
            Kariéra
          </h3>
          <p className="mt-2 text-sm text-muted-foreground">
            Inzeráty a otevřené pozice. Vytvořte, editujte nebo skryjte.
          </p>
          <div className="mt-4 inline-flex items-center gap-1 text-xs font-bold uppercase tracking-wider text-brand">
            Otevřít <ArrowRight className="h-3.5 w-3.5" />
          </div>
        </Link>

        <div className="rounded-3xl border border-border bg-card p-6 opacity-60">
          <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-muted text-muted-foreground">
            <MapPin className="h-5 w-5" strokeWidth={1.75} />
          </div>
          <h3 className="font-display mt-5 text-xl text-foreground">
            Pobočka
          </h3>
          <p className="mt-2 text-sm text-muted-foreground">
            Editace kontaktních údajů, otvírací doby, fotek. Brzy.
          </p>
        </div>

        <div className="rounded-3xl border border-border bg-card p-6 opacity-60">
          <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-muted text-muted-foreground">
            <Shield className="h-5 w-5" strokeWidth={1.75} />
          </div>
          <h3 className="font-display mt-5 text-xl text-foreground">
            Audit log
          </h3>
          <p className="mt-2 text-sm text-muted-foreground">
            Přehled změn — kdo, co, kdy. Brzy.
          </p>
        </div>
      </div>
    </div>
  );
}
