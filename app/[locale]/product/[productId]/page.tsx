import { notFound } from "next/navigation";
import ProductDetailClient from "../../../components/ProductDetailClient";
import { getProductById } from "../../../lib/getProducts";
import { sanityClient } from "../../../../sanity/client";

// Cache pages for 24 hours (ISR) so new products appear almost instantly while still saving massive CPU
export const revalidate = 86400;

interface PageProps {
  params: Promise<{ locale: string; productId: string }>;
}

export default async function ProductDetailPage({ params }: PageProps) {
  const { productId } = await params;

  let product: any = undefined;

  // 1. Check Sanity first (by searchCode or by Sanity _id)
  try {
    const sanityId = productId.startsWith("sanity_") ? productId.replace("sanity_", "") : null;
    const query = sanityId
      ? `*[_type == "product" && _id == $id][0]{ _id, searchCode, category, subCategory, "images": images[].asset->url }`
      : `*[_type == "product" && searchCode == $code][0]{ _id, searchCode, category, subCategory, "images": images[].asset->url }`;
    const params = sanityId ? { id: sanityId } : { code: productId };
    const raw = await sanityClient.fetch(query, params);
    if (raw) {
      product = {
        id: `sanity_${raw._id}`,
        goodsId: `sanity_${raw._id}`,
        searchCode: raw.searchCode,
        category: raw.category,
        subCategory: raw.subCategory,
        coverImage: raw.images?.[0] || null,
        images: raw.images || [],
        _fromSanity: true,
      };
    }
  } catch {
    // Sanity unavailable
  }

  // 2. Fallback to JSON file
  if (!product) {
    product = getProductById(productId);
  }

  if (!product) {
    notFound();
  }

  return <ProductDetailClient product={product} />;
}
