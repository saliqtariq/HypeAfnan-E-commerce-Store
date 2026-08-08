import Image from "next/image";
import { useTranslations } from "next-intl";
import HomeClient from "../components/HomeClient";
import { getAllProducts } from "../lib/getProducts";
import type { Product } from "../components/ProductGrid";

// Cache this page on Vercel's CDN for 5 minutes
// First visitor triggers a render; all subsequent visitors within 5min get the cached HTML instantly
export const revalidate = 300;

const PAGE_LIMIT = 30;

export default function Home() {
  const t = useTranslations("contactBanner");

  // Read first page of products on the SERVER — baked into the HTML
  // No API call needed from the browser on initial load
  const allProducts = getAllProducts() as Product[];
  const initialProducts = allProducts.slice(0, PAGE_LIMIT);
  const total = allProducts.length;

  return (
    <main className="flex flex-col items-center w-full">
      {/* Hero Section */}
      <section className="w-full max-w-[1200px] mx-auto px-4 sm:px-6 lg:px-8 pt-0 pb-4">
        <div className="relative w-full aspect-[4/5] sm:aspect-[4/3] md:aspect-[3/2] lg:aspect-[16/9] rounded-md overflow-hidden bg-black flex flex-col items-center justify-center text-white">
          <Image
            src="/images/afnanpicnewcroped.jpeg"
            alt="HypeAfnan Hero Background"
            fill
            className="object-cover opacity-60"
            priority
          />
          <div className="relative z-10 flex flex-col items-center gap-4 sm:gap-6 w-full px-4 text-center">
            <h1 className="text-4xl sm:text-6xl md:text-7xl font-bold tracking-tight italic" style={{ fontFamily: 'Impact, sans-serif' }}>
              HYPEAFNAN
            </h1>
            
            <div className="flex flex-col items-start gap-3 sm:gap-4 mx-auto max-w-fit">
              <div className="flex items-center gap-3 sm:gap-4 text-xl sm:text-2xl font-medium">
                <svg width="32" height="32" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" className="shrink-0"><path d="M3 21l1.65-3.8a9 9 0 1 1 3.4 2.9L3 21" /><path d="M9 10a.5.5 0 0 0 1 0V9a.5.5 0 0 0-1 0v1a5 5 0 0 0 5 5h1a.5.5 0 0 0 0-1h-1a.5.5 0 0 0 0 1" /></svg>
                <span>+923199775990</span>
              </div>
              <div className="flex items-center gap-3 sm:gap-4 text-xl sm:text-2xl font-medium">
                <svg width="32" height="32" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" className="shrink-0"><rect width="20" height="16" x="2" y="4" rx="2"/><path d="m22 7-8.97 5.7a1.94 1.94 0 0 1-2.06 0L2 7"/></svg>
                <span>E-mail: Afnaninvain@gmail.com</span>
              </div>
              <div className="flex items-center gap-3 sm:gap-4 text-xl sm:text-2xl font-medium">
                <svg width="32" height="32" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" className="shrink-0"><circle cx="12" cy="12" r="10"/><path d="M12 2a15.3 15.3 0 0 1 4 10 15.3 15.3 0 0 1-4 10 15.3 15.3 0 0 1-4-10 15.3 15.3 0 0 1 4-10z"/><path d="M2 12h20"/></svg>
                <span>https://hypeafnan.vercel.app/</span>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Pass pre-rendered products — browser shows them instantly without any API call */}
      <HomeClient initialProducts={initialProducts} initialTotal={total} />
    </main>
  );
}
