"use client";
import React from "react";
import Image from "next/image";

type SocialButtonProps = {
  href: string;
  label: string;
  imgSrc: string;
  imgAlt: string;
  bgColor: string;
  isGradient?: boolean;
};

function SocialButton({ href, label, imgSrc, imgAlt, bgColor, isGradient }: SocialButtonProps) {
  return (
    <a
      href={href}
      target="_blank"
      rel="noopener noreferrer"
      aria-label={label}
      className="group relative flex items-center cursor-pointer -mb-3 overflow-hidden rounded-l-full h-[68px]"
    >
      {/* Brand color background — starts at icon-only width, expands fully on hover */}
      <div
        className="absolute right-0 top-0 h-full rounded-l-full
                   w-[68px] group-hover:w-full
                   opacity-0 group-hover:opacity-100
                   transition-all duration-300 ease-in-out"
        style={isGradient
          ? { background: bgColor }
          : { backgroundColor: bgColor }}
      />

      {/* Text label — appears on hover */}
      <span
        className="relative z-10 text-white text-sm font-bold whitespace-nowrap
                   max-w-0 overflow-hidden opacity-0 pl-0
                   group-hover:max-w-[90px] group-hover:opacity-100 group-hover:pl-4
                   transition-all duration-300 ease-in-out"
      >
        {label}
      </span>

      {/* Icon — always visible on top */}
      <div className="relative z-10 w-[72px] h-[72px] flex-shrink-0">
        <Image
          src={imgSrc}
          alt={imgAlt}
          width={72}
          height={72}
          className="w-full h-full object-contain drop-shadow-sm"
        />
      </div>
    </a>
  );
}

export default function WhatsAppButton() {
  return (
    <div className="fixed bottom-24 right-0 z-[999] flex flex-col items-end">
      <SocialButton
        href="https://www.facebook.com/people/Hype-Afnan/61579790579100/?mibextid=wwXIfr&rdid=pejoryT9fUTVqvEI&share_url=https%3A%2F%2Fwww.facebook.com%2Fshare%2F192k5ct7HP%2F%3Fmibextid%3DwwXIfr"
        label="Facebook"
        imgSrc="/images/FacebookNewlogo.png"
        imgAlt="Facebook"
        bgColor="#1877F2"
      />
      <SocialButton
        href="https://www.instagram.com/hypeafnan.inc"
        label="Instagram"
        imgSrc="/images/InstagramlogoNew.png"
        imgAlt="Instagram"
        bgColor="linear-gradient(to right, #f09433, #e6683c, #dc2743, #cc2366, #bc1888)"
        isGradient
      />
      <SocialButton
        href="https://wa.me/923199775990"
        label="Contact Us"
        imgSrc="/images/WhatsappNewlogo.png"
        imgAlt="WhatsApp"
        bgColor="#25D366"
      />
    </div>
  );
}
