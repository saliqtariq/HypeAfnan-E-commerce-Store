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
  title: "HypeAfnan",
  description: "HypeAfnan - Your ultimate hype destination. Shop the latest streetwear, sneakers & exclusive drops.",
  keywords: ["HypeAfnan", "streetwear", "sneakers", "hype", "fashion", "Pakistan"],
  referrer: "no-referrer",
  openGraph: {
    title: "HypeAfnan",
    description: "Shop the latest streetwear, sneakers & exclusive drops.",
    url: "https://www.hypeafnan.com",
    siteName: "HypeAfnan",
    images: [{ url: "/images/afnanpicnewcroped.jpeg", width: 1200, height: 630, alt: "HypeAfnan" }],
    type: "website",
  },
  twitter: {
    card: "summary_large_image",
    title: "HypeAfnan",
    description: "Shop the latest streetwear, sneakers & exclusive drops.",
    images: ["/images/afnanpicnewcroped.jpeg"],
  },
  alternates: {
    canonical: "https://www.hypeafnan.com",
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

