import fs from "fs";
import path from "path";
import https from "https";

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

async function main() {
  console.log("🚀 Authorizing Backblaze B2 account...");
  const authHeader = "Basic " + Buffer.from(`${keyId}:${applicationKey}`).toString("base64");

  const authRes = await httpRequest("https://api.backblazeb2.com/b2api/v2/b2_authorize_account", {
    method: "GET",
    headers: { Authorization: authHeader },
  });

  const { apiUrl, authorizationToken, accountId } = authRes;
  console.log(`✅ Authorized!`);

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
  console.log(`✅ Found Bucket ID: ${bucketId}`);

  let nextFileName = null;
  let totalDeleted = 0;
  let hasMore = true;
  const CONCURRENCY = 50;

  while (hasMore) {
    const listBody = {
      bucketId,
      maxFileCount: 1000,
    };
    if (nextFileName) listBody.startFileName = nextFileName;

    const listRes = await httpRequest(
      `${apiUrl}/b2api/v2/b2_list_file_names`,
      {
        method: "POST",
        headers: { Authorization: authorizationToken, "Content-Type": "application/json" },
      },
      JSON.stringify(listBody)
    );

    const files = listRes.files || [];
    nextFileName = listRes.nextFileName;
    hasMore = !!nextFileName;

    if (files.length === 0) break;
    
    console.log(`Deleting block of ${files.length} files...`);

    let fileIndex = 0;
    async function worker() {
      while (fileIndex < files.length) {
        const file = files[fileIndex++];
        try {
          await httpRequest(
            `${apiUrl}/b2api/v2/b2_delete_file_version`,
            {
              method: "POST",
              headers: { Authorization: authorizationToken, "Content-Type": "application/json" },
            },
            JSON.stringify({ fileName: file.fileName, fileId: file.fileId })
          );
          totalDeleted++;
        } catch (err) {
          console.error(`❌ Failed to delete ${file.fileName}:`, err.message);
        }
      }
    }

    const workers = Array.from({ length: CONCURRENCY }, () => worker());
    await Promise.all(workers);

    console.log(`Total deleted so far: ${totalDeleted}`);
  }

  console.log(`\n🎉 Bucket completely cleared! Total files deleted: ${totalDeleted}`);
}

main().catch(console.error);
