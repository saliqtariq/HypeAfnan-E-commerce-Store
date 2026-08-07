import { NextRequest, NextResponse } from "next/server";
import { getAllProducts } from "../../lib/getProducts";

export async function GET(req: NextRequest) {
  const { searchParams } = new URL(req.url);
  const page = Math.max(1, parseInt(searchParams.get("page") || "1", 10));
  const limit = Math.min(60, Math.max(1, parseInt(searchParams.get("limit") || "30", 10)));
  const search = (searchParams.get("search") || "").trim().toLowerCase();

  const category = (searchParams.get("category") || "all").toLowerCase();

  const products = getAllProducts();

  let filtered = products;

  // Filter by Tab/Category
  if (category === "new") {
    // Sort by timestamp descending or take latest products
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

  if (search) {
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
        "Cache-Control": "public, s-maxage=60, stale-while-revalidate=300",
      },
    }
  );
}
