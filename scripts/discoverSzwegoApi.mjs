import puppeteer from "puppeteer";
import fs from "fs";

const SHOP_ID = "A201803290923342160071483";
const URL = `https://a201803290923342160071483.szwego.com/weshop/store/${SHOP_ID}`;

(async () => {
  console.log("Launching browser...");
  const browser = await puppeteer.launch({ headless: true });
  const page = await browser.newPage();

  page.on("response", async (response) => {
    const url = response.url();
    if (url.includes("/goods/list") || url.includes("api")) {
      try {
        const contentType = response.headers()["content-type"];
        if (contentType && contentType.includes("application/json")) {
          const json = await response.json();
          if (json && json.result && json.result.goodsList) {
            console.log("Intercepted goods JSON from:", url);
            fs.writeFileSync(
              "szwego_api_sample.json",
              JSON.stringify(json, null, 2)
            );
          }
        }
      } catch (e) {}
    }
  });

  console.log("Navigating to URL...");
  await page.goto(URL, { waitUntil: "networkidle2" });
  console.log("Waiting for a moment...");
  await new Promise((r) => setTimeout(r, 3000));
  await browser.close();
  console.log("Done. Check szwego_api_sample.json if created.");
})();
