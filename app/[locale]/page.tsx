import Image from "next/image";
import { useTranslations } from "next-intl";
import HomeClient from "../components/HomeClient";
import { getAllProducts } from "../lib/getProducts";
import type { Product } from "../components/ProductGrid";

// Regenerate this page every 24 hours on Vercel
export const revalidate = 86400;

const PAGE_LIMIT = 300;

export default function Home() {
  const t = useTranslations("contactBanner");

  // Read first page of products on the SERVER — baked into the HTML
  // No API call needed from the browser on initial load
  const allProducts = getAllProducts() as Product[];
  const total = allProducts.length;

  // Keep the promo card (first product) pinned — rotate the rest daily
  // Each day picks a fresh batch of 29 products based on the day number
  const promoCard = allProducts[0];
  const restProducts = allProducts.slice(1);
  const dayNumber = Math.floor(Date.now() / (1000 * 60 * 60 * 24)); // changes every 24 hrs
  const startIdx = (dayNumber * (PAGE_LIMIT - 1)) % restProducts.length;
  const slice1 = restProducts.slice(startIdx, startIdx + PAGE_LIMIT - 1);
  // Wrap around if we hit the end of the list
  const slice2 = slice1.length < PAGE_LIMIT - 1
    ? restProducts.slice(0, (PAGE_LIMIT - 1) - slice1.length)
    : [];
  const initialProducts = [promoCard, ...slice1, ...slice2];

  return (
    <main className="flex flex-col items-center w-full">
      {/* Hero Section */}
      <section className="w-full max-w-[1200px] mx-auto px-4 sm:px-6 lg:px-8 pt-0 pb-4">
        <div className="relative w-full aspect-[4/5] sm:aspect-[4/3] md:aspect-[3/2] lg:aspect-[16/9] rounded-md overflow-hidden bg-black text-white">
          <Image
            src="/images/afnanpicnewcroped.jpeg"
            alt="HypeAfnan Hero Background"
            fill
            className="object-cover opacity-60"
            priority
          />

          {/* Center: Title + Tagline */}
          <div className="absolute inset-0 z-10 flex flex-col items-center justify-center px-4 text-center">
            <h1 className="text-4xl sm:text-6xl md:text-7xl font-bold tracking-tight">
              HYPEAFNAN
            </h1>
            <p className="text-sm sm:text-base md:text-2xl font-bold tracking-tight mt-0.5" style={{color: '#ffb6c1'}}>
              Sic Parvis Magna.
            </p>
          </div>

          {/* Bottom: Contact Info */}
          <div className="absolute bottom-5 sm:bottom-7 left-5 sm:left-8 z-10 flex flex-col items-start gap-2 sm:gap-3">
            <div className="flex items-center gap-2 sm:gap-3 text-sm sm:text-lg font-medium">
              <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" className="shrink-0"><path d="M3 21l1.65-3.8a9 9 0 1 1 3.4 2.9L3 21" /><path d="M9 10a.5.5 0 0 0 1 0V9a.5.5 0 0 0-1 0v1a5 5 0 0 0 5 5h1a.5.5 0 0 0 0-1h-1a.5.5 0 0 0 0 1" /></svg>
              <span>+923199775990</span>
            </div>
            <div className="flex items-center gap-2 sm:gap-3 text-sm sm:text-lg font-medium">
              <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" className="shrink-0"><rect width="20" height="16" x="2" y="4" rx="2"/><path d="m22 7-8.97 5.7a1.94 1.94 0 0 1-2.06 0L2 7"/></svg>
              <span>E-mail: Afnaninvain@gmail.com</span>
            </div>
            <div className="flex items-center gap-2 sm:gap-3 text-sm sm:text-lg font-medium">
              <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" className="shrink-0"><circle cx="12" cy="12" r="10"/><path d="M12 2a15.3 15.3 0 0 1 4 10 15.3 15.3 0 0 1-4 10 15.3 15.3 0 0 1-4-10 15.3 15.3 0 0 1 4-10z"/><path d="M2 12h20"/></svg>
              <span>https://hypeafnan.vercel.app/</span>
            </div>
          </div>
        </div>
      </section>

      {/* Pass pre-rendered products — browser shows them instantly without any API call */}
      <HomeClient initialProducts={initialProducts} initialTotal={total} />
    </main>
  );
}
