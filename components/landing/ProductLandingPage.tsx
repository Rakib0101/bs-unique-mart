import Hero from "@/components/landing/Hero";
import HighlightsBar from "@/components/landing/HighlightsBar";
import WhyChooseUs from "@/components/landing/WhyChooseUs";
import ProductDetail from "@/components/landing/ProductDetail";
import QualityBanner from "@/components/landing/QualityBanner";
import RelatedProducts from "@/components/landing/RelatedProducts";
import OrderExperience from "@/components/landing/OrderExperience";
import ScrollToTop from "@/components/landing/ScrollToTop";
import { DEFAULT_SECTIONS, type DeliveryZone, type Product, type SectionType } from "@/lib/db/schema";

export default function ProductLandingPage({
  product,
  otherProducts,
  deliveryZones,
  fbPixelId,
}: {
  product: Product;
  otherProducts: Product[];
  deliveryZones: DeliveryZone[];
  fbPixelId: string;
}) {
  const sections = product.sections?.length ? product.sections : DEFAULT_SECTIONS;

  const renderers: Record<SectionType, () => React.ReactNode> = {
    highlights: () => <HighlightsBar key="highlights" />,
    whyChooseUs: () => <WhyChooseUs key="whyChooseUs" items={product.whyChooseUs} />,
    productDetail: () => <ProductDetail key="productDetail" product={product} />,
    qualityBanner: () =>
      product.qualityBannerTitle ? (
        <QualityBanner
          key="qualityBanner"
          title={product.qualityBannerTitle}
          desc={product.qualityBannerDesc}
          badges={product.qualityBannerBadges}
          image={product.qualityBannerImage}
        />
      ) : null,
  };

  return (
    <>
      <Hero product={product} />
      {sections.filter((s) => s.visible).map((s) => renderers[s.type]())}
      {product.showRelatedProducts ? <RelatedProducts products={otherProducts} /> : null}
      <OrderExperience product={product} deliveryZones={deliveryZones} fbPixelId={fbPixelId} />
      <ScrollToTop />
    </>
  );
}
