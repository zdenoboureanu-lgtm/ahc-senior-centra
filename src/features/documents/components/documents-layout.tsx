import Link from "next/link";
import {
  ArrowRight,
  ChevronDown,
  Download,
  FileText,
  HandHelping,
  Mail,
  Phone,
} from "lucide-react";
import type { LucideIcon } from "lucide-react";
import {
  RegionSlot,
  TextSlot,
} from "@/features/inline-edit/components/content-slot";
import type { RegionEdit } from "@/features/inline-edit/components/editable-region";
import type { EditTarget } from "@/features/inline-edit/edit-mode-context";
import { EditableFile } from "@/features/inline-edit/components/editable-file";
import {
  makeCopy,
  type CopyHelpers,
  type CopyProps,
} from "@/features/inline-edit/copy";

/** Props pro skrývání a duplikaci jednoho prvku. */
export type Region = { edit?: RegionEdit; hidden: boolean };

/**
 * Sdílený layout podstránky „Dokumenty".
 *
 * Vzhled je převzatý ze Sedlce-Prčice a používají ho všechny pobočky — Sedlec
 * si sem posílá ručně psané seznamy, ostatní dokumenty z databáze. Díky jedné
 * komponentě nemůžou weby vizuálně utéct od sebe.
 */

const wrap = "mx-auto max-w-[1320px] px-6 lg:px-10";

export interface DocItem {
  key: string;
  tag: string;
  title: string;
  desc?: string;
  /** Odkaz ke stažení; bez něj vede tlačítko na kontakt. */
  href?: string;
  edit?: {
    tag?: EditTarget;
    title?: EditTarget;
    desc?: EditTarget;
    /** Soubor ke stažení — v režimu úprav jde nahrát nový. */
    file?: EditTarget;
  };
  region?: Region;
}

export interface DocGroup {
  /** Kotva sekce — musí být jedinečná v rámci stránky. */
  id: string;
  title: string;
  /** Popisek do rozcestníku nahoře. */
  lead?: string;
  icon: LucideIcon;
  items: DocItem[];
  edit?: { title?: EditTarget; lead?: EditTarget };
  region?: Region;
}

export interface DocContact {
  key: string;
  lead: string;
  name: string;
  role?: string;
  email?: string;
  phone?: string;
  mobile?: string;
  edit?: { lead?: EditTarget; name?: EditTarget; role?: EditTarget };
}

function DocCard({ c, item }: { c: CopyHelpers; item: DocItem }) {
  return (
    <div className="flex flex-col rounded-2xl border border-border bg-card p-5">
      <div className="flex items-start gap-3">
        <span className="flex h-11 w-11 shrink-0 items-center justify-center rounded-xl bg-brand-light text-brand">
          <FileText className="h-5 w-5" strokeWidth={1.75} />
        </span>
        <div className="min-w-0">
          <TextSlot
            as="span"
            target={item.edit?.tag}
            value={item.tag}
            className="inline-flex rounded-full bg-secondary px-2 py-0.5 text-[10px] font-bold uppercase tracking-wider text-warm-dark"
          />
          <TextSlot
            as="h4"
            target={item.edit?.title}
            value={item.title}
            className="font-display mt-1.5 text-base text-foreground"
          />
        </div>
      </div>
      {item.desc ? (
        <TextSlot
          as="p"
          target={item.edit?.desc}
          value={item.desc}
          className="mt-3 flex-1 text-sm leading-relaxed text-muted-foreground"
        />
      ) : (
        <div className="flex-1" />
      )}
      {item.href ? (
        <a
          href={item.href}
          download
          className="mt-4 inline-flex items-center justify-center gap-2 rounded-full border border-border px-4 py-2 text-xs font-bold uppercase tracking-wider text-brand hover:border-brand hover:bg-brand hover:text-brand-foreground"
        >
          <Download className="h-3.5 w-3.5" /> {c.t("dokumenty.stahnout", "Stáhnout")}
        </a>
      ) : (
        <Link
          href="/kontakt"
          className="mt-4 inline-flex items-center justify-center gap-2 rounded-full border border-border px-4 py-2 text-xs font-bold uppercase tracking-wider text-brand hover:border-brand hover:bg-brand hover:text-brand-foreground"
        >
          <Download className="h-3.5 w-3.5" /> {c.t("dokumenty.stahnout", "Stáhnout")}
        </Link>
      )}
      <EditableFile
        target={item.edit?.file}
        label={item.href ? "Nahrát nový soubor" : "Nahrát soubor"}
      />
    </div>
  );
}

