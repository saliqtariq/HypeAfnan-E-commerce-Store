/**
 * Rebuild product_tags.json by scraping all products from Topokay
 * and extracting the tags[] embedded in each product's response.
 * 
 * This is the CORRECT approach — the /album/personal/all endpoint 
 * returns each product with its actual tags[] array.
 */

import puppeteer from "puppeteer";
import fs from "fs";
import path from "path";
import { fileURLToPath } from "url";
import https from "https";

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const PRODUCT_TAGS_FILE = path.join(__dirname, "../app/data/product_tags.json");
const TAG_MAP_FILE = path.join(__dirname, "../app/data/tag_map.json");

const ALBUM_ID = "A201803290923342160071483";
const BASE_HOST = `${ALBUM_ID.toLowerCase()}.szwego.com`;
const BASE_URL = `https://${BASE_HOST}`;
const STORE_URL = `${BASE_URL}/weshop/store/${ALBUM_ID}`;

function fetchWithCookies(urlStr, cookieHeader, userAgent) {
  return new Promise((resolve, reject) => {
    const url = new URL(urlStr);
    const options = {
      hostname: url.hostname,
      path: url.pathname + url.search,
      method: "GET",
      headers: {
        "User-Agent": userAgent,
        Accept: "application/json, text/plain, */*",
        "Accept-Language": "en-US,en;q=0.9",
        Referer: STORE_URL,
        Origin: BASE_URL,
        Cookie: cookieHeader,
      },
    };
    const req = https.request(options, (res) => {
      let data = "";
      res.on("data", (chunk) => (data += chunk));
      res.on("end", () => {
        try { resolve(JSON.parse(data)); }
        catch (e) { reject(new Error(`Parse error: ${data.substring(0, 300)}`)); }
      });
    });
    req.on("error", reject);
    req.setTimeout(30000, () => { req.destroy(); reject(new Error("Timeout")); });
    req.end();
  });
}

function buildApiUrl(params = {}) {
  const query = new URLSearchParams({
    albumId: ALBUM_ID,
    startDate: "",
    endDate: "",
    auditPassword: "",
    requestDataType: "",
    transLang: "en",
    ...params,
  });
  return `${BASE_URL}/album/personal/all?&${query.toString()}`;
}

(async () => {
  console.log("=== Rebuild product_tags.json from embedded tags in API response ===");
  console.log("Strategy: Paginate all products, extract tags[] from each item\n");

  // Load existing tag map for reference
  const tagMap = JSON.parse(fs.readFileSync(TAG_MAP_FILE, "utf-8"));
  console.log(`Tag map has ${Object.keys(tagMap).length} known tags`);

  // Load existing product_tags as starting point (preserve what we have)
  let productTagsMap = {};
  if (fs.existsSync(PRODUCT_TAGS_FILE)) {
    productTagsMap = JSON.parse(fs.readFileSync(PRODUCT_TAGS_FILE, "utf-8"));
    const existing = Object.keys(productTagsMap).length;
    console.log(`Starting with ${existing} existing product→tag mappings`);
  }

  // Step 1: Get session cookies
  console.log("\nStep 1: Launching browser to get session cookies...");
  const browser = await puppeteer.launch({
    headless: true,
    args: ["--no-sandbox", "--disable-setuid-sandbox", "--window-size=1280,900"],
  });
  const page = await browser.newPage();
  const UA = "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/124.0.0.0 Safari/537.36";
  await page.setUserAgent(UA);
  await page.goto(STORE_URL, { waitUntil: "networkidle2", timeout: 60000 });
  await new Promise((r) => setTimeout(r, 3000));
  const cookies = await page.cookies();
  const cookieHeader = cookies.map((c) => `${c.name}=${c.value}`).join("; ");
  console.log(`Got ${cookies.length} session cookies.`);
  await browser.close();

  // Step 2: Paginate through ALL products and extract tags
  console.log("\nStep 2: Paginating all products and extracting embedded tags...");
  let pageTimestamp = "";
  let pageNum = 0;
  let hasMore = true;
  let totalProcessed = 0;
  let totalTagged = 0;
  let newTagsAdded = 0;

  while (hasMore) {
    pageNum++;
    const params = pageTimestamp ? { slipType: "1", timestamp: pageTimestamp } : {};
    const url = buildApiUrl(params);

    try {
      const json = await fetchWithCookies(url, cookieHeader, UA);
      if (!json.success) {
        console.log(`Error on page ${pageNum}: ${json.errmsg}`);
        break;
      }

      const items = json.result?.items || [];
      const pagination = json.result?.pagination || {};

      for (const item of items) {
        const pId = item.goods_id;
        if (!pId) continue;

        totalProcessed++;

        // Extract tags embedded in this product's response
        const itemTags = item.tags || [];
        if (itemTags.length > 0) {
          totalTagged++;
          const tagIds = itemTags
            .map((t) => t.tagId || t.tag_id)
            .filter((tid) => tid && tagMap[String(tid)]); // only known tags

          if (tagIds.length > 0) {
            if (!productTagsMap[pId]) {
              productTagsMap[pId] = [];
              newTagsAdded++;
            }
            for (const tid of tagIds) {
              if (!productTagsMap[pId].includes(Number(tid))) {
                productTagsMap[pId].push(Number(tid));
              }
            }
          }
        }
      }

      console.log(`Page ${pageNum}: ${items.length} items | Tagged: ${totalTagged}/${totalProcessed} | New mappings: ${newTagsAdded}`);

      // Save every 10 pages
      if (pageNum % 10 === 0) {
        fs.writeFileSync(PRODUCT_TAGS_FILE, JSON.stringify(productTagsMap, null, 2));
        console.log(`  💾 Saved checkpoint (${Object.keys(productTagsMap).length} total mappings)`);
      }

      if (pagination.isLoadMore && pagination.pageTimestamp) {
        pageTimestamp = pagination.pageTimestamp;
        await new Promise((r) => setTimeout(r, 300));
      } else {
        hasMore = false;
      }

      if (pageNum > 100000) { hasMore = false; console.log("Safety limit."); }
    } catch (err) {
      console.error(`Error on page ${pageNum}:`, err.message);
      hasMore = false;
    }
  }

  // Final save
  fs.writeFileSync(PRODUCT_TAGS_FILE, JSON.stringify(productTagsMap, null, 2));

  const totalMappings = Object.keys(productTagsMap).length;
  console.log(`\n=== DONE! ===`);
  console.log(`Total products scanned : ${totalProcessed}`);
  console.log(`Products with tags     : ${totalTagged}`);
  console.log(`Total tag mappings     : ${totalMappings}`);

  // Show category counts
  const tagCounts = {};
  for (const tags of Object.values(productTagsMap)) {
    for (const tid of tags) {
      tagCounts[tid] = (tagCounts[tid] || 0) + 1;
    }
  }
  const topCategories = Object.entries(tagCounts)
    .sort(([,a],[,b]) => b - a)
    .slice(0, 10);
  console.log("\nTop 10 categories by product count:");
  for (const [tid, count] of topCategories) {
    console.log(`  ${tagMap[tid]?.tagName || tid}: ${count} products`);
  }
})();
