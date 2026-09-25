"use client";

import { MessageCircle, Sparkles } from "lucide-react";

function openKraitaChat() {
  const btn = document.getElementById("chatbot-minimized");
  if (btn) { btn.click(); return; }
  const w = window as unknown as Record<string, (() => void) | undefined>;
  if (typeof w.maximizeChatbot === "function") w.maximizeChatbot();
}

export function ChatCtaSection() {
  return (
    <section className="mx-auto max-w-[1320px] px-6 py-16 lg:px-10 lg:py-24">
      <div className="relative overflow-hidden rounded-[2.5rem] bg-gradient-to-br from-brand-dark via-brand to-brand-dark p-10 text-brand-foreground shadow-2xl shadow-brand/25 sm:p-14 lg:p-20">
        <div
          aria-hidden="true"
          className="pointer-events-none absolute -right-20 -top-20 h-72 w-72 rounded-full bg-warm/30 blur-3xl animate-pulse-blob"
        />
        <div
          aria-hidden="true"
          className="pointer-events-none absolute -bottom-32 -left-20 h-80 w-80 rounded-full bg-brand-foreground/10 blur-3xl animate-float-slow"
        />

        <div className="relative grid items-center gap-10 lg:grid-cols-[1.4fr_1fr] lg:gap-14">
          <div>
            <div className="inline-flex items-center gap-2 rounded-full bg-brand-foreground/10 px-4 py-1.5 text-[11px] font-bold uppercase tracking-[0.22em] text-warm">
              <Sparkles className="h-3.5 w-3.5" strokeWidth={2.25} />
              AI asistentka
            </div>
            <h2 className="font-display mt-6 text-4xl leading-[1.05] sm:text-5xl lg:text-[3.5rem]">
              Rychle, srozumitelně
              <br />
              <span className="text-warm">vše co vás zajímá.</span>
            </h2>
            <p className="mt-6 max-w-xl text-base leading-[1.7] text-brand-foreground/80 sm:text-lg">
              Naše AI asistentka je tu 24/7. Odpoví na vše ohledně přijetí,
              péče i ceníku — zdarma, bez čekání.
            </p>

            <div className="mt-10">
              <button
                type="button"
                onClick={openKraitaChat}
                className="group inline-flex items-center gap-3 rounded-full bg-brand-foreground px-7 py-4 text-sm font-bold uppercase tracking-wider text-brand shadow-lg transition-all hover:scale-[1.02] hover:bg-warm hover:text-warm-foreground"
              >
                <MessageCircle className="h-4 w-4" strokeWidth={2.25} />
                Spustit chat
              </button>
            </div>
          </div>

          {/* Chat preview mock */}
          <div className="relative hidden lg:block">
            <div className="rounded-3xl bg-brand-foreground/10 p-5 backdrop-blur-sm ring-1 ring-brand-foreground/15">
              <div className="rounded-2xl bg-brand-foreground p-5 text-foreground shadow-xl">
                <div className="flex items-center gap-3">
                  <div className="flex h-9 w-9 items-center justify-center rounded-full bg-warm text-warm-foreground">
                    <Sparkles className="h-4 w-4" strokeWidth={2.25} />
                  </div>
                  <div className="flex-1">
                    <div className="text-xs font-bold text-foreground">
                      AHC asistentka
                    </div>
                    <div className="text-[10px] uppercase tracking-wider text-muted-foreground">
                      Online
                    </div>
                  </div>
                  <span className="h-2 w-2 rounded-full bg-emerald-500" />
                </div>

                <div className="mt-4 space-y-3 text-sm">
                  <div className="rounded-2xl rounded-tl-sm bg-secondary/60 p-3 text-foreground">
                    Dobrý den! S čím vám mohu pomoci?
                  </div>
                  <div className="rounded-2xl rounded-tr-sm bg-brand-light p-3 text-brand-dark">
                    Hledám místo pro maminku.
                  </div>
                  <div className="rounded-2xl rounded-tl-sm bg-secondary/60 p-3 text-foreground">
                    Rád vám provedeme přijímacím procesem...
                  </div>
                </div>

                <div className="mt-4 flex items-center gap-2 rounded-full border border-border bg-background px-4 py-2.5 text-xs text-muted-foreground">
                  Napište zprávu...
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
