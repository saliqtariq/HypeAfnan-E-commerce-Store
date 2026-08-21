import Image from "next/image";
import { getTranslations } from "next-intl/server";
import HomeClient from "../components/HomeClient";
import { getAllProducts } from "../lib/getProducts";
import { getSanityProducts } from "../../sanity/client";
import type { Product } from "../components/ProductGrid";

// Regenerate this page every 1 hour to pick up new Sanity products while saving function invocations
export const revalidate = 3600;

const PAGE_LIMIT = 300;

export default async function Home() {
  const t = await getTranslations("contactBanner");
  const tHero = await getTranslations("hero");

  // Fetch Sanity products server-side
  let sanityProducts: Product[] = [];
  try {
    const raw = await getSanityProducts();
    sanityProducts = (raw || []).map((p: any) => ({
      id: `sanity_${p._id}`,
      goodsId: `sanity_${p._id}`,
      searchCode: p.searchCode,
      category: p.category,
      subCategory: p.subCategory,
      coverImage: p.images?.[0] || null,
      images: p.images || [],
      _fromSanity: true,
    }));
  } catch {
    // Sanity unavailable — continue with JSON products only
  }

  // JSON products
  const jsonProducts = getAllProducts() as Product[];
  const total = sanityProducts.length + jsonProducts.length;

  // Keep the promo card (first product of JSON) pinned — rotate the rest daily
  const promoCard = jsonProducts[0];
  const restJson = jsonProducts.slice(1);
  const restProducts = [...sanityProducts, ...restJson];
  
  const dayNumber = Math.floor(Date.now() / (1000 * 60 * 60 * 24));
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
      <section className="w-full max-w-300 mx-auto px-4 sm:px-6 lg:px-8 pt-0 pb-4">
        <div className="relative w-full aspect-4/5 sm:aspect-4/3 md:aspect-3/2 lg:aspect-video rounded-md overflow-hidden bg-black text-white">
          <Image
            src="/images/afnanpicnewcroped.jpeg"
            alt="HypeAfnan Hero Background"
            fill
            className="object-cover opacity-60"
            priority
          />

          {/* Stats badge: bottom-right on all screens */}
          <div className="absolute bottom-3 right-3 sm:bottom-7 sm:right-8 z-10 flex items-center gap-1.5 sm:gap-3 drop-shadow-md">
            <div className="w-9 h-9 sm:w-14 sm:h-14 rounded-full overflow-hidden shrink-0 border border-white/20">
              <Image
                src="/images/hypeafnancircularlogopic.png"
                alt="HypeAfnan Logo"
                width={56}
                height={56}
                className="w-full h-full object-cover"
              />
            </div>
            <div className="flex flex-col">
              <p className="text-sm sm:text-xl font-bold leading-none mb-0.5 sm:mb-1">HypeAfnan</p>
              <p className="text-[11px] sm:text-base font-medium leading-none drop-shadow-sm" style={{ color: '#ffb6c1' }}>{tHero("totalProducts")} {total}</p>
            </div>
          </div>

          {/* Center: Title + Tagline */}
          <div className="absolute inset-0 z-10 flex flex-col items-center justify-center px-4 text-center">
            <h1 className="text-4xl sm:text-6xl md:text-7xl font-bold tracking-tight">
              HYPEAFNAN.
            </h1>
            <p className="text-lg sm:text-2xl md:text-4xl font-bold tracking-tight mt-0.5" style={{ color: '#ffb6c1' }}>
              Sic Parvis Magna
            </p>
          </div>

          {/* Bottom: Contact Info */}
          <div className="absolute bottom-4 sm:bottom-7 left-4 sm:left-8 z-10 flex flex-col items-start gap-2 sm:gap-3 max-w-[58%] sm:max-w-none">
            <div className="flex items-center gap-2 sm:gap-3 text-sm sm:text-lg font-medium">
              <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" className="shrink-0 sm:w-[22px] sm:h-[22px]"><path d="M3 21l1.65-3.8a9 9 0 1 1 3.4 2.9L3 21" /><path d="M9 10a.5.5 0 0 0 1 0V9a.5.5 0 0 0-1 0v1a5 5 0 0 0 5 5h1a.5.5 0 0 0 0-1h-1a.5.5 0 0 0 0 1" /></svg>
              <span>+923199775990</span>
            </div>
            <div className="flex items-center gap-2 sm:gap-3 text-sm sm:text-lg font-medium">
              <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" className="shrink-0 sm:w-[22px] sm:h-[22px]"><rect width="20" height="16" x="2" y="4" rx="2" /><path d="m22 7-8.97 5.7a1.94 1.94 0 0 1-2.06 0L2 7" /></svg>
              <span>{tHero("email")}: Afnaninvain@gmail.com</span>
            </div>
            <div className="flex items-center gap-2 sm:gap-3 text-sm sm:text-lg font-medium">
              <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" className="shrink-0 sm:w-[22px] sm:h-[22px]"><circle cx="12" cy="12" r="10" /><path d="M12 2a15.3 15.3 0 0 1 4 10 15.3 15.3 0 0 1-4 10 15.3 15.3 0 0 1-4-10 15.3 15.3 0 0 1 4-10z" /><path d="M2 12h20" /></svg>
              <span>www.hypeafnan.com</span>
            </div>
          </div>
        </div>
      </section>

      {/* Pass pre-rendered products — browser shows them instantly without any API call */}
      <HomeClient initialProducts={initialProducts} initialTotal={total} />
    </main>
  );
}
