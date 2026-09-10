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

// Unique sessionStorage key for a given search state
function getScrollKey(searchKey: string) {
  return `scroll_snap__${searchKey}`;
}

export default function SearchPage() {
  const router = useRouter();
  const params = useParams();
  const searchParams = useSearchParams();
  const locale = (params?.locale as string) || "en";

  const initialQuery = searchParams.get("q") || "";
  const groupName = searchParams.get("groupName") || "";
  const tagId = searchParams.get("tagId") || "";
  const tagName = searchParams.get("tagName") || "";

  // Stable key that uniquely identifies this search/category view
  const searchKey = `${initialQuery}||${groupName}||${tagId}||${tagName}`;

  const [products, setProducts] = useState<Product[]>([]);
  const [loading, setLoading] = useState(false);
  const [searched, setSearched] = useState(false);
  const [categoryTitle, setCategoryTitle] = useState("");
  const [totalCount, setTotalCount] = useState(0);

  const [page, setPage] = useState(1);
  const [hasMore, setHasMore] = useState(false);
  const [loadingMore, setLoadingMore] = useState(false);
  // True while we are waiting to scroll to the restored position — hides content to prevent flash
  const [isScrollRestoring, setIsScrollRestoring] = useState(false);

  // Whether we restored from session (skip fresh fetch)
  const restoredFromSession = useRef(false);
  // Track scroll position continuously via scroll listener
  const scrollPositionRef = useRef(0);
  // Target scroll Y to restore after products render
  const pendingScrollY = useRef<number | null>(null);

  // --- Take control of scroll restoration from browser & Next.js ---
  useEffect(() => {
    // Prevent browser from auto-restoring scroll position on back/forward —
    // we handle it manually so it doesn't race with our product rendering.
    if (typeof window !== "undefined") {
      history.scrollRestoration = "manual";
    }
    const onScroll = () => {
      scrollPositionRef.current = window.scrollY;
    };
    window.addEventListener("scroll", onScroll, { passive: true });
    return () => {
      window.removeEventListener("scroll", onScroll);
      // Restore default when leaving the page
      if (typeof window !== "undefined") {
        history.scrollRestoration = "auto";
      }
    };
  }, []);

  // --- On mount: check if we have a saved snapshot for this search key ---
  useEffect(() => {
    if (!searchKey || searchKey === "||||") return;

    try {
      const raw = sessionStorage.getItem(getScrollKey(searchKey));
      if (raw) {
        const snap = JSON.parse(raw);
        if (snap && snap.products && snap.products.length > 0) {
          // Restore state — no re-fetch needed
          setProducts(snap.products);
          setPage(snap.page || 1);
          setHasMore(snap.hasMore || false);
          setTotalCount(snap.totalCount || snap.products.length);
          setCategoryTitle(snap.categoryTitle || "");
          setSearched(true);
          setLoading(false);
          restoredFromSession.current = true;
          pendingScrollY.current = snap.scrollY || 0;
          setIsScrollRestoring(true); // Hide grid until scroll lands

          // Clear snapshot — next fresh visit re-fetches normally
          sessionStorage.removeItem(getScrollKey(searchKey));
        }
      }
    } catch {
      // sessionStorage unavailable — no-op
    }
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []); // Intentionally only on mount

  // --- Retry scroll until page is tall enough to reach target position ---
  useEffect(() => {
    if (pendingScrollY.current === null || products.length === 0) return;
    const targetY = pendingScrollY.current;
    let attempts = 0;
    const maxAttempts = 60; // ~2 seconds at 60fps

    const tryScroll = () => {
      attempts++;
      // Only scroll once the document is at least as tall as the target
      if (document.documentElement.scrollHeight >= targetY + window.innerHeight) {
        window.scrollTo({ top: targetY, behavior: "instant" });
        pendingScrollY.current = null;
        setIsScrollRestoring(false); // Reveal grid now that we're in position
        return;
      }
      if (attempts < maxAttempts) {
        requestAnimationFrame(tryScroll);
      } else {
        // Give up gracefully — scroll as far as possible
        window.scrollTo({ top: targetY, behavior: "instant" });
        pendingScrollY.current = null;
        setIsScrollRestoring(false);
      }
    };

    requestAnimationFrame(tryScroll);
  }, [products.length]); // Re-runs whenever products array grows

  // --- Fresh fetch (skip when restoring from session) ---
  useEffect(() => {
    if (restoredFromSession.current) {
      restoredFromSession.current = false;
      return;
    }

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
        urlParams.set("limit", "150");
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

  // --- Called by ProductGrid right before navigating to a product ---
  const saveScrollSnapshot = useCallback(() => {
    try {
      const snap = {
        products,
        page,
        hasMore,
        totalCount,
        categoryTitle,
        scrollY: scrollPositionRef.current,
      };
      sessionStorage.setItem(getScrollKey(searchKey), JSON.stringify(snap));
    } catch {
      // sessionStorage full or unavailable — ignore
    }
  }, [products, page, hasMore, totalCount, categoryTitle, searchKey]);

  const observer = useRef<IntersectionObserver | null>(null);
  const lastProductElementRef = useCallback((node: HTMLDivElement) => {
    if (loadingMore) return;
    if (observer.current) observer.current.disconnect();
    
    observer.current = new IntersectionObserver(entries => {
      if (entries[0].isIntersecting && hasMore) {
        loadMore();
      }
    }, { rootMargin: '400px' });
    
    if (node) observer.current.observe(node);
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [loadingMore, hasMore, page]);

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
      <main className="max-w-360 mx-auto py-6" style={{ visibility: isScrollRestoring ? 'hidden' : 'visible' }}>
        {loading && (
          <div className="flex flex-col items-center justify-center py-20 gap-3">
            <IOSSpinner />
            <p className="text-[15px] text-[#a3a8b5]">Loading...</p>
          </div>
        )}

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
            <ProductGrid products={products} viewMode="grid" onProductClick={saveScrollSnapshot} />
            
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
