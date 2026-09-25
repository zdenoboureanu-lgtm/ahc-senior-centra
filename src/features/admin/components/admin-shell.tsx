"use client";

import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import { ReactNode } from "react";
import { useAuthActions } from "@convex-dev/auth/react";
import { useQuery } from "convex/react";
import {
  Building2,
  Contact,
  LogOut,
  Newspaper,
  Settings,
  User as UserIcon,
  Users,
} from "lucide-react";
import { cn } from "@/lib/utils";
import { AhcLogo } from "@/common/components/ahc-logo";
import { api } from "@/convex/_generated/api";

interface NavDef {
  label: string;
  href: string;
  icon: typeof Building2;
  disabled?: boolean;
  superOnly?: boolean;
}

const NAV: NavDef[] = [
  { label: "Pobočky", href: "/admin/pobocky", icon: Building2 },
  { label: "Kontakty", href: "/admin/kontakty", icon: Contact },
  { label: "Uživatelé", href: "/admin/uzivatele", icon: Users, superOnly: true },
  { label: "Aktuality", href: "/admin/aktuality", icon: Newspaper, disabled: true },
  { label: "Nastavení", href: "/admin/nastaveni", icon: Settings, disabled: true },
];

export function AdminShell({ children }: { children: ReactNode }) {
  const pathname = usePathname();
  const router = useRouter();
  const { signOut } = useAuthActions();
  const me = useQuery(api.modules.users.queries.me);
  const isSuperAdmin = me?.profile?.role === "super_admin";
  const nav = NAV.filter((i) => !("superOnly" in i && i.superOnly) || isSuperAdmin);

  const isActive = (item: (typeof NAV)[number]) =>
    pathname.startsWith(item.href);

  async function handleSignOut() {
    await signOut();
    router.push("/admin/login");
  }

  return (
    <div className="flex min-h-screen bg-secondary/30">
      {/* Sidebar */}
      <aside className="hidden w-64 shrink-0 flex-col border-r border-border bg-card lg:flex">
        <Link
          href="/"
          className="flex items-center gap-3 border-b border-border px-6 py-5"
        >
          <AhcLogo className="h-9 w-auto text-brand" />
          <span className="border-l border-border pl-3 text-[10px] font-bold uppercase tracking-[0.22em] text-warm-dark">
            Admin
          </span>
        </Link>

        <nav className="flex-1 space-y-1 px-3 py-5">
          {nav.map((item) => {
            const active = isActive(item);
            const Icon = item.icon;
            const inner = (
              <span className="flex items-center gap-3">
                <Icon className="h-4 w-4" strokeWidth={2} />
                {item.label}
                {item.disabled ? (
                  <span className="ml-auto text-[9px] uppercase tracking-wider text-muted-foreground/70">
                    Brzy
                  </span>
                ) : null}
              </span>
            );
            return item.disabled ? (
              <div
                key={item.href}
                className="cursor-not-allowed rounded-xl px-3 py-2.5 text-sm font-semibold text-muted-foreground/50"
                aria-disabled="true"
              >
                {inner}
              </div>
            ) : (
              <Link
                key={item.href}
                href={item.href}
                className={cn(
                  "block rounded-xl px-3 py-2.5 text-sm font-semibold transition-colors",
                  active
                    ? "bg-brand text-brand-foreground"
                    : "text-foreground/70 hover:bg-muted hover:text-foreground"
                )}
              >
                {inner}
              </Link>
            );
          })}
        </nav>

        <div className="border-t border-border p-4">
          <div className="flex items-center gap-3 rounded-xl bg-muted px-3 py-3">
            <div className="flex h-9 w-9 items-center justify-center rounded-full bg-brand text-brand-foreground">
              <UserIcon className="h-4 w-4" strokeWidth={2} />
            </div>
            <div className="min-w-0 flex-1 text-sm">
              <div className="truncate font-semibold text-foreground">
                {me?.profile?.name ?? me?.email ?? "—"}
              </div>
              <div className="truncate text-[11px] uppercase tracking-wider text-muted-foreground">
                {me?.profile?.role === "super_admin"
                  ? "Super admin"
                  : me?.branch
                    ? me.branch.short_name
                    : me?.profile?.role === "branch_manager"
                      ? "Bez pobočky"
                      : "Bez role"}
              </div>
            </div>
          </div>
          <button
            type="button"
            onClick={handleSignOut}
            className="mt-3 inline-flex w-full items-center justify-center gap-2 rounded-xl border border-border bg-background px-3 py-2 text-xs font-semibold text-foreground hover:border-brand hover:text-brand"
          >
            <LogOut className="h-3.5 w-3.5" strokeWidth={2} />
            Odhlásit se
          </button>
        </div>
      </aside>

      {/* Mobile topbar */}
      <header className="fixed inset-x-0 top-0 z-40 flex h-14 items-center justify-between border-b border-border bg-card px-4 lg:hidden">
        <Link href="/admin" className="flex items-center gap-2">
          <AhcLogo className="h-7 w-auto text-brand" />
          <span className="text-[10px] font-bold uppercase tracking-[0.22em] text-warm-dark">
            Admin
          </span>
        </Link>
        <button
          type="button"
          onClick={handleSignOut}
          className="text-xs font-semibold text-brand"
        >
          Odhlásit
        </button>
      </header>

      <div className="flex-1 pt-14 lg:pt-0">{children}</div>
    </div>
  );
}
