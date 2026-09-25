import * as Icons from "lucide-react";
import type { LucideIcon } from "lucide-react";

/**
 * Ikona ke kartě podle jejího nadpisu. Obsah od klienta ikony neobsahuje,
 * odvozujeme je proto z české terminologie péče — stejný slovník, jaký má
 * ručně stavěná pobočka Sedlec-Prčice.
 *
 * Porovnáváme bez diakritiky: texty z Google Docs mají znaky rozložené
 * (NFD), takže „ů" ve zdrojáku by se s „ů" v obsahu jinak neshodlo.
 * Pořadí rozhoduje — konkrétnější pojmy patří nahoru.
 */
const RULES: Array<[RegExp, keyof typeof Icons]> = [
  [/dustojn|respekt|ucta|uctiv/, "ShieldCheck"],
  [/bezpec|ochran|riziko/, "ShieldPlus"],
  [/individual|na miru|osobnost|jedinecn/, "UserCheck"],
  [/rodin|blizk|navstev/, "HeartHandshake"],
  [/lekar|zdravotn|osetrovatel|sestr|diagnoz|lecb/, "Stethoscope"],
  [/rehabilitac|fyzioterap|cvic|kondic|pohyb/, "Activity"],
  [/strav|jidl|kuchyn|pitn/, "UtensilsCrossed"],
  [/ubytov|pokoj|luzk|bydl/, "BedDouble"],
  [/hygien|koupel|sprch/, "ShowerHead"],
  [/zahrad|prirod|venk|teras|park/, "Trees"],
  [/aktiviz|volnocas|program|tvor|zabav|kultur/, "Sparkles"],
  [/komunikac|nasloucha|empat|rozhovor|porozum/, "MessageCircle"],
  [/sobestacn|samostatn|nacvik/, "Footprints"],
  [/socialn|poraden|pracovnic/, "Users"],
  [/tym|spolupra|odbornost|profesional/, "Users"],
  [/uhrad|platb|cena|cenik|prispev|financ/, "Wallet"],
  [/prav|stiznost|pravidl|smlouv|dokument/, "Scale"],
  [/nepretrzit|hodin|cas |24/, "Clock"],
  [/domov|prostred|zazem|klid/, "Home"],
  [/demenc|pamet|orientac/, "Brain"],
  [/duchovn|vira|bohosluzb/, "Church"],
  [/prijet|zadost|nastup|postup/, "ClipboardList"],
];

/** Sjednotí zápis: rozloží znaky, zahodí diakritiku a převede na malá písmena. */
function normalize(text: string): string {
  return text
    .normalize("NFD")
    .replace(/\p{Diacritic}/gu, "")
    .toLowerCase();
}

export function iconForHeading(heading?: string): LucideIcon {
  if (heading) {
    const needle = normalize(heading);
    for (const [re, name] of RULES) {
      if (re.test(needle)) {
        // Lucide ikony jsou forwardRef objekty, ne funkce — stačí kontrola na existenci.
        const found = Icons[name] as unknown as LucideIcon | undefined;
        if (found) return found;
      }
    }
  }
  return Icons.Heart;
}
