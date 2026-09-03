import puppeteer from "puppeteer";
import https from "https";

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
        try { resolve(JSON.parse(data)); } catch (e) { reject(e); }
      });
    });
    req.on("error", reject);
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
  const browser = await puppeteer.launch({
    headless: true,
    args: ["--no-sandbox", "--disable-setuid-sandbox", "--window-size=1280,900"],
  });
  const page = await browser.newPage();
  const UA = "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/124.0.0.0 Safari/537.36";
  await page.setUserAgent(UA);
  await page.goto(STORE_URL, { waitUntil: "networkidle2" });
  const cookies = await page.cookies();
  const cookieHeader = cookies.map((c) => `${c.name}=${c.value}`).join("; ");
  await browser.close();

  console.log("Testing with tagId...");
  // Test with tagId = 99119147 (Ralph Lauren, expected 17 items)
  const url = buildApiUrl({ tagId: "99119147" });
  const res = await fetchWithCookies(url, cookieHeader, UA);
  console.log("Result items length:", res.result?.items?.length);
  if (res.result?.items?.length) {
    const tags = res.result.items[0].tags;
    console.log("First item tags:", tags);
  }
})();
