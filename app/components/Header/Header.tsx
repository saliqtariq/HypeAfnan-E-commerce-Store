"use client";

import Image from "next/image";
import Link from "next/link";
import { useTranslations, useLocale } from "next-intl";
import { useRouter, usePathname } from "next/navigation";
import { useState, useRef, useEffect } from "react";
import { CategoryIcon, SearchIcon } from "../Icons";

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
  const [open, setOpen] = useState(false);
  const dropdownRef = useRef<HTMLDivElement>(null);

  // Close dropdown when clicking outside
  useEffect(() => {
    function handleClick(e: MouseEvent) {
      if (dropdownRef.current && !dropdownRef.current.contains(e.target as Node)) {
        setOpen(false);
      }
    }
    document.addEventListener("mousedown", handleClick);
    return () => document.removeEventListener("mousedown", handleClick);
  }, []);

  function switchLanguage(code: string) {
    // Replace the current locale segment in the pathname
    const segments = pathname.split("/");
    segments[1] = code; // e.g. /en/products -> /fr/products
    router.push(segments.join("/"));
    setOpen(false);
  }

  return (
    <header className="sticky top-0 z-[100] w-full bg-white border-b border-[#eaeaea]">
      <nav className="flex items-center justify-between relative max-w-[1440px] mx-auto px-4 sm:px-[32px] h-[68px] sm:h-[80px]">
        {/* Left Section */}
        <div className="flex items-center gap-4 sm:gap-[40px] flex-1">
          <button
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
          className="flex items-center gap-0 no-underline absolute left-1/2 -translate-x-1/2 whitespace-nowrap"
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
        <div className="flex items-center gap-[8px] flex-1 justify-end">
          {/* Language Switcher */}
          <div className="relative" ref={dropdownRef}>
            <button
              className="flex items-center justify-center bg-transparent border-none cursor-pointer transition-opacity duration-150 ease-in hover:opacity-70"
              type="button"
              id="language-btn"
              aria-label={t("language")}
              onClick={() => setOpen((v) => !v)}
            >
              <Image
                src="/globeicon.png"
                alt="Language"
                width={44}
                height={44}
                className="w-11 h-11 object-contain"
              />
            </button>

            {/* Dropdown */}
            {open && (
              <div className="absolute right-0 top-full mt-2 w-[200px] bg-white border border-[#e5e7eb] rounded-xl shadow-lg overflow-hidden z-50">
                <ul className="py-2 max-h-[360px] overflow-y-auto">
                  {LANGUAGES.map(({ code, label }) => (
                    <li key={code}>
                      <button
                        onClick={() => switchLanguage(code)}
                        className={`w-full text-left px-5 py-3 text-[15px] flex items-center justify-between transition-colors duration-100 cursor-pointer border-none bg-transparent ${
                          locale === code
                            ? "text-[#38c172] font-medium"
                            : "text-[#1f2937] hover:bg-[#f9fafb]"
                        }`}
                      >
                        {label}
                        {locale === code && (
                          <svg
                            width="16"
                            height="16"
                            viewBox="0 0 16 16"
                            fill="none"
                          >
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

          <Link
            href={`/${locale}/signin`}
            className="inline-flex items-center justify-center h-[30px] sm:h-[34px] px-[12px] sm:px-[18px] bg-[#38c172] text-white text-[12px] sm:text-[14px] font-medium border-none rounded-lg cursor-pointer no-underline leading-none whitespace-nowrap transition-colors duration-150 ease-in hover:bg-[#2dce89] tracking-[-0.1px]"
            id="signin-btn"
          >
            {t("signin")}
          </Link>
        </div>
      </nav>
    </header>
  );
}
