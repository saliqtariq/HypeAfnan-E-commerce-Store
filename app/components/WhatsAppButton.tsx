import React from "react";
import Image from "next/image";

export default function WhatsAppButton() {
  return (
    <div className="fixed bottom-24 right-6 sm:right-10 z-[999] flex flex-col gap-1">
      {/* Facebook Button */}
      <a
        href="https://www.facebook.com/Hype-Afnan"
        target="_blank"
        rel="noopener noreferrer"
        className="w-[60px] h-[60px] hover:scale-110 transition-transform cursor-pointer drop-shadow-md"
        aria-label="Follow us on Facebook"
      >
        <Image 
          src="/images/FacebookLogo.png" 
          alt="Facebook" 
          width={60} 
          height={60} 
          className="w-full h-full object-contain" 
        />
      </a>

      {/* Instagram Button */}
      <a
        href="https://www.instagram.com/hypeafnan"
        target="_blank"
        rel="noopener noreferrer"
        className="w-[60px] h-[60px] hover:scale-110 transition-transform cursor-pointer drop-shadow-md"
        aria-label="Follow us on Instagram"
      >
        <Image 
          src="/images/InstagramLogo.png" 
          alt="Instagram" 
          width={60} 
          height={60} 
          className="w-full h-full object-contain" 
        />
      </a>

      {/* WhatsApp Button */}
      <a
        href="https://wa.me/923199775990"
        target="_blank"
        rel="noopener noreferrer"
        className="w-[60px] h-[60px] hover:scale-110 transition-transform cursor-pointer drop-shadow-md"
        aria-label="Contact Us on WhatsApp"
      >
        <Image 
          src="/images/WhatsappLogo.png" 
          alt="WhatsApp" 
          width={60} 
          height={60} 
          className="w-full h-full object-contain" 
        />
      </a>
    </div>
  );
}
