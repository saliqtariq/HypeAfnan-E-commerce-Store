import React from "react";

export default function WhatsAppButton() {
  return (
    <a
      href="https://wa.me/923199775990"
      target="_blank"
      rel="noopener noreferrer"
      className="fixed bottom-24 right-10 z-[999] flex flex-col items-center justify-center w-[50px] h-[50px] bg-[#00c853] hover:bg-[#00e676] text-white rounded-full shadow-md border-[1.5px] border-white transition-transform hover:scale-105 no-underline group"
      aria-label="Contact Us on WhatsApp"
    >
      <svg
        width="22"
        height="22"
        viewBox="0 0 24 24"
        fill="none"
        stroke="currentColor"
        strokeWidth="2"
        strokeLinecap="round"
        strokeLinejoin="round"
        className="text-white transform group-hover:scale-110 transition-transform"
      >
        <path d="M3 21l1.65-3.8a9 9 0 1 1 3.4 2.9L3 21" />
        <path d="M9 10a0.5.5 0 0 0 1 0V9a0.5.5 0 0 0-1 0v1a5 5 0 0 0 5 5h1a0.5.5 0 0 0 0-1h-1a0.5.5 0 0 0 0 1" />
      </svg>
      <span className="text-[7.5px] font-semibold tracking-tight text-white leading-none mt-[1px]">
        Contact US
      </span>
    </a>
  );
}
