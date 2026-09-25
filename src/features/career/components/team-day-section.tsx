import Image from "next/image";
import { Quote } from "lucide-react";
import { makeCopy, type CopyProps } from "@/features/inline-edit/copy";
import { RegionSlot } from "@/features/inline-edit/components/content-slot";


interface TeamQuote {
  text: string;
  author: string;
  role: string;
}

const QUOTES: TeamQuote[] = [
  {
    text: "Ráno začínáme předáním služby. A pak už je každý den trochu jiný.",
    author: "Veronika",
    role: "Všeobecná sestra",
  },
  {
    text: "Na své práci mám nejraději vztahy s klienty. Člověk vidí, že to, co dělá, má opravdu smysl.",
    author: "Petra",
    role: "Pečovatelka",
  },
  {
    text: "Nejvíc mě překvapilo, jak moc si tu kolegové pomáhají.",
    author: "Tomáš",
    role: "Sanitář",
  },
];

export function TeamDaySection({ copy, editBranchId }: CopyProps) {
  const c = makeCopy({ copy, editBranchId });
  return (
    <RegionSlot {...c.region("sekce.kariera.den")}>
    <section id="tymy" className="mx-auto max-w-[1320px] px-6 py-20 lg:px-10 lg:py-28">
      <div className="grid gap-14 lg:grid-cols-12 lg:gap-16">
        <div className="lg:col-span-5">
          <div className="lg:sticky lg:top-28">
            {c.t("kariera.den.eyebrow", "Jak to u nás doopravdy vypadá", { as: "div", className: "text-[11px] font-bold uppercase tracking-[0.22em] text-warm-dark" })}
            {c.t("kariera.den.nadpis", "Den v AHC", { as: "h2", className: "font-display mt-3 text-4xl text-foreground sm:text-5xl" })}
            {c.t("kariera.den.text", "Žádné marketingové fráze. Tohle jsou slova lidí, kteří u nás skutečně pracují — a to nejen na jedné směně.", { as: "p", className: "mt-5 text-base leading-relaxed text-muted-foreground" })}

            <div className="relative mt-10 aspect-[4/5] overflow-hidden rounded-[2rem] shadow-lg">
              <Image
                src={c.s("kariera.den.foto", "/images/team/team-2.jpg")}
                alt="Tým AHC"
                fill
                quality={88}
                sizes="(min-width: 1024px) 40vw, 100vw"
                className="object-cover"
              />
              {c.img("kariera.den.foto")}
            </div>
          </div>
        </div>

        <ul className="space-y-5 lg:col-span-7">
          {QUOTES.map((q, i) => (
            <RegionSlot key={q.author} {...c.region(`kariera.den.citat.${i}`)}>
            <li>
              <figure className="relative rounded-3xl border border-border bg-card p-7 shadow-sm transition-shadow hover:shadow-md sm:p-9">
                <Quote
                  className="h-8 w-8 text-warm"
                  strokeWidth={1.5}
                  aria-hidden="true"
                />
                {c.t(`kariera.den.citat.${i}.text`, q.text, { as: "blockquote", className: "font-display mt-4 block text-xl leading-snug text-foreground sm:text-2xl" })}
                <figcaption className="mt-6 text-sm">
                  {c.t(`kariera.den.citat.${i}.jmeno`, q.author, { as: "span", className: "font-bold text-foreground" })}
                  <span className="text-muted-foreground">{" — "}{c.t(`kariera.den.citat.${i}.role`, q.role)}</span>
                </figcaption>
              </figure>
            </li>
            </RegionSlot>
          ))}
        </ul>
      </div>
    </section>
    </RegionSlot>
  );
}
