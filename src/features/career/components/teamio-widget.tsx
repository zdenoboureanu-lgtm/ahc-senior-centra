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

/** Region value IDs from the widget's location select. */
export const TEAMIO_REGION = {
  STREDOCESKY: "R206696",
  USTECKY: "R238671",
  PLZENSKY: "R230064",
  KARLOVARSKY: "R235864",
  KRALOVEHRADECKY: "R249811",
} as const;

export function TeamioWidget({ defaultLocationId }: { defaultLocationId?: string }) {
  useEffect(() => {
    if (!defaultLocationId) return;

    const trySet = () => {
      const select = document.querySelector<HTMLSelectElement>(
        "#capybara .cp-filter__select--location"
      );
      if (select && select.value !== defaultLocationId) {
        select.value = defaultLocationId;
        select.dispatchEvent(new Event("change", { bubbles: true }));
        return true;
      }
      return false;
    };

    if (trySet()) return;

    const el = document.getElementById("capybara") ?? document.body;
    const obs = new MutationObserver(() => { if (trySet()) obs.disconnect(); });
    obs.observe(el, { childList: true, subtree: true });
    return () => obs.disconnect();
  }, [defaultLocationId]);

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
