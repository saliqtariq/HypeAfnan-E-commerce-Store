/**
 * Image proxy route — proxies Backblaze/CDN images through the Next.js server.
 * 
 * In local development, ISPs may block direct browser requests to
 * f005.backblazeb2.com. This proxy fetches images server-side (not blocked)
 * and streams them to the browser via localhost.
 * 
 * In production (Vercel), the browser uses direct URLs — no proxying needed.
 */
import { type NextRequest, NextResponse } from "next/server";

export async function GET(request: NextRequest) {
  const url = request.nextUrl.searchParams.get("url");

  if (!url) {
    return new NextResponse("Missing url parameter", { status: 400 });
  }

  // Only proxy trusted origins
  const allowed = [
    "backblazeb2.com",              // covers f005.backblazeb2.com AND s3.us-east-005.backblazeb2.com
    "hypeafnan-cdn.afnanimran61.workers.dev",
    "cdn.hypeafnan.com",
    "xcimg.szwego.com",
  ];
  try {
    const parsed = new URL(url);
    if (!allowed.some((h) => parsed.hostname.endsWith(h))) {
      return new NextResponse("Forbidden origin", { status: 403 });
    }
  } catch {
    return new NextResponse("Invalid url", { status: 400 });
  }

  try {
    const upstream = await fetch(url, {
      headers: { "User-Agent": "HypeAfnan-ImageProxy/1.0" },
      // Bypass Next.js fetch cache — we apply our own cache headers
      cache: "no-store",
    });

    if (!upstream.ok) {
      return new NextResponse(`Upstream error: ${upstream.status}`, {
        status: 502,
      });
    }

    const contentType =
      upstream.headers.get("content-type") || "image/webp";

    return new NextResponse(upstream.body, {
      status: 200,
      headers: {
        "Content-Type": contentType,
        "Cache-Control": "public, max-age=31536000, immutable",
        "Access-Control-Allow-Origin": "*",
      },
    });
  } catch (err) {
    console.error("[img proxy] fetch error:", err);
    return new NextResponse("Proxy fetch failed", { status: 502 });
  }
}
