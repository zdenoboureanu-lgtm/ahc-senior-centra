"use client";

import Script from "next/script";
import { useEffect } from "react";

/**
 * Teamio (LMC) „Capybara" widget — živý výpis volných pozic z náborového
 * systému Teamio. Personalisté spravují inzeráty v Teamiu, web je načítá sám.
 *
 * apiKey/widgetId jsou veřejné (určené do HTML webu) — nejsou tajemství.
 * Tech. dokumentace: https://snippet.capybara.lmc.cz/
 */
const LMC_CONFIG = {
  apiKey:
    "632ae58b2035181166713f387475f08736236ad3f668157bf1b03c02e4db0f2e",
  widgetId: "ab26cd90-0ffe-4f26-8ffd-23693d2bb809",
  selector: "#capybara",
  themes: ["base"],
};

/** Porovnání názvů krajů bez ohledu na diakritiku a velikost písmen. */
function normalizeRegion(text: string): string {
  return text
    .normalize("NFD")
    .replace(/\p{Diacritic}/gu, "")
    .toLowerCase()
    .replace(/\s*kraj\s*/g, "")
    .trim();
}

/**
 * @param defaultRegion Název kraje pobočky („Plzeňský kraj"). Ve výpisu se
 * předvolí, aby návštěvník viděl nejdřív pozice ze svého okolí. Hledáme podle
 * názvu v nabídce widgetu — Teamio interní ID se nemusí udržovat ručně.
 */
export function TeamioWidget({ defaultRegion }: { defaultRegion?: string }) {
  useEffect(() => {
    if (!defaultRegion) return;
    const wanted = normalizeRegion(defaultRegion);

    const trySet = () => {
      const select = document.querySelector<HTMLSelectElement>(
        "#capybara .cp-filter__select--location"
      );
      if (!select || select.options.length <= 1) return false;
      const match = Array.from(select.options).find(
        (o) => o.value && normalizeRegion(o.textContent ?? "") === wanted
      );
      if (!match || select.value === match.value) return Boolean(match);
      select.value = match.value;
      select.dispatchEvent(new Event("change", { bubbles: true }));
      return true;
    };

    if (trySet()) return;

    const el = document.getElementById("capybara") ?? document.body;
    const obs = new MutationObserver(() => { if (trySet()) obs.disconnect(); });
    obs.observe(el, { childList: true, subtree: true });
    return () => obs.disconnect();
  }, [defaultRegion]);

  return (
    <div className="mx-auto max-w-[1320px] px-6 pb-8 lg:px-10">
      {/* Fix spacing between "Odpovědět" button and "Zpět na výpis pozic" link */}
      <style>{`
        #capybara .cp-button__wrapper--offset {
          display: flex !important;
          flex-direction: column !important;
          align-items: flex-start !important;
          gap: 16px !important;
        }
        /* Nadpis filtru „Vyhledávání" byl výrazně oranžový a přebíjel obsah. */
        #capybara .cp-filter__title,
        #capybara .cp-filter h2,
        #capybara .cp-filter h3 {
          font-size: 11px !important;
          font-weight: 700 !important;
          letter-spacing: 0.22em !important;
          text-transform: uppercase !important;
          color: hsl(var(--muted-foreground)) !important;
          margin-bottom: 4px !important;
        }
      `}</style>

      <div id="capybara" className="min-h-[200px]" />
      <Script id="lmc-career-config" strategy="afterInteractive">
        {`window.__LMC_CAREER_WIDGET__ = ${JSON.stringify(LMC_CONFIG)};`}
      </Script>
      <Script
        id="lmc-career-widget"
        src="https://snippet.capybara.lmc.cz/js/widget-3.x.x.min.js"
        strategy="afterInteractive"
        charSet="UTF-8"
      />
    </div>
  );
}
