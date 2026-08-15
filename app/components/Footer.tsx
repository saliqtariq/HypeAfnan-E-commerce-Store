import React from "react";
import Image from "next/image";
import Link from "next/link";
import { useLocale } from "next-intl";

export default function Footer() {
  const locale = useLocale();

  return (
    <footer className="w-full bg-white border-t border-gray-100 py-6 px-4 md:px-8">
      <div className="max-w-[1400px] mx-auto flex flex-col md:flex-row items-center justify-between gap-4">
        
        {/* Left Side - Logo and Name */}
        <div className="flex items-center gap-3">
          <Image
            src="/images/hypeafnancircularlogopic.png"
            alt="HypeAfnan Logo"
            width={32}
            height={32}
            className="w-8 h-8 rounded-full object-cover shadow-sm"
          />
          <span className="text-gray-900 font-bold text-lg">HypeAfnan</span>
        </div>

        {/* Right Side - Links and Contact */}
        <div className="flex flex-col md:flex-row items-center gap-4 md:gap-8 text-sm text-gray-500 font-medium">
          <div className="flex items-center gap-6">
            <Link href={`/${locale}/privacy-policy`} className="hover:text-[#38c172] transition-colors">
              Privacy Policy
            </Link>
            <Link href={`/${locale}/terms-of-service`} className="hover:text-[#38c172] transition-colors">
              Terms of Service
            </Link>
            <Link href={`/${locale}/linkbio`} className="hover:text-[#38c172] transition-colors">
              Linkbio
            </Link>
          </div>
          <div className="hidden md:block w-px h-4 bg-gray-300"></div>
          <a href="tel:+923199775990" className="hover:text-[#38c172] transition-colors">
            Contact Us: +923199775990
          </a>
        </div>

      </div>
    </footer>
  );
}
