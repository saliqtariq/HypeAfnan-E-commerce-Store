/**
 * Scrape ALL products from Yupoo "LP Clothes for Men" category
 * (https://aristide.x.yupoo.com/categories/5016303)
 * and add them to HypeAfnan's product data files under the
 * "Exclusive 1:1 Loro Piana" category (tagId: 999901).
 *
 * Run: node scripts/scrapeYupooLP.mjs
 */

import https from "https";
import http from "http";
import fs from "fs";
import path from "path";
import { fileURLToPath } from "url";

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const ROOT = path.join(__dirname, "..");

const PRODUCTS_FILE      = path.join(ROOT, "app/data/products.json");
const INDEX_FILE         = path.join(ROOT, "app/data/products_index.json");
const TAGS_FILE          = path.join(ROOT, "app/data/product_tags.json");
const CATEGORIES_FILE    = path.join(ROOT, "app/data/categories.json");

const YUPOO_BASE         = "https://aristide.x.yupoo.com";
const CATEGORY_ID        = "5016303"; // LP Clothes for Men
const TOTAL_PAGES        = 9;
const TAG_ID             = 999901;    // "Loro Piana clothes" inside "Exclusive 1:1 Loro Piana"
const GROUP_NAME         = "Exclusive 1:1 Loro Piana";
const TAG_NAME           = "Loro Piana clothes";
const DELAY_MS           = 800;       // Polite delay between requests

// ── HELPERS ────────────────────────────────────────────────────────────────

function sleep(ms) {
  return new Promise(resolve => setTimeout(resolve, ms));
}

function fetchHtml(urlStr) {
  return new Promise((resolve, reject) => {
    const parsed = new URL(urlStr);
    const lib = parsed.protocol === "https:" ? https : http;
    const req = lib.get({
      hostname: parsed.hostname,
      path: parsed.pathname + parsed.search,
      headers: {
        "User-Agent": "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/124.0.0.0 Safari/537.36",
        "Accept": "text/html,application/xhtml+xml,application/xml;q=0.9,*/*;q=0.8",
        "Accept-Language": "en-US,en;q=0.9",
        "Accept-Encoding": "identity",
      },
      timeout: 30000,
    }, (res) => {
      // Handle redirects
      if (res.statusCode >= 300 && res.statusCode < 400 && res.headers.location) {
        resolve(fetchHtml(res.headers.location));
        return;
      }
      let data = "";
      res.on("data", chunk => data += chunk);
      res.on("end", () => resolve(data));
    });
    req.on("error", reject);
    req.on("timeout", () => { req.destroy(); reject(new Error(`Timeout fetching ${urlStr}`)); });
  });
}

/**
 * Generate unique search codes that don't collide with existing ones.
 * Format: "LP" + 6-digit number, e.g. "LP100001"
 */
function generateSearchCodes(count, existingCodes) {
  const existing = new Set(existingCodes);
  const codes = [];
  let n = 100001;
  while (codes.length < count) {
    const code = `LP${n}`;
    if (!existing.has(code)) {
      codes.push(code);
      existing.add(code);
    }
    n++;
  }
  return codes;
}

/**
 * Parse album thumbnail + href from a category page's HTML.
 * Returns array of { title, href, thumbnailUrl }
 *
 * Actual Yupoo HTML structure:
 *   <a class="album__main" title="..." href="/albums/123?...">
 *     <div class="album__imgwrap">
 *       <img ... data-src="https://photo.yupoo.com/aristide/HASH/small.jpeg">
 */
function parseAlbumsFromCategoryPage(html) {
  const albums = [];

  // Split on each album__main block, then parse attributes within each block
  // We stop each block at the next <a class="album__main" or at </div> depth
  const blockRegex = /<a\s[^>]*class="[^"]*album__main[^"]*"[^>]*>[\s\S]*?<\/a>/g;
  let block;
  while ((block = blockRegex.exec(html)) !== null) {
    const blockStr = block[0];

    // Extract href (may come before or after title)
    const hrefMatch  = blockStr.match(/href="([^"]+)"/);
    // Extract title from the <a> opening tag only (first title= occurrence)
    const titleMatch = blockStr.match(/title="([^"]*)"/);
    // Extract data-src from the img inside the block
    const imgMatch   = blockStr.match(/data-src="([^"]+)"/);

    if (!hrefMatch || !imgMatch) continue;

    const href       = hrefMatch[1];
    const title      = titleMatch ? titleMatch[1].trim() : "";
    const thumbSmall = imgMatch[1].trim();

    // Convert "small.jpeg" / "thumb.jpeg" -> "medium.jpeg" for better cover resolution
    const thumbnailUrl = thumbSmall
      .replace(/\/small\.jpeg$/, "/medium.jpeg")
      .replace(/\/thumb\.jpeg$/, "/medium.jpeg");

    albums.push({ title, href, thumbnailUrl });
  }

  return albums;
}

/**
 * Parse all full-size image URLs from an album page.
 */
