import { Quote } from "lucide-react";

export function CareerStorySection() {
  return (
    <section className="mx-auto max-w-4xl px-4 py-16 sm:px-6 lg:px-8">
      <h2 className="text-center text-3xl font-bold tracking-tight text-foreground sm:text-4xl">
        Příběhy zaměstnanců
      </h2>
      <figure className="relative mt-10 rounded-3xl bg-secondary/40 p-8 sm:p-10">
        <Quote
          aria-hidden="true"
          className="absolute right-6 top-6 h-10 w-10 text-warm/60"
        />
        <blockquote className="text-base leading-relaxed text-foreground sm:text-lg">
          „V AHC jsem našla práci, která mi dává smysl. Klienti i kolegové
          tvoří jednu velkou rodinu. Vedení podporuje náš odborný růst a
          umožňuje nám dělat tu nejlepší péči, jakou si naši klienti zaslouží."
        </blockquote>
        <figcaption className="mt-6 text-sm">
          <span className="font-bold text-foreground">Simona Hlavová</span>
          <span className="text-muted-foreground">
            {" "}
            — regionální ředitelka Sestřička.cz
          </span>
        </figcaption>
      </figure>
    </section>
  );
}
