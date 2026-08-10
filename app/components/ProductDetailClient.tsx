"use client";

import React, { useState, useCallback, useEffect, useRef, useTransition, useMemo } from "react";
import { useParams, useRouter } from "next/navigation";
import Link from "next/link";
import Image from "next/image";
import type { Product } from "./ProductGrid";
import { useAppContext } from "../context/AppContext";

interface ProductDetailClientProps {
  product: Product | null;
}

const WHATSAPP_NUMBER = "923199775990";

function ShareIcon() {
  return (
    <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
      <circle cx="18" cy="5" r="3" />
      <circle cx="6" cy="12" r="3" />
      <circle cx="18" cy="19" r="3" />
      <line x1="8.59" y1="13.51" x2="15.42" y2="17.49" />
      <line x1="15.41" y1="6.51" x2="8.59" y2="10.49" />
    </svg>
  );
}

function BackIcon() {
  return (
    <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <polyline points="15 18 9 12 15 6" />
    </svg>
  );
}

function WhatsAppIcon() {
  return (
    <svg width="18" height="18" viewBox="0 0 32 32" fill="currentColor">
      <path d="M16 0C7.163 0 0 7.163 0 16c0 2.83.737 5.484 2.025 7.794L0 32l8.394-2.004A15.93 15.93 0 0 0 16 32c8.837 0 16-7.163 16-16S24.837 0 16 0zm0 29.333a13.3 13.3 0 0 1-6.789-1.858l-.487-.29-5.012 1.197 1.227-4.887-.318-.503A13.265 13.265 0 0 1 2.667 16C2.667 8.636 8.636 2.667 16 2.667S29.333 8.636 29.333 16 23.364 29.333 16 29.333zm7.288-9.896c-.397-.199-2.35-1.16-2.714-1.293-.365-.132-.63-.199-.896.2-.266.397-1.029 1.293-1.261 1.559-.232.266-.464.3-.861.1-.397-.199-1.677-.618-3.194-1.974-1.18-1.054-1.977-2.356-2.21-2.753-.232-.397-.025-.611.174-.808.179-.177.397-.464.596-.696.199-.232.266-.397.398-.663.132-.265.066-.497-.033-.696-.1-.199-.897-2.163-1.229-2.962-.323-.777-.651-.672-.897-.684-.232-.01-.497-.012-.762-.012-.265 0-.696.1-.1.06 1.294-1.062 1.294.993 0 1.36-.199.365-.397.563-.696.728-.299.166-1.129.44-2.16 1.327-1.323 1.112-2.094 2.793-2.094 2.793z" />
    </svg>
  );
}

