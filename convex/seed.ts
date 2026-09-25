import { v } from "convex/values";
import { mutation, internalMutation } from "./_generated/server";
import { getAuthUserId } from "@convex-dev/auth/server";

function slugifyCz(name: string): string {
  return name
    .toLowerCase()
    .normalize("NFD")
    .replace(/\p{Diacritic}/gu, "")
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-+|-+$/g, "");
}

/**
 * Seed dat pro pobočku Stříbro a další 3 ukázkové pobočky.
 * Zdroj dat: Figma PDFs (homepage, o nás, kontakty, žádost, kariéra).
 *
 * Spustit z Convex dashboardu / CLI: `bunx convex run seed:runStribroSeed`
 * Idempotentní — smaže existující Stříbro a zaseeduje znovu.
 */
export const runStribroSeed = mutation({
  args: {},
  handler: async (ctx) => {
    const now = Date.now();

    // ── ORG ──────────────────────────────────────────────────────────────
    const orgs = await ctx.db.query("organization").collect();
    for (const o of orgs) await ctx.db.delete(o._id);
    await ctx.db.insert("organization", {
      name: "AHC",
      legal_name: "AHC Senior centrum Stříbro s.r.o.",
      phone: "+420 729 853 498",
      email: "stribro@ahc.cz",
      website: "https://ahc.cz",
      ico: "22317821",
      created_at: now,
      updated_at: now,
    });

    // ── Smaže existující Stříbro + souvisejíci data ──────────────────────
    const existing = await ctx.db
      .query("branches")
      .withIndex("by_slug", (q) => q.eq("slug", "stribro"))
      .unique();

    if (existing) {
      const tables = [
        "branch_services",
        "branch_facilities",
        "branch_team",
        "branch_testimonials",
        "branch_faq",
        "branch_news",
        "branch_gallery",
        "branch_documents",
        "branch_hours",
        "branch_about_features",
        "branch_highlights",
        "branch_admission_steps",
        "branch_career_perks",
        "branch_grants",
        "career_positions",
      ] as const;
      for (const t of tables) {
        const rows = await ctx.db
          .query(t)
          .withIndex("by_branch", (q) => q.eq("branch_id", existing._id))
          .collect();
        for (const r of rows) await ctx.db.delete(r._id);
      }
      await ctx.db.delete(existing._id);
    }

    // ── STŘÍBRO ──────────────────────────────────────────────────────────
    const stribroId = await ctx.db.insert("branches", {
      slug: "stribro",
      name: "AHC Senior centrum Stříbro",
      legal_name: "AHC Senior centrum Stříbro s.r.o.",
      short_name: "Stříbro",
      branch_type: "senior_centrum" as const,
      type_label: "Senior centrum",
      tagline: "Péče\n*s respektem*\nke stáří",
      subtitle:
        "Profesionální péče o seniory v přátelském prostředí. Bezpečí, důstojnost a každodenní laskavost.",
      description:
        "Domov pro seniory s péčí a klidem v srdci Stříbra. Nabízíme klidné a bezpečné prostředí pro seniory s individuální péčí a komfortním zázemím.",
      street: "Revoluční 1011",
      city: "Stříbro",
      zip: "349 01",
      region: "Plzeňský kraj",
      ico: "22317821",
      legal_address: "Budějovická 778/3, 140 00 Praha 4 Michle",
      legal_court_note:
        "Vedené u Městského soudu v Praze, spisová značka C 414530",
      parent_org: "Ambeat Group",
      phone: "+420 729 853 498",
      phone_short: "729 853 498",
      email: "stribro@ahc.cz",
      facebook_url: "https://facebook.com/ahcstribro",
      office_contact_name: "Olga Hermanová",
      office_contact_phone: "+420 775 182 385",
      office_contact_email: "olga.hermanova@ahc.cz",
      sesterna_phone: "+420 373 700 680",
      lat: 49.7547,
      lng: 13.0006,
      distance_city_1_label: "Plzeň",
      distance_city_1_km: 27,
      distance_city_2_label: "Praha",
      distance_city_2_km: 100,
      distance_city_3_label: "Karlovy Vary",
      distance_city_3_km: 50,
      bed_count: 92,
      room_count: 48,
      eu_grant_amount: 9879115,
      eu_grant_program:
        "Operační program Technologie a aplikace pro konkurenceschopnost",
      eu_grant_year_until: 2030,
      cover_image: "/images/building.png",
      is_published: true,
      created_at: now,
      updated_at: now,
    });

    // ── HIGHLIGHTS (3 boxy v "O nás" sekci homepage) ─────────────────────
    const highlights = [
      {
        title: "Pohodlné bydlení",
        description:
          "92 lůžek. Jedno-, dvou- i třílůžkové pokoje. Sdílené koupelny maximálně pro 4 klienty. Po splnění požadavků přijímáme klienty okamžitě.",
        icon: "BedDouble",
      },
      {
        title: "Plzeň je kousek",
        description:
          "Senior centrum se nachází na strategickém místě města Stříbra, s výbornou dostupností a vlastním velkým parkovištěm.",
        icon: "MapPin",
      },
      {
        title: "Jak se přihlásit?",
        description:
          "V případě zájmu využijte prosím tlačítko Žádost o přijetí. Provedeme Vás celým procesem.",
        icon: "FileText",
      },
    ];
    for (let i = 0; i < highlights.length; i++) {
      await ctx.db.insert("branch_highlights", {
        branch_id: stribroId,
        ...highlights[i],
        order: i,
        created_at: now,
        updated_at: now,
      });
    }

    // ── SLUŽBY (sekce "Služby a péče o klienty") ─────────────────────────
    const services = [
      { title: "Biografický koncept", description: "Každému připravíme plán na míru, který respektuje jeho potřeby, možnosti a přání v našem centru.", icon: "BookHeart" },
      { title: "Dlouhodobá lůžková péče", description: "Nepřetržitá ošetřovatelská a sociální péče.", icon: "BedDouble" },
      { title: "Rehabilitace", description: "Individuální i skupinová cvičení s fyzioterapeuty.", icon: "Activity" },
      { title: "Aktivizační programy", description: "Pestré denní aktivity pro tělo i mysl.", icon: "Sparkles" },
      { title: "Stravování", description: "Pestrá a chutná strava připravovaná na míru.", icon: "UtensilsCrossed" },
      { title: "Duchovní péče", description: "Pravidelné bohoslužby a individuální setkání.", icon: "HandHeart" },
    ];
    for (let i = 0; i < services.length; i++) {
      await ctx.db.insert("branch_services", {
        branch_id: stribroId,
        title: services[i].title,
        description: services[i].description,
        icon: services[i].icon,
        order: i,
        created_at: now,
        updated_at: now,
      });
    }

    // ── ABOUT FEATURES (bullets na /o-nas "Čisté a nové prostředí") ───────
    const aboutFeatures = [
      "48 pokojů, kapacita 91 lůžek",
      "Jednolůžkové, dvoulůžkové, třílůžkové a čtyřlůžkové pokoje",
      "Vybavení: zdravotnická polohovací postel, stůl, židle, šatní skříň pro každého klienta, noční stolek, televize",
      "Koupelna vybavena sprchou, umyvadlem a WC",
      "Lůžková koupelna pro imobilní klienty na každém patře",
      "Zkušený provozovatel AHC",
    ];
    for (let i = 0; i < aboutFeatures.length; i++) {
      await ctx.db.insert("branch_about_features", {
        branch_id: stribroId,
        text: aboutFeatures[i],
        order: i,
        created_at: now,
        updated_at: now,
      });
    }

    // ── FACILITIES (Jak to u nás vypadá) ─────────────────────────────────
    const facilities = [
      { title: "Jednolůžkový pokoj", image: "https://images.unsplash.com/photo-1631217868264-e5b90bb7e133?w=1200&q=80" },
      { title: "Společenská místnost", image: "https://images.unsplash.com/photo-1505693416388-ac5ce068fe85?w=1200&q=80" },
      { title: "Zahrada", image: "https://images.unsplash.com/photo-1567538096630-e0c55bd6374c?w=1200&q=80" },
      { title: "Jídelna", image: "https://images.unsplash.com/photo-1556909114-f6e7ad7d3136?w=1200&q=80" },
      { title: "Dvoulůžkový pokoj", image: "https://images.unsplash.com/photo-1554995207-c18c203602cb?w=1200&q=80" },
      { title: "Recepce", image: "https://images.unsplash.com/photo-1582719508461-905c673771fd?w=1200&q=80" },
      { title: "Rehabilitace", image: "https://images.unsplash.com/photo-1559757175-5700dde675bc?w=1200&q=80" },
      { title: "Kavárna", image: "https://images.unsplash.com/photo-1554118811-1e0d58224f24?w=1200&q=80" },
      { title: "Knihovna", image: "https://images.unsplash.com/photo-1521587760476-6c12a4b040da?w=1200&q=80" },
      { title: "Terasa", image: "https://images.unsplash.com/photo-1505691938895-1758d7feb511?w=1200&q=80" },
    ];
    for (let i = 0; i < facilities.length; i++) {
      await ctx.db.insert("branch_facilities", {
        branch_id: stribroId,
        title: facilities[i].title,
        image_url: facilities[i].image,
        order: i,
        created_at: now,
        updated_at: now,
      });
    }

    // ── TÝM (z PDF kontaktů) ─────────────────────────────────────────────
    const team = [
      {
        name: "Lenka Kantoříková",
        role: "Ředitelka zařízení",
        phone: "+420 770 333 832",
        email: "stribro@ahc.cz",
        is_director: true,
        bio: "Vedu naše centrum již řadu let. Mým posláním je, aby se každý klient cítil u nás jako doma.",
      },
      {
        name: "Jana Roud Gawendová",
        role: "Vrchní sestra",
        phone: "+420 770 333 486",
        email: "jana.roud.gawendova@ahc.cz",
      },
      {
        name: "Dominika Kopečná",
        role: "Personalistka",
        phone: "+420 770 388 677",
        email: "dominika.kopecna@ahc.cz",
      },
      {
        name: "Mgr. Aleš Řeřicha",
        role: "Sociální pracovník",
        phone: "+420 720 853 498",
        email: "ales.rericha@ahc.cz",
      },
      {
        name: "Marcela Praizlerová",
        role: "Vedoucí provozu",
        phone: "+420 770 332 481",
        email: "marcela.praizlerova@ahc.cz",
      },
      {
        name: "Dominika Švábová, DiS.",
        role: "Sociální pracovnice",
        phone: "+420 770 329 726",
        email: "dominika.svabova@ahc.cz",
      },
    ];
    for (let i = 0; i < team.length; i++) {
      await ctx.db.insert("branch_team", {
        branch_id: stribroId,
        ...team[i],
        order: i,
        created_at: now,
        updated_at: now,
      });
    }

    // ── REFERENCE ────────────────────────────────────────────────────────
    const testimonials = [
      {
        author_name: "Martina Wimmer",
        author_role: "rodinná příslušnice",
        content:
          "Naprosto příkladná péče, lidský a vlídný přístup celého týmu ke svým klientům i nám jejich rodinným příslušníkům. Vysoká kvalita služeb v krásných, nově vybudovaných prostorách. Tatínek se tam cítí opravdu jako doma a je spokojený. Velké poděkování všem zaměstnancům i managementu.",
        rating: 5,
      },
      {
        author_name: "p. Bečvář",
        author_role: "rodinný příslušník",
        content:
          "Milý a ochotný personál. Pestrá a chutná strava, čisté prostředí. Naprostá spokojenost.",
        rating: 5,
      },
      {
        author_name: "Eva K.",
        author_role: "dcera klienta",
        content:
          "Maminka je u Vás již druhý rok a my jsme moc spokojeni. Personál je profesionální, vstřícný a vždy si na ni udělá čas. Cítí se tam jako doma — a to je pro nás to nejdůležitější.",
        rating: 5,
      },
    ];
    for (const t of testimonials) {
      await ctx.db.insert("branch_testimonials", {
        branch_id: stribroId,
        ...t,
        created_at: now,
        updated_at: now,
      });
    }

    // ── FAQ ──────────────────────────────────────────────────────────────
    const faqs = [
      { q: "Jak postupovat při žádosti o přijetí?", a: "Stáhněte si žádost o přijetí, vyplňte ji společně s lékařským posudkem a doručte nám ji osobně nebo poštou." },
      { q: "Jaká je čekací doba?", a: "Čekací doba se odvíjí od typu péče a aktuální obsazenosti. Po splnění požadavků přijímáme klienty okamžitě, pokud je volná kapacita." },
      { q: "Můžu navštívit svého blízkého kdykoli?", a: "Návštěvy jsou možné každý den od 9:00 do 19:00. Mimo tyto hodiny po domluvě s personálem." },
      { q: "Jaké jsou ceny pobytu?", a: "Aktuální ceník vám rádi zašleme — kontaktujte nás na stribro@ahc.cz nebo telefonicky." },
      { q: "Jaké pokoje nabízíte?", a: "Nabízíme jednolůžkové, dvoulůžkové, třílůžkové a čtyřlůžkové pokoje. Sdílené koupelny jsou maximálně pro 4 klienty." },
      { q: "Mohou klienti přijmout vlastní vybavení?", a: "Ano, klient si může přivézt menší osobní věci a vybavení dle dohody (např. fotografie, oblíbené předměty)." },
      { q: "Je v centru parkování?", a: "Ano, máme vlastní velké parkoviště přímo u centra." },
      { q: "Poskytujete také rehabilitaci?", a: "Ano, máme moderně vybavené oddělení rehabilitace s kvalifikovanými fyzioterapeuty." },
    ];
    for (let i = 0; i < faqs.length; i++) {
      await ctx.db.insert("branch_faq", {
        branch_id: stribroId,
        question: faqs[i].q,
        answer: faqs[i].a,
        order: i,
        created_at: now,
        updated_at: now,
      });
    }

    // ── ADMISSION STEPS (8 kroků na /zadost-o-prijeti) ────────────────────
    const steps = [
      { n: 1, t: "První kontakt a schůzka", d: "V případě zájmu o poskytnutí sociální služby v SC si můžete telefonicky nebo e-mailem sjednat schůzku se sociálními pracovníky našeho senior centra." },
      { n: 2, t: "Informace a formuláře", d: "Sociální pracovníci Vám předají základní informace o poskytovaných službách včetně formuláře Žádosti o poskytování sociální služby." },
      { n: 3, t: "Doručení žádosti", d: "Žádost Vám můžeme podle domluvy doručit poštou nebo osobně." },
      { n: 4, t: "Posouzení žádosti", d: "Na základě doručené Žádosti o poskytování sociální služby dojde k předběžnému posouzení, zda nejsou naplněny zákonné důvody k odmítnutí poskytování služby." },
      { n: 5, t: "Lékařský posudek", d: "V případě splnění podmínek budete požádáni o dodání Posudku lékaře o zdravotním stavu žadatele." },
      { n: 6, t: "Evidence žadatelů", d: "Po finálním posouzení Vás v případě splnění podmínek k poskytování služby zařadíme do Evidence žadatelů o službu." },
      { n: 7, t: "Smlouva a zahájení péče", d: "Bude-li volná kapacita služby, dohodneme se s Vámi na konkrétním dnu zahájení poskytování služby a uzavřeme spolu Smlouvu o poskytování služby sociální péče." },
      { n: 8, t: "Příprava na nástup", d: "Při zahájení poskytování služby je vhodné vybavit se dle doporučení 'Co si vzít s sebou'." },
    ];
    for (const s of steps) {
      await ctx.db.insert("branch_admission_steps", {
        branch_id: stribroId,
        step_number: s.n,
        title: s.t,
        description: s.d,
        created_at: now,
        updated_at: now,
      });
    }

    // ── CAREER PERKS (Proč pracovat u nás?) ──────────────────────────────
    const perks = [
      { title: "Smysl", description: "Náplň práce našich zdravotních i sociálních pracovníků je ryzím posláním, má uznání spokojených a vděčných klientů i jejich blízkých.", icon: "HandHeart" },
      { title: "Benefity", description: "Podporujeme Váš kariérní růst, odborný i osobní rozvoj a nabízíme řadu zaměstnaneckých výhod (5 týdnů dovolené, služební vozidlo pro terénní péči).", icon: "Gift" },
      { title: "Jsme součástí rodiny", description: "Prostřednictvím našich služeb můžeme být součástí každé rodiny, která hledá zdravotní a sociální péči pro své blízké, a také nabízíme přívětivé, až rodinné prostředí.", icon: "Users" },
    ];
    for (let i = 0; i < perks.length; i++) {
      await ctx.db.insert("branch_career_perks", {
        branch_id: stribroId,
        ...perks[i],
        order: i,
        created_at: now,
        updated_at: now,
      });
    }

    // ── NOVINKY ──────────────────────────────────────────────────────────
    const news = [
      {
        title: "Otevřeli jsme nové oddělení rehabilitace",
        slug: "nove-oddeleni-rehabilitace",
        excerpt:
          "Po měsících příprav jsme slavnostně otevřeli moderně vybavené oddělení rehabilitace.",
        published_at: now - 7 * 24 * 60 * 60 * 1000,
      },
      {
        title: "Den otevřených dveří 15. května",
        slug: "den-otevrenych-dveri",
        excerpt:
          "Srdečně Vás zveme na Den otevřených dveří. Provedeme Vás celým centrem.",
        published_at: now - 14 * 24 * 60 * 60 * 1000,
      },
      {
        title: "Letní kavárna v zahradě",
        slug: "letni-kavarna",
        excerpt:
          "Užijte si s námi léto v naší zahradní kavárně. Otevřeno každý den od 14:00.",
        published_at: now - 21 * 24 * 60 * 60 * 1000,
      },
    ];
    for (const n of news) {
      await ctx.db.insert("branch_news", {
        branch_id: stribroId,
        title: n.title,
        slug: n.slug,
        excerpt: n.excerpt,
        content: n.excerpt + "\n\nDalší obsah článku...",
        cover_image:
          "https://images.unsplash.com/photo-1559757148-5c350d0d3c56?w=1200&q=80",
        published_at: n.published_at,
        is_published: true,
        created_at: now,
        updated_at: now,
      });
    }

    // ── HODINY ───────────────────────────────────────────────────────────
    await ctx.db.insert("branch_hours", {
      branch_id: stribroId,
      label: "Návštěvy",
      day_from: 0,
      day_to: 6,
      time_from: "09:00",
      time_to: "19:00",
      order: 0,
      created_at: now,
      updated_at: now,
    });
    await ctx.db.insert("branch_hours", {
      branch_id: stribroId,
      label: "Recepce",
      day_from: 0,
      day_to: 4,
      time_from: "07:00",
      time_to: "15:30",
      order: 1,
      created_at: now,
      updated_at: now,
    });

    // ── DOKUMENTY ────────────────────────────────────────────────────────
    const docs = [
      { title: "Žádost o poskytování sociální služby", file: "/dokumenty/zadost.pdf" },
      { title: "Posudek lékaře o zdravotním stavu", file: "/dokumenty/lekar.pdf" },
      { title: "Co si vzít s sebou", file: "/dokumenty/co-si-vzit.pdf" },
      { title: "Domácí řád", file: "/dokumenty/domaci-rad.pdf" },
      { title: "Ceník služeb 2026", file: "/dokumenty/cenik.pdf" },
      { title: "Rozhodnutí o poskytnutí dotace", file: "/dokumenty/rozhodnuti-dotace.pdf" },
      { title: "Publicita - stálá pamětní deska", file: "/dokumenty/publicita.pdf" },
    ];
    for (let i = 0; i < docs.length; i++) {
      await ctx.db.insert("branch_documents", {
        branch_id: stribroId,
        title: docs[i].title,
        file_url: docs[i].file,
        order: i,
        created_at: now,
        updated_at: now,
      });
    }

    // ── GRANTY / DOTACE (povinná publicita) ──────────────────────────────
    const grants = [
      {
        funder: "Evropská unie",
        funder_short: "EU",
        project_name: "Modernizace vybavení",
        amount: 9879115,
        program: "Operační program Technologie a aplikace pro konkurenceschopnost",
        year_until: 2030,
        description:
          "Projekt přispívá k modernizaci vybavení Senior centra Stříbro a zlepšení kvality poskytované sociální péče. Realizace v souladu s pravidly povinné publicity OP TAK.",
        docs: [
          { title: "Rozhodnutí o poskytnutí dotace", file_url: "/dokumenty/rozhodnuti-dotace.pdf", size_kb: 382 },
          { title: "Publicita – stálá pamětní deska", file_url: "/dokumenty/publicita.pdf", size_kb: 188 },
        ],
        order: 0,
      },
      {
        funder: "Plzeňský kraj",
        funder_short: "PK",
        project_name: "Poskytování sociálních služeb — odlehčovací služby",
        program: "Podpora sociálních služeb dle § 101a zákona o sociálních službách",
        description:
          "Žadatel AHC Senior centrum Stříbro s.r.o. Odbor sociálních věcí Plzeňského kraje podporuje provoz odlehčovací služby.",
        docs: [
          { title: "Vizuál povinné publicity (PDF)", file_url: "/dokumenty/publicita-pk.pdf", size_kb: 245 },
        ],
        order: 1,
      },
    ];
    for (const g of grants) {
      await ctx.db.insert("branch_grants", {
        branch_id: stribroId,
        ...g,
        created_at: now,
        updated_at: now,
      });
    }

    // ── KARIÉRA — pozice s plnohodnotnými popisy ─────────────────────
    const benefitsCommon =
      "5 týdnů dovolené\nPříspěvek na stravování\nVzdělávání a odborné kurzy hrazené zaměstnavatelem\nPřátelský kolektiv a rodinná atmosféra\nStabilita a perspektiva v dlouhodobém zaměstnání\nVýznamné společenské poslání";
    const positions = [
      {
        title: "Všeobecná sestra",
        slug: "vseobecna-sestra",
        type: "full_time" as const,
        salary_from: 38000,
        salary_to: 48000,
        desc: "Hledáme všeobecnou sestru do našeho týmu pro směnný provoz. Postaráte se o klienty v moderně vybaveném prostředí. Pracujete pod vedením vrchní sestry v 12hodinových směnách.",
        requirements:
          "Středoškolské nebo VOŠ/VŠ vzdělání v oboru všeobecná sestra\nRegistrace dle zákona č. 96/2004 Sb.\nEmpatický přístup ke klientům\nSchopnost práce v týmu\nZdravotní způsobilost",
        benefits: benefitsCommon,
      },
      {
        title: "Pečovatel / Pečovatelka",
        slug: "pecovatel",
        type: "full_time" as const,
        salary_from: 30000,
        salary_to: 35000,
        desc: "Hledáme pečovatele do našeho týmu. Pomáháte klientům s každodenními úkony, podporujete jejich důstojnost a samostatnost. Práce v rodinném prostředí v centru Stříbra.",
        requirements:
          "Kvalifikační kurz pro pracovníky v sociálních službách (nebo ochota si jej doplnit)\nTrpělivost a lidský přístup\nFyzická zdatnost\nDochvilnost a spolehlivost",
        benefits: benefitsCommon,
      },
      {
        title: "Fyzioterapeut / Fyzioterapeutka",
        slug: "fyzioterapeut",
        type: "part_time" as const,
        salary_from: 220,
        salary_to: 280,
        desc: "Hledáme zkušeného fyzioterapeuta na částečný úvazek. Pracujete s klienty v nově otevřeném oddělení rehabilitace, sestavujete individuální rehabilitační plány.",
        requirements:
          "VŠ vzdělání v oboru fyzioterapie\nPlatná registrace\nZkušenost s geriatrickou rehabilitací výhodou\nProfesionální a empatický přístup",
        benefits: benefitsCommon,
      },
      {
        title: "Sociální pracovník / pracovnice",
        slug: "socialni-pracovnik",
        type: "full_time" as const,
        salary_from: 34000,
        salary_to: 42000,
        desc: "Hledáme sociálního pracovníka, který bude prvním kontaktem pro zájemce o naše služby. Vedete přijímací řízení, komunikujete s rodinami, sestavujete individuální plány péče.",
        requirements:
          "VOŠ/VŠ vzdělání sociálního směru dle zákona 108/2006 Sb.\nKomunikační dovednosti\nOrganizační schopnosti\nZkušenost se sociální agendou výhodou",
        benefits: benefitsCommon,
      },
      {
        title: "Kuchař / Kuchařka",
        slug: "kuchar",
        type: "full_time" as const,
        salary_from: 30000,
        salary_to: 36000,
        desc: "Připravujte chutná a vyvážená jídla pro našich 92 klientů. Pracujete v moderně vybavené kuchyni v týmu zkušených kolegyň. Důraz na regionální suroviny a respekt k dietám.",
        requirements:
          "Vyučení v oboru kuchař\nPraxe v gastronomii (i v jiném segmentu)\nZdravotní průkaz\nFlexibilita a smysl pro detail",
        benefits: benefitsCommon,
      },
      {
        title: "Ředitel / Ředitelka centra",
        slug: "reditel",
        type: "full_time" as const,
        salary_from: 60000,
        salary_to: 80000,
        desc: "Hledáme ředitele/ředitelku pro vedení našeho senior centra. Odpovídáte za celkový chod, ekonomiku a kvalitu péče. Vedete tým 50+ zaměstnanců, jste partnerem pro krajský úřad i rodiny klientů.",
        requirements:
          "VŠ vzdělání (sociální / zdravotní / ekonomický směr)\nManažerská praxe v sociálních / zdravotních službách\nZkušenost s vedením většího týmu\nKomunikační a strategické schopnosti",
        benefits:
          benefitsCommon +
          "\nSlužební automobil\nVolná pracovní doba\nBonus dle plnění cílů",
      },
    ];
    for (const p of positions) {
      await ctx.db.insert("career_positions", {
        branch_id: stribroId,
        title: p.title,
        slug: p.slug,
        employment_type: p.type,
        description: p.desc,
        requirements: p.requirements,
        benefits: p.benefits,
        salary_from: p.salary_from,
        salary_to: p.salary_to,
        is_published: true,
        published_at: now,
        created_at: now,
        updated_at: now,
      });
    }

    // ── DALŠÍ POBOČKY ───────────────────────────────────────────────────
    // Demo pobočky (Praha/Brno/Přepychy) odstraněny — síť tvoří jen reálné
    // pobočky (Stříbro + Duchcov). Nové se zakládají z administrace.
    const otherBranches: {
      slug: string;
      short: string;
      city: string;
      zip: string;
      region: string;
      lat: number;
      lng: number;
    }[] = [];
    for (const b of otherBranches) {
      const exists = await ctx.db
        .query("branches")
        .withIndex("by_slug", (q) => q.eq("slug", b.slug))
        .unique();
      let bId = exists?._id;
      if (!exists) {
        bId = await ctx.db.insert("branches", {
          slug: b.slug,
          name: `AHC Senior centrum ${b.short}`,
          legal_name: `AHC Senior centrum ${b.short} s.r.o.`,
          short_name: b.short,
          description: `Senior centrum AHC v ${b.city}.`,
          street: "Hlavní 1",
          city: b.city,
          zip: b.zip,
          region: b.region,
          ico: "12345678",
          parent_org: "Ambeat Group",
          phone: "+420 800 123 456",
          email: `${b.slug}@ahc.cz`,
          lat: b.lat,
          lng: b.lng,
          is_published: true,
          created_at: now,
          updated_at: now,
        });
      }
      // Ukázkové kariérní pozice pro ostatní pobočky
      const samplePositions = [
        { title: "Všeobecná sestra", slug: "vseobecna-sestra", type: "full_time" as const },
        { title: "Pečovatel/ka", slug: "pecovatel", type: "full_time" as const },
        { title: "Sociální pracovník/ce", slug: "socialni-pracovnik", type: "part_time" as const },
      ];
      if (!bId) continue;
      // skip pokud už pozice existují (idempotence)
      const existingPos = await ctx.db
        .query("career_positions")
        .withIndex("by_branch", (q) => q.eq("branch_id", bId))
        .first();
      if (existingPos) continue;
      for (const p of samplePositions) {
        await ctx.db.insert("career_positions", {
          branch_id: bId,
          title: p.title,
          slug: p.slug,
          employment_type: p.type,
          description: `Hledáme posilu pro tým v ${b.city}.`,
          is_published: true,
          published_at: now,
          created_at: now,
          updated_at: now,
        });
      }
    }

    return { stribroId, message: "Seed completed" };
  },
});

