import Script from "next/script";
import Footer from "@/components/Footer";
import content from "@/data/site.json";
import { getSiteSettings } from "@/lib/settings";
import { darken } from "@/lib/color";

const siteUrl = process.env.NEXT_PUBLIC_SITE_URL || "https://bsuniquemart.com";
const p = content.flagshipProduct;

// Every page here reads site settings from the database — render on
// request instead of at build time, so CI builds never need DB access.
export const dynamic = "force-dynamic";

export default async function SiteLayout({ children }: { children: React.ReactNode }) {
  const settings = await getSiteSettings();

  const productJsonLd = {
    "@context": "https://schema.org",
    "@type": "Product",
    name: p.title,
    image: p.images.map((src) => `${siteUrl}${src}`),
    description: p.subtitle,
    sku: p.slug,
    brand: {
      "@type": "Brand",
      name: content.brand.name,
    },
    offers: {
      "@type": "Offer",
      url: `${siteUrl}/#order`,
      priceCurrency: "BDT",
      price: p.price,
      priceValidUntil: "2027-12-31",
      itemCondition: "https://schema.org/NewCondition",
      availability: "https://schema.org/InStock",
      seller: {
        "@type": "Organization",
        name: content.brand.name,
      },
    },
    aggregateRating: {
      "@type": "AggregateRating",
      ratingValue: p.rating.value,
      reviewCount: p.rating.count,
    },
  };

  const organizationJsonLd = {
    "@context": "https://schema.org",
    "@type": "Organization",
    name: content.brand.name,
    url: siteUrl,
    // Admin-uploaded logos are absolute Blob URLs; only the static default
    // fallback is a root-relative path that needs siteUrl prefixed.
    logo: settings.logoUrl || `${siteUrl}/images/BS_Unique_Mart_Logo.png`,
    contactPoint: {
      "@type": "ContactPoint",
      telephone: settings.phones[0] ?? content.brand.phones[0],
      contactType: "customer service",
      areaServed: "BD",
      availableLanguage: ["bn", "en"],
    },
    address: {
      "@type": "PostalAddress",
      streetAddress: settings.address || content.brand.address,
      addressCountry: "BD",
    },
  };

  const brand = settings.primaryColor || "#e21c34";

  return (
    <div className="flex min-h-full flex-col">
      <style
        dangerouslySetInnerHTML={{
          __html: `:root{--color-brand:${brand};--color-brand-dark:${darken(brand)};}`,
        }}
      />
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(productJsonLd) }}
      />
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(organizationJsonLd) }}
      />
      <main className="flex-1">{children}</main>
      <Footer
        logoUrl={settings.logoUrl}
        phones={settings.phones}
        address={settings.address}
        facebookUrl={settings.facebookUrl}
      />
      {settings.fbPixelId ? (
        <Script id="fb-pixel" strategy="afterInteractive">
          {`
            !function(f,b,e,v,n,t,s)
            {if(f.fbq)return;n=f.fbq=function(){n.callMethod?
            n.callMethod.apply(n,arguments):n.queue.push(arguments)};
            if(!f._fbq)f._fbq=n;n.push=n;n.loaded=!0;n.version='2.0';
            n.queue=[];t=b.createElement(e);t.async=!0;
            t.src=v;s=b.getElementsByTagName(e)[0];
            s.parentNode.insertBefore(t,s)}(window, document,'script',
            'https://connect.facebook.net/en_US/fbevents.js');
            fbq('set', 'autoConfig', false, '${settings.fbPixelId}');
            fbq('init', '${settings.fbPixelId}');
            fbq('track', 'PageView');
            window.__FB_PIXEL_ID__ = '${settings.fbPixelId}';
          `}
        </Script>
      ) : null}
    </div>
  );
}
