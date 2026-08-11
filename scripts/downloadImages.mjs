/**
 * Image downloader & compressor for HypeAfnan product catalog.
 *
 * Strategy: Read products.json in batches, download & compress images
 * with sharp, save results to products_local.json, and track progress
 * in a small checkpoint file so the script can always resume.
 *
 * v2: True product-level parallelism — 50 products processed simultaneously.
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
const PRODUCT_CONCURRENCY = 50;  // products processed in parallel (was 1 — now 50x faster)
const IMG_CONCURRENCY     = 4;   // parallel image downloads per product
const SAVE_EVERY          = 100; // save output file every N products
const MAX_WIDTH    = 800;
const QUALITY      = 75;
const TIMEOUT_MS   = 12000;

// --- SETUP ---
fs.mkdirSync(IMAGES_DIR, { recursive: true });

// Load checkpoint
let startIndex = 0;
if (fs.existsSync(CHECKPOINT)) {
  try { startIndex = JSON.parse(fs.readFileSync(CHECKPOINT, "utf-8")).nextIndex || 0; }
  catch (e) {}
}

// Load source products
console.log("Loading products.json...");
const source = JSON.parse(fs.readFileSync(DATA_FILE, "utf-8"));
const products = source.products || [];
console.log(`Total products: ${products.length}. Resuming from index ${startIndex}.\n`);

// Load or init local output file
let localProducts;
if (fs.existsSync(OUTPUT_FILE) && startIndex > 0) {
  try {
    localProducts = JSON.parse(fs.readFileSync(OUTPUT_FILE, "utf-8")).products || [];
    // Pad if needed
    while (localProducts.length < products.length) localProducts.push(null);
  } catch (e) {
    localProducts = JSON.parse(JSON.stringify(products));
  }
} else {
  localProducts = JSON.parse(JSON.stringify(products));
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

async function processOneImage(url, slug, uniqueId, index) {
  if (!url) return null;
  const angle    = ANGLES[index] || `extra${index}`;
  const fileName = `${slug}-${uniqueId}-${angle}.webp`;
  const destPath = path.join(IMAGES_DIR, fileName);
  const pubPath  = `/images/products/${fileName}`;

  // Skip if already saved with valid size
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
    return url; // keep original URL if download fails
  }
}

async function processProduct(product, globalIdx) {
  const pId      = product.goodsId || product.id || "prod";
  const uniqueId = (product.searchCode ? product.searchCode + "-" : "") + pId.replace(/[^a-zA-Z0-9]/g, "").slice(-8).toLowerCase();
  let title = product.title || "";
  if (title.includes("save my information") || !title.trim()) title = "topokay-product";
  const slug = slugify(title);

  // Check if already processed correctly
  const existing = localProducts[globalIdx];
  if (existing && existing.images && existing.images[0] && existing.images[0].startsWith("/images")) {
    return existing;
  }

  const urls = Array.isArray(product.images) ? product.images : [];
  const localUrls = [];

  // Download images in sub-batches of IMG_CONCURRENCY
  for (let i = 0; i < urls.length; i += IMG_CONCURRENCY) {
    const batch = urls.slice(i, i + IMG_CONCURRENCY);
    const results = await Promise.all(
      batch.map((url, j) => processOneImage(url, slug, uniqueId, i + j))
    );
    localUrls.push(...results.filter(Boolean));
  }

  return {
    ...product,
    images: localUrls,
    coverImage: localUrls[0] || product.coverImage,
  };
}

// Semaphore to cap true parallelism
function semaphore(limit) {
  let active = 0;
  const queue = [];
  return function run(fn) {
    return new Promise((resolve, reject) => {
      const execute = async () => {
        active++;
        try { resolve(await fn()); }
        catch (e) { reject(e); }
        finally {
          active--;
          if (queue.length) queue.shift()();
        }
      };
      active < limit ? execute() : queue.push(execute);
    });
  };
}

// --- MAIN LOOP ---
async function main() {
  const sem = semaphore(PRODUCT_CONCURRENCY);
  let processed = startIndex;
  let lastSaved = startIndex;

  const remaining = products.slice(startIndex);
  const promises = remaining.map((product, relIdx) => {
    const globalIdx = startIndex + relIdx;
    return sem(async () => {
      const updated = await processProduct(product, globalIdx);
      localProducts[globalIdx] = updated;
      processed++;

      // Log progress every 50 products
      if (processed % 50 === 0 || processed === products.length) {
        const pct = ((processed / products.length) * 100).toFixed(1);
        console.log(`[${pct}%] ${processed}/${products.length} products processed`);
      }

      // Save checkpoint periodically
      if (processed - lastSaved >= SAVE_EVERY) {
        lastSaved = processed;
        fs.writeFileSync(CHECKPOINT, JSON.stringify({ nextIndex: processed }, null, 2));
        fs.writeFileSync(OUTPUT_FILE, JSON.stringify({ products: localProducts }, null, 2));
      }
    });
  });

  await Promise.all(promises);

  // Final save
  fs.writeFileSync(OUTPUT_FILE, JSON.stringify({ products: localProducts }, null, 2));
  if (fs.existsSync(CHECKPOINT)) fs.unlinkSync(CHECKPOINT);

  const imgCount = fs.readdirSync(IMAGES_DIR).length;
  console.log(`\n✅ ALL DONE!`);
  console.log(`   Processed : ${processed} products`);
  console.log(`   Images    : ${imgCount} files in public/images/products/`);
  console.log(`   Saved to  : ${OUTPUT_FILE}`);
}

main().catch(err => {
  // Emergency save before exit
  try { fs.writeFileSync(OUTPUT_FILE, JSON.stringify({ products: localProducts }, null, 2)); } catch (_) {}
  console.error("Fatal error:", err);
  process.exit(1);
});
