"use client";

import Link from "next/link";
import { usePathname, useSearchParams } from "next/navigation";
import { useEffect, useState } from "react";
import { Menu, Phone, X, ArrowRight } from "lucide-react";
import { cn } from "@/lib/utils";
import {
  NAV_ITEMS_HOSPITAL,
  NAV_ITEMS_SENIOR,
} from "@/common/lib/constants";
import { AhcLogo } from "@/common/components/ahc-logo";
import { EditableText } from "@/features/inline-edit/components/editable-text";
import type { Branch } from "@/convex/lib/types";

interface SiteHeaderProps {
  branch: Branch | null;
}

export function SiteHeader({ branch }: SiteHeaderProps) {
  const [open, setOpen] = useState(false);
  const [scrolled, setScrolled] = useState(false);
  const pathname = usePathname();
  const searchParams = useSearchParams();
  // Náhledový režim (?branch=…) — propíšeme branch do všech odkazů, aby každý
  // tab zůstal na své pobočce (na ostrých subdoménách se to neuplatní).
  const preview = searchParams.get("branch");
  const withBranch = (href: string) =>
    preview && href.startsWith("/")
      ? `${href}${href.includes("?") ? "&" : "?"}branch=${preview}`
      : href;
  const isHospital = branch?.branch_type === "hospital";
  const NAV_ITEMS = isHospital ? NAV_ITEMS_HOSPITAL : NAV_ITEMS_SENIOR;
  const ctaLabel = isHospital ? "Rychlý kontakt" : "Žádost o přijetí";
  const ctaHref = isHospital ? "/kontakt" : "/zadost-o-prijeti";

  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 16);
    onScroll();
    window.addEventListener("scroll", onScroll, { passive: true });
    return () => window.removeEventListener("scroll", onScroll);
  }, []);

  const activeIndex = (() => {
    let bestIdx = -1;
    let bestLen = 0;
    NAV_ITEMS.forEach((item, idx) => {
      const path = item.href.split("#")[0] || "/";
      if (path === "/") {
        if (pathname === "/" && bestLen === 0) {
          bestIdx = idx;
          bestLen = 1;
        }
      } else if (pathname.startsWith(path) && path.length > bestLen) {
        bestIdx = idx;
        bestLen = path.length;
      }
    });
    return bestIdx;
  })();

  return (
    <header
      className={cn(
        "sticky top-0 z-40 w-full border-b transition-shadow duration-300",
        scrolled
          ? "border-border/40 bg-background/95 shadow-sm backdrop-blur-xl"
          : "border-transparent bg-background"
      )}
    >
      <div className="mx-auto flex h-[76px] max-w-[1320px] items-center justify-between gap-8 px-6 lg:px-10">
        <Link
          href={withBranch("/")}
          className="group flex items-center gap-3"
          aria-label="AHC – domů"
        >
          <AhcLogo className="h-10 w-auto text-brand" />
          {branch ? (
            <div className="hidden border-l border-border pl-3 leading-tight sm:block">
              <EditableText
                as="div"
                target={{
                  kind: "field",
                  table: "branches",
                  id: branch._id,
                  field: "type_label",
                }}
                value={branch.type_label ?? "Senior centrum"}
                className="text-[10px] font-bold uppercase tracking-[0.22em] text-warm-dark"
              />
              <EditableText
                as="div"
                target={{
                  kind: "field",
                  table: "branches",
                  id: branch._id,
                  field: "short_name",
                }}
                value={branch.short_name}
                className="text-sm font-bold tracking-tight text-foreground"
              />
            </div>
          ) : null}
        </Link>

        <nav
          className="hidden items-center gap-6 lg:flex xl:gap-8"
          aria-label="Hlavní navigace"
        >
          {NAV_ITEMS.map((item, idx) => {
            const active = idx === activeIndex;
            return (
              <Link
                key={item.label}
                href={withBranch(item.href)}
                className={cn(
                  "group/nav relative whitespace-nowrap py-2 text-[13px] font-semibold tracking-wide transition-colors",
                  active
                    ? "text-brand"
                    : "text-foreground/80 hover:text-brand"
                )}
              >
                {item.label}
                <span
                  className={cn(
                    "absolute -bottom-px left-0 right-0 h-0.5 rounded-full bg-warm transition-all duration-300",
                    active
                      ? "scale-x-100 opacity-100"
                      : "scale-x-0 opacity-0 group-hover/nav:scale-x-100 group-hover/nav:opacity-100"
                  )}
                />
              </Link>
            );
          })}
        </nav>

        <div className="flex items-center gap-3">
          <Link
            href={withBranch(ctaHref)}
            className="hidden items-center gap-2 whitespace-nowrap rounded-full bg-brand px-5 py-2.5 text-[13px] font-semibold text-brand-foreground shadow-sm transition-all hover:bg-brand-dark hover:shadow-md lg:inline-flex"
          >
            {ctaLabel}
            <ArrowRight className="h-3.5 w-3.5" />
          </Link>

          <button
            type="button"
            onClick={() => setOpen(!open)}
            className="inline-flex h-10 w-10 items-center justify-center rounded-full text-foreground hover:bg-muted lg:hidden"
            aria-label={open ? "Zavřít menu" : "Otevřít menu"}
            aria-expanded={open}
          >
            {open ? <X className="h-5 w-5" /> : <Menu className="h-5 w-5" />}
          </button>
        </div>
      </div>

      <div
        className={cn(
          "lg:hidden border-t border-border/40 bg-background",
          open ? "block" : "hidden"
        )}
      >
        <nav
          className="mx-auto flex max-w-7xl flex-col gap-1 px-6 py-4"
          aria-label="Mobilní navigace"
        >
          {NAV_ITEMS.map((item) => (
            <Link
              key={item.label}
              href={withBranch(item.href)}
              onClick={() => setOpen(false)}
              className="rounded-md px-3 py-3 text-base font-semibold text-foreground/80 hover:bg-muted hover:text-brand"
            >
              {item.label}
            </Link>
          ))}
          {branch ? (
            <a
              href={`tel:${branch.phone.replace(/\s/g, "")}`}
              className="mt-3 inline-flex items-center justify-center gap-2 rounded-full bg-brand px-4 py-3 text-sm font-semibold text-brand-foreground"
              onClick={() => setOpen(false)}
            >
              <Phone className="h-4 w-4" />
              {branch.phone}
            </a>
          ) : null}
        </nav>
      </div>
    </header>
  );
}
