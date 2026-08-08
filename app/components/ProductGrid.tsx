"use client";

import React from "react";
import Link from "next/link";
import Image from "next/image";
import { useParams } from "next/navigation";

export interface Product {
  id?: string;
  goodsId?: string;
  title?: string;
  name?: string;
  coverImage?: string;
  imageUrl?: string;
  images?: string[];
  searchCode?: string;
  goodsCode?: string;
  category?: string;
  createdAt?: string;
}

interface ProductGridProps {
  products: Product[];
  viewMode?: "grid" | "list";
}

// Share icon matching Szwego's exact icon
function ShareIcon() {
  return (
    <svg
      width="15"
      height="15"
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="1.8"
      strokeLinecap="round"
      strokeLinejoin="round"
    >
      <circle cx="18" cy="5" r="3" />
      <circle cx="6" cy="12" r="3" />
      <circle cx="18" cy="19" r="3" />
      <line x1="8.59" y1="13.51" x2="15.42" y2="17.49" />
      <line x1="15.41" y1="6.51" x2="8.59" y2="10.49" />
    </svg>
  );
}

export default function ProductGrid({ products, viewMode = "grid" }: ProductGridProps) {
  const params = useParams();
  const locale = (params?.locale as string) || "en";

  if (!products || products.length === 0) {
    return (
      <div className="w-full flex flex-col items-center justify-center py-20 text-gray-400">
        <svg width="48" height="48" fill="none" stroke="currentColor" strokeWidth="1.5" viewBox="0 0 24 24">
          <path d="M3 3h18M3 3v18M21 3v18M3 21h18" />
        </svg>
        <p className="mt-4 text-[15px]">No products found</p>
      </div>
    );
  }

  return (
    <div className="w-full px-2 sm:px-4 pb-4">
      {/* Product Grid - matching Szwego's exact masonry/uniform grid */}
      <div
        className={
          viewMode === "grid"
            ? "grid grid-cols-3 sm:grid-cols-4 md:grid-cols-5 lg:grid-cols-6 gap-[2px] sm:gap-1"
            : "flex flex-col gap-2"
        }
      >
        {products.map((product) => {
          const productId = product.goodsId || product.id || product.searchCode || "";
          const coverImg =
            product.coverImage ||
            product.imageUrl ||
            (product.images && product.images[0]) ||
            "";
          const title = product.title || product.name || "";

          if (viewMode === "list") {
            return (
              <Link
                key={productId}
                href={`/${locale}/product/${productId}`}
                className="flex items-center gap-3 px-4 py-3 bg-white hover:bg-gray-50 transition-colors border-b border-gray-100"
              >
                <div className="relative w-[80px] h-[80px] shrink-0 overflow-hidden bg-gray-100 rounded">
                  {coverImg && (
                    <Image
                      src={coverImg}
                      alt={title || "product"}
                      fill
                      sizes="80px"
                      className="object-cover"
                      loading="lazy"
                      placeholder="blur"
                      blurDataURL="data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iNDAiIGhlaWdodD0iNDAiIHhtbG5zPSJodHRwOi8vd3d3LnczLm9yZy8yMDAwL3N2ZyI+PHJlY3Qgd2lkdGg9IjEwMCUiIGhlaWdodD0iMTAwJSIgZmlsbD0iI2YzZjRmNiIvPjwvc3ZnPg=="
                    />
                  )}
                </div>
                <div className="flex-1 min-w-0">
                  {title && <p className="text-[13px] text-gray-800 truncate">{title}</p>}
                  {(product.searchCode || product.goodsCode) && (
                    <p className="text-[11px] text-gray-400 mt-1">
                      Code: {product.searchCode || product.goodsCode}
                    </p>
                  )}
                </div>
                <ShareIcon />
              </Link>
            );
          }

          return (
            <Link
              key={productId}
              href={`/${locale}/product/${productId}`}
              className="group relative block overflow-hidden bg-gray-100 cursor-pointer"
              style={{ aspectRatio: "1 / 1" }}
            >
              {/* Product Image */}
              {coverImg ? (
                <Image
                  src={coverImg}
                  alt={title || "product"}
                  fill
                  sizes="(max-width: 640px) 33vw, (max-width: 768px) 25vw, (max-width: 1024px) 20vw, 16vw"
                  className={`${
                    coverImg.includes('SimpleHeroSection') ? 'object-contain bg-black' : 'object-cover'
                  } group-hover:scale-[1.03] transition-transform duration-300`}
                  loading="lazy"
                  placeholder="blur"
                  blurDataURL="data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iNDAiIGhlaWdodD0iNDAiIHhtbG5zPSJodHRwOi8vd3d3LnczLm9yZy8yMDAwL3N2ZyI+PHJlY3Qgd2lkdGg9IjEwMCUiIGhlaWdodD0iMTAwJSIgZmlsbD0iI2YzZjRmNiIvPjwvc3ZnPg=="
                />
              ) : (
                <div className="w-full h-full bg-gray-200 flex items-center justify-center">
                  <svg width="32" height="32" fill="none" stroke="#ccc" strokeWidth="1.5" viewBox="0 0 24 24">
                    <rect x="3" y="3" width="18" height="18" rx="2" />
                    <circle cx="8.5" cy="8.5" r="1.5" />
                    <polyline points="21 15 16 10 5 21" />
                  </svg>
                </div>
              )}

              {/* Share Icon - top right, matching Szwego */}
              <button
                onClick={(e) => {
                  e.preventDefault();
                  e.stopPropagation();
                  if (navigator.share) {
                    navigator.share({ title: title || "Product", url: window.location.href });
                  }
                }}
                className="absolute top-1.5 right-1.5 w-6 h-6 bg-white/80 rounded-full flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity text-gray-600 hover:text-gray-900 shadow-sm"
                aria-label="Share product"
              >
                <ShareIcon />
              </button>
            </Link>
          );
        })}
      </div>
    </div>
  );
}
