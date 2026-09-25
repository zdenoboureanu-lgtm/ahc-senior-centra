"use client";

import Link from "next/link";
import { useSearchParams } from "next/navigation";
import { FacebookIcon, InstagramIcon } from "@/common/components/social-icons";
import { AhcLogo } from "@/common/components/ahc-logo";
import {
  FOOTER_QUICK_LINKS_HOSPITAL,
  FOOTER_QUICK_LINKS_SENIOR,
} from "@/common/lib/constants";
import { OtherBranchesList } from "./other-branches-list";
import type { Branch } from "@/convex/lib/types";

interface SiteFooterProps {
  branch: Branch | null;
}

export function SiteFooter({ branch }: SiteFooterProps) {
  const searchParams = useSearchParams();
  const preview = searchParams.get("branch");
  const withBranch = (href: string) =>
    preview && href.startsWith("/")
      ? `${href}${href.includes("?") ? "&" : "?"}branch=${preview}`
      : href;
  return (
    <footer className="mt-24 bg-brand-dark text-brand-foreground">
      <div className="mx-auto max-w-[1320px] px-6 pb-10 pt-20 lg:px-10">
        <div className="grid gap-12 lg:grid-cols-[1.4fr_1fr_1fr_1fr]">
          <div>
            <Link href={withBranch("/")} className="inline-flex items-center" aria-label="AHC – domů">
              <AhcLogo solid className="h-12 w-auto text-white" />
            </Link>

            {branch ? (
              <div className="mt-6 max-w-sm space-y-1 text-sm leading-relaxed text-brand-foreground/75">
                <div className="font-semibold text-brand-foreground">
                  {branch.legal_name}
                </div>
                <div>{branch.street}</div>
                <div>
                  {branch.zip} {branch.city} · Česká republika
                </div>
                <div className="mt-3 text-xs text-brand-foreground/60">
                  IČO: {branch.ico}
                  {branch.parent_org ? (
                    <>
                      {" · "}
                      Součást {branch.parent_org}
                    </>
                  ) : null}
                </div>
              </div>
            ) : null}

            <div className="mt-6 flex gap-2">
              {branch?.facebook_url ? (
                <a
                  href={branch.facebook_url}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="flex h-10 w-10 items-center justify-center rounded-full border border-brand-foreground/20 text-brand-foreground/80 transition-colors hover:border-warm hover:text-warm"
                  aria-label="Facebook"
                >
                  <FacebookIcon className="h-4 w-4" />
                </a>
              ) : null}
              {branch?.instagram_url ? (
                <a
                  href={branch.instagram_url}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="flex h-10 w-10 items-center justify-center rounded-full border border-brand-foreground/20 text-brand-foreground/80 transition-colors hover:border-warm hover:text-warm"
                  aria-label="Instagram"
                >
                  <InstagramIcon className="h-4 w-4" />
                </a>
              ) : null}
            </div>
          </div>

          {branch ? (
            <div>
              <h4 className="text-xs font-bold uppercase tracking-[0.18em] text-warm">
                Kontakt
              </h4>
              <ul className="mt-5 space-y-3 text-sm text-brand-foreground/80">
                {branch.office_contact_name ? (
                  <li className="text-brand-foreground/60">
                    {branch.office_contact_name}
                  </li>
                ) : null}
                <li>
                  <a
                    href={`tel:${(branch.office_contact_phone ?? branch.phone).replace(/\s/g, "")}`}
                    className="hover:text-warm"
                  >
                    {branch.office_contact_phone ?? branch.phone}
                  </a>
                </li>
                <li>
                  <a
                    href={`mailto:${branch.office_contact_email ?? branch.email}`}
                    className="hover:text-warm"
                  >
                    {branch.office_contact_email ?? branch.email}
                  </a>
                </li>
                {branch.sesterna_phone ? (
                  <li className="border-t border-brand-foreground/15 pt-3 text-xs text-brand-foreground/60">
                    Sesterna 24/7
                    <br />
                    <a
                      href={`tel:${branch.sesterna_phone.replace(/\s/g, "")}`}
                      className="text-sm text-brand-foreground/80 hover:text-warm"
                    >
                      {branch.sesterna_phone}
                    </a>
                  </li>
                ) : null}
              </ul>
            </div>
          ) : null}

          <div>
            <h4 className="text-xs font-bold uppercase tracking-[0.18em] text-warm">
              Odkazy
            </h4>
            <ul className="mt-5 space-y-2.5 text-sm">
              {(branch?.branch_type === "hospital"
                ? FOOTER_QUICK_LINKS_HOSPITAL
                : FOOTER_QUICK_LINKS_SENIOR
              ).map((l) => (
                <li key={l.label}>
                  <Link
                    href={withBranch(l.href)}
                    className="text-brand-foreground/80 hover:text-warm"
                  >
                    {l.label}
                  </Link>
                </li>
              ))}
            </ul>
          </div>

          <div>
            <h4 className="text-xs font-bold uppercase tracking-[0.18em] text-warm">
              Naše pobočky
            </h4>
            <OtherBranchesList currentBranchId={branch?._id ?? null} />
          </div>
        </div>

        {branch?.legal_address ? (
          <div className="mt-16 border-t border-brand-foreground/15 pt-8 text-center text-xs leading-relaxed text-brand-foreground/55">
            {branch.legal_name} · IČO: {branch.ico} · {branch.legal_address}
            {branch.legal_court_note ? (
              <>
                <br />
                {branch.legal_court_note}
              </>
            ) : null}
            <div className="mt-3">
              © {new Date().getFullYear()} AHC. Všechna práva vyhrazena.
            </div>
          </div>
        ) : (
          <div className="mt-16 border-t border-brand-foreground/15 pt-8 text-center text-xs text-brand-foreground/55">
            © {new Date().getFullYear()} AHC. Všechna práva vyhrazena.
          </div>
        )}
      </div>
    </footer>
  );
}
