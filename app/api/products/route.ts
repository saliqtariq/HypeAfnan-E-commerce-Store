import { NextRequest, NextResponse } from "next/server";
import { getAllProducts } from "../../lib/getProducts";
import productTagsData from "../../data/product_tags.json";
import tagMapData from "../../data/tag_map.json";

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

  const products = getAllProducts();

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
    filtered = [...products].sort((a, b) => {
      const tsA = (a.timestamp as number) || 0;
      const tsB = (b.timestamp as number) || 0;
      return tsB - tsA;
    });
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

  // Exact Category / Tag Filtering using index map
  if (tagId) {
    const targetTagId = Number(tagId);

    // Special case: Top category (85658997) — show newest 300 products from our collection
    if (targetTagId === 85658997) {
      const sorted = [...products].sort((a: any, b: any) => {
        const tsA = a.timestamp || a.createdAt || 0;
        const tsB = b.timestamp || b.createdAt || 0;
        return tsB - tsA;
      });
      filtered = sorted.slice(0, 300);
    } else {
      filtered = filtered.filter((p: any) => {
        const pId = p.goodsId || p.id;
        const tags = productTagsMap[pId];
        return tags && tags.includes(targetTagId);
      });
    }
  } else if (groupName && groupName !== "all") {
    // Filter by group (e.g., Men clothes, Men shoes, Belt, Watch, etc.)
    const groupTagIds = Object.keys(tagMap)
      .filter((tid) => tagMap[tid].groupName.toLowerCase() === groupName)
      .map((tid) => Number(tid));

    filtered = filtered.filter((p: any) => {
      const pId = p.goodsId || p.id;
      const tags = productTagsMap[pId];
      return tags && tags.some((t) => groupTagIds.includes(t));
    });
  } else if (tagName) {
    filtered = filtered.filter((p: any) => {
      const pId = p.goodsId || p.id;
      const tags = productTagsMap[pId];
      if (tags) {
        return tags.some((t) => (tagMap[String(t)]?.tagName || "").toLowerCase().includes(tagName));
      }
      return (p.title || p.name || "").toLowerCase().includes(tagName);
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
          : "public, s-maxage=60, stale-while-revalidate=300",
      },
    }
  );
}
