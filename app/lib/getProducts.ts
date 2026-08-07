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

let cachedProducts: Product[] | null = null;

/**
 * Returns all products, reading from the correct file.
 *
 * On Vercel: uses products.json (original CDN image URLs) because
 *   the local /images/products/ folder is gitignored and not deployed.
 * Locally:   uses products_local.json if available (local WebP paths),
 *   falling back to products.json.
 */
export function getAllProducts(): Product[] {
  if (cachedProducts) return cachedProducts;

  const cwd = process.cwd();
  const localFile = path.join(cwd, "app/data/products_local.json");
  const mainFile = path.join(cwd, "app/data/products.json");

  // On Vercel the local image files don't exist (gitignored), so always
  // use products.json (CDN URLs) there. Locally prefer products_local.json.
  const isVercel = !!process.env.VERCEL;
  const file = !isVercel && fs.existsSync(localFile) ? localFile : mainFile;

  const raw = fs.readFileSync(file, "utf-8");
  const data = JSON.parse(raw);
  cachedProducts = (data.products || []) as Product[];
  return cachedProducts;
}

export function getProductById(id: string): Product | undefined {
  const products = getAllProducts();
  return products.find(
    (p) => p.goodsId === id || p.id === id || p.searchCode === id
  );
}
