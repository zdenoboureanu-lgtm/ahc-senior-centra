"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { useAuthActions } from "@convex-dev/auth/react";
import { ArrowRight, Lock, Mail } from "lucide-react";
import { toast } from "sonner";
import Link from "next/link";
import { AhcLogo } from "@/common/components/ahc-logo";

export default function AdminLoginPage() {
  const router = useRouter();
  const { signIn } = useAuthActions();
  const [mode, setMode] = useState<"signIn" | "signUp">("signIn");
  const [loading, setLoading] = useState(false);

  async function handleSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    setLoading(true);
    const formData = new FormData(e.currentTarget);
    formData.set("flow", mode);
    try {
      await signIn("password", formData);
      toast.success(mode === "signUp" ? "Účet vytvořen." : "Vítejte zpět.");
      router.push("/admin");
    } catch (err) {
      const msg =
        err instanceof Error ? err.message : "Přihlášení se nezdařilo.";
      toast.error(
        msg.includes("InvalidAccountId")
          ? "Neplatné přihlašovací údaje."
          : msg
      );
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="relative flex min-h-screen items-center justify-center bg-gradient-to-br from-brand-light/40 via-background to-warm/5 px-6 py-12">
      <div
        aria-hidden="true"
        className="pointer-events-none absolute -right-32 top-20 -z-10 h-[420px] w-[420px] rounded-full bg-warm/15 blur-3xl"
      />
      <div
        aria-hidden="true"
        className="pointer-events-none absolute -left-32 bottom-10 -z-10 h-72 w-72 rounded-full bg-brand-light/40 blur-3xl"
      />

      <div className="w-full max-w-md">
        <Link
          href="/"
          className="mb-10 inline-flex items-center gap-3"
          aria-label="AHC – domů"
        >
          <AhcLogo className="h-10 w-auto text-brand" />
          <span className="border-l border-border pl-3 text-xs font-bold uppercase tracking-[0.22em] text-warm-dark">
            Administrace
          </span>
        </Link>

        <div className="rounded-3xl border border-border bg-card p-8 shadow-xl sm:p-10">
          <h1 className="font-display text-3xl text-foreground">
            {mode === "signUp" ? "Vytvořit účet" : "Přihlášení"}
          </h1>
          <p className="mt-2 text-sm text-muted-foreground">
            {mode === "signUp"
              ? "Po vytvoření účtu vám správce přiřadí pobočku."
              : "Přihlaste se ke správě své pobočky."}
          </p>

          <form onSubmit={handleSubmit} className="mt-8 space-y-5">
            <div>
              <label
                htmlFor="email"
                className="mb-2 flex items-center gap-2 text-xs font-bold uppercase tracking-wider text-foreground/70"
              >
                <Mail className="h-3.5 w-3.5" strokeWidth={2.25} />
                E-mail
              </label>
              <input
                id="email"
                name="email"
                type="email"
                required
                autoComplete="email"
                placeholder="vase@ahc.cz"
                className="w-full rounded-xl border border-border bg-secondary/40 px-4 py-3 text-base text-foreground placeholder:text-muted-foreground/60 transition-colors focus:border-brand focus:bg-background focus:outline-none focus:ring-2 focus:ring-brand/20"
              />
            </div>
            <div>
              <label
                htmlFor="password"
                className="mb-2 flex items-center gap-2 text-xs font-bold uppercase tracking-wider text-foreground/70"
              >
                <Lock className="h-3.5 w-3.5" strokeWidth={2.25} />
                Heslo
              </label>
              <input
                id="password"
                name="password"
                type="password"
                required
                minLength={8}
                autoComplete={
                  mode === "signUp" ? "new-password" : "current-password"
                }
                placeholder="Minimálně 8 znaků"
                className="w-full rounded-xl border border-border bg-secondary/40 px-4 py-3 text-base text-foreground placeholder:text-muted-foreground/60 transition-colors focus:border-brand focus:bg-background focus:outline-none focus:ring-2 focus:ring-brand/20"
              />
            </div>

            <button
              type="submit"
              disabled={loading}
              className="group flex w-full items-center justify-center gap-2.5 rounded-full bg-brand px-7 py-3.5 text-sm font-semibold text-brand-foreground shadow-md shadow-brand/15 transition-all hover:bg-brand-dark hover:shadow-lg disabled:cursor-not-allowed disabled:opacity-60"
            >
              {loading
                ? "Pracuji…"
                : mode === "signUp"
                  ? "Vytvořit účet"
                  : "Přihlásit se"}
              <ArrowRight className="h-4 w-4 transition-transform group-hover:translate-x-0.5" />
            </button>
          </form>

          <div className="mt-6 text-center text-sm text-muted-foreground">
            {mode === "signUp" ? (
              <>
                Už máte účet?{" "}
                <button
                  type="button"
                  onClick={() => setMode("signIn")}
                  className="font-semibold text-brand hover:underline"
                >
                  Přihlaste se
                </button>
              </>
            ) : (
              <>
                Nemáte účet?{" "}
                <button
                  type="button"
                  onClick={() => setMode("signUp")}
                  className="font-semibold text-brand hover:underline"
                >
                  Zaregistrovat se
                </button>
              </>
            )}
          </div>
        </div>

        <p className="mt-8 text-center text-xs text-muted-foreground/70">
          Po registraci kontaktujte administrátora pro přiřazení role.
        </p>
      </div>
    </div>
  );
}
