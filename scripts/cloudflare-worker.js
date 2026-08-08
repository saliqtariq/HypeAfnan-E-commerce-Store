// ============================================================
// HypeAfnan Cloudflare CDN Worker
// ------------------------------------------------------------
// This Worker proxies image requests to Backblaze B2.
// 
// USAGE:
// 1. Deploy to Cloudflare Workers
// 2. Your Worker URL will be:
//    https://hypeafnan-cdn.<your-subdomain>.workers.dev
// 3. Images will be served at:
//    https://hypeafnan-cdn.<your-subdomain>.workers.dev/images/products/filename.webp
//    (instead of the long f005.backblazeb2.com/file/HypeAfnan-images/... URL)
//
// BENEFITS:
// - Cloudflare edge caches images globally (fastest delivery)
// - Backblaze <-> Cloudflare egress is FREE (no bandwidth cost)
// - When you buy your domain, just add a custom subdomain (cdn.hypeafnan.com)
// ============================================================

const B2_BUCKET_URL = "https://f005.backblazeb2.com/file/HypeAfnan-images";

export default {
  async fetch(request, env, ctx) {
    const url = new URL(request.url);

    // Strip the leading "/" and proxy to Backblaze
    const b2Path = url.pathname; // e.g. /images/products/topokay-product-front-xxxx.webp
    const b2Url = `${B2_BUCKET_URL}${b2Path}`;

    // Check Cloudflare's cache first
    const cacheKey = new Request(b2Url, request);
    const cache = caches.default;
    let response = await cache.match(cacheKey);

    if (response) {
      // Cache hit — return instantly from Cloudflare edge
      return response;
    }

    // Cache miss — fetch from Backblaze
    response = await fetch(b2Url, {
      headers: {
        // Forward accept-encoding so B2 can serve compressed responses
        "Accept-Encoding": request.headers.get("Accept-Encoding") || "identity",
      },
    });

    if (!response.ok) {
      return new Response(`Image not found: ${b2Path}`, { status: response.status });
    }

    // Clone the response and add strong caching headers
    const headers = new Headers(response.headers);
    headers.set("Cache-Control", "public, max-age=31536000, immutable"); // Cache 1 year
    headers.set("Access-Control-Allow-Origin", "*");
    headers.set("Vary", "Accept-Encoding");

    const cachedResponse = new Response(response.body, {
      status: response.status,
      headers,
    });

    // Store in Cloudflare cache for future requests
    ctx.waitUntil(cache.put(cacheKey, cachedResponse.clone()));

    return cachedResponse;
  },
};
