import { NextRequest, NextResponse } from "next/server";
export const revalidate = 86400; // Allow Vercel Data Cache (1 day to save invocations)
import { getAllProducts } from "../../lib/getProducts";
import productTagsData from "../../data/product_tags.json";
import tagMapData from "../../data/tag_map.json";
import { getSanityProducts } from "../../../sanity/client";

const productTagsMap = productTagsData as Record<string, number[]>;
const tagMap = tagMapData as Record<string, { groupName: string; tagName: string }>;

export async function GET(req: NextRequest) {
  const { searchParams } = new URL(req.url);
  const page = Math.max(1, parseInt(searchParams.get("page") || "1", 10));
  const limit = Math.min(300, Math.max(1, parseInt(searchParams.get("limit") || "30", 10)));
  const search = (searchParams.get("search") || "").trim().toLowerCase();

  const category = (searchParams.get("category") || "all").toLowerCase();
  const tagId = searchParams.get("tagId") || "";
  const tagName = (searchParams.get("tagName") || "").trim().toLowerCase();
  const groupName = (searchParams.get("groupName") || "").trim().toLowerCase();

  let sanityProducts: any[] = [];
  try {
    const raw = await getSanityProducts();
    sanityProducts = (raw || []).map((p: any) => ({
      id: `sanity_${p._id}`,
      goodsId: `sanity_${p._id}`,
      searchCode: p.searchCode,
      category: p.category,
      subCategory: p.subCategory,
      coverImage: p.images?.[0] || null,
      images: p.images || [],
      timestamp: Date.now(), // Always sort Sanity products to the top
      _fromSanity: true,
    }));
    console.log("SANITY FETCH SUCCESS:", sanityProducts.length);
  } catch (error) {
    console.error("SANITY FETCH ERROR:", error);
    // Sanity unavailable — continue with JSON products only
  }

  const jsonProducts = getAllProducts();
  // Merge: Sanity products come first so they appear prominently
  const products = [...sanityProducts, ...jsonProducts];

  let filtered = products;

  // Apply daily rotation to the default catalog so pagination stays in sync with homepage
  if (category === "all" && !tagId && !tagName && !groupName && !search) {
    const promoCard = products[0];
    const restProducts = products.slice(1);
    const dayNumber = Math.floor(Date.now() / (1000 * 60 * 60 * 24));
    const startIdx = (dayNumber * 299) % restProducts.length;
    
    // Create the fully rotated array
    const slice1 = restProducts.slice(startIdx);
    const slice2 = restProducts.slice(0, startIdx);
    filtered = [promoCard, ...slice1, ...slice2];
  }

  // Filter by Tab/Category
  if (category === "new") {
    // Sanity products are always newest — pin them first, then sort JSON products by timestamp
    const sanity = products.filter((p: any) => p._fromSanity);
    const rest = products.filter((p: any) => !p._fromSanity).sort((a, b) => {
      const tsA = (a.timestamp as number) || 0;
      const tsB = (b.timestamp as number) || 0;
      return tsB - tsA;
    });
    filtered = [...sanity, ...rest];
  } else if (category === "video") {
    filtered = products.filter((p) => {
      if (p.hasVideo) return true;
      const str = JSON.stringify(p).toLowerCase();
      return str.includes(".mp4") || str.includes("pvod") || !!p.videoUrl || !!p.video;
    });
  } else if (category === "photos") {
    filtered = products.filter((p) => {
      const cover = p.coverImage || p.imageUrl || (p.images && p.images[0]);
      return !!cover;
    });
  }

  // Exact Category / Tag Filtering using product_tags.json (scraped directly from Topokay)
  if (tagId) {
    const targetTagId = Number(tagId);

    filtered = filtered.filter((p: any) => {
      // Sanity product: match by subCategory string against tagName from URL
      if (p._fromSanity) {
        return tagName && (p.subCategory || "").toLowerCase() === tagName.toLowerCase();
      }
      // JSON product: match by tag ID
      const pId = p.goodsId || p.id;
      const tags = productTagsMap[pId];
      return tags && tags.includes(targetTagId);
    });

    filtered.sort((a: any, b: any) => {
      const tsA = a.timestamp || a.createdAt || 0;
      const tsB = b.timestamp || b.createdAt || 0;
      return tsB - tsA;
    });
  } else if (groupName && groupName !== "all") {
    const groupTagIds = Object.keys(tagMap)
      .filter((tid) => tagMap[tid].groupName.toLowerCase() === groupName)
      .map((tid) => Number(tid));

    filtered = filtered.filter((p: any) => {
      // Sanity product: match by category string
      if (p._fromSanity) {
        return (p.category || "").toLowerCase() === groupName;
      }
      // JSON product: match by tag ID
      const pId = p.goodsId || p.id;
      const tags = productTagsMap[pId];
      return tags && tags.some((t) => groupTagIds.includes(t));
    });
  } else if (tagName) {
    filtered = filtered.filter((p: any) => {
      if (p._fromSanity) {
        return (p.subCategory || "").toLowerCase().includes(tagName);
      }
      const pId = p.goodsId || p.id;
      const tags = productTagsMap[pId];
      return tags && tags.some((t) => (tagMap[String(t)]?.tagName || "").toLowerCase().includes(tagName));
    });
  }

  if (search) {
    // Find ALL products whose searchCode or goodsId exactly matches the query
    const exactCodeMatches = products.filter(
      (p) =>
        (p.searchCode || "").toLowerCase() === search ||
        (p.goodsId || p.id || "").toLowerCase() === search
    );

    if (exactCodeMatches.length > 0) {
      // Return all exact matches — client redirects only if there's exactly 1
      return NextResponse.json(
        { products: exactCodeMatches, total: exactCodeMatches.length, page: 1, limit, totalPages: 1, exactMatch: true },
        { headers: { "Cache-Control": "public, s-maxage=60, stale-while-revalidate=300" } }
      );
    }

    // Fuzzy match: title, searchCode, category
    filtered = filtered.filter(
      (p) =>
        (p.title || p.name || "").toLowerCase().includes(search) ||
        (p.searchCode || p.goodsCode || "").toLowerCase().includes(search) ||
        (p.category || "").toLowerCase().includes(search)
    );
  }

  const total = filtered.length;
  const totalPages = Math.ceil(total / limit);
  const start = (page - 1) * limit;
  const items = filtered.slice(start, start + limit);

  return NextResponse.json(
    { products: items, total, page, limit, totalPages },
    {
      headers: {
        // Cache category pages (Top etc.) for 24 hours; regular pages for 1 minute
        "Cache-Control": tagId === "85658997"
          ? "public, s-maxage=86400, stale-while-revalidate=3600"
          : "public, s-maxage=86400, stale-while-revalidate=3600",
      },
    }
  );
}
