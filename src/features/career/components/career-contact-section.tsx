import { Mail, Phone, ArrowRight } from "lucide-react";
import { makeCopy, type CopyProps } from "@/features/inline-edit/copy";
import { RegionSlot } from "@/features/inline-edit/components/content-slot";


const CONTACT = {
  name: "Iva Marešová",
  role: "HR — Nábor a kariéra",
  email: "kariera@ahc.cz",
};

export function CareerContactSection({ copy, editBranchId }: CopyProps) {
  const c = makeCopy({ copy, editBranchId });
  return (
    <RegionSlot {...c.region("sekce.kariera.kontakt")}>
    <section
      id="kontakt"
      className="mx-auto max-w-[1320px] px-6 py-20 lg:px-10 lg:py-24"
    >
      <div className="relative overflow-hidden rounded-[2.5rem] bg-gradient-to-br from-brand-dark via-brand to-brand-dark p-10 text-brand-foreground shadow-2xl shadow-brand/20 sm:p-14 lg:p-20">
        <div
          aria-hidden="true"
          className="pointer-events-none absolute -right-20 -top-20 h-72 w-72 rounded-full bg-warm/30 blur-3xl animate-pulse-blob"
        />
        <div
          aria-hidden="true"
          className="pointer-events-none absolute -bottom-32 -left-20 h-80 w-80 rounded-full bg-brand-foreground/10 blur-3xl animate-float-slow"
        />

        <div className="relative grid items-center gap-10 lg:grid-cols-[1.4fr_1fr] lg:gap-16">
          <div>
            {c.t("kariera.kontakt.eyebrow", "Kontakt", { as: "div", className: "text-[11px] font-bold uppercase tracking-[0.22em] text-warm" })}
            {c.t("kariera.kontakt.nadpis", "Ozvěte se nezávazně", { as: "h2", className: "font-display mt-4 text-4xl leading-[1.05] sm:text-5xl" })}
            {c.t("kariera.kontakt.text", "Nemusíte vědět, na jakou pozici nastoupit. Napište nám pár vět o sobě — najdeme dohromady to, co dává smysl.", { as: "p", className: "mt-5 max-w-xl text-base leading-[1.7] text-brand-foreground/85" })}

            <div className="mt-10 flex flex-wrap gap-4">
              <a
                href={`mailto:${CONTACT.email}`}
                className="group inline-flex items-center gap-3 rounded-full bg-brand-foreground px-7 py-4 text-sm font-bold uppercase tracking-wider text-brand shadow-lg transition-all hover:scale-[1.02] hover:bg-warm hover:text-warm-foreground"
              >
                <Mail className="h-4 w-4" strokeWidth={2.25} />
                {CONTACT.email}
                <ArrowRight className="h-4 w-4 transition-transform group-hover:translate-x-0.5" />
              </a>
            </div>
          </div>

          <div className="rounded-3xl bg-brand-foreground/10 p-7 backdrop-blur-sm ring-1 ring-brand-foreground/15">
            <div className="text-[11px] font-bold uppercase tracking-[0.22em] text-warm">
              Kontaktní osoba
            </div>
            <div className="font-display mt-4 text-2xl text-brand-foreground">
              {CONTACT.name}
            </div>
            <div className="mt-1 text-sm text-brand-foreground/75">
              {CONTACT.role}
            </div>
            <ul className="mt-6 space-y-3 text-sm">
              <li>
                <a
                  href={`mailto:${CONTACT.email}`}
                  className="inline-flex items-center gap-2 text-brand-foreground hover:text-warm"
                >
                  <Mail className="h-4 w-4" strokeWidth={2} />
                  {CONTACT.email}
                </a>
              </li>
              <li className="inline-flex items-center gap-2 text-brand-foreground/70">
                <Phone className="h-4 w-4" strokeWidth={2} />
                Telefon dle pobočky
              </li>
            </ul>
          </div>
        </div>
      </div>
    </section>
    </RegionSlot>
  );
}
