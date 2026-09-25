"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { useEffect, useState } from "react";
import { useMutation, useQuery } from "convex/react";
import {
  useForm,
  type FieldErrors,
  type UseFormRegister,
} from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { toast } from "sonner";
import { ArrowLeft, Save } from "lucide-react";
import { cn } from "@/lib/utils";
import { api } from "@/convex/_generated/api";
import { BranchStatsEditor } from "../components/branch-stats-editor";
import { BranchTestimonialsEditor } from "../components/branch-testimonials-editor";
import type { Id } from "@/convex/_generated/dataModel";

const schema = z.object({
  name: z.string().min(2, "Zadejte název pobočky."),
  short_name: z.string().min(1, "Zadejte krátký název."),
  slug: z
    .string()
    .min(2, "Zadejte slug (subdoménu).")
    .regex(/^[a-z0-9-]+$/, "Použijte malá písmena, číslice a pomlčky."),
  legal_name: z.string().optional(),
  branch_type: z.enum(["senior_centrum", "hospital"]).optional(),
  type_label: z.string().optional(),
  tagline: z.string().optional(),
  subtitle: z.string().optional(),
  description: z.string().min(10, "Krátký popis (min. 10 znaků)."),

  street: z.string().min(2, "Zadejte ulici."),
  city: z.string().min(1, "Zadejte město."),
  zip: z.string().min(3, "Zadejte PSČ."),
  region: z.string().min(2, "Zadejte kraj."),
  ico: z.string().optional(),
  parent_org: z.string().optional(),

  phone: z.string().min(5, "Zadejte telefon."),
  phone_short: z.string().optional(),
  email: z.string().email("Neplatný e-mail."),
  facebook_url: z.string().optional(),

  office_contact_name: z.string().optional(),
  office_contact_phone: z.string().optional(),
  office_contact_email: z.string().optional(),
  sesterna_phone: z.string().optional(),

  lat: z.string().min(1, "Zadejte zeměpisnou šířku."),
  lng: z.string().min(1, "Zadejte zeměpisnou délku."),

  distance_city_1_label: z.string().optional(),
  distance_city_1_km: z.string().optional(),
  distance_city_2_label: z.string().optional(),
  distance_city_2_km: z.string().optional(),
  distance_city_3_label: z.string().optional(),
  distance_city_3_km: z.string().optional(),

  bed_count: z.string().optional(),
  room_count: z.string().optional(),
  opening_year: z.string().optional(),

  cover_image: z.string().optional(),
  logo_url: z.string().optional(),

  is_published: z.boolean(),
});

type FormValues = z.infer<typeof schema>;

function num(val: string | undefined): number | undefined {
  if (val === undefined || val.trim() === "") return undefined;
  const n = Number(val.replace(",", "."));
  return Number.isFinite(n) ? n : undefined;
}

/**
 * Souřadnice, jak je lidé opravdu zadávají: s čárkou místo tečky („50,6044"),
 * se stupni, nebo jako celá dvojice zkopírovaná z Google Maps
 * („49.6053, 14.5423"). Rozlišit desetinnou čárku od oddělovače dvojice je
 * to podstatné — mezera za čárkou, středník nebo přítomnost teček rozhodují.
 */
function parseCoords(raw: string): { first?: number; second?: number } {
  const text = raw.replace(/°/g, "").trim();
  if (!text) return {};

  const dots = (text.match(/\./g) ?? []).length;
  const commas = (text.match(/,/g) ?? []).length;

  let parts: string[] | null = null;
  if (text.includes(";")) {
    parts = text.split(";");
  } else if (/,\s+/.test(text)) {
    // „49.6053, 14.5423" i „49,6053, 14,5423" — mezera za čárkou dvojici prozradí.
    parts = text.split(/,\s+/);
  } else if (/\s+/.test(text) && commas === 0) {
    parts = text.split(/\s+/);
  } else if (dots >= 1 && commas === 1) {
    // „49.6053,14.5423" — desetinné tečky, takže čárka odděluje dvojici.
    parts = text.split(",");
  }

  const toNumber = (v: string) => Number(v.trim().replace(",", "."));

  if (parts && parts.length === 2) {
    const a = toNumber(parts[0]);
    const b = toNumber(parts[1]);
    if (Number.isFinite(a) && Number.isFinite(b)) return { first: a, second: b };
  }

  const single = toNumber(text);
  return Number.isFinite(single) ? { first: single } : {};
}

