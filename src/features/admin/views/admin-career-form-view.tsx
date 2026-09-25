"use client";

import Link from "next/link";
import { useRouter, useSearchParams } from "next/navigation";
import { useEffect, useState } from "react";
import { useMutation, useQuery } from "convex/react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { toast } from "sonner";
import { ArrowLeft, Save } from "lucide-react";
import { cn } from "@/lib/utils";
import { api } from "@/convex/_generated/api";
import type { Id } from "@/convex/_generated/dataModel";

const schema = z.object({
  title: z.string().min(2, "Zadejte název pozice."),
  slug: z
    .string()
    .min(2, "Zadejte URL slug.")
    .regex(/^[a-z0-9-]+$/, "Použijte malá písmena, číslice a pomlčky."),
  employment_type: z.enum(["full_time", "part_time", "contract", "internship"]),
  description: z.string().min(20, "Popište pozici (min. 20 znaků)."),
  requirements: z.string().optional(),
  benefits: z.string().optional(),
  salary_from: z.string().optional(),
  salary_to: z.string().optional(),
  is_published: z.boolean(),
});

type FormValues = z.infer<typeof schema>;

function parseSalary(val: string | undefined): number | undefined {
  if (val === undefined || val === "") return undefined;
  const n = Number(val);
  return Number.isFinite(n) && n >= 0 ? Math.floor(n) : undefined;
}

interface Props {
  mode: "create" | "edit";
  positionId?: Id<"career_positions">;
}

const fieldBase =
  "w-full rounded-xl border border-border bg-secondary/40 px-4 py-3 text-base text-foreground placeholder:text-muted-foreground/60 transition-colors focus:border-brand focus:bg-background focus:outline-none focus:ring-2 focus:ring-brand/20";
const labelBase =
  "mb-2 block text-xs font-bold uppercase tracking-wider text-foreground/70";

function slugify(s: string): string {
  return s
    .toLowerCase()
    .normalize("NFD")
    .replace(/[̀-ͯ]/g, "")
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-+|-+$/g, "");
}

