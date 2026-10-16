import { getDb } from "@/lib/db";
import { siteSettings } from "@/lib/db/schema";
import content from "@/data/site.json";

async function main() {
  const db = getDb();

  await db
    .insert(siteSettings)
    .ignore()
    .values({
      id: 1,
      phones: content.brand.phones,
      address: content.brand.address,
      facebookUrl: content.brand.social.facebook ?? "",
      deliveryZones: content.deliveryZones,
      logoUrl: "",
      faviconUrl: "",
      fbPixelId: "",
      googleSheetsWebhookUrl: "",
      googleSheetsWebhookSecret: "",
    });

  console.log("Seeded site settings.");
}

main()
  .then(() => process.exit(0))
  .catch((err) => {
    console.error(err);
    process.exit(1);
  });