/**
 * Seed pro Městskou nemocnici Duchcov — speciální pobočka typu „hospital".
 * Spustit: `bunx convex run seed:runDuchcovSeed`
 */
export const runDuchcovSeed = mutation({
  args: {},
  handler: async (ctx) => {
    const now = Date.now();

    const existing = await ctx.db
      .query("branches")
      .withIndex("by_slug", (q) => q.eq("slug", "duchcov"))
      .unique();

    if (existing) {
      const tables = [
        "branch_units",
        "branch_services",
        "branch_facilities",
        "branch_team",
        "branch_testimonials",
        "branch_faq",
        "branch_news",
        "branch_alerts",
        "branch_gallery",
        "branch_documents",
        "branch_hours",
        "branch_about_features",
        "branch_highlights",
        "branch_admission_steps",
        "branch_career_perks",
        "branch_grants",
        "career_positions",
      ] as const;
      for (const t of tables) {
        const rows = await ctx.db
          .query(t)
          .withIndex("by_branch", (q) => q.eq("branch_id", existing._id))
          .collect();
        for (const r of rows) await ctx.db.delete(r._id);
      }
      await ctx.db.delete(existing._id);
    }

    const duchcovId = await ctx.db.insert("branches", {
      slug: "duchcov",
      name: "Městská nemocnice Duchcov",
      legal_name: "Městská nemocnice Duchcov",
      short_name: "Duchcov",
      branch_type: "hospital" as const,
      type_label: "Městská nemocnice",
      tagline: "Jsme malá nemocnice\ns velkým cílem",
      subtitle:
        "Moderní městská nemocnice s lůžkovými odděleními, širokou sítí odborných ambulancí a vlastní lékárnou. Profesionální péče blízko domova.",
      description:
        "Městská nemocnice Duchcov poskytuje akutní i následnou lůžkovou péči, jednodenní chirurgii a širokou síť odborných ambulancí. Staráme se o pacienty z celého regionu více než 100 let.",
      street: "Nemocniční 264",
      city: "Duchcov",
      zip: "419 01",
      region: "Ústecký kraj",
      ico: "22317821",
      parent_org: "Ambeat Group",
      phone: "+420 417 514 711",
      phone_short: "417 514 711",
      email: "info@nedu.cz",
      facebook_url: "https://facebook.com/nemocniceduchcov",
      office_contact_name: "Recepce nemocnice",
      office_contact_phone: "+420 417 514 711",
      office_contact_email: "info@nedu.cz",
      lat: 50.6044,
      lng: 13.7456,
      distance_city_1_label: "Teplice",
      distance_city_1_km: 12,
      distance_city_2_label: "Most",
      distance_city_2_km: 16,
      distance_city_3_label: "Ústí nad Labem",
      distance_city_3_km: 30,
      bed_count: 120,
      opening_year: 1920,
      cover_image: "/images/duchcov-main.jpg",
      is_published: true,
      created_at: now,
      updated_at: now,
    });

    // ── ODDĚLENÍ ──────────────────────────────────────────────────────
    const oddeleni = [
      { name: "Jednodenní lůžková péče", icon: "BedDouble", desc: "Plánované zákroky s krátkou hospitalizací — operace a návrat domů týž den." },
      { name: "Ošetřovatelská následná péče", icon: "HeartPulse", desc: "Dlouhodobá ošetřovatelská péče o pacienty po akutní hospitalizaci." },
      { name: "Chirurgická následná péče", icon: "Scissors", desc: "Doléčení a rekonvalescence pacientů po chirurgických výkonech." },
      { name: "Interní následná péče", icon: "Stethoscope", desc: "Péče o pacienty s interními a chronickými onemocněními." },
      { name: "RDG — Radiodiagnostické oddělení", icon: "ScanLine", desc: "Rentgenová a sonografická diagnostika pro lůžkové i ambulantní pacienty." },
      { name: "Domácí zdravotní péče", icon: "Home", desc: "Odborná zdravotní péče poskytovaná v domácím prostředí pacienta." },
      { name: "Anesteziologie", icon: "Activity", desc: "Anesteziologická péče při operačních a diagnostických výkonech." },
    ];
    for (let i = 0; i < oddeleni.length; i++) {
      await ctx.db.insert("branch_units", {
        branch_id: duchcovId,
        category: "oddeleni" as const,
        name: oddeleni[i].name,
        description: oddeleni[i].desc,
        icon: oddeleni[i].icon,
        slug: slugifyCz(oddeleni[i].name),
        order: i,
        created_at: now,
        updated_at: now,
      });
    }

    // ── AMBULANCE ─────────────────────────────────────────────────────
    const ambulance = [
      { name: "Chirurgická ambulance", icon: "Scissors" },
      { name: "Interní ambulance", icon: "Stethoscope" },
      { name: "Kardiologická ambulance", icon: "HeartPulse" },
      { name: "Gynekologická ambulance", icon: "Venus" },
      { name: "Ortopedická ambulance", icon: "Bone" },
      { name: "Oční ambulance", icon: "Eye" },
      { name: "Urologická ambulance", icon: "Droplet" },
      { name: "Diabetologická ambulance", icon: "Syringe" },
      { name: "Gastroenterologická ambulance", icon: "Pill" },
      { name: "Dětská neurologická ambulance", icon: "Brain" },
      { name: "Fyzioterapie", icon: "Activity" },
    ];
    for (let i = 0; i < ambulance.length; i++) {
      await ctx.db.insert("branch_units", {
        branch_id: duchcovId,
        category: "ambulance" as const,
        name: ambulance[i].name,
        icon: ambulance[i].icon,
        slug: slugifyCz(ambulance[i].name),
        order: i,
        created_at: now,
        updated_at: now,
      });
    }

    // ── ALERTS / DŮLEŽITÉ INFORMACE ───────────────────────────────────
    const alerts = [
      {
        title: "Gastroenterologická ambulance v provozu",
        body: "Otevřeli jsme novou gastroenterologickou ambulanci. Objednání a více informací naleznete na stránce ambulance.",
        link_url: "/ambulance/gastroenterologicka-ambulance",
        link_label: "Více zde",
        severity: "important" as const,
      },
      {
        title: "Od 17. 7. 2025 nový urolog MUDr. Mohamed Nussir",
        body: "V naší nemocnici nově ordinuje zkušený urolog MUDr. Mohamed Nussir. Těšíme se na vás.",
        link_url: "/ambulance/urologicka-ambulance",
        link_label: "Detail ambulance",
        severity: "warning" as const,
      },
      {
        title: "Rozšíření ordinačních hodin chirurgické ambulance",
        body: "Od září jsme rozšířili ordinační hodiny chirurgické ambulance — nově i v úterý odpoledne.",
        link_url: "/ambulance/chirurgicka-ambulance",
        link_label: "Ordinační hodiny",
        severity: "info" as const,
      },
    ];
    for (let i = 0; i < alerts.length; i++) {
      await ctx.db.insert("branch_alerts", {
        branch_id: duchcovId,
        ...alerts[i],
        is_active: true,
        order: i,
        created_at: now,
        updated_at: now,
      });
    }

    // ── KOMPLEMENTY ───────────────────────────────────────────────────
    const komplementy = [
      { name: "Lékárna", icon: "Pill" },
      { name: "Zdravotní doprava", icon: "Ambulance" },
    ];
    for (let i = 0; i < komplementy.length; i++) {
      await ctx.db.insert("branch_units", {
        branch_id: duchcovId,
        category: "komplement" as const,
        name: komplementy[i].name,
        icon: komplementy[i].icon,
        slug: slugifyCz(komplementy[i].name),
        order: i,
        created_at: now,
        updated_at: now,
      });
    }

    // ── SPOKOJENÍ PACIENTI (z aktuálního webu) ────────────────────────
    const testimonials = [
      {
        author_name: "Vladimír Šebesta",
        author_role: "pacient",
        content:
          "V této nemocnici jsem na operaci kolene již podruhé, profesionální perfektní přístup jak lékařů, tak i velmi citlivý přístup sestřiček. Poděkování Dr. Bartošovi, ortoped profesionální a vždy pomohl. Díky všem a 5 hvězdiček jsou zcela na místě.",
        rating: 5,
      },
      {
        author_name: "Ing. Jana Drahošová",
        author_role: "pacientka",
        content:
          "Chtěla bych touto cestou poděkovat celému týmu jednodenní chirurgie Duchcov za skvělý servis a péči. Největší poděkování je panu primáři MUDr. Machačovi, který je nejen perfektní operatér, ale pod jeho vedením celý tým chirurgie funguje skvěle a sestry jsou velmi milé. Vřele doporučuji.",
        rating: 5,
      },
      {
        author_name: "pí. Suchoparová",
        author_role: "maminka pacientky",
        content:
          "Perfektní přístup lékařů a sester, pochopení, empatie, laskavost při léčbě dcery. Zasloužili by hvězdiček mnohem více, nejméně sto.",
        rating: 5,
      },
    ];
    for (const t of testimonials) {
      await ctx.db.insert("branch_testimonials", {
        branch_id: duchcovId,
        ...t,
        created_at: now,
        updated_at: now,
      });
    }

    // ── HIGHLIGHTS ────────────────────────────────────────────────────
    const highlights = [
      { title: "Více než 100 let péče", description: "Staráme se o pacienty z Duchcova a okolí už přes sto let — tradice, na kterou navazujeme moderní medicínou.", icon: "Award" },
      { title: "Komplexní péče na jednom místě", description: "Lůžková oddělení, jednodenní chirurgie, 10 odborných ambulancí, RDG i vlastní lékárna.", icon: "HeartPulse" },
      { title: "Blízko domova", description: "Nemusíte dojíždět do velkých měst — kvalitní péči najdete přímo v Duchcově s výbornou dostupností.", icon: "MapPin" },
    ];
    for (let i = 0; i < highlights.length; i++) {
      await ctx.db.insert("branch_highlights", {
        branch_id: duchcovId,
        ...highlights[i],
        order: i,
        created_at: now,
        updated_at: now,
      });
    }

    // ── NOVINKY ───────────────────────────────────────────────────────
    await ctx.db.insert("branch_news", {
      branch_id: duchcovId,
      title: "Rozšířili jsme ordinační hodiny ortopedie",
      slug: "ortopedie-ordinacni-hodiny",
      excerpt: "Ortopedická ambulance nově ordinuje i v odpoledních hodinách.",
      content: "Ortopedická ambulance nově ordinuje i v odpoledních hodinách.",
      cover_image: "/images/news-aktuality.png",
      published_at: now - 5 * 24 * 60 * 60 * 1000,
      is_published: true,
      created_at: now,
      updated_at: now,
    });

    // ── KARIÉRA ───────────────────────────────────────────────────────
    const positions = [
      { title: "Všeobecná sestra — lůžkové oddělení", slug: "vseobecna-sestra-luzkove", type: "full_time" as const },
      { title: "Lékař — interní ambulance", slug: "lekar-interni", type: "full_time" as const },
      { title: "Sanitář / Sanitářka", slug: "sanitar", type: "full_time" as const },
    ];
    for (const p of positions) {
      await ctx.db.insert("career_positions", {
        branch_id: duchcovId,
        title: p.title,
        slug: p.slug,
        employment_type: p.type,
        description: `Hledáme posilu do týmu Městské nemocnice Duchcov na pozici ${p.title}.`,
        is_published: true,
        published_at: now,
        created_at: now,
        updated_at: now,
      });
    }

    return { duchcovId, message: "Duchcov seed completed" };
  },
});

