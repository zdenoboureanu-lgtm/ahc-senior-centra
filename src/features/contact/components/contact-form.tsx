"use client";

import { useState } from "react";
import { useMutation } from "convex/react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { toast } from "sonner";
import { ArrowRight, Send } from "lucide-react";
import { cn } from "@/lib/utils";
import { api } from "@/convex/_generated/api";
import type { Id } from "@/convex/_generated/dataModel";
import {
  inquirySchema,
  type InquiryFormValues,
} from "@/common/lib/validators";

interface ContactFormProps {
  branchId: Id<"branches">;
  type: "admission" | "contact" | "career";
  relatedPositionId?: Id<"career_positions">;
  submitLabel?: string;
}

const fieldBase =
  "w-full rounded-xl border border-border bg-secondary/40 px-4 py-3 text-base text-foreground placeholder:text-muted-foreground/60 transition-colors focus:border-brand focus:bg-background focus:outline-none focus:ring-2 focus:ring-brand/20";

export function ContactForm({
  branchId,
  type,
  relatedPositionId,
  submitLabel = "Odeslat zprávu",
}: ContactFormProps) {
  const create = useMutation(api.modules.inquiries.mutations.create);
  const [loading, setLoading] = useState(false);

  const {
    register,
    handleSubmit,
    reset,
    formState: { errors },
  } = useForm<InquiryFormValues>({
    resolver: zodResolver(inquirySchema),
  });

  async function onSubmit(values: InquiryFormValues) {
    setLoading(true);
    try {
      await create({
        branch_id: branchId,
        type,
        related_position_id: relatedPositionId,
        ...values,
      });
      toast.success("Děkujeme, ozveme se Vám co nejdříve.");
      reset();
    } catch {
      toast.error("Odeslání se nezdařilo. Zkuste to prosím znovu.");
    } finally {
      setLoading(false);
    }
  }

  return (
    <div>
      <div className="text-xs font-bold uppercase tracking-[0.22em] text-warm-dark">
        Napište nám
      </div>
      <h2 className="font-display mt-3 text-3xl text-foreground sm:text-4xl">
        Rádi vám poradíme
      </h2>
      <p className="mt-3 text-base text-muted-foreground">
        Vyplňte formulář a my se vám ozveme zpravidla do 24 hodin.
      </p>

      <form onSubmit={handleSubmit(onSubmit)} className="mt-8 space-y-5">
        <div>
          <label
            htmlFor="name"
            className="mb-2 block text-xs font-bold uppercase tracking-wider text-foreground/70"
          >
            Jméno a příjmení
          </label>
          <input
            id="name"
            placeholder="Jan Novák"
            className={cn(fieldBase, errors.name && "border-destructive")}
            {...register("name")}
          />
          {errors.name ? (
            <p className="mt-1.5 text-xs font-medium text-destructive">
              {errors.name.message}
            </p>
          ) : null}
        </div>

        <div className="grid gap-5 sm:grid-cols-2">
          <div>
            <label
              htmlFor="email"
              className="mb-2 block text-xs font-bold uppercase tracking-wider text-foreground/70"
            >
              E-mail
            </label>
            <input
              id="email"
              type="email"
              placeholder="jan@email.cz"
              className={cn(fieldBase, errors.email && "border-destructive")}
              {...register("email")}
            />
            {errors.email ? (
              <p className="mt-1.5 text-xs font-medium text-destructive">
                {errors.email.message}
              </p>
            ) : null}
          </div>
          <div>
            <label
              htmlFor="phone"
              className="mb-2 block text-xs font-bold uppercase tracking-wider text-foreground/70"
            >
              Telefon{" "}
              <span className="font-medium normal-case text-muted-foreground/70">
                (volitelné)
              </span>
            </label>
            <input
              id="phone"
              type="tel"
              placeholder="+420 ..."
              className={fieldBase}
              {...register("phone")}
            />
          </div>
        </div>

        <div>
          <label
            htmlFor="message"
            className="mb-2 block text-xs font-bold uppercase tracking-wider text-foreground/70"
          >
            Zpráva
          </label>
          <textarea
            id="message"
            rows={5}
            placeholder="Dobrý den, mám zájem o..."
            className={cn(
              fieldBase,
              "resize-none",
              errors.message && "border-destructive"
            )}
            {...register("message")}
          />
          {errors.message ? (
            <p className="mt-1.5 text-xs font-medium text-destructive">
              {errors.message.message}
            </p>
          ) : null}
        </div>

        <div className="flex flex-col gap-4 pt-2 sm:flex-row sm:items-center sm:justify-between">
          <p className="text-xs leading-relaxed text-muted-foreground">
            Odesláním souhlasíte se zpracováním osobních údajů dle{" "}
            <a href="/gdpr" className="text-brand underline hover:no-underline">
              GDPR
            </a>
            .
          </p>
          <button
            type="submit"
            disabled={loading}
            className="group inline-flex shrink-0 items-center justify-center gap-2.5 rounded-full bg-brand px-7 py-3.5 text-sm font-semibold text-brand-foreground shadow-md shadow-brand/15 transition-all hover:bg-brand-dark hover:shadow-lg disabled:cursor-not-allowed disabled:opacity-60"
          >
            {loading ? (
              "Odesílám…"
            ) : (
              <>
                <Send className="h-4 w-4" strokeWidth={2} />
                {submitLabel}
                <ArrowRight className="h-4 w-4 transition-transform group-hover:translate-x-0.5" />
              </>
            )}
          </button>
        </div>
      </form>
    </div>
  );
}
