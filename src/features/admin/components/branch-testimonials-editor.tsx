"use client";

import { useEffect, useState } from "react";
import { useFieldArray, useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { useMutation, useQuery } from "convex/react";
import { toast } from "sonner";
import { Plus, Quote, Save, Trash2 } from "lucide-react";
import { api } from "@/convex/_generated/api";
import type { Id } from "@/convex/_generated/dataModel";
import { cn } from "@/lib/utils";

const schema = z.object({
  testimonials: z.array(
    z.object({
      author_name: z.string().trim().min(1, "Vyplňte jméno."),
      author_role: z.string().trim().optional(),
      content: z.string().trim().min(1, "Vyplňte text recenze."),
    })
  ),
});

type Values = z.infer<typeof schema>;

const fieldBase =
  "w-full rounded-xl border border-border bg-secondary/40 px-4 py-3 text-base text-foreground placeholder:text-muted-foreground/60 transition-colors focus:border-brand focus:bg-background focus:outline-none focus:ring-2 focus:ring-brand/20";
const labelBase =
  "mb-2 block text-xs font-bold uppercase tracking-wider text-foreground/70";

/**
 * Editor recenzí a příběhů pobočky. Zobrazují se na homepage a na „O nás";
 * každé zařízení má vlastní, proto si je pobočka spravuje sama.
 */
export function BranchTestimonialsEditor({
  branchId,
}: {
  branchId: Id<"branches">;
}) {
  const existing = useQuery(api.modules.branches.queries.listTestimonials, {
    branch_id: branchId,
  });
  const save = useMutation(api.modules.branches.mutations.saveTestimonials);
  const [loading, setLoading] = useState(false);

  const {
    register,
    control,
    handleSubmit,
    reset,
    formState: { errors },
  } = useForm<Values>({
    resolver: zodResolver(schema),
    defaultValues: { testimonials: [] },
  });

  const { fields, append, remove } = useFieldArray({
    control,
    name: "testimonials",
  });

  useEffect(() => {
    if (!existing) return;
    reset({
      testimonials: existing.map((t) => ({
        author_name: t.author_name,
        author_role: t.author_role ?? "",
        content: t.content,
      })),
    });
  }, [existing, reset]);

  async function onSubmit(values: Values) {
    setLoading(true);
    try {
      await save({
        branch_id: branchId,
        testimonials: values.testimonials.map((t) => ({
          author_name: t.author_name,
          author_role: t.author_role || undefined,
          content: t.content,
        })),
      });
      toast.success("Recenze uloženy.");
    } catch (err) {
      toast.error(err instanceof Error ? err.message : "Chyba uložení.");
    } finally {
      setLoading(false);
    }
  }

  return (
    <fieldset className="rounded-2xl border border-border bg-card p-6">
      <legend className="px-2 text-[11px] font-bold uppercase tracking-[0.22em] text-warm-dark">
        Recenze a příběhy
      </legend>

      <p className="mt-2 text-sm leading-relaxed text-muted-foreground">
        Citace klientů, rodin nebo zaměstnanců. Zobrazují se na úvodní stránce
        a v sekci „O nás". Publikujte jen to, s čím dotyčný souhlasil.
      </p>

      <div className="mt-6 space-y-4">
        {fields.length === 0 ? (
          <p className="rounded-xl border border-dashed border-border px-4 py-6 text-center text-sm text-muted-foreground">
            Zatím žádná recenze. Přidejte první tlačítkem níže.
          </p>
        ) : null}

        {fields.map((field, i) => (
          <div
            key={field.id}
            className="rounded-xl border border-border bg-secondary/20 p-4"
          >
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2 text-xs font-bold uppercase tracking-wider text-muted-foreground">
                <Quote className="h-4 w-4" strokeWidth={2} />
                {i + 1}. recenze
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

            <div className="mt-4 grid gap-4 sm:grid-cols-2">
              <div>
                <label
                  htmlFor={`testimonials.${i}.author_name`}
                  className={labelBase}
                >
                  Jméno
                </label>
                <input
                  id={`testimonials.${i}.author_name`}
                  placeholder="Jana K."
                  className={cn(
                    fieldBase,
                    errors.testimonials?.[i]?.author_name && "border-destructive"
                  )}
                  {...register(`testimonials.${i}.author_name`)}
                />
                {errors.testimonials?.[i]?.author_name ? (
                  <p className="mt-1.5 text-xs font-medium text-destructive">
                    {errors.testimonials[i]?.author_name?.message}
                  </p>
                ) : null}
              </div>

              <div>
                <label
                  htmlFor={`testimonials.${i}.author_role`}
                  className={labelBase}
                >
                  Vztah k zařízení
                </label>
                <input
                  id={`testimonials.${i}.author_role`}
                  placeholder="dcera klientky"
                  className={fieldBase}
                  {...register(`testimonials.${i}.author_role`)}
                />
              </div>
            </div>

            <div className="mt-4">
              <label htmlFor={`testimonials.${i}.content`} className={labelBase}>
                Text recenze
              </label>
              <textarea
                id={`testimonials.${i}.content`}
                rows={4}
                placeholder="Maminka se u vás cítí bezpečně…"
                className={cn(
                  fieldBase,
                  "resize-y",
                  errors.testimonials?.[i]?.content && "border-destructive"
                )}
                {...register(`testimonials.${i}.content`)}
              />
              {errors.testimonials?.[i]?.content ? (
                <p className="mt-1.5 text-xs font-medium text-destructive">
                  {errors.testimonials[i]?.content?.message}
                </p>
              ) : null}
            </div>
          </div>
        ))}

        <div className="flex flex-col gap-3 pt-1 sm:flex-row sm:items-center sm:justify-between">
          <button
            type="button"
            onClick={() =>
              append({ author_name: "", author_role: "", content: "" })
            }
            className="inline-flex items-center justify-center gap-2 rounded-full border border-border bg-background px-5 py-2.5 text-sm font-semibold text-foreground transition-colors hover:border-brand hover:text-brand"
          >
            <Plus className="h-4 w-4" strokeWidth={2.25} />
            Přidat recenzi
          </button>

          <button
            type="button"
            disabled={loading}
            onClick={handleSubmit(onSubmit)}
            className="inline-flex items-center justify-center gap-2 rounded-full bg-brand px-6 py-2.5 text-sm font-semibold text-brand-foreground transition-colors hover:bg-brand-dark disabled:cursor-not-allowed disabled:opacity-60"
          >
            <Save className="h-4 w-4" strokeWidth={2} />
            {loading ? "Ukládám…" : "Uložit recenze"}
          </button>
        </div>
      </div>
    </fieldset>
  );
}
