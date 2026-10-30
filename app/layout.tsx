import type { Metadata, Viewport } from "next";
import { Hind_Siliguri } from "next/font/google";
import "./globals.css";
import content from "@/data/site.json";
import { getSiteSettings } from "@/lib/settings";

const hindSiliguri = Hind_Siliguri({
  variable: "--font-hind-siliguri",
  subsets: ["bengali", "latin"],
  weight: ["400", "500", "600", "700"],
  display: "swap",
});

const siteUrl = process.env.NEXT_PUBLIC_SITE_URL || "https://bsuniquemart.com";
const p = content.flagshipProduct;

export const viewport: Viewport = {
  themeColor: "#141414",
  width: "device-width",
  initialScale: 1,
  maximumScale: 5,
};

export async function generateMetadata(): Promise<Metadata> {
  const settings = await getSiteSettings();
  const icons: Metadata["icons"] = settings.faviconUrl
    ? { icon: [{ url: settings.faviconUrl }] }
    : {
        icon: [
          { url: "/favicon.ico", sizes: "any" },
          { url: "/icon.png", type: "image/png", sizes: "44x44" },
        ],
        apple: [{ url: "/apple-icon.png", sizes: "180x180", type: "image/png" }],
      };

  return {
    ...baseMetadata,
    icons,
  };
}

const baseMetadata: Metadata = {
  metadataBase: new URL(siteUrl),
  title: {
    default: `${content.brand.name} | ${p.title}`,
    template: `%s | ${content.brand.name}`,
  },
  description: p.subtitle,
  keywords: [
    content.brand.name,
    p.title,
    "প্রিমিয়াম সানগ্লাস",
    "স্টাইলিশ সানগ্লাস",
    "সানগ্লাস বাংলাদেশ",
    "Premium Sunglasses",
    "Stylish Sunglasses BD",
    "Sunglasses Online Bangladesh",
    "Cash on Delivery",
  ],
  authors: [{ name: content.brand.name }],
  creator: content.brand.name,
  publisher: content.brand.name,
  alternates: {
    canonical: "/",
  },
  openGraph: {
    type: "website",
    locale: "bn_BD",
    url: siteUrl,
    title: `${content.brand.name} | ${p.title}`,
    description: p.subtitle,
    siteName: content.brand.name,
    images: [
      {
        url: p.images[0],
        width: 900,
        height: 670,
        alt: `${content.brand.name} - ${p.title}`,
      },
    ],
  },
  twitter: {
    card: "summary_large_image",
    title: `${content.brand.name} | ${p.title}`,
    description: p.subtitle,
    images: [p.images[0]],
  },
  robots: {
    index: true,
    follow: true,
    googleBot: {
      index: true,
      follow: true,
      "max-video-preview": -1,
      "max-image-preview": "large",
      "max-snippet": -1,
    },
  },
};

export default function RootLayout({ children }: LayoutProps<"/">) {
  return (
    <html lang="bn" className={`${hindSiliguri.variable} h-full`}>
      <body className={`${hindSiliguri.className} font-sans min-h-full antialiased`}>
        {children}
      </body>
    </html>
  );
}
