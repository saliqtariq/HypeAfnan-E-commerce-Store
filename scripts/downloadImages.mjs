/**
 * Image downloader & compressor for HypeAfnan product catalog.
 * 
 * Strategy: Read products.json in batches, download & compress images
 * with sharp, save results to products_local.json, and track progress
 * in a small checkpoint file so the script can always resume.
 */

import fs from "fs";
import path from "path";
import https from "https";
import http from "http";
import sharp from "sharp";
import { fileURLToPath } from "url";

const __dirname = path.dirname(fileURLToPath(import.meta.url));

// --- CONFIG ---
const DATA_FILE    = path.join(__dirname, "../app/data/products.json");
const OUTPUT_FILE  = path.join(__dirname, "../app/data/products_local.json");
const CHECKPOINT   = path.join(__dirname, "../app/data/download_checkpoint.json");
const IMAGES_DIR   = path.join(__dirname, "../public/images/products");
const BATCH_SIZE   = 20;   // products per batch
const CONCURRENCY  = 5;    // parallel image downloads per product
const MAX_WIDTH    = 800;
const QUALITY      = 75;
const TIMEOUT_MS   = 15000;

// --- SETUP ---
fs.mkdirSync(IMAGES_DIR, { recursive: true });

// Load checkpoint (which product index we stopped at)
let startIndex = 0;
if (fs.existsSync(CHECKPOINT)) {
  try { startIndex = JSON.parse(fs.readFileSync(CHECKPOINT, "utf-8")).nextIndex || 0; }
  catch (e) {}
}

// Load source products (read-once)
console.log("Loading products.json...");
const source = JSON.parse(fs.readFileSync(DATA_FILE, "utf-8"));
const products = source.products || [];
console.log(`Total products: ${products.length}. Resuming from index ${startIndex}.\n`);

// Load (or init) local output file
let localProducts;
if (fs.existsSync(OUTPUT_FILE) && startIndex > 0) {
  try {
    localProducts = JSON.parse(fs.readFileSync(OUTPUT_FILE, "utf-8")).products || [];
  } catch (e) {
    localProducts = [...products]; // fallback
  }
} else {
  localProducts = JSON.parse(JSON.stringify(products)); // deep copy
}

// --- HELPERS ---
function slugify(text) {
  return (text || "product")
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/(^-|-$)/g, "")
    .substring(0, 35) || "item";
}

const ANGLES = ["front", "side", "back", "detail", "extra1", "extra2", "extra3"];

function downloadBuffer(url) {
  return new Promise((resolve, reject) => {
    let raw = url;
    if (raw.startsWith("//")) raw = "https:" + raw;
    if (!raw.startsWith("http")) return reject(new Error("bad url"));

    const mod = raw.startsWith("https") ? https : http;
    const req = mod.get(raw, { headers: { "User-Agent": "Mozilla/5.0", "Referer": "https://szwego.com" } }, (res) => {
      if (res.statusCode !== 200) return reject(new Error(`HTTP ${res.statusCode}`));
      const chunks = [];
      res.on("data", c => chunks.push(c));
      res.on("end", () => resolve(Buffer.concat(chunks)));
    });
    req.on("error", reject);
    req.setTimeout(TIMEOUT_MS, () => { req.destroy(); reject(new Error("timeout")); });
  });
}

async function processOneImage(url, slug, shortId, index) {
  if (!url) return null;
  const angle    = ANGLES[index] || `extra${index}`;
  const fileName = `${slug}-${angle}-${shortId}.webp`;
  const destPath = path.join(IMAGES_DIR, fileName);
  const pubPath  = `/images/products/${fileName}`;

  // Skip if already saved
  try {
    const st = fs.statSync(destPath);
    if (st.size > 200) return pubPath;
  } catch (_) {}

  try {
    const buf = await downloadBuffer(url);
    await sharp(buf)
      .resize({ width: MAX_WIDTH, withoutEnlargement: true })
      .webp({ quality: QUALITY })
      .toFile(destPath);
    return pubPath;
  } catch (err) {
    // Return original URL if download fails — keeps the product visible
    return url;
  }
}

// Process images for a single product concurrently (capped at CONCURRENCY)
async function processProduct(product) {
  const pId  = product.goodsId || product.id || "prod";
  const shortId = pId.slice(-4).toLowerCase();
  let title = product.title || "";
  if (title.includes("save my information") || !title.trim()) title = "topokay-product";
  const slug = slugify(title);

  const urls = Array.isArray(product.images) ? product.images : [];
  const localUrls = [];

  // Process in sub-batches of CONCURRENCY
  for (let i = 0; i < urls.length; i += CONCURRENCY) {
    const batch = urls.slice(i, i + CONCURRENCY);
    const results = await Promise.all(
      batch.map((url, j) => processOneImage(url, slug, shortId, i + j))
    );
    localUrls.push(...results.filter(Boolean));
  }

  return {
    ...product,
    images: localUrls,
    coverImage: localUrls[0] || product.coverImage,
  };
}

// --- MAIN LOOP ---
async function main() {
  let processed = 0;
  let errors = 0;

  for (let i = startIndex; i < products.length; i += BATCH_SIZE) {
    const batch = products.slice(i, Math.min(i + BATCH_SIZE, products.length));

    // Process each product in the batch sequentially to keep memory flat
    const results = [];
    for (const product of batch) {
      const localIdx = products.indexOf(product);
      
      // Skip if already local
      const existing = localProducts[localIdx];
      if (existing && existing.images && existing.images[0] && existing.images[0].startsWith("/images")) {
        results.push(existing);
        processed++;
        continue;
      }

      const updated = await processProduct(product);
      results.push(updated);
      processed++;
    }

    // Write back to localProducts
    for (let j = 0; j < results.length; j++) {
      localProducts[i + j] = results[j];
    }

    // Save checkpoint + output file
    const nextIndex = Math.min(i + BATCH_SIZE, products.length);
    fs.writeFileSync(CHECKPOINT, JSON.stringify({ nextIndex }, null, 2));
    fs.writeFileSync(OUTPUT_FILE, JSON.stringify({ products: localProducts }, null, 2));

    const pct = ((nextIndex / products.length) * 100).toFixed(1);
    console.log(`[${pct}%] Processed ${nextIndex}/${products.length} products (batch ends at ${i + BATCH_SIZE})`);
  }

  // Done — clean up checkpoint
  if (fs.existsSync(CHECKPOINT)) fs.unlinkSync(CHECKPOINT);
  console.log(`\n✅ ALL DONE!`);
  console.log(`   Processed : ${processed} products`);
  console.log(`   Saved to  : ${OUTPUT_FILE}`);
  
  // Count downloaded images
  const imgCount = fs.readdirSync(IMAGES_DIR).length;
  console.log(`   Images    : ${imgCount} files in public/images/products/`);
}

main().catch(err => {
  console.error("Fatal error:", err);
  process.exit(1);
});
