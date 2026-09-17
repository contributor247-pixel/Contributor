import { config } from "dotenv";
config({ path: ".env.local" });

import { neon } from "@neondatabase/serverless";
import { drizzle } from "drizzle-orm/neon-http";
import { eq, inArray } from "drizzle-orm";
import {
  articles,
  articleAuthors,
  articleTags,
  categories,
  tags,
  users,
  publications,
  comments,
  reports,
  readEvents,
  purchases,
  ledger,
} from "./schema/index";
import { slugify } from "../src/lib/slugify";

interface EditorialArticleSeed {
  title: string;
  categoryName: string;
  isPremium: boolean;
  priceCents?: number;
  coverImageUrl: string;
  tagNames: string[];
  inPublication?: boolean;
  publishedDaysAgo: number;
  excerpt: string;
  bodyHtml: string;
}

const CATEGORY_NAMES = [
  "Technology",
  "Business",
  "Culture",
  "Travel",
  "Food",
  "Science",
  "Lifestyle",
];

const EDITORIAL_ARTICLES: EditorialArticleSeed[] = [
  {
    title: "The Silicon Renaissance: Why Custom Silicon Is Reshaping Modern Computing",
    categoryName: "Technology",
    isPremium: false,
    coverImageUrl: "/articles/technology_silicon.jpg",
    tagNames: ["Hardware", "Semiconductors", "AI", "Architecture"],
    inPublication: false,
    publishedDaysAgo: 1,
    excerpt:
      "For three decades, general-purpose processors defined the trajectory of software. Today, the physics of dark silicon and demanding tensor workloads have sparked a radical return to bespoke hardware.",
    bodyHtml: `
      <p>For more than three decades, the computing industry enjoyed the compounding dividend of Dennard scaling and Moore’s Law. A developer could write unoptimized software with the tranquil confidence that next year’s general-purpose CPU would double clock speeds and erase structural inefficiencies. That era has decisively ended.</p>
      
      <h2>The Physical Limits of General Computing</h2>
      <p>Today’s high-throughput computing bottlenecks are no longer bounded simply by raw transistor count, but by thermal dissipation, interconnect latency, and memory bandwidth. In modern neural networks and distributed cryptographic ledgers, moving bytes between memory and execution units consumes orders of magnitude more joules than the arithmetic operations themselves.</p>
      
      <blockquote>
        "The era of passive performance gains has yielded to an era of deliberate architectural specialization."
      </blockquote>

      <p>As a consequence, major engineering organizations have pivoted from standard off-the-shelf x86 silicon to deeply customized Application-Specific Integrated Circuits (ASICs) and domain-tailored System-on-Chips (SoCs). By tailoring register files, tensor execution matrices, and on-die SRAM caches to specific mathematical primitives, custom microarchitectures achieve up to 50x efficiency gains over general-purpose alternatives.</p>

      <h2>The Democratization of Chip Design</h2>
      <p>Historically, commissioning a bespoke tapeout required tens of millions of dollars in non-recurring engineering costs and massive specialized teams. The emergence of open-source instruction set architectures like RISC-V, coupled with modern high-level synthesis tooling and automated place-and-route pipelines, has dramatically lowered the barrier to entry.</p>

      <p>We are witnessing the dawn of a new silicon renaissance—where hardware and software are co-designed in seamless unison, unlocking capabilities that were computationally intractable just a decade ago.</p>
    `,
  },
  {
    title: "Beyond the Hype Cycle: How Sustainable Unit Economics Won the Decade",
    categoryName: "Business",
    isPremium: true,
    priceCents: 399,
    coverImageUrl: "/articles/business_economics.jpg",
    tagNames: ["Economics", "Startups", "Finance", "Strategy"],
    inPublication: false,
    publishedDaysAgo: 2,
    excerpt:
      "The era of zero-interest-rate subsidized growth has drawn to a close. A rigorous analysis of how companies built on true contribution margins and disciplined capital allocation outlasted their narrative-driven competitors.",
    bodyHtml: `
      <p>For nearly a decade, global venture capital was defined by the economic distortion of ultra-low interest rates. Growth was cheap, customer acquisition subsidies were abundant, and top-line velocity took precedence over baseline unit economics. The mandate was simple: capture market share at any cost and solve profitability later.</p>

      <h2>The Illusion of Subsidized Scale</h2>
      <p>When capital has virtually zero cost, business models that operate with negative gross margins can masquerade as market leaders. Ride-sharing, rapid grocery delivery, and multi-tenant SaaS platforms burned billions subsidizing individual consumer transactions under the hypothesis that monopolistic scale would yield pricing power.</p>

      <blockquote>
        "Growth without positive contribution margin is not scale; it is an accelerated liquidation of capital."
      </blockquote>

      <p>Yet as macroeconomic conditions shifted and the discount rate normalized, the fragility of these subsidized ecosystems became undeniable. Organizations that failed to generate organic cash flow found themselves facing punitive down-rounds and severe operational contractions.</p>

      <h2>The Return to Fundamental Discipline</h2>
      <p>Conversely, an understated cohort of operators maintained rigorous discipline: prioritizing high net revenue retention, sustainable payback periods (under 12 months), and structural cost advantages. These enterprises avoided excessive headcount dilution and focused relentlessly on software utility that delivered quantifiable ROI to their enterprise clients.</p>

      <p>The lesson of this cycle is enduring: durable market leadership is never bought through artificial subsidy—it is earned through unmistakable value creation and unassailable balance sheet resilience.</p>
    `,
  },
  {
    title: "The Preservation of Silence: Acoustic Architecture in the Contemporary City",
    categoryName: "Culture",
    isPremium: false,
    coverImageUrl: "/articles/culture_acoustics.jpg",
    tagNames: ["Architecture", "Urbanism", "Sound", "Design"],
    inPublication: false,
    publishedDaysAgo: 3,
    excerpt:
      "In an increasingly dense and mechanized world, acoustic comfort has transformed from an afterthought into one of our most precious cultural assets. Exploring the spatial masterminds shaping modern sanctuaries of sound.",
    bodyHtml: `
      <p>Urban life is inextricably acoustic. The persistent hum of traffic, mechanical HVAC reverberations, and digital notifications form an ambient baseline that rarely drops below sixty decibels. In response, modern spatial designers and architects are treating silence not as the absence of noise, but as a sculpted physical material.</p>

      <h2>Geometry and Resonance</h2>
      <p>Inside the world’s most celebrated concert halls and civic libraries, every surface is calculated with mathematical precision. Acoustic engineers employ complex algorithmic modeling to simulate wave propagation, ensuring that sound decays with rich, natural warmth rather than harsh flutter echoes.</p>

      <blockquote>
        "Silence is not emptiness; it is the acoustic canvas upon which human thought and emotional nuance find their clarity."
      </blockquote>

      <p>By pairing curved micro-perforated timber panels with sound-absorbing porous stone, contemporary halls achieve an extraordinary acoustic intimacy. A single cello note played pianissimo on stage reaches the highest balcony row with crystalline clarity, unaltered by electronic amplification.</p>

      <h2>Civic Sanctuaries</h2>
      <p>This philosophy is now escaping the confines of performance halls and entering everyday civic architecture. Modern public libraries, contemplation pavilions, and residential atriums are incorporating acoustic zoning—reclaiming mental space and communal serenity in the heart of the metropolis.</p>
    `,
  },
  {
    title: "Uncharted Coastlines: Solitude and Slow Living in the Southern Cyclades",
    categoryName: "Travel",
    isPremium: true,
    priceCents: 299,
    coverImageUrl: "/articles/travel_cyclades.jpg",
    tagNames: ["Mediterranean", "SlowLiving", "Islands", "Travel"],
    inPublication: true,
    publishedDaysAgo: 4,
    excerpt:
      "Far beyond the crowded cruise ports of Mykonos and Santorini lies a forgotten archipelago of wind-swept stone terraces, wild thyme ridges, and crystal Aegean solitude.",
    bodyHtml: `
      <p>At dawn in the southern Aegean, the Meltemi wind carries the sharp scent of wild oregano and sun-baked schist. The ferry departs the port of Piraeus heading south-east, leaving behind the bustling mainland for the quiet, rugged fringes of the Cyclades.</p>

      <h2>The Geometry of Whitewashed Stone</h2>
      <p>The architecture of these remote islands was forged out of defensive necessity and climate pragmatism. Low-slung whitewashed cube dwellings deflect the blinding summer sun, while thick stone masonry buffers against gale-force seasonal winds. There are no grand avenues here—only narrow labyrinthine stone alleys designed to trap cooling breezes and shade pedestrians.</p>

      <blockquote>
        "Time operates on an ancient cadence here—measured not in digital alerts, but in the arrival of fishing skiffs and the lengthening shadows of olive groves."
      </blockquote>

      <p>Here, a morning table set overlooking the sea requires nothing more than fresh sourdough, pressed Koroneiki olive oil, local thyme honey, and a carafe of chilled Assyrtiko wine. It is a masterclass in essentialism: living with only what is honest, nourishing, and immediately present.</p>

      <h2>Preserving the Wild Solitude</h2>
      <p>As global travel accelerates toward standardized luxury resorts, the small Cycladic isles offer an invaluable alternative: the luxury of stillness, unfiltered horizons, and genuine hospitality rooted in centuries of maritime tradition.</p>
    `,
  },
  {
    title: "The Alchemy of Fermentation: An Oral History of Wild Yeast and Ancient Grains",
    categoryName: "Food",
    isPremium: false,
    coverImageUrl: "/articles/food_fermentation.jpg",
    tagNames: ["Gastronomy", "Sourdough", "Culinary", "Craftsmanship"],
    inPublication: false,
    publishedDaysAgo: 5,
    excerpt:
      "A deep exploration into the microbiological partnership between humans and wild microbes that transformed simple flour and water into the bedrock of civilization.",
    bodyHtml: `
      <p>Before commercial monoculture yeast isolates arrived in late-nineteenth-century laboratories, every loaf of bread baked in human history was the result of spontaneous wild fermentation. Flour, water, and ambient air harbored an intricate ecosystem of wild yeasts and lactic acid bacteria.</p>

      <h2>Microbiology in the Hearth</h2>
      <p>A mature sourdough starter is a resilient microbiological ecosystem. Strains of <em>Saccharomyces cerevisiae</em> and <em>Candida humilis</em> ferment complex carbohydrates into carbon dioxide and ethanol, while heterofermentative lactobacilli produce lactic and acetic acids, lending the loaf its characteristic tangy flavor profile and natural preservation qualities.</p>

      <blockquote>
        "Bread is not an inert foodstuff; it is a live biological transformation captured at the moment of heat."
      </blockquote>

      <p>Furthermore, the long fermentation window allows native enzymes to break down phytic acid, unlocking bioavailable micronutrients—such as iron, zinc, and magnesium—while hydrolyzing complex gluten proteins into easily digestible peptides.</p>

      <h2>The Renaissance of Heirloom Grains</h2>
      <p>Artisanal millers and bakers worldwide are reviving ancient heirloom grain cultivars like Einkorn, Emmer, and Spelt. Unbleached and stone-ground to preserve the nutrient-rich germ and aleurone layers, these grains restore deep nutty complexity and tactile craft to the daily table.</p>
    `,
  },
  {
    title: "Mapping the Dark Cosmic Web: New Telescopic Frontiers at 4,000 Meters",
    categoryName: "Science",
    isPremium: true,
    priceCents: 450,
    coverImageUrl: "/articles/science_observatory.jpg",
    tagNames: ["Astrophysics", "Cosmology", "Space", "Discovery"],
    inPublication: false,
    publishedDaysAgo: 6,
    excerpt:
      "High above eighty percent of Earth's atmospheric water vapor, next-generation optical interferometers and spectroscopic instruments are illuminating the invisible filamentary structure of our universe.",
    bodyHtml: `
      <p>Perched high on the volcanic summit of Mauna Kea at 4,200 meters above sea level, the atmosphere is thin, hyper-arid, and unpolluted by artificial luminescence. Here, astronomical observatories peer back through billions of light-years of spacetime to observe the earliest cosmic dawn.</p>

      <h2>The Invisible Skeleton of the Universe</h2>
      <p>Standard baryonic matter—the protons, neutrons, and electrons that construct stars, planets, and human bodies—accounts for barely five percent of the total mass-energy density of the universe. The remainder is composed of dark energy (68%) and dark matter (27%).</p>

      <blockquote>
        "We are mapping the invisible scaffolding upon which all visible galaxies and superclusters are draped."
      </blockquote>

      <p>Using advanced gravitational lensing techniques and wide-field optical spectroscopy, astrophysicists can map the subtle distortions in background galaxy light caused by massive invisible dark matter halos. What emerges is a breathtaking cosmic web: immense filamentary bridges spanning hundreds of millions of light-years, along which galaxies cluster like droplets on spider silk.</p>

      <h2>Next-Generation Astronomical Instrumentation</h2>
      <p>With adaptive optics systems capable of correcting atmospheric turbulence thousands of times per second, ground-based giant telescopes now rival and surpass space-based observatories in raw angular resolution—opening an unprecedented observational window into the fundamental physics of the cosmos.</p>
    `,
  },
  {
    title: "The Geometry of Rest: Reimagining Domestic Spaces for Deep Focus and Reflection",
    categoryName: "Lifestyle",
    isPremium: false,
    coverImageUrl: "/articles/lifestyle_sanctuary.jpg",
    tagNames: ["InteriorDesign", "Mindfulness", "SlowLiving", "Craft"],
    inPublication: false,
    publishedDaysAgo: 7,
    excerpt:
      "In an era of relentless hyper-connectivity, our living environments must serve as intentional refuges. How the synthesis of natural timber, tactile textures, and filtered light fosters mental restoration.",
    bodyHtml: `
      <p>Our physical environment exerts a continuous, subconscious influence over cognitive bandwidth and nervous system equilibrium. When domestic interiors are cluttered with synthetic materials, harsh fluorescent lighting, and disorganized visual stimuli, the mind remains in a perpetual state of low-grade alert.</p>

      <h2>The Japandi Principle: Organic Warmth and Restraint</h2>
      <p>The contemporary synthesis of Japanese wabi-sabi philosophy and Scandinavian functional minimalism—often termed <em>Japandi</em>—offers a thoughtful remedy. The guiding premise is reduction without sterility: stripping away the superfluous while honoring the tactile richness of natural materials.</p>

      <blockquote>
        "A home should not demand your attention; it should gently absorb your fatigue and restore your focus."
      </blockquote>

      <p>By incorporating raw unvarnished oak slats, textured linen upholstery, lime-wash plastered walls, and low-profile furniture, living spaces establish a grounded, serene atmosphere. Natural light is diffused through delicate shoji-style screens or floor-to-ceiling glass looking out onto green courtyard plantings.</p>

      <h2>Designing for Intentional Rituals</h2>
      <p>Creating spaces dedicated to specific contemplative practices—a morning tea corner, a quiet reading chair away from screens, an uncluttered writing desk bathed in morning light—anchors daily life in restorative cadence and deep creative focus.</p>
    `,
  },
];