function parseImagesFromAlbumPage(html) {
  const images = [];
  const seen   = new Set();

  // Strategy 1: window.__initialState__ JSON
  const jsonMatch = html.match(/window\.__initialState__\s*=\s*(\{[\s\S]*?\});\s*<\/script>/);
  if (jsonMatch) {
    try {
      const state = JSON.parse(jsonMatch[1]);
      const photos = state?.album?.photos || state?.photos || [];
      for (const p of photos) {
        const url = p?.src || p?.url || p?.path || "";
        if (url && !seen.has(url)) { seen.add(url); images.push(url); }
      }
    } catch (_) {}
  }

  // Strategy 2: data-src on img tags with yupoo domain
  const imgRegex = /data-src="(https?:\/\/photo\.yupoo\.com\/aristide\/[^"]+\.jpeg)"/g;
  let m;
  while ((m = imgRegex.exec(html)) !== null) {
    const url = m[1]
      .replace(/\/thumb\.jpeg$/, "/big.jpeg")
      .replace(/\/small\.jpeg$/, "/big.jpeg")
      .replace(/\/medium\.jpeg$/, "/big.jpeg");
    if (!seen.has(url)) { seen.add(url); images.push(url); }
  }

  // Strategy 3: src attributes
  const srcRegex = /src="(https?:\/\/photo\.yupoo\.com\/aristide\/[^"]+\.jpeg)"/g;
  while ((m = srcRegex.exec(html)) !== null) {
    const url = m[1]
      .replace(/\/thumb\.jpeg$/, "/big.jpeg")
      .replace(/\/small\.jpeg$/, "/big.jpeg")
      .replace(/\/medium\.jpeg$/, "/big.jpeg");
    if (!seen.has(url)) { seen.add(url); images.push(url); }
  }

  return images;
}

// ── MAIN ───────────────────────────────────────────────────────────────────