function int(val: string | undefined): number | undefined {
  const n = num(val);
  return n === undefined ? undefined : Math.floor(n);
}

interface Props {
  mode: "create" | "edit";
  branchId?: Id<"branches">;
}

const fieldBase =
  "w-full rounded-xl border border-border bg-secondary/40 px-4 py-3 text-base text-foreground placeholder:text-muted-foreground/60 transition-colors focus:border-brand focus:bg-background focus:outline-none focus:ring-2 focus:ring-brand/20 disabled:opacity-60 disabled:cursor-not-allowed";
const labelBase =
  "mb-2 block text-xs font-bold uppercase tracking-wider text-foreground/70";

function slugify(s: string): string {
  return s
    .toLowerCase()
    .normalize("NFD")
    .replace(/\p{Diacritic}/gu, "")
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-+|-+$/g, "");
}

/**
 * Jedno pole formuláře. Je schválně mimo hlavní komponentu — kdyby bylo
 * uvnitř, React by při každém překreslení vyrobil nový typ komponenty,
 * inputy by se odpojily a uživateli by při psaní utíkal kurzor.
 */
function Field({
  name: fname,
  label,
  placeholder,
  type = "text",
  disabled,
  hint,
  register,
  errors,
  onCoords,
}: {
  name: keyof FormValues;
  label: string;
  placeholder?: string;
  type?: string;
  disabled?: boolean;
  hint?: string;
  register: UseFormRegister<FormValues>;
  errors: FieldErrors<FormValues>;
  /** Pole souřadnic — umí přijmout i celou dvojici z Google Maps. */
  onCoords?: (field: "lat" | "lng", raw: string) => void;
}) {
  const err = errors[fname];
  const reg = register(fname);
  return (
    <div>
      <label htmlFor={fname} className={labelBase}>
        {label}
        {hint ? (
          <span className="font-medium normal-case text-muted-foreground/70">
            {" "}
            {hint}
          </span>
        ) : null}
      </label>
      <input
        id={fname}
        type={type}
        inputMode={onCoords || type === "number" ? "decimal" : undefined}
        placeholder={placeholder}
        disabled={disabled}
        aria-invalid={err ? "true" : undefined}
        className={cn(fieldBase, err && "border-destructive")}
        {...reg}
        onBlur={(e) => {
          // Vlastní úpravu souřadnic pouštíme navíc, ne místo react-hook-form.
          void reg.onBlur(e);
          onCoords?.(fname as "lat" | "lng", e.target.value);
        }}
      />
      {err ? (
        <p className="mt-1.5 text-xs font-medium text-destructive">
          {err.message as string}
        </p>
      ) : null}
    </div>
  );
}

function Section({
  title,
  children,
}: {
  title: string;
  children: React.ReactNode;
}) {
  return (
    <fieldset className="rounded-2xl border border-border bg-card p-6">
      <legend className="px-2 text-[11px] font-bold uppercase tracking-[0.22em] text-warm-dark">
        {title}
      </legend>
      <div className="mt-2 space-y-5">{children}</div>
    </fieldset>
  );
}

