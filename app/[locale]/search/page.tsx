"use client";

import React, { useState, useEffect } from "react";
import { useRouter, useParams, useSearchParams } from "next/navigation";
import ProductGrid, { Product } from "../../components/ProductGrid";

export default function SearchPage() {
  const router = useRouter();
  const params = useParams();
  const searchParams = useSearchParams();
  const locale = (params?.locale as string) || "en";

  const initialQuery = searchParams.get("q") || "";
  const groupName = searchParams.get("groupName") || "";
  const tagId = searchParams.get("tagId") || "";
  const tagName = searchParams.get("tagName") || "";

  const [products, setProducts] = useState<Product[]>([]);
  const [loading, setLoading] = useState(false);
  const [searched, setSearched] = useState(false);
  const [categoryTitle, setCategoryTitle] = useState("");

  useEffect(() => {
    // No query and no filters — just show empty prompt
    if (!initialQuery && !groupName && !tagId && !tagName) {
      setProducts([]);
      setSearched(false);
      setLoading(false);
      return;
    }

    async function loadCategoryProducts() {
      setLoading(true);
      setSearched(true);

      const displayTitle = tagName || groupName || initialQuery || "Products";
      setCategoryTitle(displayTitle);

      try {
        const urlParams = new URLSearchParams();
        if (initialQuery) urlParams.set("search", initialQuery);
        if (tagId) urlParams.set("tagId", tagId);
        if (tagName) urlParams.set("tagName", tagName);
        if (groupName) urlParams.set("groupName", groupName);
        urlParams.set("limit", "300");

        const res = await fetch(`/api/products?${urlParams.toString()}`);
        if (!res.ok) throw new Error("Search failed");
        const data = await res.json();

        // If API found an exact code match, go straight to product detail only when it's unique
        if (data.exactMatch) {
          if (data.products?.length === 1) {
            const match = data.products[0];
            const targetId = match.goodsId || match.id || match.searchCode;
            router.push(`/${locale}/product/${targetId}`);
            return;
          }
          // Multiple products share this code — fall through to show grid
        }

        setProducts(data.products || []);
      } catch (e) {
        console.error("Fetch products error:", e);
        setProducts([]);
      } finally {
        setLoading(false);
      }
    }

    loadCategoryProducts();
  }, [initialQuery, groupName, tagId, tagName, locale, router]);

  return (
    <div className="min-h-screen bg-white">
      <main className="max-w-360 mx-auto py-6">
        {loading && (
          <div className="flex flex-col items-center justify-center py-20 gap-3">
            <div className="animate-spin h-6 w-6 border-2 border-[#38c172] border-t-transparent rounded-full" />
            <p className="text-[14px] text-gray-400">Searching...</p>
          </div>
        )}

        {/* No query yet — prompt the user */}
        {!loading && !searched && (
          <div className="flex flex-col items-center justify-center py-20 gap-2 text-center px-4">
            <svg width="48" height="48" viewBox="0 0 24 24" fill="none" stroke="#d1d5db" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
              <circle cx="11" cy="11" r="8" /><path d="m21 21-4.35-4.35" />
            </svg>
            <p className="text-[16px] font-medium text-gray-500 mt-2">Search products</p>
            <p className="text-[13px] text-gray-400">Type a product name or its search code (e.g. <span className="font-mono bg-gray-100 px-1.5 py-0.5 rounded text-gray-600">216377</span>)</p>
          </div>
        )}

        {!loading && searched && products.length === 0 && (
          <div className="text-center py-16 text-gray-400">
            <p className="text-[15px]">No products found for &ldquo;{categoryTitle}&rdquo;</p>
            <p className="text-[13px] mt-1">Try a different keyword or product code</p>
          </div>
        )}

        {!loading && products.length > 0 && (
          <div>
            <div className="px-4 mb-4 flex items-center justify-between">
              <h1 className="text-[18px] font-bold text-gray-900 capitalize m-0">{categoryTitle}</h1>
              <p className="text-[13px] text-gray-500 m-0">
                Found {products.length} product{products.length > 1 ? "s" : ""}
              </p>
            </div>
            <ProductGrid products={products} viewMode="grid" />
          </div>
        )}
      </main>
    </div>
  );
}
