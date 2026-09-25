"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { useMutation } from "convex/react";
import { toast } from "sonner";
import { Copy, Loader2 } from "lucide-react";
import { api } from "@/convex/_generated/api";
import type { Id } from "@/convex/_generated/dataModel";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";

const schema = z.object({
  slug: z
    .string()
    .trim()
    .toLowerCase()
    .min(2, "Adresa musí mít aspoň dva znaky.")
    .regex(
      /^[a-z0-9]+(-[a-z0-9]+)*$/,
      "Jen malá písmena bez diakritiky, číslice a pomlčky (např. „nove-mesto”)."
    ),
  name: z.string().trim().min(2, "Vyplňte celý název."),
  short_name: z.string().trim().min(2, "Vyplňte krátký název."),
});

type Values = z.infer<typeof schema>;

const fieldBase =
  "w-full rounded-xl border border-border bg-secondary/40 px-4 py-3 text-base text-foreground placeholder:text-muted-foreground/60 transition-colors focus:border-brand focus:bg-background focus:outline-none focus:ring-2 focus:ring-brand/20";
const labelBase =
  "mb-2 block text-xs font-bold uppercase tracking-wider text-foreground/70";

/** Bez diakritiky a mezer — návrh adresy z názvu pobočky. */
function slugify(value: string): string {
  return value
    .normalize("NFD")
    .replace(/\p{Diacritic}/gu, "")
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-+|-+$/g, "");
}

/**
 * Duplikace celého webu pobočky. Adresa (slug) se volí rovnou při kopírování —
 * je to zároveň subdoména, na které nová pobočka poběží.
 */
export function DuplicateBranchDialog({
  source,
  open,
  onOpenChange,
}: {
  source: { _id: Id<"branches">; name: string; short_name: string; slug: string };
  open: boolean;
  onOpenChange: (open: boolean) => void;
}) {
  const router = useRouter();
  const duplicate = useMutation(api.modules.branches.mutations.duplicate);
  const [saving, setSaving] = useState(false);

  const {
    register,
    handleSubmit,
    reset,
    setValue,
    getValues,
    watch,
    formState: { errors },
  } = useForm<Values>({
    resolver: zodResolver(schema),
    defaultValues: { slug: "", name: "", short_name: "" },
  });

  // Po otevření předvyplníme „kopie" jména, ať je hned vidět, co se stane.
  useEffect(() => {
    if (open) {
      reset({
        slug: "",
        name: `${source.name} (kopie)`,
        short_name: source.short_name,
      });
    }
  }, [open, source.name, source.short_name, reset]);

  const slug = watch("slug");

  async function onSubmit(values: Values) {
    setSaving(true);
    try {
      const id = await duplicate({
        source_id: source._id,
        slug: values.slug,
        name: values.name,
        short_name: values.short_name,
      });
      toast.success("Pobočka zduplikována. Otevírám ji k úpravám.");
      onOpenChange(false);
      router.push(`/admin/pobocky/${id}`);
    } catch (err) {
      toast.error(err instanceof Error ? err.message : "Duplikace se nepovedla.");
    } finally {
      setSaving(false);
    }
  }

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-lg">
        <DialogHeader>
          <DialogTitle>Duplikovat pobočku</DialogTitle>
          <DialogDescription>
            Vytvoří kopii webu <strong>{source.name}</strong> — podstránky,
            služby, zázemí, fotky, dokumenty i kontakty. Aktuality, inzeráty
            kariéry a došlé poptávky se nekopírují. Nová pobočka vznikne skrytá,
            takže si ji můžete v klidu dopsat.
          </DialogDescription>
        </DialogHeader>

        <form onSubmit={handleSubmit(onSubmit)} className="space-y-5">
          <div>
            <label htmlFor="dup-name" className={labelBase}>
              Název pobočky
            </label>
            <input
              id="dup-name"
              className={fieldBase}
              {...register("name")}
              onBlur={() => {
                // Adresu navrhneme z krátkého názvu („Nová Role" → „nova-role"),
                // ne z celého — jinak vznikne adresa dlouhá jak nákladní vlak.
                if (!slug) {
                  const short = getValues("short_name") || getValues("name");
                  setValue("slug", slugify(short), { shouldValidate: true });
                }
              }}
            />
            {errors.name ? (
              <p className="mt-1.5 text-xs text-destructive">
                {errors.name.message}
              </p>
            ) : null}
          </div>

          <div>
            <label htmlFor="dup-short" className={labelBase}>
              Krátký název (do hlavičky)
            </label>
            <input
              id="dup-short"
              className={fieldBase}
              {...register("short_name")}
              onBlur={(e) => {
                if (!slug) setValue("slug", slugify(e.target.value), {
                  shouldValidate: true,
                });
              }}
            />
            {errors.short_name ? (
              <p className="mt-1.5 text-xs text-destructive">
                {errors.short_name.message}
              </p>
            ) : null}
          </div>

          <div>
            <label htmlFor="dup-slug" className={labelBase}>
              Adresa webu (URL)
            </label>
            <div className="flex items-center gap-2">
              <input
                id="dup-slug"
                className={`${fieldBase} font-mono`}
                placeholder="nove-mesto"
                autoComplete="off"
                {...register("slug")}
              />
            </div>
            <p className="mt-2 text-xs text-muted-foreground">
              Web poběží na{" "}
              <span className="font-mono text-foreground">
                {slug ? slugify(slug) : "adresa"}.ahc.cz
              </span>
            </p>
            {errors.slug ? (
              <p className="mt-1.5 text-xs text-destructive">
                {errors.slug.message}
              </p>
            ) : null}
          </div>

          <DialogFooter>
            <button
              type="button"
              onClick={() => onOpenChange(false)}
              className="rounded-full border border-border px-5 py-2.5 text-sm font-semibold text-foreground hover:border-brand hover:text-brand"
            >
              Zrušit
            </button>
            <button
              type="submit"
              disabled={saving}
              className="inline-flex items-center gap-2 rounded-full bg-brand px-5 py-2.5 text-sm font-bold text-brand-foreground hover:bg-brand-dark disabled:opacity-60"
            >
              {saving ? (
                <Loader2 className="h-4 w-4 animate-spin" />
              ) : (
                <Copy className="h-4 w-4" />
              )}
              Duplikovat
            </button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}