function ContactCard({ contact }: { contact: DocContact }) {
  return (
    <div className="rounded-2xl border border-border bg-card p-6">
      <TextSlot
        as="div"
        target={contact.edit?.lead}
        value={contact.lead}
        className="text-[11px] font-bold uppercase tracking-[0.18em] text-warm-dark"
      />
      <TextSlot
        as="div"
        target={contact.edit?.name}
        value={contact.name}
        className="font-display mt-2 text-lg text-foreground"
      />
      {contact.role ? (
        <TextSlot
          as="div"
          target={contact.edit?.role}
          value={contact.role}
          className="text-sm text-muted-foreground"
        />
      ) : null}
      <div className="mt-3 space-y-1 text-sm text-foreground">
        {contact.email ? <div>{contact.email}</div> : null}
        {contact.phone ? <div>{contact.phone}</div> : null}
        {contact.mobile ? <div>{contact.mobile}</div> : null}
      </div>
      <div className="mt-4 flex gap-2">
        {contact.phone ? (
          <a
            href={`tel:${contact.phone.replace(/\s/g, "")}`}
            className="inline-flex items-center gap-1.5 rounded-full bg-brand px-4 py-2 text-xs font-bold uppercase tracking-wider text-brand-foreground hover:bg-brand-dark"
          >
            <Phone className="h-3.5 w-3.5" /> Zavolat
          </a>
        ) : null}
        {contact.email ? (
          <a
            href={`mailto:${contact.email}`}
            className="inline-flex items-center gap-1.5 rounded-full border border-border px-4 py-2 text-xs font-bold uppercase tracking-wider text-foreground hover:border-brand hover:text-brand"
          >
            <Mail className="h-3.5 w-3.5" /> E-mail
          </a>
        ) : null}
      </div>
    </div>
  );
}

export interface DocumentsLayoutProps extends CopyProps {
  hero: {
    title: string;
    lead: string;
    edit?: { title?: EditTarget; lead?: EditTarget };
  };
  groups: DocGroup[];
  contacts?: DocContact[];
  contactsTitle?: string;
  assurance?: {
    strong: string;
    text: string;
    cta: { label: string; href: string };
    edit?: { strong?: EditTarget; text?: EditTarget };
  };
  /** Rozbalovací blok povinné publicity (dotace). */
  grant?: {
    eyebrow: string;
    title: string;
    text: string;
    rows: [string, string][];
    edit?: { eyebrow?: EditTarget; title?: EditTarget; text?: EditTarget };
  };
  /** Textové odkazy pod obsahem (GDPR, cookies…). */
  legalLinks?: { label: string; href: string }[];
  /** Rozcestník na konci stránky. */
  links?: { title: string; desc: string; href: string }[];
  /** Obsah navíc (článek pobočky), když nejsou žádné soubory ke stažení. */
  children?: React.ReactNode;
}

