import Image from "next/image";

export default function Home() {
  return (
    <main className="flex flex-col items-center w-full">
      {/* Hero Section */}
      <section className="w-full max-w-[900px] mx-auto px-4 sm:px-6 pt-4 pb-6">
        <Image
          src="/herosectionposter.png"
          alt="HypeAfnan Hero Banner"
          width={1333}
          height={750}
          className="w-full h-auto rounded-lg"
          priority
        />
      </section>
    </main>
  );
}