/**
 * Přiřadí roli uživateli, kterého najde přes email. Spouštějte z dashboardu po
 * první registraci.
 *
 *  bunx convex run seed:assignRole '{ "email": "admin@ahc.cz", "role": "super_admin" }'
 *
 * Pro branch_manager je potřeba `branchSlug`.
 */
export const assignRole = mutation({
  args: {
    email: v.string(),
    role: v.union(v.literal("super_admin"), v.literal("branch_manager")),
    branchSlug: v.optional(v.string()),
    name: v.optional(v.string()),
  },
  handler: async (ctx, { email, role, branchSlug, name }) => {
    const users = await ctx.db.query("users").collect();
    const user = users.find((u) => u.email?.toLowerCase() === email.toLowerCase());
    if (!user) throw new Error(`Uživatel s e-mailem ${email} nenalezen. Nejdřív se zaregistruj na /admin/login.`);

    let branchId: import("./_generated/dataModel").Id<"branches"> | undefined;
    if (branchSlug) {
      const b = await ctx.db
        .query("branches")
        .withIndex("by_slug", (q) => q.eq("slug", branchSlug))
        .unique();
      if (!b) throw new Error(`Pobočka se slugem ${branchSlug} nenalezena.`);
      branchId = b._id;
    }

    const existing = await ctx.db
      .query("user_profiles")
      .withIndex("by_user", (q) => q.eq("user_id", user._id))
      .unique();

    const now = Date.now();
    if (existing) {
      await ctx.db.patch(existing._id, {
        role,
        branch_id: branchId,
        name: name ?? existing.name,
        updated_at: now,
      });
    } else {
      await ctx.db.insert("user_profiles", {
        user_id: user._id,
        role,
        branch_id: branchId,
        name,
        created_at: now,
        updated_at: now,
      });
    }
    return { userId: user._id, role, branchId };
  },
});

