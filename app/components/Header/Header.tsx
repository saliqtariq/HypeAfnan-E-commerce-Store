"use client";

import Image from "next/image";
import Link from "next/link";
import { useTranslations, useLocale } from "next-intl";
import { useRouter, usePathname, useSearchParams } from "next/navigation";
import { useState, useRef, useEffect } from "react";
import { CategoryIcon, SearchIcon } from "../Icons";
import CategoryModal from "../CategoryModal";

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

export default function Header() {
  const t = useTranslations("header");
  const locale = useLocale();
  const router = useRouter();
  const pathname = usePathname();
  const searchParams = useSearchParams();

  const hasSearchQuery = !!searchParams.get("q");
  const isSearchPage = pathname.includes("/search") && hasSearchQuery;

  const [openLang, setOpenLang] = useState(false);
  const [isCategoryOpen, setIsCategoryOpen] = useState(false);
  const [searchQuery, setSearchQuery] = useState(searchParams.get("q") || searchParams.get("search") || "");
  const dropdownRef = useRef<HTMLDivElement>(null);
  const searchInputRef = useRef<HTMLInputElement>(null);

  const handleSelectCategory = (groupName: string, tagId?: number, tagName?: string) => {
    setIsCategoryOpen(false);
    if (groupName === "all") {
      router.push(`/${locale}`);
      return;
    }
    const params = new URLSearchParams();
    if (tagId) params.set("tagId", String(tagId));
    if (tagName) params.set("tagName", tagName);
    if (groupName) params.set("groupName", groupName);
    router.push(`/${locale}/search?${params.toString()}`);
  };

  // Close language dropdown when clicking outside
  useEffect(() => {
    function handleClick(e: MouseEvent) {
      if (dropdownRef.current && !dropdownRef.current.contains(e.target as Node)) {
        setOpenLang(false);
      }
    }
    document.addEventListener("mousedown", handleClick);
    return () => document.removeEventListener("mousedown", handleClick);
  }, []);

  function switchLanguage(code: string) {
    const segments = pathname.split("/");
    segments[1] = code;
    router.push(segments.join("/") + (searchParams.toString() ? `?${searchParams.toString()}` : ""));
    setOpenLang(false);
  }

  const handleSearchSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const query = searchQuery.trim();
    if (!query) return;
    router.push(`/${locale}/search?q=${encodeURIComponent(query)}`);
  };

  // If we are on the /search page, render the Szwego Search Header bar
  if (isSearchPage) {
    return (
      <header className="sticky top-0 z-[100] w-full bg-white border-b border-[#eaeaea]">
        <div className="w-full max-w-[1440px] mx-auto px-4 sm:px-[32px] py-4">
          <div className="flex items-center justify-between relative h-[50px] mb-4">
            {/* Close Button */}
            <button
              onClick={() => router.push(`/${locale}`)}
              className="flex items-center gap-1 text-[15px] text-gray-700 hover:text-gray-900 bg-transparent border-none cursor-pointer p-0 font-normal"
            >
              <span className="text-[18px] leading-none">✕</span>
              <span>Close</span>
            </button>

            {/* Center Brand */}
            <Link
              href={`/${locale}`}
              className="flex items-center gap-0 no-underline absolute left-1/2 -translate-x-1/2 whitespace-nowrap cursor-pointer"
            >
              <Image
                src="/mainhypeafnanlogo.png"
                alt="HypeAfnan Logo"
                width={44}
                height={44}
                className="w-[32px] h-[32px] sm:w-[44px] sm:h-[44px] object-contain block rounded-full"
                priority
              />
              <span className="text-[20px] sm:text-[24px] font-normal text-[#1f2937] tracking-[-0.5px] leading-none ml-1 font-sans">
                Hypeafnan
              </span>
            </Link>

            {/* Right: Globe Icon & Sign In Button */}
            <div className="flex items-center gap-3">
              <div className="relative" ref={dropdownRef}>
                <button
                  className="flex items-center justify-center bg-transparent border-none cursor-pointer transition-opacity duration-150 ease-in hover:opacity-70"
                  type="button"
                  onClick={() => setOpenLang((v) => !v)}
                >
                  <Image
                    src="/globeicon.png"
                    alt="Language"
                    width={36}
                    height={36}
                    className="w-9 h-9 object-contain"
                  />
                </button>

                {openLang && (
                  <div className="absolute right-0 top-full mt-2 w-[200px] bg-white border border-[#e5e7eb] rounded-xl shadow-lg overflow-hidden z-50">
                    <ul className="py-2 max-h-[360px] overflow-y-auto">
                      {LANGUAGES.map(({ code, label }) => (
                        <li key={code}>
                          <button
                            onClick={() => switchLanguage(code)}
                            className={`w-full text-left px-5 py-3 text-[15px] flex items-center justify-between transition-colors duration-100 cursor-pointer border-none bg-transparent ${locale === code
                                ? "text-[#38c172] font-medium"
                                : "text-[#1f2937] hover:bg-[#f9fafb]"
                              }`}
                          >
                            {label}
                            {locale === code && (
                              <svg width="16" height="16" viewBox="0 0 16 16" fill="none">
                                <path
                                  d="M2 8L6.5 12.5L14 4"
                                  stroke="#38c172"
                                  strokeWidth="2"
                                  strokeLinecap="round"
                                  strokeLinejoin="round"
                                />
                              </svg>
                            )}
                          </button>
                        </li>
                      ))}
                    </ul>
                  </div>
                )}
              </div>

              {/* Sign In Button matching Szwego reference */}
              <Link
                href={`/${locale}/signin`}
                className="inline-flex items-center justify-center h-[34px] px-4 bg-[#38c172] text-white text-[14px] font-medium border-none rounded-xl cursor-pointer no-underline leading-none whitespace-nowrap transition-colors duration-150 ease-in hover:bg-[#20b858] shadow-xs"
              >
                Sign In
              </Link>
            </div>
          </div>

          {/* Full-width Search Input */}
          <form onSubmit={handleSearchSubmit} className="w-full">
            <div className="relative flex items-center w-full">
              <input
                ref={searchInputRef}
                type="text"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                placeholder="Search"
                className="w-full pl-11 pr-4 py-3 bg-white border border-[#d1d5db] rounded-lg text-[15px] text-gray-800 placeholder-gray-400 outline-none focus:border-[#9ca3af] transition-all shadow-sm"
              />
              <div className="absolute left-3.5 text-gray-400">
                <SearchIcon />
              </div>
            </div>
          </form>
        </div>

        {/* Category Modal Drawer */}
        <CategoryModal
          isOpen={isCategoryOpen}
          onClose={() => setIsCategoryOpen(false)}
          locale={locale}
          onSelectCategory={handleSelectCategory}
        />
      </header>
    );
  }

  // Standard Store Header View
  return (
    <header className="sticky top-0 z-[100] w-full bg-white border-b border-[#eaeaea]">
      <nav className="flex items-center justify-between relative max-w-[1440px] mx-auto px-4 sm:px-[32px] h-[68px] sm:h-[80px]">
        {/* Left Section */}
        <div className="flex items-center gap-4 sm:gap-[40px] flex-1">
          <button
            onClick={() => setIsCategoryOpen(true)}
            className="flex items-center gap-[10px] bg-transparent border-none cursor-pointer py-[6px] text-[#2d3748] text-[15px] font-normal leading-none whitespace-nowrap transition-opacity duration-150 ease-in hover:opacity-70"
            type="button"
            id="category-btn"
          >
            <CategoryIcon />
            <span className="hidden sm:inline-block text-[15px] font-normal text-[#2d3748] tracking-[-0.1px]">
              {t("category")}
            </span>
          </button>

          <button
            onClick={() => router.push(`/${locale}/search`)}
            className="flex items-center gap-[10px] bg-transparent border-none cursor-pointer py-[6px] text-[#2d3748] text-[15px] font-normal leading-none whitespace-nowrap transition-opacity duration-150 ease-in hover:opacity-70"
            type="button"
            id="search-btn"
          >
            <SearchIcon />
            <span className="hidden sm:inline-block text-[15px] font-normal text-[#2d3748] tracking-[-0.1px]">
              {t("search")}
            </span>
          </button>
        </div>

        {/* Center Section - Logo & Brand */}
        <Link
          href={`/${locale}`}
          className="flex items-center gap-0 no-underline absolute left-1/2 -translate-x-1/2 whitespace-nowrap cursor-pointer"
          id="brand-link"
        >
          <Image
            src="/mainhypeafnanlogo.png"
            alt="HypeAfnan Logo"
            width={52}
            height={52}
            className="w-[32px] h-[32px] sm:w-[52px] sm:h-[52px] object-contain block rounded-full"
            priority
          />
          <span className="text-[20px] sm:text-[28px] font-normal text-[#1f2937] tracking-[-0.5px] leading-none -ml-[2px] -translate-y-[2px] font-sans">
            Hypeafnan
          </span>
        </Link>

        {/* Right Section */}
        <div className="flex items-center gap-3 flex-1 justify-end">
          <div className="relative" ref={dropdownRef}>
            <button
              className="flex items-center justify-center bg-transparent border-none cursor-pointer transition-opacity duration-150 ease-in hover:opacity-70"
              type="button"
              id="language-btn"
              aria-label={t("language")}
              onClick={() => setOpenLang((v) => !v)}
            >
              <Image
                src="/globeicon.png"
                alt="Language"
                width={44}
                height={44}
                className="w-11 h-11 object-contain"
              />
            </button>

            {openLang && (
              <div className="absolute right-0 top-full mt-2 w-[200px] bg-white border border-[#e5e7eb] rounded-xl shadow-lg overflow-hidden z-50">
                <ul className="py-2 max-h-[360px] overflow-y-auto">
                  {LANGUAGES.map(({ code, label }) => (
                    <li key={code}>
                      <button
                        onClick={() => switchLanguage(code)}
                        className={`w-full text-left px-5 py-3 text-[15px] flex items-center justify-between transition-colors duration-100 cursor-pointer border-none bg-transparent ${locale === code
                            ? "text-[#38c172] font-medium"
                            : "text-[#1f2937] hover:bg-[#f9fafb]"
                          }`}
                      >
                        {label}
                        {locale === code && (
                          <svg width="16" height="16" viewBox="0 0 16 16" fill="none">
                            <path
                              d="M2 8L6.5 12.5L14 4"
                              stroke="#38c172"
                              strokeWidth="2"
                              strokeLinecap="round"
                              strokeLinejoin="round"
                            />
                          </svg>
                        )}
                      </button>
                    </li>
                  ))}
                </ul>
              </div>
            )}
          </div>

          {/* Sign In Button */}
          <Link
            href={`/${locale}/signin`}
            className="inline-flex items-center justify-center h-[34px] px-4 bg-[#38c172] text-white text-[14px] font-medium border-none rounded-xl cursor-pointer no-underline leading-none whitespace-nowrap transition-colors duration-150 ease-in hover:bg-[#20b858]"
            id="signin-btn"
          >
            Sign In
          </Link>
        </div>
      </nav>

      {/* Category Modal Drawer */}
      <CategoryModal
        isOpen={isCategoryOpen}
        onClose={() => setIsCategoryOpen(false)}
        locale={locale}
        onSelectCategory={handleSelectCategory}
      />
    </header>
  );
}
