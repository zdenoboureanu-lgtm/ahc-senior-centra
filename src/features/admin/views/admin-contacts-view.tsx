"use client";

import Link from "next/link";
import { useMemo, useState } from "react";
import { useQuery } from "convex/react";
import {
  Building2,
  Mail,
  MapPin,
  Pencil,
  Phone,
  Search,
  Stethoscope,
  User,
} from "lucide-react";
import { api } from "@/convex/_generated/api";
import type { Branch } from "@/convex/lib/types";

const TYPE_LABELS: Record<string, string> = {
  senior_centrum: "Senior centrum",
  hospital: "Nemocnice",
};

function ContactRow({
  icon: Icon,
  label,
  value,
  href,
}: {
  icon: typeof Phone;
  label: string;
  value?: string | null;
  href?: string;
}) {
  if (!value) return null;
  return (
    <div className="flex items-start gap-2.5">
      <Icon className="mt-0.5 h-4 w-4 shrink-0 text-brand" strokeWidth={2} />
      <div className="min-w-0">
        <div className="text-[10px] font-bold uppercase tracking-wider text-muted-foreground">
          {label}
        </div>
        {href ? (
          <a
            href={href}
            className="break-words text-sm font-semibold text-foreground hover:text-brand"
          >
            {value}
          </a>
        ) : (
          <div className="break-words text-sm font-semibold text-foreground">
            {value}
          </div>
        )}
      </div>
    </div>
  );
}

function BranchCard({ b }: { b: Branch }) {
  return (
    <div className="rounded-2xl border border-border bg-card p-6">
      <div className="flex items-start justify-between gap-3">
        <div className="min-w-0">
          <div className="flex flex-wrap items-center gap-2">
            <h3 className="font-display text-lg text-foreground">{b.name}</h3>
            {b.branch_type ? (
              <span className="rounded-full bg-brand-light px-2.5 py-0.5 text-[10px] font-bold uppercase tracking-wider text-brand">
                {TYPE_LABELS[b.branch_type] ?? b.branch_type}
              </span>
            ) : null}
          </div>
          <div className="mt-1 flex items-center gap-1 text-xs text-muted-foreground">
            <MapPin className="h-3 w-3" strokeWidth={2} />
            {b.street}, {b.zip} {b.city}
          </div>
        </div>
        <Link
          href={`/admin/pobocky/${b._id}`}
          className="inline-flex shrink-0 items-center gap-1.5 rounded-full bg-brand-light px-3 py-1.5 text-xs font-semibold text-brand hover:bg-brand hover:text-brand-foreground"
        >
          <Pencil className="h-3.5 w-3.5" strokeWidth={2} />
          Upravit
        </Link>
      </div>

      <div className="mt-5 grid gap-4 sm:grid-cols-2">
        <ContactRow
          icon={Phone}
          label="Hlavní telefon"
          value={b.phone}
          href={`tel:${b.phone.replace(/\s/g, "")}`}
        />
        <ContactRow
          icon={Mail}
          label="Hlavní e-mail"
          value={b.email}
          href={`mailto:${b.email}`}
        />
        {b.office_contact_name || b.office_contact_phone || b.office_contact_email ? (
          <>
            <ContactRow
              icon={User}
              label={b.office_contact_name ?? "Recepce / kancelář"}
              value={b.office_contact_phone}
              href={
                b.office_contact_phone
                  ? `tel:${b.office_contact_phone.replace(/\s/g, "")}`
                  : undefined
              }
            />
            <ContactRow
              icon={Mail}
              label="E-mail kanceláře"
              value={b.office_contact_email}
              href={
                b.office_contact_email
                  ? `mailto:${b.office_contact_email}`
                  : undefined
              }
            />
          </>
        ) : null}
        <ContactRow
          icon={Stethoscope}
          label="Sesterna (24/7)"
          value={b.sesterna_phone}
          href={
            b.sesterna_phone
              ? `tel:${b.sesterna_phone.replace(/\s/g, "")}`
              : undefined
          }
        />
        {b.ico ? (
          <ContactRow icon={Building2} label="IČO" value={b.ico} />
        ) : null}
      </div>
    </div>
  );
}

export function AdminContactsView() {
  const me = useQuery(api.modules.users.queries.me);
  const isSuperAdmin = me?.profile?.role === "super_admin";
  const [search, setSearch] = useState("");

  const allBranches = useQuery(
    api.modules.branches.queries.listAllForAdmin,
    isSuperAdmin ? {} : "skip"
  );

  const branchesRaw: Branch[] = isSuperAdmin
    ? (allBranches ?? [])
    : me?.branch
      ? [me.branch]
      : [];

  const filtered = useMemo(() => {
    const q = search.trim().toLowerCase();
    if (!q) return branchesRaw;
    return branchesRaw.filter((b) =>
      [
        b.name,
        b.short_name,
        b.city,
        b.region,
        b.street,
        b.phone,
        b.phone_short,
        b.email,
        b.office_contact_name,
        b.office_contact_phone,
        b.office_contact_email,
      ]
        .filter(Boolean)
        .some((v) => (v as string).toLowerCase().includes(q))
    );
  }, [branchesRaw, search]);

  if (me === undefined) {
    return <div className="p-8 text-sm text-muted-foreground">Načítám…</div>;
  }
  if (!me?.profile) {
    return (
      <div className="p-8 text-sm text-muted-foreground">
        Účet nemá přiřazenou roli.
      </div>
    );
  }

  return (
    <div className="mx-auto max-w-5xl px-6 py-12 lg:px-10 lg:py-16">
      <div className="text-[11px] font-bold uppercase tracking-[0.22em] text-warm-dark">
        Adresář
      </div>
      <h1 className="font-display mt-2 text-3xl text-foreground sm:text-4xl">
        Kontakty poboček
      </h1>
      <p className="mt-2 text-sm text-muted-foreground">
        {isSuperAdmin
          ? "Souhrn všech kontaktů napříč celou sítí. Údaje se editují v detailu pobočky."
          : "Kontaktní údaje vaší pobočky."}
      </p>

      {/* Vyhledávání */}
      <div className="relative mt-8 max-w-md">
        <Search
          className="pointer-events-none absolute left-4 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground"
          strokeWidth={2}
        />
        <input
          type="search"
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          placeholder="Hledat podle názvu, města, telefonu, e-mailu…"
          className="w-full rounded-full border border-border bg-card py-3 pl-11 pr-4 text-sm text-foreground placeholder:text-muted-foreground/70 focus:border-brand focus:outline-none focus:ring-2 focus:ring-brand/20"
        />
      </div>

      <div className="mt-6 space-y-4">
        {isSuperAdmin && allBranches === undefined ? (
          <div className="text-sm text-muted-foreground">Načítám kontakty…</div>
        ) : branchesRaw.length === 0 ? (
          <div className="rounded-3xl border border-dashed border-border bg-card p-10 text-center text-sm text-muted-foreground">
            Žádné pobočky.
          </div>
        ) : filtered.length === 0 ? (
          <div className="rounded-3xl border border-dashed border-border bg-card p-10 text-center text-sm text-muted-foreground">
            Pro „{search}" nic nenalezeno.
          </div>
        ) : (
          filtered.map((b) => <BranchCard key={b._id} b={b} />)
        )}
      </div>
    </div>
  );
}
