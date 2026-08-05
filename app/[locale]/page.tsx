import Image from "next/image";
import { useTranslations } from "next-intl";
import FilterBar from "../components/FilterBar";

export default function Home() {
  const t = useTranslations("contactBanner");

  return (
    <main className="flex flex-col items-center w-full">
      {/* Hero Section */}
      <section className="w-full max-w-[1200px] mx-auto px-4 sm:px-6 lg:px-8 pt-0 pb-1">
        <Image
          src="/SimpleHeroSection.png"
          alt="HypeAfnan Hero Banner"
          width={1333}
          height={750}
          className="w-full h-auto block rounded-md"
          priority
        />
      </section>

      {/* Full-width Contact Info Banner */}
      <section className="w-full bg-[#fffcf5] border-y border-[#fce8c5] py-4 px-5 sm:px-8 text-[14px] text-[#e67e22] sm:text-[15px]">
        <div className="w-full flex flex-col gap-1.5">
          <p className="m-0 font-normal">
            <span className="font-medium">{t("website")}: </span>
            https://hypeafnan.vercel.app/
          </p>
          <p className="m-0 font-normal">
            <span className="font-medium">{t("phone")}: </span>
            +923199775990
          </p>
          <p className="m-0 font-normal">{t("saveInfo")}</p>
        </div>
      </section>

      {/* Filter and Tab Navigation Bar */}
      <FilterBar />
    </main>
  );
}