/**
 * Bezpečně updatuje jednotlivé pole pobočky bez mazání souvisejících tabulek.
 * Použití: bunx convex run seed:patchBranch '{ "slug": "stribro", "tagline": "Péče\n*s respektem*\nke stáří" }'
 */
export const patchBranch = mutation({
  args: {
    slug: v.string(),
    template: v.optional(v.string()),
    name: v.optional(v.string()),
    short_name: v.optional(v.string()),
    type_label: v.optional(v.string()),
    tagline: v.optional(v.string()),
    subtitle: v.optional(v.string()),
    cover_image: v.optional(v.string()),
  },
  handler: async (ctx, { slug, ...patch }) => {
    const b = await ctx.db
      .query("branches")
      .withIndex("by_slug", (q) => q.eq("slug", slug))
      .unique();
    if (!b) throw new Error(`Pobočka ${slug} nenalezena`);
    const clean = Object.fromEntries(
      Object.entries(patch).filter(([, v]) => v !== undefined)
    );
    await ctx.db.patch(b._id, { ...clean, updated_at: Date.now() });
    return { ok: true, id: b._id, patched: Object.keys(clean) };
  },
});

/**
 * Smaže všechny pobočky kromě zadaných slugů (default stribro + duchcov)
 * včetně všech navázaných dat. Odstranění demo poboček (Praha/Brno/Přepychy).
 *  bunx convex run seed:cleanupBranches '{ "keep": ["stribro","duchcov"] }' --prod
 */
export const cleanupBranches = mutation({
  args: { keep: v.optional(v.array(v.string())) },
  handler: async (ctx, { keep }) => {
    const keepSet = new Set(keep ?? ["stribro", "duchcov"]);
    const perBranchTables = [
      "branch_units",
      "branch_services",
      "branch_facilities",
      "branch_team",
      "branch_testimonials",
      "branch_faq",
      "branch_news",
      "branch_alerts",
      "branch_pages",
      "branch_gallery",
      "branch_documents",
      "branch_hours",
      "branch_about_features",
      "branch_highlights",
      "branch_admission_steps",
      "branch_career_perks",
      "branch_grants",
      "career_positions",
      "inquiries",
    ] as const;

    const all = await ctx.db.query("branches").collect();
    const removed: string[] = [];
    for (const b of all) {
      if (keepSet.has(b.slug)) continue;
      for (const t of perBranchTables) {
        const rows = await ctx.db
          .query(t)
          .withIndex("by_branch", (q) => q.eq("branch_id", b._id))
          .collect();
        for (const r of rows) await ctx.db.delete(r._id);
      }
      await ctx.db.delete(b._id);
      removed.push(b.slug);
    }
    return { removed, kept: Array.from(keepSet) };
  },
});

// ════════════════════════════════════════════════════════════════════════
//  IMPORT REÁLNÝCH POBOČEK (scrapnuté z *.ahc.cz, šablona Stříbro)
// ════════════════════════════════════════════════════════════════════════

type ImportedBranch = {
  branch: {
    slug: string;
    name: string;
    legal_name?: string;
    short_name: string;
    branch_type: "senior_centrum" | "hospital";
    type_label: string;
    tagline?: string;
    subtitle?: string;
    description: string;
    street: string;
    city: string;
    zip: string;
    region: string;
    ico?: string;
    parent_org?: string;
    phone: string;
    phone_short?: string;
    email: string;
    facebook_url?: string;
    office_contact_name?: string;
    office_contact_phone?: string;
    office_contact_email?: string;
    sesterna_phone?: string;
    lat: number;
    lng: number;
    distance_city_1_label?: string;
    distance_city_1_km?: number;
    distance_city_2_label?: string;
    distance_city_2_km?: number;
    bed_count?: number;
    room_count?: number;
    opening_year?: number;
    cover_image?: string;
    is_published: boolean;
  };
  services?: { title: string; description?: string; icon: string }[];
  facilities?: { title: string; image_url: string }[];
  highlights?: { title: string; description: string; icon?: string }[];
  grants?: {
    funder: string;
    funder_short: string;
    project_name?: string;
    description?: string;
  }[];
  units?: {
    category: "oddeleni" | "ambulance" | "komplement";
    name: string;
    description?: string;
    icon?: string;
  }[];
  testimonials?: {
    author_name: string;
    author_role?: string;
    content: string;
    rating?: number;
  }[];
};

// Standardní sociální služby domova pro seniory / se zvláštním režimem (dle zák. 108/2006).
const SENIOR_SERVICES = [
  { title: "Základní sociální poradenství", description: "Informace směřující k řešení nepříznivé sociální situace.", icon: "MessageCircle" },
  { title: "Ubytování", description: "Pokoje s vlastním zázemím, včetně úklidu, praní a údržby prádla.", icon: "BedDouble" },
  { title: "Stravování", description: "Celodenní stravování z vlastní kuchyně s ohledem na dietní potřeby.", icon: "UtensilsCrossed" },
  { title: "Pomoc při péči o vlastní osobu", description: "Asistence při oblékání, pohybu, orientaci a přesunech.", icon: "HandHelping" },
  { title: "Pomoc při osobní hygieně", description: "Pomoc při úkonech osobní hygieny a péči o vzhled.", icon: "ShowerHead" },
  { title: "Aktivizační činnosti", description: "Volnočasové aktivity, cvičení, dílny a kulturní akce.", icon: "Activity" },
  { title: "Sociálně terapeutické činnosti", description: "Rozvoj a udržení osobních a sociálních schopností.", icon: "HeartHandshake" },
  { title: "Kontakt se společenským prostředím", description: "Podpora kontaktů s rodinou a okolím.", icon: "Users" },
  { title: "Ošetřovatelská a zdravotní péče", description: "Péče sester a pravidelné návštěvy lékaře i specialistů.", icon: "Stethoscope" },
];

