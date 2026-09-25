"use client";

import { useEffect, useState } from "react";
import { useFieldArray, useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { useMutation, useQuery } from "convex/react";
import { toast } from "sonner";
import { GripVertical, Plus, Save, Trash2 } from "lucide-react";
import { api } from "@/convex/_generated/api";
import type { Id } from "@/convex/_generated/dataModel";
import { cn } from "@/lib/utils";

const statsSchema = z.object({
  stats: z
    .array(
      z.object({
        value: z.string().trim().min(1, "Vyplňte číslo nebo údaj."),
        label: z.string().trim().min(1, "Vyplňte popisek."),
        icon: z.string().trim().optional(),
      })
    )
    .max(4, "Zobrazují se maximálně 4 údaje."),
});

type StatsValues = z.infer<typeof statsSchema>;

const fieldBase =
  "w-full rounded-xl border border-border bg-secondary/40 px-4 py-3 text-base text-foreground placeholder:text-muted-foreground/60 transition-colors focus:border-brand focus:bg-background focus:outline-none focus:ring-2 focus:ring-brand/20";
const labelBase =
  "mb-2 block text-xs font-bold uppercase tracking-wider text-foreground/70";

/** Nejčastější ikony pro tuto sekci; jde napsat i libovolný jiný lucide název. */
const ICON_OPTIONS = [
  { value: "BedDouble", label: "Lůžko" },
  { value: "DoorOpen", label: "Dveře / pokoje" },
  { value: "MapPin", label: "Mapový bod" },
  { value: "CalendarHeart", label: "Kalendář" },
  { value: "Home", label: "Domov" },
  { value: "Stethoscope", label: "Stetoskop" },
  { value: "Users", label: "Lidé" },
  { value: "HeartHandshake", label: "Péče" },
  { value: "Clock", label: "Hodiny" },
  { value: "Sparkles", label: "Jiskry" },
];

/**
 * Editor sekce „V číslech" na homepage pobočky.
 * Hodnota i popisek jsou volný text — pobočka si tak určí jednotky („24/7")
 * i správné skloňování („km od Příbrami").
 */
export function BranchStatsEditor({ branchId }: { branchId: Id<"branches"> }) {
  const existing = useQuery(api.modules.branches.queries.listStats, {
    branch_id: branchId,
  });
  const save = useMutation(api.modules.branches.mutations.saveStats);
  const [loading, setLoading] = useState(false);

  const {
    register,
    control,
    handleSubmit,
    reset,
    formState: { errors },
  } = useForm<StatsValues>({
    resolver: zodResolver(statsSchema),
    defaultValues: { stats: [] },
  });

  const { fields, append, remove } = useFieldArray({ control, name: "stats" });

  useEffect(() => {
    if (!existing) return;
    reset({
      stats: existing.map((s) => ({
        value: s.value,
        label: s.label,
        icon: s.icon ?? "",
      })),
    });
  }, [existing, reset]);

  async function onSubmit(values: StatsValues) {
    setLoading(true);
    try {
      await save({
        branch_id: branchId,
        stats: values.stats.map((s) => ({
          value: s.value,
          label: s.label,
          icon: s.icon || undefined,
        })),
      });
      toast.success("Sekce „V číslech“ uložena.");
    } catch (err) {
      toast.error(err instanceof Error ? err.message : "Chyba uložení.");
    } finally {
      setLoading(false);
    }
  }

  return (
    <fieldset className="rounded-2xl border border-border bg-card p-6">
      <legend className="px-2 text-[11px] font-bold uppercase tracking-[0.22em] text-warm-dark">
        Sekce „V číslech"
      </legend>

      <p className="mt-2 text-sm leading-relaxed text-muted-foreground">
        Údaje na barevném pruhu homepage. Číslo i popisek si píšete sami — dá se
        tak napsat „24/7" nebo správně vyskloňovat „km od Příbrami". Zobrazí se
        maximálně čtyři. Když sekci necháte prázdnou, web si údaje doplní
        z kapacity a polohy pobočky.
      </p>

      <div className="mt-6 space-y-4">
        {fields.length === 0 ? (
          <p className="rounded-xl border border-dashed border-border px-4 py-6 text-center text-sm text-muted-foreground">
            Zatím žádný údaj. Přidejte první tlačítkem níže.
          </p>
        ) : null}

        {fields.map((field, i) => (
          <div
            key={field.id}
            className="rounded-xl border border-border bg-secondary/20 p-4"
          >
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2 text-xs font-bold uppercase tracking-wider text-muted-foreground">
                <GripVertical className="h-4 w-4" strokeWidth={2} />
                {i + 1}. údaj
              </div>
              <button
                type="button"
                onClick={() => remove(i)}
                className="inline-flex items-center gap-1.5 rounded-full px-3 py-1.5 text-xs font-semibold text-destructive transition-colors hover:bg-destructive/10"
              >
                <Trash2 className="h-3.5 w-3.5" strokeWidth={2} />
                Odebrat
              </button>
            </div>

            <div className="mt-4 grid gap-4 sm:grid-cols-[1fr_1.6fr_1fr]">
              <div>
                <label htmlFor={`stats.${i}.value`} className={labelBase}>
                  Číslo / údaj
                </label>
                <input
                  id={`stats.${i}.value`}
                  placeholder="54"
                  className={cn(
                    fieldBase,
                    errors.stats?.[i]?.value && "border-destructive"
                  )}
                  {...register(`stats.${i}.value`)}
                />
                {errors.stats?.[i]?.value ? (
                  <p className="mt-1.5 text-xs font-medium text-destructive">
                    {errors.stats[i]?.value?.message}
                  </p>
                ) : null}
              </div>

              <div>
                <label htmlFor={`stats.${i}.label`} className={labelBase}>
                  Popisek
                </label>
                <input
                  id={`stats.${i}.label`}
                  placeholder="lůžek domova pro seniory"
                  className={cn(
                    fieldBase,
                    errors.stats?.[i]?.label && "border-destructive"
                  )}
                  {...register(`stats.${i}.label`)}
                />
                {errors.stats?.[i]?.label ? (
                  <p className="mt-1.5 text-xs font-medium text-destructive">
                    {errors.stats[i]?.label?.message}
                  </p>
                ) : null}
              </div>

              <div>
                <label htmlFor={`stats.${i}.icon`} className={labelBase}>
                  Ikona
                </label>
                <select
                  id={`stats.${i}.icon`}
                  className={fieldBase}
                  {...register(`stats.${i}.icon`)}
                >
                  <option value="">Bez ikony</option>
                  {ICON_OPTIONS.map((o) => (
                    <option key={o.value} value={o.value}>
                      {o.label}
                    </option>
                  ))}
                </select>
              </div>
            </div>
          </div>
        ))}

        {errors.stats?.root ? (
          <p className="text-xs font-medium text-destructive">
            {errors.stats.root.message}
          </p>
        ) : null}

        <div className="flex flex-col gap-3 pt-1 sm:flex-row sm:items-center sm:justify-between">
          <button
            type="button"
            disabled={fields.length >= 4}
            onClick={() => append({ value: "", label: "", icon: "" })}
            className="inline-flex items-center justify-center gap-2 rounded-full border border-border bg-background px-5 py-2.5 text-sm font-semibold text-foreground transition-colors hover:border-brand hover:text-brand disabled:cursor-not-allowed disabled:opacity-50"
          >
            <Plus className="h-4 w-4" strokeWidth={2.25} />
            Přidat údaj
          </button>

          <button
            type="button"
            disabled={loading}
            onClick={handleSubmit(onSubmit)}
            className="inline-flex items-center justify-center gap-2 rounded-full bg-brand px-6 py-2.5 text-sm font-semibold text-brand-foreground transition-colors hover:bg-brand-dark disabled:cursor-not-allowed disabled:opacity-60"
          >
            <Save className="h-4 w-4" strokeWidth={2} />
            {loading ? "Ukládám…" : "Uložit sekci"}
          </button>
        </div>
      </div>
    </fieldset>
  );
}
