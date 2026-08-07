import { NextRequest, NextResponse } from "next/server";
import path from "path";
import fs from "fs";

// Cache the parsed products in memory so we only read/parse the file once per serverless instance
let cachedProducts: unknown[] | null = null;

function getProducts() {
  if (cachedProducts) return cachedProducts;
  const filePath = path.join(process.cwd(), "app/data/products_local.json");
  // Fallback to products.json if local version doesn't exist
  const fallbackPath = path.join(process.cwd(), "app/data/products.json");
  const file = fs.existsSync(filePath) ? filePath : fallbackPath;
  const raw = fs.readFileSync(file, "utf-8");
  const data = JSON.parse(raw);
  cachedProducts = data.products || [];
  return cachedProducts;
}

export async function GET(req: NextRequest) {
  const { searchParams } = new URL(req.url);
  const page = Math.max(1, parseInt(searchParams.get("page") || "1", 10));
  const limit = Math.min(60, Math.max(1, parseInt(searchParams.get("limit") || "30", 10)));
  const search = (searchParams.get("search") || "").trim().toLowerCase();

  const products = getProducts();

  let filtered = products as {
    id?: string;
    goodsId?: string;
    title?: string;
    name?: string;
    searchCode?: string;
    goodsCode?: string;
    category?: string;
    [key: string]: unknown;
  }[];

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
  const end = start + limit;
  const items = filtered.slice(start, end);

  return NextResponse.json(
    { products: items, total, page, limit, totalPages },
    {
      headers: {
        // Cache for 60 seconds on CDN edge, stale-while-revalidate for 5 min
        "Cache-Control": "public, s-maxage=60, stale-while-revalidate=300",
      },
    }
  );
}