async function main() {
  console.log("=== HypeAfnan Yupoo LP Clothes Scraper ===\n");

  // ── STEP 1: Load existing data ──────────────────────────────────────────
  console.log("Loading existing product data...");
  const productsData   = JSON.parse(fs.readFileSync(PRODUCTS_FILE, "utf-8"));
  const indexData      = JSON.parse(fs.readFileSync(INDEX_FILE, "utf-8"));
  const tagsData       = JSON.parse(fs.readFileSync(TAGS_FILE, "utf-8"));
  const categoriesData = JSON.parse(fs.readFileSync(CATEGORIES_FILE, "utf-8"));

  const existingIds   = new Set(productsData.products.map(p => p.id || p.goodsId));
  const existingCodes = new Set(productsData.products.map(p => p.searchCode).filter(Boolean));

  console.log(`Existing products:     ${productsData.products.length}`);
  console.log(`Existing search codes: ${existingCodes.size}`);

  // ── STEP 2: Scrape all category pages ──────────────────────────────────
  console.log(`\nScraping ${TOTAL_PAGES} category pages from Yupoo...`);
  const allAlbums = [];

  for (let page = 1; page <= TOTAL_PAGES; page++) {
    const url = `${YUPOO_BASE}/categories/${CATEGORY_ID}?page=${page}`;
    console.log(`  Page ${page}/${TOTAL_PAGES}: ${url}`);
    try {
      const html = await fetchHtml(url);
      const albums = parseAlbumsFromCategoryPage(html);
      console.log(`    Found ${albums.length} albums`);
      allAlbums.push(...albums);
    } catch (err) {
      console.error(`    ERROR on page ${page}: ${err.message}`);
    }
    if (page < TOTAL_PAGES) await sleep(DELAY_MS);
  }

  console.log(`\nTotal albums found: ${allAlbums.length}`);

  // Deduplicate by href
  const uniqueAlbums = [];
  const seenHrefs = new Set();
  for (const album of allAlbums) {
    if (!seenHrefs.has(album.href)) {
      seenHrefs.add(album.href);
      uniqueAlbums.push(album);
    }
  }
  console.log(`Unique albums after dedup: ${uniqueAlbums.length}`);

  // Filter out albums already in our DB
  const newAlbums = uniqueAlbums.filter(album => {
    const match = album.href.match(/\/albums\/(\d+)/);
    if (!match) return true;
    const productId = `yupoo_lp_${match[1]}`;
    return !existingIds.has(productId);
  });
  console.log(`New albums to process: ${newAlbums.length}`);

  if (newAlbums.length === 0) {
    console.log("\n✅ No new products to add. All albums already imported.");
    return;
  }

  // ── STEP 3: Visit each album page to get full-size images ──────────────
  console.log(`\nFetching full images for each album (this may take a while)...`);
  const processedProducts = [];

  for (let i = 0; i < newAlbums.length; i++) {
    const album = newAlbums[i];
    const match = album.href.match(/\/albums\/(\d+)/);
    const albumNumId = match ? match[1] : `unknown_${i}`;
    const productId  = `yupoo_lp_${albumNumId}`;

    process.stdout.write(`  [${i + 1}/${newAlbums.length}] "${album.title}" ... `);

    let images = [];
    try {
      const albumUrl  = `${YUPOO_BASE}${album.href}`;
      const albumHtml = await fetchHtml(albumUrl);
      images = parseImagesFromAlbumPage(albumHtml);
      process.stdout.write(`${images.length} images\n`);
    } catch (err) {
      process.stdout.write(`ERROR: ${err.message}\n`);
    }

    // Build cover URL at highest quality (big.jpeg)
    const coverImage = album.thumbnailUrl
      .replace(/\/medium\.jpeg$/, "/big.jpeg")
      .replace(/\/small\.jpeg$/,  "/big.jpeg");

    if (images.length === 0) {
      images = [coverImage];
    } else {
      // Deduplicate and put cover first if not already present
      const uniqueImages = [...new Set(images)];
      images = uniqueImages;
    }

    processedProducts.push({
      albumId:      albumNumId,
      productId,
      title:        album.title,
      thumbnailUrl: album.thumbnailUrl,
      coverImage,
      images,
    });

    await sleep(DELAY_MS);
  }

  console.log(`\nSuccessfully processed: ${processedProducts.length} products`);

  // ── STEP 4: Generate unique search codes ────────────────────────────────
  const newCodes = generateSearchCodes(processedProducts.length, existingCodes);

  // ── STEP 5: Build product objects in HypeAfnan format ───────────────────
  const timestamp = Date.now();
  const newFullProducts = processedProducts.map((p, i) => ({
    id:          p.productId,
    goodsId:     p.productId,
    title:       p.title,
    searchCode:  newCodes[i],
    coverImage:  p.coverImage,
    images:      p.images,
    shopId:      "yupoo_aristide",
    link:        `${YUPOO_BASE}/albums/${p.albumId}`,
    timestamp:   timestamp - i,
    tagId:       TAG_ID,
    tagName:     TAG_NAME,
    groupName:   GROUP_NAME,
    _source:     "yupoo_aristide",
  }));

  const newIndexProducts = newFullProducts.map(p => ({
    id:          p.id,
    goodsId:     p.goodsId,
    title:       p.title,
    searchCode:  p.searchCode,
    coverImage:  p.coverImage,
    shopId:      p.shopId,
    timestamp:   p.timestamp,
    tagId:       p.tagId,
    tagName:     p.tagName,
    groupName:   p.groupName,
  }));

  // ── STEP 6: Update products.json ────────────────────────────────────────
  console.log(`\nWriting ${newFullProducts.length} products to products.json...`);
  productsData.products = [...newFullProducts, ...productsData.products];
  fs.writeFileSync(PRODUCTS_FILE, JSON.stringify(productsData, null, 2));
  console.log(`  ✅ products.json updated (total: ${productsData.products.length})`);

  // ── STEP 7: Update products_index.json ──────────────────────────────────
  console.log(`Writing ${newIndexProducts.length} products to products_index.json...`);
  indexData.products = [...newIndexProducts, ...indexData.products];
  fs.writeFileSync(INDEX_FILE, JSON.stringify(indexData, null, 2));
  console.log(`  ✅ products_index.json updated (total: ${indexData.products.length})`);

  // ── STEP 8: Update product_tags.json ────────────────────────────────────
  console.log(`Updating product_tags.json...`);
  for (const p of newFullProducts) {
    tagsData[p.id] = [TAG_ID];
  }
  fs.writeFileSync(TAGS_FILE, JSON.stringify(tagsData, null, 2));
  console.log(`  ✅ product_tags.json updated`);

  // ── STEP 9: Update categories.json item count ───────────────────────────
  console.log(`Updating categories.json item count...`);
  const exclusiveGroup = categoriesData.find(g => g.groupName === GROUP_NAME);
  if (exclusiveGroup) {
    const loroTag = exclusiveGroup.tags.find(t => t.tagId === TAG_ID);
    if (loroTag) {
      loroTag.itemCount += newFullProducts.length;
      console.log(`  ✅ itemCount updated to ${loroTag.itemCount}`);
    }
  }
  fs.writeFileSync(CATEGORIES_FILE, JSON.stringify(categoriesData, null, 2));
  console.log(`  ✅ categories.json updated`);

  // ── STEP 10: Summary ────────────────────────────────────────────────────
  console.log(`\n${"=".repeat(55)}`);
  console.log(`✅ DONE! Added ${newFullProducts.length} LP Loro Piana products.`);
  console.log(`   Search codes: ${newCodes[0]} → ${newCodes[newCodes.length - 1]}`);
  console.log(`   Category:     ${GROUP_NAME} > ${TAG_NAME}`);
  if (newFullProducts[0]) {
    console.log(`\nSample product:`);
    const s = newFullProducts[0];
    console.log(`  ID:         ${s.id}`);
    console.log(`  Title:      ${s.title}`);
    console.log(`  SearchCode: ${s.searchCode}`);
    console.log(`  Cover:      ${s.coverImage}`);
    console.log(`  Images:     ${s.images.length} total`);
  }
  console.log(`\n📸 Images use Yupoo CDN (photo.yupoo.com).`);
  console.log(`   Make sure your image proxy supports this domain.`);
}

main().catch(err => {
  console.error("\n❌ Fatal error:", err);
  process.exit(1);
});
