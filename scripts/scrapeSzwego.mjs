/**
 * Scrape ALL products from Topokay Szwego using Puppeteer to handle auth cookies,
 * then call the pagination API directly.
 */

import puppeteer from "puppeteer";
import fs from "fs";
import path from "path";
import { fileURLToPath } from "url";
import https from "https";

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const OUTPUT_FILE = path.join(__dirname, "../app/data/products.json");

const ALBUM_ID = "A201803290923342160071483";
const BASE_HOST = `${ALBUM_ID.toLowerCase()}.szwego.com`;
const BASE_URL = `https://${BASE_HOST}`;
const STORE_URL = `${BASE_URL}/weshop/store/${ALBUM_ID}`;

function normalizeProduct(item) {
  return {
    id: item.goods_id || "",
    goodsId: item.goods_id || "",
    title: item.title || "",
    searchCode: item.mark_code || "",
    coverImage: (item.imgsSrc && item.imgsSrc[0]) || "",
    images: item.imgsSrc || [],
    shopId: item.shop_id || "",
    link: item.link || "",
    timestamp: item.time_stamp || item.new_send_time || 0,
  };
}

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
        try {
          resolve(JSON.parse(data));
        } catch (e) {
          reject(new Error(`Parse error: ${data.substring(0, 300)}`));
        }
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
  console.log("=== Topokay Full Scraper ===");

  // Step 1: Open browser, load store page to get auth cookies
  console.log("Step 1: Launching browser to get session cookies...");
  const browser = await puppeteer.launch({
    headless: true,
    args: ["--no-sandbox", "--disable-setuid-sandbox", "--window-size=1280,900"],
  });

  const page = await browser.newPage();
  const UA = "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/124.0.0.0 Safari/537.36";
  await page.setUserAgent(UA);
  await page.setViewport({ width: 1280, height: 900 });

  // Collect initial products from intercepted responses while loading
  const allProducts = [];
  const seenIds = new Set();
  let cookieHeader = "";

  page.on("response", async (response) => {
    const url = response.url();
    const ct = response.headers()["content-type"] || "";
    if (!ct.includes("application/json")) return;
    if (!url.includes("album/personal/all")) return;
    try {
      const json = await response.json();
      const items = json?.result?.items || [];
      for (const item of items) {
        const id = item.goods_id;
        if (id && !seenIds.has(id)) {
          seenIds.add(id);
          allProducts.push(normalizeProduct(item));
        }
      }
      console.log(`  Browser intercepted ${items.length} products. Total: ${allProducts.length}`);
    } catch (e) {}
  });

  await page.goto(STORE_URL, { waitUntil: "networkidle2", timeout: 60000 });
  await new Promise((r) => setTimeout(r, 3000));

  // Get cookies
  const cookies = await page.cookies();
  cookieHeader = cookies.map((c) => `${c.name}=${c.value}`).join("; ");
  console.log(`Got ${cookies.length} cookies.`);
  await browser.close();
  console.log(`After browser load: ${allProducts.length} products collected.\n`);

  // Step 2: Paginate through all remaining products using the API directly
  console.log("Step 2: Fetching all pages via API...");

  // We need to find the pageTimestamp from initial load to continue pagination
  // Start from scratch with a fresh first request using our cookies
  let pageTimestamp = "";
  let pageNum = 0;
  let hasMore = true;

  // Reset and re-fetch everything cleanly via API (the browser load already got page 1)
  const apiProducts = [];
  const apiSeenIds = new Set();

  while (hasMore) {
    pageNum++;
    const params = pageTimestamp ? { slipType: "1", timestamp: pageTimestamp } : {};
    const url = buildApiUrl(params);
    console.log(`Page ${pageNum} (timestamp=${pageTimestamp || "initial"})...`);

    try {
      const json = await fetchWithCookies(url, cookieHeader, UA);

      if (!json.success) {
        console.log(`Error: errcode=${json.errcode}, errmsg=${json.errmsg}`);
        break;
      }

      const items = json.result?.items || [];
      const pagination = json.result?.pagination || {};

      for (const item of items) {
        const id = item.goods_id;
        if (id && !apiSeenIds.has(id)) {
          apiSeenIds.add(id);
          apiProducts.push(normalizeProduct(item));
        }
      }

      console.log(`  Items: ${items.length}, Total: ${apiProducts.length}, isLoadMore: ${pagination.isLoadMore}`);

      // Save intermediately
      fs.mkdirSync(path.dirname(OUTPUT_FILE), { recursive: true });
      fs.writeFileSync(OUTPUT_FILE, JSON.stringify({ products: apiProducts }, null, 2));

      if (pagination.isLoadMore && pagination.pageTimestamp) {
        pageTimestamp = pagination.pageTimestamp;
        await new Promise((r) => setTimeout(r, 400));
      } else {
        hasMore = false;
      }

      if (pageNum > 1000) { hasMore = false; console.log("Safety limit reached."); }
    } catch (err) {
      console.error(`Error on page ${pageNum}:`, err.message);
      hasMore = false;
    }
  }

  console.log(`\n=== Done! Total products: ${apiProducts.length} ===`);
  console.log(`Saved to: ${OUTPUT_FILE}`);
  if (apiProducts[1]) console.log("Sample:", JSON.stringify(apiProducts[1], null, 2));
})();
