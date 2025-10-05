import { NextResponse } from "next/server";

export async function GET(req: Request) {
  const { searchParams } = new URL(req.url);
  const url = searchParams.get("url");
  if (!url) return new Response("Missing url", { status: 400 });

  try {
    const allowedHosts = ["storage.googleapis.com"];
    const parsed = new URL(url);
    if (!allowedHosts.includes(parsed.host)) {
      return new Response("URL not allowed", { status: 403 });
    }

    // Forward Range header if present to support seeking
    const range = req.headers.get("range");
    const fetchHeaders: Record<string, string> = {};
    if (range) fetchHeaders["range"] = range;

    const upstream = await fetch(url, { method: "GET", headers: fetchHeaders });

    // Copy essential headers
    const headers = new Headers();
    const contentType = upstream.headers.get("content-type");
    if (contentType) headers.set("Content-Type", contentType);
    const contentLength = upstream.headers.get("content-length");
    if (contentLength) headers.set("Content-Length", contentLength);
    const acceptRanges = upstream.headers.get("accept-ranges");
    if (acceptRanges) headers.set("Accept-Ranges", acceptRanges);
    const contentRange = upstream.headers.get("content-range");
    if (contentRange) headers.set("Content-Range", contentRange);

    // Allow CORS for the client
    headers.set("Access-Control-Allow-Origin", "*");
    headers.set("Access-Control-Allow-Methods", "GET,HEAD,OPTIONS");

    return new Response(upstream.body, { status: upstream.status, headers });
  } catch (err) {
    return new Response(String(err ?? "proxy error"), { status: 500 });
  }
}
