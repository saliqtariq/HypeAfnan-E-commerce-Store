import puppeteer from "puppeteer";
import fs from "fs";
import path from "path";
import { fileURLToPath } from "url";

const __dirname = path.dirname(fileURLToPath(import.meta.url));

const SHOP_URL =
  "https://a201803290923342160071483.szwego.com/weshop/store/A201803290923342160071483";

const allRequests = [];

(async () => {
  console.log("Launching Chromium...");
  const browser = await puppeteer.launch({
    headless: true,
    args: [
      "--no-sandbox",
      "--disable-setuid-sandbox",
      "--disable-blink-features=AutomationControlled",
      "--window-size=1280,900",
    ],
  });

  const page = await browser.newPage();
  await page.setViewport({ width: 1280, height: 900 });

  // Pretend to be a real browser
  await page.setUserAgent(
    "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/124.0.0.0 Safari/537.36"
  );

  // Log ALL network responses with their URLs and content types
  page.on("response", async (response) => {
    const url = response.url();
    const contentType = response.headers()["content-type"] || "";
    const status = response.status();
    
    // Log all JSON responses
    if (contentType.includes("application/json") || contentType.includes("text/json")) {
      try {
        const json = await response.json();
        const record = { url, status, contentType, body: json };
        allRequests.push(record);
        console.log(`[JSON] ${status} ${url.substring(0, 100)}`);
        
        // Print a summary of the data structure
        if (json && typeof json === "object") {
          const keys = Object.keys(json);
          console.log(`  Keys: ${keys.join(", ")}`);
        }
      } catch (e) {}
    }
  });

  console.log(`Navigating to ${SHOP_URL}...`);
  await page.goto(SHOP_URL, { waitUntil: "load", timeout: 60000 });
  
  console.log("Waiting for JS to execute...");
  await new Promise((r) => setTimeout(r, 8000));
  
  // Take screenshot to verify page loaded
  await page.screenshot({ path: path.join(__dirname, "debug_screenshot.png"), fullPage: false });
  console.log("Screenshot saved to scripts/debug_screenshot.png");
  
  // Get page HTML after JS execution
  const html = await page.content();
  fs.writeFileSync(path.join(__dirname, "debug_page.html"), html);
  console.log(`Saved page HTML (${html.length} bytes) to scripts/debug_page.html`);
  
  // Check what's in the DOM - look for product elements
  const productInfo = await page.evaluate(() => {
    const imgs = Array.from(document.querySelectorAll("img")).map(img => img.src).filter(s => s && !s.includes("data:")).slice(0, 10);
    const allText = document.body.innerText.substring(0, 2000);
    return { imgs, allText };
  });
  
  console.log("\n=== Page Images Found ===");
  productInfo.imgs.forEach(img => console.log(" ", img));
  console.log("\n=== Page Text ===");
  console.log(productInfo.allText);
  
  console.log(`\n=== Total JSON API calls intercepted: ${allRequests.length} ===`);
  
  // Save all intercepted requests
  fs.writeFileSync(
    path.join(__dirname, "debug_requests.json"),
    JSON.stringify(allRequests, null, 2)
  );
  console.log("Saved all JSON requests to scripts/debug_requests.json");
  
  await browser.close();
})();