export function AdminBranchFormView({ mode, branchId }: Props) {
  const router = useRouter();
  const me = useQuery(api.modules.users.queries.me);
  const isSuperAdmin = me?.profile?.role === "super_admin";

  const existing = useQuery(
    api.modules.branches.queries.getById,
    mode === "edit" && branchId ? { id: branchId } : "skip"
  );

  const create = useMutation(api.modules.branches.mutations.create);
  const update = useMutation(api.modules.branches.mutations.update);
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
      name: "",
      short_name: "",
      slug: "",
      description: "",
      street: "",
      city: "",
      zip: "",
      region: "",
      phone: "",
      email: "",
      lat: "",
      lng: "",
      is_published: false,
    },
  });

  useEffect(() => {
    if (mode === "edit" && existing) {
      reset({
        name: existing.name,
        short_name: existing.short_name,
        slug: existing.slug,
        legal_name: existing.legal_name ?? "",
        branch_type: existing.branch_type,
        type_label: existing.type_label ?? "",
        tagline: existing.tagline ?? "",
        subtitle: existing.subtitle ?? "",
        description: existing.description,
        street: existing.street,
        city: existing.city,
        zip: existing.zip,
        region: existing.region,
        ico: existing.ico ?? "",
        parent_org: existing.parent_org ?? "",
        phone: existing.phone,
        phone_short: existing.phone_short ?? "",
        email: existing.email,
        facebook_url: existing.facebook_url ?? "",
        office_contact_name: existing.office_contact_name ?? "",
        office_contact_phone: existing.office_contact_phone ?? "",
        office_contact_email: existing.office_contact_email ?? "",
        sesterna_phone: existing.sesterna_phone ?? "",
        lat: String(existing.lat),
        lng: String(existing.lng),
        distance_city_1_label: existing.distance_city_1_label ?? "",
        distance_city_1_km:
          existing.distance_city_1_km !== undefined
            ? String(existing.distance_city_1_km)
            : "",
        distance_city_2_label: existing.distance_city_2_label ?? "",
        distance_city_2_km:
          existing.distance_city_2_km !== undefined
            ? String(existing.distance_city_2_km)
            : "",
        distance_city_3_label: existing.distance_city_3_label ?? "",
        distance_city_3_km:
          existing.distance_city_3_km !== undefined
            ? String(existing.distance_city_3_km)
            : "",
        bed_count:
          existing.bed_count !== undefined ? String(existing.bed_count) : "",
        room_count:
          existing.room_count !== undefined ? String(existing.room_count) : "",
        opening_year:
          existing.opening_year !== undefined
            ? String(existing.opening_year)
            : "",
        cover_image: existing.cover_image ?? "",
        logo_url: existing.logo_url ?? "",
        is_published: existing.is_published,
      });
    }
  }, [mode, existing, reset]);

  const name = watch("name");
  useEffect(() => {
    if (mode === "create" && name) {
      setValue("slug", slugify(name), { shouldValidate: false });
    }
  }, [mode, name, setValue]);

  /**
   * Srovná, co uživatel do souřadnic vložil. Celou dvojici z Google Maps
   * rozdělí do obou polí, čárku převede na tečku.
   */
  function applyCoords(field: "lat" | "lng", raw: string) {
    const { first, second } = parseCoords(raw);
    if (first === undefined) return;
    if (second !== undefined) {
      setValue("lat", String(first), { shouldValidate: true });
      setValue("lng", String(second), { shouldValidate: true });
      return;
    }
    setValue(field, String(first), { shouldValidate: true });
  }

  async function onSubmit(values: FormValues) {
    const lat = num(values.lat);
    const lng = num(values.lng);
    if (lat === undefined || lng === undefined) {
      toast.error(
        "Souřadnice musí být čísla, např. 49.6053 a 14.5423. Z Google Maps stačí vložit celý řádek."
      );
      return;
    }
    if (Math.abs(lat) > 90 || Math.abs(lng) > 180) {
      toast.error(
        "Souřadnice jsou mimo rozsah. Šířka (lat) je do 90, délka (lng) do 180 — nejsou prohozené?"
      );
      return;
    }
    setLoading(true);
    try {
      const payload = {
        name: values.name,
        short_name: values.short_name,
        slug: values.slug,
        legal_name: values.legal_name || undefined,
        branch_type: values.branch_type,
        type_label: values.type_label || undefined,
        tagline: values.tagline || undefined,
        subtitle: values.subtitle || undefined,
        description: values.description,
        street: values.street,
        city: values.city,
        zip: values.zip,
        region: values.region,
        ico: values.ico || undefined,
        parent_org: values.parent_org || undefined,
        phone: values.phone,
        phone_short: values.phone_short || undefined,
        email: values.email,
        facebook_url: values.facebook_url || undefined,
        office_contact_name: values.office_contact_name || undefined,
        office_contact_phone: values.office_contact_phone || undefined,
        office_contact_email: values.office_contact_email || undefined,
        sesterna_phone: values.sesterna_phone || undefined,
        lat,
        lng,
        distance_city_1_label: values.distance_city_1_label || undefined,
        distance_city_1_km: int(values.distance_city_1_km),
        distance_city_2_label: values.distance_city_2_label || undefined,
        distance_city_2_km: int(values.distance_city_2_km),
        distance_city_3_label: values.distance_city_3_label || undefined,
        distance_city_3_km: int(values.distance_city_3_km),
        bed_count: int(values.bed_count),
        room_count: int(values.room_count),
        opening_year: int(values.opening_year),
        cover_image: values.cover_image || undefined,
        logo_url: values.logo_url || undefined,
        is_published: values.is_published,
      };
      if (mode === "create") {
        await create(payload);
        toast.success("Pobočka vytvořena.");
      } else if (branchId) {
        await update({ id: branchId, ...payload });
        toast.success("Pobočka uložena.");
      }
      router.push("/admin/pobocky");
    } catch (err) {
      toast.error(err instanceof Error ? err.message : "Chyba uložení.");
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="mx-auto max-w-3xl px-6 py-12 lg:px-10 lg:py-16">
      <Link
        href="/admin/pobocky"
        className="inline-flex items-center gap-2 text-sm font-semibold text-brand hover:underline"
      >
        <ArrowLeft className="h-4 w-4" strokeWidth={2.25} />
        Zpět na seznam
      </Link>

      <div className="mt-6 text-[11px] font-bold uppercase tracking-[0.22em] text-warm-dark">
        {mode === "create" ? "Nová pobočka" : "Úprava pobočky"}
      </div>
      <h1 className="font-display mt-2 text-3xl text-foreground sm:text-4xl">
        {mode === "create"
          ? "Vytvořit pobočku"
          : (existing?.name ?? "Načítám…")}
      </h1>

      <form
        onSubmit={handleSubmit(onSubmit, (formErrors) => {
          // Bez téhle hlášky uživatel jen klikne na Uložit a „nic se nestane".
          const first = Object.values(formErrors)[0]?.message;
          toast.error(
            first
              ? `Zkontrolujte formulář: ${String(first)}`
              : "Formulář obsahuje chyby — zkontrolujte červeně označená pole."
          );
          document
            .querySelector('[aria-invalid="true"]')
            ?.scrollIntoView({ behavior: "smooth", block: "center" });
        })}
        className="mt-10 space-y-6"
      >
        {mode === "create" ? (
        <Section title="Identita">
          <Field register={register} errors={errors} name="name" label="Plný název" placeholder="AHC Senior centrum Stříbro" />
          <div className="grid gap-5 sm:grid-cols-2">
            <Field register={register} errors={errors} name="short_name" label="Krátký název" placeholder="Stříbro" />
            <Field register={register} errors={errors}
              name="slug"
              label="Slug / subdoména"
              placeholder="stribro"
              disabled={!isSuperAdmin}
              hint={isSuperAdmin ? "= stribro.ahc.cz" : "(jen super-admin)"}
            />
          </div>
          <Field register={register} errors={errors} name="legal_name" label="Právní název" placeholder="AHC Senior centrum Stříbro s.r.o." />
          <div className="grid gap-5 sm:grid-cols-2">
            <div>
              <label htmlFor="branch_type" className={labelBase}>
                Typ zařízení
              </label>
              <select id="branch_type" className={fieldBase} {...register("branch_type")}>
                <option value="senior_centrum">Senior centrum</option>
                <option value="hospital">Nemocnice</option>
              </select>
            </div>
            <Field register={register} errors={errors} name="type_label" label="Typ zařízení" placeholder="Senior centrum / Centrum následné péče" hint="(zobrazí se v hlavičce webu nad názvem pobočky)" />
          </div>
          <Field register={register} errors={errors} name="tagline" label="Tagline (hero)" placeholder="Péče\n*s respektem*\nke stáří" hint="(\n = nový řádek, *...* = zeleně)" />
          <div>
            <label htmlFor="subtitle" className={labelBase}>Podtitul (hero)</label>
            <textarea id="subtitle" rows={2} className={cn(fieldBase, "resize-y")} {...register("subtitle")} />
          </div>
          <div>
            <label htmlFor="description" className={labelBase}>Krátký popis</label>
            <textarea
              id="description"
              rows={3}
              className={cn(fieldBase, "resize-y", errors.description && "border-destructive")}
              {...register("description")}
            />
            {errors.description ? (
              <p className="mt-1.5 text-xs font-medium text-destructive">{errors.description.message}</p>
            ) : null}
          </div>
        </Section>
        ) : null}

        <Section title="Adresa">
          <Field register={register} errors={errors} name="street" label="Ulice a č.p." placeholder="Nemocniční 264" />
          <div className="grid gap-5 sm:grid-cols-3">
            <Field register={register} errors={errors} name="zip" label="PSČ" placeholder="419 01" />
            <Field register={register} errors={errors} name="city" label="Město" placeholder="Duchcov" />
            <Field register={register} errors={errors} name="region" label="Kraj" placeholder="Ústecký kraj" />
          </div>
          <div className="grid gap-5 sm:grid-cols-2">
            <Field register={register} errors={errors} name="ico" label="IČO" placeholder="22317821" />
            <Field register={register} errors={errors} name="parent_org" label="Mateřská organizace" placeholder="Ambeat Group" />
          </div>
        </Section>

        <Section title="Kontakt">
          <div className="grid gap-5 sm:grid-cols-2">
            <Field register={register} errors={errors} name="phone" label="Telefon" placeholder="+420 417 514 711" />
            <Field register={register} errors={errors} name="phone_short" label="Telefon (krátký)" placeholder="417 514 711" />
          </div>
          <Field register={register} errors={errors} name="email" label="E-mail" placeholder="info@nedu.cz" type="email" />
          <Field register={register} errors={errors} name="facebook_url" label="Facebook URL" placeholder="https://facebook.com/..." />
        </Section>

        <Section title="Kancelář / recepce (volitelné)">
          <Field register={register} errors={errors} name="office_contact_name" label="Název kontaktu" placeholder="Recepce nemocnice" />
          <div className="grid gap-5 sm:grid-cols-2">
            <Field register={register} errors={errors} name="office_contact_phone" label="Telefon recepce" />
            <Field register={register} errors={errors} name="office_contact_email" label="E-mail recepce" />
          </div>
          <Field register={register} errors={errors} name="sesterna_phone" label="Sesterna (24/7)" />
        </Section>

        <Section title="Poloha na mapě">
          <div className="grid gap-5 sm:grid-cols-2">
            <Field register={register} errors={errors}
              name="lat"
              label="Zeměpisná šířka (lat)"
              placeholder="49.6053"
              onCoords={applyCoords}
            />
            <Field register={register} errors={errors}
              name="lng"
              label="Zeměpisná délka (lng)"
              placeholder="14.5423"
              onCoords={applyCoords}
            />
          </div>
          <p className="text-xs text-muted-foreground">
            Na Google Maps klikněte pravým tlačítkem na místo a zkopírujte první
            řádek. Celou dvojici („49.6053, 14.5423") můžete vložit do
            kteréhokoli z polí — rozdělí se sama. Čárka i tečka fungují.
          </p>
        </Section>

        <Section title="Statistiky (volitelné)">
          <div className="grid gap-5 sm:grid-cols-3">
            <Field register={register} errors={errors} name="bed_count" label="Počet lůžek" type="number" placeholder="120" />
            <Field register={register} errors={errors} name="room_count" label="Počet pokojů" type="number" />
            <Field register={register} errors={errors} name="opening_year" label="Rok založení" type="number" placeholder="1920" />
          </div>
        </Section>

        <Section title="Vzdálenosti k městům (volitelné)">
          {[1, 2, 3].map((i) => (
            <div key={i} className="grid gap-5 sm:grid-cols-2">
              <Field register={register} errors={errors}
                name={`distance_city_${i}_label` as keyof FormValues}
                label={`Město ${i}`}
                placeholder="Teplice"
              />
              <Field register={register} errors={errors}
                name={`distance_city_${i}_km` as keyof FormValues}
                label={`Vzdálenost ${i} (km)`}
                type="number"
                placeholder="12"
              />
            </div>
          ))}
        </Section>

        {mode === "create" ? (
          <Section title="Branding (volitelné)">
            <Field register={register} errors={errors} name="cover_image" label="Hero foto (cesta)" placeholder="/images/duchcov-main.jpg" />
            <Field register={register} errors={errors} name="logo_url" label="Logo (cesta)" placeholder="/images/logo.png" />
          </Section>
        ) : null}

        <label className="flex cursor-pointer items-center gap-3 rounded-2xl border border-border bg-card p-4">
          <input type="checkbox" className="h-4 w-4 rounded border-border accent-brand" {...register("is_published")} />
          <span>
            <span className="block text-sm font-bold text-foreground">Publikovat pobočku</span>
            <span className="block text-xs text-muted-foreground">
              Publikované pobočky se zobrazují na webu a počítají do síťových statistik.
            </span>
          </span>
        </label>

        <div className="flex flex-col gap-3 pt-2 sm:flex-row sm:justify-end">
          <Link
            href="/admin/pobocky"
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

      {/* Sekce „V číslech" je vlastní tabulka — ukládá se samostatně. */}
      {mode === "edit" && branchId ? (
        <div className="mt-6 space-y-6">
          <BranchStatsEditor branchId={branchId} />
          <BranchTestimonialsEditor branchId={branchId} />
        </div>
      ) : null}
    </div>
  );
}
