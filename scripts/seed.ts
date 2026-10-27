import { getDb } from "@/lib/db";
import { products, DEFAULT_SECTIONS } from "@/lib/db/schema";
import content from "@/data/site.json";
import type { ColorOption } from "@/lib/types";

const DEFAULT_HERO_CTA = "অফার প্রাইস এ অর্ডার করুন";

type RelatedProduct = {
  slug: string;
  title: string;
  price: number;
  comparePrice: number | null;
  images: string[];
  sizes: string[];
  colors: ColorOption[];
};

async function main() {
  const db = getDb();

  const flagship = content.flagshipProduct;
  const related = content.relatedProducts as RelatedProduct[];

  await db
    .insert(products)
    .values({
      slug: flagship.slug,
      title: flagship.title,
      subtitle: flagship.subtitle,
      price: flagship.price,
      comparePrice: flagship.comparePrice,
      images: flagship.images,
      sizes: flagship.sizes,
      colors: flagship.colors,
      specs: flagship.specs,
      sizeChart: flagship.sizeChart,
      ratingValue: flagship.rating.value,
      ratingCount: flagship.rating.count,
      isFlagship: true,
      sortOrder: 0,
      heroCtaLabel: DEFAULT_HERO_CTA,
      whyChooseUs: content.whyChooseUs,
      qualityBannerTitle: content.qualityBanner.title,
      qualityBannerDesc: content.qualityBanner.desc,
      qualityBannerBadges: content.qualityBanner.badges,
      qualityBannerImage: content.qualityBanner.image,
      sections: DEFAULT_SECTIONS,
    })
    .onConflictDoNothing();

  for (let i = 0; i < related.length; i++) {
    const p = related[i];
    await db
      .insert(products)
      .values({
        slug: p.slug,
        title: p.title,
        subtitle: "",
        price: p.price,
        comparePrice: p.comparePrice,
        images: p.images,
        sizes: p.sizes,
        colors: p.colors,
        specs: [],
        sizeChart: [],
        isFlagship: false,
        sortOrder: i + 1,
        heroCtaLabel: DEFAULT_HERO_CTA,
        whyChooseUs: [],
        qualityBannerTitle: "",
        qualityBannerDesc: "",
        qualityBannerBadges: [],
        qualityBannerImage: "",
        sections: DEFAULT_SECTIONS,
      })
      .onConflictDoNothing();
  }

  console.log(`Seeded ${1 + related.length} products.`);
}

main()
  .then(() => process.exit(0))
  .catch((err) => {
    console.error(err);
    process.exit(1);
  });
