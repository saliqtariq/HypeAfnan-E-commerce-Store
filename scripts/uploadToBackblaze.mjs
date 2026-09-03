/**
 * Upload local product images to Backblaze B2 (S3-compatible API).
 *
 * - Reads all .webp files from public/images/products/
 * - Skips files already uploaded (checkpoint-based resume)
 * - Uploads with high concurrency using presigned S3 PUT
 * - Updates products_local.json image URLs to point at CDN
 */

import fs from "fs";
import path from "path";
import https from "https";
import crypto from "crypto";
import { fileURLToPath } from "url";
import { readFileSync } from "fs";

const __dirname = path.dirname(fileURLToPath(import.meta.url));

// --- Load .env.local manually ---
const envPath = path.join(__dirname, "../.env.local");
const env = {};
if (fs.existsSync(envPath)) {
  for (const line of fs.readFileSync(envPath, "utf-8").split("\n")) {
    const [k, ...v] = line.trim().split("=");
    if (k && v.length) env[k.trim()] = v.join("=").trim();
  }
}

const KEY_ID      = env.B2_KEY_ID;
const APP_KEY     = env.B2_APPLICATION_KEY;
const BUCKET      = env.B2_BUCKET_NAME;
const ENDPOINT    = env.B2_ENDPOINT; // e.g. s3.us-east-005.backblazeb2.com

if (!KEY_ID || !APP_KEY || !BUCKET || !ENDPOINT) {
  console.error("Missing B2 credentials in .env.local");
  process.exit(1);
}

const CDN_BASE       = `https://${BUCKET}.${ENDPOINT}`;
const IMAGES_DIR     = path.join(__dirname, "../public/images/products");
const PRODUCTS_FILE  = path.join(__dirname, "../app/data/products_local.json");
const CHECKPOINT     = path.join(__dirname, "../app/data/upload_checkpoint.json");
const CONCURRENCY    = 50;

// --- HELPERS ---
function hmacSha256(key, data) {
  return crypto.createHmac("sha256", key).update(data).digest();
}
function sha256hex(data) {
  return crypto.createHash("sha256").update(data).digest("hex");
}
function toHex(buf) {
  return buf.toString("hex");
}

function getSignatureKey(key, dateStamp, regionName, serviceName) {
  const kDate    = hmacSha256("AWS4" + key, dateStamp);
  const kRegion  = hmacSha256(kDate, regionName);
  const kService = hmacSha256(kRegion, serviceName);
  const kSigning = hmacSha256(kService, "aws4_request");
  return kSigning;
}

function buildAuthHeader(method, objectKey, fileBuffer) {
  const region      = ENDPOINT.split(".")[1]; // e.g. us-east-005
  const service     = "s3";
  const host        = `${BUCKET}.${ENDPOINT}`;
  const now         = new Date();
  const amzDate     = now.toISOString().replace(/[:-]|\.\d{3}/g, "").slice(0, 15) + "Z";
  const dateStamp   = amzDate.slice(0, 8);
  const payloadHash = sha256hex(fileBuffer);
  const contentType = "image/webp";

  const canonicalHeaders = `content-type:${contentType}\nhost:${host}\nx-amz-content-sha256:${payloadHash}\nx-amz-date:${amzDate}\n`;
  const signedHeaders    = "content-type;host;x-amz-content-sha256;x-amz-date";
  const canonicalUri     = `/${encodeURIComponent(objectKey).replace(/%2F/g, "/")}`;
  const canonicalRequest = [method, canonicalUri, "", canonicalHeaders, signedHeaders, payloadHash].join("\n");

  const credentialScope  = `${dateStamp}/${region}/${service}/aws4_request`;
  const stringToSign     = `AWS4-HMAC-SHA256\n${amzDate}\n${credentialScope}\n${sha256hex(canonicalRequest)}`;
  const signingKey       = getSignatureKey(APP_KEY, dateStamp, region, service);
  const signature        = toHex(hmacSha256(signingKey, stringToSign));
  const authHeader       = `AWS4-HMAC-SHA256 Credential=${KEY_ID}/${credentialScope}, SignedHeaders=${signedHeaders}, Signature=${signature}`;

  return { authHeader, amzDate, payloadHash, contentType, host, canonicalUri };
}

