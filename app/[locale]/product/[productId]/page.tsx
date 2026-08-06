import { notFound } from "next/navigation";
import productsData from "../../../data/products.json";
import ProductDetailClient from "../../../components/ProductDetailClient";
import type { Product } from "../../../components/ProductGrid";

interface PageProps {
  params: Promise<{ locale: string; productId: string }>;
}

export async function generateStaticParams() {
  const { products } = productsData as { products: Product[] };
  return products.map((p) => ({
    productId: p.goodsId || p.id || p.searchCode || "",
  })).filter((p) => p.productId !== "");
}

export default async function ProductDetailPage({ params }: PageProps) {
  const { productId } = await params;
  const { products } = productsData as { products: Product[] };

  const product = products.find(
    (p) =>
      p.goodsId === productId ||
      p.id === productId ||
      p.searchCode === productId
  );

  if (!product) {
    notFound();
  }

  return <ProductDetailClient product={product} />;
}
