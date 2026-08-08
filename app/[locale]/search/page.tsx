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

        // Exact match redirect if search code provided
        if (initialQuery) {
          const exactMatch = data.products?.find(
            (p: Product) =>
              p.searchCode === initialQuery || p.goodsCode === initialQuery || p.id === initialQuery || p.goodsId === initialQuery
          );

          if (exactMatch) {
            const targetId = exactMatch.goodsId || exactMatch.id || exactMatch.searchCode;
            router.push(`/${locale}/product/${targetId}`);
            return;
          }
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
      <main className="max-w-[1440px] mx-auto py-6">
        {loading && (
          <div className="flex justify-center py-12">
            <div className="animate-spin h-6 w-6 border-2 border-[#38c172] border-t-transparent rounded-full" />
          </div>
        )}

        {!loading && searched && products.length === 0 && (
          <div className="text-center py-16 text-gray-400">
            <p className="text-[15px]">No products found for "{categoryTitle}"</p>
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