export function AdminCareerFormView({ mode, positionId }: Props) {
  const router = useRouter();
  const searchParams = useSearchParams();
  const me = useQuery(api.modules.users.queries.me);
  const isSuperAdmin = me?.profile?.role === "super_admin";

  const existing = useQuery(
    api.modules.careers.queries.getById,
    mode === "edit" && positionId ? { id: positionId } : "skip"
  );

  // Super_admin volí pobočku při vytváření (default z ?branchId= nebo první).
  const allBranches = useQuery(
    api.modules.branches.queries.listAllForAdmin,
    isSuperAdmin && mode === "create" ? {} : "skip"
  );
  const [pickedBranchId, setPickedBranchId] = useState<Id<"branches"> | null>(
    (searchParams.get("branchId") as Id<"branches"> | null) ?? null
  );

  const ownBranchId = me?.branch?._id ?? me?.profile?.branch_id ?? null;
  // Pobočka, do které se pozice uloží.
  const targetBranchId: Id<"branches"> | null =
    mode === "edit"
      ? (existing?.branch_id ?? null)
      : isSuperAdmin
        ? pickedBranchId ?? allBranches?.[0]?._id ?? null
        : ownBranchId;

  const create = useMutation(api.modules.careers.mutations.create);
  const update = useMutation(api.modules.careers.mutations.update);

  const [loading, setLoading] = useState(false);

  const {
    register,
    handleSubmit,
    setValue,
    watch,
    reset,
    formState: { errors },
  } = useForm<FormValues>({
    resolver: zodResolver(schema),
    defaultValues: {
      title: "",
      slug: "",
      employment_type: "full_time",
      description: "",
      requirements: "",
      benefits: "",
      is_published: true,
    },
  });

  useEffect(() => {
    if (mode === "edit" && existing) {
      reset({
        title: existing.title,
        slug: existing.slug,
        employment_type: existing.employment_type,
        description: existing.description,
        requirements: existing.requirements ?? "",
        benefits: existing.benefits ?? "",
        salary_from:
          existing.salary_from !== undefined
            ? String(existing.salary_from)
            : "",
        salary_to:
          existing.salary_to !== undefined ? String(existing.salary_to) : "",
        is_published: existing.is_published,
      });
    }
  }, [mode, existing, reset]);

  const title = watch("title");
  useEffect(() => {
    if (mode === "create" && title) {
      setValue("slug", slugify(title), { shouldValidate: false });
    }
  }, [mode, title, setValue]);

  async function onSubmit(values: FormValues) {
    if (mode === "create" && !targetBranchId) {
      toast.error("Vyberte pobočku.");
      return;
    }
    setLoading(true);
    try {
      const payload = {
        title: values.title,
        slug: values.slug,
        employment_type: values.employment_type,
        description: values.description,
        requirements: values.requirements || undefined,
        benefits: values.benefits || undefined,
        salary_from: parseSalary(values.salary_from),
        salary_to: parseSalary(values.salary_to),
        is_published: values.is_published,
      };
      if (mode === "create" && targetBranchId) {
        await create({ ...payload, branch_id: targetBranchId });
        toast.success("Pozice vytvořena.");
      } else if (positionId) {
        await update({ id: positionId, ...payload });
        toast.success("Pozice uložena.");
      }
      router.push("/admin/kariera");
    } catch (err) {
      toast.error(err instanceof Error ? err.message : "Chyba uložení.");
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="mx-auto max-w-3xl px-6 py-12 lg:px-10 lg:py-16">
      <Link
        href="/admin/kariera"
        className="inline-flex items-center gap-2 text-sm font-semibold text-brand hover:underline"
      >
        <ArrowLeft className="h-4 w-4" strokeWidth={2.25} />
        Zpět na seznam
      </Link>

      <div className="mt-6 text-[11px] font-bold uppercase tracking-[0.22em] text-warm-dark">
        {mode === "create" ? "Nová pozice" : "Úprava pozice"}
      </div>
      <h1 className="font-display mt-2 text-3xl text-foreground sm:text-4xl">
        {mode === "create" ? "Vytvořit nový inzerát" : (existing?.title ?? "Načítám…")}
      </h1>

      <form onSubmit={handleSubmit(onSubmit)} className="mt-10 space-y-6">
        {isSuperAdmin && mode === "create" ? (
          <div>
            <label htmlFor="branch_pick" className={labelBase}>
              Pobočka
            </label>
            <select
              id="branch_pick"
              value={targetBranchId ?? ""}
              onChange={(e) =>
                setPickedBranchId(e.target.value as Id<"branches">)
              }
              className={fieldBase}
            >
              {allBranches?.map((b) => (
                <option key={b._id} value={b._id}>
                  {b.short_name} — {b.city}
                </option>
              ))}
            </select>
            <p className="mt-1.5 text-xs text-muted-foreground">
              Inzerát se vytvoří pro tuto pobočku.
            </p>
          </div>
        ) : null}

        <div>
          <label htmlFor="title" className={labelBase}>
            Název pozice
          </label>
          <input
            id="title"
            placeholder="např. Všeobecná sestra"
            className={cn(fieldBase, errors.title && "border-destructive")}
            {...register("title")}
          />
          {errors.title ? (
            <p className="mt-1.5 text-xs font-medium text-destructive">
              {errors.title.message}
            </p>
          ) : null}
        </div>

        <div className="grid gap-5 sm:grid-cols-2">
          <div>
            <label htmlFor="slug" className={labelBase}>
              URL slug
            </label>
            <input
              id="slug"
              placeholder="vseobecna-sestra"
              className={cn(fieldBase, errors.slug && "border-destructive")}
              {...register("slug")}
            />
            {errors.slug ? (
              <p className="mt-1.5 text-xs font-medium text-destructive">
                {errors.slug.message}
              </p>
            ) : null}
          </div>
          <div>
            <label htmlFor="employment_type" className={labelBase}>
              Úvazek
            </label>
            <select
              id="employment_type"
              className={fieldBase}
              {...register("employment_type")}
            >
              <option value="full_time">Plný úvazek</option>
              <option value="part_time">Částečný úvazek</option>
              <option value="contract">Dohoda</option>
              <option value="internship">Stáž</option>
            </select>
          </div>
        </div>

        <div className="grid gap-5 sm:grid-cols-2">
          <div>
            <label htmlFor="salary_from" className={labelBase}>
              Mzda od (Kč)
            </label>
            <input
              id="salary_from"
              type="number"
              inputMode="numeric"
              placeholder="35000"
              className={fieldBase}
              {...register("salary_from")}
            />
          </div>
          <div>
            <label htmlFor="salary_to" className={labelBase}>
              Mzda do (Kč)
            </label>
            <input
              id="salary_to"
              type="number"
              inputMode="numeric"
              placeholder="48000"
              className={fieldBase}
              {...register("salary_to")}
            />
          </div>
        </div>

        <div>
          <label htmlFor="description" className={labelBase}>
            Popis pozice
          </label>
          <textarea
            id="description"
            rows={5}
            placeholder="O co se uchazeč bude starat, kontext pozice…"
            className={cn(
              fieldBase,
              "resize-y",
              errors.description && "border-destructive"
            )}
            {...register("description")}
          />
          {errors.description ? (
            <p className="mt-1.5 text-xs font-medium text-destructive">
              {errors.description.message}
            </p>
          ) : null}
        </div>

        <div>
          <label htmlFor="requirements" className={labelBase}>
            Požadujeme{" "}
            <span className="font-medium normal-case text-muted-foreground/70">
              (jeden bod na řádek)
            </span>
          </label>
          <textarea
            id="requirements"
            rows={4}
            placeholder={`Středoškolské vzdělání\nRegistrace dle zákona 96/2004\nEmpatický přístup`}
            className={cn(fieldBase, "resize-y")}
            {...register("requirements")}
          />
        </div>

        <div>
          <label htmlFor="benefits" className={labelBase}>
            Nabízíme{" "}
            <span className="font-medium normal-case text-muted-foreground/70">
              (jeden bod na řádek)
            </span>
          </label>
          <textarea
            id="benefits"
            rows={4}
            placeholder={`5 týdnů dovolené\nPříspěvek na stravování\nVzdělávání hrazené zaměstnavatelem`}
            className={cn(fieldBase, "resize-y")}
            {...register("benefits")}
          />
        </div>

        <label className="flex cursor-pointer items-center gap-3 rounded-2xl border border-border bg-card p-4">
          <input
            type="checkbox"
            className="h-4 w-4 rounded border-border accent-brand"
            {...register("is_published")}
          />
          <span>
            <span className="block text-sm font-bold text-foreground">
              Publikovat veřejně
            </span>
            <span className="block text-xs text-muted-foreground">
              Zobrazí se na webu na stránce /kariera.
            </span>
          </span>
        </label>

        <div className="flex flex-col gap-3 pt-2 sm:flex-row sm:justify-end">
          <Link
            href="/admin/kariera"
            className="inline-flex items-center justify-center gap-2 rounded-full border border-border bg-background px-6 py-3 text-sm font-semibold text-foreground hover:border-brand hover:text-brand"
          >
            Zrušit
          </Link>
          <button
            type="submit"
            disabled={loading}
            className="group inline-flex items-center justify-center gap-2.5 rounded-full bg-brand px-7 py-3.5 text-sm font-semibold text-brand-foreground shadow-md shadow-brand/15 transition-all hover:bg-brand-dark hover:shadow-lg disabled:cursor-not-allowed disabled:opacity-60"
          >
            <Save className="h-4 w-4" strokeWidth={2} />
            {loading ? "Ukládám…" : "Uložit"}
          </button>
        </div>
      </form>
    </div>
  );
}
