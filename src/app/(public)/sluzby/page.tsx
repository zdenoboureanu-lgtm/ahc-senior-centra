import * as Icons from "lucide-react";
import Image from "next/image";
import Link from "next/link";
import {
  ArrowRight,
  ClipboardList,
  Contact as ContactIcon,
  FileText,
  Receipt,
  UserCheck,
} from "lucide-react";
import { fetchQuery } from "convex/nextjs";
import { api } from "@/convex/_generated/api";
import { getBranchSlugFromHeaders } from "@/common/lib/branch";
import { canEditContent } from "@/common/lib/can-edit";
import { RichContent, anchorId } from "@/features/site/components/rich-content";
import { ServicesSedlec } from "@/features/branch-page/components/services-sedlec";
import { loadBranchPageContext } from "@/features/inline-edit/load-copy";
import { SEDLEC_TEMPLATE } from "@/common/lib/branch-template";
import { makeCopy, type CopyProps } from "@/features/inline-edit/copy";
import {
  RegionSlot,
  TextSlot,
} from "@/features/inline-edit/components/content-slot";
import type { EditTarget } from "@/features/inline-edit/edit-mode-context";

const wrap = "mx-auto max-w-[1320px] px-6 lg:px-10";

const BESPOKE_SERVICES: Record<string, (p: CopyProps) => React.ReactElement> = {
  [SEDLEC_TEMPLATE]: ServicesSedlec,
};

/** Rozcestník pod stránkou — stejná čtveřice odkazů jako na Sedlci-Prčici. */
const ODKAZY = [
  {
    icon: ClipboardList,
    t: "Žádost o přijetí",
    d: "Postup přijetí, dokumenty a pokyny k nástupu.",
    href: "/zadost-o-prijeti",
  },
  {
    icon: FileText,
    t: "Dokumenty",
    d: "Žádosti, lékařské zprávy, souhlasy a formuláře.",
    href: "/dokumenty",
  },
  {
    icon: Receipt,
    t: "Ceníky",
    d: "Aktuální informace o úhradách a službách.",
    href: "/dokumenty",
  },
  {
    icon: ContactIcon,
    t: "Kontakty",
    d: "Sociální pracovnice a jednotlivá pracoviště.",
    href: "/kontakt",
  },
];

/** Bez diakritiky a malými písmeny — pro porovnávání názvů služeb s nadpisy. */
function norm(text: string): string {
  return text
    .normalize("NFD")
    .replace(/\p{Diacritic}/gu, "")
    .toLowerCase();
}

