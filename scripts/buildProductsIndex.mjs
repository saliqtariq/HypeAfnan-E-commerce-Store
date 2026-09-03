/**
 * Rebuilds products_index.json from products_local.json + product_tags.json
 * The index contains lean fields needed for listing pages including category tags.
 */
import fs from "fs";
import path from "path";
import { fileURLToPath } from "url";

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const LOCAL_FILE  = path.join(__dirname, "../app/data/products_local.json");
const MAIN_FILE   = path.join(__dirname, "../app/data/products.json");
const TAGS_FILE   = path.join(__dirname, "../app/data/product_tags.json");
const INDEX_FILE  = path.join(__dirname, "../app/data/products_index.json");

console.log("=== Rebuilding products_index.json ===");

// Use products_local.json if available (has CDN URLs), else fall back
const sourceFile = fs.existsSync(LOCAL_FILE) ? LOCAL_FILE : MAIN_FILE;
console.log(`Source: ${path.basename(sourceFile)}`);
const { products } = JSON.parse(fs.readFileSync(sourceFile, "utf-8"));

// Load category tags map: { goodsId -> { tagId, tagName, groupName } }
let tagsMap = {};
if (fs.existsSync(TAGS_FILE)) {
  tagsMap = JSON.parse(fs.readFileSync(TAGS_FILE, "utf-8"));
  console.log(`Tags loaded for ${Object.keys(tagsMap).length} products`);
}

const index = products.map(p => {
  const gid = p.goodsId || p.id || "";
  const tag = tagsMap[gid] || {};
  return {
    id:          p.id,
    goodsId:     p.goodsId,
    title:       p.title,
    searchCode:  p.searchCode,
    coverImage:  p.coverImage,
    shopId:      p.shopId,
    timestamp:   p.timestamp,
    tagId:       tag.tagId   || p.tagId   || null,
    tagName:     tag.tagName || p.tagName || null,
    groupName:   tag.groupName || p.groupName || null,
  };
});

fs.writeFileSync(INDEX_FILE, JSON.stringify({ products: index }, null, 2));
console.log(`Done! Written ${index.length} products to products_index.json`);
