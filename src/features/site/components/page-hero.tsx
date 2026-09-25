import { TextSlot } from "@/features/inline-edit/components/content-slot";
import type { EditTarget } from "@/features/inline-edit/edit-mode-context";

interface PageHeroProps {
  eyebrow?: string;
  title: string;
  description?: string;
  /** ID článkové podstránky — zapne inline editaci hlavičky. */
  editPageId?: string;
  /** Vlastní cíle editace (pro stránky psané v kódu). Mají přednost. */
  editTargets?: {
    eyebrow?: EditTarget;
    title?: EditTarget;
    lead?: EditTarget;
  };
}

/** Cíl inline editace pro pole hlavičky podstránky. */
function target(pageId: string | undefined, path: string): EditTarget | undefined {
  return pageId ? { kind: "page", pageId, path } : undefined;
}

export function PageHero({
  eyebrow,
  title,
  description,
  editPageId,
  editTargets,
}: PageHeroProps) {
  const at = (path: "eyebrow" | "title" | "lead") =>
    editTargets?.[path] ?? target(editPageId, path);
  return (
    <section className="bg-gradient-to-b from-brand-light/40 to-background">
      <div className="mx-auto max-w-[1320px] px-6 py-14 lg:px-10 lg:py-16">
        <div className="mx-auto max-w-3xl text-center">
          {eyebrow ? (
            <TextSlot
              as="div"
              target={at("eyebrow")}
              value={eyebrow}
              className="text-xs font-bold uppercase tracking-[0.22em] text-warm-dark"
            />
          ) : null}
          <TextSlot
            as="h1"
            target={at("title")}
            value={title}
            className="font-display mt-3 block text-4xl text-foreground sm:text-5xl"
          />
          {description ? (
            <TextSlot
              as="p"
              target={at("lead")}
              value={description}
              className="mt-5 block text-base leading-relaxed text-muted-foreground"
            />
          ) : null}
        </div>
      </div>
    </section>
  );
}
