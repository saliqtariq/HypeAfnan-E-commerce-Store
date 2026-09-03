"use client";

import React, { useState, useEffect, useRef, useCallback } from "react";
import { useRouter, useParams, useSearchParams } from "next/navigation";
import ProductGrid, { Product } from "../../components/ProductGrid";

const IOSSpinner = () => (
  <svg className="animate-spin w-5 h-5 text-[#a3a8b5]" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
    <path d="M12 2V6" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" opacity="1"/>
    <path d="M17.4 3.6L15.4 7.1" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" opacity="0.9"/>
    <path d="M21.4 8.6L17.9 10.6" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" opacity="0.8"/>
    <path d="M22 14H18" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" opacity="0.7"/>
    <path d="M21.4 19.4L17.9 17.4" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" opacity="0.6"/>
    <path d="M17.4 24.4L15.4 20.9" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" opacity="0.5"/>
    <path d="M12 26V22" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" opacity="0.4"/>
    <path d="M6.6 24.4L8.6 20.9" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" opacity="0.3"/>
    <path d="M2.6 19.4L6.1 17.4" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" opacity="0.2"/>
    <path d="M2 14H6" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" opacity="0.15"/>
    <path d="M2.6 8.6L6.1 10.6" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" opacity="0.1"/>
    <path d="M6.6 3.6L8.6 7.1" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" opacity="0.05"/>
  </svg>
);

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
  const [totalCount, setTotalCount] = useState(0);

  const [page, setPage] = useState(1);
  const [hasMore, setHasMore] = useState(false);
  const [loadingMore, setLoadingMore] = useState(false);

  useEffect(() => {
    // No query and no filters — just show empty prompt
    if (!initialQuery && !groupName && !tagId && !tagName) {
      setProducts([]);
      setSearched(false);
      setLoading(false);
      setHasMore(false);
      return;
    }

    async function loadCategoryProducts() {
      setLoading(true);
      setSearched(true);
      setPage(1);

      const displayTitle = tagName || groupName || initialQuery || "Products";
      setCategoryTitle(displayTitle);

      let isRedirecting = false;

      try {
        const urlParams = new URLSearchParams();
        if (initialQuery) urlParams.set("search", initialQuery);
        if (tagId) urlParams.set("tagId", tagId);
        if (tagName) urlParams.set("tagName", tagName);
        if (groupName) urlParams.set("groupName", groupName);
        urlParams.set("limit", "150"); // Loading 150 per page for better performance
        urlParams.set("page", "1");

        const res = await fetch(`/api/products?${urlParams.toString()}`);
        if (!res.ok) throw new Error("Search failed");
        const data = await res.json();

        setProducts(data.products || []);
        setTotalCount(data.total || data.products?.length || 0);
        setHasMore(data.hasMore || false);

        if (data.exactMatch && data.products?.length === 1) {
          const match = data.products[0];
          const targetId = match.goodsId || match.id || match.searchCode;
          isRedirecting = true;
          router.push(`/${locale}/product/${targetId}`);
          return;
        }
      } catch (e) {
        console.error("Fetch products error:", e);
        setProducts([]);
        setHasMore(false);
      } finally {
        if (!isRedirecting) {
          setLoading(false);
        }
      }
    }

    loadCategoryProducts();
  }, [initialQuery, groupName, tagId, tagName, locale, router]);

  const observer = useRef<IntersectionObserver | null>(null);
  const lastProductElementRef = useCallback((node: HTMLDivElement) => {
    if (loadingMore) return;
    if (observer.current) observer.current.disconnect();
    
    observer.current = new IntersectionObserver(entries => {
      if (entries[0].isIntersecting && hasMore) {
        loadMore();
      }
    }, { rootMargin: '400px' }); // Load a bit before they hit the absolute bottom
    
    if (node) observer.current.observe(node);
  }, [loadingMore, hasMore, page]); // page dependency ensures we have the latest loadMore closure or we can use ref for page

  const loadMore = async () => {
    if (loadingMore || !hasMore) return;
    setLoadingMore(true);
    
    try {
      const nextPage = page + 1;
      const urlParams = new URLSearchParams();
      if (initialQuery) urlParams.set("search", initialQuery);
      if (tagId) urlParams.set("tagId", tagId);
      if (tagName) urlParams.set("tagName", tagName);
      if (groupName) urlParams.set("groupName", groupName);
      urlParams.set("limit", "150");
      urlParams.set("page", nextPage.toString());

      const res = await fetch(`/api/products?${urlParams.toString()}`);
      if (!res.ok) throw new Error("Load more failed");
      const data = await res.json();

      setProducts(prev => [...prev, ...(data.products || [])]);
      setHasMore(data.hasMore || false);
      setPage(nextPage);
    } catch (e) {
      console.error("Load more error:", e);
    } finally {
      setLoadingMore(false);
    }
  };

  return (
    <div className="min-h-screen bg-white">
      <main className="max-w-360 mx-auto py-6">
        {loading && (
          <div className="flex flex-col items-center justify-center py-20 gap-3">
            <IOSSpinner />
            <p className="text-[15px] text-[#a3a8b5]">Loading...</p>
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
          <div className="pb-12">
            <div className="px-4 mb-4 flex items-center justify-between">
              <h1 className="text-[18px] font-bold text-gray-900 capitalize m-0">{categoryTitle}</h1>
              <p className="text-[13px] text-gray-500 m-0">
                Found {totalCount.toLocaleString()} product{totalCount !== 1 ? "s" : ""}
              </p>
            </div>
            <ProductGrid products={products} viewMode="grid" />
            
            {hasMore && (
              <div ref={lastProductElementRef} className="mt-12 flex justify-center py-6">
                <div className="flex items-center gap-3 text-[#a3a8b5]">
                  <IOSSpinner />
                  <span className="text-[15px]">Loading...</span>
                </div>
              </div>
            )}
          </div>
        )}
      </main>
    </div>
  );
}
