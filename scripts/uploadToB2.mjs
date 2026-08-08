import fs from "fs";
import path from "path";
import https from "https";
import crypto from "crypto";

// Read credentials from .env.local
const envPath = path.join(process.cwd(), ".env.local");
if (fs.existsSync(envPath)) {
  const envContent = fs.readFileSync(envPath, "utf-8");
  envContent.split("\n").forEach((line) => {
    const match = line.match(/^([^=]+)=(.*)$/);
    if (match) {
      process.env[match[1].trim()] = match[2].trim();
    }
  });
}

const keyId = process.env.B2_KEY_ID;
const applicationKey = process.env.B2_APPLICATION_KEY;
const bucketName = process.env.B2_BUCKET_NAME || "HypeAfnan-images";

if (!keyId || !applicationKey) {
  console.error("❌ Missing B2 credentials in .env.local");
  process.exit(1);
}

function httpRequest(url, options, body = null) {
  return new Promise((resolve, reject) => {
    const req = https.request(url, options, (res) => {
      let data = "";
      res.on("data", (chunk) => (data += chunk));
      res.on("end", () => {
        try {
          const parsed = JSON.parse(data);
          if (res.statusCode >= 200 && res.statusCode < 300) {
            resolve(parsed);
          } else {
            reject(new Error(`HTTP ${res.statusCode}: ${JSON.stringify(parsed)}`));
          }
        } catch (e) {
          if (res.statusCode >= 200 && res.statusCode < 300) {
            resolve(data);
          } else {
            reject(new Error(`HTTP ${res.statusCode}: ${data}`));
          }
        }
      });
    });
    req.on("error", reject);
    if (body) req.write(body);
    req.end();
  });
}

async function getUploadTarget(apiUrl, authorizationToken, bucketId) {
  return await httpRequest(
    `${apiUrl}/b2api/v2/b2_get_upload_url`,
    {
      method: "POST",
      headers: { Authorization: authorizationToken, "Content-Type": "application/json" },
    },
    JSON.stringify({ bucketId })
  );
}

function uploadRawFile(uploadUrl, uploadAuthToken, fileName, fileBuffer) {
  return new Promise((resolve, reject) => {
    const sha1 = crypto.createHash("sha1").update(fileBuffer).digest("hex");
    const encodedPath = encodeURIComponent(`images/products/${fileName}`).replace(/%2F/gi, "/");

    const req = https.request(
      uploadUrl,
      {
        method: "POST",
        headers: {
          Authorization: uploadAuthToken,
          "X-Bz-File-Name": encodedPath,
          "Content-Type": "image/webp",
          "Content-Length": fileBuffer.length,
          "X-Bz-Content-Sha1": sha1,
          "X-Bz-Info-Cache-Control": encodeURIComponent("max-age=31536000, public"),
        },
      },
      (res) => {
        let data = "";
        res.on("data", (c) => (data += c));
        res.on("end", () => {
          if (res.statusCode === 200) {
            resolve(true);
          } else {
            reject(new Error(`Status ${res.statusCode}: ${data}`));
          }
        });
      }
    );

    req.on("error", reject);
    req.write(fileBuffer);
    req.end();
  });
}

async function main() {
  console.log("🚀 Authorizing Backblaze B2 account...");
  const authHeader = "Basic " + Buffer.from(`${keyId}:${applicationKey}`).toString("base64");

  const authRes = await httpRequest("https://api.backblazeb2.com/b2api/v2/b2_authorize_account", {
    method: "GET",
    headers: { Authorization: authHeader },
  });

  const { apiUrl, authorizationToken, accountId } = authRes;
  console.log(`✅ Authorized! Account ID: ${accountId}`);

  // Find bucket ID
  const bucketsRes = await httpRequest(
    `${apiUrl}/b2api/v2/b2_list_buckets`,
    {
      method: "POST",
      headers: { Authorization: authorizationToken, "Content-Type": "application/json" },
    },
    JSON.stringify({ accountId, bucketName })
  );

  const bucket = bucketsRes.buckets?.find((b) => b.bucketName === bucketName) || bucketsRes.buckets?.[0];
  if (!bucket) {
    console.error(`❌ Bucket "${bucketName}" not found!`);
    process.exit(1);
  }
  const bucketId = bucket.bucketId;
  console.log(`✅ Found Bucket ID: ${bucketId} (${bucket.bucketName})`);

  const IMAGES_DIR = path.join(process.cwd(), "public", "images", "products");
  const files = fs.readdirSync(IMAGES_DIR).filter((f) => f.endsWith(".webp"));
  console.log(`📁 Starting upload for ${files.length.toLocaleString()} images...\n`);

  let uploadedCount = 0;
  let failedCount = 0;
  const startTime = Date.now();
  let fileIndex = 0;

  const CONCURRENCY = 15;

  async function worker() {
    while (fileIndex < files.length) {
      const idx = fileIndex++;
      if (idx >= files.length) break;
      const fileName = files[idx];
      const filePath = path.join(IMAGES_DIR, fileName);
      const buffer = fs.readFileSync(filePath);

      let success = false;
      let lastErr = null;
      for (let attempt = 0; attempt < 3; attempt++) {
        try {
          const target = await getUploadTarget(apiUrl, authorizationToken, bucketId);
          await uploadRawFile(target.uploadUrl, target.authorizationToken, fileName, buffer);
          uploadedCount++;
          success = true;
          break;
        } catch (err) {
          lastErr = err;
        }
      }

      if (!success) {
        failedCount++;
        console.error(`❌ Failed ${fileName}:`, lastErr?.message || lastErr);
      }

      if ((uploadedCount + failedCount) % 100 === 0 || (uploadedCount + failedCount) === files.length) {
        const elapsedSec = (Date.now() - startTime) / 1000;
        const progress = (((uploadedCount + failedCount) / files.length) * 100).toFixed(1);
        const speed = ((uploadedCount + failedCount) / (elapsedSec || 1)).toFixed(1);
        console.log(
          `[${progress}%] Uploaded ${uploadedCount.toLocaleString()}, Failed ${failedCount.toLocaleString()} / ${files.length.toLocaleString()} (${speed} files/sec | ${Math.round(elapsedSec)}s elapsed)`
        );
      }
    }
  }

  const workers = Array.from({ length: CONCURRENCY }, () => worker());
  await Promise.all(workers);

  console.log("\n🎉 ALL UPLOADS COMPLETED SUCCESSFULLY!");
  console.log(`Uploaded  : ${uploadedCount.toLocaleString()}`);
  console.log(`Failed    : ${failedCount.toLocaleString()}`);
  console.log(`Total Time: ${((Date.now() - startTime) / 1000 / 60).toFixed(1)} minutes`);
}

main().catch(console.error);