async function main() {
  const sql = neon(process.env.DATABASE_URL!);
  const db = drizzle(sql);

  console.log("Starting full editorial seed...");

  // 1. Ensure categories exist
  const categoryMap = new Map<string, string>();
  for (const name of CATEGORY_NAMES) {
    const slug = slugify(name);
    const [cat] = await db
      .insert(categories)
      .values({ name, slug, deprecated: false })
      .onConflictDoUpdate({
        target: categories.slug,
        set: { name, deprecated: false },
      })
      .returning();
    categoryMap.set(name, cat.id);
  }
  console.log(`Ensured ${categoryMap.size} categories.`);

  // 2. Resolve users
  const allUsers = await db.select().from(users);
  let primaryAuthor = allUsers.find(
    (u) => u.email === "mi0364922@gmail.com" || u.role === "author"
  );
  if (!primaryAuthor) {
    [primaryAuthor] = await db
      .insert(users)
      .values({
        email: "mi0364922@gmail.com",
        name: "Muhammad ismaeel",
        role: "author",
        twoFactorEnabled: true,
        emailVerified: new Date(),
      })
      .returning();
  }

  // 3. Resolve publication
  const [fieldNotesPub] = await db
    .select()
    .from(publications)
    .where(eq(publications.slug, "field-notes"))
    .limit(1);

  // 4. Clean out existing test articles and relationships
  console.log("Removing previous test articles and dependent rows...");
  await db.delete(comments);
  await db.delete(reports);
  await db.delete(readEvents);
  await db.delete(ledger);
  await db.delete(purchases);
  await db.delete(articleAuthors);
  await db.delete(articleTags);
  await db.delete(articles);
  console.log("Previous test articles cleared.");

  // 5. Seed new editorial articles
  for (const art of EDITORIAL_ARTICLES) {
    const slug = slugify(art.title);
    const categoryId = categoryMap.get(art.categoryName)!;
    const pubId =
      art.inPublication && fieldNotesPub ? fieldNotesPub.id : null;

    const publishedAt = new Date(
      Date.now() - art.publishedDaysAgo * 24 * 60 * 60 * 1000
    );

    const [insertedArticle] = await db
      .insert(articles)
      .values({
        title: art.title,
        slug,
        body: { html: art.bodyHtml.trim() },
        excerpt: art.excerpt.trim(),
        coverImageUrl: art.coverImageUrl,
        categoryId,
        publicationId: pubId,
        isPremium: art.isPremium,
        priceCents: art.isPremium ? art.priceCents ?? 299 : null,
        status: "published",
        createdAt: publishedAt,
        updatedAt: publishedAt,
        publishedAt,
      })
      .returning();

    // Link Author
    await db.insert(articleAuthors).values({
      articleId: insertedArticle.id,
      userId: primaryAuthor.id,
      isPrimary: true,
    });

    // Link Tags
    for (const tagName of art.tagNames) {
      const tagSlug = slugify(tagName);
      let [existingTag] = await db
        .select()
        .from(tags)
        .where(eq(tags.slug, tagSlug))
        .limit(1);

      if (!existingTag) {
        [existingTag] = await db
          .insert(tags)
          .values({ name: tagName, slug: tagSlug })
          .returning();
      }

      await db.insert(articleTags).values({
        articleId: insertedArticle.id,
        tagId: existingTag.id,
      });
    }

    console.log(`✓ Seeded: "${art.title}" [${art.categoryName}] (${art.isPremium ? "Premium $" + (art.priceCents! / 100).toFixed(2) : "Free"})`);
  }

  console.log(`\n🎉 Successfully seeded all ${EDITORIAL_ARTICLES.length} editorial articles with categories, tags, and authors!`);
}

main()
  .then(() => process.exit(0))
  .catch((err) => {
    console.error("Seeding error:", err);
    process.exit(1);
  });
