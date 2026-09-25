export const BRAND = {
  NAME: "AHC",
  FULL_NAME: "AHC – Senior centra",
  TAGLINE: "Péče s respektem ke stáří",
} as const;

interface NavItem {
  label: string;
  href: string;
}

/** Navigace pro senior centrum (domácí péče typu Stříbro). */
export const NAV_ITEMS_SENIOR: readonly NavItem[] = [
  { label: "Domů", href: "/" },
  { label: "O nás", href: "/o-nas" },
  { label: "Služby", href: "/sluzby" },
  { label: "Kariéra", href: "/kariera" },
  { label: "Dokumenty", href: "/dokumenty" },
  { label: "Kontakty", href: "/kontakt" },
] as const;

/** Navigace pro městskou nemocnici (typ Duchcov). */
export const NAV_ITEMS_HOSPITAL: readonly NavItem[] = [
  { label: "Domů", href: "/" },
  { label: "Oddělení", href: "/oddeleni" },
  { label: "Ambulance", href: "/ambulance" },
  { label: "Služby", href: "/sluzby" },
  { label: "O nemocnici", href: "/o-nas" },
  { label: "Kariéra", href: "/kariera" },
  { label: "Dokumenty", href: "/dokumenty" },
  { label: "Kontakty", href: "/kontakt" },
] as const;

/** Default fallback (senior centrum), pro pouhý import. */
export const NAV_ITEMS = NAV_ITEMS_SENIOR;

export const FOOTER_QUICK_LINKS_SENIOR = [
  { label: "O nás", href: "/o-nas" },
  { label: "Služby", href: "/sluzby" },
  { label: "Kariéra", href: "/kariera" },
  { label: "Žádost o přijetí", href: "/zadost-o-prijeti" },
  { label: "Dokumenty ke stažení", href: "/dokumenty" },
  { label: "Kontakty", href: "/kontakt" },
  { label: "GDPR", href: "/gdpr" },
] as const;

export const FOOTER_QUICK_LINKS_HOSPITAL = [
  { label: "Oddělení", href: "/oddeleni" },
  { label: "Ambulance", href: "/ambulance" },
  { label: "Služby", href: "/sluzby" },
  { label: "O nemocnici", href: "/o-nas" },
  { label: "Kariéra", href: "/kariera" },
  { label: "Dokumenty ke stažení", href: "/dokumenty" },
  { label: "Kontakty", href: "/kontakt" },
  { label: "GDPR", href: "/gdpr" },
] as const;

export const FOOTER_QUICK_LINKS = FOOTER_QUICK_LINKS_SENIOR;
