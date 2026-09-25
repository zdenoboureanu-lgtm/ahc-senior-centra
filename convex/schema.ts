import { defineSchema, defineTable } from "convex/server";
import { v } from "convex/values";
import { authTables } from "@convex-dev/auth/server";

/**
 * AHC multi-tenant schema.
 *
 * - `organization` = AHC jako celek (1 řádek). Drží globální data (logo, kontakt na centrálu, společné texty).
 * - `branches` = jednotlivé pobočky/senior centra. Identifikované přes `slug` (= subdoména).
 * - Sdílené tabulky (branches, careers) se propisují napříč všemi weby automaticky — frontend si je čte podle scope.
 * - Per-branch tabulky (news, team_members, services, testimonials, faq, gallery) jsou vázané na konkrétní branchId.
 */
export default defineSchema({
  // ── AUTH (Convex Auth) ─────────────────────────────────────────────
  ...authTables,

  // Profil uživatele administrace — napojený na auth users
  user_profiles: defineTable({
    user_id: v.id("users"), // Convex Auth user
    role: v.union(v.literal("super_admin"), v.literal("branch_manager")),
    // branch_id povinné pro branch_manager, ignorováno pro super_admin
    branch_id: v.optional(v.id("branches")),
    name: v.optional(v.string()),
    created_at: v.number(),
    updated_at: v.number(),
  })
    .index("by_user", ["user_id"])
    .index("by_branch", ["branch_id"]),

  // Audit log — kdo, co, kdy
  audit_logs: defineTable({
    user_id: v.id("users"),
    action: v.string(), // např. "career.created"
    entity_type: v.string(), // "career_position"
    entity_id: v.string(),
    branch_id: v.optional(v.id("branches")),
    before: v.optional(v.string()), // JSON snapshot před
    after: v.optional(v.string()), // JSON snapshot po
    created_at: v.number(),
  })
    .index("by_user", ["user_id"])
    .index("by_branch", ["branch_id", "created_at"]),

  // ── ORG ────────────────────────────────────────────────────────────────────
  organization: defineTable({
    name: v.string(),
    legal_name: v.string(),
    phone: v.string(),
    email: v.string(),
    website: v.string(),
    ico: v.string(),
    dic: v.optional(v.string()),
    created_at: v.number(),
    updated_at: v.number(),
  }),

  // ── POBOČKY (sdílený seznam, propisuje se napříč všemi weby) ──────────────
  branches: defineTable({
    slug: v.string(), // subdoména: stribro -> stribro.ahc.cz
    name: v.string(), // "AHC Senior centrum Stříbro"
    legal_name: v.optional(v.string()), // "AHC Senior centrum Stříbro s.r.o."
    short_name: v.string(), // "Stříbro"
    // Typ zařízení — řídí, jaké sekce homepage se renderují
    branch_type: v.optional(
      v.union(v.literal("senior_centrum"), v.literal("hospital"))
    ),
    // Vizuální šablona webu („sedlec" = ručně psané stránky Sedlce-Prčice).
    // Drží se na pobočce, ne na slugu, aby duplikát vypadal stejně jako originál.
    template: v.optional(v.string()),
    type_label: v.optional(v.string()), // "Senior centrum" | "Městská nemocnice"
    tagline: v.optional(v.string()), // "Péče s respektem ke stáří"
    subtitle: v.optional(v.string()), // delší podpis pod headlinem v hero
    description: v.string(), // krátký popis ("Domov pro seniory s péčí a klidem v srdci Stříbra")

    // Adresa
    street: v.string(),
    city: v.string(),
    zip: v.string(),
    region: v.string(),
    ico: v.optional(v.string()),

    // Legal sídlo (pro footer disclaimer) — odlišné od provozu
    legal_address: v.optional(v.string()),
    legal_court_note: v.optional(v.string()),

    // Mateřská organizace
    parent_org: v.optional(v.string()), // "Ambeat Group"

    // Kontakt
    phone: v.string(), // hlavní kontakt v hlavičce/hero
    phone_short: v.optional(v.string()), // pro hlavičku ("729 853 498")
    email: v.string(),
    facebook_url: v.optional(v.string()),
    instagram_url: v.optional(v.string()),

    // Office contact (footer) — jiný kontakt než provozní telefon
    office_contact_name: v.optional(v.string()),
    office_contact_phone: v.optional(v.string()),
    office_contact_email: v.optional(v.string()),

    // Sesterna info (24/7)
    sesterna_phone: v.optional(v.string()),

    // Geo (pro mapu)
    lat: v.number(),
    lng: v.number(),

    // Vzdálenosti k velkým městům (homepage "Kde nás najdete")
    distance_city_1_label: v.optional(v.string()), // "Plzeň"
    distance_city_1_km: v.optional(v.number()),
    distance_city_2_label: v.optional(v.string()),
    distance_city_2_km: v.optional(v.number()),
    distance_city_3_label: v.optional(v.string()),
    distance_city_3_km: v.optional(v.number()),

    // Kapacita
    bed_count: v.optional(v.number()),
    room_count: v.optional(v.number()),

    // Legacy (z první verze schématu) — nechat optional pro zpětnou kompat.
    stat_beds: v.optional(v.number()),
    stat_employees: v.optional(v.number()),
    stat_years: v.optional(v.number()),

    // EU dotace (sekce "Spolufinancováno Evropskou unií")
    eu_grant_amount: v.optional(v.number()), // 9879115
    eu_grant_program: v.optional(v.string()),
    eu_grant_year_until: v.optional(v.number()),

    // Branding per pobočka (volitelné — default z org)
    cover_image: v.optional(v.string()),
    logo_url: v.optional(v.string()),

    // Stav
    is_published: v.boolean(),
    opening_year: v.optional(v.number()),

    created_at: v.number(),
    updated_at: v.number(),
  })
    .index("by_slug", ["slug"])
    .index("by_published", ["is_published"])
    .index("by_region", ["region"]),

  // ── PER-BRANCH OBSAH ──────────────────────────────────────────────────────

  // Oddělení / ambulance / komplementy (pro nemocnice typu Duchcov)
  branch_units: defineTable({
    branch_id: v.id("branches"),
    category: v.union(
      v.literal("oddeleni"),
      v.literal("ambulance"),
      v.literal("komplement")
    ),
    name: v.string(),
    description: v.optional(v.string()),
    icon: v.optional(v.string()),
    slug: v.optional(v.string()),
    order: v.number(),
    created_at: v.number(),
    updated_at: v.number(),
  })
    .index("by_branch", ["branch_id"])
    .index("by_branch_category", ["branch_id", "category"]),

  // Služby pobočky (Co u nás najdete?)
  branch_services: defineTable({
    branch_id: v.id("branches"),
    title: v.string(),
    description: v.optional(v.string()),
    icon: v.string(), // lucide ikona name
    order: v.number(),
    created_at: v.number(),
    updated_at: v.number(),
  }).index("by_branch", ["branch_id"]),

  // Vybavení pokojů (Jak to u nás vypadá)
  branch_facilities: defineTable({
    branch_id: v.id("branches"),
    title: v.string(),
    image_url: v.string(),
    order: v.number(),
    created_at: v.number(),
    updated_at: v.number(),
  }).index("by_branch", ["branch_id"]),

  // Tým / management (ředitel, vrchní sestra, ...)
  branch_team: defineTable({
    branch_id: v.id("branches"),
    name: v.string(),
    role: v.string(),
    bio: v.optional(v.string()),
    photo_url: v.optional(v.string()),
    email: v.optional(v.string()),
    phone: v.optional(v.string()),
    is_director: v.optional(v.boolean()), // pro "Slovo ředitelky" sekci
    order: v.number(),
    created_at: v.number(),
    updated_at: v.number(),
  }).index("by_branch", ["branch_id"]),

  // O nás — bullet body do "Čisté a nové prostředí"
  branch_about_features: defineTable({
    branch_id: v.id("branches"),
    // Nadpis karty („Chráníme důstojnost"). Starší pobočky ho nemají —
    // karta pak ukáže jen text, jako dřív.
    title: v.optional(v.string()),
    icon: v.optional(v.string()),
    text: v.string(),
    order: v.number(),
    created_at: v.number(),
    updated_at: v.number(),
  }).index("by_branch", ["branch_id"]),

  // Krátké info-bloky na homepage ("Pohodlné bydlení", "Plzeň je kousek", "Jak se přihlásit")
  branch_highlights: defineTable({
    branch_id: v.id("branches"),
    title: v.string(),
    description: v.string(),
    icon: v.optional(v.string()),
    order: v.number(),
    created_at: v.number(),
    updated_at: v.number(),
  }).index("by_branch", ["branch_id"]),

  // Sekce „V číslech" na homepage — plně editovatelná z administrace.
  // `value` je string schválně: klient chce psát i „24/7", „přes 100" apod.
  // `label` je volný text, aby si pobočka pohlídala skloňování („km od Příbrami").
  branch_stats: defineTable({
    branch_id: v.id("branches"),
    value: v.string(),
    label: v.string(),
    icon: v.optional(v.string()), // lucide název, default BedDouble
    order: v.number(),
    created_at: v.number(),
    updated_at: v.number(),
  }).index("by_branch", ["branch_id"]),

  // Kroky procesu žádosti o přijetí (8 kroků na /zadost-o-prijeti)
  branch_admission_steps: defineTable({
    branch_id: v.id("branches"),
    step_number: v.number(),
    title: v.string(),
    description: v.string(),
    created_at: v.number(),
    updated_at: v.number(),
  }).index("by_branch", ["branch_id"]),

  // Dotace a povinná publicita (EU, kraj, ministerstvo…)
  branch_grants: defineTable({
    branch_id: v.id("branches"),
    funder: v.string(), // „Evropská unie" | „Plzeňský kraj"
    funder_short: v.string(), // „EU" | „PK" — do logo placeholderu
    project_name: v.optional(v.string()), // např. „Poskytování sociálních služeb"
    amount: v.optional(v.number()), // 9 879 115
    program: v.optional(v.string()), // „OP Technologie a aplikace…"
    year_until: v.optional(v.number()),
    description: v.optional(v.string()), // delší popis v accordionu
    visual_url: v.optional(v.string()), // velký „logo-vizuál" obrázek od kraje
    docs: v.optional(
      v.array(
        v.object({
          title: v.string(),
          file_url: v.string(),
          size_kb: v.optional(v.number()),
        })
      )
    ),
    order: v.number(),
    created_at: v.number(),
    updated_at: v.number(),
  }).index("by_branch", ["branch_id"]),

  // Benefity / výhody pro kariéru (3 sloupce: Smysl, Benefity, Rodina)
  branch_career_perks: defineTable({
    branch_id: v.id("branches"),
    title: v.string(),
    description: v.string(),
    icon: v.optional(v.string()),
    order: v.number(),
    created_at: v.number(),
    updated_at: v.number(),
  }).index("by_branch", ["branch_id"]),

  // Reference / recenze
  branch_testimonials: defineTable({
    branch_id: v.id("branches"),
    author_name: v.string(),
    author_role: v.optional(v.string()), // "dcera klientky"
    content: v.string(),
    rating: v.optional(v.number()),
    photo_url: v.optional(v.string()),
    created_at: v.number(),
    updated_at: v.number(),
  }).index("by_branch", ["branch_id"]),

  // FAQ / Nejčastější dotazy
  branch_faq: defineTable({
    branch_id: v.id("branches"),
    question: v.string(),
    answer: v.string(),
    order: v.number(),
    created_at: v.number(),
    updated_at: v.number(),
  }).index("by_branch", ["branch_id"]),

  // Článkový obsah podstránek (O zařízení, Služby, …) — 1:1 obsah od klienta.
  // blocks = pole bloků renderovaných generickým RichContent rendererem.
  branch_pages: defineTable({
    branch_id: v.id("branches"),
    page: v.string(), // "o-zarizeni" | "sluzby" | "dokumenty" | "kontakty"
    title: v.optional(v.string()),
    eyebrow: v.optional(v.string()),
    lead: v.optional(v.string()),
    blocks: v.array(
      v.object({
        // Stabilní identita bloku. Bez ní by se skrývání i duplikace vázaly
        // na pořadí a po vložení kopie by „ujely" na sousední blok.
        uid: v.optional(v.string()),
        type: v.string(), // heading | paragraph | feature | quote | linklist | cta
        text: v.optional(v.string()),
        heading: v.optional(v.string()),
        author: v.optional(v.string()),
        href: v.optional(v.string()),
        label: v.optional(v.string()),
        items: v.optional(
          v.array(
            v.object({
              label: v.string(),
              text: v.optional(v.string()),
              url: v.optional(v.string()),
              image: v.optional(v.string()),
            })
          )
        ),
        bullets: v.optional(v.array(v.string())),
      })
    ),
    updated_at: v.number(),
  })
    .index("by_branch", ["branch_id"])
    .index("by_branch_page", ["branch_id", "page"]),

  // Přepsané texty a fotky ručně napsaných stránek (Sedlec-Prčice).
  // Tyhle stránky mají obsah v JSX, ne v `branch_pages` — klíč sem uložený
  // původní text jen přebije, takže se nemusí nic migrovat a stránka vypadá
  // stejně, dokud ji někdo v editoru opravdu nezmění.
  branch_copy: defineTable({
    branch_id: v.id("branches"),
    key: v.string(), // např. „domu.hero.title" nebo „domu.hero.foto"
    value: v.string(),
    updated_at: v.number(),
  })
    .index("by_branch", ["branch_id"])
    .index("by_branch_key", ["branch_id", "key"]),

  // Důležité informace / aktuality (červené alerty na homepage)
  branch_alerts: defineTable({
    branch_id: v.id("branches"),
    title: v.string(),
    body: v.optional(v.string()),
    link_url: v.optional(v.string()),
    link_label: v.optional(v.string()),
    severity: v.union(
      v.literal("info"),
      v.literal("warning"),
      v.literal("important")
    ),
    is_active: v.boolean(),
    order: v.number(),
    created_at: v.number(),
    updated_at: v.number(),
  })
    .index("by_branch", ["branch_id"])
    .index("by_branch_active", ["branch_id", "is_active"]),

  // Novinky
  branch_news: defineTable({
    branch_id: v.id("branches"),
    title: v.string(),
    slug: v.string(),
    excerpt: v.string(),
    content: v.string(), // markdown
    cover_image: v.optional(v.string()),
    published_at: v.number(),
    is_published: v.boolean(),
    created_at: v.number(),
    updated_at: v.number(),
  })
    .index("by_branch", ["branch_id"])
    .index("by_branch_slug", ["branch_id", "slug"])
    .index("by_published_at", ["branch_id", "is_published", "published_at"]),

  // Galerie
  branch_gallery: defineTable({
    branch_id: v.id("branches"),
    image_url: v.string(),
    caption: v.optional(v.string()),
    order: v.number(),
    created_at: v.number(),
    updated_at: v.number(),
  }).index("by_branch", ["branch_id"]),

  // Dokumenty ke stažení (pro žádost o přijetí)
  branch_documents: defineTable({
    branch_id: v.id("branches"),
    title: v.string(),
    description: v.optional(v.string()),
    file_url: v.string(),
    file_size: v.optional(v.number()),
    order: v.number(),
    created_at: v.number(),
    updated_at: v.number(),
  }).index("by_branch", ["branch_id"]),

  // Otevírací / návštěvní hodiny
  branch_hours: defineTable({
    branch_id: v.id("branches"),
    label: v.string(), // "Návštěvy", "Recepce"
    day_from: v.number(), // 0=pondělí .. 6=neděle
    day_to: v.number(),
    time_from: v.string(), // "08:00"
    time_to: v.string(),
    note: v.optional(v.string()),
    order: v.number(),
    created_at: v.number(),
    updated_at: v.number(),
  }).index("by_branch", ["branch_id"]),

  // ── KARIÉRA (sdílená napříč pobočkami, ale s vazbou na konkrétní pobočku) ─
  career_positions: defineTable({
    branch_id: v.id("branches"), // pro kterou pobočku
    title: v.string(),
    slug: v.string(),
    employment_type: v.union(
      v.literal("full_time"),
      v.literal("part_time"),
      v.literal("contract"),
      v.literal("internship")
    ),
    description: v.string(),
    requirements: v.optional(v.string()),
    benefits: v.optional(v.string()),
    salary_from: v.optional(v.number()),
    salary_to: v.optional(v.number()),
    is_published: v.boolean(),
    published_at: v.number(),
    created_at: v.number(),
    updated_at: v.number(),
  })
    .index("by_branch", ["branch_id"])
    .index("by_branch_slug", ["branch_id", "slug"])
    .index("by_published", ["is_published", "published_at"]),

  // Kontaktní formulářové žádosti (žádost o přijetí, dotaz, kariéra)
  inquiries: defineTable({
    branch_id: v.id("branches"),
    type: v.union(
      v.literal("admission"),
      v.literal("contact"),
      v.literal("career")
    ),
    name: v.string(),
    email: v.string(),
    phone: v.optional(v.string()),
    message: v.string(),
    related_position_id: v.optional(v.id("career_positions")),
    is_resolved: v.boolean(),
    created_at: v.number(),
    updated_at: v.number(),
  })
    .index("by_branch", ["branch_id"])
    .index("by_branch_resolved", ["branch_id", "is_resolved"]),
});
