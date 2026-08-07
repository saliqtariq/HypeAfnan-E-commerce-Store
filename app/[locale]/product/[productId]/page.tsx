import { notFound } from "next/navigation";
import ProductDetailClient from "../../../components/ProductDetailClient";
import type { Product } from "../../../components/ProductGrid";

// Do NOT use generateStaticParams — would try to build 22,209 pages at once
// Pages are rendered dynamically and cached by Vercel on first visit
export const dynamic = "force-dynamic";

interface PageProps {
  params: Promise<{ locale: string; productId: string }>;
}

export default async function ProductDetailPage({ params }: PageProps) {
  const { productId } = await params;

  // Fetch from our own API route (server-to-server, very fast)
  const baseUrl = process.env.VERCEL_URL
    ? `https://${process.env.VERCEL_URL}`
    : "http://localhost:3000";

  const res = await fetch(`${baseUrl}/api/products/${encodeURIComponent(productId)}`, {
    // Cache each product page for 1 hour
    next: { revalidate: 3600 },
  });

  if (!res.ok) {
    notFound();
  }

  const data = await res.json();
  const product: Product = data.product;

  if (!product) {
    notFound();
  }

  return <ProductDetailClient product={product} />;
}