export default async function ServicesPage() {
  const slug = await getBranchSlugFromHeaders();
  if (slug) {
    const ctx = await loadBranchPageContext(slug);
    const Bespoke = ctx.template ? BESPOKE_SERVICES[ctx.template] : undefined;
    if (Bespoke)
      return <Bespoke copy={ctx.copy} editBranchId={ctx.editBranchId} />;
  }
  const [data, pageContent, canEdit, siteCopy] = await Promise.all([
    slug
      ? fetchQuery(api.modules.branches.queries.getHomepage, { slug }).catch(
          () => null
        )
      : Promise.resolve(null),
    slug
      ? fetchQuery(api.modules.branches.queries.getBranchPage, {
          slug,
          page: "sluzby",
        }).catch(() => null)
      : Promise.resolve(null),
    canEditContent(),
    slug
      ? fetchQuery(api.modules.content.queries.getCopy, { slug }).catch(
          () => ({}) as Record<string, string>
        )
      : Promise.resolve({} as Record<string, string>),
  ]);

  const c = makeCopy({
    copy: siteCopy,
    editBranchId: canEdit ? data?.branch._id : undefined,
  });

  // Fotky do článkových sekcí — zázemí i život v centru, bez titulní fotky.
  const articleImages = [
    ...(data?.facilities ?? []).map((f) => ({
      src: f.image_url,
      label: f.title,
      edit: { table: "branch_facilities", id: f._id, field: "image_url" },
    })),
    ...(data?.gallery ?? []).map((g) => ({
      src: g.image_url,
      label: g.caption,
      edit: { table: "branch_gallery", id: g._id, field: "image_url" },
    })),
  ].filter((im) => im.src && im.src !== data?.branch.cover_image);

  const ctaContact = data
    ? {
        name: data.branch.office_contact_name ?? undefined,
        role: data.branch.office_contact_name ? "Kontaktní osoba" : undefined,
        phone: data.branch.office_contact_phone ?? data.branch.phone,
        email: data.branch.office_contact_email ?? data.branch.email,
      }
    : undefined;

  const headings = (pageContent?.blocks ?? [])
    .filter((b) => b.type === "heading" && b.text)
    .map((b) => b.text as string);

  // Rozcestník služeb nahoře — jako „Vyberte službu podle své situace" na
  // Sedlci. Hlavní služby poznáme podle nadpisu ve tvaru „Název — o co jde";
  // podsekce (Ubytování, Stravování…) do rozcestníku nepatří, jinak by
  // kachlice zdvojily celý článek.
  const chooserHeadings = headings
    .filter((h) => /\s+[—–]\s+/.test(h))
    .slice(0, 3);
  const chooser = chooserHeadings.map((h, i) => {
    const [name, ...rest] = h.split(/\s+[—–]\s+/);
    const service = (data?.services ?? []).find((s) =>
      norm(name).includes(norm(s.title))
    );
    return {
      id: h,
      title: name.trim(),
      description: rest.join(" — ").trim() || service?.description || "",
      href: `#${anchorId(h)}`,
      image: articleImages[i]?.src,
      icon: service?.icon ?? "Sparkles",
    };
  });
  const navSections = chooserHeadings;
  /** Cíl editace pole hlavičky podstránky. */
  const pageTarget = (path: string): EditTarget | undefined =>
    canEdit && pageContent
      ? { kind: "page", pageId: pageContent._id, path }
      : undefined;

  if (pageContent && pageContent.blocks.length > 0) {
    return (
      <>
        {/* 1. ÚVOD + VÝBĚR SLUŽBY */}
        <section
          id="vyber-sluzby"
          className="scroll-mt-24 bg-gradient-to-b from-brand-light/40 to-background"
        >
          <div className={`${wrap} py-14 lg:py-16`}>
            <div className="mx-auto max-w-3xl text-center">
              <TextSlot
                as="div"
                target={pageTarget("eyebrow")}
                value={pageContent.eyebrow ?? "Služby"}
                className="text-xs font-bold uppercase tracking-[0.22em] text-warm-dark"
              />
              <TextSlot
                as="h1"
                target={pageTarget("title")}
                value={pageContent.title ?? "Naše služby"}
                className="font-display mt-3 block text-balance text-4xl text-foreground sm:text-5xl"
              />
              {pageContent.lead ? (
                <TextSlot
                  as="p"
                  target={pageTarget("lead")}
                  value={pageContent.lead}
                  className="mt-5 block text-base leading-relaxed text-muted-foreground"
                />
              ) : null}
            </div>

            {chooser.length > 0 ? (
              <div
                className={`mt-10 grid gap-5 ${
                  chooser.length > 2 ? "md:grid-cols-3" : "md:grid-cols-2"
                }`}
              >
                {chooser.map((s) => {
                  const Icon =
                    (Icons as unknown as Record<string, Icons.LucideIcon>)[
                      s.icon
                    ] ?? Icons.Sparkles;
                  const inner = (
                    <>
                      {s.image ? (
                        <div className="relative aspect-[16/9] bg-muted">
                          <Image
                            src={s.image}
                            alt={s.title}
                            fill
                            sizes="(min-width:1024px) 45vw, 100vw"
                            className="object-cover"
                          />
                        </div>
                      ) : null}
                      <div className="p-7">
                        {!s.image ? (
                          <span className="mb-4 flex h-12 w-12 items-center justify-center rounded-2xl bg-brand-light text-brand">
                            <Icon className="h-6 w-6" strokeWidth={1.75} />
                          </span>
                        ) : null}
                        <h2 className="font-display text-xl text-foreground group-hover:text-brand sm:text-2xl">
                          {s.title}
                        </h2>
                        {s.description ? (
                          <p className="mt-2 text-[15px] leading-relaxed text-muted-foreground">
                            {s.description}
                          </p>
                        ) : null}
                        {s.href ? (
                          <span className="mt-4 inline-flex items-center gap-1.5 text-xs font-bold uppercase tracking-wider text-brand">
                            Zjistit více o službě{" "}
                            <ArrowRight className="h-3.5 w-3.5" />
                          </span>
                        ) : null}
                      </div>
                    </>
                  );
                  const cls =
                    "group block h-full overflow-hidden rounded-3xl border border-border bg-card transition-all hover:-translate-y-1 hover:border-brand/40 hover:shadow-lg";
                  return (
                    <RegionSlot
                      key={s.id}
                      className="h-full"
                      {...c.region(`sluzby.vyber.${s.href}`)}
                    >
                      {s.href ? (
                        <Link href={s.href} className={cls}>
                          {inner}
                        </Link>
                      ) : (
                        <div className={cls}>{inner}</div>
                      )}
                    </RegionSlot>
                  );
                })}
              </div>
            ) : null}
          </div>
        </section>

        {/* 2. NEJSTE SI JISTÍ */}
        <RegionSlot {...c.region("sekce.sluzby.pomoc")}>
          <section className={`${wrap} py-10`}>
            <div className="flex flex-col items-center gap-4 rounded-3xl bg-secondary/50 p-8 text-center sm:flex-row sm:justify-between sm:text-left">
              <div className="flex items-center gap-4">
                <UserCheck
                  className="hidden h-8 w-8 shrink-0 text-warm sm:block"
                  strokeWidth={1.5}
                />
                <p className="max-w-xl text-base text-foreground">
                  <strong>
                    {c.t(
                      "sluzby.pomoc.tucne",
                      "Nemusíte se v jednotlivých typech péče orientovat sami."
                    )}
                  </strong>{" "}
                  {c.t(
                    "sluzby.pomoc.text",
                    "Popište nám svou situaci a naši sociální pracovníci vám poradí, jaký postup by mohl být vhodný."
                  )}
                </p>
              </div>
              <Link
                href="/kontakt"
                className="inline-flex shrink-0 items-center gap-2 rounded-full bg-brand px-6 py-3 text-sm font-semibold text-brand-foreground hover:bg-brand-dark"
              >
                {c.t("sluzby.pomoc.cta", "Poradit se se sociálním pracovníkem")}
              </Link>
            </div>
          </section>
        </RegionSlot>

        {/* 3. OBSAH STRÁNKY */}
        <RichContent
          // Titulek i perex už jsou v hlavičce nahoře. Perex posíláme jako
          // `title`, aby si ho renderer poznal a nezopakoval ho hned pod ní
          // jako nadpis první sekce.
          page={{ ...pageContent, title: pageContent.lead, lead: undefined }}
          images={articleImages}
          contact={ctaContact}
          navSections={navSections}
          editPageId={canEdit ? pageContent._id : undefined}
          editBranchId={canEdit ? data?.branch._id : undefined}
          copy={siteCopy}
        />

        {/* 4. ROZCESTNÍK */}
        <RegionSlot {...c.region("sekce.sluzby.odkazy")}>
          <section className={`${wrap} pb-20`}>
            <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
              {ODKAZY.map((o) => (
                <Link
                  key={o.href + o.t}
                  href={o.href}
                  className="group flex h-full flex-col rounded-2xl border border-border bg-card p-5 transition-all hover:-translate-y-0.5 hover:border-brand/40 hover:shadow-md"
                >
                  <o.icon className="h-5 w-5 text-brand" strokeWidth={1.75} />
                  <h3 className="font-display mt-3 text-base text-foreground group-hover:text-brand">
                    {o.t}
                  </h3>
                  <p className="mt-1.5 text-sm leading-relaxed text-muted-foreground">
                    {o.d}
                  </p>
                </Link>
              ))}
            </div>
          </section>
        </RegionSlot>
      </>
    );
  }

  // Pobočka zatím nemá článkový obsah — vypíšeme aspoň služby z databáze.
  return (
    <>
      <section className="bg-gradient-to-b from-brand-light/40 to-background">
        <div className={`${wrap} py-14 lg:py-16`}>
          <div className="mx-auto max-w-3xl text-center">
            <div className="text-xs font-bold uppercase tracking-[0.22em] text-warm-dark">
              Naše služby
            </div>
            <h1 className="font-display mt-3 text-4xl text-foreground sm:text-5xl">
              Co u nás najdete
            </h1>
            <p className="mt-5 text-base leading-relaxed text-muted-foreground">
              Komplexní spektrum služeb šitých na míru potřebám seniorů a jejich
              rodin.
            </p>
          </div>
        </div>
      </section>

      <section className={`${wrap} py-16 lg:py-20`}>
        {data && data.services.length > 0 ? (
          <div className="grid gap-5 sm:grid-cols-2 lg:grid-cols-3">
            {data.services.map((s) => {
              const Icon =
                (Icons as unknown as Record<string, Icons.LucideIcon>)[s.icon] ??
                Icons.Sparkles;
              return (
                <div
                  key={s._id}
                  className="h-full rounded-2xl border border-border bg-card p-6"
                >
                  <span className="flex h-12 w-12 items-center justify-center rounded-2xl bg-brand-light text-brand">
                    <Icon className="h-6 w-6" strokeWidth={1.75} />
                  </span>
                  <h3 className="font-display mt-4 text-lg text-foreground">
                    {s.title}
                  </h3>
                  {s.description ? (
                    <p className="mt-2 text-[15px] leading-relaxed text-muted-foreground">
                      {s.description}
                    </p>
                  ) : null}
                </div>
              );
            })}
          </div>
        ) : (
          <p className="text-muted-foreground">Seznam služeb se připravuje.</p>
        )}
      </section>
    </>
  );
}