export default function ProductDetailClient({ product }: ProductDetailClientProps) {
  const router = useRouter();
  const { locale, copyToClipboard } = useAppContext();
  const [selectedImageIdx, setSelectedImageIdx] = useState(0);

  // Track whether we have internal navigation history to go back to
  const hasInternalHistory = useRef(false);

  useEffect(() => {
    // If the page loaded with a referrer from the same origin, we have history to go back to.
    // Also, Next.js client-side navigation pushes to history, so we track via popstate.
    const referrer = document.referrer;
    if (referrer && new URL(referrer).origin === window.location.origin) {
      hasInternalHistory.current = true;
    }
  }, []);

  const [, startTransition] = useTransition();

  const goBack = useCallback(() => {
    if (hasInternalHistory.current && window.history.length > 1) {
      startTransition(() => router.back());
    } else {
      // No internal history — navigate home instead of exiting the browser
      startTransition(() => router.push(`/${locale}`));
    }
  }, [router, locale, startTransition]);

  const images = useMemo(() => {
    if (!product) return [];
    const imgs: string[] = [];
    if (product.coverImage) imgs.push(product.coverImage);
    if (product.imageUrl && !imgs.includes(product.imageUrl)) imgs.push(product.imageUrl);
    if (product.images) {
      for (const img of product.images) {
        if (!imgs.includes(img)) imgs.push(img);
      }
    }
    return imgs;
  }, [product]);

  const title = product?.title || product?.name || "";
  const searchCode = product?.searchCode || product?.goodsCode || "";
  const productId = product?.goodsId || product?.id || searchCode || "";

  const whatsappMessage = useMemo(() => {
    return encodeURIComponent(
      `Hi, I'm interested in this product:\n${title ? `Name: ${title}\n` : ""}${searchCode ? `Search Code: ${searchCode}\n` : ""}${productId ? `Product ID: ${productId}\n` : ""}Please advise on the price.`
    );
  }, [title, searchCode, productId]);

  const whatsappUrl = `https://wa.me/${WHATSAPP_NUMBER}?text=${whatsappMessage}`;

  const handleShare = useCallback(() => {
    if (navigator.share) {
      navigator.share({ title: title || "Product", url: window.location.href });
    } else {
      copyToClipboard(window.location.href, "Product link copied!");
    }
  }, [title, copyToClipboard]);

  return (
    <div className="min-h-screen bg-white relative">
      {/* Back button — absolutely positioned on the extreme left so it doesn't push down content */}
      <button
        onClick={goBack}
        className="absolute left-4 top-2 z-10 flex items-center justify-center w-8 h-8 rounded-full bg-white shadow text-gray-600 hover:text-gray-900 hover:shadow-md transition-all border border-gray-100 cursor-pointer"
        aria-label="Go back"
      >
        <BackIcon />
      </button>

      <div className="w-full max-w-180 bg-white rounded-2xl shadow-2xl p-6 sm:p-8 animate-in zoom-in-95 duration-200">
        {/* Seller info row */}
        <div className="flex items-center justify-between pb-4 mb-4 border-b border-gray-100">
          <div className="flex items-center gap-2.5">
            <div className="w-6 h-6 sm:w-7 sm:h-7 rounded-full bg-[#38c172]/10 flex items-center justify-center overflow-hidden shrink-0">
              <Image
                src="/images/hypeafnancircularlogopic.png"
                alt="HypeAfnan Logo"
                width={28}
                height={28}
                className="w-full h-full object-cover"
              />
            </div>
            <div>
              <p className="text-[14px] font-semibold text-gray-900 m-0 leading-tight">HypeAfnan</p>
              <p className="text-[11px] text-gray-400 m-0 leading-tight">Just now</p>
            </div>
          </div>

          <div className="flex items-center gap-3">
            {/* Share button */}
            <button
              onClick={handleShare}
              className="flex items-center gap-1.5 px-3 py-1.5 border border-gray-300 rounded-full text-[13px] text-gray-600 hover:bg-gray-50 transition-colors bg-transparent cursor-pointer"
            >
              <ShareIcon />
              <span>Share</span>
            </button>

            {/* Consulting Price / WhatsApp Button */}
            <a
              href={whatsappUrl}
              target="_blank"
              rel="noopener noreferrer"
              className="flex items-center gap-1.5 px-4 py-1.5 bg-[#25D366] text-white rounded-full text-[13px] font-medium hover:bg-[#20b858] transition-colors no-underline shadow-sm"
            >
              <WhatsAppIcon />
              <span>Consulting price</span>
            </a>
          </div>
        </div>

        {/* Images Gallery - horizontal scroll strip matching Szwego */}
        {images.length > 0 && (
          <div className="px-4">
            {/* Main large image */}
            <div className="relative w-full bg-gray-100 overflow-hidden mb-2" style={{ aspectRatio: "1 / 1" }}>
              {images[selectedImageIdx]?.includes('SimpleHeroSection') ? (
                <>
                  <Image
                    src="/images/Firstproductbg.jpeg"
                    alt="HypeAfnan Promo"
                    fill
                    priority
                    sizes="(max-width: 768px) 100vw, 720px"
                    className="object-cover"
                  />
                  <div className="absolute inset-0 bg-black/50" />
                  <div
                    className="absolute inset-0 flex flex-col items-center justify-center px-6 py-6 text-white z-10 text-center"
                    style={{ fontFamily: '"Arial Rounded MT Bold", "Arial Rounded MT", Arial, sans-serif' }}
                  >
                    <p className="text-3xl sm:text-4xl font-bold leading-none tracking-tight mb-4">HYPEAFNAN</p>
                    <div className="flex flex-col gap-3 items-center">
                      <div className="flex items-center gap-2">
                        <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="shrink-0">
                          <path d="M3 21l1.65-3.8a9 9 0 1 1 3.4 2.9L3 21" />
                        </svg>
                        <span className="text-base sm:text-lg">+923199775990</span>
                      </div>
                      <div className="flex items-center gap-2">
                        <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="shrink-0">
                          <rect width="20" height="16" x="2" y="4" rx="2"/><path d="m22 7-8.97 5.7a1.94 1.94 0 0 1-2.06 0L2 7"/>
                        </svg>
                        <span className="text-base sm:text-lg">Afnaninvain@gmail.com</span>
                      </div>
                      <div className="flex items-center gap-2">
                        <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="shrink-0">
                          <circle cx="12" cy="12" r="10"/><path d="M12 2a15.3 15.3 0 0 1 4 10 15.3 15.3 0 0 1-4 10 15.3 15.3 0 0 1-4-10 15.3 15.3 0 0 1 4-10z"/><path d="M2 12h20"/>
                        </svg>
                        <span className="text-base sm:text-lg">hypeafnan.vercel.app</span>
                      </div>
                    </div>
                  </div>
                </>
              ) : (
                <Image
                  src={images[selectedImageIdx]}
                  alt={title || "product"}
                  fill
                  priority
                  sizes="(max-width: 768px) 100vw, 720px"
                  className="object-cover"
                />
              )}
            </div>

            {/* Thumbnail strip */}
            {images.length > 1 && (
              <div className="flex gap-2 overflow-x-auto pb-1 scrollbar-hide">
                {images.map((img, idx) => (
                  <button
                    key={idx}
                    onClick={() => setSelectedImageIdx(idx)}
                    className={`relative w-18 h-18 rounded-lg overflow-hidden shrink-0 cursor-pointer border-2 transition-all p-0 bg-gray-50 ${
                      selectedImageIdx === idx ? "border-[#38c172] shadow-xs" : "border-transparent opacity-60 hover:opacity-100"
                    }`}
                  >
                    <Image
                      src={img}
                      alt={`View ${idx + 1}`}
                      fill
                      sizes="72px"
                      className="object-cover"
                    />
                  </button>
                ))}
              </div>
            )}
          </div>
        )}

        {/* Details Section - matching Szwego */}
        <div className="px-4 mt-4 pb-8">
          {/* Details link */}
          <button className="flex items-center gap-1.5 text-[#38c172] text-[14px] bg-transparent border-none cursor-pointer p-0 mb-4">
            <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
              <path d="M10 13a5 5 0 0 0 7.54.54l3-3a5 5 0 0 0-7.07-7.07l-1.72 1.71" />
              <path d="M14 11a5 5 0 0 0-7.54-.54l-3 3a5 5 0 0 0 7.07 7.07l1.71-1.71" />
            </svg>
            Details
          </button>

          {/* Category breadcrumb */}
          {product?.category && (
            <div className="flex items-center gap-2 text-[13px] text-gray-500 mb-3">
              <span>Top</span>
              <span>/</span>
              <span>{product.category}</span>
            </div>
          )}

          {/* Search Code */}
          {searchCode && (
            <div
              onClick={() => copyToClipboard(searchCode, "Search code copied!")}
              className="text-[13px] text-gray-600 cursor-pointer hover:text-gray-900 transition-colors"
              title="Click to copy search code"
            >
              <span className="font-medium">Search Code: </span>
              <span>{searchCode}</span>
            </div>
          )}

          {/* Title if present */}
          {title && (
            <p className="text-[15px] text-gray-800 mt-2">{title}</p>
          )}
        </div>

        {/* Footer */}
        <div className="px-4 py-6 border-t border-gray-100 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <div className="w-[24px] h-[24px] sm:w-[28px] sm:h-[28px] rounded-full overflow-hidden shrink-0">
              <Image
                src="/images/hypeafnancircularlogopic.png"
                alt="HypeAfnan Logo"
                width={28}
                height={28}
                className="w-full h-full object-cover"
              />
            </div>
            <span className="text-[15px] font-semibold text-gray-900">HypeAfnan</span>
          </div>
          <span className="text-[13px] text-gray-400">Contact Us : +923199775990</span>
        </div>
      </div>
    </div>
  );
}
