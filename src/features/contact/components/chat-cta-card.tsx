"use client";

import { MessageCircle, Sparkles } from "lucide-react";

function openKraitaChat() {
  // Kraita widget — floating button má id="chatbot-minimized"
  const btn = document.getElementById("chatbot-minimized");
  if (btn) {
    btn.click();
    return;
  }
  // Fallback: globální funkce
  const w = window as unknown as Record<string, (() => void) | undefined>;
  if (typeof w.maximizeChatbot === "function") w.maximizeChatbot();
}

export function ChatCtaCard() {
  return (
    <div className="relative flex flex-col justify-between overflow-hidden rounded-3xl bg-gradient-to-br from-brand-dark via-brand to-brand-dark p-8 text-brand-foreground shadow-xl shadow-brand/20 sm:p-10">
      <div
        aria-hidden="true"
        className="pointer-events-none absolute -right-16 -top-16 h-56 w-56 rounded-full bg-warm/25 blur-3xl animate-pulse-blob"
      />
      <div
        aria-hidden="true"
        className="pointer-events-none absolute -bottom-20 -left-12 h-56 w-56 rounded-full bg-brand-foreground/10 blur-3xl animate-float-slow"
      />

      <div className="relative">
        <div className="inline-flex items-center gap-2 rounded-full bg-brand-foreground/10 px-4 py-1.5 text-[11px] font-bold uppercase tracking-[0.22em] text-warm">
          <Sparkles className="h-3.5 w-3.5" strokeWidth={2.25} />
          AI asistentka
        </div>
        <h2 className="font-display mt-6 text-3xl leading-[1.1] sm:text-4xl">
          Rychle, srozumitelně
          <br />
          <span className="text-warm">vše co vás zajímá.</span>
        </h2>
        <p className="mt-5 max-w-sm text-base leading-[1.7] text-brand-foreground/80">
          Naše AI asistentka je tu 24/7. Než vyplníte formulář, můžete se
          rovnou zeptat — odpoví během vteřin.
        </p>
      </div>

      {/* Mini chat preview */}
      <div className="relative mt-8 rounded-2xl bg-brand-foreground/10 p-4 backdrop-blur-sm ring-1 ring-brand-foreground/15">
        <div className="flex items-center gap-3">
          <div className="flex h-8 w-8 items-center justify-center rounded-full bg-warm text-warm-foreground">
            <Sparkles className="h-4 w-4" strokeWidth={2.25} />
          </div>
          <div className="flex-1">
            <div className="text-xs font-bold text-brand-foreground">
              AHC asistentka
            </div>
            <div className="text-[10px] uppercase tracking-wider text-brand-foreground/60">
              Online
            </div>
          </div>
          <span className="h-2 w-2 rounded-full bg-emerald-400" />
        </div>
        <div className="mt-3 space-y-2 text-sm">
          <div className="w-fit rounded-2xl rounded-tl-sm bg-brand-foreground/15 px-3 py-2">
            Dobrý den! S čím vám mohu pomoci?
          </div>
          <div className="ml-auto w-fit rounded-2xl rounded-tr-sm bg-warm px-3 py-2 text-warm-foreground">
            Hledám místo pro maminku.
          </div>
        </div>
      </div>

      <div className="relative mt-6">
        <button
          type="button"
          onClick={openKraitaChat}
          className="group inline-flex items-center gap-2 rounded-full bg-brand-foreground px-5 py-3 text-sm font-bold uppercase tracking-wider text-brand transition-all hover:scale-[1.02] hover:bg-warm hover:text-warm-foreground"
        >
          <MessageCircle className="h-4 w-4" strokeWidth={2.25} />
          Spustit chat
        </button>
      </div>
    </div>
  );
}
