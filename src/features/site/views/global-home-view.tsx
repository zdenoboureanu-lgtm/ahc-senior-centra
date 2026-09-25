import Link from "next/link";
import { ArrowRight, MapPin } from "lucide-react";
import { fetchQuery } from "convex/nextjs";
import { api } from "../../../../convex/_generated/api";
import { Button } from "@/components/ui/button";

export async function GlobalHomeView() {
  const branches = await fetchQuery(
    api.modules.branches.queries.listPublished,
    {}
  ).catch(() => []);

  return (
    <>
      <section className="bg-gradient-to-br from-brand-light via-background to-background">
        <div className="mx-auto max-w-7xl px-4 py-20 text-center sm:px-6 lg:px-8 lg:py-28">
          <div className="text-xs font-semibold uppercase tracking-[0.18em] text-brand">
            AHC – Senior centra
          </div>
          <h1 className="mx-auto mt-4 max-w-3xl text-4xl font-bold tracking-tight text-foreground sm:text-5xl lg:text-6xl">
            Síť senior center po celé České republice
          </h1>
          <p className="mx-auto mt-5 max-w-2xl text-lg text-muted-foreground">
            Najděte si nejbližší pobočku a domluvte si návštěvu.
          </p>
        </div>
      </section>

      <section className="mx-auto max-w-7xl px-4 py-16 sm:px-6 lg:px-8">
        <h2 className="text-2xl font-bold text-foreground sm:text-3xl">
          Naše pobočky ({branches.length})
        </h2>
        <div className="mt-8 grid gap-5 sm:grid-cols-2 lg:grid-cols-3">
          {branches.map((b) => (
            <a
              key={b._id}
              href={`https://${b.slug}.ahc.cz`}
              className="group rounded-xl border border-border bg-card p-6 shadow-sm transition-shadow hover:shadow-md"
            >
              <div className="text-xs font-semibold uppercase tracking-wider text-brand">
                {b.region}
              </div>
              <h3 className="mt-2 text-xl font-bold text-foreground group-hover:text-brand">
                AHC {b.short_name}
              </h3>
              <div className="mt-3 flex items-start gap-2 text-sm text-muted-foreground">
                <MapPin className="mt-0.5 h-4 w-4 shrink-0 text-brand" />
                <span>
                  {b.street}
                  <br />
                  {b.zip} {b.city}
                </span>
              </div>
              <div className="mt-4 inline-flex items-center text-sm font-semibold text-brand">
                Otevřít web pobočky <ArrowRight className="ml-1 h-4 w-4" />
              </div>
            </a>
          ))}
        </div>

        {branches.length === 0 ? (
          <div className="mt-8 rounded-xl border border-dashed border-border p-8 text-center text-muted-foreground">
            Zatím žádné pobočky. Spusťte seed v Convex dashboardu (
            <code className="rounded bg-muted px-1">seed:runStribroSeed</code>).
          </div>
        ) : null}

        <div className="mt-12 text-center">
          <Button asChild size="lg" className="bg-brand text-brand-foreground hover:bg-brand-dark">
            <Link href="/kariera">Kariéra napříč všemi pobočkami</Link>
          </Button>
        </div>
      </section>
    </>
  );
}