function uploadFile(fileName, fileBuffer) {
  return new Promise((resolve, reject) => {
    const objectKey = `products/${fileName}`;
    const { authHeader, amzDate, payloadHash, contentType, host, canonicalUri } = buildAuthHeader("PUT", objectKey, fileBuffer);

    const options = {
      hostname: host,
      path: canonicalUri,
      method: "PUT",
      headers: {
        "Content-Type": contentType,
        "Content-Length": fileBuffer.length,
        "x-amz-content-sha256": payloadHash,
        "x-amz-date": amzDate,
        "Authorization": authHeader,
      },
      timeout: 30000,
    };

    const req = https.request(options, (res) => {
      let body = "";
      res.on("data", (d) => body += d);
      res.on("end", () => {
        if (res.statusCode === 200 || res.statusCode === 204) {
          resolve(`${CDN_BASE}/products/${fileName}`);
        } else {
          reject(new Error(`HTTP ${res.statusCode}: ${body.slice(0, 200)}`));
        }
      });
    });
    req.on("error", reject);
    req.on("timeout", () => { req.destroy(); reject(new Error("timeout")); });
    req.write(fileBuffer);
    req.end();
  });
}

// Semaphore
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

// --- MAIN ---
async function main() {
  const allFiles = fs.readdirSync(IMAGES_DIR).filter(f => f.endsWith(".webp"));
  console.log(`Found ${allFiles.length} local images to upload.\n`);

  // Load checkpoint
  let uploaded = new Set();
  if (fs.existsSync(CHECKPOINT)) {
    try { uploaded = new Set(JSON.parse(fs.readFileSync(CHECKPOINT, "utf-8"))); }
    catch (_) {}
  }
  const toUpload = allFiles.filter(f => !uploaded.has(f));
  console.log(`Already uploaded: ${uploaded.size}. Remaining: ${toUpload.length}\n`);

  const sem = semaphore(CONCURRENCY);
  let done = uploaded.size;
  let lastSave = done;

  const promises = toUpload.map(fileName =>
    sem(async () => {
      const filePath = path.join(IMAGES_DIR, fileName);
      const buf = fs.readFileSync(filePath);
      try {
        await uploadFile(fileName, buf);
        uploaded.add(fileName);
      } catch (err) {
        // log but don't crash — skip and continue
        console.error(`  ✗ ${fileName}: ${err.message}`);
      }
      done++;
      const total = allFiles.length;
      if (done % 100 === 0 || done === total) {
        const pct = ((done / total) * 100).toFixed(1);
        console.log(`[${pct}%] ${done}/${total} uploaded`);
      }
      // Save checkpoint every 200 files
      if (done - lastSave >= 200) {
        lastSave = done;
        fs.writeFileSync(CHECKPOINT, JSON.stringify([...uploaded], null, 2));
      }
    })
  );

  await Promise.all(promises);
  fs.writeFileSync(CHECKPOINT, JSON.stringify([...uploaded], null, 2));

  // --- Update products_local.json URLs ---
  console.log("\nUpdating products_local.json with CDN URLs...");
  const data = JSON.parse(fs.readFileSync(PRODUCTS_FILE, "utf-8"));
  let updated = 0;
  for (const product of data.products) {
    if (!product) continue;
    if (Array.isArray(product.images)) {
      product.images = product.images.map(url => {
        if (url && url.startsWith("/images/products/")) {
          updated++;
          return `${CDN_BASE}/products/${path.basename(url)}`;
        }
        return url;
      });
    }
    if (product.coverImage && product.coverImage.startsWith("/images/products/")) {
      product.coverImage = `${CDN_BASE}/products/${path.basename(product.coverImage)}`;
    }
  }
  fs.writeFileSync(PRODUCTS_FILE, JSON.stringify(data, null, 2));
  console.log(`✅ Updated ${updated} image URLs to CDN in products_local.json`);

  console.log(`\n✅ UPLOAD COMPLETE!`);
  console.log(`   Uploaded : ${uploaded.size} files`);
  console.log(`   CDN Base : ${CDN_BASE}/products/`);
}

main().catch(err => {
  console.error("Fatal:", err);
  process.exit(1);
});
