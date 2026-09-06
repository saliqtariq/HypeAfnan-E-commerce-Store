// force reload 4
import path from "path";
import fs from "fs";

export type Product = {
  id?: string;
  goodsId?: string;
  title?: string;
  name?: string;
  coverImage?: string;
  imageUrl?: string;
  images?: string[];
  searchCode?: string;
  goodsCode?: string;
  category?: string;
  createdAt?: string;
  [key: string]: unknown;
};

// Separate cache for listing (lean index) vs detail (full data)
let cachedIndex: Product[] | null = null;
let cachedFull: Product[] | null = null;

// Helper to route Backblaze URLs through the Cloudflare Worker CDN
function applyCdn(p: Product): Product {
  if (p.searchCode === '183822' || p.id === '_dubqfZxLSiD8-BmUmOI1zx5MzZv762JAPgNgi8A') {
    return {
      ...p,
      title: "HYPEAFNAN",
      coverImage: "/images/Firstproductbg.jpeg",
      images: ["/images/Firstproductbg.jpeg"],
      isPromo: true
    };
  }

  const workerUrl = "https://hypeafnan-cdn.afnanimran61.workers.dev";
  const rewrite = (url: string) => {
    if (!url) return url;
    return url
      .replace("https://f005.backblazeb2.com/file/HypeAfnan-images", workerUrl)
      .replace("https://HypeAfnan-images.s3.us-east-005.backblazeb2.com", workerUrl);
  };

  return {
    ...p,
    coverImage: p.coverImage ? rewrite(p.coverImage) : p.coverImage,
    imageUrl: p.imageUrl ? rewrite(p.imageUrl) : p.imageUrl,
    images: p.images ? p.images.map(rewrite) : p.images,
  };
}

/**
 * Returns lean products for listing (id, title, coverImage, category only).
 * Uses products_index.json (4.5MB) — much faster cold starts than products.json (24.7MB).
 */
export function getAllProducts(): Product[] {
  if (cachedIndex) return cachedIndex;

  const cwd = process.cwd();

  // Always prefer the lean index for listing — works on Vercel and locally
  const indexFile = path.join(cwd, "app/data/products_index.json");
  const fallbackFile = path.join(cwd, "app/data/products.json");
  const file = fs.existsSync(indexFile) ? indexFile : fallbackFile;

  try {
    const raw = fs.readFileSync(file, "utf-8");
    const data = JSON.parse(raw);
    const rawProducts = (data.products || []) as Product[];
    cachedIndex = rawProducts.map(applyCdn);
  } catch {
    // Fallback to full products.json if index is unreadable
    const raw = fs.readFileSync(fallbackFile, "utf-8");
    const data = JSON.parse(raw);
    const rawProducts = (data.products || []) as Product[];
    cachedIndex = rawProducts.map(applyCdn);
  }
  return cachedIndex!;
}

/**
 * Returns a single product with full data for the product detail page.
 * Uses products.json (full data) for detail — only called per-product, not in bulk.
 * On Vercel: uses products.json (CDN image URLs).
 * Locally: uses products_local.json (local WebP paths) if available.
 */
export function getProductById(id: string): Product | undefined {
  if (!cachedFull) {
    const cwd = process.cwd();
    const localFile = path.join(cwd, "app/data/products_local.json");
    const mainFile = path.join(cwd, "app/data/products.json");
    const isVercel = !!process.env.VERCEL;
    const file = !isVercel && fs.existsSync(localFile) ? localFile : mainFile;

    let raw: string;
    try {
      raw = fs.readFileSync(file, "utf-8");
      const data = JSON.parse(raw);
      const rawProducts = (data.products || []) as Product[];
      cachedFull = rawProducts.map(applyCdn);
    } catch {
      // products_local.json may be mid-write (download script running) — fall back to stable products.json
      raw = fs.readFileSync(mainFile, "utf-8");
      const data = JSON.parse(raw);
      const rawProducts = (data.products || []) as Product[];
      cachedFull = rawProducts.map(applyCdn);
    }
  }

  if (id === 'promo-card-hero') {
    return {
      id: "promo-card-hero",
      goodsId: "promo-card-hero",
      title: "HYPEAFNAN",
      coverImage: "/images/Firstproductbg.jpeg",
      images: ["/images/Firstproductbg.jpeg"],
      isPromo: true
    };
  }

  return cachedFull.find(
    (p) => p.goodsId === id || p.id === id || p.searchCode === id
  );
}
