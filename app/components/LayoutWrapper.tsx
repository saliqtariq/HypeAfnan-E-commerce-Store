"use client";

import React from "react";
import { usePathname } from "next/navigation";
import Header from "./Header";
import Footer from "./Footer";
import WhatsAppButton from "./WhatsAppButton";

export default function LayoutWrapper({ children }: { children: React.ReactNode }) {
  const pathname = usePathname();
  
  // Check if we are on the linkbio page (handle any locale prefix)
  const isLinkBioPage = pathname.includes("/linkbio");

  return (
    <>
      {!isLinkBioPage && <Header />}
      <main className="flex-1">
        {children}
      </main>
      {!isLinkBioPage && <Footer />}
      {!isLinkBioPage && <WhatsAppButton />}
    </>
  );
}
