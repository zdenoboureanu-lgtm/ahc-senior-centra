import { Building2, Mail, MapPin, Phone } from "lucide-react";
import { ContactForm } from "./contact-form";
import { ChatCtaCard } from "./chat-cta-card";
import {
  RegionSlot,
  TextSlot,
} from "@/features/inline-edit/components/content-slot";
import type { EditTarget } from "@/features/inline-edit/edit-mode-context";
import type { RegionEdit } from "@/features/inline-edit/components/editable-region";
import {
  makeCopy,
  type CopyHelpers,
  type CopyProps,
} from "@/features/inline-edit/copy";
import type { Id } from "@/convex/_generated/dataModel";

/**
 * Sdílený layout podstránky „Kontakty".
 *
 * Vzhled je převzatý ze Sedlce-Prčice a používají ho všechny pobočky —
 * hlavička, karta organizace s mapou, kontaktní osoby, obsah konkrétní
 * pobočky a nakonec chat s formulářem. Jedna komponenta, takže se weby
 * nemůžou vizuálně rozejít.
 */

const wrap = "mx-auto max-w-[1320px] px-6 lg:px-10";

/** Vloží adresu do embedované Google mapy. */
export function mapUrlFor(address: string): string {
  return (
    "https://www.google.com/maps?q=" +
    encodeURIComponent(address) +
    "&hl=cs&z=16&output=embed"
  );
}

export interface ContactPerson {
  key: string;
  lead: string;
  name: string;
  role?: string;
  email?: string;
  phone?: string;
  mobile?: string;
  note?: string;
  edit?: {
    lead?: EditTarget;
    name?: EditTarget;
    role?: EditTarget;
    note?: EditTarget;
    email?: EditTarget;
    phone?: EditTarget;
  };
  /** Skrytí, kopírování a mazání celé karty. */
  region?: { edit?: RegionEdit; hidden: boolean };
}

export interface ContactOrg {
  name: string;
  addressLines: string[];
  /** IČO, DIČ, datová schránka… — vypíší se pod adresou. */
  identifiers?: string[];
  /** Cíle editace jednotlivých identifikátorů (IČO, sídlo). */
  identifierEdits?: (EditTarget | undefined)[];
  phoneLabel?: string;
  phones?: string[];
  phoneNote?: string;
  email?: string;
  mapUrl: string;
  edit?: {
    name?: EditTarget;
    addressLines?: (EditTarget | undefined)[];
    phones?: (EditTarget | undefined)[];
    email?: EditTarget;
  };
}

function PersonCard({ c, person }: { c: CopyHelpers; person: ContactPerson }) {
  return (
    <div className="h-full rounded-2xl border border-border bg-card p-6">
      <TextSlot
        as="div"
        target={person.edit?.lead}
        value={person.lead}
        className="text-[11px] font-bold uppercase tracking-[0.18em] text-warm-dark"
      />
      <TextSlot
        as="div"
        target={person.edit?.name}
        value={person.name}
        className="font-display mt-2 text-xl text-foreground"
      />
      {person.role ? (
        <TextSlot
          as="div"
          target={person.edit?.role}
          value={person.role}
          className="text-sm text-muted-foreground"
        />
      ) : null}
      <div className="mt-4 space-y-1.5 text-sm">
        {person.email ? (
          <div className="flex items-center gap-2">
            <Mail className="h-4 w-4 shrink-0 text-brand" />
            <a
              href={`mailto:${person.email}`}
              className="break-words font-semibold text-foreground hover:text-brand"
            >
              <TextSlot target={person.edit?.email} value={person.email} />
            </a>
          </div>
        ) : null}
        {[person.phone, person.mobile]
          .filter((tel): tel is string => Boolean(tel))
          // Telefon a mobil bývají u menších poboček stejné číslo — stačí jednou.
          .filter((tel, i, all) => all.indexOf(tel) === i)
          .map((tel, i) => (
            <div key={tel} className="flex items-center gap-2">
              <Phone className="h-4 w-4 shrink-0 text-brand" />
              <a
                href={`tel:${tel.replace(/[\s–]/g, "")}`}
                className="font-semibold text-foreground hover:text-brand"
              >
                <TextSlot
                  target={i === 0 ? person.edit?.phone : undefined}
                  value={tel}
                />
              </a>
            </div>
          ))}
      </div>
      {person.note ? (
        <TextSlot
          as="p"
          target={person.edit?.note}
          value={person.note}
          className="mt-4 text-sm leading-relaxed text-muted-foreground"
        />
      ) : null}
      {person.email ? (
        <a
          href={`mailto:${person.email}`}
          className="mt-4 inline-flex items-center gap-2 rounded-full bg-brand px-5 py-2.5 text-sm font-semibold text-brand-foreground hover:bg-brand-dark"
        >
          {c.t("kontakt.osoba.cta", "Napsat e-mail")}
        </a>
      ) : null}
    </div>
  );
}