const IMPORTED_BRANCHES: ImportedBranch[] = [
  {
    branch: {
      slug: "pecicky",
      name: "AHC Domov se zvláštním režimem Pečičky",
      legal_name: "AHC Senior centrum Pečičky o.p.s.",
      short_name: "Pečičky",
      branch_type: "senior_centrum",
      type_label: "Domov se zvláštním režimem",
      tagline: "Domov\n*rodinného typu*",
      subtitle:
        "Zařízení rodinného typu poskytující službu domov se zvláštním režimem v klidném prostředí lesů, zahrad, polí a rybníka nedaleko obce Milín, cca 8 km od Příbrami.",
      description:
        "Domov se zvláštním režimem rodinného typu v klidné přírodě nedaleko Příbrami.",
      street: "Pečice – Pečičky 25",
      city: "Pečičky",
      zip: "262 31",
      region: "Středočeský kraj",
      ico: "22723757",
      parent_org: "Ambeat Group",
      phone: "+420 702 080 974",
      phone_short: "702 080 974",
      email: "pecicky@ahc.cz",
      lat: 49.638,
      lng: 14.049,
      distance_city_1_label: "Příbram",
      distance_city_1_km: 8,
      cover_image: "/images/pecicky/slide1.jpeg",
      is_published: true,
    },
    services: [
      { title: "Základní sociální poradenství", description: "Informace směřující k řešení nepříznivé sociální situace a k právům, povinnostem a dostupným formám pomoci.", icon: "MessageCircle" },
      { title: "Ubytování", description: "Jedno- až pětilůžkové pokoje s vlastní koupelnou, včetně úklidu, praní a údržby prádla.", icon: "BedDouble" },
      { title: "Stravování", description: "Celodenní stravování v rozsahu minimálně tří hlavních jídel z vlastní kuchyně s ohledem na dietní potřeby.", icon: "UtensilsCrossed" },
      { title: "Pomoc při péči o vlastní osobu", description: "Asistence při oblékání, pohybu, orientaci a přesunech.", icon: "HandHelping" },
      { title: "Pomoc při osobní hygieně", description: "Pomoc při úkonech osobní hygieny, při použití WC a při základní péči o vlasy a nehty.", icon: "ShowerHead" },
      { title: "Kontakt se společenským prostředím", description: "Podpora při obnovení kontaktů s rodinou a využívání běžných služeb.", icon: "Users" },
      { title: "Sociální terapeutické činnosti", description: "Rozvoj nebo udržení osobních a sociálních schopností podporujících sociální začleňování.", icon: "HeartHandshake" },
      { title: "Aktivizační činnosti", description: "Volnočasové aktivity – hudba, cvičení, rukodělné dílny, výlety a kulturní akce.", icon: "Activity" },
      { title: "Uplatňování práv a osobní záležitosti", description: "Asistence s komunikací s institucemi a hospodařením s financemi.", icon: "Scale" },
      { title: "Ošetřovatelská a zdravotní péče", description: "Péče sester a pravidelné návštěvy praktického lékaře i specialistů.", icon: "Stethoscope" },
    ],
    facilities: [
      { title: "Aktivizační činnosti", image_url: "/images/pecicky/slide1.jpeg" },
      { title: "Život v domově", image_url: "/images/pecicky/slide2.jpeg" },
      { title: "Okolí domova", image_url: "/images/pecicky/slide3.jpeg" },
    ],
    highlights: [
      { title: "Rodinné prostředí", description: "Komorní zařízení rodinného typu, kde se každému dostane osobní péče.", icon: "Heart" },
      { title: "V srdci přírody", description: "Klid lesů, zahrad, polí a rybníka nedaleko Milína a Příbrami.", icon: "Trees" },
      { title: "Nepřetržitá péče", description: "Ošetřovatelská a zdravotní péče i pravidelné návštěvy lékaře, 24 hodin denně.", icon: "Stethoscope" },
    ],
    grants: [
      { funder: "Středočeský kraj", funder_short: "SK", project_name: "Poskytování sociálních služeb", description: "Sociální služby jsou dotovány Středočeským krajem." },
    ],
  },

  // ── Příbram ──────────────────────────────────────────────────────
  {
    branch: {
      slug: "pribram", name: "AHC Domov se zvláštním režimem Příbram", legal_name: "AHC Senior centrum Příbram s.r.o.", short_name: "Příbram",
      branch_type: "senior_centrum", type_label: "Domov se zvláštním režimem",
      tagline: "Bezpečný domov\n*pro seniory*",
      subtitle: "Domov se zvláštním režimem pro osoby, které vlivem Alzheimerovy nemoci či jiného onemocnění se syndromy demence nezvládají pobyt ve vlastním sociálním prostředí.",
      description: "Domov se zvláštním režimem se specializací na péči o seniory s demencí.",
      street: "Rožmitálská 168", city: "Příbram", zip: "261 01", region: "Středočeský kraj", ico: "24297933", parent_org: "Ambeat Group",
      phone: "+420 777 111 198", phone_short: "777 111 198", email: "pribram@ahc.cz",
      lat: 49.6900, lng: 14.0100, cover_image: "/images/_shared/care-hands.jpg", is_published: true,
    },
    services: SENIOR_SERVICES,
    highlights: [
      { title: "Specializace na demenci", description: "Péče o osoby s Alzheimerovou nemocí a syndromy demence.", icon: "Brain" },
      { title: "Bezpečné prostředí", description: "Zázemí přizpůsobené potřebám klientů se zvláštním režimem.", icon: "ShieldCheck" },
      { title: "Nepřetržitá péče", description: "Profesionální ošetřovatelský tým 24 hodin denně.", icon: "Stethoscope" },
    ],
    grants: [{ funder: "Evropská unie", funder_short: "EU", project_name: "Podpora sociálních služeb", description: "Spolufinancováno z prostředků Evropské unie." }],
  },

  // ── Kolín ────────────────────────────────────────────────────────
  {
    branch: {
      slug: "kolin", name: "AHC Senior centrum Kolín", legal_name: "AHC Senior centrum Kolín s.r.o.", short_name: "Kolín",
      branch_type: "senior_centrum", type_label: "Senior centrum",
      tagline: "Pro Vás\n*a Vaše nejbližší*",
      subtitle: "Děláme vše proto, abychom Vašim blízkým přechod do nového domova co nejvíce ulehčili a poskytli jim příjemné a bezpečné místo pro život.",
      description: "Pobytová sociální služba pro seniory v Kolíně.",
      street: "Antonína Dvořáka 1101", city: "Kolín", zip: "280 02", region: "Středočeský kraj", ico: "02737949", parent_org: "Ambeat Group",
      phone: "+420 778 000 771", phone_short: "778 000 771", email: "kolin@ahc.cz",
      lat: 50.0274, lng: 15.2000, cover_image: "/images/_shared/care-hands.jpg", is_published: true,
    },
    services: SENIOR_SERVICES,
    highlights: [
      { title: "Příjemný a bezpečný domov", description: "Klidné prostředí pro důstojné a spokojené stáří.", icon: "Heart" },
      { title: "Citlivý přechod", description: "Pomáháme klientům i rodinám se zvládnutím nového začátku.", icon: "HandHelping" },
      { title: "Profesionální tým", description: "Zkušený personál s lidským přístupem.", icon: "Users" },
    ],
    grants: [
      { funder: "Město Kolín", funder_short: "Kolín", project_name: "Programová dotace na sociální služby", description: "Sociální služby podpořeny programovou dotací města Kolína." },
      { funder: "Evropská unie", funder_short: "EU", description: "Spolufinancováno z prostředků Evropské unie." },
    ],
  },

  // ── Nové Strašecí ────────────────────────────────────────────────
  {
    branch: {
      slug: "novestraseci", name: "AHC Senior centrum Nové Strašecí", short_name: "Nové Strašecí",
      branch_type: "senior_centrum", type_label: "Senior centrum",
      tagline: "Propojení\n*zdravotní a sociální*\npéče",
      subtitle: "Náš Domov vznikl v roce 2013 a poskytuje unikátní propojení zdravotních a sociálních služeb. Od listopadu 2024 je součástí skupiny AHC.",
      description: "Domov se zvláštním režimem propojující zdravotní a sociální péči.",
      street: "Dukelská 1142", city: "Nové Strašecí", zip: "271 01", region: "Středočeský kraj", ico: "22317791", parent_org: "Ambeat Group",
      phone: "+420 734 750 821", phone_short: "734 750 821", email: "novestraseci@ahc.cz",
      lat: 50.1500, lng: 13.8900, opening_year: 2013, cover_image: "/images/novestraseci/hero.jpg", is_published: true,
    },
    services: SENIOR_SERVICES,
    highlights: [
      { title: "Zdravotní i sociální péče", description: "Unikátní propojení obou typů péče pod jednou střechou.", icon: "HeartHandshake" },
      { title: "Specializace na demenci", description: "Odborná péče o klienty se syndromy demence.", icon: "Brain" },
      { title: "Součást sítě AHC", description: "Od roku 2024 součástí skupiny AHC.", icon: "Building2" },
    ],
  },

  // ── Sedlec-Prčice ────────────────────────────────────────────────
  {
    branch: {
      slug: "sedlec-prcice", name: "AHC Centrum následné péče Sedlec-Prčice", legal_name: "AHC Centrum následné péče Sedlec-Prčice a.s.", short_name: "Sedlec-Prčice",
      branch_type: "senior_centrum", type_label: "Centrum následné péče",
      tagline: "Cesta zpět\n*k soběstačnosti*",
      subtitle: "AHC Centrum následné péče Sedlec-Prčice poskytuje pod jednou střechou následnou lůžkovou péči a domov pro seniory. Spojujeme zkušenosti zdravotnického personálu, individuální přístup a moderní rehabilitační postupy s lidskostí, respektem a pochopením pro potřeby každého pacienta.",
      description: "Následná lůžková péče a domov pro seniory pod jednou střechou.",
      street: "Vítkovo náměstí 3", city: "Sedlec-Prčice", zip: "257 91", region: "Středočeský kraj", ico: "25579282", parent_org: "Ambeat Group",
      phone: "+420 317 834 311", phone_short: "317 834 311", email: "veronika.pistekova@ahc.cz",
      office_contact_name: "Veronika Pištěková — sociální pracovnice (následná péče)",
      office_contact_phone: "+420 702 078 993", office_contact_email: "veronika.pistekova@ahc.cz",
      bed_count: 54,
      lat: 49.6000, lng: 14.5300, cover_image: "/images/_shared/care-hands.jpg", is_published: true,
    },
    services: [
      { title: "Následná lůžková péče", description: "Doléčení, ošetřovatelská a rehabilitační péče pro pacienty po operaci, úrazu nebo zhoršení chronické nemoci.", icon: "Stethoscope" },
      { title: "Domov pro seniory", description: "Pobytová služba pro seniory od 65 let, kteří potřebují pravidelnou a nepřetržitou pomoc.", icon: "Home" },
      { title: "Zdravotní a ošetřovatelská péče", description: "Podávání léků, převazy, injekce, odběry, měření glykémie a péče o rány — nepřetržitě.", icon: "HeartPulse" },
      { title: "Rehabilitace a soběstačnost", description: "Fyzioterapie, ergoterapie, individuální cvičení a práce s kompenzačními pomůckami.", icon: "Activity" },
      { title: "Sociální podpora", description: "Sociální pracovnice pomáhají s nástupem, příspěvkem na péči i kontaktem s úřady.", icon: "HandHelping" },
      { title: "Aktivizační program", description: "Kondiční cvičení, trénování paměti, tvoření, pečení, canisterapie, bohoslužby ve vlastní kapli.", icon: "Sparkles" },
      { title: "Stravování", description: "Celodenní strava včetně dietní (diabetická, žaludeční, žlučníková) dle doporučení lékaře.", icon: "UtensilsCrossed" },
      { title: "Doplňkové služby", description: "Doprava na vyšetření, kadeřník, pedikúra, zapůjčení pomůcek i knih, nákupní služba k lůžku.", icon: "Plus" },
    ],
    highlights: [
      { title: "Odborná následná péče", description: "Komplexní zdravotní, ošetřovatelská a rehabilitační péče po operacích, úrazech i závažných onemocněních.", icon: "Stethoscope" },
      { title: "Individuální rehabilitační plán", description: "Ke každému pacientovi přistupujeme individuálně — péči nastavujeme podle jeho potřeb a cílů.", icon: "Activity" },
      { title: "Péče s lidským přístupem", description: "Důležitou roli hraje psychická pohoda, pocit bezpečí a důvěra mezi pacientem a personálem.", icon: "Heart" },
    ],
    testimonials: [
      { author_name: "Jiří", author_role: "pacient", content: "Po výměně kyčelního kloubu jsem měl obavy, zda budu ještě chodit jako dříve. Díky rehabilitaci a podpoře personálu jsem postupně získal zpět sílu i sebevědomí. Dnes se opět věnuji běžným aktivitám a mohu být samostatný.", rating: 5 },
      { author_name: "Alena K.", author_role: "dcera pacientky", content: "Maminka se po hospitalizaci dostala do situace, kdy potřebovala odbornou následnou péči. Byli jsme překvapeni, jaký pokrok udělala během několika týdnů. Děkujeme za odbornost i lidský přístup celého týmu.", rating: 5 },
      { author_name: "Petra", author_role: "fyzioterapeutka", content: "Na rehabilitaci je krásné sledovat, jak se pacientům postupně vrací síla, samostatnost a chuť do života. Někdy jde o malé pokroky, ale právě ty bývají nejdůležitější.", rating: 5 },
    ],
    grants: [{ funder: "Evropská unie", funder_short: "EU", project_name: "CZ.03.2.63/0.0/0.0/19_098/0015332", description: "Projekt Trvalý rozvoj kvality v pobytových zařízeních sociálních služeb skupiny AHC, spolufinancováno EU (dotace 4 433 451,25 Kč)." }],
  },

  // ── Nová Role ────────────────────────────────────────────────────
  {
    branch: {
      slug: "novarole", name: "AHC Senior centrum Nová Role", short_name: "Nová Role",
      branch_type: "senior_centrum", type_label: "Senior centrum",
      tagline: "Kde péče o seniory\n*má tradici a srdce*",
      subtitle: "Našim klientům poskytujeme nepřetržitou profesionální péči v prostředí, ve kterém se mohou cítit jako doma.",
      description: "Senior centrum s nepřetržitou profesionální péčí v domáckém prostředí.",
      street: "Školní 231/9", city: "Nová Role", zip: "362 25", region: "Karlovarský kraj", ico: "09907891", parent_org: "Ambeat Group",
      phone: "+420 702 294 906", phone_short: "702 294 906", email: "novarole@ahc.cz",
      lat: 50.2600, lng: 12.7800, cover_image: "/images/novarole/hero.jpg", is_published: true,
    },
    services: SENIOR_SERVICES,
    highlights: [
      { title: "Jako doma", description: "Prostředí, ve kterém se klienti cítí jako doma.", icon: "Home" },
      { title: "Nepřetržitá péče", description: "Profesionální péče 24 hodin denně.", icon: "Stethoscope" },
      { title: "Tradice a srdce", description: "Péče o seniory s lidským přístupem a zkušeností.", icon: "Heart" },
    ],
    grants: [{ funder: "Karlovarský kraj", funder_short: "KK", description: "Sociální služby finančně podporuje Karlovarský kraj." }],
  },

  // ── Meziboří ─────────────────────────────────────────────────────
  {
    branch: {
      slug: "mezibori", name: "AHC Senior centrum Meziboří", legal_name: "AHC Senior centrum Meziboří s.r.o.", short_name: "Meziboří",
      branch_type: "senior_centrum", type_label: "Senior centrum",
      tagline: "Domov\n*plný péče*",
      subtitle: "Senior centrum poskytující pobytovou sociální péči seniorům v klidném prostředí.",
      description: "Senior centrum s pobytovou sociální službou pro seniory.",
      street: "Dělnická 109", city: "Meziboří", zip: "435 13", region: "Ústecký kraj", ico: "47310189", parent_org: "Ambeat Group",
      phone: "+420 775 182 385", phone_short: "775 182 385", email: "anna.hlavnickova@ahc.cz",
      lat: 50.6500, lng: 13.5900, cover_image: "/images/_shared/care-hands.jpg", is_published: true,
    },
    services: SENIOR_SERVICES,
    highlights: [
      { title: "Pobytová péče", description: "Dlouhodobé ubytování s komplexní péčí.", icon: "Home" },
      { title: "Lidský přístup", description: "Personál, kterému na klientech záleží.", icon: "Heart" },
      { title: "Profesionální tým", description: "Zkušení pracovníci sociálních služeb.", icon: "Users" },
    ],
  },

  // ── Nový Bor ─────────────────────────────────────────────────────
  {
    branch: {
      slug: "novybor", name: "AHC Senior centrum Nový Bor", short_name: "Nový Bor",
      branch_type: "senior_centrum", type_label: "Senior centrum",
      tagline: "Domov\n*pro klidné stáří*",
      subtitle: "Pobytová sociální služba pro seniory v Novém Boru.",
      description: "Senior centrum poskytující pobytovou péči seniorům.",
      street: "B. Egermanna 354", city: "Nový Bor", zip: "473 01", region: "Liberecký kraj", ico: "24160369", parent_org: "Ambeat Group",
      phone: "+420 607 043 132", phone_short: "607 043 132", email: "novybor@ahc.cz",
      lat: 50.7570, lng: 14.5570, cover_image: "/images/_shared/care-hands.jpg", is_published: true,
    },
    services: SENIOR_SERVICES,
    highlights: [
      { title: "Klidné stáří", description: "Důstojné a bezpečné prostředí pro seniory.", icon: "Home" },
      { title: "Komplexní péče", description: "Ubytování, stravování i ošetřovatelská péče.", icon: "HandHelping" },
      { title: "Profesionální tým", description: "Zkušený a vstřícný personál.", icon: "Users" },
    ],
  },

  // ── Trutnov ──────────────────────────────────────────────────────
  {
    branch: {
      slug: "trutnov", name: "AHC Centrum následné péče Trutnov", short_name: "Trutnov",
      branch_type: "senior_centrum", type_label: "Centrum následné péče",
      tagline: "Domov\n*s lidským přístupem*",
      subtitle: "Pobytová sociální služba pro seniory s důrazem na individuální a laskavou péči.",
      description: "Senior centrum poskytující pobytovou péči seniorům v Trutnově.",
      street: "Novodvorská 949", city: "Trutnov", zip: "541 01", region: "Královéhradecký kraj", ico: "10913416", parent_org: "Ambeat Group",
      phone: "+420 499 812 424", phone_short: "499 812 424", email: "trutnov@ahc.cz",
      lat: 50.5610, lng: 15.9130, cover_image: "/images/_shared/care-hands.jpg", is_published: true,
    },
    services: SENIOR_SERVICES,
    highlights: [
      { title: "Individuální přístup", description: "Péče přizpůsobená potřebám každého klienta.", icon: "Heart" },
      { title: "Komplexní péče", description: "Ubytování, stravování i zdravotní péče.", icon: "HandHelping" },
      { title: "Profesionální tým", description: "Zkušený personál s lidským přístupem.", icon: "Users" },
    ],
  },

  // ── Přepychy ─────────────────────────────────────────────────────
  {
    branch: {
      slug: "prepychy", name: "AHC Senior centrum Přepychy", short_name: "Přepychy",
      branch_type: "senior_centrum", type_label: "Senior centrum",
      tagline: "Již na to\n*nejste sami*",
      subtitle: "AHC Senior centrum Přepychy poskytuje sociální služby seniorům s péčí a podporou v domácím prostředí i v zařízení.",
      description: "Domov pro seniory poskytující pobytové sociální služby.",
      street: "Přepychy 21", city: "Přepychy", zip: "517 32", region: "Královéhradecký kraj", ico: "24160369", parent_org: "Ambeat Group",
      phone: "+420 494 322 629", phone_short: "494 322 629", email: "prepychy@ahc.cz",
      lat: 50.2640, lng: 16.1130, cover_image: "/images/_shared/care-hands.jpg", is_published: true,
    },
    services: SENIOR_SERVICES,
    highlights: [
      { title: "Domov pro seniory", description: "Dlouhodobé pobytové služby v klidném prostředí.", icon: "Home" },
      { title: "Péče a podpora", description: "Komplexní péče s lidským přístupem.", icon: "Heart" },
      { title: "Profesionální tým", description: "Zkušený personál sociálních služeb.", icon: "Users" },
    ],
  },

  // ── Vizovice (Dotek z.ú.) ────────────────────────────────────────
  {
    branch: {
      slug: "vizovice", name: "AHC Odlehčovací centrum Vizovice", legal_name: "Dotek z.ú.", short_name: "Vizovice",
      branch_type: "senior_centrum", type_label: "Odlehčovací centrum",
      tagline: "Péče\n*v domácím prostředí*",
      subtitle: "Dotek z.ú. poskytuje péči seniorům a osobám se zdravotním postižením prostřednictvím pobytových a terénních sociálních služeb.",
      description: "Pečovatelská a odlehčovací sociální služba pro seniory a osoby se zdravotním postižením.",
      street: "Pardubská 1194", city: "Vizovice", zip: "763 12", region: "Zlínský kraj", ico: "27664333", parent_org: "Ambeat Group",
      phone: "+420 737 024 823", phone_short: "737 024 823", email: "socialni.dotek@ahc.cz",
      lat: 49.2220, lng: 17.8560, cover_image: "/images/vizovice/hero.jpg", is_published: true,
    },
    services: [
      { title: "Pečovatelská služba", description: "Terénní pomoc v domácnostech klientů.", icon: "HandHelping" },
      { title: "Odlehčovací služba", description: "Pobytová úleva pro pečující rodiny.", icon: "BedDouble" },
      { title: "Terénní odlehčovací služba", description: "Odlehčení přímo v domácím prostředí.", icon: "Home" },
      { title: "Půjčovna kompenzačních pomůcek", description: "Zapůjčení pomůcek pro péči doma.", icon: "Accessibility" },
      { title: "Pedikúra", description: "Péče o nohy pro seniory.", icon: "Footprints" },
    ],
    highlights: [
      { title: "Péče doma", description: "Pomáháme klientům zůstat v domácím prostředí.", icon: "Home" },
      { title: "Úleva pro rodiny", description: "Odlehčovací služby pobytové i terénní.", icon: "HeartHandshake" },
      { title: "Pobočky Vizovice i Zlín", description: "Působíme ve Vizovicích a ve Zlíně.", icon: "MapPin" },
    ],
  },

  // ── Podbořany (nemocnice následné péče) ──────────────────────────
  {
    branch: {
      slug: "podborany", name: "AHC Centrum následné péče Podbořany", legal_name: "MEDICINA, spol. s r.o.", short_name: "Podbořany",
      branch_type: "hospital", type_label: "Centrum následné péče",
      tagline: "Následná péče\n*s důrazem na kvalitu*",
      subtitle: "Nemocnice následné péče s důrazem na vysoce kvalitní ošetřovatelskou, léčebnou a rehabilitační péči.",
      description: "Centrum následné péče poskytující ošetřovatelskou, léčebnou a rehabilitační péči.",
      street: "Valovská 252", city: "Podbořany", zip: "441 01", region: "Ústecký kraj", ico: "49904035", parent_org: "Ambeat Group",
      phone: "+420 415 237 111", phone_short: "415 237 111", email: "podborany@ahc.cz",
      lat: 50.2300, lng: 13.4140, cover_image: "/images/podborany/hero.jpg", is_published: true,
    },
    units: [
      { category: "oddeleni", name: "Stanice A — interní obory", description: "Lůžková následná péče v interních oborech.", icon: "Stethoscope" },
      { category: "oddeleni", name: "Stanice B — rehabilitace", description: "Rehabilitace a nácvik chůze.", icon: "Activity" },
      { category: "oddeleni", name: "Pavilon C, D — chirurgie", description: "Chirurgie, traumatologie a ortopedie.", icon: "Scissors" },
      { category: "ambulance", name: "Chirurgická ambulance", icon: "Scissors" },
      { category: "ambulance", name: "Ortopedická ambulance", icon: "Bone" },
      { category: "ambulance", name: "Endokrinologická ambulance", icon: "Activity" },
      { category: "ambulance", name: "ORL ambulance", icon: "Ear" },
      { category: "ambulance", name: "RTG — radiodiagnostika", icon: "ScanLine" },
      { category: "komplement", name: "Vodoléčba a sauna", icon: "Waves" },
      { category: "komplement", name: "Rehabilitace motorovými dlahami", icon: "Activity" },
    ],
    highlights: [
      { title: "Komplexní následná péče", description: "Interní, chirurgická i rehabilitační lůžková péče.", icon: "HeartPulse" },
      { title: "Široké spektrum ambulancí", description: "Od chirurgie po ORL a RTG diagnostiku.", icon: "Stethoscope" },
      { title: "Rehabilitace a vodoléčba", description: "Moderní rehabilitační procedury, sauna a vodoléčba.", icon: "Waves" },
    ],
    grants: [{ funder: "Ústecký kraj", funder_short: "ÚK", description: "Podpořeno Ústeckým krajem." }],
  },

  // ── Rehabilitační centrum Meziboří ───────────────────────────────
  {
    branch: {
      slug: "rehabilitacnicentrummezibori", name: "AHC Rehabilitační centrum Meziboří", legal_name: "AHC Rehabilitační centrum Meziboří s.r.o.", short_name: "Meziboří (rehab)",
      branch_type: "hospital", type_label: "Rehabilitační centrum",
      tagline: "Komplexní rehabilitace\n*již od roku 1973*",
      subtitle: "Nestátní zdravotnické zařízení poskytující garantovanou, časnou a komplexní léčebně rehabilitační a ošetřovatelskou péči v plném rozsahu fyziatrie, balneoterapie a léčebné rehabilitace.",
      description: "Lůžkové rehabilitační zařízení – fyziatrie, balneoterapie a léčebná rehabilitace.",
      street: "Javorová 105", city: "Meziboří", zip: "435 13", region: "Ústecký kraj", parent_org: "Ambeat Group",
      phone: "+420 476 748 161", phone_short: "476 748 161", email: "rehabilitacnicentrummezibori@ahc.cz",
      lat: 50.6470, lng: 13.5970, opening_year: 1973, cover_image: "/images/mezibori-rehab/hero.jpg", is_published: true,
    },
    units: [
      { category: "oddeleni", name: "Lůžková rehabilitační péče", description: "Komplexní léčebně rehabilitační a ošetřovatelská péče hospitalizačního typu.", icon: "BedDouble" },
      { category: "ambulance", name: "Léčebná rehabilitace", description: "Intenzivní a opakované výkony léčebné tělesné výchovy.", icon: "Activity" },
      { category: "ambulance", name: "Fyziatrie", icon: "Stethoscope" },
      { category: "ambulance", name: "Balneoterapie", icon: "Waves" },
      { category: "ambulance", name: "Fyzikální terapie", icon: "Zap" },
    ],
    highlights: [
      { title: "Tradice od roku 1973", description: "Více než 50 let zkušeností v rehabilitační péči.", icon: "Award" },
      { title: "Komplexní rehabilitace", description: "Fyziatrie, balneoterapie a léčebná rehabilitace pod jednou střechou.", icon: "Activity" },
      { title: "Péče po operacích a úrazech", description: "Pro pacienty s hybným postižením i po neurologických onemocněních.", icon: "HeartPulse" },
    ],
  },

  // ── Malá Čermná (zatím bez dat — doplnit) ────────────────────────
  {
    branch: {
      slug: "malacermna", name: "AHC Senior centrum Malá Čermná", legal_name: "AHC Senior centrum Malá Čermná s.r.o.", short_name: "Malá Čermná",
      branch_type: "senior_centrum", type_label: "Domov pro seniory",
      tagline: "Již na to\n*nejste sami*",
      subtitle: "Domov pro seniory nabízí pobytové sociální služby seniorům, osobám se zdravotním postižením a chronicky či nevyléčitelně nemocným osobám se sníženou soběstačností.",
      description: "Domov pro seniory poskytující pobytové sociální služby.",
      street: "Malá Čermná 11", city: "Malá Čermná", zip: "549 31", region: "Královéhradecký kraj", ico: "17342554", parent_org: "Ambeat Group",
      phone: "+420 491 427 190", phone_short: "491 427 190", email: "malacermna@ahc.cz",
      lat: 50.4850, lng: 16.2450, cover_image: "/images/_shared/care-hands.jpg", is_published: true,
    },
    services: SENIOR_SERVICES,
    highlights: [
      { title: "Pobytové služby", description: "Domov pro seniory i osoby se sníženou soběstačností.", icon: "Home" },
      { title: "Komplexní péče", description: "Ubytování, stravování i ošetřovatelská péče.", icon: "HandHelping" },
      { title: "Lidský přístup", description: "Zkušený a vstřícný personál — již na to nejste sami.", icon: "Heart" },
    ],
    grants: [
      { funder: "Evropská unie", funder_short: "EU", project_name: "CZ.03.2.63/0.0/0.0/19_098/0015332", description: "Spolufinancováno z prostředků Evropské unie (4 433 451,25 Kč)." },
    ],
  },
];

