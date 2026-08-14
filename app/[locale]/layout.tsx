import type { Metadata } from "next";
import { Geist } from "next/font/google";
import { NextIntlClientProvider, hasLocale } from "next-intl";
import { notFound } from "next/navigation";
import { routing } from "@/i18n/routing";
import "../globals.css";
import Header from "../components/Header";
import WhatsAppButton from "../components/WhatsAppButton";
import RouteProgressBar from "../components/RouteProgressBar";
import Footer from "../components/Footer";
import { AppProvider } from "../context/AppContext";

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});



export const metadata: Metadata = {
  metadataBase: new URL("https://www.hypeafnan.com"),
  title: {
    template: "%s | HypeAfnan",
    default: "HypeAfnan | Premium Streetwear, Sneakers & Luxury Fashion",
  },
  description: "HypeAfnan is your ultimate destination for premium streetwear, exclusive sneakers, and luxury designer clothing. Shop the latest hype fashion trends today.",
  keywords: [
    "HypeAfnan", "Hype Afnan", "Afnan", "Hype", "streetwear", "sneakers", 
    "luxury fashion", "designer clothes", "hypebeast clothing", "exclusive drops", 
    "premium apparel", "Pakistan streetwear", "online clothing store", 
    "men's fashion", "women's fashion", "high-end streetwear", "designer sneakers"
  ],
  authors: [{ name: "HypeAfnan" }],
  creator: "HypeAfnan",
  publisher: "HypeAfnan",
  referrer: "origin-when-cross-origin",
  formatDetection: {
    email: false,
    address: false,
    telephone: false,
  },
  openGraph: {
    title: "HypeAfnan | Premium Streetwear & Sneakers",
    description: "Shop the latest streetwear, exclusive sneakers, and luxury fashion at HypeAfnan.",
    url: "https://www.hypeafnan.com",
    siteName: "HypeAfnan",
    images: [{ url: "/images/afnanpicnewcroped.jpeg", width: 1200, height: 630, alt: "HypeAfnan Premium Fashion" }],
    type: "website",
    locale: "en_US",
  },
  twitter: {
    card: "summary_large_image",
    title: "HypeAfnan | Premium Streetwear & Sneakers",
    description: "Shop the latest streetwear, exclusive sneakers, and luxury fashion at HypeAfnan.",
    images: ["/images/afnanpicnewcroped.jpeg"],
    creator: "@HypeAfnan",
  },
  alternates: {
    canonical: "https://www.hypeafnan.com",
  },
  robots: {
    index: true,
    follow: true,
    googleBot: {
      index: true,
      follow: true,
      'max-video-preview': -1,
      'max-image-preview': 'large',
      'max-snippet': -1,
    },
  },
};

export function generateStaticParams() {
  return routing.locales.map((locale) => ({ locale }));
}

export default async function LocaleLayout({
  children,
  params,
}: {
  children: React.ReactNode;
  params: Promise<{ locale: string }>;
}) {
  const { locale } = await params;

  if (!hasLocale(routing.locales, locale)) {
    notFound();
  }

  const messages = (await import(`../../messages/${locale}.json`)).default;

  return (
    <html
      lang={locale}
      dir={locale === "ar" ? "rtl" : "ltr"}
      data-scroll-behavior="smooth"
      className={`${geistSans.variable} h-full antialiased`}
    >
      <head>
        <link rel="preconnect" href="https://hypeafnan-cdn.afnanimran61.workers.dev" crossOrigin="anonymous" />
        <link rel="dns-prefetch" href="https://hypeafnan-cdn.afnanimran61.workers.dev" />
      </head>
      <body className="min-h-full flex flex-col">
        <NextIntlClientProvider locale={locale} messages={messages}>
          <AppProvider>
            <RouteProgressBar />
            <Header />
            <main className="flex-1">
              {children}
            </main>
            <Footer />
            <WhatsAppButton />
          </AppProvider>
        </NextIntlClientProvider>
      </body>
    </html>
  );
}

