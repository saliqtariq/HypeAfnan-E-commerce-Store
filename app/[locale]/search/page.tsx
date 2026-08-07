"use client";

import React, { useState, useEffect, useRef } from "react";
import Image from "next/image";
import Link from "next/link";
import { useRouter, useParams, useSearchParams } from "next/navigation";
import { useTranslations } from "next-intl";
import ProductGrid, { Product } from "../../components/ProductGrid";
import { SearchIcon } from "../../components/Icons";

const LANGUAGES = [
  { code: "en", label: "English" },
  { code: "zh", label: "简体中文" },
  { code: "fr", label: "Français" },
  { code: "it", label: "Italiano" },
  { code: "ja", label: "日本語" },
  { code: "es", label: "Español" },
  { code: "de", label: "Deutsch" },
  { code: "ar", label: "العربية" },
  { code: "ru", label: "русский" },
  { code: "pt", label: "português" },
];

export default function SearchPage() {
  const router = useRouter();
  const params = useParams();
  const searchParams = useSearchParams();
  const locale = (params?.locale as string) || "en";
  const initialQuery = searchParams.get("q") || "";

  const [query, setQuery] = useState(initialQuery);
  const [products, setProducts] = useState<Product[]>([]);
  const [loading, setLoading] = useState(false);
  const [searched, setSearched] = useState(false);
  const [openLang, setOpenLang] = useState(false);
  const dropdownRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    if (inputRef.current) {
      inputRef.current.focus();
    }
  }, []);

  useEffect(() => {
    function handleClickOutside(e: MouseEvent) {
      if (dropdownRef.current && !dropdownRef.current.contains(e.target as Node)) {
        setOpenLang(false);
      }
    }
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  const performSearch = async (searchTerm: string) => {
    const q = searchTerm.trim();
    if (!q) {
      setProducts([]);
      setSearched(false);
      return;
    }

    setLoading(true);
    setSearched(true);

    try {
      const res = await fetch(`/api/products?search=${encodeURIComponent(q)}&limit=60`);
      if (!res.ok) throw new Error("Search failed");
      const data = await res.json();

      // Check for exact match on search code
      const exactMatch = data.products?.find(
        (p: Product) =>
          p.searchCode === q || p.goodsCode === q || p.id === q || p.goodsId === q
      );

      if (exactMatch) {
        const targetId = exactMatch.goodsId || exactMatch.id || exactMatch.searchCode;
        router.push(`/${locale}/product/${targetId}`);
        return;
      }

      setProducts(data.products || []);
    } catch (e) {
      console.error("Search error:", e);
      setProducts([]);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (initialQuery) {
      performSearch(initialQuery);
    }
  }, [initialQuery]);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    router.replace(`/${locale}/search?q=${encodeURIComponent(query.trim())}`);
    performSearch(query);
  };

  function switchLanguage(code: string) {
    router.push(`/${code}/search${query ? `?q=${encodeURIComponent(query)}` : ""}`);
    setOpenLang(false);
  }

  return (
    <div className="min-h-screen bg-white">
      {/* Search Results Content */}
      <main className="max-w-[1440px] mx-auto py-6">
        {loading && (
          <div className="flex justify-center py-12">
            <div className="animate-spin h-6 w-6 border-2 border-[#38c172] border-t-transparent rounded-full" />
          </div>
        )}

        {!loading && searched && products.length === 0 && (
          <div className="text-center py-16 text-gray-400">
            <p className="text-[15px]">No products found for "{query}"</p>
          </div>
        )}

        {!loading && products.length > 0 && (
          <div>
            <p className="px-4 mb-4 text-[13px] text-gray-500">
              Found {products.length} product{products.length > 1 ? "s" : ""}
            </p>
            <ProductGrid products={products} viewMode="grid" />
          </div>
        )}
      </main>
    </div>
  );
}