export interface ContactLayoutProps extends CopyProps {
  hero: {
    eyebrow: string;
    title: string;
    lead: string;
    edit?: { eyebrow?: EditTarget; title?: EditTarget; lead?: EditTarget };
  };
  org: ContactOrg;
  people?: ContactPerson[];
  peopleTitle?: string;
  /** Kontakty a údaje konkrétní pobočky (článek nebo ručně psané karty). */
  children?: React.ReactNode;
  /** Pobočka pro odeslání formuláře. */
  branchId: Id<"branches">;
  formTitle?: string;
  formLead?: string;
  /** Tým, FAQ a reference — vykreslí se, když k nim pobočka má data. */
  after?: React.ReactNode;
}

export function ContactLayout({
  hero,
  org,
  people = [],
  peopleTitle = "Kontaktní osoby",
  children,
  branchId,
  formTitle = "Napište nám",
  formLead = "Máte dotaz k péči, přijetí nebo fungování zařízení? Vyplňte formulář a my se vám ozveme.",
  after,
  copy,
  editBranchId,
}: ContactLayoutProps) {
  const c = makeCopy({ copy, editBranchId });
  return (
    <>
      <section className={`${wrap} py-12 lg:py-16`}>
        <div className="mx-auto max-w-3xl text-center">
          <TextSlot
            as="div"
            target={hero.edit?.eyebrow}
            value={hero.eyebrow}
            className="text-xs font-bold uppercase tracking-[0.22em] text-warm-dark"
          />
          <TextSlot
            as="h1"
            target={hero.edit?.title}
            value={hero.title}
            className="font-display mt-3 block text-4xl text-foreground sm:text-5xl"
          />
          <TextSlot
            as="p"
            target={hero.edit?.lead}
            value={hero.lead}
            className="mt-5 block text-base leading-relaxed text-muted-foreground"
          />
        </div>

        {/* Karta organizace + mapa */}
        <div className="mt-10 grid gap-6 lg:grid-cols-[1fr_1.2fr]">
          <div className="rounded-2xl border border-border bg-card p-6">
            <div className="flex items-center gap-2">
              <Building2 className="h-5 w-5 shrink-0 text-brand" strokeWidth={1.75} />
              <TextSlot
                as="h2"
                target={org.edit?.name}
                value={org.name}
                className="font-display text-lg text-foreground"
              />
            </div>
            <div className="mt-4 flex items-start gap-2 text-sm">
              <MapPin className="mt-0.5 h-4 w-4 shrink-0 text-brand" />
              <div className="text-foreground">
                {org.addressLines.map((line, i) => (
                  <TextSlot
                    key={line}
                    as="div"
                    target={org.edit?.addressLines?.[i]}
                    value={line}
                  />
                ))}
              </div>
            </div>
            {org.identifiers && org.identifiers.length > 0 ? (
              <dl className="mt-4 space-y-1 text-sm text-muted-foreground">
                {org.identifiers.map((row, i) => (
                  <TextSlot
                    key={row}
                    as="div"
                    target={org.identifierEdits?.[i]}
                    value={row}
                  />
                ))}
              </dl>
            ) : null}
            {org.phones && org.phones.length > 0 ? (
              <div className="mt-4 border-t border-border pt-4 text-sm">
                {c.t("kontakt.org.telefon-popis", org.phoneLabel ?? "Telefon", {
                  as: "div",
                  className:
                    "text-[11px] font-bold uppercase tracking-wider text-muted-foreground",
                })}
                <div className="mt-1 flex flex-col gap-1">
                  {org.phones.map((tel, i) => (
                    <a
                      key={tel}
                      href={`tel:${tel.replace(/[\s–]/g, "")}`}
                      className="font-semibold text-foreground hover:text-brand"
                    >
                      <TextSlot target={org.edit?.phones?.[i]} value={tel} />
                    </a>
                  ))}
                  {org.phoneNote ? (
                    <span className="text-muted-foreground">{org.phoneNote}</span>
                  ) : null}
                </div>
              </div>
            ) : null}
            {org.email ? (
              <div className="mt-3 text-sm">
                {c.t("kontakt.org.email-popis", "E-mail", {
                  as: "div",
                  className:
                    "text-[11px] font-bold uppercase tracking-wider text-muted-foreground",
                })}
                <a
                  href={`mailto:${org.email}`}
                  className="mt-1 block break-words font-semibold text-foreground hover:text-brand"
                >
                  <TextSlot target={org.edit?.email} value={org.email} />
                </a>
              </div>
            ) : null}
            {org.phones && org.phones.length > 0 ? (
              <a
                href={`tel:${org.phones[0].replace(/[\s–]/g, "")}`}
                className="mt-5 inline-flex items-center gap-2 rounded-full bg-brand px-5 py-2.5 text-sm font-semibold text-brand-foreground hover:bg-brand-dark"
              >
                <Phone className="h-4 w-4" /> {c.t("kontakt.org.cta", "Zavolat")}
              </a>
            ) : null}
          </div>
          <div className="overflow-hidden rounded-2xl ring-1 ring-border">
            <iframe
              title={`Mapa — ${org.name}`}
              src={org.mapUrl}
              className="h-full min-h-[340px] w-full border-0"
              loading="lazy"
              referrerPolicy="no-referrer-when-downgrade"
            />
          </div>
        </div>
      </section>

      {people.length > 0 ? (
        <RegionSlot {...c.region("sekce.kontakt.osoby")}>
        <section className="bg-secondary/40">
          <div className={`${wrap} py-14`}>
            {c.t("kontakt.pracovnice.nadpis", peopleTitle, {
              as: "h2",
              className: "font-display text-2xl text-foreground sm:text-3xl",
            })}
            <div className="mt-6 grid gap-5 md:grid-cols-2">
              {people.map((p) => (
                <RegionSlot key={p.key} className="h-full" {...(p.region ?? {})}>
                  <PersonCard c={c} person={p} />
                </RegionSlot>
              ))}
            </div>
          </div>
        </section>
        </RegionSlot>
      ) : null}

      {children}

      {/* Chat + formulář */}
      <RegionSlot {...c.region("sekce.kontakt.formular")}>
      <section className="bg-secondary/40">
        <div className={`${wrap} py-14`}>
          <div className="grid gap-6 lg:grid-cols-[1fr_1.2fr]">
            <ChatCtaCard />
            <div>
              <div className="text-center">
                {c.t("kontakt.formular.nadpis", formTitle, {
                  as: "h2",
                  className: "font-display text-2xl text-foreground sm:text-3xl",
                })}
                {c.t("kontakt.formular.text", formLead, {
                  as: "p",
                  className: "mt-3 block text-sm text-muted-foreground",
                })}
              </div>
              <div className="mt-8 rounded-3xl bg-card p-6 shadow-sm ring-1 ring-border/60 sm:p-8">
                <ContactForm branchId={branchId} type="contact" />
              </div>
            </div>
          </div>
        </div>
      </section>
      </RegionSlot>

      {after}
    </>
  );
}