/**
 * Importuje pobočky z IMPORTED_BRANCHES (scrapnuté z reálných webů).
 * Idempotentní — každou pobočku dle slugu smaže a vloží znovu i s obsahem.
 *  bunx convex run seed:runImportedBranchesSeed --prod
 */
export const runImportedBranchesSeed = mutation({
  args: { onlySlug: v.optional(v.string()) },
  handler: async (ctx, { onlySlug }) => {
    const now = Date.now();
    const perBranchTables = [
      "branch_units", "branch_services", "branch_facilities", "branch_team",
      "branch_testimonials", "branch_faq", "branch_news", "branch_alerts",
      "branch_gallery", "branch_documents", "branch_hours", "branch_about_features",
      "branch_highlights", "branch_admission_steps", "branch_career_perks",
      "branch_grants", "career_positions", "inquiries",
    ] as const;

    const seeded: string[] = [];
    for (const item of IMPORTED_BRANCHES) {
      if (onlySlug && item.branch.slug !== onlySlug) continue;

      const existing = await ctx.db
        .query("branches")
        .withIndex("by_slug", (q) => q.eq("slug", item.branch.slug))
        .unique();
      if (existing) {
        for (const t of perBranchTables) {
          const rows = await ctx.db
            .query(t)
            .withIndex("by_branch", (q) => q.eq("branch_id", existing._id))
            .collect();
          for (const r of rows) await ctx.db.delete(r._id);
        }
        await ctx.db.delete(existing._id);
      }

      const branchId = await ctx.db.insert("branches", {
        ...item.branch,
        created_at: now,
        updated_at: now,
      });

      let order = 0;
      for (const s of item.services ?? []) {
        await ctx.db.insert("branch_services", {
          branch_id: branchId, title: s.title, description: s.description,
          icon: s.icon, order: order++, created_at: now, updated_at: now,
        });
      }
      order = 0;
      for (const f of item.facilities ?? []) {
        await ctx.db.insert("branch_facilities", {
          branch_id: branchId, title: f.title, image_url: f.image_url,
          order: order++, created_at: now, updated_at: now,
        });
      }
      order = 0;
      for (const h of item.highlights ?? []) {
        await ctx.db.insert("branch_highlights", {
          branch_id: branchId, title: h.title, description: h.description,
          icon: h.icon, order: order++, created_at: now, updated_at: now,
        });
      }
      order = 0;
      for (const g of item.grants ?? []) {
        await ctx.db.insert("branch_grants", {
          branch_id: branchId, funder: g.funder, funder_short: g.funder_short,
          project_name: g.project_name, description: g.description,
          order: order++, created_at: now, updated_at: now,
        });
      }
      order = 0;
      for (const u of item.units ?? []) {
        await ctx.db.insert("branch_units", {
          branch_id: branchId, category: u.category, name: u.name,
          description: u.description, icon: u.icon, slug: slugifyCz(u.name),
          order: order++, created_at: now, updated_at: now,
        });
      }
      for (const t of item.testimonials ?? []) {
        await ctx.db.insert("branch_testimonials", {
          branch_id: branchId, author_name: t.author_name,
          author_role: t.author_role, content: t.content, rating: t.rating,
          created_at: now, updated_at: now,
        });
      }
      seeded.push(item.branch.slug);
    }
    return { seeded };
  },
});