export function DocumentsLayout({
  hero,
  groups,
  contacts = [],
  contactsTitle = "Potřebujete pomoci s dokumenty?",
  assurance,
  grant,
  legalLinks = [],
  links = [],
  children,
  copy,
  editBranchId,
}: DocumentsLayoutProps) {
  const c = makeCopy({ copy, editBranchId });
  const withItems = groups.filter((g) => g.items.length > 0);

  return (
    <>
      <section className={`${wrap} py-12 lg:py-14`}>
        <div className="mx-auto max-w-3xl text-center">
          <span className="inline-flex h-12 w-12 items-center justify-center rounded-2xl bg-brand-light text-brand">
            <FileText className="h-6 w-6" strokeWidth={1.75} />
          </span>
          <TextSlot
            as="h1"
            target={hero.edit?.title}
            value={hero.title}
            className="font-display mt-4 block text-4xl text-foreground sm:text-5xl"
          />
          <TextSlot
            as="p"
            target={hero.edit?.lead}
            value={hero.lead}
            className="mt-4 block text-base leading-relaxed text-muted-foreground"
          />
        </div>

        {/* Rychlý výběr */}
        {withItems.length > 1 ? (
          <div className="mt-8 grid gap-4 sm:grid-cols-2">
            {withItems.map((g) => (
              <Link
                key={g.id}
                href={`#${g.id}`}
                className="group flex items-center gap-4 rounded-2xl border border-border bg-card p-5 hover:border-brand/40"
              >
                <g.icon className="h-7 w-7 shrink-0 text-brand" strokeWidth={1.75} />
                <div>
                  <TextSlot
                    as="h3"
                    target={g.edit?.title}
                    value={g.title}
                    className="font-display text-lg text-foreground group-hover:text-brand"
                  />
                  {g.lead ? (
                    <TextSlot
                      as="p"
                      target={g.edit?.lead}
                      value={g.lead}
                      className="text-sm text-muted-foreground"
                    />
                  ) : null}
                </div>
              </Link>
            ))}
          </div>
        ) : null}
      </section>

      {withItems.map((g) => (
        <RegionSlot key={g.id} {...(g.region ?? {})}>
        <section id={g.id} className={`${wrap} scroll-mt-24 pb-12`}>
          <TextSlot
            as="h2"
            target={g.edit?.title}
            value={g.title}
            className="font-display text-2xl text-foreground sm:text-3xl"
          />
          <div className="mt-6 grid gap-4 sm:grid-cols-2">
            {g.items.map((item) => (
              <RegionSlot key={item.key} {...(item.region ?? {})}>
                <DocCard c={c} item={item} />
              </RegionSlot>
            ))}
          </div>
        </section>
        </RegionSlot>
      ))}

      {children}

      {contacts.length > 0 ? (
        <RegionSlot {...c.region("sekce.dokumenty.pomoc")}>
        <section className="bg-secondary/40">
          <div className={`${wrap} py-14`}>
            {c.t("dokumenty.pomoc.nadpis", contactsTitle, {
              as: "h2",
              className: "font-display text-2xl text-foreground sm:text-3xl",
            })}
            <div className="mt-6 grid gap-5 md:grid-cols-2">
              {contacts.map((c) => (
                <ContactCard key={c.key} contact={c} />
              ))}
            </div>
          </div>
        </section>
        </RegionSlot>
      ) : null}

      {assurance ? (
        <RegionSlot {...c.region("sekce.dokumenty.ujisteni")}>
        <section className={`${wrap} py-12`}>
          <div className="flex flex-col items-center gap-4 rounded-3xl bg-brand-light/50 p-8 text-center sm:flex-row sm:justify-between sm:text-left">
            <div className="flex items-center gap-4">
              <HandHelping
                className="hidden h-8 w-8 shrink-0 text-brand sm:block"
                strokeWidth={1.5}
              />
              <p className="max-w-xl text-base text-foreground">
                <strong>
                  <TextSlot
                    target={assurance.edit?.strong}
                    value={assurance.strong}
                  />
                </strong>{" "}
                <TextSlot target={assurance.edit?.text} value={assurance.text} />
              </p>
            </div>
            <Link
              href={assurance.cta.href}
              className="inline-flex shrink-0 items-center gap-2 rounded-full bg-brand px-6 py-3 text-sm font-semibold text-brand-foreground hover:bg-brand-dark"
            >
              {c.t("dokumenty.ujisteni.cta", assurance.cta.label)}
            </Link>
          </div>
        </section>
        </RegionSlot>
      ) : null}

      {grant ? (
        <section className={`${wrap} pb-12`}>
          <details className="group rounded-2xl border border-border bg-card p-6 [&_summary]:list-none">
            <summary className="flex cursor-pointer items-center justify-between gap-3">
              <span>
                <TextSlot
                  as="span"
                  target={grant.edit?.eyebrow}
                  value={grant.eyebrow}
                  className="text-[11px] font-bold uppercase tracking-[0.18em] text-warm-dark"
                />
                <TextSlot
                  as="span"
                  target={grant.edit?.title}
                  value={grant.title}
                  className="font-display mt-1 block text-lg text-foreground"
                />
                <TextSlot
                  as="span"
                  target={grant.edit?.text}
                  value={grant.text}
                  className="mt-1 block text-sm text-muted-foreground"
                />
              </span>
              <ChevronDown className="h-5 w-5 shrink-0 text-brand transition-transform group-open:rotate-180" />
            </summary>
            <div className="mt-5 grid gap-3 sm:grid-cols-3">
              {grant.rows.map(([k, v]) => (
                <div key={k} className="rounded-xl bg-secondary/60 p-4">
                  <div className="text-[11px] font-bold uppercase tracking-wider text-muted-foreground">
                    {k}
                  </div>
                  <div className="mt-1 font-semibold text-foreground">{v}</div>
                </div>
              ))}
            </div>
          </details>
        </section>
      ) : null}

      {legalLinks.length > 0 || links.length > 0 ? (
        <section className={`${wrap} pb-16`}>
          {legalLinks.length > 0 ? (
            <div className="flex flex-wrap gap-4 text-sm">
              {legalLinks.map((l, i) => (
                <span key={l.href + l.label} className="flex items-center gap-4">
                  {i > 0 ? <span className="text-border">·</span> : null}
                  <Link href={l.href} className="text-brand hover:underline">
                    {c.t(`dokumenty.pravni.${i}`, l.label)}
                  </Link>
                </span>
              ))}
            </div>
          ) : null}
          {links.length > 0 ? (
            <div className="mt-8 grid gap-4 sm:grid-cols-3">
              {links.map((l, i) => (
                <Link
                  key={l.title}
                  href={l.href}
                  className="group rounded-2xl border border-border bg-card p-5 hover:-translate-y-1 hover:shadow-md"
                >
                  {c.t(`dokumenty.odkazy.${i}.nadpis`, l.title, {
                    as: "h4",
                    className:
                      "font-display text-lg text-foreground group-hover:text-brand",
                  })}
                  {c.t(`dokumenty.odkazy.${i}.text`, l.desc, {
                    as: "p",
                    className: "mt-1.5 text-sm text-muted-foreground",
                  })}
                  <span className="mt-3 inline-flex items-center gap-1.5 text-xs font-bold uppercase tracking-wider text-brand">
                    {c.t("dokumenty.odkazy.otevrit", "Otevřít")} <ArrowRight className="h-3.5 w-3.5" />
                  </span>
                </Link>
              ))}
            </div>
          ) : null}
        </section>
      ) : null}
    </>
  );
}
