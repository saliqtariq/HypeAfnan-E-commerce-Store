"use client";

import React, { useState } from "react";
import Image from "next/image";
import { Poppins } from "next/font/google";

const poppins = Poppins({
  weight: ["400"],
  subsets: ["latin"],
});

const LINKBIO_URL = "https://www.hypeafnan.com/en/linkbio";

export default function LinkBioPage() {
  const [shareOpen, setShareOpen] = useState(false);
  const [copied, setCopied] = useState(false);

  const handleCopy = async () => {
    try {
      await navigator.clipboard.writeText(LINKBIO_URL);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    } catch {
      const el = document.createElement("input");
      el.value = LINKBIO_URL;
      document.body.appendChild(el);
      el.select();
      document.execCommand("copy");
      document.body.removeChild(el);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    }
  };

  const shareOptions = [
    {
      label: "WhatsApp",
      color: "#25D366",
      url: `https://wa.me/?text=${encodeURIComponent(LINKBIO_URL)}`,
      icon: (
        <svg viewBox="0 0 24 24" fill="currentColor" className="w-7 h-7">
          <path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347m-5.421 7.403h-.004a9.87 9.87 0 01-5.031-1.378l-.361-.214-3.741.982.998-3.648-.235-.374a9.86 9.86 0 01-1.51-5.26c.001-5.45 4.436-9.884 9.888-9.884 2.64 0 5.122 1.03 6.988 2.898a9.825 9.825 0 012.893 6.994c-.003 5.45-4.437 9.884-9.885 9.884m8.413-18.297A11.815 11.815 0 0012.05 0C5.495 0 .16 5.335.157 11.892c0 2.096.547 4.142 1.588 5.945L.057 24l6.305-1.654a11.882 11.882 0 005.683 1.448h.005c6.554 0 11.89-5.335 11.893-11.893a11.821 11.821 0 00-3.48-8.413z" />
        </svg>
      ),
    },
    {
      label: "Facebook",
      color: "#1877F2",
      url: `https://www.facebook.com/sharer/sharer.php?u=${encodeURIComponent(LINKBIO_URL)}`,
      icon: (
        <svg viewBox="0 0 24 24" fill="currentColor" className="w-7 h-7">
          <path d="M24 12.073c0-6.627-5.373-12-12-12s-12 5.373-12 12c0 5.99 4.388 10.954 10.125 11.854v-8.385H7.078v-3.47h3.047V9.43c0-3.007 1.792-4.669 4.533-4.669 1.312 0 2.686.235 2.686.235v2.953H15.83c-1.491 0-1.956.925-1.956 1.874v2.25h3.328l-.532 3.47h-2.796v8.385C19.612 23.027 24 18.062 24 12.073z" />
        </svg>
      ),
    },
    {
      label: "Twitter / X",
      color: "#000000",
      url: `https://twitter.com/intent/tweet?url=${encodeURIComponent(LINKBIO_URL)}&text=${encodeURIComponent("Check out HypeAfnan!")}`,
      icon: (
        <svg viewBox="0 0 24 24" fill="currentColor" className="w-7 h-7">
          <path d="M18.244 2.25h3.308l-7.227 8.26 8.502 11.24H16.17l-4.714-6.231-5.401 6.231H2.747l7.73-8.835L1.254 2.25H8.08l4.259 5.632zm-1.161 17.52h1.833L7.084 4.126H5.117z" />
        </svg>
      ),
    },
    {
      label: "Telegram",
      color: "#26A5E4",
      url: `https://t.me/share/url?url=${encodeURIComponent(LINKBIO_URL)}&text=${encodeURIComponent("Check out HypeAfnan!")}`,
      icon: (
        <svg viewBox="0 0 24 24" fill="currentColor" className="w-7 h-7">
          <path d="M11.944 0A12 12 0 0 0 0 12a12 12 0 0 0 12 12 12 12 0 0 0 12-12A12 12 0 0 0 12 0a12 12 0 0 0-.056 0zm4.962 7.224c.1-.002.321.023.465.14a.506.506 0 0 1 .171.325c.016.093.036.306.02.472-.18 1.898-.962 6.502-1.36 8.627-.168.9-.499 1.201-.82 1.23-.696.065-1.225-.46-1.9-.902-1.056-.693-1.653-1.124-2.678-1.8-1.185-.78-.417-1.21.258-1.91.177-.184 3.247-2.977 3.307-3.23.007-.032.014-.15-.056-.212s-.174-.041-.249-.024c-.106.024-1.793 1.14-5.061 3.345-.48.33-.913.49-1.302.48-.428-.008-1.252-.241-1.865-.44-.752-.245-1.349-.374-1.297-.789.027-.216.325-.437.893-.663 3.498-1.524 5.83-2.529 6.998-3.014 3.332-1.386 4.025-1.627 4.476-1.635z" />
        </svg>
      ),
    },
    {
      label: "Instagram",
      color: "#E1306C",
      url: `https://instagram.com`,
      icon: (
        <svg viewBox="0 0 24 24" fill="currentColor" className="w-7 h-7">
          <path d="M12 2.163c3.204 0 3.584.012 4.85.07 3.252.148 4.771 1.691 4.919 4.919.058 1.265.069 1.645.069 4.849 0 3.205-.012 3.584-.069 4.849-.149 3.225-1.664 4.771-4.919 4.919-1.266.058-1.644.07-4.85.07-3.204 0-3.584-.012-4.849-.07-3.26-.149-4.771-1.699-4.919-4.92-.058-1.265-.07-1.644-.07-4.849 0-3.204.013-3.583.07-4.849.149-3.227 1.664-4.771 4.919-4.919 1.266-.057 1.645-.069 4.849-.069zm0-2.163c-3.259 0-3.667.014-4.947.072-4.358.2-6.78 2.618-6.98 6.98-.059 1.281-.073 1.689-.073 4.948 0 3.259.014 3.668.072 4.948.2 4.358 2.618 6.78 6.98 6.98 1.281.058 1.689.072 4.948.072 3.259 0 3.668-.014 4.948-.072 4.354-.2 6.782-2.618 6.979-6.98.059-1.28.073-1.689.073-4.948 0-3.259-.014-3.667-.072-4.947-.196-4.354-2.617-6.78-6.979-6.98-1.281-.059-1.69-.073-4.949-.073zm0 5.838c-3.403 0-6.162 2.759-6.162 6.162s2.759 6.163 6.162 6.163 6.162-2.759 6.162-6.163c0-3.403-2.759-6.162-6.162-6.162zm0 10.162c-2.209 0-4-1.79-4-4 0-2.209 1.791-4 4-4s4 1.791 4 4c0 2.21-1.791 4-4 4zm6.406-11.845c-.796 0-1.441.645-1.441 1.44s.645 1.44 1.441 1.44c.795 0 1.439-.645 1.439-1.44s-.644-1.44-1.439-1.44z" />
        </svg>
      ),
    },
    {
      label: "Email",
      color: "#ef4444",
      url: `mailto:?subject=${encodeURIComponent("Check out HypeAfnan!")}&body=${encodeURIComponent(LINKBIO_URL)}`,
      icon: (
        <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="w-7 h-7">
          <rect x="2" y="4" width="20" height="16" rx="2" />
          <path d="m22 7-8.97 5.7a1.94 1.94 0 0 1-2.06 0L2 7" />
        </svg>
      ),
    },
  ];

  const links = [
    {
      id: 1,
      title: "www.hypeafnan.com",
      icon: (
        <svg viewBox="0 0 24 24" fill="none" stroke="#ef4444" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="w-full h-full scale-[0.9]">
          <circle cx="12" cy="12" r="10" />
          <line x1="2" y1="12" x2="22" y2="12" />
          <path d="M12 2a15.3 15.3 0 0 1 4 10 15.3 15.3 0 0 1-4 10 15.3 15.3 0 0 1-4-10 15.3 15.3 0 0 1 4-10z" />
        </svg>
      ),
      url: "https://www.hypeafnan.com/",
    },
    {
      id: 2,
      title: "WhatsApp",
      icon: (
        <Image src="/images/WhatsappNewlogo.png" alt="WhatsApp" width={48} height={48} className="w-full h-full object-contain scale-[2.5]" />
      ),
      url: "https://wa.me/923199775990",
    },
    {
      id: 3,
      title: "Afnanimran61@gmail.com",
      icon: (
        <Image src="/images/GmailLogo.png" alt="Email" width={64} height={64} className="w-full h-full object-contain scale-[1.6]" />
      ),
      url: "mailto:Afnanimran61@gmail.com",
    },
    {
      id: 4,
      title: "Instagram",
      icon: (
        <Image src="/images/InstagramlogoNew.png" alt="Instagram" width={48} height={48} className="w-full h-full object-contain scale-[2.5]" />
      ),
      url: "https://instagram.com/hypeafnan",
    },
  ];

  // ✏️ EDIT YOUR SUBTEXT LINES HERE — each string = one line on screen
  const subtextLines = [
    "Global Shipping. Please contact customer service staff via.",
    "WhatsApp to place an order. The highest quality in the Global",
    "market. Our store has been operating worldwide for",
    "many years. There is sufficient price advantage and high quality ",
    "control. Special channel: Over 200 countries are exempt",
    "from tariffs. The customs clearance rate is higher than 98%. if the",
    "package is detained by customs, a new package can be resent free",
    "of delivery charge. There are a large number of inquiries every day. if there",
    "is no response for a long time, please send frequent messages or",
    "call customer service staff via voice call.",
  ];

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-300 to-slate-500 font-sans pb-20">

      {/* Share Modal */}
      {shareOpen && (
        <>
          {/* Modal Container */}
          <div
            className="fixed inset-0 z-50 flex items-end sm:items-center justify-center bg-black/50 backdrop-blur-sm sm:p-4"
            onClick={() => setShareOpen(false)}
          >
            <div
              onClick={(e) => e.stopPropagation()}
              className="bg-white w-full sm:max-w-[380px] rounded-t-[20px] sm:rounded-[20px] shadow-2xl flex flex-col"
              style={{
                maxHeight: "90vh",
                animation: "slideUpModal 0.3s cubic-bezier(0.16, 1, 0.3, 1) forwards",
              }}
            >
              {/* Scrollable inner content */}
              <div className="overflow-y-auto w-full pb-safe">
                {/* Header */}
                <div className="flex items-center justify-between px-5 pt-5 pb-3">
                  <h2 className="text-[17px] font-bold text-gray-800">Share this page</h2>
                  <button
                    onClick={() => setShareOpen(false)}
                    className="w-8 h-8 rounded-full bg-gray-100 flex items-center justify-center hover:bg-gray-200 transition-colors border-none cursor-pointer"
                  >
                    <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="#374151" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
                      <line x1="18" y1="6" x2="6" y2="18" />
                      <line x1="6" y1="6" x2="18" y2="18" />
                    </svg>
                  </button>
                </div>

                {/* URL bar */}
                <div className="mx-5 mb-4 flex items-center gap-3 bg-gray-50 border border-gray-200 rounded-xl px-3 py-2.5">
                  <div className="w-8 h-8 rounded-full bg-[#ef4444] flex items-center justify-center shrink-0">
                    <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="white" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
                      <path d="M10 13a5 5 0 0 0 7.54.54l3-3a5 5 0 0 0-7.07-7.07l-1.72 1.71" />
                      <path d="M14 11a5 5 0 0 0-7.54-.54l-3 3a5 5 0 0 0 7.07 7.07l1.71-1.71" />
                    </svg>
                  </div>
                  <span className="text-[13px] text-gray-500 flex-1 truncate">{LINKBIO_URL}</span>
                  <button
                    onClick={handleCopy}
                    className="text-[13px] font-semibold text-[#ef4444] shrink-0 hover:opacity-70 transition-opacity border-none bg-transparent cursor-pointer"
                  >
                    {copied ? "✓ Copied!" : "Copy"}
                  </button>
                </div>

                {/* Share options grid */}
                <div className="px-5 pb-6">
                  <p className="text-[12px] text-gray-400 uppercase tracking-wider font-semibold mb-3">Share via</p>
                  <div className="grid grid-cols-3 gap-3">
                    {shareOptions.map((opt) => (
                      <a
                        key={opt.label}
                        href={opt.url}
                        target="_blank"
                        rel="noreferrer"
                        className="flex flex-col items-center gap-2 p-3 rounded-xl hover:bg-gray-50 transition-colors group"
                      >
                        <div
                          className="w-12 h-12 rounded-full flex items-center justify-center text-white shadow-sm group-hover:scale-110 transition-transform"
                          style={{ backgroundColor: opt.color }}
                        >
                          {opt.icon}
                        </div>
                        <span className="text-[11px] text-gray-600 font-medium text-center leading-tight">{opt.label}</span>
                      </a>
                    ))}
                  </div>
                </div>
              </div>
            </div>
          </div>
        </>
      )}

      <style>{`
        @keyframes slideUpModal {
          from { opacity: 0; transform: translateY(100%); }
          to   { opacity: 1; transform: translateY(0); }
        }
      `}</style>

      <main className="relative w-full max-w-[520px] mx-auto px-6 pt-20 flex flex-col items-center text-white text-center">
        {/* Top action button (Share) */}
        <div className="absolute top-4 right-1 sm:-right-2">
          <button
            onClick={() => setShareOpen(true)}
            className="w-10 h-10 bg-white/90 rounded-full flex items-center justify-center shadow-md hover:bg-white transition-colors cursor-pointer border-none"
          >
            <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="#4b5563" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
              <path d="M18 13v6a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2V8a2 2 0 0 1 2-2h6"></path>
              <polyline points="15 3 21 3 21 9"></polyline>
              <line x1="10" y1="14" x2="21" y2="3"></line>
            </svg>
          </button>
        </div>

        {/* Avatar */}
        <div className="relative mb-2">
          <div className="w-28 h-28 rounded-full border-2 border-white overflow-hidden shadow-lg">
            <div className="w-full h-full bg-black rounded-full flex items-center justify-center overflow-hidden">
              <Image
                src="/images/hypeafnancircularlogopic.png"
                alt="HypeAfnan Logo"
                width={112}
                height={112}
                className="object-cover w-full h-full"
              />
            </div>
          </div>
          {/* Verified Checkmark */}
          <div className="absolute bottom-1 right-1 bg-[#3b82f6] text-white rounded-full border-2 border-[#87939F] w-7 h-7 flex items-center justify-center">
            <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="4" strokeLinecap="round" strokeLinejoin="round">
              <polyline points="20 6 9 17 4 12" />
            </svg>
          </div>
        </div>

        {/* Title */}
        <h1 className="text-[22px] font-bold mb-1 tracking-normal">HypeAfnan</h1>

        {/* Description — edit subtextLines array above to change text/line breaks */}
        <p className={`${poppins.className} text-[15px] leading-[1.6] mb-8 text-[#F5F6F7] font-normal px-4 opacity-100 block max-w-xl text-center`}>
          {subtextLines.join(" ")}
        </p>

        {/* Mini Social Icons */}
        <div className="flex items-center gap-5 mb-8">
          <a href="https://facebook.com/hypeafnan" target="_blank" rel="noreferrer" className="w-12 h-12 rounded-full overflow-hidden hover:opacity-80 transition-opacity">
            <Image src="/images/FacebookLogo.png" alt="Facebook" width={48} height={48} className="object-cover w-full h-full" />
          </a>
          <a href="https://wa.me/923199775990" target="_blank" rel="noreferrer" className="w-12 h-12 rounded-full overflow-hidden hover:opacity-80 transition-opacity">
            <Image src="/images/WhatsappLogo.png" alt="WhatsApp" width={48} height={48} className="object-cover w-full h-full" />
          </a>
          <a href="https://instagram.com/hypeafnan" target="_blank" rel="noreferrer" className="w-12 h-12 rounded-full overflow-hidden hover:opacity-80 transition-opacity">
            <Image src="/images/InstagramLogo.png" alt="Instagram" width={48} height={48} className="object-cover w-full h-full" />
          </a>
        </div>

        {/* Links List */}
        <div className="w-full max-w-[520px] flex flex-col gap-6">
          {links.map((link) => (
            <a
              key={link.id}
              href={link.url}
              target={link.url.startsWith("http") || link.url.startsWith("mailto") ? "_blank" : "_self"}
              rel="noreferrer"
              className="relative w-full bg-white text-[#ef4444] font-bold text-[17px] py-3 px-4 rounded-xl flex items-center justify-between border-2 border-[#ef4444] transition-transform hover:-translate-y-1 active:translate-y-0"
              style={{ boxShadow: "0px 6px 0px #ef4444" }}
            >
              <div className="w-12 h-12 max-h-12 max-w-12 flex items-center justify-center shrink-0">
                {link.icon}
              </div>
              <span className="flex-1 text-center truncate pl-4 pr-2">{link.title}</span>
              <div className="w-12 flex items-center justify-end shrink-0">
                <div className="w-3 h-3 bg-[#22c55e] rounded-full"></div>
              </div>
            </a>
          ))}

          {/* WhatsApp Contact Block */}
          <a
            href="https://wa.me/923199775990"
            target="_blank"
            rel="noreferrer"
            className="relative w-full bg-white text-[#ef4444] font-bold text-[14px] py-3 px-4 rounded-xl flex items-center justify-between border-2 border-[#ef4444] mt-2 transition-transform hover:-translate-y-1 active:translate-y-0"
            style={{ boxShadow: "0px 6px 0px #ef4444" }}
          >
            <div className="w-12 h-12 max-h-12 max-w-12 flex items-center justify-center shrink-0">
              <Image src="/images/HandshakeMerchant.png" alt="Merchant" width={48} height={48} className="w-full h-full object-contain" />
            </div>
            <span className="flex-1 text-center px-2 leading-tight">
              Merchant cooperation/complaint suggestions (this account does not support placing orders)
            </span>
            <div className="w-12 flex items-center justify-end shrink-0">
              {/* Empty div for symmetry so the text is perfectly centered */}
            </div>
          </a>

        </div>
      </main>
    </div>
  );
}