/**
 * Naplní článkový obsah podstránky „O zařízení" pro Sedlec-Prčice 1:1 z dodaného
 * dokumentu (verze 1). Idempotentní.
 *  bunx convex run seed:runSedlecPageSeed --prod
 */
export const runSedlecPageSeed = mutation({
  args: {},
  handler: async (ctx) => {
    const branch = await ctx.db
      .query("branches")
      .withIndex("by_slug", (q) => q.eq("slug", "sedlec-prcice"))
      .unique();
    if (!branch) throw new Error("Sedlec-Prčice nenalezen");

    const existing = await ctx.db
      .query("branch_pages")
      .withIndex("by_branch", (q) => q.eq("branch_id", branch._id))
      .collect();
    for (const r of existing) await ctx.db.delete(r._id);

    const blocks = [
      { type: "heading", text: "Cesta zpět k soběstačnosti začíná správnou péčí" },
      { type: "paragraph", text: "Zdraví patří k nejcennějším věcem v životě. Po nemoci, operaci nebo náročné hospitalizaci však často přichází období, kdy člověk potřebuje více času, odborné podpory a rehabilitace, aby se mohl vrátit k běžnému životu." },
      { type: "paragraph", text: "AHC Centrum následné péče Sedlec-Prčice poskytuje následnou lůžkovou péči pacientům, kteří již nevyžadují akutní nemocniční léčbu, ale stále potřebují odbornou zdravotní, ošetřovatelskou a rehabilitační péči. Naším cílem je pomoci každému pacientovi dosáhnout co nejvyšší možné míry samostatnosti, stability a kvality života." },
      { type: "paragraph", text: "Spojujeme zkušenosti zdravotnického personálu, individuální přístup a moderní rehabilitační postupy s lidskostí, respektem a pochopením pro potřeby každého pacienta." },

      { type: "heading", text: "Proč si pacienti a jejich rodiny vybírají právě Sedlec-Prčice" },
      { type: "feature", heading: "Odborná následná péče", text: "Poskytujeme komplexní zdravotní, ošetřovatelskou a rehabilitační péči pacientům po operacích, úrazech, závažných onemocněních i při dlouhodobém zhoršení zdravotního stavu." },
      { type: "feature", heading: "Individuální rehabilitační plán", text: "Každý pacient přichází s jiným zdravotním příběhem a jinými potřebami. Proto přistupujeme ke každému individuálně a nastavujeme péči tak, aby co nejlépe podporovala jeho návrat k běžným aktivitám." },
      { type: "feature", heading: "Zkušený tým odborníků", text: "O pacienty pečuje tým lékařů, zdravotních sester, fyzioterapeutů a dalších odborníků, kteří společně pracují na dosažení co nejlepších výsledků léčby." },
      { type: "feature", heading: "Péče s lidským přístupem", text: "Víme, že uzdravování není pouze otázkou zdravotního stavu. Důležitou roli hraje také psychická pohoda, pocit bezpečí a důvěra mezi pacientem a personálem." },
      { type: "feature", heading: "Klidné prostředí pro rekonvalescenci", text: "Historické prostředí Sedlce-Prčice nabízí příjemnou atmosféru a klid, který napomáhá regeneraci sil a návratu k aktivnímu životu." },
      { type: "feature", heading: "Podpora rodiny a blízkých", text: "Rodina je důležitou součástí procesu rekonvalescence. Podporujeme kontakt pacientů s jejich blízkými a vnímáme rodinu jako partnera při poskytování péče." },

      { type: "heading", text: "Každý pokrok je důležitý" },
      { type: "paragraph", text: "Cesta k uzdravení bývá složena z mnoha malých kroků. Někdy jde o první samostatnou chůzi po operaci, jindy o návrat běžných denních činností nebo znovuzískání jistoty a soběstačnosti." },
      { type: "paragraph", text: "Právě proto klademe důraz na komplexní přístup ke každému pacientovi. Podporujeme jeho fyzickou kondici, psychickou pohodu i motivaci pokračovat v léčbě a rehabilitaci." },
      { type: "paragraph", text: "Věříme, že i zdánlivě malé pokroky mohou znamenat velký krok vpřed." },

      { type: "heading", text: "Sedlec-Prčice – město s historií a jedinečnou atmosférou" },
      { type: "paragraph", text: "Sedlec-Prčice patří mezi nejmalebnější města ve středních Čechách. Historické centrum, okolní příroda a klidná atmosféra vytvářejí prostředí, které přirozeně vybízí ke zklidnění a odpočinku." },
      { type: "paragraph", text: "Město je známé nejen svou historií, ale také tradičním dálkovým pochodem Praha–Prčice, který již desítky let spojuje tisíce lidí z celé České republiky." },
      { type: "paragraph", text: "Pobyt v Sedlci-Prčici nabízí nejen kvalitní zdravotní péči, ale také příjemné prostředí, které podporuje psychickou pohodu pacientů i jejich návštěv." },

      { type: "heading", text: "Zajímavosti v okolí" },
      { type: "paragraph", text: "Návštěvu blízkého člověka lze spojit také s poznáváním krásného regionu Toulavy a Českého Meránu." },
      { type: "linklist", items: [
        { label: "Sedlecká poutní cesta a kostel sv. Jeronýma", text: "Historická dominanta města a významná součást místní historie, která dodává centru Sedlce-Prčice jedinečný charakter.", url: "https://www.mesto-sedlecprcice.cz" },
        { label: "Moninec", text: "Oblíbené sportovní a rekreační středisko nabízející aktivity po celý rok. V zimě lyžování, v létě turistiku, cyklistiku a krásné výhledy do krajiny.", url: "https://www.moninec.cz" },
        { label: "Český Merán", text: "Krajina plná kopců, lesů, luk a malebných vesnic bývá často označována za jednu z nejkrásnějších oblastí středních Čech.", url: "https://www.ceskymeran.cz" },
        { label: "Zřícenina hradu Borotín", text: "Romantická historická památka obklopená krásnou přírodou, ideální cíl pro kratší výlet.", url: "https://www.borotin.cz" },
        { label: "Tábor", text: "Historické město s bohatou husitskou historií, malebným náměstím a množstvím kulturních památek.", url: "https://www.taborcz.eu" },
        { label: "Zámek Vysoký Chlumec", text: "Jeden z nejvýznamnějších zámků regionu s dlouhou historií a nádherným okolím.", url: "https://www.muzeum-pribram.cz/cz/pobocky/muzeum-vysoky-chlumec" },
      ] },

      { type: "heading", text: "Naše poslání" },
      { type: "paragraph", text: "Naším posláním je pomáhat lidem v období, kdy potřebují odbornou podporu, čas a péči k návratu do běžného života." },
      { type: "paragraph", text: "Poskytujeme následnou zdravotní péči s důrazem na odbornost, bezpečí a individuální přístup. Současně však nezapomínáme ani na lidskou stránku péče." },
      { type: "paragraph", text: "Protože za každou diagnózou je člověk. A za každým člověkem jeho vlastní příběh, cíle a přání." },

      { type: "heading", text: "Příběhy, které dávají naší práci smysl" },
      { type: "quote", text: "Po výměně kyčelního kloubu jsem měl obavy, zda budu ještě chodit stejně jako dříve. Díky rehabilitaci a podpoře personálu jsem postupně získal zpět sílu i sebevědomí. Dnes se opět věnuji běžným aktivitám a mohu být samostatný.", author: "Jiří, pacient" },
      { type: "quote", text: "Maminka se po hospitalizaci dostala do situace, kdy potřebovala odbornou následnou péči. Byli jsme překvapeni, jaký pokrok udělala během několika týdnů. Děkujeme za odbornost i lidský přístup celého týmu.", author: "Alena K., dcera pacientky" },
      { type: "quote", text: "Na rehabilitaci je krásné sledovat, jak se pacientům postupně vrací síla, samostatnost a chuť do života. Někdy jde o malé pokroky, ale právě ty bývají nejdůležitější.", author: "Petra, fyzioterapeutka" },
      { type: "quote", text: "Moderní zdravotní péče je důležitá, ale stejně důležité je pacientovi naslouchat, podpořit ho a dodat mu motivaci. Právě spojení odbornosti a lidského přístupu tvoří základ naší práce.", author: "Tým AHC Centra následné péče Sedlec-Prčice" },

      { type: "heading", text: "Přijeďte se přesvědčit osobně" },
      { type: "paragraph", text: "Pokud hledáte kvalitní následnou zdravotní péči pro sebe nebo svého blízkého, rádi vám představíme naše zařízení osobně." },
      { type: "paragraph", text: "Ukážeme vám prostředí centra, seznámíme vás s možnostmi péče a zodpovíme všechny vaše otázky. Protože nejlepší představu o našem zařízení získáte právě při osobní návštěvě." },
      { type: "cta", label: "Domluvit nezávaznou návštěvu", href: "/kontakt", text: "Rádi vám poradíme s možnostmi přijetí, průběhem péče i dalšími praktickými informacemi." },
    ];

    const sluzbyBlocks = [
      { type: "heading", text: "Následná lůžková péče" },
      { type: "paragraph", text: "Čas na doléčení, rehabilitaci a návrat k větší soběstačnosti. Následná péče je určena pacientům, jejichž zdravotní stav byl po akutním onemocnění, operaci, úrazu nebo zhoršení chronické nemoci stabilizován, ale stále vyžaduje odborné doléčení nebo léčebně rehabilitační péči. Péči poskytujeme nepřetržitě." },
      { type: "paragraph", text: "Naším cílem je:" },
      { type: "list", bullets: ["Stabilizovat nebo zlepšit zdravotní stav pacienta", "Podpořit návrat fyzických a psychických funkcí", "Obnovit nebo co nejdéle zachovat soběstačnost", "Zmírnit následky nemoci a předcházet dalšímu zhoršování", "Připravit pacienta na návrat domů nebo do jiného vhodného prostředí", "Poskytnout citlivou a důstojnou péči také nevyléčitelně nemocným"] },
      { type: "heading", text: "Zdravotní a ošetřovatelská péče" },
      { type: "paragraph", text: "Podle zdravotního stavu a ordinace lékaře zajišťujeme zejména:" },
      { type: "list", bullets: ["Podávání léků a dohled nad jejich užíváním", "Sledování zdravotního stavu a fyziologických funkcí", "Aplikaci injekcí a odběry krve", "Převazy a ošetřování ran či kožních defektů", "Měření glykémie, cévkování", "Aplikaci obkladů, zábalů a mastí, inhalace a dechová cvičení", "Výměnu inkontinenčních pomůcek a pomoc při osobní hygieně", "Objednání a zajištění odborných vyšetření", "Péči v závěru života"] },
      { type: "heading", text: "Rehabilitace a podpora soběstačnosti" },
      { type: "paragraph", text: "Rehabilitační péče může podle potřeb pacienta zahrnovat fyzioterapii, ergoterapii, individuální cvičení, nácvik běžných činností a práci s kompenzačními pomůckami. Někdy je velkým cílem opětovná samostatná chůze, jindy schopnost bezpečně se posadit, najíst nebo lépe komunikovat. Každý pokrok má význam." },
      { type: "heading", text: "Doplňkové služby" },
      { type: "list", bullets: ["Základní sociální poradenství", "Pomoc s žádostí do domova pro seniory", "Vedení individuálního účtu v depozitní pokladně", "Nákupní služba k lůžku, televizor na pokoji", "Zapůjčení rehabilitačních pomůcek a knih", "Doprovod na kontrolní vyšetření", "Návštěva kadeřníka nebo pedikúry", "Zprostředkování kontaktu s rodinou", "Účast na kulturních akcích a bohoslužbách"] },
      { type: "heading", text: "Jak probíhá přijetí na následnou péči" },
      { type: "paragraph", text: "Pacienty přijímáme na základě doporučení praktického nebo odborného lékaře, překladem z nemocnice nebo jiného lůžkového či sociálního zařízení. O vhodnosti přijetí rozhoduje vedoucí lékař zařízení." },
      { type: "list", bullets: ["1. Vyplňte Návrh na přijetí k hospitalizaci, přiložte aktuální lékařskou zprávu a souhlas se zpracováním osobních údajů", "2. Dokumenty doručte e-mailem (veronika.pistekova@ahc.cz), osobně do přijímací kanceláře nebo poštou", "3. Ozve se vám sociální pracovnice a projde s vámi další postup"] },
      { type: "heading", text: "Úhrady" },
      { type: "paragraph", text: "Zdravotní péče je poskytována podle pravidel veřejného zdravotního pojištění, doplňkové služby podle aktuálního ceníku. Orientační cena za 30 dní: 6 000 Kč vč. DPH ve stávající budově, 8 000 Kč vč. DPH v nové budově. Aktuální a úplné informace o úhradách poskytne před nástupem sociální pracovnice." },

      { type: "heading", text: "Domov pro seniory" },
      { type: "paragraph", text: "Bezpečné zázemí pro život s potřebnou podporou. Domov je určen lidem od 65 let, kteří kvůli věku, zdravotnímu stavu nebo sociální situaci potřebují pravidelnou a nepřetržitou pomoc jiné osoby. Kapacita domova je 54 lůžek. Poskytujeme ubytování, stravování, pomoc při každodenních činnostech, zdravotní a ošetřovatelskou péči, sociální podporu a aktivizační program." },
      { type: "heading", text: "Pomoc při každodenním životě" },
      { type: "list", bullets: ["Vstávání, přesuny a pohyb", "Oblékání a svlékání", "Stravování", "Osobní hygiena a péče o vlasy, zuby a nehty", "Používání toalety a výměna inkontinenčních pomůcek", "Orientace v denním režimu", "Vyřizování osobních záležitostí"] },
      { type: "heading", text: "Ubytování a prostředí" },
      { type: "paragraph", text: "Celá budova je bezbariérová. Klienti bydlí ve dvoulůžkových pokojích s vlastní koupelnou. Pokoje jsou vybaveny polohovatelnými lůžky, stolky, stolem, křesly, lednicí, televizí, uzamykatelnou skříní a možností připojení k internetu. K dispozici jsou společné jídelny, kuchyňky, klubovna, centrální koupelny, terasa, dvůr, zahrada a vlastní kaple." },
      { type: "heading", text: "Stravování" },
      { type: "paragraph", text: "Součástí služby je celodenní stravování (snídaně, oběd, večeře), dle dohody i svačiny. Na doporučení lékaře zajišťujeme dietní stravování, například diabetickou, žaludeční nebo žlučníkovou dietu. Jídelní lístek připravuje stravovací komise složená z nutriční terapeutky, vedoucí kuchyně a vrchní sestry." },
      { type: "heading", text: "Aktivity a volný čas" },
      { type: "list", bullets: ["Kondiční cvičení a nácvik soběstačnosti", "Individuální rehabilitace", "Trénování paměti", "Společné zpívání, výtvarné činnosti, vaření a pečení", "Společenské hry", "Canisterapie", "Kulturní a společenské akce, setkání s místní školou", "Bohoslužby a mše ve vlastní kapli"] },
      { type: "heading", text: "Jak probíhá přijetí do domova pro seniory" },
      { type: "list", bullets: ["1. Kontaktujte sociální pracovnici — probere s vámi situaci a nabídne prohlídku domova", "2. Vyplňte Žádost o poskytování sociální služby", "3. Multidisciplinární tým posoudí žádost", "4. Sociální pracovnice provede sociální šetření", "5. Uzavření smlouvy a nástup"] },
      { type: "cta", label: "Kontaktovat sociální pracovnici", href: "/kontakt", text: "Rádi vám poradíme, která služba je pro vás vhodná." },
    ];

    const dokumentyBlocks = [
      { type: "paragraph", text: "Zde najdete formuláře a praktické dokumenty potřebné k přijetí na následnou lůžkovou péči nebo do domova pro seniory. Nejste si jistí, který dokument potřebujete nebo jak jej vyplnit? Obraťte se na naši sociální pracovnici, ráda vám poradí." },
      { type: "heading", text: "Dokumenty pro následnou lůžkovou péči" },
      { type: "list", bullets: ["Návrh na přijetí k hospitalizaci", "Souhlas se zpracováním osobních údajů", "Aktuální ceník", "Pravidla pro podávání stížností", "Seznam věcí potřebných k nástupu"] },
      { type: "heading", text: "Dokumenty pro domov pro seniory" },
      { type: "list", bullets: ["Žádost o poskytování sociální služby", "Posudek lékaře o zdravotním stavu žadatele", "Vzor smlouvy o poskytování sociální služby", "Domácí řád", "Přehled úhrad", "Pravidla pro podávání stížností", "Co potřebujete k zahájení služby"] },
      { type: "paragraph", text: "Soubory ke stažení doplníme. Pro zaslání kteréhokoli dokumentu se prosím obraťte na sociální pracovnici." },
      { type: "heading", text: "Potřebujete pomoci s dokumenty?" },
      { type: "feature", heading: "Veronika Pištěková — sociální pracovnice (následná péče)", text: "E-mail: veronika.pistekova@ahc.cz · Telefon: +420 317 729 647 · Mobil: +420 702 078 993 · Po–Pá 7:00–15:30" },
      { type: "feature", heading: "Markéta Mašková — sociální pracovnice (domov pro seniory)", text: "E-mail: marketa.maskova@ahc.cz · Telefon: +420 317 729 647 · Mobil: +420 720 840 462 · Po–Pá 7:00–15:30" },
      { type: "heading", text: "Rozvoj kvality sociálních služeb" },
      { type: "paragraph", text: "Projekt „Trvalý rozvoj kvality v pobytových zařízeních sociálních služeb skupiny AHC” byl realizován od 1. dubna 2020 do 31. března 2022 a spolufinancován Evropskou unií. Registrační číslo: CZ.03.2.63/0.0/0.0/19_098/0015332. Celkové způsobilé náklady: 5 215 825 Kč. Dotace: 4 433 451,25 Kč." },
    ];

    const kontaktyBlocks = [
      { type: "paragraph", text: "Výběr vhodné péče může přinášet mnoho otázek. Nemusíte se v nich orientovat sami — zavolejte nebo napište našim sociálním pracovnicím. Vyslechnou vaši situaci, vysvětlí možnosti a poradí s dalším postupem." },
      { type: "feature", heading: "AHC Centrum následné péče Sedlec-Prčice a.s.", text: "Vítkovo náměstí 3, 257 91 Sedlec-Prčice · IČO: 25579282 · DIČ: CZ699007330 · Datová schránka: 8fcd9br · Ústředna: +420 317 834 311, +420 317 834 312 · Fax: +420 317 834 553" },
      { type: "heading", text: "Sociální pracovnice" },
      { type: "feature", heading: "Veronika Pištěková — následná lůžková péče", text: "Po–Pá 7:00–15:30 · E-mail: veronika.pistekova@ahc.cz · Telefon: +420 317 729 647 · Mobil: +420 702 078 993" },
      { type: "feature", heading: "Markéta Mašková — domov pro seniory", text: "Po–Pá 7:00–15:30 · E-mail: marketa.maskova@ahc.cz · Telefon: +420 317 729 647 · Mobil: +420 720 840 462" },
      { type: "heading", text: "Přímé kontakty na oddělení následné péče" },
      { type: "feature", heading: "Vrchní sestra ONP", text: "Telefon: +420 317 834 311–312, linka 209 · Mobil: +420 724 154 981" },
      { type: "feature", heading: "Stanice ONP", text: "I. stanice: +420 317 701 951 · II. stanice: +420 317 701 384 · III. stanice: +420 317 701 621" },
      { type: "heading", text: "Domov pro seniory" },
      { type: "feature", heading: "Vrchní sestra domova pro seniory", text: "Telefon: +420 317 834 311–312, linka 242 · Mobil: +420 720 997 141" },
      { type: "feature", heading: "Domov pro seniory", text: "Telefon: +420 317 705 097" },
      { type: "heading", text: "Další kontakty" },
      { type: "feature", heading: "Personální oddělení — Jaroslava Táboříková", text: "E-mail: jaroslava.taborikova@ahc.cz · Telefon: +420 317 701 125" },
      { type: "feature", heading: "Depozitní pokladna", text: "Po–Pá 7:00–15:00 · Telefon: +420 317 729 647, linka 210 nebo 204 · Bankovní spojení: Česká spořitelna, 0322086329/0800" },
    ];

    const pages = [
      { page: "o-zarizeni", title: "O zařízení", eyebrow: "O zařízení", lead: "Cesta zpět k soběstačnosti začíná správnou péčí", blocks },
      { page: "sluzby", title: "Naše služby", eyebrow: "Služby", lead: "Správná péče začíná porozuměním tomu, co právě potřebujete", blocks: sluzbyBlocks },
      { page: "dokumenty", title: "Dokumenty", eyebrow: "Ke stažení", lead: "Vše důležité přehledně a bez zbytečného hledání", blocks: dokumentyBlocks },
      { page: "kontakty", title: "Kontakty", eyebrow: "Kontakty", lead: "Nejste si jistí, kde začít? Ozvěte se nám.", blocks: kontaktyBlocks },
    ];
    for (const p of pages) {
      await ctx.db.insert("branch_pages", {
        branch_id: branch._id,
        page: p.page,
        title: p.title,
        eyebrow: p.eyebrow,
        lead: p.lead,
        blocks: p.blocks,
        updated_at: Date.now(),
      });
    }
    return { ok: true, pages: pages.map((p) => p.page) };
  },
});

// silence unused import — kept for future internal mutations
void internalMutation;
void getAuthUserId;
