import { NextRequest, NextResponse } from "next/server";
import path from "path";
import fs from "fs";

type Product = {
  id?: string;
  goodsId?: string;
  searchCode?: string;
  [key: string]: unknown;
};

let cachedProducts: Product[] | null = null;

function getProducts(): Product[] {
  if (cachedProducts) return cachedProducts;
  const filePath = path.join(process.cwd(), "app/data/products_local.json");
  const fallbackPath = path.join(process.cwd(), "app/data/products.json");
  const file = fs.existsSync(filePath) ? filePath : fallbackPath;
  const raw = fs.readFileSync(file, "utf-8");
  const data = JSON.parse(raw);
  cachedProducts = data.products || [];
  return cachedProducts as Product[];
}

export async function GET(
  _req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const { id } = await params;
  const products = getProducts();

  const product = products.find(
    (p) => p.goodsId === id || p.id === id || p.searchCode === id
  );

  if (!product) {
    return NextResponse.json({ error: "Product not found" }, { status: 404 });
  }

  return NextResponse.json(
    { product },
    {
      headers: {
        "Cache-Control": "public, s-maxage=3600, stale-while-revalidate=86400",
      },
    }
  );
}
