import {
  Phone,
  FileText,
  Mail,
  ClipboardCheck,
  Stethoscope,
  ListChecks,
  HeartHandshake,
  Briefcase,
  Flag,
} from "lucide-react";
import type { LucideIcon } from "lucide-react";
import type { BranchAdmissionStep } from "@/convex/lib/types";
import { makeCopy, type CopyProps } from "@/features/inline-edit/copy";
import {
  RegionSlot,
  TextSlot,
} from "@/features/inline-edit/components/content-slot";

const STEP_ICONS: LucideIcon[] = [
  Phone,
  FileText,
  Mail,
  ClipboardCheck,
  Stethoscope,
  ListChecks,
  HeartHandshake,
  Briefcase,
];

interface AdmissionStepsFlowProps extends CopyProps {
  steps: BranchAdmissionStep[];
}

export function AdmissionStepsFlow({
  steps,
  copy,
  editBranchId,
}: AdmissionStepsFlowProps) {
  const c = makeCopy({ copy, editBranchId });
  // Texty kroků jsou v databázi — editujeme je přímo na záznamu, ať se
  // změna propíše i do administrace.
  const field = (id: string, name: "title" | "description") =>
    editBranchId
      ? ({ kind: "field", table: "branch_admission_steps", id, field: name } as const)
      : undefined;

  if (steps.length === 0) return null;

  return (
    <div className="relative mx-auto max-w-3xl">
      {/* Průběžná linka procházející všemi body */}
      <div
        aria-hidden="true"
        className="absolute bottom-10 left-7 top-7 w-1 rounded-full bg-gradient-to-b from-warm via-warm/60 to-brand/40 sm:left-9"
      />

      <ol className="space-y-3">
        {steps.map((s) => {
          const Icon = STEP_ICONS[s.step_number - 1] ?? FileText;
          return (
            <RegionSlot
              key={s._id}
              {...c.region(`row:branch_admission_steps:${s._id}`)}
            >
            <li
              className="relative grid grid-cols-[3.5rem_1fr] gap-5 sm:grid-cols-[4.5rem_1fr] sm:gap-7"
            >
              {/* Bod na lince */}
              <div className="flex justify-center pt-1">
                <div className="relative z-10 flex h-14 w-14 flex-col items-center justify-center rounded-full bg-brand text-brand-foreground shadow-lg shadow-brand/25 ring-4 ring-background sm:h-[4.5rem] sm:w-[4.5rem]">
                  <span className="font-display text-xl leading-none sm:text-2xl">
                    {s.step_number}
                  </span>
                  <Icon
                    className="mt-1 h-3.5 w-3.5 text-warm sm:h-4 sm:w-4"
                    strokeWidth={2}
                  />
                </div>
              </div>

              {/* Obsah kroku */}
              <div className="pb-8">
                <div className="rounded-2xl border border-border/60 bg-card p-6 shadow-sm transition-all hover:border-brand/30 hover:shadow-md sm:p-7">
                  <div className="text-[11px] font-bold uppercase tracking-[0.22em] text-warm-dark">
                    Krok {s.step_number} z {steps.length}
                  </div>
                  <TextSlot
                    as="h3"
                    target={field(s._id, "title")}
                    value={s.title}
                    className="font-display mt-2 block text-xl text-foreground sm:text-2xl"
                  />
                  <TextSlot
                    as="p"
                    target={field(s._id, "description")}
                    value={s.description}
                    className="mt-3 block text-[15px] leading-relaxed text-muted-foreground"
                  />
                </div>
              </div>
            </li>
            </RegionSlot>
          );
        })}

        {/* Cíl */}
        <li className="relative grid grid-cols-[3.5rem_1fr] gap-5 sm:grid-cols-[4.5rem_1fr] sm:gap-7">
          <div className="flex justify-center">
            <div className="relative z-10 flex h-14 w-14 items-center justify-center rounded-full bg-warm text-warm-foreground shadow-lg ring-4 ring-background sm:h-[4.5rem] sm:w-[4.5rem]">
              <Flag className="h-6 w-6" strokeWidth={2} />
            </div>
          </div>
          <div className="flex items-center">
            <p className="font-display text-xl text-foreground sm:text-2xl">
              {c.t("zadost.kroky.cil", "Vítejte u nás.")}{" "}
              {c.t("zadost.kroky.cil2", "Jsme tu pro vás.", {
                className: "text-brand",
              })}
            </p>
          </div>
        </li>
      </ol>
    </div>
  );
}
