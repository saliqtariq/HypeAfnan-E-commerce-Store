/**
 * Download Yupoo Images, heavily compress to WebP, and save locally.
 *
 * Usage: node scripts/downloadYupooImages.mjs
 */

import fs from "fs";
import path from "path";
import https from "https";
import http from "http";
import sharp from "sharp";
import crypto from "crypto";
import { fileURLToPath } from "url";

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const ROOT = path.join(__dirname, "..");
const PRODUCTS_FILE = path.join(ROOT, "app/data/products.json");
const INDEX_FILE = path.join(ROOT, "app/data/products_index.json");
const IMAGES_DIR = path.join(ROOT, "public/images/products");
const CONCURRENCY = 25; // 25 parallel downloads

function createHashName(url) {
  const hash = crypto.createHash("md5").update(url).digest("hex");
  return `yupoo_lp_${hash.slice(0, 12)}.webp`;
}

function downloadImage(urlStr) {
  return new Promise((resolve, reject) => {
    const parsed = new URL(urlStr);
    const lib = parsed.protocol === "https:" ? https : http;
    const req = lib.get(
      {
        hostname: parsed.hostname,
        path: parsed.pathname + parsed.search,
        headers: {
          "User-Agent": "Mozilla/5.0 (Windows NT 10.0; Win64; x64)",
          "Referer": "https://aristide.x.yupoo.com/"
        },
        timeout: 15000,
      },
      (res) => {
        if (res.statusCode >= 300 && res.statusCode < 400 && res.headers.location) {
          resolve(downloadImage(res.headers.location));
          return;
        }
        if (res.statusCode !== 200) {
          reject(new Error(`Failed to fetch ${urlStr}: ${res.statusCode}`));
          return;
        }
        const data = [];
        res.on("data", (chunk) => data.push(chunk));
        res.on("end", () => resolve(Buffer.concat(data)));
      }
    );
    req.on("error", reject);
    req.on("timeout", () => {
      req.destroy();
      reject(new Error("Timeout"));
    });
  });
}

function semaphore(limit) {
  let active = 0;
  const queue = [];
  return function run(fn) {
    return new Promise((resolve, reject) => {
      const execute = async () => {
        active++;
        try {
          resolve(await fn());
        } catch (e) {
          reject(e);
        } finally {
          active--;
          if (queue.length > 0) queue.shift()();
        }
      };
      if (active < limit) execute();
      else queue.push(execute);
    });
  };
}

async function main() {
  if (!fs.existsSync(IMAGES_DIR)) {
    fs.mkdirSync(IMAGES_DIR, { recursive: true });
  }

  console.log("Loading products.json...");
  const data = JSON.parse(fs.readFileSync(PRODUCTS_FILE, "utf-8"));
  
  // Only target products from Yupoo
  const targetProducts = data.products.filter(p => p._source === "yupoo_aristide");
  console.log(`Found ${targetProducts.length} Loro Piana products from Yupoo.`);

  // Collect all unique Yupoo URLs
  const urlMap = new Map(); // original URL -> new filename
  const allUrls = new Set();
  
  for (const p of targetProducts) {
    if (p.coverImage && p.coverImage.includes("photo.yupoo.com")) allUrls.add(p.coverImage);
    if (p.images) {
      for (const img of p.images) {
        if (img && img.includes("photo.yupoo.com")) allUrls.add(img);
      }
    }
  }

  const urlsToProcess = Array.from(allUrls);
  console.log(`Unique Yupoo images to download: ${urlsToProcess.length}`);

  const sem = semaphore(CONCURRENCY);
  let done = 0;
  let failed = 0;
  
  console.log("\nStarting downloads & high compression to WebP...");
  
  const promises = urlsToProcess.map(url => sem(async () => {
    const filename = createHashName(url);
    urlMap.set(url, `/images/products/${filename}`);
    const destPath = path.join(IMAGES_DIR, filename);

    // Skip if already exists
    if (fs.existsSync(destPath)) {
      done++;
      return;
    }

    try {
      const buf = await downloadImage(url);
      // High compression: quality 50, smart sub-sampling
      await sharp(buf)
        .webp({ quality: 50, effort: 6 })
        .toFile(destPath);
      done++;
    } catch (e) {
      failed++;
    }

    if ((done + failed) % 100 === 0) {
      console.log(`Progress: ${done + failed} / ${urlsToProcess.length} (Failed: ${failed})`);
    }
  }));

  await Promise.all(promises);
  console.log(`\nFinished downloading. Success: ${done}, Failed: ${failed}`);

  // Now rewrite URLs in products.json
  console.log("Rewriting URLs in products.json...");
  let changed = 0;
  for (const p of data.products) {
    if (p._source !== "yupoo_aristide") continue;
    
    if (p.coverImage && urlMap.has(p.coverImage)) {
      p.coverImage = urlMap.get(p.coverImage);
      changed++;
    }
    if (p.images) {
      for (let i=0; i<p.images.length; i++) {
        if (urlMap.has(p.images[i])) {
          p.images[i] = urlMap.get(p.images[i]);
          changed++;
        }
      }
    }
  }

  fs.writeFileSync(PRODUCTS_FILE, JSON.stringify(data, null, 2));
  console.log(`Rewrote ${changed} URLs in products.json`);

  // Do the same for products_index.json
  const indexData = JSON.parse(fs.readFileSync(INDEX_FILE, "utf-8"));
  let indexChanged = 0;
  for (const p of indexData.products) {
    if (p.coverImage && urlMap.has(p.coverImage)) {
      p.coverImage = urlMap.get(p.coverImage);
      indexChanged++;
    }
  }
  fs.writeFileSync(INDEX_FILE, JSON.stringify(indexData, null, 2));
  console.log(`Rewrote ${indexChanged} URLs in products_index.json`);
  
  console.log("\n✅ All done. Ready for Backblaze upload.");
}

main().catch(err => {
  console.error("Fatal error:", err);
  process.exit(1);
});
