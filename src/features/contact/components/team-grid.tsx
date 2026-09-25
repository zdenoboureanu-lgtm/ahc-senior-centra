import { Phone, Mail } from "lucide-react";
import type { BranchTeamMember } from "@/convex/lib/types";
import { makeCopy, type CopyProps } from "@/features/inline-edit/copy";
import {
  RegionSlot,
  TextSlot,
} from "@/features/inline-edit/components/content-slot";

interface TeamGridProps extends CopyProps {
  team: BranchTeamMember[];
}

export function TeamGrid({ team, copy, editBranchId }: TeamGridProps) {
  const c = makeCopy({ copy, editBranchId });
  const field = (id: string, name: "role" | "name" | "bio") =>
    editBranchId
      ? ({ kind: "field", table: "branch_team", id, field: name } as const)
      : undefined;
  const row = (id: string) => ({ kind: "row", table: "branch_team", id }) as const;

  if (team.length === 0) return null;

  return (
    <section className="mx-auto max-w-[1320px] px-6 py-14 lg:px-10">
      {c.t("tym.nadpis", "Náš tým", {
        as: "h2",
        className:
          "font-display block text-center text-3xl text-foreground sm:text-4xl",
      })}
      <div className="mt-10 grid gap-5 sm:grid-cols-2 lg:grid-cols-3">
        {team.map((m) => (
          <RegionSlot
            key={m._id}
            className="h-full"
            {...c.region(`row:branch_team:${m._id}`, row(m._id), row(m._id))}
          >
          <div className="h-full rounded-2xl bg-card p-6 shadow-sm ring-1 ring-border/60">
            <TextSlot
              as="div"
              target={field(m._id, "role")}
              value={m.role}
              className="text-xs font-bold uppercase tracking-wider text-brand"
            />
            <TextSlot
              as="h3"
              target={field(m._id, "name")}
              value={m.name}
              className="mt-2 block text-lg font-bold text-foreground"
            />
            <div className="mt-4 space-y-2 text-sm">
              {m.phone ? (
                <a
                  href={`tel:${m.phone.replace(/\s/g, "")}`}
                  className="flex items-center gap-2 text-muted-foreground hover:text-brand"
                >
                  <Phone className="h-3.5 w-3.5" />
                  {m.phone}
                </a>
              ) : null}
              {m.email ? (
                <a
                  href={`mailto:${m.email}`}
                  className="flex items-center gap-2 text-muted-foreground hover:text-brand"
                >
                  <Mail className="h-3.5 w-3.5" />
                  {m.email}
                </a>
              ) : null}
            </div>
          </div>
          </RegionSlot>
        ))}
      </div>
    </section>
  );
}
