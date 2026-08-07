import { notFound } from "next/navigation";
import ProductDetailClient from "../../../components/ProductDetailClient";
import { getProductById } from "../../../lib/getProducts";

// Render dynamically — cached by Vercel after first visit (no giant static build)
export const dynamic = "force-dynamic";

interface PageProps {
  params: Promise<{ locale: string; productId: string }>;
}

export default async function ProductDetailPage({ params }: PageProps) {
  const { productId } = await params;

  // Read directly from the file (no HTTP round-trip to self)
  const product = getProductById(productId);

  if (!product) {
    notFound();
  }

  return <ProductDetailClient product={product} />;
}
